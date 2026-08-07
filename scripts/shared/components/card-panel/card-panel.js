// 파일 용도: CardPanel 웹 컴포넌트 — 접이식 카드 패널 (전체 화면 공용)
import { defineComponent } from "@shared/components/base/component.js";

defineComponent("ui-card-panel", {
	props: {
		header: { type: String, default: "" },
		subHeader: { type: String, default: "" },
		collapsible: { type: Boolean, default: false },
		expanded: { type: Boolean, default: true },
		footer: { type: String, default: "" },
		variant: { type: String, default: "default" }, // default | section | eval | feedback
		ariaLabel: { type: String, default: "" },
		ariaDescribedBy: { type: String, default: "" },
	},

	renderCardPanel({
		header,
		subHeader,
		collapsible,
		expanded,
		footer,
		variant,
		ariaLabel,
		ariaDescribedBy,
	}) {
		const panelId = `card-${this.id || "auto"}`;
		const hasHeader = header || subHeader;
		const hasFooter = footer || this._hasFooterSlot;

		const ariaAttrs = {};
		if (ariaLabel) ariaAttrs["label"] = ariaLabel;
		if (ariaDescribedBy) ariaAttrs["describedby"] = ariaDescribedBy;
		if (collapsible) ariaAttrs["expanded"] = String(expanded);

		let ariaStr = "";
		for (const [key, val] of Object.entries(ariaAttrs)) {
			ariaStr += ` aria-${key}="${val}"`;
		}

		return `
			<div class="card-panel card-${variant}${collapsible ? " collapsible" : ""}${expanded ? " expanded" : " collapsed"}"${ariaStr}>
				${
					hasHeader
						? `
					<header class="card-header">
						${header ? `<h3 class="card-title">${header}</h3>` : ""}
						${subHeader ? `<div class="card-subheader">${subHeader}</div>` : ""}
						${
							collapsible
								? `
							<button
								type="button"
								class="card-toggle"
								aria-expanded="${expanded}"
								aria-controls="${panelId}-content"
								data-action="toggle"
							>
								<span class="toggle-icon" aria-hidden="true">${expanded ? "▾" : "▸"}</span>
							</button>
						`
								: ""
						}
					</header>
				`
						: ""
				}
				<div class="card-content" id="${panelId}-content" role="region" hidden="${!expanded}">
					<slot></slot>
				</div>
				${
					hasFooter
						? `
					<footer class="card-footer">
						${footer}
						<slot name="footer"></slot>
					</footer>
				`
						: ""
				}
			</div>`;
	},

	render() {
		// footer 슬롯 존재 여부 확인
		this._hasFooterSlot = this.querySelector("[slot='footer']") !== null;
		return this.renderCardPanel(this._getProps());
	},

	onConnect() {
		this.addEventListener("click", (e) => {
			if (!this._props.collapsible) return;
			const toggleBtn = e.target.closest("[data-action='toggle']");
			if (toggleBtn) {
				this.setProp("expanded", !this._props.expanded);
				this.emit("toggle", { expanded: this._props.expanded });
			}
		});

		// 키보드: Enter/Space로 토글
		this.addEventListener("keydown", (e) => {
			if (!this._props.collapsible) return;
			if (e.key === "Enter" || e.key === " ") {
				const toggleBtn = e.target.closest("[data-action='toggle']");
				if (toggleBtn) {
					e.preventDefault();
					this.setProp("expanded", !this._props.expanded);
					this.emit("toggle", { expanded: this._props.expanded });
				}
			}
		});
	},
});
