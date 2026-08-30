import{r as e}from"./app-header-BqQN3x0J.js";function t(t){let{tag:n,props:r={},render:i,connectedCallback:a,disconnectedCallback:o,attributeChangedCallback:s,observedAttributes:c=[]}=t;[...new Set([...c,...Object.keys(r)])];let l={render(){return i.call(this,l._getProps.call(this))},connectedCallback(){l._initProps.call(this),a&&a.call(this)},disconnectedCallback(){o&&o.call(this)},attributeChangedCallback(e,t,n){t!==n&&(r[e]!==void 0&&(this._props[e]=l._deserializeProp(e,n),l.refresh.call(this)),s&&s.call(this,e,t,n))},_initProps(){this._props={};for(let[e,t]of Object.entries(r)){let n=this.getAttribute(e);this._props[e]=n===null?t.default:l._deserializeProp(e,n)}},_deserializeProp(e,t){let n=r[e];return!n||n.type===String?t:n.type===Number?Number(t):n.type===Boolean?t!==`false`:n.type===Array?t?t.split(`,`).map(e=>e.trim()):[]:n.type===Object?t?JSON.parse(t):{}:t},_getProps(){return{...this._props}},setProp(e,t){this._props[e]!==t&&(this._props[e]=t,this.setAttribute(e,l._serializeProp(e,t)),l.refresh.call(this))},_serializeProp(e,t){let n=r[e];return!n||n.type===String?t:n.type===Number?String(t):n.type===Boolean?t?`true`:`false`:n.type===Array?t.join(`,`):n.type===Object?JSON.stringify(t):String(t)},emit(e,t={}){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))},refresh(){this.innerHTML=i.call(this,this._getProps())}};return e(n,l)}var n=({variant:e,disabled:t,loading:n,type:r,ariaLabel:i})=>{let a=`btn btn-${e}${t?` disabled`:``}${n?` loading`:``}`,o={};i&&(o.label=i),t&&(o.disabled=`true`),n&&(o.busy=`true`);let s=``;for(let[e,t]of Object.entries(o))s+=` aria-${e}="${t}"`;return`
			<button type="${r}" class="${a}"${s} ${t?`disabled`:``}>
				${n?`<span class="btn-spinner" aria-hidden="true"></span>`:``}
				<span class="btn-text"><slot>버튼</slot></span>
			</button>`};t({tag:`ui-button`,props:{variant:{type:String,default:`primary`},disabled:{type:Boolean,default:!1},loading:{type:Boolean,default:!1},type:{type:String,default:`button`},ariaLabel:{type:String,default:``}},render(){return n(this._getProps())},onConnect(){this.addEventListener(`click`,e=>{(this._props.disabled||this._props.loading)&&(e.preventDefault(),e.stopPropagation()),this.emit(`click`,{originalEvent:e})})}});var r=({href:e,variant:t,disabled:n,ariaLabel:r,target:i,rel:a})=>{let o=`btn btn-${t} link-btn${n?` disabled`:``}`,s={};r&&(s.label=r),n&&(s.disabled=`true`);let c=``;for(let[e,t]of Object.entries(s))c+=` aria-${e}="${t}"`;let l=i?` target="${i}"`:``,u=a?` rel="${a}"`:``;return`
			<a class="${o}"${n?``:` href="${e}"`}${l}${u}${c} role="button" tabindex="${n?-1:0}">
				<span class="btn-text"><slot>링크 버튼</slot></span>
			</a>`};t({tag:`ui-link-button`,props:{href:{type:String,default:`#`},variant:{type:String,default:`primary`},disabled:{type:Boolean,default:!1},ariaLabel:{type:String,default:``},target:{type:String,default:``},rel:{type:String,default:``}},render(){return r(this._getProps())},onConnect(){this.addEventListener(`click`,e=>{this._props.disabled&&(e.preventDefault(),e.stopPropagation()),this.emit(`click`,{originalEvent:e})}),this.addEventListener(`keydown`,e=>{this._props.disabled||(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),!this._props.disabled&&this._props.href&&this._props.href!==`#`&&(window.location.href=this._props.href))})}});var i=({header:e,subHeader:t,collapsible:n,expanded:r,footer:i,variant:a,ariaLabel:o,ariaDescribedBy:s},{elementId:c,hasFooterSlot:l})=>{let u=`card-${c||`auto`}`,d=e||t,f=i||l,p={};o&&(p.label=o),s&&(p.describedby=s),n&&(p.expanded=String(r));let m=``;for(let[e,t]of Object.entries(p))m+=` aria-${e}="${t}"`;return`
			<div class="card-panel card-${a}${n?` collapsible`:``}${r?` expanded`:` collapsed`}"${m}>
				${d?`
					<header class="card-header">
						${e?`<h3 class="card-title">${e}</h3>`:``}
						${t?`<div class="card-subheader">${t}</div>`:``}
						${n?`
							<button
								type="button"
								class="card-toggle"
								aria-expanded="${r}"
								aria-controls="${u}-content"
								data-action="toggle"
							>
								<span class="toggle-icon" aria-hidden="true">${r?`▾`:`▸`}</span>
							</button>
						`:``}
					</header>
				`:``}
				<div class="card-content" id="${u}-content" role="region" hidden="${!r}">
					<slot></slot>
				</div>
				${f?`
					<footer class="card-footer">
						${i}
						<slot name="footer"></slot>
					</footer>
				`:``}
			</div>`};t({tag:`ui-card-panel`,props:{header:{type:String,default:``},subHeader:{type:String,default:``},collapsible:{type:Boolean,default:!1},expanded:{type:Boolean,default:!0},footer:{type:String,default:``},variant:{type:String,default:`default`},ariaLabel:{type:String,default:``},ariaDescribedBy:{type:String,default:``}},render(){return this._hasFooterSlot=this.querySelector(`[slot='footer']`)!==null,i(this._getProps(),{elementId:this.id,hasFooterSlot:this._hasFooterSlot})},onConnect(){this.addEventListener(`click`,e=>{this._props.collapsible&&e.target.closest(`[data-action='toggle']`)&&(this.setProp(`expanded`,!this._props.expanded),this.emit(`toggle`,{expanded:this._props.expanded}))}),this.addEventListener(`keydown`,e=>{this._props.collapsible&&(e.key===`Enter`||e.key===` `)&&e.target.closest(`[data-action='toggle']`)&&(e.preventDefault(),this.setProp(`expanded`,!this._props.expanded),this.emit(`toggle`,{expanded:this._props.expanded}))})}});var a=({checked:e,indeterminate:t,disabled:n,label:r,value:i,name:a,ariaLabel:o,ariaDescribedBy:s},{elementId:c})=>{let l={};o&&(l.label=o),s&&(l.describedby=s),l.checked=t?`mixed`:String(e),n&&(l.disabled=`true`);let u=``;for(let[e,t]of Object.entries(l))u+=` aria-${e}="${t}"`;let d=`checkbox-${c||`auto`}`;return`
			<label class="checkbox-wrapper${n?` disabled`:``}${t?` indeterminate`:``}">
				<input
					type="checkbox"
					id="${d}"
					class="checkbox-input"
					value="${i}"
					name="${a}"
					${e?`checked`:``}
					${n?`disabled`:``}
					${t?`aria-checked='mixed'`:``}
					tabindex="${n?-1:0}"
				>
				<span class="checkbox-box" aria-hidden="true">
					<svg class="checkbox-check" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M3 8 6 11 13 4" />
					</svg>
					<svg class="checkbox-indeterminate" viewBox="0 0 16 16" fill="currentColor">
						<rect x="3" y="7" width="10" height="2" />
					</svg>
				</span>
				${r?`<span class="checkbox-label">${r}</span>`:``}
			</label>`};t({tag:`ui-checkbox`,props:{checked:{type:Boolean,default:!1},indeterminate:{type:Boolean,default:!1},disabled:{type:Boolean,default:!1},label:{type:String,default:``},value:{type:String,default:`on`},name:{type:String,default:``},ariaLabel:{type:String,default:``},ariaDescribedBy:{type:String,default:``}},render(){return a(this._getProps(),{elementId:this.id})},onConnect(){let e=this.querySelector(`.checkbox-input`);e&&(e.addEventListener(`change`,e=>{this.setProp(`checked`,e.target.checked),this.setProp(`indeterminate`,!1),this.emit(`change`,{checked:this._props.checked,value:this._props.value})}),this.addEventListener(`click`,t=>{(t.target===this||t.target.classList.contains(`checkbox-label`))&&e.focus()}),this.addEventListener(`keydown`,t=>{t.key===` `&&!this._props.disabled&&(t.preventDefault(),e.click())}))},attributeChangedCallback(e,t,n){(e===`checked`||e===`indeterminate`||e===`disabled`)&&this.refresh()}});var o=({columns:e,rows:t,selectable:n,sortable:r,selectionKey:i,selectedRows:a,striped:o,hoverable:s,emptyMessage:c,ariaLabel:l,ariaDescribedBy:u},{elementId:d})=>{`${d||`auto`}`;let f={};l&&(f.label=l),u&&(f.describedby=u);let p=``;for(let[e,t]of Object.entries(f))p+=` aria-${e}="${t}"`;let m=e.map(e=>`<th${r&&e.sortable?` data-sort="${e.key}" aria-sort="none" tabindex="0" role="columnheader"`:` role="columnheader"`}${e.width?` style="width: ${e.width};"`:``} class="${e.align?` align-${e.align}`:``}">${e.label}</th>`).join(``),h=n?`<th role="columnheader" style="width: 40px;"><input type="checkbox" class="select-all" aria-label="전체 선택"></th>`:``,g;return g=t.length===0?`<tr class="empty-row"><td colspan="${e.length+ +!!n}" class="empty-cell">${c}</td></tr>`:t.map((t,r)=>{let o=t[i],c=a.includes(o);return`<tr class="${`data-row${c?` selected`:``}${s?` hoverable`:``}`}" data-row-key="${o}" tabindex="0" role="row" aria-selected="${c}">${n?`<td><input type="checkbox" class="row-select" value="${o}" ${c?`checked`:``} aria-label="${o} 선택"></td>`:``}${e.map(e=>{let n=e.render?e.render(t[e.key],t,r):t[e.key];return`<td class="${e.align?` align-${e.align}`:``}" data-key="${e.key}">${n??``}</td>`}).join(``)}</tr>`}).join(``),`
			<div class="data-table-wrapper${o?` striped`:``}"${p}>
				<table class="data-table" role="grid" aria-label="${l||`데이터 테이블`}">
					<thead>
						<tr>${h}${m}</tr>
					</thead>
					<tbody>
						${g}
					</tbody>
				</table>
			</div>`};t({tag:`ui-data-table`,props:{columns:{type:Array,default:[]},rows:{type:Array,default:[]},selectable:{type:Boolean,default:!1},sortable:{type:Boolean,default:!1},selectionKey:{type:String,default:`id`},selectedRows:{type:Array,default:[]},striped:{type:Boolean,default:!0},hoverable:{type:Boolean,default:!0},emptyMessage:{type:String,default:`데이터가 없습니다`},ariaLabel:{type:String,default:``},ariaDescribedBy:{type:String,default:``}},render(){return o(this._getProps(),{elementId:this.id})},onConnect(){this._props.sortable&&(this.addEventListener(`click`,e=>{let t=e.target.closest(`th[data-sort]`);if(t){let e=t.dataset.sort;this._handleSort(e)}}),this.addEventListener(`keydown`,e=>{let t=e.target.closest(`th[data-sort]`);t&&(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),this._handleSort(t.dataset.sort))})),this._props.selectable&&(this.addEventListener(`change`,e=>{e.target.classList.contains(`select-all`)?this._toggleSelectAll(e.target.checked):e.target.classList.contains(`row-select`)&&this._toggleRowSelect(e.target.value,e.target.checked)}),this.addEventListener(`click`,e=>{if(e.target.closest(`input`))return;let t=e.target.closest(`tr[data-row-key]`);if(t){let e=t.dataset.rowKey,n=this._props.selectedRows.includes(e)?this._props.selectedRows.filter(t=>t!==e):[...this._props.selectedRows,e];this.setProp(`selectedRows`,n),this.emit(`rowSelect`,{key:e,selected:n.includes(e)})}}),this.addEventListener(`keydown`,e=>{if(e.key===` `&&e.target.closest(`tr[data-row-key]`)){e.preventDefault();let t=e.target.closest(`tr[data-row-key]`).dataset.rowKey,n=this._props.selectedRows.includes(t)?this._props.selectedRows.filter(e=>e!==t):[...this._props.selectedRows,t];this.setProp(`selectedRows`,n),this.emit(`rowSelect`,{key:t,selected:n.includes(t)})}})),this.addEventListener(`click`,e=>{let t=e.target.closest(`[data-row-action]`);if(t){let n=t.closest(`tr[data-row-key]`);n&&this.emit(`rowAction`,{key:n.dataset.rowKey,action:t.dataset.rowAction,originalEvent:e})}})},_handleSort(e){let t=this._props.columns.find(t=>t.key===e);if(!t||!t.sortable)return;let n=this._sortState?.[e]||`none`,r=`none`;n===`none`||n===`desc`?r=`asc`:n===`asc`&&(r=`desc`),this._sortState={...this._sortState,[e]:r},this.emit(`sort`,{key:e,direction:r}),this.refresh()},_toggleSelectAll(e){let t=this._props.rows.map(e=>e[this._props.selectionKey]),n=e?t:[];this.setProp(`selectedRows`,n),this.emit(`selectAll`,{selected:n})},_toggleRowSelect(e,t){let n=t?[...this._props.selectedRows,e]:this._props.selectedRows.filter(t=>t!==e);this.setProp(`selectedRows`,n),this.emit(`rowSelect`,{key:e,selected:t})}});var s=({score:e,max:t,min:n,dots:r,index:i,interactive:a,ariaLabel:o,ariaDescribedBy:s,showValue:c})=>{let l=Math.max(n,Math.min(t,e)),u=`data-i`,d=l<=n,f=l>=t,p={};o&&(p.label=o),s&&(p.describedby=s);let m=``;for(let[e,t]of Object.entries(p))m+=` aria-${e}="${t}"`;return`
			<div class="score-controller${a?``:` readonly`}" data-index="${i}"${m}>
				<div class="score-controls">
					<button
						type="button"
						class="score-btn score-decrease"
						${u}="${i}"
						data-delta="-1"
						aria-label="점수 감소"
						${!a||d?`disabled`:``}
						tabindex="${a&&!d?0:-1}"
					>
						−
					</button>
					${c?`
						<span class="score-value" aria-live="polite" id="sv-${i}">${l}</span>
					`:``}
					<button
						type="button"
						class="score-btn score-increase"
						${u}="${i}"
						data-delta="1"
						aria-label="점수 증가"
						${!a||f?`disabled`:``}
						tabindex="${a&&!f?0:-1}"
					>
						+
					</button>
				</div>
				<div class="score-dots" role="group" aria-label="점수 ${l}점">
					${Array.from({length:r},(e,t)=>`
						<span class="dot${t<l?` on`:``}" id="dot-${i}-${t}" data-score="${t}" aria-hidden="true"></span>
					`).join(``)}
				</div>
			</div>`};t({tag:`ui-score-controller`,props:{score:{type:Number,default:0},max:{type:Number,default:3},min:{type:Number,default:0},dots:{type:Number,default:4},index:{type:Number,default:0},interactive:{type:Boolean,default:!0},ariaLabel:{type:String,default:``},ariaDescribedBy:{type:String,default:``},showValue:{type:Boolean,default:!0}},render(){return s(this._getProps())},onConnect(){this._props.interactive&&(this.addEventListener(`click`,e=>{let t=e.target.closest(`.score-btn`);if(!t)return;let n=Number(t.dataset.delta);this._adjustScore(n)}),this.addEventListener(`keydown`,e=>{this._props.interactive&&(e.key===`ArrowRight`||e.key===`ArrowUp`?(e.preventDefault(),this._adjustScore(1)):(e.key===`ArrowLeft`||e.key===`ArrowDown`)&&(e.preventDefault(),this._adjustScore(-1)))}))},_adjustScore(e){let{score:t,min:n,max:r}=this._props,i=Math.max(n,Math.min(r,t+e));i!==t&&(this.setProp(`score`,i),this.emit(`adjust`,{score:i,delta:e,index:this._props.index}))}});var c=({score:e,max:t,count:n,size:r,interactive:i,ariaLabel:a,ariaDescribedBy:o,prefix:s},{elementId:c})=>{let l=Math.max(0,Math.min(t,e)),u=`dots-${s||c||`auto`}`,d={};a&&(d.label=a),o&&(d.describedby=o),d.role=`group`,d[`aria-label`]=`점수 ${l}점 / ${t}점`;let f=``;for(let[e,t]of Object.entries(d))f+=` aria-${e}="${t}"`;return`
			<div class="score-dots ${`dots-${r}`}${i?` interactive`:``}" id="${u}"${f}>
				${Array.from({length:n},(e,t)=>`
					<span
						class="dot${t<l?` on`:``}"
						id="dot-${s||c||`auto`}-${t}"
						data-score="${t}"
						${i?`tabindex="0" role="button" aria-label="${t}점" aria-pressed="${t<=l}"`:`aria-hidden='true'`}
					></span>
				`).join(``)}
			</div>`};t({tag:`ui-score-dots`,props:{score:{type:Number,default:0},max:{type:Number,default:3},count:{type:Number,default:4},size:{type:String,default:`md`},interactive:{type:Boolean,default:!1},ariaLabel:{type:String,default:``},ariaDescribedBy:{type:String,default:``},prefix:{type:String,default:``}},render(){return c(this._getProps(),{elementId:this.id})},onConnect(){this._props.interactive&&(this.addEventListener(`click`,e=>{let t=e.target.closest(`.dot`);if(!t)return;let n=Number(t.dataset.score);this.setProp(`score`,n),this.emit(`change`,{score:n,index:n})}),this.addEventListener(`keydown`,e=>{let t=e.target.closest(`.dot`);if(t){if(e.key===`Enter`||e.key===` `){e.preventDefault();let n=Number(t.dataset.score);this.setProp(`score`,n),this.emit(`change`,{score:n,index:n})}else e.key===`ArrowRight`?(e.preventDefault(),t.nextElementSibling?.focus()):e.key===`ArrowLeft`&&(e.preventDefault(),t.previousElementSibling?.focus())}}))}});var l=({data:e,width:t,height:n,color:r,background:i,showArea:a,showPoints:o,pointRadius:s,lineWidth:c,padding:l,baseline:u,ariaLabel:d,ariaDescribedBy:f})=>{if(!e||e.length===0)return`<div class="sparkline-empty" style="width: ${t}px; height: ${n}px;" aria-hidden="true">데이터 없음</div>`;let p=e.filter(e=>typeof e==`number`&&!isNaN(e));if(p.length===0)return`<div class="sparkline-empty" style="width: ${t}px; height: ${n}px;" aria-hidden="true">유효한 데이터 없음</div>`;let m=Math.min(...p),h=Math.max(...p),g=h-m||1,_=(t-l*2)/(p.length-1||1),v=p.map((e,t)=>({x:l+t*_,y:n-l-(e-m)/g*(n-l*2),value:e})),y=u!==null&&u>=m&&u<=h?n-l-(u-m)/g*(n-l*2):null,b=v.map((e,t)=>`${t===0?`M`:`L`} ${e.x.toFixed(2)} ${e.y.toFixed(2)}`).join(` `),x=``;a&&(x=[`M ${v[0].x} ${n-l}`,...v.map(e=>`L ${e.x} ${e.y}`),`L ${v[v.length-1].x} ${n-l}`,`Z`].join(` `));let S=o?v.map(e=>`
				<circle
					cx="${e.x.toFixed(2)}"
					cy="${e.y.toFixed(2)}"
					r="${s}"
					fill="${r}"
					stroke="${i}"
					stroke-width="1"
					aria-hidden="true"
				/>`).join(``):``,C={};d&&(C.label=d),f&&(C.describedby=f),C.role=`img`,C[`aria-label`]=`스파크라인: ${p.length}개 데이터, 최솟값 ${m.toFixed(1)}, 최댓값 ${h.toFixed(1)}`;let w=``;for(let[e,t]of Object.entries(C))w+=` aria-${e}="${t}"`;return`
			<div class="sparkline-container" style="width: ${t}px; height: ${n}px;"${w}>
				<svg width="${t}" height="${n}" viewBox="0 0 ${t} ${n}" aria-hidden="true">
					${i===`transparent`?``:`<rect width="100%" height="100%" fill="${i}" />`}
					${y===null?``:`
						<line
							x1="${l}" y1="${y.toFixed(2)}"
							x2="${t-l}" y2="${y.toFixed(2)}"
							stroke="var(--border2)" stroke-width="1" stroke-dasharray="4,4"
							aria-hidden="true"
						/>`}
					${a?`<path d="${x}" fill="${r}" fill-opacity="0.15" aria-hidden="true" />`:``}
					<path
						d="${b}"
						stroke="${r}"
						stroke-width="${c}"
						fill="none"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					/>
					${S}
				</svg>
			</div>`};t({tag:`ui-sparkline`,props:{data:{type:Array,default:[]},width:{type:Number,default:260},height:{type:Number,default:68},color:{type:String,default:`var(--accent)`},background:{type:String,default:`transparent`},showArea:{type:Boolean,default:!0},showPoints:{type:Boolean,default:!0},pointRadius:{type:Number,default:3},lineWidth:{type:Number,default:2},padding:{type:Number,default:4},baseline:{type:Number,default:null},ariaLabel:{type:String,default:``},ariaDescribedBy:{type:String,default:``}},render(){return l(this._getProps())}});var u=({tabs:e,activeIndex:t,orientation:n},{elementId:r})=>{let i=`tabs-${r||`auto`}`;return`
			<div class="tabs-container" data-orientation="${n}">
				<div role="tablist" id="${i}" aria-orientation="${n}" class="tab-list">
					${e.map((e,n)=>`
			<button
				role="tab"
				id="${i}-tab-${n}"
				aria-controls="${i}-panel-${n}"
				aria-selected="${n===t}"
				aria-disabled="${e.disabled?`true`:`false`}"
				tabindex="${n===t?0:-1}"
				class="tab-btn${e.disabled?` disabled`:``}"
				data-tab-index="${n}"
			>
				${e.label}
			</button>`).join(``)}
				</div>
				<div class="tab-panels">
					${e.map((e,n)=>`
			<div
				role="tabpanel"
				id="${i}-panel-${n}"
				aria-labelledby="${i}-tab-${n}"
				hidden="${n!==t}"
				class="tab-panel${n===t?` active`:``}"
			>
				${e.panel||``}
			</div>`).join(``)}
				</div>
			</div>`};t({tag:`ui-tabs`,props:{tabs:{type:Array,default:[]},activeIndex:{type:Number,default:0},orientation:{type:String,default:`horizontal`}},render(){return u(this._getProps(),{elementId:this.id})},onConnect(){this.addEventListener(`click`,e=>{let t=e.target.closest(`.tab-btn`);if(!t||t.disabled)return;let n=Number(t.dataset.tabIndex);this.setProp(`activeIndex`,n),this.emit(`change`,{index:n,previousIndex:this._getProps().activeIndex})}),this.addEventListener(`keydown`,e=>{let t=e.target.closest(`.tab-btn`);if(!t)return;let n=this.querySelectorAll(`.tab-btn:not(.disabled)`),r=Array.from(n).indexOf(t),i=r;this._props.orientation===`vertical`?e.key===`ArrowDown`?i=(r+1)%n.length:e.key===`ArrowUp`&&(i=(r-1+n.length)%n.length):e.key===`ArrowRight`?i=(r+1)%n.length:e.key===`ArrowLeft`&&(i=(r-1+n.length)%n.length),i!==r&&(e.preventDefault(),n[i].focus(),this.setProp(`activeIndex`,i),this.emit(`change`,{index:i,previousIndex:r})),e.key===`Home`&&(e.preventDefault(),n[0].focus(),this.setProp(`activeIndex`,0)),e.key===`End`&&(e.preventDefault(),n[n.length-1].focus(),this.setProp(`activeIndex`,n.length-1))})}});var d=({label:e,removable:t,pressed:n,variant:r,disabled:i,ariaLabel:a})=>{let o=`tag tag-${r}${n?` on`:``}${i?` disabled`:``}`,s={};s.pressed=String(n),a&&(s.label=a),i&&(s.disabled=`true`);let c=``;for(let[e,t]of Object.entries(s))c+=` aria-${e}="${t}"`;return`
		<button
			type="button"
			role="switch"
			class="${o}"
			${c}
			${i?`disabled`:``}
			tabindex="${i?-1:0}"
		>
			<span class="tag-label">${e}</span>
			${t?`<span class="tag-remove" aria-hidden="true">×</span>`:``}
		</button>`};t({tag:`ui-tag`,props:{label:{type:String,default:``},removable:{type:Boolean,default:!1},pressed:{type:Boolean,default:!1},variant:{type:String,default:`default`},disabled:{type:Boolean,default:!1},ariaLabel:{type:String,default:``}},render(){return d(this._getProps())},onConnect(){this.addEventListener(`click`,e=>{if(!this._props.disabled){if(e.target.closest(`.tag-remove`)){e.stopPropagation(),this.emit(`remove`,{label:this._props.label});return}this.setProp(`pressed`,!this._props.pressed),this.emit(`toggle`,{pressed:this._props.pressed,label:this._props.label})}}),this.addEventListener(`keydown`,e=>{this._props.disabled||(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),this.setProp(`pressed`,!this._props.pressed),this.emit(`toggle`,{pressed:this._props.pressed,label:this._props.label}))})}});var f=({value:e,placeholder:t,multiline:n,rows:r,cols:i,maxLength:a,minLength:o,disabled:s,readonly:c,required:l,spellcheck:u,autocomplete:d,ariaLabel:f,ariaDescribedBy:p,ariaInvalid:m,label:h,hint:g,error:_,autoResize:v},{elementId:y})=>{let b=`textbox-${y||`auto`}`,x=g?`${b}-hint`:``,S=_?`${b}-error`:``,C={};f&&(C.label=f),p&&(C.describedby=`${x} ${S} ${p}`.trim()),m&&(C.invalid=`true`),l&&(C.required=`true`),c&&(C.readonly=`true`),s&&(C.disabled=`true`);let w=``;for(let[e,t]of Object.entries(C))w+=` aria-${e}="${t}"`;let T=a>0?` maxlength="${a}"`:``,E=o>0?` minlength="${o}"`:``,D=n?` rows="${r}"`:``,O=n?` cols="${i}"`:``;return n?`
				<div class="text-box-wrapper${s?` disabled`:``}${c?` readonly`:``}${_?` has-error`:``}">
					${h?`<label for="${b}" class="text-box-label">${h}${l?` <span class="required" aria-hidden="true">*</span>`:``}</label>`:``}
					<textarea
						id="${b}"
						class="text-box text-area"
						placeholder="${t}"
						value="${e}"
						${D}
						${O}
						${T}
						${E}
						${s?`disabled`:``}
						${c?`readonly`:``}
						${l?`required`:``}
						spellcheck="${u}"
						autocomplete="${d}"
						${w}
					></textarea>
					${g?`<div class="text-box-hint" id="${x}">${g}</div>`:``}
					${_?`<div class="text-box-error" id="${S}" role="alert">${_}</div>`:``}
					${a>0?`<div class="text-box-counter" aria-hidden="true"><span class="current">${e.length}</span> / ${a}</div>`:``}
				</div>`:`
				<div class="text-box-wrapper${s?` disabled`:``}${c?` readonly`:``}${_?` has-error`:``}">
					${h?`<label for="${b}" class="text-box-label">${h}${l?` <span class="required" aria-hidden="true">*</span>`:``}</label>`:``}
					<input
						id="${b}"
						type="text"
						class="text-box text-input"
						placeholder="${t}"
						value="${e}"
						${T}
						${E}
						${s?`disabled`:``}
						${c?`readonly`:``}
						${l?`required`:``}
						spellcheck="${u}"
						autocomplete="${d}"
						${w}
					>
					${g?`<div class="text-box-hint" id="${x}">${g}</div>`:``}
					${_?`<div class="text-box-error" id="${S}" role="alert">${_}</div>`:``}
					${a>0?`<div class="text-box-counter" aria-hidden="true"><span class="current">${e.length}</span> / ${a}</div>`:``}
				</div>`};t({tag:`ui-text-box`,props:{value:{type:String,default:``},placeholder:{type:String,default:``},multiline:{type:Boolean,default:!1},rows:{type:Number,default:4},cols:{type:Number,default:50},maxLength:{type:Number,default:0},minLength:{type:Number,default:0},disabled:{type:Boolean,default:!1},readonly:{type:Boolean,default:!1},required:{type:Boolean,default:!1},spellcheck:{type:Boolean,default:!1},autocomplete:{type:String,default:`off`},ariaLabel:{type:String,default:``},ariaDescribedBy:{type:String,default:``},ariaInvalid:{type:Boolean,default:!1},label:{type:String,default:``},hint:{type:String,default:``},error:{type:String,default:``},autoResize:{type:Boolean,default:!1}},render(){return f(this._getProps(),{elementId:this.id})},onConnect(){let e=this.querySelector(`.text-box`);if(e){if(e.addEventListener(`input`,e=>{this.setProp(`value`,e.target.value),this.emit(`input`,{value:this._props.value,originalEvent:e})}),e.addEventListener(`change`,e=>{this.emit(`change`,{value:this._props.value,originalEvent:e})}),e.addEventListener(`blur`,e=>{this.emit(`blur`,{value:this._props.value,originalEvent:e})}),e.addEventListener(`focus`,e=>{this.emit(`focus`,{value:this._props.value,originalEvent:e})}),this._props.multiline&&this._props.autoResize){let t=()=>{e.style.height=`auto`,e.style.height=`${e.scrollHeight}px`};e.addEventListener(`input`,t),setTimeout(t,0)}if(this._props.maxLength>0){let t=this.querySelector(`.text-box-counter .current`);t&&e.addEventListener(`input`,()=>{t.textContent=this._props.value.length})}}}});