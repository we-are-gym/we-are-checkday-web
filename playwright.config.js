// 파일 용도: Playwright E2E 테스트 설정 — 브라우저·서버·경로 정의
import { defineConfig } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT || 30010);

export default defineConfig({
	testDir: "__e2e__",
	timeout: 30_000,
	retries: 0,
	use: {
		// E2E_BASE_URL로 대상 웹 주소를 재정의할 수 있다 (IPv6 localhost 중복 등 로컬 검증 대비)
		baseURL: process.env.E2E_BASE_URL || `http://localhost:${PORT}`,
		screenshot: "only-on-failure",
		trace: "on-first-retry",
	},
	// E2E_PORT로 웹 서버 포트를 재정의할 수 있다 (타 워크그룹 preview 등 포트 충돌 대비)
	webServer: {
		command: `npx vite build && npx vite preview --port ${PORT} --strictPort`,
		port: PORT,
		reuseExistingServer: true,
		timeout: 60_000,
	},
	projects: [
		{ name: "chromium", use: { browserName: "chromium" } },
		{ name: "chromium-edge", use: { browserName: "chromium", channel: "msedge" } },
	],
});
