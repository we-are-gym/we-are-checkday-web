// 파일 용도: Mason API 호출 공용 클라이언트 — fetch 래퍼·Mason 봉투 언래핑·오류 정규화

/** API 기본 경로 — 상대 경로로 정적 호스팅과 동일 오리진 배포를 가정합니다. */
const API_BASE = "https://checkday-rest-954930013300.asia-northeast3.run.app/api/v1";

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
 * Mason API에 HTTP 요청을 별내고 응답 봉투를 언래핑합니다.
 * @param {string} path API 경로(API_BASE 제외, 예: "/members")
 * @param {Object} [options]
 * @param {string} [options.method="GET"] HTTP 메서드
 * @param {object|null} [options.body] JSON 본문
 * @param {string|null} [options.token] Bearer 액세스 토큰
 * @returns {Promise<object|Array>} 리소스(단건) 또는 리소스 배열(목록)
 */
export async function request(path, { method = "GET", body = null, token = null } = {}) {
	const url = `${API_BASE}${path}`;
	/** @type {Record<string, string>} */
	const headers = { Accept: "application/json" };
	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}
	if (body !== null) {
		headers["Content-Type"] = "application/json";
	}

	const response = await fetch(url, {
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

	if (!response.ok || data["@error"]) {
		const err = data["@error"] || {};
		throw new ApiError(err["@message"] || "요청을 처리할 수 없습니다", err["@code"] || "request_failed", response.status);
	}

	const resource = unwrapResource(data);
	return resource.items !== undefined ? resource.items : resource;
}
