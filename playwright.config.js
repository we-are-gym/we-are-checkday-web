// 파일 용도: Playwright E2E 테스트 설정 — 브라우저·서버·경로 정의
import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "__e2e__",
	timeout: 30_000,
	retries: 0,
	use: {
		// E2E_BASE_URL로 대상 웹 주소를 재정의할 수 있다 (IPv6 localhost 중복 등 로컬 검증 대비)
		baseURL: process.env.E2E_BASE_URL || "http://localhost:30010",
		screenshot: "only-on-failure",
		trace: "on-first-retry",
	},
	webServer: {
		command: "npx vite build && npx vite preview --port 30010",
		port: 30010,
		reuseExistingServer: true,
		timeout: 60_000,
	},
	projects: [
		{ name: "chromium", use: { browserName: "chromium" } },
		{ name: "chromium-edge", use: { browserName: "chromium", channel: "msedge" } },
	],
});
