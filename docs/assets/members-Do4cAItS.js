import{i as e,r as t,t as n}from"./app-header-QCOnakgs.js";/* empty css                     */import{t as r}from"./utils-dom-y8yOKY5h.js";/* empty css                       */import{i,n as a,r as o}from"./member-store-BeCLUSmp.js";import{l as s,n as c,o as l}from"./record-utils-QV3OCxjZ.js";import{t as u}from"./member-utils-C3eDrFg1.js";import"./data-table-DIx-wW7A.js";import{n as d,t as f}from"./loading-overlay-BYL9g967.js";n({tag:`password-confirm`,render(){return`
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

				.pc-ok { background: var(--red-fg); color: #fff; }
				.pc-ok:hover { background: #c95a5a }
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
			</div>`},onConnect(){let e=this.querySelector(`.pc-backdrop`),t=this.querySelector(`.pc-input`),n=this.querySelector(`.pc-ok`),r=this.querySelector(`.pc-cancel`),i=n=>{let r=t.value;t.value=``,e.hidden=!0,n&&typeof this.onConfirm==`function`&&this.onConfirm(r),!n&&typeof this.onCancel==`function`&&this.onCancel()};n.addEventListener(`click`,()=>i(!0)),r.addEventListener(`click`,()=>i(!1)),e.addEventListener(`click`,t=>{t.target===e&&i(!1)}),t.addEventListener(`keydown`,e=>{e.key===`Enter`&&i(!0),e.key===`Escape`&&i(!1)})},show(e,t){this.querySelector(`.pc-title`).textContent=e||`비밀번호 확인`,this.querySelector(`.pc-msg`).textContent=t||``;let n=this.querySelector(`.pc-backdrop`),r=this.querySelector(`.pc-input`);n.hidden=!1,r.focus()},close(){this.querySelector(`.pc-backdrop`).hidden=!0}});async function p(e,t){return new Promise(n=>{let r=document.createElement(`dialog`);r.className=`cd-dialog cd-dialog--danger`,r.innerHTML=`
			<style>
				.cd-dialog {
					background: var(--surface2);
					color: var(--text);
					padding: 0;
					border-radius: var(--rlg);
					border: 0.5px solid var(--border2);
					box-shadow: 0 12px 40px rgba(0, 0, 0, .5);
					max-width: min(90vw, 360px);
					margin: auto;
				}

				.cd-dialog::backdrop { background: rgba(0, 0, 0, .55) }
				.cd-dialog[open] { display: flex; flex-direction: column }
				.cd-header { padding: 20px 20px 8px; border-bottom: 1px solid var(--border2) }
				.cd-title { margin: 0; font-size: 18px }
				.cd-body { padding: 12px 20px; font-size: 13px; color: var(--text2); white-space: pre-line }
				.cd-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 8px 20px 20px }

				.cd-cancel { background: transparent; color: var(--text); border: 1px solid var(--border2); padding: 8px 16px; border-radius: var(--r); cursor: pointer }

				.cd-ok { background: var(--red-fg); color: #fff; border: none; padding: 8px 16px; border-radius: var(--r); cursor: pointer }

				.cd-ok:hover { background: #c95a5a }
			</style>
			<div class="cd-header"><h2 class="cd-title"></h2></div>
			<div class="cd-body"></div>
			<div class="cd-footer">
				<button type="button" class="cd-cancel">취소</button>
				<button type="button" class="cd-ok">확인</button>
			</div>
		`,r.querySelector(`.cd-title`).textContent=e,r.querySelector(`.cd-body`).textContent=t,document.body.appendChild(r);let i=r.querySelector(`.cd-ok`),a=r.querySelector(`.cd-cancel`),o=e=>{r.close(),r.remove(),n(e)};i.addEventListener(`click`,()=>o(!0)),a.addEventListener(`click`,()=>o(!1)),r.addEventListener(`click`,e=>{e.target===r&&o(!1)}),r.addEventListener(`cancel`,()=>o(!1)),r.showModal(),a.focus()})}function m(){let e=document.querySelector(`password-confirm`);if(!e){let e=document.createElement(`password-confirm`);return document.body.appendChild(e),e}return e}async function h(){let e=m();return new Promise(t=>{e.onConfirm=e=>t(e),e.onCancel=()=>t(null),e.show(` `,`회원 삭제 전용 비밀번호를 입력하세요.`)})}async function g(e){let t=o.getState().members.find(t=>t.id===e);if(!t)return;let n=s.getState().records.filter(t=>t.memberId===e).length;if(!await p(`회원 삭제 확인`,n>0?`회원 ${t.name} 님을 삭제하시겠습니까?\n\n연결된 체크기록 ${n}건도 함께 삭제합니다.`:`회원 ${t.name} 님을 삭제하시겠습니까?`)||!await p(`최종 확인`,`정말 삭제하실 겁니까? 확실해요?`))return;let r=await h();if(r!==null)try{await i(e,r),s.setState(t=>({...t,records:t.records.filter(t=>t.memberId!==e)}))}catch(e){console.error(`회원 삭제 실패:`,e)}}o.subscribe(e=>e.loading?d():f()),s.subscribe(e=>e.loading?d():f());var _=50,v=_,y=r(`member-table`);y.setProp(`columns`,[{key:`name`,label:`이름`,align:`center`,width:`29%`,render:e=>`<span class="member-name">${t(e)}</span>`},{key:`gender`,label:`성별`,align:`center`,width:`18%`},{key:`trainer`,label:`담당 트레이너`,align:`center`,width:`23%`},{key:`recordCount`,label:`체크 횟수`,align:`center`,width:`18%`,render:(e,t)=>`${t.recordCount}회`},{key:`action`,label:``,align:`right`,width:`12%`,render:(e,n)=>`<button type="button" class="row-remove" data-row-action="remove" aria-label="${t(n.name)} 삭제">삭제</button>`}]),y.setProp(`ariaLabel`,`회원 목록`),y.setProp(`emptyMessage`,`검색 결과가 없어요`),y.setProp(`striped`,!1);var b=``;function x(e){let t=c(s.getState().records);return e.map(e=>({...e,gender:u(e.gender),recordCount:t.get(e.id)||0}))}function S(){let e=b.trim().toLowerCase(),{members:t}=o.getState(),n=e?t.filter(t=>t.name.toLowerCase().includes(e)):t.slice(),i=n.slice(0,v);y.setProp(`rows`,x(i));let a=r(`load-more-btn`);n.length>v?(a||(a=document.createElement(`button`),a.id=`load-more-btn`,a.textContent=`더 보기`,a.className=`btn-load-more`,a.addEventListener(`click`,()=>{v+=_,S()}),y.parentNode?.insertBefore(a,y.nextSibling)),a.style.display=``,a.textContent=`더 보기 (${n.length-v}건 남음)`):a&&(a.style.display=`none`);let{loading:s}=o.getState();r(`skeleton-placeholder`)}function C(){b=r(`search-input`).value,S()}async function w(){await Promise.all([a().catch(e=>{console.error(`회원 목록 로드 실패:`,e),y.setProp(`rows`,[])}),l().catch(()=>{})])}e(w),o.subscribe(S),s.subscribe(S),w(),y.addEventListener(`rowActivate`,e=>{let t=e.detail?.key;t&&(window.location.href=`member-detail.html?memberID=${encodeURIComponent(t)}`)}),y.addEventListener(`rowAction`,e=>{e.detail?.action===`remove`&&g(e.detail.key)}),r(`search-input`).addEventListener(`input`,C),S();