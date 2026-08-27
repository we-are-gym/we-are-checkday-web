// 파일 용도: URL 쿼리 파라미터 공용 헬퍼 — TS 마이그레이션

export function getUrlParam(name: string, fallback = ""): string {
	const v = new URLSearchParams(window.location.search).get(name);
	return v == null ? fallback : v;
}

export function getNumberParam(name: string, fallback = 0): number {
	const n = Number(getUrlParam(name));
	return Number.isNaN(n) ? fallback : n;
}
