// 파일 용도: 기록 모형 ↔ REST DTO 직렬화 계약 검증 (Node 런타임 직접 실행)
// 실행: node tools/verify-record-rest.mjs
import assert from "node:assert/strict";
import { InbodyData } from "../ESM/base/inbody-data.js";
import {
	ibToRest,
	restToIb,
	payloadToRest,
	restToPayload,
} from "../ESM/check-doc/record-rest.js";

// ── ibToRest / restToIb ─────────────────────────────────────────────
const ib = new InbodyData({
	w: "70.5",
	m: "32.1",
	fat: "18.4",
	bmi: "23",
	bfp: "26",
	bmr: "1600",
	vis: "9",
});
assert.deepEqual(ibToRest(ib, "균형 양호"), {
	weight: 70.5,
	muscle: 32.1,
	fat: 18.4,
	BMI: 23,
	BFP: 26,
	BMR: 1600,
	visceral: 9,
	comment: "균형 양호",
});

// 빈 인바디 → null (REST 계약: 생략)
assert.equal(ibToRest(new InbodyData(), ""), null);

// REST → 웹 문자열 표기 (숫자·null 구분)
assert.deepEqual(restToIb({ weight: 70.5, muscle: null }), {
	w: "70.5",
	m: "",
	fat: "",
	bmi: "",
	bfp: "",
	bmr: "",
	vis: "",
});

// ── payloadToRest ───────────────────────────────────────────────────
const payload = {
	session: "2025-06 (2회차)",
	trainer: "이코치",
	ib: new InbodyData({ w: "70.5", fat: "18.4" }),
	ibComment: "변화 관찰 중",
	scores: [3, 2],
	items: ["호흡", "스쿼트"],
	evalData: [
		{ checked: ["턱이 들림"], memo: "흐름 양호" },
		{ checked: [], memo: "" },
	],
	goals: ["근력 향상"],
	goalMemo: "8주 프로그램",
	feedbacks: [
		{
			name: "스쿼트 피드백",
			checkItems: [{ text: "무릎 안쪽 무너짐", checked: true }],
			memo: "자세 확인",
		},
	],
	consultMemo: "전반적으로 양호",
};
const body = payloadToRest(payload, { memberId: 42, date: "2025-06-15" });
assert.equal(body.member_ID, 42);
assert.equal(body.session_label, "2025-06 (2회차)");
assert.equal(body.session_date, "2025-06-15");
assert.equal(body.trainer, "이코치");
assert.equal(body.consult_memo, "전반적으로 양호");
assert.equal(body.inbody.weight, 70.5);
assert.equal(body.inbody.comment, "변화 관찰 중");
assert.deepEqual(body.evaluations, [
	{ name: "호흡", score: 3, evaluation_items: ["턱이 들림"], memo: "흐름 양호" },
	{ name: "스쿼트", score: 2, evaluation_items: [], memo: "" },
]);
assert.deepEqual(body.goals, { tags: ["근력 향상"], memo: "8주 프로그램" });
assert.deepEqual(body.feedbacks, [
	{
		name: "스쿼트 피드백",
		evaluation_items: ["무릎 안쪽 무너짐"],
		memo: "자세 확인",
	},
]);

// 목표 없음 → null
const noGoal = payloadToRest(
	{ ...payload, goals: [], goalMemo: "" },
	{ memberId: 1, date: "2025-06-15" },
);
assert.equal(noGoal.goals, null);

// ── restToPayload (조회 응답 프리필) ────────────────────────────────
const poll = restToPayload({
	session_label: "1회차",
	trainer: "김코치",
	inbody: { weight: 68.2, comment: "좋음" },
	evaluations: [
		{ name: "균형", score: 3, evaluation_items: ["다리 반듯"], memo: "양호" },
	],
	goals: { tags: ["유연성"], memo: "6주" },
	feedbacks: [
		{
			name: "상체",
			evaluation_items: ["어깨 확인"],
			memo: "점검",
		},
	],
	consult_memo: "계속 유지",
});
assert.equal(poll.session, "1회차");
assert.equal(poll.trainer, "김코치");
assert.equal(poll.ib.w, "68.2");
assert.equal(poll.ibComment, "좋음");
assert.deepEqual(poll.scores, [3]);
assert.deepEqual(poll.items, ["균형"]);
assert.equal(poll.evalData[0].checked[0], "다리 반듯");
assert.deepEqual(poll.goals, ["유연성"]);
assert.equal(poll.goalMemo, "6주");
assert.equal(poll.consultMemo, "계속 유지");
assert.equal(poll.feedbacks[0].name, "상체");
assert.equal(poll.feedbacks[0].checkItems[0].text, "어깨 확인");

console.log("record-rest contract OK — all assertions passed");