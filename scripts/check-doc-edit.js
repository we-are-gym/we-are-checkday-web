// 파일 용도: 체크기록 편집 화면(check-doc-edit.html)
// ?docID= 기록을 불러와 기존 상담지 폼(renderBasicFunctionCards 재사용)에 프리필하고, 수정 내용을 기록 스토어에 저장한다.
import { UI } from "./UI.js";
import { recordStore } from "./record-store.js";
import { renderBasicFunctionCards, toggleBasicFunctionDetail, adjustScore, updateVO2Disp } from "./evaluation.js";
import { appendCheckMovement, appendCheckMovementItemRow } from "./feedback.js";
import { collectPayload, prefillForm } from "./check-form-payload.js";
import { updateInbodyTags } from "./inbody.js";
import "./components/app-header.js";

/** ?docID= 파라미터 */
const docId = Number(new URLSearchParams(window.location.search).get("docID")) || 0;

/** 편집 대상 기록 */
function getRecord() {
	return recordStore.getState().records.find((r) => r.id === docId);
}

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
function init() {
	const rec = getRecord();
	if (!rec) {
		UI.byId("eval-cards").innerHTML = '<p class="goal-empty">기록을 찾을 수 없습니다. 목록에서 다시 선택하세요.</p>';
		UI.byId("fb-cards").style.display = "none";
		UI.byId("btn-cancel").href = "members.html";
		UI.queryAll("[data-action]").forEach((el) => (el.style.display = "none"));
		return;
	}
	UI.byId("btn-cancel").href = `check-doc-view.html?docID=${docId}`;
	renderBasicFunctionCards();
	prefillForm(rec);
}

// 이벤트 위임 (checkday 공용 폼과 동일 패턴)
UI.delegate(document, "click", "[data-action]", (e, el) => {
	if (el.dataset.action === "reset") resetForm();
	else if (el.dataset.action === "save-edit") saveRecord();
});
UI.delegate(document, "click", ".goal-tag, .ctag", (e, el) => el.classList.toggle("on"));
UI.delegate(document, "click", ".expand-toggle", (e, el) => toggleBasicFunctionDetail(Number(el.dataset.i)));
UI.delegate(document, "click", "#eval-cards .score-btn", (e, el) =>
	adjustScore(Number(el.dataset.i), Number(el.dataset.delta)),
);
UI.delegate(document, "click", ".fb-del-btn", (e, el) => el.closest(".fb-item")?.remove());
UI.delegate(document, "click", ".add-check-btn", (e, el) => appendCheckMovementItemRow(el));
UI.delegate(document, "click", ".fb-check-del", (e, el) => el.closest(".fb-check-row")?.remove());
UI.delegate(document, "click", ".add-fb-btn", () => appendCheckMovement());
document.addEventListener("input", (e) => {
	const id = e.target.id;
	if (!id) return;
	if (id.startsWith("ib-")) updateInbodyTags();
	else if (id === "vo2-age" || id === "vo2-ht" || id === "vo2-wt" || id === "vo2-hr") updateVO2Disp();
});

init();