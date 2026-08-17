// 파일 용도: 공용 헤더 막대 컴포넌트 — 브랜드(로고)·헤더 우측 영역(로그인/로그아웃) 제공 (전 화면 공용)
// 기법: 순수 함수형 컴포넌트 팩토리 + 네이티브 웹 컴포넌트 (light DOM 모드)
// light-DOM 자식(<app-gnb>, <app-help>)은 연결 시점에 .header-right로 옮겨 헤더 안에 배치한다.
// 인증 상태에 따라 로그인/로그아웃 버튼을 자동 전환한다.
// 부수 임포트: app-gnb·app-help 등록까지 이 모듈 하나로 처리
import { isAuthed, logout } from "@infra/auth.js";
import { defineComponent } from "@infra/component-factory.js";
import "@infra/components/app-gnb.js";
import "@infra/components/app-help.js";
import { TPL } from "@infra/templates.js";

defineComponent("app-header", {
	/**
	 * 재렌더(innerHTML 재작성) 전에 원래 light-DOM 자식을 캡처해 보존한다
	 */
	connectedCallback() {
		// innerHTML 재작성 전에 원래 light-DOM 자식을 캡처 (refresh가 자식을 지우기 때문)
		/** @type {Element[]} */
		this._lightChildren = [...this.children];
	},
	/**
	 * 헤더 막대 HTML을 생성한다 (crumb-path 속성 반영, 인증 상태에 따라 로그인/로그아웃 버튼 전환)
	 * @returns {string} 헤더 HTML
	 */
	render() {
		return TPL.headerBar({
			crumbPath: this.getAttribute("crumb-path") || "",
			authed: isAuthed(),
		});
	},
	/**
	 * 캡처한 light-DOM 자식을 .header-right로 옮기고 로그인/로그아웃 버튼·크럼(前화면) 동작을 연결한다
	 */
	onConnect() {
		const right = this.querySelector(".header-right");
		this._lightChildren.forEach(child => right.appendChild(child));
		delete this._lightChildren;

		const logoutBtn = this.querySelector("[data-header-logout]");
		if (logoutBtn) {
			logoutBtn.addEventListener("click", () => {
				logout();
				window.location.href = "login.html";
			});
		}

		const loginBtn = this.querySelector("[data-header-login]");
		if (loginBtn) {
			loginBtn.addEventListener("click", e => {
				e.preventDefault();
				const redirect = encodeURIComponent(window.location.href);
				window.location.href = `login.html?redirect=${redirect}`;
			});
		}

		// 브레드크럼의 링크 구간(index.html·상위 화면)은 템플릿이 <a href>로 렌더링하므로 별도 이벤트 연결 불필요
	},
});
