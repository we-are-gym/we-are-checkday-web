// 파일 용도: 디바운스 유틸리티 — 연속 호출을 억제하고 마지막 호출만 실행
/**
 * 함수를 디바운스하여 연속 호출 시 마지막 호출만 실행합니다.
 * @template {Function} T 디바운스할 함수 타입
 * @param {T} fn 디바운스할 함수
 * @param {number} [ms=250] 디바운스 대기 시간 (밀리초)
 * @returns {T & { cancel: () => void, flush: () => void }} 디바운스된 함수 (cancel/flush 포함)
 */
export function debounce(fn, ms = 250) {
	let timerId = null;

	const debounced = function (...args) {
		clearTimeout(timerId);
		timerId = setTimeout(() => {
			timerId = null;
			fn.apply(this, args);
		}, ms);
	};

	/** 대기 중인 호출을 취소합니다. */
	debounced.cancel = () => {
		clearTimeout(timerId);
		timerId = null;
	};

	/** 대기 중인 호출을 즉시 실행합니다. */
	debounced.flush = function () {
		clearTimeout(timerId);
		timerId = null;
		fn.apply(this);
	};

	return /** @type {T & { cancel: () => void, flush: () => void }} */ (debounced);
}
