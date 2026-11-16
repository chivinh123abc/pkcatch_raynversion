import { test, expect, Page } from '@playwright/test';
import fs from 'node:fs/promises';

async function prepare(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.locator('.battle-stage').waitFor();
  await page.evaluate(async () => {
    const url = performance.getEntriesByType('resource').find(entry => entry.name.includes('/src/store/useGameStore.ts'))!.name;
    const { useGameStore: store } = await import(/* @vite-ignore */ url);
    (window as any).__uiStore = store;
    store.getState().loadStepNode(1);
    const base = store.getState().party[0];
    store.setState({ starterChosen: true, isBattling: false, allyRecalling: false, allySendingOut: false, enemyRecalling: false, newCatchCard: null,
      pcBox: [{ ...base, uid: 'ui-pikachu', speciesId: 25, level: 12, caughtAt: Date.now() }, { ...base, uid: 'ui-rattata', speciesId: 19, level: 8, caughtAt: Date.now() - 1000 }],
      pokedexCaught: [...new Set([...store.getState().pokedexCaught, 25, 19])],
      pokedexSeen: [...new Set([...store.getState().pokedexSeen, 25, 19])],
    });
  });
}

for (const width of [1440,390]) for (const tab of ['Team/PC','Pokédex']) {
  test(`${tab} keeps the reader's scroll position when background adventure advances at ${width}px`,async({page})=>{
    await page.setViewportSize({width,height:844});await prepare(page);
    await page.evaluate(()=>{
      const s=(window as any).__uiStore,base=s.getState().party[0];
      s.setState({pcBox:Array.from({length:60},(_,i)=>({...base,uid:'scroll-pc-'+i,speciesId:i+1}))});
    });
    await page.getByRole('button',{name:tab,exact:true}).click();
    const target=await page.evaluate(()=>{
      const target=Math.min(650,document.documentElement.scrollHeight-innerHeight-80);
      window.scrollTo(0,target);return target;
    });
    expect(target).toBeGreaterThan(200);
    await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBe(target);
    for(const step of [2,3]){
      await page.evaluate(step=>(window as any).__uiStore.setState({currentStep:step}),step);
      // Wait for the browser's smooth scrolling; the old scrollIntoView moved the document.
      await page.waitForTimeout(450);
      expect(await page.evaluate(()=>window.scrollY)).toBe(target);
    }
    await expect(page.getByRole('region',{name:tab==='Team/PC'?'Team and PC':'Pokédex',exact:true})).toBeVisible();
  });
}

test('rarity backgrounds match native colors, respect unknown/seen states, sort and reduced motion',async({page})=>{
  await prepare(page);
  await page.evaluate(()=>{
    const store=(window as any).__uiStore,base=store.getState().party[0],ids=[19,20,3,144];
    store.setState({pcBox:ids.map((id,i)=>({...base,uid:'rarity-'+id,speciesId:id,level:12,caughtAt:i})),pokedexCaught:[4,...ids],pokedexSeen:[4,...ids,2]});
  });
  const native=JSON.parse(await fs.readFile('docs/rarity-evidence/native.json','utf8'));
  await page.getByRole('button',{name:'Team/PC',exact:true}).click();
  for(const [index,name] of ['Rattata','Raticate','Venusaur','Articuno'].entries()){
    const glow=page.getByRole('button',{name:`PC ${name}, level 12`,exact:true}).locator('.tglow');
    await expect(glow).toHaveCSS('background-image',native.fixture[index].background);
    await expect(glow).toHaveCSS('animation-name',native.fixture[index].animation);
    await expect(glow).toHaveCSS('pointer-events','none');
  }
  await page.getByLabel('Sort PC',{exact:true}).selectOption('rarity');
  await expect(page.locator('.replica-pc-art img').first()).toHaveJSProperty('naturalWidth',68,{timeout:15000});
  expect(await page.locator('.pc-cell').evaluateAll(cells=>cells.map(cell=>cell.getAttribute('aria-label')))).toEqual(['PC Articuno, level 12','PC Venusaur, level 12','PC Raticate, level 12','PC Rattata, level 12']);
  await fs.mkdir('docs/rarity-evidence',{recursive:true});
  await page.locator('.pc-grid').screenshot({path:'docs/rarity-evidence/local-pc.png'});
  await page.getByRole('button',{name:'PC Articuno, level 12',exact:true}).click();
  await expect(page.getByRole('dialog').locator('.rarity')).toHaveText('Legendary');
  await expect(page.getByRole('dialog').locator('.rarity .rpips.r-legendary i')).toBeVisible();
  await page.getByRole('button',{name:'Close Pokémon details',exact:true}).click();
  await page.getByRole('button',{name:'Pokédex',exact:true}).click();
  await expect(page.locator('.dex-cell.unknown > .tglow').first()).toBeHidden();
  await expect(page.locator('.dex-cell.seen > .tglow').first()).toHaveCSS('opacity','0.5');
  await expect(page.locator('.dex-cell.seen > .tglow').first()).toHaveCSS('animation-name','none');
  await page.setViewportSize({width:390,height:844});await page.getByRole('searchbox',{name:'Search Pokédex'}).fill('Articuno');
  await page.locator('.dex-cell').scrollIntoViewIfNeeded();
  await expect(page.locator('.dex-cell .replica-dex-art img')).toHaveJSProperty('naturalWidth',68,{timeout:15000});
  await page.screenshot({path:'docs/rarity-evidence/local-dex-mobile.png'});
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(page.locator('.dex-cell.caught > .tglow')).toHaveCSS('animation-name','none');
});

test('Team/PC uses the main page, filters storage and adds a Pokémon to the team', async ({ page }) => {
  await prepare(page);
  await page.getByRole('button', { name: 'Team/PC', exact: true }).click();
  const screen = page.getByRole('region', { name: 'Team and PC' });
  await expect(screen).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect((await screen.boundingBox())!.x).toBeGreaterThan(240);
  const before = await page.evaluate(() => (window as any).__uiStore.getState().party.length);
  await page.getByRole('searchbox', { name: 'Search PC' }).fill('Pikachu');
  await expect(screen.locator('.pc-cell')).toHaveCount(1);
  await page.getByRole('button', { name: 'PC Pikachu, level 12', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'Pikachu' })).toBeVisible();
  await expect(dialog.getByText('Mouse Pokémon', { exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'PC Pikachu, level 12', exact: true }).dragTo(page.getByRole('button', { name: 'Empty team slot 2', exact: true }));
  await expect(dialog).toHaveCount(0);
  expect(await page.evaluate(() => (window as any).__uiStore.getState().party.length)).toBe(before + 1);
  await page.getByRole('button', { name: 'Progress', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Adventure', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.locator('.adventure-view')).not.toHaveAttribute('hidden');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('Pokédex shows actual progress, type filters and the original detail layout', async ({ page }) => {
  await prepare(page);
  await page.getByRole('button', { name: 'Pokédex', exact: true }).click();
  const screen = page.getByRole('region', { name: 'Pokédex' });
  await expect(screen.locator('.dex-hero')).toBeVisible();
  await expect(screen.locator('.dex-ring')).toContainText('/ 151');
  await page.getByRole('combobox', { name: 'Filter by type' }).selectOption('Electric');
  await page.getByRole('button', { name: 'Number 25, Pikachu, caught', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'Pikachu' })).toBeVisible();
  await expect(dialog.locator('.dc-fact')).toContainText(['Height', 'Weight', 'Caught']);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Number 25, Pikachu, caught', exact: true })).toBeFocused();
});

test('Team and detail move previews follow the v0.5.02 learnset after leveling', async ({ page }) => {
  await prepare(page);
  await page.evaluate(() => {
    const store = (window as any).__uiStore, base = store.getState().party[0];
    store.setState({ party: [{ ...base, uid: 'preview-charmander', speciesId: 4, level: 64 }] });
  });
  await page.getByRole('button', { name: 'Team/PC', exact: true }).click();
  for (const [level, move] of [[64, 'Flamethrower'], [65, 'Fire Blast'], [84, 'Fire Blast'], [85, 'Overheat']] as const) {
    await page.evaluate(level => {
      const store = (window as any).__uiStore;
      store.setState({ party: store.getState().party.map((mon: any) => ({ ...mon, level })) });
    }, level);
    const slot = page.getByRole('button', { name: `Team Charmander, level ${level}`, exact: true });
    await expect(slot.locator('.lv')).toHaveText(`Lv. ${level} · ${move}`);
    await slot.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.locator('.replica-move-fact>span:first-child>b')).toHaveText(move);
    await dialog.getByRole('button', { name: 'Close Pokémon details' }).click();
    await expect(dialog).toHaveCount(0);
  }
});

test('new catch card has the reference content and waits for Continue', async ({ page }) => {
  await prepare(page);
  const step = await page.evaluate(() => {
    const store = (window as any).__uiStore;
    store.setState({ newCatchCard: { speciesId: 16, level: 5, isShiny: false, isNew: true, destination: 'pc' } });
    return store.getState().currentStep;
  });
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'Pidgey' })).toBeVisible();
  await expect(dialog.getByText('Tiny Bird Pokémon', { exact: true })).toBeVisible();
  await expect(dialog.locator('.flavor')).toContainText('kick up sand');
  await expect(dialog.locator('.replica-stats')).toHaveCount(0);
  await expect(dialog.getByRole('button', { name: 'Close Pokémon details' })).toHaveCount(0);
  await dialog.evaluate(element => Promise.all(element.getAnimations().filter(animation => animation.effect?.getTiming().iterations !== Infinity).map(animation => animation.finished.catch(() => {}))));
  expect((await dialog.boundingBox())!.width).toBe(460);
  expect(await page.evaluate(() => (window as any).__uiStore.getState().currentStep)).toBe(step);
  await dialog.getByRole('button', { name: 'Continue' }).click();
  await expect(dialog).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => (window as any).__uiStore.getState().currentStep)).toBe(step + 1);
});

test('a new capture takes priority over collection details without stacking dialogs', async ({ page }) => {
  await prepare(page);
  await page.getByRole('button', { name: 'Team/PC', exact: true }).click();
  await page.getByRole('button', { name: 'PC Pikachu, level 12', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'Pikachu' })).toBeVisible();
  await page.evaluate(() => (window as any).__uiStore.setState({ newCatchCard: { speciesId: 16, level: 5, isShiny: false, isNew: true, destination: 'pc' } }));
  await expect(page.getByRole('dialog')).toHaveCount(1);
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'Pidgey' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(1);
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'Pikachu' })).toBeVisible();
});

test('saved teams swap membership without duplicating Pokemon', async ({ page }) => {
  await prepare(page);
  await page.getByRole('button', { name: 'Team/PC', exact: true }).click();
  await page.getByRole('button', { name: 'PC Pikachu, level 12', exact: true }).dragTo(page.getByRole('button', { name: 'Empty team slot 2', exact: true }));
  const before = await page.evaluate(() => {
    const s = (window as any).__uiStore.getState();
    return [...s.party, ...s.pcBox].map((mon: any) => mon.uid).sort();
  });
  await page.getByRole('button', { name: 'Save current team as Team 2', exact: true }).click();
  await page.getByRole('button', { name: 'Team Pikachu, level 12', exact: true }).dragTo(page.getByRole('button', { name: 'PC Rattata, level 8', exact: true }));
  await page.getByRole('button', { name: 'Use team 1', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Team Pikachu, level 12', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Use team 2', exact: true }).click();
  await expect(page.getByRole('button', { name: 'PC Pikachu, level 12', exact: true })).toBeVisible();
  expect(await page.evaluate(() => { const s = (window as any).__uiStore.getState(); return [...s.party, ...s.pcBox].map((mon: any) => mon.uid).sort(); })).toEqual(before);
});

test('PC dragging fills a slot and swaps an occupied slot without invented inspect actions', async ({ page }) => {
  await prepare(page);
  await page.getByRole('button', { name: 'Team/PC', exact: true }).click();
  await page.getByRole('button', { name: 'PC Pikachu, level 12', exact: true }).dragTo(page.getByRole('button', { name: 'Empty team slot 2', exact: true }));
  await expect(page.getByRole('button', { name: 'Team Pikachu, level 12', exact: true })).toBeVisible();
  await page.evaluate(() => {
    const s = (window as any).__uiStore, base = s.getState().party[0];
    s.setState({ party: [base, ...[10, 13, 16, 19, 21].map(id => ({ ...base, uid: 'swap-' + id, speciesId: id }))], pcBox: [{ ...base, uid: 'swap-pc', speciesId: 25, level: 12 }] });
  });
  await page.getByRole('button', { name: 'PC Pikachu, level 12', exact: true }).dragTo(page.getByRole('button', { name: 'Team Charmander, level 5', exact: true }));
  const state = await page.evaluate(() => { const s = (window as any).__uiStore.getState(); return { team: s.party.map((m: any) => m.uid), pc: s.pcBox.map((m: any) => m.speciesId) }; });
  expect(state.team).toHaveLength(6); expect(state.team[0]).toBe('swap-pc'); expect(state.pc).toContain(4);
});

test('dex has no individual NEW markers and dialogs isolate background keyboard focus', async ({ page }) => {
  await prepare(page);
  await page.getByRole('button', { name: 'Pokédex', exact: true }).click();
  const pikachu = page.getByRole('button', { name: 'Number 25, Pikachu, caught', exact: true });
  await expect(page.locator('.dex-new,.dex-unread')).toHaveCount(0);
  await pikachu.click();
  await expect(page.locator('main')).toHaveAttribute('inert', '');
  await page.keyboard.press('Tab');
  expect(await page.getByRole('dialog').evaluate(el => el.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.locator('main')).not.toHaveAttribute('inert');
  await expect(pikachu.locator('.dex-new')).toHaveCount(0);
  await page.evaluate(() => (window as any).__uiStore.setState({ newCatchCard: { speciesId: 16, level: 5, isShiny: false, isNew: true, destination: 'pc' } }));
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(1);
  await page.getByRole('dialog').getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.locator('main')).not.toHaveAttribute('inert');
});

test('menu notifications clear on entering their own collection and persist across reload', async ({ page }) => {
  await prepare(page);
  // This case tests existing notifications, independently of the requested local fixture.
  await page.evaluate(async()=>{const {RARITY_TEST_MARKER}=await import('/src/game/runtime/rarityTestSave.ts');localStorage.setItem(RARITY_TEST_MARKER,'done');});
  const team = page.getByRole('button', { name: 'Team/PC', exact: true });
  const dex = page.getByRole('button', { name: 'Pokédex', exact: true });
  // Native Team/PC only counts new shinies without an original Trainer.
  await expect(team.locator('.sidebar-collection-unread')).toHaveCount(0);
  await expect(dex.locator('.sidebar-collection-unread')).toHaveText('3');
  await dex.click();
  await expect(dex.locator('.sidebar-collection-unread')).toHaveCount(0);
  await expect(team.locator('.sidebar-collection-unread')).toHaveCount(0);
  await expect(page.locator('.dex-new,.dex-unread')).toHaveCount(0);
  expect(await page.evaluate(() => {
    const s=(window as any).__uiStore.getState();
    return s.pokedexCaught.every((id:number)=>s.pokedexReviewed.includes(id));
  })).toBe(true);
  await page.evaluate(()=>{
    const s=(window as any).__uiStore;
    s.setState({pokedexCaught:[...s.getState().pokedexCaught,7],pokedexSeen:[...s.getState().pokedexSeen,7]});
  });
  await expect.poll(()=>page.evaluate(()=>(window as any).__uiStore.getState().pokedexReviewed.includes(7))).toBe(true);
  await expect(page.locator('.dex-new,.dex-unread')).toHaveCount(0);
  await team.click();
  await expect(team.locator('.sidebar-collection-unread')).toHaveCount(0);
  await expect(dex.locator('.sidebar-collection-unread')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('.battle-stage')).toBeAttached();
  await expect(page.locator('.sidebar-collection-unread')).toHaveCount(0);
});

test('collection geometry matches the desktop baseline and mobile filters stay compact', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await prepare(page);
  await page.getByRole('button', { name: 'Team/PC', exact: true }).click();
  const panel = await page.locator('.team-panel').boundingBox();
  expect(panel).toMatchObject({ x: 280, y: 72, width: 1134, height: 308 });
  expect((await page.locator('.team-slots .slot').first().boundingBox())!.height).toBe(210);
  await page.getByRole('button', { name: 'Pokédex', exact: true }).click();
  // v0.5.02 has five region rows, including the locked Unova row.
  expect((await page.locator('.dex-hero').boundingBox())!.height).toBe(279);
  await page.setViewportSize({ width: 320, height: 568 });
  const input = await page.getByRole('searchbox', { name: 'Search Pokédex' }).boundingBox();
  const status = await page.getByRole('combobox', { name: 'Pokédex status' }).boundingBox();
  expect(input!.y).toBe(status!.y);
  await page.getByRole('button',{name:'More filters',exact:true}).click();
  await expect(page.getByRole('group',{name:'Additional filters'})).toBeVisible();
  await page.getByRole('combobox',{name:'Filter by type',exact:true}).selectOption('Water');
  await page.getByRole('button',{name:'Done',exact:true}).click();
  await expect(page.getByRole('group',{name:'Additional filters'})).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

test('small capture cards keep genus, types, facts and Continue separate', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await prepare(page);
  await page.evaluate(() => (window as any).__uiStore.setState({ newCatchCard: { speciesId: 16, level: 5, isShiny: false, isNew: true, destination: 'pc' } }));
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const layout = await dialog.evaluate(element => {
    const rect = (selector: string) => { const r = element.querySelector(selector)!.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, left: r.left, right: r.right }; };
    return { genus: rect('.genus'), types: rect('.badges'), hero: rect('.dc-hero'), facts: rect('.dc-facts'), flavor: rect('.flavor') };
  });
  expect(layout.genus.bottom).toBeLessThanOrEqual(layout.types.top);
  expect(layout.types.bottom).toBeLessThanOrEqual(layout.facts.top);
  expect(layout.hero.bottom).toBeLessThanOrEqual(layout.facts.top);
  expect(layout.facts.bottom).toBeLessThanOrEqual(layout.flavor.top);
  const button = dialog.getByRole('button', { name: 'Continue', exact: true });
  await button.scrollIntoViewIfNeeded(); await button.click();
  await expect(dialog).toHaveCount(0);
});

test('mobile collection screens and capture card fit the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await prepare(page);
  const navigation = page.getByRole('navigation', { name: 'Mobile navigation' });
  await expect(navigation).toBeVisible();
  await navigation.getByRole('button', { name: 'Team/PC', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Team and PC' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await navigation.getByRole('button', { name: 'Pokédex', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Pokédex' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.evaluate(() => (window as any).__uiStore.setState({ newCatchCard: { speciesId: 16, level: 5, isShiny: false, isNew: true, destination: 'pc' } }));
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('button', { name: 'Continue' })).toBeVisible();
  const box = await dialog.boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
});
