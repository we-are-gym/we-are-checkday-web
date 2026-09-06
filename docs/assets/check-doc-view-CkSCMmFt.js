import{i as e,r as t}from"./app-header-CTxcyEpO.js";/* empty css                     */import{i as n,o as r,s as i,t as a}from"./utils-dom-AA-aQdFf.js";import{n as o,r as s}from"./member-store-BW42P3lL.js";import{c,d as l,l as u,t as d}from"./record-utils-DVlfXO0n.js";import{n as f}from"./member-utils-C3eDrFg1.js";import{n as p,t as m}from"./loading-overlay-BYL9g967.js";import{t as h}from"./utils-url-B0nUYPTI.js";import{n as g}from"./utils-array-Dlk6KB1T.js";import{i as _}from"./assessment-data-BzkGwTxd.js";import{r as v,t as y}from"./record-stats-BM-4UNe3.js";import{t as b}from"./inbody-smwfiy4b.js";import"./components-CULovy1R.js";e(k),u.subscribe(e=>e.loading?p():m());var x=Number(h(`docID`));function S(){return d(u.getState().records,x)}function C(e){let n=e.payload,i=f(s.getState().members,e.memberId),a=i?i.name:`회원`;r(`vh-title`,`<a class="vh-member" href="member-detail.html?memberID=${encodeURIComponent(e.memberId)}">${t(a)}</a>`);let o=[[`회차`,n.session||`-`],[`작성일`,e.date],[`담당 트레이너`,n.trainer||`-`],[`총점`,`${g(n.scores||[])} / ${v(e.payload)}`]];r(`vh-meta`,o.map(([e,n])=>`<span class="meta-item"><b>${e}</b>${t(n)}</span>`).join(``)),document.title=`${n.session||`체크기록`} — ${a} 조회`}function w(e){let n=e.payload.ib||{};r(`ib-grid`,y.map(({key:e,label:r})=>{let i=n[e]!=null&&n[e]!==``,a=i?n[e]:`―`,o=i?b(e,n[e]):``;return`
				<div class="ib-cell">
					<div class="ib-label">${r}</div>
					<div class="ib-value">${t(a)}</div>
					${o}
				</div>`}).join(``)),i(`ib-comment`,e.payload.ibComment||``),a(`ib-comment`).style.display=e.payload.ibComment?``:`none`}function T(e){let{scores:n=[],evalData:a=[]}=e.payload;r(`eval-list`,_(e.payload).map((r,i)=>{let o=n[i]??0,s=a[i]||{checked:[],memo:``},c=(s.checked||[]).map(e=>`<li>${t(e)}</li>`).join(``);return`
				<div class="eval-view">
					<div class="ev-head">
						<div class="ev-num">${i+1}</div>
						<div class="ev-info">
							<div class="ev-name">${t(r.name)}</div>
							<div class="ev-desc">${t(r.desc)}</div>
						</div>
						<div class="ev-score">
							<span class="ev-score-val">${o}점</span>
							<ui-score-dots class="score-dots-el" score="${o}" max="3" count="3" prefix="view-${i}" aria-label="항목 ${i+1} 점수 ${o}점"></ui-score-dots>
						</div>
					</div>
					${c?`<ul class="ev-checks">${c}</ul>`:``}
					${s.memo?`<p class="ev-memo">${t(s.memo)}</p>`:``}
										${r.vo2&&e.payload.ibComment?`<p class="ev-vo2">${t(e.payload.ibComment)}</p>`:``}
				</div>`}).join(``)),i(`evals-total`,`총점 ${g(e.payload.scores||[])} / ${v(e.payload)}`)}function E(e){let{goals:n=[],goalMemo:o=``}=e.payload;r(`goal-chips`,n.length?n.map(e=>`<span class="goal-chip">${t(e)}</span>`).join(``):`<span class="goal-empty">설정한 목표가 없습니다</span>`),i(`goal-memo`,o||``),a(`goal-memo`).style.display=o?``:`none`}function D(e){let n=e.payload.feedbacks||[];r(`fb-views`,n.length?n.map(e=>`
						<div class="fb-view">
							<div class="fb-name">${t(e.name)}</div>
							${(e.checkItems||[]).map(e=>`<div class="fb-check${e.checked?` on`:``}"><span class="fb-mark">${e.checked?`✓`:`○`}</span>${t(e.text)}</div>`).join(``)}
							${e.memo?`<p class="fb-memo">${t(e.memo)}</p>`:``}
						</div>`).join(``):`<p class="goal-empty">기록된 피드백이 없습니다</p>`)}function O(e){let t=e.payload.consultMemo||``;i(`consult-memo`,t||`기록된 상담 메모가 없습니다.`)}async function k(){try{await o();let e=await l(x);u.setState(t=>({...t,records:[...t.records.filter(e=>e.id!==x),c(e)]}))}catch(e){console.error(`기록 조회 실패:`,e),a(`vh-title`).textContent=`기록을 불러오지 못했습니다`,a(`vh-meta`).textContent=e.message||`목록에서 다시 선택하세요.`,n(`.view-section`).forEach(e=>e.style.display=`none`),a(`btn-edit`).style.display=`none`;return}let e=S();if(!e){a(`vh-title`).textContent=`기록을 찾을 수 없습니다`,a(`vh-meta`).textContent=`목록에서 다시 선택하세요.`,n(`.view-section`).forEach(e=>e.style.display=`none`),a(`btn-edit`).style.display=`none`;return}C(e),w(e),T(e),E(e),D(e),O(e),a(`btn-edit`).href=`check-doc-edit.html?docID=${x}`}a(`btn-back`).addEventListener(`click`,()=>window.history.length>1?window.history.back():window.location.href=`members.html`),k();