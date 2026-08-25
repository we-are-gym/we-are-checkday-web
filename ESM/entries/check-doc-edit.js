// 파일 용도: 체크기록 편집 화면(check-doc-edit.html)
// ?docID= 기록을 API에서 불러와 상담지 폼(renderBasicFunctionCards 재사용)에 프리필하고,
// 움직임 평가 항목 추가/삭제(만점 동적 계산) 후 수정 내용을 API에 저장한다.

import { ASSESSMENT_ITEMS_FULL, resolveRecordItems } from "@check-doc/assessment-data.js";
import { setupCheckFormEvents } from "@check-doc/check-form-events.js";
import { collectPayload, prefillEvalState, prefillForm } from "@check-doc/check-form-payload.js";
import { configureEvaluation, getEvals, renderBasicFunctionCards, updateTotal } from "@check-doc/evaluation.js";
import { fetchCheckdoc } from "@check-doc/record-rest.js";
import { normalizeCheckdoc, recordStore, updateRecord } from "@check-doc/record-store.js";
import { getRecordById } from "@check-doc/record-utils.js";
import { scoreState } from "@gym/basicFunction-store.js";
import { guardOnBfcache } from "@infra/auth.js";
import "@infra/components/app-header.js";
import { SCORE_MAX } from "@infra/constants.js";
import { escapeHtml } from "@infra/templates.js";
import { loadMembers } from "@member/member-store.js";
import "@shared/components/index.js";
import "@shared/components/toast/toast.js";
import { hideLoading, showLoading } from "@shared/components/toast/toast.js";
import { byId, delegate, dismissOnOverlayClick, queryAll } from "@tools/utils-dom.js";
import { getUrlParam } from "@tools/utils-url.js";

// bfcache 복원 갱신 콜백을 넘기지 않는다 — 프리필 재실행 시 미저장 폼 입력이 덮여쓰이기 때문
guardOnBfcache();

// 로딩 오버레이 — recordStore의 loading 상태 구독
recordStore.subscribe(state => (state.loading ? showLoading() : hideLoading()));

/** ?docID= 파라미터 (숫자 checkdoc_ID) */
const docId = Number(getUrlParam("docID"));

/** 편집 대상 기록 */
function getRecord() {
	return getRecordById(recordStore.getState().records, docId);
}

// 헤더 브레드크럼은 HTML의 crumb-path 속성(홈 > 회원 관리 > 체크기록 편집)으로 고정 표시

/** 저장: 기록 payload·상담일(date) 교체 후 조회 화면 이동 — 상담일은 #m-date에서 읽어 기록 레벨 date에 반영한다
 * @returns {Promise<void>}
 */
async function saveRecord() {
	try {
		const dateInput = byId("m-date");
		const rec = getRecord();
		if (!rec) {
			alert("편집 대상 기록을 찾을 수 없습니다.");
			return;
		}
		const date = dateInput ? dateInput.value || rec.date : rec.date;
		await updateRecord(docId, collectPayload(), { memberId: rec.memberId, date });
		window.location.href = `check-doc-view.html?docID=${docId}`;
	} catch (err) {
		console.error("체크기록 수정 실패:", err);
	}
}

/** 초기화: 편집 내용을 저장 전 상태로 되돌림 */
function resetForm() {
	if (!confirm("편집 내용을 저장 전 상태로 되돌릴까요?")) return;
	prefillForm(getRecord());
}

// ── 시작 ──
/** 초기화: 편집 대상 기록을 API에서 불러와 평가 카드를 렌더링하고 폼을 프리필한다
 * @returns {Promise<void>}
 */
async function init() {
	try {
		await loadMembers();
		const apiDoc = await fetchCheckdoc(docId);
		recordStore.setState(prev => ({
			...prev,
			records: [...prev.records.filter(r => r.id !== docId), normalizeCheckdoc(apiDoc)],
		}));
	} catch (err) {
		console.error("기록 로드 실패:", err);
		byId("eval-cards").innerHTML = '<p class="goal-empty">기록을 불러오지 못했습니다.</p>';
		byId("fb-cards").style.display = "none";
		byId("btn-cancel").href = "members.html";
		queryAll("[data-action]").forEach(el => (el.style.display = "none"));
		return;
	}

	const rec = getRecord();

	if (!rec) {
		byId("eval-cards").innerHTML = '<p class="goal-empty">기록을 찾을 수 없습니다. 목록에서 다시 선택하세요.</p>';
		byId("fb-cards").style.display = "none";
		byId("btn-cancel").href = "members.html";
		queryAll("[data-action]").forEach(el => (el.style.display = "none"));
		return;
	}

	const cancelURL = `check-doc-view.html?docID=${docId}`;
	byId("btn-cancel").href = cancelURL;

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
 * @param {number} [removedIndex] 삭제된 항목의 캡처 인덱스 — 제공 시 해당 캡처를 제거해 새 카드 수와 정렬을 맞춘다
 *   (제거하지 않으면 prefillEvalState가 없는 sv-N을 참조해 TypeError로 중단된다)
 * @returns {void}
 */
function rebuildEvalItems(nextItems, removedIndex) {
	// 재렌더로 사라지기 전에 현재 폼 상태를 캡처 (configureEvaluation은 점수를 0으로 초기화한다)
	const scores = getEvals().map((_, i) => scoreState.get(i));

	const evalData = getEvals().map((_, i) => {
		const sp = byId(`sp-${i}`);

		return {
			checked: [...sp.querySelectorAll(".ctag.on")].map(el => el.textContent),
			memo: (sp.querySelector(".eval-memo") || {}).value || "",
		};
	});

	if (removedIndex !== undefined) {
		scores.splice(removedIndex, 1);
		evalData.splice(removedIndex, 1);
	}

	configureEvaluation({
		items: nextItems,
		max: nextItems.length * SCORE_MAX,
	});

	byId("eval-cards").innerHTML = "";
	renderBasicFunctionCards();

	attachRemoveButtons();
	prefillEvalState(scores, evalData);
	updateTotal();
}

/** 평가 카드별 삭제 버튼을 붙인다 (재렌더 후 호출 — 인덱스는 부착 시점 기준) */
function attachRemoveButtons() {
	queryAll("#eval-cards .eval-item").forEach((card, i) => {
		const title = card.querySelector(".eval-name");
		if (!title || title.querySelector(".eval-remove")) return;
		const btn = document.createElement("button");
		btn.type = "button";
		btn.className = "eval-remove";
		btn.dataset.evalRemove = String(i);
		btn.textContent = "×";
		btn.title = "항목 삭제";
		title.appendChild(btn);
	});
}

/**
 * 현재 목록에 사용되지 않은 평가 항목 후보 — ASSESSMENT_ITEMS_FULL(공용 7 + VO₂) 중 아직 안 쓴 것만 반환한다.
 * @returns {Array<import("@check-doc/assessment-data.js").BasicFunctionItem>} 추가 후보 항목
 */
function availableEvalItems() {
	const usedNames = new Set(resolveRecordItems(getRecord().payload).map(item => item.name));
	return ASSESSMENT_ITEMS_FULL.filter(item => !usedNames.has(item.name));
}

/** 평가 항목 추가 — 자동 추가 대신 후보를 피커에 띄워 사용자가 골라 직접 선택하도록 한다 (전부 사용 시 안내) */
function addEvalItem() {
	const candidates = availableEvalItems();
	if (candidates.length === 0) {
		alert("추가할 수 있는 평가 항목이 없습니다.");
		return;
	}
	const overlay = byId("eval-picker-overlay");
	const list = byId("eval-picker-list");
	list.innerHTML = candidates
		.map((item, i) => `<button type="button" class="picker-item" data-picker-item="${i}">${escapeHtml(item.name)}</button>`)
		.join("");
	overlay.classList.add("open");
}

/** i번째 평가 항목 삭제 — 최소 1개는 남긴다 */
function removeEvalItem(i) {
	const current = resolveRecordItems(getRecord().payload);
	if (current.length <= 1) {
		alert("최소 1개의 평가 항목은 남겨야 합니다.");
		return;
	}
	const next = current.slice();
	next.splice(i, 1);
	rebuildEvalItems(next, i);
}

// 목표·체크·점수·피드백·인바디/VO₂ 위임은 checkday·편집 화면이 공유하는 check-form-events로 처리
setupCheckFormEvents();
// [data-action] 화멱별 액션(초기화·저장·피커 닫기)과 평가 항목 추가/삭제는 편집 화면 고유 — 여기서 등록
delegate(document, "click", "[data-action]", (e, el) => {
	switch (el.dataset.action) {
		case "reset":
			resetForm();
			break;
		case "save":
			saveRecord();
			break;
		case "close-picker":
			byId("eval-picker-overlay").classList.remove("open");
			break;
	}
});
byId("add-eval-btn").addEventListener("click", addEvalItem);
delegate(document, "click", "[data-eval-remove]", (e, el) => removeEvalItem(Number(el.dataset.evalRemove)));
// 피커에서 항목 선택 — 후보 목록을 다시 계산해 인덱스가 항상 최신 후보를 가리키게 한다
delegate(document, "click", "[data-picker-item]", (e, el) => {
	const index = Number(el.dataset.pickerItem);
	const candidates = availableEvalItems();
	const picked = candidates[index];
	if (!picked) return;
	const current = resolveRecordItems(getRecord().payload);
	rebuildEvalItems([...current, picked]);
	byId("eval-picker-overlay").classList.remove("open");
});
// 피커 배경(오버레이 자신) 클릭 시 닫기 — 공용 헬퍼
dismissOnOverlayClick("eval-picker-overlay");

init();
