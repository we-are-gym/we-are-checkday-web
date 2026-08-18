// 파일 용도: 문자열 유틸리티 단위 테스트
import { describe, expect, it } from "bun:test";
import { pad2, today } from "../../ESM/tools/utils-string.js";

describe("pad2", () => {
	it("한 자리 숫자를 두 자릿수로 패딩", () => {
		expect(pad2(5)).toBe("05");
	});

	it("이미 두 자리 이상인 숫자는 그대로 반환", () => {
		expect(pad2(12)).toBe("12");
	});

	it("0은 '00' 반환", () => {
		expect(pad2(0)).toBe("00");
	});
});

describe("today", () => {
	it("YYYY.MM.DD 형식 반환", () => {
		const result = today();
		// 실제 구분자는 점(.) — YYYY.MM.DD
		expect(result).toMatch(/^\d{4}\.\d{2}\.\d{2}$/);
	});

	it("지정한 Date 객체 기준으로 날짜 반환", () => {
		const d = new Date(2025, 0, 5); // 2025-01-05
		expect(today(d)).toBe("2025.01.05");
	});
});
