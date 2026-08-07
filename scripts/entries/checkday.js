// 파일 용도: 체크데이 상담지 시작점 — 날짜 표기 · 초기화 오케스트레이션 (checkday_1 전용, 레거시 8항목/24점 유지)
// 새 체크기록 작성(check-doc-new) 화면은 전용 진입점 scripts/check-form-new.js를 사용한다 (5항목/15점).
// ?memberID= 로 열리면 회원 이름·트레이너를 프리필한다 (checkday_1은 헤더·자동완성 없음).
// DEPENDS: today(utils-string), byId·delegate·setText(UI), getMemberById(member-utils),
//          renderBasicFunctionCards/updateTotal(evaluation),
//          setupCheckFormEvents/resetCodeForm(check-form-events), renderCheckMovementCards(feedback),
//          sessionReport(session-report)
import "@base/components/app-header.js";
import { byId, delegate, setText } from "@base/UI.js";
import { today } from "@base/utils-string.js";
import { getNumberParam } from "@base/utils-url.js";
import {
	resetCheckForm,
	setupCheckFormEvents,
} from "@check-doc/check-form-events.js";
import {
	renderBasicFunctionCards,
	updateTotal,
} from "@check-doc/evaluation.js";
import { renderCheckMovementCards } from "@check-doc/feedback.js";
import { sessionReport } from "@check-doc/session-report.js";
import { memberStore } from "@member/member-store.js";
import { getMemberById } from "@member/member-utils.js";

// ── 날짜 ──
setText("date-badge", today());

// ── 회원 정보 — ?memberID= 로 열릴 때만 이름·트레이너를 채운다 (null-safe) ──
const memberId = getNumberParam("memberID");
if (memberId) {
	const member = getMemberById(memberStore.getState().members, memberId);
	if (member) {
		const nameEl = byId("m-name");
		const trainerEl = byId("m-trainer");
		if (nameEl) nameEl.value = member.name;
		if (trainerEl) trainerEl.value = member.trainer || "";
	}
}

// ── 초기화 ──
/** 폼 전체를 초기 상태로 되돌린다 (확인 후 resetCheckForm 호출)
 * @returns {void}
 */
function resetEntireForm() {
	if (!confirm("이 회원의 상담 내용을 모두 초기화할까요?")) return;
	resetCheckForm();
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
// 결과 모달 배경(overlay 자신) 클릭 시 닫기
delegate(document, "click", "#overlay", (e) => {
	if (e.target.id === "overlay") e.target.classList.remove("open");
});

// ── 시작 ──
renderBasicFunctionCards();
renderCheckMovementCards();
updateTotal();
