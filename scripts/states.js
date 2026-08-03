// 파일 용도: 상태 관리 — 평가 점수 배열·총점·초기화 단일 소스 (checkday 공용)
// DEPENDS: ARR, VAL
import { ARR } from "./utils-array.js";
import { VAL } from "./validation.js";
import { SCORE_MIN, SCORE_MAX } from "./constants.js";

export const STATE = {
	/** 평가 점수 배열 (항목 인덱스 → 0~3점) */
	scores: [],
	/** 전체 총점 최댓값 (예: 움직임 총점 24) */
	max: 0,

	/**
	 * 평가 항목 수만큼 상태 초기화
	 * @param {number} count 항목 수
	 * @param {number} max 총점 최댓값
	 */
	init(count, max) {
		this.scores = ARR.createZeroArray(count);
		this.max = max;
	},
	/**
	 * i번째 점수 반환 (범위 밖이면 0)
	 * @param {number} i
	 */
	get(i) {
		return this.scores[i] || 0;
	},
	/**
	 * i번째 점수 설정 (0~3 클램프)
	 * @param {number} i
	 * @param {number} v
	 */
	set(i, v) {
		this.scores[i] = VAL.clamp(v, SCORE_MIN, SCORE_MAX);
	},
	/** 전체 점수 합계 */
	getTotal() {
		return ARR.sum(this.scores);
	},
	/** 모든 점수를 0으로 */
	reset() {
		this.scores.fill(0);
	},
};