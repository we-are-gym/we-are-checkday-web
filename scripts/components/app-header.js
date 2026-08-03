// 파일 용도: 공용 헤더 막대 컴포넌트 — 브랜드(로고)·헤더 우측 영역(로그아웃) 제공 (전 화면 공용)
// 기법: 순수 함수형 컴포넌트 팩토리 + 네이티브 웹 컴포넌트 (light DOM 모드)
// light-DOM 자식(<app-gnb>, <app-help>)은 연결 시점에 .header-right로 옮겨 헤더 안에 배치한다.
// 속성: crumb="페이지명" (브레드크럼 표시), logout (로그아웃 버튼 표시 → login.html 이동)
// 부수 임포트: app-gnb·app-help 등록까지 이 모듈 하나로 처리
import { defineComponent } from "../component-factory.js";
import { TPL } from "../templates.js";
import { logout } from "../auth.js";
import "./app-gnb.js";
import "./app-help.js";

defineComponent("app-header", {
	// innerHTML 재작성 전에 원래 light-DOM 자식을 캡처 (refresh가 자식을 지우기 때문)
	connectedCallback() {
		/** @type {Element[]} */
		this._lightChildren = [...this.children];
	},
	render() {
		return TPL.headerBar({
			crumb: this.getAttribute("crumb") || "",
			showLogout: this.hasAttribute("logout"),
		});
	},
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
	},
});