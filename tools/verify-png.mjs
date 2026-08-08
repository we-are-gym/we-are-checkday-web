// 파일 용도: 회원 정보 PNG 내보내기 검증 — 비교(변화 분석) 탭에서 이미지 저장 클릭 시
// 캡처가 완료되고(버튼·셀렉터 복원) PNG 데이터가 생성되는지 헤드리스 엣지로 확인 + PNG 저장 (dev 전용)
// 기법: verify.mjs와 동일한 자체 정적 서버 + Edge --headless CDP; 앵커 click 가로채기로 dataURL 포착
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { inflateSync } from "node:zlib";
import { spawn, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { randomInt } from "node:crypto";

const ROOT = resolve(import.meta.dirname, "..");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 8400 + randomInt(200);
const DEBUG_PORT = 9400 + randomInt(799);
const OUT_DIR = join(ROOT, ".tmp-png-check");
mkdirSync(OUT_DIR, { recursive: true });

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

// ── PNG 픽셀 분석 (독립 실행) ──
// html2canvas가 만든 8비트 RGB/RGBA·비인터레이스 PNG를 디코드해
// ①저장 버튼 영역이 균일(비노출) ②탭 영역에 텍스트 존재 ③셀렉터 텍스트가 하단에 밀착하지 않음
// 을 도큐먼트 좌표 기준으로 확인한다.
function analyzePng(pngPath, geo) {
	const buf = readFileSync(pngPath);
	const CHUNK_START = 8;
	let off = CHUNK_START;
	let idat = Buffer.alloc(0);
	let width = 0, height = 0, colorType = 0;
	while (off + 12 <= buf.length) {
		const len = buf.readUInt32BE(off);
		const type = buf.toString("ascii", off + 4, off + 8);
		const data = buf.subarray(off + 8, off + 8 + len);
		if (type === "IHDR") {
			width = data.readUInt32BE(0);
			height = data.readUInt32BE(4);
			colorType = data[9];
			if (data[8] !== 8 || data[12] !== 0) throw new Error(`지원하지 않는 PNG: bit=${data[8]} interlace=${data[12]}`);
		} else if (type === "IDAT") {
			idat = Buffer.concat([idat, data]);
		} else if (type === "IEND") break;
		off += 12 + len;
	}
	const bpp = colorType === 6 ? 4 : colorType === 2 ? 3 : 0;
	if (!bpp) throw new Error(`지원하지 않는 colortype=${colorType}`);
	const raw = inflateSync(idat);
	const stride = width * bpp;
	const img = Buffer.alloc(stride * height);
	const paeth = (a, b, c) => {
		const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
		return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
	};
	for (let y = 0; y < height; y++) {
		const f = raw[y * (stride + 1)];
		const row = y * stride;
		const prev = row - stride;
		for (let x = 0; x < stride; x++) {
			const cur = raw[y * (stride + 1) + 1 + x];
			const left = x >= bpp ? img[row + x - bpp] : 0;
			const up = y > 0 ? img[prev + x] : 0;
			const ul = y > 0 && x >= bpp ? img[prev + x - bpp] : 0;
			img[row + x] =
				f === 0 ? cur :
				f === 1 ? cur + left :
				f === 2 ? cur + up :
				f === 3 ? cur + ((left + up) >> 1) :
				f === 4 ? cur + paeth(left, up, ul) : 0;
		}
	}
	const lum = (x, y) => {
		const i = y * stride + x * bpp;
		return (img[i] + img[i + 1] + img[i + 2]) / 3;
	};
	const region = (rect) => {
		const sx = Math.max(0, Math.round((rect.x - geo.main.x) * 2));
		const sy = Math.max(0, Math.round((rect.y - geo.main.y) * 2));
		const sw = Math.max(0, Math.min(width - sx, Math.round(rect.w * 2)));
		const sh = Math.max(0, Math.min(height - sy, Math.round(rect.h * 2)));
		const px = [];
		for (let y2 = sy; y2 < sy + sh; y2++)
			for (let x2 = sx; x2 < sx + sw; x2++) px.push(lum(x2, y2));
		return { px, sx, sy, sw, sh };
	};
	const stats = (r) => {
		const sorted = [...r.px].sort((a, b) => a - b);
		const med = sorted[Math.floor(sorted.length / 2)];
		const dev = sorted.reduce((s2, v) => s2 + Math.abs(v - med), 0) / Math.max(1, sorted.length);
		const light = sorted.filter((v) => v > 160).length;
		return { med, dev, light, n: sorted.length };
	};
	const exportBtn = geo.exportBtn ? stats(region(geo.exportBtn)) : null;
	const tabBar = geo.tabBtn ? stats(region(geo.tabBtn)) : null;
	const selR = region(geo.curSel);
	const sel = stats(selR);
	// 셀렉터 텍스트 하단 밀착 검사: 상자 하단 20%(캡처 좌표)에서 밝은 픽셀 수
	let bottomLight = 0;
	const bottomStart = selR.sy + Math.floor(selR.sh * 0.8);
	for (let y2 = bottomStart; y2 < selR.sy + selR.sh; y2++)
		for (let x2 = selR.sx; x2 < selR.sx + selR.sw; x2++)
			if (lum(x2, y2) > 160) bottomLight++;
	const selectCentered = sel.n > 0 && sel.light > 0 && bottomLight === 0;
	const exportBtnUniform = exportBtn && exportBtn.dev < 25 && exportBtn.light < exportBtn.n * 0.02;
	const tabBarTextual = tabBar && tabBar.light > 5;
	return { exportBtnUniform, tabBarTextual, selectCentered, exportBtn: exportBtn && exportBtn.dev, tabLight: tabBar && tabBar.light, selLight: sel.light, selBottom: bottomLight };
}

async function main() {
	await new Promise((r) => server.listen(PORT, r));
	const profileDir = join(tmpdir(), `verify-png-${Date.now()}`);
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

		await c.send("Runtime.evaluate", {
			expression: `(() => {
				window.__pngDataUrl = null;
				const orig = HTMLAnchorElement.prototype.click;
				HTMLAnchorElement.prototype.click = function () {
					if (this.href && this.href.startsWith("data:image/png")) window.__pngDataUrl = this.href;
					return orig.call(this);
				};
				return "ok";
			})()`,
			returnByValue: true,
		});

		// 비교(변화 분석) 탭 열기 — 셀렉터가 이미지에 포함되도록
		const tabRes = await c.send("Runtime.evaluate", {
			expression: `(() => {
				const tab = document.querySelector('.tab-btn[data-tab="compare"]');
				if (!tab) return "no-tab";
				tab.click();
				return document.getElementById("panel-compare").hidden ? "hidden" : "shown";
			})()`,
			returnByValue: true,
		});
		const tabState = tabRes.result?.value;
		await new Promise((r) => setTimeout(r, 300));

		// 캡처 직전: 화면 요소 지오메트리 + 캡처 중(버튼 숨김·셀렉터 스왑) DOM 상태 기록
		const geoRes = await c.send("Runtime.evaluate", {
			expression: `(() => {
				const r = (el) => { const b = el.getBoundingClientRect(); return { x: b.left + scrollX, y: b.top + scrollY, w: b.width, h: b.height }; };
				const mainEl = document.querySelector("main");
				const btn = document.getElementById("export-png-btn");
				const tabBtn = document.querySelector('.tab-btn[data-tab="compare"]');
				const curSel = document.getElementById("cmp-cur");
				// 캡처 중 상태를 잡기 위해 이미지 저장 클릭 후 후크: 버튼 숨김·셀렉터 스왑 상태를 스냅샷
				window.__captureSnapshot = null;
				const t0 = performance.now();
				const timer = setInterval(() => {
					if (performance.now() - t0 > 20000) { clearInterval(timer); return; }
					const btnVis = document.getElementById("export-png-btn").style.visibility;
					if (btnVis === "hidden" && window.__captureSnapshot === null) {
						const swapped = document.querySelectorAll(".export-select").length;
						const tabVis = [...document.querySelectorAll(".tab-btn")].every((t) => t.style.visibility === "");
						const curSelExists = !!document.getElementById("cmp-cur");
						window.__captureSnapshot = JSON.stringify({ swapped, tabVis, curSelExists });
						clearInterval(timer);
					}
				}, 30);
				return JSON.stringify({
					main: r(mainEl),
					exportBtn: btn ? r(btn) : null,
					tabBtn: tabBtn ? r(tabBtn) : null,
					curSel: curSel ? r(curSel) : null,
					mainScrollY: window.scrollY,
				});
			})()`,
			returnByValue: true,
		});
		const geo = JSON.parse(geoRes.result?.value || "{}");

		const selInfo = await c.send("Runtime.evaluate", {
			expression: `(() => {
				const cur = document.getElementById("cmp-cur");
				const tgt = document.getElementById("cmp-tgt");
				return { curOpts: cur ? cur.options.length : 0, tgtOpts: tgt ? tgt.options.length : 0 };
			})()`,
			returnByValue: true,
		});

		await c.send("Runtime.evaluate", {
			expression: `document.getElementById("export-png-btn").click(); "clicked"`,
			returnByValue: true,
		});

		let dataUrl = null;
		for (let i = 0; i < 120; i++) {
			const r = await c.send("Runtime.evaluate", {
				expression: "window.__pngDataUrl",
				returnByValue: true,
			});
			if (typeof r.result?.value === "string" && r.result.value.startsWith("data:image/png")) {
				dataUrl = r.result.value;
				break;
			}
			await new Promise((r2) => setTimeout(r2, 500));
		}

		const restored = await c.send("Runtime.evaluate", {
			expression: `(() => {
				const btn = document.getElementById("export-png-btn");
				const selects = document.querySelectorAll(".export-select").length;
				const hasCur = !!document.getElementById("cmp-cur");
				const hasTgt = !!document.getElementById("cmp-tgt");
				const tabsVisible = [...document.querySelectorAll(".tab-btn")].every((t) => t.style.visibility === "");
				return JSON.stringify({ btnVis: btn.style.visibility, selects, hasCur, hasTgt, tabsVisible });
			})()`,
			returnByValue: true,
		});

		let pngPath = null;
		if (dataUrl) {
			const b64 = dataUrl.slice("data:image/png;base64,".length);
			pngPath = join(OUT_DIR, `member-detail-compare_${Date.now()}.png`);
			writeFileSync(pngPath, Buffer.from(b64, "base64"));
		}

		const snapRes = await c.send("Runtime.evaluate", {
			expression: "window.__captureSnapshot",
			returnByValue: true,
		});
		const snap = JSON.parse(snapRes.result?.value || '{"swapped":-1,"tabVis":null,"curSelExists":null}');

		const rest = JSON.parse(restored.result?.value || "{}");
		const optInfo = selInfo.result?.value || {};
		const px = pngPath && geo.main ? analyzePng(pngPath, geo) : null;
		const ok =
			dataUrl &&
			rest.btnVis === "" &&
			rest.selects === 0 &&
			rest.hasCur &&
			rest.hasTgt &&
			rest.tabsVisible &&
			snap.swapped === 2 &&
			snap.tabVis === true &&
			snap.curSelExists === false &&
			(optInfo.curOpts || 0) > 0 &&
			(tabState === "shown" || tabState === "hidden") &&
			px?.exportBtnUniform &&
			px?.tabBarTextual &&
			px?.selectCentered &&
			c.errors.length === 0;
		console.log(`비교탭: ${tabState}  셀렉터옵션(cur=${optInfo.curOpts}/tgt=${optInfo.tgtOpts})`);
		console.log(`캡처중스냅샷: ${JSON.stringify(snap)}`);
		console.log(`복원상태: ${JSON.stringify(rest)}`);
		console.log(`픽셀분석: ${px ? (px.exportBtnUniform ? "저장버튼영역 균일(미노출)✓" : "저장버튼영역 불균일 ✗") + (px.tabBarTextual ? " 탭영역 텍스트존재✓" : " 탭영역 텍스트부재 ✗") + (px.selectCentered ? " 셀렉터텍스트위치정상✓" : " 셀렉터텍스트하단밀착 ✗") : "생략"}`);
		console.log(`PNG생성: ${dataUrl ? `${(dataUrl.length / 1024).toFixed(0)}KB → ${pngPath}` : "실패"}`);
		console.log(`콘솔오류: ${c.errors.length}`);
		c.errors.slice(0, 4).forEach((e) => console.log(`   ${e}`));
		console.log(ok ? "\n결과: PNG PASS" : "\n결과: PNG FAIL");
		ws.close();
		process.exit(ok ? 0 : 1);
	} finally {
		killEdgeTree(edge, profileDir);
		server.close();
	}
}

main().catch((e) => { console.error(e); process.exit(1); });