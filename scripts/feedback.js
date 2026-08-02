// 파일 용도: 피드백 CRUD — 동작 피드백 카드 생성·체크 행 추가/삭제·데이터 수집 (checkday 공용)
// DEPENDS: ARR, UI

const FB_PRESET = [
	{
		name: "스쿼트",
		checks: [
			"무릎 안쪽 무너짐",
			"허리 말림",
			"상체 과도한 숙임",
			"뒤꿈치 들림",
			"좌우 비대칭",
		],
	},
	{
		name: "힙힌지 / 데드리프트",
		checks: [
			"등 굽음 (요추 굴곡)",
			"무릎 과도한 굽힘",
			"엉덩이 후방 이동 부족",
			"바 몸에서 멀어짐",
		],
	},
	{
		name: "런지",
		checks: ["앞무릎 내반", "골반 틀어짐", "상체 흔들림", "발목 불안정"],
	},
	{
		name: "푸시업",
		checks: [
			"날개뼈 들뜸",
			"요추 과신전",
			"어깨 으쓱 (승모근 과활동)",
			"팔꿈치 과도한 외전",
		],
	},
];

// ── 동작 피드백 데이터(카피)·ID 카운터 ──
const feedbacks = FB_PRESET.slice(0);
let fbIdCounter = 0;

function makeFbCheckRow(text = "") {
	return `<div class="fb-check-row">
    <input type="checkbox" style="accent-color:var(--blue);flex-shrink:0;">
    <input class="fb-check-input" type="text" value="${text}" placeholder="체크 항목...">
    <button class="fb-check-del" onclick="this.parentElement.remove()" title="삭제">✕</button>
  </div>`;
}

function addCheckToFb(btn) {
	const checksWrap = btn.previousElementSibling;
	const div = document.createElement("div");
	div.innerHTML = makeFbCheckRow();
	checksWrap.appendChild(div.firstElementChild);
	checksWrap.lastElementChild.querySelector(".fb-check-input").focus();
}

function addFbItem(preset) {
	fbIdCounter++;
	const id = fbIdCounter;
	const c = UI.byId("fb-cards");
	const div = document.createElement("div");
	div.className = "fb-item";
	div.id = `fb-item-${id}`;
	const name = preset ? preset.name : "";
	const checks = preset ? preset.checks : [""];
	const checksHTML = checks.map((ch) => makeFbCheckRow(ch)).join("");
	div.innerHTML = `
    <div class="fb-item-header">
      <input class="fb-move-input" type="text" value="${name}" placeholder="동작명 (예: 스쿼트)">
      <button class="fb-del-btn" onclick="document.getElementById('fb-item-${id}').remove()" title="삭제">✕</button>
    </div>
    <div class="fb-checks-wrap">${checksHTML}</div>
    <button class="add-check-btn" onclick="addCheckToFb(this)">+ 체크 항목 추가</button>
    <textarea class="eval-memo" placeholder="코칭 포인트 메모..." style="margin-top:6px;"></textarea>`;
	c.appendChild(div);
}

function buildFeedbacks() {
	feedbacks.forEach((fb) => addFbItem(fb));
}

/** 초기용: 피드백 카드를 비우고 프리셋 재빌드 */
function resetFeedbacks() {
	UI.byId("fb-cards").innerHTML = "";
	fbIdCounter = 0;
	buildFeedbacks();
}

function getFbLines() {
	return [...document.querySelectorAll(".fb-item")]
		.map((item) => {
			const name =
				item.querySelector(".fb-move-input").value || "(동작명 없음)";
			const checked = [...item.querySelectorAll(".fb-check-row")]
				.filter((row) => row.querySelector("input[type=checkbox]").checked)
				.map((row) => row.querySelector(".fb-check-input").value)
				.filter(Boolean);
			const memo = item.querySelector(".eval-memo").value;
			if (!checked.length && !memo) return null;
			return { name, checked, memo };
		})
		.filter(Boolean);
}