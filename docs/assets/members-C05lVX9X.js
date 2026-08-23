import{i as e,r as t,t as n}from"./app-header-C6kFERn0.js";/* empty css                     */import{t as r}from"./utils-dom-AA-aQdFf.js";/* empty css                       */import{i,n as a,r as o}from"./member-store-BDlMDy78.js";import{l as s,n as c,o as l}from"./record-utils-Ccw_3UKW.js";import{t as u}from"./member-utils-C3eDrFg1.js";t(`member-table`,{render(){let e=this.rows||[];return`
			<table class="member-table" aria-label="회원 목록">
				<thead>
					<tr>
						<th>이름</th>
						<th>성별</th>
						<th>담당 트레이너</th>
						<th>체크 횟수</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					${e.length?e.map(e=>n.memberRow(e)).join(``):`<tr class="member-empty-cell"><td colspan="5">검색 결과가 없어요</td></tr>`}
				</tbody>
			</table>`},onConnect(){this.addEventListener(`click`,e=>{let t=e.target.closest(`[data-remove-id]`);if(t){e.stopPropagation(),this.onRemove&&this.onRemove(t.dataset.removeId);return}let n=e.target.closest(`[data-member-id]`);n&&this.onSelect&&this.onSelect(n.dataset.memberId)}),this.addEventListener(`keydown`,e=>{if(e.key!==`Enter`&&e.key!==` `)return;let t=e.target.closest(`[data-member-id]`);t&&this.onSelect&&(e.preventDefault(),this.onSelect(t.dataset.memberId))})}});var d=r(`member-table`),f=``;function p(e){let t=c(s.getState().records);return e.map(e=>({...e,gender:u(e.gender),recordCount:t.get(e.id)||0}))}function m(){let e=f.trim().toLowerCase(),{members:t}=o.getState();d.rows=p(e?t.filter(t=>t.name.toLowerCase().includes(e)):t.slice()),d.refresh()}async function h(e){let t=o.getState().members.find(t=>t.id===e);if(!t)return;let n=s.getState().records.filter(t=>t.memberId===e).length,r=n>0?`회원 ${t.name} 님을 삭제하시겠습니까?\n\n연결된 체크기록 ${n}걸 로컬 목록에서도 제거합니다.`:`회원 ${t.name} 님을 삭제하시겠습니까?`;if(confirm(r))try{await i(e),s.setState(t=>({...t,records:t.records.filter(t=>t.memberId!==e)}))}catch(e){if(console.error(`회원 삭제 실패:`,e),e?.status===401)return;alert(`회원 삭제에 실패했습니다: ${e.message||`알 수 없는 오류`}`)}}function g(){f=r(`search-input`).value,m()}e(),o.subscribe(m),s.subscribe(m),Promise.all([a().catch(e=>{console.error(`회원 목록 로드 실패:`,e),d.rows=[],d.render?.()}),l().catch(e=>{console.error(`체크기록 로드 실패:`,e)})]),d.onSelect=e=>{window.location.href=`member-detail.html?memberID=${encodeURIComponent(e)}`},d.onRemove=e=>{h(e)},r(`search-input`).addEventListener(`input`,g),m();