// 파일 용도: 체크기록 작성 화면(check-doc-new.html) 전용 진입점 — 베이직 펑션 5항목 × 3점 = 15점 만점
// 회원 선택은 #m-member(이름 입력 + datalist) 1개로 통합하고(기존 #m-name 읽기전용 상자는 제거),
// 회차는 선택 회원의 기존 체크기록 수 + 1로 자동 계산하여 "N회차" 형식으로 #m-session(읽기전용)에 채운다.
// 상담일(#m-date)은 기본적으로 오늘(todayISO)이고, 저장 시 기록의 date로 사용한다.
// 저장 시 payload.session은 #m-session 값을 그대로 기록한다.
// DEPENDS: todayISO(utils-string), byId·delegate(UI), configureEvaluation/renderBasicFunctionCards/updateTotal(evaluation),
//          setupCheckFormEvents/resetCheckForm(check-form-events), collectPayload(check-form-payload),
//          renderCheckMovementCards(feedback), sessionReport(session-report)
import "@base/components/app-header.js";
import { escapeHtml } from "@base/templates.js";
import { byId, delegate, dismissOnOverlayClick } from "@base/UI.js";
import { todayISO } from "@base/utils-string.js";
import { getNumberParam } from "@base/utils-url.js";
import { ASSESSMENT_ITEMS_BASIC5 } from "@check-doc/assessment-data.js";
import {
	resetCheckForm,
	setupCheckFormEvents,
} from "@check-doc/check-form-events.js";
import { collectPayload } from "@check-doc/check-form-payload.js";
import {
	configureEvaluation,
	renderBasicFunctionCards,
	updateTotal,
} from "@check-doc/evaluation.js";
import { renderCheckMovementCards } from "@check-doc/feedback.js";
import { recordStore } from "@check-doc/record-store.js";
import { getRecordCountsByMember } from "@check-doc/record-utils.js";
import { sessionReport } from "@check-doc/session-report.js";
import { addMember, memberStore } from "@member/member-store.js";
import {
	getMemberById,
	getMemberByName,
} from "@member/member-utils.js";

// ── 날짜 ──
// 상담일(date picker) 기본값 = 오늘 (기록 date는 YYYY-MM-DD 형식으로 저장)
byId("m-date").value = todayISO();

// ── 평가 구성: 베이직 펑션 5항목 × 3점 = 15점 만점 (카드 렌더 전에 설정) ──
configureEvaluation({
	items: ASSESSMENT_ITEMS_BASIC5,
	max: ASSESSMENT_ITEMS_BASIC5.length * 3,
});

// ── 회원 선택·트레이너 기입·회차 자동 계산 ──
const memberId = getNumberParam("memberID");
// 헤더 브레드크럼은 HTML의 crumb-path 속성(홈 > 체크기록 작성)으로 고정 표시

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
	const count =
		getRecordCountsByMember(recordStore.getState().records).get(mem.id) ||
		0;
	sessionInput.value = `${count + 1}회차`;
}

// 입력한 이름과 일치하는 회원을 찾아 트레이너·회차 자동 기입 (회차는 읽기전용, 트레이너는 이후 수정 가능)
memberInput.addEventListener("input", () => {
	const mem = getMemberByName(members, memberInput.value.trim());
	if (mem) applyMember(mem);
});

// ?memberID= 진입 시 해당 회원으로 고정 (이름 입력 잠금) 후 자동 기입
if (memberId) {
	const mem = getMemberById(members, memberId);
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
		case "save":
			saveRecord();
			break;
	}
});

/**
 * 체크기록 신규 저장 후 조회 화면으로 이동
 * 폼을 payload로 직렬화하고, 선택한 회원(memberId)과 오늘 날짜를 묶어 recordStore에 추가한다.
 * 이름이 등록 회원과 일치하지 않으면 회원을 자동 등록(성별·목표·트레이너는 기본값)한 뒤 기록을 생성한다.
 * @returns {void}
 */
function saveRecord() {
	const payload = collectPayload();
	// 회원 이름(자동완성 입력)을 회원 id로 해석 — 미등록 이름이면 자동 등록한다
	const name = (memberInput.value || "").trim();
	if (!name) {
		alert("회원 이름을 입력해 주세요.");
		return;
	}
	const matched = getMemberByName(members, name);
	const memberId = matched
		? matched.id
		: addMember({ name, gender: "", goal: "일반", trainer: "" });
	const recId = recordStore.getState().nextId;
	recordStore.setState((prev) => ({
		...prev,
		records: [
			...prev.records,
			{
				id: recId,
				memberId,
				date: byId("m-date").value || todayISO(),
				payload,
			},
		],
		nextId: prev.nextId + 1,
	}));
	window.location.href = `check-doc-view.html?docID=${recId}`;
}

// 목표·체크·점수·피드백·인바디/VO₂ 위임은 checkday·편집 화면이 공유하는 check-form-events로 처리
setupCheckFormEvents();
// 결과 모달 배경(overlay 자신) 클릭 시 닫기 — 공용 헬퍼
dismissOnOverlayClick();

// ── 시작 ──
renderBasicFunctionCards();
renderCheckMovementCards();
updateTotal();
