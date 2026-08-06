// 파일 용도: DataTable 웹 컴포넌트 — 정렬·선택 가능한 데이터 테이블 (전체 화면 공용)
import { defineComponent } from "@shared/components/base/component.js";
import { setAria } from "@shared/components/base/component.js";

defineComponent("ui-data-table", {
	props: {
		columns: { type: Array, default: [] }, // [{ key, label, sortable, render, width, align }]
		rows: { type: Array, default: [] }, // 데이터 객체 배열
		selectable: { type: Boolean, default: false },
		sortable: { type: Boolean, default: false },
		selectionKey: { type: String, default: "id" }, // 행 식별 키
		selectedRows: { type: Array, default: [] }, // 선택된 행 키 배열
		striped: { type: Boolean, default: true },
		hoverable: { type: Boolean, default: true },
		emptyMessage: { type: String, default: "데이터가 없습니다" },
		ariaLabel: { type: String, default: "" },
		ariaDescribedBy: { type: String, default: "" },
	},

	renderDataTable({ columns, rows, selectable, sortable, selectionKey, selectedRows, striped, hoverable, emptyMessage, ariaLabel, ariaDescribedBy }) {
		const tableId = `table-${this.id || "auto"}`;

		const ariaAttrs = {};
		if (ariaLabel) ariaAttrs["label"] = ariaLabel;
		if (ariaDescribedBy) ariaAttrs["describedby"] = ariaDescribedBy;

		let ariaStr = "";
		for (const [key, val] of Object.entries(ariaAttrs)) {
			ariaStr += ` aria-${key}="${val}"`;
		}

		// 헤더
		const headerRow = columns
			.map((col) => {
				const sortAttr = sortable && col.sortable
					? ` data-sort="${col.key}" aria-sort="none" tabindex="0" role="columnheader"`
					: ' role="columnheader"';
				const widthStyle = col.width ? ` style="width: ${col.width};"` : "";
				const alignClass = col.align ? ` align-${col.align}` : "";
				return `<th${sortAttr}${widthStyle} class="${alignClass}">${col.label}</th>`;
			})
			.join("");

		// 선택 컬럼 헤더
		const selectHeader = selectable ? '<th role="columnheader" style="width: 40px;"><input type="checkbox" class="select-all" aria-label="전체 선택"></th>' : "";

		// 바디
		let bodyRows;
		if (rows.length === 0) {
			const colSpan = columns.length + (selectable ? 1 : 0);
			bodyRows = `<tr class="empty-row"><td colspan="${colSpan}" class="empty-cell">${emptyMessage}</td></tr>`;
		} else {
			bodyRows = rows
				.map((row, rowIndex) => {
					const rowKey = row[selectionKey];
					const isSelected = selectedRows.includes(rowKey);
					const rowClass = `data-row${isSelected ? " selected" : ""}${hoverable ? " hoverable" : ""}`;

					const selectCell = selectable
						? `<td><input type="checkbox" class="row-select" value="${rowKey}" ${isSelected ? "checked" : ""} aria-label="${rowKey} 선택"></td>`
						: "";

					const cells = columns
						.map((col) => {
							const cellValue = col.render ? col.render(row[col.key], row, rowIndex) : row[col.key];
							const alignClass = col.align ? ` align-${col.align}` : "";
							return `<td class="${alignClass}" data-key="${col.key}">${cellValue ?? ""}</td>`;
						})
						.join("");

					return `<tr class="${rowClass}" data-row-key="${rowKey}" tabindex="0" role="row" aria-selected="${isSelected}">${selectCell}${cells}</tr>`;
				})
				.join("");
		}

		return `
			<div class="data-table-wrapper${striped ? " striped" : ""}"${ariaStr}>
				<table class="data-table" role="grid" aria-label="${ariaLabel || "데이터 테이블"}">
					<thead>
						<tr>${selectHeader}${headerRow}</tr>
					</thead>
					<tbody>
						${bodyRows}
					</tbody>
				</table>
			</div>`;
	},

	render() {
		return this.renderDataTable(this._getProps());
	},

	onConnect() {
		// 정렬 헤더 클릭
		if (this._props.sortable) {
			this.addEventListener("click", (e) => {
				const th = e.target.closest("th[data-sort]");
				if (th) {
					const key = th.dataset.sort;
					this._handleSort(key);
				}
			});

			this.addEventListener("keydown", (e) => {
				const th = e.target.closest("th[data-sort]");
				if (th && (e.key === "Enter" || e.key === " ")) {
					e.preventDefault();
					this._handleSort(th.dataset.sort);
				}
			});
		}

		// 행 선택
		if (this._props.selectable) {
			this.addEventListener("change", (e) => {
				if (e.target.classList.contains("select-all")) {
					this._toggleSelectAll(e.target.checked);
				} else if (e.target.classList.contains("row-select")) {
					this._toggleRowSelect(e.target.value, e.target.checked);
				}
			});

			// 행 클릭으로 선택 (체크박스 제외)
			this.addEventListener("click", (e) => {
				if (e.target.closest("input")) return;
				const row = e.target.closest("tr[data-row-key]");
				if (row) {
					const key = row.dataset.rowKey;
					const newSelected = this._props.selectedRows.includes(key)
						? this._props.selectedRows.filter((k) => k !== key)
						: [...this._props.selectedRows, key];
					this.setProp("selectedRows", newSelected);
					this.emit("rowSelect", { key, selected: newSelected.includes(key) });
				}
			});

			// 키보드: Space로 행 선택 토글
			this.addEventListener("keydown", (e) => {
				if (e.key === " " && e.target.closest("tr[data-row-key]")) {
					e.preventDefault();
					const row = e.target.closest("tr[data-row-key]");
					const key = row.dataset.rowKey;
					const newSelected = this._props.selectedRows.includes(key)
						? this._props.selectedRows.filter((k) => k !== key)
						: [...this._props.selectedRows, key];
					this.setProp("selectedRows", newSelected);
					this.emit("rowSelect", { key, selected: newSelected.includes(key) });
				}
			});
		}

		// 행 액션 버튼
		this.addEventListener("click", (e) => {
			const actionBtn = e.target.closest("[data-row-action]");
			if (actionBtn) {
				const row = actionBtn.closest("tr[data-row-key]");
				if (row) {
					this.emit("rowAction", {
						key: row.dataset.rowKey,
						action: actionBtn.dataset.rowAction,
						originalEvent: e,
					});
				}
			}
		});
	},

	_handleSort(key) {
		const column = this._props.columns.find((c) => c.key === key);
		if (!column || !column.sortable) return;

		const currentSort = this._sortState?.[key] || "none";
		let newSort = "none";
		if (currentSort === "none" || currentSort === "desc") newSort = "asc";
		else if (currentSort === "asc") newSort = "desc";

		this._sortState = { ...this._sortState, [key]: newSort };
		this.emit("sort", { key, direction: newSort });
		this.refresh();
	},

	_toggleSelectAll(checked) {
		const keys = this._props.rows.map((r) => r[this._props.selectionKey]);
		const newSelected = checked ? keys : [];
		this.setProp("selectedRows", newSelected);
		this.emit("selectAll", { selected: newSelected });
	},

	_toggleRowSelect(key, checked) {
		const newSelected = checked
			? [...this._props.selectedRows, key]
			: this._props.selectedRows.filter((k) => k !== key);
		this.setProp("selectedRows", newSelected);
		this.emit("rowSelect", { key, selected: checked });
	},
});