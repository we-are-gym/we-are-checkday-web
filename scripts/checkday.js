// 파일 용도: 체크데이 상담지 시작점 — 날짜 표기 · 초기화 오케스트레이션 (checkday_1·2 공용)
// DEPENDS: STR, UI, STATE, evals(evaluation), resetFeedbacks(feedback), buildEvals/updateTotal(evaluation)
import { STR } from "./utils-string.js";
import { UI } from "./UI.js";
import { DOT_COUNT } from "./constants.js";
import { STATE } from "./states.js";
import { evals, calcVo2, buildEvals, toggleExpand, adj, updateTotal } from "./evaluation.js";
import { addCheckToFb, addFbItem, buildFeedbacks, resetFeedbacks } from "./feedback.js";
import { openReport, copyReport } from "./report.js";
import { updIb } from "./inbody.js";

// ── 날짜 ──
UI.setText("date-badge", STR.today());

// ── 초기화 ──
function resetAll() {
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

// ── 인라인 핸들러는 전역 스코프에서 해석되므로 window에 노출 (ESM은 모듈 스코프) ──
window.calcVo2 = calcVo2;
window.adjustWrapper = adj;
window.adj = adj;
window.toggleExpand = toggleExpand;
window.updateTotal = updateTotal;
window.openReport = openReport;
window.copyReport = copyReport;
window.resetAll = resetAll;
window.updIb = updIb;
window.addFbItem = addFbItem;
window.addCheckToFb = addCheckToFb;

// ── 시작 ──
buildEvals();
buildFeedbacks();
updateTotal();