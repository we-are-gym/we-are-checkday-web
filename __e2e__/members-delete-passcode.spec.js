// 파일 용도: 회원 삭제 3단계(경고×2 + 비밀번호 모달) E2E 테스트
// to-be: 인증 토큰 주입, 삭제 비밀번호는 E2E_DELETE_PASSCODE 환경변수로 주입(미설정 시 스킵)
// 주의: 실제 삭제이므로 E2E_DELETE_PASSCODE 설정 시에만 실행된다. 에뮬레이터 시드 데이터를 1건 소프트 삭제한다.
import { expect, test } from "@playwright/test";
import { loginAndInjectToken } from "./checkdoc-helpers.js";

const PASSCODE = process.env.E2E_DELETE_PASSCODE ?? "";

/** HTML <dialog> 기반 1·2단계 확인을 순서대로 수락한다 (네이티브 window.dialog 아님). */
async function acceptDeleteWarnings(page) {
	const dialog = page.locator("dialog.cd-dialog");
	await expect(dialog).toBeVisible();
	await dialog.locator(".cd-ok").click();
	await expect(dialog).toBeVisible();
	await dialog.locator(".cd-ok").click();
}

test.describe("회원 삭제 3단계 확인", () => {
	test.skip(!PASSCODE, "E2E_DELETE_PASSCODE 미설정 — 삭제 3단계 테스트를 건너뜁니다");

	test.beforeEach(async ({ page }) => {
		await loginAndInjectToken(page);
	});

	/** ui-data-table 본문 행 (구 .member-row 클래스 없음) */
	const memberRows = table => table.locator("tbody tr[data-row-key]");

	test("경고×2 → 비밀번호 모달 → 행 삭제", async ({ page }) => {
		await page.goto("/members.html");
		const table = page.locator("#member-table");
		const rowsBefore = await memberRows(table).count();
		test.skip(rowsBefore === 0, "삭제할 회원이 없습니다");

		await memberRows(table).first().locator(".row-remove").click();
		await acceptDeleteWarnings(page);

		// 3단계: 비밀번호 확인 모달
		const backdrop = page.locator("password-confirm .pc-backdrop");
		await expect(backdrop).toBeVisible();
		await page.locator("password-confirm .pc-input").fill(PASSCODE);
		await page.locator("password-confirm .pc-ok").click();

		// 행이 1개 줄어야 한다
		await expect(memberRows(table)).toHaveCount(rowsBefore - 1);
	});

	test("비밀번호 모달 취소 시 삭제 중단", async ({ page }) => {
		await page.goto("/members.html");
		const table = page.locator("#member-table");
		const rowsBefore = await memberRows(table).count();
		test.skip(rowsBefore === 0, "삭제할 회원이 없습니다");

		await memberRows(table).first().locator(".row-remove").click();
		await acceptDeleteWarnings(page);

		const backdrop = page.locator("password-confirm .pc-backdrop");
		await expect(backdrop).toBeVisible();
		await page.locator("password-confirm .pc-cancel").click();

		// 취소 시 행 수 유지
		await expect(memberRows(table)).toHaveCount(rowsBefore);
	});

	test("오답 비밀번호 시 오류 토스트 + 삭제 중단", async ({ page }) => {
		await page.goto("/members.html");
		const table = page.locator("#member-table");
		const rowsBefore = await memberRows(table).count();
		test.skip(rowsBefore === 0, "삭제할 회원이 없습니다");

		await memberRows(table).first().locator(".row-remove").click();
		await acceptDeleteWarnings(page);

		const backdrop = page.locator("password-confirm .pc-backdrop");
		await expect(backdrop).toBeVisible();
		await page.locator("password-confirm .pc-input").fill(`${PASSCODE}-wrong`);

		const deleteFailed = page.waitForResponse(
			r => r.request().method() === "DELETE" && r.url().includes("/members/") && r.status() === 403
		);
		await page.locator("password-confirm .pc-ok").click();
		await deleteFailed;

		// 403 오류 토스트(.toast-item) + 행 수 유지 — es-toast 호스트는 크기 0이라 getByText 사용
		await expect(page.getByText("회원 삭제 비밀번호가 올바르지 않습니다")).toBeVisible();
		await expect(memberRows(table)).toHaveCount(rowsBefore);
	});
});
