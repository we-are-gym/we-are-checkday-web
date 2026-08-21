// 파일 용도: 인증 상태 구독·통지 메커니즘 단위 테스트 — DOM 비의존 코어(리스너 집합) 검증
import { describe, expect, it } from "bun:test";
import { notifyAuthChange, subscribeAuthState } from "../../ESM/infra/auth.js";

describe("subscribeAuthState", () => {
	it("통지 시 등록된 리스너가 호출된다", () => {
		let callCount = 0;
		const unsub = subscribeAuthState(() => {
			callCount++;
		});
		notifyAuthChange();
		expect(callCount).toBe(1);
		unsub();
	});

	it("구독 해제 후에는 통지되지 않는다", () => {
		let callCount = 0;
		const unsub = subscribeAuthState(() => {
			callCount++;
		});
		unsub();
		notifyAuthChange();
		expect(callCount).toBe(0);
	});

	it("여러 구독자 모두 통지받는다", () => {
		let a = 0;
		let b = 0;
		subscribeAuthState(() => {
			a++;
		});
		subscribeAuthState(() => {
			b++;
		});
		notifyAuthChange();
		expect(a).toBe(1);
		expect(b).toBe(1);
	});
});
