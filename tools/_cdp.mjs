// 파일 용도: 헤드리스 엣지(CDP) 기반 검증 공용 유틸 — 정적 서버·Edge 스폰·CDP 디스패처 (verify*.mjs 공용)
// 기법: 각 verify 스크립트가 이 모듈에서 공용 유틸을 import하여 중복을 제거한다.
import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, resolve } from "node:path";

/** 프로젝트 루트 */
export const ROOT = resolve(import.meta.dirname, "..");

/** Edge 브라우저 실행 경로 */
export const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

/** MIME 타입 매핑 */
export const MIME = {
	".html": "text/html; charset=utf-8",
	".js": "text/javascript; charset=utf-8",
	".mjs": "text/javascript; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".json": "application/json; charset=utf-8",
	".svg": "image/svg+xml",
	".ico": "image/x-icon",
};

/**
 * 프로젝트 루트를 기준으로 하는 정적 파일 HTTP 서버를 생성하고 listen한다.
 * @param {number} port Listen할 포트 번호
 * @returns {import("node:http").Server} HTTP 서버 인스턴스
 */
export function createStaticServer(port) {
	const server = createServer((req, res) => {
		const url = new URL(req.url, `http://localhost:${port}`);
		if (url.pathname === "/favicon.ico") {
			res.statusCode = 204;
			res.end();
			return;
		}
		let p = decodeURIComponent(url.pathname);
		if (p.endsWith("/")) p += "index.html";
		const file = join(ROOT, p);
		if (!existsSync(file) || !statSync(file).isFile) {
			res.statusCode = 404;
			res.end("not found");
			return;
		}
		res.setHeader("Content-Type", MIME[extname(file)] || "application/octet-stream");
		res.end(readFileSync(file));
	});
	return server;
}

/**
 * 헤드리스 엣지 브라우저를 스폰한다.
 * @param {string} profileDir 사용자 데이터 디렉토리 경로
 * @param {number} debugPort CDP 원격 디버깅 포트
 * @returns {import("node:child_process").ChildProcess}
 */
export function startEdge(profileDir, debugPort) {
	return spawn(
		EDGE,
		[
			"--headless=new",
			"--disable-gpu",
			"--no-sandbox",
			"--no-first-run",
			"--disable-extensions",
			`--user-data-dir=${profileDir}`,
			`--remote-debugging-port=${debugPort}`,
			"about:blank",
		],
		{ shell: false, windowsHide: true }
	);
}

/**
 * 엣지 프로세스 트리를 정리한다 — taskkill + PowerShell 프로세스 필터로 잔여 프로세스까지 제거한다.
 * @param {import("node:child_process").ChildProcess | null} child 엣지 자식 프로세스
 * @param {string} profileDir 사용자 데이터 디렉토리 경로 (프로필 기반 잔여 프로세스 추적용)
 * @returns {void}
 */
export function killEdgeTree(child, profileDir) {
	const pid = child?.pid;
	try {
		if (pid) child.kill();
	} catch {}
	try {
		if (pid)
			spawnSync("taskkill", ["/pid", String(pid), "/t", "/f"], {
				shell: false,
				windowsHide: true,
				stdio: "ignore",
			});
	} catch {}
	try {
		const esc = profileDir.replace(/'/g, "''");
		spawnSync(
			"powershell",
			[
				"-NoProfile",
				"-Command",
				`Get-CimInstance Win32_Process -Filter "Name='msedge.exe'" | Where-Object { $_.CommandLine -like '*${esc}*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }`,
			],
			{ shell: false, windowsHide: true, stdio: "ignore" }
		);
	} catch {}
}

/**
 * CDP 디버깅 포트에서 타겟(탭) 목록을 가져온다. 엣지 시작 대기가 포함된다.
 * @param {number} debugPort CDP 원격 디버깅 포트
 * @param {number} [retries=40] 최대 재시도 횟수 (기본 40회 × 200ms = 8초)
 * @returns {Promise<Array<{type: string, webSocketDebuggerUrl: string}>>} 타겟 목록
 */
export async function jsonList(debugPort, retries = 40) {
	for (let i = 0; i < retries; i++) {
		try {
			const r = await fetch(`http://127.0.0.1:${debugPort}/json`);
			if (r.ok) return await r.json();
		} catch {}
		await new Promise(r => setTimeout(r, 200));
	}
	throw new Error("Debug 포트 응답 없음");
}

/**
 * CDP 웹소켓에 디스패처를 연결한다 — 세션별 메시지 분리·에러 수집·이벤트 대기 지원.
 * @param {WebSocket} ws CDP 웹소켓 연결
 * @returns {{ newSession: () => CdpSession }} 세션 팩토리
 */
export function attachCdp(ws) {
	let id = 0;
	let session = { pending: new Map(), waiters: new Set(), errors: [] };
	ws.addEventListener("message", ev => {
		const msg = JSON.parse(ev.data);
		const s = session;
		if (msg.id && s.pending.has(msg.id)) {
			s.pending.get(msg.id)(msg);
			s.pending.delete(msg.id);
			return;
		}
		for (const w of [...s.waiters]) {
			if (w.method === msg.method) {
				s.waiters.delete(w);
				w.res(msg.params);
			}
		}
		if (msg.method === "Runtime.exceptionThrown") {
			const ex = msg.params.exceptionDetails;
			s.errors.push(`예외: ${ex.text} ${ex.exception?.description || ""}`.trim());
		}
		if (msg.method === "Log.entryAdded" && msg.params.entry.level === "error") {
			s.errors.push(`리소스오류: ${msg.params.entry.text}`);
		}
	});
	return {
		/** 새 CDP 세션을 생성한다 — 이전 세션의 에러 목록을 초기화한다 */
		newSession() {
			session = { pending: new Map(), waiters: new Set(), errors: [] };
			const s = session;
			const send = (method, params = {}) =>
				new Promise((res, rej) => {
					const mid = ++id;
					s.pending.set(mid, m => (m.error ? rej(new Error(m.error.message)) : res(m.result)));
					ws.send(JSON.stringify({ id: mid, method, params }));
				});
			const waitEvent = method => new Promise(res => s.waiters.add({ method, res }));
			return { send, waitEvent, errors: s.errors };
		},
	};
}

/**
 * @typedef {Object} CdpSession
 * @property {(method: string, params?: object) => Promise<object>} send CDP 명령 전송
 * @property {(method: string) => Promise<object>} waitEvent CDP 이벤트 대기
 * @property {string[]} errors 수집된 에러 목록
 */
