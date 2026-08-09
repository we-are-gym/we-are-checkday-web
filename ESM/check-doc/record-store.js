// 파일 용도: 체크기록 스토어 — 세션(sessionStorage) 영속화된 mock 저장소 (회원 상세·조회·작성·편집 공용)
// 주의: API 미배포 상태이므로 브라우저 세션 동안만 유지되는 mock이다. 탭을 닫으면 시드로 복원된다.
import { InbodyData } from "@gym/inbody-data.js";
import { Store } from "@infra/store.js";
import {
	ASSESSMENT_ITEMS_BASIC5,
	ASSESSMENT_ITEMS_FULL,
} from "./assessment-data.js";

/** 세션 저장 키 (v3 — 26년 5월 기록만 8항목·그 외 5항목 시드로 재작성) */
const STORAGE_KEY = "checkday.records.v3";

/**
 * 인바디 값 묶음 생성 (문자열 표기 편의)
 * @param {string} w 체중
 * @param {string} m 골격근량
 * @param {string} fat 체지방량
 * @param {string} bmi BMI
 * @param {string} bfp 체지방률
 * @param {string} bmr 기초대사량
 * @param {string} vis 내장지방
 * @returns {InbodyData} 인바디 데이터 인스턴스
 */
function ib(w, m, fat, bmi, bfp, bmr, vis) {
	return new InbodyData({ w, m, fat, bmi, bfp, bmr, vis });
}

/**
 * 시드 기록 1건 생성
 * @param {number} id
 * @param {number} memberId
 * @param {string} date YYYY-MM-DD
 * @param {string} session
 * @param {import("@infra/store.js").InbodyData} ibData
 * @param {number[]} scores 점수 배열 (항목별 0~3)
 * @param {Partial<import("@infra/store.js").CheckRecordPayload>} [opts]
 * @returns {import("@infra/store.js").CheckRecord}
 */
function mkRec(id, memberId, date, session, ibData, scores, opts = {}) {
	return {
		id,
		memberId,
		date,
		payload: {
			session,
			trainer: opts.trainer || "",
			ib: ibData.toObject(),
			ibComment: opts.ibComment || "",
			scores,
			// 항목 이름 배열 — scores 길이 기준으로 해석 (기록별 항목 수가 다른 시드·편집 화면 추가/삭제 반영)
			items:
				opts.items ||
				ASSESSMENT_ITEMS_FULL.slice(0, scores.length).map(
					(it) => it.name,
				),
			evalData:
				opts.evalData || scores.map(() => ({ checked: [], memo: "" })),
			goals: opts.goals || [],
			goalMemo: opts.goalMemo || "",
			feedbacks: opts.feedbacks || [],
			consultMemo: opts.consultMemo || "",
		},
	};
}

/**
 * 시드 기록 1건 생성 — 베이직 펑션 5항목(BASIC5)·15점 만점
 * mkRec 기본 items가 ASSESSMENT_ITEMS_FULL.slice(0, scores.length)라 5점수 기록에 호흡 테스트 등이
 * 잘못 포함되므로(5항목 = Lumbar·Wall·OHS·SB·VO₂) BASIC5 항목 이름을 명시 주입한다.
 * @param {number} id
 * @param {number} memberId
 * @param {string} date YYYY-MM-DD
 * @param {string} session
 * @param {import("@infra/store.js").InbodyData} ibData
 * @param {number[]} scores 5개 항목 점수 (각 0~3)
 * @param {Partial<import("@infra/store.js").CheckRecordPayload>} [opts]
 * @returns {import("@infra/store.js").CheckRecord}
 */
function mk5(id, memberId, date, session, ibData, scores, opts = {}) {
	return mkRec(id, memberId, date, session, ibData, scores, {
		...opts,
		items: ASSESSMENT_ITEMS_BASIC5.map((it) => it.name),
	});
}

/** 시드 기록 26건 — 회원별 0~8건 (스파크라인·비교·기록별 항목 수 데모)
 *  규칙: 26년 5월 기록(최수아 05-16·김하늘 05-09·김도윤 05-17)만 8항목/24점, 그 외 전부 5항목/15점.
 *        인바디 5개 지표(체지방률·체중·골격근량·체지방량·내장지방)는 전 회원 비단조(오르락내리락). */
const SEED_RECORDS = [
	// 김민준(1) — 5건: 감량 스토리 + 3회차 소폭 역전(체지방률 29.4% 재상승) — 스파크라인 비단조 데모
	mk5(
		1,
		1,
		"2026-01-10",
		"1회차",
		ib("80.1", "31.8", "23.9", "25.9", "29.8", "1740", "11"),
		[2, 1, 1, 2, 1],
		{
			trainer: "김지훈",
			ibComment: "체지방량이 기준치보다 높아 유산소 비중 확대 필요",
			goals: ["🔥 체지방 감소", "⚖️ 체중 유지"],
			goalMemo: "주 3회 유산소 30분 추가",
			feedbacks: [
				{
					name: "스쿼트",
					checkItems: [
						{ text: "무릎이 안으로 들어감", checked: true },
					],
					memo: "발바닥 전체로 지면을 누르도록 지도",
				},
			],
			consultMemo: "식단 일지 첫 주차 — 야식 빈도 줄이는 것부터",
		},
	),
	mk5(
		2,
		1,
		"2026-02-14",
		"2회차",
		ib("79.0", "32.0", "22.1", "25.5", "28.0", "1728", "10"),
		[2, 2, 1, 2, 2],
		{
			trainer: "김지훈",
			ibComment: "체지방량 감소, 골격근량 소폭 증가 — 방향 양호",
			goals: ["🔥 체지방 감소", "⚖️ 체중 유지"],
			goalMemo: "유산소 유지 + 상체 저중량 고반복 추가",
			consultMemo: "간식 대신 견과류로 대체 제안",
		},
	),
	mk5(
		3,
		1,
		"2026-03-21",
		"3회차",
		ib("79.6", "31.6", "23.4", "25.7", "29.4", "1719", "11"),
		[2, 2, 2, 2, 2],
		{
			trainer: "김지훈",
			ibComment: "체지방률 2월 대비 재상승 — 명절 외식 구간으로 추정",
			goals: ["🔥 체지방 감소", "⚖️ 체중 유지"],
			goalMemo: "근력 강도 상향 단계 진입",
			feedbacks: [
				{
					name: "원레그 브릿지",
					checkItems: [{ text: "골반 과도한 틀어짐", checked: true }],
					memo: "골반 중립 유지에 집중",
				},
			],
			consultMemo: "주말 외식 빈도 조절 상담",
		},
	),
	mk5(
		4,
		1,
		"2026-04-12",
		"4회차",
		ib("76.4", "32.8", "18.9", "24.7", "24.7", "1701", "9"),
		[2, 2, 2, 2, 3],
		{
			trainer: "김지훈",
			ibComment: "체지방률 24.7% — 목표 달성, 다음 목표 23%",
			goals: ["🔥 체지방 감소", "⚖️ 체중 유지"],
			goalMemo: "유산소 40분 + 근력 3분할",
			consultMemo: "목표 재설정 — 23%까지 감량 협의",
		},
	),
	mk5(
		5,
		1,
		"2026-07-11",
		"5회차",
		ib("75.2", "33.2", "17.4", "24.3", "23.1", "1689", "8"),
		[3, 2, 2, 2, 3],
		{
			trainer: "김지훈",
			ibComment: "체지방량 17.4kg, 골격근량 33.2kg — 감량·증량 동시 진행",
			goals: ["🔥 체지방 감소", "⚖️ 체중 유지"],
			goalMemo: "다음 목표: 골격근량 34kg, 체지방률 유지",
			feedbacks: [
				{
					name: "스쿼트",
					checkItems: [{ text: "무릎 정렬 불량", checked: false }],
					memo: "전반적으로 안정화됨",
				},
			],
			consultMemo: "2개월 단위 목표 재설정 논의",
		},
	),
	// 이서연(2) — 3건: 2회차 골격근량 소폭 하락 후 회복 (비단조 데모)
	mk5(
		6,
		2,
		"2026-02-08",
		"1회차",
		ib("57.0", "23.6", "20.3", "21.4", "35.6", "1318", "6"),
		[2, 2, 1, 2, 2],
		{
			trainer: "박소연",
			ibComment:
				"첫 측정 — 골격근량 대비 체지방률 높은 편, 근력 운동 우선",
			goals: ["💪 근력 향상", "🧘 자세 교정"],
			goalMemo: "하체 중심 2분할 루틴",
			consultMemo: "런지 시 무릎 통증 호소 — 무릎 정렬 체크 반복",
		},
	),
	mk5(
		7,
		2,
		"2026-04-12",
		"2회차",
		ib("57.3", "23.4", "19.6", "21.5", "34.2", "1324", "7"),
		[2, 3, 2, 2, 2],
		{
			trainer: "박소연",
			ibComment:
				"체지방률 하락, 골격근량은 소폭 감소 — 운동 강도 유지 필요",
			goals: ["💪 근력 향상", "🧘 자세 교정"],
			goalMemo: "상체 저중량 고반복 추가",
			feedbacks: [
				{
					name: "스쿼트",
					checkItems: [{ text: "발뒤꿈치 들림", checked: true }],
					memo: "체중을 발 전체로 분산하도록 지도",
				},
			],
			consultMemo: "단백질 섭취량 보충 논의",
		},
	),
	mk5(
		9,
		2,
		"2026-06-20",
		"3회차",
		ib("56.4", "24.1", "19.8", "21.2", "35.1", "1310", "5"),
		[2, 3, 2, 2, 3],
		{
			trainer: "박소연",
			ibComment:
				"골격근량 회복(+0.7kg), 체지방률은 1회차 수준으로 재상승",
			goals: ["💪 근력 향상", "🧘 자세 교정"],
			goalMemo: "유산소 30분 + 근력 2분할 유지",
			consultMemo: "주말 외식 빈도 조절 상담",
		},
	),
	// 최수아(4) — 4건: 05-16(2회차)만 8항목/24점, 그 외 5항목/15점 (기록별 만점 차이 데모)
	mk5(
		10,
		4,
		"2026-02-15",
		"1회차",
		ib("63.5", "24.9", "24.2", "23.8", "38.1", "1380", "6"),
		[1, 2, 1, 2, 2],
		{
			trainer: "김지훈",
			ibComment: "첫 측정 — 기준값 확보",
			goals: ["🧘 자세 교정", "🤸 유연성 개선"],
			goalMemo: "자세 교정 운동 병행",
			feedbacks: [
				{
					name: "원레그 브릿지",
					checkItems: [
						{ text: "엉덩이가 잘 안 올라감", checked: true },
					],
					memo: "둔근 활성화 먼저",
				},
			],
		},
	),
	mkRec(
		8,
		4,
		"2026-05-16",
		"2회차",
		ib("62.1", "25.6", "21.6", "23.3", "34.8", "1402", "5"),
		[2, 2, 2, 2, 2, 2, 2, 2],
		{
			trainer: "김지훈",
			ibComment:
				"체지방 감소·근량 유지 — 순조로운 진행 (8항목 전체 측정)",
			goals: ["🧘 자세 교정", "🤸 유연성 개선"],
			goalMemo: "스트레칭 10분 일상화",
			consultMemo: "데드리프트 자세 안정화됨",
		},
	),
	mk5(
		11,
		4,
		"2026-07-20",
		"3회차",
		ib("62.8", "25.2", "22.4", "23.6", "35.7", "1394", "6"),
		[2, 3, 2, 2, 3],
		{
			trainer: "김지훈",
			ibComment: "체지방률 재상승 — 더위로 인한 운동 빈도 감소 추정",
			goals: ["🧘 자세 교정", "🤸 유연성 개선"],
			goalMemo: "강도 상향 단계",
			feedbacks: [
				{
					name: "스쿼트",
					checkItems: [
						{ text: "발목·무릎 정렬 불량", checked: false },
					],
					memo: "발목 가동성 개선됨",
				},
			],
			consultMemo: "본인 주도 운동 가능 수준 — 2주 후 자가 기록 시작",
		},
	),
	mk5(
		12,
		4,
		"2026-08-15",
		"4회차",
		ib("59.8", "26.6", "17.9", "22.4", "30.0", "1440", "4"),
		[3, 2, 2, 3, 3],
		{
			trainer: "김지훈",
			ibComment: "체지방률 30.0% — 목표 도달, 근량 +0.4kg 동반 증가",
			goals: ["🧘 자세 교정", "🤸 유연성 개선"],
			goalMemo: "코어 강화 + 식단 유지",
			consultMemo: "6개월 단위 목표 재설정",
		},
	),
	// 정우진(5) — 3건: 중간 회차 체지방률 상승 후 하락 (비단조 데모, 박지훈만 0건 유지)
	mk5(
		13,
		5,
		"2026-03-14",
		"1회차",
		ib("72.0", "27.5", "19.1", "23.9", "26.5", "1495", "7"),
		[1, 2, 1, 2, 1],
		{
			trainer: "박소연",
			ibComment: "첫 측정 — 기준값 확보, 골격근량 증량 목표",
			goals: ["💪 근력 향상", "🦵 하체 강화"],
			goalMemo: "단백질 1.6g/kg 섭취 + 하체 중심 3분할",
			consultMemo: "움직임 테스트 전반 — 하체 가동성 우선 지도",
		},
	),
	mk5(
		14,
		5,
		"2026-05-20",
		"2회차",
		ib("72.8", "27.1", "19.7", "24.2", "27.1", "1502", "8"),
		[2, 2, 2, 1, 2],
		{
			trainer: "박소연",
			ibComment:
				"체지방률·내장지방 상승 — 야식 패턴 확인, 식단 점검 필요",
			goals: ["💪 근력 향상", "🦵 하체 강화"],
			goalMemo: "저녁 탄수화물 분량 조절",
			feedbacks: [
				{
					name: "스쿼트",
					checkItems: [{ text: "발목 가동성 부족", checked: true }],
					memo: "발목 스트레칭 루틴 추가",
				},
			],
			consultMemo: "야식 대체 식품 안내",
		},
	),
	mk5(
		16,
		5,
		"2026-07-05",
		"3회차",
		ib("71.9", "28.0", "18.7", "23.9", "26.0", "1515", "7"),
		[2, 3, 2, 2, 2],
		{
			trainer: "박소연",
			ibComment: "골격근량 28kg 목표 달성, 체지방률 1회차 이하로 회복",
			goals: ["💪 근력 향상", "🦵 하체 강화"],
			goalMemo: "4분할 루틴 + 주 4회 운동",
			consultMemo: "다음 회차 목표 설정 논의",
		},
	),
	// 김하늘(6) — 8건: 05-09(5회차)만 8항목/24점, 나머지 7건 5항목/15점
	// 체지방률·체중·골격근량·체지방량·내장지방이 회차마다 오르락 내리락 (스파크라인·변화 분석 데모)
	mk5(
		17,
		6,
		"2026-01-10",
		"1회차",
		ib("61.5", "26.1", "19.4", "23.4", "31.5", "1308", "6"),
		[2, 2, 1, 2, 2],
		{
			trainer: "김지훈",
			ibComment: "첫 측정 — 기준값 확보",
			goals: ["🔥 체지방 감소", "🏃 체력 향상"],
			goalMemo: "주 3회 유산소 20분부터",
			consultMemo: "출퇴근 계단 이용 습관 제안",
		},
	),
	mk5(
		18,
		6,
		"2026-02-12",
		"2회차",
		ib("62.4", "26.6", "19.2", "23.8", "30.8", "1322", "5"),
		[2, 3, 2, 2, 2],
		{
			trainer: "김지훈",
			ibComment: "체중 소폭 증가, 체지방률은 하락 — 근량 증가 효과",
			goals: ["🔥 체지방 감소", "🏃 체력 향상"],
			goalMemo: "하체 저중량 고반복 추가",
			feedbacks: [
				{
					name: "스쿼트",
					checkItems: [{ text: "발뒤꿈치 들림", checked: true }],
					memo: "체중을 발 전체로 분산하도록 지도",
				},
			],
		},
	),
	mk5(
		19,
		6,
		"2026-03-08",
		"3회차",
		ib("61.2", "26.0", "19.6", "23.3", "32.1", "1301", "6"),
		[2, 2, 2, 2, 3],
		{
			trainer: "김지훈",
			ibComment: "체지방률 다시 상승 — 식단 이탈 구간으로 추정",
			goals: ["🔥 체지방 감소", "🏃 체력 향상"],
			goalMemo: "간식 기록 일지 시작",
			consultMemo: "주말 외식 빈도 조절 상담",
		},
	),
	mk5(
		21,
		6,
		"2026-04-15",
		"4회차",
		ib("63.0", "26.9", "19.0", "24.0", "30.2", "1335", "5"),
		[3, 2, 2, 2, 2],
		{
			trainer: "김지훈",
			ibComment: "체중 증가에도 체지방률 최저치 — 근육량 증가 폭이 큼",
			goals: ["🔥 체지방 감소", "🏃 체력 향상"],
			goalMemo: "강도 상향 단계",
			feedbacks: [
				{
					name: "원레그 브릿지",
					checkItems: [{ text: "골반 틀어짐", checked: false }],
					memo: "코어 안정성 개선됨",
				},
			],
		},
	),
	mkRec(
		15,
		6,
		"2026-05-09",
		"5회차",
		ib("61.8", "26.3", "19.7", "23.6", "31.9", "1314", "6"),
		[2, 2, 3, 2, 2, 2, 3, 2],
		{
			trainer: "김지훈",
			ibComment:
				"체지방률 상승·근량 감소 — 휴식 부족 의심 (8항목 전체 측정)",
			goals: ["🔥 체지방 감소", "🏃 체력 향상"],
			goalMemo: "수면 7시간 목표",
			consultMemo: "취침 시간대 변경 제안",
		},
	),
	mk5(
		22,
		6,
		"2026-06-14",
		"6회차",
		ib("62.6", "26.7", "19.2", "23.9", "30.7", "1328", "5"),
		[3, 2, 3, 2, 2],
		{
			trainer: "김지훈",
			ibComment: "체지방률·체지방량 동반 하락 — 회복 추세",
			goals: ["🔥 체지방 감소", "🏃 체력 향상"],
			goalMemo: "유산소 30분 유지 + 코어 추가",
			feedbacks: [
				{
					name: "데드리프트",
					checkItems: [{ text: "허리 과신전", checked: true }],
					memo: "중립 척추 유지 반복 연습",
				},
			],
		},
	),
	mk5(
		23,
		6,
		"2026-07-11",
		"7회차",
		ib("61.0", "26.2", "19.8", "23.2", "32.4", "1298", "7"),
		[2, 2, 2, 3, 2],
		{
			trainer: "김지훈",
			ibComment:
				"체지방률 최고치 — 더운 날씨 식욕 저하로 간식 대체 가능성",
			goals: ["🔥 체지방 감소", "🏃 체력 향상"],
			goalMemo: "단백질 섭취량 보충",
			consultMemo: "운동 후 식사 타이밍 상담",
		},
	),
	mk5(
		24,
		6,
		"2026-08-10",
		"8회차",
		ib("62.2", "26.6", "19.0", "23.7", "30.5", "1325", "5"),
		[3, 3, 2, 2, 3],
		{
			trainer: "김지훈",
			ibComment: "체지방률 30.5% — 1회차 대비 1.0pp 하락, 근량은 +0.5kg",
			goals: ["🔥 체지방 감소", "🏃 체력 향상"],
			goalMemo: "다음 회차부터 스미스머신 스쿼트 도입",
			feedbacks: [
				{
					name: "스쿼트",
					checkItems: [{ text: "무릎 정렬 불량", checked: false }],
					memo: "전반적으로 안정화됨",
				},
			],
			consultMemo: "2개월 단위 목표 재설정 논의",
		},
	),
	// 김도윤(7) — 3건: 05-17(2회차)만 8항목/24점, 벌크 스토리에 3회차 소폭 조정 (비단조 데모)
	mk5(
		25,
		7,
		"2026-03-08",
		"1회차",
		ib("68.5", "30.2", "14.8", "22.9", "21.6", "1580", "5"),
		[1, 1, 2, 1, 1],
		{
			trainer: "김지훈",
			ibComment: "첫 측정 — 기준값 확보, 골격근량 증량 목표",
			goals: ["📈 근육량 증가", "🦵 하체 강화"],
			goalMemo: "단백질 1.6g/kg 섭취 + 하체 중심 3분할",
			consultMemo: "움직임 테스트 전반 — 하체 가동성 우선 지도",
		},
	),
	mkRec(
		20,
		7,
		"2026-05-17",
		"2회차",
		ib("70.1", "31.5", "15.2", "23.4", "21.7", "1615", "6"),
		[2, 2, 1, 2, 1, 2, 1, 2],
		{
			trainer: "김지훈",
			ibComment:
				"골격근량 +1.3kg, 체지방률 유지 — 증량 방향 양호 (8항목 전체 측정)",
			goals: ["📈 근육량 증가", "🦵 하체 강화"],
			goalMemo: "상체 저중량 고반복 + 하체 중강도",
			feedbacks: [
				{
					name: "스쿼트",
					checkItems: [{ text: "발목 가동성 부족", checked: true }],
					memo: "발목 스트레칭 루틴 추가",
				},
			],
			consultMemo: "단백질 섭취 타이밍 상담",
		},
	),
	mk5(
		26,
		7,
		"2026-07-26",
		"3회차",
		ib("69.9", "31.4", "15.0", "23.4", "21.5", "1608", "5"),
		[2, 2, 2, 2, 2],
		{
			trainer: "김지훈",
			ibComment: "골격근량 유지, 체중 소폭 조정 — 증량 속도 조절 구간",
			goals: ["📈 근육량 증가", "🦵 하체 강화"],
			goalMemo: "4분할 루틴 + 주 4회 운동",
			consultMemo: "다음 회차 목표 설정 논의",
		},
	),
];

/** 체크기록 스토어 (전 화면 공용 단일 인스턴스) — 저장값이 손상되면 시드로 폴백 */
export const recordStore = new Store(
	{ records: SEED_RECORDS, nextId: SEED_RECORDS.length + 1 },
	{
		storageKey: STORAGE_KEY,
		/** 저장값에 records 배열이 있어야 유효 */
		validate: (data) => Array.isArray(data.records),
	},
);
