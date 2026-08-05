// 파일 용도: 인증·로그인 상태 — 세션(sessionStorage) 기반 데모 로그인 (전 화면 공용)
// 주의: 저장/인증 API 미배포 상태이므로 브라우저 세션 동안만 상태를 기억하는 mock이다.
const AUTH_KEY = "checkday.auth.v1";

/** 현재 로그인 상태인지 */
export function isAuthed() {
	return sessionStorage.getItem(AUTH_KEY) === "1";
}

/** 로그인 상태 기록 */
export function login() {
	sessionStorage.setItem(AUTH_KEY, "1");
}

/** 로그아웃 — 상태 해제 */
export function logout() {
	sessionStorage.removeItem(AUTH_KEY);
}