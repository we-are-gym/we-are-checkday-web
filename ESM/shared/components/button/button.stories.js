// 파일 용도: Button 컴포넌트 Storybook 스토리
import "./button.js";

export default {
	title: "Shared/ui-button",
	tags: ["autodocs"],
};

/** 기본 primary 버튼 */
export const Primary = {
	render() {
		return `<ui-button variant="primary">저장</ui-button>`;
	},
};

/** ghost 버튼 */
export const Ghost = {
	render() {
		return `<ui-button variant="ghost">취소</ui-button>`;
	},
};

/** danger 버튼 */
export const Danger = {
	render() {
		return `<ui-button variant="danger">삭제</ui-button>`;
	},
};

/** 비활성화됨 */
export const Disabled = {
	render() {
		return `<ui-button variant="primary" disabled>비활성화</ui-button>`;
	},
};

/** 로딩 상태 */
export const Loading = {
	render() {
		return `<ui-button variant="primary" loading>저장 중...</ui-button>`;
	},
};
