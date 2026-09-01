// 파일 용도: 세션 리포트 데이터 수집 — 폼 DOM·평가 상태에서 결과 요약에 필요한 값만 읽어 반환 (checkday 공용)
// 기법: 순수 수집 함수 — DOM 읽기만 담당하고 조립(HTML·텍스트)은 report-template.js에 위임한다.
// 사용: report-template.js가 openModal/copyToClipboard에서 collectReportData()로 데이터를 받아 쓴다.
import { InbodyData } from "@gym/inbody-data.js";
import { byId } from "@tools/utils-dom.js";
import { getEvals, getMax, getScore, getTotal } from "./evaluation.js";
import { collectCheckMovementData } from "./feedback.js";

/**
 * 폼에서 인바디 입력값을 읽어 묶음으로 반환
 * @returns {InbodyData} 인바디 입력 문자열 묶음
 */
export function collectIbData() {
	return new InbodyData({
		w: byId("ib-w").value,
		m: byId("ib-m").value,
		fat: byId("ib-fat").value,
		bmi: byId("ib-bmi").value,
		bfp: byId("ib-bfp").value,
		bmr: byId("ib-bmr").value,
		vis: byId("ib-vis").value,
	});
}

/**
 * 선택된 목표 태그를 공백 구분 문자열로 반환
 * @returns {string} 선택된 목표 텍스트들 (공백 구분, 없으면 빈 문자열)
 */
export function collectSelectedGoals() {
	return [...document.querySelectorAll(".goal-tag.on")].map(el => el.textContent).join(" ");
}

/**
 * 평가 항목별 점수·체크·메모를 폼에서 읽어 반환
 * @returns {Array<{ name: string, score: number, checked: string[], memo: string }>} 평가 항목 원시 데이터
 */
export function collectEvalItems() {
	const evalCards = document.querySelectorAll("#eval-cards .eval-item");
	return getEvals().map((e, i) => {
		const checked = [...evalCards[i].querySelectorAll(".ctag.on")].map(el => el.textContent);
		const memo = evalCards[i].querySelector(".eval-memo").value;
		return { name: e.name, score: getScore(i), checked, memo };
	});
}

/**
 * 세션 리포트 데이터 전체 수집 — 폼 DOM과 평가 상태를 읽어 템플릿에 넘길 묶음을 만든다.
 * @returns {{
 *   name: string, session: string, tot: number, max: number,
 *   ib: InbodyData, ibC: string, goals: string, gMemo: string, consult: string,
 *   evalItems: Array<{ name: string, score: number, checked: string[], memo: string }>,
 *   feedbacks: Array<{ name: string, checked: string[], memo: string }>
 * }} 수집된 리포트 데이터
 */
export function collectReportData() {
	return {
		name: (byId("m-name") || byId("m-member"))?.value || "(미입력)",
		session: byId("m-session").value,
		tot: getTotal(),
		max: getMax(),
		ib: collectIbData(),
		ibC: byId("ib-comment").value,
		goals: collectSelectedGoals(),
		gMemo: byId("goal-memo").value,
		consult: byId("consult-memo").value,
		evalItems: collectEvalItems(),
		feedbacks: collectCheckMovementData(),
	};
}
