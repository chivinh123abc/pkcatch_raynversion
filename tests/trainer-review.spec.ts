import { test,expect,Page } from '@playwright/test';
import fs from 'node:fs/promises';
async function prepare(page:Page){
  await page.goto('/',{waitUntil:'domcontentloaded'});await page.locator('.battle-stage').waitFor();
  await page.evaluate(async()=>{const url=performance.getEntriesByType('resource').find(e=>e.name.includes('/src/store/useGameStore.ts'))!.name;const {useGameStore:s}=await import(/* @vite-ignore */url);(window as any).__trainerStore=s;s.setState({starterChosen:true,isBattling:false,autoCatch:false});});
}
for(const speed of [1,2,3])test(`trainer intro and send-out gate the first attack at x${speed}`,async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.text().includes('Trainer presentation failed'))errors.push(m.text());});await prepare(page);
  await page.evaluate(speed=>{const s=(window as any).__trainerStore;s.getState().setGameSpeed(speed);s.getState().loadStepNode(13);},speed);
  await expect(page.locator('[data-trainer-intro=trainer]')).toBeVisible();
  await expect.poll(()=>page.locator('.vs-face img').evaluateAll(images=>images.every(img=>(img as HTMLImageElement).naturalWidth>0))).toBe(true);
  await page.evaluate(()=>{const s=(window as any).__trainerStore;s.getState().tickCombat();});
  expect(await page.evaluate(()=>(window as any).__trainerStore.getState().combatEffect)).toBeNull();
  await page.waitForFunction(()=>(window as any).__trainerStore.getState().trainerPresentation?.stage==='sendout');
  expect(await page.evaluate(()=>(window as any).__trainerStore.runtime.phase)).toBe('intro');
  await page.waitForFunction(()=>!(window as any).__trainerStore.getState().trainerPresentation,undefined,{timeout:12000});
  await expect(page.locator('.enemy .battle-sprite')).toBeVisible();await expect(page.locator('.ally .battle-sprite')).toBeVisible();
  await page.waitForFunction(()=>!(window as any).__trainerStore.runtime.busy);
  await page.evaluate(()=>(window as any).__trainerStore.getState().tickCombat());
  await expect.poll(()=>page.evaluate(()=>!!(window as any).__trainerStore.getState().combatEffect)).toBe(true);
  expect(errors).toEqual([]);
});
test('changing speed and opening Team/PC do not restart a trainer intro',async({page})=>{
  await prepare(page);await page.evaluate(()=>{const s=(window as any).__trainerStore;s.getState().setGameSpeed(1);s.getState().loadStepNode(13);});
  const key=await page.evaluate(()=>(window as any).__trainerStore.getState().trainerPresentation.key);
  await page.getByRole('button',{name:'Team/PC',exact:true}).click();await page.evaluate(()=>(window as any).__trainerStore.getState().setGameSpeed(3));
  expect(await page.evaluate(()=>(window as any).__trainerStore.getState().trainerPresentation.key)).toBe(key);
  await page.getByRole('button',{name:'Resume current adventure'}).click();
  await page.waitForFunction(()=>!(window as any).__trainerStore.getState().trainerPresentation,undefined,{timeout:12000});
  await expect(page.locator('.vs-intro')).toHaveCount(0);
});
test('gym reveal can be cancelled by changing node without leaving a late callback',async({page})=>{
  await prepare(page);await page.evaluate(()=>(window as any).__trainerStore.getState().loadStepNode(20));
  await expect(page.locator('[data-trainer-intro=gym]')).toBeVisible();
  const key=await page.evaluate(()=>(window as any).__trainerStore.getState().trainerPresentation.key);
  await page.evaluate(key=>{const s=(window as any).__trainerStore;s.getState().loadStepNode(1);s.getState().finishTrainerIntro(key);s.getState().finishTrainerPresentation(key);},key);
  await expect(page.locator('.boss-intro')).toHaveCount(0);
  expect(await page.evaluate(()=>(window as any).__trainerStore.getState().currentStep)).toBe(1);
  expect(await page.evaluate(()=>(window as any).__trainerStore.getState().trainerPresentation)).toBeNull();
});
test('gym reveal completes before send-out and the next trainer Pokemon waits for its own reveal',async({page})=>{
  await prepare(page);await page.evaluate(()=>{const s=(window as any).__trainerStore;s.getState().setGameSpeed(3);s.getState().loadStepNode(20);});
  await page.waitForFunction(()=>{const info=document.querySelector('.bi-info');return info&&Number(getComputedStyle(info).opacity)>.95;});
  await page.locator('.flash-overlay').waitFor({state:'detached'});
  await fs.mkdir('docs/trainer-review-2026-11-16',{recursive:true});await page.locator('.boss-intro').screenshot({path:'docs/trainer-review-2026-11-16/local-gym.png',animations:'allow'});
  await page.waitForFunction(()=>!(window as any).__trainerStore.getState().trainerPresentation,undefined,{timeout:12000});
  await page.waitForFunction(()=>!(window as any).__trainerStore.runtime.busy);
  await page.evaluate(()=>{const s=(window as any).__trainerStore;s.setState({enemy:{...s.getState().enemy,currentHp:0}});s.getState().tickCombat();});
  await page.waitForFunction(()=>(window as any).__trainerStore.getState().trainerPresentation?.stage==='sendout');
  const state=await page.evaluate(()=>{const s=(window as any).__trainerStore;s.getState().tickCombat();return{index:s.getState().activeTrainer.currentMonIndex,effect:s.getState().combatEffect,phase:s.runtime.phase};});
  expect(state).toEqual({index:1,effect:null,phase:'intro'});
  await page.waitForFunction(()=>!(window as any).__trainerStore.getState().trainerPresentation,undefined,{timeout:12000});
  await expect(page.locator('.enemy .battle-sprite')).toBeVisible();
});
