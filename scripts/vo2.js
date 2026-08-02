// 파일 용도: VO₂ Max 계산 공식·정상치·등급 산정 — basic_function_assessment_2.html·checkday 공용
// VO2 Max norms for women (Topendsports)
export const VO2_NORMS = [
	{
		ageMin: 18,
		ageMax: 25,
		col: 1,
		excellent: 56,
		good: [47, 56],
		above_avg: [42, 46],
		average: [38, 41],
		below_avg: [33, 37],
		poor: [28, 32],
		very_poor: 28,
	},
	{
		ageMin: 26,
		ageMax: 35,
		col: 2,
		excellent: 52,
		good: [45, 52],
		above_avg: [39, 44],
		average: [35, 38],
		below_avg: [31, 34],
		poor: [26, 30],
		very_poor: 26,
	},
	{
		ageMin: 36,
		ageMax: 45,
		col: 3,
		excellent: 45,
		good: [38, 45],
		above_avg: [34, 37],
		average: [31, 33],
		below_avg: [27, 30],
		poor: [22, 26],
		very_poor: 22,
	},
	{
		ageMin: 46,
		ageMax: 55,
		col: 4,
		excellent: 40,
		good: [34, 40],
		above_avg: [31, 33],
		average: [28, 30],
		below_avg: [25, 27],
		poor: [20, 24],
		very_poor: 20,
	},
	{
		ageMin: 56,
		ageMax: 65,
		col: 5,
		excellent: 37,
		good: [32, 37],
		above_avg: [28, 31],
		average: [25, 27],
		below_avg: [22, 24],
		poor: [18, 21],
		very_poor: 18,
	},
	{
		ageMin: 66,
		ageMax: 120,
		col: 6,
		excellent: 32,
		good: [28, 32],
		above_avg: [25, 27],
		average: [22, 24],
		below_avg: [19, 21],
		poor: [17, 18],
		very_poor: 17,
	},
];

/**
 * VO₂ Max 계산 → 숫자 반환
 *
 * @param {number} age
 * @param {number} height 키[단위: …]
 * @param {number} weight 몸무게[단위: …]
 * @param {number} hr …
 *
 * @returns {number} VO₂ 맥스
 */
export function calcVo2Value(age, height, weight, hr) {
	return (
		// ACSM 스텝 테스트 공식
		Math.round(
			(54.337 -
				0.185 * age +
				0.097 * height -
				0.246 * weight -
				0.112 * hr) *
				10,
		) / 10
	);
}

/**
 * 연령대별 정상치(`VO2_NORMS`) 대비 등급 판정
 *
 * @param {number} vo2
 * @param {number} age
 *
 * @returns {{
 * 		grade: "excellent" | "above_avg" | "below_avg" | "poor";
 * 		label: string;
 * 		score: number;
 * 		col: any;
 * }}
 */
export function getVo2Grade(vo2, age) {
	const norm =
		VO2_NORMS.find((n) => age >= n.ageMin && age <= n.ageMax) ||
		VO2_NORMS[VO2_NORMS.length - 1];
	if (vo2 > norm.excellent)
		return {
			grade: "excellent",
			label: "Excellent",
			score: 3,
			col: norm.col,
		};
	if (vo2 >= norm.good[0])
		return { grade: "good", label: "Good", score: 3, col: norm.col };
	if (vo2 >= norm.above_avg[0])
		return {
			grade: "above_avg",
			label: "Above average",
			score: 2,
			col: norm.col,
		};
	if (vo2 >= norm.average[0])
		return { grade: "average", label: "Average", score: 2, col: norm.col };
	if (vo2 >= norm.below_avg[0])
		return {
			grade: "below_avg",
			label: "Below average",
			score: 1,
			col: norm.col,
		};
	if (vo2 >= norm.poor[0])
		return { grade: "poor", label: "Poor", score: 1, col: norm.col };
	return { grade: "very_poor", label: "Very poor", score: 0, col: norm.col };
}
