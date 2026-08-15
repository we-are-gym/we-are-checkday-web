// 파일 용도: 인증·로그인 상태 — 세션(sessionStorage) 기반 데모 로그인 (전 화면 공용)
// 주의: 저장/인증 API 미배포 상태이므로 브라우저 세션 동안만 상태를 기억하는 mock이다.
const AUTH_KEY = "checkday.auth.v1";

/**
 * 저장된 JWT 액세스 토큰을 반환합니다.
 * @returns {string|null} 액세스 토큰
 */
export function getToken() {
	return sessionStorage.getItem(AUTH_KEY);
}

/**
 * JWT 액세스 토큰을 저장합니다.
 * @param {string} token 액세스 토큰
 * @returns {void}
 */
function setToken(token) {
	sessionStorage.setItem(AUTH_KEY, token);
}

/**
 * 저장된 토큰을 삭제합니다.
 * @returns {void}
 */
function clearToken() {
	sessionStorage.removeItem(AUTH_KEY);
}

/** 현재 로그인 상태인지 확인합니다.
 * @returns {boolean} 로그인 상태 여부
 */
export function isAuthed() {
	return getToken() !== null;
}

/** 로그인 상태를 기록합니다.
 * @returns {void}
 */
export function login() {
	// 1단계에서는 mock 값 "1"을 유지합니다. 2단계에서 JWT 토큰 저장으로 교체됩니다.
	setToken("1");
}

/** 로그아웃하여 인증 상태를 해제합니다.
 * @returns {void}
 */
export function logout() {
	clearToken();
}
