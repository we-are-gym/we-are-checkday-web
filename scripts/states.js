// 파일 용도: 상태 관리 — 평가 점수 배열·총점·초기화 단일 소스 (checkday 공용)
// 기법: 팩토리 함수 + 단일 인스턴스 (네임스페이스 오브젝트 STATE 대신 named export, to-be 지시)
import { createZeroArray, sum } from "./utils-array.js";
import { clamp } from "./validation.js";
import { SCORE_MIN, SCORE_MAX } from "./constants.js";

/**
 * 평가 점수 상태 생성 — 점수 배열(항목 인덱스 → 0~3점)·총점 최댓값을 한 곳에서 관리한다.
 * @returns {{
 *   init(count: number, max: number): void,
 *   get(i: number): number,
 *   set(i: number, v: number): void,
 *   getTotal(): number,
 *   getMax(): number,
 *   reset(): void,
 * }} 점수 상태 API
 */
export function createScoreState() {
	/** 평가 점수 배열 (항목 인덱스 → 0~3점) */
	let scores = [];
	/** 전체 총점 최댓값 (예: 움직임 총점 24) */
	let max = 0;

	return {
		/**
		 * 평가 항목 수만큼 상태 초기화
		 * @param {number} count 항목 수
		 * @param {number} maxValue 총점 최댓값
		 * @returns {void}
		 */
		init(count, maxValue) {
			scores = createZeroArray(count);
			max = maxValue;
		},
		/**
		 * i번째 점수 반환 (범위 밖이면 0)
		 * @param {number} i 항목 인덱스
		 * @returns {number}
		 */
		get(i) {
			return scores[i] || 0;
		},
		/**
		 * i번째 점수 설정 (0~3 클램프)
		 * @param {number} i 항목 인덱스
		 * @param {number} v 설정할 점수
		 * @returns {void}
		 */
		set(i, v) {
			scores[i] = clamp(v, SCORE_MIN, SCORE_MAX);
		},
		/** 전체 점수 합계
		 * @returns {number}
		 */
		getTotal() {
			return sum(scores);
		},
		/** 총점 최댓값 반환
		 * @returns {number}
		 */
		getMax() {
			return max;
		},
		/** 모든 점수를 0으로
		 * @returns {void}
		 */
		reset() {
			scores.fill(0);
		},
	};
}

/** 평가 점수 상태 단일 인스턴스 (checkday·basic_function 공용) */
export const scoreState = createScoreState();
