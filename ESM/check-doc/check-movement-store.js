// 파일 용도: 동작 피드백 저장소 — 피드백 카드 목록과 ID 카운터를 관리하는 클래스 (checkday 공용)
// 기법: 프리셋 배열로 초기화하고 add/clear로 카드를 추가·비운다. feedback.js의 전역 `feedbacks`·`fbIdCounter` 대체.
// 사용: feedback.js가 화면의 피드백 카드 상태를 이 저장소에 보관한다.

import { CheckMovementItem } from "./check-movement-item.js";

/**
 * 동작 피드백 카드 저장소
 */
export class CheckMovementStore {
	/**
	 * @param {Array<{ name: string, checks: string[] }>} [presets] 프리셋 목록 (동작명 → 체크 문구)
	 */
	constructor(presets = []) {
		/** 카드 목록 (첨가 순서 유지) */
		this.items = presets.map(
			(p, i) => new CheckMovementItem(i + 1, p.name, [...p.checks]),
		);
		/** 다음 카드 고유 번호 */
		this.nextId = this.items.length + 1;
	}

	/** 현재 카드 목록 반환
	 * @returns {CheckMovementItem[]} 카드 목록
	 */
	getItems() {
		return this.items;
	}

	/** 프리셋(또는 빈) 카드를 추가하고 생성된 카드를 반환한다
	 * @param {{ name: string, checks: string[] }} [preset] 동작 프리셋 (없으면 빈 카드)
	 * @returns {CheckMovementItem} 추가된 카드
	 */
	add(preset) {
		const item = new CheckMovementItem(
			this.nextId++,
			preset ? preset.name : "",
			preset ? [...preset.checks] : [""],
		);
		this.items.push(item);
		return item;
	}

	/** 모든 카드를 비우고 ID 카운터를 초기화한다
	 * @returns {void}
	 */
	clear() {
		this.items = [];
		this.nextId = 1;
	}
}
