import {chromium} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const out='docs/final-qa';await mkdir(out,{recursive:true});
const label=process.argv[2]||'current';
const browser=await chromium.launch({channel:'chrome'});
try {
  const context=await browser.newContext({viewport:{width:667,height:375}});const page=await context.newPage();
  await page.goto('http://127.0.0.1:4173');
  const results=[];
  const scan=async state=>{const r=await new AxeBuilder({page}).analyze();results.push({state,violations:r.violations});await page.screenshot({path:`${out}/${label}-${state}.png`});console.log(state,r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})));};
  await scan('setup');await page.getByRole('button',{name:'Customize player 1',exact:true}).click();await scan('editor');await page.locator('#style-cancel').click();
  await page.locator('#settings-button').click();await scan('settings');await page.getByRole('button',{name:'DONE'}).click();
  await page.getByRole('button',{name:'START GAME'}).click();await page.waitForTimeout(400);await scan('table');
  await page.locator('[data-execute="p1"]').click();await page.waitForTimeout(1100);await scan('execution');
  await writeFile(`${out}/axe-${label}.json`,JSON.stringify(results,null,2));
}finally {await browser.close();}
