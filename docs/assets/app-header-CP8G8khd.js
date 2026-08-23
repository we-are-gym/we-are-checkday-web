(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`checkday.auth.v1`,t=`checkday.refresh.v1`,n=`checkday:authchange`,r=`https://checkday-rest-evztw4wu4q-du.a.run.app/api/v1`;console.log({API_BASE:r});var i=class extends Error{constructor(e,t,n){super(e),this.name=`ApiError`,this.code=t,this.status=n}};function a(e){let{"@namespaces":t,"@controls":n,"@embedded":r,"@error":i,"@meta":a,...o}=e;return r&&Object.assign(o,r),o}function o(n,r){sessionStorage.setItem(e,n),sessionStorage.setItem(t,r),c()}function s(){sessionStorage.removeItem(e),sessionStorage.removeItem(t),c()}function c(){typeof window>`u`||window.dispatchEvent(new CustomEvent(n))}function l(e){try{return JSON.parse(atob(e.split(`.`)[1])).exp*1e3<Date.now()}catch{return!0}}var u=null;async function d(){if(u)return u;u=f();try{return await u}finally{u=null}}async function f(){let e=sessionStorage.getItem(t);if(!e)return!1;try{let t=await fetch(`${r}/auth/refresh`,{method:`POST`,headers:{Accept:`application/json`,"Content-Type":`application/json`},body:JSON.stringify({refresh_token:e})});if(!t.ok)return!1;let n=a(await t.json());return n.access_token&&n.refresh_token?(o(n.access_token,n.refresh_token),!0):!1}catch{return!1}}function p(){if(s(),!window.location.pathname.endsWith(`login.html`)){let e=encodeURIComponent(window.location.href);window.location.replace(`login.html?redirect=${e}`)}}async function m(e,t=null){let n=t;if(n===null)try{n=await e.json()}catch{n={}}let r=n[`@error`],a;return r?a=r[`@message`]:Array.isArray(n.detail)&&n.detail.length>0&&(a=n.detail.map(e=>e.msg).join(`; `)),new i(a||`요청을 처리할 수 없습니다`,r?.[`@code`]||`request_failed`,e.status)}async function h(t,{method:n=`GET`,body:o=null,token:s=null,as:c=`json`}={}){let u=`${r}${t}`,f={Accept:`application/json`},h=s??sessionStorage.getItem(`checkday.auth.v1`);h&&(f.Authorization=`Bearer ${h}`),o!==null&&(f[`Content-Type`]=`application/json`);let g=()=>fetch(u,{method:n,headers:f,body:o===null?void 0:JSON.stringify(o)}),_=await g();if(_.status===401){if(!h)throw p(),new i(`인증이 필요합니다`,`unauthorized`,401);if(l(h)){if(await d()){if(f.Authorization=`Bearer ${sessionStorage.getItem(e)}`,_=await g(),_.status===401)throw p(),new i(`갱신 후 인증이 거부되었습니다`,`refresh_retry_rejected`,401)}else throw p(),new i(`인증이 만료되었습니다`,`token_expired`,401)}else throw p(),new i(`인증이 거부되었습니다`,`token_rejected`,401)}if(c===`blob`){if(!_.ok)throw await m(_);return _.blob()}let v={};try{v=await _.json()}catch{v={}}if(!_.ok||v[`@error`])throw await m(_,v);let y=a(v);return y.items===void 0?y:y.items}async function g(e,t={}){return h(e,t)}async function _(e,t={}){return h(e,{...t,as:`blob`})}function v(){let t=sessionStorage.getItem(e);return t?!l(t):!1}function y(){window.addEventListener(`pageshow`,e=>{e.persisted&&!v()&&window.location.replace(`login.html`)})}async function b(e,t){let n=await g(`/auth/login`,{method:`POST`,body:{username:e,password:t}});return o(n.access_token,n.refresh_token),n}function x(){s()}var S=new Set;function C(e){return S.add(e),()=>S.delete(e)}function w(){S.forEach(e=>e())}typeof window<`u`&&(window.addEventListener(n,()=>w()),window.addEventListener(`storage`,e=>{(e.key===`checkday.auth.v1`||e.key===`checkday.refresh.v1`)&&w()}));function T(e,t){class n extends HTMLElement{connectedCallback(){t.connectedCallback&&t.connectedCallback.call(this),this.refresh(),t.onConnect&&t.onConnect.call(this)}refresh(){this.innerHTML=t.render.call(this),t.refreshAfter&&t.refreshAfter.call(this)}}for(let e of Object.keys(t))e!==`render`&&e!==`onConnect`&&e!==`refreshAfter`&&e!==`connectedCallback`&&typeof t[e]==`function`&&(n.prototype[e]=t[e]);return customElements.define(e,n),n}function E(e){return e.reduce((e,t)=>e+t,0)}function D(e){return Array(e).fill(0)}function O(e){return String(e).replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`"`,`&quot;`).replaceAll(`'`,`&#39;`)}var k=[`💪 근력 향상`,`🔥 체지방 감소`,`🧘 자세 교정`,`🏃 체력 향상`,`⚖️ 체중 유지`,`🦵 하체 강화`,`🤸 유연성 개선`,`🩺 통증 개선`,`📈 근육량 증가`],A=`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.8V21h14V9.8"/></svg>`,j={scoreCtrl({dataKey:e,index:t,displayClass:n,displayId:r=``,displayAttr:i=``}){let a=`${e}="${t}"`;return`
			<button class="score-btn" ${a} data-delta="-1" aria-label="감소">−</button>
			<span class="${n}"${r?` id="${r}"`:``}${i?` data-${i}="0"`:``} aria-live="polite">0</span>
			<button class="score-btn" ${a} data-delta="1" aria-label="증가">+</button>`},assessmentCard({index:e,item:t,dots:n,tags:r,extra:i=``}){return`
			<div class="eval-item">
				<div class="eval-top">
					<div class="eval-num-badge">${e+1}</div>
					<div style="flex:1"><div class="eval-name">${O(t.name)}</div><div class="eval-desc">${O(t.desc)}</div></div>
					<div class="score-ctrl">
						${j.scoreCtrl({dataKey:`data-i`,index:e,displayClass:`score-val`,displayId:`sv-${e}`})}
						<div class="sdots">${n}</div>
					</div>
				</div>
				<button class="expand-toggle" id="et-${e}" data-i="${e}" aria-expanded="false" aria-controls="sp-${e}">
					체크 항목 / 메모 <span class="arr">▾</span>
				</button>
				<div class="sub-panel" id="sp-${e}">
					<div class="tag-row" style="margin-top:6px">${r}</div>
					<textarea class="eval-memo" placeholder="메모..." title="메모"></textarea>
					${i}
				</div>
			</div>`},basicItemCard({id:e,item:t,dots:n,checks:r}){return`
			<div class="item-card" id="card-${e}">
				<div class="item-top">
					<div class="item-num">${e}</div>
					<div class="item-info">
						<div class="item-name">${O(t.name)}</div>
						<div class="item-desc">${O(t.desc)}</div>
					</div>
					<div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
						<div class="score-ctrl">
							${j.scoreCtrl({dataKey:`data-aid`,index:e,displayClass:`score-display`,displayId:`score-${e}`,displayAttr:`score`})}
						</div>
						<div class="score-dots">${n}</div>
					</div>
				</div>
				<button class="expand-btn" id="expand-${e}" data-id="${e}" aria-expanded="false" aria-controls="detail-${e}">
					체크 항목 / 메모
					<span class="expand-arrow">▾</span>
				</button>
				<div class="item-detail" id="detail-${e}">
					${r}
					<textarea class="notes-area" id="notes-${e}" data-id="${e}" placeholder="메모를 입력하세요..."></textarea>
				</div>
			</div>`},inbodyCell({label:e,id:t,placeholder:n,step:r=`0.1`,tagId:i,last:a=!1}){let o=a?`ib-cell no-border-b`:`ib-cell`,s=r?` step="${O(r)}"`:``;return`
			<div class="${o}">
				<label for="${t}">${O(e)}</label>
				<input class="ib-num" id="${t}" type="number" placeholder="${O(n)}"${s} />
				<div id="${i}"></div>
			</div>`},inbodyGrid(){return[this.inbodyCell({label:`체중 (kg)`,id:`ib-w`,placeholder:`65.0`,tagId:`tag-w`}),this.inbodyCell({label:`골격근량 (kg)`,id:`ib-m`,placeholder:`28.0`,tagId:`tag-m`}),this.inbodyCell({label:`체지방량 (kg)`,id:`ib-fat`,placeholder:`18.0`,tagId:`tag-fat`}),this.inbodyCell({label:`BMI`,id:`ib-bmi`,placeholder:`23.5`,tagId:`tag-bmi`,last:!0}),this.inbodyCell({label:`체지방률 (%)`,id:`ib-bfp`,placeholder:`27.0`,tagId:`tag-bfp`,last:!0}),this.inbodyCell({label:`기초대사량 (kcal)`,id:`ib-bmr`,placeholder:`1450`,step:``,tagId:`tag-bmr`,last:!0})].join(``)},goalTag(e){return`<div class="goal-tag" role="button" tabindex="0" aria-pressed="false">${O(e)}</div>`},goalTags(){return k.map(e=>this.goalTag(e)).join(``)},fbCheckRow(e=``){return`
			<div class="fb-check-row">
				<input type="checkbox" style="accent-color:var(--blue);flex-shrink:0;" aria-label="체크 선택">
				<input class="fb-check-input" type="text" value="${O(e)}" placeholder="체크 항목..." aria-label="체크 항목">
				<button class="fb-check-del" title="삭제" aria-label="체크 항목 삭제">✕</button>
			</div>`},feedbackCard({id:e,name:t,checkItems:n}){let r=n.map(e=>j.fbCheckRow(e)).join(``);return`
			<div class="fb-item" id="fb-item-${e}">
				<div class="fb-item-header">
					<input class="fb-move-input" type="text" value="${O(t)}" placeholder="동작명 (예: 스쿼트)" aria-label="동작명">
					<button class="fb-del-btn" title="삭제" aria-label="피드백 삭제">✕</button>
				</div>
				<div class="fb-checks-wrap">${r}</div>
				<button class="add-check-btn" aria-label="체크 항목 추가">+ 체크 항목 추가</button>
				<textarea class="eval-memo" placeholder="코칭 포인트 메모..." style="margin-top:6px;" title="코칭 포인트 메모" aria-label="코칭 포인트 메모"></textarea>
			</div>`},memberRow({id:e,name:t,gender:n,trainer:r,recordCount:i}){return`
			<tr class="member-row" data-member-id="${e}" tabindex="0" role="link" aria-label="${O(t)} 상세 보기">
				<td class="member-name">${O(t)}</td>
				<td class="member-gender">${O(n||`-`)}</td>
				<td class="member-trainer">${O(r||`-`)}</td>
				<td class="member-count">${i}회</td>
				<td class="member-action"><button type="button" class="member-remove" data-remove-id="${e}" aria-label="${O(t)} 삭제">삭제</button></td>
			</tr>`},recordRow({id:e,session:t,date:n,total:r,max:i}){return`
			<div class="record-row" data-record-id="${e}" tabindex="0" role="link" aria-label="${O(t)} ${O(n)} 총점 ${r}/${i}">
				<div class="cell-name">${O(t)}</div>
				<div class="cell-dim">${O(n)}</div>
				<div class="cell-dim">총점 ${r}/${i}</div>
				<div><button type="button" class="btn btn-sm btn-danger" data-del-record="${e}" aria-label="기록 삭제">삭제</button></div>
			</div>`},scoreDots({prefix:e,count:t}){return D(t).map((t,n)=>`<div class="dot" id="dot-${e}-${n}" aria-hidden="true"></div>`).join(``)},compareTableRow({label:e,left:t,right:n,delta:r}){return`
			<tr>
				<td>${O(e)}</td>
				<td>${t}</td>
				<td>${n}</td>
				<td>${r}</td>
			</tr>`},compareTable({extraClassNames:e=[],itemLabel:t,leftLabel:n=``,rightLabel:r=``,rows:i,footRows:a,withHeader:o=!0,ariaLabel:s=``}){let c=s?` aria-label="${O(s)}"`:``,l=o?`<thead><tr><th>${t}</th><th>${O(n)}</th><th>${O(r)}</th><th>변화</th></tr></thead>`:``,u=a===void 0?``:`
				<tfoot>
					${a.map(e=>j.compareTableRow(e)).join(``)}
				</tfoot>
			`;return`
			<table class="compare-table ${e.join(` `)}"${c}>
				${l}
				${u}
				<tbody>
					${i.map(e=>j.compareTableRow(e)).join(``)}
				</tbody>
			</table>`},viewScoreDots({score:e,max:t=4}){return Array.from({length:t},(t,n)=>`<span class="sdot${n<e?` on`:``}"></span>`).join(``)},loginForm(){return`
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
					${n.length?`<div class="crumb-path">${n.map((e,t)=>{let r=t===n.length-1;return(r?`<span class="crumb-cur" aria-current="page">${O(e.label)}</span>`:e.href===`index.html`?`<a class="crumb-home" href="index.html" aria-label="메인으로 이동">${A}</a>`:e.href?`<a class="crumb-link" href="${O(e.href)}">${O(e.label)}</a>`:`<span class="crumb-cur">${O(e.label)}</span>`)+(r?``:`<span class="crumb-sep" aria-hidden="true">›</span>`)}).join(``)}</div>`:``}
					<span data-auth-area></span>
				</div>
			</header>`},gnb({active:e=``}={}){return`<nav class="nav" aria-label="주요 메뉴">${((t,n,r)=>`
			<a class="nav-link${e===r?` active`:``}" href="${t}"${e===r?` aria-current="page"`:``}>${O(n)}</a>`)(`members.html`,`회원 관리`,`members`)}</nav>`},helpModal(e=``){return`
			<div class="help-overlay" data-help-overlay hidden>
				<div class="help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title">
					<div class="help-head">
						<h3 id="help-title">도움말</h3>
						<button type="button" class="link-btn" data-help-close aria-label="닫기">✕</button>
					</div>
					<div class="help-body">${e}</div>
				</div>
			</div>`}};T(`app-gnb`,{render(){return j.gnb({active:this.getAttribute(`active`)||``})}}),T(`app-help`,{connectedCallback(){this._primed||(this._primed=!0,this._contentHTML=this.innerHTML)},render(){return`
			<button type="button" class="link-btn" data-help-open aria-haspopup="dialog" aria-expanded="false">도움말</button>
			${j.helpModal(this._contentHTML||``)}`},onConnect(){this.open=()=>{this.querySelector(`.help-overlay`).hidden=!1,this.querySelector(`[data-help-open]`).setAttribute(`aria-expanded`,`true`),this.querySelector(`[data-help-close]`).focus()},this.close=()=>{this.querySelector(`.help-overlay`).hidden=!0,this.querySelector(`[data-help-open]`).setAttribute(`aria-expanded`,`false`)},this.querySelector(`[data-help-open]`).addEventListener(`click`,this.open),this.querySelector(`[data-help-close]`).addEventListener(`click`,this.close),this.querySelector(`.help-overlay`).addEventListener(`click`,e=>{e.target===e.currentTarget&&this.close()}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&!this.querySelector(`.help-overlay`).hidden&&this.close()})}}),T(`app-header`,{connectedCallback(){this._lightChildren=[...this.children]},render(){return j.headerBar({crumbPath:this.getAttribute(`crumb-path`)||``})},renderAuth(){let e=this.querySelector(`[data-auth-area]`);if(!e)return;e.innerHTML=v()?`<button type="button" class="link-btn" data-header-logout aria-label="로그아웃">로그아웃</button>`:`<a class="link-btn" data-header-login href="login.html" aria-label="로그인">로그인</a>`;let t=e.querySelector(`[data-header-logout]`);t&&t.addEventListener(`click`,()=>{x(),window.location.href=`login.html`});let n=e.querySelector(`[data-header-login]`);n&&n.addEventListener(`click`,e=>{e.preventDefault();let t=encodeURIComponent(window.location.href);window.location.href=`login.html?redirect=${t}`})},onConnect(){let e=this.querySelector(`.header-right`);this._lightChildren.forEach(t=>e.appendChild(t)),delete this._lightChildren,this.renderAuth(),this._unsubAuth||=C(()=>this.renderAuth())}});export{T as a,b as c,E as i,g as l,O as n,y as o,D as r,v as s,j as t,_ as u};