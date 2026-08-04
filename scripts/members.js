// 파일 용도: 회원 관리 화면(members.html) — 스토어 기반 회원 목록·검색·제거·상세 이동
// 상태: memberStore(공용 스토어, 관찰자 패턴) 구독, subscribe 콜백에서 member-table 컴포넌트를 재렌더링한다.
import { byId } from "./UI.js";
import { memberStore } from "./member-store.js";
import { recordStore } from "./record-store.js";
import "./components/app-header.js";
import "./components/member-table.js";

const tableEl = byId("member-table");
let keyword = "";

/**
 * 목록 행 데이터 구성 (체크 횟수는 기록 스토어에서 실계산)
 * @param {Array<{id:number,name:string,gender:string,goal:string,trainer:string}>} list
 * @returns {Array<{id:number,name:string,gender:string,goal:string,trainer:string,recordCount:number}>}
 */
function buildRows(list) {
	const { records } = recordStore.getState();
	const countByMember = new Map();
	records.forEach((r) => countByMember.set(r.memberId, (countByMember.get(r.memberId) || 0) + 1));
	return list.map((m) => ({ ...m, recordCount: countByMember.get(m.id) || 0 }));
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
 * @param {number} id 삭제할 회원 고유 번호
 * @returns {void}
 */
function removeMember(id) {
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
tableEl.onSelect = (id) => {
	window.location.href = `member-detail.html?memberID=${id}`;
};
tableEl.onRemove = (id) => removeMember(id);
byId("search-input").addEventListener("input", onSearch);
render();
