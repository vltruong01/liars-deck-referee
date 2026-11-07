import {chromium,expect as baseExpect} from '@playwright/test';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {KEY,createMatch} from '../src/engine.js';

const url='https://vltruong01.github.io/liars-deck-referee/';
const expect=baseExpect.configure({timeout:8000});
const liveTimings=[];
async function observeShot(page){await page.evaluate(()=>{window.liveRevealMs=null;const start=performance.now(),view=document.querySelector('#execution');const observer=new MutationObserver(()=>{if(view.dataset.phase==='result'){window.liveRevealMs=performance.now()-start;observer.disconnect();}});observer.observe(view,{attributes:true,attributeFilter:['data-phase']});});}
async function checkTiming(page){const ms=await page.evaluate(()=>window.liveRevealMs);expect(ms).toBeGreaterThan(5500);expect(ms).toBeLessThan(6100);liveTimings.push(ms);}
const out=process.env.QA_OUTPUT_DIR||'docs/execution-qa';await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:false});
try {
  const context=await browser.newContext({viewport:{width:844,height:390},hasTouch:true});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const response=await page.goto(url);expect(response.status()).toBe(200);
  const body=await response.body();expect(body.equals(await readFile('dist/index.html'))).toBe(true);
  await page.locator('#name-0').tap();await expect(page.locator('#name-0')).toBeFocused();
  await page.keyboard.press('ControlOrMeta+A');await page.keyboard.type('Mobile verified');
  await page.getByRole('button',{name:'Customize player 1',exact:true}).click();
  await page.locator('#tab-hat').click();await page.locator('[data-option="top-hat"]').click();
  await page.locator('#tab-eyes').click();await page.locator('[data-option="sunglasses"]').click();
  await page.locator('#tab-outfit').click();await page.locator('[data-option="western"]').click();
  await page.locator('#tab-mouth').click();await page.locator('[data-option="cigar"]').click();
  await page.screenshot({path:`${out}/live-customization.png`});await page.locator('#style-save').click();
  await page.getByRole('button',{name:'START GAME'}).click();await expect(page.locator('.scene-frame')).toHaveCSS('opacity','1');
  await page.screenshot({path:`${out}/live-table.png`});await page.locator('[data-execute="p1"]').click();
  await expect(page.locator('#execution')).toHaveAttribute('data-phase','ready');
  await expect(page.locator('#execution-portrait [data-arm]')).toHaveCount(2);await expect(page.locator('.execution-hud')).toContainText('SHOT 1/6');const overhead=await page.evaluate(()=>{const h=document.querySelector('.execution-hud').getBoundingClientRect(),face=document.querySelector('#execution-portrait .character-head').getBoundingClientRect(),top=Math.min(face.top,...[...document.querySelectorAll('#execution-portrait .headwear')].filter(e=>e.children.length).map(e=>e.getBoundingClientRect().top));return {gap:top-h.bottom,center:Math.abs(h.x+h.width/2-face.x-face.width/2),fontSize:parseFloat(getComputedStyle(document.querySelector('#execution-name')).fontSize)};});expect(overhead.center).toBeLessThan(1);expect(overhead.gap).toBeGreaterThanOrEqual(4);expect(overhead.gap).toBeLessThanOrEqual(12);expect(overhead.fontSize).toBeGreaterThanOrEqual(18);await expect(page.locator('.seat-name')).not.toContainText(['ALIVE','ALIVE','ALIVE','ALIVE']);await page.screenshot({path:`${out}/live-execution.png`});await observeShot(page);await page.locator('#fire-button').click();
  await expect(page.locator('#result')).toContainText(/SURVIVED|DIED/);await expect(page.locator('#result')).toHaveCSS('opacity','1');await checkTiming(page);
  const outcome=await page.locator('#result').innerText();await page.screenshot({path:`${out}/live-result.png`});
  await expect(page.locator('#execution')).toBeHidden({timeout:7000});
  const before=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),KEY);expect(before.players[0].shots).toBe(1);
  await page.locator('#new-match').click();await page.locator('#manage-button').click();await page.locator('[data-customize-player="p1"]').click();
  await page.locator('#tab-eyes').click();await page.locator('[data-option="monocle"]').click();await page.locator('#style-save').click();
  const after=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),KEY);
  expect(after.players[0]).toEqual({...before.players[0],appearance:{...before.players[0].appearance,eyes:'monocle'}});
  await page.getByRole('button',{name:'Close player management'}).click();await page.reload();
  await expect(page.locator('[data-execute="p1"] .eyewear')).toHaveAttribute('data-eyes','monocle');expect(errors).toEqual([]);
  const fatalFixture=createMatch(after.players,()=>0);
  await page.evaluate(({k,s})=>localStorage.setItem(k,JSON.stringify(s)),{k:KEY,s:fatalFixture});await page.reload();await page.locator('[data-execute="p1"]').click();await expect(page.locator('#execution')).toHaveAttribute('data-phase','ready');await observeShot(page);await page.locator('#fire-button').click();
  await expect(page.locator('.death-card')).toContainText('DIED');await expect(page.locator('#result')).toHaveCSS('opacity','1');await checkTiming(page);await expect(page.locator('.death-portrait .eyewear')).toHaveAttribute('data-eyes','monocle');await expect(page.locator('.death-portrait .headwear')).toHaveAttribute('data-hat','top-hat');await expect(page.locator('.death-portrait .upper-arm')).toHaveAttribute('transform','rotate(76 185 224)');await page.screenshot({path:`${out}/live-death.png`});
  await expect(page.locator('#execution')).toBeHidden({timeout:7000});await expect(page.locator('.room-camera')).toHaveCSS('transform','none');await expect(page.locator('[data-execute="p1"]')).toBeDisabled();await expect(page.locator('[data-execute="p1"]')).toContainText('DIED');expect(errors).toEqual([]);
  const evidence={url,httpStatus:response.status(),htmlBytes:body.length,sha256:createHash('sha256').update(body).digest('hex'),matchesVerifiedDist:true,viewport:[844,390],browser:'headed Chrome',typedName:true,customization:true,twoArmRig:true,overheadHud:overhead,compactTableLabels:true,liveFatalFixture:true,customizedDeathReveal:true,stableTableCamera:true,shotCount:1,outcome,automaticReturn:true,suspenseMs:liveTimings,cosmeticEditPreservesProgress:true,persistence:true,errors};
  await writeFile(`${out}/live-verification.json`,JSON.stringify(evidence,null,2));console.log(JSON.stringify(evidence));
} finally {await browser.close();}
