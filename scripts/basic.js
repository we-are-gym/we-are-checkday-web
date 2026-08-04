// 파일 용도: 베이직 펑션 평가 전용 스크립트 — 항목 카드·체크·VO₂ Max Test·점수/등급·리포트 (basic_function_assessment_2 전용)
// DEPENDS: ASSESSMENT_ITEMS, createZeroArray(utils-array), anyNaN·clamp·parseToNum(validation), byId·delegate·queryAll·queryOne(UI), calcVo2Value, determineVO2Grade, getGradeMeta + 상수 모듈
// 공용 경계: 순수 논리(VO₂ 계산 vo2.js·등급 grade.js·점수 색 grade-styles.js·상수 constants·카드 셸 TPL.basicItemCard)는
//          공용 모듈을 그대로 쓰고, 화면 전용 DOM 배선(로컬 state·v-*/score-*/detail-* 요소 id)만 여기 남긴다.
//          evaluation.js(checkday 공용)와 같은 논리가 일부 보이나 요소 id·상태 구조가 달라 화면 특화로 유지한다.
import { ASSESSMENT_ITEMS } from "./assessment-data.js";
import { createZeroArray } from "./utils-array.js";
import { anyNaN, clamp, parseToNum } from "./validation.js";
import { byId, delegate, queryAll, queryOne } from "./UI.js";
import { TPL } from "./templates.js";
import { calcVo2Value, determineVO2Grade } from "./vo2.js";
import { getGradeMeta } from "./grade.js";
import { GRADE_STYLES, VO2_GRADE_STYLES, getScoreColor } from "./grade-styles.js";
import { SCORE_MIN, SCORE_MAX, DOT_COUNT, MOTION_TOTAL_MAX } from "./constants.js";
import "./components/app-header.js";

const assessments = ASSESSMENT_ITEMS.map((item, idx) => ({
	id: idx + 1,
	...item,
}));

// ── 상태 초기화 (화면 전용) ──
const state = {};
assessments.forEach((a) => {
	state[a.id] = { score: 0, checks: {}, notes: "" };
});
const vo2State = { score: 0, vo2: null, grade: null };

// ── VO₂ 확장/계산 ──
function toggleVo2() {
	const body = byId("vo2-body");
	const arrow = byId("vo2-arrow");
	const open = body.classList.toggle("open");
	arrow.style.transform = open ? "rotate(180deg)" : "";
}

function updateVO2Disp() {
	const age = parseToNum(byId("v-age").value);
	const height = parseToNum(byId("v-height").value);
	const weight = parseToNum(byId("v-weight").value);
	const hr = parseToNum(byId("v-hr").value);
	if (anyNaN(age, height, weight, hr)) return;

	const vr = calcVo2Value(age, height, weight, hr);
	vo2State.vo2 = vr;

	const gradeInfo = determineVO2Grade(vr, age);
	vo2State.grade = gradeInfo;
	const color = VO2_GRADE_STYLES[gradeInfo.grade];

	byId("vo2-val").textContent = vr.toFixed(1);
	const badge = byId("vo2-grade-badge");
	badge.textContent = gradeInfo.label;
	badge.style.background = color.bg;
	badge.style.color = color.fg;

	byId("vo2-result-box").style.display = "block";
	byId("vo2-preview").textContent = vr.toFixed(1) + " ml/kg/min";

	// Highlight table row & column
	highlightNormTable(gradeInfo.grade, gradeInfo.col);

	// Auto-suggest score
	setVo2Score(0, gradeInfo.score);
}

function highlightNormTable(grade, col) {
	const rows = queryAll("#vo2-table tbody tr");
	rows.forEach((row) => {
		row.classList.remove("highlight-row");
		// Reset all cell backgrounds
		Array.from(row.cells).forEach((td, i) => {
			td.style.background = "";
			td.style.color = "";
			td.style.fontWeight = "";
		});
	});
	const targetRow = queryOne(`#vo2-table tr[data-grade="${grade}"]`);
	if (targetRow) {
		targetRow.classList.add("highlight-row");
		// Also highlight the age column cell
		const cell = targetRow.cells[col];
		if (cell) {
			cell.style.outline = "2px solid var(--blue)";
			cell.style.outlineOffset = "-2px";
		}
	}
}

function setVo2Score(delta, suggested) {
	if (typeof suggested === "number") {
		vo2State.score = suggested;
	} else {
		vo2State.score = clamp(vo2State.score + delta, SCORE_MIN, SCORE_MAX);
	}
	const el = byId("vo2-score-display");
	el.textContent = vo2State.score;
	el.dataset.score = vo2State.score;
	for (let i = 0; i < DOT_COUNT; i++) {
		byId("vd" + i).classList.toggle("filled", i < vo2State.score);
	}
	updateTotal();
}

// ── 항목 카드 빌드 (카드 셸은 공용 템플릿 함수 TPL.basicItemCard 사용) ──
function buildItems() {
	const container = byId("items-container");
	assessments.forEach((a) => {
		const dotsHTML = createZeroArray(DOT_COUNT)
			.map((_, i) => `<div class="dot" id="dot-${a.id}-${i}"></div>`)
			.join("");
		const checksHTML = a.checks
			.map(
				(c, i) => `
			<div class="check-row" data-id="${a.id}" data-idx="${i}">
				<div class="check-box" id="chk-${a.id}-${i}"></div>
				<span class="check-label" id="chklbl-${a.id}-${i}">${c}</span>
			</div>
		`,
			)
			.join("");
		container.insertAdjacentHTML(
			"beforeend",
			TPL.basicItemCard({ id: a.id, item: a, dots: dotsHTML, checks: checksHTML }),
		);
	});
}

function toggleBasicFunctionDetail(index) {
	const detail = byId(`detail-${index}`);
	const btn = byId(`expand-${index}`);
	const open = detail.classList.toggle("open");
	btn.classList.toggle("open");
	btn.setAttribute("aria-expanded", String(open));
}

function toggleCheck(id, idx) {
	const key = `${id}-${idx}`;
	state[id].checks[key] = !state[id].checks[key];
	const box = byId(`chk-${id}-${idx}`);
	const lbl = byId(`chklbl-${id}-${idx}`);
	box.classList.toggle("checked", state[id].checks[key]);
	lbl.classList.toggle("checked-text", state[id].checks[key]);
}

function adjustScore(id, delta) {
	const s = state[id];
	s.score = clamp(s.score + delta, SCORE_MIN, SCORE_MAX);
	const el = byId(`score-${id}`);
	el.textContent = s.score;
	el.dataset.score = s.score;
	// Update dots
	for (let i = 0; i < DOT_COUNT; i++) {
		byId(`dot-${id}-${i}`).classList.toggle("filled", i < s.score);
	}
	updateTotal();
}

function saveNotes(id, val) {
	state[id].notes = val;
}

function getTotal() {
	return (
		assessments.reduce((sum, a) => sum + state[a.id].score, 0) +
		vo2State.score
	);
}

function updateTotal() {
	const total = getTotal();
	const max = MOTION_TOTAL_MAX;
	const pct = Math.round((total / max) * 100);

	byId("total-display").innerHTML = `${total} <span>/ ${max}</span>`;
	byId("progress-fill").style.width = `${pct}%`;

	const meta = getGradeMeta(total, max);
	const style = GRADE_STYLES[meta.label];
	const badge = byId("grade-badge");
	const hint = byId("grade-hint");

	badge.textContent = meta.label;
	badge.style.background = style.bg;
	badge.style.color = style.fg;
	hint.textContent = style.hint;
}

// 항목별 리포트 정보를 한 곳에서만 수집 — 모달·클립보드 양쪽 공용
function getAssessmentReportItems() {
	return assessments.map((a) => {
		const s = state[a.id];
		const flagged = a.checks.filter((_, i) => s.checks[`${a.id}-${i}`]);
		return { id: a.id, name: a.name, score: s.score, flagged, notes: s.notes };
	});
}

function resetEntireForm() {
	if (!confirm("모든 점수와 체크를 초기화할까요?")) return;
	assessments.forEach((a) => {
		state[a.id] = { score: 0, checks: {}, notes: "" };
		const el = byId(`score-${a.id}`);
		el.textContent = "0";
		el.dataset.score = "0";
		for (let i = 0; i < DOT_COUNT; i++) {
			byId(`dot-${a.id}-${i}`).classList.remove("filled");
		}
		a.checks.forEach((_, i) => {
			byId(`chk-${a.id}-${i}`).classList.remove("checked");
			byId(`chklbl-${a.id}-${i}`).classList.remove("checked-text");
		});
		const notes = byId(`notes-${a.id}`);
		if (notes) notes.value = "";
		const detail = byId(`detail-${a.id}`);
		detail.classList.remove("open");
		byId(`expand-${a.id}`).classList.remove("open");
	});
	// Reset VO2
	vo2State.score = 0;
	vo2State.vo2 = null;
	vo2State.grade = null;
	["v-age", "v-height", "v-weight", "v-hr"].forEach((id) => {
		const el = byId(id);
		if (el) el.value = "";
	});
	byId("vo2-result-box").style.display = "none";
	byId("vo2-preview").textContent = "—";
	const vScoreEl = byId("vo2-score-display");
	if (vScoreEl) {
		vScoreEl.textContent = "0";
		vScoreEl.dataset.score = "0";
	}
	for (let i = 0; i < DOT_COUNT; i++) {
		const d = byId("vd" + i);
		if (d) d.classList.remove("filled");
	}
	queryAll("#vo2-table tbody tr").forEach((r) =>
		r.classList.remove("highlight-row"),
	);
	updateTotal();
}

function openReportModal() {
	const total = getTotal();
	const container = byId("report-content");
	let html = `<div style="font-size:13px;color:var(--text2);margin-bottom:12px;">총점 <strong style="color:var(--text)">${total}점 / 24점</strong></div>`;

	getAssessmentReportItems().forEach(({ name, score, flagged, notes }) => {
		const { bg, fg } = getScoreColor(score);
		html += `<div class="report-line">
			<div>
				<div style="display:flex;align-items:center;gap:8px;margin-bottom:${flagged.length || notes ? "4px" : "0"}">
					<span class="report-name">${name}</span>
					<span class="report-score-badge" style="background:${bg};color:${fg}">${score}점</span>
				</div>
				${flagged.length ? `<div class="report-flags">⚠ ${flagged.join(" · ")}</div>` : ""}
				${notes ? `<div class="report-flags" style="color:var(--text3)">📝 ${notes}</div>` : ""}
			</div>
		</div>`;
	});

	// VO2 row
	const vGrade = vo2State.grade;
	const vBg = vGrade ? vGrade.bg : "var(--surface2)";
	const vFg = vGrade ? vGrade.fg : "var(--text3)";
	const vInfo =
		vo2State.vo2 !== null
			? `VO₂ Max: ${vo2State.vo2.toFixed(1)} ml/kg/min · ${vGrade ? vGrade.label : ""}`
			: "미입력";
	html += `<div class="report-line">
		<div>
			<div style="display:flex;align-items:center;gap:8px;">
				<span class="report-name">VO₂ Max Test</span>
				<span class="report-score-badge" style="background:${vBg};color:${vFg}">${vo2State.score}점</span>
			</div>
			<div class="report-flags">${vInfo}</div>
		</div>
	</div>`;

	container.innerHTML = html;
	byId("modal-overlay").classList.add("open");
}

function closeModalDirect() {
	byId("modal-overlay").classList.remove("open");
}

function copyReportToClipboard() {
	const total = getTotal();
	const lines = [
		"베이직 펑션 평가 결과",
		`총점: ${total} / 24점`,
		"",
		...getAssessmentReportItems().map(({ id, name, score, flagged, notes }) => {
			let line = `${id}. ${name}: ${score}점`;
			if (flagged.length) line += `\n   ⚠ ${flagged.join(", ")}`;
			if (notes) line += `\n   📝 ${notes}`;
			return line;
		}),
		`8. VO₂ Max Test: ${vo2State.score}점` +
			(vo2State.vo2 !== null
				? `\n   VO₂ Max: ${vo2State.vo2.toFixed(1)} ml/kg/min · ${vo2State.grade ? vo2State.grade.label : ""}`
				: ""),
	];
	navigator.clipboard
		.writeText(lines.join("\n"))
		.then(() => {
			alert("클립보드에 복사되었습니다!");
		})
		.catch(() => {
			alert("복사에 실패했습니다. 직접 선택해서 복사해 주세요.");
		});
}

// ── 이벤트 위임 — addEventListener 위임 패턴으로 정적·동적 요소 처리 (window 오염 방지) ──
// 정적 액션 버튼 (data-action)
delegate(document, "click", "[data-action]", (e, el) => {
	switch (el.dataset.action) {
		case "reset":
			resetEntireForm();
			break;
		case "report":
			openReportModal();
			break;
		case "print":
			window.print();
			break;
		case "copy":
			copyReportToClipboard();
			break;
		case "close-modal":
			closeModalDirect();
			break;
	}
});
// VO₂ 카드 펌칭
delegate(document, "click", ".vo2-header", () => toggleVo2());
// VO₂ 점수 증감
delegate(document, "click", "[data-vo2-delta]", (e, el) =>
	setVo2Score(Number(el.dataset.vo2Delta)),
);
// 항목별 체크·점수·펼침 (동적 생성 요소)
delegate(document, "click", ".check-row", (e, el) =>
	toggleCheck(Number(el.dataset.id), Number(el.dataset.idx)),
);
delegate(document, "click", ".item-card .score-btn", (e, el) =>
	adjustScore(Number(el.dataset.aid), Number(el.dataset.delta)),
);
delegate(document, "click", ".expand-btn", (e, el) =>
	toggleBasicFunctionDetail(Number(el.dataset.id)),
);
// 메모 저장 (동적 생성 요소)
delegate(document, "input", ".notes-area", (e, el) =>
	saveNotes(Number(el.dataset.id), el.value),
);
// VO₂ 입력 계산
delegate(document, "input", ".vo2-input", () => updateVO2Disp());
// 결과 모달 배경(overlay 자신) 클릭 시 닫기
delegate(document, "click", "#modal-overlay", (e, el) => {
	if (e.target === el) closeModalDirect();
});

// ── 시작 ──
buildItems();