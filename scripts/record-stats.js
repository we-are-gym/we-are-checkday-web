// 파일 용도: 체크기록 통계 — 스파크라인·기록 지표·비교 테이블 생성 (회원 상세 공용, 순수 함수)
import { ASSESSMENT_ITEMS_FULL } from "./assessment-data.js";
import { TPL } from "./templates.js";

/** 인바디 표시 키 순서 (라벨 포함) */
export const IB_KEYS = [
	{ key: "w", label: "체중 (kg)" },
	{ key: "m", label: "골격근량 (kg)" },
	{ key: "fat", label: "체지방량 (kg)" },
	{ key: "bmi", label: "BMI" },
	{ key: "bfp", label: "체지방률 (%)" },
	{ key: "bmr", label: "기초대사량 (kcal)" },
	{ key: "vis", label: "내장지방" },
];

/**
 * 기록 1건의 총점 (scores 합계)
 * @param {import("./store.js").CheckRecordPayload} payload
 * @returns {number}
 */
export function recordTotal(payload) {
	return (payload.scores || []).reduce((a, b) => a + b, 0);
}

/**
 * 숫자 배열을 인라인 SVG 폴리라인(스파크라인)으로 변환
 * @param {number[]} values 시간순 수치
 * @param {{ width?: number, height?: number }} [opts]
 * @returns {string} SVG 마크업 (데이터 부족 시 빈 표기)
 */
export function sparkline(values, { width = 140, height = 36 } = {}) {
	const nums = values.filter((v) => !Number.isNaN(parseFloat(v))).map(Number);
	if (nums.length < 2) {
		return `<span class="spark-empty">기록 ${nums.length ? "1건" : "없음"}</span>`;
	}
	const min = Math.min(...nums);
	const max = Math.max(...nums);
	const range = max - min || 1;
	const step = width / (nums.length - 1);
	const pts = nums
		.map((v, i) => {
			const x = (i * step).toFixed(1);
			const y = (height - 4 - ((v - min) / range) * (height - 8)).toFixed(1);
			return `${x},${y}`;
		})
		.join(" ");
	return `<svg class="sparkline" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="회차별 추세 그래프">
		<polyline points="${pts}" fill="none" stroke="var(--spark)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
	</svg>`;
}

/**
 * 변화 표기 (증가 ▲ / 감소 ▼ / 유지 ―) — 상세·비교 화면 공용
 * @param {number} d 변화량
 * @returns {string} 델타 마크업
 */
export function deltaHTML(d) {
	if (d > 0) return `<span class="delta-up">▲ ${d}</span>`;
	if (d < 0) return `<span class="delta-down">▼ ${Math.abs(d)}</span>`;
	return `<span class="delta-flat">―</span>`;
}

/**
 * 두 기록의 인바디·움직임 평가·총점 비교 테이블 생성 (인바디 표 + 움직임 평가 표)
 * @param {import("./store.js").CheckRecord} cur 최신(비교 대상)
 * @param {import("./store.js").CheckRecord} tgt 기준(이전)
 * @returns {string} 비교 테이블 HTML
 */
export function buildCompareTable(cur, tgt) {
	const rows = [];
	IB_KEYS.forEach(({ key, label }) => {
		const c = parseFloat(cur.payload.ib?.[key]);
		const t = parseFloat(tgt.payload.ib?.[key]);
		if (Number.isNaN(c) || Number.isNaN(t)) return;
		rows.push({ label, cur: c.toFixed(1), tgt: t.toFixed(1), delta: deltaHTML(Number((c - t).toFixed(1))) });
	});
	ASSESSMENT_ITEMS_FULL.forEach((item, i) => {
		const c = cur.payload.scores?.[i];
		const t = tgt.payload.scores?.[i];
		if (c == null || t == null) return;
		rows.push({ label: item.name, cur: `${c}점`, tgt: `${t}점`, delta: deltaHTML(c - t) });
	});
	const ct = recordTotal(cur.payload);
	const tt = recordTotal(tgt.payload);
	rows.push({ label: "총점", cur: `${ct}점`, tgt: `${tt}점`, delta: deltaHTML(ct - tt) });
	return TPL.compareTable({ curLabel: cur.payload.session, tgtLabel: tgt.payload.session, rows });
}