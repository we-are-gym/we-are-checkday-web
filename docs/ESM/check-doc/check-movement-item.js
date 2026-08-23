// 파일 용도: 동작 피드백 카드 모형 — 피드백 카드 1장(id·동작명·체크 문구)의 데이터 클래스 (checkday 공용)
// 기법: 순수 데이터 클래스 — CheckMovementStore가 보관하는 카드 단위다.

/**
 * 동작 피드백 카드 1장
 */
export class CheckMovementItem {
	/**
	 * @param {number} id 카드 고유 번호
	 * @param {string} name 동작명 (예: "스쿼트")
	 * @param {string[]} checks 체크 문구 목록
	 */
	constructor(id, name, checks) {
		/** 카드 고유 번호 */
		this.id = id;
		/** 동작명 */
		this.name = name;
		/** 체크 문구 목록 */
		this.checks = checks;
	}
}
