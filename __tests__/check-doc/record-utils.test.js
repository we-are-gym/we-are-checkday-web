// 파일 용도: record-utils 순수 함수 단위 테스트 — ID·회원별 조회, 건수 집계 검증
import { describe, expect, it } from "bun:test";
import { getRecordById, getRecordCountsByMember, getRecordsByMember } from "../../ESM/check-doc/record-utils.js";

const records = [
	{ id: 1, memberId: "m1", date: "2025-01-01", payload: { session: "1회차", scores: [3, 2, 1] } },
	{ id: 2, memberId: "m1", date: "2025-06-01", payload: { session: "2회차", scores: [3, 3, 2] } },
	{ id: 3, memberId: "m2", date: "2025-03-01", payload: { session: "1회차", scores: [1, 1, 1] } },
];

describe("getRecordById", () => {
	it("id에 해당하는 기록을 반환한다", () => {
		const result = getRecordById(records, 2);
		expect(result).toBeDefined();
		expect(result.id).toBe(2);
	});

	it("존재하지 않는 id는 undefined를 반환한다", () => {
		const result = getRecordById(records, 99);
		expect(result).toBeUndefined();
	});
});

describe("getRecordsByMember", () => {
	it("해당 회원의 기록 배열을 반환한다", () => {
		const result = getRecordsByMember(records, "m1");
		expect(result).toHaveLength(2);
	});

	it("날짜 오름차순으로 정렬된다", () => {
		const result = getRecordsByMember(records, "m1");
		expect(result[0].date).toBe("2025-01-01");
		expect(result[1].date).toBe("2025-06-01");
	});
});

describe("getRecordCountsByMember", () => {
	it("회원별 건수를 Map으로 반환한다", () => {
		const result = getRecordCountsByMember(records);
		expect(result.get("m1")).toBe(2);
		expect(result.get("m2")).toBe(1);
	});
});
