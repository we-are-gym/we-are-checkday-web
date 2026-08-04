// 파일 용도: 배열 유틸리티 — 점수 합계·총점 계산 공용 헬퍼 (checkday·basic_function 공용)
// 기법: 네임스페이스 오브젝트 대신 named function export (to-be 지시) — 호출부에서 import { sum } 등으로 쓴다.

/**
 * 배열 숫자 합계 반환
 * @param {Array<number>} arr 합산할 숫자 배열
 * @returns {number} 합계 (빈 배열이면 0)
 */
export function sum(arr) {
	return arr.reduce((a, b) => a + b, 0);
}

/**
 * 크기 n짜리 0으로 채운 배열 생성
 * @param {number} n 배열 크기
 * @returns {Array<number>} 길이 n, 전부 0인 배열
 */
export function createZeroArray(n) {
	return new Array(n).fill(0);
}
