// 파일 용도: 회원 스토어 단일 인스턴스 — 세션(sessionStorage) 영속화된 mock 저장소 (회원 관리·등록·상세 공용)
// 주의: API 미배포 상태이므로 브라우저 세션 동안만 유지되는 mock이다. 탭을 닫으면 시드로 복원된다.
import { Store } from "@infra/store.js";

/** 세션 저장 키 */
const STORAGE_KEY = "checkday.members.v2";

/**
 * 웹 성별 표기를 API 성별 표기로 변환합니다.
 * @param {"" | "남" | "여"} gender 웹 성별
 * @returns {"" | "男" | "女"} API 성별
 */
export function toApiGender(gender) {
	if (gender === "남") return "男";
	if (gender === "여") return "女";
	return "";
}

/**
 * API 성별 표기를 웹 성별 표기로 변환합니다.
 * @param {"" | "男" | "女"} gender API 성별
 * @returns {"" | "남" | "여"} 웹 성별
 */
export function fromApiGender(gender) {
	if (gender === "男") return "남";
	if (gender === "女") return "여";
	return "";
}

/** 시드 회원 7명 — 김씨 3인(김민준·김하늘·김도윤) 포함.
 *  주의: API 연동 시 회원 식별자는 숫자 id 대신 API의 member_ID(NanoID 문자열)로 교첼됩니다. */
export const SEED_MEMBERS = [
	{ id: 1, name: "김민준", gender: "남", goal: "체지방 감소", trainer: "김지훈" },
	{ id: 2, name: "이서연", gender: "여", goal: "근력 향상", trainer: "박소연" },
	{ id: 3, name: "박지훈", gender: "남", goal: "체중 감량", trainer: "정지훈" },
	{ id: 4, name: "최수아", gender: "여", goal: "체형 교정", trainer: "김지훈" },
	{ id: 5, name: "정우진", gender: "남", goal: "근력 향상", trainer: "박소연" },
	// 훼이크 데이터 보강: 체크기록 8건(스파크라인·변화 분석 데모용)을 가진 김씨 회원
	{ id: 6, name: "김하늘", gender: "여", goal: "체지방 감소", trainer: "김지훈" },
	{ id: 7, name: "김도윤", gender: "남", goal: "근육량 증가", trainer: "김지훈" },
];

/** 회원 스토어 (전 화면 공용 단일 인스턴스) — 저장값이 손상되면 시드로 폴백 */
export const memberStore = new Store(
	{ members: SEED_MEMBERS, nextId: SEED_MEMBERS.length + 1 },
	{
		storageKey: STORAGE_KEY,
		/** 저장값에 members 배열이 있어야 유효 */
		validate: (data) => Array.isArray(data.members),
	},
);

/**
 * 회원 1명을 추가하고 새 id를 부여한다 (등록 화면 공용)
 * @param {Omit<import("@infra/store.js").Member, "id">} data 신규 회원 데이터 (이름·성별·목표·트레이너)
 * @returns {number} 부여된 회원 id
 */
export function addMember(data) {
	const id = memberStore.getState().nextId;
	memberStore.setState((prev) => ({
		...prev,
		members: [...prev.members, { id, ...data }],
		nextId: prev.nextId + 1,
	}));
	return id;
}

/**
 * 회원 1명의 정보를 갱신한다 (편집 화면 공용)
 * @param {number} id 대상 회원 id
 * @param {Partial<import("@infra/store.js").Member>} patch 갱신할 필드 (이름·성별·목표·트레이너 등)
 * @returns {void}
 */
export function updateMember(id, patch) {
	memberStore.setState((prev) => ({
		...prev,
		members: prev.members.map((m) => (m.id === id ? { ...m, ...patch } : m)),
	}));
}