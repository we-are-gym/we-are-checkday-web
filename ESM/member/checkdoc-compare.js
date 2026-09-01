// 파일 용도: 체크기록 변화 분석 비교 — 회원 상세 화면(member-detail.html)의 회차별 비교 테이블
// 기법: 순수 렌더 함수 — 셀렉터(#cmp-cur·#cmp-tgt) 값만 읽어 record-stats.buildCompareTable로 비교 테이블을 만든다.
import { buildCompareTable } from "@check-doc/record-stats.js";
import { getRecordById } from "@check-doc/record-utils.js";
import { byId, setHTML } from "@tools/utils-dom.js";

/**
 * 비교 2종 셀렉터(#cmp-cur 좌측·#cmp-tgt 우측)에 회차 옵션을 채우고 디폴트를 정한다.
 * 좌측 셀렉터(#cmp-cur)=최신 직전 회차, 우측 셀렉터(#cmp-tgt)=최신 회차 — renderCompare()가
 * 좌측 선택 회차를 비교 테이블 좌측 열, 우측 선택 회차를 우측 열로 배치한다.
 * @param {import("@infra/store.js").CheckRecord[]} records 회원의 기록 (날짜 오름차순)
 * @returns {void}
 */
export function fillCompareSelects(records) {
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
	renderCompare(records);
}

/**
 * 좌·우측 셀렉터가 가리키는 두 기록을 비교 테이블로 렌더링한다.
 * @param {import("@infra/store.js").CheckRecord[]} records 비교 대상 후보 전체 기록 (날짜 오름차순)
 * @returns {void}
 */
export function renderCompare(records) {
	const leftId = Number(byId("cmp-cur").value);
	const rightId = Number(byId("cmp-tgt").value);
	const left = getRecordById(records, leftId);
	const right = getRecordById(records, rightId);
	if (!left || !right) return;
	setHTML(
		"compare-result",
		buildCompareTable(left, right, {
			showTotalScoreLabel: false,
			includeMovementHeader: true,
		})
	);
}
