// 파일 용도: 입력 검증 — 수치 파싱·NaN 판별·범위 클램프 공용 헬퍼 (checkday · basic_function 공용)
// 기법: 네임스페이스 오브젝트 대신 named function export (to-be 지시)
// 주의: isNaN 메서드는 내부적으로 Number.isNaN과 동일하나 외부 호출이 없어 미내보내기로 정리한다.

/**
 * 문자열→숫자(실수) 변환, 변환 실패 시 NaN 반환
 * @param {string} v 변환할 문자열
 * @returns {number} 실수 값 (변환 불가 시 NaN)
 */
export function parseToNum(v) {
	return parseFloat(v);
}

/**
 * 여러 값 중 하나 이상이 NaN인지
 * @param {Array<number>} vals 검사할 숫자들
 * @returns {boolean} 하나라도 NaN이면 true
 */
export function anyNaN(...vals) {
	return vals.some((v) => Number.isNaN(v));
}

/**
 * 값을 [min, max] 범위로 클램프
 * @param {number} v 대상 값
 * @param {number} min 하한
 * @param {number} max 상한
 * @returns {number} min~max 사이로 제한된 값
 */
export function clamp(v, min, max) {
	return Math.max(min, Math.min(max, v));
}
