// 파일 용도: 문자열 유틸 — 날짜·숫자 표기 포맷 공용 헬퍼 (checkday 공용)
// 기법: 네임스페이스 오브젝트 대신 named function export (to-be 지시)

/**
 * 숫자를 두 자릿수로 패딩 (예: 3 → "03")
 * @param {number} n 패딩할 숫자
 * @returns {string} 최소 두 자리 문자열
 */
export function pad2(n) {
	return String(n).padStart(2, "0");
}

/**
 * 오늘 날짜를 "YYYY.MM.DD" 꼴로 반환
 * @param {Date} [d] 기준일(생략 시 현재)
 * @returns {string} "YYYY.MM.DD" 꼴 날짜 문자열
 */
export function today(d = new Date()) {
	return (
		d.getFullYear() +
		"." +
		pad2(d.getMonth() + 1) +
		"." +
		pad2(d.getDate())
	);
}

/**
 * 기준일을 "YYYY-MM-DD" 꼴로 반환 — `<input type="date">`의 value 기본값으로 쓰는 형식
 * @param {Date} [d] 기준일(생략 시 현재)
 * @returns {string} "YYYY-MM-DD" 꼴 날짜 문자열
 */
export function todayISO(d = new Date()) {
	return (
		d.getFullYear() +
		"-" +
		pad2(d.getMonth() + 1) +
		"-" +
		pad2(d.getDate())
	);
}
