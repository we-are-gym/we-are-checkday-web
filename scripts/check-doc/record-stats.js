// 파일 용도: 체크기록 통계 — 스파크라인·기록 지표·비교 테이블 생성 (회원 상세 공용, 순수 함수)
import { SCORE_MAX } from "@base/constants.js";
import { TPL } from "@base/templates.js";
import { resolveRecordItems } from "./assessment-data.js";

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
 * @param {import("@base/store.js").CheckRecordPayload} payload
 * @returns {number}
 */
export function recordTotal(payload) {
	return (payload.scores || []).reduce((a, b) => a + b, 0);
}

/**
 * 기록 1건의 총점 최댓값 — 항목 수 × 항목당 만점(3점)으로 파생한다.
 * 레거시 8항목 기록은 24, 체크기록 작성 5항목 기록은 15. (고정 상수 대신 scores 길이로 판단)
 * @param {import("@base/store.js").CheckRecordPayload} payload
 * @returns {number} 총점 최댓값 (scores 없으면 0)
 */
export function recordMax(payload) {
	return (payload.scores || []).length * SCORE_MAX;
}

/**
 * 숫자 배열을 인라인 SVG 스파크라인으로 변환 — 프로토타입 규격(260×68)
 * 폴리라인 + 각 지점 원(r2.6) + 실제 수치 라벨을 표시한다. 데이터가 1건이면 첫 회차 안내를,
 * 0건이면 빈 표기를 반환한다.
 * @param {number[]} values 시간순 수치 (NaN은 제외하고 사용)
 * @param {{ width?: number, height?: number }} [opts]
 * @returns {string} SVG 마크업 (데이터 부족 시 빈 표기)
 */
export function sparkline(values, { width = 260, height = 68 } = {}) {
	const nums = values.filter((v) => !Number.isNaN(parseFloat(v))).map(Number);

	if (nums.length === 0) {
		return `<span class="spark-empty">기록 없음</span>`;
	}

	if (nums.length === 1) {
		return `<span class="spark-empty">${nums[0]} · 첫 회차만 기록됨</span>`;
	}

	const padX = 10;

	const padTop = 20;
	const padBottom = 16;

	const min = Math.min(...nums);
	const max = Math.max(...nums);

	const range = max - min || 1; // 값이 전부 같으면 평평한 직선 — 실제로 변화가 없었다는 뜻
	const innerH = height - padTop - padBottom;
	const stepX = (width - 2 * padX) / (nums.length - 1);

	const pts = nums.map((v, i) => [
		padX + i * stepX,
		padTop + innerH * (1 - (v - min) / range),
	]);

	const poly = pts.map((p) => p.join(",")).join(" ");

	const dots = pts
		.map(
			([x, y]) =>
				`<circle cx="${x}" cy="${y}" r="2.6" fill="var(--spark)"/>`,
		)
		.join("");

	// 각 지점 위(꼭대기에 가까우면 아래)에 실제 수치를 라벨로 표시 — 그래프만 봐도 바로 읽히도록
	const labels = pts
		.map(([x, y], i) => {
			const nearTop = y < padTop + 10;
			const ly = nearTop ? y + 13 : y - 8;

			return `<text x="${x}" y="${ly}" font-size="9.5" text-anchor="middle" fill="var(--text3)">${nums[i]}</text>`;
		})
		.join("");

	return `
		<svg class="sparkline" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="회차별 추세 그래프" style="display:block; max-width:100%;">
			<polyline points="${poly}" fill="none" stroke="var(--spark)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
			${dots}
			${labels}
		</svg>`;
}

/**
 * 기록의 회차 표기만 추출한다 — 저장 형식 호환을 위해 "2026-04 (1회차)" 같은 레거시 문자열에서도 "1회차"를 뽑는다.
 * @param {string} [session] 기록의 회차 문자열 (예: "1회차", "2026-04 (1회차)")
 * @returns {string} 회차 표기 (추출 불가 시 원문)
 */
export function sessionLabel(session) {
	if (!session) return "";
	const m = String(session).match(/(\d+회차)/);
	return m ? m[1] : String(session);
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
 * 두 기록의 비교 마크업 생성 — 프로토타입 배치:
 * ① 인바디 표(헤더: 항목·좌측·우측·변화) ② 움직임 평가 표(옵션: 헤더, 총점 라벨 표시)
 * 좌측 셀렉터(#cmp-cur, 비교 대상)로 선택한 회차를 좌측 열, 우측 셀렉터(#cmp-tgt, 현재 체크기록)로 선택한 회차를 우측 열에 표시한다.
 * 변화량은 『우측(현재) − 좌측(비교 대상)』으로 계산한다: 우측이 더 크면 상승(▲), 작으면 하강(▼), 같으면 유지(―).
 *
 * @param {import("@base/store.js").CheckRecord} left 좌측 셀렉터가 고른 기록 -> 좌측 열
 * @param {import("@base/store.js").CheckRecord} right 우측 셀렉터가 고른 기록 -> 우측 열
 * @param {{ showTotalScoreLabel?: boolean, includeMovementHeader?: boolean }} [options={}]
 *
 * @returns {string} 비교 테이블 HTML
 */
export function buildCompareTable(left, right, options = {}) {
	const { showTotalScoreLabel = true, includeMovementHeader = false } =
		options;

	const leftLabel = left.payload.session || left.date;
	const rightLabel = right.payload.session || right.date;

	// ① 인바디 표

	const ibRows = [];

	IB_KEYS.forEach(({ key, label }) => {
		const l = parseFloat(left.payload.ib?.[key]);
		const r = parseFloat(right.payload.ib?.[key]);

		if (Number.isNaN(l) || Number.isNaN(r)) return;

		ibRows.push({
			label,
			left: l.toFixed(1),
			right: r.toFixed(1),
			delta: deltaHTML(Number((r - l).toFixed(1))),
		});
	});

	// ② 움직임 평가 + 총점 표 — 기록별 항목(payload.items·폴백)을 이름으로 정렬해 5항목(베이직 펑션)·8항목(레거시) 등
	//    항목 수가 다른 기록이 섞여도, 양쪽에 모두 존재하는 항목(교집합)만 표시한다

	const mvRows = [];

	const resolveScores = (payload) => {
		const items = resolveRecordItems(payload);
		const map = new Map();

		(payload.scores || []).forEach((s, i) => map.set(items[i]?.name, s));
		return map;
	};

	const leftScores = resolveScores(left.payload);
	const rightScores = resolveScores(right.payload);

	// 양쪽 기록의 항목 이름 합집합을 순회하며, 양쪽 점수가 모두 있는 항목만 행으로 남긴다 (교집합)
	const itemNames = [
		...new Set(
			[
				...resolveRecordItems(left.payload),
				...resolveRecordItems(right.payload),
			].map((it) => it.name),
		),
	];

	itemNames.forEach((name) => {
		const l = leftScores.get(name);
		const r = rightScores.get(name);

		if (l == null || r == null) return;

		mvRows.push({
			label: name,
			left: `${l}/3`,
			right: `${r}/3`,
			delta: deltaHTML(r - l),
		});
	});

	const leftTotal = recordTotal(left.payload);
	const rightTotal = recordTotal(right.payload);

	let movementTableHtml = "";
	if (mvRows.length > 0) {
		const totalScoreLabelHtml = showTotalScoreLabel
			? `<div class="section-title">움직임 평가 총점</div>`
			: "";
		movementTableHtml = `
			<!--hr class="div" /-->
			${totalScoreLabelHtml}

			<div class="compare-table-container">
				${TPL.compareTable({
					extraClassNames: ["compare-table-basicFunctions"],
					itemLabel: "베이직 펑션",
					leftLabel,
					rightLabel,
					rows: mvRows,
					footRows: [
						{
							label: "총점",
							left: `${leftTotal}/${recordMax(left.payload)}`,
							right: `${rightTotal}/${recordMax(right.payload)}`,
							delta: deltaHTML(rightTotal - leftTotal),
						},
					],
					withHeader: includeMovementHeader,
					ariaLabel: "움직임 평가 항목별 점수 비교",
				})}
			</div>`;
	}

	return `
		<div class="compare-table-container">
			${TPL.compareTable({ extraClassNames: ["compare-table-inbody"], itemLabel: "인바디 항목", leftLabel, rightLabel, rows: ibRows })}
		</div>
		${movementTableHtml}`;
}
