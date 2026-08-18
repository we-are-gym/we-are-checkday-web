// 파일 용도: 등급 스타일 단위 테스트
import { describe, expect, it } from "bun:test";
import { GRADE_STYLES } from "../../ESM/calc/grade-styles.js";

describe("GRADE_STYLES", () => {
	it("필수 등급 키를 포함", () => {
		const requiredKeys = ["우수", "양호", "보통", "개선 필요"];
		for (const key of requiredKeys) {
			expect(GRADE_STYLES).toHaveProperty(key);
		}
	});
});
