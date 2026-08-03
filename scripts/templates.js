// 파일 용도: 바닐라JS 템플릿 함수 — 화면 공용 HTML 조각을 순수 함수로 생성 (전체 화면 공용)
// 기법: 바닐라JS 템플릿 함수 (의존성 없음, DOM·전역 비의존, 단위 테스트 용이)
// 주의: 사용자 입력을 넣을 때는 반드시 escapeHtml()을 거쳐 XSS를 막는다.

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

export const TPL = {
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
						<button class="score-btn" data-i="${index}" data-delta="-1" aria-label="감소">−</button>
						<span class="score-val" id="sv-${index}">0</span>
						<button class="score-btn" data-i="${index}" data-delta="1" aria-label="증가">+</button>
						<div class="sdots">${dots}</div>
					</div>
				</div>
				<button class="expand-toggle" id="et-${index}" data-i="${index}">
					체크 항목 / 메모 <span class="arr">▾</span>
				</button>
				<div class="sub-panel" id="sp-${index}">
					<div class="tag-row" style="margin-top:6px">${tags}</div>
					<textarea class="eval-memo" placeholder="메모..."></textarea>
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
							<button class="score-btn" data-aid="${id}" data-delta="-1" aria-label="감소">−</button>
							<span class="score-display" id="score-${id}" data-score="0">0</span>
							<button class="score-btn" data-aid="${id}" data-delta="1" aria-label="증가">+</button>
						</div>
						<div class="score-dots">${dots}</div>
					</div>
				</div>
				<button class="expand-btn" id="expand-${id}" data-id="${id}">
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
	 * @param {{ label: string, id: string, placeholder: string, step?: string, tagId: string }} p
	 * @returns {string}
	 */
	inbodyCell({ label, id, placeholder, step = "0.1", tagId }) {
		return `
			<div class="ib-cell">
				<label>${escapeHtml(label)}</label>
				<input class="ib-num" id="${id}" type="number" placeholder="${escapeHtml(placeholder)}" step="${step}" />
				<div id="${tagId}"></div>
			</div>`;
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
	 * 동작 피드백 체크 행 1개
	 * @param {string} [text]
	 * @returns {string}
	 */
	fbCheckRow(text = "") {
		return `
			<div class="fb-check-row">
				<input type="checkbox" style="accent-color:var(--blue);flex-shrink:0;" aria-label="체크 선택">
				<input class="fb-check-input" type="text" value="${escapeHtml(text)}" placeholder="체크 항목...">
				<button class="fb-check-del" title="삭제" aria-label="체크 항목 삭제">✕</button>
			</div>`;
	},

	/**
	 * 동작 피드백 카드 1장
	 * @param {{ id: number, name: string, checkItems: string[] }} p
	 * @returns {string}
	 */
	feedbackCard({ id, name, checkItems }) {
		const checksHTML = checkItems.map((ch) => TPL.fbCheckRow(ch)).join("");
		return `
			<div class="fb-item" id="fb-item-${id}">
				<div class="fb-item-header">
					<input class="fb-move-input" type="text" value="${escapeHtml(name)}" placeholder="동작명 (예: 스쿼트)">
					<button class="fb-del-btn" title="삭제" aria-label="피드백 삭제">✕</button>
				</div>
				<div class="fb-checks-wrap">${checksHTML}</div>
				<button class="add-check-btn">+ 체크 항목 추가</button>
				<textarea class="eval-memo" placeholder="코칭 포인트 메모..." style="margin-top:6px;"></textarea>
			</div>`;
	},

	/**
	 * 회원 목록 행 1개 (member-table tbody용)
	 * @param {{ id: number, name: string, gender: string, goal: string, trainer: string, recordCount: number }} p
	 * @returns {string}
	 */
	memberRow({ id, name, gender, goal, trainer, recordCount }) {
		return `
			<tr class="member-row" data-member-id="${id}" tabindex="0">
				<td class="member-name">${escapeHtml(name)}</td>
				<td class="member-gender">${escapeHtml(gender || "-")}</td>
				<td class="member-goal">${escapeHtml(goal || "-")}</td>
				<td class="member-trainer">${escapeHtml(trainer || "-")}</td>
				<td class="member-count">${recordCount}회</td>
				<td class="member-action"><button type="button" class="member-remove" data-remove-id="${id}" aria-label="${escapeHtml(name)} 삭제">제거</button></td>
			</tr>`;
	},

	/**
	 * 회원 상세의 체크기록 로우 1개
	 * @param {{ id: number, session: string, date: string, total: number, max: number }} p
	 * @returns {string}
	 */
	recordRow({ id, session, date, total, max }) {
		return `
			<div class="record-row" data-record-id="${id}" tabindex="0">
				<div class="cell-name">${escapeHtml(session)}</div>
				<div class="cell-dim">${escapeHtml(date)}</div>
				<div class="cell-dim">총점 ${total}/${max}</div>
				<div><button type="button" class="btn btn-sm btn-danger" data-del-record="${id}" aria-label="기록 삭제">지우기</button></div>
			</div>`;
	},

	/**
	 * 체크기록 비교 테이블 1개 (header + body)
	 * @param {{ curLabel: string, tgtLabel: string, rows: Array<{ label: string, cur: string, tgt: string, delta: string }> }} p
	 * @returns {string}
	 */
	compareTable({ curLabel, tgtLabel, rows }) {
		return `
			<table class="compare-table">
				<thead><tr><th>항목</th><th>${escapeHtml(tgtLabel)}</th><th>${escapeHtml(curLabel)}</th><th>변화</th></tr></thead>
				<tbody>
					${rows.map((r) => `
						<tr>
							<td>${escapeHtml(r.label)}</td>
							<td>${r.tgt}</td>
							<td>${r.cur}</td>
							<td>${r.delta}</td>
						</tr>`).join("")}
				</tbody>
			</table>`;
	},

	/**
	 * 로그인 폼
	 * @returns {string}
	 */
	loginForm() {
		return `
			<form class="login-form" id="login-form" novalidate>
				<div class="field"><label for="login-id">아이디</label><input type="text" id="login-id" placeholder="아이디 입력" autocomplete="username"></div>
				<div class="field"><label for="login-pw">비밀번호</label><input type="password" id="login-pw" placeholder="비밀번호 입력" autocomplete="current-password"></div>
				<button class="btn btn-primary" type="submit">로그인</button>
				<div style="text-align:center; font-size:10.0px; color:var(--text3); margin-top:4px;">
					로그인 후에는 자동으로 로그인 상태가 유지돼요
				</div>
			</form>`;
	},

	/**
	 * 헤더 막대 (app-header 컴포넌트 내부용) — navHtml은 우측 영역의 <app-gnb> 등 이동 대상
	 * @param {{ crumb?: string, showLogout?: boolean, navHtml?: string }} [p]
	 * @returns {string}
	 */
	headerBar({ crumb = "", showLogout = true, navHtml = "" } = {}) {
		return `
			<header class="site-header" role="banner">
				<a class="logo" href="index.html" aria-label="메인으로 이동">
					<span class="logo-mark" role="img" aria-label="위아짐 심볼"></span>
					<span class="logo-text"><span class="logo-name">위아짐</span></span>
				</a>
				<div class="header-right">
					${navHtml}
					${crumb ? `<span class="crumb">${escapeHtml(crumb)}</span>` : ""}
					${showLogout ? `<button type="button" class="link-btn" data-header-logout>로그아웃</button>` : ""}
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
	 * @returns {string}
	 */
	helpModal() {
		return `
			<div class="help-overlay" data-help-overlay hidden>
				<div class="help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title">
					<div class="help-head">
						<h3 id="help-title">도움말</h3>
						<button type="button" class="link-btn" data-help-close aria-label="닫기">✕</button>
					</div>
					<div class="help-body"></div>
				</div>
			</div>`;
	},
};