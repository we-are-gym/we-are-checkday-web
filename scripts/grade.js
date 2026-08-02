// 파일 용도: 총점 → 등급 라벨 산정 — basic_function_assessment_2.html·checkday 공용
function getGradeMeta(total, max) {
	const pct = Math.round((total / max) * 100);
	if (total === 0) return { label: "평가 전" };
	if (pct >= 83) return { label: "우수" };
	if (pct >= 58) return { label: "양호" };
	if (pct >= 33) return { label: "보통" };
	return { label: "개선 필요" };
}
