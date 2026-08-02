// 파일 용도: 문자열 유틸 — 날짜·숫자 표기 포맷 공용 헬퍼 (checkday 공용)
const STR = {
	/**
	 * 숫자를 두 자릿수로 패딩 (예: 3 → "03")
	 * @param {number} n
	 * @returns {string}
	 */
	pad2(n) {
		return String(n).padStart(2, "0");
	},
	/**
	 * 오늘 날짜를 "YYYY.MM.DD" 꼴로 반환
	 * @param {Date} [d] 기준일(생략 시 현재)
	 * @returns {string}
	 */
	today(d = new Date()) {
		return (
			d.getFullYear() +
			"." +
			this.pad2(d.getMonth() + 1) +
			"." +
			this.pad2(d.getDate())
		);
	},
};