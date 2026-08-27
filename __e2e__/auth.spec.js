// 파일 용도: 로그인/로그아웃 흐름 E2E 테스트
// to-be: 시드 계정 하드코딩 제거 — 환경변수 주입 (E2E_LOGIN_ID/E2E_PASSWORD)
import { expect, test } from "@playwright/test";
import { LOGIN_ID, PASSWORD } from "./checkdoc-helpers.js";
test.describe("인증 흐름", () => {
	test("로그인 페이지 이동", async ({ page }) => {
		// index.html에서 로그인 버튼 클릭 → login.html로 이동 확인
		await page.goto("/index.html");
		await page.waitForSelector("app-header");

		const loginBtn = page.locator("a[data-header-login]");
		await expect(loginBtn).toBeVisible();
		await loginBtn.click();

		await page.waitForURL("**/login.html**");
		await expect(page).toHaveURL(/login\.html/);
		// 로그인 폼이 렌더되었는지 확인
		await expect(page.locator("#login-form")).toBeVisible();
	});
	test("로그인 성공", async ({ page }) => {
		// login.html에서 아이디/비밀번호 입력 → 제출 → index.html로 리다이렉트 확인
		await page.goto("/login.html");
		await page.waitForSelector("#login-form");

		await page.fill("#login-id", LOGIN_ID);
		await page.fill("#login-pw", PASSWORD);
		await page.locator("#login-form button[type='submit']").click();

		// 리다이렉트 후 index.html 도착 확인
		await page.waitForURL("**/index.html**", { timeout: 15_000 });
		await expect(page).toHaveURL(/index\.html/);

		// 로그인 상태에서 로그아웃 버튼이 표시되는지 확인
		await expect(page.locator("[data-header-logout]")).toBeVisible();
	});

	test("로그인 실패", async ({ page }) => {
		// 잘못된 자격증명 → 에러 메시지 표시 확인
		await page.goto("/login.html");
		await page.waitForSelector("#login-form");

		await page.fill("#login-id", "wrong-user");
		await page.fill("#login-pw", "wrong-pw");
		await page.locator("#login-form button[type='submit']").click();

		// 에러 메시지 표시 확인
		const errEl = page.locator("#login-error");
		await expect(errEl).toBeVisible({ timeout: 10_000 });
		await expect(errEl).toHaveText(/.+/, { timeout: 5_000 });

		// 로그인 페이지에 그대로 남아 있는지 확인
		await expect(page).toHaveURL(/login\.html/);
		await expect(page.locator("#login-form")).toBeVisible();
	});
	test("로그아웃", async ({ page }) => {
		// 로그인 상태에서 로그아웃 버튼 클릭 → login.html로 이동 확인
		// 1단계: 먼저 로그인
		await page.goto("/login.html");
		await page.waitForSelector("#login-form");

		await page.fill("#login-id", LOGIN_ID);
		await page.fill("#login-pw", PASSWORD);
		await page.locator("#login-form button[type='submit']").click();
		await page.waitForURL("**/index.html**", { timeout: 15_000 });

		// 2단계: 로그아웃
		const logoutBtn = page.locator("[data-header-logout]");
		await expect(logoutBtn).toBeVisible();
		await logoutBtn.click();

		await page.waitForURL("**/login.html**", { timeout: 10_000 });
		await expect(page).toHaveURL(/login\.html/);
	});
});
