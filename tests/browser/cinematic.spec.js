import {test,expect} from '@playwright/test';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createMatch,KEY} from '../../src/engine.js';
const out='docs/cinematic-qa';
const entries=[
  {name:'Alexandria Longname XXIV',skin:'wolf',appearance:{hat:'top-hat',eyes:'sunglasses',mouth:'cigar',outfit:'classic'}},
  {name:'Rabbit',skin:'hare',appearance:{hat:'cowboy',eyes:'round',mouth:'cigarette',outfit:'vest',suit:'wine'}},
  {name:'Fox',skin:'fox',appearance:{hat:'cap',eyes:'monocle',mouth:'toothpick',outfit:'western'}},
  {name:'Bear',skin:'bear',appearance:{hat:'mafia',outfit:'vest',suit:'ivory'}},
];
async function snap(page,name){await mkdir(out,{recursive:true});await page.screenshot({path:`${out}/${name}.png`});}
async function fixture(page,fatal=false,count=4){await page.goto('http://127.0.0.1:4173/');await page.evaluate(({s,k})=>localStorage.setItem(k,JSON.stringify(s)),{s:createMatch(entries.slice(0,count),()=>fatal?0:5),k:KEY});await page.reload();}
async function visibleArt(page){
  const checks=await page.locator('#execution-portrait .portrait, #gun, .upper-arm, .forearm, .hand-rig').evaluateAll(els=>els.map(e=>{const b=e.getBBox(),m=e.getScreenCTM();const points=[[b.x,b.y],[b.x+b.width,b.y],[b.x,b.y+b.height],[b.x+b.width,b.y+b.height]].map(([x,y])=>new DOMPoint(x,y).matrixTransform(m));return {cls:e.id||e.getAttribute('class'),points:points.map(p=>[p.x,p.y]),vw:innerWidth,vh:innerHeight};}));
  for(const c of checks)for(const [x,y]of c.points){expect(x,c.cls).toBeGreaterThanOrEqual(-1);expect(x,c.cls).toBeLessThanOrEqual(c.vw+1);expect(y,c.cls).toBeGreaterThanOrEqual(-1);expect(y,c.cls).toBeLessThanOrEqual(c.vh+1);}
}
for(const [width,height]of [[667,375],[740,360],[844,390],[932,430],[1366,768]])test(`cinematic ${width}x${height}: staging, joint raise, shared suspense and reactions`,async({page})=>{
  test.setTimeout(60000);await page.setViewportSize({width,height});const suffix=`${width}x${height}`,errors=[];page.on('pageerror',e=>errors.push(e.message));
  await fixture(page);await expect(page.locator('.alive-count')).toHaveCount(0);await expect(page.locator('.bar-heading #manage-button')).toHaveCount(0);
  const geometry=await page.locator('.seat').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return {role:e.dataset.position,x:r.x,y:r.y,w:r.width,h:r.height};}));
  expect(geometry.map(g=>g.role)).toEqual(['rear','rear','left','right']);expect(geometry[0].y).toBeLessThan(geometry[2].y);expect(geometry[2].x+geometry[2].w).toBeLessThan(geometry[0].x);expect(geometry[3].x).toBeGreaterThan(geometry[1].x+geometry[1].w);
  const hit=await page.locator('.seat').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height*.4));}));expect(hit).toEqual([true,true,true,true]);
  await snap(page,`table-four-${suffix}`);
  await page.locator('#new-match').click();await expect(page.locator('#confirm-dialog')).toBeVisible();await page.locator('#confirm-cancel').click();await expect(page.locator('.seat')).toHaveCount(4);
  const sequences=[];
  for(const fatal of [false,true]){
    await fixture(page,fatal);await page.locator('[data-execute="p1"]').click();
    // Explicit intermediate timestamp for visual QA of the joint movement.
    await page.waitForTimeout(250);const mid=await page.locator('.forearm').getAttribute('transform');
    await snap(page,`${fatal?'fatal':'blank'}-raise-${suffix}`);await visibleArt(page);
    await expect(page.locator('#execution')).toHaveAttribute('data-phase','ready');await visibleArt(page);
    expect(await page.locator('.forearm').getAttribute('transform')).not.toBe(mid);await snap(page,`ready-${fatal?'fatal':'blank'}-${suffix}`);
    await page.evaluate(()=>{window.qaPhases=[];window.qaStart=performance.now();new MutationObserver(()=>{const phase=document.querySelector('#execution').dataset.phase;window.qaPhases.push({phase,t:performance.now()-window.qaStart});if(phase==='firing')setTimeout(()=>window.qaBeforeReveal={phase:document.querySelector('#execution').dataset.phase,text:document.querySelector('#result').textContent},1600);}).observe(document.querySelector('#execution'),{attributes:true,attributeFilter:['data-phase']});});
    await page.locator('#fire-button').click();await page.locator('#fire-button').evaluate(b=>b.click());
    await page.waitForTimeout(750);expect(await page.locator('#result').textContent()).toBe('');await visibleArt(page);await snap(page,`breath-${fatal?'fatal':'blank'}-${suffix}`);
    await expect(page.locator('#execution')).toHaveAttribute('data-phase','result');
    await page.waitForTimeout(110);await visibleArt(page);await snap(page,`impact-${fatal?'fatal':'blank'}-${suffix}`);
    await expect(page.locator('#result')).toHaveCSS('opacity','1');await page.waitForTimeout(180);await visibleArt(page);await snap(page,`${fatal?'fatal':'blank'}-result-${suffix}`);
    await expect(page.locator('#result')).toContainText('Alexandria');await expect(page.locator('#execution')).toBeHidden({timeout:7000});
    expect(await page.evaluate(()=>window.qaBeforeReveal)).toEqual({phase:'firing',text:''});
    const phases=await page.evaluate(()=>window.qaPhases);const reveal=phases.find(p=>p.phase==='result').t-phases.find(p=>p.phase==='firing').t;expect(reveal).toBeGreaterThan(1900);expect(reveal).toBeLessThan(2250);sequences.push({fatal,revealMs:reveal});
    const state=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);expect(state.players[0].shots).toBe(1);expect(state.pending).toBeNull();
    if(fatal){await expect(page.locator('[data-execute="p1"]')).toBeDisabled();await snap(page,`eliminated-table-${suffix}`);}
  }
  expect(Math.abs(sequences[0].revealMs-sequences[1].revealMs)).toBeLessThan(150);
  for(const count of [2,3]){await fixture(page,false,count);await snap(page,`table-${count}-${suffix}`);}
  expect(errors).toEqual([]);await writeFile(`${out}/checks-${suffix}.json`,JSON.stringify({viewport:[width,height],geometry,hit,sharedAnticipation:sequences,errors},null,2));
});

test('mouth accessories and outfit silhouettes: all six species and inward mirroring',async({page})=>{
  await page.setViewportSize({width:1366,height:768});await fixture(page);
  const art=await readFile('src/art.js','utf8'),appearance=await readFile('src/appearance.js','utf8');
  const appearanceURL='data:text/javascript;base64,'+Buffer.from(appearance).toString('base64');
  const artURL='data:text/javascript;base64,'+Buffer.from(art.replace("'./appearance.js'",JSON.stringify(appearanceURL))).toString('base64');
  await page.evaluate(async({url})=>{
    const {portrait}=await import(url);document.querySelector('.bar-heading').hidden=true;const scene=document.querySelector('.scene-frame');
    scene.innerHTML=`<div id="species-contact" style="position:absolute;inset:0;display:grid;grid-template-columns:repeat(6,1fr);grid-template-rows:repeat(3,1fr)">${['cigarette','cigar','toothpick'].flatMap((mouth,row)=>['wolf','fox','hare','bear','raven','stag'].map((skin,i)=>`<div style="min-height:0;position:relative" data-example="${skin}-${mouth}"><div style="height:100%;${row===1?'transform:scaleX(-1)':''}">${portrait(skin,true,{mouth,hat:'none',outfit:['classic','vest','western'][row]})}</div></div>`)).join('')}</div>`;
    scene.querySelectorAll('.portrait').forEach(e=>{e.style.width='100%';e.style.height='100%';});
  },{url:artURL});
  const directions=await page.locator('.mouthwear').evaluateAll(els=>els.map(e=>{const matrix=e.getScreenCTM(),a=new DOMPoint(0,0).matrixTransform(matrix),b=new DOMPoint(54,0).matrixTransform(matrix);return {mouth:e.dataset.mouth,outward:Math.abs(b.x-a.x)>10,above:b.y<a.y};}));
  expect(directions.every(d=>d.outward)).toBe(true);await snap(page,'mouth-species-contact');
  await page.evaluate(async url=>{
    const {executionRig}=await import(url);
    document.querySelector('#species-contact').innerHTML=['cigarette','cigar','toothpick'].flatMap((mouth,row)=>['wolf','fox','hare','bear','raven','stag'].map(skin=>`<div style="min-height:0">${executionRig({skin,appearance:{mouth,outfit:['classic','vest','western'][row]}})}</div>`)).join('');
  },artURL);
  await snap(page,'mouth-execution-contact');
});

test('generated breathing renders locally and ends before the common reveal silence',async({page})=>{
  const source=await readFile('src/audio.js','utf8');await page.goto('http://127.0.0.1:4173/');
  const metrics=await page.evaluate(async source=>{
    const {AudioDirector}=await import('data:text/javascript;base64,'+btoa(source));
    const ctx=new OfflineAudioContext(1,48000*2,48000),a=new AudioDirector();a.ctx=ctx;a.master=ctx.createGain();a.master.gain.value=.45;a.master.connect(ctx.destination);a.breathe();const buffer=await ctx.startRendering(),data=buffer.getChannelData(0);
    const rms=(start,end)=>Math.sqrt(data.slice(start*48000,end*48000).reduce((s,v)=>s+v*v,0)/((end-start)*48000));
    return {inhaleRms:rms(.05,.3),exhaleRms:rms(.4,.9),tailRms:rms(1.1,1.8),peak:Math.max(...data.slice(0,48000))};
  },source);
  expect(metrics.inhaleRms).toBeGreaterThan(.0001);expect(metrics.exhaleRms).toBeGreaterThan(.0001);expect(metrics.tailRms).toBeLessThan(.000001);
  await writeFile(`${out}/breathing-render.json`,JSON.stringify(metrics,null,2));
});
