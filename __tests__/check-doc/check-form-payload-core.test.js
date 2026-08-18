// 파일 용도: check-form-payload-core 순수 함수 단위 테스트 — buildPayload·resolvePrefillValues 검증
import { describe, expect, it } from "bun:test";
import { buildPayload, resolvePrefillValues } from "../../ESM/check-doc/check-form-payload-core.js";

describe("buildPayload", () => {
	it("모든 필드를 전달하면 정확히 같은 필드를 반환한다", () => {
		const fields = {
			session: "1회차",
			trainer: "홍길동",
			ib: { weight: 70 },
			ibComment: "좋음",
			scores: [3, 2, 1],
			items: ["항목1"],
			evalData: [{ checked: ["a"], memo: "메모" }],
			goals: ["목표1"],
			goalMemo: "목표 메모",
			feedbacks: [{ name: "피드백1", checkItems: [{ text: "항목", checked: true }], memo: "" }],
			consultMemo: "상담 메모",
		};

		const result = buildPayload(fields);
		expect(result.session).toBe("1회차");
		expect(result.trainer).toBe("홍길동");
		expect(result.ib).toEqual({ weight: 70 });
		expect(result.ibComment).toBe("좋음");
		expect(result.scores).toEqual([3, 2, 1]);
		expect(result.items).toEqual(["항목1"]);
		expect(result.evalData).toEqual([{ checked: ["a"], memo: "메모" }]);
		expect(result.goals).toEqual(["목표1"]);
		expect(result.goalMemo).toBe("목표 메모");
		expect(result.feedbacks).toEqual(fields.feedbacks);
		expect(result.consultMemo).toBe("상담 메모");
	});
});

describe("resolvePrefillValues", () => {
	it("member가 있으면 name에 member.name을 반환한다", () => {
		const rec = { date: "2025-01-01", payload: { session: "1회차", scores: [3, 2, 1] } };
		const member = { name: "홍길동" };

		const result = resolvePrefillValues(rec, member);
		expect(result.name).toBe("홍길동");
		expect(result.session).toBe("1회차");
		expect(result.date).toBe("2025-01-01");
	});

	it("member가 undefined이면 name은 빈 문자열이다", () => {
		const rec = { date: "2025-01-01", payload: { session: "1회차" } };

		const result = resolvePrefillValues(rec, undefined);
		expect(result.name).toBe("");
	});

	it("payload에 없는 필드는 기본값으로 채워진다", () => {
		const rec = { date: "", payload: {} };

		const result = resolvePrefillValues(rec, undefined);
		expect(result.session).toBe("");
		expect(result.scores).toEqual([]);
		expect(result.evalData).toEqual([]);
		expect(result.goals).toEqual([]);
		expect(result.feedbacks).toEqual([]);
	});
});
