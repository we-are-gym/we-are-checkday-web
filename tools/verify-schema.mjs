// 파일 용도: 회원명 스키마 전환(작업6) 시나리오 검증 — 헤드리스 엣지로
// ①회원명 변경 → 조회 화면 제목·document.title 반영 ②편집 화면 프리필 반영·회원명 읽기전용 ③상담일 변경이 저장되는지 확인 (dev 전용)
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { randomInt } from "node:crypto";

const ROOT = resolve(import.meta.dirname, "..");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 8400 + randomInt(200);
const DEBUG_PORT = 9400 + randomInt(799);

const MIME = {
	".html": "text/html; charset=utf-8",
	".js": "text/javascript; charset=utf-8",
	".css": "text/css; charset=utf-8",
};

const server = createServer((req, res) => {
	const url = new URL(req.url, `http://localhost:${PORT}`);
	if (url.pathname === "/favicon.ico") return res.end();
	let p = decodeURIComponent(url.pathname);
	if (p.endsWith("/")) p += "index.html";
	const file = join(ROOT, p);
	if (!existsSync(file) || !statSync(file).isFile) return res.end("not found");
	res.setHeader("Content-Type", MIME[extname(file)] || "application/octet-stream");
	res.end(readFileSync(file));
});

function startEdge(profileDir) {
	return spawn(EDGE, [
		"--headless=new", "--disable-gpu", "--no-sandbox", "--no-first-run", "--disable-extensions",
		`--user-data-dir=${profileDir}`, `--remote-debugging-port=${DEBUG_PORT}`, "about:blank",
	], { shell: false, windowsHide: true });
}

function killEdgeTree(child, profileDir) {
	try { child?.kill(); } catch {}
	try { if (child?.pid) spawnSync("taskkill", ["/pid", String(child.pid), "/t", "/f"], { shell: false, windowsHide: true, stdio: "ignore" }); } catch {}
	try {
		const esc = profileDir.replace(/'/g, "''");
		spawnSync("powershell", ["-NoProfile", "-Command",
			`Get-CimInstance Win32_Process -Filter "Name='msedge.exe'" | Where-Object { $_.CommandLine -like '*${esc}*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }`],
			{ shell: false, windowsHide: true, stdio: "ignore" });
	} catch {}
}

async function jsonList() {
	for (let i = 0; i < 60; i++) {
		try {
			const r = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json`);
			if (r.ok) return await r.json();
		} catch {}
		await new Promise((r2) => setTimeout(r2, 250));
	}
	throw new Error("Debug 포트 응답 없음");
}

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
		for (const w of [...s.waiters]) if (w.method === msg.method) { s.waiters.delete(w); w.res(msg.params); }
		if (msg.method === "Runtime.exceptionThrown") {
			const ex = msg.params.exceptionDetails;
			s.errors.push(`예외: ${ex.text} ${ex.exception?.description || ""}`.trim());
		}
		if (msg.method === "Log.entryAdded" && msg.params.entry.level === "error") {
			s.errors.push(`리소스오류: ${msg.params.entry.text}`);
		}
	});
	return {
		newSession() {
			session = { pending: new Map(), waiters: new Set(), errors: [] };
			const s = session;
			const send = (method, params = {}) => new Promise((res, rej) => {
				const mid = ++id;
				s.pending.set(mid, (m) => (m.error ? rej(new Error(m.error.message)) : res(m.result)));
				ws.send(JSON.stringify({ id: mid, method, params }));
			});
			const waitEvent = (method) => new Promise((res) => s.waiters.add({ method, res }));
			return { send, waitEvent, errors: s.errors };
		},
	};
}

const base = () => `http://localhost:${PORT}`;

async function setup(c) {
	await c.send("Page.enable");
	await c.send("Runtime.enable");
	await c.send("Log.enable");
}
async function nav(c, path, settle = 1200) {
	const loaded = c.waitEvent("Page.loadEventFired");
	await c.send("Page.navigate", { url: `${base()}${path}` });
	await loaded;
	await new Promise((r) => setTimeout(r, settle));
}
async function ev(c, expression) {
	const r = await c.send("Runtime.evaluate", { expression, returnByValue: true });
	return r.result?.value;
}

async function main() {
	await new Promise((r) => server.listen(PORT, r));
	const profileDir = join(tmpdir(), `verify-schema-${Date.now()}`);
	const edge = startEdge(profileDir);
	const fails = [];
	try {
		const list = await jsonList();
		const page = list.find((t) => t.type === "page");
		const ws = new WebSocket(page.webSocketDebuggerUrl);
		await new Promise((res, rej) => { ws.addEventListener("open", res); ws.addEventListener("error", rej); });
		const c = attachCdp(ws).newSession();
		await setup(c);

// ① 회원 변경 (김하늘 → 김하늘테스트) — 실제 저장 버튼 클릭 (네이티브 submit 이벤트 발생)
		await nav(c, "/member-edit.html?memberID=6");
		await ev(c, `(() => {
			const f = document.getElementById("member-form");
			f.querySelector("#mf-name").value = "김하늘테스트";
			f.querySelector("form button[type=submit]").click();
			return "clicked";
		})()`);
		// 저장 후 member-detail.html 로 이동 대기
		for (let i = 0; i < 40; i++) {
			const u = await ev(c, "location.pathname");
			if (u.includes("member-detail")) break;
			await new Promise((r) => setTimeout(r, 100));
		}
		await new Promise((r) => setTimeout(r, 800));

		// ② 조회 화면 — 회원명 반영 (김 (memberId=6 첫 회차 기록 id=17)
		await nav(c, "/check-doc-view.html?docID=17");
		const title = await ev(c, `(document.getElementById("vh-title").textContent || "").trim()`);
		const docTitle = await ev(c, "document.title");
		console.log(`조회화면 회원명: "${title}" / document.title="${docTitle}"`);
		if (!title.includes("김하늘테스트") || !docTitle.includes("김하늘테스트")) fails.push("조회 화면 회원명 미반영");

		// ③ 편집 화면 — 프리필 반영 + 회원명 읽기전용 + 상담일 존재
		await nav(c, "/check-doc-edit.html?docID=17");
		const editState = await ev(c, `(() => {
			const name = document.getElementById("m-name");
			const date = document.getElementById("m-date");
			return JSON.stringify({
				nameVal: name.value,
				readOnly: name.readOnly,
				hasDate: !!date,
				dateVal: date ? date.value : null,
			});
		})()`);
		const es = JSON.parse(editState || "{}");
		console.log(`편집 프리필: ${JSON.stringify(es)}`);
		if (es.nameVal !== "김하늘테스트") fails.push("편집 화면 프리필 회원명 미반영");
		if (!es.readOnly) fails.push("회원명 입력이 읽기전용 아님");
		if (!es.hasDate) fails.push("상담일 입력 없음");
		if (!es.dateVal) fails.push("상담일 프리필 없음");

		// ④ 상담일 변경 저장 → 조회 화면 작성일 반영
		await ev(c, `(() => { document.getElementById("m-date").value = "2026-09-01"; document.querySelector('[data-action="save-edit"]').click(); return 1; })()`);
		for (let i = 0; i < 40; i++) {
			const u = await ev(c, "location.pathname");
			if (u.includes("check-doc-view")) break;
			await new Promise((r) => setTimeout(r, 100));
		}
		await new Promise((r) => setTimeout(r, 800));
		const meta = await ev(c, `(document.getElementById("vh-meta").textContent || "").replace(/\\s+/g, " ").trim()`);
		console.log(`저장 후 조회 메타: ${meta}`);
		if (!meta.includes("2026-09-01")) fails.push("상담일 변경이 저장되지 않음");
		const title2 = await ev(c, `(document.getElementById("vh-title").textContent || "").trim()`);
		if (!title2.includes("김하늘테스트")) fails.push("상담일 저장 후 회원명 소실");

		console.log(`콘솔오류: ${c.errors.length}`);
		c.errors.slice(0, 4).forEach((e) => console.log(`   ${e}`));
		const ok = fails.length === 0 && c.errors.length === 0;
		console.log(ok ? "결과: 회원명 전파/상담일 편집 PASS" : `결과: FAIL → ${fails.join(" / ")}`);
		ws.close();
		process.exit(ok ? 0 : 1);
	} finally {
		killEdgeTree(edge, profileDir);
		server.close();
	}
}

main().catch((e) => { console.error(e); process.exit(1); });