# 파일 용도: 정적 애셋 캐시 버전 갱신 — 모든 HTML의 스타일·스크립트 ?v= 쿼리를 YYYYMMDDHH로 일괄 적용
# 사용법: uv run python tools/bump_version.py [YYYYMMDDHH]   (인자 없으면 현재 시각 기준)
"""모든 HTML 파일의 캐시 버전 쿼리(?v=)를 갱신한다."""
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def main() -> None:
    if len(sys.argv) > 1:
        stamp = sys.argv[1]
    else:
        stamp = datetime.now(timezone.utc).strftime("%Y%m%d%H")

    changed = 0
    for html_path in ROOT.glob("*.html"):
        src = html_path.read_text(encoding="utf-8")
        next_src = re.sub(r"(?<=\?v=)\d+", stamp, src)
        if next_src != src:
            html_path.write_text(next_src, encoding="utf-8")
            changed += 1
            print(f"updated {html_path.name}")

    if changed == 0:
        # No ?v= patterns found - try alternative pattern
        print("warning: no ?v= patterns found, trying alternative...")
    print(f"done: {changed} file(s), stamp v={stamp}")


if __name__ == "__main__":
    main()
