// 파일 용도: 모바일 뷰포트 스모크 — 핵심 화면이 375px 뷰포트에서 콘솔 오류 없이 로드되고 가로 오버플로가 없는지 검증
// 기법: mobile-chromium 프로젝트(전용 testMatch)로만 실행 — 기능 왕복은 데스크톱 스위트가 담당, 여기선 렌더·오버플로만 확인
import { expect, test } from "@playwright/test";
import { collectConsoleErrors, createMemberViaApi, getToken, loginAndInjectToken } from "./checkdoc-helpers.js";

const consoleErrors = [];

test.beforeEach(async ({ page }) => {
	collectConsoleErrors(page, consoleErrors);
});

/** 화면별 접근 전처리 — 인증·시드 준비 후 최종 URL 반환 */
const TARGETS = [
	{ path: "/index.html", setup: () => Promise.resolve("/index.html") },
	{ path: "/login.html", setup: () => Promise.resolve("/login.html") },
	{
		path: "/members.html",
		setup: async page => {
			await loginAndInjectToken(page);
			return "/members.html";
		},
	},
	{
		path: "/check-doc-new.html",
		setup: async page => {
			await loginAndInjectToken(page);
			return "/check-doc-new.html";
		},
	},
	{
		path: "/member-detail.html",
		setup: async page => {
			await loginAndInjectToken(page);
			const token = await getToken(page.request);
			const memberId = await createMemberViaApi(page.request, token);
			return `/member-detail.html?memberID=${memberId}`;
		},
	},
	{
		path: "/checkday_1.html",
		setup: async page => {
			await loginAndInjectToken(page);
			return "/checkday_1.html";
		},
	},
	{
		path: "/basic_function_assessment_2.html",
		setup: async page => {
			await loginAndInjectToken(page);
			return "/basic_function_assessment_2.html";
		},
	},
];

for (const target of TARGETS) {
	test(`모바일 스모크 — ${target.path} 로드·가로 오버플로 없음`, async ({ page }) => {
		const url = await target.setup(page);
		await page.goto(url);
		await page.waitForLoadState("networkidle");

		// 가로 오버플로 검사 — 스크롤 폭이 뷰포트 폭을 초과하지 않아야 한다
		const overflow = await page.evaluate(() => {
			const doc = document.scrollingElement || document.documentElement;
			return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth };
		});
		expect(overflow.scrollWidth, `가로 오버플로: ${overflow.scrollWidth}px > ${overflow.clientWidth}px`).toBeLessThanOrEqual(
			overflow.clientWidth
		);

		expect(consoleErrors).toEqual([]);
	});
}
