// 파일 용도: 회원 관리 화면(members.html) — 스토어 기반 회원 목록·검색·제거·상세 이동
// 상태: memberStore(공용 스토어, 관찰자 패턴) 구독, subscribe 콜백에서 member-table 컴포넌트를 재렌더링한다.
import "@base/components/app-header.js";
import { byId } from "@base/UI.js";
import { recordStore } from "@check-doc/record-store.js";
import "@member/components/member-table.js";
import { memberStore } from "@member/member-store.js";
import { getRecordCountsByMember } from "@member/member-utils.js";

/** 회원 목록 테이블 컴포넌트 엘리먼트 */
const tableEl = byId("member-table");
/** 현재 검색어 (빈 문자열이면 전체 목록) */
let keyword = "";

/**
 * 목록 행 데이터 구성 (체크 횟수는 공용 헬퍼로 기록 스토어에서 실계산)
 * @param {Array<{id:number,name:string,gender:string,goal:string,trainer:string}>} list
 * @returns {Array<{id:number,name:string,gender:string,goal:string,trainer:string,recordCount:number}>}
 */
function buildRows(list) {
	const countByMember = getRecordCountsByMember(
		recordStore.getState().records,
	);
	return list.map((m) => ({
		...m,
		recordCount: countByMember.get(m.id) || 0,
	}));
}

/** 스토어 상태로 테이블·건수를 재렌더링 (빈 목록 안내는 member-table이 목록 안에 렌더링)
 * @returns {void}
 */
function render() {
	const kw = keyword.trim().toLowerCase();
	const { members } = memberStore.getState();
	const filtered = kw
		? members.filter((m) => m.name.toLowerCase().includes(kw))
		: members.slice();
	tableEl.rows = buildRows(filtered);
	tableEl.refresh();
}

/**
 * 회원 삭제 (스토어 상태 갱신 → 구독자 재렌더링)
 * 확인 다이얼로그 표시, 연관 체크기록 있으면 삭제 불가
 * @param {number} id 삭제할 회원 고유 번호
 * @returns {void}
 */
function removeMember(id) {
	const member = memberStore.getState().members.find((m) => m.id === id);
	if (!member) return;

	// 연관 체크기록 확인
	const hasRecords = recordStore
		.getState()
		.records.some((r) => r.memberId === id);
	if (hasRecords) {
		alert("체크기록이 존재하는 회원은 삭제할 수 없습니다.");
		return;
	}

	// 확인 다이얼로그
	if (!confirm(`회원 ${member.name} 님을 삭제하시겠습니까?`)) {
		return;
	}

	memberStore.setState((prev) => ({
		...prev,
		members: prev.members.filter((m) => m.id !== id),
	}));
}

/** 검색어 갱신 후 재렌더링
 * @returns {void}
 */
function onSearch() {
	keyword = byId("search-input").value;
	render();
}

// ── 시작 ──
memberStore.subscribe(render);
recordStore.subscribe(render);
/** 회원 선택 시 상세 화면으로 이동
 * @param {number} id 선택한 회원 고유 번호
 * @returns {void}
 */
tableEl.onSelect = (id) => {
	window.location.href = `member-detail.html?memberID=${id}`;
};
/** 회원 삭제 요청 처리 (스토어에서 제거 → 재렌더링)
 * @param {number} id 삭제할 회원 고유 번호
 * @returns {void}
 */
tableEl.onRemove = (id) => removeMember(id);
byId("search-input").addEventListener("input", onSearch);
render();
