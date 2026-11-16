import {test,expect} from '@playwright/test';
import fs from 'node:fs/promises';

test('shell and collection layout follows native responsive measurements',async({page})=>{
 test.setTimeout(60000);
 await page.goto('/');await expect(page.getByRole('button',{name:'New game',exact:true})).toBeVisible();
 await page.evaluate(async()=>{
  const {useGameStore:s}=await import('/src/store/useGameStore.ts');
  const {createPokemonInstance}=await import('/src/game/domain/pokemon.ts');
  const mons=[4,7,1,25,149,144,19,20,3,150].map((id,i)=>createPokemonInstance(id,20,i===3,s.runtime));
  s.setState({starterChosen:true,isBattling:false,party:mons.slice(0,6),pcBox:mons.slice(6),pokedexCaught:mons.map(m=>m.speciesId),pokedexSeen:[...mons.map(m=>m.speciesId),2]});
 });
 await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important}'});
 const native=JSON.parse(await fs.readFile('docs/layout-evidence/reference.json','utf8')),result:any={},diff:any[]=[],arena:any[]=[],critical:any[]=[];
 for(const width of [2560,1920,1440,1100,1000,800,641,640,390,320]){
  await page.setViewportSize({width,height:900});result[width]={};
  for(const screen of ['team','pokedex']){
   await page.getByRole('button',{name:screen==='team'?'Team/PC':'Pokédex',exact:true}).first().click();
   const actual=await page.evaluate(screen=>{
    const root=document.querySelector('#screen-'+screen)!;
    const read=(el:Element|null)=>{if(!el)return null;const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};};
    return {shell:Object.fromEntries([['#app','.game-shell'],['.topbar','.replica-topbar'],['.side','.game-sidebar'],['#app>main','.game-shell>main']].map(([key,sel])=>[key,read(document.querySelector(sel))])),elements:Object.fromEntries(['screen','.team-panel','.map-head','.team-slots','.slot.filled','.slot .name','.pc-filters','.pc-grid','.pc-cell','.dex-hero','.dex-hero-body','.dex-ring','.dex-grid','.dex-cell','.dex-cell .num','.dex-cell .nm'].map(sel=>[sel,read(sel==='screen'?root:root.querySelector(sel))]))};
   },screen);
   result[width][screen]=actual;
   for(const group of ['shell','elements'])for(const [sel,r] of Object.entries<any>(actual[group])){
    const expected=native.viewports[width][screen][group][sel];if(!r||!expected)continue;
    for(const prop of ['x','y','width','height'])if(Math.abs(r[prop]-expected[prop])>1){
     const difference={width,screen,sel,prop,native:expected[prop],local:r[prop]};diff.push(difference);
     // DOM main includes the sidebar in React. Full page height and toolbar wrapping
     // also differ where native has unavailable actions/region bonus UI.
     const checked:Record<string,string[]>={
      '#app':['x','width'],'.topbar':['x','y','width','height'],
      'screen':['x','width'],'.team-panel':['x','y','width','height'],
      '.team-slots':['x','y','width','height'],'.slot.filled':['x','y','width','height'],
      '.pc-cell':['x','width','height'],'.dex-grid':['x','width','height'],
      '.dex-cell':['x','width','height'],'.dex-ring':['width','height'],
     };
     if(checked[sel]?.includes(prop))critical.push(difference);
    }
   }
   if([1920,1440,800,390].includes(width))await page.screenshot({path:`docs/layout-evidence/local-${screen}-${width}.png`});
  }
 }
 for(const width of [1920,1440,1100,1000,800,641,640,390]){
  await page.setViewportSize({width,height:900});
  if(width>640)await page.getByRole('button',{name:'Resume current adventure',exact:true}).click();
   else {
   await page.getByRole('button',{name:/Menu$/}).click();
   await page.getByRole('button',{name:'Resume current adventure',exact:true}).click();
  }
  const r=await page.locator('.battle-stage').boundingBox(),expected=native.arena[width].find((el:any)=>el.id==='arena').rect;
  arena.push({width,actual:r,expected});
  for(const [index,prop]of ['x','y','width','height'].entries())expect(Math.abs(r![prop as keyof typeof r]!-expected[index]),`arena ${width} ${prop}`).toBeLessThanOrEqual(1);
  await page.getByRole('button',{name:'Team/PC',exact:true}).first().click();
  const hidden=await page.locator('.battle-stage').boundingBox();
  for(const prop of ['x','y','width','height'])expect(Math.abs(hidden![prop as keyof typeof hidden]!-r![prop as keyof typeof r]!),`mounted arena ${width} ${prop}`).toBeLessThanOrEqual(1);
 }
 await fs.writeFile('docs/layout-evidence/local.json',JSON.stringify(result,null,2));
 await fs.writeFile('docs/layout-evidence/diff.json',JSON.stringify(diff,null,2));
 await fs.writeFile('docs/layout-evidence/arena.json',JSON.stringify(arena,null,2));
 await fs.writeFile('docs/layout-evidence/checked-diff.json',JSON.stringify(critical,null,2));
 console.log('Checked layout differences:',critical.length,'; full report including DOM/data differences:',diff.length);
 expect(critical).toEqual([]);
});
