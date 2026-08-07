// 파일 용도: CardPanel 웹 컴포넌트 — 접이식 카드 패널 (전체 화면 공용)
import { defineComponent } from "@shared/components/base/component.js";

/** 카드 패널 마크업 생성 (순수 함수 — 컴포넌트 상태와 분리)
 * @param {{ header: string, subHeader: string, collapsible: boolean, expanded: boolean, footer: string, variant: string, ariaLabel: string, ariaDescribedBy: string }} props
 * @param {{ elementId: string, hasFooterSlot: boolean }} ctx 콘텐츠 id·footer 슬롯 유무 (컴포넌트 인스턴스 맥락)
 * @returns {string}
 */
const renderCardPanel = (
	{
		header,
		subHeader,
		collapsible,
		expanded,
		footer,
		variant,
		ariaLabel,
		ariaDescribedBy,
	},
	{ elementId, hasFooterSlot },
) => {
	const panelId = `card-${elementId || "auto"}`;
	const hasHeader = header || subHeader;
	const hasFooter = footer || hasFooterSlot;

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
};

defineComponent({
	tag: "ui-card-panel",
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

	render() {
		// footer 슬롯 존재 여부 확인
		this._hasFooterSlot = this.querySelector("[slot='footer']") !== null;
		return renderCardPanel(this._getProps(), {
			elementId: this.id,
			hasFooterSlot: this._hasFooterSlot,
		});
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