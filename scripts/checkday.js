// 파일 용도: 체크데이 상담지 시작점 — 날짜 표기 · 초기화 오케스트레이션 (checkday_1·2 공용)
// DEPENDS: STR, UI, STATE, evals(evaluation), resetFeedbacks(feedback), renderBasicFunctionCards/updateTotal(evaluation)
import { STR } from "./utils-string.js";
import { UI } from "./UI.js";
import { DOT_COUNT } from "./constants.js";
import { STATE } from "./states.js";
import { evals, calcVo2, renderBasicFunctionCards, toggleBasicFunctionDetail, adj, updateTotal } from "./evaluation.js";
import { appendCheckMovementItemRow, appendCheckMovement, renderCheckMovementCards, resetFeedbacks } from "./feedback.js";
import { openReportModal, copyReportToClipboard } from "./report.js";
import { updateInbodyTags } from "./inbody.js";

// ── 날짜 ──
UI.setText("date-badge", STR.today());

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
	}
});
// 목표·체크 문구 태그 토글
UI.delegate(document, "click", ".goal-tag, .ctag", (e, el) => el.classList.toggle("on"));
// 평가 카드 펼침 (동적 생성 요소)
UI.delegate(document, "click", ".expand-toggle", (e, el) =>
	toggleBasicFunctionDetail(Number(el.dataset.i)),
);
// 평가 점수 증감 (동적 생성 요소)
UI.delegate(document, "click", "#eval-cards .score-btn", (e, el) =>
	adj(Number(el.dataset.i), Number(el.dataset.delta)),
);
// 동작 피드백 카드 CRUD (동적 생성 요소)
UI.delegate(document, "click", ".fb-del-btn", (e, el) => el.closest(".fb-item")?.remove());
UI.delegate(document, "click", ".add-check-btn", (e, el) => appendCheckMovementItemRow(el));
UI.delegate(document, "click", ".fb-check-del", (e, el) => el.closest(".fb-check-row")?.remove());
UI.delegate(document, "click", ".add-fb-btn", () => appendCheckMovement());
// 결과 모달 배경(overlay 자신) 클릭 시 닫기
UI.delegate(document, "click", "#overlay", (e) => {
	if (e.target.id === "overlay") e.target.classList.remove("open");
});

// ── input 위임 — 인바디 수치·VO₂ 입력 갱신 ──
document.addEventListener("input", (e) => {
	const id = e.target.id;
	if (!id) return;
	if (id.startsWith("ib-")) updateInbodyTags();
	else if (id === "vo2-age" || id === "vo2-ht" || id === "vo2-wt" || id === "vo2-hr")
		calcVo2();
});

// ── 시작 ──
renderBasicFunctionCards();
renderCheckMovementCards();
updateTotal();