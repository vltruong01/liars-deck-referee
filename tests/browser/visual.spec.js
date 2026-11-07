import {test,expect} from '@playwright/test';
import {createMatch,KEY} from '../../src/engine.js';

const players=[
  {name:'Alexandria Longname XXIV',skin:'wolf',appearance:{hat:'top-hat',eyes:'sunglasses',mouth:'cigar',outfit:'vest'}},
  {name:'Rabbit',skin:'hare',appearance:{hat:'cowboy',eyes:'round',mouth:'cigarette',outfit:'western'}},
  {name:'Bear',skin:'bear',appearance:{hat:'mafia',eyes:'monocle'}},
  {name:'Stag',skin:'stag',appearance:{hat:'top-hat',mouth:'toothpick',outfit:'vest'}},
];
for(const [width,height] of [[667,375],[740,360],[844,390],[932,430],[1366,768]])test(`reviewed visual states ${width}x${height}`,async({page})=>{
  await page.setViewportSize({width,height});
  await page.clock.install({time:new Date('2026-11-07T00:00:00Z')});
  await page.clock.pauseAt(new Date('2026-11-07T00:00:01Z'));
  await page.goto('http://127.0.0.1:4173/');await page.clock.runFor(32);
  const snap=async name=>expect(page).toHaveScreenshot(`${name}-${width}x${height}.png`,{
    animations:'allow',caret:'hide',maxDiffPixels:30,
  });
  await snap('setup');
  await page.getByRole('button',{name:'Customize player 1',exact:true}).click({force:true});
  await page.clock.runFor(32);await snap('editor');await page.locator('#style-cancel').click({force:true});
  const state=createMatch(players,()=>5);state.players[1].bullet=0;
  await page.evaluate(({k,s})=>localStorage.setItem(k,JSON.stringify(s)),{k:KEY,s:state});
  await page.reload();await page.clock.runFor(32);await snap('table');
  await page.locator('[data-execute="p1"]').click({force:true});
  await page.clock.runFor(112);await snap('execution-idle');
  await page.clock.runFor(400);await snap('execution-mid-raise');
  await page.clock.runFor(480);await expect(page.locator('#fire-button')).toBeEnabled();await snap('execution-aim');
  await page.locator('#fire-button').click({force:true});await page.clock.runFor(6850);
  await expect(page.locator('#result')).toHaveText('SURVIVED');await snap('survival');
  await page.clock.runFor(2200);await expect(page.locator('#execution')).toBeHidden();await snap('returned-table');
  await page.locator('[data-execute="p2"]').click({force:true});await page.clock.runFor(992);
  await page.locator('#fire-button').click({force:true});await page.clock.runFor(7150);
  await expect(page.locator('.death-x')).toBeVisible();await snap('death-X');
});
