// 파일 용도: 상태 관리 — 평가 점수 배열·총점·평가 구성(항목) 단일 소스 (checkday 공용)
// 기법: 점수·만점·항목 상태를 Store(store.js) 인스턴스로 감싼 팩토리 + 단일 인스턴스 (named export)
//       모든 상태를 Store 하나로 관리해 관찰자 패턴 계약(getState/setState/update/subscribe)을 통일한다.
//       모듈 전역 가변 변수(evals·currentMax) 없이 항목도 Store가 보유 → 평가 구성 변경이 하나의 상태로 원자화된다.
import { Store } from "../infra/store.js";
import { createZeroArray, sum } from "../tools/utils-array.js";
import { clamp } from "../infra/validation.js";
import { SCORE_MIN, SCORE_MAX } from "../infra/constants.js";

/**
 * 평가 점수 상태 생성 — 점수 배열(항목 인덱스 → 0~3점)·총점 최댓값·평가 항목을 Store 위에 얹어 한 곳에서 관리한다.
 * @returns {{
 *   init(items: Array<{name: string, desc: string, checks?: string[], vo2?: boolean}>, max: number): void,
 *   get(i: number): number,
 *   set(i: number, v: number): void,
 *   getTotal(): number,
 *   getMax(): number,
 *   getItems(): Array<{name: string, desc: string, checks?: string[], vo2?: boolean}>,
 *   reset(): void,
 * }} 점수 상태 API
 */
export function createScoreState() {
	/** 평가 점수·만점·항목 상태 (Store — { scores, max, items }) */
	const store = new Store({ scores: [], max: 0, items: [] });

	return {
		/**
		 * 평가 항목·만점으로 상태를 초기화한다.
		 * @param {Array<{name: string, desc: string, checks?: string[], vo2?: boolean}>} items 평가 항목 목록
		 * @param {number} maxValue 총점 최댓값
		 * @returns {void}
		 */
		init(items, maxValue) {
			store.setState(() => ({
				scores: createZeroArray(items.length),
				max: maxValue,
				items,
			}));
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
		/** 현재 평가 항목 목록 반환
		 * @returns {Array<{name: string, desc: string, checks?: string[], vo2?: boolean}>}
		 */
		getItems() {
			return store.getState().items;
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
