// 파일 용도: 체크기록 편집 화면(check-doc-edit.html)
// ?docID= 기록을 불러와 기존 상담지 폼(renderBasicFunctionCards 재사용)에 프리필하고, 수정 내용을 기록 스토어에 저장한다.
import { UI } from "./UI.js";
import { recordStore } from "./record-store.js";
import { STATE } from "./states.js";
import { DOT_COUNT } from "./constants.js";
import { evals, renderBasicFunctionCards, toggleBasicFunctionDetail, adjustScore, updateVO2Disp, updateTotal } from "./evaluation.js";
import { appendCheckMovement, appendCheckMovementItemRow } from "./feedback.js";
import { updateInbodyTags } from "./inbody.js";
import "./components/app-header.js";

/** ?docID= 파라미터 */
const docId = Number(new URLSearchParams(window.location.search).get("docID")) || 0;

/** 편집 대상 기록 */
function getRecord() {
	return recordStore.getState().records.find((r) => r.id === docId);
}

/** 인바디 입력 필드 id 목록 (payload.ib 키와 1:1) */
const IB_IDS = ["w", "m", "fat", "bmi", "bfp", "bmr", "vis"];

/** 점수 도트 DOM 갱신 */
function paintDots(index, score) {
	for (let j = 0; j < DOT_COUNT; j++)
		UI.byId(`dot-${index}-${j}`).classList.toggle("on", j < score);
}

/** 기록 데이터 → 폼 프리필 */
function prefillForm(rec) {
	const p = rec.payload;
	UI.byId("m-name").value = p.name || "";
	UI.byId("m-session").value = p.session || "";
	UI.byId("m-trainer").value = p.trainer || "";

	// 인바디 + 코멘트
	IB_IDS.forEach((k) => (UI.byId(`ib-${k}`).value = p.ib?.[k] || ""));
	UI.byId("ib-comment").value = p.ibComment || "";
	updateInbodyTags();

	// 점수·체크 항목·메모
	(p.scores || []).forEach((score, i) => {
		STATE.set(i, score);
		UI.byId(`sv-${i}`).textContent = score;
		paintDots(i, score);
	});
	evals.forEach((_, i) => {
		const ed = (p.evalData || [])[i];
		if (!ed) return;
		const sp = UI.byId(`sp-${i}`);
		(ed.checked || []).forEach((text) => {
			const tag = [...sp.querySelectorAll(".ctag")].find((el) => el.textContent === text);
			if (tag) tag.classList.add("on");
		});
		const memo = sp.querySelector(".eval-memo");
		if (memo) memo.value = ed.memo || "";
	});

	// 목표 (고정 태그 + 추가 목표 입력)
	const fixed = [...document.querySelectorAll(".goal-tag")];
	fixed.forEach((el) => el.classList.remove("on"));
	(p.goals || []).forEach((g) => {
		const hit = fixed.find((el) => el.textContent === g);
		if (hit) hit.classList.add("on");
	});
	const custom = (p.goals || []).filter((g) => !fixed.some((el) => el.textContent === g));
	UI.byId("goal-custom").value = custom.join(", ");
	UI.byId("goal-memo").value = p.goalMemo || "";

	// 동작 피드백 (기록에 있는 카드만 재구성)
	UI.byId("fb-cards").innerHTML = "";
	(p.feedbacks || []).forEach((fb) => {
		appendCheckMovement({ name: fb.name, checks: (fb.checkItems || []).map((c) => c.text) });
		const card = UI.byId("fb-cards").lastElementChild;
		const rows = [...card.querySelectorAll(".fb-check-row")];
		(fb.checkItems || []).forEach((c, idx) => {
			const row = rows[idx];
			if (!row) return;
			row.querySelector("input[type=checkbox]").checked = c.checked;
		});
		const memo = card.querySelector(".eval-memo");
		if (memo) memo.value = fb.memo || "";
	});

	UI.byId("consult-memo").value = p.consultMemo || "";
	updateTotal();
}

/** 폼 → 기록 payload 직렬화 */
function collectPayload() {
	const evalData = evals.map((_, i) => {
		const sp = UI.byId(`sp-${i}`);
		return {
			checked: [...sp.querySelectorAll(".ctag.on")].map((el) => el.textContent),
			memo: (sp.querySelector(".eval-memo") || {}).value || "",
		};
	});
	const fixedTags = [...document.querySelectorAll(".goal-tag")];
	const goals = [
		...fixedTags.filter((el) => el.classList.contains("on")).map((el) => el.textContent),
		...UI.byId("goal-custom")
			.value.split(",")
			.map((s) => s.trim())
			.filter(Boolean),
	];
	const feedbacks = [...document.querySelectorAll("#fb-cards .fb-item")]
		.map((fb) => ({
			name: fb.querySelector(".fb-move-input").value,
			checkItems: [...fb.querySelectorAll(".fb-check-row")].map((row) => ({
				text: row.querySelector(".fb-check-input").value,
				checked: row.querySelector("input[type=checkbox]").checked,
			})),
			memo: (fb.querySelector(".eval-memo") || {}).value || "",
		}))
		.filter((fb) => fb.name || fb.checkItems.some((c) => c.text) || fb.memo);
	return {
		name: UI.byId("m-name").value,
		session: UI.byId("m-session").value,
		trainer: UI.byId("m-trainer").value,
		ib: Object.fromEntries(IB_IDS.map((k) => [k, UI.byId(`ib-${k}`).value])),
		ibComment: UI.byId("ib-comment").value,
		scores: evals.map((_, i) => STATE.get(i)),
		evalData,
		goals,
		goalMemo: UI.byId("goal-memo").value,
		feedbacks,
		consultMemo: UI.byId("consult-memo").value,
	};
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
