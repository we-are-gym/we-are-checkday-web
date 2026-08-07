// 파일 용도: Checkbox 웹 컴포넌트 — 체크박스 (전체 화면 공용)
import { defineComponent } from "@shared/components/base/component.js";

defineComponent("ui-checkbox", {
	props: {
		checked: { type: Boolean, default: false },
		indeterminate: { type: Boolean, default: false },
		disabled: { type: Boolean, default: false },
		label: { type: String, default: "" },
		value: { type: String, default: "on" },
		name: { type: String, default: "" },
		ariaLabel: { type: String, default: "" },
		ariaDescribedBy: { type: String, default: "" },
	},

	renderCheckbox({
		checked,
		indeterminate,
		disabled,
		label,
		value,
		name,
		ariaLabel,
		ariaDescribedBy,
	}) {
		const ariaAttrs = {};
		if (ariaLabel) ariaAttrs["label"] = ariaLabel;
		if (ariaDescribedBy) ariaAttrs["describedby"] = ariaDescribedBy;
		ariaAttrs["checked"] = indeterminate ? "mixed" : String(checked);
		if (disabled) ariaAttrs["disabled"] = "true";

		let ariaStr = "";
		for (const [key, val] of Object.entries(ariaAttrs)) {
			ariaStr += ` aria-${key}="${val}"`;
		}

		const inputId = `checkbox-${this.id || "auto"}`;

		return `
			<label class="checkbox-wrapper${disabled ? " disabled" : ""}${indeterminate ? " indeterminate" : ""}">
				<input
					type="checkbox"
					id="${inputId}"
					class="checkbox-input"
					value="${value}"
					name="${name}"
					${checked ? "checked" : ""}
					${disabled ? "disabled" : ""}
					${indeterminate ? "aria-checked='mixed'" : ""}
					tabindex="${disabled ? -1 : 0}"
				>
				<span class="checkbox-box" aria-hidden="true">
					<svg class="checkbox-check" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M3 8 6 11 13 4" />
					</svg>
					<svg class="checkbox-indeterminate" viewBox="0 0 16 16" fill="currentColor">
						<rect x="3" y="7" width="10" height="2" />
					</svg>
				</span>
				${label ? `<span class="checkbox-label">${label}</span>` : ""}
			</label>`;
	},

	render() {
		return this.renderCheckbox(this._getProps());
	},

	onConnect() {
		const input = this.querySelector(".checkbox-input");
		if (!input) return;

		input.addEventListener("change", (e) => {
			this.setProp("checked", e.target.checked);
			this.setProp("indeterminate", false);
			this.emit("change", {
				checked: this._props.checked,
				value: this._props.value,
			});
		});

		// 라벨 클릭 시 포커스
		this.addEventListener("click", (e) => {
			if (
				e.target === this ||
				e.target.classList.contains("checkbox-label")
			) {
				input.focus();
			}
		});

		// 키보드: Space로 토글
		this.addEventListener("keydown", (e) => {
			if (e.key === " " && !this._props.disabled) {
				e.preventDefault();
				input.click();
			}
		});
	},

	attributeChangedCallback(name, oldVal, newVal) {
		if (
			name === "checked" ||
			name === "indeterminate" ||
			name === "disabled"
		) {
			this.refresh();
		}
	},
});
