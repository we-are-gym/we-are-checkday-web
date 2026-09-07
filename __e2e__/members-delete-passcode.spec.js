// 파일 용도: 회원 삭제 3단계(경고×2 + 비밀번호 모달) E2E 테스트
// to-be: 인증 토큰 주입, 삭제 비밀번호는 E2E_DELETE_PASSCODE 환경변수로 주입(미설정 시 스킵)
// 주의: 실제 삭제이므로 E2E_DELETE_PASSCODE 설정 시에만 실행된다. 에뮬레이터 시드 데이터를 1건 소프트 삭제한다.
import { expect, test } from "@playwright/test";
import { loginAndInjectToken } from "./checkdoc-helpers.js";

const PASSCODE = process.env.E2E_DELETE_PASSCODE ?? "";

test.describe("회원 삭제 3단계 확인", () => {
	test.skip(!PASSCODE, "E2E_DELETE_PASSCODE 미설정 — 삭제 3단계 테스트를 건너뜁니다");

	test.beforeEach(async ({ page }) => {
		await loginAndInjectToken(page);
	});

	test("경고×2 → 비밀번호 모달 → 행 삭제", async ({ page }) => {
		await page.goto("/members.html");
		const table = page.locator("#member-table");
		const rowsBefore = await table.locator("tbody tr.member-row").count();
		test.skip(rowsBefore === 0, "삭제할 회원이 없습니다");

		// 1·2차 confirm 대화는 자동 수락
		page.on("dialog", dialog => dialog.accept());

		await table.locator("tbody tr.member-row").first().locator(".member-remove").click();

		// 3단계: 비밀번호 확인 모달
		const backdrop = page.locator("password-confirm .pc-backdrop");
		await expect(backdrop).toBeVisible();
		await page.locator("password-confirm .pc-input").fill(PASSCODE);
		await page.locator("password-confirm .pc-ok").click();

		// 행이 1개 줄어야 한다
		await expect(table.locator("tbody tr.member-row")).toHaveCount(rowsBefore - 1);
	});

	test("비밀번호 모달 취소 시 삭제 중단", async ({ page }) => {
		await page.goto("/members.html");
		const table = page.locator("#member-table");
		const rowsBefore = await table.locator("tbody tr.member-row").count();
		test.skip(rowsBefore === 0, "삭제할 회원이 없습니다");

		page.on("dialog", dialog => dialog.accept());

		await table.locator("tbody tr.member-row").first().locator(".member-remove").click();

		const backdrop = page.locator("password-confirm .pc-backdrop");
		await expect(backdrop).toBeVisible();
		await page.locator("password-confirm .pc-cancel").click();

		// 취소 시 행 수 유지
		await expect(table.locator("tbody tr.member-row")).toHaveCount(rowsBefore);
	});

	test("오답 비밀번호 시 오류 토스트 + 삭제 중단", async ({ page }) => {
		await page.goto("/members.html");
		const table = page.locator("#member-table");
		const rowsBefore = await table.locator("tbody tr.member-row").count();
		test.skip(rowsBefore === 0, "삭제할 회원이 없습니다");

		page.on("dialog", dialog => dialog.accept());

		await table.locator("tbody tr.member-row").first().locator(".member-remove").click();

		const backdrop = page.locator("password-confirm .pc-backdrop");
		await expect(backdrop).toBeVisible();
		await page.locator("password-confirm .pc-input").fill(`${PASSCODE}-wrong`);
		await page.locator("password-confirm .pc-ok").click();

		// 403 오류 토스트가 표시되고(로그인 이동 없음) 행 수는 유지된다
		await expect(page.locator("es-toast", { hasText: "회원 삭제 비밀번호가 올바르지 않습니다" })).toBeVisible();
		await expect(table.locator("tbody tr.member-row")).toHaveCount(rowsBefore);
	});
});
