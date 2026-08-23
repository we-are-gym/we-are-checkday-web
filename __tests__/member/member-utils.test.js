// 파일 용도: member-utils 순수 함수 단위 테스트
import { describe, expect, it } from "bun:test";
import { displayGender, getMemberById, getMemberByName } from "../../ESM/member/member-utils.js";

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

describe("displayGender", () => {
	it("녀를 여로 변환 (데이터 남/녀 → 표기 남/여)", () => {
		expect(displayGender("녀")).toBe("여");
	});

	it("남은 그대로 유지", () => {
		expect(displayGender("남")).toBe("남");
	});

	it("빈 값은 빈 문자열 유지", () => {
		expect(displayGender("")).toBe("");
	});
});
