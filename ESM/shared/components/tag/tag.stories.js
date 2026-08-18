// 파일 용도: Tag 컴포넌트 Storybook 스토리
import "./tag.js";

export default {
	title: "Shared/ui-tag",
	tags: ["autodocs"],
};

/** 기본 태그 */
export const Default = {
	render() {
		return `<ui-tag label="기본 태그"></ui-tag>`;
	},
};

/** 선택된 태그 */
export const Pressed = {
	render() {
		return `<ui-tag label="선택됨" pressed></ui-tag>`;
	},
};

/** 목표 태그 변형 */
export const Goal = {
	render() {
		return `<ui-tag label="근력 향상" variant="goal"></ui-tag>`;
	},
};

/** 체크 태그 변형 */
export const Check = {
	render() {
		return `<ui-tag label="무릎 안쪽 무너짐" variant="check"></ui-tag>`;
	},
};

/** 제거 가능 태그 */
export const Removable = {
	render() {
		return `<ui-tag label="제거 가능" removable></ui-tag>`;
	},
};

/** 비활성화됨 */
export const Disabled = {
	render() {
		return `<ui-tag label="비활성화" disabled></ui-tag>`;
	},
};
