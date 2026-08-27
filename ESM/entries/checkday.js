// 파일 용도: 체크데이 상담지 시작점 — 날짜 표기 · 초기화 오케스트레이션 (checkday_1 전용, 레거시 8항목/24점 유지)
// 새 체크기록 작성(check-doc-new) 화면은 전용 진입점 ESM/check-form-new.js를 사용한다 (5항목/15점).
// ?memberID= 로 열리면 회원 이름·트레이너를 프리필한다 (checkday_1은 헤더·자동완성 없음).
import { ASSESSMENT_ITEMS_FULL } from "@check-doc/assessment-data.js";
import { configureEvaluation, renderBasicFunctionCards, updateTotal } from "@check-doc/evaluation.js";
import { renderCheckMovementCards } from "@check-doc/feedback.js";
import { sessionReport } from "@check-doc/session-report.js";
import "@infra/components/app-header.js";
import { MOTION_TOTAL_MAX } from "@infra/constants.js";
import { loadMembers, memberStore } from "@member/member-store.js";
import { getMemberById } from "@member/member-utils.js";
import "@shared/components/index.js";
import "@shared/components/toast/toast.js";
import { hideLoading, showLoading } from "@shared/components/toast/toast.js";
import { byId, delegate, dismissOnOverlayClick, setText } from "@tools/utils-dom.js";
import { today } from "@tools/utils-string.js";
import { getUrlParam } from "@tools/utils-url.js";

// ── 평가 구성: 레거시 8항목·24점 — 각 진입점에서 명시적 init (모듈 레벨 init 금지) ──
configureEvaluation({ items: ASSESSMENT_ITEMS_FULL, max: MOTION_TOTAL_MAX });

// 로딩 오버레이 — memberStore의 loading 상태 구독
memberStore.subscribe(state => (state.loading ? showLoading() : hideLoading()));

// ── 날짜 ──
setText("date-badge", today());

/**
 * 페이지 초기화 — 회원 목록을 API에서 불러온 뒤 ?memberID= 프리필과 UI를 렌더링한다.
 * @returns {Promise<void>}
 */
async function init() {
	try {
		await loadMembers();
	} catch (err) {
		console.error("회원 목록 로드 실패:", err);
	}

	// ── 회원 정보 — ?memberID= 로 열릴 때만 이름·트레이너를 채운다 (null-safe) ──
	const memberId = getUrlParam("memberID");
	if (memberId) {
		const member = getMemberById(memberStore.getState().members, memberId);
		if (member) {
			const nameEl = byId("m-name");
			const trainerEl = byId("m-trainer");
			if (nameEl) nameEl.value = member.name;
			if (trainerEl) trainerEl.value = member.trainer || "";
		}
	}

	renderBasicFunctionCards();
	renderCheckMovementCards();
	updateTotal();
}

// ── 이벤트 위임 — 인라인 onclick·window 오염 없이 정적·동적 요소를 한 루트에서 처리 ──
// 정적 액션 버튼 (data-action) — checkday_1은 초기화·결과 보기·인쇄·복사만 제공 (저장 없음)
delegate(document, "click", "[data-action]", (e, el) => {
	switch (el.dataset.action) {
		case "reset":
			resetEntireForm();
			break;
		case "report":
			sessionReport.openModal();
			break;
		case "print":
			window.print();
			break;
		case "copy":
			sessionReport.copyToClipboard();
			break;
		case "close-modal":
			byId("overlay").classList.remove("open");
			break;
	}
});

// 목표·체크·점수·피드백·인바디/VO₂ 위임은 checkday·편집·작성 화면이 공유하는 check-form-events로 처리
setupCheckFormEvents();
// 결과 모달 배경(overlay 자신) 클릭 시 닫기 — 공용 헬퍼
dismissOnOverlayClick();

// ── 시작 ──
init();
