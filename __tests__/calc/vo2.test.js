// 파일 용도: VO₂ Max 계산·등급 판정 단위 테스트
import { describe, expect, it } from "bun:test";
import { calcVo2Assessment, calcVo2Value, determineVO2Grade } from "../../ESM/calc/vo2.js";

describe("calcVo2Value", () => {
	it("calcVo2Value(30, 165, 60, 100) → ACSM 공식 근사값", () => {
		// ACSM 스텝 테스트 공식: Math.round((54.337 - 0.185*age + 0.097*height - 0.246*weight - 0.112*hr)*10)/10
		const expected = Math.round((54.337 - 0.185 * 30 + 0.097 * 165 - 0.246 * 60 - 0.112 * 100) * 10) / 10;
		expect(calcVo2Value(30, 165, 60, 100)).toBe(expected);
	});
});

describe("determineVO2Grade", () => {
	it("determineVO2Grade(40, 30) → grade 속성 존재", () => {
		const result = determineVO2Grade(40, 30);
		expect(result).toHaveProperty("grade");
		expect(result).toHaveProperty("label");
		expect(result).toHaveProperty("score");
		expect(result).toHaveProperty("col");
	});
});

describe("calcVo2Assessment", () => {
	it("정상 입력 → { vr, gradeInfo } 반환", () => {
		const result = calcVo2Assessment({ age: 30, height: 165, weight: 60, hr: 100 });
		expect(result).not.toBeNull();
		expect(result).toHaveProperty("vr");
		expect(result).toHaveProperty("gradeInfo");
		expect(typeof result.vr).toBe("number");
		expect(result.gradeInfo).toHaveProperty("grade");
	});

	it("NaN 포함 입력 → null 반환", () => {
		const result = calcVo2Assessment({ age: NaN, height: 0, weight: 0, hr: 0 });
		expect(result).toBeNull();
	});
});
