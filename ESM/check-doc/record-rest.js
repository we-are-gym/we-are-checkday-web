// 파일 용도: 웹 기록 모형 ↔ REST DTO 변환 및 API 호출 (계약 정합 계층)
// 기법: 순수 함수 + fetch 래퍼. 웹 payload와 REST DTO 간 필드명·구조를 정규화한다.
// 주의: API 연동을 위해 fetch 호출 함수도 함께 제공합니다.
// to-be: 도메인 설정(허용 목표 태그)은 conf/rules.json이 단일 소스
import { request } from "@infra/api-client.js";
import rules from "../../conf/rules.json" with { type: "json" };

/** 웹 평가 항목 이름 → API BasicFunctionEvaluation 필드명 */
const ITEM_NAME_TO_API_FIELD = {
	"호흡 테스트": "breathing",
	"Lumbar ROM (바닥짚기)": "floor_touch",
	"Wall Angel Test": "wall_angel",
	"Over Head Squat": "overhead_squat",
	"Single Balance Test": "single_balance",
	"One Leg Squat": "one_leg_squat",
	"원레그 브릿지": "one_leg_bridge",
	"VO₂ Max (스텝 테스트)": "vo2_max",
};

/** API 필드명 → 웹 평가 항목 이름 */
const API_FIELD_TO_ITEM_NAME = Object.fromEntries(Object.entries(ITEM_NAME_TO_API_FIELD).map(([name, field]) => [field, name]));

/** API BasicFunctionEvaluation 필드 순서 */
const API_EVALUATION_FIELDS = Object.keys(API_FIELD_TO_ITEM_NAME);

/** API가 허용하는 운동 목표 태그 집합 */
const ALLOWED_GOAL_TAGS = rules.allowedGoalTags;

/** 웹 목표 텍스트 → API 태그 매핑(불완전 매칭 fallback 포함) */
const GOAL_TEXT_TO_TAG = {
	"근력 향상": "💪 근력 향상",
	"체지방 감소": "🔥 체지방 감소",
	"자세 교정": "🧘 자세 교정",
	"체력 향상": "🏃 체력 향상",
	"체중 유지": "⚖️ 체중 유지",
	"하체 강화": "🦵 하체 강화",
	"유연성 개선": "🤸 유연성 개선",
	"통증 개선": "🩺 통증 개선",
	"근육량 증가": "📈 근육량 증가",
	"체중 감량": "🔥 체지방 감소",
	"체형 교정": "🧘 자세 교정",
};

/**
 * 웹 목표 태그를 API 허용 태그로 정규화합니다.
 * @param {string[]} tags 웹 태그 목록
 * @returns {string[]} API 태그 목록(허용되지 않는 태그는 제외)
 */
export function normalizeGoalTags(tags) {
	return tags
		.map(tag => {
			if (ALLOWED_GOAL_TAGS.includes(tag)) return tag;
			const mapped = GOAL_TEXT_TO_TAG[tag.trim()];
			if (mapped) return mapped;
			const normalized = tag.replace(/^\s*[^\p{L}\p{N}]*\s*/u, "").trim();
			return GOAL_TEXT_TO_TAG[normalized] || null;
		})
		.filter(tag => tag !== null);
}

/**
 * 웹 인바디 묶음(문자열 7셀) → REST InbodyResultCreate 필드 (숫자 파싱, null 보존)
 * @param {import("@gym/inbody-data.js").InbodyData} ib 웹 인바디 입력값 (문자열)
 * @param {string} comment 인바디 코멘트
 * @returns {{ weight_kg: (number|null), muscle_kg: (number|null), fat_kg: (number|null),
 *            BMI_val: (number|null), BFP_percent: (number|null), BMR_kcal: (number|null),
 *            visceral_lev: (number|null), comment: (string|null) } | null}
 *          전 셀 빈 값이면 null
 */
export function ibToRest(inc, comment = "") {
	// 방어적 빈 판정 — InbodyData 클래스 인스턴스이면 isEmpty()를, plain object이면 값을 직접 검사한다
	const isEmpty = typeof inc?.isEmpty === "function" ? inc.isEmpty() : Object.values(inc || {}).every(v => v === "");
	if (isEmpty) return null;
	const parse = (/** @type {string} */ s) => (s === "" ? null : Number(s));
	return {
		weight_kg: parse(inc.w),
		muscle_kg: parse(inc.m),
		fat_kg: parse(inc.fat),
		BMI_val: parse(inc.bmi),
		BFP_percent: parse(inc.bfp),
		BMR_kcal: parse(inc.bmr),
		visceral_lev: parse(inc.vis),
		comment: comment || null,
	};
}

/**
 * REST 인바디 → 웹 InbodyData 문자열 묶음 (비표기 시 빈 문자열)
 * @param {object|null} inbody REST InbodyResultRead (weight_kg·muscle_kg·fat_kg·BMI_val·BFP_percent·BMR_kcal·visceral_lev)
 * @returns {{ w: string, m: string, fat: string, bmi: string, bfp: string, bmr: string, vis: string }}
 */
export function restToIb(inbody) {
	const num = (/** @type {any} */ v) => (v === null || v === undefined ? "" : String(v));
	return {
		w: num(inbody?.weight_kg),
		m: num(inbody?.muscle_kg),
		fat: num(inbody?.fat_kg),
		bmi: num(inbody?.BMI_val),
		bfp: num(inbody?.BFP_percent),
		bmr: num(inbody?.BMR_kcal),
		vis: num(inbody?.visceral_lev),
	};
}

/**
 * 웹 CheckRecord.payload → BodyCheck (POST/PUT 본문) DTO 필드
 * @param {import("@infra/store.js").CheckRecordPayload} p 웹 payload
 * @param {{ memberId: number, date: string }} meta 기록 맥락
 * @returns {object} REST 본문 필드: session_label·session_date·trainer·inbody·evaluations·goals·feedbacks·consult_memo
 */
export function payloadToRest(p, meta) {
	const getEvalItem = name => {
		const i = p.items.indexOf(name);
		// 움직임 평가 목록에 없던 항목은 0점이 아니라 null(미평가)로 저장한다
		if (i === -1) {
			return null;
		}
		const ed = p.evalData && p.evalData[i];
		return {
			score: p.scores[i] ?? 0,
			evaluation_items: (ed && ed.checked) || [],
			memo: (ed && ed.memo) || null,
		};
	};
	const evaluations = [
		{
			floor_touch: getEvalItem("Lumbar ROM (바닥짚기)"),
			wall_angel: getEvalItem("Wall Angel Test"),
			overhead_squat: getEvalItem("Over Head Squat"),
			single_balance: getEvalItem("Single Balance Test"),
			vo2_max: getEvalItem("VO₂ Max (스텝 테스트)"),
			breathing: getEvalItem("호흡 테스트"),
			one_leg_squat: getEvalItem("One Leg Squat"),
			one_leg_bridge: getEvalItem("원레그 브릿지"),
		},
	];
	const feedbacks = (p.feedbacks || []).map(fb => ({
		name: fb.name,
		evaluation_items: (fb.checkItems || []).map(c => c.text),
		memo: fb.memo ?? null,
	}));
	const hasGoals = (p.goals && p.goals.length > 0) || (p.goalMemo || "").trim() !== "";
	return {
		member_ID: meta.memberId,
		session_label: p.session || "",
		session_date: meta.date || null,
		trainer: p.trainer || "",
		consult_memo: p.consultMemo || null,
		inbody: ibToRest(p.ib, p.ibComment),
		evaluations,
		goals: hasGoals ? { tags: normalizeGoalTags(p.goals || []), memo: p.goalMemo || null } : null,
		feedbacks,
	};
}

/**
 * REST BodyCheck → 웹 CheckRecord.payload (조회·편집 프리필용)
 * @param {any} body REST 응답 (flat 인바디/평가/목표/피드백 포함)
 * @returns {import("@infra/store.js").CheckRecordPayload}
 */
export function restToPayload(body) {
	const apiEval = body.evaluations?.[0] || {};
	// API의 각 평가 필드는 null(기록에 미포함 항목) 또는 항목 오브젝트다.
	// score가 0이어도 오브젝트면 실제 0점 평가이므로 그대로 포함한다.
	const evalEntries = API_EVALUATION_FIELDS.map(field => {
		const e = apiEval[field];
		if (e == null) return null;
		return {
			name: API_FIELD_TO_ITEM_NAME[field],
			score: e.score,
			evaluation_items: e.evaluation_items || [],
			memo: e.memo ?? "",
		};
	}).filter(entry => entry !== null);
	const scores = evalEntries.map(e => e.score);
	const items = evalEntries.map(e => e.name);
	const evalData = evalEntries.map(e => ({
		checked: e.evaluation_items,
		memo: e.memo,
	}));
	return {
		session: body.session_label || "",
		trainer: body.trainer || "",
		ib: restToIb(body.inbody),
		ibComment: body.inbody?.comment || "",
		scores,
		items,
		evalData,
		goals: (body.goals && body.goals.tags) || [],
		goalMemo: (body.goals && body.goals.memo) || "",
		feedbacks: (body.feedbacks || []).map((/** @type {any} */ fb) => ({
			name: fb.name,
			checkItems: (fb.evaluation_items || []).map((/** @type {any} */ t) => ({
				text: t,
				checked: false,
			})),
			memo: fb.memo ?? "",
		})),
		consultMemo: body.consult_memo || "",
	};
}
// ── API 호출 함수 (2단계 연동) ──

/**
 * 체크기록 목록을 API에서 조회합니다.
 * @param {string} [member_ID] 회원 ID — 주어지면 해당 회원 기록만 필터링
 * @returns {Promise<Array>} Checkdoc 리소스 목록
 */
export async function fetchCheckdocs(member_ID) {
	const path = member_ID ? `/checkday/checkdocs?member_ID=${encodeURIComponent(member_ID)}` : "/checkday/checkdocs";
	return request(path);
}

/**
 * 체크기록 단건을 API에서 조회합니다.
 * @param {number} checkdoc_ID 체크기록 ID
 * @returns {Promise<object>} Checkdoc 리소스
 */
export async function fetchCheckdoc(checkdoc_ID) {
	return request(`/checkday/checkdocs/${checkdoc_ID}`);
}

/**
 * 체크기록을 API에 생성합니다.
 * @param {import("@infra/store.js").CheckRecordPayload} payload 웹 payload
 * @param {{ memberId: string, date: string }} meta 기록 맥락
 * @returns {Promise<object>} 생성된 Checkdoc 리소스
 */
export async function createCheckdoc(payload, meta) {
	return request("/checkday/checkdocs", {
		method: "POST",
		body: payloadToRest(payload, meta),
	});
}

/**
 * 체크기록을 API에 부분 수정합니다.
 * @param {number} checkdoc_ID 체크기록 ID
 * @param {import("@infra/store.js").CheckRecordPayload} payload 웹 payload
 * @param {{ memberId: string, date: string }} meta 기록 맥락
 * @returns {Promise<object>} 수정된 Checkdoc 리소스
 */
export async function updateCheckdoc(checkdoc_ID, payload, meta) {
	return request(`/checkday/checkdocs/${checkdoc_ID}`, {
		method: "PUT",
		body: payloadToRest(payload, meta),
	});
}

/**
 * 체크기록을 API에서 삭제합니다.
 * @param {number} checkdoc_ID 체크기록 ID
 * @returns {Promise<object>} 삭제 응답
 */
export async function deleteCheckdoc(checkdoc_ID) {
	return request(`/checkday/checkdocs/${checkdoc_ID}`, {
		method: "DELETE",
	});
}
