// 파일 용도: 회원 상세 조회 및 체크기록 비교 화면(member-detail.html)
// ?memberID= 로 회원을 조회하고, 회원 정보 카드·스파크라인 4종·체크 기록 탭·변화 분석 탭을 렌더링한다.
import { byId, delegate, queryAll, setHTML, setText } from "./UI.js";
import { getNumberParam } from "./utils-url.js";
import { memberStore } from "./member-store.js";
import { recordStore } from "./record-store.js";
import { getMemberById } from "./member-utils.js";
import { TPL, escapeHtml } from "./templates.js";
import { buildCompareTable, recordTotal, sparkline } from "./record-stats.js";
import { MOTION_TOTAL_MAX } from "./constants.js";
import "./components/app-header.js";

/** ?memberID= 파라미터 (없으면 0 — 미조회 상태) */
const memberId = getNumberParam("memberID");

/** 현재 회원 */
function getMember() {
	return getMemberById(memberStore.getState().members, memberId);
}

/** 회원의 기록을 날짜 오름차순으로 */
function getRecords() {
	return recordStore
		.getState()
		.records.filter((r) => r.memberId === memberId)
		.sort((a, b) => a.date.localeCompare(b.date));
}

/** 회원 정보 카드 렌더링 (to-be: 프로토타입처럼 이름·성별·담당 트레이너 3행만) */
function renderInfoCard(member) {
	setText("md-title", member.name);
	setText("md-sub", `체크기록 ${getRecords().length}건`);
	setText("md-name", member.name);
	setText("md-gender", member.gender || "-");
	setText("md-trainer", member.trainer || "-");
	document.title = `${member.name} — 회원 상세`;
}

/** 통계 카드 — 프로토타입 배치: 단일 카드(통계 · 전체 회차 누적) 안에 chart-stat 4종 세로 누적
 *  (체지방률·체중·골격근량·체지방량 변화, 최신값+누적 델타+스파크라인+회차 범위) */
function renderStatCards(records) {
	if (!records.length) {
		setHTML("stat-charts", '<div class="sparkline-empty">아직 체크기록이 없어요</div>');
		return;
	}
	// 프로토타입 STAT_METRICS 순서: 체지방률 → 체중 → 골격근량 → 체지방량
	const metrics = [
		{ label: "체지방률 변화", key: "bfp", unit: "%", fmt: (v) => v.toFixed(1) },
		{ label: "체중 변화", key: "w", unit: "kg", fmt: (v) => v.toFixed(1) },
		{ label: "골격근량 변화", key: "m", unit: "kg", fmt: (v) => v.toFixed(1) },
		{ label: "체지방량 변화", key: "fat", unit: "kg", fmt: (v) => v.toFixed(1) },
	];
	const firstSession = records[0]?.payload.session ?? "";
	const lastSession = records[records.length - 1]?.payload.session ?? "";
	setHTML(
		"stat-charts",
		metrics
			.map((metric) => {
				const nums = records
					.map((r) => parseFloat(r.payload.ib?.[metric.key]))
					.filter((v) => !Number.isNaN(v));
				const latest = nums[nums.length - 1];
				const first = nums[0];
				const delta =
					nums.length > 1 && latest != null && first != null
						? `<span class="stat-delta ${latest >= first ? "delta-up" : "delta-down"}">${latest >= first ? "▲" : "▼"} ${Math.abs(latest - first).toFixed(1)}</span>`
						: "";
				return `
					<div class="chart-stat">
						<div class="chart-stat-top">
							<span class="k">${metric.label}</span>
							<span class="chart-latest">${latest != null ? metric.fmt(latest) : "―"}${metric.unit} ${delta}</span>
						</div>
						${sparkline(nums, { width: 260, height: 68 })}
						<div class="chart-stat-foot"><span>${escapeHtml(firstSession)}</span><span>${escapeHtml(lastSession)}</span></div>
					</div>`;
			})
			.join(""),
	);
}

/** 체크 기록 목록 렌더링 */
function renderRecords(records) {
	if (!records.length) {
		setHTML("record-list", '<p class="record-empty">아직 체크기록이 없습니다. ＋ 체크기록 작성으로 시작하세요.</p>');
		return;
	}
	const rows = records.map((r) => ({
		id: r.id,
		session: r.payload.session || r.date,
		date: r.date,
		total: recordTotal(r.payload),
		max: MOTION_TOTAL_MAX,
	}));
	setHTML("record-list", rows.map((r) => TPL.recordRow(r)).join(""));
}

/** 비교 select 채우기 — 프로토타입과 동일하게 비교 대상(기준) 기본값은 첫 체크기록 */
function fillCompareSelects(records) {
	const cur = byId("cmp-cur");
	const tgt = byId("cmp-tgt");
	if (records.length === 0) {
		cur.innerHTML = tgt.innerHTML = `<option>체크기록 없음</option>`;
		setHTML("compare-result", '<div class="sparkline-empty">비교할 체크기록이 없어요</div>');
		return;
	}
	const opts = records
		.map((r) => `<option value="${r.id}">${r.payload.session || r.date} (${r.date})</option>`)
		.join("");
	cur.innerHTML = opts;
	tgt.innerHTML = opts;
	cur.value = String(records[records.length - 1].id);
	tgt.value = String(records[0].id);
	renderCompare();
}

/** 비교 테이블 렌더링 */
function renderCompare() {
	const curId = Number(byId("cmp-cur").value);
	const tgtId = Number(byId("cmp-tgt").value);
	const all = getRecords();
	const cur = all.find((r) => r.id === curId);
	const tgt = all.find((r) => r.id === tgtId);
	if (!cur || !tgt) return;
	setHTML("compare-result", buildCompareTable(cur, tgt));
}

/** 탭 전환 (role=tablist 규약: aria-selected·tabindex 관리) */
function switchTab(tabName) {
	const tabs = queryAll(".tab-btn");
	tabs.forEach((btn) => {
		const active = btn.dataset.tab === tabName;
		btn.setAttribute("aria-selected", String(active));
		btn.tabIndex = active ? 0 : -1;
	});
	byId("panel-records").hidden = tabName !== "records";
	byId("panel-compare").hidden = tabName !== "compare";
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
/** 초기 렌더링 — 회원을 조회해 정보 카드·통계·기록·비교 select를 채운다 (회원이 없으면 안내만 표시)
 * @returns {void}
 */
function init() {
	const member = getMember();
	if (!member) {
		setHTML("stat-charts", "");
		setHTML("record-list", '<p class="record-empty">회원을 찾을 수 없습니다. 회원 목록에서 다시 선택하세요.</p>');
		byId("new-record-btn").style.display = "none";
		return;
	}
	renderInfoCard(member);
	byId("new-record-btn").href = `check-doc-new.html?memberID=${memberId}`;
	byId("edit-member-btn").href = `member-edit.html?memberID=${memberId}`;
	refreshRecords();
}

// 이벤트 1회 등록
delegate(document, "click", "[data-del-record]", (e, el) => {
	e.stopPropagation();
	recordStore.setState((prev) => ({
		...prev,
		records: prev.records.filter((r) => r.id !== Number(el.dataset.delRecord)),
	}));
	refreshRecords();
});
// 기록 행 클릭/키보드 → 조회 화면 (삭제 버튼은 제외)
/** 기록 행을 클릭/키보드로 선택하면 해당 기록 조회 화면으로 이동
 * @param {HTMLElement} el 클릭된 기록 행 (data-record-id 보유)
 * @returns {void}
 */
const goView = (el) => (window.location.href = `check-doc-view.html?docID=${el.dataset.recordId}`);
delegate(document, "click", ".record-row", (e, el) => {
	if (e.target.closest("[data-del-record]")) return;
	goView(el);
});
delegate(document, "keydown", ".record-row", (e, el) => {
	if ((e.key === "Enter" || e.key === " ") && !e.target.closest("[data-del-record]")) {
		e.preventDefault();
		goView(el);
	}
});
const tabs = queryAll(".tab-btn");
tabs.forEach((btn) => {
	btn.addEventListener("click", () => switchTab(btn.dataset.tab));
	btn.addEventListener("keydown", (e) => onTabKeydown(e, tabs));
});
byId("cmp-cur").addEventListener("change", renderCompare);
byId("cmp-tgt").addEventListener("change", renderCompare);

init();
