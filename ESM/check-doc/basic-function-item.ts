// 파일 용도: 베이직 펑션 평가 항목 모형 — 평가 항목 1개의 데이터 클래스 (기본 함수 평가·체크기록 공용)
// 기법: 순수 데이터 클래스 — 평가 항목(이름·설명·체크 문구·VO₂ 여부)을 한 형태로 다룬다.
// 사용: assessment-data.ts가 ASSESSMENT_ITEMS 등을 이 클래스 인스턴스로 구성한다.

/** 움직임(베이직 펑션) 평가 항목 1개의 생성자 인자 */
export interface BasicFunctionItemData {
	/** 항목 이름 */
	name: string;
	/** 평가 설명 (한 줄) */
	desc: string;
	/** 체크 문구 목록 */
	checks: string[];
	/** VO₂ 자동계산 블록 포함 여부 */
	vo2?: boolean;
}

/**
 * 움직임(베이직 펑션) 평가 항목 1개
 */
export class BasicFunctionItem {
	/** 항목 이름 */
	readonly name: string;
	/** 평가 설명 (한 줄) */
	readonly desc: string;
	/** 체크 문구 목록 */
	readonly checks: string[];
	/** VO₂ 자동계산 블록 포함 여부 */
	readonly vo2: boolean;

	constructor({ name, desc, checks, vo2 = false }: BasicFunctionItemData) {
		this.name = name;
		this.desc = desc;
		this.checks = checks;
		this.vo2 = vo2;
	}
}
