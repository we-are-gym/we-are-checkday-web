// 파일 용도: 회원 공용 헬퍼 — 회원 조회·기록 건수 계산 순수 함수 (회원 관리·상세·편집 화면 공용)
// 기법: 순수 함수 (DOM·전역 저장소 비의존, 단위 테스트 용이) — 화면마다 반복되던 동일 로직을 단일 소스로 통합
// 사용: member-detail.js·member-edit.js(memberStore 상태에서 getMemberById 직접 호출), members.js의 체크 횟수 계산 등에서 import 하여 쓰는 것을 전제한다.

/**
 * ID로 회원 1명 조회 (없으면 undefined)
 * @param {import("@base/store.js").Member[]} members 회원 배열
 * @param {number} id 회원 고유 번호
 * @returns {import("@base/store.js").Member | undefined}
 */
export function getMemberById(members, id) {
	return members.find((m) => m.id === id);
}

/**
 * 이름으로 회원 1명 조회 (없으면 undefined)
 * @param {import("@base/store.js").Member[]} members 회원 배열
 * @param {string} name 회원 이름
 * @returns {import("@base/store.js").Member | undefined}
 */
export function getMemberByName(members, name) {
	return members.find((m) => m.name === name);
}

/**
 * ID로 체크기록 1건 조회 (없으면 undefined)
 * @param {import("@base/store.js").CheckRecord[]} records 체크기록 배열
 * @param {number} id 기록 고유 번호
 * @returns {import("@base/store.js").CheckRecord | undefined}
 */
export function getRecordById(records, id) {
	return records.find((r) => r.id === id);
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