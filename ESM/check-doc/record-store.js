// 파일 용도: 체크기록 스토어 — Mason API 클라이언트 (회원 상세·조회·작성·편집 공용)
// 주의: 기존 sessionStorage mock 저장에서 API 영속화로 교첼되었습니다.
import { Store } from "@infra/store.js";
import {
	createCheckdoc,
	deleteCheckdoc,
	fetchCheckdocs,
	restToPayload,
	updateCheckdoc,
} from "./record-rest.js";

/** 체크기록 스토어 (전 화면 공용 단일 인스턴스) — API 데이터로 채워집니다. */
export const recordStore = new Store(
	{ records: [], loading: false, error: null },
	{ storageKey: null },
);

// ── API 클라이언트 함수 (2단계 연동) ──

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
export async function loadRecords() {
	recordStore.update({ loading: true, error: null });
	try {
		const items = await fetchCheckdocs();
		recordStore.update({ records: items.map(normalizeCheckdoc), loading: false });
	} catch (err) {
		recordStore.update({ loading: false, error: err.message || "체크기록을 불러오지 못했습니다" });
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
		recordStore.update({ loading: false, error: err.message || "체크기록을 불러오지 못했습니다" });
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
	recordStore.setState((prev) => ({
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
	recordStore.setState((prev) => ({
		...prev,
		records: prev.records.map((r) => (r.id === checkdoc_ID ? normalizeCheckdoc(updated) : r)),
	}));
}

/**
 * 체크기록을 API에서 삭제하고 스토어에서 제거합니다.
 * @param {number} checkdoc_ID 체크기록 ID
 * @returns {Promise<void>}
 */
export async function deleteRecord(checkdoc_ID) {
	await deleteCheckdoc(checkdoc_ID);
	recordStore.setState((prev) => ({
		...prev,
		records: prev.records.filter((r) => r.id !== checkdoc_ID),
	}));
}
