// 파일 용도: VO₂ Max 계산 공식·정상치·등급 산정 — basic_function_assessment_2.html·checkday 공용
// to-be: 도메인 설정 VO₂ 정상치는 conf/rules.json이 단일 소스
import rules from "../../conf/rules.json" with { type: "json" };

/**
 * 여성 VO₂ 맥스 정상치 표 (Topendsports) — 연령 구간별 나쁨~우수 임계값
 * @type {Array<{ ageMin: number, ageMax: number, col: number, excellent: number, good: [number, number], above_avg: [number, number], average: [number, number], below_avg: [number, number], poor: [number, number], very_poor: number }>}
 */
export const VO2_NORMS = rules.vo2Norms;
/**
 * VO₂ Max 계산 → 숫자 반환
 *
 * @param {number} age
 * @param {number} height 키[단위: …]
 * @param {number} weight 몸무게[단위: …]
 * @param {number} hr …
 * @returns {number} VO₂ 맥스
 */
export function calcVo2Value(age, height, weight, hr) {
	return (
		// ACSM 스텝 테스트 공식
		Math.round((54.337 - 0.185 * age + 0.097 * height - 0.246 * weight - 0.112 * hr) * 10) / 10
	);
}

/**
 * 연령대별 정상치(`VO2_NORMS`) 대비 등급 판정
 *
 * @param {number} VO2_val
 * @param {number} age
 *
 * @returns {{
 * 		grade: "excellent" | "above_avg" | "below_avg" | "poor";
 * 		label: string;
 * 		score: number;
 * 		col: any;
 * }}
 */
export function determineVO2Grade(VO2_val, age) {
	const norm = VO2_NORMS.find(n => age >= n.ageMin && age <= n.ageMax) || VO2_NORMS[VO2_NORMS.length - 1];
	if (VO2_val > norm.excellent)
		return {
			grade: "excellent",
			label: "Excellent",
			score: 3,
			col: norm.col,
		};
	if (VO2_val >= norm.good[0]) return { grade: "good", label: "Good", score: 3, col: norm.col };
	if (VO2_val >= norm.above_avg[0])
		return {
			grade: "above_avg",
			label: "Above average",
			score: 2,
			col: norm.col,
		};
	if (VO2_val >= norm.average[0]) return { grade: "average", label: "Average", score: 2, col: norm.col };
	if (VO2_val >= norm.below_avg[0])
		return {
			grade: "below_avg",
			label: "Below average",
			score: 1,
			col: norm.col,
		};
	if (VO2_val >= norm.poor[0]) return { grade: "poor", label: "Poor", score: 1, col: norm.col };
	return { grade: "very_poor", label: "Very poor", score: 0, col: norm.col };
}

/**
 * VO₂ 계산 조합 헬퍼 — 입력 4종 검증(NaN) 후 VO₂ 값·등급을 한 번에 산정 (basic·checkday 화면 공용)
 * @param {{ age: number, height: number, weight: number, hr: number }} input 입력 4종 (parseToNum 결과)
 * @returns {{ vr: number, gradeInfo: import("./vo2.js").determineVO2Grade extends never ? never : ReturnType<typeof determineVO2Grade> } | null}
 *           입력 중 NaN이 있으면 null (화면별로 입력 미완성 처리)
 */
export function calcVo2Assessment({ age, height, weight, hr }) {
	if ([age, height, weight, hr].some(Number.isNaN)) return null;
	const vr = calcVo2Value(age, height, weight, hr);
	return { vr, gradeInfo: determineVO2Grade(vr, age) };
}
