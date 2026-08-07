// 파일 용도: 헤드리스 엣지(CDP) 기반 정적 페이지 검증 — 각 화면 임포트·실행 시 콘솔 오류와 핵심 DOM 마커 확인
// 기법: 자체 정적 HTTP 서버(의존성 없음) + Edge --headless CDP(Runtime/Page 이벤트)로 렌더·콘솔 캡처
// 앱이 쓰는 것은 오직 브라우저 빌트인 fetch/WebSocket — 외부 의존성·런타임 번들 영향 없음 (dev 전용)
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";

const ROOT = resolve(import.meta.dirname, "..");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 8123;
const DEBUG_PORT = 9222;

/** 화면별 핵심 DOM 마커 — 모듈 임포트·렌더 성공을 나타낸다 */
const PAGES = [
	{ file: "index.html", markers: ["app-header"] },
	{ file: "login.html", markers: ["login-form"] },
	{ file: "members.html", markers: ["member-table", "search-input"] },
	{ file: "member-create.html", markers: ["member-form"] },
	{ file: "member-edit.html", query: "memberID=1", markers: ["member-form"] },
	{ file: "member-detail.html", markers: ["cmp-cur", "record-list"] },
	{ file: "check-doc-new.html", markers: ["eval-cards", "total-num"] },
	{ file: "check-doc-view.html", markers: ["vh-title"] },
	{ file: "check-doc-edit.html", markers: ["eval-cards", "add-eval-btn"] },
	{ file: "check-sessions.html", markers: ["app-header"] },
	{ file: "checkday_1.html", markers: ["date-badge", "eval-cards"] },
	{ file: "basic_function_assessment_2.html", markers: ["items-container"] },
];

const MIME = {
	".html": "text/html; charset=utf-8",
	".js": "text/javascript; charset=utf-8",
	".mjs": "text/javascript; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".json": "application/json; charset=utf-8",
	".svg": "image/svg+xml",
	".ico": "image/x-icon",
};

const server = createServer((req, res) => {
	const url = new URL(req.url, `http://localhost:${PORT}`);
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

function startEdge(profileDir) {
	const child = spawn(
		EDGE,
		[
			"--headless=new",
			"--disable-gpu",
			"--no-sandbox",
			"--no-first-run",
			"--disable-extensions",
			`--user-data-dir=${profileDir}`,
			`--remote-debugging-port=${DEBUG_PORT}`,
			"about:blank",
		],
		{ shell: false, windowsHide: true },
	);
	return child;
}

async function jsonList() {
	let lastErr;
	for (let i = 0; i < 30; i++) {
		try {
			const r = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json`);
			if (r.ok) return await r.json();
		} catch (e) {
			lastErr = e;
		}
		await new Promise((r) => setTimeout(r, 200));
	}
	throw new Error("Debug 포트 응답 없음: " + (lastErr && lastErr.message));
}

/** CDP 디스패처 — 웹소켓 메시지 리스너는 연결당 1개만 두고, 화면별 검사는 세션으로 분리한다 */
function attachCdp(ws) {
	let id = 0;
	let session = { pending: new Map(), waiters: new Set(), errors: [] };
	ws.addEventListener("message", (ev) => {
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
		if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error") {
			const args = msg.params.args.map((a) => a.value ?? a.description ?? "").join(" ");
			if (/error|uncaught|is not|undefined|failed/i.test(args)) s.errors.push(`콘솔: ${args}`);
		}
		if (msg.method === "Log.entryAdded" && msg.params.entry.level === "error") {
			const ent = msg.params.entry;
			// 404 리소스 로그는 실패 원인을 특정하기 쉽도록 URL을 함께 남긴다
			s.errors.push(`리소스오류: ${ent.text} @ ${ent.url || "?"}`);
		}
	});
	/** 화면 1개 검사용 세션 생성 — 콘솔 수집은 화면 단위로 초기화된다 */
	return {
		newSession() {
			session = { pending: new Map(), waiters: new Set(), errors: [] };
			const s = session;
			const send = (method, params = {}) =>
				new Promise((res, rej) => {
					const mid = ++id;
					s.pending.set(mid, (m) => (m.error ? rej(new Error(m.error.message)) : res(m.result)));
					ws.send(JSON.stringify({ id: mid, method, params }));
				});
			const waitEvent = (method) =>
				new Promise((res) => {
					s.waiters.add({ method, res });
				});
			return { send, waitEvent, errors: s.errors };
		},
	};
}

async function checkPage(url, dispatcher) {
	const c = dispatcher.newSession();
	await c.send("Page.enable");
	await c.send("Runtime.enable");
	await c.send("Log.enable");
	const loaded = c.waitEvent("Page.loadEventFired");
	await c.send("Page.navigate", { url });
	await loaded;
	await new Promise((r) => setTimeout(r, 800)); // 모듈 스크립트 실행 여유
	const domRes = await c.send("Runtime.evaluate", {
		expression: "document.documentElement.outerHTML",
		returnByValue: true,
	});
	// DOM 콘텐츠 확인(light DOM — body에 렌더된다)
	const dom = (domRes.result?.value ?? "").toString();
	return { dom, errors: c.errors };
}

async function main() {
	await new Promise((r) => server.listen(PORT, r));
	const profileDir = join(tmpdir(), `verify-edge-${Date.now()}`);
	const edge = startEdge(profileDir);
	try {
		const list = await jsonList();
		const pageTarget = list.find((t) => t.type === "page");
		if (!pageTarget) throw new Error("page target 없음");
		const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
		await new Promise((res, rej) => {
			ws.addEventListener("open", res);
			ws.addEventListener("error", rej);
		});
		const dispatcher = attachCdp(ws);

		let failures = 0;
		for (const { file, query, markers } of PAGES) {
			const url = `http://localhost:${PORT}/${file}${query ? "?" + query : ""}`;
			const { dom, errors } = await checkPage(url, dispatcher);
			const domEmpty = dom.trim().length < 200;
			const missing = markers.filter((m) => !dom.includes(m));
			const ok = errors.length === 0 && missing.length === 0 && !domEmpty;
			if (!ok) failures++;
			console.log(
				`${ok ? "PASS" : "FAIL"}  ${file.padEnd(38)} 콘솔오류=${errors.length} 마커빠짐=${missing.length}${domEmpty ? " [DOM비어있음]" : ""}`,
			);
			errors.slice(0, 4).forEach((e) => console.log(`   ${e}`));
			if (!ok && missing.length && !domEmpty) console.log(`   DOM조각: ${dom.slice(0, 200).replace(/\\s+/g, " ")}`);
		}
		ws.close();
		console.log(`\n결과: ${PAGES.length - failures}/${PAGES.length} 화면 통과`);
		process.exit(failures ? 1 : 0);
	} finally {
		edge.kill();
		server.close();
	}
}

async function run() {
	try {
		await main();
	} catch (e) {
		console.error("검증 오류:", e.message);
		process.exit(2);
	}
}
run();