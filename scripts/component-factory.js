// 파일 용도: 순수 함수형 컴포넌트 팩토리 — 네이티브 웹 컴포넌트(light DOM 모드) 정의 헬퍼 (전체 화면 공용)
// 기법: 순수 함수형 컴포넌트 팩토리 + 네이티브 웹 컴포넌트
// light DOM 모드: Shadow DOM을 쓰지 않으므로 전역 CSS 변수(var(--blue) 등)를 그대로 상속받는다.

/**
 * 컴포넌트 명세
 * @typedef {Object} ComponentSpec
 * @property {(this: HTMLElement) => void} [connectedCallback] — innerHTML 재작성 전 1회 호출 (light-DOM 자식 캡처 등)
 * @property {(this: HTMLElement) => string} render — 현재 속성으로 마크업 문자열 반환 (내부 HTML 채움)
 * @property {(this: HTMLElement) => void} [onConnect] — 문서 연결 시 render 후 1회 호출 (이벤트 바인딩)
 * @property {(this: HTMLElement) => void} [refreshAfter] — refresh() 후 추가 처리
 */

/**
 * light DOM 모드 커스텀 엘리먼트를 정의한다.
 *
 * 생성된 클래스는 `refresh()` 메서드를 갖는다: `render()` 반환 문자열로 innerHTML을 다시 채운 뒤
 * `refreshAfter`를 호출한다. 스토어 구독 콜백에서 상태 변경 후 `refresh()`를 호출해 UI를 갱신한다.
 *
 * @param {string} tag 정의할 태그명 (예: "app-header")
 * @param {ComponentSpec} spec
 * @returns {typeof HTMLElement}
 */
export function defineComponent(tag, spec) {
	class Component extends HTMLElement {
		connectedCallback() {
			if (spec.connectedCallback) spec.connectedCallback.call(this);
			this.refresh();
			if (spec.onConnect) spec.onConnect.call(this);
		}

		/**
		 * render() 결과로 내부를 다시 채운다.
		 * @returns {void}
		 */
		refresh() {
			this.innerHTML = spec.render.call(this);
			if (spec.refreshAfter) spec.refreshAfter.call(this);
		}
	}

	customElements.define(tag, Component);
	return Component;
}