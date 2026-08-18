// 파일 용도: 템플릿 유틸리티 단위 테스트
import { describe, expect, it } from "bun:test";
import { escapeHtml } from "../../ESM/infra/templates.js";

describe("escapeHtml", () => {
	it('escapeHtml("<script>") → "&lt;script&gt;"', () => {
		expect(escapeHtml("<script>")).toBe("&lt;script&gt;");
	});
	it("escapeHtml('a \"b\"') → 'a &quot;b&quot;'", () => {
		expect(escapeHtml('a "b"')).toBe("a &quot;b&quot;");
	});
	it('escapeHtml("a & b") → "a &amp; b"', () => {
		expect(escapeHtml("a & b")).toBe("a &amp; b");
	});
});
