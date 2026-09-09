// 파일 용도: export-image.js 순수 헬퍼 단위 테스트 — DOM 의존 없음
import { describe, expect, it } from "bun:test";
import { pngFileName } from "@member/export-image.js";

describe("pngFileName", () => {
	it("회원 이름과 날짜를 포함한 파일명을 반환한다", () => {
		const date = new Date("2026-09-08T12:34:56Z");
		expect(pngFileName("홍길동", date)).toBe("체크데이_홍길동_2026-09-08.png");
	});

	it("회원 이름이 없으면 기본 이름을 사용한다", () => {
		const date = new Date("2026-01-15T00:00:00Z");
		expect(pngFileName(undefined, date)).toBe("체크데이_회원_2026-01-15.png");
		expect(pngFileName("", date)).toBe("체크데이_회원_2026-01-15.png");
	});
});
