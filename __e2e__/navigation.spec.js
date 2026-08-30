// 파일 용도: 네비게이션·탭 전환 E2E 테스트
// to-be: 탭 전환은 인증 토큰 주입 및 시드 회원으로 검증
import { expect, test } from "@playwright/test";
import { createMemberViaApi, getToken, loginAndInjectToken } from "./checkdoc-helpers.js";
test.describe("메인 링크 네비게이션", () => {
	test.beforeEach(async ({ page }) => {
		await loginAndInjectToken(page);
	});

	test("메인 → 회원 관리 이동", async ({ page }) => {
		await page.goto("/index.html");

		// 메인의 회원 관리 링크 클릭
		const membersLink = page.locator(".main-actions a").filter({ hasText: "회원 관리" });
		await expect(membersLink).toBeVisible();
		await membersLink.click();

		// members.html로 이동 확인
		await expect(page).toHaveURL(/members\.html/);
	});

	test("메인 → 체크기록 작성 이동", async ({ page }) => {
		await page.goto("/index.html");

		// 메인의 체크기록 작성 링크 클릭
		const checkDocLink = page.locator(".main-actions a").filter({ hasText: "체크기록 작성" });
		await expect(checkDocLink).toBeVisible();
		await checkDocLink.click();

		// check-doc-new.html로 이동 확인
		await expect(page).toHaveURL(/check-doc-new\.html/);
	});
});
test.describe("탭 전환", () => {
	test("탭 전환 — 변화 분석 패널 표시", async ({ page }) => {
		await loginAndInjectToken(page);
		const token = await getToken(page.request);
		const memberId = await createMemberViaApi(page.request, token);
		await page.goto(`/member-detail.html?memberID=${memberId}`);

		// 탭 컨테이너와 탭 버튼 확인
		const tabList = page.locator('[role="tablist"]');
		await expect(tabList).toBeVisible();

		// 기본 상태: 체크 기록 패널이 활성, 변화 분석 패널은 숨김
		const panelRecords = page.locator("#panel-records");
		const panelCompare = page.locator("#panel-compare");
		await expect(panelRecords).toBeVisible();
		await expect(panelCompare).toBeHidden();

		// 변화 분석 탭 클릭
		const compareTab = page.locator(".tab-btn").filter({ hasText: "변화 분석" });
		await compareTab.click();

		// 변화 분석 패널이 표시되고, 체크 기록 패널은 숨김 확인
		await expect(panelCompare).toBeVisible();
		await expect(panelRecords).toBeHidden();
	});
});
