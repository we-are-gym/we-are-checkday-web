// 파일 용도: Button 웹 컴포넌트 — primary/ghost/danger 변형 지원 (전체 화면 공용)
import { defineComponent } from "@shared/components/base/component.js";

/** 버튼 마크업 생성 (순수 함수 — 컴포넌트 상태와 분리)
 * @param {{ variant: string, disabled: boolean, loading: boolean, type: string, ariaLabel: string }} props
 * @returns {string}
 */
const renderButton = ({ variant, disabled, loading, type, ariaLabel }) => {
	const classes = `btn btn-${variant}${disabled ? " disabled" : ""}${loading ? " loading" : ""}`;
	const ariaAttrs = {};
	if (ariaLabel) ariaAttrs["label"] = ariaLabel;
	if (disabled) ariaAttrs["disabled"] = "true";
	if (loading) ariaAttrs["busy"] = "true";

	let ariaStr = "";
	for (const [key, value] of Object.entries(ariaAttrs)) {
		ariaStr += ` aria-${key}="${value}"`;
	}

	return `
			<button type="${type}" class="${classes}"${ariaStr} ${disabled ? "disabled" : ""}>
				${loading ? '<span class="btn-spinner" aria-hidden="true"></span>' : ""}
				<span class="btn-text"><slot>버튼</slot></span>
			</button>`;
};

defineComponent({
	tag: "ui-button",
	props: {
		variant: { type: String, default: "primary" }, // primary | ghost | danger
		disabled: { type: Boolean, default: false },
		loading: { type: Boolean, default: false },
		type: { type: String, default: "button" }, // button | submit | reset
		ariaLabel: { type: String, default: "" },
	},

	render() {
		return renderButton(this._getProps());
	},

	onConnect() {
		this.addEventListener("click", (e) => {
			if (this._props.disabled || this._props.loading) {
				e.preventDefault();
				e.stopPropagation();
			}
			this.emit("click", { originalEvent: e });
		});
	},
});
