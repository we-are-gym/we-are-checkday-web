// 파일 용도: 체크기록 스토어 — 세션(sessionStorage) 영속화된 mock 저장소 (회원 상세·조회·작성·편집 공용)
// 주의: API 미배포 상태이므로 브라우저 세션 동안만 유지되는 mock이다. 탭을 닫으면 시드로 복원된다.
import { createPersistentStore } from "@base/store.js";

/** 세션 저장 키 */
const STORAGE_KEY = "checkday.records.v1";

/**
 * 인바디 값 묶음 생성 (문자열 표기 편의)
 * @param {string} w 체중
 * @param {string} m 골격근량
 * @param {string} fat 체지방량
 * @param {string} bmi BMI
 * @param {string} bfp 체지방률
 * @param {string} bmr 기초대사량
 * @param {string} vis 내장지방
 * @returns {import("@base/store.js").InbodyData}
 */
function ib(w, m, fat, bmi, bfp, bmr, vis) {
	return { w, m, fat, bmi, bfp, bmr, vis };
}

/**
 * 시드 기록 1건 생성
 * @param {number} id
 * @param {number} memberId
 * @param {string} date YYYY-MM-DD
 * @param {string} session
 * @param {import("@base/store.js").InbodyData} ibData
 * @param {number[]} scores 점수 8개 (0~3)
 * @param {Partial<import("@base/store.js").CheckRecordPayload>} [opts]
 * @returns {import("@base/store.js").CheckRecord}
 */
function mkRec(id, memberId, date, session, ibData, scores, opts = {}) {
	return {
		id,
		memberId,
		date,
		payload: {
			name: opts.name || "",
			session,
			trainer: opts.trainer || "",
			ib: ibData,
			ibComment: opts.ibComment || "",
			scores,
			evalData: opts.evalData || scores.map(() => ({ checked: [], memo: "" })),
			goals: opts.goals || [],
			goalMemo: opts.goalMemo || "",
			feedbacks: opts.feedbacks || [],
			consultMemo: opts.consultMemo || "",
		},
	};
}

/** 시드 기록 14건 (회원별 0~8건 — 스파크라인·비교 데모용, 김하늘 8건 포함) */
const SEED_RECORDS = [
	mkRec(1, 1, "2026-04-12", "1회차", ib("78.2", "32.4", "21.5", "25.3", "27.5", "1720", "10"),
		[2, 2, 1, 2, 2, 1, 2, 2], {
			name: "김민준",
			trainer: "김지훈",
			ibComment: "체지방량이 기준치보다 높아 유산소 비중 확대 필요",
			goals: ["체지방률 25% 이하"],
			goalMemo: "주 3회 유산소 30분 추가",
			feedbacks: [{ name: "스쿼트", checkItems: [{ text: "무릎이 안으로 들어감", checked: true }], memo: "발바닥 전체로 지면을 누르도록 지도" }],
			consultMemo: "식단 일지 첫 주차 — 야식 빈도 줄이는 것부터",
		}),
	mkRec(2, 1, "2026-07-11", "2회차", ib("75.8", "33.1", "17.9", "24.5", "23.6", "1698", "8"),
		[2, 2, 2, 2, 3, 2, 2, 2], {
			name: "김민준",
			trainer: "김지훈",
			ibComment: "체지방량 감소, 골격근량 증가 — 목표 방향 유지",
			goals: ["체지방률 25% 이하", "골격근량 34kg"],
			goalMemo: "유산소 유지 + 상체 저중량 고반복 추가",
			feedbacks: [{ name: "원레그 브릿지", checkItems: [{ text: "골반 과도한 틀어짐", checked: true }], memo: "골반 중립 유지에 집중" }],
			consultMemo: "야식 2회 이하 달성 — 다음 목표는 수면 7시간",
		}),
	mkRec(3, 2, "2026-06-20", "1회차", ib("56.4", "24.1", "19.8", "21.2", "35.1", "1310", "5"),
		[2, 3, 2, 2, 3, 2, 2, 2], {
			name: "이서연",
			trainer: "박소연",
			ibComment: "골격근량 대비 체지방률이 높은 편 — 근력 운동 우선",
			goals: ["체지방률 32% 이하"],
			goalMemo: "하체 중심 2분할 루틴",
			consultMemo: "런지 시 무릎 통증 호소 — 무릎 정렬 체크 반복",
		}),
	mkRec(4, 4, "2026-02-15", "1회차", ib("63.5", "24.9", "24.2", "23.8", "38.1", "1380", "6"),
		[1, 2, 1, 2, 2, 1, 2, 1], {
			name: "최수아",
			trainer: "김지훈",
			ibComment: "첫 측정 — 기준값 확보",
			goals: ["체형 교정", "체지방률 34% 이하"],
			goalMemo: "자세 교정 운동 병행",
			feedbacks: [{ name: "원레그 브릿지", checkItems: [{ text: "엉덩이가 잘 안 올라감", checked: true }], memo: "둔근 활성화 먼저" }],
		}),
	mkRec(5, 4, "2026-05-16", "2회차", ib("62.1", "25.6", "21.6", "23.3", "34.8", "1402", "5"),
		[2, 2, 2, 2, 2, 2, 2, 2], {
			name: "최수아",
			trainer: "김지훈",
			ibComment: "체지방 감소·근량 유지 — 순조로운 진행",
			goals: ["체형 교정"],
			goalMemo: "스트레칭 10분 일상화",
			consultMemo: "데드리프트 자세 안정화됨",
		}),
	mkRec(6, 4, "2026-07-20", "3회차", ib("60.9", "26.2", "19.4", "22.8", "31.9", "1425", "4"),
		[2, 3, 2, 2, 3, 2, 3, 2], {
			name: "최수아",
			trainer: "김지훈",
			ibComment: "체지방률 31.9% — 목표(34% 이하) 달성, 다음 목표 30%",
			goals: ["체형 교정", "체지방률 30% 이하"],
			goalMemo: "강도 상향 단계",
			feedbacks: [{ name: "스쿼트", checkItems: [{ text: "발목·무릎 정렬 불량", checked: false }], memo: "발목 가동성 개선됨" }],
			consultMemo: "본인 주도 운동 가능 수준 — 2주 후 자가 기록 시작",
		}),
	// 김하늘(6) — 체크기록 8건: 체지방률·체중·골격근량·체지방량이 회차마다 오르락 내리락 (스파크라인·변화 분석 데모)
	mkRec(7, 6, "2026-01-10", "1회차", ib("61.5", "26.1", "19.4", "23.4", "31.5", "1308", "6"),
		[2, 2, 2, 1, 2, 2, 2, 2], {
			name: "김하늘",
			trainer: "김지훈",
			ibComment: "첫 측정 — 기준값 확보",
			goals: ["체지방률 28% 이하"],
			goalMemo: "주 3회 유산소 20분부터",
			consultMemo: "출퇴근 계단 이용 습관 제안",
		}),
	mkRec(8, 6, "2026-02-12", "2회차", ib("62.4", "26.6", "19.2", "23.8", "30.8", "1322", "5"),
		[2, 3, 2, 2, 2, 2, 2, 2], {
			name: "김하늘",
			trainer: "김지훈",
			ibComment: "체중 소폭 증가, 체지방률은 하락 — 근량 증가 효과",
			goals: ["체지방률 28% 이하", "골격근량 27kg"],
			goalMemo: "하체 저중량 고반복 추가",
			feedbacks: [{ name: "스쿼트", checkItems: [{ text: "발뒤꿈치 들림", checked: true }], memo: "체중을 발 전체로 분산하도록 지도" }],
		}),
	mkRec(9, 6, "2026-03-08", "3회차", ib("61.2", "26.0", "19.6", "23.3", "32.1", "1301", "6"),
		[2, 2, 2, 2, 3, 2, 2, 2], {
			name: "김하늘",
			trainer: "김지훈",
			ibComment: "체지방률 다시 상승 — 식단 이탈 구간으로 추정",
			goals: ["체지방률 28% 이하"],
			goalMemo: "간식 기록 일지 시작",
			consultMemo: "주말 외식 빈도 조절 상담",
		}),
	mkRec(10, 6, "2026-04-15", "4회차", ib("63.0", "26.9", "19.0", "24.0", "30.2", "1335", "5"),
		[3, 2, 2, 2, 2, 2, 2, 3], {
			name: "김하늘",
			trainer: "김지훈",
			ibComment: "체중 증가에도 체지방률 최저치 — 근육량 증가 폭이 큼",
			goals: ["골격근량 27kg"],
			goalMemo: "강도 상향 단계",
			feedbacks: [{ name: "원레그 브릿지", checkItems: [{ text: "골반 틀어짐", checked: false }], memo: "코어 안정성 개선됨" }],
		}),
	mkRec(11, 6, "2026-05-09", "5회차", ib("61.8", "26.3", "19.7", "23.6", "31.9", "1314", "6"),
		[2, 3, 2, 2, 2, 3, 2, 2], {
			name: "김하늘",
			trainer: "김지훈",
			ibComment: "체지방률 상승·근량 감소 — 휴식 부족 의심",
			goals: ["체지방률 28% 이하"],
			goalMemo: "수면 7시간 목표",
			consultMemo: "취침 시간대 변경 제안",
		}),
	mkRec(12, 6, "2026-06-14", "6회차", ib("62.6", "26.7", "19.2", "23.9", "30.7", "1328", "5"),
		[3, 2, 3, 2, 2, 2, 2, 2], {
			name: "김하늘",
			trainer: "김지훈",
			ibComment: "체지방률·체지방량 동반 하락 — 회복 추세",
			goals: ["체지방률 28% 이하", "골격근량 27kg"],
			goalMemo: "유산소 30분 유지 + 코어 추가",
			feedbacks: [{ name: "데드리프트", checkItems: [{ text: "허리 과신전", checked: true }], memo: "중립 척추 유지 반복 연습" }],
		}),
	mkRec(13, 6, "2026-07-11", "7회차", ib("61.0", "26.2", "19.8", "23.2", "32.4", "1298", "7"),
		[2, 2, 2, 3, 2, 2, 3, 2], {
			name: "김하늘",
			trainer: "김지훈",
			ibComment: "체지방률 최고치 — 더운 날씨 식욕 저하로 간식 대체 가능성",
			goals: ["체지방률 28% 이하"],
			goalMemo: "단백질 섭취량 보충",
			consultMemo: "운동 후 식사 타이밍 상담",
		}),
	mkRec(14, 6, "2026-08-10", "8회차", ib("62.2", "26.6", "19.0", "23.7", "30.5", "1325", "5"),
		[3, 3, 2, 2, 3, 2, 3, 3], {
			name: "김하늘",
			trainer: "김지훈",
			ibComment: "체지방률 30.5% — 1회차 대비 1.0pp 하락, 근량은 +0.5kg",
			goals: ["체지방률 28% 이하", "골격근량 27kg"],
			goalMemo: "다음 회차부터 스미스머신 스쿼트 도입",
			feedbacks: [{ name: "스쿼트", checkItems: [{ text: "무릎 정렬 불량", checked: false }], memo: "전반적으로 안정화됨" }],
			consultMemo: "2개월 단위 목표 재설정 논의",
		}),
];

/** 체크기록 스토어 (전 화면 공용 단일 인스턴스) — 저장값이 손상되면 시드로 폴백 */
export const recordStore = createPersistentStore(
	STORAGE_KEY,
	{ records: SEED_RECORDS, nextId: SEED_RECORDS.length + 1 },
	/** 저장값에 records 배열이 있어야 유효 */
	(data) => Array.isArray(data.records),
);