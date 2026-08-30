// 파일 용도: Mason API 호출 공용 클라이언트 — fetch 래퍼·Mason 봉투 언래핑·오류 정규화·토큰 자동 관리
import { showToast } from "@shared/components/toast/toast.js";
import { AUTH_CHANGE_EVENT, AUTH_KEY, REFRESH_KEY } from "./constants.js";
import { AppError } from "./errors.js";
import { redirectToLogin } from "./login-redirect.js";

/** API 기본 경로 */
const API_BASE = import.meta.env?.VITE_API_BASE || "http://localhost:8900/api/v1";

// console.log({ API_BASE });

/**
 * Mason API 오류 — AppError 기반 (Error 직접 throw 금지 — to-be)
 * @property {string} message 사람이 읽는 오류 메시지
 * @property {string} code Mason @error 코드
 * @property {number} status HTTP 상태 코드
 */
export class ApiError extends AppError {
	/**
	 * @param {string} message 오류 메시지
	 * @param {string} code 오류 코드
	 * @param {number} status HTTP 상태 코드
	 */
	constructor(message, code, status) {
		super(message, { code, status });
		this.name = "ApiError";
	}
}

/**
 * Mason 봉투에서 리소스 본문을 추출합니다.
 * @embedded 리소스는 최상위 레벨로 병합하여 restToPayload 등에서 바로 접근할 수 있게 합니다.
 * @param {object} body API 응답 본문
 * @returns {object} @namespaces·@controls·@embedded·@error를 제거하고 @embedded는 최상위로 병합한 리소스
 */
function unwrapResource(body) {
	const { "@namespaces": _ns, "@controls": _ctrl, "@embedded": embedded, "@error": _error, "@meta": _meta, ...resource } = body;
	if (embedded) Object.assign(resource, embedded);
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
	notifyAuthStateChanged();
}

/**
 * sessionStorage에서 액세스·리프레시 토큰을 삭제합니다.
 * @returns {void}
 */
export function clearTokens() {
	sessionStorage.removeItem(AUTH_KEY);
	sessionStorage.removeItem(REFRESH_KEY);
	notifyAuthStateChanged();
}

/**
 * 인증 상태 변경을 window CustomEvent로 알린다 — auth.js의 subscribeAuthState가 수신한다.
 * (auth.js → api-client.js 의존이 이미 있으므로 역방향 import 없이 이벤트로 단방향 통지)
 * @returns {void}
 */
function notifyAuthStateChanged() {
	if (typeof window === "undefined") return;
	window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT));
}

// ── 401 자동 갱신 내부 유틸 ──

/**
 * JWT 토큰이 만료되었는지 확인합니다.
 * 파싱 실패(손상·비-JWT)는 만료로 간주한다. auth.js의 isAuthed()와 공용한다.
 * @param {string} token JWT 문자열
 * @returns {boolean} 만료 여부
 */
export function isTokenExpired(token) {
	try {
		const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
		const payload = JSON.parse(atob(base64));
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
 * 응답에서 Mason @error 봉투 또는 Pydantic detail 배열을 읽어 ApiError를 생성합니다.
 * @param {Response} response fetch 응답
 * @param {object} [body] 이미 파싱된 응답 본문 (없으면 파싱 시도)
 * @returns {Promise<ApiError>}
 */
async function buildApiError(response, body = null) {
	let data = body;
	if (data === null) {
		try {
			data = await response.json();
		} catch {
			data = {};
		}
	}
	const err = data["@error"];
	let message;
	if (err) {
		message = err["@message"];
	} else if (Array.isArray(data.detail) && data.detail.length > 0) {
		message = data.detail.map(d => d.msg).join("; ");
	}
	return new ApiError(message || "요청을 처리할 수 없습니다", err?.["@code"] || "request_failed", response.status);
}

/**
 * Mason API에 HTTP 요청을 보내고 인증·401 자동 갱신·오류 정규화를 처리합니다.
 * token 옵션이 없으면 sessionStorage에서 자동으로 액세스 토큰을 읽어 Bearer 헤더에 첨부합니다.
 * 401 응답 시 리프레시 토큰으로 자동 갱신을 시도하고, 갱신 성공 시 원 요청을 재시도합니다.
 * 갱신 실패 시 토큰을 삭제하고 로그인 페이지로 리다이렉트합니다.
 * @param {string} path API 경로(API_BASE 제외, 예: "/members")
 * @param {Object} [options]
 * @param {string} [options.method="GET"] HTTP 메서드
 * @param {object|null} [options.body] JSON 본문
 * @param {string|null} [options.token] Bearer 액세스 토큰 (미지정 시 sessionStorage에서 자동 읽기)
 * @param {"json"|"blob"} [options.as="json"] 응답 파싱 방식 — "blob"이면 파일 바이너리(PDF 등)를 Blob으로 반환
 * @returns {Promise<object|Array|Blob>} 리소스(단건)·리소스 배열(목록)·Blob(파일)
 */
async function fetchWithAuth(path, { method = "GET", body = null, token = null, as = "json" } = {}) {
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

	const doFetch = () =>
		fetch(url, {
			method,
			headers,
			body: body !== null ? JSON.stringify(body) : undefined,
		});

	let response = await doFetch();

	// ── 401 자동 처리: 토큰 상태에 따라 3개 분기 ──
	if (response.status === 401) {
		if (!accessToken) {
			// 케이스 1: 토큰 없음 — 로그인 페이지로 이동
			redirectToLogin();
			throw new ApiError("인증이 필요합니다", "unauthorized", 401);
		} else if (isTokenExpired(accessToken)) {
			// 케이스 2: 토큰 만료 — 리프레시 토큰으로 갱신 시도
			const refreshed = await tryRefreshToken();
			if (refreshed) {
				// 갱신 성공 — 원 요청 재시도 (새 토큰으로)
				headers.Authorization = `Bearer ${sessionStorage.getItem(AUTH_KEY)}`;
				response = await doFetch();
				// 갱신 후 재시도 응답이 401이면 로그인 페이지로 이동
				if (response.status === 401) {
					redirectToLogin();
					throw new ApiError("갱신 후 인증이 거부되었습니다", "refresh_retry_rejected", 401);
				}
			} else {
				// 갱신 실패 — 로그인 페이지로 이동
				redirectToLogin();
				throw new ApiError("인증이 만료되었습니다", "token_expired", 401);
			}
		} else {
			// 케이스 3: 토큰 유효하지만 서버 거부 — 로그인 페이지로 이동
			redirectToLogin();
			throw new ApiError("인증이 거부되었습니다", "token_rejected", 401);
		}
	}

	if (as === "blob") {
		if (!response.ok) throw await buildApiError(response);
		return response.blob();
	}

	let data = {};
	try {
		data = await response.json();
	} catch {
		data = {};
	}

	if (!response.ok || data["@error"]) {
		// Mason @error 봉투 우선, Pydantic detail 배열 폴백
		throw await buildApiError(response, data);
	}

	const resource = unwrapResource(data);
	return resource.items !== undefined ? resource.items : resource;
}

/**
 * Mason API에 JSON 응답 요청을 보냅니다. (fetchWithAuth의 json 모드)
 * @param {string} path API 경로(API_BASE 제외, 예: "/members")
 * @param {Object} [options] fetchWithAuth 옵션 (as 제외)
 * @returns {Promise<object|Array>} 리소스(단건) 또는 리소스 배열(목록)
 */
export async function request(path, options = {}) {
	try {
		return await fetchWithAuth(path, options);
	} catch (err) {
		if (err?.status !== 401) {
			showToast(err.message || "요청을 처리할 수 없습니다", { type: "error" });
		}
		throw err;
	}
	return fetchWithAuth(path, options);
}

/**
 * Mason API에 파일 바이너리(PDF 등) 응답 요청을 보냅니다. (fetchWithAuth의 blob 모드)
 * 인증·401 자동 갱신 처리는 request와 동일하게 동작합니다.
 * @param {string} path API 경로(API_BASE 제외, 예: "/members/M-1/pdf")
 * @param {Object} [options] fetchWithAuth 옵션 (as 제외)
 * @returns {Promise<Blob>} 응답 Blob
 */
export async function requestBlob(path, options = {}) {
	try {
		return await fetchWithAuth(path, { ...options, as: "blob" });
	} catch (err) {
		if (err?.status !== 401) {
			showToast(err.message || "요청을 처리할 수 없습니다", { type: "error" });
		}
		throw err;
	}
	return fetchWithAuth(path, { ...options, as: "blob" });
}
