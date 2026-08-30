// 파일 용도: Playwright E2E 테스트 설정 — 브라우저·서버·경로 정의
import { defineConfig } from "@playwright/test";

const WEB_PREFIX = process.env.E2E_WEB_URL_PREFIX || "http://localhost";
const WEB_PORT = Number(process.env.E2E_WEB_PORT || 30010);
const WEB_BASE_PATH = process.env.E2E_WEB_BASE_PATH ?? "/";

export default defineConfig({
	testDir: "__e2e__",
	timeout: 30_000,
	retries: 0,
	use: {
		// E2E_WEB_URL_PREFIX/E2E_WEB_PORT/E2E_WEB_BASE_PATH로 대상 웹 주소를 재정의할 수 있다 (IPv6 localhost 중복 등 로컬 검증 대비)
		baseURL: `${WEB_PREFIX}:${WEB_PORT}${WEB_BASE_PATH}`,
		screenshot: "only-on-failure",
		trace: "on-first-retry",
	},
	// `E2E_WEB_PORT`로 웹 서버 포트를 재정의할 수 있다 (타 워크그룹 preview 등 포트 충돌 대비)
	webServer: {
		/*
			Vite 개발 서버는 실제 배포 산출물과 다르기 때문에
			운영 환경 빌드 결과물을 정적 서빙해 임포트맵이나 에셋 해시같은 배포 이슈를 end-to-end 테스트로 재현하기 위해
			`bun run dev …` 명령어 대신 `bun run build && bun run preview` 명령어를 쓴다.
		*/
		command: `bun run build && bun run preview --port ${WEB_PORT} --strictPort`,
		port: WEB_PORT,
		reuseExistingServer: false,
		timeout: 60_000,
	},
	projects: [
		{ name: "chromium", use: { browserName: "chromium" } },
		{ name: "chromium-edge", use: { browserName: "chromium", channel: "msedge" } },
	],
});
