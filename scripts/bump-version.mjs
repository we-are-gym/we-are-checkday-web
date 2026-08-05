// 파일 용도: 정적 애셋 캐시 버전 갱신 — 모든 HTML의 스타일·진입 스크립트 태그에 ?v=YYYYMMDD 쿼리를 일괄 적용
// 사용법: node scripts/bump-version.mjs [YYYYMMDD]   (인자 없으면 오늘 날짜)
// 주의: 레거시 화면(checkday_1.html·basic_function_assessment_2.html)은 변경 대상에서 제외한다.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = dirname(fileURLToPath(import.meta.url)) + "/..";
const LEGACY = new Set(["checkday_1.html", "basic_function_assessment_2.html"]);
const stamp = (
  process.argv[2] ?? new Date().toISOString().slice(0, 10)
).replaceAll("-", "");

let changed = 0;
for (const f of readdirSync(ROOT).filter(
  (name) => name.endsWith(".html") && !LEGACY.has(name),
)) {
  const path = join(ROOT, f);
  const src = readFileSync(path, "utf8");
  const next = src
    .replace(
      /(rel="stylesheet" href="styles\/[^"?]+)(?:\?v=\d+)?(")/g,
      `$1?v=${stamp}$2`,
    )
    .replace(/(src="scripts\/[^"?]+)(?:\?v=\d+)?(")/g, `$1?v=${stamp}$2`);
  if (next !== src) {
    writeFileSync(path, next);
    changed++;
    console.log(`updated ${f}`);
  }
}
console.log(`done: ${changed} file(s), stamp v=${stamp}`);
