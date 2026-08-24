// 파일 용도: 로그인 페이지 리다이렉트 공용 헬퍼 — 401 처리(api-client)와 bfcache 복원 가드(auth) 양쪽에서 사용
// 참고: auth.js가 api-client.js를 임포트하므로 이 함수를 양쪽 중 한쪽에 두면 순환 임포트가 생긴다.
// 그래서 중립 모듈로 분리했으며, 토큰 삭제는 api-client.clearTokens와 동일 동작을 직접 수행한다.

import { AUTH_KEY, REFRESH_KEY } from "./constants.js";

/**
 * 토큰을 지우고 로그인 페이지로 리다이렉트한다.
 * 원래 화면 경로를 ?redirect= 쿼리로 보존하므로 재로그인 후 해당 화면으로 돌아온다.
 * 이미 로그인 페이지면 리다이렉트하지 않는다 (무한 루프 방지).
 * @returns {void}
 */
export function redirectToLogin() {
	sessionStorage.removeItem(AUTH_KEY);
	sessionStorage.removeItem(REFRESH_KEY);
	if (!window.location.pathname.endsWith("login.html")) {
		const redirect = encodeURIComponent(window.location.href);
		window.location.replace(`login.html?redirect=${redirect}`);
	}
}
