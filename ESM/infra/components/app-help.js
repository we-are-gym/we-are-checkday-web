// 파일 용도: 내장 도움말 컴포넌트 — 헤더 우측의 도움말 버튼과 모달 오버레이 (전 화면 공용)
// 기법: 순수 함수형 컴포넌트 팩토리 + 네이티브 웹 컴포넌트 (light DOM 모드)
// light-DOM 자식이 도움말 본문(HTML)이 된다. (예: <app-help><h4>…</h4><p>…</p></app-help>)
import { defineComponent } from "@infra/component-factory.js";
import { TPL } from "@infra/templates.js";

defineComponent("app-help", {
	/**
	 * 최초 연결 시 light-DOM 자식(도움말 본문)을 HTML 문자열로 캡처해 보존한다
	 */
	connectedCallback() {
		// innerHTML 재작성 전에 원래 light-DOM 자식을 HTML 문자열로 캡처 (재연결 시에도 본문 유지)
		if (!this._primed) {
			this._primed = true;
			this._contentHTML = this.innerHTML;
		}
	},
	/**
	 * 도움말 버튼과 모달 오버레이 HTML을 생성한다
	 * @returns {string} 도움말 영역 HTML
	 */
	render() {
		return `
			<button type="button" class="link-btn" data-help-open aria-haspopup="dialog" aria-expanded="false">도움말</button>
			${TPL.helpModal(this._contentHTML || "")}`;
	},
	/**
	 * open/close 메서드를 정의하고 열기·닫기·오버레이·Escape 키 동작을 연결한다
	 */
	onConnect() {
		this.open = () => {
			this.querySelector(".help-overlay").hidden = false;
			this.querySelector("[data-help-open]").setAttribute("aria-expanded", "true");
			this.querySelector("[data-help-close]").focus();
		};
		this.close = () => {
			this.querySelector(".help-overlay").hidden = true;
			this.querySelector("[data-help-open]").setAttribute("aria-expanded", "false");
		};
		this.querySelector("[data-help-open]").addEventListener("click", this.open);
		this.querySelector("[data-help-close]").addEventListener("click", this.close);
		this.querySelector(".help-overlay").addEventListener("click", (e) => {
			if (e.target === e.currentTarget) this.close();
		});
		document.addEventListener("keydown", (e) => {
			if (e.key === "Escape" && !this.querySelector(".help-overlay").hidden) this.close();
		});
	},
});