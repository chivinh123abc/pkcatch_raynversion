import {test,expect,Page} from '@playwright/test';
import fs from 'node:fs/promises';

async function fixture(page:Page){
 await page.setViewportSize({width:1440,height:900});
 await page.goto('/');await page.locator('.battle-stage').waitFor();
 await page.evaluate(async()=>{
  const {useGameStore:store}=await import('/src/store/useGameStore.ts');
  (window as any).__strictStore=store;
  store.setState({starterChosen:true,isBattling:false,gameSpeed:3,newCatchCard:null,pendingAdventureGift:null,badges:['boulder-badge'],completedChapters:['kanto-1']});
  store.getState().selectChapter('kanto-2');
 });
}

test('inspect reproduces native stat segments, full history and separate move drawer',async({page})=>{
 await fixture(page);
 await page.evaluate(async()=>{
  const store=(window as any).__strictStore,{createPokemonInstance}=await import('/src/game/domain/pokemon.ts');
  const mon=createPokemonInstance(130,100,true,store.runtime);
  Object.assign(mon,{caughtAt:new Date('2026-11-11T00:00:00Z').getTime(),where:'Cycling Road',how:'wild',wins:5363});
  store.setState({party:[mon],pcBox:[],buddy:{uid:mon.uid,ko:0},pokedexSeen:[129,130],pokedexCaught:[130]});
 });
 await page.getByRole('button',{name:'Team/PC',exact:true}).click();await page.getByRole('button',{name:'Team Gyarados, level 100',exact:true}).click();
 const dialog=page.locator('.replica-inspect');
 const moveLabel=dialog.locator('.dc-move>span').first();
 await expect(moveLabel).not.toContainText('›');
 expect(await moveLabel.evaluate(el=>getComputedStyle(el,'::after').content)).toBe('" ›"');
 await dialog.locator('.inspect-stats summary').click();await dialog.locator('.inspect-history summary').click();
 await expect(dialog.locator('.statbars.real b')).toHaveText(['907/907','280','179','137','225','183']);
 await expect(dialog.locator('.statbars.real .shiny')).toHaveCount(6);
 await expect(dialog.locator('.statbars.real .bar').first().locator('i').first()).toHaveAttribute('style',/width: 59.375%/);
 await expect(dialog.locator('.dc-history .dc-fact b')).toHaveText(['Nov 11, 2026','Cycling Road','Caught in the wild','You','5,363']);
 await expect(dialog.locator('button.evo,.replica-mon-actions,.inspect-learnset')).toHaveCount(0);
 await fs.mkdir('docs/strict-parity-evidence',{recursive:true});await page.screenshot({path:'docs/strict-parity-evidence/local-inspect.png'});
 await dialog.getByRole('button',{name:'Move details'}).click();await expect(page.getByRole('dialog',{name:'Moves',exact:true})).toBeVisible();
 await expect(page.locator('.mvd-road .done')).not.toHaveCount(0);await page.keyboard.press('Escape');await expect(page.locator('.mvd-root')).toHaveCount(0);await expect(dialog).toBeVisible();
});

test('fossils use native arena choice, require confirmation, snapshot speed and grant once',async({page})=>{
 await fixture(page);
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&m.text().includes('Native gift'))errors.push(m.text());});
 await page.evaluate(async()=>{const s=(window as any).__strictStore,{currentChapter}=await import('/src/game/data/chapterSelectors.ts');s.getState().loadStepNode(currentChapter(s.getState()).steps.find(n=>n.gift?.key==='fossil')!.step);});
 const effect=page.locator('.battle-stage .item-choice.native-gift');await expect(effect).toBeVisible();await expect(effect).toHaveClass(/ready/,{timeout:15000});
 await expect(effect.locator('.ic-go')).toBeDisabled();
 await effect.getByRole('button',{name:'Dome Fossil',exact:true}).click();await expect(effect.locator('.ic-go')).toHaveText('Choose Dome Fossil');
 expect(await page.evaluate(()=>(window as any).__strictStore.getState().items['dome-fossil']||0)).toBe(0);
 await page.evaluate(()=>{(window as any).__giftRoot=document.querySelector('.item-choice');(window as any).__strictStore.setState({gameSpeed:1});});
 expect(await page.evaluate(()=>(window as any).__giftRoot===document.querySelector('.item-choice'))).toBe(true);
 await page.screenshot({path:'docs/strict-parity-evidence/local-fossil.png'});
 await effect.locator('.ic-go').click();await expect(effect).toHaveCount(0,{timeout:10000});
 const result=await page.evaluate(()=>{const s=(window as any).__strictStore;s.getState().chooseAdventureGift('helix-fossil');return {items:s.getState().items,gifts:s.getState().gifts};});
 expect(result.items['dome-fossil']).toBe(1);expect(result.items['helix-fossil']||0).toBe(0);expect(result.gifts.filter((key:string)=>key==='fossil')).toHaveLength(1);expect(errors).toEqual([]);
});

test('gift Pokemon uses native LinkFx and cancelled presentation cannot grant rewards',async({page})=>{
 test.setTimeout(40000);await fixture(page);
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&m.text().includes('Native gift'))errors.push(m.text());});
 await page.evaluate(async()=>{const s=(window as any).__strictStore,{currentChapter}=await import('/src/game/data/chapterSelectors.ts');s.getState().loadStepNode(currentChapter(s.getState()).steps.find(n=>n.gift?.key==='magikarp')!.step);});
 const effect=page.locator('.native-gift.lk-fx');await expect(effect).toBeVisible();
 await expect(effect.locator('.lk-mon img')).toBeVisible({timeout:15000});
 await expect(effect.locator('.rc-tap')).toHaveCSS('opacity','1',{timeout:10000});
 await page.screenshot({path:'docs/strict-parity-evidence/local-gift-pokemon.png'});
 await effect.locator('.rc-tap').dispatchEvent('pointerdown');await expect(effect).toHaveCount(0,{timeout:5000});
 expect(await page.evaluate(()=>(window as any).__strictStore.getState().gifts)).toContain('magikarp');
 await page.evaluate(async()=>{const s=(window as any).__strictStore;s.setState({newCatchCard:null,gifts:s.getState().gifts.filter((key:string)=>key!=='magikarp')});const {currentChapter}=await import('/src/game/data/chapterSelectors.ts');s.getState().loadStepNode(currentChapter(s.getState()).steps.find(n=>n.gift?.key==='magikarp')!.step);});
 await expect(effect).toBeVisible();await page.evaluate(()=>(window as any).__strictStore.getState().loadStepNode(1));await expect(effect).toHaveCount(0);expect(errors).toEqual([]);
});

test('native multi-Pokemon gift waits for selection and confirmation',async({page})=>{
 test.setTimeout(45000);await fixture(page);
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&m.text().includes('Native gift'))errors.push(m.text());});
 await page.evaluate(()=>{const s=(window as any).__strictStore;s.setState({pendingAdventureGift:{key:'dojo',choices:[106,107],level:42,text:'Pick a Pokémon!'}});});
 const effect=page.locator('.native-gift.lk-choice');await expect(effect).toBeVisible();await expect(effect.locator('.lk-go')).toBeVisible({timeout:20000});await expect(effect.locator('.lk-go')).toBeDisabled();
 await effect.locator('.lk-slot').last().click();await expect(effect.locator('.lk-go')).toHaveText('Choose Hitmonchan');
 await expect(effect.locator('.lk-say')).toContainText('Hitmonchan');
 const placement=await effect.evaluate(root=>{const go=root.querySelector('.lk-go')!.getBoundingClientRect(),box=root.querySelector('.lk-box')!.getBoundingClientRect();return {go:go.top,box:box.bottom};});expect(placement.go).toBeGreaterThanOrEqual(placement.box);
 expect(await page.evaluate(()=>(window as any).__strictStore.getState().gifts)).not.toContain('dojo');
 await page.screenshot({path:'docs/strict-parity-evidence/local-gift-choice.png'});
 await effect.locator('.lk-go').click();await expect(effect).toHaveCount(0,{timeout:10000});
 expect(await page.evaluate(()=>(window as any).__strictStore.getState().gifts)).toContain('dojo');expect(errors).toEqual([]);
});

test('reduced-motion gift keeps the native fallback and never grants on first selection',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await fixture(page);
 await page.evaluate(()=>{const s=(window as any).__strictStore;s.setState({pendingAdventureGift:{key:'fossil',items:['dome-fossil','helix-fossil'],text:'Pick a fossil!'}});});
 const dialog=page.getByRole('dialog',{name:'Adventure gift'});await expect(dialog).toBeVisible();await expect(dialog).not.toHaveAttribute('inert','');
 await dialog.getByRole('button',{name:'dome fossil',exact:true}).click();await expect(dialog.locator('.gift-go')).toHaveText('Choose Dome Fossil');
 expect(await page.evaluate(()=>(window as any).__strictStore.getState().items['dome-fossil']||0)).toBe(0);
 await dialog.locator('.gift-go').click();await expect(dialog).toHaveCount(0);expect(await page.evaluate(()=>(window as any).__strictStore.getState().items['dome-fossil'])).toBe(1);
});
