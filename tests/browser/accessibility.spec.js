import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {createMatch,fire,KEY} from '../../src/engine.js';
import {mkdir,writeFile} from 'node:fs/promises';

for(const [width,height] of [[667,375],[740,360],[844,390],[932,430],[1366,768]])test(`axe and keyboard ${width}x${height}`,async({page})=>{
  test.setTimeout(90000);await page.setViewportSize({width,height});
  const scans=[];
  const scan=async state=>{
    const r=await new AxeBuilder({page}).analyze();
    scans.push({state,violations:r.violations});
    await mkdir('docs/final-qa',{recursive:true});await writeFile(`docs/final-qa/axe-${width}x${height}.json`,JSON.stringify(scans,null,2));
    expect(r.violations,`axe ${state}`).toEqual([]);
  };
  await page.goto('http://127.0.0.1:4173/');await scan('setup');
  await page.getByRole('button',{name:'Customize player 1',exact:true}).click();await scan('editor');
  await page.locator('#tab-animal').focus();await page.keyboard.press('ArrowRight');await expect(page.locator('#tab-hat')).toBeFocused();
  await page.keyboard.press('End');await expect(page.locator('#tab-tie')).toBeFocused();await scan('tie-options');
  await page.keyboard.press('Escape');await expect(page.locator('#appearance-dialog')).not.toBeVisible();
  await page.locator('#settings-button').click();await scan('settings');await page.keyboard.press('Escape');
  await page.locator('#how-to').click();await scan('help');await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'START GAME'}).click();await page.waitForTimeout(400);await scan('table');
  await page.locator('#new-match').click();await scan('confirmation');await page.locator('#manage-button').click();await scan('management');await page.keyboard.press('Escape');
  await page.locator('[data-execute="p1"]').click();await expect(page.locator('#fire-button')).toBeEnabled();await scan('execution');
  await page.locator('#fire-button').focus();await page.keyboard.press('Tab');await expect(page.locator('#cancel-execution')).toBeFocused();
  await page.keyboard.press('Escape');await expect(page.locator('#execution')).toBeHidden();
  const state=fire(createMatch([{name:'Fatal guest',skin:'hare'},{name:'Survivor',skin:'bear'}],()=>0),'p1',1);
  await page.evaluate(({k,s})=>localStorage.setItem(k,JSON.stringify(s)),{k:KEY,s:state});await page.reload();
  await expect(page.locator('#return-button')).toBeVisible();await scan('recovered-fatal');
  await page.locator('#return-button').click();await expect(page.locator('#execution')).toBeHidden();await scan('winner');
});
