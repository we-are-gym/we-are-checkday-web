// 파일 용도: 인바디 관련 로직 — 수치→상태 태그 분류·태그 갱신 (checkday 공용)
// 기법: DOM 조회는 utils-dom.byId 공용 헬퍼로 위임 (공용 헬퍼 사용 — 직접 getElementById 미사용)
import { byId } from "@base/utils-dom.js";

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
 * 인바디 수치 키별 상태 임계값 (max 오름차순) — 조회·작성/편집 화면이 같은 분류 기준을 공유한다.
 * 모든 키를 분류하는 것은 아니며, 임계가 있는 키만 담는다.
 * @type {Record<string, Array<{ max: number, label: string, bg: string, fg: string }>>}
 */
export const INBODY_RANGES = {
	m: [
		{ max: 18.4, label: "낮음", bg: "var(--red-bg)", fg: "var(--red-fg)" },
		{ max: 23.4, label: "정상", bg: "var(--success-bg)", fg: "var(--success-fg)" },
		{ max: 999, label: "높음", bg: "var(--blue-bg)", fg: "var(--blue-fg)" },
	],
	bfp: [
		{ max: 17, label: "낮음", bg: "var(--blue-bg)", fg: "var(--blue-fg)" },
		{ max: 27, label: "정상", bg: "var(--success-bg)", fg: "var(--success-fg)" },
		{ max: 32, label: "경계", bg: "var(--orange-bg)", fg: "var(--orange-fg)" },
		{ max: 999, label: "비만", bg: "var(--red-bg)", fg: "var(--red-fg)" },
	],
	bmi: [
		{ max: 18.4, label: "저체중", bg: "var(--blue-bg)", fg: "var(--blue-fg)" },
		{ max: 22.9, label: "정상", bg: "var(--success-bg)", fg: "var(--success-fg)" },
		{ max: 24.9, label: "과체중", bg: "var(--orange-bg)", fg: "var(--orange-fg)" },
		{ max: 999, label: "비만", bg: "var(--red-bg)", fg: "var(--red-fg)" },
	],
	fat: [
		{ max: 12.9, label: "낮음", bg: "var(--blue-bg)", fg: "var(--blue-fg)" },
		{ max: 20.9, label: "정상", bg: "var(--success-bg)", fg: "var(--success-fg)" },
		{ max: 999, label: "높음", bg: "var(--red-bg)", fg: "var(--red-fg)" },
	],
	vis: [
		{ max: 9, label: "정상", bg: "var(--success-bg)", fg: "var(--success-fg)" },
		{ max: 14, label: "경계", bg: "var(--orange-bg)", fg: "var(--orange-fg)" },
		{ max: 999, label: "위험", bg: "var(--red-bg)", fg: "var(--red-fg)" },
	],
};

/**
 * 인디수치 1건(key)의 상태 태그 HTML — 분류 기준이 없거나 빈값·비수치면 빈 문자열을 돌려준다.
 * @param {string} kind 인디 키 (예: "m", "bfp", "bmi", "fat", "vis")
 * @param {string|number} value 수치
 * @returns {string} 상태 태그 HTML (분류 불가 시 "")
 */
export function inbodyTagFor(kind, value) {
	const ranges = INBODY_RANGES[kind];
	if (!ranges) return "";
	const n = parseFloat(value);
	if (isNaN(n)) return "";
	return generateInbodyTags(n, ranges);
}

/**
 * 인바디 입력값 읽어 태그 갱신, 총점 재계산 트리거
 * 체중(tag-w)·기초대사량(tag-bmr)은 분류가 없어 항상 빈 태그로 둔다.
 * @returns {void}
 */
export function updateInbodyTags() {
	renderTag("ib-m", "tag-m", INBODY_RANGES.m);
	renderTag("ib-bfp", "tag-bfp", INBODY_RANGES.bfp);
	renderTag("ib-bmi", "tag-bmi", INBODY_RANGES.bmi);
	renderTag("ib-fat", "tag-fat", INBODY_RANGES.fat);
	byId("tag-w").innerHTML = "";
	byId("tag-bmr").innerHTML = "";

	// 내장지방은 INBODY_RANGES.vis 를 쓰되 화면마다 라벨 접두어(수치 포함 뜻)를 붙인다
	const n = parseFloat(byId("ib-vis").value);
	if (!isNaN(n)) {
		const r =
			INBODY_RANGES.vis.find((x) => n <= x.max) ||
			INBODY_RANGES.vis[INBODY_RANGES.vis.length - 1];
		byId("tag-vis").innerHTML =
			`<span class="ib-tag" style="background:${r.bg};color:${r.fg}">내장지방 ${r.label}</span>`;
	} else {
		byId("tag-vis").innerHTML = "";
	}
}