// 파일 용도: 통합 테스트 — member/record 스토어·유틸·통계 연동 (bun test, 브라우저 없이)
import { recordMax } from "@check-doc/record-stats.js";
import { getRecordsByMember } from "@check-doc/record-utils.js";
import { getMemberById } from "@member/member-utils.js";
import { describe, expect, test } from "bun:test";

describe("record-flow integration", () => {
	test("회원 조회 + 기록 필터 + 총점", () => {
		const members = [
			{ id: "M-1", name: "김민준", gender: "남", goal: "", trainer: "정지훈" },
			{ id: "M-2", name: "이서연", gender: "녀", goal: "", trainer: "박소연" },
		];
		const records = [
			{ id: 1, memberId: "M-1", date: "2026-01-10", payload: { scores: [1, 2, 3, 2, 1], items: ["a", "b", "c", "d", "e"] } },
			{ id: 2, memberId: "M-1", date: "2026-02-10", payload: { scores: [2, 2, 2, 2, 2], items: ["a", "b", "c", "d", "e"] } },
			{ id: 3, memberId: "M-2", date: "2026-01-10", payload: { scores: [3, 3, 3], items: ["a", "b", "c"] } },
		];
		const m = getMemberById(members, "M-1");
		expect(m.name).toBe("김민준");
		const recs = getRecordsByMember(records, "M-1");
		expect(recs.length).toBe(2);
		expect(recordMax(recs[0].payload)).toBe(15);
		expect(recordMax(recs[1].payload)).toBe(15);
	});
});
