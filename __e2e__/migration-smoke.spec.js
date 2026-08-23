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

/** 로컬 Mason API 주소·계정 — E2E_API_BASE·E2E_LOGIN_ID·E2E_PASSWORD 환경변수로 재정의할 수 있다 */
const API_BASE = process.env.E2E_API_BASE || "http://127.0.0.1:8900/api/v1";
const LOGIN_ID = process.env.E2E_LOGIN_ID || "trainer@gym.kr";
const PASSWORD = process.env.E2E_PASSWORD || "secure123";

async function loginAndInjectToken(page) {
	const loginRes = await page.request.post(`${API_BASE}/auth/login`, {
		data: { username: LOGIN_ID, password: PASSWORD },
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

test("여성(녀) 성별로 신규 회원 생성 — 전송값은 녀, 목록 표기는 여", async ({ page }) => {
	await loginAndInjectToken(page);
	await page.goto("/member-create.html");

	await page.fill("#mf-name", "스모크여성회원");
	await page.selectOption("#mf-gender", "녀");

	const created = page.waitForRequest(req => req.url().includes("/members") && req.method() === "POST");
	await page.click('button[type="submit"]');

	// 저장·전송값은 API 계약(남/녀)을 따른다
	const body = (await created).postDataJSON();
	expect(body.gender).toBe("녀");

	await page.waitForURL(/members\.html/);
	// 목록 화면 표기는 남/여로 변환된다
	await expect(page.locator(".member-gender", { hasText: "여" }).first()).toBeVisible();
	expect(consoleErrors).toEqual([]);
});

test("체크기록 작성 화면이 콘솔 오류 없이 로드된다", async ({ page }) => {
	await loginAndInjectToken(page);
	await page.goto("/check-doc-new.html");
	await expect(page.locator("body")).toBeVisible();
	expect(consoleErrors).toEqual([]);
});
