// 파일 용도: Storybook 메인 설정 — 프레임워크·애드온·Vite 별칭 정의
/** @type {import("@storybook/web-components-vite").StorybookConfig} */
const config = {
	stories: ["../ESM/**/*.stories.@(js|ts)"],
	addons: ["@storybook/addon-a11y"],
	framework: "@storybook/web-components-vite",
	viteFinal: async config => {
		// 기존 Vite 모듈 별칭 재사용 — HTML importmap과 동일 매핑
		config.resolve = config.resolve || {};
		config.resolve.alias = {
			...config.resolve.alias,
			"@infra/": "/ESM/infra/",
			"@tools/": "/ESM/tools/",
			"@calc/": "/ESM/calc/",
			"@gym/": "/ESM/gym/",
			"@member/": "/ESM/member/",
			"@check-doc/": "/ESM/check-doc/",
			"@shared/": "/ESM/shared/",
		};
		return config;
	},
};

export default config;
