// 파일 용도: 회원 스토어 단일 인스턴스 — 세션(sessionStorage) 영속화된 mock 저장소 (회원 관리·등록·상세 공용)
// 주의: API 미배포 상태이므로 브라우저 세션 동안만 유지되는 mock이다. 탭을 닫으면 시드로 복원된다.
import { createStore } from "./store.js";

/** 세션 저장 키 */
const STORAGE_KEY = "checkday.members.v1";

/** 시드 회원 5명 */
export const SEED_MEMBERS = [
	{ id: 1, name: "김민준", gender: "남", goal: "체지방 감소", trainer: "김지훈" },
	{ id: 2, name: "이서연", gender: "여", goal: "근력 향상", trainer: "박소연" },
	{ id: 3, name: "박지훈", gender: "남", goal: "체중 감량", trainer: "정지훈" },
	{ id: 4, name: "최수아", gender: "여", goal: "체형 교정", trainer: "김지훈" },
	{ id: 5, name: "정우진", gender: "남", goal: "근력 향상", trainer: "박소연" },
];

/**
 * 저장된 상태를 읽고, 없거나 손상됐으면 시드로 초기화
 * @returns {{ members: import("./store.js").Member[], nextId: number }}
 */
function loadInitial() {
	try {
		const raw = sessionStorage.getItem(STORAGE_KEY);
		if (raw) {
			const data = JSON.parse(raw);
			if (Array.isArray(data.members)) return data;
		}
	} catch (err) {
		// 손상된 데이터는 시드로 폴백
	}
	return { members: SEED_MEMBERS, nextId: SEED_MEMBERS.length + 1 };
}

/** 회원 스토어 (전 화면 공용 단일 인스턴스) */
export const memberStore = createStore(loadInitial());

// 상태가 바뀔 때마다 세션 저장 (관찰자 패턴 — mock 영속화)
memberStore.subscribe((state) => {
	try {
		sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	} catch (err) {
		// 저장 실패는 mock이므로 무시
	}
});