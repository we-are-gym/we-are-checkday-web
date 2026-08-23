// 파일 용도: 회원 상세 조회 및 체크기록 비교 화면(member-detail.html)
// ?memberID= 로 회원을 조회하고, 회원 정보 카드·스파크라인 4종·체크 기록 탭·변화 분석 탭을 렌더링한다.
import { buildCompareTable, recordMax, sessionLabel, sparkline } from "@check-doc/record-stats.js";
import { deleteRecord, loadRecordsByMember, recordStore } from "@check-doc/record-store.js";
import { getRecordById, getRecordsByMember } from "@check-doc/record-utils.js";
import { requestBlob } from "@infra/api-client.js";
import { guardOnBfcache } from "@infra/auth.js";
import "@infra/components/app-header.js";
import { TPL, escapeHtml } from "@infra/templates.js";
import { loadMembers, memberStore } from "@member/member-store.js";
import { displayGender, getMemberById } from "@member/member-utils.js";
import { sum } from "@tools/utils-array.js";
import { byId, delegate, queryAll, queryOne, setHTML, setText } from "@tools/utils-dom.js";
import { getUrlParam } from "@tools/utils-url.js";

/** ?memberID= 파라미터 (문자열 member_ID) */
const memberId = getUrlParam("memberID");

/** 회원의 기록을 날짜 오름차순으로 반환
 * @returns {import("@infra/store.js").CheckRecord[]} 현재 회원의 체크기록 목록
 */
function getRecords() {
	const records = recordStore.getState().records;
	return getRecordsByMember(records, memberId);
}

/** 회원 정보 카드 렌더링 (to-be: 프로토타입처럼 이름·성별·담당 트레이너 3행만)
 * @param {import("@infra/store.js").Member} member 대상 회원
 * @returns {void}
 */
function renderInfoCard(member) {
	setText("md-title", member.name);
	setText("md-sub", `체크기록 ${getRecords().length}건`);
	setText("md-name", member.name);
	setText("md-gender", displayGender(member.gender) || "-");
	setText("md-trainer", member.trainer || "-");
	document.title = `${member.name} — 회원 상세`;
}

/** 통계 카드 — 프로토타입 배치: 단일 카드(통계 · 전체 회차 누적) 안에 chart-stat 4종 세로 누적
 *  (체지방률·체중·골격근량·체지방량 변화, 최신값+누적 델타+스파크라인+회차 범위)
 * @param {import("@infra/store.js").CheckRecord[]} records 회원의 체크기록 (날짜 오름차순)
 * @returns {void}
 */
function renderStatCards(records) {
	if (!records.length) {
		setHTML("stat-charts", '<div class="sparkline-empty">아직 체크기록이 없어요</div>');
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
			fmt: v => v.toFixed(1),
		},
		{
			label: "체중 변화",
			key: "w",
			unit: "kg",
			deltaUnit: "kg",
			deltaDigits: 1,
			fmt: v => v.toFixed(1),
		},
		{
			label: "골격근량 변화",
			key: "m",
			unit: "kg",
			deltaUnit: "kg",
			deltaDigits: 1,
			fmt: v => v.toFixed(1),
		},
		{
			label: "체지방량 변화",
			key: "fat",
			unit: "kg",
			deltaUnit: "kg",
			deltaDigits: 1,
			fmt: v => v.toFixed(1),
		},
		{
			label: "내장지방 변화",
			key: "vis",
			unit: "레벨",
			deltaUnit: "레벨",
			deltaDigits: 0,
			fmt: v => v.toFixed(0),
		},
	];
	const firstSession = records[0]?.payload.session ?? "";
	const lastSession = records[records.length - 1]?.payload.session ?? "";
	setHTML(
		"stat-charts",
		metrics
			.map(metric => {
				const nums = records.map(r => parseFloat(r.payload.ib?.[metric.key])).filter(v => !Number.isNaN(v));
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
			.join("")
	);
}

/** 체크 기록 목록 렌더링
 * @param {import("@infra/store.js").CheckRecord[]} records 회원의 체크기록 (날짜 오름차순)
 * @returns {void}
 */
function renderRecords(records) {
	if (!records.length) {
		setHTML("record-list", '<p class="record-empty">아직 체크기록이 없습니다. ＋ 체크기록 작성으로 시작하세요.</p>');
		return;
	}
	// to-be: 회차·날짜·총점 — 회차는 sessionLabel로 레거시 "2026-04 (1회차)"에서도 "1회차"만 추출
	const rows = records.map(r => ({
		id: r.id,
		session: sessionLabel(r.payload.session || r.date),
		date: r.date,
		total: sum(r.payload.scores || []),
		max: recordMax(r.payload),
	}));
	setHTML("record-list", rows.map(r => TPL.recordRow(r)).join(""));
}

/**
 * 비교 2종 셀렉터(#cmp-cur 좌측·#cmp-tgt 우측)에 회차 옵션을 채우고 디폴트를 정한다.
 * 좌측 셀렉터(#cmp-cur)=최신 직전 회차, 우측 셀렉터(#cmp-tgt)=최신 회차 — renderCompare()가
 * 좌측 선택 회차를 비교 테이블 좌측 열, 우측 선택 회차를 우측 열로 배치한다.
 * @param {import("@infra/store.js").CheckRecord[]} records 회원의 기록 (날짜 오름차순)
 * @returns {void}
 */
function fillCompareSelects(records) {
	const leftSel = byId("cmp-cur");
	const rightSel = byId("cmp-tgt");
	if (records.length === 0) {
		leftSel.innerHTML = rightSel.innerHTML = `<option>체크기록 없음</option>`;
		setHTML("compare-result", '<div class="sparkline-empty">비교할 체크기록이 없어요</div>');
		return;
	}
	const opts = records.map(r => `<option value="${r.id}">${r.payload.session || r.date} (${r.date})</option>`).join("");
	leftSel.innerHTML = opts;
	rightSel.innerHTML = opts;
	// 좌측 셀렉터: 직전 회차 (records.length >= 2면 length-2, 아니면 0)
	leftSel.value = String(records[Math.max(0, records.length - 2)].id);
	// 우측 셀렉터: 최신 회차
	rightSel.value = String(records[records.length - 1].id);
	renderCompare();
}

/** 좌·우측 셀렉터가 가리키는 두 기록을 비교 테이블로 렌더링한다
 * @returns {void}
 */
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
		})
	);
}

/** 탭 전환 (role=tablist 규약: aria-selected·tabindex 관리)
 * @param {string} tabName 활성화할 탭 키 ("records" | "compare")
 * @returns {void}
 */
function switchTab(tabName) {
	const tabs = queryAll(".tab-btn");

	tabs.forEach(btn => {
		const active = btn.dataset.tab === tabName;
		btn.setAttribute("aria-selected", String(active));
		btn.tabIndex = active ? 0 : -1;
	});

	byId("panel-records").hidden = tabName !== "records";
	byId("panel-compare").hidden = tabName !== "compare";
}

/** 탭 키보드 방향키 이동 (role=tablist 규약)
 *
 * @param {KeyboardEvent} e 키보드 이벤트
 * @param {HTMLElement[]} tabs 전체 탭 버튼 목록
 *
 * @returns {void}
 */
function onTabKeydown(e, tabs) {
	if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
	e.preventDefault();

	const idx = tabs.findIndex(t => t.dataset.tab === e.target.dataset.tab);

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

/**
 * 회원 상세 화면을 html2canvas로 캡처해 PNG로 다운로드한다.
 * - 캡처 대상: <main> (회원 정보·통계·기록 또는 비교 패널 전체)
 * - 캡처 직전 상호작용 버튼(편집·이미지 저장·기록 행 삭제 등)을 잠시 숨겨 이미지에 노출되지 않게 하고,
 *   탭(.tab-btn)은 이미지에 그대로 노출되도록 둔다. 완료 후 숨김을 복원한다.
 * - 네이티브 <select>는 html2canvas가 텍스트를 아래로 치우쳐 그려 글자가 잘리므로,
 *   캡처 동안 선택된 옵션 텍스트를 담은 <div class="export-select">로 잠시 교체해 렌더한다.
 *
 * @returns {void}
 */
function exportMemberDetailPNG() {
	const target = queryOne("main");

	if (!target) {
		alert("내보낼 화면을 찾을 수 없습니다.");
		return;
	}

	if (typeof html2canvas === "undefined") {
		alert("이미지 생성 라이브러리(html2canvas)를 불러오지 못했습니다. 네트워크 확인 후 다시 시도하세요.");
		return;
	}

	// 캡처에서만 잠깐 숨길 상호작용 컨트롤 — 탭(.tab-btn)은 이미지에 노출하므로 제외한다
	const controls = target.querySelectorAll("a.btn, button:not(.tab-btn)");

	const restoreControls = () =>
		controls.forEach(el => {
			el.style.visibility = el.dataset.pngPrevVisibility || "";
			delete el.dataset.pngPrevVisibility;
		});

	controls.forEach(el => {
		el.dataset.pngPrevVisibility = el.style.visibility;
		el.style.visibility = "hidden";
	});

	// 비교 셀렉터를 텍스트 박스(<div class="export-select">)로 잠시 교체 — html2canvas의 select 텍스트 잘림 방지
	const selects = [...target.querySelectorAll(".compare-field select")];

	const restoredSelects = selects.map(sel => {
		const opt = sel.options[sel.selectedIndex];
		const div = document.createElement("div");

		div.className = "export-select";
		div.textContent = opt ? opt.text : "";
		div.style.width = `${sel.offsetWidth}px`;
		div.style.height = `${sel.offsetHeight}px`;

		sel.replaceWith(div);
		return { sel, div };
	});

	const restoreSelects = () => restoredSelects.forEach(({ sel, div }) => div.replaceWith(sel));

	html2canvas(target, {
		backgroundColor: "#131313",
		scale: 2,
		useCORS: true,
	})
		.then(canvas => {
			restoreSelects();
			restoreControls();

			const member = getMemberById(memberStore.getState().members, memberId);
			const link = document.createElement("a");
			link.download = `체크데이_${member ? member.name : "회원"}_${new Date().toISOString().slice(0, 10)}.png`;
			link.href = canvas.toDataURL("image/png");
			link.click();
		})
		.catch(err => {
			restoreSelects();
			restoreControls();
			alert(`이미지 생성에 실패했어요: ${err.message}`);
		});
}

/**
 * 회원 정보를 Mason API가 생성한 한 장짜리 PDF로 다운로드한다.
 * 서버 Content-Disposition의 파일명은 Blob 다운로드에서는 무시되므로,
 * 클라이언트에서 회원명·생성일로 파일명을 직접 명명한다.
 * @returns {Promise<void>}
 */
async function downloadPdf() {
	const member = getMemberById(memberStore.getState().members, memberId);
	const name = member ? member.name : "회원";
	try {
		const blob = await requestBlob(`/members/${memberId}/pdf`);
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `체크데이_${name}_${new Date().toISOString().slice(0, 10)}.pdf`;
		document.body.appendChild(link);
		link.click();
		link.remove();
		URL.revokeObjectURL(url);
	} catch (err) {
		console.error("PDF 다운로드 실패:", err);
		// 401은 requestBlob 내부에서 goToLogin()이 이미 리다이렉트를 처리하므로 안내를 건너뛴다
		if (err?.status === 401) return;
		alert(`PDF 다운로드에 실패했습니다: ${err.message || "알 수 없는 오류"}`);
	}
}

/** 초기 렌더링 — 회원을 조회해 정보 카드·통계·기록·비교 select를 채운다 (회원이 없으면 안내만 표시)
 * @returns {void}
 */
async function init() {
	try {
		await Promise.all([loadMembers(), loadRecordsByMember(memberId)]);
	} catch (err) {
		console.error("회원/기록 로드 실패:", err);
		setHTML("stat-charts", "");
		setHTML("record-list", '<p class="record-empty">회원 정보를 불러오지 못했습니다.</p>');
		byId("new-record-btn").style.display = "none";
		return;
	}

	const member = getMemberById(memberStore.getState().members, memberId);

	if (!member) {
		setHTML("stat-charts", "");

		setHTML("record-list", '<p class="record-empty">회원을 찾을 수 없습니다. 회원 목록에서 다시 선택하세요.</p>');

		byId("new-record-btn").style.display = "none";

		return;
	}

	renderInfoCard(member);

	byId("new-record-btn").href = `check-doc-new.html?memberID=${encodeURIComponent(memberId)}`;
	byId("edit-member-btn").href = `member-edit.html?memberID=${encodeURIComponent(memberId)}`;

	refreshRecords();

	// PNG 내보내기 버튼 이벤트 (html2canvas CDN — member-detail.html에 defer 로드)
	const PNGExportButtonElem = byId("export-png-btn");

	if (PNGExportButtonElem) {
		PNGExportButtonElem.addEventListener("click", exportMemberDetailPNG);
	}

	// PDF 저장 버튼 이벤트 — Mason API가 생성한 한 장짜리 PDF를 다운로드한다
	const pdfBtn = byId("pdf-download-btn");
	if (pdfBtn) {
		pdfBtn.addEventListener("click", downloadPdf);
	}
}

// 이벤트 1회 등록
delegate(document, "click", "[data-del-record]", async (e, el) => {
	e.stopPropagation();
	if (!confirm("체크기록을 삭제하시겠습니까?")) {
		return;
	}
	try {
		await deleteRecord(Number(el.dataset.delRecord));
		refreshRecords();
	} catch (err) {
		console.error("기록 삭제 실패:", err);
	}
});

// 기록 행 클릭/키보드 → 조회 화면 (삭제 버튼은 제외)
/** 기록 행을 클릭/키보드로 선택하면 해당 기록 조회 화면으로 이동
 * @param {HTMLElement} el 클릭된 기록 행 (data-record-id 보유)
 * @returns {void}
 */
const goView = el => (window.location.href = `check-doc-view.html?docID=${el.dataset.recordId}`);

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
tabs.forEach(btn => {
	btn.addEventListener("click", () => switchTab(btn.dataset.tab));
	btn.addEventListener("keydown", e => onTabKeydown(e, tabs));
});
byId("cmp-cur").addEventListener("change", renderCompare);
byId("cmp-tgt").addEventListener("change", renderCompare);

guardOnBfcache();
init();
