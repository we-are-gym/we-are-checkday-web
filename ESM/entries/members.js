// 파일 용도: 회원 관리 화면(members.html) — API 기반 회원 목록·검색·제거·상세 이동
// 상태: memberStore·recordStore(공용 스토어, 관찰자 패턴) 구독, subscribe 콜백에서 member-table 컴포넌트를 재렌더링한다.
import { loadRecords, recordStore } from "@check-doc/record-store.js";
import { getRecordCountsByMember } from "@check-doc/record-utils.js";
import { guardOnBfcache } from "@infra/auth.js";
import "@infra/components/app-header.js";
import "@member/components/member-table.js";
import { removeMember as apiRemoveMember, loadMembers, memberStore } from "@member/member-store.js";
import { displayGender } from "@member/member-utils.js";
import "@shared/components/toast/toast.js";
import { hideLoading, showLoading } from "@shared/components/toast/toast.js";
import { byId } from "@tools/utils-dom.js";

// 로딩 오버레이 — memberStore/recordStore의 loading 상태 구독
memberStore.subscribe(state => (state.loading ? showLoading() : hideLoading()));
recordStore.subscribe(state => (state.loading ? showLoading() : hideLoading()));

/** 한 번에 표시할 회원 수 */
const PAGE_SIZE = 50;

/** 현재까지 표시한 회원 수 */
let displayCount = PAGE_SIZE;

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
		gender: displayGender(m.gender),
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
	const sliced = filtered.slice(0, displayCount);

	tableEl.rows = buildRows(sliced);
	tableEl.refresh();

	// "더 보기" 버튼 표시/숨김
	let loadMoreBtn = byId("load-more-btn");

	if (filtered.length > displayCount) {
		if (!loadMoreBtn) {
			loadMoreBtn = document.createElement("button");
			loadMoreBtn.id = "load-more-btn";
			loadMoreBtn.textContent = "더 보기";
			loadMoreBtn.className = "btn-load-more";
			loadMoreBtn.style.cssText =
				"width:100%;padding:.75rem;margin-top:.5rem;background:#f3f4f6;border:1px solid #d1d5db;border-radius:8px;font-size:14px;cursor:pointer;color:#374151;";

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
	if (loading && members.length === 0) {
		if (!skeletonEl) {
			skeletonEl = document.createElement("div");
			skeletonEl.id = "skeleton-placeholder";
			skeletonEl.className = "skeleton-placeholder";
			skeletonEl.style.cssText = "padding:1rem;display:flex;flex-direction:column;gap:.5rem;";
			for (let i = 0; i < 5; i++) {
				const row = document.createElement("div");
				row.style.cssText =
					"height:2.5rem;background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);background-size:200% 100%;animation:es-skeleton-shimmer 1.5s infinite;border-radius:6px;";
				skeletonEl.appendChild(row);
			}
			const style = document.createElement("style");
			style.textContent = "@keyframes es-skeleton-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}";
			skeletonEl.prepend(style);
			tableEl.parentNode?.insertBefore(skeletonEl, tableEl);
		}
		skeletonEl.style.display = "";
	} else if (skeletonEl) {
		skeletonEl.style.display = "none";
	}
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
			? `회원 ${member.name} 님을 삭제하시겠습니까?\n\n연결된 체크기록 ${recordCount}건도 함께 삭제합니다.`
			: `회원 ${member.name} 님을 삭제하시겠습니까?`;

	if (!confirm(prompt)) {
		return;
	}

	try {
		await apiRemoveMember(id);

		// 로컬 기록 목록에서도 해당 회원 기록 제거
		recordStore.setState(prev => ({
			...prev,
			records: prev.records.filter(r => r.memberId !== id),
		}));
	} catch (err) {
		console.error("회원 삭제 실패:", err);

		// 401은 request() 내부에서 goToLogin()이 이미 리다이렉트를 처리하므로 alert를 건너뛴다
		if (err?.status === 401) return;
		alert(`회원 삭제에 실패했습니다: ${err.message || "알 수 없는 오류"}`);
	}
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
			// 빈 목록 안내는 member-table 컴포넌트가 렌더링합니다
			tableEl.rows = [];
			tableEl.render?.();
		}),
		loadRecords().catch(err => console.error("체크기록 로드 실패:", err)),
	]);
}

// bfcache 복원 시 스토어를 다시 읽어 최신 데이터를 표시한다 (구독 render가 재렌더링)
guardOnBfcache(loadAll);
memberStore.subscribe(render);
recordStore.subscribe(render);
loadAll();

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
