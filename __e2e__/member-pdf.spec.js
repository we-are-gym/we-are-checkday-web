// 파일 용도: 회원 정보 PDF 저장 E2E 테스트 — Mason API PDF 다운로드·콘솔 오류 0건 검증
// 사용: 로컬 검증 시 로컬 API(에뮬레이터)와 함께 실행한다.
//       API 주소는 E2E_API_BASE, 자격증명은 E2E_LOGIN_ID·E2E_PASSWORD 환경변수로 재정의할 수 있다.
//       (기본: 로컬 에뮬레이터 API·시드 사용자)
import { expect, test } from "@playwright/test";

const API_BASE =
	process.env.E2E_API_BASE || (process.env.E2E_PORT ? `http://127.0.0.1:${process.env.E2E_PORT}/api/v1` : "http://127.0.0.1:8900/api/v1");
const LOGIN_ID = process.env.E2E_LOGIN_ID || "trainer@gym.kr";
const PASSWORD = process.env.E2E_PASSWORD || "secure123";

/**
 * 로그인하고 sessionStorage에 저장된 액세스 토큰을 반환한다.
 * @param {import("@playwright/test").Page} page
 * @returns {Promise<string>} Bearer 액세스 토큰
 */
async function loginAndGetToken(page) {
	await page.goto("/login.html");
	await page.waitForSelector("#login-form");
	await page.fill("#login-id", LOGIN_ID);
	await page.fill("#login-pw", PASSWORD);
	await page.locator("#login-form button[type='submit']").click();
	await page.waitForURL("**/index.html**", { timeout: 15_000 });

	const token = await page.evaluate(() => sessionStorage.getItem("checkday.auth.v1"));
	expect(token).toBeTruthy();
	return token;
}

/**
 * 테스트용 회원을 Mason API로 생성하고 member_ID를 반환한다.
 * @param {import("@playwright/test").APIRequestContext} request
 * @param {string} token 액세스 토큰
 * @returns {Promise<string>} 생성된 회원 member_ID
 */
async function createMember(request, token) {
	const response = await request.post(`${API_BASE}/members`, {
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		data: { name: "PDF검증회원", gender: "녀", goal: "체중 유지", trainer: "수코치" },
	});
	expect(response.ok()).toBeTruthy();
	const body = await response.json();
	expect(body.member_ID).toMatch(/^M-/);
	return body.member_ID;
}

test.describe("회원 정보 PDF 저장", () => {
	test("PDF 저장 버튼이 한 장짜리 PDF를 다운로드한다", async ({ page, request }) => {
		/** @type {string[]} */
		const consoleErrors = [];
		page.on("console", msg => {
			if (msg.type() === "error") consoleErrors.push(msg.text());
		});

		const token = await loginAndGetToken(page);
		const memberId = await createMember(request, token);

		// 회원 상세 화면 진입 → PDF 저장 클릭
		await page.goto(`/member-detail.html?memberID=${encodeURIComponent(memberId)}`);
		await expect(page.locator("#md-name")).toHaveText("PDF검증회원", { timeout: 15_000 });

		const downloadPromise = page.waitForEvent("download", { timeout: 20_000 });
		await page.locator("#pdf-download-btn").click();
		const download = await downloadPromise;

		// 다운로드 파일명 검증 — 체크데이_{회원명}_{날짜}.pdf
		expect(download.suggestedFilename()).toMatch(/^체크데이_PDF검증회원_\d{4}-\d{2}-\d{2}\.pdf$/);
		const stream = await download.createReadStream();
		expect(stream).toBeTruthy();

		// 콘솔 오류 0건
		expect(consoleErrors).toEqual([]);
	});

	test("로그인 없이 접근하면 로그인 화면으로 이동한다", async ({ page }) => {
		// 비로그인 상태로 상세 화면 진입 → API 401 → 로그인 페이지 리다이렉트
		// (401 시 앱이 의도적으로 console.error를 남기므로 콘솔 단언은 하지 않는다)
		await page.goto("/member-detail.html?memberID=M-none");
		await page.waitForURL("**/login.html**", { timeout: 15_000 });
		await expect(page.locator("#login-form")).toBeVisible();
	});
});
