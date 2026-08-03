// 파일 용도: 회원 관리 화면(members.html) — 스토어 기반 회원 목록·검색·제거·상세 이동
// 상태: memberStore(공용 스토어, 관찰자 패턴) 구독, subscribe 콜백에서 member-table 컴포넌트를 재렌더링한다.
import { UI } from "./UI.js";
import { memberStore } from "./member-store.js";
import { recordStore } from "./record-store.js";
import "./components/app-header.js";
import "./components/member-table.js";

const tableEl = UI.byId("member-table");
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

/** 스토어 상태로 테이블·건수·빈 상태를 재렌더링 */
function render() {
	const kw = keyword.trim().toLowerCase();
	const { members } = memberStore.getState();
	const filtered = kw
		? members.filter((m) => m.name.toLowerCase().includes(kw))
		: members.slice();
	tableEl.rows = buildRows(filtered);
	tableEl.refresh();
	UI.byId("member-empty").hidden = filtered.length !== 0;
	UI.setText("member-count", `${filtered.length}명`);
}

/** 회원 삭제 (스토어 상태 갱신 → 구독자 재렌더링) */
function removeMember(id) {
	memberStore.setState((prev) => ({
		...prev,
		members: prev.members.filter((m) => m.id !== id),
	}));
}

/** 검색어 갱신 후 재렌더링 */
function onSearch() {
	keyword = UI.byId("search-input").value;
	render();
}

// ── 시작 ──
memberStore.subscribe(render);
recordStore.subscribe(render);
tableEl.onSelect = (id) => {
	window.location.href = `member-detail.html?memberID=${id}`;
};
tableEl.onRemove = (id) => removeMember(id);
UI.byId("search-input").addEventListener("input", onSearch);
render();
