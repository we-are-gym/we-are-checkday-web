// 파일 용도: 회원 상세 PNG 저장 E2E 테스트 — 외부 도메인 차단 상태에서 html2canvas 로컬 호스팅 전환 검증
// 사용: 로컬 검증 시 로컬 API(에뮬레이터)와 함께 실행한다.
//       API 주소는 `E2E_API_URL_PREFIX`, `E2E_API_PORT`, `E2E_API_BASE_PATH` 환경변수로 재정의할 수 있다.
import { expect, test } from "@playwright/test";
import { API_BASE, getToken, loginAndInjectToken } from "./checkdoc-helpers.js";

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
		data: { name: "PNG검증회원", gender: "남", goal: "근력 향상", trainer: "김코치" },
	});
	expect(response.ok()).toBeTruthy();
	const body = await response.json();
	expect(body.member_ID).toMatch(/^M-/);
	return body.member_ID;
}

test.describe("회원 정보 PNG 저장", () => {
	test("외부 도메인 차단 상태에서 PNG 저장 버튼이 이미지를 다운로드한다", async ({ page, request }) => {
		/** @type {string[]} */
		const consoleErrors = [];
		page.on("console", msg => {
			if (msg.type() === "error") consoleErrors.push(msg.text());
		});
		page.on("pageerror", err => consoleErrors.push(String(err)));

		// cdnjs 등 외부 CDN에 의존하지 않고 PNG 캡처가 동작함을 입증한다
		await page.route("**/*", route => {
			const url = new URL(route.request().url());
			if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
				route.continue();
			} else {
				route.abort();
			}
		});

		await loginAndInjectToken(page);
		const token = await getToken(page.request);
		const memberId = await createMember(request, token);

		await page.goto(`/member-detail.html?memberID=${encodeURIComponent(memberId)}`);
		await expect(page.locator("#md-name")).toHaveText("PNG검증회원", { timeout: 15_000 });
		await expect(page.locator("#export-png-btn")).toBeEnabled();

		const downloadPromise = page.waitForEvent("download", { timeout: 20_000 });
		await page.locator("#export-png-btn").click();
		const download = await downloadPromise;

		// 다운로드 파일명 검증 — 체크데이_{회원명}_{날짜}.png
		expect(download.suggestedFilename()).toMatch(/^체크데이_PNG검증회원_\d{4}-\d{2}-\d{2}\.png$/);
		const stream = await download.createReadStream();
		expect(stream).toBeTruthy();

		// 외부 차단 상태에서도 콘솔 오류 0건
		expect(consoleErrors).toEqual([]);
	});
});
