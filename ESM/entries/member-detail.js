// 파일 용도: 회원 상세 화면 진입점(member-detail.html) — memberID 파싱·로딩 오버레이·UI 이벤트 배선·초기 렌더링 트리거
// 기법: 조회·렌더 조합은 member-view에 위임하고, 이 파일은 화면 조립자(진입점) 역할만 한다.
//       분할 모듈: member-view(조회)·member-info-card(정보 카드)·charts(변화 차트)·checkdoc-compare(비교)·UI-tabs(탭)·export-image(내보내기)
import { deleteRecord, recordStore } from "@check-doc/record-store.js";
import { guardOnBfcache } from "@infra/auth.js";
import "@infra/components/app-header.js";
import { setupTabs } from "@infra/UI-tabs.js";
import { renderCompare } from "@member/checkdoc-compare.js";
import { memberStore } from "@member/member-store.js";
import { getRecords, goView, init, refreshRecords } from "@member/member-view.js";
import "@shared/components/toast/toast.js";
import { hideLoading, showLoading } from "@shared/components/toast/toast.js";
import { byId, delegate } from "@tools/utils-dom.js";
import { getUrlParam } from "@tools/utils-url.js";

/** ?memberID= 파라미터 (문자열 member_ID) */
const memberId = getUrlParam("memberID");

// 로딩 오버레이 — memberStore/recordStore의 loading 상태 구독
memberStore.subscribe(state => (state.loading ? showLoading() : hideLoading()));
recordStore.subscribe(state => (state.loading ? showLoading() : hideLoading()));

// 이벤트 1회 등록
delegate(document, "click", "[data-del-record]", async (e, el) => {
	e.stopPropagation();
	if (!confirm("체크기록을 삭제하시겠습니까?")) {
		return;
	}
	try {
		await deleteRecord(Number(el.dataset.delRecord));
		refreshRecords(memberId);
	} catch (err) {
		console.error("기록 삭제 실패:", err);
	}
});

// 기록 행 클릭/키보드 → 조회 화면 (삭제 버튼은 제외)
delegate(document, "click", ".record-row", (e, el) => {
	if (e.target.closest("[data-del-record]")) return;
	goView(el);
});
delegate(document, "keydown", ".record-row", (e, el) => {
	if ((e.key === "Enter" || e.key === " ") && !e.target.closest("[data-del-record]")) {
		e.preventDefault();
		goView(el);
	}
});

// 탭 전환 (role=tablist 규약 — aria-selected·tabindex·방향키 이동)
setupTabs({ panels: { records: "panel-records", compare: "panel-compare" } });

// 비교 셀렉터 변경 → 비교 테이블 재렌더
byId("cmp-cur").addEventListener("change", () => renderCompare(getRecords(memberId)));
byId("cmp-tgt").addEventListener("change", () => renderCompare(getRecords(memberId)));

guardOnBfcache(() => init(memberId)); // 읽기 전용 화면 — 복원 시 다시 읽어 최신 데이터 표시
init(memberId);
