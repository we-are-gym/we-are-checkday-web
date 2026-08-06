// 파일 용도: Sparkline 웹 컴포넌트 — 인라인 SVG 스파크라인 차트 (전체 화면 공용)
import { defineComponent } from "@shared/components/base/component.js";
import { setAria } from "@shared/components/base/component.js";

defineComponent("ui-sparkline", {
	props: {
		data: { type: Array, default: [] }, // 숫자 배열
		width: { type: Number, default: 260 },
		height: { type: Number, default: 68 },
		color: { type: String, default: "var(--accent)" },
		background: { type: String, default: "transparent" },
		showArea: { type: Boolean, default: true },
		showPoints: { type: Boolean, default: true },
		pointRadius: { type: Number, default: 3 },
		lineWidth: { type: Number, default: 2 },
		padding: { type: Number, default: 4 },
		baseline: { type: Number, default: null }, // 기준선 값
		ariaLabel: { type: String, default: "" },
		ariaDescribedBy: { type: String, default: "" },
	},

	renderSparkline({ data, width, height, color, background, showArea, showPoints, pointRadius, lineWidth, padding, baseline, ariaLabel, ariaDescribedBy }) {
		if (!data || data.length === 0) {
			return `<div class="sparkline-empty" style="width: ${width}px; height: ${height}px;" aria-hidden="true">데이터 없음</div>`;
		}

		const validData = data.filter((v) => typeof v === "number" && !isNaN(v));
		if (validData.length === 0) {
			return `<div class="sparkline-empty" style="width: ${width}px; height: ${height}px;" aria-hidden="true">유효한 데이터 없음</div>`;
		}

		const min = Math.min(...validData);
		const max = Math.max(...validData);
		const range = max - min || 1; // 0으로 나누기 방지

		const stepX = (width - padding * 2) / (validData.length - 1 || 1);

		// 좌표 계산
		const points = validData.map((value, i) => {
			const x = padding + i * stepX;
			const y = height - padding - ((value - min) / range) * (height - padding * 2);
			return { x, y, value };
		});

		// 기준선
		const baselineY = baseline !== null && baseline >= min && baseline <= max
			? height - padding - ((baseline - min) / range) * (height - padding * 2)
			: null;

		// SVG 패스 생성
		const pathData = points
			.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
			.join(" ");

		// 영역 패스
		let areaPath = "";
		if (showArea) {
			areaPath = [
				`M ${points[0].x} ${height - padding}`,
				...points.map((p) => `L ${p.x} ${p.y}`),
				`L ${points[points.length - 1].x} ${height - padding}`,
				"Z",
			].join(" ");
		}

		// 포인트
		const pointElements = showPoints
			? points
				.map(
					(p) => `
				<circle
					cx="${p.x.toFixed(2)}"
					cy="${p.y.toFixed(2)}"
					r="${pointRadius}"
					fill="${color}"
					stroke="${background}"
					stroke-width="1"
					aria-hidden="true"
				/>`,
				)
				.join("")
			: "";

		const ariaAttrs = {};
		if (ariaLabel) ariaAttrs["label"] = ariaLabel;
		if (ariaDescribedBy) ariaAttrs["describedby"] = ariaDescribedBy;
		ariaAttrs["role"] = "img";
		ariaAttrs["aria-label"] = `스파크라인: ${validData.length}개 데이터, 최솟값 ${min.toFixed(1)}, 최댓값 ${max.toFixed(1)}`;

		let ariaStr = "";
		for (const [key, val] of Object.entries(ariaAttrs)) {
			ariaStr += ` aria-${key}="${val}"`;
		}

		return `
			<div class="sparkline-container" style="width: ${width}px; height: ${height}px;"${ariaStr}>
				<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" aria-hidden="true">
					${background !== "transparent" ? `<rect width="100%" height="100%" fill="${background}" />` : ""}
					${baselineY !== null ? `
						<line
							x1="${padding}" y1="${baselineY.toFixed(2)}"
							x2="${width - padding}" y2="${baselineY.toFixed(2)}"
							stroke="var(--border2)" stroke-width="1" stroke-dasharray="4,4"
							aria-hidden="true"
						/>` : ""}
					${showArea ? `<path d="${areaPath}" fill="${color}" fill-opacity="0.15" aria-hidden="true" />` : ""}
					<path
						d="${pathData}"
						stroke="${color}"
						stroke-width="${lineWidth}"
						fill="none"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					/>
					${pointElements}
				</svg>
			</div>`;
	},

	render() {
		return this.renderSparkline(this._getProps());
	},
});