// 파일 용도: 평가 논리 — 움직임 평가 목록 구성 · VO₂ 계산 연동 · 평가 카드 빌드 · 점수/등급/총점 갱신 (checkday 공용)
// DEPENDS: ASSESSMENT_ITEMS, clamp·parseToNum(validation), byId(UI), scoreState(states), calcVo2Assessment(vo2), STYLE 등
import { ASSESSMENT_ITEMS_FULL } from "./assessment-data.js";
import { clamp, parseToNum } from "@base/validation.js";
import { byId } from "@base/UI.js";
import { scoreState } from "@base/states.js";
import { TPL } from "@base/templates.js";
import { DOT_COUNT, MOTION_TOTAL_MAX, SCORE_MIN, SCORE_MAX } from "@base/constants.js";
import { calcVo2Assessment } from "@base/vo2.js";
import { getGradeMeta } from "@base/grade.js";
import { GRADE_STYLES, VO2_GRADE_STYLES } from "@base/grade-styles.js";

// ── 움직임 평가 데이터 (공용 모듈 기본 8개: 7개 + VO₂ 항목) ──
// 주의: `evals`는 모듈 내부 상태다. 화면이 configureEvaluation()을 호출하면 갱신되고,
//       외부는 getEvals()로만 읽는다 (check-form-payload·check-doc-edit·세션 리포트 공용).
let evals = ASSESSMENT_ITEMS_FULL;

/** 현재 평가 총점 최댓값 (기본 24 — configureEvaluation()으로 교체 가능) */
let currentMax = MOTION_TOTAL_MAX;

/** 평가 점수 단일 소스 초기화 (기본: 8항목/24점 — 레거시 checkday_1·basic_function_assessment_2는 재구성 없이 이대로 동작) */
scoreState.init(evals.length, currentMax);

/**
 * 화면별 평가 구성을 설정하고 점수 상태를 초기화한다.
 * 체크기록 작성(check-doc-new)처럼 전용 항목·만점을 쓰는 화면이 렌더 전에 호출한다.
 * (같은 페이지 로드 그래프 안에는 평가 구성이 1개뿐이므로 충돌이 없다.)
 * @param {{ items: Array<{name: string, desc: string, checks?: string[], vo2?: boolean}>, max: number }} config
 *           items: 평가 항목 목록 (예: ASSESSMENT_ITEMS_BASIC5), max: 총점 최댓값 (예: 15)
 * @returns {void}
 */
export function configureEvaluation({ items, max }) {
	evals = items;
	currentMax = max;
	scoreState.init(items.length, max);
}

// ── 평가 상태 읽기 (세션 리포트 등 공용 읽기 API — scoreState 직접 접근 대신 사용) ──
/** 현재 평가 항목 목록 반환 (configureEvaluation()으로 교체된 값 포함)
 * @returns {Array<{ name: string, desc: string, checks?: string[], vo2?: boolean }>} 평가 항목 목록
 */
export function getEvals() {
	return evals;
}

/** i번째 평가 점수 반환 (범위 밖이면 0)
 * @param {number} i 항목 인덱스
 * @returns {number} 점수
 */
export function getScore(i) {
	return scoreState.get(i);
}

/** 전체 점수 합계 반환
 * @returns {number} 전체 점수 합계
 */
export function getTotal() {
	return scoreState.getTotal();
}

/** 총점 최댓값 반환
 * @returns {number} 총점 최댓값
 */
export function getMax() {
	return scoreState.getMax();
}

// ── VO₂ 계산 (VO₂ 항목에만) — 공용 모듈 사용 ──
/**
 * VO₂ MAX 자동 계산 — 폼의 연령·신장·체중·심박수 입력으로 산출·표시를 갱신한다.
 * 입력 중 하나라도 NaN이면 결과 블록을 숨긴다.
 * @returns {void}
 */
export function updateVO2Disp() {
	const res = calcVo2Assessment({
		age: parseToNum(byId("vo2-age").value),
		height: parseToNum(byId("vo2-ht").value),
		weight: parseToNum(byId("vo2-wt").value),
		hr: parseToNum(byId("vo2-hr").value),
	});
	if (!res) {
		byId("vo2-result").style.display = "none";
		return;
	}
	const { vr, gradeInfo } = res;
	const style = VO2_GRADE_STYLES[gradeInfo.grade];
	byId("vo2-val").textContent = vr.toFixed(1) + " ml/kg/min";
	const badge = byId("vo2-badge");
	badge.textContent = gradeInfo.label;
	badge.style.background = style.bg;
	badge.style.color = style.fg;
	byId("vo2-result").style.display = "flex";
}

// ── 평가 카드 빌드 (카드 셸은 공용 템플릿 함수 TPL.assessmentCard 사용) ──
/**
 * 평가 카드를 #eval-cards에 렌더링한다 — 항목 수는 evals 기준 (레거시 8장·체크기록 작성 5장). VO₂ 항목은 자동계산 블록 포함.
 * @returns {void}
 */
export function renderBasicFunctionCards() {
	const c = byId("eval-cards");
	evals.forEach((e, i) => {
		const dots = TPL.scoreDots({ prefix: i, count: DOT_COUNT });
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

/** VO₂ 자동 계산 블록 (VO₂ 항목 전용) — 카드 extra 조각 */
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
	const sp = byId(`sp-${index}`);
	const et = byId(`et-${index}`);
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
	const next = clamp(scoreState.get(index) + delta, SCORE_MIN, SCORE_MAX);
	scoreState.set(index, next);
	byId(`sv-${index}`).textContent = next;
	for (let j = 0; j < DOT_COUNT; j++)
		byId(`dot-${index}-${j}`).classList.toggle("on", j < next);
	updateTotal();
}

/**
 * 총점·진행률·등급 배지·힌트를 현재 scoreState 기준으로 갱신한다.
 * @returns {void}
 */
export function updateTotal() {
	const tot = scoreState.getTotal();
	const max = scoreState.getMax();
	const pct = Math.round((tot / max) * 100);
	byId("total-num").innerHTML = `${tot} <span>/ ${max}</span>`;
	byId("prog-fill").style.width = pct + "%";
	const pill = byId("grade-pill");
	const hint = byId("grade-hint");
	const meta = getGradeMeta(tot, max);
	const style = GRADE_STYLES[meta.label];
	pill.textContent = meta.label;
	pill.style.background = style.bg;
	pill.style.color = style.fg;
	hint.textContent = style.hint;
}