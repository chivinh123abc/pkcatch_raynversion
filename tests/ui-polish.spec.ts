import {test,expect} from '@playwright/test';
import fs from 'node:fs/promises';

test('collection typography, type badges and surfaces match the pinned native screen',async({page})=>{
 test.setTimeout(60000);
 await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:1440,height:900});await page.goto('/');
 await expect(page.getByRole('button',{name:'New game',exact:true})).toBeVisible();
 await page.evaluate(async()=>{
  const {useGameStore:s}=await import('/src/store/useGameStore.ts');
  const {createPokemonInstance}=await import('/src/game/domain/pokemon.ts');
  const mons=[4,7,1,25,149,144,19,20,3,150].map((id,i)=>createPokemonInstance(id,20,i===3,s.runtime));
  s.setState({starterChosen:true,isBattling:false,party:mons.slice(0,6),pcBox:mons.slice(6),pokedexCaught:mons.map(m=>m.speciesId),pokedexSeen:[...mons.map(m=>m.speciesId),2]});
 });
 const native=JSON.parse(await fs.readFile('docs/ui-polish-evidence/reference.json','utf8'));
 const comparisons:any[]=[];
 for(const screen of ['team','pokedex']){
  await page.getByRole('button',{name:screen==='team'?'Team/PC':'Pokédex',exact:true}).click();
  const selectors=Object.entries(native.screens[screen]).filter(([,value])=>value).map(([key])=>key);
  const actual=await page.locator('#screen-'+screen).evaluate((root,selectors)=>Object.fromEntries(selectors.map(sel=>{const el=root.querySelector(sel);return [sel,el?Object.fromEntries(['fontFamily','fontSize','fontWeight','lineHeight','color','backgroundColor','backgroundImage','borderTopColor','borderTopWidth','borderRadius','boxShadow','textShadow','opacity'].map(p=>[p,(getComputedStyle(el) as any)[p]])):null];})),selectors);
  for(const sel of selectors)for(const [prop,want] of Object.entries(native.screens[screen][sel].style)){
   if(prop==='borderTopColor'&&native.screens[screen][sel].style.borderTopWidth==='0px')continue;
   if(sel==='.dex-ring'&&prop==='backgroundImage')continue; // Clone progress is intentionally 151, native now 649.
   if(actual[sel]?.[prop]!==want)comparisons.push({screen,sel,prop,want,actual:actual[sel]?.[prop]});
  }
  await page.screenshot({path:`docs/ui-polish-evidence/local-${screen}.png`});
 }
 await fs.writeFile('docs/ui-polish-evidence/style-diff.json',JSON.stringify(comparisons,null,2));
 console.log('Native style differences:',comparisons.length);
 expect(comparisons).toEqual([]);
 // All eighteen native colors, contrast and inset shadow are checked independently of layout.
 await page.evaluate(async()=>{
  const resources=performance.getEntriesByType('resource').map(e=>e.name);
  const reactModule=await import(/* @vite-ignore */ resources.find(n=>n.includes('/deps/react.js'))!),domModule=await import(/* @vite-ignore */ resources.find(n=>n.includes('/deps/react-dom_client.js'))!),{TypeBadge}=await import('/src/components/TypeBadge.tsx');
  const React=reactModule.default||reactModule,{createRoot}=domModule.default||domModule;
  const host=document.createElement('div');host.id='type-fixture';host.style.cssText='position:fixed;inset:0;z-index:9999;background:#141826;display:flex;gap:12px;flex-wrap:wrap;align-content:center;justify-content:center';document.querySelector('.game-shell')!.append(host);
  const names=['Normal','Fire','Water','Electric','Grass','Ice','Fighting','Poison','Ground','Flying','Psychic','Bug','Rock','Ghost','Dragon','Dark','Steel','Fairy'];
  const root=createRoot(host);(window as any).__typeFixtureRoot=root;
  root.render(React.createElement(React.Fragment,null,...names.map(type=>React.createElement(TypeBadge,{key:type,type}))));
 });
 await expect(page.locator('#type-fixture .type')).toHaveCount(18);
 for(const [type,style] of Object.entries<any>(native.types)){
  const badge=page.locator(`#type-fixture [data-type="${type}"]`);
  for(const prop of ['color','backgroundColor','textShadow','boxShadow'])expect(await badge.evaluate((el,p)=>(getComputedStyle(el) as any)[p],prop),`${type} ${prop}`).toBe(style[prop]);
 }
 await page.screenshot({path:'docs/ui-polish-evidence/local-types.png'});
 await page.evaluate(()=>{(window as any).__typeFixtureRoot.unmount();document.querySelector('#type-fixture')!.remove();});
 await page.setViewportSize({width:390,height:844});
 for(const tab of ['Team/PC','Pokédex']){
  await page.getByRole('button',{name:tab,exact:true}).click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.screenshot({path:`docs/ui-polish-evidence/local-${tab==='Team/PC'?'team':'pokedex'}-mobile.png`});
 }
});

test('title randomizes specimens, keeps a shiny, captures and respawns, then cleans up',async({page})=>{
 test.setTimeout(45000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await expect(page.locator('.title-walker')).toHaveCount(30);
 const original=await page.locator('.title-walker').evaluateAll(els=>els.map(el=>(el as HTMLElement).dataset.species));
 expect(new Set(original).size).toBe(30);await expect(page.locator('.title-walker.ti-shiny')).toHaveCount(1);
 await expect(page.locator('.ti-shiny .title-sprite img')).toHaveJSProperty('naturalWidth',68,{timeout:15000});
 await expect.poll(()=>page.locator('.title-ball').count(),{timeout:6000}).toBeGreaterThan(0);
 await expect.poll(()=>page.locator('.title-walker').evaluateAll(els=>els.map(el=>(el as HTMLElement).dataset.species).join(',')),{timeout:22000}).not.toBe(original.join(','));
 await page.screenshot({path:'docs/ui-polish-evidence/local-title.png'});
 await page.getByRole('button',{name:'New game',exact:true}).click();
 await expect(page.locator('.ti-field')).toHaveCount(0);await page.waitForTimeout(700);expect(errors).toEqual([]);
 await page.reload();await expect(page.locator('.title-walker')).toHaveCount(30);
 expect(await page.locator('.title-walker').evaluateAll(els=>els.map(el=>(el as HTMLElement).dataset.species))).not.toEqual(original);
 await page.setViewportSize({width:390,height:844});await expect(page.locator('.title-walker')).toHaveCount(14);
 await page.emulateMedia({reducedMotion:'reduce'});await expect(page.locator('.title-walker')).toHaveCount(14);
 await page.waitForTimeout(1400);await expect(page.locator('.title-ball')).toHaveCount(0);
 expect(await page.locator('.title-walker').evaluateAll(els=>els.flatMap(el=>el.getAnimations({subtree:true})).length)).toBe(0);
});
