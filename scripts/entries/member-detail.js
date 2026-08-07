// 파일 용도: 회원 상세 조회 및 체크기록 비교 화면(member-detail.html)
// ?memberID= 로 회원을 조회하고, 회원 정보 카드·스파크라인 4종·체크 기록 탭·변화 분석 탭을 렌더링한다.
import "@base/components/app-header.js";
import { TPL, escapeHtml } from "@base/templates.js";
import {
	byId,
	delegate,
	queryAll,
	queryOne,
	setHTML,
	setText,
} from "@base/UI.js";
import { getNumberParam } from "@base/utils-url.js";
import {
	buildCompareTable,
	recordMax,
	recordTotal,
	sessionLabel,
	sparkline,
} from "@check-doc/record-stats.js";
import { recordStore } from "@check-doc/record-store.js";
import { getRecordById, getRecordsByMember } from "@check-doc/record-utils.js";
import { memberStore } from "@member/member-store.js";
import { getMemberById } from "@member/member-utils.js";

/** ?memberID= 파라미터 (없으면 0 — 미조회 상태) */
const memberId = getNumberParam("memberID");

/** 회원의 기록을 날짜 오름차순으로 */
function getRecords() {
	const records = recordStore.getState().records;
	return getRecordsByMember(records, memberId);
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
		setHTML(
			"stat-charts",
			'<div class="sparkline-empty">아직 체크기록이 없어요</div>',
		);
		return;
	}
	// 프로토타입 STAT_METRICS 순서: 체지방률 → 체중 → 골격근량 → 체지방량, + 내장지방(to-be 추가)
	// deltaUnit: 변화량의 단위 — 체지방률은 퍼센트가 아닌 퍼센트포인트(%p)를 쓴다 (member-detail.html Caution 주석)
	const metrics = [
		{
			label: "체지방률 변화",
			key: "bfp",
			unit: "%",
			deltaUnit: "%p",
			deltaDigits: 1,
			fmt: (v) => v.toFixed(1),
		},
		{
			label: "체중 변화",
			key: "w",
			unit: "kg",
			deltaUnit: "kg",
			deltaDigits: 1,
			fmt: (v) => v.toFixed(1),
		},
		{
			label: "골격근량 변화",
			key: "m",
			unit: "kg",
			deltaUnit: "kg",
			deltaDigits: 1,
			fmt: (v) => v.toFixed(1),
		},
		{
			label: "체지방량 변화",
			key: "fat",
			unit: "kg",
			deltaUnit: "kg",
			deltaDigits: 1,
			fmt: (v) => v.toFixed(1),
		},
		{
			label: "내장지방 변화",
			key: "vis",
			unit: "레벨",
			deltaUnit: "레벨",
			deltaDigits: 0,
			fmt: (v) => v.toFixed(0),
		},
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
						? `<span class="stat-delta ${latest >= first ? "delta-up" : "delta-down"}">${latest >= first ? "▲" : "▼"} ${Math.abs(latest - first).toFixed(metric.deltaDigits)}${metric.deltaUnit}</span>`
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
		setHTML(
			"record-list",
			'<p class="record-empty">아직 체크기록이 없습니다. ＋ 체크기록 작성으로 시작하세요.</p>',
		);
		return;
	}
	// to-be: 회차·날짜·총점 — 회차는 sessionLabel로 레거시 "2026-04 (1회차)"에서도 "1회차"만 추출
	const rows = records.map((r) => ({
		id: r.id,
		session: sessionLabel(r.payload.session || r.date),
		date: r.date,
		total: recordTotal(r.payload),
		max: recordMax(r.payload),
	}));
	setHTML("record-list", rows.map((r) => TPL.recordRow(r)).join(""));
}

/**
 * 비교 2종 셀렉터(#cmp-cur 좌측·#cmp-tgt 우측)에 회차 옵션을 채우고 디폴트를 정한다.
 * 좌측 셀렉터(#cmp-cur)=최신 직전 회차, 우측 셀렉터(#cmp-tgt)=최신 회차 — renderCompare()가
 * 좌측 선택 회차를 비교 테이블 좌측 열, 우측 선택 회차를 우측 열로 배치한다.
 * @param {import("@base/store.js").CheckRecord[]} records 회원의 기록 (날짜 오름차순)
 * @returns {void}
 */
function fillCompareSelects(records) {
	const leftSel = byId("cmp-cur");
	const rightSel = byId("cmp-tgt");
	if (records.length === 0) {
		leftSel.innerHTML = rightSel.innerHTML = `<option>체크기록 없음</option>`;
		setHTML(
			"compare-result",
			'<div class="sparkline-empty">비교할 체크기록이 없어요</div>',
		);
		return;
	}
	const opts = records
		.map(
			(r) =>
				`<option value="${r.id}">${r.payload.session || r.date} (${r.date})</option>`,
		)
		.join("");
	leftSel.innerHTML = opts;
	rightSel.innerHTML = opts;
	// 좌측 셀렉터: 직전 회차 (records.length >= 2면 length-2, 아니면 0)
	leftSel.value = String(records[Math.max(0, records.length - 2)].id);
	// 우측 셀렉터: 최신 회차
	rightSel.value = String(records[records.length - 1].id);
	renderCompare();
}

function renderCompare() {
	const leftId = Number(byId("cmp-cur").value);
	const rightId = Number(byId("cmp-tgt").value);
	const all = getRecords();
	const left = getRecordById(all, leftId);
	const right = getRecordById(all, rightId);
	if (!left || !right) return;
	setHTML(
		"compare-result",
		buildCompareTable(left, right, {
			showTotalScoreLabel: false,
			includeMovementHeader: true,
		}),
	);
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

	const next =
		(idx + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;

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

function exportMemberDetailPDF() {
	const member = getMemberById(memberStore.getState().members, memberId);
	const records = getRecords();

	if (!member || records.length === 0) {
		alert("내보낼 데이터가 없습니다.");
		return;
	}

	// 인쇄용 창 열기
	const printWindow = window.open("", "_blank");
	if (!printWindow) {
		alert("팝업이 차단되었습니다. 팝업 허용 후 다시 시도하세요.");
		return;
	}

	// 스파크라인 SVG들을 이미지 데이터로 변환
	const sparklineSVGs =
		/*printWindow.*/ document.querySelectorAll("#stat-charts svg");
	console.log({ sparklineSVGs });

	const renderedChartSVGs = Array.from(sparklineSVGs).map((SVG) =>
		new XMLSerializer().serializeToString(SVG),
	);
	console.log({ renderedChartSVGs });

	const sparklineImages = renderedChartSVGs.map(
		(renderedSVG) =>
			`data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(renderedSVG)))}`,
	);
	console.log({ sparklineImages });

	// 비교 테이블 HTML 가져오기

	const inbodyCompareTableHTML =
		queryOne(".compare-table-inbody")?.outerHTML || "";

	const basicFunctionsCompareTableHTML =
		queryOne(".compare-table-basicFunctions")?.outerHTML || "";

	// 인쇄용 HTML 구성
	const printHtml = `
		<!doctype html>
		<html lang="ko">
		<head>
			<meta charset="UTF-8">
			<title>${escapeHtml(member.name)} 님 체크기록 - PDF 내보내기</title>
			<style>
				:root {
					--spark: black;
				}
				@media print {
					@page { margin: 15mm; size: A4; }
					body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 11px; line-height: 1.5; color: #1a1a1a; }
					.print-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #3478d4; padding-bottom: 10px; }
					.print-header h1 { font-size: 20px; margin: 0; color: #1a1a1a; }
					.print-header .meta { font-size: 12px; color: #666; margin-top: 4px; }
					.section { margin-bottom: 24px; page-break-inside: avoid; }
					.section h2 { font-size: 14px; border-bottom: 1px solid #3478d4; padding-bottom: 4px; margin-bottom: 12px; color: #3478d4; }
					.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 16px; }
					.grid-item { display: flex; flex-direction: column; }
					.grid-label { font-size: 10px; color: #666; text-transform: uppercase; }
					.grid-value { font-size: 13px; font-weight: 500; }
					.sparkline-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 16px; }
					.sparkline-item img { width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px; }
					table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 8px; }
					th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: center; }
					th { background: #f5f5f5; font-weight: 600; }
					.delta-up { color: #3478d4; }
					.delta-down { color: #d86b6b; }
					.delta-eq { color: #999; }
					.no-print { display: none; }
				}
				@media screen {
					body { padding: 20px; max-width: 800px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
					.print-btn { position: fixed; top: 20px; right: 20px; padding: 10px 20px; background: #3478d4; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; }
					.print-btn:hover { background: #2e68bd; }
				}
			</style>
		</head>
		<body>
			<button class="print-btn no-print" onclick="window.print()">인쇄 / PDF 저장</button>
			<div class="print-header">
				<h1>${escapeHtml(member.name)} 님 체크기록 요약</h1>
				<div class="meta">총 ${records.length}회차 · 담당: ${escapeHtml(member.trainer || "-")} · 성별: ${escapeHtml(member.gender || "-")}</div>
			</div>

			<div class="section">
				<h2>체성분 변화 차트 (스파크라인)</h2>
				<div class="sparkline-row">
					<!--
					${sparklineImages
						.map(
							(src, i) => `
								<div class="sparkline-item">
									<div class="grid-label">${["체지방률", "체중", "골격근량", "체지방량", "내장지방"][i] || `차트 ${i + 1}`}</div>
									<img src="${src}" alt="스파크라인">
								</div>
								`,
						)
						.join("")}
					-->
					${renderedChartSVGs
						.map(
							(renderedChartSVG, index) => `
								<div class="sparkline-item">
									<div class="grid-label">${["체지방률", "체중", "골격근량", "체지방량", "내장지방"][index] || `차트 ${index + 1}`}</div>
									${renderedChartSVG}
								</div>
								`,
						)
						.join("")}
				</div>
				${
					sparklineImages.length < 5
						? ""
						: `
				<!--div class="sparkline-row">
					<div class="sparkline-item">
						<div class="grid-label">내장지방</div>
						<img src="${sparklineImages[4]}" alt="내장지방 스파크라인">
					</div>
				</div-->
				`
				}
			</div>

			<div class="section">
				<h2>인바디 비교 테이블</h2>
				<!--div class="detail-card compare-result" id="compare-result" aria-live="polite" aria-atomic="true"-->
					${inbodyCompareTableHTML}
				<!--div-->
			</div>

			<div class="section">
				<h2>움직임 평가 비교</h2>
				<!--div class="detail-card compare-result" id="compare-result" aria-live="polite" aria-atomic="true"-->
					${basicFunctionsCompareTableHTML}
				<!--div-->
			</div>
		</body>
		</html>`;
	console.log(printHtml);

	printWindow.document.write(printHtml);
	printWindow.document.close();
}

/** 초기 렌더링 — 회원을 조회해 정보 카드·통계·기록·비교 select를 채운다 (회원이 없으면 안내만 표시)
 * @returns {void}
 */
function init() {
	const member = getMemberById(memberStore.getState().members, memberId);

	if (!member) {
		setHTML("stat-charts", "");

		setHTML(
			"record-list",
			'<p class="record-empty">회원을 찾을 수 없습니다. 회원 목록에서 다시 선택하세요.</p>',
		);

		byId("new-record-btn").style.display = "none";

		return;
	}

	renderInfoCard(member);

	byId("new-record-btn").href = `check-doc-new.html?memberID=${memberId}`;
	byId("edit-member-btn").href = `member-edit.html?memberID=${memberId}`;

	refreshRecords();

	// PDF 내보내기 버튼 이벤트
	const PDFExportButtonElem = byId("export-pdf-btn");

	if (PDFExportButtonElem) {
		console.log("PDF 내보내기 버튼 존재");
		PDFExportButtonElem.addEventListener("click", exportMemberDetailPDF);
	} else {
		console.warn("PDF 내보내기 버튼 비존재");
	}
}

// 이벤트 1회 등록
delegate(document, "click", "[data-del-record]", (e, el) => {
	e.stopPropagation();
	if (!confirm("체크기록을 삭제하시겠습니까?")) {
		return;
	}
	recordStore.setState((prev) => ({
		...prev,
		records: prev.records.filter(
			(r) => r.id !== Number(el.dataset.delRecord),
		),
	}));

	refreshRecords();
});

// 기록 행 클릭/키보드 → 조회 화면 (삭제 버튼은 제외)
/** 기록 행을 클릭/키보드로 선택하면 해당 기록 조회 화면으로 이동
 * @param {HTMLElement} el 클릭된 기록 행 (data-record-id 보유)
 * @returns {void}
 */
const goView = (el) =>
	(window.location.href = `check-doc-view.html?docID=${el.dataset.recordId}`);

delegate(document, "click", ".record-row", (e, el) => {
	if (e.target.closest("[data-del-record]")) return;
	goView(el);
});
delegate(document, "keydown", ".record-row", (e, el) => {
	if (
		(e.key === "Enter" || e.key === " ") &&
		!e.target.closest("[data-del-record]")
	) {
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
