// 파일 용도: UI 컴포넌트 기본 클래스·타입·유틸 — 모든 웹 컴포넌트의 기반
import { defineComponent as baseDefineComponent } from "./component-factory.js";

/**
 * 컴포넌트 Props 타입 (확장용)
 * @typedef {Object} ComponentProps
 * @property {boolean} [disabled] 비활성화 여부
 * @property {string} [ariaLabel] 접근성 라벨
 * @property {string} [ariaDescribedBy] 설명 참조 ID
 */

/**
 * 컴포넌트 이벤트 타입
 * @typedef {Object} ComponentEvents
 * @property {CustomEvent} [change] 값 변경
 * @property {CustomEvent} [click] 클릭
 * @property {CustomEvent} [focus] 포커스
 * @property {CustomEvent} [blur] 블러
 */

/**
 * 기본 컴포넌트 옵션
 * @typedef {Object} ComponentOptions
 * @property {string} tag 커스텀 엘리먼트 태그명
 * @property {Object} props 프로퍼티 정의
 * @property {Function} render 렌더 함수
 * @property {Function} [connectedCallback] 연결 시 콜백
 * @property {Function} [disconnectedCallback] 해제 시 콜백
 * @property {Function} [attributeChangedCallback] 속성 변경 콜백
 * @property {string[]} [observedAttributes] 감시할 속성 목록
 */

/**
 * 컴포넌트 팩토리 — 기본 defineComponent를 확장한 버전
 * Light DOM 모드, props 자동 바인딩, 이벤트 디스패치 헬퍼 제공
 * @param {ComponentOptions} options
 * @returns {typeof HTMLElement}
 */
export function defineComponent(options) {
	const { tag, props = {}, render, connectedCallback, disconnectedCallback, attributeChangedCallback, observedAttributes = [] } = options;

	// props를 observedAttributes에 자동 추가
	const allObserved = [...new Set([...observedAttributes, ...Object.keys(props)])];

	const spec = {
		// 렌더 함수
		render() {
			return render.call(this, spec._getProps.call(this));
		},

		// 연결 시: props 초기화 + 사용자 콜백
		connectedCallback() {
			// console.log("웹컴포넌트의 props를 초기화하고 사용자 콜백을 호출합니다…");
			// console.log({ spec, this: this });

			spec._initProps.call(this);
			if (connectedCallback) connectedCallback.call(this);
		},

		// 해제 시
		disconnectedCallback() {
			if (disconnectedCallback) disconnectedCallback.call(this);
		},

		// 속성 변경 시: props 갱신 + 리렌더
		attributeChangedCallback(name, oldVal, newVal) {
			if (oldVal === newVal) return;

			if (props[name] !== undefined) {
				this._props[name] = spec._deserializeProp(name, newVal);
				spec.refresh.call(this);
			}

			if (attributeChangedCallback) attributeChangedCallback.call(this, name, oldVal, newVal);
		},

		// props 초기화
		_initProps() {
			// console.log("웹컴포넌트의 props를 초기화합니다…");
			// console.log({ this: this });

			this._props = {};

			for (const [key, def] of Object.entries(props)) {
				const attrVal = this.getAttribute(key);

				this._props[key] = attrVal !== null ? spec._deserializeProp(key, attrVal) : def.default;
			}
		},

		// props 역직렬화
		_deserializeProp(key, value) {
			const def = props[key];

			if (!def || def.type === String) return value;
			if (def.type === Number) return Number(value);
						if (def.type === Boolean) return value !== "false"; 

			if (def.type === Array) return value ? value.split(",").map(v => v.trim()) : [];

			if (def.type === Object) return value ? JSON.parse(value) : {};

			return value;
		},

		// props getter
		_getProps() {
			return { ...this._props };
		},

		// prop 설정 (리렌더 트리거)
		setProp(key, value) {
			if (this._props[key] === value) return;

			this._props[key] = value;
			this.setAttribute(key, spec._serializeProp(key, value));
			spec.refresh.call(this);
		},

		// prop 직렬화
		_serializeProp(key, value) {
			const def = props[key];

			if (!def || def.type === String) return value;
			if (def.type === Number) return String(value);
			if (def.type === Boolean) return value ? "true" : "false";
			if (def.type === Array) return value.join(",");
			if (def.type === Object) return JSON.stringify(value);

			return String(value);
		},

		// 이벤트 디스패치 헬퍼
		emit(eventName, detail = {}) {
			this.dispatchEvent(
				new CustomEvent(eventName, {
					detail,
					bubbles: true,
					composed: true,
				})
			);
		},

		// 렌더 결과로 내부 갱신
		refresh() {
			this.innerHTML = render.call(this, this._getProps());
		},
	};

	return baseDefineComponent(tag, spec);
}

/**
 * CSS 클래스 토글 헬퍼
 * @param {HTMLElement} el
 * @param {string} cls
 * @param {boolean} [force]
 */
export function toggleClass(el, cls, force) {
	el.classList.toggle(cls, force);
}

/**
 * 속성 토글 헬퍼
 * @param {HTMLElement} el
 * @param {string} attr
 * @param {boolean} [force]
 */
export function toggleAttr(el, attr, force) {
	if (force) el.setAttribute(attr, "");
	else el.removeAttribute(attr);
}

/**
 * 접근성 속성 설정 헬퍼
 * @param {HTMLElement} el
 * @param {Object} attrs
 */
export function setAria(el, attrs) {
	for (const [key, value] of Object.entries(attrs)) {
		if (value === undefined || value === null || value === "") {
			el.removeAttribute(`aria-${key}`);
		} else {
			el.setAttribute(`aria-${key}`, value);
		}
	}
}
