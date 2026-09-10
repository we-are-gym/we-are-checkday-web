// 파일 용도: 회원 관리 화면(members.html) — API 기반 회원 목록·검색·제거·상세 이동
// 상태: memberStore·recordStore(공용 스토어, 관찰자 패턴) 구독, subscribe 콜백에서 ui-data-table 컴포넌트에 rows를 주입해 재렌더링한다.
import { loadRecords, recordStore } from "@check-doc/record-store.js";
import { getRecordCountsByMember } from "@check-doc/record-utils.js";
import { guardOnBfcache } from "@infra/auth.js";
import "@infra/components/app-header.js";
import { escapeHtml } from "@infra/templates.js";
import { removeMember } from "@member/confirm-delete.js";
import { loadMembers, memberStore } from "@member/member-store.js";
import { displayGender } from "@member/member-utils.js";
import "@shared/components/data-table/data-table.js";
import { hideLoading, showLoading } from "@shared/components/loading/loading-overlay.js";
import { byId } from "@tools/utils-dom.js";

// 로딩 오버레이 — memberStore/recordStore의 loading 상태 구독
memberStore.subscribe(state => (state.loading ? showLoading() : hideLoading()));
recordStore.subscribe(state => (state.loading ? showLoading() : hideLoading()));

/** 한 번에 표시할 회원 수 */
const PAGE_SIZE = 50;

/** 현재까지 표시한 회원 수 */
let displayCount = PAGE_SIZE;

/** 회원 목록 테이블 컴포넌트 엘리먼트 (ui-data-table) */
const tableEl = byId("member-table");

/** 테이블 컬럼 정의 — 이름·성별·담당 트레이너·체크 횟수는 중앙, 관리(삭제)는 우측 정렬 */
const COLUMNS = [
	{
		key: "name",
		label: "이름",
		align: "center",
		// 열 폭 비율은 members-table-before(29/18/23/18/12%)와 동일 — table-layout: fixed 기준
		width: "29%",
		// 이름 강조(색 var(--text)·굵기 700)용 후킹 클래스 — 스타일은 layout-members.css
		render: value => `<span class="member-name">${escapeHtml(value)}</span>`,
	},
	{ key: "gender", label: "성별", align: "center", width: "18%" },
	{ key: "trainer", label: "담당 트레이너", align: "center", width: "23%" },
	{
		key: "recordCount",
		label: "체크 횟수",
		align: "center",
		width: "18%",
		render: (value, row) => `${row.recordCount}회`,
	},
	{
		key: "action",
		label: "",
		align: "right",
		width: "12%",
		render: (value, row) =>
			`<button type="button" class="row-remove" data-row-action="remove" aria-label="${escapeHtml(row.name)} 삭제">삭제</button>`,
	},
];

// 화면 정적 구성 — 컴포넌트 props로 1회 설정 (업그레이드 후 setProp은 즉시 리렌더)
tableEl.setProp("columns", COLUMNS);
tableEl.setProp("ariaLabel", "회원 목록");
tableEl.setProp("emptyMessage", "검색 결과가 없어요");
// 홀/짝 행 배경을 동등하게 한다 — 줄무늬는 공용 컴포넌트 능력으로 남기고 이 화면에서만 끈다
tableEl.setProp("striped", false);
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
		gender: displayGender(m.gender),
		recordCount: countByMember.get(m.id) || 0,
	}));
}

/** 스토어 상태로 테이블·건수를 재렌더링 (빈 목록 안내는 ui-data-table이 emptyMessage로 렌더링)
 * @returns {void}
 */
function render() {
	const kw = keyword.trim().toLowerCase();
	const { members } = memberStore.getState();
	const filtered = kw ? members.filter(m => m.name.toLowerCase().includes(kw)) : members.slice();
	const sliced = filtered.slice(0, displayCount);

	tableEl.setProp("rows", buildRows(sliced));

	// "더 보기" 버튼 표시/숨김 — 시각 정의는 styles/layout-members.css .btn-load-more 단일 규칙
	// (colors.css 다크 토큰 소비, 회원 상세 #new-record-btn 고스트 규약과 정렬)
	let loadMoreBtn = byId("load-more-btn");

	if (filtered.length > displayCount) {
		if (!loadMoreBtn) {
			loadMoreBtn = document.createElement("button");
			loadMoreBtn.id = "load-more-btn";
			loadMoreBtn.textContent = "더 보기";
			loadMoreBtn.className = "btn-load-more";

			loadMoreBtn.addEventListener("click", () => {
				displayCount += PAGE_SIZE;
				render();
			});

			tableEl.parentNode?.insertBefore(loadMoreBtn, tableEl.nextSibling);
		}

		loadMoreBtn.style.display = "";
		loadMoreBtn.textContent = `더 보기 (${filtered.length - displayCount}건 남음)`;
	} else if (loadMoreBtn) {
		loadMoreBtn.style.display = "none";
	}

	// 스켈레톤 플레이스홀더 (로딩 중일 때 표시)
	const { loading } = memberStore.getState();
	let skeletonEl = byId("skeleton-placeholder");

	// if (loading && members.length === 0) {
	// 	if (!skeletonEl) {
	// 		skeletonEl = document.createElement("div");
	// 		skeletonEl.id = "skeleton-placeholder";
	// 		skeletonEl.className = "skeleton-placeholder";
	// 		skeletonEl.style.cssText = "padding:1rem;display:flex;flex-direction:column;gap:.5rem;";

	// 		for (let i = 0; i < 5; i++) {
	// 			const row = document.createElement("div");

	// 			row.style.cssText =
	// 				"height:2.5rem;background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);background-size:200% 100%;animation:es-skeleton-shimmer 1.5s infinite;border-radius:6px;";

	// 			skeletonEl.appendChild(row);
	// 		}

	// 		const style = document.createElement("style");

	// 		style.textContent = "@keyframes es-skeleton-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}";
	// 		skeletonEl.prepend(style);

	// 		tableEl.parentNode?.insertBefore(skeletonEl, tableEl);
	// 	}

	// 	skeletonEl.style.display = "";
	// } else if (skeletonEl) {
	// 	skeletonEl.style.display = "none";
	// }
}

/** 검색어 갱신 후 재렌더링
 * @returns {void}
 */
function onSearch() {
	keyword = byId("search-input").value;
	render();
}

// ── 시작 ──
/**
 * 회원·체크기록을 API에서 다시 읽어온다 — 최초 로드와 bfcache 복원 갱신에서 공용.
 * 실패해도 화면이 죽지 않도록 각각 잡아 기록만 남긴다.
 * @returns {Promise<void>}
 */
async function loadAll() {
	await Promise.all([
		loadMembers().catch(err => {
			console.error("회원 목록 로드 실패:", err);
			// 빈 목록 안내는 ui-data-table 컴포넌트가 emptyMessage로 렌더링합니다
			tableEl.setProp("rows", []);
		}),
		loadRecords().catch(() => {
			// 백그라운드 회차 수 프리로드는 보조 데이터 — 실패는 조용히 넘긴다
			// (네비게이션 중단은 record-store가 토스트·로그 없이 종료, 실제 오류는 toast가 안내, 목록 실패는 loadMembers가 처리)
		}),
	]);
}

// bfcache 복원 시 스토어를 다시 읽어 최신 데이터를 표시한다 (구독 render가 재렌더링)
guardOnBfcache(loadAll);
memberStore.subscribe(render);
recordStore.subscribe(render);
loadAll();

/** 회원 선택(행 활성화) 시 상세 화면으로 이동
 * @param {CustomEvent} e rowActivate 이벤트 (detail.key = 회원 member_ID)
 * @returns {void}
 */
tableEl.addEventListener("rowActivate", e => {
	const id = e.detail?.key;
	if (id) window.location.href = `member-detail.html?memberID=${encodeURIComponent(id)}`;
});
/** 회원 삭제 요청 처리 (행 액션 버튼)
 * @param {CustomEvent} e rowAction 이벤트 (detail.action = "remove", detail.key = 회원 member_ID)
 * @returns {void}
 */
tableEl.addEventListener("rowAction", e => {
	if (e.detail?.action === "remove") removeMember(e.detail.key);
});
byId("search-input").addEventListener("input", onSearch);
render();
