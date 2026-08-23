// 파일 용도: TextBox 웹 컴포넌트 — 텍스트 입력/텍스트에어리어 (전체 화면 공용)
import { defineComponent } from "@shared/components/base/component.js";

/** 텍스트박스 마크업 생성 (순수 함수 — 컴포넌트 상태와 분리)
 * @param {{ value: string, placeholder: string, multiline: boolean, rows: number, cols: number, maxLength: number, minLength: number, disabled: boolean, readonly: boolean, required: boolean, spellcheck: boolean, autocomplete: string, ariaLabel: string, ariaDescribedBy: string, ariaInvalid: boolean, label: string, hint: string, error: string, autoResize: boolean }} props
 * @param {{ elementId: string }} ctx 입력 id 접두어 (컴포넌트 인스턴스 맥락)
 * @returns {string}
 */
const renderTextBox = (
	{
		value,
		placeholder,
		multiline,
		rows,
		cols,
		maxLength,
		minLength,
		disabled,
		readonly,
		required,
		spellcheck,
		autocomplete,
		ariaLabel,
		ariaDescribedBy,
		ariaInvalid,
		label,
		hint,
		error,
		autoResize,
	},
	{ elementId },
) => {
	const inputId = `textbox-${elementId || "auto"}`;
	const hintId = hint ? `${inputId}-hint` : "";
	const errorId = error ? `${inputId}-error` : "";

		const ariaAttrs = {};
		if (ariaLabel) ariaAttrs["label"] = ariaLabel;
		if (ariaDescribedBy)
			ariaAttrs["describedby"] =
				`${hintId} ${errorId} ${ariaDescribedBy}`.trim();
		if (ariaInvalid) ariaAttrs["invalid"] = "true";
		if (required) ariaAttrs["required"] = "true";
		if (readonly) ariaAttrs["readonly"] = "true";
		if (disabled) ariaAttrs["disabled"] = "true";

		let ariaStr = "";
		for (const [key, val] of Object.entries(ariaAttrs)) {
			ariaStr += ` aria-${key}="${val}"`;
		}

		const maxLenAttr = maxLength > 0 ? ` maxlength="${maxLength}"` : "";
		const minLenAttr = minLength > 0 ? ` minlength="${minLength}"` : "";
		const rowsAttr = multiline ? ` rows="${rows}"` : "";
		const colsAttr = multiline ? ` cols="${cols}"` : "";

		if (multiline) {
			return `
				<div class="text-box-wrapper${disabled ? " disabled" : ""}${readonly ? " readonly" : ""}${error ? " has-error" : ""}">
					${label ? `<label for="${inputId}" class="text-box-label">${label}${required ? ' <span class="required" aria-hidden="true">*</span>' : ""}</label>` : ""}
					<textarea
						id="${inputId}"
						class="text-box text-area"
						placeholder="${placeholder}"
						value="${value}"
						${rowsAttr}
						${colsAttr}
						${maxLenAttr}
						${minLenAttr}
						${disabled ? "disabled" : ""}
						${readonly ? "readonly" : ""}
						${required ? "required" : ""}
						spellcheck="${spellcheck}"
						autocomplete="${autocomplete}"
						${ariaStr}
					></textarea>
					${hint ? `<div class="text-box-hint" id="${hintId}">${hint}</div>` : ""}
					${error ? `<div class="text-box-error" id="${errorId}" role="alert">${error}</div>` : ""}
					${maxLength > 0 ? `<div class="text-box-counter" aria-hidden="true"><span class="current">${value.length}</span> / ${maxLength}</div>` : ""}
				</div>`;
		} else {
			return `
				<div class="text-box-wrapper${disabled ? " disabled" : ""}${readonly ? " readonly" : ""}${error ? " has-error" : ""}">
					${label ? `<label for="${inputId}" class="text-box-label">${label}${required ? ' <span class="required" aria-hidden="true">*</span>' : ""}</label>` : ""}
					<input
						id="${inputId}"
						type="text"
						class="text-box text-input"
						placeholder="${placeholder}"
						value="${value}"
						${maxLenAttr}
						${minLenAttr}
						${disabled ? "disabled" : ""}
						${readonly ? "readonly" : ""}
						${required ? "required" : ""}
						spellcheck="${spellcheck}"
						autocomplete="${autocomplete}"
						${ariaStr}
					>
					${hint ? `<div class="text-box-hint" id="${hintId}">${hint}</div>` : ""}
					${error ? `<div class="text-box-error" id="${errorId}" role="alert">${error}</div>` : ""}
					${maxLength > 0 ? `<div class="text-box-counter" aria-hidden="true"><span class="current">${value.length}</span> / ${maxLength}</div>` : ""}
				</div>`;
		}
};

defineComponent({
	tag: "ui-text-box",
	props: {
		value: { type: String, default: "" },
		placeholder: { type: String, default: "" },
		multiline: { type: Boolean, default: false },
		rows: { type: Number, default: 4 },
		cols: { type: Number, default: 50 },
		maxLength: { type: Number, default: 0 }, // 0 = 제한 없음
		minLength: { type: Number, default: 0 },
		disabled: { type: Boolean, default: false },
		readonly: { type: Boolean, default: false },
		required: { type: Boolean, default: false },
		spellcheck: { type: Boolean, default: false },
		autocomplete: { type: String, default: "off" },
		ariaLabel: { type: String, default: "" },
		ariaDescribedBy: { type: String, default: "" },
		ariaInvalid: { type: Boolean, default: false },
		label: { type: String, default: "" },
		hint: { type: String, default: "" },
		error: { type: String, default: "" },
		autoResize: { type: Boolean, default: false }, // 텍스트에어리어 자동 높이
	},

	render() {
		return renderTextBox(this._getProps(), { elementId: this.id });
	},

	onConnect() {
		const input = this.querySelector(".text-box");
		if (!input) return;

		input.addEventListener("input", (e) => {
			this.setProp("value", e.target.value);
			this.emit("input", { value: this._props.value, originalEvent: e });
		});

		input.addEventListener("change", (e) => {
			this.emit("change", { value: this._props.value, originalEvent: e });
		});

		input.addEventListener("blur", (e) => {
			this.emit("blur", { value: this._props.value, originalEvent: e });
		});

		input.addEventListener("focus", (e) => {
			this.emit("focus", { value: this._props.value, originalEvent: e });
		});

		// 자동 높이 조정 (textarea)
		if (this._props.multiline && this._props.autoResize) {
			const resize = () => {
				input.style.height = "auto";
				input.style.height = `${input.scrollHeight}px`;
			};
			input.addEventListener("input", resize);
			setTimeout(resize, 0);
		}

		// 최대 길이 카운터 업데이트
		if (this._props.maxLength > 0) {
			const counter = this.querySelector(".text-box-counter .current");
			if (counter) {
				const updateCounter = () => {
					counter.textContent = this._props.value.length;
				};
				input.addEventListener("input", updateCounter);
			}
		}
	},
});
