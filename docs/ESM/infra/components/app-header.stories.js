// 파일 용도: app-header 컴포넌트 Storybook 스토리
import "./app-header.js";

export default {
	title: "Infra/app-header",
	tags: ["autodocs"],
};

/** 로그인 상태 (로그아웃 버튼 표시) */
export const Authed = {
	render() {
		// sessionStorage에 토큰 설정 (로그인 상태 시뮬레이션)
		sessionStorage.setItem("checkday.auth.v1", "dummy");
		return `<app-header crumb-path="index.html>홈|회원 관리"></app-header>`;
	},
	destroy() {
		sessionStorage.removeItem("checkday.auth.v1");
	},
};

/** 비로그인 상태 (로그인 버튼 표시) */
export const NotAuthed = {
	render() {
		sessionStorage.removeItem("checkday.auth.v1");
		return `<app-header crumb-path="index.html>홈"></app-header>`;
	},
};

/** 브레드크럼 없음 */
export const NoBreadcrumb = {
	render() {
		sessionStorage.removeItem("checkday.auth.v1");
		return `<app-header></app-header>`;
	},
};
