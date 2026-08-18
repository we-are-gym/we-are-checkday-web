// 파일 용도: InbodyData 클래스 단위 테스트
import { describe, expect, it } from "bun:test";
import { InbodyData } from "../../ESM/gym/inbody-data.js";

describe("InbodyData", () => {
	describe("constructor", () => {
		it("인자 없이 생성 시 모든 필드가 빈 문자열", () => {
			const d = new InbodyData();
			expect(d.w).toBe("");
			expect(d.m).toBe("");
			expect(d.fat).toBe("");
			expect(d.bmi).toBe("");
			expect(d.bfp).toBe("");
			expect(d.bmr).toBe("");
			expect(d.vis).toBe("");
		});

		it("값을 전달하면 해당 필드에 반영", () => {
			const d = new InbodyData({ w: "70" });
			expect(d.w).toBe("70");
		});
	});

	describe("toObject", () => {
		it("7개 필드를 포함한 객체를 반환", () => {
			const d = new InbodyData({ w: "70", m: "35", fat: "12" });
			const obj = d.toObject();
			expect(Object.keys(obj)).toEqual(["w", "m", "fat", "bmi", "bfp", "bmr", "vis"]);
			expect(obj.w).toBe("70");
			expect(obj.m).toBe("35");
			expect(obj.fat).toBe("12");
		});
	});

	describe("isEmpty", () => {
		it("모든 필드가 빈 문자열이면 true", () => {
			expect(new InbodyData().isEmpty()).toBe(true);
		});

		it("하나라도 값이 있으면 false", () => {
			expect(new InbodyData({ w: "70" }).isEmpty()).toBe(false);
		});
	});
});
