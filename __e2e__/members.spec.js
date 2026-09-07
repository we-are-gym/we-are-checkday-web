// 파일 용도: 회원 관리 흐름 E2E 테스트 — 목록 로드·검색·상세 이동
// to-be: 인증 토큰 주입으로 로그인 리다이렉트 없이 검증, API 주소·계정은 환경변수 주입
import { expect, test } from "@playwright/test";
import { loginAndInjectToken } from "./checkdoc-helpers.js";

test.beforeEach(async ({ page }) => {
	await loginAndInjectToken(page);
});

test.describe("회원 관리", () => {
	test("회원 목록 로드", async ({ page }) => {
		await page.goto("/members.html");

		// ui-data-table 컴포넌트가 존재하는지 확인
		const table = page.locator("#member-table");
		await expect(table).toBeVisible();

		// 테이블 내부에 tbody가 렌더링되었는지 확인
		const rows = table.locator("tbody tr.data-row");
		await expect(rows).not.toHaveCount(0);
	});

	test("회원 검색", async ({ page }) => {
		await page.goto("/members.html");

		// 검색 입력란에 이름 입력
		const searchInput = page.locator("#search-input");
		await searchInput.fill("김");

		// 필터링된 목록 확인 — data-row 요소가 존재해야 함
		const table = page.locator("#member-table");
		const rows = table.locator("tbody tr.data-row");
		const count = await rows.count();

		// 검색 결과가 있으면 data-row가 존재, 없으면 안내 행이 표시됨
		if (count > 0) {
			// 검색된 회원 이름이 행 텍스트에 포함되어야 함
			for (let i = 0; i < count; i++) {
				const rowText = await rows.nth(i).textContent();
				expect(rowText).toContain("김");
			}
		} else {
			// 빈 목록 안내 메시지 확인
			await expect(table.locator(".empty-cell")).toContainText("검색 결과가 없어요");
		}
	});

	test("회원 상세 이동", async ({ page }) => {
		await page.goto("/members.html");

		// 회원 행 클릭 → member-detail.html로 이동 확인
		const table = page.locator("#member-table");
		const firstRow = table.locator("tbody tr.data-row").first();
		await firstRow.click();

		// member-detail.html로 이동했는지 확인
		await expect(page).toHaveURL(/member-detail\.html/);
	});

	test("테이블 시각 계약 — 4열 중앙·삭제 열 우측 정렬, 줄무늬 없음, 이름 강조, 행 포인터 커서", async ({ page }) => {
		await page.goto("/members.html");
		const table = page.locator("#member-table");
		const rows = table.locator("tbody tr.data-row");
		await expect(rows.first()).toBeVisible();

		// 열 정렬 — 이름·성별·담당 트레이너·체크 횟수는 헤더·셀 모두 중앙, 관리(삭제) 열은 우측
		for (const col of [1, 2, 3, 4]) {
			await expect(table.locator(`thead th:nth-child(${col})`)).toHaveCSS("text-align", "center");
			await expect(rows.first().locator(`td:nth-child(${col})`)).toHaveCSS("text-align", "center");
		}
		await expect(table.locator("thead th:nth-child(5)")).toHaveCSS("text-align", "right");
		await expect(rows.first().locator("td:nth-child(5)")).toHaveCSS("text-align", "right");

		// 홀/짝 행 배경 동등 — striped 클래스 부재와 1·2행 실배경 일치로 확인
		await expect(table.locator(".data-table-wrapper")).not.toHaveClass(/striped/);
		const bgs = await rows.evaluateAll(els => els.slice(0, 2).map(r => getComputedStyle(r).backgroundColor));
		expect(new Set(bgs).size).toBe(1);

		// 이름 강조 — var(--text) 색·굵기 700
		const name = rows.first().locator(".member-name");
		await expect(name).toHaveCSS("font-weight", "700");
		const textColor = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--text").trim());
		const rgb = await name.evaluate(el => getComputedStyle(el).color);
		expect(rgb).toBe(hexToRgb(textColor));

		// 행 포인터 커서 — 클릭하면 상세로 이동하고, 행 안 삭제 버튼은 confirm만 띄우고 이동하지 않는다
		await expect(rows.first()).toHaveCSS("cursor", "pointer");
		await rows.first().locator("td:nth-child(1)").click();
		await expect(page).toHaveURL(/member-detail\.html\?memberID=/);

		await page.goBack();
		await expect(rows.first()).toBeVisible();
		let dialog = "";
		page.on("dialog", async d => {
			dialog = d.message();
			await d.dismiss();
		});
		await rows.first().locator(".row-remove").click();
		await page.waitForTimeout(300);
		expect(dialog).toContain("삭제");
		expect(page.url()).toContain("members.html");
	});

	/** CSS 변수 hex 값을 getComputedStyle의 rgb() 문자열로 변환한다 */
	function hexToRgb(hex) {
		const v = hex.replace("#", "");
		const full =
			v.length === 3
				? v
						.split("")
						.map(c => c + c)
						.join("")
				: v;
		return `rgb(${parseInt(full.slice(0, 2), 16)}, ${parseInt(full.slice(2, 4), 16)}, ${parseInt(full.slice(4, 6), 16)})`;
	}
});
