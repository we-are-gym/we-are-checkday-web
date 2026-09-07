// 파일 용도: UI 컴포넌트 단일 공개 팩토리 — 구(infra·member)·신(shared) 모든 웹 컴포넌트의 공통 기반
// 기법: 라이트 DOM 모드 + props 자동 바인딩 + 이벤트 디스패치 헬퍼
// 결정: defineComponent는 options 오브젝트 한 벌만 사용한다. (구 방식 defineComponent(tag, spec) 제거)
//       연결 순서 단일 정책: ① props 초기화 → ② connectedCallback(첫 렌더 전 — light-DOM 자식 캡처용)
//       → ③ 최초 렌더 보장 → ④ onConnect(이벤트 배선 1회)
import { defineComponent as baseDefineComponent } from "./component-factory.js";

/** defineComponent 옵션 중 팩토리가 직접 처리하는 예약 키 */
const BASE_OPTION_KEYS = new Set([
	"tag",
	"props",
	"render",
	"connectedCallback",
	"disconnectedCallback",
	"attributeChangedCallback",
	"onConnect",
	"observedAttributes",
]);

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
 * @property {Object} [props] 프로퍼티 정의 ({ key: { type, default } })
 * @property {Function} render 렌더 함수 (props 인자 수신)
 * @property {Function} [connectedCallback] 연결 시 콜백 — 첫 렌더 전에 1회 호출 (light-DOM 자식 캡처 등)
 * @property {Function} [onConnect] 연결 후 콜백 — 첫 렌더 완료 후 1회 호출 (이벤트 배선)
 * @property {Function} [disconnectedCallback] 해제 시 콜백
 * @property {Function} [attributeChangedCallback] 속성 변경 콜백
 * @property {string[]} [observedAttributes] 감시할 속성 목록
 */

/**
 * 웹 컴포넌트 팩토리 — 라이트 DOM 모드, props 자동 바인딩, 이벤트 디스패치·refresh 헬퍼 제공
 * 옵션에 선언한 예약 키 외의 함수는 프로토타입 메서드로 노출된다. (예: prefill, renderAuth)
 * @param {ComponentOptions & Record<string, Function>} options 컴포넌트 옵션
 * @returns {typeof HTMLElement} 정의된 컴포넌트 클래스
 */
export function defineComponent(options) {
	const {
		tag,
		props = {},
		render,
		connectedCallback,
		disconnectedCallback,
		attributeChangedCallback,
		onConnect,
		observedAttributes = [],
	} = options;

	// props를 observedAttributes에 자동 추가
	const allObserved = [...new Set([...observedAttributes, ...Object.keys(props)])];

	const spec = {
		observedAttributes: allObserved,

		// 렌더 함수 — props 오브젝트를 인자로 전달 (props가 없는 컴포넌트는 빈 오브젝트)
		render() {
			return render.call(this, spec._getProps.call(this));
		},

		// 연결 시 — 단일 순서 정책 적용
		connectedCallback() {
			spec._initProps.call(this);
			if (connectedCallback) connectedCallback.call(this);
			if (!this._rendered) spec.refresh.call(this);
			if (onConnect) onConnect.call(this);
		},

		// 해제 시
		disconnectedCallback() {
			if (disconnectedCallback) disconnectedCallback.call(this);
		},

		// 속성 변경 시: props 갱신 + 리렌더 후 사용자 콜백
		// 주의: 커스텀 엘리먼트 업그레이드 시 attributeChangedCallback이 connectedCallback보다 먼저
		//       호출되므로, _props가 아직 초기화되지 않았으면 여기서 지연 초기화한다.
		attributeChangedCallback(name, oldVal, newVal) {
			if (oldVal === newVal) return;

			if (props[name] !== undefined) {
				if (!this._props) spec._initProps.call(this);
				this._props[name] = spec._deserializeProp(name, newVal);
				spec.refresh.call(this);
			}

			if (attributeChangedCallback) attributeChangedCallback.call(this, name, oldVal, newVal);
		},

		// props 초기화
		_initProps() {
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
			// Array·Object props는 문자열 속성으로 왕복하면 형태가 깨지므로(잠재 버그) 직접 갱신만 한다.
			// (data-table의 rows·columns·selectedRows 등 — 렌더는 attributeChanged가 아니라 refresh가 담당)
			const def = props[key];
			if (!def || (def.type !== Array && def.type !== Object)) {
				this.setAttribute(key, spec._serializeProp(key, value));
			}
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

		// 렌더 결과로 내부 갱신 (외부에서 el.refresh() 호출 가능 — 구 컴포넌트 호환)
		refresh() {
			this.innerHTML = render.call(this, this._getProps());
			this._rendered = true;
		},
	};

	// 사용자 정의 메서드(prefill·renderAuth·_handleSort 등)를 spec에 실어 프로토타입 메서드로 노출
	for (const key of Object.keys(options)) {
		if (BASE_OPTION_KEYS.has(key)) continue;
		if (typeof options[key] === "function") spec[key] = options[key];
	}

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
