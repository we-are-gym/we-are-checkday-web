// 파일 용도: 평가 논리 — 움직임 평가 목록 구성 · VO₂ 계산 연동 · 평가 카드 빌드 · 점수/등급/총점 갱신 (checkday 공용)
// DEPENDS: ASSESSMENT_ITEMS, ARR, VAL, UI, STATE, STYLE 등
import { ASSESSMENT_ITEMS_FULL } from "./assessment-data.js";
import { ARR } from "./utils-array.js";
import { VAL } from "./validation.js";
import { UI } from "./UI.js";
import { STATE } from "./states.js";
import { TPL } from "./templates.js";
import { DOT_COUNT, MOTION_TOTAL_MAX, SCORE_MIN, SCORE_MAX } from "./constants.js";
import { calcVo2Value, determineVO2Grade } from "./vo2.js";
import { getGradeMeta } from "./grade.js";
import { GRADE_STYLES, VO2_GRADE_STYLES } from "./grade-styles.js";

// ── 움직임 평가 데이터 (공용 모듈 8개: 7개 + VO₂ 항목) ──
export const evals = ASSESSMENT_ITEMS_FULL;

/** 평가 점수 단일 소스 초기화 */
STATE.init(evals.length, MOTION_TOTAL_MAX);

// ── VO₂ 계산 (8번 항목에만) — 공용 모듈 사용 ──
/**
 * VO₂ MAX 자동 계산 — 폼의 연령·신장·체중·심박수 입력으로 산출·표시를 갱신한다.
 * 입력 중 하나라도 NaN이면 결과 블록을 숨긴다.
 * @returns {void}
 */
export function updateVO2Disp() {
	const age = VAL.parseToNum(UI.byId("vo2-age").value);
	const ht = VAL.parseToNum(UI.byId("vo2-ht").value);
	const wt = VAL.parseToNum(UI.byId("vo2-wt").value);
	const hr = VAL.parseToNum(UI.byId("vo2-hr").value);
	if (VAL.anyNaN(age, ht, wt, hr)) {
		UI.byId("vo2-result").style.display = "none";
		return;
	}
	const vr = calcVo2Value(age, ht, wt, hr);
	const gradeInfo = determineVO2Grade(vr, age);
	const style = VO2_GRADE_STYLES[gradeInfo.grade];
	UI.byId("vo2-val").textContent = vr.toFixed(1) + " ml/kg/min";
	const badge = UI.byId("vo2-badge");
	badge.textContent = gradeInfo.label;
	badge.style.background = style.bg;
	badge.style.color = style.fg;
	UI.byId("vo2-result").style.display = "flex";
}

// ── 평가 카드 빌드 (카드 셸은 공용 템플릿 함수 TPL.assessmentCard 사용) ──
/**
 * 움직임 평가 8개 카드를 #eval-cards에 렌더링한다. (VO₂ 항목은 자동계산 블록 포함)
 * @returns {void}
 */
export function renderBasicFunctionCards() {
	const c = UI.byId("eval-cards");
	evals.forEach((e, i) => {
		const dots = ARR.createZeroArray(DOT_COUNT)
			.map((_, j) => `<div class="dot" id="dot-${i}-${j}"></div>`)
			.join("");
		const tags = e.checks
			.map(
				(ch) =>
					`<span class="ctag">${ch}</span>`
			)
			.join("");
		const extra = e.vo2 ? buildVo2Block() : "";
		c.insertAdjacentHTML("beforeend", TPL.assessmentCard({ index: i, item: e, dots, tags, extra }));
	});
}

/** VO₂ 자동 계산 블록 (8번 항목 전용) — 카드 extra 조각 */
function buildVo2Block() {
	return `
				<div style="margin-top:8px;padding:10px;background:var(--surface2);border-radius:8px;">
					<div style="font-size:11px;font-weight:600;color:var(--text3);margin-bottom:8px;">VO₂ MAX 자동 계산</div>
					<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
						<div><label style="font-size:10px;color:var(--text3);display:block;margin-bottom:3px;">연령</label><input class="ib-num" id="vo2-age" type="number" placeholder="30" style="width:100%"></div>
						<div><label style="font-size:10px;color:var(--text3);display:block;margin-bottom:3px;">신장 (cm)</label><input class="ib-num" id="vo2-ht" type="number" placeholder="165" style="width:100%"></div>
						<div><label style="font-size:10px;color:var(--text3);display:block;margin-bottom:3px;">체중 (kg)</label><input class="ib-num" id="vo2-wt" type="number" placeholder="60" style="width:100%"></div>
						<div><label style="font-size:10px;color:var(--text3);display:block;margin-bottom:3px;">1분 회복 심박수</label><input class="ib-num" id="vo2-hr" type="number" placeholder="100" style="width:100%"></div>
					</div>
					<div id="vo2-result" style="display:none;align-items:center;gap:10px;flex-wrap:wrap;">
						<span id="vo2-val" style="font-size:15px;font-weight:600;"></span>
						<span id="vo2-badge" class="ib-tag" style="font-size:11px;"></span>
					</div>
					<div style="font-size:10px;color:var(--text3);margin-top:6px;">공식: 54.337 − 0.185(연령) + 0.097(신장) − 0.246(체중) − 0.112(심박수)</div>
				</div>`;
}

/**
 * 평가 카드의 펼침 서브패널(체크 항목·메모)을 토글하고 aria-expanded를 동기화한다.
 * @param {number} index 평가 항목 인덱스
 * @returns {void}
 */
export function toggleBasicFunctionDetail(index) {
	const sp = UI.byId(`sp-${index}`);
	const et = UI.byId(`et-${index}`);
	const open = sp.classList.toggle("open");
	et.classList.toggle("open");
	et.setAttribute("aria-expanded", String(open));
}

/**
 * i번째 평가 점수를 ±delta만큼 조정(0~3 클램프)하고 화면 표시를 갱신한다.
 * @param {number} index 평가 항목 인덱스
 * @param {number} delta 변화량 (예: -1, 1)
 * @returns {void}
 */
export function adjustScore(index, delta) {
	const next = VAL.clamp(STATE.get(index) + delta, SCORE_MIN, SCORE_MAX);
	STATE.set(index, next);
	UI.byId(`sv-${index}`).textContent = next;
	for (let j = 0; j < DOT_COUNT; j++)
		UI.byId(`dot-${index}-${j}`).classList.toggle("on", j < next);
	updateTotal();
}

/**
 * 총점·진행률·등급 배지·힌트를 현재 STATE 기준으로 갱신한다.
 * @returns {void}
 */
export function updateTotal() {
	const tot = STATE.getTotal();
	const max = STATE.max;
	const pct = Math.round((tot / max) * 100);
	UI.byId("total-num").innerHTML = `${tot} <span>/ ${max}</span>`;
	UI.byId("prog-fill").style.width = pct + "%";
	const pill = UI.byId("grade-pill");
	const hint = UI.byId("grade-hint");
	const meta = getGradeMeta(tot, max);
	const style = GRADE_STYLES[meta.label];
	pill.textContent = meta.label;
	pill.style.background = style.bg;
	pill.style.color = style.fg;
	hint.textContent = style.hint;
}