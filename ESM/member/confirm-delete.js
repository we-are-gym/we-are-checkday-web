// 파일 용도: 회원 삭제 확인 흐름 — 경고×2 + 비밀번호 모달 3단계 후 API 소프트 삭제
// 기법: member-store(삭제 API)·record-store(연관 기록 갱신)·password-confirm(모달) 재사용, entries/members.js에서 분리(SRP)
import { recordStore } from "@check-doc/record-store.js";
import { removeMember as apiRemoveMember, memberStore } from "@member/member-store.js";
import "@shared/components/password-confirm/password-confirm.js";

/**
 * 회원 삭제 비밀번호 모달 엘리먼트를 보장한다 (미존재 시 동적 생성).
 * @returns {HTMLElement} password-confirm 엘리먼트
 */
function ensurePasswordConfirm() {
	const el = document.querySelector("password-confirm");
	if (!el) {
		const created = document.createElement("password-confirm");
		document.body.appendChild(created);
		return created;
	}
	return el;
}

/**
 * 3단계 확인 모달을 열고 평문 비밀번호를 반환한다. 취소 시 null.
 * @returns {Promise<string|null>}
 */
async function confirmDeletePassword() {
	const pc = ensurePasswordConfirm();
	return new Promise(resolve => {
		pc.onConfirm = value => resolve(value);
		pc.onCancel = () => resolve(null);
		pc.show(" ", "회원 삭제 전용 비밀번호를 입력하세요.");
	});
}

/**
 * 회원 삭제 (경고×2 → 평문 비밀번호 모달 → API 호출 → 스토어 갱신)
 * @param {string} id 삭제할 회원 member_ID
 * @returns {Promise<void>}
 */
export async function removeMember(id) {
	const member = memberStore.getState().members.find(m => m.id === id);
	if (!member) return;

	// 연관 체크기록 건수 (안내용)
	const linkedRecords = recordStore.getState().records.filter(r => r.memberId === id);
	const recordCount = linkedRecords.length;

	const prompt =
		recordCount > 0
			? `회원 ${member.name} 님을 삭제하시겠습니까?\n\n연결된 체크기록 ${recordCount}건도 함께 삭제합니다.`
			: `회원 ${member.name} 님을 삭제하시겠습니까?`;

	if (!confirm(prompt)) return;
	if (!confirm("정말 삭제하실 겁니까? 확실해요?")) return;

	// 3단계: 평문 비밀번호 확인 — 취소 시 삭제 중단
	const password = await confirmDeletePassword();
	if (password === null) return;

	try {
		await apiRemoveMember(id, password);

		// 로컬 기록 목록에서도 해당 회원 기록 제거
		recordStore.setState(prev => ({
			...prev,
			records: prev.records.filter(r => r.memberId !== id),
		}));
	} catch (err) {
		console.error("회원 삭제 실패:", err);
		// 401은 request() 내부에서 goToLogin()이 이미 리다이렉트를 처리하고,
		// 그 밖의 실패 안내 토스트는 api-client.request가 표시한다 — 여기서 중복 안내하지 않는다
	}
}
