// 공용 평가 항목 데이터

// 파일 용도: 움직임 평가 7개 항목 데이터 — basic_function_assessment_2.html·checkday 공용
// 구조: 각 항목 = `{ name, desc, checks[] }`
// 체크 문구는 basic_function_assessment_2.html 기준으로 통일
export const ASSESSMENT_ITEMS = [
	{
		name: "호흡 테스트",
		desc: "늑골 · 복압 평가",
		checks: [
			"허리가 과도하게 뜸",
			"허벅지가 수직으로 안 섬",
			"엉덩이가 과도하게 뜸",
			"호흡 중 갈비뼈 과도하게 올라감",
			"내쉴 때 늑골이 내려가지 않음",
		],
	},
	{
		name: "Lumbar ROM (바닥짚기)",
		desc: "힌지 / 햄스트링 / 요추 안정성 평가",
		checks: [
			"앞으로만 숙여짐 (힙 후방 이동 없음)",
			"무릎이 많이 구부려짐 (햄스트링 타이트)",
			"등이 솟고 허리 긴장으로 하강 제한",
		],
	},
	{
		name: "Wall Angel Test",
		desc: "흉추 · 목 · 어깨 · 코어 평가",
		checks: [
			"손목이 꺾임",
			"허리 과도하게 꺾임 (늑골 과도 상승)",
			"턱이 들림",
		],
	},
	{
		name: "Over Head Squat",
		desc: "상체 / 하체 통합 코디네이션 평가",
		checks: [
			"발목·무릎 정렬 불량",
			"허리 아치 또는 말림",
			"상체 과도한 굽힘",
			"팔이 앞으로 떨어짐",
			"비대칭 체중이동",
		],
	},
	{
		name: "Single Balance Test",
		desc: "감각기능 / 전정기관 평가",
		checks: [
			"시각 ON – 골반 틀어짐",
			"시각 OFF – 균형 불안정",
			"고개 회전 시 균형 손실 (전정기관)",
		],
	},
	{
		name: "One Leg Squat",
		desc: "발목 / 무릎 / 고관절 하지패턴 평가",
		checks: [
			"무릎이 안으로 들어감 (통증 동반 여부)",
			"지지측 엉덩이 돌아감 (중둔근 부전)",
			"상체 숙여짐 (발목 가동성 제한)",
		],
	},
	{
		name: "원레그 브릿지",
		desc: "회전기능 평가 (후면사슬 / X자 기능)",
		checks: [
			"골반 과도한 틀어짐 (코어 회전 기능 저하)",
			"엉덩이가 잘 안 올라감 (둔근 기능 부전)",
		],
	},
];

// 파일 용도: 움직임 평가 8개 항목 전체 — 공용 7개 + VO₂ 항목 (check-doc 화면 공용)
// evaluation.js·check-doc-new에서 그대로 사용
export const ASSESSMENT_ITEMS_FULL = [
	...ASSESSMENT_ITEMS,
	{
		name: "VO₂ Max (스텝 테스트)",
		desc: "심폐 지구력",
		checks: ["1분 HR 과도하게 높음", "HRR 회복 불량"],
		vo2: true,
	},
];

// 파일 용도: 체크기록 작성(check-doc-new) 전용 베이직 펑션 5항목 — 번호는 1~5로 재부여
// 결정: to-be 지시에 따라 Lumbar ROM(바닥짚기)·Wall Angel Test·Over Head Squat·Single Balance Test·VO₂ Max(스텝 테스트)만
//       사용하고, 호흡 테스트·One Leg Squat·원레그 브릿지는 제외한다. 5항목 × 3점 = 15점 만점.
// 주의: 대상 4항목은 ASSESSMENT_ITEMS와 동일 객체를 재사용하므로 데이터 중복이 없다. (VO₂ 항목만 전용)
/**
 * 이름으로 ASSESSMENT_ITEMS에서 평가 항목 1개를 찾는다
 * @param {string} name 항목 이름 (예: "Lumbar ROM (바닥짚기)")
 * @returns {{ name: string, desc: string, checks: string[] } | undefined} 항목 데이터 (없으면 undefined)
 */
const pickByName = (name) => ASSESSMENT_ITEMS.find((it) => it.name === name);
export const ASSESSMENT_ITEMS_BASIC5 = [
	pickByName("Lumbar ROM (바닥짚기)"),
	pickByName("Wall Angel Test"),
	pickByName("Over Head Squat"),
	pickByName("Single Balance Test"),
	{
		name: "VO₂ Max (스텝 테스트)",
		desc: "심폐 지구력",
		checks: ["1분 HR 과도하게 높음", "HRR 회복 불량"],
		vo2: true,
	},
];

/**
 * 기록의 점수 배열 길이에 맞는 평가 항목 목록을 반환한다 —
 * 5항목(BASIC5) 기록은 5장, 8항목(레거시) 기록은 8장으로 조회·편집·비교 화면이 양쪽 다 올바르게 표시한다.
 * @param {number} [scoresLength] 기록의 scores 배열 길이 (없으면 레거시 8항목)
 * @returns {Array<{ name: string, desc: string, checks: string[] }>} 평가 항목 목록
 */
export function itemsForRecord(scoresLength) {
	return scoresLength === ASSESSMENT_ITEMS_BASIC5.length
		? ASSESSMENT_ITEMS_BASIC5
		: ASSESSMENT_ITEMS_FULL;
}
