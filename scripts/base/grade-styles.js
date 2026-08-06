// 파일 용도: 등급·VO₂ 결과 라벨 스타일 맵 — 화면 공용 (checkday·basic_function 공용)
// 색상은 styles/colors.css의 CSS 변수를 참조해 라이트/다크 테마가 자동 반영된다

/** 총점 → 등급 라벨별 배경/글자색/힌트 */
export const GRADE_STYLES = {
	"평가 전": { bg: "var(--surface2)", fg: "var(--text3)", hint: "" },
	우수: {
		bg: "var(--success-bg)",
		fg: "var(--success-fg)",
		hint: "전반적으로 안정적인 패턴",
	},
	양호: {
		bg: "var(--blue-bg)",
		fg: "var(--blue-fg)",
		hint: "일부 패턴 보완 필요",
	},
	보통: {
		bg: "var(--orange-bg)",
		fg: "var(--orange-fg)",
		hint: "주요 패턴 집중 개선 권장",
	},
	"개선 필요": {
		bg: "var(--red-bg)",
		fg: "var(--red-fg)",
		hint: "기초 움직임 패턴 재교육 필요",
	},
};

/** VO₂ 등급 → 배경/글자색 */
export const VO2_GRADE_STYLES = {
	excellent: { bg: "var(--success-bg)", fg: "var(--success-fg)" },
	good: { bg: "var(--blue-bg)", fg: "var(--blue-fg)" },
	above_avg: { bg: "var(--blue-bg)", fg: "var(--blue-fg)" },
	average: { bg: "var(--orange-bg)", fg: "var(--orange-fg)" },
	below_avg: { bg: "var(--orange-bg)", fg: "var(--orange-fg)" },
	poor: { bg: "var(--red-bg)", fg: "var(--red-fg)" },
	very_poor: { bg: "var(--red-bg)", fg: "var(--red-fg)" },
};

/** 점수(0~SCORE_MAX) → 배경/글자색 (개별 항목 배지) */
export function getScoreColor(score) {
	const map = [
		{ bg: "var(--surface2)", fg: "var(--text3)" },
		{ bg: "var(--orange-bg)", fg: "var(--orange-fg)" },
		{ bg: "var(--blue-bg)", fg: "var(--blue-fg)" },
		{ bg: "var(--success-bg)", fg: "var(--success-fg)" },
	];
	return map[score] || map[0];
}