// 공용 평가 항목 데이터 — to-be: 도메인 데이터는 data/basicFunctions.json이 단일 소스
// 파일 용도: 움직임 평가 항목 — JSON에서 로드하여 BasicFunctionItem 인스턴스로 변환
// 구조: 각 항목 = BasicFunctionItem 인스턴스 `{ name, desc, checks[], vo2? }`
import basicData from "../../data/basicFunctions.json" with { type: "json" };
import { BasicFunctionItem } from "./basic-function-item.js";

/** 평가 항목 인스턴스 생성 헬퍼 (필드 일관성 유지)
 * @param {{ name: string, desc: string, checks: string[], vo2?: boolean }} data 항목 데이터
 * @returns {BasicFunctionItem} 평가 항목
 */
const item = data => new BasicFunctionItem(data);

const _rawItems = basicData.items.map(item);

export const ASSESSMENT_ITEMS = _rawItems.slice(0, 7);

// 파일 용도: 움직임 평가 8개 항목 전체 — 공용 7개 + VO₂ 항목 (레거시 기본값·checkday_1)
// evaluation.js 기본값(checkday_1)과 8항목 기록의 조회·편집·비교에서 사용한다. 체크기록 작성은 ASSESSMENT_ITEMS_BASIC5를 쓴다.
export const ASSESSMENT_ITEMS_FULL = _rawItems;

// 파일 용도: 체크기록 작성(check-doc-new) 전용 베이직 펑션 5항목 — 번호는 1~5로 재부여
// 결정: to-be 지시에 따라 Lumbar ROM(바닥짚기)·Wall Angel Test·Over Head Squat·Single Balance Test·VO₂ Max(스텝 테스트)만
//       사용하고, 호흡 테스트·One Leg Squat·원레그 브릿지는 제외한다. 5항목 × 3점 = 15점 만점.
export const ASSESSMENT_ITEMS_BASIC5 = basicData.basic5Names.map(name => _rawItems.find(it => it.name === name));

/**
 * 기록의 점수 배열 길이에 맞는 평가 항목 목록을 반환한다 —
 * 5항목(BASIC5) 기록은 5장, 8항목(레거시) 기록은 8장으로 조회·편집·비교 화면이 양쪽 다 올바르게 표시한다.
 * @param {number} [scoresLength] 기록의 scores 배열 길이 (없으면 레거시 8항목)
 * @returns {Array<BasicFunctionItem>} 평가 항목 목록
 */
export function itemsForRecord(scoresLength) {
	return scoresLength === ASSESSMENT_ITEMS_BASIC5.length ? ASSESSMENT_ITEMS_BASIC5 : ASSESSMENT_ITEMS_FULL;
}

/**
 * 기록 1건의 평가 항목 목록을 결정한다 — payload.items(항목 이름 배열)가 있으면 이름으로 항목을 재구성하고,
 * 없으면(레거시 기록) scores 길이로 기본 항목(itemsForRecord)에 폴백한다.
 * 기록별 항목 수가 5·8이 아닌(예: 7항목) 훼이크 데이터의 오매칭을 막기 위해 반드시 items를 우선 사용한다.
 * 유의: 편집 화면의 초기 프리필(init)에서만 사용한다. 편집 중 추가·삭제는 live getEvals()를 단일 소스로 쓴다.
 * @param {import("@infra/store.js").CheckRecordPayload} payload 기록 payload
 * @returns {Array<BasicFunctionItem>} 평가 항목 목록
 */
export function resolveRecordItems(payload) {
	const items = payload?.items;
	if (Array.isArray(items) && items.length) {
		return items.map(name => ASSESSMENT_ITEMS_FULL.find(it => it.name === name) || { name, desc: "", checks: [] });
	}
	return itemsForRecord(payload?.scores?.length ?? 0);
}
