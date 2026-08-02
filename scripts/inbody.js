// 파일 용도: 인바디 관련 로직 — 수치→상태 태그 분류·태그 갱신 (checkday 공용)
// DEPENDS: UI (전역 DOM 헬퍼)

/**
 * 인바디 수치→태그(정상/주의/위험) 분류
 *
 * @param {number} val
 * @param {Array<any>} ranges
 *
 * @returns {string}
 */
function ibTag(val, ranges) {
	for (const r of ranges)
		if (val <= r.max)
			return `<span class="ib-tag" style="background:${r.bg};color:${r.fg}">${r.label}</span>`;
	const l = ranges[ranges.length - 1];
	return `<span class="ib-tag" style="background:${l.bg};color:${l.fg}">${l.label}</span>`;
}

/**
 * 인바디 입력값 읽어 태그 갱신, 총점 재계산 트리거
 */
function updIb() {
	const m = parseFloat(document.getElementById("ib-m").value);
	const bfp = parseFloat(document.getElementById("ib-bfp").value);
	const bmi = parseFloat(document.getElementById("ib-bmi").value);
	const fat = parseFloat(document.getElementById("ib-fat").value);
	const vis = parseFloat(document.getElementById("ib-vis").value);
	document.getElementById("tag-m").innerHTML = isNaN(m)
		? ""
		: ibTag(m, [
				{
					max: 18.4,
					label: "낮음",
					bg: "var(--red-bg)",
					fg: "var(--red-fg)",
				},
				{
					max: 23.4,
					label: "정상",
					bg: "var(--green-bg)",
					fg: "var(--green-fg)",
				},
				{
					max: 999,
					label: "높음",
					bg: "var(--blue-bg)",
					fg: "var(--blue-fg)",
				},
			]);
	document.getElementById("tag-bfp").innerHTML = isNaN(bfp)
		? ""
		: ibTag(bfp, [
				{
					max: 17,
					label: "낮음",
					bg: "var(--blue-bg)",
					fg: "var(--blue-fg)",
				},
				{
					max: 27,
					label: "정상",
					bg: "var(--green-bg)",
					fg: "var(--green-fg)",
				},
				{
					max: 32,
					label: "경계",
					bg: "var(--orange-bg)",
					fg: "var(--orange-fg)",
				},
				{
					max: 999,
					label: "비만",
					bg: "var(--red-bg)",
					fg: "var(--red-fg)",
				},
			]);
	document.getElementById("tag-bmi").innerHTML = isNaN(bmi)
		? ""
		: ibTag(bmi, [
				{
					max: 18.4,
					label: "저체중",
					bg: "var(--blue-bg)",
					fg: "var(--blue-fg)",
				},
				{
					max: 22.9,
					label: "정상",
					bg: "var(--green-bg)",
					fg: "var(--green-fg)",
				},
				{
					max: 24.9,
					label: "과체중",
					bg: "var(--orange-bg)",
					fg: "var(--orange-fg)",
				},
				{
					max: 999,
					label: "비만",
					bg: "var(--red-bg)",
					fg: "var(--red-fg)",
				},
			]);
	document.getElementById("tag-fat").innerHTML = isNaN(fat)
		? ""
		: ibTag(fat, [
				{
					max: 12.9,
					label: "낮음",
					bg: "var(--blue-bg)",
					fg: "var(--blue-fg)",
				},
				{
					max: 20.9,
					label: "정상",
					bg: "var(--green-bg)",
					fg: "var(--green-fg)",
				},
				{
					max: 999,
					label: "높음",
					bg: "var(--red-bg)",
					fg: "var(--red-fg)",
				},
			]);
	document.getElementById("tag-w").innerHTML = "";
	document.getElementById("tag-bmr").innerHTML = "";
	if (!isNaN(vis)) {
		let vl, vb, vf;
		if (vis <= 9) {
			vl = "정상";
			vb = "var(--green-bg)";
			vf = "var(--green-fg)";
		} else if (vis <= 14) {
			vl = "경계";
			vb = "var(--orange-bg)";
			vf = "var(--orange-fg)";
		} else {
			vl = "위험";
			vb = "var(--red-bg)";
			vf = "var(--red-fg)";
		}
		document.getElementById("tag-vis").innerHTML =
			`<span class="ib-tag" style="background:${vb};color:${vf}">내장지방 ${vl}</span>`;
	} else {
		document.getElementById("tag-vis").innerHTML = "";
	}
}