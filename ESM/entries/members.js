// 파일 용도: 회원 관리 화면(members.html) — API 기반 회원 목록·검색·제거·상세 이동
// 상태: memberStore·recordStore(공용 스토어, 관찰자 패턴) 구독, subscribe 콜백에서 member-table 컴포넌트를 재렌더링한다.
import { recordStore } from "@check-doc/record-store.js";
import { getRecordCountsByMember } from "@check-doc/record-utils.js";
import "@infra/components/app-header.js";
import "@member/components/member-table.js";
import { removeMember as apiRemoveMember, loadMembers, memberStore } from "@member/member-store.js";
import { byId } from "@tools/utils-dom.js";

/** 회원 목록 테이블 컴포넌트 엘리먼트 */
const tableEl = byId("member-table");
/** 현재 검색어 (빈 문자열이면 전체 목록) */
let keyword = "";

/**
 * 목록 행 데이터 구성 (체크 횟수는 공용 헬퍼로 기록 스토어에서 실계산)
 * @param {Array<{id:string,name:string,gender:string,goal:string,trainer:string}>} list
 * @returns {Array<{id:string,name:string,gender:string,goal:string,trainer:string,recordCount:number}>}
 */
function buildRows(list) {
	const countByMember = getRecordCountsByMember(recordStore.getState().records);
	return list.map(m => ({
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
	const filtered = kw ? members.filter(m => m.name.toLowerCase().includes(kw)) : members.slice();
	tableEl.rows = buildRows(filtered);
	tableEl.refresh();
}

/**
 * 회원 삭제 (API 호출 → 스토어 상태 갱신 → 구독자 재렌더링)
 * @param {string} id 삭제할 회원 member_ID
 * @returns {Promise<void>}
 */
async function removeMember(id) {
	const member = memberStore.getState().members.find(m => m.id === id);
	if (!member) return;

	// 연관 체크기록 건수 (안내용)
	const linkedRecords = recordStore.getState().records.filter(r => r.memberId === id);
	const recordCount = linkedRecords.length;

	const prompt =
		recordCount > 0
			? `회원 ${member.name} 님을 삭제하시겠습니까?\n\n연결된 체크기록 ${recordCount}걸 로컬 목록에서도 제거합니다.`
			: `회원 ${member.name} 님을 삭제하시겠습니까?`;

	if (!confirm(prompt)) {
		return;
	}

	await apiRemoveMember(id);
	// 로컬 기록 목록에서도 해당 회원 기록 제거
	recordStore.setState(prev => ({
		...prev,
		records: prev.records.filter(r => r.memberId !== id),
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
loadMembers().catch(err => {
	console.error("회원 목록 로드 실패:", err);
	// 빈 목록 안내는 member-table 컴포넌트가 렌더링합니다
	tableEl.rows = [];
	tableEl.render?.();
});

/** 회원 선택 시 상세 화면으로 이동
 * @param {string} id 선택한 회원 member_ID
 * @returns {void}
 */
tableEl.onSelect = id => {
	window.location.href = `member-detail.html?memberID=${encodeURIComponent(id)}`;
};
/** 회원 삭제 요청 처리
 * @param {string} id 삭제할 회원 member_ID
 * @returns {void}
 */
tableEl.onRemove = id => {
	removeMember(id);
};
byId("search-input").addEventListener("input", onSearch);
render();
