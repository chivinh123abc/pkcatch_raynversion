import { test, expect, Page } from '@playwright/test';
import { createHash } from 'node:crypto';

async function prepare(page: Page) {
  await page.goto('/',{waitUntil:'domcontentloaded'});await page.locator('.battle-stage').waitFor();
  await page.evaluate(async()=>{
    const url=performance.getEntriesByType('resource').find(e=>e.name.includes('/src/store/useGameStore.ts'))!.name;
    const {useGameStore:s}=await import(/* @vite-ignore */ url);(window as any).__spriteStore=s;s.getState().loadStepNode(1);
    s.setState({starterChosen:true,isBattling:false,autoCatch:false,activePartyIndex:0,pokedexCaught:[4,29],pokedexSeen:[4,29],newCatchCard:null});
  });
}

test('capture card uses a real local Gen 5 GIF whose frames continue at x3',async({page})=>{
  await prepare(page);
  await page.evaluate(()=>(window as any).__spriteStore.setState({newCatchCard:{speciesId:4,level:5,isShiny:false,isNew:true,destination:'party'}}));
  const image=page.getByRole('dialog').locator('.pokemon-art img');
  await expect(image).toHaveAttribute('src','/assets/pokemon/showdown/gen5ani/charmander.gif');
  await expect.poll(()=>image.evaluate((img: HTMLImageElement)=>img.naturalWidth)).toBe(41);
  // Canvas drawImage uses an animated image's default frame. Read rendered pixels instead.
  const frame=async()=>createHash('sha256').update(await image.screenshot({animations:'allow'})).digest('hex');
  const before=await frame();await page.evaluate(()=>(window as any).__spriteStore.setState({gameSpeed:3}));
  await expect.poll(frame).not.toBe(before);
  await expect(image).toHaveAttribute('src','/assets/pokemon/showdown/gen5ani/charmander.gif');
  await expect(page.getByRole('button',{name:'Continue',exact:true})).toBeVisible();
});

test('Pokédex keeps compact icons and opens animated artwork; shiny uses its own GIF',async({page})=>{
  await prepare(page);await page.getByRole('button',{name:'Pokédex',exact:true}).click();
  await page.getByRole('button',{name:'Number 4, Charmander, caught',exact:true}).click();
  await expect(page.getByRole('dialog').locator('.pokemon-art img')).toHaveAttribute('src','/assets/pokemon/showdown/gen5ani/charmander.gif');
  await page.keyboard.press('Escape');
  await page.evaluate(()=>(window as any).__spriteStore.setState({newCatchCard:{speciesId:29,level:5,isShiny:true,isNew:true,destination:'party'}}));
  const shiny=page.getByRole('dialog').locator('.pokemon-art img');
  await expect(shiny).toHaveAttribute('src','/assets/pokemon/showdown/gen5ani-shiny/nidoranf.gif');
  await expect.poll(()=>shiny.evaluate((img: HTMLImageElement)=>img.naturalWidth)).toBeGreaterThan(0);
});

test('battle effects target a cropped icon while small team slots stay at scale 1',async({page})=>{
  await page.setViewportSize({width:1280,height:800});await prepare(page);
  const image=page.locator('.battle-mon.ally .battle-sprite');
  await expect(image).toHaveAttribute('src',/^data:image\/png;base64,/);
  const geometry=await image.evaluate((img: HTMLImageElement)=>({natural:[img.naturalWidth,img.naturalHeight],width:parseFloat(getComputedStyle(img).width),scale:Number(getComputedStyle(img.closest('.battle-stage')!).getPropertyValue('--k'))}));
  expect(geometry.natural).toEqual([21,19]);expect(geometry.width).toBe(21*geometry.scale);
  const rail=page.locator('.tr-row .sprbox img').first();
  await expect.poll(()=>rail.evaluate(img=>parseFloat(getComputedStyle(img).width))).toBe(68);
});

test('small species never grow beyond the reference 2x rail scale',async({page})=>{
  await page.setViewportSize({width:1440,height:900});await prepare(page);
  await page.evaluate(()=>{const store=(window as any).__spriteStore,base=store.getState().party[0];store.setState({party:[4,19,16,50,10,69].map(id=>({...base,uid:`rail-${id}`,speciesId:id}))});});
  const caterpie=page.getByRole('button',{name:/^Caterpie,/}).locator('.sprbox img');
  await expect(caterpie).toHaveCSS('width','136px');
  const widths=await page.locator('.tr-row .sprbox img').evaluateAll(images=>images.map(img=>parseFloat(getComputedStyle(img).width)));
  expect(widths.every(width=>width<=136)).toBe(true);
  await page.setViewportSize({width:1280,height:800});await expect(caterpie).toHaveCSS('width','68px');
});

test('both ground shadows stay centered under their Pokemon at different field sizes',async({page})=>{
  await prepare(page);
  for(const width of [1280,1440]){
    await page.setViewportSize({width,height:900});
    for(const side of ['ally','enemy']){
      const mon=page.locator(`.battle-mon.${side}`);
      await expect(mon.locator('.battle-sprite')).toHaveAttribute('src',/^data:image\/png;base64,/);
      await expect.poll(()=>mon.evaluate(el=>{
        const sprite=el.querySelector('.battle-sprite')!.getBoundingClientRect(),shadow=el.querySelector('.cb-shadow-pixel')!.getBoundingClientRect();
        return Math.abs((sprite.left+sprite.width/2)-(shadow.left+shadow.width/2));
      })).toBeLessThan(.5);
    }
  }
});

test('small capture card fits and reduced motion displays a frozen GIF frame',async({page})=>{
  await page.setViewportSize({width:320,height:740});await page.emulateMedia({reducedMotion:'reduce'});await prepare(page);
  await page.evaluate(()=>(window as any).__spriteStore.setState({newCatchCard:{speciesId:4,level:5,isShiny:false,isNew:true,destination:'party'}}));
  const dialog=page.getByRole('dialog');await expect(dialog.locator('.pokemon-art img')).toHaveAttribute('src',/^data:image\/png;base64,/);
  const rect=(await dialog.boundingBox())!;expect(rect.x).toBeGreaterThanOrEqual(0);expect(rect.x+rect.width).toBeLessThanOrEqual(320);
  await expect(dialog.getByRole('button',{name:'Continue',exact:true})).toBeInViewport();
});
