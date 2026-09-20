import{i as e,r as t,t as n}from"./app-header-B5CSCFPt.js";/* empty css                     */import{t as r}from"./utils-dom-y8yOKY5h.js";/* empty css                       */import{i,n as a,r as o}from"./member-store-B30E-RJa.js";import{l as s,n as c,o as l}from"./record-utils-CSo8jrK-.js";import{t as u}from"./member-utils-C3eDrFg1.js";import"./data-table-BRUfDUg7.js";import{n as d,t as f}from"./loading-overlay-BYL9g967.js";n({tag:`password-confirm`,render(){return`
			<style>
				/*
					모달 팔레트 — colors.css :root 다크 토큰을 소비해 테마 단일 지점 유지
					--pc-bg(#212121)≒페이지(#131313)보다 밝음, --pc-text(#f3f1ee)≒제목/--pc-text2(#9a9a9a)≒설명(제목보다 낮은 대비·AA 충족),
					--pc-input-bg(#1a1a1a)≒모달보다 어두움, --pc-overlay·--pc-border·--pc-shadow≒help-dialog 규약 정렬
				*/

				.pc-backdrop{
					--pc-bg: var(--surface2);
					--pc-border: var(--border2);
					--pc-text: var(--text);
					--pc-text2:var(--text2);
					--pc-input-bg: var(--surface);
					--pc-input-border: var(--border2);
					--pc-overlay:rgba(0, 0, 0, .55);
					--pc-shadow:0 12px 40px rgba(0, 0, 0, .5);

					position: fixed;
					inset: 0;
					background: var(--pc-overlay);
					display: flex;
					align-items: center;
					justify-content: center;
					z-index: 1000;
				}

				.pc-backdrop[hidden]{ display: none }

				.pc-dialog {
					background: var(--pc-bg);
					color: var(--pc-text);
					padding: 20px;
					border-radius: var(--rlg);
					width: min(90vw, 360px);
					border: 0.5px solid var(--pc-border);
					box-shadow: var(--pc-shadow);
				}

				.pc-title { margin: 0 0 8px; font-size: 18px }
				.pc-msg { margin: 0 0 12px; font-size: 13px; color: var(--pc-text2); white-space: pre-line }

				.pc-input {
					width: 100%;
					padding: 8px;
					font-size: 14px;
					background: var(--pc-input-bg);
					color: var(--pc-text);
					border: 1px solid var(--pc-input-border);
					border-radius: var(--r);
					box-sizing: border-box;
				}

				.pc-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 14px }

			.pc-ok { background: var(--danger-solid); color: #fff; }
			.pc-ok:hover { background: var(--danger-solid-hover) }
			</style>
			<div class="pc-backdrop" hidden>
				<div class="pc-dialog" role="dialog" aria-modal="true" aria-labelledby="pc-title" aria-describedby="pc-msg">
					<h2 id="pc-title" class="pc-title"></h2>
					<p id="pc-msg" class="pc-msg"></p>
					<input class="pc-input" type="password" autocomplete="new-password" aria-label="삭제 비밀번호" />
					<div class="pc-actions">
						<button type="button" class="pc-cancel btn btn-ghost">취소</button>
						<button type="button" class="pc-ok btn">확인</button>
					</div>
				</div>
			</div>`},onConnect(){let e=this.querySelector(`.pc-backdrop`),t=this.querySelector(`.pc-input`),n=this.querySelector(`.pc-ok`),r=this.querySelector(`.pc-cancel`),i=n=>{let r=t.value;t.value=``,e.hidden=!0,n&&typeof this.onConfirm==`function`&&this.onConfirm(r),!n&&typeof this.onCancel==`function`&&this.onCancel()};n.addEventListener(`click`,()=>i(!0)),r.addEventListener(`click`,()=>i(!1)),e.addEventListener(`click`,t=>{t.target===e&&i(!1)}),t.addEventListener(`keydown`,e=>{e.key===`Enter`&&i(!0),e.key===`Escape`&&i(!1)})},show(e,t){this.querySelector(`.pc-title`).textContent=e||`비밀번호 확인`,this.querySelector(`.pc-msg`).textContent=t||``;let n=this.querySelector(`.pc-backdrop`),r=this.querySelector(`.pc-input`);n.hidden=!1,r.focus()},close(){this.querySelector(`.pc-backdrop`).hidden=!0}});var p={xmlns:`http://www.w3.org/2000/svg`,width:24,height:24,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,"stroke-width":2,"stroke-linecap":`round`,"stroke-linejoin":`round`},m=([e,t,n])=>{let r=document.createElementNS(`http://www.w3.org/2000/svg`,e);return Object.keys(t).forEach(e=>{r.setAttribute(e,String(t[e]))}),n?.length&&n.forEach(e=>{let t=m(e);r.appendChild(t)}),r},h=(e,t={})=>m([`svg`,{...p,...t},e]),g=(...e)=>e.filter((e,t,n)=>!!e&&e.trim()!==``&&n.indexOf(e)===t).join(` `).trim(),_=e=>{for(let t in e)if(t.startsWith(`aria-`)||t===`role`||t===`title`)return!0;return!1},v=e=>{let t=``,n=!1;for(let r of e){if(r===`-`||r===`_`||r<=` `){n=t.length>0;continue}t.length===0?t+=r.toLowerCase():t+=n?r.toUpperCase():r,n=!1}return t},y=e=>{let t=v(e);return t.charAt(0).toUpperCase()+t.slice(1)},b=e=>Array.from(e.attributes).reduce((e,t)=>(e[t.name]=t.value,e),{}),x=e=>typeof e==`string`?e:!e||!e.class?``:e.class&&typeof e.class==`string`?e.class.split(` `):e.class&&Array.isArray(e.class)?e.class:``,S=(e,{nameAttr:t,icons:n,attrs:r})=>{let i=e.getAttribute(t);if(i==null)return;let a=n[y(i)];if(!a)return console.warn(`${e.outerHTML} icon name was not found in the provided icons object.`);let o=b(e),s=_(o)?{}:{"aria-hidden":`true`},c={...p,"data-lucide":i,...s,...r,...o},l=x(o),u=x(r),d=g(`lucide`,`lucide-${i}`,...l,...u);d&&Object.assign(c,{class:d});let f=h(a,c);return e.parentNode?.replaceChild(f,e)},C=[[`circle`,{cx:`12`,cy:`12`,r:`10`}],[`line`,{x1:`12`,x2:`12`,y1:`8`,y2:`12`}],[`line`,{x1:`12`,x2:`12.01`,y1:`16`,y2:`16`}]],w=({icons:e={},nameAttr:t=`data-lucide`,attrs:n={},root:r=document,inTemplates:i}={})=>{if(!Object.values(e).length)throw Error(`Please provide an icons object.
If you want to use all the icons you can import it like:
 \`import { createIcons, icons } from 'lucide';
lucide.createIcons({icons});\``);if(r===void 0)throw Error("`createIcons()` only works in a browser environment.");if(Array.from(r.querySelectorAll(`[${t}]`)).forEach(r=>S(r,{nameAttr:t,icons:e,attrs:n})),i&&Array.from(r.querySelectorAll(`template`)).forEach(r=>w({icons:e,nameAttr:t,attrs:n,root:r.content,inTemplates:i})),t===`data-lucide`){let t=r.querySelectorAll(`[icon-name]`);t.length>0&&(console.warn(`[Lucide] Some icons were found with the now deprecated icon-name attribute. These will still be replaced for backwards compatibility, but will no longer be supported in v1.0 and you should switch to data-lucide`),Array.from(t).forEach(t=>S(t,{nameAttr:`icon-name`,icons:e,attrs:n})))}};async function T(e,t,n={}){let r=n.okLabel??`확인`,i=n.variant??`plain`;return new Promise(a=>{let o=document.createElement(`dialog`);o.className=`cd-dialog cd-dialog--danger`,i!==`plain`&&o.classList.add(`cd-dialog--${i}`),o.innerHTML=`
			<style>
				.cd-dialog {
					/*background: var(--surface2);*/
					background: #181b1e;

					color: var(--text);
					padding: 0;

					/* 네모 모양, 각지게 */
					/* border-radius: var(--rlg); */

					border: 0.5px solid var(--border2);
					box-shadow: 0 12px 40px rgba(0, 0, 0, .5);

					/* 가로로 긴 직사각형 형태 */
					/* max-width: min(90vw, 360px); */
					max-width: min(90vw, 630px);

					margin: auto;
				}

				.cd-dialog::backdrop { background: rgba(0, 0, 0, .55) }
				.cd-dialog[open] { display: flex; flex-direction: column }

				.cd-header {
					padding: 20px 20px 8px;

					/* 선 없애기 */
					/* border-bottom: 1px solid var(--border2); */
				}

				.cd-title { margin: 0; font-size: 18px }

				.cd-body {
					/* 가로로 긴 직사각형 형태 */
					/* padding: 12px 20px; */
					padding: 12px 40px;

					font-size: 13px;
					color: var(--text2);
					white-space: pre-line;
				}

				.cd-footer {
					display: flex;
					justify-content: flex-end;
					gap: 8px;

					/* 가로로 긴 직사각형 형태 */

					/* padding: 8px 20px 20px; */

					padding-top: 8px;
					padding-bottom: 20px;
					padding-left: 40px;
					padding-right: 40px;
				}

				.cd-cancel {
					background: transparent;
					font-size: 0.63rem;
					color: var(--text);
					border: 1px solid var(--border2);
					padding: 8px 25px;
					border-radius: var(--r);
					cursor: pointer;
				}

				.cd-ok {
					background: var(--red-fg);
					font-size: 0.63rem;
					color: #fff;
					border: none;
					padding: 8px 25px;
					border-radius: var(--r);
					cursor: pointer;
				}

				.cd-ok:hover { background: #c95a5a }
				.cd-ok--solid { background: var(--danger-solid) }
				.cd-ok--solid:hover { background: var(--danger-solid-hover) }

				/* ── warn: 회원삭제확인모달-1.png ── */
				.cd-dialog--warn {
					position: relative;

					/*border-radius: var(--rlg);*/
					border-radius: var(--r);

					/*max-width: min(90vw, 360px);*/
					max-width: min(90vw, 400px);
				}

				.cd-dialog--warn .cd-close {
					position: absolute;
					top: 10px;
					right: 10px;
					width: 28px;
					height: 28px;
					padding: 0;
					border: none;
					background: transparent;
					color: var(--text2);
					font-size: 18px;
					line-height: 1;
					cursor: pointer;
				}

				.cd-dialog--warn .cd-close:hover { color: var(--text) }

				.cd-dialog--warn .cd-header { display: none }

				.cd-dialog--warn .cd-body {
					padding: 24px 40px 16px 20px;
					white-space: normal;
					color: var(--text);
				}

				.cd-dialog--warn .cd-warn-row {
					display: flex;
					align-items: flex-start;
					gap: 12px;
				}

				.cd-dialog--warn .cd-warn-icon {
					flex-shrink: 0;
					width: 28px;
					height: 28px;
					/*border: solid 3px var(--danger-solid);*/
					border-radius: 50%;

					/*
					background: var(--danger-solid);
					color: #fff;
					*/

					color: var(--danger-solid);

					font-size: 16px;
					font-weight: 700;
					display: flex;
					align-items: center;
					justify-content: center;
					line-height: 1;

					padding-bottom: 1px;
					padding-right: 1.1px;
				}

				.cd-dialog--warn .cd-warn-text { min-width: 0; flex: 1 }

				.cd-dialog--warn .cd-warn-title {
					margin: 0;
					font-size: 15px;
					font-weight: 600;
					color: var(--text);
					line-height: 1.4;
				}

				.cd-dialog--warn .cd-warn-sub {
					margin: 8px 0 0;
					font-size: 13px;
					color: var(--text2);
					line-height: 1.45;
				}

				.cd-dialog--warn .cd-count {
					color: var(--danger-solid);
					font-style: normal;
					font-weight: 600;
				}

				.cd-dialog--warn .cd-divider {
					height: 0;
					border: none;
					border-top: 1px solid var(--border2);
					margin: 0 16px;
				}

				.cd-dialog--warn .cd-footer {
					padding: 12px 16px 16px;
				}
			</style>
			<button type="button" class="cd-close" hidden aria-label="닫기">&times;</button>
			<div class="cd-header"><h2 class="cd-title"></h2></div>
			<div class="cd-body"></div>
			<hr class="cd-divider" hidden />
			<div class="cd-footer">
				<button type="button" class="cd-cancel">취소</button>
				<button type="button" class="cd-ok"></button>
			</div>
		`;let s=o.querySelector(`.cd-body`),c=o.querySelector(`.cd-close`),l=o.querySelector(`.cd-divider`);if(i===`warn`){c.hidden=!1,l.hidden=!1;let e=document.createElement(`div`);e.className=`cd-warn-row`;let t=document.createElement(`i`);t.className=`cd-warn-icon`,t.setAttribute(`data-lucide`,`circle-alert`),t.setAttribute(`color`,`var(--danger-solid)`),t.setAttribute(`aria-hidden`,`true`);let r=document.createElement(`div`);r.className=`cd-warn-text`;let i=document.createElement(`p`);i.className=`cd-warn-title`,i.textContent=`회원 ${n.memberName??``} 님을 삭제하시겠습니까?`,r.appendChild(i);let a=Number(n.recordCount)||0;if(a>0){let e=document.createElement(`p`);e.className=`cd-warn-sub`,e.append(`연결된 체크기록 `);let t=document.createElement(`span`);t.className=`cd-count`,t.textContent=`${a}건`,e.appendChild(t),e.append(`도 함께 삭제됩니다.`),r.appendChild(e)}e.append(t,r),s.replaceChildren(e)}else o.querySelector(`.cd-title`).textContent=e,s.textContent=t;document.body.appendChild(o),w({icons:{CircleAlert:C}});let u=o.querySelector(`.cd-ok`),d=o.querySelector(`.cd-cancel`);u.textContent=r,n.solidOk&&u.classList.add(`cd-ok--solid`);let f=e=>{o.close(),o.remove(),a(e)};u.addEventListener(`click`,()=>f(!0)),d.addEventListener(`click`,()=>f(!1)),c.addEventListener(`click`,()=>f(!1)),o.addEventListener(`click`,e=>{e.target===o&&f(!1)}),o.addEventListener(`cancel`,()=>f(!1)),o.showModal(),d.focus()})}function E(){let e=document.querySelector(`password-confirm`);if(!e){let e=document.createElement(`password-confirm`);return document.body.appendChild(e),e}return e}async function D(){let e=E();return new Promise(t=>{e.onConfirm=e=>t(e),e.onCancel=()=>t(null),e.show(` `,`회원 삭제 전용 비밀번호를 입력하세요.`)})}async function O(e){let t=o.getState().members.find(t=>t.id===e);if(!t)return;let n=s.getState().records.filter(t=>t.memberId===e).length;if(!await T(null,null,{solidOk:!0,okLabel:`삭제`,variant:`warn`,memberName:t.name,recordCount:n}))return;let r=await D();if(r!==null)try{await i(e,r),s.setState(t=>({...t,records:t.records.filter(t=>t.memberId!==e)}))}catch(e){console.error(`회원 삭제 실패:`,e)}}o.subscribe(e=>e.loading?d():f()),s.subscribe(e=>e.loading?d():f());var k=50,A=k,j=r(`member-table`);j.setProp(`columns`,[{key:`name`,label:`이름`,align:`center`,width:`29%`,render:e=>`<span class="member-name">${t(e)}</span>`},{key:`gender`,label:`성별`,align:`center`,width:`18%`},{key:`trainer`,label:`담당 트레이너`,align:`center`,width:`23%`},{key:`recordCount`,label:`체크 횟수`,align:`center`,width:`18%`,render:(e,t)=>`${t.recordCount}회`},{key:`action`,label:``,align:`right`,width:`12%`,render:(e,n)=>`<button type="button" class="row-remove" data-row-action="remove" aria-label="${t(n.name)} 삭제">삭제</button>`}]),j.setProp(`ariaLabel`,`회원 목록`),j.setProp(`emptyMessage`,`검색 결과가 없어요`),j.setProp(`striped`,!1);var M=``;function N(e){let t=c(s.getState().records);return e.map(e=>({...e,gender:u(e.gender),recordCount:t.get(e.id)||0}))}function P(){let e=M.trim().toLowerCase(),{members:t}=o.getState(),n=e?t.filter(t=>t.name.toLowerCase().includes(e)):t.slice(),i=n.slice(0,A);j.setProp(`rows`,N(i));let a=r(`load-more-btn`);n.length>A?(a||(a=document.createElement(`button`),a.id=`load-more-btn`,a.textContent=`더 보기`,a.className=`btn-load-more`,a.addEventListener(`click`,()=>{A+=k,P()}),j.parentNode?.insertBefore(a,j.nextSibling)),a.style.display=``,a.textContent=`더 보기 (${n.length-A}건 남음)`):a&&(a.style.display=`none`);let{loading:s}=o.getState();r(`skeleton-placeholder`)}function F(){M=r(`search-input`).value,P()}async function I(){await Promise.all([a().catch(e=>{console.error(`회원 목록 로드 실패:`,e),j.setProp(`rows`,[])}),l().catch(()=>{})])}e(I),o.subscribe(P),s.subscribe(P),I(),j.addEventListener(`rowActivate`,e=>{let t=e.detail?.key;t&&(window.location.href=`member-detail.html?memberID=${encodeURIComponent(t)}`)}),j.addEventListener(`rowAction`,e=>{e.detail?.action===`remove`&&O(e.detail.key)}),r(`search-input`).addEventListener(`input`,F),P();