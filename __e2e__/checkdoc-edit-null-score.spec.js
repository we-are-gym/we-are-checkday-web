// 파일 용도: 체크기록 편집 화면 E2E — 0점 포함 점수 프리필과 삭제한 항목이 PUT 본문에서 null로 복원되는지 검증
import { expect, test } from "@playwright/test";

import { API_BASE, collectConsoleErrors, createMemberViaApi, getToken, loginAndInjectToken } from "./checkdoc-helpers.js";

const consoleErrors = [];

test.beforeEach(async ({ page }) => {
	collectConsoleErrors(page, consoleErrors);
});

test("0점 포함 점수가 프리필되고, 삭제한 항목은 PUT 본문에서 null이 된다", async ({ page }) => {
	await loginAndInjectToken(page);
	const token = await getToken(page.request);
	const memberId = await createMemberViaApi(page.request, token);

	// floor_touch 1점(증감 클릭으로 2점 변화를 확정하기 위함), wall_angel 2점
	const docRes = await page.request.post(`${API_BASE}/checkday/checkdocs`, {
		headers: { Authorization: `Bearer ${token}` },
		data: {
			member_ID: memberId,
			session_label: "1회차",
			evaluations: [
				{
					floor_touch: { score: 1, evaluation_items: [], memo: null },
					wall_angel: { score: 2, evaluation_items: [], memo: null },
				},
			],
		},
	});
	expect(docRes.ok()).toBeTruthy();
	const docId = (await docRes.json()).checkdoc_ID;

	await page.goto(`/check-doc-edit.html?docID=${docId}`);
	await expect(page.locator("#eval-cards .eval-item")).toHaveCount(2);
	// 프리필 확인 — 첫 카드 점수 속성과 총점 표기
	await expect(page.locator("#sc-0")).toHaveAttribute("score", "1");
	await expect(page.locator("#total-num")).toContainText("3");

	// 첫 번째 항목(Lumbar ROM) 삭제 → 저장
	await page.locator('.eval-name button[title="항목 삭제"]').first().click();
	await expect(page.locator("#eval-cards .eval-item")).toHaveCount(1);

	const updated = page.waitForResponse(r => r.url().includes("/checkday/checkdocs/") && r.request().method() === "PUT" && r.ok());
	await page.click('[data-action="save"]');
	const body = (await updated).request().postDataJSON();
	const evaluation = body.evaluations[0];

	// 삭제한 항목은 이전 값(1점)이 남지 않고 null로 대체된다
	expect(evaluation.floor_touch).toBeNull();
	expect(evaluation.wall_angel.score).toBe(2);

	// 조회 화면 — 남은 항목 1장만 표시
	await page.waitForURL(new RegExp(`check-doc-view\\.html\\?docID=${docId}`));
	await expect(page.locator(".eval-view")).toHaveCount(1);
	await expect(page.locator(".eval-view").first()).toContainText("Wall Angel Test");
	expect(consoleErrors).toEqual([]);
});
