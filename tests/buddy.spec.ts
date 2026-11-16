import {test,expect,Page} from '@playwright/test';
import fs from 'node:fs/promises';
const nativeGeometry=JSON.parse(await fs.readFile('docs/buddy-evidence/native-geometry.json','utf8'));

async function fixture(page:Page,width=1440){
 test.setTimeout(60000);
 await page.setViewportSize({width,height:900});await page.goto('/',{waitUntil:'domcontentloaded'});await page.locator('.battle-stage').waitFor();
 await page.evaluate(async()=>{
  const {useGameStore:store}=await import('/src/store/useGameStore.ts');
  const {createPokemonInstance}=await import('/src/game/domain/pokemon.ts');
  const mon=(id:number,level:number,shiny=false)=>createPokemonInstance(id,level,shiny,store.runtime);
  const gyarados=mon(130,100,true),magikarp=mon(129,5,true),charmander=mon(4,5);
  (window as any).__buddyStore=store;
  store.setState({starterChosen:true,isBattling:false,allyRecalling:false,allySendingOut:false,enemyRecalling:false,newCatchCard:null,party:[gyarados,charmander],pcBox:[magikarp],buddy:{uid:gyarados.uid,ko:2},pokedexSeen:[4,129,130],pokedexCaught:[4,129,130],items:{'exp-candy-s':2,'rare-candy':1}});
 });
 await page.getByRole('button',{name:'Team/PC',exact:true}).click();
}

for(const width of [1440,390,320])test(`Buddy inspect matches native sections and stays within ${width}px`,async({page})=>{
 await fixture(page,width);await expect(page.locator('.slot-buddy')).toHaveCount(1);
 await page.getByRole('button',{name:'Team Gyarados, level 100',exact:true}).click();
 const dialog=page.getByRole('dialog');await expect(dialog).toHaveClass(/replica-inspect/);
 await expect(dialog.getByRole('heading',{name:/Gyarados/})).toBeVisible();
 await expect(dialog.locator('.dc-hero .pokemon-art img')).toHaveAttribute('src',/showdown\/gen5ani-shiny\/gyarados.gif/);
 await expect(dialog.locator('.hp-now')).toHaveText('907/907');
 await expect(dialog.locator('.inspect-stats .dc-tot')).toHaveText('Total 540');
 await expect(dialog.locator('.buddy-sum')).toContainText('Buddy · +30% battle EXP · EXP bonus every 5 KOs');
 await expect(dialog.getByRole('button',{name:'Use exp-candy-s',exact:true})).toBeDisabled();
 await expect(dialog.locator('.dc-bud-gauge')).toHaveAttribute('aria-label','Buddy 2 of 5 KOs');
 const box=await dialog.boundingBox();expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThanOrEqual(width);
 expect(box!.width).toBe(nativeGeometry[width].width);
 if(width===1440)await expect(dialog.locator('.dc-head h2')).toHaveCSS('font-size','28px');
 const artUncovered=await dialog.locator('.dc-hero').evaluate(el=>{const r=el.getBoundingClientRect();return el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));});expect(artUncovered).toBe(true);
 const artFits=await dialog.locator('.dc-hero').evaluate(el=>{const outer=el.getBoundingClientRect(),node=el.querySelector('.pokemon-art')!,art=node.getBoundingClientRect();return {fits:art.left>=outer.left&&art.right<=outer.right,outer:outer.toJSON(),art:art.toJSON(),transform:getComputedStyle(node).transform};});expect(artFits.fits,JSON.stringify(artFits)).toBe(true);
 await expect(dialog.locator('.replica-mon-actions,.inspect-learnset,.evo button,button.evo')).toHaveCount(0);
 const overlapping=await dialog.evaluate(el=>[...el.querySelectorAll('.dc-hero,.dc-id,.dc-head h2,.dc-head .dc-sum')].some(node=>node.getBoundingClientRect().right>el.getBoundingClientRect().right+1));expect(overlapping).toBe(false);
 await fs.mkdir('docs/buddy-evidence',{recursive:true});await page.screenshot({path:`docs/buddy-evidence/local-inspect-${width}.png`});
 await dialog.getByRole('button',{name:'Remove Buddy',exact:true}).click();await expect(dialog.locator('.buddy-sum')).toBeEmpty();await expect(dialog.locator('.dc-bud-gauge')).toHaveCount(0);
 await dialog.getByRole('button',{name:'Choose as Buddy',exact:true}).click();await expect(dialog.locator('.dc-bud-gauge')).toHaveAttribute('aria-label','Buddy 0 of 5 KOs');
 await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(page.getByRole('button',{name:'Team Gyarados, level 100',exact:true})).toBeFocused();
});

test('Eevee family uses native static branches and stone icons',async({page})=>{
 await fixture(page,390);
 await page.evaluate(async()=>{
  const s=(window as any).__buddyStore,{createPokemonInstance}=await import('/src/game/domain/pokemon.ts');
  const mons=[133,134,135,136].map(id=>createPokemonInstance(id,20,false,s.runtime));
  s.setState({party:[mons[0]],pcBox:mons.slice(1),pokedexSeen:[133,134,135,136],pokedexCaught:[133,134,135,136]});
 });
 await page.getByRole('button',{name:'Team Eevee, level 20',exact:true}).click();const dialog=page.getByRole('dialog');
 await expect(dialog.locator('.evo-branches.grid>.evo-branch')).toHaveCount(3);
 for(const stone of ['water-stone','thunder-stone','fire-stone'])await expect(dialog.locator(`.arrow img[src$="${stone}.png"]`)).toBeVisible();
 const fits=await dialog.locator('.evo-chain').evaluate(el=>el.scrollWidth<=el.clientWidth+1);expect(fits).toBe(true);
 await expect(dialog.locator('button.evo')).toHaveCount(0);
});

test('PC inspect candy consumption and Buddy marker update without closing the card',async({page})=>{
 await fixture(page);await page.getByRole('button',{name:'PC Magikarp, level 5',exact:true}).click();
 const dialog=page.getByRole('dialog');await expect(dialog.getByRole('heading',{name:/Magikarp/})).toBeVisible();
 await dialog.getByRole('button',{name:'Choose as Buddy',exact:true}).click();await expect(dialog.locator('.dc-bud-gauge')).toBeVisible();
 await dialog.getByRole('button',{name:'Use exp-candy-s',exact:true}).click();await expect(dialog.getByRole('button',{name:'Use exp-candy-s',exact:true}).locator('i')).toHaveText('1');
 await expect(dialog.locator('.lvl')).not.toHaveText('Lv. 5');
 await dialog.locator('.inspect-stats summary').click();await expect(dialog.locator('.statbars.real')).toBeVisible();
 await dialog.locator('.inspect-history summary').click();await expect(dialog.locator('.dc-history')).toContainText('Caught on');
 await page.keyboard.press('Escape');await expect(page.locator('.slot-buddy')).toHaveCount(0);await expect(page.locator('.pc-buddy')).toHaveCount(1);
 await page.evaluate(()=>{const s=(window as any).__buddyStore;s.setState({buddy:{uid:null,ko:0}});s.getState().loadGame({deferEncounter:true});s.setState({isBattling:false});});
 await expect(page.locator('.pc-buddy')).toHaveCount(1);
});
