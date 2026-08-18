// 파일 용도: Storybook 프리뷰 설정 — 글로벌 파라미터·decorators 정의

/** @type {import("@storybook/web-components").Preview} */
const preview = {
	parameters: {
		layout: "centered",
		backgrounds: {
			default: "dark",
			values: [
				{ name: "dark", value: "#131313" },
				{ name: "light", value: "#ffffff" },
			],
		},
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
	},
};

export default preview;
