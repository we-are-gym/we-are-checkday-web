// 파일 용도: Tabs 웹 컴포넌트 — 탭 리스트·패널 전환 (전체 화면 공용)
import { defineComponent } from "@shared/components/base/component.js";

/** 탭 리스트·패널 마크업 생성 (순수 함수 — 컴포넌트 상태와 분리)
 * @param {{ tabs: Array, activeIndex: number, orientation: string }} props
 * @param {{ elementId: string }} ctx 탭 id 접두어 (컴포넌트 인스턴스 맥락)
 * @returns {string}
 */
const renderTabs = ({ tabs, activeIndex, orientation }, { elementId }) => {
	const tablistId = `tabs-${elementId || "auto"}`;
	const tabBtns = tabs
		.map(
			(tab, i) => `
			<button
				role="tab"
				id="${tablistId}-tab-${i}"
				aria-controls="${tablistId}-panel-${i}"
				aria-selected="${i === activeIndex}"
				aria-disabled="${tab.disabled ? "true" : "false"}"
				tabindex="${i === activeIndex ? 0 : -1}"
				class="tab-btn${tab.disabled ? " disabled" : ""}"
				data-tab-index="${i}"
			>
				${tab.label}
			</button>`,
		)
		.join("");

	const panels = tabs
		.map(
			(tab, i) => `
			<div
				role="tabpanel"
				id="${tablistId}-panel-${i}"
				aria-labelledby="${tablistId}-tab-${i}"
				hidden="${i !== activeIndex}"
				class="tab-panel${i === activeIndex ? " active" : ""}"
			>
				${tab.panel || ""}
			</div>`,
		)
		.join("");

	return `
			<div class="tabs-container" data-orientation="${orientation}">
				<div role="tablist" id="${tablistId}" aria-orientation="${orientation}" class="tab-list">
					${tabBtns}
				</div>
				<div class="tab-panels">
					${panels}
				</div>
			</div>`;
};

defineComponent({
	tag: "ui-tabs",
	props: {
		tabs: { type: Array, default: [] }, // [{ label, panel, id }]
		activeIndex: { type: Number, default: 0 },
		orientation: { type: String, default: "horizontal" }, // horizontal | vertical
	},

	render() {
		return renderTabs(this._getProps(), { elementId: this.id });
	},

	onConnect() {
		this.addEventListener("click", (e) => {
			const btn = e.target.closest(".tab-btn");
			if (!btn || btn.disabled) return;
			const index = Number(btn.dataset.tabIndex);
			this.setProp("activeIndex", index);
			this.emit("change", {
				index,
				previousIndex: this._getProps().activeIndex,
			});
		});

		this.addEventListener("keydown", (e) => {
			const btn = e.target.closest(".tab-btn");
			if (!btn) return;
			const tabs = this.querySelectorAll(".tab-btn:not(.disabled)");
			const currentIndex = Array.from(tabs).indexOf(btn);
			let newIndex = currentIndex;

			if (this._props.orientation === "vertical") {
				if (e.key === "ArrowDown")
					newIndex = (currentIndex + 1) % tabs.length;
				else if (e.key === "ArrowUp")
					newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
			} else {
				if (e.key === "ArrowRight")
					newIndex = (currentIndex + 1) % tabs.length;
				else if (e.key === "ArrowLeft")
					newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
			}

			if (newIndex !== currentIndex) {
				e.preventDefault();
				tabs[newIndex].focus();
				this.setProp("activeIndex", newIndex);
				this.emit("change", {
					index: newIndex,
					previousIndex: currentIndex,
				});
			}
			if (e.key === "Home") {
				e.preventDefault();
				tabs[0].focus();
				this.setProp("activeIndex", 0);
			}
			if (e.key === "End") {
				e.preventDefault();
				tabs[tabs.length - 1].focus();
				this.setProp("activeIndex", tabs.length - 1);
			}
		});
	},
});
