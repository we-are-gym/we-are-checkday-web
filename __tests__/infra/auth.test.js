// 파일 용도: 인증 상태 구독·통지 + localStorage 영속 메커니즘 단위 테스트 — DOM 비의존 코어(리스너 집합) 검증
import { describe, expect, it } from "bun:test";
import { clearTokensRaw, getAuthToken, getRefreshToken, migrateFromSessionStorage, setAuthToken, setRefreshToken } from "../../ESM/infra/token-storage.js";
import { AUTH_KEY, REFRESH_KEY } from "../../ESM/infra/constants.js";
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

describe("token-storage", () => {
	const memStorage = () => {
		const map = new Map();
		return {
			getItem: key => (map.has(key) ? map.get(key) : null),
			setItem: (key, value) => map.set(key, String(value)),
			removeItem: key => map.delete(key),
			_map: map,
		};
	};

	it("setAuthToken/getAuthToken → 메모리 저장소에 영속", () => {
		const store = memStorage();
		globalThis.localStorage = store;
		setAuthToken("access-123");
		setRefreshToken("refresh-456");
		expect(getAuthToken()).toBe("access-123");
		expect(getRefreshToken()).toBe("refresh-456");
		delete globalThis.localStorage;
	});

	it("clearTokensRaw → 토큰 쌍 삭제", () => {
		const store = memStorage();
		globalThis.localStorage = store;
		setAuthToken("a");
		setRefreshToken("r");
		clearTokensRaw();
		expect(getAuthToken()).toBeNull();
		expect(getRefreshToken()).toBeNull();
		delete globalThis.localStorage;
	});
	it("migrateFromSessionStorage → sessionStorage 토큰을 localStorage로 이관", () => {
		const session = memStorage();
		const local = memStorage();
		globalThis.window = { get sessionStorage() { return session; }, get localStorage() { return local; } };
		session.setItem(AUTH_KEY, "old-access");
		session.setItem(REFRESH_KEY, "old-refresh");
		migrateFromSessionStorage();
		expect(local.getItem(AUTH_KEY)).toBe("old-access");
		expect(local.getItem(REFRESH_KEY)).toBe("old-refresh");
		expect(session.getItem(AUTH_KEY)).toBeNull();
		expect(session.getItem(REFRESH_KEY)).toBeNull();
		delete globalThis.window;
	});

	it("migrateFromSessionStorage → 중복 이관 방지 (localStorage 우선)", () => {
		const session = memStorage();
		const local = memStorage();
		globalThis.window = { get sessionStorage() { return session; }, get localStorage() { return local; } };
		session.setItem(AUTH_KEY, "session-token");
		local.setItem(AUTH_KEY, "local-token");
		migrateFromSessionStorage();
		expect(local.getItem(AUTH_KEY)).toBe("local-token");
		delete globalThis.window;
	});
});
