import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { mkdir } from 'node:fs/promises';
import { createMatch, fire, KEY } from '../../src/engine.js';

const url=pathToFileURL(resolve('dist/Liars-Deck.html')).href;
const sizes=[[667,375],[740,360],[844,390],[852,393],[932,430],[1024,768],[1366,768],[1920,1080]];
const entries=[{name:'Alexandria Longname XXIV',skin:'wolf'},{name:'Bartholomew Nightshade XX',skin:'fox'},{name:'Christopher Longname XXI',skin:'hare'},{name:'Dax',skin:'bear'}];
const screenshot=async(page,name)=>{await mkdir('docs/screenshots',{recursive:true});if(await page.locator('.scene-frame').isVisible())await expect(page.locator('.scene-frame')).toHaveCSS('opacity','1');await page.screenshot({path:`docs/screenshots/${name}.png`});};
async function inside(page,selector,minSize=0){
  const boxes=await page.locator(selector).evaluateAll(elements=>elements.map(el=>{
    const r=el.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,vw:innerWidth,vh:innerHeight,text:el.getAttribute('aria-label')||el.id||el.className};
  }));
  expect(boxes.length,selector).toBeGreaterThan(0);
  for(const b of boxes){expect(b.x,`${b.text} left`).toBeGreaterThanOrEqual(-1);expect(b.y,`${b.text} top`).toBeGreaterThanOrEqual(-1);expect(b.x+b.w,`${b.text} right`).toBeLessThanOrEqual(b.vw+1);expect(b.y+b.h,`${b.text} bottom`).toBeLessThanOrEqual(b.vh+1);expect(b.w,`${b.text} width`).toBeGreaterThanOrEqual(minSize-.5);expect(b.h,`${b.text} height`).toBeGreaterThanOrEqual(minSize-.5);}
}
async function noOverflow(page,selectors=['.game-shell','#app']){
  const checks=await page.evaluate(selectors=>{
    const els=[document.documentElement,document.body,...selectors.flatMap(s=>[...document.querySelectorAll(s)])];
    return els.map(el=>({tag:el.id||el.className||el.tagName,sw:el.scrollWidth,cw:el.clientWidth,sh:el.scrollHeight,ch:el.clientHeight}));
  },selectors);
  for(const c of checks){expect(c.sw,`${c.tag} horizontal overflow`).toBeLessThanOrEqual(c.cw+1);expect(c.sh,`${c.tag} vertical overflow`).toBeLessThanOrEqual(c.ch+1);}
}
async function separated(page,selector){
  const boxes=await page.locator(selector).evaluateAll(els=>els.map(el=>{const b=el.getBoundingClientRect();return {x:b.x,y:b.y,w:b.width,h:b.height};}));
  for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){
    const a=boxes[i],b=boxes[j];const w=Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x),h=Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y);
    expect(w<=1||h<=1,`${selector}: ${i} overlaps ${j}`).toBe(true);
  }
}
async function plateClearOfFaces(page){
  const overlaps=await page.locator('.seat-name').evaluateAll(plates=>{
    const faces=[...document.querySelectorAll('.seat .portrait')].map(el=>{const r=el.getBoundingClientRect();return{x:r.x+r.width*.2,y:r.y+r.height*.05,w:r.width*.6,h:r.height*.57};});
    return plates.flatMap(plate=>{const p=plate.getBoundingClientRect();return faces.map(f=>Math.min(p.right,f.x+f.w)-Math.max(p.left,f.x)>1&&Math.min(p.bottom,f.y+f.h)-Math.max(p.top,f.y)>1);});
  });expect(overlaps.some(Boolean)).toBe(false);
}
async function loadMatch(page,state){await page.goto(url);await page.evaluate(({key,state})=>localStorage.setItem(key,JSON.stringify(state)),{key:KEY,state});await page.reload();await expect(page.locator('.seat')).toHaveCount(state.players.length);}
async function ready(page,id){await page.locator(`[data-execute="${id}"]`).tap();await expect(page.locator('#execution')).toHaveAttribute('data-phase','ready');await expect(page.locator('#fire-button')).toBeEnabled();}
async function tableChecks(page,count){await expect(page.locator('.seat')).toHaveCount(count);await inside(page,'.seat');await inside(page,'.seat-name');await separated(page,'.seat');await separated(page,'.seat-name');await plateClearOfFaces(page);await noOverflow(page,['.game-shell','#app','.bar-page','.scene']);}
async function executionChecks(page){
  await inside(page,'#execution-name, #execution-portrait .portrait, #gun, #shot-label, #execution-hint');
  await inside(page,'#fire-button, #cancel-execution, #execution-settings, #execution-fullscreen',44);
  await separated(page,'#gun, .execution-action');await separated(page,'#execution-name, #execution-portrait .portrait');
  await noOverflow(page,['#execution','.execution-layout','.execution-subject','.execution-action']);
}

for(const [width,height] of sizes)test(`${width}x${height}: table, each seat, FIRE, names and 2/3 players`,async({page,context})=>{
  await page.setViewportSize({width,height});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url);await expect(page.locator('.setup-player')).toHaveCount(4);
  await noOverflow(page,['.game-shell','#app','.setup','#setup-form','.player-grid']);
  await inside(page,'#setup-form input, #setup-form button, .count-button',44);
  for(let i=0;i<4;i++)await page.locator(`#name-${i}`).fill(entries[i].name);
  await screenshot(page,`setup-${width}x${height}`);
  await page.getByRole('button',{name:'START GAME'}).tap();
  await tableChecks(page,4);
  await screenshot(page,`table-${width}x${height}`);
  for(let i=1;i<=4;i++){
    await ready(page,`p${i}`);await executionChecks(page);
    expect(await page.locator('#execution-name').textContent()).toBe(entries[i-1].name.slice(0,24));
    const origin=await page.locator('.room-camera').evaluate((el,id)=>{const seat=document.querySelector(`[data-execute="${id}"]`);return{origin:getComputedStyle(el).transformOrigin.split(' ').map(parseFloat),matrix:getComputedStyle(el).transform,x:seat.offsetLeft+seat.offsetWidth/2,y:seat.offsetTop+seat.offsetHeight/2};},`p${i}`);
    expect(origin.matrix).not.toBe('none');
    expect(origin.origin[0]).toBeCloseTo(origin.x,0);expect(origin.origin[1]).toBeCloseTo(origin.y,0);
    if(i===1)await screenshot(page,`execution-${width}x${height}`);
    await page.locator('#cancel-execution').tap();await expect(page.locator('#execution')).toBeHidden();
  }
  // Deterministic fixtures exercise the real UI/GSAP without altering production RNG.
  await loadMatch(page,createMatch(entries,()=>5));await ready(page,'p1');
  await page.locator('#fire-button').tap();await expect(page.locator('#fire-button')).toBeDisabled();
  await expect(page.locator('#cancel-execution')).toBeDisabled();await expect(page.locator('#execution-settings')).toBeDisabled();
  await expect(page.locator('#result')).toContainText('SURVIVED');await expect(page.locator('#return-button')).toBeVisible();
  await inside(page,'#result, #return-button');await noOverflow(page,['#execution','.execution-action']);
  if(width===667||width===844)await screenshot(page,`survived-${width}x${height}`);
  await expect(page.locator('#execution')).toBeHidden({timeout:7000});
  expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).players[0].shots,KEY)).toBe(1);
  await page.reload();expect(await page.locator('[data-execute="p1"]').textContent()).toContain('1/6');
  for(const count of [2,3]){
    await page.locator('#new-match').tap();await page.locator('#confirm-yes').tap();await page.locator(`[data-count="${count}"].count-button`).tap();
    await page.getByRole('button',{name:'START GAME'}).tap();await tableChecks(page,count);
    await ready(page,'p1');await executionChecks(page);await page.locator('#cancel-execution').tap();await expect(page.locator('#execution')).toBeHidden();
    if(count===2)await screenshot(page,`two-player-${width}x${height}`);
  }
  await page.locator('#settings-button').tap();await inside(page,'#settings-dialog, #volume, #settings-dialog .primary');await noOverflow(page,['#settings-dialog']);await page.getByRole('button',{name:'DONE'}).tap();
  await page.locator('#new-match').tap();await page.locator('#manage-button').tap();await inside(page,'#manage-dialog, #reset-all');await inside(page,'#manage-list input, .manage-actions button',44);await noOverflow(page,['#manage-dialog']);
  expect(errors).toEqual([]);
});

test('fatal effect, pending recovery, resets, winner and offline local release',async({page,context})=>{
  await page.setViewportSize({width:667,height:375});
  await context.setOffline(true);
  await loadMatch(page,createMatch(entries,()=>0));await ready(page,'p1');await page.locator('#fire-button').tap();
  await expect(page.locator('#result')).toContainText('ELIMINATED');await expect(page.locator('#return-button')).toBeVisible();
  await screenshot(page,'eliminated-667x375');await inside(page,'#result, #return-button, #execution-portrait .portrait');
  await expect(page.locator('#execution')).toBeHidden({timeout:7000});await expect(page.locator('[data-execute="p1"]')).toBeDisabled();
  const pending=fire(createMatch(entries,()=>0),'p2',1);await loadMatch(page,pending);
  await expect(page.locator('#result')).toContainText('SAVED RESULT');await page.locator('#return-button').tap();await expect(page.locator('#execution')).toBeHidden();
  await page.locator('#new-match').tap();await page.locator('#manage-button').tap();await page.locator('[data-reset="p2"]').tap();await page.locator('#confirm-yes').tap();
  expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).players[1].shots,KEY)).toBe(0);
  await page.getByRole('button',{name:'Close player management'}).tap();
  const won=createMatch(entries.slice(0,2),()=>0);won.players[0].dead=true;won.players[0].shots=1;await loadMatch(page,won);
  await inside(page,'.winner-banner, #play-again');await noOverflow(page,['.bar-page']);await screenshot(page,'winner-667x375');
  await page.locator('#play-again').tap();await page.locator('#confirm-yes').tap();await tableChecks(page,2);
});

test('portrait guidance, orientation, safe-area sizing, reduced effects and entry guard',async({page})=>{
  await page.setViewportSize({width:844,height:390});await loadMatch(page,createMatch(entries,()=>5));
  await page.locator('[data-execute="p1"]').tap();await expect(page.locator('#fire-button')).toBeDisabled();
  await expect(page.locator('#fire-button')).toBeEnabled();
  const before=await page.evaluate(key=>localStorage.getItem(key),KEY);
  await page.setViewportSize({width:390,height:844});await expect(page.locator('.rotate-prompt')).toBeVisible();await screenshot(page,'portrait-guidance');
  await page.setViewportSize({width:844,height:390});await executionChecks(page);expect(await page.evaluate(key=>localStorage.getItem(key),KEY)).toBe(before);
  await page.locator('#execution-settings').tap();await page.locator('#reduced-flashing').check();await page.locator('#reduced-motion').check();await page.getByRole('button',{name:'DONE'}).tap();
  await page.locator('#cancel-execution').tap();await expect(page.locator('#execution')).toBeHidden();
  await page.locator('#fullscreen-button').evaluate(el=>document.documentElement.requestFullscreen=undefined);await page.locator('#fullscreen-button').tap();await expect(page.locator('#toast')).toContainText('unavailable');
});
