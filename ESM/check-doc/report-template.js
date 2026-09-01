// 파일 용도: 세션 리포트 템플릿 — 수집된 데이터로 결과 요약 HTML·클립보드 텍스트를 조립 (checkday 공용)
// 기법: 순수 조립 함수(formatEvalLine·formatFbLine·buildReportHTML·buildReportText) + 세션 리포트 API(SessionReport)
// 사용: check-form-new·checkday 진입점이 sessionReport.openModal()/copyToClipboard()를 호출한다. 데이터 수집은 report-collect.js가 담당한다.
import { byId } from "@tools/utils-dom.js";
import { collectReportData } from "./report-collect.js";

/**
 * 평가 줄: "이름: N점 [체크] / 메모" (선택 요소만 포함, prefix는 줄 앞 들여쓰기)
 * @param {{ name: string, score: number, checked: string[], memo: string }} item 평가 항목 데이터
 * @param {string} [prefix] 줄 앞 들여쓰기
 * @returns {string} 포맷된 평가 줄
 */
function formatEvalLine(item, prefix = "") {
	let s = `${item.name}: ${item.score}점`;
	if (item.checked.length) s += ` [${item.checked.join(", ")}]`;
	if (item.memo) s += ` / ${item.memo}`;
	return `${prefix}${s}`;
}

/**
 * 피드백 줄: "동작명 → 항목1, 항목2 / 메모" (prefix는 줄 앞 들여쓰기)
 * @param {{ name: string, checked: string[], memo: string }} fb 피드백 데이터
 * @param {string} [prefix] 줄 앞 들여쓰기
 * @returns {string} 포맷된 피드백 줄
 */
function formatFbLine(fb, prefix = "") {
	return `${prefix}${fb.name}${fb.checked.length ? " → " + fb.checked.join(", ") : ""}${fb.memo ? " / " + fb.memo : ""}`;
}

/**
 * 결과 요약 HTML 조립 — 세션 리포트 모달 본문(#report-body)에 채울 문자열을 만든다.
 * @param {ReturnType<typeof import("./report-collect.js").collectReportData>} data 수집된 리포트 데이터
 * @returns {string} 모달 본문 HTML
 */
export function buildReportHTML(data) {
	const { name, session, tot, max, ib, ibC, goals, gMemo, consult, evalItems, feedbacks } = data;
	const evalLines = evalItems.map(item => formatEvalLine(item));
	const fbLines = feedbacks.map(fb => formatFbLine(fb));
	return `
    <div class="rline"><div class="rlabel">회원</div><div>${name} ${session}</div></div>
    <div class="rline"><div class="rlabel">인바디</div><div style="font-size:12px">
      체중 ${ib.w || "—"}kg · 골격근 ${ib.m || "—"}kg · 체지방 ${ib.fat || "—"}kg<br>
      BMI ${ib.bmi || "—"} · 체지방률 ${ib.bfp || "—"}% · BMR ${ib.bmr || "—"}kcal · 내장지방 ${ib.vis || "—"}
      ${ibC ? `<br><span style="color:var(--text2)">${ibC}</span>` : ""}
    </div></div>
    <div class="rline"><div class="rlabel">움직임 총점</div><div>${tot}/${max}점</div></div>
    ${evalLines.map(l => `<div class="rline"><div style="font-size:12px;color:var(--text2)">${l}</div></div>`).join("")}
    <div class="rline"><div class="rlabel">다음 목표</div><div>${goals || "미선택"}${gMemo ? `<br><span style="font-size:12px;color:var(--text2)">${gMemo}</span>` : ""}</div></div>
    ${fbLines.length ? `<div class="rline"><div class="rlabel">동작 피드백</div><div style="font-size:12px">${fbLines.join("<br>")}</div></div>` : ""}
    ${consult ? `<div class="rline"><div class="rlabel">상담 메모</div><div style="font-size:12px">${consult}</div></div>` : ""}`;
}

/**
 * 결과 요약 텍스트 줄 배열 조립 — 클립보드 복사용.
 * @param {ReturnType<typeof import("./report-collect.js").collectReportData>} data 수집된 리포트 데이터
 * @returns {string[]} 복사할 텍스트 줄 목록 (빈 줄 제거)
 */
export function buildReportText(data) {
	const { name, session, tot, max, ib, ibC, goals, gMemo, consult, evalItems, feedbacks } = data;
	const evalLines = evalItems.map(item => formatEvalLine(item, "  "));
	const fbLines = feedbacks.map(fb => formatFbLine(fb, "  "));
	return [
		`[체크데이] ${name} / ${session}`,
		`━ 인바디: 체중 ${ib.w || "—"}kg / 골격근 ${ib.m || "—"}kg / 체지방률 ${ib.bfp || "—"}% / BMI ${ib.bmi || "—"} / 내장지방 ${ib.vis || "—"}`,
		ibC ? `  코멘트: ${ibC}` : "",
		`━ 움직임 총점: ${tot}/${max}점`,
		...evalLines,
		`━ 다음 목표: ${goals || "미선택"}`,
		gMemo ? `  ${gMemo}` : "",
		fbLines.length ? `━ 동작 피드백:` : "",
		...fbLines,
		consult ? `━ 상담 메모: ${consult}` : "",
	].filter(l => l !== "");
}

/**
 * 세션 리포트 생성·복사 — 결과 요약을 모달로 보여주거나 클립보드 텍스트로 내보낸다.
 * 데이터 수집은 report-collect.js, 조립은 buildReportHTML/buildReportText에 위임한다.
 */
export class SessionReport {
	/** 결과 요약 HTML을 조립해 결과 모달 본문에 표시하고 오버레이를 연다
	 * @returns {void}
	 */
	openModal() {
		const data = collectReportData();
		byId("report-body").innerHTML = buildReportHTML(data);
		byId("overlay").classList.add("open");
	}

	/** 결과 요약을 텍스트로 조립해 클립보드에 복사하고 성공·실패를 안내한다
	 * @returns {void}
	 */
	copyToClipboard() {
		const data = collectReportData();
		const lines = buildReportText(data);
		navigator.clipboard
			.writeText(lines.join("\n"))
			.then(() => alert("복사되었습니다!"))
			.catch(() => alert("직접 선택해서 복사해 주세요."));
	}
}

/** 세션 리포트 단일 인스턴스 (checkday·check-doc-new 공용) */
export const sessionReport = new SessionReport();
