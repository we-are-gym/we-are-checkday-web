// 파일 용도: 체크데이 상담지 시작점 — 날짜 표기 · 초기화 오케스트레이션 (checkday_1·2 공용)
// DEPENDS: STR, UI, STATE, evals(evaluation), resetFeedbacks(feedback), buildEvals/updateTotal(evaluation)

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
		for (let j = 0; j < 4; j++)
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

// ── 시작 ──
buildEvals();
buildFeedbacks();
updateTotal();