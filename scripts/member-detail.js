// 파일 용도: 회원 상세 조회 및 체크기록 비교 화면(member-detail.html)
// ?memberID= 로 회원을 조회하고, 회원 정보 카드·스파크라인 4종·체크 기록 탭·변화 분석 탭을 렌더링한다.
import { UI } from "./UI.js";
import { memberStore } from "./member-store.js";
import { recordStore } from "./record-store.js";
import { TPL, escapeHtml } from "./templates.js";
import { buildCompareTable, recordTotal, sparkline } from "./record-stats.js";
import { MOTION_TOTAL_MAX } from "./constants.js";
import "./components/app-header.js";

/** ?memberID= 파라미터 (없으면 0 — 미조회 상태) */
const memberId = Number(new URLSearchParams(window.location.search).get("memberID")) || 0;

/** 현재 회원 */
function getMember() {
	return memberStore.getState().members.find((m) => m.id === memberId);
}

/** 회원의 기록을 날짜 오름차순으로 */
function getRecords() {
	return recordStore
		.getState()
		.records.filter((r) => r.memberId === memberId)
		.sort((a, b) => a.date.localeCompare(b.date));
}

/** 회원 정보 카드 렌더링 */
function renderInfoCard(member) {
	UI.setText("md-title", member.name);
	UI.setText("md-sub", `체크기록 ${getRecords().length}건`);
	UI.setText("md-name", member.name);
	UI.setText("md-gender", member.gender || "-");
	UI.setText("md-trainer", member.trainer || "-");
	UI.setText("md-goal", member.goal || "-");
	document.title = `${member.name} — 회원 상세`;
}

/** 스파크라인 4종 (체중·골격근량·체지방량·총점) — 프로토타입 chart-stat 구조(최신값·변화 델타·회차 범위) */
function renderStatCards(records) {
	const series = (key) =>
		records.map((r) => {
			const v = parseFloat(r.payload.ib?.[key]);
			return Number.isNaN(v) ? NaN : v;
		});
	const totalSeries = records.map((r) => recordTotal(r.payload));
	const cards = [
		{ label: "체중", unit: "kg", values: series("w"), fmt: (v) => v.toFixed(1) },
		{ label: "골격근량", unit: "kg", values: series("m"), fmt: (v) => v.toFixed(1) },
		{ label: "체지방량", unit: "kg", values: series("fat"), fmt: (v) => v.toFixed(1) },
		{ label: "총점", unit: "/ 24", values: totalSeries, fmt: (v) => String(v) },
	];
	const firstSession = records[0]?.payload.session ?? "";
	const lastSession = records[records.length - 1]?.payload.session ?? "";
	UI.setHTML(
		"stat-cards",
		cards
			.map((c) => {
				const nums = c.values.filter((v) => !Number.isNaN(v));
				const latest = nums[nums.length - 1];
				const first = nums[0];
				const delta =
					nums.length > 1 && latest != null && first != null
						? `<span class="stat-delta ${latest >= first ? "delta-up" : "delta-down"}">${latest >= first ? "▲" : "▼"} ${Math.abs(latest - first).toFixed(1)}</span>`
						: "";
				return `
					<div class="stat-card">
						<div class="stat-label">${c.label}</div>
						<div class="stat-value">${latest != null ? c.fmt(latest) : "―"}<span class="stat-unit"> ${c.unit}</span>${delta}</div>
						${sparkline(c.values)}
						<div class="stat-range"><span>${escapeHtml(firstSession)}</span><span>${escapeHtml(lastSession)}</span></div>
					</div>`;
			})
			.join(""),
	);
}

/** 체크 기록 목록 렌더링 */
function renderRecords(records) {
	if (!records.length) {
		UI.setHTML("record-list", '<p class="record-empty">아직 체크기록이 없습니다. ＋ 체크기록 작성으로 시작하세요.</p>');
		return;
	}
	const rows = records.map((r) => ({
		id: r.id,
		session: r.payload.session || r.date,
		date: r.date,
		total: recordTotal(r.payload),
		max: MOTION_TOTAL_MAX,
	}));
	UI.setHTML("record-list", rows.map((r) => TPL.recordRow(r)).join(""));
}

/** 비교 select 채우기 */
function fillCompareSelects(records) {
	const cur = UI.byId("cmp-cur");
	const tgt = UI.byId("cmp-tgt");
	if (records.length < 2) {
		cur.innerHTML = `<option>비교할 기록 ${records.length}건 (2건 이상 필요)</option>`;
		tgt.innerHTML = `<option>―</option>`;
		UI.setHTML("compare-result", "");
		return;
	}
	const opts = records
		.map((r) => `<option value="${r.id}">${r.payload.session || r.date} (${r.date})</option>`)
		.join("");
	cur.innerHTML = opts;
	tgt.innerHTML = opts;
	cur.value = String(records[records.length - 1].id);
	tgt.value = String(records[records.length - 2].id);
	renderCompare();
}

/** 비교 테이블 렌더링 */
function renderCompare() {
	const curId = Number(UI.byId("cmp-cur").value);
	const tgtId = Number(UI.byId("cmp-tgt").value);
	const all = getRecords();
	const cur = all.find((r) => r.id === curId);
	const tgt = all.find((r) => r.id === tgtId);
	if (!cur || !tgt) return;
	UI.setHTML("compare-result", buildCompareTable(cur, tgt));
}

/** 탭 전환 (role=tablist 규약: aria-selected·tabindex 관리) */
function switchTab(tabName) {
	const tabs = UI.queryAll(".tab-btn");
	tabs.forEach((btn) => {
		const active = btn.dataset.tab === tabName;
		btn.setAttribute("aria-selected", String(active));
		btn.tabIndex = active ? 0 : -1;
	});
	UI.byId("panel-records").hidden = tabName !== "records";
	UI.byId("panel-compare").hidden = tabName !== "compare";
}

/** 탭 키보드 방향키 이동 (role=tablist 규약) */
function onTabKeydown(e, tabs) {
	if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
	e.preventDefault();
	const idx = tabs.findIndex((t) => t.dataset.tab === e.target.dataset.tab);
	const next = (idx + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
	switchTab(tabs[next].dataset.tab);
	tabs[next].focus();
}

/** 기록 변경(삭제) 후 화면 갱신 */
function refreshRecords() {
	const records = getRecords();
	renderStatCards(records);
	renderRecords(records);
	fillCompareSelects(records);
}

// ── 시작 ──
function init() {
	const member = getMember();
	if (!member) {
		UI.setHTML("stat-cards", "");
		UI.setHTML("record-list", '<p class="record-empty">회원을 찾을 수 없습니다. 회원 목록에서 다시 선택하세요.</p>');
		UI.byId("new-record-btn").style.display = "none";
		return;
	}
	renderInfoCard(member);
	UI.byId("new-record-btn").href = `check-doc-new.html?memberID=${memberId}`;
	UI.byId("edit-member-btn").href = `member-edit.html?memberID=${memberId}`;
	refreshRecords();
}

// 이벤트 1회 등록
UI.delegate(document, "click", "[data-del-record]", (e, el) => {
	e.stopPropagation();
	recordStore.setState((prev) => ({
		...prev,
		records: prev.records.filter((r) => r.id !== Number(el.dataset.delRecord)),
	}));
	refreshRecords();
});
// 기록 행 클릭/키보드 → 조회 화면 (삭제 버튼은 제외)
const goView = (el) => (window.location.href = `check-doc-view.html?docID=${el.dataset.recordId}`);
UI.delegate(document, "click", ".record-row", (e, el) => {
	if (e.target.closest("[data-del-record]")) return;
	goView(el);
});
UI.delegate(document, "keydown", ".record-row", (e, el) => {
	if ((e.key === "Enter" || e.key === " ") && !e.target.closest("[data-del-record]")) {
		e.preventDefault();
		goView(el);
	}
});
const tabs = UI.queryAll(".tab-btn");
tabs.forEach((btn) => {
	btn.addEventListener("click", () => switchTab(btn.dataset.tab));
	btn.addEventListener("keydown", (e) => onTabKeydown(e, tabs));
});
UI.byId("cmp-cur").addEventListener("change", renderCompare);
UI.byId("cmp-tgt").addEventListener("change", renderCompare);

init();
