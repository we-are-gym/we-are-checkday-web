// 파일 용도: Mason API 호출 공용 클라이언트 — fetch 래퍼·Mason 봉투 언래핑·오류 정규화·토큰 자동 관리

import { REFRESH_KEY, AUTH_KEY } from "./constants.js";

/** API 기본 경로 — 상대 경로로 정적 호스팅과 동일 오리진 배포를 가정합니다. */
const API_BASE = "https://checkday-rest-evztw4wu4q-du.a.run.app/api/v1";

// /** sessionStorage 토큰 키 — auth.js와 동일한 값을 사용합니다 (순환 임포트 방지). */
// const AUTH_KEY = "checkday.auth.v1";
// const REFRESH_KEY = "checkday.refresh.v1";

/**
 * Mason API 오류.
 * @property {string} message 사람이 읽는 오류 메시지
 * @property {string} code Mason @error 코드
 * @property {number} status HTTP 상태 코드
 */
export class ApiError extends Error {
	/**
	 * @param {string} message 오류 메시지
	 * @param {string} code 오류 코드
	 * @param {number} status HTTP 상태 코드
	 */
	constructor(message, code, status) {
		super(message);
		this.name = "ApiError";
		this.code = code;
		this.status = status;
	}
}

/**
 * Mason 봉투에서 리소스 본문을 추출합니다.
 * @param {object} body API 응답 본문
 * @returns {object} @namespaces·@controls·@embedded·@error를 제거한 리소스
 */
function unwrapResource(body) {
	const { "@namespaces": _ns, "@controls": _ctrl, "@embedded": _embedded, "@error": _error, "@meta": _meta, ...resource } = body;
	return resource;
}

/**
 * 액세스·리프레시 토큰을 sessionStorage에 저장합니다.
 * @param {string} accessToken 액세스 토큰
 * @param {string} refreshToken 리프레시 토큰
 * @returns {void}
 */
export function storeTokens(accessToken, refreshToken) {
	sessionStorage.setItem(AUTH_KEY, accessToken);
	sessionStorage.setItem(REFRESH_KEY, refreshToken);
}

/**
 * sessionStorage에서 액세스·리프레시 토큰을 삭제합니다.
 * @returns {void}
 */
export function clearTokens() {
	sessionStorage.removeItem(AUTH_KEY);
	sessionStorage.removeItem(REFRESH_KEY);
}

// ── 401 자동 갱신 내부 유틸 ──

/**
 * JWT 토큰이 만료되었는지 확인합니다.
 * @param {string} token JWT 문자열
 * @returns {boolean} 만료 여부
 */
function isTokenExpired(token) {
	try {
		const payload = JSON.parse(atob(token.split(".")[1]));
		return payload.exp * 1000 < Date.now();
	} catch {
		return true;
	}
}

/** 동시 갱신 요청 방지 — 단일 프로미스 기반 뮤텍스 */
let refreshLock = null;

/**
 * 리프레시 토큰으로 새 액세스·리프레시 토큰을 발급받아 저장합니다.
 * 동시 호출 시 단일 갱신만 수행하고 나머지는 대기합니다.
 * @returns {Promise<boolean>} 갱신 성공 여부
 */
async function tryRefreshToken() {
	if (refreshLock) return refreshLock;
	refreshLock = doRefresh();
	try {
		return await refreshLock;
	} finally {
		refreshLock = null;
	}
}

/**
 * 리프레시 토큰 갱신 실제 실행.
 * @returns {Promise<boolean>} 성공 여부
 */
async function doRefresh() {
	const refreshToken = sessionStorage.getItem(REFRESH_KEY);
	if (!refreshToken) return false;

	try {
		const response = await fetch(`${API_BASE}/auth/refresh`, {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ refresh_token: refreshToken }),
		});

		if (!response.ok) return false;

		const data = await response.json();
		const resource = unwrapResource(data);
		if (resource.access_token && resource.refresh_token) {
			storeTokens(resource.access_token, resource.refresh_token);
			return true;
		}
		return false;
	} catch {
		return false;
	}
}

/**
 * 로그인 페이지로 리다이렉트합니다. 이미 로그인 페이지면 무시합니다 (무한 루프 방지).
 */
function goToLogin() {
	clearTokens();
	if (!window.location.pathname.endsWith("login.html")) {
		const redirect = encodeURIComponent(window.location.href);
		window.location.href = `login.html?redirect=${redirect}`;
	}
}

/**
 * Mason API에 HTTP 요청을 별내고 응답 봉투를 언래핑합니다.
 * token 옵션이 없으면 sessionStorage에서 자동으로 액세스 토큰을 읽어 Bearer 헤더에 첨부합니다.
 * 401 응답 시 리프레시 토큰으로 자동 갱신을 시도하고, 갱신 성공 시 원 요청을 재시도합니다.
 * 갱신 실패 시 토큰을 삭제하고 로그인 페이지로 리다이렉트합니다.
 * @param {string} path API 경로(API_BASE 제외, 예: "/members")
 * @param {Object} [options]
 * @param {string} [options.method="GET"] HTTP 메서드
 * @param {object|null} [options.body] JSON 본문
 * @param {string|null} [options.token] Bearer 액세스 토큰 (미지정 시 sessionStorage에서 자동 읽기)
 * @returns {Promise<object|Array>} 리소스(단건) 또는 리소스 배열(목록)
 */
export async function request(path, { method = "GET", body = null, token = null } = {}) {
	const url = `${API_BASE}${path}`;
	/** @type {Record<string, string>} */
	const headers = { Accept: "application/json" };
	// token 옵션이 없으면 sessionStorage에서 자동 읽기
	const accessToken = token ?? sessionStorage.getItem(AUTH_KEY);
	if (accessToken) {
		headers.Authorization = `Bearer ${accessToken}`;
	}
	if (body !== null) {
		headers["Content-Type"] = "application/json";
	}

	let response = await fetch(url, {
		method,
		headers,
		body: body !== null ? JSON.stringify(body) : undefined,
	});

	let data = {};
	try {
		data = await response.json();
	} catch {
		data = {};
	}

	// ── 401 자동 처리 ──
	if (response.status === 401 && accessToken && !isTokenExpired(accessToken)) {
		// 토큰이 아직 만료되지 않았는데 401 — 서버에서 거부됨. 갱신 불가.
	} else if (response.status === 401 && accessToken) {
		const refreshed = await tryRefreshToken();
		if (refreshed) {
			// 갱신 성공 — 원 요청 재시도 (새 토큰으로)
			const newToken = sessionStorage.getItem(AUTH_KEY);
			headers.Authorization = `Bearer ${newToken}`;
			response = await fetch(url, {
				method,
				headers,
				body: body !== null ? JSON.stringify(body) : undefined,
			});
			data = {};
			try {
				data = await response.json();
			} catch {
				data = {};
			}
		} else {
			// 갱신 실패 — 로그인 페이지로 이동
			goToLogin();
			throw new ApiError("인증이 만료되었습니다", "token_expired", 401);
		}
	}

	if (!response.ok || data["@error"]) {
		const err = data["@error"] || {};
		throw new ApiError(err["@message"] || "요청을 처리할 수 없습니다", err["@code"] || "request_failed", response.status);
	}

	const resource = unwrapResource(data);
	return resource.items !== undefined ? resource.items : resource;
}
