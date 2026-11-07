import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {createMatch,KEY} from '../../src/engine.js';
import {choices} from '../../src/appearance.js';

const sizes=[[667,375],[740,360],[844,390],[932,430],[1366,768]];
const looks=[
  {skin:'wolf',hat:'top-hat',eyes:'sunglasses',mouth:'cigar',suit:'forest',tie:'gold',bow:true},
  {skin:'hare',hat:'cowboy',eyes:'round',mouth:'cigarette',suit:'wine',tie:'ivory'},
  {skin:'fox',hat:'cap',eyes:'monocle',mouth:'toothpick',suit:'navy',tie:'teal'},
  {skin:'bear',hat:'mafia',eyes:'eyepatch',mouth:'none',suit:'ivory',tie:'wine'},
];
const out='docs/mobile-qa';
async function screenshot(page,name){await mkdir(out,{recursive:true});await page.screenshot({path:`${out}/${name}.png`});}
async function bounds(page,selector,min=0){
  const list=await page.locator(selector).evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,vw:innerWidth,vh:innerHeight,id:el.id||el.className.baseVal||el.className};}));
  expect(list.length).toBeGreaterThan(0);
  for(const r of list){expect(r.x,r.id).toBeGreaterThanOrEqual(-1);expect(r.y,r.id).toBeGreaterThanOrEqual(-1);expect(r.x+r.w,r.id).toBeLessThanOrEqual(r.vw+1);expect(r.y+r.h,r.id).toBeLessThanOrEqual(r.vh+1);expect(r.w,r.id).toBeGreaterThanOrEqual(min);expect(r.h,r.id).toBeGreaterThanOrEqual(min);}
}
async function noScroll(page,selectors){
  const values=await page.locator(selectors).evaluateAll(els=>els.map(e=>({id:e.id||e.className,sw:e.scrollWidth,cw:e.clientWidth,sh:e.scrollHeight,ch:e.clientHeight})));
  for(const e of values){expect(e.sw,`${e.id} horizontal`).toBeLessThanOrEqual(e.cw+1);expect(e.sh,`${e.id} vertical`).toBeLessThanOrEqual(e.ch+1);}
}
async function silhouette(page,selector){
  const violations=await page.locator(selector).evaluateAll(svgs=>svgs.flatMap(svg=>{
    const box=svg.getBoundingClientRect();
    return [...svg.querySelectorAll('.headwear,.eyewear,.mouthwear')].filter(g=>g.children.length).flatMap(g=>{
      const b=g.getBBox(),m=g.getScreenCTM();
      const points=[[b.x,b.y],[b.x+b.width,b.y],[b.x,b.y+b.height],[b.x+b.width,b.y+b.height]].map(([x,y])=>new DOMPoint(x,y).matrixTransform(m));
      return points.some(p=>p.x<box.left-1||p.x>box.right+1||p.y<box.top-1||p.y>box.bottom+1)?[g.outerHTML.slice(0,100)]:[];
    });
  }));expect(violations).toEqual([]);
}
for(const [width,height] of sizes)test(`customization ${width}x${height}: four independent looks, rig, results and persistence`,async({page})=>{
  test.setTimeout(90000);await page.setViewportSize({width,height});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/');await page.evaluate(()=>localStorage.clear());await page.reload();
  const suffix=`${width}x${height}`;
  for(let i=0;i<4;i++){
    await page.locator(`#name-${i}`).fill(['Alexandria Longname XXIV','Rabbit','Fox','Bear'][i]);
    await page.getByRole('button',{name:`Customize player ${i+1}`,exact:true}).click();
    const look=looks[i];
    for(const [category,value] of Object.entries({animal:look.skin,hat:look.hat,eyes:look.eyes,mouth:look.mouth,suit:look.suit,tie:look.tie})){
      await page.locator(`#tab-${category}`).click();await page.locator(`[data-option="${value}"]`).click();
      await bounds(page,'.style-tabs button, .style-option, #style-save, #style-random, #style-cancel',44);
      await noScroll(page,'#appearance-dialog, .editor-body, .editor-controls, #style-options');
    }
    if(look.bow)await page.locator('#style-bow').click();
    await silhouette(page,'#style-preview .portrait');
    if(i===0)await screenshot(page,`customization-${suffix}`);
    await page.locator('#style-save').click();
  }
  await screenshot(page,`setup-${suffix}`);await page.reload();for(let i=0;i<4;i++)await expect(page.locator(`.setup-player:nth-child(${i+1}) .headwear`)).toHaveAttribute('data-hat',looks[i].hat);await page.getByRole('button',{name:'START GAME'}).click();
  await expect(page.locator('.scene-frame')).toHaveCSS('opacity','1');
  await bounds(page,'.seat, .seat .portrait, .seat-name');await silhouette(page,'.seat .portrait');
  await noScroll(page,'html, body, .game-shell, #app, .bar-page, .scene');
  await screenshot(page,`table-${suffix}`);
  const saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),KEY);
  for(let i=0;i<4;i++){
    expect(saved.players[i].appearance).toMatchObject({hat:looks[i].hat,eyes:looks[i].eyes,mouth:looks[i].mouth});
    const seat=page.locator(`[data-execute="p${i+1}"]`);await expect(seat.locator('.headwear')).toHaveAttribute('data-hat',looks[i].hat);
    await seat.click();await screenshot(page,`selection-p${i+1}-${suffix}`);
    await expect(page.locator('#execution')).toHaveAttribute('data-phase','ready');
    await expect(page.locator('#execution-portrait .headwear')).toHaveAttribute('data-hat',looks[i].hat);
    await silhouette(page,'#execution-portrait .portrait');await bounds(page,'.character-rig, #gun, #execution-name');
    await screenshot(page,`execution-p${i+1}-${suffix}`);
    await page.locator('#cancel-execution').click();await expect(page.locator('#execution')).toBeHidden();
  }
  await page.reload();expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).players.map(p=>p.appearance),KEY)).toEqual(saved.players.map(p=>p.appearance));
  for(const fatal of [false,true]){
    const fixture=createMatch(saved.players,()=>fatal?0:5);
    await page.evaluate(({key,state})=>localStorage.setItem(key,JSON.stringify(state)),{key:KEY,state:fixture});await page.reload();
    await page.locator('[data-execute="p1"]').click();await expect(page.locator('#execution')).toHaveAttribute('data-phase','ready');
    await page.locator('#fire-button').click();await page.locator('#fire-button').evaluate(b=>b.click());
    await expect(page.locator('#result')).toContainText(fatal?'ELIMINATED':'SURVIVED');await expect(page.locator('#result')).toHaveCSS('opacity','1');
    const revealed=Date.now();await silhouette(page,'#execution-portrait .portrait');await bounds(page,'#result, #return-button');
    await screenshot(page,`${fatal?'elimination':'survival'}-${suffix}`);
    expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).players[0].shots,KEY)).toBe(1);
    await expect(page.locator('#execution')).toBeHidden({timeout:7000});expect(Date.now()-revealed).toBeGreaterThanOrEqual(2000);
    if(!fatal){
      const progress=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),KEY);
      await page.locator('#manage-button').click();await page.locator('[data-customize-player="p1"]').click();
      await page.locator('#tab-hat').click();await page.locator('[data-option="fedora"]').click();await page.locator('#style-save').click();
      const edited=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),KEY);
      expect(edited.players[0]).toEqual({...progress.players[0],appearance:{...progress.players[0].appearance,hat:'fedora'}});expect(edited.players.slice(1)).toEqual(progress.players.slice(1));expect(edited.nextShot).toBe(progress.nextShot);
      await bounds(page,'#manage-list input, .manage-actions button',44);await noScroll(page,'#manage-dialog');
      await page.getByRole('button',{name:'Close player management'}).click();await page.reload();
      await expect(page.locator('[data-execute="p1"] .headwear')).toHaveAttribute('data-hat','fedora');
    }
  }
  expect(errors).toEqual([]);await writeFile(`${out}/checks-${suffix}.json`,JSON.stringify({viewport:[width,height],players:4,independentLooks:true,accessoryBounds:true,allSeats:true,bothResults:true,autoReturn:true,progressPreserved:true,errors},null,2));
});

test('all six animals fit every hat; randomize and cancel do not mutate saved players',async({page})=>{
  test.setTimeout(60000);await page.setViewportSize({width:667,height:375});
  await page.goto('http://127.0.0.1:4173/');await page.evaluate(()=>localStorage.clear());await page.reload();
  await page.getByRole('button',{name:'Customize player 1',exact:true}).click();
  for(const skin of ['wolf','fox','hare','bear','raven','stag']){
    await page.locator('#tab-animal').click();await page.locator(`[data-option="${skin}"]`).click();
    await page.locator('#tab-eyes').click();await page.locator('[data-option="round"]').click();
    await page.locator('#tab-mouth').click();await page.locator('[data-option="cigar"]').click();
    await page.locator('#tab-hat').click();
    for(const hat of choices.hat){await page.locator(`[data-option="${hat}"]`).click();await silhouette(page,'#style-preview .portrait');}
    await page.locator('[data-option="top-hat"]').click();await screenshot(page,`species-${skin}-667x375`);
  }
  await page.locator('#style-random').click();await silhouette(page,'#style-preview .portrait');
  await page.locator('#style-cancel').click();
  await expect(page.locator('.setup-player').first().locator('.portrait')).toHaveAttribute('data-skin','wolf');
  await expect(page.locator('.setup-player').first().locator('.headwear')).toHaveAttribute('data-hat','none');
  expect(await page.evaluate(key=>localStorage.getItem(key),KEY)).toBeNull();
});
