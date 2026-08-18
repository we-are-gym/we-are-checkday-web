// 파일 용도: 배열 유틸리티 단위 테스트
import { describe, expect, it } from "bun:test";
import { createZeroArray, sum } from "../../ESM/tools/utils-array.js";

describe("sum", () => {
	it("숫자 배열 합계 계산", () => {
		expect(sum([1, 2, 3])).toBe(6);
	});

	it("빈 배열은 0 반환", () => {
		expect(sum([])).toBe(0);
	});

	it("단일 요소 배열", () => {
		expect(sum([42])).toBe(42);
	});

	it("음수 포함 합계", () => {
		expect(sum([1, -2, 3])).toBe(2);
	});
});

describe("createZeroArray", () => {
	it("지정 크기만큼 0 배열 생성", () => {
		expect(createZeroArray(3)).toEqual([0, 0, 0]);
	});

	it("크기 0은 빈 배열 반환", () => {
		expect(createZeroArray(0)).toEqual([]);
	});

	it("크기 5 배열", () => {
		expect(createZeroArray(5)).toEqual([0, 0, 0, 0, 0]);
	});
});
