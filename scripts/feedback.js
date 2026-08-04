// 파일 용도: 피드백 CRUD — 동작 피드백 카드 생성·체크 행 추가/삭제·데이터 수집 (checkday 공용)
// 기법: 카드·체크 행 마크업은 공용 템플릿(TPL.feedbackCard·TPL.fbCheckRow)을 단일 소스로 사용
// DEPENDS: byId(UI), TPL
import { byId } from "./UI.js";
import { TPL } from "./templates.js";

/** 동작 피드백 프리셋 정의 (동작명 → 체크 문구 목록) */
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
/** 화면 렌더링용 프리셋 복사본 */
const feedbacks = FB_PRESET.slice(0);
/** 피드백 카드 고유 ID 카운터 */
let fbIdCounter = 0;

/** 체크 행 추가 버튼의 이전 요소(체크 목록)에 새 체크 입력 행을 추가하고 입력에 포커스를 준다
 * @param {HTMLButtonElement} btn 체크 행 추가 버튼
 * @returns {void}
 */
export function appendCheckMovementItemRow(btn) {
	const checksWrap = btn.previousElementSibling;
	const div = document.createElement("div");
	div.innerHTML = TPL.fbCheckRow();
	checksWrap.appendChild(div.firstElementChild);
	checksWrap.lastElementChild.querySelector(".fb-check-input").focus();
}

/** 프리셋(또는 빈) 피드백 카드를 카드 영역에 추가한다
 * @param {{ name: string, checks: string[] }} [preset] 동작 프리셋 (없으면 빈 카드)
 * @returns {void}
 */
export function appendCheckMovement(preset) {
	fbIdCounter++;
	const id = fbIdCounter;
	const name = preset ? preset.name : "";
	const checks = preset ? preset.checks : [""];
	const wrap = document.createElement("div");
	wrap.innerHTML = TPL.feedbackCard({ id, name, checkItems: checks });
	byId("fb-cards").appendChild(wrap.firstElementChild);
}

/** 현재 피드백 데이터를 순회하며 카드를 다시 렌더링한다
 * @returns {void}
 */
export function renderCheckMovementCards() {
	feedbacks.forEach((fb) => appendCheckMovement(fb));
}

/** 초기용: 피드백 카드를 비우고 프리셋 재빌드 */
export function resetFeedbacks() {
	byId("fb-cards").innerHTML = "";
	fbIdCounter = 0;
	renderCheckMovementCards();
}

/** 화면의 피드백 항목에서 체크 문구·메모를 수집해 배열로 반환한다 (체크·메모 둘 다 없으면 제외)
 * @returns {Array<{ name: string, checked: string[], memo: string }>} 수집된 피드백 데이터
 */
export function collectCheckMovementData() {
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