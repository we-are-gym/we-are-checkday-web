// 파일 용도: 총점 → 등급 라벨 산정 — basic_function_assessment_2.html·checkday 공용

/**
 * 퍼센트 기반 등급 라벨 반환
 *
 * @param {number} total
 * @param {number} max
 *
 * @returns {{ label: "평가 전" | "우수" | "양호" | "보통" | "개선 필요" }} 등급
 */
function getGradeMeta(total, max) {
	const pct = Math.round((total / max) * 100);
	if (total === 0) return { label: "평가 전" };
	if (pct >= GRADE_EXCELLENT_PCT) return { label: "우수" };
	if (pct >= GRADE_GOOD_PCT) return { label: "양호" };
	if (pct >= GRADE_AVERAGE_PCT) return { label: "보통" };
	return { label: "개선 필요" };
}
