// 파일 용도: 체크기록 폼(상담지) 직렬화·프리필 공용 모듈 — check-doc-edit와 check-doc-new(저장)가 공유
// 기법: 폼 DOM→기록 payload, 기록 payload→폼 DOM 변환을 함수로 추출하여
//       편집·작성 화면에서 중복 직렬화 코드가 생기지 않게 한다.
//       (DOM 헬퍼 UI·document 쿼리에 의존하는 화면 로직 계층이다 — 순수 연산은 별도 모듈에서 담당한다.)
// 주의: `#goal-custom`(추가 목표 입력)은 본 앱의 어떤 화면에는 있고(check-doc-edit) 어떤 화면에는
//   없(check-doc-new)므로, 부재 시 빈 값으로 처리한다(null-safe).
import { UI } from "./UI.js";
import { STATE } from "./states.js";
import { evals } from "./evaluation.js";
import { DOT_COUNT } from "./constants.js";
import { updateInbodyTags } from "./inbody.js";
import { updateTotal } from "./evaluation.js";
import { appendCheckMovement } from "./feedback.js";

/** 인바디 입력 필드 id 목록 (payload.ib 키와 1:1) */
export const IB_IDS = ["w", "m", "fat", "bmi", "bfp", "bmr", "vis"];

/**
 * i번째 평가 항목의 점수 도트를 점수만큼 채운다 (0~DOT_COUNT)
 * @param {number} index 평가 항목 인덱스
 * @param {number} score 점수 (0~3)
 */
function paintDots(index, score) {
	for (let j = 0; j < DOT_COUNT; j++)
		UI.byId(`dot-${index}-${j}`).classList.toggle("on", j < score);
}

/**
 * 기록 payload를 현재 상담지 폼에 되돌려 채운다 (편집·조회 공용)
 * @param {import("./store.js").CheckRecord} rec 프리필할 기록
 */
export function prefillForm(rec) {
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
	const customEl = UI.byId("goal-custom");
	if (customEl) customEl.value = custom.join(", ");
	const goalMemoEl = UI.byId("goal-memo");
	if (goalMemoEl) goalMemoEl.value = p.goalMemo || "";

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

/**
 * 현재 상담지 폼을 기록 payload로 직렬화 (저장·편집 공용)
 * @returns {import("./store.js").CheckRecordPayload}
 */
export function collectPayload() {
	const evalData = evals.map((_, i) => {
		const sp = UI.byId(`sp-${i}`);
		return {
			checked: [...sp.querySelectorAll(".ctag.on")].map((el) => el.textContent),
			memo: (sp.querySelector(".eval-memo") || {}).value || "",
		};
	});
	const fixedTags = [...document.querySelectorAll(".goal-tag")];
	const customText = (() => {
		const el = UI.byId("goal-custom");
		return el ? el.value : "";
	})();
	const goals = [
		...fixedTags.filter((el) => el.classList.contains("on")).map((el) => el.textContent),
		...customText
			.split(",")
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