// 파일 용도: DOM 조작 공용 헬퍼 — 요소 조회·내용 설정·클래스 토글 (checkday · basic_function 공용)
export const UI = {
	/**
	 * id로 요소 조회 (없으면 null, null-safe는 호출부에서 처리)
	 * @param {string} id
	 * @returns {HTMLElement | null}
	 */
	byId(id) {
		return document.getElementById(id);
	},
	/**
	 * selector와 일치하는 첫 요소 조회
	 * @param {string} sel
	 * @returns {Element | null}
	 */
	q(sel) {
		return document.querySelector(sel);
	},
	/**
	 * selector와 일치하는 모든 요소(배열) 반환
	 * @param {string} sel
	 * @returns {Array<Element>}
	 */
	all(sel) {
		return [...document.querySelectorAll(sel)];
	},
	/**
	 * 요소에 HTML 내용 설정
	 * @param {string} id
	 * @param {string} html
	 */
	setHTML(id, html) {
		this.byId(id).innerHTML = html;
	},
	/**
	 * 요소에 텍스트 설정
	 * @param {string} id
	 * @param {string|number} txt
	 */
	setText(id, txt) {
		this.byId(id).textContent = txt;
	},
	/**
	 * 요소 클래스 on-off 토글
	 * @param {HTMLElement} el
	 * @param {string} cls
	 * @param {boolean} [state] 지정 시 해당 여부로 강제
	 */
	toggle(el, cls, state) {
		el.classList.toggle(cls, state);
	},
	/**
	 * 루트에 이벤트 위임 리스너 등록 — root 아래에서 `selector`와 일치하는
	 * 자손이 이벤트를 받으면 handler(e, 해당 요소)를 호출한다.
	 * (인라인 onclick 폐기·window 오염 제거를 위한 공용 대체 API)
	 * @param {Element|string} root 위임 루트(요소·선택자 또는 "document")
	 * @param {string} type 리스너 종류 (예: "click", "input")
	 * @param {string} selector 일치 기준 자손 선택자
	 * @param {(e: Event, el: Element) => void} handler
	 */
	delegate(root, type, selector, handler) {
		const base =
			root === document || root === "document"
				? document
				: typeof root === "string"
					? this.q(root)
					: root;
		if (!base) return;
		base.addEventListener(type, (e) => {
			const el = e.target.closest ? e.target.closest(selector) : null;
			if (el) handler(e, el);
		});
	},
};