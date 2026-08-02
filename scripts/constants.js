// 파일 용도: 공용 상수 — 평가 점수·등급 임계점·총점 최댓값 등 마법 숫자 단일 정의 (checkday·basic_function 공용)
// 주의: 정수 임계값(83/58/33, 0~3 점, 24 등)은 스크린마다 흩어 쓰지 말고 이곳에서만 정의

/** 평가 항목 1개 점수 최솟값 */
export const SCORE_MIN = 0;
/** 평가 항목 1개 점수 최댓값 */
export const SCORE_MAX = 3;
/** 점수 표시 도형(도트) 개수 = SCORE_MAX + 1 */
export const DOT_COUNT = 4;

// ── 등급 퍼센트 임계점 (총점 대비 백분율) ──
export const GRADE_EXCELLENT_PCT = 83;
export const GRADE_GOOD_PCT = 58;
export const GRADE_AVERAGE_PCT = 33;

/** 움직임 평가(8항목) 총점 최댓값 */
export const MOTION_TOTAL_MAX = 24;