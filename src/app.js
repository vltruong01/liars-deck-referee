import { gsap } from 'gsap';
import { createMatch, fire, completeShot, rename, resetPlayer, resetMatch, living, winner, load, persist, KEY } from './engine.js';
import { skins, portrait, roomArt, revolver } from './art.js';
import { AudioDirector } from './audio.js';

const $ = selector => document.querySelector(selector);
const app=$('#app'), execution=$('#execution'), audio=new AudioDirector();
const escapeText = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const prefersMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let prefs={volume:.45,reducedFlashing:false,reducedMotion:prefersMotion.matches};
try { const saved=JSON.parse(localStorage.getItem('liars-deck.settings')||'null'); if(saved) prefs={volume:typeof saved.volume==='number'?Math.max(0,Math.min(1,saved.volume)):.45,reducedFlashing:!!saved.reducedFlashing,reducedMotion:!!saved.reducedMotion||prefersMotion.matches}; } catch {}
audio.setVolume(prefs.volume);
let state=null, storage, storageError=null, selected=null, busy=false, returning=false, shotTimeline=null, toastTimer=null, confirmAction=null;
let count=4, draft=skins.slice(0,4).map((s,i)=>({name:`Player ${i+1}`,skin:s.id}));
let stageObserver=null, entrySequence=0;
try { storage=localStorage; state=load(storage); } catch(error) { storageError=error.message; }

function toast(message) { clearTimeout(toastTimer); $('#toast').textContent=message; $('#toast').hidden=false; toastTimer=setTimeout(()=>$('#toast').hidden=true,6500); }
function attempt(action) { try { return action(); } catch(error) { toast(error.message); return false; } }
function commit(next) { state=persist(storage,next,state); return true; }
function showDialog(id) { const el=$(`#${id}`); if(!el.open) el.showModal(); }
function confirm(title,description,action) { $('#confirm-title').textContent=title; $('#confirm-description').textContent=description; confirmAction=action; showDialog('confirm-dialog'); $('#confirm-cancel').focus(); }
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
function fitStage() {
  const scene=$('.scene'), fit=$('.stage-fit');if(!scene||!fit)return;
  const scale=Math.min((scene.clientWidth-12)/960,(scene.clientHeight-12)/400,1.65);
  fit.style.setProperty('--stage-scale',String(Math.max(.1,scale)));
}
function observeStage() {
  stageObserver?.disconnect();
  if(typeof ResizeObserver!=='undefined'){stageObserver=new ResizeObserver(fitStage);stageObserver.observe($('.scene'));}
  fitStage();
}
window.addEventListener('resize',fitStage);
$('#volume').value=String(Math.round(prefs.volume*100)); $('#volume-value').value=`${Math.round(prefs.volume*100)}%`;
$('#reduced-flashing').checked=prefs.reducedFlashing; $('#reduced-motion').checked=prefs.reducedMotion;
function savePrefs() { attempt(()=>storage.setItem('liars-deck.settings',JSON.stringify(prefs))); }
$('#volume').oninput=e=>{prefs.volume=Number(e.target.value)/100;$('#volume-value').value=`${e.target.value}%`;audio.setVolume(prefs.volume);savePrefs();};
$('#volume').onchange=()=>{audio.unlock();audio.click();};
$('#reduced-flashing').onchange=e=>{prefs.reducedFlashing=e.target.checked;savePrefs();};
$('#reduced-motion').onchange=e=>{prefs.reducedMotion=e.target.checked;savePrefs();};

function footer() { return `<footer class="footnote"><span>PHYSICAL CARDS. DIGITAL CONSEQUENCES.</span><span>ONE BULLET. NO SECOND CHANCES.</span></footer>`; }

function renderSetup() {
  stageObserver?.disconnect();
  app.innerHTML=`<section class="setup">
    <div class="setup-heading"><div><p class="eyebrow">WELCOME TO THE LAST CALL</p><h1>Choose your company.</h1></div><div class="setup-heading-tools"><button class="text-button" id="how-to">HOUSE RULES &#8599;</button><div class="player-count"><span>PLAYERS</span>${[2,3,4].map(n=>`<button type="button" class="count-button ${n===count?'active':''}" aria-label="${n} players" aria-pressed="${n===count}" data-count="${n}">${n}</button>`).join('')}</div></div></div>
    <form id="setup-form"><div class="player-grid" data-count="${count}">${draft.slice(0,count).map((p,i)=>setupCard(p,i)).join('')}</div>
    <div class="setup-footer"><p>Six chambers. One bullet each.<small>Physical cards. The house handles the consequences.</small></p><button class="primary" type="submit">START GAME <b>&#8594;</b></button></div></form></section>`;
  $('#how-to').onclick=()=>showDialog('help-dialog');
  document.querySelectorAll('[data-count]').forEach(b=>b.onclick=()=>{captureDraft();count=Number(b.dataset.count);renderSetup();});
  document.querySelectorAll('[data-skin-step]').forEach(b=>b.onclick=()=>{
    captureDraft();const i=Number(b.dataset.player), current=skins.findIndex(s=>s.id===draft[i].skin);
    draft[i].skin=skins[(current+Number(b.dataset.skinStep)+skins.length)%skins.length].id;
    const target=b.closest('.setup-player');target.querySelector('.skin-preview').innerHTML=portrait(draft[i].skin);target.querySelector('.skin-name').textContent=skins.find(s=>s.id===draft[i].skin).name;
    if(!prefs.reducedMotion) gsap.fromTo(target.querySelector('.portrait'),{opacity:0,x:10},{opacity:1,x:0,duration:.25});
  });
  $('#setup-form').onsubmit=e=>{e.preventDefault();captureDraft();attempt(()=>{
    const next=createMatch(draft.slice(0,count));
    // Starting after the explicit new-match confirmation deliberately replaces the old save.
    state=persist(storage,next);renderTable();window.scrollTo(0,0);if(!prefs.reducedMotion)gsap.from('.scene-frame',{opacity:0,y:15,duration:.65});
  });};
}
function setupCard(p,i) { return `<article class="setup-player"><span class="seat-label">SEAT 0${i+1}</span><div class="skin-preview">${portrait(p.skin)}</div><div class="skin-selector"><button type="button" class="skin-arrow" data-player="${i}" data-skin-step="-1" aria-label="Previous skin for player ${i+1}">‹</button><span class="skin-name" aria-live="polite">${skins.find(s=>s.id===p.skin).name}</span><button type="button" class="skin-arrow" data-player="${i}" data-skin-step="1" aria-label="Next skin for player ${i+1}">›</button></div><label for="name-${i}">PLAYER NAME</label><input id="name-${i}" name="player${i}" type="text" maxlength="24" required autocomplete="off" value="${escapeText(p.name)}" data-draft="${i}"></article>`; }
function captureDraft(){document.querySelectorAll('[data-draft]').forEach(input=>draft[Number(input.dataset.draft)].name=input.value);}

function renderTable() {
  const w=winner(state),alive=living(state).length;
  app.innerHTML=`<section class="bar-page ${w?'has-winner':''}">
    <div class="bar-heading"><div><p class="eyebrow">THE LAST CALL &middot; TABLE 01</p><h1>${w?'The last one standing.':'Who lost the challenge?'}</h1></div><div class="bar-tools"><span class="alive-count"><i class="live-dot"></i> ${alive}/${state.players.length} ALIVE</span><button class="text-button" id="manage-button">MANAGE PLAYERS</button><button class="outline" id="new-match">NEW MATCH &#8599;</button></div></div>
    ${w?`<div class="winner-banner"><h2><span>${escapeText(w.name)}</span> takes the table.</h2><button class="primary" id="play-again">PLAY AGAIN <b>&#8594;</b></button></div>`:''}
    <div class="scene-frame"><div class="scene" data-count="${state.players.length}">${roomArt()}<div class="stage-fit"><div class="room-camera">
    <div class="table" aria-hidden="true"><div class="table-felt"><div class="table-emblem">&#9824;<span>THE LAST CALL</span></div><div class="cards"><div class="card">&#9824;</div><div class="card">&#9830;</div><div class="card">&#9827;</div></div><div class="glass"></div></div></div>
    ${state.players.map((p,i)=>`<button class="seat ${p.dead?'dead':''}" data-seat="${i+1}" data-execute="${p.id}" ${p.dead||w?'disabled':''} aria-label="${escapeText(p.name)}, ${p.dead?'eliminated':`${p.shots} shots taken. Select for execution`}" title="${escapeText(p.name)}"><span class="seat-character">${portrait(p.skin)}</span><span class="seat-name"><strong>${escapeText(p.name)}</strong><small>${p.dead?'&#10005; ELIMINATED':`&#9679; ALIVE &middot; ${p.shots}/6 PULLS`}</small></span></button>`).join('')}
    </div></div></div></div>
    <div class="bar-bottom"><p class="instruction">${w?'The night belongs to the last survivor.':'Tap the player who lost. Let the revolver settle the debt.'}</p><p class="last-event">${lastEvent()}</p></div></section>`;
  observeStage();
  document.querySelectorAll('[data-execute]').forEach(b=>b.onclick=()=>selectPlayer(b.dataset.execute));
  $('#manage-button').onclick=openManagement;
  $('#new-match').onclick=()=>confirm('A different company?','End this match and return to player setup? Current progress will be replaced when you start the new game.',()=>{draft=state.players.map(p=>({name:p.name,skin:p.skin}));while(draft.length<4)draft.push({name:`Player ${draft.length+1}`,skin:skins[draft.length].id});count=state.players.length;renderSetup();});
  if(w) $('#play-again').onclick=()=>confirm('Another night?','Reload every revolver with one freshly randomized bullet. Keep the same names and characters?',()=>{commit(resetMatch(state));renderTable();});
}
function lastEvent() { if(!state.last) return 'All revolvers loaded. <span>Make your first move.</span>';const p=state.players.find(p=>p.id===state.last.playerId);return `<span>${escapeText(p.name)}</span> ${state.last.fatal?'was eliminated':'survived'} · pull ${state.last.shot}/6`; }

function openManagement() {
  if(busy)return;
  $('#manage-list').innerHTML=state.players.map(p=>`<form class="manage-row" data-rename="${p.id}">${portrait(p.skin)}<div class="manage-input-group"><label for="edit-${p.id}">${p.dead?'ELIMINATED':'ALIVE'} · ${p.shots}/6 PULLS</label><input type="text" id="edit-${p.id}" maxlength="24" required aria-label="Name for ${escapeText(p.name)}" value="${escapeText(p.name)}"></div><div class="manage-actions"><button type="submit">SAVE NAME</button><button type="button" data-reset="${p.id}">RESET</button></div></form>`).join('');
  document.querySelectorAll('[data-rename]').forEach(form=>form.onsubmit=e=>{e.preventDefault();attempt(()=>{commit(rename(state,form.dataset.rename,form.querySelector('input').value));renderTable();toast('Name saved. Revolver progress kept.');});});
  document.querySelectorAll('[data-reset]').forEach(b=>b.onclick=()=>{const p=state.players.find(p=>p.id===b.dataset.reset);confirm(`Reset ${p.name}?`,'Bring this player back with zero shots and a newly loaded revolver? Other players keep their progress.',()=>{commit(resetPlayer(state,p.id));renderTable();openManagement();toast('Player reset. A fresh cylinder awaits.');});});
  $('#reset-all').onclick=()=>confirm('Reload the table?','Reset every player to alive with zero shots and freshly randomized revolvers? Names and skins stay.',()=>{commit(resetMatch(state));renderTable();openManagement();toast('All revolvers reset.');});
  showDialog('manage-dialog');
}

function selectPlayer(id, recovering=false) {
  if(busy || (!recovering&&(state.pending||winner(state)))) return;
  const p=state.players.find(p=>p.id===id); if(!p||(!recovering&&p.dead))return;
  selected=id;busy=true;returning=false;
  const entryId=++entrySequence;
  audio.select();
  const seat=document.querySelector(`[data-execute="${id}"]`), camera=$('.room-camera');
  if(camera&&!prefs.reducedMotion){
    // The outer stage owns responsive scaling. The camera only makes a small,
    // clamped move toward the chosen seat, inside the scene's visual frame.
    const centerX=seat?seat.offsetLeft+seat.offsetWidth/2:480;
    const centerY=seat?seat.offsetTop+seat.offsetHeight/2:200;
    const focusX=Math.max(10,Math.min(90,centerX/960*100));
    const focusY=Math.max(10,Math.min(90,centerY/400*100));
    gsap.to(camera,{scale:1.16,x:Math.max(-32,Math.min(32,(480-centerX)*.08)),y:Math.max(-10,Math.min(10,(200-centerY)*.06)),transformOrigin:`${focusX}% ${focusY}%`,duration:.48,ease:'power2.inOut'});
  }
  execution.dataset.phase='entering';
  $('#execution-name').textContent=p.name;
  $('#execution-eyebrow').textContent=recovering?'THE HOUSE KEPT YOUR RESULT':'THE HOUSE IS WATCHING';
  $('#execution-subtitle').textContent=recovering?'Your last trigger pull was saved.':'One chamber. One consequence.';
  $('#execution-portrait').innerHTML=portrait(p.skin); $('#gun').innerHTML=revolver();
  $('#shot-label').textContent=`TRIGGER PULL ${recovering?p.shots:p.shots+1} OF 6`;
  $('#execution-hint').textContent='Take a breath. Then pull the trigger.';
  $('#fire-button').disabled=true;$('#fire-button').hidden=false;$('.fire-controls').style.visibility='visible';
  $('#cancel-execution').hidden=false;$('#cancel-execution').disabled=false;$('#execution-settings').disabled=false;$('#execution-fullscreen').disabled=false;
  $('#return-button').hidden=true;$('#result').textContent='';
  gsap.set(['#result','.blood-mark','.impact'],{opacity:0});gsap.set('#gun',{rotation:-7,y:0});
  execution.hidden=false;app.inert=true;$('.topbar').inert=true;execution.focus();
  gsap.fromTo(execution,{opacity:0},{opacity:1,duration:prefs.reducedMotion?.12:.4,delay:prefs.reducedMotion?0:.16,onComplete:()=>{if(entryId===entrySequence&&!recovering&&!returning&&selected===id){execution.dataset.phase='ready';$('#fire-button').disabled=false;$('#fire-button').focus({preventScroll:true});}}});
  if(recovering){$('#cancel-execution').hidden=true;$('#fire-button').hidden=true;reveal(state.pending,true);}
}

$('#fire-button').onclick=()=>{
  if(!selected||state.pending||$('#fire-button').disabled)return;
  attempt(()=>{
    const next=fire(state,selected,state.nextShot);
    commit(next); // The result is now durable. Animation has no authority over it.
    const result=state.pending;
    execution.dataset.phase='firing';
    $('#fire-button').disabled=true;$('#cancel-execution').disabled=true;$('#execution-settings').disabled=true;$('#execution-fullscreen').disabled=true;$('#execution-hint').textContent='The room holds its breath.';
    $('#execution-eyebrow').textContent='THERE IS NO TAKING IT BACK';
    const timeline=gsap.timeline();shotTimeline=timeline;
    // Exactly the same sequence, sound, duration and controls for both outcomes.
    timeline.call(()=>audio.cock(),[],0)
      .to('#gun',{y:prefs.reducedMotion?0:-13,rotation:prefs.reducedMotion?-7:-12,duration:.45,ease:'power2.inOut'},0)
      .to('.cylinder',{y:3,duration:.17,yoyo:true,repeat:1},.1)
      .to('.hammer',{rotation:-18,svgOrigin:'110 119',duration:.28},.15)
      .call(()=>audio.heartbeat(),[],.43)
      .to('#gun',{y:prefs.reducedMotion?0:-7,rotation:prefs.reducedMotion?-7:-9,duration:.4},.55)
      .call(()=>audio.heartbeat(),[],1.05)
      .to('.trigger',{x:-3,duration:.15},1.35)
      .call(()=>reveal(result),[],1.55);
  });
};

function reveal(result,recovering=false) {
  const fatal=result.fatal,p=state.players.find(p=>p.id===result.playerId);
  execution.dataset.phase='result';
  $('.fire-controls').style.visibility='hidden';$('#cancel-execution').disabled=true;$('#execution-settings').disabled=true;$('#execution-fullscreen').disabled=true;
  $('#execution-eyebrow').textContent=recovering?'RECOVERED FROM YOUR SAVED MATCH':'THE HOUSE HAS SPOKEN';
  $('#execution-subtitle').textContent=fatal?'A debt paid in full.':'Not tonight.';
  $('#result').innerHTML=`${fatal?'ELIMINATED':'SURVIVED'}<small>${escapeText(p.name)} · ${fatal?'THEIR SEAT IS EMPTY':'STILL IN THE GAME'}${recovering?' · SAVED RESULT':''}</small>`;
  $('#result').style.color=fatal?'#d68570':'#d5c69e';
  if(!recovering){
    if(fatal)audio.bang();else audio.click();
    if(fatal&&!prefs.reducedFlashing) {
      gsap.to('.muzzle',{opacity:1,duration:.025,repeat:1,yoyo:true});
      gsap.fromTo('.impact',{opacity:.52},{opacity:0,duration:.5});
      gsap.to('.blood-mark',{opacity:.85,duration:.25});
    }
    if(!prefs.reducedMotion){
      gsap.to('#gun',{y:fatal?-38:-3,rotation:fatal?-22:-11,duration:.07,yoyo:true,repeat:1});
      if(fatal){gsap.to('.execution-stage',{x:5,duration:.045,repeat:7,yoyo:true,onComplete:()=>gsap.set('.execution-stage',{x:0})});gsap.to('#execution-portrait .portrait',{rotation:15,y:16,opacity:.22,duration:1.0,delay:.2,ease:'power2.in'});}
      else gsap.to('#execution-portrait .portrait',{y:9,rotation:-3,duration:.2,yoyo:true,repeat:1,delay:.1});
    }else if(fatal)gsap.to('#execution-portrait .portrait',{opacity:.3,duration:.5});
  } else if(fatal) gsap.set('#execution-portrait .portrait',{opacity:.25});
  gsap.to('#result',{opacity:1,duration:.5,delay:recovering?0:.3});
  gsap.delayedCall(recovering?.3:.85,()=>{$('#return-button').hidden=false;$('#return-button').focus();});
  if(!recovering) shotTimeline=gsap.delayedCall(fatal?3.8:2.8,returnToTable);
}

function returnToTable() {
  if(!busy||returning)return;
  const ok=attempt(()=>{if(state.pending)commit(completeShot(state));return true;});
  if(!ok){$('#return-button').hidden=false;return;}
  returning=true;entrySequence++;shotTimeline?.kill();shotTimeline=null;
  gsap.to(execution,{opacity:0,duration:prefs.reducedMotion?.15:.45,onComplete:()=>{
    execution.hidden=true;app.inert=false;$('.topbar').inert=false;busy=false;returning=false;selected=null;
    gsap.set(execution,{x:0});renderTable();
    const target=winner(state)?$('#play-again'):document.querySelector('.seat:not(:disabled)');target?.focus({preventScroll:true});
  }});
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
