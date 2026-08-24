// 파일 용도: 로그인 리다이렉트 헬퍼 단위 테스트 — 토큰 삭제·redirect 쿼리 보존·루프 방지 검증
import { afterEach, describe, expect, it } from "bun:test";
import { AUTH_KEY, REFRESH_KEY } from "../../ESM/infra/constants.js";
import { redirectToLogin } from "../../ESM/infra/login-redirect.js";

/** window·sessionStorage 스텁을 설치하고 원복 함수를 반환한다 */
function installStubs({ pathname }) {
	const originalWindow = globalThis.window;
	const originalSessionStorage = globalThis.sessionStorage;
	const store = new Map();
	let replaced = null;
	globalThis.sessionStorage = {
		getItem: key => (store.has(key) ? store.get(key) : null),
		setItem: (key, value) => store.set(key, value),
		removeItem: key => store.delete(key),
	};
	globalThis.window = {
		location: {
			pathname,
			href: `http://localhost:30010${pathname}${pathname.includes("?") ? "" : "?docID=42"}`,
			replace: url => {
				replaced = url;
			},
		},
		addEventListener() {},
		removeEventListener() {},
	};
	return {
		store,
		getReplaced: () => replaced,
		restore() {
			globalThis.window = originalWindow;
			globalThis.sessionStorage = originalSessionStorage;
		},
	};
}

afterEach(() => {
	delete globalThis.window;
	delete globalThis.sessionStorage;
});

describe("redirectToLogin", () => {
	it("보호 페이지에서는 토큰을 지우고 ?redirect=에 현재 URL을 보존하여 로그인 페이지로 이동한다", () => {
		const stubs = installStubs({ pathname: "/check-doc-view.html" });
		try {
			stubs.store.set(AUTH_KEY, "access-token");
			stubs.store.set(REFRESH_KEY, "refresh-token");
			redirectToLogin();
			expect(stubs.store.has(AUTH_KEY)).toBe(false);
			expect(stubs.store.has(REFRESH_KEY)).toBe(false);
			const expected = encodeURIComponent("http://localhost:30010/check-doc-view.html?docID=42");
			expect(stubs.getReplaced()).toBe(`login.html?redirect=${expected}`);
		} finally {
			stubs.restore();
		}
	});

	it("로그인 페이지에서는 이미 로그인 페이지면 리다이렉트하지 않는다", () => {
		const stubs = installStubs({ pathname: "/login.html" });
		try {
			stubs.store.set(AUTH_KEY, "access-token");
			redirectToLogin();
			expect(stubs.store.has(AUTH_KEY)).toBe(false);
		} finally {
			stubs.restore();
		}
	});
});
