// 파일 용도: 베이직 펑션 평가 전용 스크립트 — 항목 카드·체크·VO₂ Max Test·점수/등급·리포트 (basic_function_assessment_2 전용)
// DEPENDS: ASSESSMENT_ITEMS, ARR, VAL, UI, calcVo2Value, getVo2Grade, getGradeMeta + 상수 모듈
// Warning: `checkday.js`와 기능 중복 많음 (본 화면은 별도 상태·렌더링 구조 사용)
import { ASSESSMENT_ITEMS } from "./assessment-data.js";
import { ARR } from "./utils-array.js";
import { VAL } from "./validation.js";
import { UI } from "./UI.js";
import { calcVo2Value, getVo2Grade } from "./vo2.js";
import { getGradeMeta } from "./grade.js";
import { SCORE_MIN, SCORE_MAX, DOT_COUNT, MOTION_TOTAL_MAX } from "./constants.js";

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

const VO2_GRADE_COLORS = {
	excellent: { bg: "#EAF3DE", fg: "#3B6D11" },
	good: { bg: "#E6F1FB", fg: "#185FA5" },
	above_avg: { bg: "#E6F1FB", fg: "#185FA5" },
	average: { bg: "#FAEEDA", fg: "#854F0B" },
	below_avg: { bg: "#FAEEDA", fg: "#854F0B" },
	poor: { bg: "#FCEBEB", fg: "#A32D2D" },
	very_poor: { bg: "#FCEBEB", fg: "#A32D2D" },
};

// ── VO₂ 확장/계산 ──
function toggleVo2() {
	const body = UI.byId("vo2-body");
	const arrow = UI.byId("vo2-arrow");
	const open = body.classList.toggle("open");
	arrow.style.transform = open ? "rotate(180deg)" : "";
}

function calcVo2() {
	const age = VAL.num(UI.byId("v-age").value);
	const height = VAL.num(UI.byId("v-height").value);
	const weight = VAL.num(UI.byId("v-weight").value);
	const hr = VAL.num(UI.byId("v-hr").value);
	if (VAL.anyNaN(age, height, weight, hr)) return;

	const vr = calcVo2Value(age, height, weight, hr);
	vo2State.vo2 = vr;

	const gradeInfo = getVo2Grade(vr, age);
	vo2State.grade = gradeInfo;
	const color = VO2_GRADE_COLORS[gradeInfo.grade];

	UI.byId("vo2-val").textContent = vr.toFixed(1);
	const badge = UI.byId("vo2-grade-badge");
	badge.textContent = gradeInfo.label;
	badge.style.background = color.bg;
	badge.style.color = color.fg;

	UI.byId("vo2-result-box").style.display = "block";
	UI.byId("vo2-preview").textContent = vr.toFixed(1) + " ml/kg/min";

	// Highlight table row & column
	highlightNormTable(gradeInfo.grade, gradeInfo.col);

	// Auto-suggest score
	setVo2Score(0, gradeInfo.score);
}

function highlightNormTable(grade, col) {
	const rows = UI.all("#vo2-table tbody tr");
	rows.forEach((row) => {
		row.classList.remove("highlight-row");
		// Reset all cell backgrounds
		Array.from(row.cells).forEach((td, i) => {
			td.style.background = "";
			td.style.color = "";
			td.style.fontWeight = "";
		});
	});
	const targetRow = UI.q(`#vo2-table tr[data-grade="${grade}"]`);
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
		vo2State.score = VAL.bound(vo2State.score + delta, SCORE_MIN, SCORE_MAX);
	}
	const el = UI.byId("vo2-score-display");
	el.textContent = vo2State.score;
	el.dataset.score = vo2State.score;
	for (let i = 0; i < DOT_COUNT; i++) {
		UI.byId("vd" + i).classList.toggle("filled", i < vo2State.score);
	}
	updateTotal();
}

// ── 항목 카드 빌드 ──
function buildItems() {
	const container = UI.byId("items-container");
	assessments.forEach((a) => {
		const card = document.createElement("div");
		card.className = "item-card";
		card.id = `card-${a.id}`;

		const dotsHTML = ARR.zeros(DOT_COUNT)
			.map((_, i) => `<div class="dot" id="dot-${a.id}-${i}"></div>`)
			.join("");
		const checksHTML = a.checks
			.map(
				(c, i) => `
			<div class="check-row" onclick="toggleCheck(${a.id}, ${i})">
				<div class="check-box" id="chk-${a.id}-${i}"></div>
				<span class="check-label" id="chklbl-${a.id}-${i}">${c}</span>
			</div>
		`,
			)
			.join("");

		card.innerHTML = `
			<div class="item-top">
				<div class="item-num">${a.id}</div>
				<div class="item-info">
					<div class="item-name">${a.name}</div>
					<div class="item-desc">${a.desc}</div>
				</div>
				<div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
					<div class="score-ctrl">
						<button class="score-btn" onclick="adjustScore(${a.id}, -1)" aria-label="감소">−</button>
						<span class="score-display" id="score-${a.id}" data-score="0">0</span>
						<button class="score-btn" onclick="adjustScore(${a.id}, +1)" aria-label="증가">+</button>
					</div>
					<div class="score-dots">${dotsHTML}</div>
				</div>
			</div>
			<button class="expand-btn" id="expand-${a.id}" onclick="toggleExpand(${a.id})">
				체크 항목 / 메모
				<span class="expand-arrow">▾</span>
			</button>
			<div class="item-detail" id="detail-${a.id}">
				${checksHTML}
				<textarea class="notes-area" id="notes-${a.id}" placeholder="메모를 입력하세요..." oninput="saveNotes(${a.id}, this.value)"></textarea>
			</div>
		`;
		container.appendChild(card);
	});
}

function toggleExpand(id) {
	const detail = UI.byId(`detail-${id}`);
	const btn = UI.byId(`expand-${id}`);
	detail.classList.toggle("open");
	btn.classList.toggle("open");
}

function toggleCheck(id, idx) {
	const key = `${id}-${idx}`;
	state[id].checks[key] = !state[id].checks[key];
	const box = UI.byId(`chk-${id}-${idx}`);
	const lbl = UI.byId(`chklbl-${id}-${idx}`);
	box.classList.toggle("checked", state[id].checks[key]);
	lbl.classList.toggle("checked-text", state[id].checks[key]);
}

function adjustScore(id, delta) {
	const s = state[id];
	s.score = VAL.bound(s.score + delta, SCORE_MIN, SCORE_MAX);
	const el = UI.byId(`score-${id}`);
	el.textContent = s.score;
	el.dataset.score = s.score;
	// Update dots
	for (let i = 0; i < DOT_COUNT; i++) {
		UI.byId(`dot-${id}-${i}`).classList.toggle("filled", i < s.score);
	}
	updateTotal();
}

function saveNotes(id, val) {
	state[id].notes = val;
}

const GRADE_STYLES = {
	"평가 전": { bg: "#f2f1ed", fg: "#9a9a94", hint: "" },
	우수: {
		bg: "#EAF3DE",
		fg: "#3B6D11",
		hint: "전반적으로 양호한 기능 상태입니다",
	},
	양호: {
		bg: "#E6F1FB",
		fg: "#185FA5",
		hint: "일부 개선이 필요한 영역이 있습니다",
	},
	보통: {
		bg: "#FAEEDA",
		fg: "#854F0B",
		hint: "여러 항목에서 기능 개선이 필요합니다",
	},
	"개선 필요": {
		bg: "#FCEBEB",
		fg: "#A32D2D",
		hint: "집중적인 기능 개선 프로그램을 권장합니다",
	},
};

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

	UI.byId("total-display").innerHTML = `${total} <span>/ ${max}</span>`;
	UI.byId("progress-fill").style.width = `${pct}%`;

	const meta = getGradeMeta(total, max);
	const style = GRADE_STYLES[meta.label];
	const badge = UI.byId("grade-badge");
	const hint = UI.byId("grade-hint");

	badge.textContent = meta.label;
	badge.style.background = style.bg;
	badge.style.color = style.fg;
	hint.textContent = style.hint;
}

function resetAll() {
	if (!confirm("모든 점수와 체크를 초기화할까요?")) return;
	assessments.forEach((a) => {
		state[a.id] = { score: 0, checks: {}, notes: "" };
		const el = UI.byId(`score-${a.id}`);
		el.textContent = "0";
		el.dataset.score = "0";
		for (let i = 0; i < DOT_COUNT; i++) {
			UI.byId(`dot-${a.id}-${i}`).classList.remove("filled");
		}
		a.checks.forEach((_, i) => {
			UI.byId(`chk-${a.id}-${i}`).classList.remove("checked");
			UI.byId(`chklbl-${a.id}-${i}`).classList.remove("checked-text");
		});
		const notes = UI.byId(`notes-${a.id}`);
		if (notes) notes.value = "";
		const detail = UI.byId(`detail-${a.id}`);
		detail.classList.remove("open");
		UI.byId(`expand-${a.id}`).classList.remove("open");
	});
	// Reset VO2
	vo2State.score = 0;
	vo2State.vo2 = null;
	vo2State.grade = null;
	["v-age", "v-height", "v-weight", "v-hr"].forEach((id) => {
		const el = UI.byId(id);
		if (el) el.value = "";
	});
	UI.byId("vo2-result-box").style.display = "none";
	UI.byId("vo2-preview").textContent = "—";
	const vScoreEl = UI.byId("vo2-score-display");
	if (vScoreEl) {
		vScoreEl.textContent = "0";
		vScoreEl.dataset.score = "0";
	}
	for (let i = 0; i < DOT_COUNT; i++) {
		const d = UI.byId("vd" + i);
		if (d) d.classList.remove("filled");
	}
	UI.all("#vo2-table tbody tr").forEach((r) =>
		r.classList.remove("highlight-row"),
	);
	updateTotal();
}

function getScoreColor(score) {
	if (score === 3) return { bg: "#EAF3DE", fg: "#3B6D11" };
	if (score === 2) return { bg: "#E6F1FB", fg: "#185FA5" };
	if (score === 1) return { bg: "#FAEEDA", fg: "#854F0B" };
	return { bg: "#f2f1ed", fg: "#9a9a94" };
}

function openReport() {
	const total = getTotal();
	const container = UI.byId("report-content");
	let html = `<div style="font-size:13px;color:#5a5a56;margin-bottom:12px;">총점 <strong style="color:#1a1a18">${total}점 / 24점</strong></div>`;

	assessments.forEach((a) => {
		const s = state[a.id];
		const { bg, fg } = getScoreColor(s.score);
		const flagged = a.checks.filter((_, i) => s.checks[`${a.id}-${i}`]);
		html += `<div class="report-line">
			<div>
				<div style="display:flex;align-items:center;gap:8px;margin-bottom:${flagged.length || s.notes ? "4px" : "0"}">
					<span class="report-name">${a.name}</span>
					<span class="report-score-badge" style="background:${bg};color:${fg}">${s.score}점</span>
				</div>
				${flagged.length ? `<div class="report-flags">⚠ ${flagged.join(" · ")}</div>` : ""}
				${s.notes ? `<div class="report-flags" style="color:#9a9a94">📝 ${s.notes}</div>` : ""}
			</div>
		</div>`;
	});

	// VO2 row
	const vGrade = vo2State.grade;
	const vBg = vGrade ? vGrade.bg : "#f2f1ed";
	const vFg = vGrade ? vGrade.fg : "#9a9a94";
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
	UI.byId("modal-overlay").classList.add("open");
}

function closeModal(e) {
	if (e.target === UI.byId("modal-overlay")) closeModalDirect();
}

function closeModalDirect() {
	UI.byId("modal-overlay").classList.remove("open");
}

function copyReport() {
	const total = getTotal();
	const lines = [
		"베이직 펑션 평가 결과",
		`총점: ${total} / 24점`,
		"",
		...assessments.map((a) => {
			const s = state[a.id];
			const flagged = a.checks.filter(
				(_, i) => s.checks[`${a.id}-${i}`],
			);
			let line = `${a.id}. ${a.name}: ${s.score}점`;
			if (flagged.length) line += `\n   ⚠ ${flagged.join(", ")}`;
			if (s.notes) line += `\n   📝 ${s.notes}`;
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

// ── 인라인 핸들러는 전역 스코프에서 해석되므로 window에 노출 (ESM은 모듈 스코프) ──
window.toggleVo2 = toggleVo2;
window.calcVo2 = calcVo2;
window.setVo2Score = setVo2Score;
window.resetAll = resetAll;
window.openReport = openReport;
window.closeModal = closeModal;
window.closeModalDirect = closeModalDirect;
window.copyReport = copyReport;
window.toggleCheck = toggleCheck;
window.adjustScore = adjustScore;
window.toggleExpand = toggleExpand;
window.saveNotes = saveNotes;

// ── 시작 ──
buildItems();