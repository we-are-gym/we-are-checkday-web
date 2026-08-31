// 파일 용도: 공용 상수 — 평가 점수·등급 임계점·총점 최댓값 등 마법 숫자 단일 정의 (checkday·basic_function 공용)
// 주의: 정수 임계값(83/58/33, 0~3 점, 24 등)은 스크린마다 흩어 쓰지 말고 이곳에서만 정의
// to-be: 설정 값은 conf/rules.json이 단일 소스 — 이 모듈은 JSON을 재내보내는 얇은 래퍼
import rules from "../../conf/rules.json" with { type: "json" };

/** 평가 항목 1개 점수 최솟값 */
export const SCORE_MIN = rules.score.min;

/** 평가 항목 1개 점수 최댓값 */
export const SCORE_MAX = rules.score.max;

/** 점수 표시 도형(도트) 개수 = SCORE_MAX + 1 */
export const DOT_COUNT = rules.score.dotCount;

// ── 등급 퍼센트 임계점 (총점 대비 백분율) ──
/** 우수 등급 임계 백분율 (≥ 83%) */
export const GRADE_EXCELLENT_PCT = rules.grade.excellent;

/** 양호 등급 임계 백분율 (≥ 58%) */
export const GRADE_GOOD_PCT = rules.grade.good;

/** 보통 등급 임계 백분율 (≥ 33%) */
export const GRADE_AVERAGE_PCT = rules.grade.average;

/** 움직임 평가(8항목·레거시) 총점 최댓값 — 24. 체크기록 작성(5항목)은 15점으로 configureEvaluation()이 교체한다. */
export const MOTION_TOTAL_MAX = rules.motion.totalMax;

/** 체크기록 작성(5항목) 총점 최댓값 — 15 (5×3점). rules.json 단일 소스. */
export const MOTION_BASIC5_MAX = rules.motion.basic5Max;

/** 토큰 키 (localStorage 영속, 비-DOM 시 메모리 폴백) */
export const AUTH_KEY = "checkday.auth.v1";
export const REFRESH_KEY = "checkday.refresh.v1";

/** 인증 상태 변경 통지 이벤트 이름 (window CustomEvent) — 토큰 저장·삭제 시 api-client가 발화하고 auth.js가 수신한다 */
export const AUTH_CHANGE_EVENT = "checkday:authchange";

// EOF
