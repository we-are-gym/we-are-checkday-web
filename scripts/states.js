// 파일 용도: 상태 관리 — 평가 점수 배열·초기화 공용 모듈 (checkday 공용)
const STATE = {
	/** 평가 점수 배열 (item 인덱스 → 0~3점) */
	scores: [],
	/** 배율·관리할 최댓값 (예: 움직임 총점 24) */
	max: 0,

	/**
	 * 평가 항목 수만큼 점수 배열을 0으로 초기화
	 * @param {number} count 항목 수
	 * @param {number} max 총점 최댓값
	 */
	init(count, max) {
		this.scores = ARR.zeros(count);
		this.max = max;
	},
	/**
	 * i번째 항목 점수 반환 (범위 밖이면 0)
	 * @param {number} i
	 * @returns {number}
	 */
	get(i) {
		return this.scores[i] || 0;
	},
	/**
	 * i번째 항목 점수 설정 (0~3 클램프)
	 * @param {number} i
	 * @param {number} v
	 * @returns {number} 설정된 점수
	 */
	set(i, v) {
		this.scores[i] = VAL.bound(v, 0, 3);
		return this.scores[i];
	},
	/** 전체 점수 합계 반환 */
	total() {
		return ARR.sum(this.scores);
	},
	/** 모든 점수 0으로 초기화 */
	reset() {
		this.scores.fill(0);
	},
};