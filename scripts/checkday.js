// 파일 용도: 체크데이 상담지 시작점 — 날짜 표기 · 초기화 오케스트레이션 (checkday_1·check-doc-new 공용)
// check-doc-new.html?memberID= 로 열리면 회원을 선택·프리필한다 (checkday_1은 무영향).
// 저장(#m-member 존재 시)은 collectPayload→recordStore→조회 화면 이동으로 기록을 신규 생성한다.
// DEPENDS: STR, UI, STATE, evals(evaluation), resetFeedbacks(feedback), renderBasicFunctionCards/updateTotal(evaluation)
import { STR } from "./utils-string.js";
import { UI } from "./UI.js";
import { DOT_COUNT } from "./constants.js";
import { STATE } from "./states.js";
import { memberStore } from "./member-store.js";
import { recordStore } from "./record-store.js";
import { collectPayload } from "./check-form-payload.js";
import { setupCheckFormEvents } from "./check-form-events.js";
import { evals, renderBasicFunctionCards, updateTotal } from "./evaluation.js";
import { renderCheckMovementCards, resetFeedbacks } from "./feedback.js";
import { escapeHtml } from "./templates.js";
import { openReportModal, copyReportToClipboard } from "./report.js";
import "./components/app-header.js";

// ── 날짜 ──
UI.setText("date-badge", STR.today());

// ── 회원 이름 자동완성 및 트레이너 자동 기입 — #m-member(회원 이름 입력+datalist)가 있는 화면(check-doc-new)에서만 동작 ──
// checkday_1은 #m-member가 없으므로 이 블록은 무영향이다.
const memberId = Number(new URLSearchParams(window.location.search).get("memberID")) || 0;
const memberInput = UI.byId("m-member");
if (memberInput) {
	const members = memberStore.getState().members;
	// datalist에 등록 회원 이름 채우기 (자동완성 후보)
	UI.byId("member-list").innerHTML = members
		.map((m) => `<option value="${escapeHtml(m.name)}">`)
		.join("");
	// 입력한 이름과 일치하는 회원을 찾아 확정값(이름)·트레이너 자동 기입 (트레이너는 이후 수정 가능)
	const applyMemberByName = (name) => {
		const mem = members.find((m) => m.name === name.trim());
		if (!mem) return false;
		UI.byId("m-name").value = mem.name;
		UI.byId("m-trainer").value = mem.trainer || "";
		return true;
	};
	memberInput.addEventListener("input", () => {
		// 일치하는 회원이 없으면 이름은 입력값 그대로 두고 회원 미연결 상태로 둔다
		if (!applyMemberByName(memberInput.value)) {
			UI.byId("m-name").value = memberInput.value;
		}
	});
	// ?memberID= 진입 시 해당 회원으로 고정 (이름 입력 잠금)
	if (memberId) {
		const mem = members.find((m) => m.id === memberId);
		if (mem) {
			memberInput.value = mem.name;
			memberInput.setAttribute("readonly", "");
			UI.byId("m-name").value = mem.name;
			UI.byId("m-trainer").value = mem.trainer || "";
		}
	}
} else if (memberId) {
	// checkday_1 등 #m-member가 없는 화면의 기존 동작 유지 (null-safe)
	const member = memberStore.getState().members.find((m) => m.id === memberId);
	if (member) {
		const nameEl = UI.byId("m-name");
		const trainerEl = UI.byId("m-trainer");
		if (nameEl) nameEl.value = member.name;
		if (trainerEl) trainerEl.value = member.trainer || "";
	}
}

// ── 초기화 ──
function resetEntireForm() {
	if (!confirm("이 회원의 상담 내용을 모두 초기화할까요?")) return;
	document
		.querySelectorAll("input[type=text],input[type=number],textarea")
		.forEach((el) => (el.value = ""));
	document
		.querySelectorAll(".ctag,.fbtag,.goal-tag")
		.forEach((el) => el.classList.remove("on"));
	STATE.reset();
	evals.forEach((_, i) => {
		UI.byId(`sv-${i}`).textContent = "0";
		for (let j = 0; j < DOT_COUNT; j++)
			UI.byId(`dot-${i}-${j}`).classList.remove("on");
	});
	[
		"tag-w",
		"tag-m",
		"tag-fat",
		"tag-bmi",
		"tag-bfp",
		"tag-bmr",
		"tag-vis",
		"vo2-result",
	].forEach((id) => {
		const el = UI.byId(id);
		if (el)
			el.innerHTML =
				el.tagName === "DIV" && el.id === "vo2-result"
					? ((el.style.display = "none"), "")
					: "";
	});
	// 피드백 초기화 후 재빌드
	resetFeedbacks();
	updateTotal();
}

// ── 이벤트 위임 — 인라인 onclick·window 오염 없이 정적·동적 요소를 한 루트에서 처리 ──
// 정적 액션 버튼 (data-action)
UI.delegate(document, "click", "[data-action]", (e, el) => {
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
			UI.byId("overlay").classList.remove("open");
			break;
		case "save":
			saveRecord();
			break;
	}
});

/**
 * 체크기록 신규 저장 후 조회 화면으로 이동 (check-doc-new의 저장 버튼)
 * 폼을 payload로 직렬화하고, 선택한 회원(memberId)과 오늘 날짜를 묶어 recordStore에 추가한다.
 */
function saveRecord() {
	const payload = collectPayload();
	// 회원 이름(자동완성 입력)을 회원 id로 해석 — 등록 회원 이름과 일치해야 저장한다
	const name = (UI.byId("m-member")?.value || "").trim();
	const matched = memberStore.getState().members.find((m) => m.name === name);
	if (!matched) {
		alert("등록된 회원 이름을 입력하거나 선택해 주세요.");
		return;
	}
	const recMemberId = matched.id;
	const recId = recordStore.getState().nextId;
	recordStore.setState((prev) => ({
		...prev,
		records: [
			...prev.records,
			{ id: recId, memberId: recMemberId, date: STR.today(), payload },
		],
		nextId: prev.nextId + 1,
	}));
	window.location.href = `check-doc-view.html?docID=${recId}`;
}
// 목표·체크·점수·피드백·인바디/VO₂ 위임은 checkday·편집 화면이 공유하는 check-form-events로 처리
setupCheckFormEvents();
// 결과 모달 배경(overlay 자신) 클릭 시 닫기
UI.delegate(document, "click", "#overlay", (e) => {
	if (e.target.id === "overlay") e.target.classList.remove("open");
});

// ── 시작 ──
renderBasicFunctionCards();
renderCheckMovementCards();
updateTotal();