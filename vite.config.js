// 파일 용도: Vite 빌드·개발 서버 설정 — 멀티 페이지 앱, 모듈 별칭, 포트 설정
import { resolve } from "node:path";
import { defineConfig } from "vite";

// Windows 호환: 절대 경로를 정규화하여 일관된 슬래시 보장
// trailing slash 보존: resolve()가 제거하므로 원본이 '/'로 끝나면 재부여
const compat = rel => {
	const base = resolve(process.cwd(), rel).replace(/\\/g, "/");
	return rel.endsWith("/") && !base.endsWith("/") ? base + "/" : base;
};

export default defineConfig({
	// ── 전역 상수 주입 — globalThis.__API_BASE__ 등 ──
	// VITE_API_BASE 환경변수로 로컬 검증용 API 주소를 지정할 수 있다 (기본: 운영 Cloud Run)
	define: {
		__API_BASE__: JSON.stringify(process.env.VITE_API_BASE || "https://checkday-rest-evztw4wu4q-du.a.run.app/api/v1"),
	},

	// ── 멀티 페이지 앱: 각 HTML을 진입점으로 지정 ──
	build: {
		rollupOptions: {
			input: {
				main: compat("index.html"),
				login: compat("login.html"),
				members: compat("members.html"),
				"member-create": compat("member-create.html"),
				"member-edit": compat("member-edit.html"),
				"member-detail": compat("member-detail.html"),
				"check-doc-new": compat("check-doc-new.html"),
				"check-doc-view": compat("check-doc-view.html"),
				"check-doc-edit": compat("check-doc-edit.html"),
				checkday: compat("checkday_1.html"),
				"basic-function-assessment": compat("basic_function_assessment_2.html"),
			},
		},
		outDir: "dist",
		emptyOutDir: true,
	},

	// ── 모듈 별칭 — HTML importmap과 동일 매핑 ──
	resolve: {
		alias: {
			"@infra/": compat("ESM/infra/"),
			"@tools/": compat("ESM/tools/"),
			"@calc/": compat("ESM/calc/"),
			"@gym/": compat("ESM/gym/"),
			"@member/": compat("ESM/member/"),
			"@check-doc/": compat("ESM/check-doc/"),
			"@shared/": compat("ESM/shared/"),
		},
		// .js → .ts 자동 리졸버 (TypeScript 마이그레이션 후 필요)
		extensions: [".mjs", ".js", ".ts", ".mts", ".jsx", ".tsx", ".json"],
	},

	// ── CSS ──
	css: {
		devSourcemap: true,
	},

	// ── 개발 서버 포트 (CORS_ORIGINS에 허용된 포트) ──
	server: {
		port: 30010,
		strictPort: false,
	},
});
