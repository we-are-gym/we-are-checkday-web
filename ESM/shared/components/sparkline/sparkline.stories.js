// 파일 용도: Sparkline 컴포넌트 Storybook 스토리
import "./sparkline.js";

export default {
	title: "Shared/ui-sparkline",
	tags: ["autodocs"],
};

export const Basic = {
	render() {
		return `<ui-sparkline data="[1,3,2,5,4]" width="260" height="68"></ui-sparkline>`;
	},
};

export const Empty = {
	render() {
		return `<ui-sparkline data="[]" width="260" height="68"></ui-sparkline>`;
	},
};
