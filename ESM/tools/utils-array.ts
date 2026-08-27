// 파일 용도: 배열 유틸리티 — 점수 합계·총점 계산 공용 헬퍼 (checkday·basic_function 공용) — TS 마이그레이션
// to-be: 브라우저 스크립팅을 타입스크립트로 마이그레이션

/**
 * 배열 숫자 합계 반환
 * @param arr 합산할 숫자 배열
 * @returns 합계 (빈 배열이면 0)
 */
export function sum(arr: number[]): number {
	return arr.reduce((a, b) => a + b, 0);
}

/**
 * 크기 n짜리 0으로 채운 배열 생성
 * @param n 배열 크기
 * @returns 길이 n, 전부 0인 배열
 */
export function createZeroArray(n: number): number[] {
	return new Array(n).fill(0);
}
