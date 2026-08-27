// 파일 용도: record-stats 단위 테스트 — 순수 함수 검증 (브라우저 없이)
import { deltaHTML, recordMax } from "@check-doc/record-stats.js";
import { describe, expect, test } from "bun:test";

describe("record-stats", () => {
	test("recordMax — scores 길이에 따라 15/24", () => {
		expect(recordMax({ scores: [1, 2, 3, 2, 1] })).toBe(15);
		expect(recordMax({ scores: [1, 2, 3, 2, 1, 0, 1, 2] })).toBe(24);
		expect(recordMax({})).toBe(0);
	});
	test("deltaHTML — 상승/하강/유지", () => {
		expect(deltaHTML(1.5)).toContain("▲");
		expect(deltaHTML(-0.5)).toContain("▼");
		expect(deltaHTML(0)).toContain("―");
	});
});
