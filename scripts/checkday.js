// 파일 용도: 체크데이 상담지 시작점 — 날짜 표기 · 초기화 · 결과 보기(리포트) 오케스트레이션 (checkday_1·2 공용)
// DEPENDS: STR, UI, STATE, VAL, ARR, ASSESSMENT_ITEMS, evals(evaluation), feedbacks/feedbacks, getGradeMeta

// ── 날짜 ──
UI.setText("date-badge", STR.today());

// ── 보고용 헬퍼 ──
function getTotal() {
	return STATE.total();
}

function getIbData() {
	return {
		w: UI.byId("ib-w").value,
		m: UI.byId("ib-m").value,
		fat: UI.byId("ib-fat").value,
		bmi: UI.byId("ib-bmi").value,
		bfp: UI.byId("ib-bfp").value,
		bmr: UI.byId("ib-bmr").value,
		vis: UI.byId("ib-vis").value,
	};
}

function getSelectedGoals() {
	return [...document.querySelectorAll(".goal-tag.on")]
		.map((el) => el.textContent)
		.join(" ");
}

function getEvalLines(prefix) {
	const evalCards = document.querySelectorAll("#eval-cards .eval-item");
	return evals.map((e, i) => {
		const checked = [...evalCards[i].querySelectorAll(".ctag.on")].map(
			(el) => el.textContent,
		);
		const memo = evalCards[i].querySelector(".eval-memo").value;
		let s = `${prefix}${e.name}: ${STATE.get(i)}점`;
		if (checked.length) s += ` [${checked.join(", ")}]`;
		if (memo) s += ` / ${memo}`;
		return s;
	});
}

// ── 결과 보기 ──
function openReport() {
	const name = UI.byId("m-name").value || "(미입력)";
	const session = UI.byId("m-session").value;
	const tot = getTotal();
	const ib = getIbData();
	const ibC = UI.byId("ib-comment").value;
	const goals = getSelectedGoals();
	const gMemo = UI.byId("goal-memo").value;
	const consult = UI.byId("consult-memo").value;

	const evalLines = getEvalLines("");
	const fbData = getFbLines();
	const fbLines = fbData.map(
		(fb) =>
			`${fb.name}${fb.checked.length ? " → " + fb.checked.join(", ") : ""}${fb.memo ? " / " + fb.memo : ""}`,
	);

	let html = `
    <div class="rline"><div class="rlabel">회원</div><div>${name} ${session}</div></div>
    <div class="rline"><div class="rlabel">인바디</div><div style="font-size:12px">
      체중 ${ib.w || "—"}kg · 골격근 ${ib.m || "—"}kg · 체지방 ${ib.fat || "—"}kg<br>
      BMI ${ib.bmi || "—"} · 체지방률 ${ib.bfp || "—"}% · BMR ${ib.bmr || "—"}kcal · 내장지방 ${ib.vis || "—"}
      ${ibC ? `<br><span style="color:var(--text2)">${ibC}</span>` : ""}
    </div></div>
    <div class="rline"><div class="rlabel">움직임 총점</div><div>${tot}/24점</div></div>
    ${evalLines.map((l) => `<div class="rline"><div style="font-size:12px;color:var(--text2)">${l}</div></div>`).join("")}
    <div class="rline"><div class="rlabel">다음 목표</div><div>${goals || "미선택"}${gMemo ? `<br><span style="font-size:12px;color:var(--text2)">${gMemo}</span>` : ""}</div></div>
    ${fbLines.length ? `<div class="rline"><div class="rlabel">동작 피드백</div><div style="font-size:12px">${fbLines.join("<br>")}</div></div>` : ""}
    ${consult ? `<div class="rline"><div class="rlabel">상담 메모</div><div style="font-size:12px">${consult}</div></div>` : ""}`;
	UI.byId("report-body").innerHTML = html;
	UI.byId("overlay").classList.add("open");
}

function copyReport() {
	const name = UI.byId("m-name").value || "(미입력)";
	const tot = getTotal();
	const ib = getIbData();
	const goals = getSelectedGoals();
	const evalLines = getEvalLines("  ");
	const fbData = getFbLines();
	const fbLines = fbData.map(
		(fb) =>
			`  ${fb.name}${fb.checked.length ? " → " + fb.checked.join(", ") : ""}${fb.memo ? " / " + fb.memo : ""}`,
	);
	const lines = [
		`[체크데이] ${name} / ${UI.byId("m-session").value}`,
		`━ 인바디: 체중 ${ib.w || "—"}kg / 골격근 ${ib.m || "—"}kg / 체지방률 ${ib.bfp || "—"}% / BMI ${ib.bmi || "—"} / 내장지방 ${ib.vis || "—"}`,
		UI.byId("ib-comment").value
			? `  코멘트: ${UI.byId("ib-comment").value}`
			: "",
		`━ 움직임 총점: ${tot}/24점`,
		...evalLines,
		`━ 다음 목표: ${goals || "미선택"}`,
		UI.byId("goal-memo").value
			? `  ${UI.byId("goal-memo").value}`
			: "",
		fbLines.length ? `━ 동작 피드백:` : "",
		...fbLines,
		UI.byId("consult-memo").value
			? `━ 상담 메모: ${UI.byId("consult-memo").value}`
			: "",
	].filter((l) => l !== "");
	navigator.clipboard
		.writeText(lines.join("\n"))
		.then(() => alert("복사되었습니다!"))
		.catch(() => alert("직접 선택해서 복사해 주세요."));
}

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