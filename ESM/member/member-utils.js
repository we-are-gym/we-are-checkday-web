// 파일 용도: 회원 공용 헬퍼 — 회원 조회 순수 함수 (회원 관리·상세·편집 화면 공용)
// 기법: 순수 함수 (DOM·전역 저장소 비의존, 단위 테스트 용이)
// 사용: member-detail.js·member-edit.js(memberStore 상태에서 getMemberById 직접 호출) 등에서 import 하여 쓰는 것을 전제한다.
//       체크기록(record) 관련 조회는 check-doc/record-utils.js로 이동했다 (getRecordById·getRecordCountsByMember·getRecordsByMember).

/**
 * ID로 회원 1명 조회 (없으면 undefined)
 * @param {import("@infra/store.js").Member[]} members 회원 배열
 * @param {string} id 회원 고유 ID (Mason API `member_ID`)
 * @returns {import("@infra/store.js").Member | undefined}
 */
export function getMemberById(members, id) {
	return members.find(m => m.id === id);
}

/**
 * 이름으로 회원 1명 조회 (없으면 undefined)
 * @param {import("@infra/store.js").Member[]} members 회원 배열
 * @param {string} name 회원 이름
 * @returns {import("@infra/store.js").Member | undefined}
 */
export function getMemberByName(members, name) {
	return members.find(m => m.name === name);
}
