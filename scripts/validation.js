// 파일 용도: 입력 검증 — 수치 파싱·범위 클램프 공용 헬퍼 (checkday · basic_function 공용)
const VAL = {
	/**
	 * 문자열→숫자(실수) 변환, 변환 실패 시 NaN 반환
	 * @param {string} v
	 * @returns {number}
	 */
	num(v) {
		return parseFloat(v);
	},
	/**
	 * 값이 NaN 여부
	 * @param {number} v
	 * @returns {boolean}
	 */
	isNaN(v) {
		return Number.isNaN(v);
	},
	/**
	 * 여러 값 중 하나 이상이 NaN인지
	 * @param {Array<number>} vals
	 * @returns {boolean}
	 */
	anyNaN(...vals) {
		return vals.some((v) => Number.isNaN(v));
	},
	/**
	 * 값을 [min, max] 범위로 클램프
	 * @param {number} v
	 * @param {number} min
	 * @param {number} max
	 * @returns {number}
	 */
	bound(v, min, max) {
		return Math.max(min, Math.min(max, v));
	},
};