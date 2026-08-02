// 파일 용도: 배열 유틸리티 — 점수 합계·총점 계산 공용 헬퍼 (checkday·basic_function 공용)
const ARR = {
	/**
	 * 배열 숫자 합계 반환
	 * @param {Array<number>} arr
	 * @returns {number}
	 */
	sum(arr) {
		return arr.reduce((a, b) => a + b, 0);
	},
	/**
	 * 크기 n짜리 0으로 채운 배열 생성
	 * @param {number} n
	 * @returns {Array<number>}
	 */
	zeros(n) {
		return new Array(n).fill(0);
	},
};