(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e={error:{bg:`#fee2e2`,fg:`#991b1b`,border:`#fca5a5`,icon:`✕`},warning:{bg:`#fef3c7`,fg:`#92400e`,border:`#fde68a`,icon:`⚠`},success:{bg:`#d1fae5`,fg:`#065f46`,border:`#6ee7b7`,icon:`✓`},info:{bg:`#dbeafe`,fg:`#1e40af`,border:`#93c5fd`,icon:`ℹ`}},t=null;if(typeof HTMLElement<`u`){class n extends HTMLElement{_toasts=[];_nextId=0;connectedCallback(){t=this,this._renderShell()}disconnectedCallback(){t===this&&(t=null),this._toasts.forEach(e=>clearTimeout(e.timer)),this._toasts=[]}_renderShell(){if(this.querySelector(`.toast-container`))return;let e=document.createElement(`div`);e.className=`toast-container`,e.setAttribute(`role`,`status`),e.setAttribute(`aria-live`,`polite`),e.style.cssText=`position:fixed;top:1rem;right:1rem;z-index:10000;display:flex;flex-direction:column;gap:.5rem;pointer-events:none;max-width:360px;`,this.appendChild(e);let t=document.createElement(`style`);t.textContent=`@keyframes es-toast-slide{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`,this.appendChild(t)}show(t,{type:n=`info`,duration:r=3e3,action:i}={}){let a=this.querySelector(`.toast-container`);if(!a)return;let o=e[n]||e.info,s=this._nextId++,c=document.createElement(`div`);c.className=`toast-item`,c.style.cssText=`pointer-events:auto;display:flex;align-items:flex-start;gap:.5rem;padding:.75rem 1rem;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.12);font-size:14px;line-height:1.4;color:${o.fg};background:${o.bg};border:1px solid ${o.border};animation:es-toast-slide .2s ease-out;`;let l=document.createElement(`span`);l.style.cssText=`font-weight:700;font-size:16px;flex-shrink:0;`,l.textContent=o.icon,c.appendChild(l);let u=document.createElement(`span`);if(u.style.cssText=`flex:1;word-break:break-word;`,u.textContent=t,c.appendChild(u),i){let e=document.createElement(`button`);e.style.cssText=`background:none;border:none;color:${o.fg};text-decoration:underline;cursor:pointer;font-size:14px;padding:0;margin-left:.5rem;white-space:nowrap;`,e.textContent=i.label,e.addEventListener(`click`,()=>{i.onClick(),this._removeToast(s)}),c.appendChild(e)}let d=document.createElement(`button`);d.style.cssText=`background:none;border:none;font-size:16px;cursor:pointer;padding:0;margin-left:.25rem;color:inherit;opacity:.6;flex-shrink:0;`,d.textContent=`×`,d.setAttribute(`aria-label`,`닫기`),d.addEventListener(`click`,()=>this._removeToast(s)),c.appendChild(d),a.appendChild(c);let f=r>0?setTimeout(()=>this._removeToast(s),r):null;this._toasts.push({id:s,el:c,timer:f})}hideAll(){this._toasts.forEach(e=>{clearTimeout(e.timer),e.el.remove()}),this._toasts=[]}_removeToast(e){let t=this._toasts.findIndex(t=>t.id===e);if(t===-1)return;let[n]=this._toasts.splice(t,1);clearTimeout(n.timer),n.el.style.animation=`es-toast-slide .15s ease-in reverse`,setTimeout(()=>n.el.remove(),150)}}customElements.define(`es-toast`,n)}function n(){if(typeof document>`u`||typeof customElements>`u`||!customElements.get(`es-toast`)||!document.body)return null;let e=document.querySelector(`es-toast`);return e||(e=document.createElement(`es-toast`),document.body.appendChild(e)),e}function r(e,t){let r=n();r&&r.show(e,t)}var i={score:{min:0,max:3,dotCount:4},grade:{excellent:83,good:58,average:33},motion:{totalMax:24,basic5Max:15},allowedGoalTags:[`💪 근력 향상`,`🔥 체지방 감소`,`🧘 자세 교정`,`🏃 체력 향상`,`⚖️ 체중 유지`,`🦵 하체 강화`,`🤸 유연성 개선`,`🩺 통증 개선`,`📈 근육량 증가`],vo2Norms:[{ageMin:18,ageMax:25,col:1,excellent:56,good:[47,56],above_avg:[42,46],average:[38,41],below_avg:[33,37],poor:[28,32],very_poor:28},{ageMin:26,ageMax:35,col:2,excellent:52,good:[45,52],above_avg:[39,44],average:[35,38],below_avg:[31,34],poor:[26,30],very_poor:26},{ageMin:36,ageMax:45,col:3,excellent:45,good:[38,45],above_avg:[34,37],average:[31,33],below_avg:[27,30],poor:[22,26],very_poor:22},{ageMin:46,ageMax:55,col:4,excellent:40,good:[34,40],above_avg:[31,33],average:[28,30],below_avg:[25,27],poor:[20,24],very_poor:20},{ageMin:56,ageMax:65,col:5,excellent:37,good:[32,37],above_avg:[28,31],average:[25,27],below_avg:[22,24],poor:[18,21],very_poor:18},{ageMin:66,ageMax:120,col:6,excellent:32,good:[28,32],above_avg:[25,27],average:[22,24],below_avg:[19,21],poor:[17,18],very_poor:17}]},a=i.score.min,o=i.score.max;i.score.dotCount;var s=i.grade.excellent,c=i.grade.good,l=i.grade.average,u=i.motion.totalMax;i.motion.basic5Max;var d=`checkday.auth.v1`,f=`checkday.refresh.v1`,p=`checkday:authchange`,m=class extends Error{constructor(e,t={}){super(e),this.name=`AppError`,this.code=t.code||`app_error`,this.status=t.status||0,t.cause&&(this.cause=t.cause)}};function h(e){return e instanceof m?e.message:e instanceof Error?e.message||`알 수 없는 오류가 발생했습니다`:String(e)}function g(){try{if(typeof window<`u`&&window.localStorage){let e=`__checkday_storage_test__`;return window.localStorage.setItem(e,`1`),window.localStorage.removeItem(e),window.localStorage}}catch{}if(typeof window<`u`&&window.sessionStorage)return window.sessionStorage;if(!globalThis.__checkdayTokenStore){let e=new Map;globalThis.__checkdayTokenStore={getItem:t=>e.has(t)?e.get(t):null,setItem:(t,n)=>e.set(t,String(n)),removeItem:t=>e.delete(t)}}return globalThis.__checkdayTokenStore}function _(){if(typeof window>`u`||!window.sessionStorage)return;let e=window.sessionStorage.getItem(d),t=window.sessionStorage.getItem(f);if(!e&&!t)return;let n=g();e&&!n.getItem(`checkday.auth.v1`)&&n.setItem(d,e),t&&!n.getItem(`checkday.refresh.v1`)&&n.setItem(f,t),window.sessionStorage.removeItem(d),window.sessionStorage.removeItem(f)}var v=!1;function y(){return v||(v=!0,_()),g().getItem(d)}function b(e){g().setItem(d,e)}function x(){return g().getItem(f)}function S(e){g().setItem(f,e)}function C(){let e=g();e.removeItem(d),e.removeItem(f)}function w(){if(C(),!window.location.pathname.endsWith(`login.html`)){let e=encodeURIComponent(window.location.href);window.location.replace(`login.html?redirect=${e}`)}}var T=`https://checkday-rest-evztw4wu4q-du.a.run.app/api/v1`,E=class extends m{constructor(e,t,n){super(e,{code:t,status:n}),this.name=`ApiError`}};function D(e){let{"@namespaces":t,"@controls":n,"@embedded":r,"@error":i,"@meta":a,...o}=e;return r&&Object.assign(o,r),o}function O(e,t){b(e),S(t),A()}function k(){C(),A()}function A(){typeof window>`u`||window.dispatchEvent(new CustomEvent(p))}function j(e){try{let t=e.split(`.`)[1].replace(/-/g,`+`).replace(/_/g,`/`);return JSON.parse(atob(t)).exp*1e3<Date.now()}catch{return!0}}var M=null;async function N(){if(M)return M;M=P();try{return await M}finally{M=null}}async function P(){let e=x();if(!e)return!1;try{let t=await fetch(`${T}/auth/refresh`,{method:`POST`,headers:{Accept:`application/json`,"Content-Type":`application/json`},body:JSON.stringify({refresh_token:e})});if(!t.ok)return!1;let n=D(await t.json());return n.access_token&&n.refresh_token?(O(n.access_token,n.refresh_token),!0):!1}catch{return!1}}async function F(e,t=null){let n=t;if(n===null)try{n=await e.json()}catch{n={}}let r=n[`@error`],i;return r?i=r[`@message`]:Array.isArray(n.detail)&&n.detail.length>0&&(i=n.detail.map(e=>e.msg).join(`; `)),new E(i||`요청을 처리할 수 없습니다`,r?.[`@code`]||`request_failed`,e.status)}async function I(e,{method:t=`GET`,body:n=null,token:r=null,as:i=`json`}={}){let a=`${T}${e}`,o={Accept:`application/json`},s=r??y();s&&(o.Authorization=`Bearer ${s}`),n!==null&&(o[`Content-Type`]=`application/json`);let c=()=>fetch(a,{method:t,headers:o,body:n===null?void 0:JSON.stringify(n)}),l=await c();if(l.status===401){if(!s)throw w(),new E(`인증이 필요합니다`,`unauthorized`,401);if(j(s)){if(await N()){if(o.Authorization=`Bearer ${y()}`,l=await c(),l.status===401)throw w(),new E(`갱신 후 인증이 거부되었습니다`,`refresh_retry_rejected`,401)}else throw w(),new E(`인증이 만료되었습니다`,`token_expired`,401)}else throw w(),new E(`인증이 거부되었습니다`,`token_rejected`,401)}if(i===`blob`){if(!l.ok)throw await F(l);return l.blob()}let u={};try{u=await l.json()}catch{u={}}if(!l.ok||u[`@error`])throw await F(l,u);let d=D(u);return d.items===void 0?d:d.items}async function L(e,t={}){try{return await I(e,t)}catch(e){throw e?.status!==401&&r(e.message||`요청을 처리할 수 없습니다`,{type:`error`}),e}}async function R(e,t={}){try{return await I(e,{...t,as:`blob`})}catch(e){throw e?.status!==401&&r(e.message||`요청을 처리할 수 없습니다`,{type:`error`}),e}}function z(){let e=y();return e?!j(e):!1}function B(e){window.addEventListener(`pageshow`,async t=>{if(t.persisted){if(!z()){w();return}if(e)try{await e()}catch(e){console.error(`bfcache 복원 후 화면 데이터 갱신 실패:`,e)}}})}async function V(e,t){let n=await L(`/auth/login`,{method:`POST`,body:{username:e,password:t}});return O(n.access_token,n.refresh_token),n}function H(){k()}var U=new Set;function W(e){return U.add(e),()=>U.delete(e)}function G(){U.forEach(e=>e())}typeof window<`u`&&(window.addEventListener(p,()=>G()),window.addEventListener(`storage`,e=>{(e.key===`checkday.auth.v1`||e.key===`checkday.refresh.v1`)&&G()}));function K(e){return String(e).replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`"`,`&quot;`).replaceAll(`'`,`&#39;`)}var q=i.allowedGoalTags,J=`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.8V21h14V9.8"/></svg>`,Y={scoreController({index:e,max:t,score:n=0}){return`<ui-score-controller class="score-ctrl-el" id="sc-${e}" score="${n}" max="${t}" min="0" dots="${t}" index="${e}" interactive show-value aria-label="항목 ${e+1} 점수"></ui-score-controller>`},assessmentCard({index:e,item:t,tags:n,extra:r=``}){return`
			<div class="eval-item">
				<div class="eval-top">
					<div class="eval-num-badge">${e+1}</div>
					<div style="flex:1"><div class="eval-name">${K(t.name)}</div><div class="eval-desc">${K(t.desc)}</div></div>
					${Y.scoreController({index:e,max:3})}
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
						<div class="item-name">${K(t.name)}</div>
						<div class="item-desc">${K(t.desc)}</div>
					</div>
					${Y.scoreController({index:e,max:3})}
				</div>
				<button class="expand-btn" id="expand-${e}" data-id="${e}" aria-expanded="false" aria-controls="detail-${e}">
					체크 항목 / 메모
					<span class="expand-arrow">▾</span>
				</button>
				<div class="item-detail" id="detail-${e}">
					${n}
					<textarea class="notes-area" id="notes-${e}" data-id="${e}" placeholder="메모를 입력하세요..."></textarea>
				</div>
			</div>`},inbodyCell({label:e,id:t,placeholder:n,step:r=`0.1`,tagId:i,last:a=!1}){let o=a?`ib-cell no-border-b`:`ib-cell`,s=r?` step="${K(r)}"`:``;return`
			<div class="${o}">
				<label for="${t}">${K(e)}</label>
				<input class="ib-num" id="${t}" type="number" placeholder="${K(n)}"${s} />
				<div id="${i}"></div>
			</div>`},inbodyGrid(){return[this.inbodyCell({label:`체중 (kg)`,id:`ib-w`,placeholder:`65.0`,tagId:`tag-w`}),this.inbodyCell({label:`골격근량 (kg)`,id:`ib-m`,placeholder:`28.0`,tagId:`tag-m`}),this.inbodyCell({label:`체지방량 (kg)`,id:`ib-fat`,placeholder:`18.0`,tagId:`tag-fat`}),this.inbodyCell({label:`BMI`,id:`ib-bmi`,placeholder:`23.5`,tagId:`tag-bmi`,last:!0}),this.inbodyCell({label:`체지방률 (%)`,id:`ib-bfp`,placeholder:`27.0`,tagId:`tag-bfp`,last:!0}),this.inbodyCell({label:`기초대사량 (kcal)`,id:`ib-bmr`,placeholder:`1450`,step:``,tagId:`tag-bmr`,last:!0})].join(``)},goalTag(e){return`<div class="goal-tag" role="button" tabindex="0" aria-pressed="false">${K(e)}</div>`},goalTags(){return q.map(e=>this.goalTag(e)).join(``)},fbCheckRow(e=``){return`
			<div class="fb-check-row">
				<input type="checkbox" style="accent-color:var(--blue);flex-shrink:0;" aria-label="체크 선택">
				<input class="fb-check-input" type="text" value="${K(e)}" placeholder="체크 항목..." aria-label="체크 항목">
				<button class="fb-check-del" title="삭제" aria-label="체크 항목 삭제">✕</button>
			</div>`},feedbackCard({id:e,name:t,checkItems:n}){let r=n.map(e=>Y.fbCheckRow(e)).join(``);return`
			<div class="fb-item" id="fb-item-${e}">
				<div class="fb-item-header">
					<input class="fb-move-input" type="text" value="${K(t)}" placeholder="동작명 (예: 스쿼트)" aria-label="동작명">
					<button class="fb-del-btn" title="삭제" aria-label="피드백 삭제">✕</button>
				</div>
				<div class="fb-checks-wrap">${r}</div>
				<button class="add-check-btn" aria-label="체크 항목 추가">+ 체크 항목 추가</button>
				<textarea class="eval-memo" placeholder="코칭 포인트 메모..." style="margin-top:6px;" title="코칭 포인트 메모" aria-label="코칭 포인트 메모"></textarea>
			</div>`},memberRow({id:e,name:t,gender:n,trainer:r,recordCount:i}){return`
			<tr class="member-row" data-member-id="${e}" tabindex="0" role="link" aria-label="${K(t)} 상세 보기">
				<td class="member-name">${K(t)}</td>
				<td class="member-gender">${K(n||`-`)}</td>
				<td class="member-trainer">${K(r||`-`)}</td>
				<td class="member-count">${i}회</td>
				<td class="member-action"><button type="button" class="member-remove" data-remove-id="${e}" aria-label="${K(t)} 삭제">삭제</button></td>
			</tr>`},recordRow({id:e,session:t,date:n,total:r,max:i}){return`
			<div class="record-row" data-record-id="${e}" tabindex="0" role="link" aria-label="${K(t)} ${K(n)} 총점 ${r}/${i}">
				<div class="cell-name">${K(t)}</div>
				<div class="cell-dim">${K(n)}</div>
				<div class="cell-dim">총점 ${r}/${i}</div>
				<div style="flex: 1; text-align: right"><button type="button" class="btn btn-sm btn-danger" data-del-record="${e}" aria-label="기록 삭제">삭제</button></div>
			</div>`},compareTableRow({label:e,left:t,right:n,delta:r}){return`
			<tr>
				<td>${K(e)}</td>
				<td>${t}</td>
				<td>${n}</td>
				<td>${r}</td>
			</tr>`},compareTable({extraClassNames:e=[],itemLabel:t,leftLabel:n=``,rightLabel:r=``,rows:i,footRows:a,withHeader:o=!0,ariaLabel:s=``}){let c=s?` aria-label="${K(s)}"`:``,l=o?`<thead><tr><th>${t}</th><th>${K(n)}</th><th>${K(r)}</th><th>변화</th></tr></thead>`:``,u=a===void 0?``:`
				<tfoot>
					${a.map(e=>Y.compareTableRow(e)).join(``)}
				</tfoot>
			`;return`
			<table class="compare-table ${e.join(` `)}"${c}>
				${l}
				${u}
				<tbody>
					${i.map(e=>Y.compareTableRow(e)).join(``)}
				</tbody>
			</table>`},loginForm(){return`
			<form class="login-form" id="login-form" novalidate>
				<div class="field">
					<label for="login-id">아이디</label>
					<input type="text" id="login-id" placeholder="아이디 입력" autocomplete="username" aria-label="아이디" aria-required="true" />
				</div>
				<div class="field">
					<label for="login-pw">비밀번호</label>
					<input type="password" id="login-pw" placeholder="비밀번호 입력" autocomplete="current-password" aria-label="비밀번호" aria-required="true" />
				</div>
				<button class="btn btn-primary" type="submit">로그인</button>
				<div style="text-align:center; font-size:10.0px; color:var(--text3); margin-top:4px;">
					<!-- 로그인 후에는 자동으로 로그인 상태가 유지돼요 -->
				</div>
			</form>`},headerBar({crumbPath:e=``,navHtml:t=``}={}){let n=e.split(`|`).filter(Boolean).map(e=>{let t=e.indexOf(`>`);return t===-1?{href:``,label:e}:{href:e.slice(0,t),label:e.slice(t+1)}});return`
			<header class="site-header" role="banner">
				<a class="logo" href="index.html" aria-label="메인으로 이동">
					<span class="logo-mark" role="img" aria-label="위아짐 심볼"></span>
					<span class="logo-text"><span class="logo-name">위아짐</span></span>
				</a>
				<div class="header-right">
					${t}
					${n.length?`<div class="crumb-path">${n.map((e,t)=>{let r=t===n.length-1;return(r?`<span class="crumb-cur" aria-current="page">${K(e.label)}</span>`:e.href===`index.html`?`<a class="crumb-home" href="index.html" aria-label="메인으로 이동">${J}</a>`:e.href?`<a class="crumb-link" href="${K(e.href)}">${K(e.label)}</a>`:`<span class="crumb-cur">${K(e.label)}</span>`)+(r?``:`<span class="crumb-sep" aria-hidden="true">›</span>`)}).join(``)}</div>`:``}
					<span data-auth-area></span>
				</div>
			</header>`},gnb({active:e=``}={}){return`<nav class="nav" aria-label="주요 메뉴">${((t,n,r)=>`
			<a class="nav-link${e===r?` active`:``}" href="${t}"${e===r?` aria-current="page"`:``}>${K(n)}</a>`)(`members.html`,`회원 관리`,`members`)}</nav>`},helpModal(e=``){return`
			<dialog class="help-dialog" data-help-dialog aria-labelledby="help-title">
				<div class="help-modal">
					<div class="help-head">
						<h3 id="help-title">도움말</h3>
						<button type="button" class="link-btn" data-help-close aria-label="닫기">✕</button>
					</div>
					<div class="help-body">${e}</div>
				</div>
			</dialog>`}},X=new Set([`render`,`onConnect`,`refreshAfter`,`connectedCallback`,`disconnectedCallback`,`attributeChangedCallback`,`observedAttributes`]);function Z(e,t){class n extends HTMLElement{static get observedAttributes(){return t.observedAttributes||[]}connectedCallback(){t.connectedCallback&&t.connectedCallback.call(this)}disconnectedCallback(){t.disconnectedCallback&&t.disconnectedCallback.call(this)}attributeChangedCallback(e,n,r){t.attributeChangedCallback&&t.attributeChangedCallback.call(this,e,n,r)}}for(let e of Object.keys(t))X.has(e)||typeof t[e]==`function`&&(n.prototype[e]=t[e]);return customElements.define(e,n),n}var Q=new Set([`tag`,`props`,`render`,`connectedCallback`,`disconnectedCallback`,`attributeChangedCallback`,`onConnect`,`observedAttributes`]);function $(e){let{tag:t,props:n={},render:r,connectedCallback:i,disconnectedCallback:a,attributeChangedCallback:o,onConnect:s,observedAttributes:c=[]}=e,l={observedAttributes:[...new Set([...c,...Object.keys(n)])],render(){return r.call(this,l._getProps.call(this))},connectedCallback(){l._initProps.call(this),i&&i.call(this),this._rendered||l.refresh.call(this),s&&s.call(this)},disconnectedCallback(){a&&a.call(this)},attributeChangedCallback(e,t,r){t!==r&&(n[e]!==void 0&&(this._props||l._initProps.call(this),this._props[e]=l._deserializeProp(e,r),l.refresh.call(this)),o&&o.call(this,e,t,r))},_initProps(){this._props={};for(let[e,t]of Object.entries(n)){let n=this.getAttribute(e);this._props[e]=n===null?t.default:l._deserializeProp(e,n)}},_deserializeProp(e,t){let r=n[e];return!r||r.type===String?t:r.type===Number?Number(t):r.type===Boolean?t!==`false`:r.type===Array?t?t.split(`,`).map(e=>e.trim()):[]:r.type===Object?t?JSON.parse(t):{}:t},_getProps(){return{...this._props}},setProp(e,t){this._props[e]!==t&&(this._props[e]=t,this.setAttribute(e,l._serializeProp(e,t)),l.refresh.call(this))},_serializeProp(e,t){let r=n[e];return!r||r.type===String?t:r.type===Number?String(t):r.type===Boolean?t?`true`:`false`:r.type===Array?t.join(`,`):r.type===Object?JSON.stringify(t):String(t)},emit(e,t={}){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))},refresh(){this.innerHTML=r.call(this,this._getProps()),this._rendered=!0}};for(let t of Object.keys(e))Q.has(t)||typeof e[t]==`function`&&(l[t]=e[t]);return Z(t,l)}$({tag:`app-gnb`,render(){return Y.gnb({active:this.getAttribute(`active`)||``})}}),$({tag:`app-help`,connectedCallback(){this._primed||(this._primed=!0,this._contentHTML=this.innerHTML)},render(){return`
			<button type="button" class="link-btn" data-help-open aria-haspopup="dialog" aria-expanded="false">도움말</button>
			${Y.helpModal(this._contentHTML||``)}`},onConnect(){this._dialog=this.querySelector(`[data-help-dialog]`),this.open=()=>{let e=this._dialog;e&&!e.open&&e.showModal(),this.querySelector(`[data-help-open]`).setAttribute(`aria-expanded`,`true`),this.querySelector(`[data-help-close]`).focus()},this.close=()=>{let e=this._dialog;e?.open&&e.close(),this.querySelector(`[data-help-open]`).setAttribute(`aria-expanded`,`false`)},this.querySelector(`[data-help-open]`).addEventListener(`click`,this.open),this.querySelector(`[data-help-close]`).addEventListener(`click`,this.close),this._dialog.addEventListener(`click`,e=>{e.target===e.currentTarget&&this.close()}),this._dialog.addEventListener(`close`,()=>{let e=this.querySelector(`[data-help-open]`);e&&e.setAttribute(`aria-expanded`,`false`)})}}),$({tag:`app-header`,connectedCallback(){this._lightChildren=[...this.children]},render(){return Y.headerBar({crumbPath:this.getAttribute(`crumb-path`)||``})},renderAuth(){let e=this.querySelector(`[data-auth-area]`);if(!e)return;e.innerHTML=z()?`<button type="button" class="link-btn" data-header-logout aria-label="로그아웃">로그아웃</button>`:`<a class="link-btn" data-header-login href="login.html" aria-label="로그인">로그인</a>`;let t=e.querySelector(`[data-header-logout]`);t&&t.addEventListener(`click`,()=>{H(),window.location.href=`login.html`});let n=e.querySelector(`[data-header-login]`);n&&n.addEventListener(`click`,e=>{e.preventDefault();let t=encodeURIComponent(window.location.href);window.location.href=`login.html?redirect=${t}`})},onConnect(){let e=this.querySelector(`.header-right`);this._lightChildren.forEach(t=>e.appendChild(t)),delete this._lightChildren,this.renderAuth(),this._unsubAuth||=W(()=>this.renderAuth())}});export{r as _,z as a,R as c,s as d,c as f,i as g,a as h,B as i,h as l,o as m,Y as n,V as o,u as p,K as r,L as s,$ as t,l as u};