// 파일 용도: 체크기록 편집 화면(check-doc-edit.html)
// ?docID= 기록을 불러와 기존 상담지 폼(renderBasicFunctionCards 재사용)에 프리필하고, 수정 내용을 기록 스토어에 저장한다.
import { byId, delegate, queryAll } from "./UI.js";
import { getNumberParam } from "./utils-url.js";
import { recordStore } from "./record-store.js";
import { renderBasicFunctionCards } from "./evaluation.js";
import { collectPayload, prefillForm } from "./check-form-payload.js";
import { setupCheckFormEvents } from "./check-form-events.js";
import "./components/app-header.js";

/** ?docID= 파라미터 */
const docId = getNumberParam("docID");

/** 편집 대상 기록 */
function getRecord() {
	return recordStore.getState().records.find((r) => r.id === docId);
}

// 헤더 크럼(前화면)을 동적 값으로 설정 — 편집 대상 기록의 조회 화면
const header = document.querySelector("app-header");
if (header) header.setAttribute("back", `check-doc-view.html?docID=${docId}`);

/** 저장: 기록 payload 교체 후 조회 화면 이동 */
function saveRecord() {
	recordStore.setState((prev) => ({
		...prev,
		records: prev.records.map((r) => (r.id === docId ? { ...r, payload: collectPayload() } : r)),
	}));
	window.location.href = `check-doc-view.html?docID=${docId}`;
}

/** 초기화: 편집 내용을 저장 전 상태로 되돌림 */
function resetForm() {
	if (!confirm("편집 내용을 저장 전 상태로 되돌릴까요?")) return;
	prefillForm(getRecord());
}

// ── 시작 ──
/** 초기화: 편집 대상 기록을 불러와 평가 카드를 렌더링하고 폼을 프리필한다 */
function init() {
	const rec = getRecord();
	if (!rec) {
		byId("eval-cards").innerHTML = '<p class="goal-empty">기록을 찾을 수 없습니다. 목록에서 다시 선택하세요.</p>';
		byId("fb-cards").style.display = "none";
		byId("btn-cancel").href = "members.html";
		queryAll("[data-action]").forEach((el) => (el.style.display = "none"));
		return;
	}
	byId("btn-cancel").href = `check-doc-view.html?docID=${docId}`;
	renderBasicFunctionCards();
	prefillForm(rec);
}

// 목표·체크·점수·피드백·인바디/VO₂ 위임은 checkday·편집 화면이 공유하는 check-form-events로 처리
setupCheckFormEvents();
// [data-action] 화면별 액션(초기화·저장)은 편집 화면 고유 — 여기서 등록
delegate(document, "click", "[data-action]", (e, el) => {
	if (el.dataset.action === "reset") resetForm();
	else if (el.dataset.action === "save-edit") saveRecord();
});

init();