// 파일 용도: record-stats 단위 테스트 — 순수 함수 검증 (브라우저 없이)
import { getGradeMeta } from "@calc/grade.js";
import { deltaHTML, recordMax } from "@check-doc/record-stats.js";
import { describe, expect, test } from "bun:test";

describe("record-stats", () => {
	test("recordMax — 5항목 scores → 만점 15", () => {
		expect(recordMax({ scores: [2, 1, 1, 2, 1] })).toBe(15);
	});
	test("recordMax — 8항목 scores → 만점 24", () => {
		expect(recordMax({ scores: [2, 2, 2, 2, 2, 2, 2, 2] })).toBe(24);
	});
	test("recordMax — 빈 scores → 만점 0", () => {
		expect(recordMax({})).toBe(0);
		expect(recordMax({ scores: [] })).toBe(0);
	});
	test("5항목 등급은 15점 기준으로 산정된다", () => {
		const max = recordMax({ scores: [3, 3, 3, 3, 3] }); // 15
		expect(max).toBe(15);
		expect(getGradeMeta(15, max).label).toBe("우수");
		expect(getGradeMeta(10, max).label).toBe("양호"); // 66%
	});
	test("8항목 등급은 24점 기준으로 산정된다", () => {
		const max = recordMax({ scores: [3, 3, 3, 3, 3, 3, 3, 3] }); // 24
		expect(max).toBe(24);
		expect(getGradeMeta(24, max).label).toBe("우수");
		expect(getGradeMeta(14, max).label).toBe("양호"); // 58%
	});
	test("deltaHTML — 상승/하강/유지", () => {
		expect(deltaHTML(1.5)).toContain("▲");
		expect(deltaHTML(-0.5)).toContain("▼");
		expect(deltaHTML(0)).toContain("―");
	});
});
