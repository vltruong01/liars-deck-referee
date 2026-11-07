import { gsap } from 'gsap';
import { createMatch, customize, fire, completeShot, rename, resetPlayer, resetMatch, winner, load, persist, KEY } from './engine.js';
import { skins, portrait, roomArt, executionRig } from './art.js';
import { choices, colors, normalizeAppearance, randomAppearance, label } from './appearance.js';
import { seatPosition } from './staging.js';
import { AudioDirector } from './audio.js';

const $ = selector => document.querySelector(selector);
const app=$('#app'), execution=$('#execution'), audio=new AudioDirector();
const escapeText = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const prefersMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let prefs={volume:.45,reducedFlashing:false,reducedMotion:prefersMotion.matches};
try { const saved=JSON.parse(localStorage.getItem('liars-deck.settings')||'null'); if(saved) prefs={volume:typeof saved.volume==='number'?Math.max(0,Math.min(1,saved.volume)):.45,reducedFlashing:!!saved.reducedFlashing,reducedMotion:!!saved.reducedMotion||prefersMotion.matches}; } catch { /* Ignore malformed optional preferences. */ }
audio.setVolume(prefs.volume);
let state=null, storage, storageError=null, selected=null, busy=false, returning=false, shotTimeline=null, entryTimeline=null, reactionTimeline=null, transitionTimeline=null, toastTimer=null, confirmAction=null;
let count=4, draft=skins.slice(0,4).map((s,i)=>({name:`Player ${i+1}`,skin:s.id}));
let stageObserver=null, entrySequence=0;
const DRAFT_KEY='liars-deck.setup.v1';
try { const saved=JSON.parse(localStorage.getItem(DRAFT_KEY)||'null');if(saved&&Array.isArray(saved.players)&&saved.players.length===4){draft=saved.players.map((p,i)=>({name:String(p.name||`Player ${i+1}`).slice(0,24),skin:skins.some(s=>s.id===p.skin)?p.skin:skins[i].id,appearance:normalizeAppearance(p.appearance)}));if([2,3,4].includes(saved.count))count=saved.count;} }catch{ /* Ignore malformed optional setup drafts. */ }
function saveDraft(){storage.setItem(DRAFT_KEY,JSON.stringify({count,players:draft}));}

try { storage=localStorage; state=load(storage); } catch(error) { storageError=error.message; }

function toast(message) { clearTimeout(toastTimer); $('#toast').textContent=message; $('#toast').hidden=false; toastTimer=setTimeout(()=>$('#toast').hidden=true,6500); }
function attempt(action) { try { return action(); } catch(error) { toast(error.message); return false; } }
function commit(next) { state=persist(storage,next,state); return true; }
function showDialog(id) { const el=$(`#${id}`); if(!el.open) el.showModal(); }
function confirm(title,description,action) { $('#manage-button').hidden=true; $('#confirm-title').textContent=title; $('#confirm-description').textContent=description; confirmAction=action; showDialog('confirm-dialog'); $('#confirm-cancel').focus(); }
$('#manage-button').onclick=()=>{$('#confirm-dialog').close();openManagement();};
$('#confirm-cancel').onclick=()=>$('#confirm-dialog').close();
$('#confirm-yes').onclick=()=>{ const action=confirmAction; $('#confirm-dialog').close(); if(action) attempt(action); };
$('#confirm-dialog').addEventListener('close',()=>{confirmAction=null;});
document.addEventListener('pointerdown',()=>audio.unlock(),{passive:true});
document.addEventListener('keydown',()=>audio.unlock());
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$('#'+b.dataset.close).close());
$('.brand').onclick=e=>{e.preventDefault();if(!execution.hidden)return;showDialog('help-dialog');};
$('#settings-button').onclick=()=>showDialog('settings-dialog');
$('#execution-settings').onclick=()=>{if(!state?.pending&&!returning)showDialog('settings-dialog');};
async function toggleFullscreen() {
  try {
    if(document.fullscreenElement) await document.exitFullscreen();
    else if(document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
    else toast('Fullscreen is unavailable in this browser. Landscape play is still ready.');
  } catch { toast('Fullscreen could not open. You can keep playing in this window.'); }
}
$('#fullscreen-button').onclick=toggleFullscreen;
$('#execution-fullscreen').onclick=()=>{if(!state?.pending)toggleFullscreen();};
const fullscreenIcon='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/></svg>';
const settingsIcon='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m9 3-1 3-3 1 1 3-2 2 2 2-1 3 3 1 1 3h6l1-3 3-1-1-3 2-2-2-2 1-3-3-1-1-3Z"/><circle cx="12" cy="12" r="3"/></svg>';
for(const id of ['fullscreen-button','execution-fullscreen']) $('#'+id).innerHTML=fullscreenIcon;
for(const id of ['settings-button','execution-settings']) $('#'+id).innerHTML=settingsIcon;
document.addEventListener('fullscreenchange',()=>{
  const active=!!document.fullscreenElement;
  $('#fullscreen-button').setAttribute('aria-label',active?'Exit fullscreen':'Enter fullscreen');
  $('#fullscreen-button').setAttribute('aria-pressed',String(active));
});
function placeExecutionHud() {
  if(execution.hidden||!['entering','ready','firing','result'].includes(execution.dataset.phase))return;
  const subject=$('.execution-subject'),hud=$('.execution-hud'),head=$('#execution-portrait .character-head');
  if(!head)return;
  const parts=[head,...execution.querySelectorAll('#execution-portrait .headwear')].filter(e=>e.children.length);
  const boxes=parts.map(e=>e.getBoundingClientRect()),r=subject.getBoundingClientRect(),face=head.getBoundingClientRect();
  const center=face.x+face.width/2-r.x,half=hud.offsetWidth/2;
  hud.style.left=`${Math.max(half,Math.min(r.width-half,center))}px`;
  hud.style.top=`${Math.max(0,Math.min(...boxes.map(b=>b.top))-r.top-hud.offsetHeight-8)}px`;
}
function fitStage() {
  const scene=$('.scene'), fit=$('.stage-fit');if(!scene||!fit)return;
  const scale=1;
  fit.style.setProperty('--stage-scale',String(Math.max(.1,scale)));
}
function observeStage() {
  stageObserver?.disconnect();
  if(typeof ResizeObserver!=='undefined'){stageObserver=new ResizeObserver(fitStage);stageObserver.observe($('.scene'));}
  fitStage();
}
window.addEventListener('resize',()=>{fitStage();placeExecutionHud();});
if(typeof ResizeObserver!=='undefined')new ResizeObserver(placeExecutionHud).observe($('.execution-hud'));
$('#volume').value=String(Math.round(prefs.volume*100)); $('#volume-value').value=`${Math.round(prefs.volume*100)}%`;
$('#reduced-flashing').checked=prefs.reducedFlashing; $('#reduced-motion').checked=prefs.reducedMotion;
function savePrefs() { attempt(()=>storage.setItem('liars-deck.settings',JSON.stringify(prefs))); }
$('#volume').oninput=e=>{prefs.volume=Number(e.target.value)/100;$('#volume-value').value=`${e.target.value}%`;audio.setVolume(prefs.volume);savePrefs();};
$('#volume').onchange=()=>{audio.unlock();audio.click();};
$('#reduced-flashing').onchange=e=>{prefs.reducedFlashing=e.target.checked;savePrefs();};
$('#reduced-motion').onchange=e=>{prefs.reducedMotion=e.target.checked;savePrefs();};


function renderSetup() {
  stageObserver?.disconnect();
  app.innerHTML=`<section class="setup">
    <div class="setup-heading"><div><p class="eyebrow">WELCOME TO THE LAST CALL</p><h1>Choose your company.</h1></div><div class="setup-heading-tools"><button class="text-button" id="how-to">HOUSE RULES &#8599;</button><div class="player-count"><span>PLAYERS</span>${[2,3,4].map(n=>`<button type="button" class="count-button ${n===count?'active':''}" aria-label="${n} players" aria-pressed="${n===count}" data-count="${n}">${n}</button>`).join('')}</div></div></div>
    <form id="setup-form"><div class="player-grid" data-count="${count}">${draft.slice(0,count).map((p,i)=>setupCard(p,i)).join('')}</div>
    <div class="setup-footer"><p>Six chambers. One bullet each.<small>Physical cards. The house handles the consequences.</small></p><button class="primary" type="submit">START GAME <b>&#8594;</b></button></div></form></section>`;
  $('#how-to').onclick=()=>showDialog('help-dialog');
  document.querySelectorAll('.count-button[data-count]').forEach(b=>b.onclick=()=>{captureDraft();count=Number(b.dataset.count);attempt(saveDraft);renderSetup();});
  document.querySelectorAll('[data-skin-step]').forEach(b=>b.onclick=()=>{
    captureDraft();const i=Number(b.dataset.player), current=skins.findIndex(s=>s.id===draft[i].skin);
    draft[i].skin=skins[(current+Number(b.dataset.skinStep)+skins.length)%skins.length].id;
    const target=b.closest('.setup-player');target.querySelector('.skin-preview .portrait').outerHTML=portrait(draft[i].skin,true,draft[i].appearance);target.querySelector('.skin-name').textContent=skins.find(s=>s.id===draft[i].skin).name;
    if(!prefs.reducedMotion) gsap.fromTo(target.querySelector('.portrait'),{opacity:0,x:10},{opacity:1,x:0,duration:.25});
  });
  document.querySelectorAll('[data-customize-draft]').forEach(b=>b.onclick=()=>{captureDraft();openAppearance(Number(b.dataset.customizeDraft));});
  $('#setup-form').onsubmit=e=>{e.preventDefault();captureDraft();attempt(()=>{
    saveDraft();const next=createMatch(draft.slice(0,count));
    // Starting after the explicit new-match confirmation deliberately replaces the old save.
    state=persist(storage,next);renderTable();window.scrollTo(0,0);if(!prefs.reducedMotion)gsap.from('.scene-frame',{opacity:0,duration:.35});
  });};
}
function setupCard(p,i) { return `<article class="setup-player"><span class="seat-label">SEAT 0${i+1}</span><button type="button" class="skin-preview" data-customize-draft="${i}" aria-label="Customize player ${i+1}">${portrait(p.skin,true,p.appearance)}<span class="customize-tag">CUSTOMIZE &#8599;</span></button><div class="skin-selector"><button type="button" class="skin-arrow" data-player="${i}" data-skin-step="-1" aria-label="Previous skin for player ${i+1}">‹</button><span class="skin-name" aria-live="polite">${skins.find(s=>s.id===p.skin).name}</span><button type="button" class="skin-arrow" data-player="${i}" data-skin-step="1" aria-label="Next skin for player ${i+1}">›</button></div><label for="name-${i}">PLAYER NAME</label><input id="name-${i}" name="player${i}" type="text" maxlength="24" required autocomplete="off" value="${escapeText(p.name)}" data-draft="${i}"></article>`; }
function captureDraft(){document.querySelectorAll('[data-draft]').forEach(input=>draft[Number(input.dataset.draft)].name=input.value);}

let editor=null, category='animal';
const categories=['animal','hat','eyes','mouth','outfit','suit','tie'];
function openAppearance(target) {
  const p=typeof target==='number'?draft[target]:state.players.find(p=>p.id===target);
  editor={target,skin:p.skin,appearance:normalizeAppearance(p.appearance)}; category='animal';
  const dialog=$('#appearance-dialog');
  dialog.innerHTML=`<header class="editor-heading"><h2 id="appearance-title">Style ${escapeText(p.name)}</h2><button type="button" class="outline" id="style-cancel">CANCEL</button></header><div class="editor-body"><div class="editor-preview" id="style-preview"></div><div class="editor-controls"><nav class="style-tabs" role="tablist" aria-label="Appearance category">${categories.map(c=>`<button type="button" role="tab" id="tab-${c}" aria-controls="style-options" data-category="${c}">${label(c)}</button>`).join('')}</nav><div id="style-options" role="tabpanel"></div></div></div><footer class="editor-footer"><button type="button" class="outline" id="style-random">RANDOMIZE</button><button type="button" class="primary" id="style-save">SAVE LOOK <b>&#8594;</b></button></footer>`;
  $('#style-cancel').onclick=()=>dialog.close();
  $('#style-random').onclick=()=>{editor.skin=skins[Math.floor(Math.random()*skins.length)].id;editor.appearance=randomAppearance();renderAppearance();};
  $('#style-save').onclick=()=>attempt(()=>{
    if(typeof editor.target==='number') {Object.assign(draft[editor.target],{skin:editor.skin,appearance:normalizeAppearance(editor.appearance)});saveDraft();dialog.close();renderSetup();}
    else {commit(customize(state,editor.target,editor.skin,editor.appearance));dialog.close();renderTable();openManagement();toast('Appearance saved. Revolver progress kept.');}
  });
  document.querySelectorAll('[data-category]').forEach(b=>b.onclick=()=>{category=b.dataset.category;renderAppearance();});
  document.querySelector('.style-tabs').onkeydown=e=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();
    const i=categories.indexOf(category);category=categories[e.key==='Home'?0:e.key==='End'?categories.length-1:(i+(e.key==='ArrowRight'?1:categories.length-1))%categories.length];renderAppearance();$(`#tab-${category}`).focus();
  };
  renderAppearance();showDialog('appearance-dialog');
}
function renderAppearance() {
  $('#style-preview').innerHTML=portrait(editor.skin,false,editor.appearance);
  document.querySelectorAll('[data-category]').forEach(b=>{const active=b.dataset.category===category;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});
  const values=category==='animal'?skins.map(s=>s.id):choices[category];
  const selected=category==='animal'?editor.skin:editor.appearance[category];
  $('#style-options').setAttribute('aria-labelledby',`tab-${category}`);
  $('#style-options').innerHTML=`<div class="style-grid">${values.map(v=>`<button type="button" class="style-option" data-option="${v}" aria-pressed="${selected===v}">${colors[v]?`<i class="color-swatch" style="background:${colors[v]}"></i>`:''}${label(v)}</button>`).join('')}</div>${category==='tie'?`<button type="button" class="bow-toggle outline" id="style-bow" aria-pressed="${editor.appearance.bow}">BOW TIE ${editor.appearance.bow?'ON':'OFF'}</button>`:''}`;
  document.querySelectorAll('[data-option]').forEach(b=>b.onclick=()=>{if(category==='animal')editor.skin=b.dataset.option;else editor.appearance[category]=b.dataset.option;renderAppearance();document.querySelector(`[data-option="${b.dataset.option}"]`)?.focus();});
  if($('#style-bow'))$('#style-bow').onclick=()=>{editor.appearance.bow=!editor.appearance.bow;renderAppearance();$('#style-bow').focus();};
}

function renderTable() {
  const w=winner(state);
  app.innerHTML=`<section class="bar-page ${w?'has-winner':''}">
    <div class="bar-heading"><h1 class="sr-only">Match table</h1><div class="bar-tools"><button class="outline" id="new-match">NEW MATCH &#8599;</button></div></div>
    ${w?`<div class="winner-banner"><h2><span>${escapeText(w.name)}</span> takes the table.</h2><button class="primary" id="play-again">PLAY AGAIN <b>&#8594;</b></button></div>`:''}
    <div class="scene-frame"><div class="scene" data-count="${state.players.length}">${roomArt()}<div class="stage-fit"><div class="room-camera">
    <div class="table" aria-hidden="true"><div class="table-felt"><div class="table-emblem">&#9824;<span>THE LAST CALL</span></div><div class="cards"><div class="card">&#9824;</div><div class="card">&#9830;</div><div class="card">&#9827;</div></div><div class="glass"></div></div></div>
    ${state.players.map((p,i)=>`<button class="seat ${p.dead?'dead':''}" data-seat="${i+1}" data-position="${seatPosition(state.players.length,i).position}" style="${seatPosition(state.players.length,i).style}" data-execute="${p.id}" ${p.dead||w?'disabled':''} aria-description="${p.dead?'Eliminated':'Select for execution'}" title="${escapeText(p.name)}"><span class="seat-character">${portrait(p.skin,true,p.appearance)}</span><span class="seat-name"><strong>${escapeText(p.name)}</strong><small>${p.dead?'DIED':`${p.shots}/6`}</small></span></button>`).join('')}
    </div></div></div></div>
    </section>`;
  observeStage();
  document.querySelectorAll('[data-execute]').forEach(b=>b.onclick=()=>selectPlayer(b.dataset.execute));
  $('#new-match').onclick=()=>{confirm('A different company?','End this match and return to player setup? Current progress will be replaced when you start the new game.',()=>{draft=state.players.map(p=>({name:p.name,skin:p.skin,appearance:p.appearance}));while(draft.length<4)draft.push({name:`Player ${draft.length+1}`,skin:skins[draft.length].id});count=state.players.length;renderSetup();});$('#manage-button').hidden=false;};
  if(w) $('#play-again').onclick=()=>confirm('Another night?','Reload every revolver with one freshly randomized bullet. Keep the same names and characters?',()=>{commit(resetMatch(state));renderTable();});
}

function openManagement() {
  if(busy)return;
  $('#manage-list').innerHTML=state.players.map(p=>`<form class="manage-row" data-rename="${p.id}">${portrait(p.skin,true,p.appearance)}<div class="manage-input-group"><label for="edit-${p.id}">${p.dead?'DIED':`${p.shots}/6`}</label><input type="text" id="edit-${p.id}" maxlength="24" required aria-label="Name for ${escapeText(p.name)}" value="${escapeText(p.name)}"></div><div class="manage-actions"><button type="submit">SAVE NAME</button><button type="button" data-customize-player="${p.id}">STYLE</button><button type="button" data-reset="${p.id}">RESET</button></div></form>`).join('');
  document.querySelectorAll('[data-rename]').forEach(form=>form.onsubmit=e=>{e.preventDefault();attempt(()=>{commit(rename(state,form.dataset.rename,form.querySelector('input').value));renderTable();toast('Name saved. Revolver progress kept.');});});
  document.querySelectorAll('[data-customize-player]').forEach(b=>b.onclick=()=>openAppearance(b.dataset.customizePlayer));
  document.querySelectorAll('[data-reset]').forEach(b=>b.onclick=()=>{const p=state.players.find(p=>p.id===b.dataset.reset);confirm(`Reset ${p.name}?`,'Bring this player back with zero shots and a newly loaded revolver? Other players keep their progress.',()=>{commit(resetPlayer(state,p.id));renderTable();openManagement();toast('Player reset. A fresh cylinder awaits.');});});
  $('#reset-all').onclick=()=>confirm('Reload the table?','Reset every player to alive with zero shots and freshly randomized revolvers? Names and skins stay.',()=>{commit(resetMatch(state));renderTable();openManagement();toast('All revolvers reset.');});
  showDialog('manage-dialog');
}

// Every animation belongs to this execution and is cancelled before changing views.
function stopExecutionAnimations() {
  for(const timeline of [entryTimeline,shotTimeline,reactionTimeline,transitionTimeline])timeline?.kill();
  entryTimeline=shotTimeline=reactionTimeline=transitionTimeline=null;
  gsap.killTweensOf([execution,...execution.querySelectorAll('*')]);
}
function resetTableCamera() {
  const camera=$('.room-camera');if(!camera)return;
  gsap.killTweensOf(camera);gsap.set(camera,{clearProps:'transform,transformOrigin'});
}
function selectPlayer(id, recovering=false) {
  if(busy || (!recovering&&(state.pending||winner(state)))) return;
  const p=state.players.find(p=>p.id===id);if(!p||(!recovering&&p.dead))return;
  stopExecutionAnimations();resetTableCamera();
  selected=id;busy=true;returning=false;const entryId=++entrySequence;
  audio.select();execution.dataset.phase='entering';execution.dataset.outcome='';
  $('#execution-name').textContent=p.name;$('#execution-name').title=p.name;
  $('#shot-label').textContent=`SHOT ${recovering?p.shots:p.shots+1}/6`;
  $('#execution-status').hidden=!recovering||!p.dead;
  $('#execution-portrait').innerHTML=executionRig(p);
  $('#fire-button').disabled=true;$('#fire-button').hidden=false;$('.fire-controls').style.visibility='visible';
  $('#cancel-execution').hidden=false;$('#cancel-execution').disabled=false;$('#execution-settings').disabled=false;$('#execution-fullscreen').disabled=false;
  $('#return-button').hidden=true;$('#result').textContent='';
  gsap.set(['#result','.blood-mark','.impact'],{opacity:0});
  gsap.set('.execution-stage',{clearProps:'transform'});
  gsap.set(execution,{clearProps:'transform',opacity:0});
  execution.hidden=false;placeExecutionHud();app.inert=true;$('.topbar').inert=true;execution.focus();
  // The same right arm starts in the same idle pose as the table portrait.
  entryTimeline=gsap.timeline();
  entryTimeline.to(execution,{opacity:1,duration:.1},0)
    .to('#execution-portrait .upper-arm',{rotation:0,svgOrigin:'185 224',duration:prefs.reducedMotion?.12:.8,ease:'power2.inOut'},prefs.reducedMotion?0:.12)
    .to('#execution-portrait .forearm',{rotation:0,svgOrigin:'222 224',duration:prefs.reducedMotion?.12:.8,ease:'power2.inOut'},prefs.reducedMotion?0:.12)
    .call(()=>{if(entryId===entrySequence&&!recovering&&!returning&&selected===id){execution.dataset.phase='ready';placeExecutionHud();$('#fire-button').disabled=false;$('#fire-button').focus({preventScroll:true});}},[],prefs.reducedMotion?.13:.93);
  if(recovering){entryTimeline.kill();gsap.set(execution,{opacity:1});gsap.set('#execution-portrait .upper-arm',{rotation:0,svgOrigin:'185 224'});gsap.set('#execution-portrait .forearm',{rotation:0,svgOrigin:'222 224'});$('#cancel-execution').hidden=true;$('#fire-button').hidden=true;reveal(state.pending,true);}
}

$('#fire-button').onclick=()=>{
  if(!selected||state.pending||$('#fire-button').disabled||returning)return;
  attempt(()=>{
    commit(fire(state,selected,state.nextShot)); // Durable result: animation cannot change it.
    const result=state.pending,sequence=entrySequence;
    execution.dataset.phase='firing';
    for(const id of ['fire-button','cancel-execution','execution-settings','execution-fullscreen'])$('#'+id).disabled=true;
    // Identical grip, trembling, camera, sounds and final silence for either result.
    shotTimeline=gsap.timeline();
    shotTimeline.call(()=>audio.cock(),[],0)
      .to('#execution-portrait .hand-rig',{scale:1.025,svgOrigin:'255 174',duration:.2,yoyo:true,repeat:1},0)
      .to('#execution-portrait .cylinder',{y:2,duration:.12,yoyo:true,repeat:1},.12)
      .to('#execution-portrait .hammer',{rotation:-16,svgOrigin:'110 119',duration:.25},.15)
      .call(()=>audio.breathe(),[],.4)
      .call(()=>audio.heartbeat(),[],.55)
      .call(()=>audio.breathe(),[],1.35)
      .call(()=>audio.heartbeat(),[],1.35)
      .call(()=>audio.breathe(),[],2.8)
      .call(()=>audio.heartbeat(),[],2.8)
      .call(()=>audio.breathe(),[],4.2)
      .call(()=>audio.heartbeat(),[],4.2)
      .to('#execution-portrait .forearm',{rotation:prefs.reducedMotion?0:-.65,svgOrigin:'222 224',duration:.16,yoyo:true,repeat:21,ease:'sine.inOut'},.65)
      .to('.execution-stage',{scale:prefs.reducedMotion?1:1.025,transformOrigin:'50% 55%',duration:4.6,ease:'sine.inOut'},0)
      // Final breath ends at 5.22; keep both outcomes hidden until 5.7s.
      .to('#execution-portrait .trigger',{x:-3,duration:.14},5.54)
      .call(()=>{if(sequence===entrySequence&&!returning)reveal(result);},[],5.7);
  });
};

function reveal(result,recovering=false) {
  const fatal=result.fatal,p=state.players.find(p=>p.id===result.playerId),sequence=entrySequence;
  execution.dataset.phase='result';execution.dataset.outcome=fatal?'fatal':'blank';
  $('.fire-controls').style.visibility='hidden';$('#execution-status').hidden=!fatal;
  for(const id of ['cancel-execution','execution-settings','execution-fullscreen'])$('#'+id).disabled=true;
  $('#result').innerHTML=fatal?`<div class="death-card"><div class="death-portrait">${portrait(p.skin,true,p.appearance)}<svg class="death-x" viewBox="0 0 260 310" aria-hidden="true"><g fill="none" stroke="#b94538" stroke-linecap="square"><path d="M34 48 225 260M220 45 37 263" stroke-width="20"/><path d="M30 54 222 266M226 50 34 255" stroke-width="3" stroke="#dd7052"/></g></svg><i class="death-particles" aria-hidden="true"></i></div><h2>${escapeText(p.name)}</h2><strong>DIED</strong>${recovering?'<small>SAVED RESULT</small>':''}</div>`:`SURVIVED${recovering?'<small>SAVED RESULT</small>':''}`;
  $('#result').style.color=fatal?'#d68570':'#d5c69e';
  reactionTimeline=gsap.timeline();const timeline=reactionTimeline;
  if(!recovering){
    if(fatal)audio.bang();else audio.click();
    if(fatal&&!prefs.reducedFlashing)timeline.to('#execution-portrait .muzzle',{opacity:1,duration:.025,repeat:1,yoyo:true},0).fromTo('.impact',{opacity:.65},{opacity:0,duration:.42},0);
    if(!prefs.reducedMotion){
      timeline.to('#execution-portrait .forearm',{rotation:-6,svgOrigin:'222 224',duration:.06,yoyo:true,repeat:1},0);
      if(fatal){
        timeline.to('.execution-stage',{x:4,duration:.035,repeat:5,yoyo:true},0).set('.execution-stage',{x:0},.22)
          .to('#execution-portrait .rig-actor',{rotation:-4,svgOrigin:'245 300',duration:.09,yoyo:true,repeat:1},0)
          .to('#execution-portrait .rig-actor',{rotation:-22,y:20,scale:.82,opacity:.45,svgOrigin:'245 300',duration:.6,ease:'power3.in'},.22)
          .to('#execution-portrait .upper-arm',{rotation:35,svgOrigin:'185 224',duration:.6},.25)
          .to('#execution-portrait .forearm',{rotation:65,svgOrigin:'222 224',duration:.6},.25);
      }else{
        timeline.to('#execution-portrait .rig-actor',{y:3,duration:.09,yoyo:true,repeat:1},0)
          .to('#execution-portrait .upper-arm',{rotation:14,svgOrigin:'185 224',duration:.6,ease:'power2.out'},.35)
          .to('#execution-portrait .forearm',{rotation:22,svgOrigin:'222 224',duration:.6},.35);
      }
    }else if(fatal)timeline.to('#execution-portrait .rig-actor',{opacity:.45,duration:.3},0);
  }
  const revealAt=recovering?0:fatal?.95:.25;
  timeline.to('#result',{opacity:1,duration:.3},revealAt);
  if(fatal&&!prefs.reducedMotion)timeline.fromTo('#execution .death-x',{scale:1.35,rotation:-8,opacity:0},{scale:1,rotation:0,opacity:1,duration:.22,ease:'power3.in'},revealAt+.08);
  if(recovering)timeline.call(()=>{$('#return-button').hidden=false;$('#return-button').focus();},[],.35);
  else timeline.call(()=>{if(sequence===entrySequence)returnToTable();},[],fatal?3.5:2.7);
}

function returnToTable() {
  if(!busy||returning)return;
  const ok=attempt(()=>{if(state.pending)commit(completeShot(state));return true;});
  if(!ok){$('#return-button').hidden=false;return;}
  returning=true;entrySequence++;stopExecutionAnimations();execution.dataset.phase='returning';
  // Prepare an unscaled destination underneath the still-opaque execution view.
  renderTable();resetTableCamera();app.inert=true;$('.topbar').inert=true;
  transitionTimeline=gsap.timeline({onComplete:()=>{
    execution.hidden=true;gsap.set('.execution-stage',{clearProps:'transform'});gsap.set(execution,{clearProps:'transform'});
    app.inert=false;$('.topbar').inert=false;busy=false;returning=false;selected=null;execution.dataset.phase='idle';
    const target=winner(state)?$('#play-again'):document.querySelector('.seat:not(:disabled)');target?.focus({preventScroll:true});
  }}).to(execution,{opacity:0,duration:prefs.reducedMotion?.15:.45,ease:'power1.out'});
}

$('#return-button').onclick=returnToTable;
$('#cancel-execution').onclick=()=>{if(!state.pending){shotTimeline?.kill();returnToTable();}};
execution.addEventListener('keydown',e=>{
  if(e.key==='Escape'){e.preventDefault();if(!state.pending)returnToTable();}
  if(e.key==='Tab'){
    const controls=[...execution.querySelectorAll('button')].filter(el=>!el.hidden&&!el.disabled&&getComputedStyle(el).visibility!=='hidden');
    if(!controls.length){e.preventDefault();return;}
    const first=controls[0],last=controls[controls.length-1];
    if(e.shiftKey&&(document.activeElement===first||document.activeElement===execution)){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===execution)){e.preventDefault();first.focus();}
  }
});

function renderStorageError() {
  app.innerHTML=`<section class="storage-error"><p class="eyebrow">THE HOUSE HAS KEPT THE RECORD</p><h2>Let's protect your match.</h2><p class="muted">${escapeText(storageError)}</p><button class="primary" id="retry-save">TRY AGAIN</button><button class="outline" id="replace-save">REPLACE SAVED MATCH</button></section>`;
  $('#retry-save').onclick=()=>location.reload();
  $('#replace-save').onclick=()=>confirm('Replace saved match?','The existing save will be removed. This cannot be undone. Allow browser storage before continuing.',()=>{storage=localStorage;storage.removeItem(KEY);state=null;storageError=null;renderSetup();});
}
window.addEventListener('storage',e=>{if(e.key===KEY)toast('Match changed in another tab. Reload before your next action. Use one tab for play.');});
if(storageError)renderStorageError();
else if(state){renderTable();if(state.pending)selectPlayer(state.pending.playerId,true);}
else renderSetup();
