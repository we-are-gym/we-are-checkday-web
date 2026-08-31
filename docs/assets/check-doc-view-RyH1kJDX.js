import{_ as e,i as t,n,v as r}from"./app-header-CuEHiS1U.js";/* empty css                     */import{i,o as a,s as o,t as s}from"./utils-dom-AA-aQdFf.js";import{n as c,r as l}from"./member-store-CDj-khgH.js";import{c as u,d,l as f,t as p}from"./record-utils-dRhs2CuA.js";import{n as m}from"./member-utils-C3eDrFg1.js";import{t as h}from"./utils-url-B0nUYPTI.js";import{n as g}from"./utils-array-Dlk6KB1T.js";import{i as _}from"./assessment-data-BzkGwTxd.js";import{r as v,t as y}from"./record-stats-adRfrdmu.js";import{t as b}from"./inbody-smwfiy4b.js";import"./components-Cz5RrnRY.js";t(k),f.subscribe(t=>t.loading?r():e());var x=Number(h(`docID`));function S(){return p(f.getState().records,x)}function C(e){let t=e.payload,r=m(l.getState().members,e.memberId),i=r?r.name:`회원`;a(`vh-title`,`<a class="vh-member" href="member-detail.html?memberID=${encodeURIComponent(e.memberId)}">${n(i)}</a>`);let o=[[`회차`,t.session||`-`],[`작성일`,e.date],[`담당 트레이너`,t.trainer||`-`],[`총점`,`${g(t.scores||[])} / ${v(e.payload)}`]];a(`vh-meta`,o.map(([e,t])=>`<span class="meta-item"><b>${e}</b>${n(t)}</span>`).join(``)),document.title=`${t.session||`체크기록`} — ${i} 조회`}function w(e){let t=e.payload.ib||{};a(`ib-grid`,y.map(({key:e,label:r})=>{let i=t[e]!=null&&t[e]!==``,a=i?t[e]:`―`,o=i?b(e,t[e]):``;return`
				<div class="ib-cell">
					<div class="ib-label">${r}</div>
					<div class="ib-value">${n(a)}</div>
					${o}
				</div>`}).join(``)),o(`ib-comment`,e.payload.ibComment||``),s(`ib-comment`).style.display=e.payload.ibComment?``:`none`}function T(e){let{scores:t=[],evalData:r=[]}=e.payload;a(`eval-list`,_(e.payload).map((i,a)=>{let o=t[a]??0,s=r[a]||{checked:[],memo:``},c=(s.checked||[]).map(e=>`<li>${n(e)}</li>`).join(``);return`
				<div class="eval-view">
					<div class="ev-head">
						<div class="ev-num">${a+1}</div>
						<div class="ev-info">
							<div class="ev-name">${n(i.name)}</div>
							<div class="ev-desc">${n(i.desc)}</div>
						</div>
						<div class="ev-score">
							<span class="ev-score-val">${o}점</span>
							<ui-score-dots class="score-dots-el" score="${o}" max="3" count="3" prefix="view-${a}" aria-label="항목 ${a+1} 점수 ${o}점"></ui-score-dots>
						</div>
					</div>
					${c?`<ul class="ev-checks">${c}</ul>`:``}
					${s.memo?`<p class="ev-memo">${n(s.memo)}</p>`:``}
										${i.vo2&&e.payload.ibComment?`<p class="ev-vo2">${n(e.payload.ibComment)}</p>`:``}
				</div>`}).join(``)),o(`evals-total`,`총점 ${g(e.payload.scores||[])} / ${v(e.payload)}`)}function E(e){let{goals:t=[],goalMemo:r=``}=e.payload;a(`goal-chips`,t.length?t.map(e=>`<span class="goal-chip">${n(e)}</span>`).join(``):`<span class="goal-empty">설정한 목표가 없습니다</span>`),o(`goal-memo`,r||``),s(`goal-memo`).style.display=r?``:`none`}function D(e){let t=e.payload.feedbacks||[];a(`fb-views`,t.length?t.map(e=>`
						<div class="fb-view">
							<div class="fb-name">${n(e.name)}</div>
							${(e.checkItems||[]).map(e=>`<div class="fb-check${e.checked?` on`:``}"><span class="fb-mark">${e.checked?`✓`:`○`}</span>${n(e.text)}</div>`).join(``)}
							${e.memo?`<p class="fb-memo">${n(e.memo)}</p>`:``}
						</div>`).join(``):`<p class="goal-empty">기록된 피드백이 없습니다</p>`)}function O(e){let t=e.payload.consultMemo||``;o(`consult-memo`,t||`기록된 상담 메모가 없습니다.`)}async function k(){try{await c();let e=await d(x);f.setState(t=>({...t,records:[...t.records.filter(e=>e.id!==x),u(e)]}))}catch(e){console.error(`기록 조회 실패:`,e),s(`vh-title`).textContent=`기록을 불러오지 못했습니다`,s(`vh-meta`).textContent=e.message||`목록에서 다시 선택하세요.`,i(`.view-section`).forEach(e=>e.style.display=`none`),s(`btn-edit`).style.display=`none`;return}let e=S();if(!e){s(`vh-title`).textContent=`기록을 찾을 수 없습니다`,s(`vh-meta`).textContent=`목록에서 다시 선택하세요.`,i(`.view-section`).forEach(e=>e.style.display=`none`),s(`btn-edit`).style.display=`none`;return}C(e),w(e),T(e),E(e),D(e),O(e),s(`btn-edit`).href=`check-doc-edit.html?docID=${x}`}s(`btn-back`).addEventListener(`click`,()=>window.history.length>1?window.history.back():window.location.href=`members.html`),k();