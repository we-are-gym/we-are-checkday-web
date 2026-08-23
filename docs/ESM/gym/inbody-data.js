// 파일 용도: 인바디 데이터 모형 — 폼 입력 문자열 묶음(7셀)을 객체로 다루는 클래스 (체크기록 공용)
// 기법: 순수 데이터 클래스 — 직렬화(toObject)와 빈 판정(isEmpty)만 제공하고 DOM·저장소에 의존하지 않는다.
// 사용: record-store.js(시드 생성), session-report.js(결과 표기), store.js의 CheckRecordPayload.ib 타입

/**
 * 인바디 입력값 묶음 (폼 입력 문자열 그대로 보관)
 */
export class InbodyData {
	/**
	 * @param {{ w?: string, m?: string, fat?: string, bmi?: string, bfp?: string, bmr?: string, vis?: string }} [data]
	 *        w: 체중(kg) · m: 골격근량(kg) · fat: 체지방량(kg) · bmi: BMI · bfp: 체지방률(%) · bmr: 기초대사량(kcal) · vis: 내장지방 레벨
	 */
	constructor({ w = "", m = "", fat = "", bmi = "", bfp = "", bmr = "", vis = "" } = {}) {
		this.w = w;
		this.m = m;
		this.fat = fat;
		this.bmi = bmi;
		this.bfp = bfp;
		this.bmr = bmr;
		this.vis = vis;
	}

	/** 필드 전체를 일반 객체로 직렬화한다 (저장 형식 호환)
	 * @returns {{ w: string, m: string, fat: string, bmi: string, bfp: string, bmr: string, vis: string }}
	 */
	toObject() {
		return {
			w: this.w,
			m: this.m,
			fat: this.fat,
			bmi: this.bmi,
			bfp: this.bfp,
			bmr: this.bmr,
			vis: this.vis,
		};
	}

	/** 모든 셀이 비어 있는지 판정한다
	 * @returns {boolean} 전 셀 빈 문자열이면 true
	 */
	isEmpty() {
		return [this.w, this.m, this.fat, this.bmi, this.bfp, this.bmr, this.vis].every((v) => v === "");
	}
}
