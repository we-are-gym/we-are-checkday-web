// 파일 용도: 바닐라JS 템플릿 함수 — 화면 공용 HTML 조각을 순수 함수로 생성 (전체 화면 공용)
// DEPENDS: createZeroArray(utils-array) — scoreDots 도트 배열 생성용
// 기법: 바닐라JS 템플릿 함수 (DOM·전역 비의존, 단위 테스트 용이)
// 주의: 사용자 입력을 넣을 때는 반드시 escapeHtml()을 거쳐 XSS를 막는다.

import { createZeroArray } from "@tools/utils-array.js";
import { DOT_COUNT } from "./constants.js";

/**
 * HTML 특수문자 이스케이프 (XSS 방지)
 * @param {string} text
 * @returns {string}
 */
export function escapeHtml(text) {
	return String(text)
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}
/**
 * 다음 목표 고정 태그 목록 (checkday_1·check-doc-new·check-doc-edit 공용 단일 소스)
 * @type {string[]}
 */
export const GOAL_TAGS = [
	"💪 근력 향상",
	"🔥 체지방 감소",
	"🧘 자세 교정",
	"🏃 체력 향상",
	"⚖️ 체중 유지",
	"🦵 하체 강화",
	"🤸 유연성 개선",
	"🩺 통증 개선",
	"📈 근육량 증가",
];

/**
 * 홈 브레드크럼 아이콘 — 크럼 첫 구간(index.html 링크)용 인라인 SVG
 */
const HOME_ICON = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.8V21h14V9.8"/></svg>`;

export const TPL = {
	/**
	 * 점수 조절 컨트롤 3종 (감소 − · 현재 점수 · 증가 +) — checkday 평가 카드·베이직 펑션 카드 공용
	 * @param {{ dataKey: string, index: number|string, displayClass: string, displayId?: string, displayAttr?: string }} p
	 *           dataKey: 전체 속성명 (예: "data-i") — 점수 증감 버튼이 참조할 인덱스 속성
	 * @returns {string}
	 */
	scoreCtrl({ dataKey, index, displayClass, displayId = "", displayAttr = "" }) {
		const data = `${dataKey}="${index}"`;
		const idAttr = displayId ? ` id="${displayId}"` : "";
		const attr = displayAttr ? ` data-${displayAttr}="0"` : "";
		return `
			<button class="score-btn" ${data} data-delta="-1" aria-label="감소">−</button>
			<span class="${displayClass}"${idAttr}${attr} aria-live="polite">0</span>
			<button class="score-btn" ${data} data-delta="1" aria-label="증가">+</button>`;
	},

	/**
	 * 평가 카드 1장 (checkday 화면 스타일) — eval-item 래퍼 포함
	 * @param {{ index: number, item: { name: string, desc: string }, dots: string, tags: string, extra?: string }} p
	 * @returns {string}
	 */
	assessmentCard({ index, item, dots, tags, extra = "" }) {
		return `
			<div class="eval-item">
				<div class="eval-top">
					<div class="eval-num-badge">${index + 1}</div>
					<div style="flex:1"><div class="eval-name">${escapeHtml(item.name)}</div><div class="eval-desc">${escapeHtml(item.desc)}</div></div>
					<div class="score-ctrl">
						${TPL.scoreCtrl({ dataKey: "data-i", index, displayClass: "score-val", displayId: `sv-${index}` })}
						<div class="sdots">${dots}</div>
					</div>
				</div>
				<button class="expand-toggle" id="et-${index}" data-i="${index}" aria-expanded="false" aria-controls="sp-${index}">
					체크 항목 / 메모 <span class="arr">▾</span>
				</button>
				<div class="sub-panel" id="sp-${index}">
					<div class="tag-row" style="margin-top:6px">${tags}</div>
					<textarea class="eval-memo" placeholder="메모..." title="메모"></textarea>
					${extra}
				</div>
			</div>`;
	},

	/**
	 * 베이직 펑션 평가 카드 1장 (basic_function_assessment_2 화면 스타일) — item-card 래퍼 포함
	 * @param {{ id: number, item: { name: string, desc: string }, dots: string, checks: string }} p
	 * @returns {string}
	 */
	basicItemCard({ id, item, dots, checks }) {
		return `
			<div class="item-card" id="card-${id}">
				<div class="item-top">
					<div class="item-num">${id}</div>
					<div class="item-info">
						<div class="item-name">${escapeHtml(item.name)}</div>
						<div class="item-desc">${escapeHtml(item.desc)}</div>
					</div>
					<div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
						<div class="score-ctrl">
							${TPL.scoreCtrl({ dataKey: "data-aid", index: id, displayClass: "score-display", displayId: `score-${id}`, displayAttr: "score" })}
						</div>
						<div class="score-dots">${dots}</div>
					</div>
				</div>
				<button class="expand-btn" id="expand-${id}" data-id="${id}" aria-expanded="false" aria-controls="detail-${id}">
					체크 항목 / 메모
					<span class="expand-arrow">▾</span>
				</button>
				<div class="item-detail" id="detail-${id}">
					${checks}
					<textarea class="notes-area" id="notes-${id}" data-id="${id}" placeholder="메모를 입력하세요..."></textarea>
				</div>
			</div>`;
	},

	/**
	 * 인바디 입력 셀 1개
	 * @param {{ label: string, id: string, placeholder: string, step?: string, tagId: string, last?: boolean }} p
	 *           step: 빈 문자열이면 step 속성 생략(기초대사량처럼 정수 입력용), last: 3열 마지막 행(하단 테두리 제거)
	 * @returns {string}
	 */
	inbodyCell({ label, id, placeholder, step = "0.1", tagId, last = false }) {
		const cls = last ? "ib-cell no-border-b" : "ib-cell";
		const stepAttr = step ? ` step="${escapeHtml(step)}"` : "";
		return `
			<div class="${cls}">
				<label for="${id}">${escapeHtml(label)}</label>
				<input class="ib-num" id="${id}" type="number" placeholder="${escapeHtml(placeholder)}"${stepAttr} />
				<div id="${tagId}"></div>
			</div>`;
	},

	/**
	 * 인바디 6셀 그리드 전체 (체중·골격근량·체지방량·BMI·체지방률·기초대사량)
	 * 내장지방(ib-vis)·코멘트(ib-comment)는 1회성 배치라 화면 HTML에 고정으로 둔다.
	 * @returns {string}
	 */
	inbodyGrid() {
		return [
			this.inbodyCell({
				label: "체중 (kg)",
				id: "ib-w",
				placeholder: "65.0",
				tagId: "tag-w",
			}),
			this.inbodyCell({
				label: "골격근량 (kg)",
				id: "ib-m",
				placeholder: "28.0",
				tagId: "tag-m",
			}),
			this.inbodyCell({
				label: "체지방량 (kg)",
				id: "ib-fat",
				placeholder: "18.0",
				tagId: "tag-fat",
			}),
			this.inbodyCell({
				label: "BMI",
				id: "ib-bmi",
				placeholder: "23.5",
				tagId: "tag-bmi",
				last: true,
			}),
			this.inbodyCell({
				label: "체지방률 (%)",
				id: "ib-bfp",
				placeholder: "27.0",
				tagId: "tag-bfp",
				last: true,
			}),
			this.inbodyCell({
				label: "기초대사량 (kcal)",
				id: "ib-bmr",
				placeholder: "1450",
				step: "",
				tagId: "tag-bmr",
				last: true,
			}),
		].join("");
	},

	/**
	 * 목표 태그 1개 (토글 버튼)
	 * @param {string} text
	 * @returns {string}
	 */
	goalTag(text) {
		return `<div class="goal-tag" role="button" tabindex="0" aria-pressed="false">${escapeHtml(text)}</div>`;
	},
	/**
	 * 목표 태그 전체 (고정 9개) — 컨테이너(#goal-tags)는 각 화면 HTML이 보유
	 * @returns {string}
	 */
	goalTags() {
		return GOAL_TAGS.map(text => this.goalTag(text)).join("");
	},

	/**
	 * 동작 피드백 체크 행 1개
	 * @param {string} [text]
	 * @returns {string}
	 */
	fbCheckRow(text = "") {
		return `
			<div class="fb-check-row">
				<input type="checkbox" style="accent-color:var(--blue);flex-shrink:0;" aria-label="체크 선택">
				<input class="fb-check-input" type="text" value="${escapeHtml(text)}" placeholder="체크 항목..." aria-label="체크 항목">
				<button class="fb-check-del" title="삭제" aria-label="체크 항목 삭제">✕</button>
			</div>`;
	},

	/**
	 * 동작 피드백 카드 1장
	 * @param {{ id: number, name: string, checkItems: string[] }} p
	 * @returns {string}
	 */
	feedbackCard({ id, name, checkItems }) {
		const checksHTML = checkItems.map(ch => TPL.fbCheckRow(ch)).join("");

		return `
			<div class="fb-item" id="fb-item-${id}">
				<div class="fb-item-header">
					<input class="fb-move-input" type="text" value="${escapeHtml(name)}" placeholder="동작명 (예: 스쿼트)" aria-label="동작명">
					<button class="fb-del-btn" title="삭제" aria-label="피드백 삭제">✕</button>
				</div>
				<div class="fb-checks-wrap">${checksHTML}</div>
				<button class="add-check-btn" aria-label="체크 항목 추가">+ 체크 항목 추가</button>
				<textarea class="eval-memo" placeholder="코칭 포인트 메모..." style="margin-top:6px;" title="코칭 포인트 메모" aria-label="코칭 포인트 메모"></textarea>
			</div>`;
	},

	/**
	 * 회원 목록 행 1개 (member-table tbody용) — to-be 지시에 따라 「목표」 열은 표시하지 않는다 (데이터는 유지)
	 * @param {{ id: number, name: string, gender: string, trainer: string, recordCount: number }} p
	 * @returns {string}
	 */
	memberRow({ id, name, gender, trainer, recordCount }) {
		return `
			<tr class="member-row" data-member-id="${id}" tabindex="0" role="link" aria-label="${escapeHtml(name)} 상세 보기">
				<td class="member-name">${escapeHtml(name)}</td>
				<td class="member-gender">${escapeHtml(gender || "-")}</td>
				<td class="member-trainer">${escapeHtml(trainer || "-")}</td>
				<td class="member-count">${recordCount}회</td>
				<td class="member-action"><button type="button" class="member-remove" data-remove-id="${id}" aria-label="${escapeHtml(name)} 삭제">삭제</button></td>
			</tr>`;
	},

	/**
	 * 회원 상세의 체크기록 로우 1개 — 회차·날짜·총점을 한 줄로 표시 (to-be 지시 반영)
	 * @param {{ id: number, session: string, date: string, total: number, max: number }} p
	 *           session: 회차 표기(예: "1회차"), date: 기록 날짜(YYYY.MM.DD)
	 * @returns {string}
	 */
	recordRow({ id, session, date, total, max }) {
		return `
			<div class="record-row" data-record-id="${id}" tabindex="0" role="link" aria-label="${escapeHtml(session)} ${escapeHtml(date)} 총점 ${total}/${max}">
				<div class="cell-name">${escapeHtml(session)}</div>
				<div class="cell-dim">${escapeHtml(date)}</div>
				<div class="cell-dim">총점 ${total}/${max}</div>
				<div><button type="button" class="btn btn-sm btn-danger" data-del-record="${id}" aria-label="기록 삭제">삭제</button></div>
			</div>`;
	},

	/**
	 * 점수 도트 HTML 생성 (count개 점) — 평가 카드 점수 표시 공용 (checkday·베이직 펑션)
	 * @param {{ prefix: string|number, count: number }} p prefix: 도트 id 접두어(항목 인덱스 또는 id), count: 도트 수
	 * @returns {string}
	 */
	scoreDots({ prefix, count }) {
		return createZeroArray(count)
			.map((_, j) => `<div class="dot" id="dot-${prefix}-${j}" aria-hidden="true"></div>`)
			.join("");
	},

	/**
	 * 비교 테이블 행 1개 (본문·합계 공용) — label만 이스케이프하고 값은 호출부에서 이미 안전하게 가공한다
	 * 열 순서: [항목 | left(좌측 셀렉터 회차) | right(우측 셀렉터 회차) | 변화]
	 * @param {{ label: string, left: string, right: string, delta: string }} r 비교 행 데이터
	 * @returns {string}
	 */
	compareTableRow({ label, left, right, delta }) {
		return `
			<tr>
				<td>${escapeHtml(label)}</td>
				<td>${left}</td>
				<td>${right}</td>
				<td>${delta}</td>
			</tr>`;
	},

	/**
	 * 체크기록 비교 테이블 1개 — withHeader=false면 본문만(움직임 평가 총점 표용)
	 * 헤더 열 순서: [항목 | leftLabel(좌측 셀렉터 회차) | rightLabel(우측 셀렉터 회차) | 변화]
	 *
	 * @param {{
	 * 	extraClassNames?: Array<string>;
	 * 	itemLabel: string;
	 * 	leftLabel?: string;
	 * 	rightLabel?: string;
	 * 	rows: Array<{ label: string, left: string, right: string, delta: string }>;
	 * 	footRows?: Array<{ label: string, left: string, right: string, delta: string }>;
	 *	withHeader?: boolean;
	 * }} p
	 *
	 * @returns {string}
	 */
	compareTable({ extraClassNames = [], itemLabel, leftLabel = "", rightLabel = "", rows, footRows, withHeader = true, ariaLabel = "" }) {
		const ariaAttr = ariaLabel ? ` aria-label="${escapeHtml(ariaLabel)}"` : "";
		const head = withHeader
			? `<thead><tr><th>${itemLabel}</th><th>${escapeHtml(leftLabel)}</th><th>${escapeHtml(rightLabel)}</th><th>변화</th></tr></thead>`
			: "";

		const foot = (() => {
			if (footRows === undefined) {
				return "";
			}

			return `
				<tfoot>
					${footRows.map(row => TPL.compareTableRow(row)).join("")}
				</tfoot>
			`;
		})();

		return `
			<table class="compare-table ${extraClassNames.join(" ")}"${ariaAttr}>
				${head}
				${foot}
				<tbody>
					${rows.map(r => TPL.compareTableRow(r)).join("")}
				</tbody>
			</table>`;
	},

	/**
	 * 읽기 전용 점수 도트 (조회 화면) — 채워진 개수 = 점수
	 * @param {{ score: number, max?: number }} p score: 점수(0~max), max: 도트 총개수(기본 DOT_COUNT)
	 * @returns {string}
	 */
	viewScoreDots({ score, max = DOT_COUNT }) {
		return Array.from({ length: max }, (_, i) => `<span class="sdot${i < score ? " on" : ""}"></span>`).join("");
	},

	/**
	 * 로그인 폼
	 * @returns {string}
	 */
	loginForm() {
		return `
			<form class="login-form" id="login-form" novalidate>
<div class="field"><label for="login-id">아이디</label><input type="text" id="login-id" placeholder="아이디 입력" autocomplete="username" aria-label="아이디" aria-required="true"></div>
			<div class="field"><label for="login-pw">비밀번호</label><input type="password" id="login-pw" placeholder="비밀번호 입력" autocomplete="current-password" aria-label="비밀번호" aria-required="true"></div>
				<button class="btn btn-primary" type="submit">로그인</button>
				<div style="text-align:center; font-size:10.0px; color:var(--text3); margin-top:4px;">
					로그인 후에는 자동으로 로그인 상태가 유지돼요
				</div>
			</form>`;
	},

	/**
	 * 헤더 막대 (app-header 컴포넌트 내부용) — navHtml은 우측 영역의 <app-gnb> 등 이동 대상
	 * 크럼 경로(crumbPath)는 파이프(|)로 구분한 화면 경로다. 각 구간은 "href>라벨"(링크) 또는 라벨만(현재 화면)으로 표기한다.
	 * 마지막 구간은 현재 화면(링크 아님·aria-current="page"), href가 index.html인 구간은 홈 아이콘으로 렌더링된다.
	 * @param {{ crumbPath?: string, showLogout?: boolean, navHtml?: string }} [p]
	 * @returns {string}
	 */
	headerBar({ crumbPath = "", showLogout = true, navHtml = "" } = {}) {
		// 파이프 구간을 "href>라벨" | "라벨" 로 해석 (라벨만 있는 마지막 구간 = 현재 화면)
		const segments = crumbPath
			.split("|")
			.filter(Boolean)
			.map(seg => {
				const sep = seg.indexOf(">");
				return sep === -1 ? { href: "", label: seg } : { href: seg.slice(0, sep), label: seg.slice(sep + 1) };
			});
		const crumbHtml = segments.length
			? `<div class="crumb-path">${segments
					.map((seg, i) => {
						const isLast = i === segments.length - 1;
						const part = isLast
							? `<span class="crumb-cur" aria-current="page">${escapeHtml(seg.label)}</span>`
							: seg.href === "index.html"
								? `<a class="crumb-home" href="index.html" aria-label="메인으로 이동">${HOME_ICON}</a>`
								: seg.href
									? `<a class="crumb-link" href="${escapeHtml(seg.href)}">${escapeHtml(seg.label)}</a>`
									: `<span class="crumb-cur">${escapeHtml(seg.label)}</span>`;
						return part + (isLast ? "" : `<span class="crumb-sep" aria-hidden="true">›</span>`);
					})
					.join("")}</div>`
			: "";

		return `
			<header class="site-header" role="banner">
				<a class="logo" href="index.html" aria-label="메인으로 이동">
					<span class="logo-mark" role="img" aria-label="위아짐 심볼"></span>
					<span class="logo-text"><span class="logo-name">위아짐</span></span>
				</a>
				<div class="header-right">
					${navHtml}
					${crumbHtml}
					${showLogout ? `<button type="button" class="link-btn" data-header-logout aria-label="로그아웃">로그아웃</button>` : ""}
				</div>
			</header>`;
	},

	/**
	 * GNB (app-gnb 컴포넌트 내부용) — 활성 메뉴 표시
	 * @param {{ active?: string }} [p]
	 * @returns {string}
	 */
	gnb({ active = "" } = {}) {
		const link = (href, label, key) => `
			<a class="nav-link${active === key ? " active" : ""}" href="${href}"${active === key ? ' aria-current="page"' : ""}>${escapeHtml(label)}</a>`;

		return `<nav class="nav" aria-label="주요 메뉴">${link("members.html", "회원 관리", "members")}</nav>`;
	},

	/**
	 * 도움말 모달 (app-help 컴포넌트 내부용)
	 * @param {string} [content] 도움말 본문 HTML (light-DOM 자식 캡처 결과)
	 * @returns {string}
	 */
	helpModal(content = "") {
		return `
			<div class="help-overlay" data-help-overlay hidden>
				<div class="help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title">
					<div class="help-head">
						<h3 id="help-title">도움말</h3>
						<button type="button" class="link-btn" data-help-close aria-label="닫기">✕</button>
					</div>
					<div class="help-body">${content}</div>
				</div>
			</div>`;
	},
};
