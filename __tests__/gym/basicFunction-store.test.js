// 파일 용도: createScoreState 단위 테스트
import { describe, expect, it } from "bun:test";
import { createScoreState } from "../../ESM/gym/basicFunction-store.js";

describe("createScoreState", () => {
	let state;

	it("init: getItems/getMax/getTotal 초기값 확인", () => {
		state = createScoreState();
		state.init([{ name: "A" }], 3);
		expect(state.getItems()).toHaveLength(1);
		expect(state.getMax()).toBe(3);
		expect(state.getTotal()).toBe(0);
	});

	it("set/get: 점수 설정 및 조회", () => {
		state.set(0, 2);
		expect(state.get(0)).toBe(2);
	});

	it("set 클램프: 5를 넣으면 3으로 제한", () => {
		state.set(0, 5);
		expect(state.get(0)).toBe(3);
	});

	it("reset: 모든 점수를 0으로 초기화", () => {
		state.reset();
		expect(state.get(0)).toBe(0);
		expect(state.getTotal()).toBe(0);
	});
});
