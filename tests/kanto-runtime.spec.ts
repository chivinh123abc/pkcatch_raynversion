import {test,expect,Page} from '@playwright/test';
async function prepare(page:Page){
 await page.goto('/',{waitUntil:'domcontentloaded'});await page.locator('.battle-stage').waitFor();
 await page.evaluate(async()=>{
  const url=performance.getEntriesByType('resource').find(r=>r.name.includes('/src/store/useGameStore.ts'))!.name;
  const {useGameStore:store}=await import(/* @vite-ignore */url);(window as any).__kanto=store;
  store.setState({starterChosen:true,isBattling:false,badges:['boulder-badge'],completedChapters:['kanto-1']});
  store.getState().selectChapter('kanto-2');
 });
}
test('Misty chapter uses its generated scene, native pool and stable seeded timeline after reload',async({page})=>{
 await prepare(page);
 const state=await page.evaluate(async()=>{
  const store=(window as any).__kanto;
  const {currentChapter,nodePool,encounterContext}=await import('/src/game/data/chapterSelectors.ts');
  const s=store.getState(),node=currentChapter(s).steps[0],env=encounterContext(s);
  s.saveGame(true);return {seed:s.chapterRun.seed,scene:node.scene,name:node.name,pool:nodePool(node,s.currentChapterId,env.phase,env.weather).filter(e=>e.on).map(e=>e.id),enemy:s.enemy.speciesId};
 });
 expect(state.pool).toContain(state.enemy);
 await expect(page.locator('.battle-stage')).toHaveCSS('background-image',new RegExp(state.scene!.split('/').pop()!));
 await expect(page.getByText('Route 3',{exact:true}).first()).toBeVisible();
 await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await page.locator('.battle-stage').waitFor();
 const seed=await page.evaluate(async()=>{const {useGameStore}=await import('/src/store/useGameStore.ts');return useGameStore.getState().chapterRun!.seed;});expect(seed).toBe(state.seed);
});
test('story gifts persist before choosing; fossil choice grants once and advances',async({page})=>{
 await prepare(page);
 await page.evaluate(async()=>{
  const store=(window as any).__kanto,{currentChapter}=await import('/src/game/data/chapterSelectors.ts');
  store.getState().loadStepNode(currentChapter(store.getState()).steps.find(n=>n.gift?.key==='fossil')!.step);store.getState().saveGame(true);
 });
 await expect(page.getByRole('dialog',{name:'Adventure gift'})).toBeVisible();await page.reload();
 await page.getByRole('button',{name:'Continue',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'Adventure gift'});await expect(dialog).toBeVisible();
 await dialog.getByRole('button',{name:'dome fossil'}).click();await expect(dialog).toHaveCount(0);await page.reload();
 const items=await page.evaluate(async()=>{const {useGameStore}=await import('/src/store/useGameStore.ts');return useGameStore.getState().items;});expect(items['dome-fossil']).toBe(1);expect(items['helix-fossil']||0).toBe(0);
});
test('real Misty intro, sendouts and combat unlock Chapter 3 once',async({page})=>{
 test.setTimeout(90000);await prepare(page);
 await page.evaluate(async()=>{
  const store=(window as any).__kanto,{currentChapter}=await import('/src/game/data/chapterSelectors.ts'),{calculateStats,getPokemonSpecies}=await import('/src/data/pokemonData.ts');
  const base=store.getState().party[0],stats=calculateStats(getPokemonSpecies(3).baseStats,100);
  store.setState({party:[{...base,speciesId:3,level:100,stats,maxHp:stats.hp,currentHp:stats.hp}],gameSpeed:3,autoCatch:false});
  store.getState().loadStepNode(currentChapter(store.getState()).totalSteps);store.setState({isBattling:true});
 });
 await expect(page.locator('[data-trainer-intro="gym"]')).toBeVisible();
 await expect.poll(()=>page.evaluate(()=>(window as any).__kanto.getState().currentChapterId),{timeout:70000}).toBe('kanto-3');
 const result=await page.evaluate(()=>{const s=(window as any).__kanto.getState();return {badges:s.badges,done:s.completedChapters};});expect(result.badges.filter((x:string)=>x==='cascade-badge')).toHaveLength(1);expect(result.done).toContain('kanto-2');
});
