// 파일 용도: 체크기록 스토어 — 세션(sessionStorage) 영속화된 mock 저장소 (회원 상세·조회·작성·편집 공용)
// 주의: API 미배포 상태이므로 브라우저 세션 동안만 유지되는 mock이다. 탭을 닫으면 시드로 복원된다.
import { createStore } from "./store.js";

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
 * @returns {import("./store.js").InbodyData}
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
 * @param {import("./store.js").InbodyData} ibData
 * @param {number[]} scores 점수 8개 (0~3)
 * @param {Partial<import("./store.js").CheckRecordPayload>} [opts]
 * @returns {import("./store.js").CheckRecord}
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

/** 시드 기록 6건 (회원별 0~3건 — 스파크라인·비교 데모용) */
const SEED_RECORDS = [
	mkRec(1, 1, "2026-04-12", "2026-04 (1회차)", ib("78.2", "32.4", "21.5", "25.3", "27.5", "1720", "10"),
		[2, 2, 1, 2, 2, 1, 2, 2], {
			name: "김민준",
			trainer: "김지훈",
			ibComment: "체지방량이 기준치보다 높아 유산소 비중 확대 필요",
			goals: ["체지방률 25% 이하"],
			goalMemo: "주 3회 유산소 30분 추가",
			feedbacks: [{ name: "스쿼트", checkItems: [{ text: "무릎이 안으로 들어감", checked: true }], memo: "발바닥 전체로 지면을 누르도록 지도" }],
			consultMemo: "식단 일지 첫 주차 — 야식 빈도 줄이는 것부터",
		}),
	mkRec(2, 1, "2026-07-11", "2026-07 (2회차)", ib("75.8", "33.1", "17.9", "24.5", "23.6", "1698", "8"),
		[2, 2, 2, 2, 3, 2, 2, 2], {
			name: "김민준",
			trainer: "김지훈",
			ibComment: "체지방량 감소, 골격근량 증가 — 목표 방향 유지",
			goals: ["체지방률 25% 이하", "골격근량 34kg"],
			goalMemo: "유산소 유지 + 상체 저중량 고반복 추가",
			feedbacks: [{ name: "원레그 브릿지", checkItems: [{ text: "골반 과도한 틀어짐", checked: true }], memo: "골반 중립 유지에 집중" }],
			consultMemo: "야식 2회 이하 달성 — 다음 목표는 수면 7시간",
		}),
	mkRec(3, 2, "2026-06-20", "2026-06 (1회차)", ib("56.4", "24.1", "19.8", "21.2", "35.1", "1310", "5"),
		[2, 3, 2, 2, 3, 2, 2, 2], {
			name: "이서연",
			trainer: "박소연",
			ibComment: "골격근량 대비 체지방률이 높은 편 — 근력 운동 우선",
			goals: ["체지방률 32% 이하"],
			goalMemo: "하체 중심 2분할 루틴",
			consultMemo: "런지 시 무릎 통증 호소 — 무릎 정렬 체크 반복",
		}),
	mkRec(4, 4, "2026-02-15", "2026-02 (1회차)", ib("63.5", "24.9", "24.2", "23.8", "38.1", "1380", "6"),
		[1, 2, 1, 2, 2, 1, 2, 1], {
			name: "최수아",
			trainer: "김지훈",
			ibComment: "첫 측정 — 기준값 확보",
			goals: ["체형 교정", "체지방률 34% 이하"],
			goalMemo: "자세 교정 운동 병행",
			feedbacks: [{ name: "원레그 브릿지", checkItems: [{ text: "엉덩이가 잘 안 올라감", checked: true }], memo: "둔근 활성화 먼저" }],
		}),
	mkRec(5, 4, "2026-05-16", "2026-05 (2회차)", ib("62.1", "25.6", "21.6", "23.3", "34.8", "1402", "5"),
		[2, 2, 2, 2, 2, 2, 2, 2], {
			name: "최수아",
			trainer: "김지훈",
			ibComment: "체지방 감소·근량 유지 — 순조로운 진행",
			goals: ["체형 교정"],
			goalMemo: "스트레칭 10분 일상화",
			consultMemo: "데드리프트 자세 안정화됨",
		}),
	mkRec(6, 4, "2026-07-20", "2026-07 (3회차)", ib("60.9", "26.2", "19.4", "22.8", "31.9", "1425", "4"),
		[2, 3, 2, 2, 3, 2, 3, 2], {
			name: "최수아",
			trainer: "김지훈",
			ibComment: "체지방률 31.9% — 목표(34% 이하) 달성, 다음 목표 30%",
			goals: ["체형 교정", "체지방률 30% 이하"],
			goalMemo: "강도 상향 단계",
			feedbacks: [{ name: "스쿼트", checkItems: [{ text: "발목·무릎 정렬 불량", checked: false }], memo: "발목 가동성 개선됨" }],
			consultMemo: "본인 주도 운동 가능 수준 — 2주 후 자가 기록 시작",
		}),
];

/**
 * 저장된 상태를 읽고, 없거나 손상됐으면 시드로 초기화
 * @returns {{ records: import("./store.js").CheckRecord[], nextId: number }}
 */
function loadInitial() {
	try {
		const raw = sessionStorage.getItem(STORAGE_KEY);
		if (raw) {
			const data = JSON.parse(raw);
			if (Array.isArray(data.records)) return data;
		}
	} catch (err) {
		// 손상된 데이터는 시드로 폴백
	}
	return { records: SEED_RECORDS, nextId: SEED_RECORDS.length + 1 };
}

/** 체크기록 스토어 (전 화면 공용 단일 인스턴스) */
export const recordStore = createStore(loadInitial());

// 상태가 바뀔 때마다 세션 저장 (관찰자 패턴 — mock 영속화)
recordStore.subscribe((state) => {
	try {
		sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	} catch (err) {
		// 저장 실패는 mock이므로 무시
	}
});