// 파일 용도: 회원 상세 조회·화면 조립 — member-detail.html 페이지의 데이터 로드와 렌더 조합
// 기법: 조회(getRecords)·목록(renderRecords)·갱신(refreshRecords)·초기화(init)를 소유하고,
//       렌더 세부는 member-info-card·charts·checkdoc-compare·export-image 모듈에 위임한다.
import { recordMax, sessionLabel } from "@check-doc/record-stats.js";
import { loadRecordsByMember, recordStore } from "@check-doc/record-store.js";
import { getRecordsByMember } from "@check-doc/record-utils.js";
import { TPL } from "@infra/templates.js";
import { renderStatCards } from "@member/charts.js";
import { fillCompareSelects } from "@member/checkdoc-compare.js";
import { downloadPdf, exportMemberDetailPNG } from "@member/export-image.js";
import { renderInfoCard } from "@member/member-info-card.js";
import { loadMembers, memberStore } from "@member/member-store.js";
import { getMemberById } from "@member/member-utils.js";
import { sum } from "@tools/utils-array.js";
import { byId, setHTML } from "@tools/utils-dom.js";

/**
 * 회원의 기록을 날짜 오름차순으로 반환한다.
 * @param {string} memberId 대상 회원 member_ID
 * @returns {import("@infra/store.js").CheckRecord[]} 현재 회원의 체크기록 목록
 */
export function getRecords(memberId) {
	const records = recordStore.getState().records;
	return getRecordsByMember(records, memberId);
}

/**
 * 체크 기록 목록 렌더링
 * @param {import("@infra/store.js").CheckRecord[]} records 회원의 체크기록 (날짜 오름차순)
 * @returns {void}
 */
export function renderRecords(records) {
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
 * 기록 변경(삭제) 후 화면 갱신 — 차트·목록·비교 셀렉터를 현재 스토어 기준으로 다시 그린다.
 * @param {string} memberId 대상 회원 member_ID
 * @returns {void}
 */
export function refreshRecords(memberId) {
	const records = getRecords(memberId);

	renderStatCards(records);
	renderRecords(records);
	fillCompareSelects(records);
}

/**
 * 초기 렌더링 — 회원을 조회해 정보 카드·통계·기록·비교 select를 채운다 (회원이 없으면 안내만 표시)
 * @param {string} memberId 대상 회원 member_ID
 * @returns {Promise<void>}
 */
export async function init(memberId) {
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

	renderInfoCard(member, getRecords(memberId).length);

	byId("new-record-btn").href = `check-doc-new.html?memberID=${encodeURIComponent(memberId)}`;
	byId("edit-member-btn").href = `member-edit.html?memberID=${encodeURIComponent(memberId)}`;

	refreshRecords(memberId);

	// PNG 내보내기 버튼 이벤트 (html2canvas CDN — member-detail.html에 defer 로드)
	const PNGExportButtonElem = byId("export-png-btn");

	if (PNGExportButtonElem) {
		PNGExportButtonElem.addEventListener("click", () => exportMemberDetailPNG(memberId));
	}

	// PDF 저장 버튼 이벤트 — Mason API가 생성한 한 장짜리 PDF를 다운로드한다
	const pdfBtn = byId("pdf-download-btn");
	if (pdfBtn) {
		pdfBtn.addEventListener("click", () => downloadPdf(memberId));
	}
}

/**
 * 기록 행을 클릭/키보드로 선택하면 해당 기록 조회 화면으로 이동한다.
 * @param {HTMLElement} el 클릭된 기록 행 (data-record-id 보유)
 * @returns {void}
 */
export const goView = el => (window.location.href = `check-doc-view.html?docID=${el.dataset.recordId}`);
