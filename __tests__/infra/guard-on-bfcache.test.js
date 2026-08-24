// 파일 용도: bfcache 복원 가드 단위 테스트 — 만료 토큰 리다이렉트·복원 데이터 갱신 콜백 검증
import { afterEach, describe, expect, it } from "bun:test";
import { guardOnBfcache } from "../../ESM/infra/auth.js";
import { AUTH_KEY, REFRESH_KEY } from "../../ESM/infra/constants.js";

/** JWT 픽스처를 만든다 (서명은 만료 판정에 불참). expOffsetSeconds는 현재 시각 대비 오프셋. */
function makeToken(expOffsetSeconds) {
	const encode = obj => btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
	const payload = { sub: "user-1", exp: Math.floor(Date.now() / 1000) + expOffsetSeconds };
	return `${encode({ alg: "HS256" })}.${encode(payload)}.sig`;
}

const makeExpiredToken = () => makeToken(-60);

/** window·sessionStorage 스텁을 설치하고 pageshow 핸들러 캡처를 돌려준다 */
function installStubs(pathname) {
	const store = new Map();
	const listeners = new Map();
	let replaced = null;
	globalThis.sessionStorage = {
		getItem: key => (store.has(key) ? store.get(key) : null),
		setItem: (key, value) => store.set(key, value),
		removeItem: key => store.delete(key),
	};
	globalThis.window = {
		location: {
			pathname,
			href: `http://localhost:30010${pathname}?docID=42`,
			replace: url => {
				replaced = url;
			},
		},
		addEventListener: (type, handler) => listeners.set(type, handler),
		removeEventListener() {},
	};
	return {
		store,
		listeners,
		getReplaced: () => replaced,
	};
}

afterEach(() => {
	delete globalThis.window;
	delete globalThis.sessionStorage;
});

describe("guardOnBfcache", () => {
	it("bfcache 복원 시 토큰이 만료되었으면 ?redirect=에 원래 화면을 보존하여 로그인 페이지로 이동한다", () => {
		const stubs = installStubs("/check-doc-view.html");
		try {
			stubs.store.set(AUTH_KEY, makeExpiredToken());
			stubs.store.set(REFRESH_KEY, "refresh-token");
			guardOnBfcache();
			stubs.listeners.get("pageshow")({ persisted: true });
			const expected = encodeURIComponent("http://localhost:30010/check-doc-view.html?docID=42");
			expect(stubs.getReplaced()).toBe(`login.html?redirect=${expected}`);
			expect(stubs.store.has(AUTH_KEY)).toBe(false);
		} finally {
			delete globalThis.window;
			delete globalThis.sessionStorage;
		}
	});

	it("최초 로드(persisted=false)에서는 아무 동작도 하지 않는다", () => {
		const stubs = installStubs("/members.html");
		try {
			stubs.store.set(AUTH_KEY, makeExpiredToken());
			guardOnBfcache();
			stubs.listeners.get("pageshow")({ persisted: false });
			expect(stubs.getReplaced()).toBeNull();
			expect(stubs.store.has(AUTH_KEY)).toBe(true);
		} finally {
			delete globalThis.window;
			delete globalThis.sessionStorage;
		}
	});

	it("인증된 복원에서는 onRestore 콜백을 실행해 데이터를 갱신한다", async () => {
		const stubs = installStubs("/members.html");
		try {
			stubs.store.set(AUTH_KEY, makeToken(600));
			let restored = 0;
			guardOnBfcache(() => {
				restored++;
			});
			await stubs.listeners.get("pageshow")({ persisted: true });
			expect(restored).toBe(1);
			expect(stubs.getReplaced()).toBeNull();
		} finally {
			delete globalThis.window;
			delete globalThis.sessionStorage;
		}
	});

	it("인증되지 않은 복원에서는 onRestore를 실행하지 않고 리다이렉트한다", () => {
		const stubs = installStubs("/members.html");
		try {
			stubs.store.set(AUTH_KEY, makeExpiredToken());
			let restored = 0;
			guardOnBfcache(() => {
				restored++;
			});
			stubs.listeners.get("pageshow")({ persisted: true });
			expect(restored).toBe(0);
			expect(stubs.getReplaced()).toContain("login.html?redirect=");
		} finally {
			delete globalThis.window;
			delete globalThis.sessionStorage;
		}
	});
});
