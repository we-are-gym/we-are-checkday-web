import{i as e,n as t,o as n,t as r}from"./app-header-CP8G8khd.js";/* empty css                     */import{i,o as a,s as o,t as s}from"./utils-dom-AA-aQdFf.js";import{n as c,r as l}from"./member-store-B2Qb6oPS.js";import{c as u,d,l as f,t as p}from"./record-utils-BSoo_L_t.js";import{n as m}from"./member-utils-C3eDrFg1.js";import{t as h}from"./utils-url-B0nUYPTI.js";import{i as g}from"./assessment-data-D8np2VSY.js";import{r as _,t as v}from"./record-stats-CUNftL6o.js";import{t as y}from"./inbody-smwfiy4b.js";n();var b=Number(h(`docID`));function x(){return p(f.getState().records,b)}function S(n){let r=n.payload,i=m(l.getState().members,n.memberId),o=i?i.name:`회원`;a(`vh-title`,`<a class="vh-member" href="member-detail.html?memberID=${encodeURIComponent(n.memberId)}">${t(o)}</a>`);let s=[[`회차`,r.session||`-`],[`작성일`,n.date],[`담당 트레이너`,r.trainer||`-`],[`총점`,`${e(r.scores||[])} / ${_(n.payload)}`]];a(`vh-meta`,s.map(([e,n])=>`<span class="meta-item"><b>${e}</b>${t(n)}</span>`).join(``)),document.title=`${r.session||`체크기록`} — ${o} 조회`}function C(e){let n=e.payload.ib||{};a(`ib-grid`,v.map(({key:e,label:r})=>{let i=n[e]!=null&&n[e]!==``,a=i?n[e]:`―`,o=i?y(e,n[e]):``;return`
				<div class="ib-cell">
					<div class="ib-label">${r}</div>
					<div class="ib-value">${t(a)}</div>
					${o}
				</div>`}).join(``)),o(`ib-comment`,e.payload.ibComment||``),s(`ib-comment`).style.display=e.payload.ibComment?``:`none`}function w(n){let{scores:i=[],evalData:s=[]}=n.payload;a(`eval-list`,g(n.payload).map((e,a)=>{let o=i[a]??0,c=s[a]||{checked:[],memo:``},l=(c.checked||[]).map(e=>`<li>${t(e)}</li>`).join(``);return`
				<div class="eval-view">
					<div class="ev-head">
						<div class="ev-num">${a+1}</div>
						<div class="ev-info">
							<div class="ev-name">${t(e.name)}</div>
							<div class="ev-desc">${t(e.desc)}</div>
						</div>
						<div class="ev-score">
							<span class="ev-score-val">${o}점</span>
							<span class="score-dots">${r.viewScoreDots({score:o})}</span>
						</div>
					</div>
					${l?`<ul class="ev-checks">${l}</ul>`:``}
					${c.memo?`<p class="ev-memo">${t(c.memo)}</p>`:``}
					${e.vo2&&n.payload.vo2Comment?`<p class="ev-vo2">${t(n.payload.vo2Comment)}</p>`:``}
				</div>`}).join(``)),o(`evals-total`,`총점 ${e(n.payload.scores||[])} / ${_(n.payload)}`)}function T(e){let{goals:n=[],goalMemo:r=``}=e.payload;a(`goal-chips`,n.length?n.map(e=>`<span class="goal-chip">${t(e)}</span>`).join(``):`<span class="goal-empty">설정한 목표가 없습니다</span>`),o(`goal-memo`,r||``),s(`goal-memo`).style.display=r?``:`none`}function E(e){let n=e.payload.feedbacks||[];a(`fb-views`,n.length?n.map(e=>`
						<div class="fb-view">
							<div class="fb-name">${t(e.name)}</div>
							${(e.checkItems||[]).map(e=>`<div class="fb-check${e.checked?` on`:``}"><span class="fb-mark">${e.checked?`✓`:`○`}</span>${t(e.text)}</div>`).join(``)}
							${e.memo?`<p class="fb-memo">${t(e.memo)}</p>`:``}
						</div>`).join(``):`<p class="goal-empty">기록된 피드백이 없습니다</p>`)}function D(e){let t=e.payload.consultMemo||``;o(`consult-memo`,t||`기록된 상담 메모가 없습니다.`)}async function O(){try{await c();let e=await d(b);f.setState(t=>({...t,records:[...t.records.filter(e=>e.id!==b),u(e)]}))}catch(e){console.error(`기록 조회 실패:`,e),s(`vh-title`).textContent=`기록을 불러오지 못했습니다`,s(`vh-meta`).textContent=e.message||`목록에서 다시 선택하세요.`,i(`.view-section`).forEach(e=>e.style.display=`none`),s(`btn-edit`).style.display=`none`;return}let e=x();if(!e){s(`vh-title`).textContent=`기록을 찾을 수 없습니다`,s(`vh-meta`).textContent=`목록에서 다시 선택하세요.`,i(`.view-section`).forEach(e=>e.style.display=`none`),s(`btn-edit`).style.display=`none`;return}S(e),C(e),w(e),T(e),E(e),D(e),s(`btn-edit`).href=`check-doc-edit.html?docID=${b}`}s(`btn-back`).addEventListener(`click`,()=>window.history.length>1?window.history.back():window.location.href=`members.html`),O();