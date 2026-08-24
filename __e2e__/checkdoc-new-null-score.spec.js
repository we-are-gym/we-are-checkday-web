// 파일 용도: 체크기록 작성 화면 E2E — 0점 평가는 오브젝트로, 움직임 평가 목록에 없던 항목은 null로 저장되는지 검증
import { expect, test } from "@playwright/test";

import { collectConsoleErrors, createMemberViaApi, getToken, loginAndInjectToken } from "./checkdoc-helpers.js";

const consoleErrors = [];

test.beforeEach(async ({ page }) => {
	collectConsoleErrors(page, consoleErrors);
});

test("0점 평가는 오브젝트로, 목록에 없던 항목은 null로 저장되고 조회 화면에 0점 카드가 표시된다", async ({ page }) => {
	await loginAndInjectToken(page);
	await createMemberViaApi(page.request, await getToken(page.request));

	await page.goto("/check-doc-new.html");
	await expect(page.locator("#eval-cards .eval-item")).toHaveCount(5); // BASIC5 구성 확인

	// 모든 카드를 건드리지 않은 채 저장 — 첫 카드(Lumbar ROM)만 0점으로 평가된 상태
	await page.fill("#m-member", "계약검증");

	const created = page.waitForRequest(req => req.url().includes("/checkday/checkdocs") && req.method() === "POST");
	await page.click('[data-action="save"]');
	const body = (await created).postDataJSON();
	const evaluation = body.evaluations[0];

	// 목록에 있는 항목은 0점이라도 오브젝트로 저장된다
	expect(evaluation.floor_touch.score).toBe(0);
	// 움직임 평가 목록(BASIC5)에 없던 항목은 null로 저장된다
	expect(evaluation.breathing).toBeNull();
	expect(evaluation.one_leg_squat).toBeNull();
	expect(evaluation.one_leg_bridge).toBeNull();

	// 저장 후 조회 화면 이동 — 5장의 카드(0점 포함)가 모두 표시된다
	await page.waitForURL(/check-doc-view\.html\?docID=/);
	await expect(page.locator(".eval-view")).toHaveCount(5);
	await expect(page.locator(".eval-view").first()).toContainText("0점");
	expect(consoleErrors).toEqual([]);
});
