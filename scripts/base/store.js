// 파일 용도: GUI 상태 스토어 — 관찰자 패턴 기반 단일 상태 관리 + sessionStorage 영속화 (전체 화면 공용)
// 기법: 관찰자 패턴 + 상태 컨테이너 클래스 (손수 구현, 의존성 없음)
// 사용: 화면 진입점이 `new Store(시드, { storageKey })`로 스토어를 만들고, UI는 subscribe로 구독해 상태가 바뀌면 재렌더링한다.

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
 * @property {number[]} scores 항목별 점수 (5~8개, 0~3)
 * @property {string[]} items 항목 이름 배열 (있으면 기록별 항목명, 없으면 scores 길이로 폴백)
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
 * 총점 → 등급 라벨·스타일 메타
 * @typedef {Object} GradeMeta
 * @property {"평가 전" | "우수" | "양호" | "보통" | "개선 필요"} label 등급 라벨
 * @property {string} bg 배경색 (CSS 변수 또는 색상)
 * @property {string} fg 글자색
 * @property {string} hint 등급 힌트 문구
 */

/**
 * 변화 분석 비교 테이블의 행 1개
 * @typedef {Object} CompareRow
 * @property {string} label 항목명
 * @property {string} cur 비교(최신) 값 표기
 * @property {string} tgt 기준(이전) 값 표기
 * @property {string} delta 변화 델타 HTML
 */

/**
 * 회원 상세 통계 카드 1종 정의
 * @typedef {Object} ChartStatCard
 * @property {string} label 지표명
 * @property {string} unit 단위 표기
 * @property {Array<number>} values 회차별 수치 (시간순)
 * @property {(v: number) => string} fmt 최신값 표기 변환 함수
 */

/**
 * 옵저버 패턴 기반 상태 스토어 — 선택적으로 sessionStorage에 영속화
 *
 * - `getState()`: 현재 상태 반환
 * - `setState(updater)`: `updater(이전 상태)`가 돌려준 새 상태로 교체 후 구독자 알림
 * - `update(partial)`: 일부 필드만 얕은 병합
 * - `subscribe(listener)`: 상태 변경 시 `listener(새 상태)` 호출, 반환값은 구독 해제 함수
 *
 * `storageKey`를 주면 초기 상태를 해당 키의 저장값으로 되돌리되, 없거나 손상됐거나
 * `validate`를 통과하지 못하면 `seed`로 시작하고, 상태가 바뀔 때마다 키에 직렬화해 저장한다. (mock 영속화)
 *
 * @template T
 */
export class Store {
	/**
	 * @param {T} seed 초기(시드) 상태 — 저장값이 없거나 손상됐을 때 사용
	 * @param {Object} [options]
	 * @param {string} [options.storageKey] sessionStorage 키 — 주어지면 영속화
	 * @param {(data: T) => boolean} [options.validate] 저장값 형식 검증 (기본: 항상 통과)
	 */
	constructor(seed, { storageKey, validate = () => true } = {}) {
		/** @type {T} */
		this._state = storageKey ? loadStored(storageKey, seed, validate) : seed;
		/** @type {Set<(state: T) => void>} */
		this._listeners = new Set();

		if (storageKey) {
			// 상태가 바뀔 때마다 세션 저장 (관찰자 패턴 — mock 영속화)
			this.subscribe((state) => {
				try {
					sessionStorage.setItem(storageKey, JSON.stringify(state));
				} catch (err) {
					// 저장 실패는 mock이므로 무시
				}
			});
		}
	}

	/** 현재 상태 반환
	 * @returns {T} 현재 상태
	 */
	getState() {
		return this._state;
	}

	/** updater(이전 상태)가 돌려준 새 상태로 교체하고 구독자에게 알린다
	 * @param {(prev: T) => T} updater 상태 갱신 함수
	 * @returns {void}
	 */
	setState(updater) {
		const next = updater(this._state);
		if (next === this._state) return;
		this._state = next;
		this._listeners.forEach((listener) => listener(this._state));
	}

	/** 주어진 필드를 얕은 병합해 상태를 갱신한다
	 * @param {Partial<T>} partial 병합할 필드
	 * @returns {void}
	 */
	update(partial) {
		this.setState((prev) => ({ ...prev, ...partial }));
	}

	/** 상태 변경 시 호출할 리스너를 등록하고, 구독 해제 함수를 반환한다
	 * @param {(state: T) => void} listener 상태 변경 리스너
	 * @returns {() => void} 구독 해제 함수
	 */
	subscribe(listener) {
		this._listeners.add(listener);
		return () => this._listeners.delete(listener);
	}
}

/**
 * 저장된 상태를 읽고 없거나 손상됐으면 시드로 폴백한다
 * @template T
 * @param {string} storageKey sessionStorage 키
 * @param {T} seed 손상·부재 시 초기 상태
 * @param {(data: T) => boolean} validate 저장값 형식 검증
 * @returns {T} 복원된 상태 또는 시드
 */
function loadStored(storageKey, seed, validate) {
	try {
		const raw = sessionStorage.getItem(storageKey);
		if (raw) {
			const data = JSON.parse(raw);
			if (validate(data)) return data;
		}
	} catch (err) {
		// 손상된 데이터는 시드로 폴백
	}
	return seed;
}
