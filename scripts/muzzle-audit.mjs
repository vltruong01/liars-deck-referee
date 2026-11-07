import {chromium,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {createMatch,KEY} from '../src/engine.js';
const out='docs/final-qa';await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome'}),rows=[];
try {
  for(const [width,height]of [[667,375],[740,360],[844,390],[932,430],[1366,768]]){
    const page=await browser.newPage({viewport:{width,height}});
    await page.clock.install({time:new Date('2026-11-07T00:00:00Z')});await page.clock.pauseAt(new Date('2026-11-07T00:00:01Z'));
    await page.goto('http://127.0.0.1:4173/');
    const s=createMatch([{name:'Muzzle frame',skin:'wolf',appearance:{hat:'top-hat',mouth:'cigar'}},{name:'Other',skin:'hare'}],()=>0);
    await page.evaluate(({s,k})=>localStorage.setItem(k,JSON.stringify(s)),{s,k:KEY});await page.reload();
    await page.locator('[data-execute="p1"]').click({force:true});await page.clock.runFor(992);await page.locator('#fire-button').click({force:true});
    await page.clock.runFor(5650);await expect(page.locator('#result')).toBeEmpty();
    let firstFlash=null;
    for(let elapsed=5658;elapsed<=5826;elapsed+=8){
      await page.clock.runFor(8);const opacity=Number(await page.locator('.muzzle').evaluate(e=>getComputedStyle(e).opacity));
      if(opacity>0){firstFlash={elapsed,opacity};await page.screenshot({path:`${out}/muzzle-${width}x${height}.png`});break;}
    }
    expect(firstFlash).not.toBeNull();expect(firstFlash.elapsed).toBeGreaterThanOrEqual(5700);expect(firstFlash.elapsed).toBeLessThan(5800);
    await page.clock.runFor(100);await expect(page.locator('.muzzle')).toHaveCSS('opacity','0');rows.push({viewport:[width,height],firstFlash,offAfter100ms:true});await page.close();
  }
  await writeFile(`${out}/muzzle-checks.json`,JSON.stringify(rows,null,2));console.log(JSON.stringify(rows));
}finally{await browser.close();}
