// 파일 용도: 회원 스토어 단일 인스턴스 — Mason API 클라이언트 (회원 관리·등록·상세 공용)
// 주의: 기존 sessionStorage mock 저장에서 API 영속화로 교체되었습니다.
import { request } from "@infra/api-client.js";
import { Store } from "@infra/store.js";

/** API Member 응답을 웹 Member 형태로 정규화합니다.
 * @param {object} apiMember Mason API Member 리소스
 * @returns {import("@infra/store.js").Member}
 */
function normalizeMember(apiMember) {
	return {
		id: apiMember.member_ID,
		name: apiMember.name,
		gender: fromApiGender(apiMember.gender),
		goal: apiMember.goal,
		trainer: apiMember.trainer,
		registered_at: apiMember.registered_at,
		updated_at: apiMember.updated_at,
	};
}

/** 웹 Member 데이터를 API Member 생성·수정 본문으로 변환합니다.
 * @param {Omit<import("@infra/store.js").Member, "id">} data 웹 회원 데이터
 * @returns {object} API 요청 본문
 */
function toApiMember(data) {
	return {
		name: data.name,
		gender: toApiGender(data.gender),
		goal: data.goal,
		trainer: data.trainer,
	};
}

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

/** 회원 스토어 (전 화면 공용 단일 인스턴스) — API 데이터로 채워집니다. */
export const memberStore = new Store({ members: [], loading: false, error: null }, { storageKey: null });

/**
 * 회원 목록을 API에서 불러와 스토어에 저장합니다.
 * @returns {Promise<void>}
 */
export async function loadMembers() {
	memberStore.update({ loading: true, error: null });
	try {
		const items = await request("/members");
		memberStore.update({ members: items.map(normalizeMember), loading: false });
	} catch (err) {
		memberStore.update({ loading: false, error: err.message || "회원 목록을 불러오지 못했습니다" });
		throw err;
	}
}

/**
 * 회원 1명을 API에 등록하고 스토어에 반영합니다.
 * @param {Omit<import("@infra/store.js").Member, "id">} data 신규 회원 데이터
 * @returns {Promise<string>} 생성된 회원 member_ID
 */
export async function addMember(data) {
	const created = await request("/members", {
		method: "POST",
		body: toApiMember(data),
	});
	memberStore.setState(prev => ({
		...prev,
		members: [...prev.members, normalizeMember(created)],
	}));
	return created.member_ID;
}

/**
 * 회원 1명의 정보를 API에 부분 수정하고 스토어에 반영합니다.
 * @param {string} id 대상 회원 member_ID
 * @param {Partial<import("@infra/store.js").Member>} patch 갱신할 필드
 * @returns {Promise<void>}
 */
export async function updateMember(id, patch) {
	const body = {};
	if (patch.name !== undefined) body.name = patch.name;
	if (patch.gender !== undefined) body.gender = toApiGender(patch.gender);
	if (patch.goal !== undefined) body.goal = patch.goal;
	if (patch.trainer !== undefined) body.trainer = patch.trainer;
	const updated = await request(`/members/${id}`, {
		method: "PUT",
		body,
	});
	memberStore.setState(prev => ({
		...prev,
		members: prev.members.map(m => (m.id === id ? normalizeMember(updated) : m)),
	}));
}

/**
 * 회원 1명을 API에서 삭제하고 스토어에서 제거합니다.
 * @param {string} id 대상 회원 member_ID
 * @returns {Promise<void>}
 */
export async function removeMember(id) {
	await request(`/members/${id}`, { method: "DELETE" });
	memberStore.setState(prev => ({
		...prev,
		members: prev.members.filter(m => m.id !== id),
	}));
}
