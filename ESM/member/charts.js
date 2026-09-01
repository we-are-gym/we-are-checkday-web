// 파일 용도: 변화 차트(통계 카드) 렌더링 — 회원 상세 화면(member-detail.html)의 지표별 스파크라인 카드
// 기법: 순수 렌더 함수 — record-stats.sparkline으로 SVG 스파크라인을 생성해 #stat-charts에 채운다.
import { sparkline } from "@check-doc/record-stats.js";
import { escapeHtml } from "@infra/templates.js";
import { setHTML } from "@tools/utils-dom.js";

/**
 * 통계 카드 — 프로토타입 배치: 단일 카드(통계 · 전체 회차 누적) 안에 chart-stat 4종 세로 누적
 *  (체지방률·체중·골격근량·체지방량 변화, 최신값+누적 델타+스파크라인+회차 범위)
 * @param {import("@infra/store.js").CheckRecord[]} records 회원의 체크기록 (날짜 오름차순)
 * @returns {void}
 */
export function renderStatCards(records) {
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
