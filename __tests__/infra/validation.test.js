// 파일 용도: 입력 검증 단위 테스트
import { describe, expect, it } from "bun:test";
import { anyNaN, clamp, parseToNum } from "../../ESM/infra/validation.js";

describe("parseToNum", () => {
	it('parseToNum("3.14") === 3.14', () => {
		expect(parseToNum("3.14")).toBe(3.14);
	});
	it('parseToNum("abc") → NaN', () => {
		expect(parseToNum("abc")).toBeNaN();
	});
});

describe("anyNaN", () => {
	it("anyNaN(1,2,3) === false", () => {
		expect(anyNaN(1, 2, 3)).toBe(false);
	});
	it("anyNaN(1,NaN) === true", () => {
		expect(anyNaN(1, NaN)).toBe(true);
	});
});

describe("clamp", () => {
	it("clamp(5,0,3) === 3", () => {
		expect(clamp(5, 0, 3)).toBe(3);
	});
	it("clamp(-1,0,3) === 0", () => {
		expect(clamp(-1, 0, 3)).toBe(0);
	});
});
