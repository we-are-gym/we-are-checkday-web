// 파일 용도: Tag 웹 컴포넌트 — 선택 가능한 태그/칩 (전체 화면 공용)
import { defineComponent } from "@shared/components/base/component.js";
import { setAria, toggleClass, toggleAttr } from "@shared/components/base/component.js";

defineComponent("ui-tag", {
	props: {
		label: { type: String, default: "" },
		removable: { type: Boolean, default: false },
		pressed: { type: Boolean, default: false },
		variant: { type: String, default: "default" }, // default | goal | check | feedback
		disabled: { type: Boolean, default: false },
		ariaLabel: { type: String, default: "" },
	},

	renderTag({ label, removable, pressed, variant, disabled, ariaLabel }) {
		const classes = `tag tag-${variant}${pressed ? " on" : ""}${disabled ? " disabled" : ""}`;
		const ariaAttrs = {};
		ariaAttrs["pressed"] = String(pressed);
		if (ariaLabel) ariaAttrs["label"] = ariaLabel;
		if (disabled) ariaAttrs["disabled"] = "true";

		let ariaStr = "";
		for (const [key, value] of Object.entries(ariaAttrs)) {
			ariaStr += ` aria-${key}="${value}"`;
		}

		return `
			<button
				type="button"
				role="switch"
				class="${classes}"
				${ariaStr}
				${disabled ? "disabled" : ""}
				tabindex="${disabled ? -1 : 0}"
			>
				<span class="tag-label">${label}</span>
				${removable ? '<span class="tag-remove" aria-hidden="true">×</span>' : ""}
			</button>`;
	},

	render() {
		return this.renderTag(this._getProps());
	},

	onConnect() {
		this.addEventListener("click", (e) => {
			if (this._props.disabled) return;

			// 제거 버튼 클릭
			if (e.target.closest(".tag-remove")) {
				e.stopPropagation();
				this.emit("remove", { label: this._props.label });
				return;
			}

			// 토글
			this.setProp("pressed", !this._props.pressed);
			this.emit("toggle", { pressed: this._props.pressed, label: this._props.label });
		});

		// 키보드 접근성
		this.addEventListener("keydown", (e) => {
			if (this._props.disabled) return;
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				this.setProp("pressed", !this._props.pressed);
				this.emit("toggle", { pressed: this._props.pressed, label: this._props.label });
			}
		});
	},
});