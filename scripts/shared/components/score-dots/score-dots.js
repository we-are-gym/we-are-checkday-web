// 파일 용도: ScoreDots 웹 컴포넌트 — 평가 점수 도트 표시 (전체 화면 공용)
import { defineComponent } from "@shared/components/base/component.js";

defineComponent("ui-score-dots", {
	props: {
		score: { type: Number, default: 0 },
		max: { type: Number, default: 3 },
		count: { type: Number, default: 4 }, // max + 1
		size: { type: String, default: "md" }, // sm | md | lg
		interactive: { type: Boolean, default: false }, // 클릭으로 점수 변경 가능
		ariaLabel: { type: String, default: "" },
		ariaDescribedBy: { type: String, default: "" },
		prefix: { type: String, default: "" }, // ID 접두사
	},

	renderScoreDots({
		score,
		max,
		count,
		size,
		interactive,
		ariaLabel,
		ariaDescribedBy,
		prefix,
	}) {
		const clampedScore = Math.max(0, Math.min(max, score));
		const dotsId = `dots-${prefix || this.id || "auto"}`;

		const ariaAttrs = {};
		if (ariaLabel) ariaAttrs["label"] = ariaLabel;
		if (ariaDescribedBy) ariaAttrs["describedby"] = ariaDescribedBy;
		ariaAttrs["role"] = "group";
		ariaAttrs["aria-label"] = `점수 ${clampedScore}점 / ${max}점`;

		let ariaStr = "";
		for (const [key, val] of Object.entries(ariaAttrs)) {
			ariaStr += ` aria-${key}="${val}"`;
		}

		const sizeClass = `dots-${size}`;

		return `
			<div class="score-dots ${sizeClass}${interactive ? " interactive" : ""}" id="${dotsId}"${ariaStr}>
				${Array.from(
					{ length: count },
					(_, i) => `
					<span
						class="dot${i < clampedScore ? " on" : ""}"
						id="dot-${prefix || this.id || "auto"}-${i}"
						data-score="${i}"
						${interactive ? `tabindex="0" role="button" aria-label="${i}점" aria-pressed="${i <= clampedScore}"` : "aria-hidden='true'"}
					></span>
				`,
				).join("")}
			</div>`;
	},

	render() {
		return this.renderScoreDots(this._getProps());
	},

	onConnect() {
		if (!this._props.interactive) return;

		this.addEventListener("click", (e) => {
			const dot = e.target.closest(".dot");
			if (!dot) return;
			const score = Number(dot.dataset.score);
			this.setProp("score", score);
			this.emit("change", { score, index: score });
		});

		this.addEventListener("keydown", (e) => {
			const dot = e.target.closest(".dot");
			if (!dot) return;
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				const score = Number(dot.dataset.score);
				this.setProp("score", score);
				this.emit("change", { score, index: score });
			} else if (e.key === "ArrowRight") {
				e.preventDefault();
				const next = dot.nextElementSibling;
				next?.focus();
			} else if (e.key === "ArrowLeft") {
				e.preventDefault();
				const prev = dot.previousElementSibling;
				prev?.focus();
			}
		});
	},
});
