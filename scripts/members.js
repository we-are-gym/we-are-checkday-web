// 파일 용도: 회원 관리 화면(members.html) — 스토어 기반 회원 목록·검색·제거·상세 이동
// 상태: createStore(관찰자 패턴)로 관리, subscribe 콜백에서 member-table 컴포넌트를 재렌더링한다.
import { UI } from "./UI.js";
import { createStore } from "./store.js";
import "./components/app-header.js";
import "./components/member-table.js";

/** 시드 회원 5명 (모의 데이터 — 영속성 없음, 재로딩 시 초기값 복원) */
const SEED_MEMBERS = [
	{ id: 1, name: "김민준", gender: "남", goal: "체지방 감소", trainer: "김지훈" },
	{ id: 2, name: "이서연", gender: "여", goal: "근력 향상", trainer: "박소연" },
	{ id: 3, name: "박지훈", gender: "남", goal: "체중 감량", trainer: "정지훈" },
	{ id: 4, name: "최수아", gender: "여", goal: "체형 교정", trainer: "김지훈" },
	{ id: 5, name: "정우진", gender: "남", goal: "근력 향상", trainer: "박소연" },
];

/** 회원 목록 스토어 */
const store = createStore({
	members: SEED_MEMBERS,
	nextId: SEED_MEMBERS.length + 1,
});

const tableEl = UI.byId("member-table");
let keyword = "";

/**
 * 목록 행 데이터 구성 (체크 횟수는 기록 스토어 연동 전 0으로 표기)
 * @param {Array<{id:number,name:string,gender:string,goal:string,trainer:string}>} list
 * @returns {Array<{id:number,name:string,gender:string,goal:string,trainer:string,recordCount:number}>}
 */
function buildRows(list) {
	return list.map((m) => ({ ...m, recordCount: 0 }));
}

/** 스토어 상태로 테이블·건수·빈 상태를 재렌더링 */
function render() {
	const kw = keyword.trim().toLowerCase();
	const { members } = store.getState();
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
	store.setState((prev) => ({
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
store.subscribe(render);
tableEl.onSelect = (id) => {
	window.location.href = `member-detail.html?memberID=${id}`;
};
tableEl.onRemove = (id) => removeMember(id);
UI.byId("search-input").addEventListener("input", onSearch);
render();
