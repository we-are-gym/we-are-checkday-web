// 파일 용도: 체크기록 조회 화면 전용 E2E — 작성→저장 후 각 섹션(헤더·인바디·평가·목표·피드백·상담) 렌더링과 회원 링크 검증
import { expect, test } from "@playwright/test";
import { collectConsoleErrors, createMemberViaApi, getToken, loginAndInjectToken } from "./checkdoc-helpers.js";

const consoleErrors = [];

test.beforeEach(async ({ page }) => {
	collectConsoleErrors(page, consoleErrors);
});

test("조회 화면 섹션별 렌더링 — 헤더·인바디·평가·목표·상담·회원 링크", async ({ page }) => {
	await loginAndInjectToken(page);
	const token = await getToken(page.request);
	const memberId = await createMemberViaApi(page.request, token);

	// 작성 화면에서 기록 생성 — 인바디·평가 점수·목표·상담 메모 입력
	await page.goto(`/check-doc-new.html?memberID=${memberId}`);
	await expect(page.locator("#eval-cards .eval-item")).toHaveCount(5);
	await page.fill("#ib-w", "70");
	await page.fill("#ib-m", "32");
	await page.fill("#ib-fat", "18");
	await page.fill("#ib-bmi", "23");
	await page.fill("#ib-bfp", "25");
	await page.fill("#ib-bmr", "1500");
	await page.fill("#ib-vis", "8");
	await page.fill("#ib-comment", "인바디 코멘트 검증");
	// 첫 평가 항목 점수 3점 (점수 컨트롤러 +버튼 3회 — 점은 표시 전용, .score-btn만 클릭 반응)
	const plusBtn = page.locator("#sc-0 .score-btn[data-delta='1']");
	await expect(plusBtn).toBeVisible();
	for (let i = 0; i < 3; i++) await plusBtn.click();
	// 목표 태그 1개 선택 + 메모
	await page.locator(".goal-tag").first().click();
	await page.fill("#goal-memo", "목표 메모 검증");
	await page.fill("#consult-memo", "상담 메모 검증");

	const created = page.waitForResponse(r => r.url().includes("/checkday/checkdocs") && r.request().method() === "POST" && r.ok());
	await page.click('[data-action="save"]');
	await (await created).finished();
	await page.waitForURL(/check-doc-view\.html\?docID=/);

	// 헤더 — 회원명 링크 + 메타(총점)
	const memberLink = page.locator("#vh-title .vh-member");
	await expect(memberLink).toContainText(/E2E평가_/, { timeout: 15000 });
	await expect(page.locator("#vh-meta")).toContainText("총점");

	// 인바디 7셀 + 코멘트
	await expect(page.locator("#ib-grid .ib-cell")).toHaveCount(7);
	await expect(page.locator("#ib-grid .ib-cell").first().locator(".ib-value")).toContainText("70");
	await expect(page.locator("#ib-comment")).toContainText("인바디 코멘트 검증");

	// 평가 5장 + 첫 항목 3점 + 총점
	await expect(page.locator("#eval-list .eval-view")).toHaveCount(5);
	await expect(page.locator("#eval-list .eval-view").first().locator(".ev-score-val")).toContainText("3점");
	await expect(page.locator("#evals-total")).toContainText("총점 3 / ");

	// 목표 태그 + 메모
	await expect(page.locator("#goal-chips .goal-chip").first()).toBeVisible();
	await expect(page.locator("#goal-memo")).toContainText("목표 메모 검증");

	// 상담 메모
	await expect(page.locator("#consult-memo")).toContainText("상담 메모 검증");

	// 회원 링크 → 회원 상세 이동
	await memberLink.click();
	await page.waitForURL(new RegExp(`/member-detail\\.html\\?memberID=${memberId}`));

	expect(consoleErrors).toEqual([]);
});
