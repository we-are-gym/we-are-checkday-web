// 파일 용도: 내장 도움말 컴포넌트 — 헤더 우측의 도움말 버튼과 네이티브 <dialog> 모달 (전 화면 공용)
// 기법: 단일 컴포넌트 팩토리(base/component.js) + 네이티브 웹 컴포넌트 (light DOM 모드)
// light-DOM 자식이 도움말 본문(HTML)이 된다. (예: <app-help><h4>…</h4><p>…</p></app-help>)
import { TPL } from "@infra/templates.js";
import { defineComponent } from "@shared/components/base/component.js";

defineComponent({
	tag: "app-help",
	/**
	 * 최초 연결 시 light-DOM 자식(도움말 본문)을 HTML 문자열로 캡처해 보존한다
	 * (연결 순서 정책상 첫 렌더 전에 호출된다)
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
	 * open/close 메서드를 정의하고 열기·닫기·배경 클릭을 연결한다.
	 * ESC 닫기·포커스 트랩은 <dialog> 네이티브 동작(showModal)에 위임한다.
	 */
	onConnect() {
		this._dialog = this.querySelector("[data-help-dialog]");

		this.open = () => {
			const dlg = this._dialog;
			if (dlg && !dlg.open) dlg.showModal();
			this.querySelector("[data-help-open]").setAttribute("aria-expanded", "true");
			this.querySelector("[data-help-close]").focus();
		};
		this.close = () => {
			const dlg = this._dialog;
			if (dlg?.open) dlg.close();
			this.querySelector("[data-help-open]").setAttribute("aria-expanded", "false");
		};
		this.querySelector("[data-help-open]").addEventListener("click", this.open);
		this.querySelector("[data-help-close]").addEventListener("click", this.close);
		// 배경(::backdrop) 클릭 시 닫기 — 클릭 대상이 dialog 자신이면 닫는다
		this._dialog.addEventListener("click", e => {
			if (e.target === e.currentTarget) this.close();
		});
		// 네이티브 ESC/close 후 aria-expanded 동기화
		this._dialog.addEventListener("close", () => {
			const openBtn = this.querySelector("[data-help-open]");
			if (openBtn) openBtn.setAttribute("aria-expanded", "false");
		});
	},
});
