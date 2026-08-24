// 파일 용도: record-rest 변환 계약 테스트 — 미포함 평가 항목은 null로 저장하고 0점 평가는 오브젝트로 보존
// 기법: 순수 함수(payloadToRest·restToPayload)만 검증 — fetch 계층은 대상 아님
import { describe, expect, test } from "bun:test";

import { payloadToRest, restToPayload } from "@check-doc/record-rest.js";

/** 테스트용 최소 payload 조립 헬퍼 */
function makePayload({ items, scores, evalData }) {
	return {
		session: "1회차",
		trainer: "김트레이너",
		ib: {},
		ibComment: "",
		scores,
		items,
		evalData,
		goals: [],
		goalMemo: "",
		feedbacks: [],
		consultMemo: "",
	};
}

describe("payloadToRest 평가 항목 변환", () => {
	test("움직임 평가 목록에 없던 항목은 null로 저장된다", () => {
		const p = makePayload({
			items: ["Lumbar ROM (바닥짚기)", "Wall Angel Test"],
			scores: [0, 3],
			evalData: [
				{ checked: [], memo: "" },
				{ checked: [], memo: "" },
			],
		});
		const rest = payloadToRest(p, { memberId: "m-1", date: "2026-08-25" });
		const evaluation = rest.evaluations[0];

		expect(evaluation.floor_touch).toEqual({ score: 0, evaluation_items: [], memo: null });
		expect(evaluation.wall_angel.score).toBe(3);
		// BASIC5에 없던 3항목 + 레거시 전용 항목은 전부 null이다
		expect(evaluation.overhead_squat).toBeNull();
		expect(evaluation.single_balance).toBeNull();
		expect(evaluation.vo2_max).toBeNull();
		expect(evaluation.breathing).toBeNull();
		expect(evaluation.one_leg_squat).toBeNull();
		expect(evaluation.one_leg_bridge).toBeNull();
	});

	test("0점으로 실제 평가한 항목은 score 0 오브젝트로 저장된다", () => {
		const p = makePayload({
			items: ["Over Head Squat"],
			scores: [0],
			evalData: [{ checked: ["무릎 안쪽 무너짐"], memo: "교정 필요" }],
		});
		const evaluation = payloadToRest(p, { memberId: "m-1", date: null }).evaluations[0];

		expect(evaluation.overhead_squat).toEqual({
			score: 0,
			evaluation_items: ["무릎 안쪽 무너짐"],
			memo: "교정 필요",
		});
	});
});

describe("restToPayload 평가 항목 역변환", () => {
	test("null 필드는 목록에서 탈락하고 0점 오브젝트는 살아남는다", () => {
		const body = {
			session_label: "1회차",
			evaluations: [
				{
					floor_touch: { score: 0, evaluation_items: [], memo: null },
					wall_angel: null,
					overhead_squat: { score: 2, evaluation_items: ["무릎 안쪽 무너짐"], memo: null },
					single_balance: null,
					vo2_max: null,
					breathing: null,
					one_leg_squat: null,
					one_leg_bridge: null,
				},
			],
		};
		const payload = restToPayload(body);

		expect(payload.items).toEqual(["Lumbar ROM (바닥짚기)", "Over Head Squat"]);
		expect(payload.scores).toEqual([0, 2]);
	});

	test("평가가 아예 없으면 빈 목록이 된다", () => {
		const payload = restToPayload({ session_label: "", evaluations: [] });
		expect(payload.items).toEqual([]);
		expect(payload.scores).toEqual([]);
	});
});

describe("왕복 변환 일관성", () => {
	test("payload → REST → payload 왕복 시 0점 항목과 미포함 구별이 유지된다", () => {
		const original = makePayload({
			items: ["Lumbar ROM (바닥짚기)", "VO₂ Max (스텝 테스트)"],
			scores: [0, 1],
			evalData: [
				{ checked: [], memo: "관찰만 함" },
				{ checked: [], memo: "" },
			],
		});
		const rest = payloadToRest(original, { memberId: "m-1", date: "2026-08-25" });
		const roundTripped = restToPayload({ session_label: rest.session_label, evaluations: rest.evaluations });

		expect(roundTripped.items).toEqual(original.items);
		expect(roundTripped.scores).toEqual(original.scores);
	});
});
