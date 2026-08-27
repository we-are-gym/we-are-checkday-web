// 파일 용도: 회원 관리 흐름 E2E 테스트 — 목록 로드·검색·상세 이동
// to-be: 인증 토큰 주입으로 로그인 리다이렉트 없이 검증, API 주소·계정은 환경변수 주입
import { expect, test } from "@playwright/test";
import { loginAndInjectToken } from "./checkdoc-helpers.js";

test.beforeEach(async ({ page }) => {
	await loginAndInjectToken(page);
});

test.describe("회원 관리", () => {
	test("회원 목록 로드", async ({ page }) => {
		await page.goto("/members.html");

		// member-table 컴포넌트가 존재하는지 확인
		const table = page.locator("#member-table");
		await expect(table).toBeVisible();

		// 테이블 내부에 tbody가 렌더링되었는지 확인
		const rows = table.locator("tbody tr");
		await expect(rows).not.toHaveCount(0);
	});

	test("회원 검색", async ({ page }) => {
		await page.goto("/members.html");

		// 검색 입력란에 이름 입력
		const searchInput = page.locator("#search-input");
		await searchInput.fill("김");

		// 필터링된 목록 확인 — member-row 요소가 존재해야 함
		const table = page.locator("#member-table");
		const rows = table.locator("tbody tr.member-row");
		const count = await rows.count();

		// 검색 결과가 있으면 member-row가 존재, 없으면 안내 행이 표시됨
		if (count > 0) {
			// 검색된 회원 이름에 "김"이 포함되어야 함
			for (let i = 0; i < count; i++) {
				const name = await rows.nth(i).locator(".member-name").textContent();
				expect(name).toContain("김");
			}
		} else {
			// 빈 목록 안내 메시지 확인
			await expect(table.locator(".member-empty-cell")).toBeVisible();
		}
	});

	test("회원 상세 이동", async ({ page }) => {
		await page.goto("/members.html");

		// 회원 행 클릭 → member-detail.html로 이동 확인
		const table = page.locator("#member-table");
		const firstRow = table.locator("tbody tr.member-row").first();
		await firstRow.click();

		// member-detail.html로 이동했는지 확인
		await expect(page).toHaveURL(/member-detail\.html/);
	});
});
