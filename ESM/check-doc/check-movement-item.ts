// 파일 용도: 동작 피드백 카드 모형 — 피드백 카드 1장(id·동작명·체크 문구)의 데이터 클래스 (checkday 공용)
// 기법: 순수 데이터 클래스 — CheckMovementStore가 보관하는 카드 단위다.

/**
 * 동작 피드백 카드 1장
 */
export class CheckMovementItem {
	/** 카드 고유 번호 */
	readonly id: number;
	/** 동작명 */
	readonly name: string;
	/** 체크 문구 목록 */
	readonly checks: string[];

	constructor(id: number, name: string, checks: string[]) {
		this.id = id;
		this.name = name;
		this.checks = checks;
	}
}
