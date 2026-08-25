import{t as e}from"./app-header-CXSj4FFT.js";import{n as t}from"./utils-array-Dlk6KB1T.js";import{i as n}from"./assessment-data-D8np2VSY.js";var r=[{key:`w`,label:`체중 (kg)`},{key:`m`,label:`골격근량 (kg)`},{key:`fat`,label:`체지방량 (kg)`},{key:`bmi`,label:`BMI`},{key:`bfp`,label:`체지방률 (%)`},{key:`bmr`,label:`기초대사량 (kcal)`},{key:`vis`,label:`내장지방`}];function i(e){return(e.scores||[]).length*3}function a(e,{width:t=260,height:n=68}={}){let r=e.filter(e=>!Number.isNaN(parseFloat(e))).map(Number);if(r.length===0)return`<span class="spark-empty">기록 없음</span>`;if(r.length===1)return`<span class="spark-empty">${r[0]} · 첫 회차만 기록됨</span>`;let i=Math.min(...r),a=Math.max(...r)-i||1,o=n-20-16,s=(t-20)/(r.length-1),c=r.map((e,t)=>[10+t*s,20+o*(1-(e-i)/a)]);return`
		<svg class="sparkline" viewBox="0 0 ${t} ${n}" width="${t}" height="${n}" role="img" aria-label="회차별 추세 그래프" style="display:block; max-width:100%;">
			<polyline points="${c.map(e=>e.join(`,`)).join(` `)}" fill="none" stroke="var(--spark)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
			${c.map(([e,t])=>`<circle cx="${e}" cy="${t}" r="2.6" fill="var(--spark)"/>`).join(``)}
			${c.map(([e,t],n)=>`<text x="${e}" y="${t<30?t+13:t-8}" font-size="9.5" text-anchor="middle" fill="var(--text3)">${r[n]}</text>`).join(``)}
		</svg>`}function o(e){if(!e)return``;let t=String(e).match(/(\d+회차)/);return t?t[1]:String(e)}function s(e){return e>0?`<span class="delta-up">▲ ${e}</span>`:e<0?`<span class="delta-down">▼ ${Math.abs(e)}</span>`:`<span class="delta-flat">―</span>`}function c(a,o,c={}){let{showTotalScoreLabel:l=!0,includeMovementHeader:u=!1}=c,d=a.payload.session||a.date,f=o.payload.session||o.date,p=[];r.forEach(({key:e,label:t})=>{let n=parseFloat(a.payload.ib?.[e]),r=parseFloat(o.payload.ib?.[e]);Number.isNaN(n)||Number.isNaN(r)||p.push({label:t,left:n.toFixed(1),right:r.toFixed(1),delta:s(Number((r-n).toFixed(1)))})});let m=[],h=e=>{let t=n(e),r=new Map;return(e.scores||[]).forEach((e,n)=>r.set(t[n]?.name,e)),r},g=h(a.payload),_=h(o.payload);[...new Set([...n(a.payload),...n(o.payload)].map(e=>e.name))].forEach(e=>{let t=g.get(e),n=_.get(e);t!=null&&n!=null&&m.push({label:e,left:`${t}/3`,right:`${n}/3`,delta:s(n-t)})});let v=t(a.payload.scores||[]),y=t(o.payload.scores||[]),b=``;return m.length>0&&(b=`
			<!--hr class="div" /-->
			${l?`<div class="section-title">움직임 평가 총점</div>`:``}

			<div class="compare-table-container">
				${e.compareTable({extraClassNames:[`compare-table-basicFunctions`],itemLabel:`베이직 펑션`,leftLabel:d,rightLabel:f,rows:m,footRows:[{label:`총점`,left:`${v}/${i(a.payload)}`,right:`${y}/${i(o.payload)}`,delta:s(y-v)}],withHeader:u,ariaLabel:`움직임 평가 항목별 점수 비교`})}
			</div>`),`
		<div class="compare-table-container">
			${e.compareTable({extraClassNames:[`compare-table-inbody`],itemLabel:`인바디 항목`,leftLabel:d,rightLabel:f,rows:p})}
		</div>
		${b}`}export{a,o as i,c as n,i as r,r as t};