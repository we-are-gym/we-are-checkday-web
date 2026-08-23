// 파일 용도: 베이직 펑션 평가 항목 모형 — 평가 항목 1개의 데이터 클래스 (기본 함수 평가·체크기록 공용)
// 기법: 순수 데이터 클래스 — 평가 항목(이름·설명·체크 문구·VO₂ 여부)을 한 형태로 다룬다.
// 사용: assessment-data.js가 ASSESSMENT_ITEMS 등을 이 클래스 인스턴스로 구성한다.

/**
 * 움직임(베이직 펑션) 평가 항목 1개
 */
export class BasicFunctionItem {
	/**
	 * @param {{ name: string, desc: string, checks: string[], vo2?: boolean }} data
	 *        name: 항목 이름 · desc: 평가 설명 · checks: 체크 문구 목록 · vo2: VO₂ 자동계산 항목 여부
	 */
	constructor({ name, desc, checks, vo2 = false }) {
		/** 항목 이름 */
		this.name = name;
		/** 평가 설명 (한 줄) */
		this.desc = desc;
		/** 체크 문구 목록 */
		this.checks = checks;
		/** VO₂ 자동계산 블록 포함 여부 */
		this.vo2 = vo2;
	}
}
