import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {createMatch,KEY} from '../../src/engine.js';
const out='docs/execution-qa';
const players=[
  {name:'Alexandria Longname XXIV',skin:'wolf',appearance:{hat:'top-hat',mouth:'cigar',outfit:'vest',eyes:'sunglasses'}},
  {name:'Rabbit',skin:'hare',appearance:{hat:'cowboy',mouth:'cigarette',outfit:'western',eyes:'round'}},
  {name:'Bear',skin:'bear',appearance:{hat:'mafia',outfit:'classic',eyes:'monocle'}},
  {name:'Stag',skin:'stag',appearance:{hat:'top-hat',mouth:'toothpick',outfit:'vest'}},
];
async function joints(page){
  const metrics=await page.locator('.character-rig').evaluate(root=>{
    const arms=root.querySelectorAll('[data-arm]'),upper=root.querySelector('.upper-arm'),fore=root.querySelector('.forearm'),body=upper.parentElement;
    const pt=(el,x,y)=>new DOMPoint(x,y).matrixTransform(el.getScreenCTM());
    const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
    const grip=root.querySelector('.hand-rig');
    const bounds=[...root.querySelectorAll('.arm,.hand-rig,#gun,.headwear,.eyewear,.mouthwear')].filter(e=>e.children.length).map(e=>{
      const b=e.getBBox(),m=e.getScreenCTM();return [[b.x,b.y],[b.x+b.width,b.y],[b.x,b.y+b.height],[b.x+b.width,b.y+b.height]].map(([x,y])=>{const p=new DOMPoint(x,y).matrixTransform(m);return [p.x,p.y];});
    }).flat();
    return {arms:arms.length,visible:[...arms].every(e=>getComputedStyle(e).display!=='none'),shoulderGap:distance(pt(upper,185,224),pt(body,185,224)),elbowGap:distance(pt(upper,222,224),pt(fore,222,224)),oneHierarchy:upper.contains(fore)&&fore.contains(grip)&&grip.contains(root.querySelector('#gun')),bounds,vw:innerWidth,vh:innerHeight};
  });
  expect(metrics.arms).toBe(2);expect(metrics.visible).toBe(true);expect(metrics.oneHierarchy).toBe(true);
  expect(metrics.shoulderGap).toBeLessThan(.1);expect(metrics.elbowGap).toBeLessThan(.1);
  for(const [x,y]of metrics.bounds){expect(x).toBeGreaterThanOrEqual(0);expect(x).toBeLessThanOrEqual(metrics.vw);expect(y).toBeGreaterThanOrEqual(0);expect(y).toBeLessThanOrEqual(metrics.vh);}
  return metrics;
}
for(const [width,height]of [[667,375],[740,360],[844,390],[932,430],[1366,768]])test(`execution continuity ${width}x${height}: two arms, X, repeated stable camera returns`,async({page})=>{
  test.setTimeout(90000);await mkdir(out,{recursive:true});await page.setViewportSize({width,height});
  // Pause the browser clock so actual SVG/GSAP fractional frames are repeatable.
  // Other suites use the real wall clock for suspense/return timing regression.
  await page.clock.install({time:new Date('2026-11-07T00:00:00Z')});await page.clock.pauseAt(new Date('2026-11-07T00:00:01Z'));
  const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4173/');
  const state=createMatch(players,()=>5);state.players[1].bullet=0;state.players[3].bullet=0;
  await page.evaluate(({k,s})=>localStorage.setItem(k,JSON.stringify(s)),{k:KEY,s:state});await page.reload();await page.clock.runFor(32);
  const suffix=`${width}x${height}`,snap=async name=>page.screenshot({path:`${out}/${name}-${suffix}.png`});
  await expect(page.locator('.seat-name')).not.toContainText(['ALIVE','ALIVE','ALIVE','ALIVE']);await snap('table');
  // Cancellation while raising must not enable FIRE for a later guest.
  await page.locator('[data-execute="p1"]').click({force:true});await page.clock.runFor(180);await page.locator('#cancel-execution').click({force:true});await page.clock.runFor(480);
  expect(await page.locator('.room-camera').evaluate(e=>getComputedStyle(e).transform)).toBe('none');
  const checks=[];
  for(let i=0;i<4;i++){
    await page.locator(`[data-execute="p${i+1}"]`).click({force:true});
    await page.clock.runFor(120);await joints(page);if(i===0)await snap('raise-0');
    const poses=[];
    for(const fraction of [25,50,75,100]){
      await page.clock.runFor(200);const m=await joints(page);poses.push(await page.locator('#execution .forearm').getAttribute('transform'));
      if(i===0){await snap(`raise-${fraction}`);checks.push({fraction,shoulderGap:m.shoulderGap,elbowGap:m.elbowGap});}
    }
    await page.clock.runFor(32);await expect(page.locator('#execution')).toHaveAttribute('data-phase','ready');expect(new Set(poses).size).toBe(4);
    await expect(page.locator('#execution-name')).toHaveText(players[i].name);await snap(`ready-p${i+1}`);
    const nameSize=await page.locator('#execution-name').evaluate(e=>parseFloat(getComputedStyle(e).fontSize));expect(nameSize).toBeGreaterThanOrEqual(18);expect(nameSize).toBeLessThanOrEqual(24);
    const overhead=await page.evaluate(()=>{const h=document.querySelector('.execution-hud').getBoundingClientRect(),face=document.querySelector('#execution-portrait .character-head').getBoundingClientRect();const top=Math.min(face.top,...[...document.querySelectorAll('#execution-portrait .headwear')].filter(e=>e.children.length).map(e=>e.getBoundingClientRect().top));return {center:Math.abs(h.x+h.width/2-face.x-face.width/2),gap:top-h.bottom};});
    expect(overhead.center).toBeLessThan(1);expect(overhead.gap).toBeGreaterThanOrEqual(4);expect(overhead.gap).toBeLessThanOrEqual(12);

    await expect(page.locator('#execution-status')).toBeHidden();
    await page.locator('#fire-button').click({force:true});await page.locator('#fire-button').evaluate(e=>e.click());
    await page.clock.runFor(2400);await joints(page);await expect(page.locator('#execution')).toHaveAttribute('data-phase','firing');expect(await page.locator('#result').textContent()).toBe('');
    if(i===0)await snap('suspense');await page.clock.runFor(480);await expect(page.locator('#execution')).toHaveAttribute('data-phase','result');
    const fatal=i===1||i===3;
    await page.clock.runFor(180);await joints(page);if(i<2)await snap(fatal?'fatal-reaction':'blank-reaction');
    if(fatal){await page.clock.runFor(400);if(i===1)await snap('fatal-collapse');await joints(page);await page.clock.runFor(750);}else await page.clock.runFor(1150);await expect(page.locator('#result')).toHaveCSS('opacity','1');
    await expect(page.locator('#return-button')).toBeHidden();
    if(fatal){
      await expect(page.locator('.death-x')).toBeVisible();await expect(page.locator('.death-card')).toContainText('DIED');
      await expect(page.locator('.death-portrait .portrait')).toHaveAttribute('data-skin',players[i].skin);
      await expect(page.locator('.death-portrait .headwear')).toHaveAttribute('data-hat',players[i].appearance.hat);
      // The reaction timeline must never animate the separate reveal portrait.
      await expect(page.locator('.death-portrait .upper-arm')).toHaveAttribute('transform','rotate(76 185 224)');
      await expect(page.locator('.death-portrait .forearm')).toHaveAttribute('transform','rotate(136 222 224)');
      const silhouette=await page.locator('.death-portrait>.portrait').evaluate(svg=>{
        const r=svg.getBoundingClientRect();
        // A transformed group bbox can include empty rotated corners. Sample
        // painted leaf geometry instead of treating those corners as artwork.
        const points=[...svg.querySelectorAll('path,rect,circle,ellipse')].flatMap(e=>{
          if(typeof e.getTotalLength!=='function')return [];
          const n=Math.max(32,Math.ceil(e.getTotalLength()/2)),m=e.getScreenCTM();
          return Array.from({length:n+1},(_,i)=>e.getPointAtLength(e.getTotalLength()*i/n).matrixTransform(m));
        });
        return points.every(p=>p.x>=r.left-1&&p.x<=r.right+1&&p.y>=r.top-1&&p.y<=r.bottom+1);
      });expect(silhouette).toBe(true);
      const box=await page.locator('.death-portrait').boundingBox();expect(Math.abs(box.x+box.width/2-width/2)).toBeLessThan(1);expect(box.y).toBeGreaterThan(43);expect(box.y+box.height).toBeLessThan(height-40);
      if(i===1)await snap('death-X');
    }else await expect(page.locator('.death-x')).toHaveCount(0);
    // Observe every browser animation frame during return, not just its endpoint.
    await page.evaluate(()=>{window.returnFrames=[];const sample=()=>{const view=document.querySelector('#execution'),c=document.querySelector('.room-camera');if(view.dataset.phase==='returning'){const r=c.getBoundingClientRect();window.returnFrames.push({x:r.x,y:r.y,w:r.width,h:r.height,transform:getComputedStyle(c).transform,origin:getComputedStyle(c).transformOrigin});}if(!view.hidden)requestAnimationFrame(sample);};requestAnimationFrame(sample);});
    await page.clock.runFor(fatal?2200:1400);await expect(page.locator('#execution')).toHaveAttribute('data-phase','returning');
    if(i<2)await snap(fatal?'return-fatal-start':'return-blank-start');await page.clock.runFor(160);if(i<2)await snap(fatal?'return-fatal-middle':'return-blank-middle');
    await page.clock.runFor(500);await expect(page.locator('#execution')).toBeHidden();
    const frames=await page.evaluate(()=>window.returnFrames);expect(frames.length).toBeGreaterThan(20);expect(frames.every(f=>f.transform==='none')).toBe(true);
    for(const f of frames)for(const key of ['x','y','w','h'])expect(f[key]).toBeCloseTo(frames[0][key],3);
    checks.push({player:i+1,fatal,returnFrames:frames.length,stableCamera:true});
    const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);expect(saved.players[i].shots).toBe(1);expect(saved.pending).toBeNull();
    if(fatal){await expect(page.locator(`[data-execute="p${i+1}"]`)).toBeDisabled();await expect(page.locator(`[data-execute="p${i+1}"]`)).toContainText('DIED');}
    await expect(page.locator('.room-camera')).toHaveCSS('transform','none');if(i<2)await snap(fatal?'stable-fatal-table':'stable-blank-table');
    const overflow=await page.evaluate(()=>({w:document.documentElement.scrollWidth-innerWidth,h:document.documentElement.scrollHeight-innerHeight}));expect(overflow.w).toBeLessThanOrEqual(0);expect(overflow.h).toBeLessThanOrEqual(0);
  }
  expect(errors).toEqual([]);await writeFile(`${out}/checks-${suffix}.json`,JSON.stringify({viewport:[width,height],checks,errors},null,2));
});

test('reduced effects retain suspense and customized death without camera movement or flash',async({page})=>{
  await page.setViewportSize({width:740,height:360});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.clock.install({time:new Date('2026-11-07T00:00:00Z')});await page.clock.pauseAt(new Date('2026-11-07T00:00:01Z'));
  await page.goto('http://127.0.0.1:4173/');
  await page.evaluate(({k,s})=>{localStorage.setItem(k,JSON.stringify(s));localStorage.setItem('liars-deck.settings',JSON.stringify({volume:0,reducedMotion:true,reducedFlashing:true}));},{k:KEY,s:createMatch(players,()=>0)});await page.reload();
  await page.locator('[data-execute="p1"]').click({force:true});await page.clock.runFor(180);await joints(page);await expect(page.locator('#fire-button')).toBeEnabled();
  await page.locator('#fire-button').click({force:true});await page.clock.runFor(2800);await expect(page.locator('#execution')).toHaveAttribute('data-phase','firing');
  await page.clock.runFor(100);await expect(page.locator('#execution')).toHaveAttribute('data-phase','result');
  await expect(page.locator('.impact')).toHaveCSS('opacity','0');await expect(page.locator('.muzzle')).toHaveCSS('opacity','0');
  expect(await page.locator('.execution-stage').evaluate(e=>{const m=new DOMMatrixReadOnly(getComputedStyle(e).transform);return [m.a,m.d,m.e,m.f];})).toEqual([1,1,0,0]);
  await page.clock.runFor(1350);await expect(page.locator('.death-x')).toBeVisible();await expect(page.locator('#result')).toHaveCSS('opacity','1');await page.screenshot({path:`${out}/reduced-death.png`});
  await page.clock.runFor(2600);await expect(page.locator('#execution')).toBeHidden();await expect(page.locator('.room-camera')).toHaveCSS('transform','none');
});
