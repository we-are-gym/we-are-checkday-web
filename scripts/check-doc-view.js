// 파일 용도: 체크기록 조회 화면(check-doc-view.html)
// ?docID= 로 기록 1건을 읽기 전용으로 렌더링한다. 수정은 check-doc-edit.html?docID= 로 이동(커밋 13에서 실링크).
import { UI } from "./UI.js";
import { recordStore } from "./record-store.js";
import { escapeHtml, TPL } from "./templates.js";
import { IB_KEYS, recordTotal } from "./record-stats.js";
import { ASSESSMENT_ITEMS_FULL } from "./assessment-data.js";
import { DOT_COUNT, MOTION_TOTAL_MAX } from "./constants.js";
import "./components/app-header.js";

/** ?docID= 파라미터 (없으면 0 — 미조회 상태) */
const docId = Number(new URLSearchParams(window.location.search).get("docID")) || 0;

/**
 * 조회 대상 기록
 * @returns {import("./store.js").CheckRecord | undefined} docID에 해당하는 기록 (없으면 undefined)
 */
function getRecord() {
	return recordStore.getState().records.find((r) => r.id === docId);
}

/**
 * 점수 도트 (읽기 전용) — 채워진 개수 = 점수
 * @param {number} score
 * @returns {string}
 */
function scoreDots(score) {
	return Array.from({ length: DOT_COUNT }, (_, i) => `<span class="sdot${i < score ? " on" : ""}"></span>`).join("");
}

/**
 * 기록 헤더 (회차·날짜·회원·트레이너·총점)
 * @param {import("./store.js").CheckRecord} rec
 * @returns {void}
 */
function renderHead(rec) {
	const p = rec.payload;
	UI.setText("vh-title", p.session || rec.date);
	const items = [
		["회원", p.name || "-"],
		["작성일", rec.date],
		["담당 트레이너", p.trainer || "-"],
		["총점", `${recordTotal(p)} / ${MOTION_TOTAL_MAX}`],
	];
	UI.setHTML("vh-meta", items.map(([k, v]) => `<span class="meta-item"><b>${k}</b>${escapeHtml(v)}</span>`).join(""));
	document.title = `${p.session || "체크기록"} — 조회`;
}

/**
 * 인바디 7셀 + 코멘트
 * @param {import("./store.js").CheckRecord} rec
 * @returns {void}
 */
function renderInbody(rec) {
	const ib = rec.payload.ib || {};
	UI.setHTML(
		"ib-grid",
		IB_KEYS.map(
			({ key, label }) => `
				<div class="ib-cell">
					<div class="ib-label">${label}</div>
					<div class="ib-value">${escapeHtml(ib[key] != null && ib[key] !== "" ? ib[key] : "―")}</div>
				</div>`,
		).join(""),
	);
	UI.setText("ib-comment", rec.payload.ibComment || "");
	UI.byId("ib-comment").style.display = rec.payload.ibComment ? "" : "none";
}

/**
 * 움직임 평가 8장 (점수 도트·체크 항목·메모)
 * @param {import("./store.js").CheckRecord} rec
 * @returns {void}
 */
function renderEvals(rec) {
	const { scores = [], evalData = [] } = rec.payload;
	UI.setHTML(
		"eval-list",
		ASSESSMENT_ITEMS_FULL.map((item, i) => {
			const score = scores[i] ?? 0;
			const ed = evalData[i] || { checked: [], memo: "" };
			const checks = (ed.checked || []).map((c) => `<li>${escapeHtml(c)}</li>`).join("");
			return `
				<div class="eval-view">
					<div class="ev-head">
						<div class="ev-num">${i + 1}</div>
						<div class="ev-info">
							<div class="ev-name">${escapeHtml(item.name)}</div>
							<div class="ev-desc">${escapeHtml(item.desc)}</div>
						</div>
						<div class="ev-score">
							<span class="ev-score-val">${score}점</span>
							<span class="score-dots">${scoreDots(score)}</span>
						</div>
					</div>
					${checks ? `<ul class="ev-checks">${checks}</ul>` : ""}
					${ed.memo ? `<p class="ev-memo">${escapeHtml(ed.memo)}</p>` : ""}
					${item.vo2 && rec.payload.vo2Comment ? `<p class="ev-vo2">${escapeHtml(rec.payload.vo2Comment)}</p>` : ""}
				</div>`;
		}).join(""),
	);
	UI.setText("evals-total", `총점 ${recordTotal(rec.payload)}`);
}

/**
 * 목표 태그 + 메모
 * @param {import("./store.js").CheckRecord} rec
 * @returns {void}
 */
function renderGoals(rec) {
	const { goals = [], goalMemo = "" } = rec.payload;
	UI.setHTML("goal-chips", goals.length ? goals.map((g) => `<span class="goal-chip">${escapeHtml(g)}</span>`).join("") : '<span class="goal-empty">설정한 목표가 없습니다</span>');
	UI.setText("goal-memo", goalMemo || "");
	UI.byId("goal-memo").style.display = goalMemo ? "" : "none";
}

/**
 * 동작 피드백 목록 (읽기 전용)
 * @param {import("./store.js").CheckRecord} rec
 * @returns {void}
 */
function renderFeedbacks(rec) {
	const fbs = rec.payload.feedbacks || [];
	UI.setHTML(
		"fb-views",
		fbs.length
			? fbs
					.map(
						(fb) => `
						<div class="fb-view">
							<div class="fb-name">${escapeHtml(fb.name)}</div>
							${(fb.checkItems || []).map((c) => `<div class="fb-check${c.checked ? " on" : ""}"><span class="fb-mark">${c.checked ? "✓" : "○"}</span>${escapeHtml(c.text)}</div>`).join("")}
							${fb.memo ? `<p class="fb-memo">${escapeHtml(fb.memo)}</p>` : ""}
						</div>`,
					)
					.join("")
			: '<p class="goal-empty">기록된 피드백이 없습니다</p>',
	);
}

/**
 * 종합 상담 메모
 * @param {import("./store.js").CheckRecord} rec
 * @returns {void}
 */
function renderConsult(rec) {
	const memo = rec.payload.consultMemo || "";
	UI.setText("consult-memo", memo || "기록된 상담 메모가 없습니다.");
}

// ── 시작 ──
function init() {
	const rec = getRecord();
	if (!rec) {
		UI.byId("vh-title").textContent = "기록을 찾을 수 없습니다";
		UI.byId("vh-meta").textContent = "목록에서 다시 선택하세요.";
		UI.queryAll(".view-section").forEach((s) => (s.style.display = "none"));
		UI.byId("btn-edit").style.display = "none";
		return;
	}
	renderHead(rec);
	renderInbody(rec);
	renderEvals(rec);
	renderGoals(rec);
	renderFeedbacks(rec);
	renderConsult(rec);
	// 편집 링크에 docID 부여 (check-doc-edit.html은 커밋 13에서 실링크)
	UI.byId("btn-edit").href = `check-doc-edit.html?docID=${docId}`;
}

UI.byId("btn-back").addEventListener("click", () => window.history.length > 1 ? window.history.back() : (window.location.href = "members.html"));

init();
