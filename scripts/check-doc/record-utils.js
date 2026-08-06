// 파일 용도: 체크기록 공용 조회 헬퍼 — 중복 조회 로직 단일 소스화 (member-detail·check-doc-view·check-doc-edit 공용)

/**
 * ID로 체크기록 1건 조회
 * @param {import("@base/store.js").CheckRecord[]} records 체크기록 배열
 * @param {number} id 기록 고유 번호
 * @returns {import("@base/store.js").CheckRecord | undefined}
 */
export function getRecordById(records, id) {
	return records.find((r) => r.id === id);
}

/**
 * 회원별 체크기록 배열 반환 (날짜 오름차순)
 * @param {import("@base/store.js").CheckRecord[]} records 체크기록 배열
 * @param {number} memberId 회원 ID
 * @returns {import("@base/store.js").CheckRecord[]}
 */
export function getRecordsByMember(records, memberId) {
	return records
		.filter((r) => r.memberId === memberId)
		.sort((a, b) => new Date(a.date) - new Date(b.date));
}

/**
 * 회원의 체크기록 배열 반환 (member-detail 전용 별칭)
 * @param {import("@base/store.js").CheckRecord[]} records 체크기록 배열
 * @param {number} memberId 회원 ID
 * @returns {import("@base/store.js").CheckRecord[]}
 */
export function getMemberRecords(records, memberId) {
	return getRecordsByMember(records, memberId);
}
