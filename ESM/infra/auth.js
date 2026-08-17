// 파일 용도: 인증·로그인 상태 — JWT 액세스·리프레시 토큰 관리 (전 화면 공용)

import { clearTokens, request, storeTokens } from "@infra/api-client.js";
import { AUTH_KEY } from "./constants.js";

/**
 * 현재 유효한 로그인 상태인지 확인합니다.
 * 토큰이 존재하고 만료되지 않은 경우에만 true를 반환합니다.
 * 만료된 토큰이 남아 있으면 false를 반환하여 login.html의 무한 리다이렉트 루프를 방지합니다.
 * @returns {boolean} 유효한 로그인 상태 여부
 */
export function isAuthed() {
	const token = sessionStorage.getItem(AUTH_KEY);
	if (!token) return false;
	try {
		const payload = JSON.parse(atob(token.split(".")[1]));
		return payload.exp * 1000 > Date.now();
	} catch {
		return false;
	}
}

/**
 * bfcache(뒤로-앞으로 캐시) 복원 시 인증되지 않은 사용자를 로그인 페이지로 리다이렉트합니다.
 *
 * 보호된 페이지의 `<script type="module">` 진입점에서 모듈 최상위에 호출하십시오.
 * `pageshow` 이벤트의 `event.persisted`로 bfcache 복원 여부를 감지합니다.
 * 최초 로드(`persisted === false`)에는 동작하지 않으므로, 기존 인증 흐름에 영향이 없습니다.
 *
 * @returns {void}
 */
export function guardOnBfcache() {
	window.addEventListener("pageshow", event => {
		if (event.persisted && !isAuthed()) {
			window.location.replace("login.html");
		}
	});
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
