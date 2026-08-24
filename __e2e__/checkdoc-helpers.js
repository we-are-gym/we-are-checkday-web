// 파일 용도: 체크기록 E2E 공용 헬퍼 — 로그인 토큰 주입·API 회원 생성 (로컬 Mason API 대상)
import { expect } from "@playwright/test";

/** 로컬 Mason API 주소·계정 — E2E_API_BASE·E2E_LOGIN_ID·E2E_PASSWORD 환경변수로 재정의할 수 있다 */
export const API_BASE = process.env.E2E_API_BASE || "http://127.0.0.1:8900/api/v1";
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
