// 파일 용도: 문자열 유틸 — 날짜·숫자 표기 포맷 공용 헬퍼 (checkday 공용) — TS 마이그레이션

export function pad2(n: number): string {
	return String(n).padStart(2, "0");
}

export function today(d: Date = new Date()): string {
	return `${d.getFullYear()}.${pad2(d.getMonth() + 1)}.${pad2(d.getDate())}`;
}

export function todayISO(d: Date = new Date()): string {
	return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
