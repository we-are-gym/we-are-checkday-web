// 파일 용도: URL 쿼리 파라미터 공용 헬퍼 — 화면마다 반복되던 new URLSearchParams(window.location.search) 패턴을 단일 소스로 통합
// 기법: 순수 함수 (문자열/숫자 반환, DOM 전역 비의존 — 단위 테스트 용이)
// 사용: member-detail·member-edit·check-doc-new·check-doc-view·check-doc-edit 진입점에서 import 하여 쓴다.

/**
 * 현재 페이지 쿼리스트링에서 이름에 해당하는 값을 반환 (없으면 기본값)
 * @param {string} name 파라미터 이름 (예: "memberID", "docID")
 * @param {string} [fallback=""] 없거나 빈 값일 때 반환할 기본값
 * @returns {string} 파라미터 값
 */
export function getUrlParam(name, fallback = "") {
	const v = new URLSearchParams(window.location.search).get(name);
	return v == null ? fallback : v;
}

/**
 * 쿼리스트링에서 숫자 값을 반환 (파싱 불가·부재 시 기본값)
 * @param {string} name 파라미터 이름
 * @param {number} [fallback=0] 없거나 숫자가 아닐 때 반환할 기본값
 * @returns {number} 정수 값
 */
export function getNumberParam(name, fallback = 0) {
	const n = Number(getUrlParam(name));
	return Number.isNaN(n) ? fallback : n;
}