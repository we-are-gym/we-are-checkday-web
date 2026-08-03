// 파일 용도: GUI 상태 스토어 — 관찰자 패턴 기반 단일 상태 관리 (전체 화면 공용)
// 기법: 관찰자 패턴 + GUI 상태 스토어 (손수 구현, 의존성 없음)
// 사용: 화면 진입점이 createStore로 스토어를 만들고, UI는 subscribe로 구독해 상태가 바뀌면 재렌더링한다.

/**
 * 회원 1명
 * @typedef {Object} Member
 * @property {number} id 회원 고유 번호
 * @property {string} name 이름
 * @property {"" | "남" | "여"} gender 성별
 * @property {string} goal 운동 목표
 * @property {string} trainer 담당 트레이너
 */

/**
 * 인바디 입력값 묶음 (폼 입력 문자열 그대로 보관)
 * @typedef {Object} InbodyData
 * @property {string} w 체중 (kg)
 * @property {string} m 골격근량 (kg)
 * @property {string} fat 체지방량 (kg)
 * @property {string} bmi BMI
 * @property {string} bfp 체지방률 (%)
 * @property {string} bmr 기초대사량 (kcal)
 * @property {string} vis 내장지방 레벨
 */

/**
 * 체크기록 1건의 폼 내용 전체
 * @typedef {Object} CheckRecordPayload
 * @property {string} name 회원 이름
 * @property {string} session 회차 표기 (예: "2025-06 (2회차)")
 * @property {string} trainer 담당 트레이너
 * @property {InbodyData} ib 인바디 수치
 * @property {string} ibComment 인바디 코멘트
 * @property {number[]} scores 항목별 점수 (8개, 0~3)
 * @property {Array<{ checked: string[], memo: string }>} evalData 항목별 체크 문구·메모
 * @property {string[]} goals 선택한 목표 태그
 * @property {string} goalMemo 목표 메모
 * @property {Array<{ name: string, checkItems: Array<{ text: string, checked: boolean }>, memo: string }>} feedbacks 동작 피드백
 * @property {string} consultMemo 종합 상담 메모
 */

/**
 * 저장된 체크기록 1건
 * @typedef {Object} CheckRecord
 * @property {number} id 기록 고유 번호
 * @property {number} memberId 회원 고유 번호
 * @property {string} date 작성일 (YYYY-MM-DD)
 * @property {CheckRecordPayload} payload 폼 내용 전체
 */

/**
 * 관찰자 패턴 기반 GUI 상태 스토어 생성
 *
 * - `getState()`: 현재 상태 조회
 * - `setState(updater)`: `updater(이전 상태)`가 돌려준 새 상태로 교체 후 구독자 알림
 * - `update(partial)`: 일부 필드만 얕은 병합
 * - `subscribe(listener)`: 상태 변경 시 `listener(새 상태)` 호출, 반환값은 구독 해제 함수
 *
 * @template T
 * @param {T} initialState
 * @returns {{
 *   getState: () => T,
 *   setState: (updater: (prev: T) => T) => void,
 *   update: (partial: Partial<T>) => void,
 *   subscribe: (listener: (state: T) => void) => () => void,
 * }}
 */
export function createStore(initialState) {
	let state = initialState;
	/** @type {Set<(state: T) => void>} */
	const listeners = new Set();

	function notify() {
		listeners.forEach((listener) => listener(state));
	}

	return {
		getState() {
			return state;
		},
		setState(updater) {
			const next = updater(state);
			if (next === state) return;
			state = next;
			notify();
		},
		update(partial) {
			this.setState((prev) => ({ ...prev, ...partial }));
		},
		subscribe(listener) {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
	};
}