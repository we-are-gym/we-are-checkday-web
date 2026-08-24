// 파일 용도: 인증·로그인 상태 — JWT 액세스·리프레시 토큰 관리 (전 화면 공용)

import { clearTokens, isTokenExpired, request, storeTokens } from "@infra/api-client.js";
import { AUTH_CHANGE_EVENT, AUTH_KEY, REFRESH_KEY } from "./constants.js";
import { redirectToLogin } from "./login-redirect.js";

/**
 * 현재 유효한 로그인 상태인지 확인합니다.
 * 토큰이 존재하고 만료되지 않은 경우에만 true를 반환합니다.
 * 만료된 토큰이 남아 있으면 false를 반환하여 login.html의 무한 리다이렉트 루프를 방지합니다.
 * 만료 판정은 api-client.isTokenExpired()와 단일 소스로 공유한다.
 * @returns {boolean} 유효한 로그인 상태 여부
 */
export function isAuthed() {
	const token = sessionStorage.getItem(AUTH_KEY);
	if (!token) return false;
	return !isTokenExpired(token);
}
/**
 * bfcache(뒤로-앞으로 캐시) 복원 시 인증 상태를 검사하고 필요한 갱신을 수행합니다.
 * - 인증되지 않은 복원: 원래 화면 경로를 ?redirect= 쿼리로 보존하여 로그인 페이지로 리다이렉트합니다.
 *   재로그인하면 밀려났던 화면으로 돌아옵니다.
 * - 인증된 복원: onRestore 콜백을 실행해 스토어 등 화면 데이터를 다시 읽어 최신 상태를 표시합니다.
 *
 * @param {() => (void | Promise<void>)} [onRestore] 복원 직후 실행할 데이터 갱신 콜백.
 *   편집 폼처럼 미저장 입력이 있는 화면은 프리필을 다시 실행하는 콜백을 넘기지 말 것 —
 *   복원 시점의 DOM 입력이 사라진다.
 * @returns {void}
 */
export function guardOnBfcache(onRestore) {
	window.addEventListener("pageshow", async event => {
		if (!event.persisted) return;
		if (!isAuthed()) {
			redirectToLogin();
			return;
		}
		if (!onRestore) return;
		try {
			await onRestore();
		} catch (err) {
			console.error("bfcache 복원 후 화면 데이터 갱신 실패:", err);
		}
	});
}

/**
 * 자격증명으로 로그인하고 JWT 액세스·리프레시 토큰을 저장합니다.
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

// ── 인증 상태 변경 통지 (반응형 UI용 구독) ──

/** 인증 상태 구독자 집합 — DOM 비의존 코어 (bun test 등에서도 동작) */
const authListeners = new Set();

/**
 * 인증 상태 변경을 구독한다.
 * 토큰 저장·삭제(로그인·로그아웃·리프레시)와 타 탭 로그인/로그아웃(storage 이벤트) 시 listener()가 호출된다.
 * @param {() => void} listener 인증 상태 변경 시 호출할 함수
 * @returns {() => void} 구독 해제 함수
 */
export function subscribeAuthState(listener) {
	authListeners.add(listener);
	return () => authListeners.delete(listener);
}

/** 등록된 구독자에게 인증 상태 변경을 통지한다 (내부용 — 이벤트 브릿지·단위 테스트에서 호출)
 * @returns {void}
 */
export function notifyAuthChange() {
	authListeners.forEach(listener => listener());
}

// ── DOM 이벤트 브릿지 (browser 전용 — 비-DOM 환경에서는 건너뜀) ──
// 토큰 저장소 변경은 api-client.js가 window CustomEvent로 알리고, 타 탭 로그인/로그아웃은
// sessionStorage storage 이벤트로 감지한다. api-client 역방향 import 없이 단방향 수신 구조다.
if (typeof window !== "undefined") {
	window.addEventListener(AUTH_CHANGE_EVENT, () => notifyAuthChange());
	window.addEventListener("storage", event => {
		if (event.key === AUTH_KEY || event.key === REFRESH_KEY) notifyAuthChange();
	});
}
