import {test,expect,Page} from '@playwright/test';
import fs from 'node:fs/promises';
const native=JSON.parse(await fs.readFile('docs/team-pc-evidence/reference.json','utf8'));
async function fixture(page:Page,width=1440){
 await page.setViewportSize({width,height:650});await page.goto('/',{waitUntil:'domcontentloaded'});await page.locator('.battle-stage').waitFor();
 await page.evaluate(async()=>{
  const {useGameStore:s}=await import('/src/store/useGameStore.ts'),{createPokemonInstance}=await import('/src/game/domain/pokemon.ts');
  (window as any).__teamPcStore=s;
  const mon=(id:number)=>{const m=createPokemonInstance(id,5,false,s.runtime);return {...m,exp:Math.floor(m.expToNextLevel*.4)};};
  s.setState({starterChosen:true,isBattling:false,party:Array.from({length:6},(_,i)=>mon(i+1)),pcBox:Array.from({length:60},(_,i)=>mon(i+7)),newCatchCard:null});
 });
 await page.getByRole('button',{name:'Team/PC',exact:true}).click();
}
test('pixel navigation uses the complete native mask, including checker composition and positions',async({page})=>{
 test.setTimeout(60000);await fixture(page);
 for(const name of ['Team/PC','Pokédex','Progress']){
  await page.getByRole('button',{name,exact:true}).click();await page.mouse.move(0,0);
  const styles=await page.locator('.side-nav-btn.active').evaluate(el=>Object.fromEntries(['before','after'].map(part=>{const s=getComputedStyle(el,`::${part}`);return[part,Object.fromEntries(['mask-composite','mask-position','mask-image','mask-size','mask-repeat','background-color','clip-path'].map(k=>[k,s.getPropertyValue(k)]))];})));
  for(const [part,values]of Object.entries(styles))for(const [key,value]of Object.entries(values))expect(value,`${name} ::${part} ${key}`).toBe(native.rest['.side-nav>button.active'][part][key]);
 }
 const tab=await page.locator('.side-nav-btn.active').boundingBox();
 await page.screenshot({path:'docs/team-pc-evidence/local-tab.png',clip:{x:Math.max(0,tab!.x-10),y:tab!.y-10,width:tab!.width+20,height:tab!.height+24}});
});
for(const width of [1440,390])test(`PC EXP and compact scrolling team match native at ${width}px`,async({page})=>{
 await fixture(page,width);
 const cell=page.locator('.pc-cell').first(),bar=cell.locator('.pc-xp');
 await expect(bar).toHaveCSS('height',width<=640?'3px':'5px');await expect(bar).toHaveCSS('border-radius','0px');
 await expect(bar).toHaveCSS('background-color',native.rest['.pc-xp'].style['background-color']);
 await expect(bar.locator('div')).toHaveCSS('box-shadow',native.rest['.pc-xp>div'].style['box-shadow']);
 const exp=await cell.evaluate(el=>{const b=el.getBoundingClientRect(),track=el.querySelector('.pc-xp')!.getBoundingClientRect(),fill=el.querySelector('.pc-xp>div')!.getBoundingClientRect(),s=getComputedStyle(el);return{left:track.left-b.left,right:b.right-track.right,border:parseFloat(s.borderLeftWidth),ratio:fill.width/track.width};});
 expect(exp.left).toBeCloseTo(exp.border,1);expect(exp.right).toBeCloseTo(exp.border,1);expect(exp.ratio).toBeCloseTo(.4,1);
 await expect(page.locator('#team-mini')).toHaveAttribute('aria-hidden','true');
 await page.evaluate(()=>window.scrollTo(0,600));await expect(page.locator('#team-mini')).toHaveClass(/show/);
 const target=width===1440?native.scrolled['#team-mini'].rect:native.mobile['#team-mini'].rect;
 await expect.poll(async()=>Math.round((await page.locator('#team-mini').boundingBox())!.y)).toBe(Math.round(target.y));
 const mini=(await page.locator('#team-mini').boundingBox())!;
 for(const [index,sample]of native.sprites.entries())await expect(page.locator('#team-mini .replica-sprite').nth(index)).toHaveCSS('--sprite-k',String(width<=640?sample.mobile:sample.desktop));
 expect(mini.x).toBeCloseTo(target.x,0);expect(mini.width).toBeCloseTo(target.width,0);expect(mini.height).toBeCloseTo(target.height,0);
 const sticky=await page.locator('.pc-sticky').boundingBox();expect(sticky!.y).toBeGreaterThanOrEqual(mini.y+mini.height-1);
 await page.screenshot({path:`docs/team-pc-evidence/local-scrolled-${width}.png`});
 await page.getByRole('button',{name:'Compact team Bulbasaur, level 5',exact:true}).click();await expect(page.locator('.mon-card')).toBeVisible();await page.getByRole('button',{name:'Close Pokémon details',exact:true}).click();
 const dragging=page.locator('.pc-cell').first(),destination=page.locator('#team-mini .slot.filled').first();
 const uid=await dragging.getAttribute('aria-label');await dragging.dragTo(destination);
 await expect(page.locator('#team-mini .slot.filled').first()).not.toHaveAttribute('aria-label','Compact team Bulbasaur, level 5');expect(uid).toBeTruthy();
 await page.evaluate(()=>window.scrollTo(0,0));await expect(page.locator('#team-mini')).not.toHaveClass(/show/);
 await page.getByRole('button',{name:'Pokédex',exact:true}).click();await expect(page.locator('#team-mini')).toHaveCount(0);
});
test('PC and inspect show a full EXP bar at the progress cap, then retain saved EXP after unlocking Brock',async({page})=>{
 await fixture(page);
 await page.evaluate(async()=>{
  const s=(window as any).__teamPcStore,{createPokemonInstance}=await import('/src/game/domain/pokemon.ts');
  const m=createPokemonInstance(19,20,false,s.runtime);s.setState({badges:[],completedChapters:[],pcBox:[{...m,exp:Math.floor(m.expToNextLevel*.4)}]});
 });
 const fill=page.locator('.pc-cell .pc-xp>div');
 await expect(fill).toHaveAttribute('style',/width: 100%/);
 await page.locator('.pc-cell').click();await expect(page.locator('.mon-card .xpbar.big')).toContainText('Max level');
 await page.getByRole('button',{name:'Close Pokémon details',exact:true}).click();
 await page.evaluate(()=>{const s=(window as any).__teamPcStore;s.setState({completedChapters:['kanto-1']});});
 await expect.poll(()=>fill.evaluate(el=>parseFloat((el as HTMLElement).style.width))).toBeCloseTo(40,0);
});
for(const width of [1440,390])test(`shiny sprites and native pixel markers appear in PC, team and mini team at ${width}px`,async({page})=>{
 test.setTimeout(60000);await fixture(page,width);
 await page.evaluate(async()=>{
  const s=(window as any).__teamPcStore,{createPokemonInstance}=await import('/src/game/domain/pokemon.ts');
  const mon=(id:number,shiny=true)=>createPokemonInstance(id,20,shiny,s.runtime);
  s.setState({party:[4,130,94,25,144,150].map(id=>mon(id)),pcBox:[19,26,149,151,...Array(40).fill(19)].map(id=>mon(id)).concat(mon(19,false)),buddy:{uid:null,ko:0}});
 });
 const pc=page.getByRole('button',{name:'PC Raichu, level 20',exact:true}),mark=pc.locator('.lvl .shiny-mk');
 await expect(page.getByRole('button',{name:'Shinies',exact:true}).locator('.shiny-mk')).toHaveCSS('width','16px');
 await expect(mark).toHaveAttribute('role','img');await expect(mark).toHaveAttribute('aria-label','Shiny');
 const properties=['width','height','background-image','background-size','background-repeat','background-position','image-rendering','flex-shrink'];
 const values=await mark.evaluate((el,keys)=>Object.fromEntries(keys.map(k=>[k,getComputedStyle(el).getPropertyValue(k)])),properties);
 for(const k of properties)if(k in native.shiny['#pc-grid .pc-cell .shiny-mk'].style)expect(values[k],k).toBe(native.shiny['#pc-grid .pc-cell .shiny-mk'].style[k]);
 await expect(pc.locator('.lvl')).toHaveCSS('display','flex');await expect(pc.locator('.lvl')).toHaveCSS('align-items','center');
 await expect(pc.locator('.lvl')).toHaveCSS('column-gap',native.shiny['#pc-grid .pc-cell .lvl'].style['column-gap']);
 expect(await pc.locator('.lvl').evaluate(el=>el.firstElementChild?.className)).toBe('shiny-mk');
 await expect(pc.locator('.replica-sprite img')).toHaveAttribute('src',/\/shiny\/26\.png$/);
 await expect(page.locator('#team-slots .name .shiny-mk')).toHaveCount(6);
 await expect(page.locator('#team-mini .name .shiny-mk')).toHaveCount(6);
 const regular=page.locator('.pc-cell').filter({has:page.locator('img[src$="/pokemon/19.png"]')});
 await expect(regular).toHaveCount(1);await expect(regular.locator('.shiny-mk')).toHaveCount(0);
 await expect.poll(()=>pc.locator('.replica-sprite img').evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0),{timeout:30000}).toBe(true);
 await page.screenshot({path:`docs/team-pc-evidence/local-shiny-${width}.png`,fullPage:width===1440});
 await page.evaluate(()=>window.scrollTo(0,600));await expect(page.locator('#team-mini')).toHaveClass(/show/);
 await expect(page.locator('#team-mini .replica-sprite img').first()).toHaveAttribute('src',/\/shiny\/4\.png$/);
 if(width===1440)await expect(page.locator('#team-mini .name .shiny-mk').first()).toBeVisible();
 else await expect(page.locator('#team-mini .name').first()).toBeHidden();
});
