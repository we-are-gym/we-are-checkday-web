// 파일 용도: 총점→등급 라벨 산정 단위 테스트
import { describe, expect, it } from "bun:test";
import { getGradeMeta } from "../../ESM/calc/grade.js";

describe("getGradeMeta", () => {
	it("getGradeMeta(0, 24) → '평가 전'", () => {
		expect(getGradeMeta(0, 24).label).toBe("평가 전");
	});

	it("getGradeMeta(20, 24) → '우수' (83%)", () => {
		// 20/24 ≈ 83% → GRADE_EXCELLENT_PCT(83) 이상
		expect(getGradeMeta(20, 24).label).toBe("우수");
	});

	it("getGradeMeta(14, 24) → '양호' (58%)", () => {
		// 14/24 ≈ 58% → GRADE_GOOD_PCT(58) 이상
		expect(getGradeMeta(14, 24).label).toBe("양호");
	});

	it("getGradeMeta(8, 24) → '보통' (33%)", () => {
		// 8/24 ≈ 33% → GRADE_AVERAGE_PCT(33) 이상
		expect(getGradeMeta(8, 24).label).toBe("보통");
	});

	it("getGradeMeta(3, 24) → '개선 필요'", () => {
		// 3/24 ≈ 12% → 33% 미만
		expect(getGradeMeta(3, 24).label).toBe("개선 필요");
	});
});
