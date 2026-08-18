// 파일 용도: Checkbox 컴포넌트 Storybook 스토리
import "./checkbox.js";

export default {
	title: "Shared/ui-checkbox",
	tags: ["autodocs"],
};

/** 기본 체크박스 */
export const Default = {
	render() {
		return `<ui-checkbox label="동의합니다"></ui-checkbox>`;
	},
};

/** 선택된 체크박스 */
export const Checked = {
	render() {
		return `<ui-checkbox label="선택됨" checked></ui-checkbox>`;
	},
};

/** 부분 선택 (indeterminate) */
export const Indeterminate = {
	render() {
		return `<ui-checkbox label="부분 선택" indeterminate></ui-checkbox>`;
	},
};

/** 비활성화됨 */
export const Disabled = {
	render() {
		return `<ui-checkbox label="비활성화" disabled></ui-checkbox>`;
	},
};
