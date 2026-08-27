// 파일 용도: 공용 타입 중앙화 — store.js 타입 정의 (to-be)
// 이전 infra/store.js에 흩어진 Member/InbodyData/CheckRecord 등 JSDoc을 한 곳으로 모음

/**
 * 회원 1명
 * @typedef {Object} Member
 * @property {string} id 회원 고유 ID (Mason API `member_ID`)
 * @property {string} name 이름
 * @property {"" | "남" | "녀"} gender 성별
 * @property {string} goal 운동 목표
 * @property {string} trainer 담당 트레이너
 */

/**
 * 인바디 입력값 묶음 (폼 입력 문자열 그대로 보관)
 * @typedef {Object} InbodyData
 * @property {string} w 체중 (kg)
 * @property {string} m 골격근량 (kg)
 * @property {string} fat 체지방량 (kg)
 * @property {string} bmi BMI
 * @property {string} bfp 체지방률 (%)
 * @property {string} bmr 기초대사량 (kcal)
 * @property {string} vis 내장지방 레벨
 */

/**
 * 체크기록 1건의 폼 내용 전체
 * @typedef {Object} CheckRecordPayload
 * @property {string} session 회차 표기 (예: "3회차")
 * @property {string} trainer 담당 트레이너
 * @property {InbodyData} ib 인바디 문자열 묶음
 * @property {string} ibComment 인바디 코멘트
 * @property {number[]} scores 점수 배열 (0~3)
 * @property {string[]} items 항목 이름 배열
 * @property {Array<{ checked: string[], memo: string }>} evalData 평가 체크·메모
 * @property {string[]} goals 목표 태그
 * @property {string} goalMemo 목표 메모
 * @property {Array<{ name: string, checkItems: Array<{text: string, checked: boolean}>, memo: string }>} feedbacks 피드백
 * @property {string} consultMemo 종합 상담 메모
 */

/**
 * 저장된 체크기록 1건
 * @typedef {Object} CheckRecord
 * @property {number} id 체크기록 ID (checkdoc_ID)
 * @property {string} memberId 소속 회원 ID
 * @property {string} date 상담일 (YYYY-MM-DD)
 * @property {CheckRecordPayload} payload 폼 내용 전체
 */

export const __types = true;
