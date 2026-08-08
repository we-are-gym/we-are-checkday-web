// 파일 용도: 체크기록 공용 조회 헬퍼 — 기록 조회·건수·정렬을 단일 소스로 통합 (member-detail·check-doc-view·check-doc-edit·members·check-form-new 공용)
// 기법: 순수 함수 (DOM·전역 저장소 비의존, 단위 테스트 용이)
// 사용: 회원 도메인(member-utils)에는 회원 조회만 남기고, 체크기록 관련 조회는 모두 이 모듈에서 import 하여 쓰는 것을 전제한다.

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
 * 회원별 체크기록 건수 맵 (memberId → 기록 수)
 * @param {Array<{ memberId: number }>} records 체크기록 배열
 * @returns {Map<number, number>} 회원 id → 기록 건수 (기록 없는 회원은 키 부재)
 */
export function getRecordCountsByMember(records) {
	const countByMember = new Map();
	records.forEach((r) => countByMember.set(r.memberId, (countByMember.get(r.memberId) || 0) + 1));
	return countByMember;
}