// 파일 용도: 체크기록 작성 화면(check-doc-new.html) 전용 진입점 — 베이직 펑션 5항목 × 3점 = 15점 만점
// 회원 선택은 #m-member(이름 입력 + datalist) 1개로 통합하고(기존 #m-name 읽기전용 상자는 제거),
// 회차는 선택 회원의 기존 체크기록 수 + 1로 자동 계산하여 "N회차" 형식으로 #m-session에 채운다.
// 저장 시 payload.session은 사용자가 수정할 수 있는 #m-session 값을 그대로 기록한다.
// DEPENDS: today(utils-string), byId·delegate·setText(UI), configureEvaluation/renderBasicFunctionCards/updateTotal(evaluation),
//          setupCheckFormEvents/resetCheckForm(check-form-events), collectPayload(check-form-payload),
//          renderCheckMovementCards(feedback), openReportModal/copyReportToClipboard(report)
import { today } from "@base/utils-string.js";
import { byId, delegate, setText } from "@base/UI.js";
import { getNumberParam } from "@base/utils-url.js";
import { memberStore } from "@member/member-store.js";
import { recordStore } from "@check-doc/record-store.js";
import { getRecordCountsByMember } from "@member/member-utils.js";
import { ASSESSMENT_ITEMS_BASIC5 } from "@check-doc/assessment-data.js";
import { collectPayload } from "@check-doc/check-form-payload.js";
import { setupCheckFormEvents, resetCheckForm } from "@check-doc/check-form-events.js";
import { configureEvaluation, renderBasicFunctionCards, updateTotal } from "@check-doc/evaluation.js";
import { renderCheckMovementCards } from "@check-doc/feedback.js";
import { openReportModal, copyReportToClipboard } from "@check-doc/report.js";
import { escapeHtml } from "@base/templates.js";
import "@base/components/app-header.js";

// ── 날짜 ──
setText("date-badge", today());

// ── 평가 구성: 베이직 펑션 5항목 × 3점 = 15점 만점 (카드 렌더 전에 설정) ──
configureEvaluation({
	items: ASSESSMENT_ITEMS_BASIC5,
	max: ASSESSMENT_ITEMS_BASIC5.length * 3,
});

// ── 회원 선택·트레이너 기입·회차 자동 계산 ──
const memberId = getNumberParam("memberID");
// 크럼(前화면) 동적 지정 — ?memberID= 로 진입하면 해당 회원 상세 화면으로 되돌아간다
const header = document.querySelector("app-header");
if (header && memberId) header.setAttribute("back", `member-detail.html?memberID=${memberId}`);

const members = memberStore.getState().members;
const memberInput = byId("m-member");
const sessionInput = byId("m-session");

// datalist에 등록 회원 이름 채우기 (자동완성 후보)
byId("member-list").innerHTML = members
	.map((m) => `<option value="${escapeHtml(m.name)}">`)
	.join("");

/**
 * 선택한 회원에 맞춰 트레이너·회차를 자동 기입한다 — 회차는 기존 체크기록 수 + 1 (예: 3건이면 "4회차")
 * @param {import("@base/store.js").Member} mem 확정된 회원
 * @returns {void}
 */
function applyMember(mem) {
	byId("m-trainer").value = mem.trainer || "";
	const count = getRecordCountsByMember(recordStore.getState().records).get(mem.id) || 0;
	sessionInput.value = `${count + 1}회차`;
}

// 입력한 이름과 일치하는 회원을 찾아 트레이너·회차 자동 기입 (회차·트레이너는 이후 수정 가능)
memberInput.addEventListener("input", () => {
	const mem = members.find((m) => m.name === memberInput.value.trim());
	if (mem) applyMember(mem);
});

// ?memberID= 진입 시 해당 회원으로 고정 (이름 입력 잠금) 후 자동 기입
if (memberId) {
	const mem = members.find((m) => m.id === memberId);
	if (mem) {
		memberInput.value = mem.name;
		memberInput.setAttribute("readonly", "");
		applyMember(mem);
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
// 정적 액션 버튼 (data-action)
delegate(document, "click", "[data-action]", (e, el) => {
	switch (el.dataset.action) {
		case "reset":
			resetEntireForm();
			break;
		case "report":
			openReportModal();
			break;
		case "print":
			window.print();
			break;
		case "copy":
			copyReportToClipboard();
			break;
		case "close-modal":
			byId("overlay").classList.remove("open");
			break;
		case "save":
			saveRecord();
			break;
	}
});

/**
 * 체크기록 신규 저장 후 조회 화면으로 이동
 * 폼을 payload로 직렬화하고, 선택한 회원(memberId)과 오늘 날짜를 묶어 recordStore에 추가한다.
 * @returns {void}
 */
function saveRecord() {
	const payload = collectPayload();
	// 회원 이름(자동완성 입력)을 회원 id로 해석 — 등록 회원 이름과 일치해야 저장한다
	const name = (memberInput.value || "").trim();
	const matched = members.find((m) => m.name === name);
	if (!matched) {
		alert("등록된 회원 이름을 입력하거나 선택해 주세요.");
		return;
	}
	const recId = recordStore.getState().nextId;
	recordStore.setState((prev) => ({
		...prev,
		records: [
			...prev.records,
			{ id: recId, memberId: matched.id, date: today(), payload },
		],
		nextId: prev.nextId + 1,
	}));
	window.location.href = `check-doc-view.html?docID=${recId}`;
}

// 목표·체크·점수·피드백·인바디/VO₂ 위임은 checkday·편집 화면이 공유하는 check-form-events로 처리
setupCheckFormEvents();
// 결과 모달 배경(overlay 자신) 클릭 시 닫기
delegate(document, "click", "#overlay", (e) => {
	if (e.target.id === "overlay") e.target.classList.remove("open");
});

// ── 시작 ──
renderBasicFunctionCards();
renderCheckMovementCards();
updateTotal();