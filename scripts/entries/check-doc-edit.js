// 파일 용도: 체크기록 편집 화면(check-doc-edit.html)
// ?docID= 기록을 불러와 상담지 폼(renderBasicFunctionCards 재사용)에 프리필하고, 움직임 평가 항목 추가/삭제(만점 동적 계산) 후
// 수정 내용을 기록 스토어에 저장한다.
import { byId, delegate, queryAll } from "@base/UI.js";
import { getNumberParam } from "@base/utils-url.js";
import { recordStore } from "@check-doc/record-store.js";
import { resolveRecordItems, ASSESSMENT_ITEMS_FULL } from "@check-doc/assessment-data.js";
import { configureEvaluation, evals, renderBasicFunctionCards, updateTotal } from "@check-doc/evaluation.js";
import { collectPayload, prefillEvalState, prefillForm } from "@check-doc/check-form-payload.js";
import { setupCheckFormEvents } from "@check-doc/check-form-events.js";
import { scoreState } from "@base/states.js";
import { SCORE_MAX } from "@base/constants.js";
import "@base/components/app-header.js";

/** ?docID= 파라미터 */
const docId = getNumberParam("docID");

/** 편집 대상 기록 */
function getRecord() {
	return recordStore.getState().records.find((r) => r.id === docId);
}

// 헤더 브레드크럼은 HTML의 crumb-path 속성(홈 > 회원 관리 > 체크기록 편집)으로 고정 표시

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
	// 기록의 항목 구성(payload.items 우선)에 맞춰 평가를 설정 — 5항목 15점·7항목 21점·레거시 8항목 24점 (카드 렌더 전 호출)
	const items = resolveRecordItems(rec.payload);
	configureEvaluation({ items, max: items.length * SCORE_MAX });
	renderBasicFunctionCards();
	attachRemoveButtons();
	prefillForm(rec);
	byId("eval-sec-sub").textContent = `${items.length}개 항목 · 각 0–3점`;
}

/**
 * 항목 목록을 교체해 평가 카드를 재렌더한다 — 현재 점수·체크·메모를 캡처해 복원하고 만점(항목 수 × 3점)을 동적 갱신한다.
 * @param {Array<{ name: string, desc: string, checks?: string[], vo2?: boolean }>} nextItems 새 항목 목록
 * @returns {void}
 */
function rebuildEvalItems(nextItems) {
	// 재렌더로 사라지기 전에 현재 폼 상태를 캡처 (configureEvaluation은 점수를 0으로 초기화한다)
	const scores = evals.map((_, i) => scoreState.get(i));
	const evalData = evals.map((_, i) => {
		const sp = byId(`sp-${i}`);
		return {
			checked: [...sp.querySelectorAll(".ctag.on")].map((el) => el.textContent),
			memo: (sp.querySelector(".eval-memo") || {}).value || "",
		};
	});
	configureEvaluation({ items: nextItems, max: nextItems.length * SCORE_MAX });
	byId("eval-cards").innerHTML = "";
	renderBasicFunctionCards();
	prefillEvalState(scores, evalData);
	attachRemoveButtons();
	byId("eval-sec-sub").textContent = `${nextItems.length}개 항목 · 각 0–3점`;
	updateTotal();
}

/** 평가 카드별 삭제 버튼을 붙인다 (재렌더 후 호출 — 인덱스는 부착 시점 기준) */
function attachRemoveButtons() {
	document.querySelectorAll("#eval-cards .eval-item").forEach((card, i) => {
		const btn = document.createElement("button");
		btn.type = "button";
		btn.className = "eval-remove";
		btn.dataset.evalRemove = String(i);
		btn.textContent = "✕";
		btn.setAttribute("aria-label", `평가 항목 ${i + 1} 삭제`);
		card.querySelector(".eval-top").appendChild(btn);
	});
}

/** 움직임 평가 항목 1개 추가 — 아직 사용하지 않은 항목을 목록 끝에 붙인다 (전부 사용 시 안내) */
function addEvalItem() {
	const used = new Set(evals.map((it) => it.name));
	const next = ASSESSMENT_ITEMS_FULL.find((it) => !used.has(it.name));
	if (!next) {
		alert("추가할 평가 항목이 없습니다. (전체 8개 항목 사용 중)");
		return;
	}
	rebuildEvalItems([...evals, next]);
}

/** i번째 평가 항목 삭제 — 최소 1개는 남긴다 */
function removeEvalItem(i) {
	if (evals.length <= 1) return;
	rebuildEvalItems(evals.filter((_, idx) => idx !== i));
}

// 목표·체크·점수·피드백·인바디/VO₂ 위임은 checkday·편집 화면이 공유하는 check-form-events로 처리
setupCheckFormEvents();
// [data-action] 화면별 액션(초기화·저장)과 평가 항목 추가/삭제는 편집 화면 고유 — 여기서 등록
delegate(document, "click", "[data-action]", (e, el) => {
	if (el.dataset.action === "reset") resetForm();
	else if (el.dataset.action === "save-edit") saveRecord();
});
byId("add-eval-btn").addEventListener("click", addEvalItem);
delegate(document, "click", "[data-eval-remove]", (e, el) => removeEvalItem(Number(el.dataset.evalRemove)));

init();