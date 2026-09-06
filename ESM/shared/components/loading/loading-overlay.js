// 파일 용도: 로딩 오버레이 웹 컴포넌트 — 전 화면 공용 로딩 표시 (참조카운터 포함)
// 기법: 라이트 DOM 웹컴포넌트 — HTML 마크업이 없어도 첫 사용 시점에 자동 부착되어 동작
// 사용: showLoading()/hideLoading() — 동시 로딩(memberStore+recordStore) 시
//       참조카운터가 0이 된 시점에만 오버레이를 숨긴다.

let singletonEl = null;

/** 로딩 오버레이 참조카운터 — show마다 증가, hide마다 감소, 0에서만 실제 숨김 */
let loadingCount = 0;

// 테스트 환경(Bun/jsdom)에서는 HTMLElement가 정의되지 않으므로 가드
if (typeof HTMLElement !== "undefined") {
	/**
	 * <es-loading-overlay> 라이트 DOM 웹 컴포넌트.
	 *
	 * 호출:
	 * - `el.show()` — 오버레이 표시
	 * - `el.hide()` — 오버레이 숨김
	 */
	class LoadingOverlay extends HTMLElement {
		connectedCallback() {
			singletonEl = this;
			this._renderShell();
		}

		disconnectedCallback() {
			if (singletonEl === this) singletonEl = null;
		}

		/** 오버레이 + 스피너 셸 생성 (1회) */
		_renderShell() {
			if (this.querySelector(".loading-overlay")) return;

			const overlay = document.createElement("div");
			overlay.className = "loading-overlay";
			overlay.setAttribute("role", "status");
			overlay.setAttribute("aria-live", "polite");
			overlay.style.cssText =
				"position:fixed;inset:0;z-index:9999;background:rgba(255,255,255,.65);display:none;align-items:center;justify-content:center;";
			overlay.innerHTML =
				'<div style="display:flex;flex-direction:column;align-items:center;gap:.75rem;">' +
				'<div class="spinner" style="width:32px;height:32px;border:3px solid #e5e7eb;border-top-color:#3b82f6;border-radius:50%;animation:es-loading-spin .6s linear infinite;"></div>' +
				'<span style="font-size:14px;color:#374151;">로딩 중…</span></div>';

			const style = document.createElement("style");
			style.textContent = "@keyframes es-loading-spin{to{transform:rotate(360deg)}}";
			this.appendChild(style);
			this.appendChild(overlay);
		}

		/** 오버레이를 표시합니다. */
		show() {
			const overlay = this.querySelector(".loading-overlay");
			if (overlay) overlay.style.display = "flex";
		}

		/** 오버레이를 숨깁니다. */
		hide() {
			const overlay = this.querySelector(".loading-overlay");
			if (overlay) overlay.style.display = "none";
		}
	}

	customElements.define("es-loading-overlay", LoadingOverlay);
} // end HTMLElement guard

/**
 * 로딩 오버레이 루트(<es-loading-overlay>)를 body에 보장한다.
 * 첫 사용 시점에 엘리먼트가 없으면 생성·부착한다. 비-DOM 환경(bun 테스트 등)이거나
 * 컴포넌트가 아직 정의되지 않았으면 null을 반환한다.
 * @returns {LoadingOverlay | null} 로딩 오버레이 엘리먼트 (사용 불가 환경이면 null)
 */
function ensureLoadingOverlay() {
	if (typeof document === "undefined" || typeof customElements === "undefined") return null;
	if (!customElements.get("es-loading-overlay") || !document.body) return null;
	let el = document.querySelector("es-loading-overlay");
	if (!el) {
		el = document.createElement("es-loading-overlay");
		document.body.appendChild(el);
	}
	return el;
}

/** 로딩 오버레이를 표시합니다. (호출마다 참조카운터 증가)
 * @returns {void}
 */
export function showLoading() {
	const el = ensureLoadingOverlay();
	if (!el) return;
	loadingCount++;
	el.show();
}

/** 로딩 오버레이를 숨깁니다. (참조카운터가 0이 된 시점에만 실제로 숨김)
 * @returns {void}
 */
export function hideLoading() {
	const el = singletonEl || (typeof document !== "undefined" ? document.querySelector("es-loading-overlay") : null);
	if (!el) return;
	loadingCount = Math.max(0, loadingCount - 1);
	if (loadingCount === 0) el.hide();
}
