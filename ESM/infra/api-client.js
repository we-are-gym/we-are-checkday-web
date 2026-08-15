// 파일 용도: Mason API 호출 공용 클라이언트 — fetch 래퍼·Mason 봉투 언래핑·오류 정규화
// 주의: 1단계(사전 리팩토링)에서는 뼈대·계약·JSDoc만 정의하고 실제 fetch는 2단계에서 구현합니다.

/** API 기본 경로 — 상대 경로로 정적 호스팅과 동일 오리진 배포를 가정합니다. */
const API_BASE = "/api/v1";

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
	const {
		"@namespaces": _ns,
		"@controls": _ctrl,
		"@embedded": _embedded,
		"@error": _error,
		...resource
	} = body;
	return resource;
}

/**
 * Mason API에 HTTP 요청을 별내고 응답 봉투를 언래핑합니다.
 * 1단계에서는 뼈대만 제공하며 2단계에서 fetch를 구현합니다.
 * @param {string} path API 경로(API_BASE 제외, 예: "/members")
 * @param {Object} [options]
 * @param {string} [options.method="GET"] HTTP 메서드
 * @param {object|null} [options.body] JSON 본문
 * @param {string|null} [options.token] Bearer 액세스 토큰
 * @returns {Promise<object|Array>} 리소스 또는 리소스 목록
 */
export async function request(path, { method = "GET", body = null, token = null } = {}) {
	// 2단계(연동)에서 fetch·Mason 봉투 처리·오류 변환을 구현합니다.
	throw new ApiError("request()는 아직 구현되지 않았습니다", "not_implemented", 501);
}
