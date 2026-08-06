// 파일 용도: UI 컴포넌트 모듈 진입점 — 모든 컴포넌트 등록 (전체 화면 공용)
// 각 컴포넌트는 customElements.define으로 자동 등록됨
import "./button/button.js";
import "./link-button/link-button.js";
import "./card-panel/card-panel.js";

// 타입 내보내기 (JSDoc용)
/** @typedef {import("./button/button.js")} UIButton */
/** @typedef {import("./link-button/link-button.js")} UILinkButton */
/** @typedef {import("./card-panel/card-panel.js")} UICardPanel */
