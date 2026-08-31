// 파일 용도: 토큰 저장소 추상화 — Storage 인터페이스 래퍼 + 비-DOM 환경 폴백 + sessionStorage 마이그레이션
// 기법: AUTH_KEY/REFRESH_KEY 키 기반 get/set/clear + localStorage 영속(sessionStorage 1회 마이그레이션)
// 주의: 이 모듈은 api-client.js/auth.js/login-redirect.js가 공유하는 단일 소스입니다.

import { AUTH_KEY, REFRESH_KEY } from "./constants.js";

/**
 * 사용 가능한 영속 저장소를 반환합니다.
 * - 브라우저: localStorage (탭·브라우저 영속)
 * - localStorage 차단 시: sessionStorage 폴백
 * - 비-DOM(bun test 등): 메모리 Map 폴백
 * @returns {Storage} 저장소 인스턴스
 */
export function getStorage() {
	try {
		if (typeof window !== "undefined" && window.localStorage) {
			const test = "__checkday_storage_test__";
			window.localStorage.setItem(test, "1");
			window.localStorage.removeItem(test);
			return window.localStorage;
		}
	} catch {
		// localStorage 접근 불가 → 폴백
	}
	if (typeof window !== "undefined" && window.sessionStorage) {
		return window.sessionStorage;
	}
	if (!globalThis.__checkdayTokenStore) {
		const map = new Map();
		globalThis.__checkdayTokenStore = {
			getItem: key => (map.has(key) ? map.get(key) : null),
			setItem: (key, value) => map.set(key, String(value)),
			removeItem: key => map.delete(key),
		};
	}
	return globalThis.__checkdayTokenStore;
}

/**
 * sessionStorage에서 이전 토큰을 마이그레이션합니다.
 * - v1에서 sessionStorage에 저장된 토큰을 localStorage로 1회 복사 후 원본 삭제
 * - getAuthToken() 최초 호출 시 1회 실행
 * @returns {void}
 */
export function migrateFromSessionStorage() {
	if (typeof window === "undefined" || !window.sessionStorage) return;
	const auth = window.sessionStorage.getItem(AUTH_KEY);
	const refresh = window.sessionStorage.getItem(REFRESH_KEY);
	if (!auth && !refresh) return;
	const storage = getStorage();
	if (auth && !storage.getItem(AUTH_KEY)) storage.setItem(AUTH_KEY, auth);
	if (refresh && !storage.getItem(REFRESH_KEY)) storage.setItem(REFRESH_KEY, refresh);
	window.sessionStorage.removeItem(AUTH_KEY);
	window.sessionStorage.removeItem(REFRESH_KEY);
}

let migrated = false;

/**
 * 액세스 토큰을 읽습니다. 최초 호출 시 sessionStorage 마이그레이션을 수행합니다.
 * @returns {string | null} 액세스 토큰
 */
export function getAuthToken() {
	if (!migrated) {
		migrated = true;
		migrateFromSessionStorage();
	}
	return getStorage().getItem(AUTH_KEY);
}

/**
 * 액세스 토큰을 저장합니다.
 * @param {string} token JWT 액세스 토큰
 * @returns {void}
 */
export function setAuthToken(token) {
	getStorage().setItem(AUTH_KEY, token);
}

/**
 * 리프레시 토큰을 읽습니다.
 * @returns {string | null} 리프레시 토큰
 */
export function getRefreshToken() {
	return getStorage().getItem(REFRESH_KEY);
}

/**
 * 리프레시 토큰을 저장합니다.
 * @param {string} token JWT 리프레시 토큰
 * @returns {void}
 */
export function setRefreshToken(token) {
	getStorage().setItem(REFRESH_KEY, token);
}

/**
 * 액세스·리프레시 토큰 쌍을 저장합니다.
 * @param {string} accessToken 액세스 토큰
 * @param {string} refreshToken 리프레시 토큰
 * @returns {void}
 */
export function storeTokens(accessToken, refreshToken) {
	const storage = getStorage();
	storage.setItem(AUTH_KEY, accessToken);
	storage.setItem(REFRESH_KEY, refreshToken);
}

/**
 * 액세스·리프레시 토큰을 삭제합니다. (내부용 — 이벤트 통지 없음)
 * @returns {void}
 */
export function clearTokensRaw() {
	const storage = getStorage();
	storage.removeItem(AUTH_KEY);
	storage.removeItem(REFRESH_KEY);
}

// EOF
