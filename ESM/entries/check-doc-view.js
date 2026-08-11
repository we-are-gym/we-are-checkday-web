// 파일 용도: 체크기록 조회 화면(check-doc-view.html)
// ?docID= 로 기록 1건을 읽기 전용으로 렌더링한다. 수정은 check-doc-edit.html?docID= 로 이동(커밋 13에서 실링크).
import { resolveRecordItems } from "@check-doc/assessment-data.js";
import { IB_KEYS, recordMax } from "@check-doc/record-stats.js";
import { recordStore } from "@check-doc/record-store.js";
import { getRecordById } from "@check-doc/record-utils.js";
import { inbodyTagFor } from "@gym/inbody.js";
import "@infra/components/app-header.js";
import { escapeHtml, TPL } from "@infra/templates.js";
import { memberStore } from "@member/member-store.js";
import { getMemberById } from "@member/member-utils.js";
import { sum } from "@tools/utils-array.js";
import { byId, queryAll, setHTML, setText } from "@tools/utils-dom.js";
import { getNumberParam } from "@tools/utils-url.js";

/** ?docID= 파라미터 (없으면 0 — 미조회 상태) */
const docId = getNumberParam("docID");

/**
 * 조회 대상 기록
 * @returns {import("@infra/store.js").CheckRecord | undefined} docID에 해당하는 기록 (없으면 undefined)
 */
function getRecord() {
	return getRecordById(recordStore.getState().records, docId);
}

/**
 * 기록 헤더 — 제목은 회원명(상세 화면 링크), 메타는 회차·작성일·트레이너·총점
 * @param {import("@infra/store.js").CheckRecord} rec
 * @returns {void}
 */
function renderHead(rec) {
	const p = rec.payload;
	// 회원 이름은 payload 대신 회원 스토어에서 memberId로 동적 해석한다 (회원명 변경 즉시 전파)
	const member = getMemberById(memberStore.getState().members, rec.memberId);
	const name = member ? member.name : "회원";
	setHTML("vh-title", `<a class="vh-member" href="member-detail.html?memberID=${rec.memberId}">${escapeHtml(name)}</a>`);
	const items = [
		["회차", p.session || "-"],
		["작성일", rec.date],
		["담당 트레이너", p.trainer || "-"],
		["총점", `${sum(p.scores || [])} / ${recordMax(rec.payload)}`],
	];
	setHTML("vh-meta", items.map(([k, v]) => `<span class="meta-item"><b>${k}</b>${escapeHtml(v)}</span>`).join(""));
	document.title = `${p.session || "체크기록"} — ${name} 조회`;
}

/**
 * 인바디 7셀 + 코멘트
 * @param {import("@infra/store.js").CheckRecord} rec
 * @returns {void}
 */
function renderInbody(rec) {
	const ib = rec.payload.ib || {};
	setHTML(
		"ib-grid",
		IB_KEYS.map(({ key, label }) => {
			const has = ib[key] != null && ib[key] !== "";
			const val = has ? ib[key] : "―";
			// 인디수치에 상태 태그 병기 (분류 기준 없는 키/빈값은 태그 없음)
			const tag = has ? inbodyTagFor(key, ib[key]) : "";
			return `
				<div class="ib-cell">
					<div class="ib-label">${label}</div>
					<div class="ib-value">${escapeHtml(val)}</div>
					${tag}
				</div>`;
		}).join("")
	);
	setText("ib-comment", rec.payload.ibComment || "");
	byId("ib-comment").style.display = rec.payload.ibComment ? "" : "none";
}

/**
 * 움직임 평가 카드 목록 (기록별 항목 — payload.items가 있으면 그대로, 없으면 scores 길이로 폴백)
 * @param {import("@infra/store.js").CheckRecord} rec
 * @returns {void}
 */
function renderEvals(rec) {
	const { scores = [], evalData = [] } = rec.payload;
	setHTML(
		"eval-list",
		resolveRecordItems(rec.payload)
			.map((item, i) => {
				const score = scores[i] ?? 0;
				const ed = evalData[i] || { checked: [], memo: "" };
				const checks = (ed.checked || []).map(c => `<li>${escapeHtml(c)}</li>`).join("");
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
							<span class="score-dots">${TPL.viewScoreDots({ score })}</span>
						</div>
					</div>
					${checks ? `<ul class="ev-checks">${checks}</ul>` : ""}
					${ed.memo ? `<p class="ev-memo">${escapeHtml(ed.memo)}</p>` : ""}
					${item.vo2 && rec.payload.vo2Comment ? `<p class="ev-vo2">${escapeHtml(rec.payload.vo2Comment)}</p>` : ""}
				</div>`;
			})
			.join("")
	);
	setText("evals-total", `총점 ${sum(rec.payload.scores || [])} / ${recordMax(rec.payload)}`);
}

/**
 * 목표 태그 + 메모
 * @param {import("@infra/store.js").CheckRecord} rec
 * @returns {void}
 */
function renderGoals(rec) {
	const { goals = [], goalMemo = "" } = rec.payload;
	setHTML(
		"goal-chips",
		goals.length
			? goals.map(g => `<span class="goal-chip">${escapeHtml(g)}</span>`).join("")
			: '<span class="goal-empty">설정한 목표가 없습니다</span>'
	);
	setText("goal-memo", goalMemo || "");
	byId("goal-memo").style.display = goalMemo ? "" : "none";
}

/**
 * 동작 피드백 목록 (읽기 전용)
 * @param {import("@infra/store.js").CheckRecord} rec
 * @returns {void}
 */
function renderFeedbacks(rec) {
	const fbs = rec.payload.feedbacks || [];
	setHTML(
		"fb-views",
		fbs.length
			? fbs
					.map(
						fb => `
						<div class="fb-view">
							<div class="fb-name">${escapeHtml(fb.name)}</div>
							${(fb.checkItems || []).map(c => `<div class="fb-check${c.checked ? " on" : ""}"><span class="fb-mark">${c.checked ? "✓" : "○"}</span>${escapeHtml(c.text)}</div>`).join("")}
							${fb.memo ? `<p class="fb-memo">${escapeHtml(fb.memo)}</p>` : ""}
						</div>`
					)
					.join("")
			: '<p class="goal-empty">기록된 피드백이 없습니다</p>'
	);
}

/**
 * 종합 상담 메모
 * @param {import("@infra/store.js").CheckRecord} rec
 * @returns {void}
 */
function renderConsult(rec) {
	const memo = rec.payload.consultMemo || "";
	setText("consult-memo", memo || "기록된 상담 메모가 없습니다.");
}

// ── 시작 ──
/**
 * 조회 화면 초기화 — 기록을 불러와 각 섹션을 렌더링하고 편집 링크에 docID를 부여한다.
 * @returns {void}
 */
function init() {
	const rec = getRecord();
	if (!rec) {
		byId("vh-title").textContent = "기록을 찾을 수 없습니다";
		byId("vh-meta").textContent = "목록에서 다시 선택하세요.";
		queryAll(".view-section").forEach(s => (s.style.display = "none"));
		byId("btn-edit").style.display = "none";
		return;
	}
	renderHead(rec);
	renderInbody(rec);
	renderEvals(rec);
	renderGoals(rec);
	renderFeedbacks(rec);
	renderConsult(rec);
	// 편집 링크에 docID 부여 (check-doc-edit.html은 커밋 13에서 실링크)
	byId("btn-edit").href = `check-doc-edit.html?docID=${docId}`;
}

byId("btn-back").addEventListener("click", () =>
	window.history.length > 1 ? window.history.back() : (window.location.href = "members.html")
);

init();
