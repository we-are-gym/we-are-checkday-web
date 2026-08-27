// 파일 용도: errors 계층 단위 테스트
import { AppError, AuthError, NetworkError, NotFoundError, ValidationError, toUserMessage } from "@infra/errors.js";
import { describe, expect, test } from "bun:test";

describe("errors", () => {
	test("AppError 기본", () => {
		const e = new AppError("oops", { code: "oops", status: 400 });
		expect(e.message).toBe("oops");
		expect(e.code).toBe("oops");
		expect(e.status).toBe(400);
		expect(e instanceof Error).toBe(true);
	});
	test("하위 클래스", () => {
		expect(new ValidationError("v").code).toBe("validation_error");
		expect(new AuthError("a").status).toBe(401);
		expect(new NotFoundError("n").status).toBe(404);
		expect(new NetworkError("net").code).toBe("network_error");
	});
	test("toUserMessage", () => {
		expect(toUserMessage(new AppError("msg"))).toBe("msg");
		expect(toUserMessage(new Error("e"))).toBe("e");
		expect(toUserMessage("raw")).toBe("raw");
	});
});
