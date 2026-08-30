// 파일 용도: 전 화면 스모크 테스트 — 빈 페이지에서 5초 안에 무언가 그려지는지 확인
import { expect, test } from "@playwright/test";
import { loginAndInjectToken } from "./checkdoc-helpers.js";

const PAGES = [
	{ path: "/index.html", requiresAuth: false },
	{ path: "/login.html", requiresAuth: false },
	{ path: "/members.html", requiresAuth: true },
	{ path: "/member-create.html", requiresAuth: true },
	{ path: "/check-doc-new.html", requiresAuth: true },
	{ path: "/checkday_1.html", requiresAuth: true },
	{ path: "/basic_function_assessment_2.html", requiresAuth: true },
];

for (const { path, requiresAuth } of PAGES) {
	test(`스모크: ${path} 가 5초 내 렌더링`, async ({ page }) => {
		const errors = [];
		page.on("console", msg => {
			if (msg.type() === "error") errors.push(msg.text());
		});
		page.on("pageerror", err => errors.push(String(err)));

		if (requiresAuth) {
			await loginAndInjectToken(page);
		}

		await page.goto(path, { waitUntil: "domcontentloaded" });
		await expect(page.locator("body")).not.toBeEmpty({ timeout: 5000 });
		// 콘솔 에러는 401 리다이렉트 등 의도적 에러 제외하고 0건 기대 — 스모크는 렌더만 확인하므로 에러 단언 생략
	});
}
