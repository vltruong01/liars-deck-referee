// @vitest-environment happy-dom
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { createMatch, fire, KEY } from '../src/engine.js';

// Test the DOM controller and its scheduled reveal contract; native Chrome QA
// separately verifies actual GSAP rendering. All callbacks use a virtual clock.
vi.mock('gsap',()=>{
  const apply=(target,vars)=>{
    const targets=Array.isArray(target)?target:[target];
    targets.forEach(t=>(typeof t==='string'?[...document.querySelectorAll(t)]:[t]).forEach(el=>{
      if(el?.style&&vars.opacity!==undefined)el.style.opacity=String(vars.opacity);
    }));vars.onComplete?.();
  };
  const tween=(target,vars)=>{const timer=setTimeout(()=>apply(target,vars),1000*((vars.duration||0)+(vars.delay||0)));return{kill:()=>clearTimeout(timer)};};
  return{gsap:{set:apply,to:tween,from:tween,fromTo:(target,from,to)=>{apply(target,from);return tween(target,to);},delayedCall:(delay,fn)=>{const timer=setTimeout(fn,delay*1000);return{kill:()=>clearTimeout(timer)};},timeline:()=>{
    const timers=[];const chain={call(fn,args=[],at=0){timers.push(setTimeout(()=>fn(...args),at*1000));return chain;},to(){return chain;},kill(){timers.forEach(clearTimeout);}};return chain;
  }}};
});
const entries=[{name:'Alice',skin:'wolf'},{name:'Bob',skin:'fox'},{name:'Chloe',skin:'hare'},{name:'Dax',skin:'bear'}];
const $=selector=>document.querySelector(selector);
const saved=()=>JSON.parse(localStorage.getItem(KEY));
async function boot(s=null){if(s)localStorage.setItem(KEY,JSON.stringify(s));await import('../src/app.js');}
async function advance(ms){await vi.advanceTimersByTimeAsync(ms);}
function submit(selector){$(selector).dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));}

beforeEach(()=>{
  vi.resetModules();vi.useFakeTimers();localStorage.clear();
  const template=readFileSync('src/template.html','utf8');document.body.innerHTML=template.match(/<body>([\s\S]*)<\/body>/)[1];
  window.scrollTo=vi.fn();window.matchMedia=vi.fn(()=>({matches:false}));
});
afterEach(()=>{vi.clearAllTimers();vi.useRealTimers();});

describe('shared screen controller',()=>{
  it('defaults to four, changes player count, cycles skin and creates chosen players',async()=>{
    await boot();expect(document.querySelectorAll('.setup-player')).toHaveLength(4);
    $('[data-count="2"]').click();expect(document.querySelectorAll('.setup-player')).toHaveLength(2);
    $('[data-count="3"]').click();expect(document.querySelectorAll('.setup-player')).toHaveLength(3);
    $('#name-0').value='Alice';$('[data-player="0"][data-skin-step="1"]').click();
    expect($('.skin-name').textContent).toBe('The Fox');submit('#setup-form');
    expect(saved().players).toHaveLength(3);expect(saved().players[0]).toMatchObject({name:'Alice',skin:'fox',shots:0});
    expect(document.querySelectorAll('[data-execute]')).toHaveLength(3);
  });
  for(const fatal of [false,true]) it(`commits a ${fatal?'fatal':'blank'} shot once, waits to reveal and returns automatically`,async()=>{
    await boot(createMatch(entries,()=>fatal?0:5));
    $('[data-execute="p1"]').click();await advance(1000);
    expect($('#execution').hidden).toBe(false);expect($('#execution-name').textContent).toBe('Alice');
    $('#fire-button').click();$('#fire-button').click();
    expect(saved().players[0].shots).toBe(1);expect(saved().pending.fatal).toBe(fatal);
    expect($('#result').textContent).toBe('');await advance(1500);expect($('#result').textContent).toBe('');
    await advance(60);expect($('#result').textContent).toContain(fatal?'ELIMINATED':'SURVIVED');
    await advance(4500);expect($('#execution').hidden).toBe(true);expect(saved().pending).toBeNull();
    expect($('[data-execute="p1"]').disabled).toBe(fatal);expect(saved().players[1].shots).toBe(0);
  });
  it('recovers a pending fatal shot without pulling another chamber',async()=>{
    const pending=fire(createMatch(entries,()=>0),'p1',1);await boot(pending);await advance(1000);
    expect($('#result').textContent).toContain('SAVED RESULT');expect($('#fire-button').hidden).toBe(true);
    expect(saved().players[0].shots).toBe(1);$('#return-button').click();await advance(500);
    expect(saved().players[0].shots).toBe(1);expect(saved().players[0].dead).toBe(true);expect(saved().pending).toBeNull();
  });
  it('can cancel selection before firing with zero consumed chambers',async()=>{
    await boot(createMatch(entries,()=>5));$('[data-execute="p1"]').click();await advance(1000);
    $('#cancel-execution').click();await advance(500);expect($('#execution').hidden).toBe(true);
    expect(saved().players.every(p=>p.shots===0)).toBe(true);
  });
  it('does not let a cancelled entry enable FIRE during a newer selection',async()=>{
    await boot(createMatch(entries,()=>5));$('[data-execute="p1"]').click();await advance(100);
    $('#cancel-execution').click();await advance(451);$('[data-execute="p1"]').click();
    await advance(20);expect($('#fire-button').disabled).toBe(true);
    expect(saved().players[0].shots).toBe(0);
    await advance(600);expect($('#fire-button').disabled).toBe(false);
  });
  it('saves names without changing progress and only resets after confirmation',async()=>{
    await boot(createMatch(entries,()=>5));$('#manage-button').click();
    const old=saved().players;$('#edit-p1').value='New name';submit('[data-rename="p1"]');
    expect(saved().players[0]).toEqual({...old[0],name:'New name'});
    $('[data-reset="p1"]').click();expect(saved().revision).toBe(1);$('#confirm-cancel').click();
    expect(saved().revision).toBe(1);$('[data-reset="p1"]').click();$('#confirm-yes').click();
    expect(saved().revision).toBe(2);expect(saved().players.slice(1)).toEqual(old.slice(1));
    $('#reset-all').click();$('#confirm-yes').click();expect(saved().players.every(p=>p.shots===0&&!p.dead)).toBe(true);
  });
  it('announces the winner and starts another confirmed round',async()=>{
    const s=createMatch(entries.slice(0,2),()=>0);s.players[0].shots=1;s.players[0].dead=true;
    await boot(s);expect($('.winner-banner').textContent).toContain('Bob');
    expect([...document.querySelectorAll('[data-execute]')].every(b=>b.disabled)).toBe(true);
    $('#play-again').click();$('#confirm-yes').click();expect($('.winner-banner')).toBeNull();expect(saved().players.every(p=>!p.dead)).toBe(true);
  });
  it('persists volume and reduced-effect settings',async()=>{
    await boot();$('#volume').value='0';$('#volume').dispatchEvent(new Event('input'));
    $('#reduced-flashing').checked=true;$('#reduced-flashing').dispatchEvent(new Event('change'));
    $('#reduced-motion').checked=true;$('#reduced-motion').dispatchEvent(new Event('change'));
    expect(JSON.parse(localStorage.getItem('liars-deck.settings'))).toEqual({volume:0,reducedFlashing:true,reducedMotion:true});
  });
  it('keeps a corrupted save until the user confirms replacement',async()=>{
    localStorage.setItem(KEY,'{broken');await boot();expect($('.storage-error')).not.toBeNull();
    expect(localStorage.getItem(KEY)).toBe('{broken');$('#replace-save').click();$('#confirm-yes').click();
    expect($('#setup-form')).not.toBeNull();expect(localStorage.getItem(KEY)).toBeNull();
  });
});
