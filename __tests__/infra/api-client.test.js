// 파일 용도: api-client 401 자동 갱신·재시도 흐름 단위 테스트 — 리프레시 성공 시 원 요청 재시도 보장
// 주의: 리프레시 성공 후 `response = await doFetch()` 재시도가 없으면
//       `response.status === 401` 검사가 이전 401 응답을 보므로 항상 true → 강제 로그아웃되는 회귀 방지
import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { request } from "../../ESM/infra/api-client.js";
import { clearTokensRaw, setAuthToken, setRefreshToken } from "../../ESM/infra/token-storage.js";

/** JWT 픽스처 — exp를 현재 시각 대비 오프셋으로 생성 (서명은 만료 판정에 불참) */
function makeToken(expOffsetSeconds) {
	const encode = obj => btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
	const payload = { sub: "user-1", exp: Math.floor(Date.now() / 1000) + expOffsetSeconds };
	return `${encode({ alg: "HS256" })}.${encode(payload)}.sig`;
}

/** fetch 응답 모사 */
function mockResponse(status, body) {
	return {
		ok: status >= 200 && status < 300,
		status,
		json: async () => body,
	};
}

/** 원 요청 URL(리프레시 제외) 호출 횟수에 따라 401 → 200 을 순차 반환하는 fetch 모사 */
function installFetchMock(newAccessToken) {
	const calls = [];
	let membersCallCount = 0;
	globalThis.fetch = async (url, init = {}) => {
		calls.push({ url: String(url), headers: init.headers || {} });
		if (String(url).endsWith("/auth/refresh")) {
			return mockResponse(200, {
				access_token: newAccessToken,
				refresh_token: makeToken(3600),
			});
		}
		membersCallCount++;
		if (membersCallCount === 1) {
			return mockResponse(401, { "@error": { "@message": "토큰 만료", "@code": "token_expired" } });
		}
		return mockResponse(200, {
			"@namespaces": {},
			"@controls": {},
			member_ID: "M-1",
			name: "홍길동",
			gender: "남",
		});
	};
	return calls;
}

beforeEach(() => {
	clearTokensRaw();
});

afterEach(() => {
	delete globalThis.fetch;
});

describe("request 401 자동 갱신", () => {
	it("액세스 토큰 만료 → 리프레시 성공 → 새 토큰으로 원 요청 재시도 → 200 응답 반환", async () => {
		const newAccessToken = makeToken(600);
		setAuthToken(makeToken(-60)); // 만료된 액세스 토큰
		setRefreshToken("refresh-token");

		const calls = installFetchMock(newAccessToken);

		const result = await request("/members");

		// 원 요청이 재시도되어 200 결과를 받는다 (재시도 라인 누락 시 여기서 refresh_retry_rejected throw)
		expect(result.member_ID).toBe("M-1");
		expect(result.name).toBe("홍길동");

		// 호출 순서: 1) 원 요청 401 → 2) /auth/refresh → 3) 재시도
		expect(calls).toHaveLength(3);
		expect(calls[0].url.endsWith("/members")).toBe(true);
		expect(calls[1].url.endsWith("/auth/refresh")).toBe(true);
		expect(calls[2].url.endsWith("/members")).toBe(true);

		// 재시도 요청의 Authorization은 새 액세스 토큰
		expect(calls[2].headers.Authorization).toBe(`Bearer ${newAccessToken}`);
	});
});
