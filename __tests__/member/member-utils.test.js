// 파일 용도: member-utils 순수 함수 단위 테스트
import { describe, expect, it } from "bun:test";
import { getMemberById, getMemberByName } from "../../ESM/member/member-utils.js";

const members = [
	{ id: "1", name: "홍길동" },
	{ id: "2", name: "이순신" },
];

describe("getMemberById", () => {
	it("ID에 해당하는 회원을 반환", () => {
		const m = getMemberById(members, "1");
		expect(m).toBeDefined();
		expect(m.name).toBe("홍길동");
	});

	it("존재하지 않는 ID는 undefined", () => {
		expect(getMemberById(members, "99")).toBeUndefined();
	});
});

describe("getMemberByName", () => {
	it("이름에 해당하는 회원을 반환", () => {
		const m = getMemberByName(members, "이순신");
		expect(m).toBeDefined();
		expect(m.id).toBe("2");
	});
});
