// 파일 용도: 인바디 관련 로직 — 수치→상태 태그 분류·태그 갱신 (checkday 공용)
// 기법: DOM 조회는 UI.byId 공용 헬퍼로 위임 (공용 헬퍼 사용 — 직접 getElementById 미사용)
import { byId } from "@base/UI.js";

/**
 * 인바디 수치→태그(정상/주의/위험) 분류 — 첫 임계값(asc max)보다 작거나 같으면 그 등급 태그를 반환한다.
 * @param {number} val 수치
 * @param {Array<{ max: number, label: string, bg: string, fg: string }>} ranges 임계값 오름차순 + 등급 메타
 * @returns {string} 상태 태그 HTML
 */
export function generateInbodyTags(val, ranges) {
	for (const r of ranges)
		if (val <= r.max)
			return `<span class="ib-tag" style="background:${r.bg};color:${r.fg}">${r.label}</span>`;
	const l = ranges[ranges.length - 1];
	return `<span class="ib-tag" style="background:${l.bg};color:${l.fg}">${l.label}</span>`;
}

/** 인바디 입력값(id)을 읽어 해당 상태 태그 요소(tag)에 분류 결과를 채운다.
 * @param {string} inputId 인바디 입력 요소 id (예: "ib-m")
 * @param {string} tagId 상태 태그 삽입 위치 id (예: "tag-m")
 * @param {Array<{ label: string, bg: string, fg: string, max: number }>} ranges 수치 임계값·라벨
 * @returns {void}
 */
function renderTag(inputId, tagId, ranges) {
	const v = parseFloat(byId(inputId).value);
	byId(tagId).innerHTML = isNaN(v)
		? ""
		: generateInbodyTags(v, ranges);
}

/**
 * 인바디 입력값 읽어 태그 갱신, 총점 재계산 트리거
 * 체중(tag-w)·기초대사량(tag-bmr)은 분류가 없어 항상 빈 태그로 둔다.
 * @returns {void}
 */
export function updateInbodyTags() {
	renderTag("ib-m", "tag-m", [
		{ max: 18.4, label: "낮음", bg: "var(--red-bg)", fg: "var(--red-fg)" },
		{ max: 23.4, label: "정상", bg: "var(--success-bg)", fg: "var(--success-fg)" },
		{ max: 999, label: "높음", bg: "var(--blue-bg)", fg: "var(--blue-fg)" },
	]);
	renderTag("ib-bfp", "tag-bfp", [
		{ max: 17, label: "낮음", bg: "var(--blue-bg)", fg: "var(--blue-fg)" },
		{ max: 27, label: "정상", bg: "var(--success-bg)", fg: "var(--success-fg)" },
		{ max: 32, label: "경계", bg: "var(--orange-bg)", fg: "var(--orange-fg)" },
		{ max: 999, label: "비만", bg: "var(--red-bg)", fg: "var(--red-fg)" },
	]);
	renderTag("ib-bmi", "tag-bmi", [
		{ max: 18.4, label: "저체중", bg: "var(--blue-bg)", fg: "var(--blue-fg)" },
		{ max: 22.9, label: "정상", bg: "var(--success-bg)", fg: "var(--success-fg)" },
		{ max: 24.9, label: "과체중", bg: "var(--orange-bg)", fg: "var(--orange-fg)" },
		{ max: 999, label: "비만", bg: "var(--red-bg)", fg: "var(--red-fg)" },
	]);
	renderTag("ib-fat", "tag-fat", [
		{ max: 12.9, label: "낮음", bg: "var(--blue-bg)", fg: "var(--blue-fg)" },
		{ max: 20.9, label: "정상", bg: "var(--success-bg)", fg: "var(--success-fg)" },
		{ max: 999, label: "높음", bg: "var(--red-bg)", fg: "var(--red-fg)" },
	]);
	byId("tag-w").innerHTML = "";
	byId("tag-bmr").innerHTML = "";

	// 내장지방은 고정 임계(9/14) 3등급 — 낮음(정상)·경계·위험 표기 (수치 포함)
	const vis = parseFloat(byId("ib-vis").value);
	if (!isNaN(vis)) {
		let vl, vb, vf;
		if (vis <= 9) {
			vl = "정상";
			vb = "var(--success-bg)";
			vf = "var(--success-fg)";
		} else if (vis <= 14) {
			vl = "경계";
			vb = "var(--orange-bg)";
			vf = "var(--orange-fg)";
		} else {
			vl = "위험";
			vb = "var(--red-bg)";
			vf = "var(--red-fg)";
		}
		byId("tag-vis").innerHTML =
			`<span class="ib-tag" style="background:${vb};color:${vf}">내장지방 ${vl}</span>`;
	} else {
		byId("tag-vis").innerHTML = "";
	}
}