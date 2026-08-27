// 파일 용도: 웹 UI 커스텀 예외 계층 — Error 직접 throw 금지, AppError 기반 도메인 오류로 정규화 (to-be)
// 기법: class + toUserMessage() — API·스토어·화면이 동일한 오류 계층을 공유한다.
export class AppError extends Error {
	/**
	 * @param {string} message 사용자 메시지
	 * @param {{ code?: string, status?: number, cause?: unknown }} [opts]
	 */
	constructor(message, opts = {}) {
		super(message);
		this.name = "AppError";
		this.code = opts.code || "app_error";
		this.status = opts.status || 0;
		if (opts.cause) this.cause = opts.cause;
	}
}
export class ValidationError extends AppError {
	constructor(message, opts = {}) {
		super(message, { code: "validation_error", status: 422, ...opts });
		this.name = "ValidationError";
	}
}
export class AuthError extends AppError {
	constructor(message, opts = {}) {
		super(message, { code: "auth_error", status: 401, ...opts });
		this.name = "AuthError";
	}
}
export class NotFoundError extends AppError {
	constructor(message, opts = {}) {
		super(message, { code: "not_found", status: 404, ...opts });
		this.name = "NotFoundError";
	}
}
export class NetworkError extends AppError {
	constructor(message, opts = {}) {
		super(message, { code: "network_error", status: 0, ...opts });
		this.name = "NetworkError";
	}
}
/**
 * 오류를 사용자 피드백 메시지로 변환한다
 * @param {unknown} err
 * @returns {string}
 */
export function toUserMessage(err) {
	if (err instanceof AppError) return err.message;
	if (err instanceof Error) return err.message || "알 수 없는 오류가 발생했습니다";
	return String(err);
}
