// 파일 용도: GitHub Pages 배포 자동화 — Vite 빌드 산출물을 `deploy/GH-pages` 브랜치의 `docs` 폴더로 푸시한다.
// 절차는 기존 수동 배포와 동일하다:
//   1. 현재 브랜치에서 `--base=/<저장소명>/`로 프로덕션 빌드 (GitHub Pages 프로젝트 페이지는 저장소 경로 하위에 호스팅되므로 base 필수)
//   2. `deploy/GH-pages` 체크아웃 후 원래 브랜치를 머지
//   3. `dist` 내용을 `docs`로 교체, 커밋(변화가 없으면 건너뜀), 푸시, 원래 브랜치 복귀
// 빌드는 서브프로세스 대신 Vite JS API로 직접 호출한다 — Windows 셸 이슈 없이 vite.config.js를 그대로 읽는다.
import { build } from "vite";
import { cpSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { execSync, spawnSync } from "node:child_process";

const DEPLOY_BRANCH = "deploy/GH-pages";

/** git 명령을 실행하고 실패 시 예외를 던진다 */
function git(args) {
	return execSync(`git ${args}`, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

/** 종료 코드만 필요한 git 명령 (--quiet 계열) */
function gitOk(args) {
	return spawnSync("git", args.split(" "), { stdio: "ignore" }).status === 0;
}

try {
	// ── 사전 조건: 미커밋 변경이 있으면 머지·커밋이 오염되므로 중단
	if (!gitOk("status --porcelain")) {
		console.error("✖ 미커밋 변경이 있습니다. 커밋하거나 stash한 뒤 다시 실행하십시오.");
		process.exit(1);
	}

	const pkg = JSON.parse(readFileSync("package.json", "utf8"));
	const base = `/${pkg.name}/`;

	const originalBranch = git("rev-parse --abbrev-ref HEAD");
	console.log(`▶ ${originalBranch}에서 빌드합니다 (base=${base})`);
	await build({ base, logLevel: "info" });

	console.log(`▶ ${DEPLOY_BRANCH}로 전환하여 ${originalBranch}를 머지합니다`);
	git(`checkout ${DEPLOY_BRANCH}`);
	git(`merge ${originalBranch} --no-edit`);

	rmSync("docs", { recursive: true, force: true });
	mkdirSync("docs", { recursive: true });
	cpSync("dist", "docs", { recursive: true });

	git("add -A docs");
	if (gitOk("diff --cached --quiet docs")) {
		console.log("✔ 배포할 변화가 없습니다 — 이미 최신 상태입니다.");
	} else {
		execSync('git commit -m "🚀 `docs` 폴더로 배포"', { stdio: "inherit" });
		execSync(`git push origin ${DEPLOY_BRANCH}`, { stdio: "inherit" });
		console.log(`✔ 배포 완료: https://<org>.github.io/${pkg.name}`);
	}
	git(`checkout ${originalBranch}`);
} catch (err) {
	// 머지 충돌 등 실패 시 상태를 그대로 남겨 사용자가 확인·복구할 수 있게 한다
	console.error("✖ 배포 실패:", err.message);
	process.exit(1);
}
