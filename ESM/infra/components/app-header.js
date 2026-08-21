// 파일 용도: 공용 헤더 막대 컴포넌트 — 브랜드(로고)·헤더 우측 영역(로그인/로그아웃) 제공 (전 화면 공용)
// 기법: 순수 함수형 컴포넌트 팩토리 + 네이티브 웹 컴포넌트 (light DOM 모드)
// light-DOM 자식(<app-gnb>, <app-help>)은 연결 시점에 .header-right로 옮겨 헤더 안에 배치한다.
// 인증 상태에 따라 로그인/로그아웃 버튼을 자동 전환한다.
// 부수 임포트: app-gnb·app-help 등록까지 이 모듈 하나로 처리
import { isAuthed, logout, subscribeAuthState } from "@infra/auth.js";
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
	 * 헤더 막대 HTML을 생성한다 (crumb-path 속성 반영) — 인증 버튼은 data-auth-area 슬롯만 배치
	 * @returns {string} 헤더 HTML
	 */
	render() {
		return TPL.headerBar({
			crumbPath: this.getAttribute("crumb-path") || "",
		});
	},
	/**
	 * 인증 영역(data-auth-area)만 로그인/로그아웃 버튼으로 채우고 클릭 동작을 바인딩한다.
	 * 인증 상태 변경 시 이 메서드만 재호출하면 헤더 전체 재렌더(light-DOM 자식 소실) 없이 버튼이 갱신된다.
	 * @returns {void}
	 */
	renderAuth() {
		const area = this.querySelector("[data-auth-area]");
		if (!area) return;
		area.innerHTML = isAuthed()
			? `<button type="button" class="link-btn" data-header-logout aria-label="로그아웃">로그아웃</button>`
			: `<a class="link-btn" data-header-login href="login.html" aria-label="로그인">로그인</a>`;

		const logoutBtn = area.querySelector("[data-header-logout]");
		if (logoutBtn) {
			logoutBtn.addEventListener("click", () => {
				logout();
				window.location.href = "login.html";
			});
		}

		const loginBtn = area.querySelector("[data-header-login]");
		if (loginBtn) {
			loginBtn.addEventListener("click", e => {
				e.preventDefault();
				const redirect = encodeURIComponent(window.location.href);
				window.location.href = `login.html?redirect=${redirect}`;
			});
		}
	},
	/**
	 * 캡처한 light-DOM 자식을 .header-right로 옮기고 인증 버튼을 렌더한 뒤,
	 * 인증 상태 변경(로그인·로그아웃·토큰 갱신·타 탭)을 구독해 버튼을 즉시 갱신한다.
	 * MPA 특성상 헤더는 페이지 수명 동안 1회 연결되므로 구독 해제는 생략한다 (메모리 누수 없음).
	 */
	onConnect() {
		const right = this.querySelector(".header-right");
		this._lightChildren.forEach(child => right.appendChild(child));
		delete this._lightChildren;

		this.renderAuth();
		if (!this._unsubAuth) {
			this._unsubAuth = subscribeAuthState(() => this.renderAuth());
		}
	},
});
