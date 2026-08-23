// 파일 용도: app-gnb 컴포넌트 Storybook 스토리
import "./app-gnb.js";

export default {
	title: "Infra/app-gnb",
	tags: ["autodocs"],
};

/** 회원 관리 메뉴 활성화 */
export const MembersActive = {
	render() {
		return `<app-gnb active="members"></app-gnb>`;
	},
};

/** 비활성 상태 */
export const NoneActive = {
	render() {
		return `<app-gnb></app-gnb>`;
	},
};
