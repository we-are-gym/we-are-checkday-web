// 파일 용도: 평가 논리 — 움직임 평가 목록 구성 · VO₂ 계산 연동 · 평가 카드 빌드 · 점수/등급/총점 갱신 (checkday 공용)
// DEPENDS: ASSESSMENT_ITEMS, ARR, VAL, UI, STATE, calcVo2Value, getVo2Grade, getGradeMeta

// ── 움직임 평가 데이터 (공용 모듈 7항목 + VO₂ 항목) ──
const evals = ASSESSMENT_ITEMS.concat([
	{
		name: "VO₂ Max (스텝 테스트)",
		desc: "심폐 지구력",
		checks: ["1분 HR 과도하게 높음", "HRR 회복 불량"],
		vo2: true,
	},
]);

/** 평가 점수 단일 소스 초기화 */
STATE.init(evals.length, 24);

// ── VO₂ 계산 (8번 항목에만) — 공용 모듈 사용 ──
const VO2_GRADE_STYLES = {
	excellent: { bg: "var(--green-bg)", fg: "var(--green-fg)" },
	good: { bg: "var(--blue-bg)", fg: "var(--blue-fg)" },
	above_avg: { bg: "var(--blue-bg)", fg: "var(--blue-fg)" },
	average: { bg: "var(--orange-bg)", fg: "var(--orange-fg)" },
	below_avg: { bg: "var(--orange-bg)", fg: "var(--orange-fg)" },
	poor: { bg: "var(--red-bg)", fg: "var(--red-fg)" },
	very_poor: { bg: "var(--red-bg)", fg: "var(--red-fg)" },
};

function calcVo2() {
	const age = VAL.num(UI.byId("vo2-age").value);
	const ht = VAL.num(UI.byId("vo2-ht").value);
	const wt = VAL.num(UI.byId("vo2-wt").value);
	const hr = VAL.num(UI.byId("vo2-hr").value);
	if (VAL.anyNaN(age, ht, wt, hr)) {
		UI.byId("vo2-result").style.display = "none";
		return;
	}
	const vr = calcVo2Value(age, ht, wt, hr);
	const gradeInfo = getVo2Grade(vr, age);
	const style = VO2_GRADE_STYLES[gradeInfo.grade];
	UI.byId("vo2-val").textContent = vr.toFixed(1) + " ml/kg/min";
	const badge = UI.byId("vo2-badge");
	badge.textContent = gradeInfo.label;
	badge.style.background = style.bg;
	badge.style.color = style.fg;
	UI.byId("vo2-result").style.display = "flex";
}

// ── 평가 카드 빌드 ──
function buildEvals() {
	const c = UI.byId("eval-cards");
	evals.forEach((e, i) => {
		const div = document.createElement("div");
		div.className = "eval-item";
		const dots = ARR.zeros(4)
			.map((_, j) => `<div class="dot" id="dot-${i}-${j}"></div>`)
			.join("");
		const tags = e.checks
			.map(
				(ch) =>
					`<span class="ctag" onclick="this.classList.toggle('on')">${ch}</span>`,
			)
			.join("");

		let inner = `
			<div class="eval-top">
				<div class="eval-num-badge">${i + 1}</div>
				<div style="flex:1"><div class="eval-name">${e.name}</div><div class="eval-desc">${e.desc}</div></div>
				<div class="score-ctrl">
					<button class="score-btn" onclick="adj(${i},-1)">−</button>
					<span class="score-val" id="sv-${i}">0</span>
					<button class="score-btn" onclick="adj(${i},+1)">+</button>
					<div class="sdots">${dots}</div>
				</div>
			</div>
			<button class="expand-toggle" id="et-${i}" onclick="toggleExpand(${i})">
				체크 항목 / 메모 <span class="arr">▾</span>
			</button>
			<div class="sub-panel" id="sp-${i}">
				<div class="tag-row" style="margin-top:6px">${tags}</div>
				<textarea class="eval-memo" placeholder="메모..."></textarea>`;
		if (e.vo2) {
			inner += `
				<div style="margin-top:8px;padding:10px;background:var(--surface2);border-radius:8px;">
					<div style="font-size:11px;font-weight:600;color:var(--text3);margin-bottom:8px;">VO₂ MAX 자동 계산</div>
					<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
						<div><label style="font-size:10px;color:var(--text3);display:block;margin-bottom:3px;">연령</label><input class="ib-num" id="vo2-age" type="number" placeholder="30" style="width:100%" oninput="calcVo2()"></div>
						<div><label style="font-size:10px;color:var(--text3);display:block;margin-bottom:3px;">신장 (cm)</label><input class="ib-num" id="vo2-ht" type="number" placeholder="165" style="width:100%" oninput="calcVo2()"></div>
						<div><label style="font-size:10px;color:var(--text3);display:block;margin-bottom:3px;">체중 (kg)</label><input class="ib-num" id="vo2-wt" type="number" placeholder="60" style="width:100%" oninput="calcVo2()"></div>
						<div><label style="font-size:10px;color:var(--text3);display:block;margin-bottom:3px;">1분 회복 심박수</label><input class="ib-num" id="vo2-hr" type="number" placeholder="100" style="width:100%" oninput="calcVo2()"></div>
					</div>
					<div id="vo2-result" style="display:none;align-items:center;gap:10px;flex-wrap:wrap;">
						<span id="vo2-val" style="font-size:15px;font-weight:600;"></span>
						<span id="vo2-badge" class="ib-tag" style="font-size:11px;"></span>
					</div>
					<div style="font-size:10px;color:var(--text3);margin-top:6px;">공식: 54.337 − 0.185(연령) + 0.097(신장) − 0.246(체중) − 0.112(심박수)</div>
				</div>`;
		}
		inner += `</div>`;
		div.innerHTML = inner;
		c.appendChild(div);
	});
}

function toggleExpand(i) {
	const sp = UI.byId(`sp-${i}`);
	const et = UI.byId(`et-${i}`);
	sp.classList.toggle("open");
	et.classList.toggle("open");
}

function adj(i, d) {
	const next = VAL.bound(STATE.get(i) + d, 0, 3);
	STATE.set(i, next);
	UI.byId(`sv-${i}`).textContent = next;
	for (let j = 0; j < 4; j++)
		UI.byId(`dot-${i}-${j}`).classList.toggle("on", j < next);
	updateTotal();
}

const GRADE_STYLES = {
	"평가 전": { bg: "var(--surface2)", fg: "var(--text3)", hint: "" },
	우수: {
		bg: "var(--green-bg)",
		fg: "var(--green-fg)",
		hint: "전반적으로 안정적인 패턴",
	},
	양호: {
		bg: "var(--blue-bg)",
		fg: "var(--blue-fg)",
		hint: "일부 패턴 보완 필요",
	},
	보통: {
		bg: "var(--orange-bg)",
		fg: "var(--orange-fg)",
		hint: "주요 패턴 집중 개선 권장",
	},
	"개선 필요": {
		bg: "var(--red-bg)",
		fg: "var(--red-fg)",
		hint: "기초 움직임 패턴 재교육 필요",
	},
};

function updateTotal() {
	const tot = STATE.total();
	const max = STATE.max;
	const pct = Math.round((tot / max) * 100);
	UI.byId("total-num").innerHTML = `${tot} <span>/ ${max}</span>`;
	UI.byId("prog-fill").style.width = pct + "%";
	const pill = UI.byId("grade-pill");
	const hint = UI.byId("grade-hint");
	const meta = getGradeMeta(tot, max);
	const style = GRADE_STYLES[meta.label];
	pill.textContent = meta.label;
	pill.style.background = style.bg;
	pill.style.color = style.fg;
	hint.textContent = style.hint;
}