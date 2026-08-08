// 파일 용도: 상승·하강 인식 규칙 검증 — member-detail 비교 테이블에서
// to-be 규칙(우측 현재 > 좌측 비교대상 ⇒ 상승 ▲, 반대 ⇒ 하강 ▼)이 지켜지는지 헤드리스 엣지로 확인 (dev 전용)
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
	if (!existsSync(file) || !statSync(file).isFile) {
		res.statusCode = 404;
		return res.end("not found");
	}
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
	for (let i = 0; i < 40; i++) {
		try {
			const r = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json`);
			if (r.ok) return await r.json();
		} catch {}
		await new Promise((r2) => setTimeout(r2, 200));
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

async function main() {
	await new Promise((r) => server.listen(PORT, r));
	const profileDir = join(tmpdir(), `check-compare-${Date.now()}`);
	const edge = startEdge(profileDir);
	try {
		const list = await jsonList();
		const page = list.find((t) => t.type === "page");
		const ws = new WebSocket(page.webSocketDebuggerUrl);
		await new Promise((res, rej) => { ws.addEventListener("open", res); ws.addEventListener("error", rej); });
		const c = attachCdp(ws).newSession();
		await c.send("Page.enable");
		await c.send("Runtime.enable");
		await c.send("Log.enable");
		const loaded = c.waitEvent("Page.loadEventFired");
		await c.send("Page.navigate", { url: `http://localhost:${PORT}/member-detail.html?memberID=6` });
		await loaded;
		await new Promise((r) => setTimeout(r, 1200));

		const r = await c.send("Runtime.evaluate", {
			expression: `(() => {
				const rows = [];
				const tables = document.querySelectorAll("#compare-result .compare-table");
				for (const tbl of tables) {
					tbl.querySelectorAll("tbody tr").forEach((tr) => {
						const tds = tr.querySelectorAll("td");
						if (tds.length < 4) return;
						const deltaTd = tds[3];
						const deltaCls = deltaTd.querySelector(".delta-up, .delta-down, .delta-flat");
						const l = parseFloat((tds[1].textContent || "").trim());
						const rv = parseFloat((tds[2].textContent || "").trim());
						if (Number.isNaN(l) || Number.isNaN(rv)) return;
						rows.push({
							label: (tds[0].textContent || "").trim(),
							left: l, right: rv,
							dir: deltaCls ? (deltaCls.classList.contains("delta-up") ? "up" : deltaCls.classList.contains("delta-down") ? "down" : "flat") : "none",
						});
					});
				}
				return JSON.stringify({ rows });
			})()`,
			returnByValue: true,
		});

		const { rows } = JSON.parse(r.result?.value || "{}");
		const bad = rows.filter((row) => {
			const expect = row.right > row.left ? "up" : row.right < row.left ? "down" : "flat";
			return row.dir !== expect;
		});
		console.log(`비교 행: ${rows.length}개`);
		rows.forEach((x) => console.log(`  ${x.label} 좌=${x.left} 우=${x.right} → ${x.dir}${x.dir === "up" ? " ▲" : x.dir === "down" ? " ▼" : ""}`));
		console.log(`규칙 위반: ${bad.length}개`);
		bad.slice(0, 5).forEach((x) => console.log(`  ✗ ${x.label} (우>좌인데 ${x.dir})`));
		console.log(`콘솔오류: ${c.errors.length}`);
		c.errors.slice(0, 3).forEach((e) => console.log(`   ${e}`));
		console.log(bad.length === 0 && c.errors.length === 0 ? "\n결과: 비교 규칙 PASS" : "\n결과: 비교 규칙 FAIL");
		ws.close();
		process.exit(bad.length === 0 && c.errors.length === 0 ? 0 : 1);
	} finally {
		killEdgeTree(edge, profileDir);
		server.close();
	}
}

main().catch((e) => { console.error(e); process.exit(1); });