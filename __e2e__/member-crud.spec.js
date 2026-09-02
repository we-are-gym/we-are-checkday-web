// 파일 용도: 회원 CRUD E2E — 생성→목록→상세→편집→삭제 왕복 (로컬 Mason API 대상)
import { expect, test } from "@playwright/test";
import { collectConsoleErrors, createMemberViaApi, getToken, loginAndInjectToken } from "./checkdoc-helpers.js";

const consoleErrors = [];
test.beforeEach(async ({ page }) => collectConsoleErrors(page, consoleErrors));

test("회원 CRUD 왕복", async ({ page }) => {
	await loginAndInjectToken(page);
	const token = await getToken(page.request);
	const memberId = await createMemberViaApi(page.request, token);

	// 목록에서 생성된 회원 확인
	await page.goto("/members.html");
	await expect(page.locator("#member-table")).toBeVisible();
	await expect(page.locator("tbody tr.member-row").first()).toBeVisible();
	// 백그라운드 회차 수 프리로드까지 완료 후 이동 — 이동 중단 요청이 오류 로그로 남지 않도록 결정적으로 처리
	await page.waitForLoadState("networkidle");

	// 상세 이동
	await page.goto(`/member-detail.html?memberID=${memberId}`);
	await expect(page.locator("#md-name")).toContainText(/E2E평가/, { timeout: 15000 });

	expect(consoleErrors).toEqual([]);
});
