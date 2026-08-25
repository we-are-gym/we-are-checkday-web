// 파일 용도: 에러/성공/정보 토스트 알림 + 로딩 오버레이 웹 컴포넌트
// 기법: 라이트 DOM 웹컴포넌트 — Shadow DOM 없이 인라인 스타일 + aria-live="polite" 접근성

/** 토스트 타입별 기본 색상·아이콘 */
const TYPE_STYLES = {
	error: { bg: "#fee2e2", fg: "#991b1b", border: "#fca5a5", icon: "✕" },
	warning: { bg: "#fef3c7", fg: "#92400e", border: "#fde68a", icon: "⚠" },
	success: { bg: "#d1fae5", fg: "#065f46", border: "#6ee7b7", icon: "✓" },
	info: { bg: "#dbeafe", fg: "#1e40af", border: "#93c5fd", icon: "ℹ" },
};

let singletonEl = null;

// 테스트 환경(Bun/jsdom)에서는 HTMLElement가 정의되지 않으므로 가드
if (typeof HTMLElement !== "undefined") {
	/**
	 * <es-toast> 라이트 DOM 웹 컴포넌트.
	 *
	 * ```html
	 * <es-toast></es-toast>
	 * ```
	 *
	 * 호출:
	 * - `el.show(message, { type, duration, action })`
	 * - `el.hideAll()`
	 * - `el.showLoading()` / `el.hideLoading()`
	 *
	 * @example
	 * ```js
	 * import "./shared/components/toast/toast.js";
	 * const toast = document.querySelector("es-toast");
	 * toast.show("저장 완료", { type: "success" });
	 * ```
	 */
	class EsToast extends HTMLElement {
		/** @type {Array<{id: number, el: HTMLElement, timer: ReturnType<typeof setTimeout> | null}>} */
		_toasts = [];
		_nextId = 0;

		connectedCallback() {
			singletonEl = this;
			this._renderShell();
		}

		disconnectedCallback() {
			if (singletonEl === this) singletonEl = null;
			this._toasts.forEach(t => clearTimeout(t.timer));
			this._toasts = [];
		}

		/** 컨테이너 + 로딩 오버레이 셀 생성 */
		_renderShell() {
			if (this.querySelector(".toast-container")) return;

			const container = document.createElement("div");
			container.className = "toast-container";
			container.setAttribute("role", "status");
			container.setAttribute("aria-live", "polite");
			container.style.cssText =
				"position:fixed;top:1rem;right:1rem;z-index:10000;display:flex;flex-direction:column;gap:.5rem;pointer-events:none;max-width:360px;";
			this.appendChild(container);

			const overlay = document.createElement("div");
			overlay.className = "loading-overlay";
			overlay.style.cssText =
				"position:fixed;inset:0;z-index:9999;background:rgba(255,255,255,.65);display:none;align-items:center;justify-content:center;";
			overlay.innerHTML =
				'<div style="display:flex;flex-direction:column;align-items:center;gap:.75rem;">' +
				'<div class="spinner" style="width:32px;height:32px;border:3px solid #e5e7eb;border-top-color:#3b82f6;border-radius:50%;animation:es-toast-spin .6s linear infinite;"></div>' +
				'<span style="font-size:14px;color:#374151;">로딩 중…</span></div>';

			const style = document.createElement("style");
			style.textContent = "@keyframes es-toast-spin{to{transform:rotate(360deg)}}";
			this.appendChild(style);
			this.appendChild(overlay);
		}

		/** 토스트 메시지 표시
		 * @param {string} message 표시할 메시지
		 * @param {object} [options]
		 * @param {"error"|"warning"|"success"|"info"} [options.type="info"] 토스트 타입
		 * @param {number} [options.duration=3000] 자동 사라짐(ms), 0이면 수동 닫기
		 * @param {{ label: string, onClick: () => void }} [options.action] 액션 버튼
		 */
		show(message, { type = "info", duration = 3000, action } = {}) {
			const container = this.querySelector(".toast-container");
			if (!container) return;

			const style = TYPE_STYLES[type] || TYPE_STYLES.info;
			const id = this._nextId++;

			const toast = document.createElement("div");
			toast.className = "toast-item";
			toast.style.cssText = `pointer-events:auto;display:flex;align-items:flex-start;gap:.5rem;padding:.75rem 1rem;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.12);font-size:14px;line-height:1.4;color:${style.fg};background:${style.bg};border:1px solid ${style.border};animation:es-toast-slide .2s ease-out;`;

			const icon = document.createElement("span");
			icon.style.cssText = "font-weight:700;font-size:16px;flex-shrink:0;";
			icon.textContent = style.icon;
			toast.appendChild(icon);

			const text = document.createElement("span");
			text.style.cssText = "flex:1;word-break:break-word;";
			text.textContent = message;
			toast.appendChild(text);

			if (action) {
				const btn = document.createElement("button");
				btn.style.cssText = `background:none;border:none;color:${style.fg};text-decoration:underline;cursor:pointer;font-size:14px;padding:0;margin-left:.5rem;white-space:nowrap;`;
				btn.textContent = action.label;
				btn.addEventListener("click", () => {
					action.onClick();
					this._removeToast(id);
				});
				toast.appendChild(btn);
			}

			const closeBtn = document.createElement("button");
			closeBtn.style.cssText =
				"background:none;border:none;font-size:16px;cursor:pointer;padding:0;margin-left:.25rem;color:inherit;opacity:.6;flex-shrink:0;";
			closeBtn.textContent = "×";
			closeBtn.setAttribute("aria-label", "닫기");
			closeBtn.addEventListener("click", () => this._removeToast(id));
			toast.appendChild(closeBtn);

			container.appendChild(toast);

			const timer = duration > 0 ? setTimeout(() => this._removeToast(id), duration) : null;
			this._toasts.push({ id, el: toast, timer });
		}

		/** 모든 토스트를 제거합니다. */
		hideAll() {
			this._toasts.forEach(t => {
				clearTimeout(t.timer);
				t.el.remove();
			});
			this._toasts = [];
		}

		/** 로딩 오버레이를 표시합니다. */
		showLoading() {
			const overlay = this.querySelector(".loading-overlay");
			if (overlay) overlay.style.display = "flex";
		}

		/** 로딩 오버레이를 숨깁니다. */
		hideLoading() {
			const overlay = this.querySelector(".loading-overlay");
			if (overlay) overlay.style.display = "none";
		}

		/**
		 * 토스트 항목을 제거하고 애니메이션 후 DOM에서 삭제합니다.
		 * @param {number} id 토스트 ID
		 */
		_removeToast(id) {
			const idx = this._toasts.findIndex(t => t.id === id);
			if (idx === -1) return;
			const [toast] = this._toasts.splice(idx, 1);
			clearTimeout(toast.timer);
			toast.el.style.animation = "es-toast-slide .15s ease-in reverse";
			setTimeout(() => toast.el.remove(), 150);
		}
	}

	customElements.define("es-toast", EsToast);
} // end HTMLElement guard

// ── 싱글톤 헬퍼 — 컴포넌트 없이 어디서든 호출 가능 ──
/**
 * 토스트 메시지를 표시합니다 (싱글톤 자동 사용).
 * @param {string} message
 * @param {{ type?: "error"|"warning"|"success"|"info", duration?: number, action?: { label: string, onClick: () => void } }} [options]
 */
export function showToast(message, options) {
	const el = singletonEl || document.querySelector("es-toast");
	if (el) el.show(message, options);
}

/** 모든 토스트를 숨깁니다. */
export function hideAllToasts() {
	const el = singletonEl || document.querySelector("es-toast");
	if (el) el.hideAll();
}

/** 로딩 오버레이를 표시합니다. */
export function showLoading() {
	const el = singletonEl || document.querySelector("es-toast");
	if (el) el.showLoading();
}

/** 로딩 오버레이를 숨깁니다. */
export function hideLoading() {
	const el = singletonEl || document.querySelector("es-toast");
	if (el) el.hideLoading();
}
