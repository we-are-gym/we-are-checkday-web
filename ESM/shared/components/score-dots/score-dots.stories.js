// 파일 용도: ScoreDots 컴포넌트 Storybook 스토리
import "./score-dots.js";

export default {
	title: "Shared/ui-score-dots",
	tags: ["autodocs"],
};

export const Zero = {
	render() {
		return `<ui-score-dots score="0" max="3" count="4"></ui-score-dots>`;
	},
};
export const Two = {
	render() {
		return `<ui-score-dots score="2" max="3" count="4"></ui-score-dots>`;
	},
};
export const Max = {
	render() {
		return `<ui-score-dots score="3" max="3" count="4"></ui-score-dots>`;
	},
};
