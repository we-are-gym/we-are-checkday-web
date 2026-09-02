// 파일 용도: 접근성 스캔 E2E — axe-core로 주요 화면의 WCAG 위반을 수집한다.
// 단계: ③a(위반 로그만) → ③b(위반 수정) → ③c(critical·serious 위반 0 단언 활성화)
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { collectConsoleErrors, createMemberViaApi, getToken, loginAndInjectToken } from "./checkdoc-helpers.js";

const consoleErrors = [];

test.beforeEach(async ({ page }) => {
	collectConsoleErrors(page, consoleErrors);
});

/** 스캔 대상 화면 — setup은 접근 전 사전 준비(인증·시드)를 수행하고 최종 URL을 반환한다 */
const SCAN_TARGETS = [
	{ path: "/index.html", setup: () => Promise.resolve("/index.html") },
	{ path: "/login.html", setup: () => Promise.resolve("/login.html") },
	{
		path: "/members.html",
		setup: async page => {
			await loginAndInjectToken(page);
			return "/members.html";
		},
	},
	{
		path: "/check-doc-new.html",
		setup: async page => {
			await loginAndInjectToken(page);
			return "/check-doc-new.html";
		},
	},
	{
		path: "/member-detail.html",
		setup: async page => {
			await loginAndInjectToken(page);
			const token = await getToken(page.request);
			const memberId = await createMemberViaApi(page.request, token);
			return `/member-detail.html?memberID=${memberId}`;
		},
	},
];

for (const target of SCAN_TARGETS) {
	test(`접근성 스캔 — ${target.path}`, async ({ page }) => {
		const url = await target.setup(page);
		await page.goto(url);
		await page.waitForLoadState("networkidle");

		// 색상 대비(color-contrast)는 보류 — 색상 팔레트를 원복했고, 대비 수정 계획은
		// styles/colors.css·layout-shell.css·layout-basic-function.css·layout-checkday.css의 "(보류)" 주석에 기록 (사용자 직접 수행 예정)
		const results = await new AxeBuilder({ page }).disableRules(["color-contrast"]).analyze();
		// ③c: critical·serious 위반 0 단언 — 위반이 있으면 상세를 로그로 남긴다
		const serious = results.violations.filter(v => v.impact === "critical" || v.impact === "serious");
		if (results.violations.length) {
			for (const v of results.violations) {
				console.log(`[a11y] ${target.path} [${v.impact}] ${v.id}: ${v.help} — 노드 ${v.nodes.length}개`);
				for (const n of v.nodes) {
					console.log(`    ${n.target.join(" ")}`);
					console.log(`      HTML: ${(n.html || "").slice(0, 160)}`);
				}
			}
		} else {
			console.log(`[a11y] ${target.path} 위반 0건`);
		}
		expect(serious).toEqual([]);

		expect(consoleErrors).toEqual([]);
	});
}
