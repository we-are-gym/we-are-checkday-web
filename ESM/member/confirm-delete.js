// 파일 용도: 회원 삭제 확인 흐름 — 경고×2 + 비밀번호 모달 3단계 후 API 소프트 삭제
// 기법: member-store(삭제 API)·record-store(연관 기록 갱신)·password-confirm(모달) 재사용, entries/members.js에서 분리(SRP)
import { recordStore } from "@check-doc/record-store.js";
import { removeMember as apiRemoveMember, memberStore } from "@member/member-store.js";
import "@shared/components/password-confirm/password-confirm.js";

/**
 * 네이티브 <dialog> 기반 확인 다이얼로그를 표시합니다 (로컬 헬퍼).
 * @param {string} title 제목 (plain 전용; warn에서는 무시)
 * @param {string} message 본문 메시지 (\n 줄바꿈을 유지합니다; plain 전용)
 * @param {Object} [options] 표시 옵션 (생략 시 기존 살몬색 확인 버튼)
 * @param {boolean} [options.solidOk] 참이면 확인 버튼을 솔리드 레드로 표시합니다
 * @param {string} [options.okLabel="확인"] 확인 버튼 문구
 * @param {"plain"|"warn"} [options.variant="plain"] plain=기존 레이아웃, warn=1단계 경고 레이아웃(프로토타입)
 * @param {string} [options.memberName] warn 전용 — 회원 이름 (textContent로 삽입)
 * @param {number} [options.recordCount] warn 전용 — 연결 체크기록 건수 (0이면 부제 생략)
 * @returns {Promise<boolean>} 확인 true, 취소 false를 돌려줍니다
 */
async function showConfirmDialog(title, message, options = {}) {
	const okLabel = options.okLabel ?? "확인";
	const variant = options.variant ?? "plain";

	return new Promise(resolve => {
		const dialog = document.createElement("dialog");

		dialog.className = "cd-dialog cd-dialog--danger";
		if (variant !== "plain") dialog.classList.add(`cd-dialog--${variant}`);

		// plain / warn 공통 베이스 + warn 전용 규칙 (전역 CSS 미수정 — dialog 스코프 인라인)
		dialog.innerHTML = `
			<style>
				.cd-dialog {
					background: var(--surface2);
					color: var(--text);
					padding: 0;

					/* 네모 모양, 각지게 */
					/* border-radius: var(--rlg); */

					border: 0.5px solid var(--border2);
					box-shadow: 0 12px 40px rgba(0, 0, 0, .5);

					/* 가로로 긴 직사각형 형태 */
					/* max-width: min(90vw, 360px); */
					max-width: min(90vw, 630px);

					margin: auto;
				}

				.cd-dialog::backdrop { background: rgba(0, 0, 0, .55) }
				.cd-dialog[open] { display: flex; flex-direction: column }

				.cd-header {
					padding: 20px 20px 8px;

					/* 선 없애기 */
					/* border-bottom: 1px solid var(--border2); */
				}

				.cd-title { margin: 0; font-size: 18px }

				.cd-body {
					/* 가로로 긴 직사각형 형태 */
					/* padding: 12px 20px; */
					padding: 12px 40px;

					font-size: 13px;
					color: var(--text2);
					white-space: pre-line;
				}

				.cd-footer {
					display: flex;
					justify-content: flex-end;
					gap: 8px;

					/* 가로로 긴 직사각형 형태 */

					/* padding: 8px 20px 20px; */

					padding-top: 8px;
					padding-bottom: 20px;
					padding-left: 40px;
					padding-right: 40px;
				}

				.cd-cancel { background: transparent; color: var(--text); border: 1px solid var(--border2); padding: 8px 16px; border-radius: var(--r); cursor: pointer }

				.cd-ok { background: var(--red-fg); color: #fff; border: none; padding: 8px 16px; border-radius: var(--r); cursor: pointer }

				.cd-ok:hover { background: #c95a5a }
				.cd-ok--solid { background: var(--danger-solid) }
				.cd-ok--solid:hover { background: var(--danger-solid-hover) }

				/* ── warn: 회원삭제확인모달-1.png ── */
				.cd-dialog--warn {
					position: relative;
					border-radius: var(--rlg);
					max-width: min(90vw, 360px);
				}

				.cd-dialog--warn .cd-close {
					position: absolute;
					top: 10px;
					right: 10px;
					width: 28px;
					height: 28px;
					padding: 0;
					border: none;
					background: transparent;
					color: var(--text2);
					font-size: 18px;
					line-height: 1;
					cursor: pointer;
				}

				.cd-dialog--warn .cd-close:hover { color: var(--text) }

				.cd-dialog--warn .cd-header { display: none }

				.cd-dialog--warn .cd-body {
					padding: 24px 40px 16px 20px;
					white-space: normal;
					color: var(--text);
				}

				.cd-dialog--warn .cd-warn-row {
					display: flex;
					align-items: flex-start;
					gap: 12px;
				}

				.cd-dialog--warn .cd-warn-icon {
					flex-shrink: 0;
					width: 28px;
					height: 28px;
					border-radius: 50%;
					background: var(--danger-solid);
					color: #fff;
					font-size: 16px;
					font-weight: 700;
					display: flex;
					align-items: center;
					justify-content: center;
					line-height: 1;
				}

				.cd-dialog--warn .cd-warn-text { min-width: 0; flex: 1 }

				.cd-dialog--warn .cd-warn-title {
					margin: 0;
					font-size: 15px;
					font-weight: 600;
					color: var(--text);
					line-height: 1.4;
				}

				.cd-dialog--warn .cd-warn-sub {
					margin: 8px 0 0;
					font-size: 13px;
					color: var(--text2);
					line-height: 1.45;
				}

				.cd-dialog--warn .cd-count {
					color: var(--danger-solid);
					font-style: normal;
					font-weight: 600;
				}

				.cd-dialog--warn .cd-divider {
					height: 0;
					border: none;
					border-top: 1px solid var(--border2);
					margin: 0 16px;
				}

				.cd-dialog--warn .cd-footer {
					padding: 12px 16px 16px;
				}
			</style>
			<button type="button" class="cd-close" hidden aria-label="닫기">&times;</button>
			<div class="cd-header"><h2 class="cd-title"></h2></div>
			<div class="cd-body"></div>
			<hr class="cd-divider" hidden />
			<div class="cd-footer">
				<button type="button" class="cd-cancel">취소</button>
				<button type="button" class="cd-ok"></button>
			</div>
		`;

		const bodyEl = dialog.querySelector(".cd-body");
		const closeBtn = dialog.querySelector(".cd-close");
		const divider = dialog.querySelector(".cd-divider");

		if (variant === "warn") {
			closeBtn.hidden = false;
			divider.hidden = false;

			const row = document.createElement("div");
			row.className = "cd-warn-row";

			const icon = document.createElement("span");
			icon.className = "cd-warn-icon";
			icon.setAttribute("aria-hidden", "true");
			icon.textContent = "!";

			const textWrap = document.createElement("div");
			textWrap.className = "cd-warn-text";

			const warnTitle = document.createElement("p");
			warnTitle.className = "cd-warn-title";
			const name = options.memberName ?? "";
			warnTitle.textContent = `회원 ${name} 님을 삭제하시겠습니까?`;

			textWrap.appendChild(warnTitle);

			const recordCount = Number(options.recordCount) || 0;
			if (recordCount > 0) {
				const sub = document.createElement("p");
				sub.className = "cd-warn-sub";
				sub.append("연결된 체크기록 ");
				const countEm = document.createElement("span");
				countEm.className = "cd-count";
				countEm.textContent = `${recordCount}건`;
				sub.appendChild(countEm);
				sub.append("도 함께 삭제됩니다.");
				textWrap.appendChild(sub);
			}

			row.append(icon, textWrap);
			bodyEl.replaceChildren(row);
		} else {
			dialog.querySelector(".cd-title").textContent = title;
			bodyEl.textContent = message;
		}

		document.body.appendChild(dialog);

		const okBtn = dialog.querySelector(".cd-ok");
		const cancelBtn = dialog.querySelector(".cd-cancel");
		okBtn.textContent = okLabel;
		if (options.solidOk) okBtn.classList.add("cd-ok--solid");

		const close = confirmed => {
			dialog.close();
			dialog.remove();
			resolve(confirmed);
		};

		okBtn.addEventListener("click", () => close(true));
		cancelBtn.addEventListener("click", () => close(false));
		closeBtn.addEventListener("click", () => close(false));

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

	// 1단계: 프로토타입(회원삭제확인모달-1) — API/삭제 로직은 그대로, UI만 warn 변형
	const confirmed1 = await showConfirmDialog(/* 제목 필요 없음 */ /*"회원 삭제 확인"*/ null, null, {
		solidOk: true,
		okLabel: "삭제",
		variant: "warn",
		memberName: member.name,
		recordCount,
	});
	if (!confirmed1) return;
	const confirmed2 = await showConfirmDialog(/* 제목 필요 없음 */ /*"최종 확인"*/ null, "정말 삭제하실 겁니까? 확실해요?", {
		solidOk: true,
	});
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
