// 파일 용도: 인증·로그인 상태 — JWT 액세스·리프레시 토큰 관리 (전 화면 공용)
import { request, storeTokens, clearTokens } from "@infra/api-client.js";

const AUTH_KEY = "checkday.auth.v1";

/** 현재 로그인 상태인지 확인합니다.
 * @returns {boolean} 로그인 상태 여부
 */
export function isAuthed() {
	return sessionStorage.getItem(AUTH_KEY) !== null;
}

/**
 * 데모 자격증명으로 로그인하고 JWT 액세스·리프레시 토큰을 저장합니다.
 * @param {string} username 아이디
 * @param {string} password 비밀번호
 * @returns {Promise<object>} 로그인 응답(access_token·refresh_token·user 등)
 */
export async function login(username, password) {
	const res = await request("/auth/login", {
		method: "POST",
		body: { username, password },
	});
	storeTokens(res.access_token, res.refresh_token);
	return res;
}

/** 로그아웃하여 인증 상태를 해제합니다.
 * @returns {void}
 */
export function logout() {
	clearTokens();
}
