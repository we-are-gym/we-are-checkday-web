(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e={error:{bg:`#fee2e2`,fg:`#991b1b`,border:`#fca5a5`,icon:`✕`},warning:{bg:`#fef3c7`,fg:`#92400e`,border:`#fde68a`,icon:`⚠`},success:{bg:`#d1fae5`,fg:`#065f46`,border:`#6ee7b7`,icon:`✓`},info:{bg:`#dbeafe`,fg:`#1e40af`,border:`#93c5fd`,icon:`ℹ`}},t=null;if(typeof HTMLElement<`u`){class n extends HTMLElement{_toasts=[];_nextId=0;connectedCallback(){t=this,this._renderShell()}disconnectedCallback(){t===this&&(t=null),this._toasts.forEach(e=>clearTimeout(e.timer)),this._toasts=[]}_renderShell(){if(this.querySelector(`.toast-container`))return;let e=document.createElement(`div`);e.className=`toast-container`,e.setAttribute(`role`,`status`),e.setAttribute(`aria-live`,`polite`),e.style.cssText=`position:fixed;top:1rem;right:1rem;z-index:10000;display:flex;flex-direction:column;gap:.5rem;pointer-events:none;max-width:360px;`,this.appendChild(e);let t=document.createElement(`div`);t.className=`loading-overlay`,t.style.cssText=`position:fixed;inset:0;z-index:9999;background:rgba(255,255,255,.65);display:none;align-items:center;justify-content:center;`,t.innerHTML=`<div style="display:flex;flex-direction:column;align-items:center;gap:.75rem;"><div class="spinner" style="width:32px;height:32px;border:3px solid #e5e7eb;border-top-color:#3b82f6;border-radius:50%;animation:es-toast-spin .6s linear infinite;"></div><span style="font-size:14px;color:#374151;">로딩 중…</span></div>`;let n=document.createElement(`style`);n.textContent=`@keyframes es-toast-spin{to{transform:rotate(360deg)}}`,this.appendChild(n),this.appendChild(t)}show(t,{type:n=`info`,duration:r=3e3,action:i}={}){let a=this.querySelector(`.toast-container`);if(!a)return;let o=e[n]||e.info,s=this._nextId++,c=document.createElement(`div`);c.className=`toast-item`,c.style.cssText=`pointer-events:auto;display:flex;align-items:flex-start;gap:.5rem;padding:.75rem 1rem;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.12);font-size:14px;line-height:1.4;color:${o.fg};background:${o.bg};border:1px solid ${o.border};animation:es-toast-slide .2s ease-out;`;let l=document.createElement(`span`);l.style.cssText=`font-weight:700;font-size:16px;flex-shrink:0;`,l.textContent=o.icon,c.appendChild(l);let u=document.createElement(`span`);if(u.style.cssText=`flex:1;word-break:break-word;`,u.textContent=t,c.appendChild(u),i){let e=document.createElement(`button`);e.style.cssText=`background:none;border:none;color:${o.fg};text-decoration:underline;cursor:pointer;font-size:14px;padding:0;margin-left:.5rem;white-space:nowrap;`,e.textContent=i.label,e.addEventListener(`click`,()=>{i.onClick(),this._removeToast(s)}),c.appendChild(e)}let d=document.createElement(`button`);d.style.cssText=`background:none;border:none;font-size:16px;cursor:pointer;padding:0;margin-left:.25rem;color:inherit;opacity:.6;flex-shrink:0;`,d.textContent=`×`,d.setAttribute(`aria-label`,`닫기`),d.addEventListener(`click`,()=>this._removeToast(s)),c.appendChild(d),a.appendChild(c);let f=r>0?setTimeout(()=>this._removeToast(s),r):null;this._toasts.push({id:s,el:c,timer:f})}hideAll(){this._toasts.forEach(e=>{clearTimeout(e.timer),e.el.remove()}),this._toasts=[]}showLoading(){let e=this.querySelector(`.loading-overlay`);e&&(e.style.display=`flex`)}hideLoading(){let e=this.querySelector(`.loading-overlay`);e&&(e.style.display=`none`)}_removeToast(e){let t=this._toasts.findIndex(t=>t.id===e);if(t===-1)return;let[n]=this._toasts.splice(t,1);clearTimeout(n.timer),n.el.style.animation=`es-toast-slide .15s ease-in reverse`,setTimeout(()=>n.el.remove(),150)}}customElements.define(`es-toast`,n)}function n(e,n){let r=t||document.querySelector(`es-toast`);r&&r.show(e,n)}function r(){let e=t||document.querySelector(`es-toast`);e&&e.showLoading()}function i(){let e=t||document.querySelector(`es-toast`);e&&e.hideLoading()}var a=`checkday.auth.v1`,o=`checkday.refresh.v1`,s=`checkday:authchange`;function c(){if(sessionStorage.removeItem(a),sessionStorage.removeItem(o),!window.location.pathname.endsWith(`login.html`)){let e=encodeURIComponent(window.location.href);window.location.replace(`login.html?redirect=${e}`)}}var l=`https://checkday-rest-evztw4wu4q-du.a.run.app/api/v1`,u=class extends Error{constructor(e,t,n){super(e),this.name=`ApiError`,this.code=t,this.status=n}};function d(e){let{"@namespaces":t,"@controls":n,"@embedded":r,"@error":i,"@meta":a,...o}=e;return r&&Object.assign(o,r),o}function f(e,t){sessionStorage.setItem(a,e),sessionStorage.setItem(o,t),m()}function p(){sessionStorage.removeItem(a),sessionStorage.removeItem(o),m()}function m(){typeof window>`u`||window.dispatchEvent(new CustomEvent(s))}function h(e){try{let t=e.split(`.`)[1].replace(/-/g,`+`).replace(/_/g,`/`);return JSON.parse(atob(t)).exp*1e3<Date.now()}catch{return!0}}var g=null;async function _(){if(g)return g;g=v();try{return await g}finally{g=null}}async function v(){let e=sessionStorage.getItem(o);if(!e)return!1;try{let t=await fetch(`${l}/auth/refresh`,{method:`POST`,headers:{Accept:`application/json`,"Content-Type":`application/json`},body:JSON.stringify({refresh_token:e})});if(!t.ok)return!1;let n=d(await t.json());return n.access_token&&n.refresh_token?(f(n.access_token,n.refresh_token),!0):!1}catch{return!1}}async function y(e,t=null){let n=t;if(n===null)try{n=await e.json()}catch{n={}}let r=n[`@error`],i;return r?i=r[`@message`]:Array.isArray(n.detail)&&n.detail.length>0&&(i=n.detail.map(e=>e.msg).join(`; `)),new u(i||`요청을 처리할 수 없습니다`,r?.[`@code`]||`request_failed`,e.status)}async function b(e,{method:t=`GET`,body:n=null,token:r=null,as:i=`json`}={}){let o=`${l}${e}`,s={Accept:`application/json`},f=r??sessionStorage.getItem(`checkday.auth.v1`);f&&(s.Authorization=`Bearer ${f}`),n!==null&&(s[`Content-Type`]=`application/json`);let p=()=>fetch(o,{method:t,headers:s,body:n===null?void 0:JSON.stringify(n)}),m=await p();if(m.status===401){if(!f)throw c(),new u(`인증이 필요합니다`,`unauthorized`,401);if(h(f)){if(await _()){if(s.Authorization=`Bearer ${sessionStorage.getItem(a)}`,m=await p(),m.status===401)throw c(),new u(`갱신 후 인증이 거부되었습니다`,`refresh_retry_rejected`,401)}else throw c(),new u(`인증이 만료되었습니다`,`token_expired`,401)}else throw c(),new u(`인증이 거부되었습니다`,`token_rejected`,401)}if(i===`blob`){if(!m.ok)throw await y(m);return m.blob()}let g={};try{g=await m.json()}catch{g={}}if(!m.ok||g[`@error`])throw await y(m,g);let v=d(g);return v.items===void 0?v:v.items}async function x(e,t={}){try{return await b(e,t)}catch(e){throw e?.status!==401&&n(e.message||`요청을 처리할 수 없습니다`,{type:`error`}),e}}async function S(e,t={}){try{return await b(e,{...t,as:`blob`})}catch(e){throw e?.status!==401&&n(e.message||`요청을 처리할 수 없습니다`,{type:`error`}),e}}function C(){let e=sessionStorage.getItem(a);return e?!h(e):!1}function w(e){window.addEventListener(`pageshow`,async t=>{if(t.persisted){if(!C()){c();return}if(e)try{await e()}catch(e){console.error(`bfcache 복원 후 화면 데이터 갱신 실패:`,e)}}})}async function T(e,t){let n=await x(`/auth/login`,{method:`POST`,body:{username:e,password:t}});return f(n.access_token,n.refresh_token),n}function E(){p()}var D=new Set;function O(e){return D.add(e),()=>D.delete(e)}function k(){D.forEach(e=>e())}typeof window<`u`&&(window.addEventListener(s,()=>k()),window.addEventListener(`storage`,e=>{(e.key===`checkday.auth.v1`||e.key===`checkday.refresh.v1`)&&k()}));function A(e,t){class n extends HTMLElement{connectedCallback(){t.connectedCallback&&t.connectedCallback.call(this),this.refresh(),t.onConnect&&t.onConnect.call(this)}refresh(){this.innerHTML=t.render.call(this),t.refreshAfter&&t.refreshAfter.call(this)}}for(let e of Object.keys(t))e!==`render`&&e!==`onConnect`&&e!==`refreshAfter`&&e!==`connectedCallback`&&typeof t[e]==`function`&&(n.prototype[e]=t[e]);return customElements.define(e,n),n}function j(e){return String(e).replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`"`,`&quot;`).replaceAll(`'`,`&#39;`)}var M=[`💪 근력 향상`,`🔥 체지방 감소`,`🧘 자세 교정`,`🏃 체력 향상`,`⚖️ 체중 유지`,`🦵 하체 강화`,`🤸 유연성 개선`,`🩺 통증 개선`,`📈 근육량 증가`],N=`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.8V21h14V9.8"/></svg>`,P={scoreController({index:e,max:t,score:n=0}){return`<ui-score-controller class="score-ctrl-el" id="sc-${e}" score="${n}" max="${t}" min="0" dots="${t}" index="${e}" interactive show-value aria-label="항목 ${e+1} 점수"></ui-score-controller>`},assessmentCard({index:e,item:t,tags:n,extra:r=``}){return`
			<div class="eval-item">
				<div class="eval-top">
					<div class="eval-num-badge">${e+1}</div>
					<div style="flex:1"><div class="eval-name">${j(t.name)}</div><div class="eval-desc">${j(t.desc)}</div></div>
					${P.scoreController({index:e,max:3})}
				</div>
				<button class="expand-toggle" id="et-${e}" data-i="${e}" aria-expanded="false" aria-controls="sp-${e}">
					체크 항목 / 메모 <span class="arr">▾</span>
				</button>
				<div class="sub-panel" id="sp-${e}">
					<div class="tag-row" style="margin-top:6px">${n}</div>
					<textarea class="eval-memo" placeholder="메모..." title="메모"></textarea>
					${r}
				</div>
			</div>`},basicItemCard({id:e,item:t,checks:n}){return`
			<div class="item-card" id="card-${e}">
				<div class="item-top">
					<div class="item-num">${e}</div>
					<div class="item-info">
						<div class="item-name">${j(t.name)}</div>
						<div class="item-desc">${j(t.desc)}</div>
					</div>
					${P.scoreController({index:e,max:3})}
				</div>
				<button class="expand-btn" id="expand-${e}" data-id="${e}" aria-expanded="false" aria-controls="detail-${e}">
					체크 항목 / 메모
					<span class="expand-arrow">▾</span>
				</button>
				<div class="item-detail" id="detail-${e}">
					${n}
					<textarea class="notes-area" id="notes-${e}" data-id="${e}" placeholder="메모를 입력하세요..."></textarea>
				</div>
			</div>`},inbodyCell({label:e,id:t,placeholder:n,step:r=`0.1`,tagId:i,last:a=!1}){let o=a?`ib-cell no-border-b`:`ib-cell`,s=r?` step="${j(r)}"`:``;return`
			<div class="${o}">
				<label for="${t}">${j(e)}</label>
				<input class="ib-num" id="${t}" type="number" placeholder="${j(n)}"${s} />
				<div id="${i}"></div>
			</div>`},inbodyGrid(){return[this.inbodyCell({label:`체중 (kg)`,id:`ib-w`,placeholder:`65.0`,tagId:`tag-w`}),this.inbodyCell({label:`골격근량 (kg)`,id:`ib-m`,placeholder:`28.0`,tagId:`tag-m`}),this.inbodyCell({label:`체지방량 (kg)`,id:`ib-fat`,placeholder:`18.0`,tagId:`tag-fat`}),this.inbodyCell({label:`BMI`,id:`ib-bmi`,placeholder:`23.5`,tagId:`tag-bmi`,last:!0}),this.inbodyCell({label:`체지방률 (%)`,id:`ib-bfp`,placeholder:`27.0`,tagId:`tag-bfp`,last:!0}),this.inbodyCell({label:`기초대사량 (kcal)`,id:`ib-bmr`,placeholder:`1450`,step:``,tagId:`tag-bmr`,last:!0})].join(``)},goalTag(e){return`<div class="goal-tag" role="button" tabindex="0" aria-pressed="false">${j(e)}</div>`},goalTags(){return M.map(e=>this.goalTag(e)).join(``)},fbCheckRow(e=``){return`
			<div class="fb-check-row">
				<input type="checkbox" style="accent-color:var(--blue);flex-shrink:0;" aria-label="체크 선택">
				<input class="fb-check-input" type="text" value="${j(e)}" placeholder="체크 항목..." aria-label="체크 항목">
				<button class="fb-check-del" title="삭제" aria-label="체크 항목 삭제">✕</button>
			</div>`},feedbackCard({id:e,name:t,checkItems:n}){let r=n.map(e=>P.fbCheckRow(e)).join(``);return`
			<div class="fb-item" id="fb-item-${e}">
				<div class="fb-item-header">
					<input class="fb-move-input" type="text" value="${j(t)}" placeholder="동작명 (예: 스쿼트)" aria-label="동작명">
					<button class="fb-del-btn" title="삭제" aria-label="피드백 삭제">✕</button>
				</div>
				<div class="fb-checks-wrap">${r}</div>
				<button class="add-check-btn" aria-label="체크 항목 추가">+ 체크 항목 추가</button>
				<textarea class="eval-memo" placeholder="코칭 포인트 메모..." style="margin-top:6px;" title="코칭 포인트 메모" aria-label="코칭 포인트 메모"></textarea>
			</div>`},memberRow({id:e,name:t,gender:n,trainer:r,recordCount:i}){return`
			<tr class="member-row" data-member-id="${e}" tabindex="0" role="link" aria-label="${j(t)} 상세 보기">
				<td class="member-name">${j(t)}</td>
				<td class="member-gender">${j(n||`-`)}</td>
				<td class="member-trainer">${j(r||`-`)}</td>
				<td class="member-count">${i}회</td>
				<td class="member-action"><button type="button" class="member-remove" data-remove-id="${e}" aria-label="${j(t)} 삭제">삭제</button></td>
			</tr>`},recordRow({id:e,session:t,date:n,total:r,max:i}){return`
			<div class="record-row" data-record-id="${e}" tabindex="0" role="link" aria-label="${j(t)} ${j(n)} 총점 ${r}/${i}">
				<div class="cell-name">${j(t)}</div>
				<div class="cell-dim">${j(n)}</div>
				<div class="cell-dim">총점 ${r}/${i}</div>
				<div><button type="button" class="btn btn-sm btn-danger" data-del-record="${e}" aria-label="기록 삭제">삭제</button></div>
			</div>`},compareTableRow({label:e,left:t,right:n,delta:r}){return`
			<tr>
				<td>${j(e)}</td>
				<td>${t}</td>
				<td>${n}</td>
				<td>${r}</td>
			</tr>`},compareTable({extraClassNames:e=[],itemLabel:t,leftLabel:n=``,rightLabel:r=``,rows:i,footRows:a,withHeader:o=!0,ariaLabel:s=``}){let c=s?` aria-label="${j(s)}"`:``,l=o?`<thead><tr><th>${t}</th><th>${j(n)}</th><th>${j(r)}</th><th>변화</th></tr></thead>`:``,u=a===void 0?``:`
				<tfoot>
					${a.map(e=>P.compareTableRow(e)).join(``)}
				</tfoot>
			`;return`
			<table class="compare-table ${e.join(` `)}"${c}>
				${l}
				${u}
				<tbody>
					${i.map(e=>P.compareTableRow(e)).join(``)}
				</tbody>
			</table>`},loginForm(){return`
			<form class="login-form" id="login-form" novalidate>
<div class="field"><label for="login-id">아이디</label><input type="text" id="login-id" placeholder="아이디 입력" autocomplete="username" aria-label="아이디" aria-required="true"></div>
			<div class="field"><label for="login-pw">비밀번호</label><input type="password" id="login-pw" placeholder="비밀번호 입력" autocomplete="current-password" aria-label="비밀번호" aria-required="true"></div>
				<button class="btn btn-primary" type="submit">로그인</button>
				<div style="text-align:center; font-size:10.0px; color:var(--text3); margin-top:4px;">
					로그인 후에는 자동으로 로그인 상태가 유지돼요
				</div>
			</form>`},headerBar({crumbPath:e=``,navHtml:t=``}={}){let n=e.split(`|`).filter(Boolean).map(e=>{let t=e.indexOf(`>`);return t===-1?{href:``,label:e}:{href:e.slice(0,t),label:e.slice(t+1)}});return`
			<header class="site-header" role="banner">
				<a class="logo" href="index.html" aria-label="메인으로 이동">
					<span class="logo-mark" role="img" aria-label="위아짐 심볼"></span>
					<span class="logo-text"><span class="logo-name">위아짐</span></span>
				</a>
				<div class="header-right">
					${t}
					${n.length?`<div class="crumb-path">${n.map((e,t)=>{let r=t===n.length-1;return(r?`<span class="crumb-cur" aria-current="page">${j(e.label)}</span>`:e.href===`index.html`?`<a class="crumb-home" href="index.html" aria-label="메인으로 이동">${N}</a>`:e.href?`<a class="crumb-link" href="${j(e.href)}">${j(e.label)}</a>`:`<span class="crumb-cur">${j(e.label)}</span>`)+(r?``:`<span class="crumb-sep" aria-hidden="true">›</span>`)}).join(``)}</div>`:``}
					<span data-auth-area></span>
				</div>
			</header>`},gnb({active:e=``}={}){return`<nav class="nav" aria-label="주요 메뉴">${((t,n,r)=>`
			<a class="nav-link${e===r?` active`:``}" href="${t}"${e===r?` aria-current="page"`:``}>${j(n)}</a>`)(`members.html`,`회원 관리`,`members`)}</nav>`},helpModal(e=``){return`
			<div class="help-overlay" data-help-overlay hidden>
				<div class="help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title">
					<div class="help-head">
						<h3 id="help-title">도움말</h3>
						<button type="button" class="link-btn" data-help-close aria-label="닫기">✕</button>
					</div>
					<div class="help-body">${e}</div>
				</div>
			</div>`}};A(`app-gnb`,{render(){return P.gnb({active:this.getAttribute(`active`)||``})}}),A(`app-help`,{connectedCallback(){this._primed||(this._primed=!0,this._contentHTML=this.innerHTML)},render(){return`
			<button type="button" class="link-btn" data-help-open aria-haspopup="dialog" aria-expanded="false">도움말</button>
			${P.helpModal(this._contentHTML||``)}`},onConnect(){this.open=()=>{this.querySelector(`.help-overlay`).hidden=!1,this.querySelector(`[data-help-open]`).setAttribute(`aria-expanded`,`true`),this.querySelector(`[data-help-close]`).focus()},this.close=()=>{this.querySelector(`.help-overlay`).hidden=!0,this.querySelector(`[data-help-open]`).setAttribute(`aria-expanded`,`false`)},this.querySelector(`[data-help-open]`).addEventListener(`click`,this.open),this.querySelector(`[data-help-close]`).addEventListener(`click`,this.close),this.querySelector(`.help-overlay`).addEventListener(`click`,e=>{e.target===e.currentTarget&&this.close()}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&!this.querySelector(`.help-overlay`).hidden&&this.close()})}}),A(`app-header`,{connectedCallback(){this._lightChildren=[...this.children]},render(){return P.headerBar({crumbPath:this.getAttribute(`crumb-path`)||``})},renderAuth(){let e=this.querySelector(`[data-auth-area]`);if(!e)return;e.innerHTML=C()?`<button type="button" class="link-btn" data-header-logout aria-label="로그아웃">로그아웃</button>`:`<a class="link-btn" data-header-login href="login.html" aria-label="로그인">로그인</a>`;let t=e.querySelector(`[data-header-logout]`);t&&t.addEventListener(`click`,()=>{E(),window.location.href=`login.html`});let n=e.querySelector(`[data-header-login]`);n&&n.addEventListener(`click`,e=>{e.preventDefault();let t=encodeURIComponent(window.location.href);window.location.href=`login.html?redirect=${t}`})},onConnect(){let e=this.querySelector(`.header-right`);this._lightChildren.forEach(t=>e.appendChild(t)),delete this._lightChildren,this.renderAuth(),this._unsubAuth||=O(()=>this.renderAuth())}});export{C as a,S as c,w as i,i as l,j as n,T as o,A as r,x as s,P as t,r as u};