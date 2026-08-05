// 파일 용도: 리포트 생성·복사 — 결과 요약 HTML 조립·클립보드 복사 (checkday 공용)
// DEPENDS: byId(UI), scoreState(states), evals(evaluation), collectCheckMovementData(feedback)
import { byId } from "@base/UI.js";
import { scoreState } from "@base/states.js";
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
/** 전체 움직임 총점 반환 (states의 단일 scoreState에 위임)
 * @returns {number} 전체 점수 합계
 */
export function getTotal() {
	return scoreState.getTotal();
}

/** 폼에서 인바디 입력값을 읽어 묶음으로 반환
 * @returns {import("@base/store.js").InbodyData} 인바디 입력 문자열 묶음
 */
function getIbData() {
	return {
		w: byId("ib-w").value,
		m: byId("ib-m").value,
		fat: byId("ib-fat").value,
		bmi: byId("ib-bmi").value,
		bfp: byId("ib-bfp").value,
		bmr: byId("ib-bmr").value,
		vis: byId("ib-vis").value,
	};
}

/** 선택된 목표 태그를 공백 구분 문자열로 반환
 * @returns {string} 선택된 목표 텍스트들 (공백 구분, 없으면 빈 문자열)
 */
function getSelectedGoals() {
	return [...document.querySelectorAll(".goal-tag.on")]
		.map((el) => el.textContent)
		.join(" ");
}

/** 평가 줄 배열 생성 (prefix는 각 줄 앞 들여쓰기)
 * @param {string} prefix 라인 앞 들여쓰기
 * @returns {string[]} 평가 줄 문자열 배열
 */
function getEvalLines(prefix) {
	const evalCards = document.querySelectorAll("#eval-cards .eval-item");
	return evals.map((e, i) => {
		const checked = [...evalCards[i].querySelectorAll(".ctag.on")].map(
			(el) => el.textContent,
		);
		const memo = evalCards[i].querySelector(".eval-memo").value;
		return formatEvalLine(e.name, scoreState.get(i), checked, memo, prefix);
	});
}

// ── 결과 보기 ──
/** 결과 요약 HTML을 조립해 결과 모달 본문에 표시하고 오버레이를 연다
 * @returns {void}
 */
export function openReportModal() {
	const name = (byId("m-name") || byId("m-member"))?.value || "(미입력)";
	const session = byId("m-session").value;
	const tot = getTotal();
	const ib = getIbData();
	const ibC = byId("ib-comment").value;
	const goals = getSelectedGoals();
	const gMemo = byId("goal-memo").value;
	const consult = byId("consult-memo").value;

	const evalLines = getEvalLines("");
	const fbLines = collectCheckMovementData().map((fb) => formatFbLine(fb));

	let html = `
    <div class="rline"><div class="rlabel">회원</div><div>${name} ${session}</div></div>
    <div class="rline"><div class="rlabel">인바디</div><div style="font-size:12px">
      체중 ${ib.w || "—"}kg · 골격근 ${ib.m || "—"}kg · 체지방 ${ib.fat || "—"}kg<br>
      BMI ${ib.bmi || "—"} · 체지방률 ${ib.bfp || "—"}% · BMR ${ib.bmr || "—"}kcal · 내장지방 ${ib.vis || "—"}
      ${ibC ? `<br><span style="color:var(--text2)">${ibC}</span>` : ""}
    </div></div>
    <div class="rline"><div class="rlabel">움직임 총점</div><div>${tot}/${scoreState.getMax()}점</div></div>
    ${evalLines.map((l) => `<div class="rline"><div style="font-size:12px;color:var(--text2)">${l}</div></div>`).join("")}
    <div class="rline"><div class="rlabel">다음 목표</div><div>${goals || "미선택"}${gMemo ? `<br><span style="font-size:12px;color:var(--text2)">${gMemo}</span>` : ""}</div></div>
    ${fbLines.length ? `<div class="rline"><div class="rlabel">동작 피드백</div><div style="font-size:12px">${fbLines.join("<br>")}</div></div>` : ""}
    ${consult ? `<div class="rline"><div class="rlabel">상담 메모</div><div style="font-size:12px">${consult}</div></div>` : ""}`;
	byId("report-body").innerHTML = html;
	byId("overlay").classList.add("open");
}

/** 결과 요약을 텍스트로 조립해 클립보드에 복사하고 성공·실패를 안내한다
 * @returns {void}
 */
export function copyReportToClipboard() {
	const name = (byId("m-name") || byId("m-member"))?.value || "(미입력)";
	const tot = getTotal();
	const ib = getIbData();
	const goals = getSelectedGoals();
	const evalLines = getEvalLines("  ");
	const fbLines = collectCheckMovementData().map((fb) => formatFbLine(fb, "  "));
	const lines = [
		`[체크데이] ${name} / ${byId("m-session").value}`,
		`━ 인바디: 체중 ${ib.w || "—"}kg / 골격근 ${ib.m || "—"}kg / 체지방률 ${ib.bfp || "—"}% / BMI ${ib.bmi || "—"} / 내장지방 ${ib.vis || "—"}`,
		byId("ib-comment").value
			? `  코멘트: ${byId("ib-comment").value}`
			: "",
		`━ 움직임 총점: ${tot}/${scoreState.getMax()}점`,
		...evalLines,
		`━ 다음 목표: ${goals || "미선택"}`,
		byId("goal-memo").value
			? `  ${byId("goal-memo").value}`
			: "",
		fbLines.length ? `━ 동작 피드백:` : "",
		...fbLines,
		byId("consult-memo").value
			? `━ 상담 메모: ${byId("consult-memo").value}`
			: "",
	].filter((l) => l !== "");
	navigator.clipboard
		.writeText(lines.join("\n"))
		.then(() => alert("복사되었습니다!"))
		.catch(() => alert("직접 선택해서 복사해 주세요."));
}