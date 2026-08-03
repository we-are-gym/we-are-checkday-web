// 파일 용도: 리포트 생성·복사 — 결과 요약 HTML 조립·클립보드 복사 (checkday 공용)
// DEPENDS: UI, STATE, evals(evaluation), collectCheckMovementData(feedback)
import { UI } from "./UI.js";
import { STATE } from "./states.js";
import { evals } from "./evaluation.js";
import { collectCheckMovementData } from "./feedback.js";

// ── 공용 포맷터 — 평가 줄·피드백 줄을 한 곳에서만 생성 ──
/** 평가 줄: "이름: N점 [체크] / 메모" (선택 요소만 포함, prefix는 줄 앞 들여쓰기) */
function formatEvalLine(name, score, checked, memo, prefix = "") {
	let s = `${name}: ${score}점`;
	if (checked.length) s += ` [${checked.join(", ")}]`;
	if (memo) s += ` / ${memo}`;
	return `${prefix}${s}`;
}

/** 피드백 줄: "동작명 → 항목1, 항목2 / 메모" (prefix는 줄 앞 들여쓰기) */
function formatFbLine(fb, prefix = "") {
	return `${prefix}${fb.name}${fb.checked.length ? " → " + fb.checked.join(", ") : ""}${fb.memo ? " / " + fb.memo : ""}`;
}

// ── 결과 보기 공용 헬퍼 ──
export function getTotal() {
	return STATE.getTotal();
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
		return formatEvalLine(e.name, STATE.get(i), checked, memo, prefix);
	});
}

// ── 결과 보기 ──
export function openReportModal() {
	const name = UI.byId("m-name").value || "(미입력)";
	const session = UI.byId("m-session").value;
	const tot = getTotal();
	const ib = getIbData();
	const ibC = UI.byId("ib-comment").value;
	const goals = getSelectedGoals();
	const gMemo = UI.byId("goal-memo").value;
	const consult = UI.byId("consult-memo").value;

	const evalLines = getEvalLines("");
	const fbLines = collectCheckMovementData().map((fb) => formatFbLine(fb));

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

export function copyReportToClipboard() {
	const name = UI.byId("m-name").value || "(미입력)";
	const tot = getTotal();
	const ib = getIbData();
	const goals = getSelectedGoals();
	const evalLines = getEvalLines("  ");
	const fbLines = collectCheckMovementData().map((fb) => formatFbLine(fb, "  "));
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