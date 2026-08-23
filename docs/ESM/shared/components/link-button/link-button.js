// 파일 용도: LinkButton 웹 컴포넌트 — 링크 스타일 버튼 (전체 화면 공용)
import { defineComponent } from "@shared/components/base/component.js";

/** 링크 버튼 마크업 생성 (순수 함수 — 컴포넌트 상태와 분리)
 * @param {{ href: string, variant: string, disabled: boolean, ariaLabel: string, target: string, rel: string }} props
 * @returns {string}
 */
const renderLinkButton = ({ href, variant, disabled, ariaLabel, target, rel }) => {
	const classes = `btn btn-${variant} link-btn${disabled ? " disabled" : ""}`;
	const ariaAttrs = {};
	if (ariaLabel) ariaAttrs["label"] = ariaLabel;
	if (disabled) ariaAttrs["disabled"] = "true";

	let ariaStr = "";
	for (const [key, value] of Object.entries(ariaAttrs)) {
		ariaStr += ` aria-${key}="${value}"`;
	}

	const targetAttr = target ? ` target="${target}"` : "";
	const relAttr = rel ? ` rel="${rel}"` : "";
	const hrefAttr = disabled ? "" : ` href="${href}"`;

	return `
			<a class="${classes}"${hrefAttr}${targetAttr}${relAttr}${ariaStr} role="button" tabindex="${disabled ? -1 : 0}">
				<span class="btn-text"><slot>링크 버튼</slot></span>
			</a>`;
};

defineComponent({
	tag: "ui-link-button",
	props: {
		href: { type: String, default: "#" },
		variant: { type: String, default: "primary" }, // primary | ghost
		disabled: { type: Boolean, default: false },
		ariaLabel: { type: String, default: "" },
		target: { type: String, default: "" }, // _blank 등
		rel: { type: String, default: "" },
	},

	render() {
		return renderLinkButton(this._getProps());
	},

	onConnect() {
		this.addEventListener("click", (e) => {
			if (this._props.disabled) {
				e.preventDefault();
				e.stopPropagation();
			}
			this.emit("click", { originalEvent: e });
		});
		// 키보드 접근성: Enter/Space로 링크 이동
		this.addEventListener("keydown", (e) => {
			if (this._props.disabled) return;
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				if (
					!this._props.disabled &&
					this._props.href &&
					this._props.href !== "#"
				) {
					window.location.href = this._props.href;
				}
			}
		});
	},
});
