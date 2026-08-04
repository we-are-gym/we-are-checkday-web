// 파일 용도: 공용 헤더 막대 컴포넌트 — 브랜드(로고)·헤더 우측 영역(로그아웃) 제공 (전 화면 공용)
// 기법: 순수 함수형 컴포넌트 팩토리 + 네이티브 웹 컴포넌트 (light DOM 모드)
// light-DOM 자식(<app-gnb>, <app-help>)은 연결 시점에 .header-right로 옮겨 헤더 안에 배치한다.
// 속성: crumb="페이지명" (브레드크럼 표시·클릭 시 前화면 이동), back="前화면 URL", logout (로그아웃 버튼 표시 → login.html 이동)
// 부수 임포트: app-gnb·app-help 등록까지 이 모듈 하나로 처리
import { defineComponent } from "../component-factory.js";
import { TPL } from "../templates.js";
import { logout } from "../auth.js";
import "./app-gnb.js";
import "./app-help.js";

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
	 * 헤더 막대 HTML을 생성한다 (crumb·back·logout 속성 반영)
	 * @returns {string} 헤더 HTML
	 */
	render() {
		return TPL.headerBar({
			crumb: this.getAttribute("crumb") || "",
			backUrl: this.getAttribute("back") || "",
			showLogout: this.hasAttribute("logout"),
		});
	},
	/**
	 * 캡처한 light-DOM 자식을 .header-right로 옮기고 로그아웃 버튼·크럼(前화면) 동작을 연결한다
	 */
	onConnect() {
		const right = this.querySelector(".header-right");
		this._lightChildren.forEach((child) => right.appendChild(child));
		delete this._lightChildren;
		const logoutBtn = this.querySelector("[data-header-logout]");
		if (logoutBtn) {
			logoutBtn.addEventListener("click", () => {
				logout();
				window.location.href = "login.html";
			});
		}
		// 크럼(현재 화면 명칭) 클릭 → back 속성의 前화면으로 이동, 속성이 없으면 히스토리 뒤로
		// 주의: back 속성은 진입점 JS가 memberId 등 동적 값으로 나중에 설정할 수 있으므로 클릭 시점에 읽는다.
		const crumb = this.querySelector("[data-header-crumb]");
		if (crumb) {
			crumb.addEventListener("click", (e) => {
				e.preventDefault();
				const back = this.getAttribute("back");
				if (back) {
					window.location.href = back;
				} else if (window.history.length > 1) {
					window.history.back();
				} else {
					window.location.href = "index.html";
				}
			});
		}
	},
});