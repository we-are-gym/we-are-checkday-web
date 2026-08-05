// 파일 용도: 체크기록 폼 공용 초기화 — 공용 마크업(인바디 그리드·목표 태그) 주입과
//        폼 조작 핸들러(목표/체크 태그 토글·평가 점수 증감·동작 피드백 CRUD·인바디/목표 실시간 갱신)를
//        한 곳으로 모아 checkday(작성)·check-doc-edit(편집) 화면이 똑같이 재사용한다.
// 기법: delegate(UI.js) 기반 이벤트 위임 — 인라인 onclick·window 오염 없이 정적·동적 요소를 한 루트에서 처리
// 주의: [data-action] 화면별 액션(reset/save 등)은 화면마다 다르므로 여기서 다루지 않고 각 진입점이 등록한다.
import { byId, delegate } from "@base/UI.js";
import { TPL } from "@base/templates.js";
import { DOT_COUNT } from "@base/constants.js";
import { scoreState } from "@base/states.js";
import { toggleBasicFunctionDetail, adjustScore, updateVO2Disp, evals, updateTotal } from "./evaluation.js";
import { updateInbodyTags } from "@base/inbody.js";
import { appendCheckMovement, appendCheckMovementItemRow, resetFeedbacks } from "./feedback.js";

/**
 * 두 화면이 공유하는 상담지 폼 이벤트 위임을 등록한다 (1회 호출).
 *
 * - 목표·체크 문구 태그 토글
 * - 평가 카드 펼침/점수 증감 (동적 생성 요소)
 * - 동작 피드백 카드 CRUD (동적 생성 요소)
 * - 인바디 수치·VO₂ 입력 실시간 갱신
 *
 * @returns {void}
 */
export function setupCheckFormEvents() {
	// 인바디 6셀·목표 태그 — 화면 HTML에는 빈 컨테이너(#ib-grid·#goal-tags)만 있고 공용 템플릿으로 채운다 (요소 id 보존)
	const ibGrid = byId("ib-grid");
	if (ibGrid) ibGrid.innerHTML = TPL.inbodyGrid();
	const goalTags = byId("goal-tags");
	if (goalTags) goalTags.innerHTML = TPL.goalTags();

	// 목표·체크 문구 태그 토글 (aria-pressed 동기화 + role=button 태그의 Enter/Space 키보드 대응)
	/**
	 * 목표·체크 문구 태그의 on 클래스를 토글하고 aria-pressed 속성을 동기화한다.
	 * @param {Element} el 토글할 태그 요소
	 * @returns {void}
	 */
	const toggleTag = (el) => {
		const on = el.classList.toggle("on");
		el.setAttribute("aria-pressed", String(on));
	};
	delegate(document, "click", ".goal-tag, .ctag", (e, el) => toggleTag(el));
	delegate(document, "keydown", ".goal-tag, .ctag", (e, el) => {
		if (e.key !== "Enter" && e.key !== " ") return;
		e.preventDefault();
		toggleTag(el);
	});
	// 평가 카드 펼침 (동적 생성 요소)
	delegate(document, "click", ".expand-toggle", (e, el) =>
		toggleBasicFunctionDetail(Number(el.dataset.i)),
	);
	// 평가 점수 증감 (동적 생성 요소)
	delegate(document, "click", "#eval-cards .score-btn", (e, el) =>
		adjustScore(Number(el.dataset.i), Number(el.dataset.delta)),
	);
	// 동작 피드백 카드 CRUD (동적 생성 요소)
	delegate(document, "click", ".fb-del-btn", (e, el) => el.closest(".fb-item")?.remove());
	delegate(document, "click", ".add-check-btn", (e, el) => appendCheckMovementItemRow(el));
	delegate(document, "click", ".fb-check-del", (e, el) => el.closest(".fb-check-row")?.remove());
	delegate(document, "click", ".add-fb-btn", () => appendCheckMovement());
	// input 위임 — 인바디 수치·VO₂ 입력 갱신
	document.addEventListener("input", (e) => {
		const id = e.target.id;
		if (!id) return;
		if (id.startsWith("ib-")) updateInbodyTags();
		else if (id === "vo2-age" || id === "vo2-ht" || id === "vo2-wt" || id === "vo2-hr")
			updateVO2Disp();
	});
}

/**
 * 상담지 폼 전체를 초기 상태로 되돌린다 (check-day·check-doc-new 공용).
 * 입력 필드·태그·점수 도트·인바디 태그·VO₂ 결과·피드백·총점을 모두 초기화한다.
 * @returns {void}
 */
export function resetCheckForm() {
	document
		.querySelectorAll("input[type=text],input[type=number],textarea")
		.forEach((el) => (el.value = ""));
	document
		.querySelectorAll(".ctag,.fbtag,.goal-tag")
		.forEach((el) => el.classList.remove("on"));
	scoreState.reset();
	evals.forEach((_, i) => {
		byId(`sv-${i}`).textContent = "0";
		for (let j = 0; j < DOT_COUNT; j++)
			byId(`dot-${i}-${j}`).classList.remove("on");
	});
	["tag-w", "tag-m", "tag-fat", "tag-bmi", "tag-bfp", "tag-bmr", "tag-vis", "vo2-result"].forEach((id) => {
		const el = byId(id);
		if (el)
			el.innerHTML =
				el.tagName === "DIV" && el.id === "vo2-result"
					? ((el.style.display = "none"), "")
					: "";
	});
	resetFeedbacks();
	updateTotal();
}