// 파일 용도: 회원 삭제 확인 흐름 — 경고×2 + 비밀번호 모달 3단계 후 API 소프트 삭제
// 기법: member-store(삭제 API)·record-store(연관 기록 갱신)·password-confirm(모달) 재사용, entries/members.js에서 분리(SRP)
import { recordStore } from "@check-doc/record-store.js";
import { removeMember as apiRemoveMember, memberStore } from "@member/member-store.js";
import "@shared/components/password-confirm/password-confirm.js";

/**
 * 네이티브 <dialog> 기반 확인 다이얼로그를 표시합니다 (로컬 헬퍼).
 * @param {string} title 제목
 * @param {string} message 본문 메시지 (\n 줄바꿈을 유지합니다)
 * @returns {Promise<boolean>} 확인 true, 취소 false를 돌려줍니다
 */
async function showConfirmDialog(title, message) {
	return new Promise(resolve => {
		const dialog = document.createElement("dialog");
		dialog.className = "cd-dialog cd-dialog--danger";
		dialog.innerHTML = `
			<style>
				.cd-dialog{background:var(--surface2);color:var(--text);padding:0;border-radius:var(--rlg);border:0.5px solid var(--border2);box-shadow:0 12px 40px rgba(0,0,0,.5);max-width:min(90vw,360px)}
				.cd-dialog::backdrop{background:rgba(0,0,0,.55)}
				.cd-dialog[open]{display:flex;flex-direction:column}
				.cd-header{padding:20px 20px 8px;border-bottom:1px solid var(--border2)}
				.cd-title{margin:0;font-size:18px}
				.cd-body{padding:12px 20px;font-size:13px;color:var(--text2);white-space:pre-line}
				.cd-footer{display:flex;justify-content:flex-end;gap:8px;padding:8px 20px 20px}
				.cd-cancel{background:transparent;color:var(--text);border:1px solid var(--border2);padding:8px 16px;border-radius:var(--r);cursor:pointer}
				.cd-ok{background:var(--red-fg);color:#fff;border:none;padding:8px 16px;border-radius:var(--r);cursor:pointer}
				.cd-ok:hover{background:#c95a5a}
			</style>
			<div class="cd-header"><h2 class="cd-title"></h2></div>
			<div class="cd-body"></div>
			<div class="cd-footer">
				<button type="button" class="cd-cancel">취소</button>
				<button type="button" class="cd-ok">확인</button>
			</div>
		`;
		dialog.querySelector(".cd-title").textContent = title;
		dialog.querySelector(".cd-body").textContent = message;
		document.body.appendChild(dialog);
		const okBtn = dialog.querySelector(".cd-ok");
		const cancelBtn = dialog.querySelector(".cd-cancel");
		const close = confirmed => {
			dialog.close();
			dialog.remove();
			resolve(confirmed);
		};
		okBtn.addEventListener("click", () => close(true));
		cancelBtn.addEventListener("click", () => close(false));
		dialog.addEventListener("click", e => {
			if (e.target === dialog) close(false);
		});
		dialog.addEventListener("cancel", () => close(false));
		dialog.showModal();
		cancelBtn.focus();
	});
}

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

	const confirmed1 = await showConfirmDialog("회원 삭제 확인", prompt);
	if (!confirmed1) return;
	const confirmed2 = await showConfirmDialog("최종 확인", "정말 삭제하실 겁니까? 확실해요?");
	if (!confirmed2) return;

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
