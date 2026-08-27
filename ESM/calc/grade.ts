// 파일 용도: 총점 → 등급 라벨 산정 — TS 마이그레이션
import { GRADE_AVERAGE_PCT, GRADE_EXCELLENT_PCT, GRADE_GOOD_PCT } from "@infra/constants.js";

export type GradeLabel = "평가 전" | "우수" | "양호" | "보통" | "개선 필요";

export function getGradeMeta(total: number, max: number): { label: GradeLabel } {
	const pct = Math.round((total / max) * 100);
	if (total === 0) return { label: "평가 전" };
	if (pct >= GRADE_EXCELLENT_PCT) return { label: "우수" };
	if (pct >= GRADE_GOOD_PCT) return { label: "양호" };
	if (pct >= GRADE_AVERAGE_PCT) return { label: "보통" };
	return { label: "개선 필요" };
}
