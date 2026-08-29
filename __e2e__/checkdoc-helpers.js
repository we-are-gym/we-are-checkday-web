// 앱 준비 3원칙 — P1 세션 선존재(addInitScript→goto), P2 요청 선대기(waitForResponse 선등록→click), P3 렌더 선확인(goto→toBeVisible/networkidle) + expect.poll 왕복 흡수(100ms 폴링)
 import { expect } from "@playwright/test";
 
/** 로컬 Mason API 주소·계정 — `E2E_API_URL_PREFIX`, `E2E_API_PORT`, `E2E_API_BASE_PATH` 환경변수로 재정의할 수 있다 */
const API_PREFIX = process.env.E2E_API_URL_PREFIX || "http://localhost";
const API_PORT = process.env.E2E_API_PORT || "8900";
const API_BASE_PATH = process.env.E2E_API_BASE_PATH || "/api/v1";
export const API_BASE = `${API_PREFIX}:${API_PORT}${API_BASE_PATH}`;
 export const LOGIN_ID = process.env.E2E_LOGIN_ID || "trainer@gym.kr";
 export const PASSWORD = process.env.E2E_PASSWORD || "secure123";

/** 콘솔 오류 수집기 — 각 테스트 beforeEach에서 reset해 사용한다 */
export function collectConsoleErrors(page, errors) {
	errors.length = 0;
	page.on("console", msg => {
		if (msg.type() === "error") errors.push(msg.text());
	});
	page.on("pageerror", err => errors.push(String(err)));
}

/** API에서 액세스 토큰을 발급받아 반환한다 */
export async function getToken(request) {
	const loginRes = await request.post(`${API_BASE}/auth/login`, {
		data: { username: LOGIN_ID, password: PASSWORD },
	});
	expect(loginRes.ok()).toBeTruthy();
	return (await loginRes.json()).access_token;
}

/** 세션에 토큰을 주입한 뒤 화면을 연다 */
export async function loginAndInjectToken(page) {
	const token = await getToken(page.request);
	await page.goto("/login.html");
	await page.evaluate(t => sessionStorage.setItem("checkday.auth.v1", t), token);
}

/** API로 회원을 만들고 회원 ID를 반환한다 */
export async function createMemberViaApi(request, token) {
	const res = await request.post(`${API_BASE}/members`, {
		headers: { Authorization: `Bearer ${token}` },
		data: { name: `E2E평가_${Date.now()}`, gender: "남" },
	});
	expect(res.ok()).toBeTruthy();
	return (await res.json()).member_ID;
}
