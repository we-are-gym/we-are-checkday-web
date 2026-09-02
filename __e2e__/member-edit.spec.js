// 파일 용도: 회원 정보 편집 화면 E2E — 프리필→수정→저장→상세 복귀, 취소→상세 복귀 왕복 검증
import { expect, test } from "@playwright/test";
import { collectConsoleErrors, createMemberViaApi, getToken, loginAndInjectToken } from "./checkdoc-helpers.js";

const consoleErrors = [];

test.beforeEach(async ({ page }) => {
	collectConsoleErrors(page, consoleErrors);
});

test("회원 정보 수정 — 프리필·저장 후 상세 화면에 반영", async ({ page }) => {
	await loginAndInjectToken(page);
	const token = await getToken(page.request);
	const memberId = await createMemberViaApi(page.request, token);

	// 편집 화면 진입 — 기존 회원명이 프리필되어 있다
	await page.goto(`/member-edit.html?memberID=${memberId}`);
	const nameInput = page.locator("#mf-name");
	await expect(nameInput).toBeVisible({ timeout: 15000 });
	await expect(nameInput).toHaveValue(/E2E평가_/);

	// 이름 수정 후 저장 → 상세 화면으로 복귀하며 수정된 이름이 표시된다
	const editedName = `E2E수정_${Date.now()}`;
	await nameInput.fill(editedName);
	await page.locator('button[type="submit"]').click();
	await page.waitForURL(new RegExp(`/member-detail\\.html\\?memberID=${memberId}`));
	await expect(page.locator("#md-name")).toContainText(editedName, { timeout: 15000 });

	expect(consoleErrors).toEqual([]);
});

test("회원 정보 편집 취소 — 상세 화면으로 복귀", async ({ page }) => {
	await loginAndInjectToken(page);
	const token = await getToken(page.request);
	const memberId = await createMemberViaApi(page.request, token);

	await page.goto(`/member-edit.html?memberID=${memberId}`);
	await expect(page.locator("#mf-name")).toBeVisible({ timeout: 15000 });

	// 취소 → member-edit.js onCancel이 상세 화면(detailUrl)으로 복귀시킨다
	await page.locator("[data-cancel]").click();
	await page.waitForURL(new RegExp(`/member-detail\\.html\\?memberID=${memberId}`));

	expect(consoleErrors).toEqual([]);
});
