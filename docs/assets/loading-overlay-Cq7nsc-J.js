var e=null,t=0;if(typeof HTMLElement<`u`){class t extends HTMLElement{connectedCallback(){e=this,this._renderShell()}disconnectedCallback(){e===this&&(e=null)}_renderShell(){if(this.querySelector(`.loading-overlay`))return;let e=document.createElement(`div`);e.className=`loading-overlay`,e.setAttribute(`role`,`status`),e.setAttribute(`aria-live`,`polite`),e.style.cssText=`
				position: fixed;
				inset: 0;
				z-index: 9999;

				/* background: rgba(255, 255, 255, .65); */
				background: rgba(255, 255, 255, .25);
				/* background: rgba(255, 255, 255, .0); */

				display: none;
				align-items: center;
				justify-content: center;
			`,e.innerHTML=`
				<div style="display:flex; flex-direction:column; align-items:center; gap:.75rem;">
					<div class="spinner" style="width:32px; height:32px; border: 3px solid #e5e7eb; border-top-color:#3b82f6; border-radius:50%; animation: es-loading-spin .6s linear infinite;"></div>
					<span style="font-size:14px; /*color:#374151;*/">로딩중…</span>
				</div>`;let t=document.createElement(`style`);t.textContent=`@keyframes es-loading-spin{to{transform:rotate(360deg)}}`,this.appendChild(t),this.appendChild(e)}show(){let e=this.querySelector(`.loading-overlay`);e&&(e.style.display=`flex`)}hide(){let e=this.querySelector(`.loading-overlay`);e&&(e.style.display=`none`)}}customElements.define(`es-loading-overlay`,t)}function n(){if(typeof document>`u`||typeof customElements>`u`||!customElements.get(`es-loading-overlay`)||!document.body)return null;let e=document.querySelector(`es-loading-overlay`);return e||(e=document.createElement(`es-loading-overlay`),document.body.appendChild(e)),e}function r(){let e=n();e&&(t++,e.show())}function i(){let n=e||(typeof document<`u`?document.querySelector(`es-loading-overlay`):null);n&&(t=Math.max(0,t-1),t===0&&n.hide())}export{r as n,i as t};