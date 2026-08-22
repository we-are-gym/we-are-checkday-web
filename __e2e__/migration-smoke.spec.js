// 파일 용도: 스키마 마이그레이션 검증 E2E — 회원 등록(남/녀 성별)·콘솔 오류 수집 (로컬 Mason API 대상)
import { expect, test } from "@playwright/test";

// 콘솔 오류 수집 — 모든 페이지 탐색에서 브라우저 콘솔 error가 없어야 한다
const consoleErrors = [];

test.beforeEach(async ({ page }) => {
	consoleErrors.length = 0;
	page.on("console", msg => {
		if (msg.type() === "error") consoleErrors.push(msg.text());
	});
	page.on("pageerror", err => consoleErrors.push(String(err)));
});

/** 로컬 Mason API(에뮬레이터 연동)에서 액세스 토큰을 발급받아 세션에 주입한다 */
async function loginAndInjectToken(page) {
	const loginRes = await page.request.post("http://127.0.0.1:8900/api/v1/auth/login", {
		data: { username: "trainer@gym.kr", password: "secure123" },
	});
	expect(loginRes.ok()).toBeTruthy();
	const { access_token: token } = await loginRes.json();
	await page.goto("/login.html");
	await page.evaluate(t => sessionStorage.setItem("checkday.auth.v1", t), token);
}

test("회원 등록 화면에서 남/녀 성별로 신규 회원 생성", async ({ page }) => {
	await loginAndInjectToken(page);
	await page.goto("/member-create.html");

	await page.fill("#mf-name", "스모크회원");
	await page.selectOption("#mf-gender", "남");

	const created = page.waitForRequest(req => req.url().includes("/members") && req.method() === "POST");
	await page.click('button[type="submit"]');

	const body = (await created).postDataJSON();
	expect(body.gender).toBe("남"); // 한자 변환 없이 그대로 전송되는지 확인

	// member-create는 등록 후 members.html로 이동한다
	await page.waitForURL(/members\.html/);
});

test("체크기록 작성 화면이 콘솔 오류 없이 로드된다", async ({ page }) => {
	await loginAndInjectToken(page);
	await page.goto("/check-doc-new.html");
	await expect(page.locator("body")).toBeVisible();
	expect(consoleErrors).toEqual([]);
});
