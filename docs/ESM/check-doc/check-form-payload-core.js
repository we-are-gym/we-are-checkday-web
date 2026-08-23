// 파일 용도: 체크기록 폼(상담지) 직렬화·프리필의 순수 연산 — DOM·저장소에 의존하지 않는 payload 조립·프리필 값 도출
// 기법: 순수 함수 — DOM 읽기(collectPayload)·쓰기(prefillForm)를 담당하는 check-form-payload.js가
//       이 모듈의 순수 함수를 호출해 payload를 조립하고, 프리필 값을 도출한다. 단위 검증이 용이하다.

/**
 * 추출된 폼 필드 값으로 체크기록 payload를 조립한다. (순수)
 * @param {{
 *   session: string, trainer: string,
 *   ib: import("@gym/inbody-data.js").InbodyData, ibComment: string,
 *   scores: number[], items: string[],
 *   evalData: Array<{ checked: string[], memo: string }>,
 *   goals: string[], goalMemo: string,
 *   feedbacks: Array<{ name: string, checkItems: Array<{text: string, checked: boolean}>, memo: string }>,
 *   consultMemo: string,
 * }} fields DOM에서 추출한 원시 필드 값
 * @returns {import("@infra/store.js").CheckRecordPayload}
 */
export function buildPayload({ session, trainer, ib, ibComment, scores, items, evalData, goals, goalMemo, feedbacks, consultMemo }) {
	return {
		session,
		trainer,
		ib,
		ibComment,
		scores,
		items,
		evalData,
		goals,
		goalMemo,
		feedbacks,
		consultMemo,
	};
}

/**
 * 기록 payload + 회원으로부터 폼에 채울 값을 도출한다. (순수 — 실제 DOM 쓰기는 호출부가 담당)
 * @param {import("@infra/store.js").CheckRecord} rec 프리필할 기록
 * @param {{ name: string } | undefined} member 현재 회원 (없으면 이름은 빈 문자열)
 * @returns {{
 *   name: string, session: string, trainer: string, date: string,
 *   ib: Record<string, string>, ibComment: string,
 *   scores: number[], evalData: Array<{ checked: string[], memo: string }>,
 *   goals: string[], goalMemo: string,
 *   feedbacks: Array<{ name: string, checkItems: Array<{text: string, checked: boolean}>, memo: string }>,
 *   consultMemo: string,
 * }}
 */
export function resolvePrefillValues(rec, member) {
	const p = rec.payload;
	return {
		name: member ? member.name : "",
		session: p.session || "",
		trainer: p.trainer || "",
		date: rec.date || "",
		ib: p.ib || {},
		ibComment: p.ibComment || "",
		scores: p.scores || [],
		evalData: p.evalData || [],
		goals: p.goals || [],
		goalMemo: p.goalMemo || "",
		feedbacks: p.feedbacks || [],
		consultMemo: p.consultMemo || "",
	};
}
