// 파일 용도: ScoreController 웹 컴포넌트 — 평가 점수 조작 (전체 화면 공용)
import { defineComponent } from "@shared/components/base/component.js";

defineComponent({
	tag: "ui-score-controller",
	props: {
		score: { type: Number, default: 0 },
		max: { type: Number, default: 3 },
		min: { type: Number, default: 0 },
		dots: { type: Number, default: 4 }, // max + 1
		index: { type: Number, default: 0 },
		interactive: { type: Boolean, default: true },
		ariaLabel: { type: String, default: "" },
		ariaDescribedBy: { type: String, default: "" },
		showValue: { type: Boolean, default: true },
	},

	renderScoreController({
		score,
		max,
		min,
		dots,
		index,
		interactive,
		ariaLabel,
		ariaDescribedBy,
		showValue,
	}) {
		const clampedScore = Math.max(min, Math.min(max, score));
		const dataKey = `data-i`;

		const decreaseDisabled = clampedScore <= min;
		const increaseDisabled = clampedScore >= max;

		const ariaAttrs = {};
		if (ariaLabel) ariaAttrs["label"] = ariaLabel;
		if (ariaDescribedBy) ariaAttrs["describedby"] = ariaDescribedBy;

		let ariaStr = "";
		for (const [key, val] of Object.entries(ariaAttrs)) {
			ariaStr += ` aria-${key}="${val}"`;
		}

		return `
			<div class="score-controller${interactive ? "" : " readonly"}" data-index="${index}"${ariaStr}>
				<div class="score-controls">
					<button
						type="button"
						class="score-btn score-decrease"
						${dataKey}="${index}"
						data-delta="-1"
						aria-label="점수 감소"
						${!interactive || decreaseDisabled ? "disabled" : ""}
						tabindex="${interactive && !decreaseDisabled ? 0 : -1}"
					>
						−
					</button>
					${
						showValue
							? `
						<span class="score-value" aria-live="polite" id="sv-${index}">${clampedScore}</span>
					`
							: ""
					}
					<button
						type="button"
						class="score-btn score-increase"
						${dataKey}="${index}"
						data-delta="1"
						aria-label="점수 증가"
						${!interactive || increaseDisabled ? "disabled" : ""}
						tabindex="${interactive && !increaseDisabled ? 0 : -1}"
					>
						+
					</button>
				</div>
				<div class="score-dots" role="group" aria-label="점수 ${clampedScore}점">
					${Array.from(
						{ length: dots },
						(_, i) => `
						<span class="dot${i < clampedScore ? " on" : ""}" id="dot-${index}-${i}" data-score="${i}" aria-hidden="true"></span>
					`,
					).join("")}
				</div>
			</div>`;
	},

	render() {
		return this.renderScoreController(this._getProps());
	},

	onConnect() {
		if (!this._props.interactive) return;

		this.addEventListener("click", (e) => {
			const btn = e.target.closest(".score-btn");
			if (!btn) return;
			const delta = Number(btn.dataset.delta);
			this._adjustScore(delta);
		});

		// 키보드 지원
		this.addEventListener("keydown", (e) => {
			if (!this._props.interactive) return;
			if (e.key === "ArrowRight" || e.key === "ArrowUp") {
				e.preventDefault();
				this._adjustScore(1);
			} else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
				e.preventDefault();
				this._adjustScore(-1);
			}
		});
	},

	_adjustScore(delta) {
		const { score, min, max } = this._props;
		const newScore = Math.max(min, Math.min(max, score + delta));
		if (newScore !== score) {
			this.setProp("score", newScore);
			this.emit("adjust", {
				score: newScore,
				delta,
				index: this._props.index,
			});
		}
	},
});
