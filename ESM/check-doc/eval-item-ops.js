// 파일 용도: 움직임 평가 항목 배열 순수 연산 — 편집 화면의 추가·삭제·후보 계산 로직
// 기법: DOM·Store 비의존 순수 함수. getEvals() 결과를 인자로 받아 새 배열을 반환한다.
//       편집 화면(check-doc-edit.js)의 availableEvalItems·removeEvalItem·피커 선택이
//       stale recordStore 대신 live getEvals()를 쓰도록 분리된 연산이다.
import { ASSESSMENT_ITEMS_FULL } from "./assessment-data.js";

/**
 * 사용되지 않은 평가 항목 후보를 반환한다
 * @param {Array<{name:string}>} all 전체 항목 (기본 ASSESSMENT_ITEMS_FULL)
 * @param {Array<{name:string}>} used 현재 사용 중인 항목
 * @returns {Array<{name:string,desc:string,checks:string[],vo2?:boolean}>} 후보 항목
 */
export function availableCandidates(all = ASSESSMENT_ITEMS_FULL, used = []) {
	const usedNames = new Set(used.map(item => item.name));
	return all.filter(item => !usedNames.has(item.name));
}

/**
 * 항목 배열에 후보 1개를 추가한 새 배열을 반환한다
 * @param {Array<{name:string}>} items 현재 항목
 * @param {{name:string}} picked 추가할 항목
 * @returns {Array} 새 항목 배열
 */
export function nextAfterAdd(items, picked) {
	return [...items, picked];
}

/**
 * 항목 배열에서 인덱스 i를 삭제한 새 배열을 반환한다
 * @param {Array<{name:string}>} items 현재 항목
 * @param {number} index 삭제할 인덱스
 * @returns {Array} 새 항목 배열
 */
export function nextAfterRemove(items, index) {
	return items.toSpliced(index, 1);
}
