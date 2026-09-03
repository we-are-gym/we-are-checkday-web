// 파일 용도: 웹 컴포넌트 저수준 팩토리 — 커스텀 엘리먼트 정의의 순수 기계부 (base/component.js 전용 내부 구현)
// 기법: spec의 라이프사이클 훅(connected/disconnected/attributeChanged)을 엘리먼트 클래스에 연결하고,
//       예약 키 이외의 함수 키는 프로토타입 메서드로 복사해 외부에서 this.*()로 호출 가능하게 한다.
// 주의: 렌더·연결 순서 정책은 base/component.js가 단일로 소유한다. (이 모듈은 순서 결정을 내리지 않음)
//       외부(컴포넌트 모듈)는 반드시 base/component.js의 defineComponent를 사용한다.

/** 라이프사이클·렌더 예약 키 — 프로토타입 복사 제외 */
const RESERVED_KEYS = new Set([
	"render",
	"onConnect",
	"refreshAfter",
	"connectedCallback",
	"disconnectedCallback",
	"attributeChangedCallback",
	"observedAttributes",
]);

/**
 * 컴포넌트 명세
 * @typedef {Object} ComponentSpec
 * @property {string[]} [observedAttributes] 감시할 속성 목록
 * @property {() => void} [connectedCallback] 연결 시 콜백
 * @property {() => void} [disconnectedCallback] 해제 시 콜백
 * @property {(name: string, oldVal: string | null, newVal: string | null) => void} [attributeChangedCallback] 속성 변경 콜백
 */

/**
 * 라이트 DOM 모드 커스텀 엘리먼트를 정의한다. (저수준 단일 구현)
 * @param {string} tag 정의할 태그명 (예: "ui-button")
 * @param {ComponentSpec & Record<string, Function>} spec 컴포넌트 명세
 * @returns {typeof HTMLElement} 정의된 컴포넌트 클래스
 */
export function defineComponent(tag, spec) {
	class Component extends HTMLElement {
		static get observedAttributes() {
			return spec.observedAttributes || [];
		}

		connectedCallback() {
			if (spec.connectedCallback) spec.connectedCallback.call(this);
		}

		disconnectedCallback() {
			if (spec.disconnectedCallback) spec.disconnectedCallback.call(this);
		}

		attributeChangedCallback(name, oldVal, newVal) {
			if (spec.attributeChangedCallback) spec.attributeChangedCallback.call(this, name, oldVal, newVal);
		}
	}

	// 예약 키가 아닌 함수 키는 프로토타입 메서드로 복사 — spec.refresh·setProp·emit·사용자 정의 메서드 등
	for (const key of Object.keys(spec)) {
		if (RESERVED_KEYS.has(key)) continue;
		if (typeof spec[key] === "function") Component.prototype[key] = spec[key];
	}

	customElements.define(tag, Component);
	return Component;
}
