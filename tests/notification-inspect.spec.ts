import {test,expect} from '@playwright/test';
import fs from 'node:fs/promises';

test('collection selection and capture typography match the native measurements',async({page})=>{
 test.setTimeout(60000);
 await page.setViewportSize({width:1440,height:900});await page.goto('/');await page.locator('.battle-stage').waitFor();
 await page.evaluate(async()=>{const {useGameStore:s}=await import('/src/store/useGameStore.ts');(window as any).__noticeStore=s;s.setState({starterChosen:true,isBattling:false,newCatchCard:null});});
 const native=JSON.parse(await fs.readFile('docs/notification-inspect-evidence/reference.json','utf8'));
 const local:any={};
 for(const screen of ['team','pokedex']){
  await page.getByRole('button',{name:screen==='team'?'Team/PC':'Pokédex',exact:true}).click();
  await page.mouse.move(0,0);
  await expect(page.locator('.side-nav-btn.active')).toHaveCSS('transition-duration','0s');
  local[screen]=await page.locator('.side-nav-btn.active').evaluate(el=>({style:Object.fromEntries(['fontFamily','textShadow','boxShadow','backgroundColor','borderWidth'].map(p=>[p,getComputedStyle(el)[p]])),before:Object.fromEntries(['boxShadow','backgroundColor','content'].map(p=>[p,getComputedStyle(el,'::before')[p]])),after:Object.fromEntries(['boxShadow','backgroundColor','content'].map(p=>[p,getComputedStyle(el,'::after')[p]]))}));
  await page.locator('.side-nav-btn.active').hover();
  const hover=await page.locator('.side-nav-btn.active').evaluate(el=>({transform:getComputedStyle(el).transform,face:getComputedStyle(el,'::after').backgroundImage,shadow:getComputedStyle(el,'::before').backgroundColor}));
  expect(hover.transform).toBe(native.screens[screen].hover.style.transform);expect(hover.face).toBe(native.screens[screen].hover.after.backgroundImage);expect(hover.shadow).toBe(native.screens[screen].hover.before.backgroundColor);
  await page.mouse.move(0,0);
 }
 await page.evaluate(async()=>{const s=(window as any).__noticeStore,{createPokemonInstance}=await import('/src/game/domain/pokemon.ts');s.setState({pcBox:[createPokemonInstance(25,5,true,s.runtime)],pokedexCaught:[4,25],pokedexSeen:[4,25],newCatchCard:{speciesId:25,level:5,isShiny:true,isNew:true,destination:'pc'}});});
 await expect(page.getByRole('dialog')).toBeVisible();
 local.capture=await page.evaluate(()=>Object.fromEntries(['.replica-modal-backdrop','.modal','.dc-head h2','.dc-new','.genus','.dc-fact','.dc-fact b','.flavor','.modal-actions .btn'].map(sel=>{const el=document.querySelector(sel)!;return [sel,Object.fromEntries(['fontFamily','fontSize','fontWeight','lineHeight','color','textShadow','boxShadow','backgroundColor','backdropFilter','borderWidth','borderRadius','padding'].map(p=>[p,getComputedStyle(el)[p]]))];})));
 await fs.mkdir('docs/notification-inspect-evidence',{recursive:true});await fs.writeFile('docs/notification-inspect-evidence/local.json',JSON.stringify(local,null,2));
 for(const screen of ['team','pokedex']){
  const target=native.screens[screen]['.side-nav>button.active'];
  for(const part of ['style','before','after'])for(const [key,value]of Object.entries(local[screen][part]))expect(value,`${screen} ${part} ${key}`).toBe(target[part][key]);
 }
 for(const [selector,actual]of Object.entries(local.capture)){
  const target=native.capture[selector==='.replica-modal-backdrop'?'.modal-root':selector].style;
  for(const [key,value]of Object.entries(actual as object))expect(value,`${selector} ${key}`).toBe(target[key]);
 }
 await expect(page.locator('.dc-new')).toHaveCount(1);await expect(page.locator('.dc-head .shiny-mk')).toHaveCount(1);
 await page.screenshot({path:'docs/notification-inspect-evidence/local-capture.png'});
});

test('Team/PC only notifies new shinies without an OT, independently of the Dex',async({page})=>{
 await page.goto('/');await page.locator('.battle-stage').waitFor();
 await page.evaluate(async()=>{
  const {RARITY_TEST_MARKER}=await import('/src/game/runtime/rarityTestSave.ts');localStorage.setItem(RARITY_TEST_MARKER,'done');
  const {useGameStore:s}=await import('/src/store/useGameStore.ts');(window as any).__noticeStore=s;
  const m=s.getState().party[0];s.setState({starterChosen:true,isBattling:false,pcBox:[{...m,uid:'regular',isShiny:false}],teamReviewedUids:[],pokedexCaught:[4,25],dexNotifiedSpecies:[]});
 });
 const team=page.getByRole('button',{name:'Team/PC',exact:true}),dex=page.getByRole('button',{name:'Pokédex',exact:true});
 await expect(team.locator('.sidebar-collection-unread')).toHaveCount(0);await expect(dex.locator('.sidebar-collection-unread')).toHaveText('2');
 await page.evaluate(()=>{const s=(window as any).__noticeStore,m=s.getState().party[0];s.setState({pcBox:[...s.getState().pcBox,{...m,uid:'shiny-pc',isShiny:true,caughtAt:Date.now()},{...m,uid:'traded-shiny',isShiny:true,ot:'Other#1',caughtAt:Date.now()},{...m,uid:'unknown-date',isShiny:true,caughtAt:undefined}]});});
 await expect(team.locator('.sidebar-collection-unread')).toHaveText('1');
 await page.evaluate(()=>{const s=(window as any).__noticeStore,m=s.getState().party[0];s.setState({party:[...s.getState().party,{...m,uid:'shiny-party',isShiny:true,caughtAt:Date.now()}]});});
 await expect(team.locator('.sidebar-collection-unread')).toHaveText('2');
 await dex.click();await expect(dex.locator('.sidebar-collection-unread')).toHaveCount(0);await expect(team.locator('.sidebar-collection-unread')).toHaveText('2');
 await team.click();await expect(team.locator('.sidebar-collection-unread')).toHaveCount(0);
 await page.reload();await expect(page.locator('.battle-stage')).toBeAttached();await expect(page.locator('.sidebar-collection-unread')).toHaveCount(0);
});

test('Dex base bars use the native scale without a shiny extension',async({page})=>{
 await page.goto('/');await page.locator('.battle-stage').waitFor();
 await page.evaluate(async()=>{const {useGameStore:s}=await import('/src/store/useGameStore.ts');s.setState({starterChosen:true,isBattling:false,pokedexSeen:[4],pokedexCaught:[4]});});
 await page.getByRole('button',{name:'Pokédex',exact:true}).click();await page.getByRole('button',{name:'Number 4, Charmander, caught',exact:true}).click();
 await page.locator('.inspect-stats summary').click();
 await expect(page.locator('.statbars .shiny')).toHaveCount(0);await expect(page.locator('.statbars b')).toHaveText(['39','52','43','60','50','65']);
 await expect(page.locator('.statbars .bar i').first()).toHaveAttribute('style',/width: 24.375%/);
 await expect(page.locator('.statbars')).toHaveCSS('--nw','25cqw');
});
