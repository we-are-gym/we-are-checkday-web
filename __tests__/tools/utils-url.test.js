// 파일 용도: URL 유틸리티 단위 테스트
import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { getNumberParam, getUrlParam } from "../../ESM/tools/utils-url.js";

// bun:test에는 window가 없으므로 globalThis에 정의
if (typeof globalThis.window === "undefined") {
	globalThis.window = globalThis;
}

let _origSearch;

beforeEach(() => {
	_origSearch = globalThis.location?.search ?? "";
	globalThis.location = { search: "?id=42&name=test" };
});

afterEach(() => {
	globalThis.location = { search: _origSearch };
});

describe("getUrlParam", () => {
	it("존재하는 파라미터 값을 반환", () => {
		expect(getUrlParam("id")).toBe("42");
	});

	it("존재하는 문자열 파라미터 반환", () => {
		expect(getUrlParam("name")).toBe("test");
	});

	it("없는 파라미터는 빈 문자열 반환", () => {
		expect(getUrlParam("missing")).toBe("");
	});

	it("없는 파라미터에 fallback 지정", () => {
		expect(getUrlParam("missing", "default")).toBe("default");
	});
});

describe("getNumberParam", () => {
	it("숫자 문자열을 숫자로 반환", () => {
		expect(getNumberParam("id")).toBe(42);
	});

	it("없는 파라미터는 기본값 0 반환", () => {
		expect(getNumberParam("missing")).toBe(0);
	});

	it("숫자가 아닌 파라미터는 fallback 반환 (name=test → Number('test')=NaN)", () => {
		expect(getNumberParam("name", 99)).toBe(99);
	});
});
