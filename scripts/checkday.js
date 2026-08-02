// 파일 용도: 체크데이 상담지 공용 스크립트 — checkday_1·2가 공유
// ── 날짜 ──
const today = new Date();
document.getElementById('date-badge').textContent =
  today.getFullYear()+'.'+String(today.getMonth()+1).padStart(2,'0')+'.'+String(today.getDate()).padStart(2,'0');

// ── 움직임 평가 데이터 (공용 모듈 7항목 + VO₂ 항목) ──
const evals = ASSESSMENT_ITEMS.concat([
  { name:'VO₂ Max (스텝 테스트)', desc:'심폐 지구력',
    checks:['1분 HR 과도하게 높음','HRR 회복 불량'],
    vo2: true },
]);

// ── 동작 피드백 데이터 ──
const feedbacks = [
  { name:'스쿼트', checks:['무릎 안쪽 무너짐','허리 말림','상체 과도한 숙임','뒤꿈치 들림','좌우 비대칭'] },
  { name:'힙힌지 / 데드리프트', checks:['등 굽음 (요추 굴곡)','무릎 과도한 굽힘','엉덩이 후방 이동 부족','바 몸에서 멀어짐'] },
  { name:'런지', checks:['앞무릎 내반','골반 틀어짐','상체 흔들림','발목 불안정'] },
  { name:'푸시업', checks:['날개뼈 들뜸','요추 과신전','어깨 으쓱 (승모근 과활성)','팔꿈치 과도한 외전'] },
];

const scores = new Array(evals.length).fill(0);

// ── 인바디 태그 ──
function ibTag(val, ranges) {
  for(const r of ranges) if(val<=r.max) return `<span class="ib-tag" style="background:${r.bg};color:${r.fg}">${r.label}</span>`;
  const l=ranges[ranges.length-1]; return `<span class="ib-tag" style="background:${l.bg};color:${l.fg}">${l.label}</span>`;
}
function updIb() {
  const m=parseFloat(document.getElementById('ib-m').value);
  const bfp=parseFloat(document.getElementById('ib-bfp').value);
  const bmi=parseFloat(document.getElementById('ib-bmi').value);
  const fat=parseFloat(document.getElementById('ib-fat').value);
  const vis=parseFloat(document.getElementById('ib-vis').value);
  document.getElementById('tag-m').innerHTML = isNaN(m)?'': ibTag(m,[
    {max:18.4,label:'낮음',bg:'var(--red-bg)',fg:'var(--red-fg)'},
    {max:23.4,label:'정상',bg:'var(--green-bg)',fg:'var(--green-fg)'},
    {max:999,label:'높음',bg:'var(--blue-bg)',fg:'var(--blue-fg)'}]);
  document.getElementById('tag-bfp').innerHTML = isNaN(bfp)?'': ibTag(bfp,[
    {max:17,label:'낮음',bg:'var(--blue-bg)',fg:'var(--blue-fg)'},
    {max:27,label:'정상',bg:'var(--green-bg)',fg:'var(--green-fg)'},
    {max:32,label:'경계',bg:'var(--orange-bg)',fg:'var(--orange-fg)'},
    {max:999,label:'비만',bg:'var(--red-bg)',fg:'var(--red-fg)'}]);
  document.getElementById('tag-bmi').innerHTML = isNaN(bmi)?'': ibTag(bmi,[
    {max:18.4,label:'저체중',bg:'var(--blue-bg)',fg:'var(--blue-fg)'},
    {max:22.9,label:'정상',bg:'var(--green-bg)',fg:'var(--green-fg)'},
    {max:24.9,label:'과체중',bg:'var(--orange-bg)',fg:'var(--orange-fg)'},
    {max:999,label:'비만',bg:'var(--red-bg)',fg:'var(--red-fg)'}]);
  document.getElementById('tag-fat').innerHTML = isNaN(fat)?'': ibTag(fat,[
    {max:12.9,label:'낮음',bg:'var(--blue-bg)',fg:'var(--blue-fg)'},
    {max:20.9,label:'정상',bg:'var(--green-bg)',fg:'var(--green-fg)'},
    {max:999,label:'높음',bg:'var(--red-bg)',fg:'var(--red-fg)'}]);
  document.getElementById('tag-w').innerHTML='';
  document.getElementById('tag-bmr').innerHTML='';
  if(!isNaN(vis)){
    let vl,vb,vf;
    if(vis<=9){vl='정상';vb='var(--green-bg)';vf='var(--green-fg)';}
    else if(vis<=14){vl='경계';vb='var(--orange-bg)';vf='var(--orange-fg)';}
    else{vl='위험';vb='var(--red-bg)';vf='var(--red-fg)';}
    document.getElementById('tag-vis').innerHTML=`<span class="ib-tag" style="background:${vb};color:${vf}">내장지방 ${vl}</span>`;
  } else { document.getElementById('tag-vis').innerHTML=''; }
}

// ── VO₂ 계산 (8번 항목에만) — 공용 모듈 사용 ──
const VO2_GRADE_STYLES = {
  excellent: { bg:'var(--green-bg)', fg:'var(--green-fg)' },
  good: { bg:'var(--blue-bg)', fg:'var(--blue-fg)' },
  above_avg: { bg:'var(--blue-bg)', fg:'var(--blue-fg)' },
  average: { bg:'var(--orange-bg)', fg:'var(--orange-fg)' },
  below_avg: { bg:'var(--orange-bg)', fg:'var(--orange-fg)' },
  poor: { bg:'var(--red-bg)', fg:'var(--red-fg)' },
  very_poor: { bg:'var(--red-bg)', fg:'var(--red-fg)' },
};

function calcVo2() {
  const age=parseFloat(document.getElementById('vo2-age').value);
  const ht=parseFloat(document.getElementById('vo2-ht').value);
  const wt=parseFloat(document.getElementById('vo2-wt').value);
  const hr=parseFloat(document.getElementById('vo2-hr').value);
  if([age,ht,wt,hr].some(isNaN)){document.getElementById('vo2-result').style.display='none';return;}
  const vr=calcVo2Value(age, ht, wt, hr);
  const gradeInfo=getVo2Grade(vr, age);
  const style=VO2_GRADE_STYLES[gradeInfo.grade];
  document.getElementById('vo2-val').textContent=vr.toFixed(1)+' ml/kg/min';
  const badge=document.getElementById('vo2-badge');
  badge.textContent=gradeInfo.label; badge.style.background=style.bg; badge.style.color=style.fg;
  document.getElementById('vo2-result').style.display='flex';
}

// ── 평가 카드 빌드 ──
function buildEvals() {
  const c=document.getElementById('eval-cards');
  evals.forEach((e,i)=>{
    const div=document.createElement('div');
    div.className='eval-item';
    const dots=[0,1,2,3].map(j=>`<div class="dot" id="dot-${i}-${j}"></div>`).join('');
    const tags=e.checks.map(ch=>`<span class="ctag" onclick="this.classList.toggle('on')">${ch}</span>`).join('');
    let inner=`
      <div class="eval-top">
        <div class="eval-num-badge">${i+1}</div>
        <div style="flex:1"><div class="eval-name">${e.name}</div><div class="eval-desc">${e.desc}</div></div>
        <div class="score-ctrl">
          <button class="score-btn" onclick="adj(${i},-1)">−</button>
          <span class="score-val" id="sv-${i}">0</span>
          <button class="score-btn" onclick="adj(${i},+1)">+</button>
          <div class="sdots">${dots}</div>
        </div>
      </div>
      <button class="expand-toggle" id="et-${i}" onclick="toggleExpand(${i})">
        체크 항목 / 메모 <span class="arr">▾</span>
      </button>
      <div class="sub-panel" id="sp-${i}">
        <div class="tag-row" style="margin-top:6px">${tags}</div>
        <textarea class="eval-memo" placeholder="메모..."></textarea>`;
    if(e.vo2){
      inner+=`
        <div style="margin-top:8px;padding:10px;background:var(--surface2);border-radius:8px;">
          <div style="font-size:11px;font-weight:600;color:var(--text3);margin-bottom:8px;">VO₂ MAX 자동 계산</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
            <div><label style="font-size:10px;color:var(--text3);display:block;margin-bottom:3px;">연령</label><input class="ib-num" id="vo2-age" type="number" placeholder="30" style="width:100%" oninput="calcVo2()"></div>
            <div><label style="font-size:10px;color:var(--text3);display:block;margin-bottom:3px;">신장 (cm)</label><input class="ib-num" id="vo2-ht" type="number" placeholder="165" style="width:100%" oninput="calcVo2()"></div>
            <div><label style="font-size:10px;color:var(--text3);display:block;margin-bottom:3px;">체중 (kg)</label><input class="ib-num" id="vo2-wt" type="number" placeholder="60" style="width:100%" oninput="calcVo2()"></div>
            <div><label style="font-size:10px;color:var(--text3);display:block;margin-bottom:3px;">1분 회복 심박수</label><input class="ib-num" id="vo2-hr" type="number" placeholder="100" style="width:100%" oninput="calcVo2()"></div>
          </div>
          <div id="vo2-result" style="display:none;align-items:center;gap:10px;flex-wrap:wrap;">
            <span id="vo2-val" style="font-size:15px;font-weight:600;"></span>
            <span id="vo2-badge" class="ib-tag" style="font-size:11px;"></span>
          </div>
          <div style="font-size:10px;color:var(--text3);margin-top:6px;">공식: 54.337 − 0.185(연령) + 0.097(신장) − 0.246(체중) − 0.112(심박수)</div>
        </div>`;
    }
    inner+=`</div>`;
    div.innerHTML=inner;
    c.appendChild(div);
  });
}

function toggleExpand(i) {
  const sp=document.getElementById(`sp-${i}`);
  const et=document.getElementById(`et-${i}`);
  sp.classList.toggle('open');
  et.classList.toggle('open');
}

function adj(i,d) {
  scores[i]=Math.max(0,Math.min(3,scores[i]+d));
  document.getElementById(`sv-${i}`).textContent=scores[i];
  for(let j=0;j<4;j++) document.getElementById(`dot-${i}-${j}`).classList.toggle('on',j<scores[i]);
  updateTotal();
}

const GRADE_STYLES = {
  '평가 전': { bg:'var(--surface2)', fg:'var(--text3)', hint:'' },
  '우수': { bg:'var(--green-bg)', fg:'var(--green-fg)', hint:'전반적으로 안정적인 패턴' },
  '양호': { bg:'var(--blue-bg)', fg:'var(--blue-fg)', hint:'일부 패턴 보완 필요' },
  '보통': { bg:'var(--orange-bg)', fg:'var(--orange-fg)', hint:'주요 패턴 집중 개선 권장' },
  '개선 필요': { bg:'var(--red-bg)', fg:'var(--red-fg)', hint:'기초 움직임 패턴 재교육 필요' },
};

function updateTotal() {
  const tot=getTotal();
  const max=24; const pct=Math.round(tot/max*100);
  document.getElementById('total-num').innerHTML=`${tot} <span>/ ${max}</span>`;
  document.getElementById('prog-fill').style.width=pct+'%';
  const pill=document.getElementById('grade-pill');
  const hint=document.getElementById('grade-hint');
  const meta=getGradeMeta(tot, max);
  const style=GRADE_STYLES[meta.label];
  pill.textContent=meta.label; pill.style.background=style.bg; pill.style.color=style.fg; hint.textContent=style.hint;
}

// ── 동작 피드백 빌드 (추가/삭제 가능) ──
let fbIdCounter = 0;

function makeFbCheckRow(text='') {
  return `<div class="fb-check-row">
    <input type="checkbox" style="accent-color:var(--blue);flex-shrink:0;">
    <input class="fb-check-input" type="text" value="${text}" placeholder="체크 항목...">
    <button class="fb-check-del" onclick="this.parentElement.remove()" title="삭제">✕</button>
  </div>`;
}

function addCheckToFb(btn) {
  const checksWrap = btn.previousElementSibling;
  const div = document.createElement('div');
  div.innerHTML = makeFbCheckRow();
  checksWrap.appendChild(div.firstElementChild);
  checksWrap.lastElementChild.querySelector('.fb-check-input').focus();
}

function addFbItem(preset) {
  fbIdCounter++;
  const id = fbIdCounter;
  const c = document.getElementById('fb-cards');
  const div = document.createElement('div');
  div.className = 'fb-item';
  div.id = `fb-item-${id}`;
  const name = preset ? preset.name : '';
  const checks = preset ? preset.checks : [''];
  const checksHTML = checks.map(ch => makeFbCheckRow(ch)).join('');
  div.innerHTML = `
    <div class="fb-item-header">
      <input class="fb-move-input" type="text" value="${name}" placeholder="동작명 (예: 스쿼트)">
      <button class="fb-del-btn" onclick="document.getElementById('fb-item-${id}').remove()" title="삭제">✕</button>
    </div>
    <div class="fb-checks-wrap">${checksHTML}</div>
    <button class="add-check-btn" onclick="addCheckToFb(this)">+ 체크 항목 추가</button>
    <textarea class="eval-memo" placeholder="코칭 포인트 메모..." style="margin-top:6px;"></textarea>`;
  c.appendChild(div);
}

function buildFeedbacks() {
  feedbacks.forEach(fb => addFbItem(fb));
}

function getFbLines() {
  return [...document.querySelectorAll('.fb-item')].map(item => {
    const name = item.querySelector('.fb-move-input').value || '(동작명 없음)';
    const checked = [...item.querySelectorAll('.fb-check-row')].filter(row => row.querySelector('input[type=checkbox]').checked).map(row => row.querySelector('.fb-check-input').value).filter(Boolean);
    const memo = item.querySelector('.eval-memo').value;
    if (!checked.length && !memo) return null;
    return { name, checked, memo };
  }).filter(Boolean);
}

// ── 초기화 ──
function resetAll() {
  if(!confirm('이 회원의 상담 내용을 모두 초기화할까요?')) return;
  document.querySelectorAll('input[type=text],input[type=number],textarea').forEach(el=>el.value='');
  document.querySelectorAll('.ctag,.fbtag,.goal-tag').forEach(el=>el.classList.remove('on'));
  scores.fill(0);
  evals.forEach((_,i)=>{
    document.getElementById(`sv-${i}`).textContent='0';
    for(let j=0;j<4;j++) document.getElementById(`dot-${i}-${j}`).classList.remove('on');
  });
  ['tag-w','tag-m','tag-fat','tag-bmi','tag-bfp','tag-bmr','tag-vis','vo2-result'].forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.innerHTML=el.tagName==='DIV'&&el.id==='vo2-result'? (el.style.display='none','') : '';
  });
  // 피드백 초기화 후 재빌드
  const fbCards = document.getElementById('fb-cards');
  fbCards.innerHTML = '';
  fbIdCounter = 0;
  buildFeedbacks();
  updateTotal();
}

// ── 결과 보기 공용 헬퍼 ──
function getTotal() {
  return scores.reduce((a,b)=>a+b,0);
}

function getIbData() {
  return {w:document.getElementById('ib-w').value,m:document.getElementById('ib-m').value,
          fat:document.getElementById('ib-fat').value,bmi:document.getElementById('ib-bmi').value,
          bfp:document.getElementById('ib-bfp').value,bmr:document.getElementById('ib-bmr').value,
          vis:document.getElementById('ib-vis').value};
}

function getSelectedGoals() {
  return [...document.querySelectorAll('.goal-tag.on')].map(el=>el.textContent).join(' ');
}

function getEvalLines(prefix) {
  const evalCards=document.querySelectorAll('#eval-cards .eval-item');
  return evals.map((e,i)=>{
    const checked=[...evalCards[i].querySelectorAll('.ctag.on')].map(el=>el.textContent);
    const memo=evalCards[i].querySelector('.eval-memo').value;
    let s=`${prefix}${e.name}: ${scores[i]}점`;
    if(checked.length) s+=` [${checked.join(', ')}]`;
    if(memo) s+=` / ${memo}`;
    return s;
  });
}

// ── 결과 보기 ──
function openReport() {
  const name=document.getElementById('m-name').value||'(미입력)';
  const session=document.getElementById('m-session').value;
  const tot=getTotal();
  const ib=getIbData();
  const ibC=document.getElementById('ib-comment').value;
  const goals=getSelectedGoals();
  const gMemo=document.getElementById('goal-memo').value;
  const consult=document.getElementById('consult-memo').value;

  const evalLines=getEvalLines('');
  const fbData=getFbLines();
  const fbLines=fbData.map(fb=>`${fb.name}${fb.checked.length?' → '+fb.checked.join(', '):''}${fb.memo?' / '+fb.memo:''}`);

  let html=`
    <div class="rline"><div class="rlabel">회원</div><div>${name} ${session}</div></div>
    <div class="rline"><div class="rlabel">인바디</div><div style="font-size:12px">
      체중 ${ib.w||'—'}kg · 골격근 ${ib.m||'—'}kg · 체지방 ${ib.fat||'—'}kg<br>
      BMI ${ib.bmi||'—'} · 체지방률 ${ib.bfp||'—'}% · BMR ${ib.bmr||'—'}kcal · 내장지방 ${ib.vis||'—'}
      ${ibC?`<br><span style="color:var(--text2)">${ibC}</span>`:''}
    </div></div>
    <div class="rline"><div class="rlabel">움직임 총점</div><div>${tot}/24점</div></div>
    ${evalLines.map(l=>`<div class="rline"><div style="font-size:12px;color:var(--text2)">${l}</div></div>`).join('')}
    <div class="rline"><div class="rlabel">다음 목표</div><div>${goals||'미선택'}${gMemo?`<br><span style="font-size:12px;color:var(--text2)">${gMemo}</span>`:''}</div></div>
    ${fbLines.length?`<div class="rline"><div class="rlabel">동작 피드백</div><div style="font-size:12px">${fbLines.join('<br>')}</div></div>`:''}
    ${consult?`<div class="rline"><div class="rlabel">상담 메모</div><div style="font-size:12px">${consult}</div></div>`:''}`;
  document.getElementById('report-body').innerHTML=html;
  document.getElementById('overlay').classList.add('open');
}

function copyReport() {
  const name=document.getElementById('m-name').value||'(미입력)';
  const tot=getTotal();
  const ib=getIbData();
  const goals=getSelectedGoals();
  const evalLines=getEvalLines('  ');
  const fbData=getFbLines();
  const fbLines=fbData.map(fb=>`  ${fb.name}${fb.checked.length?' → '+fb.checked.join(', '):''}${fb.memo?' / '+fb.memo:''}`);
  const lines=[
    `[체크데이] ${name} / ${document.getElementById('m-session').value}`,
    `━ 인바디: 체중 ${ib.w||'—'}kg / 골격근 ${ib.m||'—'}kg / 체지방률 ${ib.bfp||'—'}% / BMI ${ib.bmi||'—'} / 내장지방 ${ib.vis||'—'}`,
    document.getElementById('ib-comment').value?`  코멘트: ${document.getElementById('ib-comment').value}`:'',
    `━ 움직임 총점: ${tot}/24점`,...evalLines,
    `━ 다음 목표: ${goals||'미선택'}`,
    document.getElementById('goal-memo').value?`  ${document.getElementById('goal-memo').value}`:'',
    fbLines.length?`━ 동작 피드백:`:'', ...fbLines,
    document.getElementById('consult-memo').value?`━ 상담 메모: ${document.getElementById('consult-memo').value}`:'',
  ].filter(l=>l!=='');
  navigator.clipboard.writeText(lines.join('\n'))
    .then(()=>alert('복사되었습니다!'))
    .catch(()=>alert('직접 선택해서 복사해 주세요.'));
}

buildEvals();
buildFeedbacks();
updateTotal();
