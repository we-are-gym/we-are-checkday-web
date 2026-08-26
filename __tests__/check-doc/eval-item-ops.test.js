// 파일 용도: eval-item-ops 순수 연산 회귀 테스트 — 편집 화면 3증상 재현
import { describe, expect, it } from "bun:test";

import { ASSESSMENT_ITEMS_FULL } from "../../ESM/check-doc/assessment-data.js";
import { availableCandidates, nextAfterAdd, nextAfterRemove } from "../../ESM/check-doc/eval-item-ops.js";

describe("eval-item-ops", () => {
	it("후보 계산은 live 항목을 기준으로 한다 — stale 원본이 아닌 현재 목록", () => {
		const used = ASSESSMENT_ITEMS_FULL.slice(0, 5);
		const candidates = availableCandidates(ASSESSMENT_ITEMS_FULL, used);
		expect(candidates.length).toBe(ASSESSMENT_ITEMS_FULL.length - 5);
		// stale 5개를 유지한 채 추가했어도 live 6개 기준이면 후보는 2개
		const afterOneAdd = nextAfterAdd(used, candidates[0]);
		const candidates2 = availableCandidates(ASSESSMENT_ITEMS_FULL, afterOneAdd);
		expect(candidates2.length).toBe(ASSESSMENT_ITEMS_FULL.length - 6);
	});

	it("추가 2회 연속 시 6번째 자리가 교체되지 않고 6개가 된다", () => {
		const base = ASSESSMENT_ITEMS_FULL.slice(0, 4);
		const c1 = availableCandidates(ASSESSMENT_ITEMS_FULL, base);
		const after1 = nextAfterAdd(base, c1[0]);
		expect(after1.length).toBe(5);
		const c2 = availableCandidates(ASSESSMENT_ITEMS_FULL, after1);
		const after2 = nextAfterAdd(after1, c2[0]);
		expect(after2.length).toBe(6);
		// 기존 버그는 stale base(4개)에서 매번 [...base, picked]로 5개 유지·교체였음
		expect(after2[4].name).not.toBe(after2[5].name);
	});

	it("4번째 항목 삭제 시 해당 인덱스만 제거된다", () => {
		const items = ASSESSMENT_ITEMS_FULL.slice(0, 5);
		const removed = nextAfterRemove(items, 3);
		expect(removed.length).toBe(4);
		expect(removed[3].name).toBe(items[4].name);
		expect(removed.find(item => item.name === items[3].name)).toBeUndefined();
	});

	it("삭제 후 추가 시 stale 길이가 아닌 live 길이 기준으로 5개가 된다", () => {
		const base5 = ASSESSMENT_ITEMS_FULL.slice(0, 5);
		const afterRemove = nextAfterRemove(base5, 1); // 4개
		expect(afterRemove.length).toBe(4);
		const cand = availableCandidates(ASSESSMENT_ITEMS_FULL, afterRemove);
		const afterAdd = nextAfterAdd(afterRemove, cand[0]);
		// stale 5개 기준이면 6개가 되나, live 4개 기준이면 5개
		expect(afterAdd.length).toBe(5);
	});
});
