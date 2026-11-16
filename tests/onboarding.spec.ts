import {test,expect} from '@playwright/test';
import {reachStarter} from './helpers/onboarding';
import fs from 'node:fs/promises';

test('title, Oak dialogue, animated starter and Leaf profile survive reload without resetting progress',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:1440,height:900});await page.goto('/');
 await expect(page.getByRole('dialog',{name:'Poké’Catch Online'})).toBeVisible();
 await expect(page.locator('.game-shell')).toHaveAttribute('inert','');
 await expect(page.locator('.title-walker')).toHaveCount(30);
 const positions=()=>page.locator('.title-walker').evaluateAll(els=>els.map(el=>[el.getBoundingClientRect().x,el.getBoundingClientRect().y]).flat().join(','));
 const before=await positions();await expect.poll(positions,{timeout:6000}).not.toEqual(before);
 await fs.mkdir('docs/onboarding-evidence',{recursive:true});await page.screenshot({path:'docs/onboarding-evidence/local-title-desktop.png'});
 await page.getByRole('button',{name:'How to play',exact:true}).click();await expect(page.getByRole('region',{name:'How to play'})).toBeVisible();await page.keyboard.press('Escape');
 await reachStarter(page,'Leaf','Linh');
 await expect(page.getByRole('button',{name:'Bulbasaur',exact:true})).toBeDisabled();
 const paused=await page.evaluate(async()=>{const {useGameStore:s}=await import('/src/store/useGameStore.ts');return {chosen:s.getState().starterChosen,step:s.getState().currentStep};});expect(paused).toEqual({chosen:false,step:1});
 await page.getByRole('button',{name:'Squirtle',exact:true}).click();
 await expect(page.locator('.lk-slot.on .pokemon-art img')).toHaveAttribute('src',/\.gif$/);
 await page.screenshot({path:'docs/onboarding-evidence/local-starter-desktop.png'});
 await page.getByRole('button',{name:'Choose Squirtle',exact:true}).click();
 await expect(page.locator('.starter-leaving')).toBeVisible();await expect(page.locator('.onboarding-root')).toHaveCount(0);
 const saved=await page.evaluate(async()=>{const {useGameStore:s}=await import('/src/store/useGameStore.ts');s.setState({isBattling:false});s.getState().saveGame(true);return {name:s.getState().trainerName,sprite:s.getState().trainerSprite,id:s.getState().party[0].speciesId};});
 expect(saved).toEqual({name:'Linh',sprite:'leaf',id:7});await page.reload();await expect(page.getByRole('button',{name:'Continue',exact:true})).toBeVisible();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect(page.locator('.onboarding-root')).toHaveCount(0);await expect(page.locator('.side-av img')).toHaveAttribute('src','/assets/trainers/leaf.png');expect(errors).toEqual([]);
});

test('existing save waits on title, account buttons explain local sign-in, Continue resumes combat',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 await expect(page.getByRole('button',{name:'New game',exact:true})).toBeVisible();
 const original=await page.evaluate(async()=>{
  const {useGameStore:s}=await import('/src/store/useGameStore.ts');
  s.getState().chooseStarter(4,{name:'Saved',sprite:'red'});
  const mon={...s.getState().party[0],uid:'keep-pc-mon',speciesId:25};
  s.setState({pcBox:[mon],money:3456,isBattling:true});s.getState().saveGame(true);
  return {party:s.getState().party,pcBox:s.getState().pcBox};
 });
 await page.reload();await expect(page.getByRole('button',{name:'Continue',exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'New game',exact:true})).toHaveCount(0);
 await page.evaluate(async()=>{
  const {useGameStore:s}=await import('/src/store/useGameStore.ts');const tick=s.getState().tickCombat;
  (window as any).__titleBattleTicks=0;
  s.setState({tickCombat:()=>{(window as any).__titleBattleTicks++;tick();}});
 });
 await page.waitForTimeout(1200);
 expect(await page.evaluate(()=>(window as any).__titleBattleTicks)).toBe(0);
 const loaded=await page.evaluate(async()=>{const {useGameStore:s}=await import('/src/store/useGameStore.ts');return {party:s.getState().party,pcBox:s.getState().pcBox,money:s.getState().money};});
 expect(loaded).toEqual({...original,money:3456});
 await page.getByRole('button',{name:'Sign in with Discord',exact:true}).click();
 await expect(page.getByRole('region',{name:'Discord sign-in'})).toContainText('not connected here');
 await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Sign in with Google',exact:true}).click();
 await expect(page.getByRole('region',{name:'Google sign-in'})).toContainText('on this device');
 await page.keyboard.press('Escape');
 await page.setViewportSize({width:390,height:844});
 await expect(page.getByRole('button',{name:'Sign in with Google',exact:true})).toBeInViewport();
 await page.screenshot({path:'docs/onboarding-evidence/local-continue-mobile.png'});
 await page.getByRole('button',{name:'Continue',exact:true}).click();
 await expect(page.locator('.onboarding-root')).toHaveCount(0);
 await expect.poll(()=>page.evaluate(()=>(window as any).__titleBattleTicks)).toBeGreaterThan(0);
});

test('mobile name validation, keyboard focus and reduced motion allow a complete onboarding',async({page})=>{
 await page.setViewportSize({width:360,height:780});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 await page.getByRole('button',{name:'New game',exact:true}).click();
 await expect(page.locator('.chen-text')).toContainText('Hello there!');await page.keyboard.press('Escape');
 await expect(page.getByRole('button',{name:'Confirm',exact:true})).toBeDisabled();await page.getByRole('button',{name:'Red',exact:true}).click();await page.getByRole('button',{name:'Confirm',exact:true}).click();
 const input=page.getByRole('textbox',{name:'Your name'});await input.fill('   ');await expect(page.getByRole('button',{name:'Confirm',exact:true})).toBeDisabled();await input.fill('<Red>');await input.press('Enter');
 await page.getByRole('button',{name:'Next dialogue'}).click();await page.getByRole('button',{name:'Next dialogue'}).click();
 await expect(page.locator('.lk-slot').first()).toBeEnabled();await page.keyboard.press('Escape');
 await expect(page.getByRole('button',{name:'Pikachu',exact:true})).toBeVisible();
 await page.screenshot({path:'docs/onboarding-evidence/local-starter-mobile.png'});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.keyboard.press('Tab');expect(await page.evaluate(()=>!!document.activeElement?.closest('.onboarding-root'))).toBe(true);
 await page.getByRole('button',{name:'Choose Pikachu',exact:true}).click();await expect(page.locator('.onboarding-root')).toHaveCount(0);
 expect(await page.evaluate(async()=>{const {useGameStore:s}=await import('/src/store/useGameStore.ts');return s.getState().party[0].speciesId;})).toBe(25);
});
