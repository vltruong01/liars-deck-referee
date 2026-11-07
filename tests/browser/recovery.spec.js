import {test,expect} from '@playwright/test';
import {createMatch,KEY} from '../../src/engine.js';

for(const fatal of [false,true])test(`reload during extended suspense preserves ${fatal?'fatal':'blank'} shot`,async({page})=>{
  await page.setViewportSize({width:844,height:390});await page.clock.install();await page.clock.pauseAt(new Date());
  await page.goto('http://127.0.0.1:4173/');
  const state=createMatch([{name:'Guest',skin:'raven'},{name:'Other',skin:'stag'}],()=>fatal?0:5);
  await page.evaluate(({k,s})=>localStorage.setItem(k,JSON.stringify(s)),{k:KEY,s:state});await page.reload();
  await page.locator('[data-execute="p1"]').click({force:true});await page.clock.runFor(992);
  await page.locator('#fire-button').click({force:true});await page.clock.runFor(5650);
  await expect(page.locator('#execution')).toHaveAttribute('data-phase','firing');await expect(page.locator('#result')).toBeEmpty();
  const pending=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
  expect(pending.players[0].shots).toBe(1);expect(pending.pending.fatal).toBe(fatal);
  await page.reload();await page.clock.runFor(400);await expect(page.locator('#result')).toContainText(fatal?'DIED':'SURVIVED');
  await expect(page.locator('#result')).toContainText('SAVED RESULT');await expect(page.locator('#return-button')).toBeVisible();
  expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY)).toEqual(pending);
  await page.locator('#return-button').click({force:true});await page.clock.runFor(500);
  await expect(page.locator('#execution')).toBeHidden();
  const restored=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
  expect(restored.players).toEqual(pending.players);expect(restored.nextShot).toBe(pending.nextShot);expect(restored.pending).toBeNull();
  await page.reload();await expect(page.locator('.seat')).toHaveCount(2);
});
