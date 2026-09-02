// 파일 용도: 체크기록 스토어 - Mason API 클라이언트 (회원 상세·조회·작성·편집 공용)
// 주의: 기존 sessionStorage mock 저장에서 API 영속화로 교체되었습니다.
// to-be: API 실패 시 toUserMessage + showToast로 사용자 피드백 제공
import { toUserMessage } from "@infra/errors.js";
import { Store } from "@infra/store.js";
import { showToast } from "@shared/components/toast/toast.js";
import { createCheckdoc, deleteCheckdoc, fetchCheckdocs, restToPayload, updateCheckdoc } from "./record-rest.js";

/**
 * 화면 이동으로 중단된 fetch인지 판별한다 — 사용자 행동이므로 오류 알림·로깅을 생략해도 된다.
 * 크로미움 계열은 DOMException AbortError, 파이어폭스는 TypeError "NetworkError when attempting to fetch resource"로 나온다.
 * @param {unknown} err fetch 오류
 * @returns {boolean} 네비게이션 중단 여부
 */
function isNavigationAbort(err) {
	return (
		err?.name === "AbortError" ||
		(err?.name === "TypeError" && typeof err?.message === "string" && err.message.includes("NetworkError"))
	);
}

/** 체크기록 스토어 (전 화면 공용 단일 인스턴스) — API 데이터로 채워집니다. */
export const recordStore = new Store({ records: [], loading: false, error: null }, { storageKey: null });

/**
 * API Checkdoc 응답을 웹 CheckRecord 형태로 정규화합니다.
 * @param {object} apiDoc Mason API Checkdoc 리소스
 * @returns {import("@infra/store.js").CheckRecord}
 */
export function normalizeCheckdoc(apiDoc) {
	return {
		id: apiDoc.checkdoc_ID,
		memberId: apiDoc.member_ID,
		date: apiDoc.session_date,
		payload: restToPayload(apiDoc),
	};
}

/**
 * 전체 체크기록 목록을 API에서 불러와 스토어에 저장합니다.
 * @returns {Promise<void>}
 */
/**
 * 체크기록을 API에서 페이지네이션으로 불러옵니다.
 * @param {{ memberID?: string, offset?: number, limit?: number }} [options]
 *   memberID: 회원 ID (선택), offset: 시작 위치 (기본 0), limit: 가져올 건수 (기본 50)
 * @returns {Promise<Array<import("@infra/store.js").CheckRecord>>} 불러온 체크기록 목록
 */
export async function fetchRecords({ memberID, offset = 0, limit = 50 } = {}) {
	const params = new URLSearchParams();
	if (memberID) params.set("member_ID", memberID);
	params.set("offset", String(offset));
	params.set("limit", String(limit));
	const items = await fetchCheckdocs(memberID);
	return items.slice(offset, offset + limit).map(normalizeCheckdoc);
}

export async function loadRecords() {
	recordStore.update({ loading: true, error: null });
	try {
		const items = await fetchCheckdocs();
		recordStore.update({ records: items.map(normalizeCheckdoc), loading: false });
	} catch (err) {
		// 네비게이션 중단은 사용자 행동이므로 토스트·로그 없이 조용히 종료한다 — rethrow하지 않는다
		// (크로미움=AbortError, 파이어폭스=TypeError NetworkError 시그니처)
		if (isNavigationAbort(err)) return;
		const msg = toUserMessage(err);
		recordStore.update({ loading: false, error: msg });
		showToast(msg, { type: "error" });
		throw err;
	}
}

/**
 * 회원별 체크기록 목록을 API에서 불러와 스토어에 저장합니다.
 * @param {string} member_ID 회원 member_ID
 * @returns {Promise<void>}
 */
export async function loadRecordsByMember(member_ID) {
	recordStore.update({ loading: true, error: null });
	try {
		const items = await fetchCheckdocs(member_ID);
		recordStore.update({ records: items.map(normalizeCheckdoc), loading: false });
	} catch (err) {
		// 네비게이션 중단은 사용자 행동이므로 토스트·로그 없이 조용히 종료한다 — rethrow하지 않는다
		if (isNavigationAbort(err)) return;
		const msg = toUserMessage(err);
		recordStore.update({ loading: false, error: msg });
		showToast(msg, { type: "error" });
		throw err;
	}
}

/**
 * 체크기록을 API에 생성하고 스토어에 반영합니다.
 * @param {import("@infra/store.js").CheckRecordPayload} payload 웹 payload
 * @param {{ memberId: string, date: string }} meta 기록 맥락
 * @returns {Promise<number>} 생성된 checkdoc_ID
 */
export async function addRecord(payload, meta) {
	const created = await createCheckdoc(payload, meta);
	recordStore.setState(prev => ({
		...prev,
		records: [...prev.records, normalizeCheckdoc(created)],
	}));
	return created.checkdoc_ID;
}

/**
 * 체크기록을 API에 부분 수정하고 스토어에 반영합니다.
 * @param {number} checkdoc_ID 체크기록 ID
 * @param {import("@infra/store.js").CheckRecordPayload} payload 웹 payload
 * @param {{ memberId: string, date: string }} meta 기록 맥락
 * @returns {Promise<void>}
 */
export async function updateRecord(checkdoc_ID, payload, meta) {
	const updated = await updateCheckdoc(checkdoc_ID, payload, meta);
	recordStore.setState(prev => ({
		...prev,
		records: prev.records.map(r => (r.id === checkdoc_ID ? normalizeCheckdoc(updated) : r)),
	}));
}

/**
 * 체크기록을 API에서 삭제하고 스토어에서 제거합니다.
 * @param {number} checkdoc_ID 체크기록 ID
 * @returns {Promise<void>}
 */
export async function deleteRecord(checkdoc_ID) {
	await deleteCheckdoc(checkdoc_ID);
	recordStore.setState(prev => ({
		...prev,
		records: prev.records.filter(r => r.id !== checkdoc_ID),
	}));
}
