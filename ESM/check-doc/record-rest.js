// 파일 용도: 웹 기록 모형 ↔ REST DTO 변환 (계약 정합 계층)
// 기법: 순수 함수 — DOM·저장소에 의존하지 않는다. 웹 payload(CheckRecord.payload)와
//       REST DTO(CheckdocCreate/Update, BasicFunctionEvaluationDTO, ExerciseGoalDTO,
//       MovementFeedbackDTO, InbodyResultCreate) 간 필드명·구조를 정규화한다.
// 주의: 웹은 현재 mock 저장(member.records.v3)이므로 이 모듈은 아직 실제 HTTP 호출에
//       연결되지 않는다. 작업 5(엔드포인트 추가)에서 웹 필요 매핑에 사용한다.

/**
 * 웹 인바디 묶음(문자열 7셀) → REST InbodyResultCreate 필드 (숫자 파싱, null 보존)
 * @param {import("@gym/inbody-data.js").InbodyData} ib 웹 인바디 입력값 (문자열)
 * @param {string} comment 인바디 코멘트
 * @returns {{ weight: (number|null), muscle: (number|null), fat: (number|null),
 *            BMI: (number|null), BFP: (number|null), BMR: (number|null),
 *            visceral: (number|null), comment: (string|null) } | null}
 *          전 셀 빈 값이면 null
 */
export function ibToRest(inc, comment = "") {
	if (inc.isEmpty()) return null;
	const parse = (/** @type {string} */ s) => (s === "" ? null : Number(s));
	return {
		weight: parse(inc.w),
		muscle: parse(inc.m),
		fat: parse(inc.fat),
		BMI: parse(inc.bmi),
		BFP: parse(inc.bfp),
		BMR: parse(inc.bmr),
		visceral: parse(inc.vis),
		comment: comment || null,
	};
}

/**
 * REST 인바디 → 웹 InbodyData 문자열 묶음 (비표기 시 빈 문자열)
 * @param {object|null} inbody REST InbodyResultRead (weight·muscle·fat·BMI·BFP·BMR·visceral)
 * @returns {{ w: string, m: string, fat: string, bmi: string, bfp: string, bmr: string, vis: string }}
 */
export function restToIb(inbody) {
	const num = (/** @type {any} */ v) => (v === null || v === undefined ? "" : String(v));
	return {
		w: num(inbody?.weight),
		m: num(inbody?.muscle),
		fat: num(inbody?.fat),
		bmi: num(inbody?.BMI),
		bfp: num(inbody?.BFP),
		bmr: num(inbody?.BMR),
		vis: num(inbody?.visceral),
	};
}

/**
 * 웹 CheckRecord.payload → BodyCheck (POST/PUT 본문) DTO 필드
 * @param {import("@infra/store.js").CheckRecordPayload} p 웹 payload
 * @param {{ memberId: number, date: string }} meta 기록 맥락
 * @returns {object} REST 본문 필드: session_label·session_date·trainer·inbody·evaluations·goals·feedbacks·consult_memo
 */
export function payloadToRest(p, meta) {
	const evaluations = p.items.map((name, i) => ({
		name,
		score: (p.scores && p.scores[i]) || 0,
		evaluation_items: (p.evalData && p.evalData[i] && p.evalData[i].checked) || [],
		memo: (p.evalData && p.evalData[i] && p.evalData[i].memo) ?? null,
	}));
	const feedbacks = (p.feedbacks || []).map((fb) => ({
		name: fb.name,
		evaluation_items: (fb.checkItems || []).map((c) => c.text),
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
		goals: hasGoals ? { tags: p.goals || [], memo: p.goalMemo || null } : null,
		feedbacks,
	};
}

/**
 * REST BodyCheck → 웹 CheckRecord.payload (조회·편집 프리필용)
 * @param {any} body REST 응답 (flat 인바디/평가/목표/피드백 포함)
 * @returns {import("@infra/store.js").CheckRecordPayload}
 */
export function restToPayload(body) {
	const evals = body.evaluations || [];
	const scores = evals.map((/** @type {any} */ e) => e.score);
	const items = evals.map((/** @type {any} */ e) => e.name);
	const evalData = evals.map((/** @type {any} */ e) => ({
		checked: e.evaluation_items || [],
		memo: e.memo ?? "",
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