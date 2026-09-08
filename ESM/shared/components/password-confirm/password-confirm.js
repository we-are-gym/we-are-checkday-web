// 파일 용도: 삭제 비밀번호 확인 모달 웹 컴포넌트 — 3단계 회원 삭제 경고 후 평문 비밀번호 입력
// 기법: 라이트 DOM 모드(defineComponent), role=dialog·aria-modal, Esc/배경 클릭 취소, 확인 시 onConfirm(값) 호출
// 주의: 입력값은 평문이며 로그인 비밀번호가 아니다. autocomplete=new-password로 저장 자격증명 자동 채움·사용자이름 페어링을 차단한다.
//       (정적 마크업을 두면 페이지의 검색 입력이 브라우저 자동완성 대상이 되므로, 모달은 사용 시점에 동적 생성한다.)
import { defineComponent } from "@shared/components/base/component.js";

defineComponent({
	tag: "password-confirm",
	render() {
		return `
			<style>
				/* 모달 팔레트 — colors.css :root 다크 토큰을 소비해 테마 단일 지점 유지 */
				.pc-backdrop{
					--pc-bg:var(--surface2); --pc-border:var(--border2); --pc-text:var(--text); --pc-text2:var(--text2);
					--pc-input-bg:var(--surface); --pc-input-border:var(--border2);
					--pc-overlay:rgba(0,0,0,.55); --pc-shadow:0 12px 40px rgba(0,0,0,.5);
					position:fixed;inset:0;background:var(--pc-overlay);display:flex;align-items:center;justify-content:center;z-index:1000
				}
				.pc-backdrop[hidden]{display:none}
				.pc-dialog{background:var(--pc-bg);color:var(--pc-text);padding:20px;border-radius:12px;width:min(90vw,360px);border:0.5px solid var(--pc-border);box-shadow:var(--pc-shadow)}
				.pc-title{margin:0 0 8px;font-size:18px}
				.pc-msg{margin:0 0 12px;font-size:13px;color:var(--pc-text2);white-space:pre-line}
				.pc-input{width:100%;padding:8px;font-size:14px;background:var(--pc-input-bg);color:var(--pc-text);border:1px solid var(--pc-input-border);border-radius:8px;box-sizing:border-box}
				.pc-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:14px}
			</style>
			<div class="pc-backdrop" hidden>
				<div class="pc-dialog" role="dialog" aria-modal="true" aria-labelledby="pc-title" aria-describedby="pc-msg">
					<h2 id="pc-title" class="pc-title"></h2>
					<p id="pc-msg" class="pc-msg"></p>
					<input class="pc-input" type="password" autocomplete="new-password" aria-label="삭제 비밀번호" />
					<div class="pc-actions">
						<button type="button" class="pc-cancel btn btn-ghost">취소</button>
						<button type="button" class="pc-ok btn btn-primary">확인</button>
					</div>
				</div>
			</div>`;
	},
	onConnect() {
		const backdrop = this.querySelector(".pc-backdrop");
		const input = this.querySelector(".pc-input");
		const okBtn = this.querySelector(".pc-ok");
		const cancelBtn = this.querySelector(".pc-cancel");

		const finish = confirmed => {
			const value = input.value;
			input.value = "";
			backdrop.hidden = true;
			if (confirmed && typeof this.onConfirm === "function") this.onConfirm(value);
			if (!confirmed && typeof this.onCancel === "function") this.onCancel();
		};

		okBtn.addEventListener("click", () => finish(true));
		cancelBtn.addEventListener("click", () => finish(false));
		backdrop.addEventListener("click", e => {
			if (e.target === backdrop) finish(false);
		});
		input.addEventListener("keydown", e => {
			if (e.key === "Enter") finish(true);
			if (e.key === "Escape") finish(false);
		});
	},
	// 모달 열기 — 제목/안내 설정 후 표시하고 입력에 포커스한다
	show(title, message) {
		this.querySelector(".pc-title").textContent = title || "비밀번호 확인";
		this.querySelector(".pc-msg").textContent = message || "";
		const backdrop = this.querySelector(".pc-backdrop");
		const input = this.querySelector(".pc-input");
		backdrop.hidden = false;
		input.focus();
	},
	// 모달 닫기(취소와 동일处理结果를 내지 않음)
	close() {
		this.querySelector(".pc-backdrop").hidden = true;
	},
});
