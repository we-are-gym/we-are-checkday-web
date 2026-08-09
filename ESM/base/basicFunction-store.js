// 파일 용도: 상태 관리 — 평가 점수 배열·총점·초기화 단일 소스 (checkday 공용)
// 기법: 점수 상태를 Store(store.js) 인스턴스로 감싼 팩토리 + 단일 인스턴스 (named export, to-be 지시)
//       모든 상태를 Store 하나로 관리해 관찰자 패턴 계약(getState/setState/update/subscribe)을 통일한다.
import { Store } from "./store.js";
import { createZeroArray, sum } from "./utils-array.js";
import { clamp } from "./validation.js";
import { SCORE_MIN, SCORE_MAX } from "./constants.js";

/**
 * 평가 점수 상태 생성 — 점수 배열(항목 인덱스 → 0~3점)·총점 최댓값을 Store 위에 얹어 한 곳에서 관리한다.
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
	/** 평가 점수·만점 상태 (Store — { scores, max }) */
	const store = new Store({ scores: [], max: 0 });

	return {
		/**
		 * 평가 항목 수만큼 상태 초기화
		 * @param {number} count 항목 수
		 * @param {number} maxValue 총점 최댓값
		 * @returns {void}
		 */
		init(count, maxValue) {
			store.setState(() => ({ scores: createZeroArray(count), max: maxValue }));
		},
		/**
		 * i번째 점수 반환 (범위 밖이면 0)
		 * @param {number} i 항목 인덱스
		 * @returns {number}
		 */
		get(i) {
			return store.getState().scores[i] || 0;
		},
		/**
		 * i번째 점수 설정 (0~3 클램프)
		 * @param {number} i 항목 인덱스
		 * @param {number} v 설정할 점수
		 * @returns {void}
		 */
		set(i, v) {
			store.setState((prev) => {
				const scores = [...prev.scores];
				scores[i] = clamp(v, SCORE_MIN, SCORE_MAX);
				return { ...prev, scores };
			});
		},
		/** 전체 점수 합계
		 * @returns {number}
		 */
		getTotal() {
			return sum(store.getState().scores);
		},
		/** 총점 최댓값 반환
		 * @returns {number}
		 */
		getMax() {
			return store.getState().max;
		},
		/** 모든 점수를 0으로
		 * @returns {void}
		 */
		reset() {
			store.setState((prev) => ({ ...prev, scores: createZeroArray(prev.scores.length) }));
		},
	};
}

/** 평가 점수 상태 단일 인스턴스 (checkday·basic_function 공용) */
export const scoreState = createScoreState();