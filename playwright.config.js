// 파일 용도: Playwright E2E 테스트 설정 — 브라우저·서버·경로 정의
import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "__e2e__",
	timeout: 30_000,
	retries: 0,
	use: {
		baseURL: "http://localhost:30010",
		screenshot: "only-on-failure",
		trace: "on-first-retry",
	},
	webServer: {
		command: "npx vite build && npx vite preview --port 30010",
		port: 30010,
		reuseExistingServer: true,
		timeout: 60_000,
	},
	projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
