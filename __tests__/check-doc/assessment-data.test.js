// 파일 용도: assessment-data 5/8 분기 회귀 테스트 — 항목 수 기반 분기 검증
import { describe, expect, it } from "bun:test";

import {
	ASSESSMENT_ITEMS,
	ASSESSMENT_ITEMS_BASIC5,
	ASSESSMENT_ITEMS_FULL,
	itemsForRecord,
	resolveRecordItems,
} from "../../ESM/check-doc/assessment-data.js";

describe("assessment-data 5/8 분기", () => {
	it("BASIC5는 5항목(바닥짚기 등)만 포함한다", () => {
		expect(ASSESSMENT_ITEMS_BASIC5.length).toBe(5);
		expect(ASSESSMENT_ITEMS_BASIC5.map(it => it.name)).toEqual([
			"Lumbar ROM (바닥짚기)",
			"Wall Angel Test",
			"Over Head Squat",
			"Single Balance Test",
			"VO₂ Max (스텝 테스트)",
		]);
	});

	it("FULL은 8항목이다", () => {
		expect(ASSESSMENT_ITEMS_FULL.length).toBe(8);
		expect(ASSESSMENT_ITEMS.length).toBe(7);
	});

	it("itemsForRecord(5) → BASIC5, 8 → FULL, 그 외 → FULL", () => {
		expect(itemsForRecord(5)).toBe(ASSESSMENT_ITEMS_BASIC5);
		expect(itemsForRecord(8)).toBe(ASSESSMENT_ITEMS_FULL);
		expect(itemsForRecord(0)).toBe(ASSESSMENT_ITEMS_FULL);
		expect(itemsForRecord(undefined)).toBe(ASSESSMENT_ITEMS_FULL);
	});

	it("resolveRecordItems는 payload.items가 있으면 이름으로 재구성한다", () => {
		const payload = {
			items: ["Lumbar ROM (바닥짚기)", "Wall Angel Test"],
			scores: [2, 1],
		};
		const items = resolveRecordItems(payload);
		expect(items.length).toBe(2);
		expect(items[0].name).toBe("Lumbar ROM (바닥짚기)");
		expect(items[1].name).toBe("Wall Angel Test");
	});

	it("resolveRecordItems는 items가 없으면 scores 길이로 폴백한다", () => {
		expect(resolveRecordItems({ scores: [1, 2, 3, 2, 1] }).length).toBe(5);
		expect(resolveRecordItems({ scores: [1, 2, 3, 2, 1, 2, 3, 2] }).length).toBe(8);
	});
});
