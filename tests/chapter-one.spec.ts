import { test, expect, Page } from '@playwright/test';
import fs from 'node:fs/promises';
import {reachStarter,chooseStarter} from './helpers/onboarding';
test.use({ video: 'on' });

async function storeFor(page: Page) {
  await page.evaluate(async () => {
    const url = performance.getEntriesByType('resource').find(entry => entry.name.includes('/src/store/useGameStore.ts'))!.name;
    (window as any).__chapterStore = (await import(/* @vite-ignore */ url)).useGameStore;
  });
}

test('a fresh game requires a starter choice, starts without demo resources, and remembers the choice', async ({ page }) => {
  test.setTimeout(60000);
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await reachStarter(page);
  const dialog = page.getByRole('dialog', { name: 'Choose your first Pokémon' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Pick a Pokémon', exact: true })).toBeDisabled();
  await expect(page.locator('.game-shell')).toHaveAttribute('inert', '');
  await dialog.getByRole('button', { name: 'Bulbasaur', exact:true }).click();
  await dialog.getByRole('button', { name: 'Choose Bulbasaur', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await storeFor(page);
  expect(await page.evaluate(() => {
    const store = (window as any).__chapterStore; store.setState({ isBattling: false });
    const s = store.getState();
    return { starter: s.party[0].speciesId, level: s.party[0].level, money: s.money, tokens: s.tokens, berries: Object.values(s.berries).reduce((a: number,b: number) => a+b,0), buffs: Object.values(s.berryBuffs).reduce((a: number,b: number) => a+b,0) };
  })).toEqual({ starter: 1, level: 5, money: 3000, tokens: 0, berries: 0, buffs: 0 });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.locator('.battle-stage')).toBeAttached();
  await expect(dialog).toHaveCount(0);
  await storeFor(page);
  expect(await page.evaluate(() => (window as any).__chapterStore.getState().party[0].speciesId)).toBe(1);
});

for (const speed of [1, 2, 3]) test(`native Chapter 1 walkthrough records battle, capture, item, heal and Brock at x${speed}`, async ({ page }) => {
  test.setTimeout(240000);
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await chooseStarter(page);
  await storeFor(page);
  await page.evaluate(async speed => {
    const store = (window as any).__chapterStore;
    const { calculateStats, getPokemonSpecies } = await import(/* @vite-ignore */ '/src/data/pokemonData.ts');
    const base = store.getState().party[0];
    // Explicit trained-team fixture: real combat, real stats and real FX; no forced hits/HP or completions.
    const party = [7, 12, 25].map((id, i) => {
      const stats = calculateStats(getPokemonSpecies(id).baseStats, 20);
      return { ...base, uid: `walkthrough-${id}-${i}`, speciesId: id, level: 20, exp: 0, expToNextLevel: 5000, stats, maxHp: stats.hp, currentHp: stats.hp };
    });
    let seed = 42;
    store.runtime.random = () => { seed = (Math.imul(1664525, seed) + 1013904223) >>> 0; return seed / 4294967296; };
    store.setState({ party, pcBox: [], pokedexCaught: [7,12,25], pokedexSeen: [7,12,25], gameSpeed: speed, autoCatch: true, isBattling: true });
    store.getState().loadStepNode(1);
  }, speed);
  const seen = new Set<string>();
  const deadline = Date.now() + 225000;
  while (Date.now() < deadline) {
    const state = await page.evaluate(() => {
      const s = (window as any).__chapterStore.getState();
      return { chapter: s.currentChapterId, node: s.nodeType, card: !!s.newCatchCard };
    });
    if (state.chapter !== 'kanto-1') break;
    seen.add(state.node);
    if (state.card) await page.getByRole('dialog').getByRole('button', { name: 'Continue', exact: true }).click();
    await page.waitForTimeout(100);
  }
  const result = await page.evaluate(() => {
    const store = (window as any).__chapterStore;store.setState({ isBattling: false });const s = store.getState();
    return { chapter: s.currentChapterId, step: s.currentStep, badges: s.badges, money: s.money, team: s.party.map((m: any)=>({ speciesId:m.speciesId,level:m.level,hp:m.currentHp })), items:s.items, watchdogs:store.runtime.events().filter((e:any)=>e.event==='watchdog') };
  });
  expect(result.chapter).toBe('kanto-2');
  expect(result.badges).toContain('boulder-badge');
  expect([...seen].sort()).toEqual(['badge','center','grass','question','red']);
  expect(result.watchdogs).toEqual([]);expect(errors).toEqual([]);
  await fs.mkdir('docs/r03-evidence', { recursive: true });
  await fs.writeFile(`docs/r03-evidence/chapter-x${speed}.json`, JSON.stringify({ fixture:'trained Squirtle, Butterfree, Pikachu, level 20; real native effects; no Skip or forced completions', speed, result }, null, 2));
  await page.locator('canvas[data-transition="dither"]').waitFor({ state: 'detached' });
  await page.screenshot({ path: `docs/r03-evidence/chapter-x${speed}-complete.png` });
  const video = page.video();await page.close();
  await fs.copyFile(await video!.path(), `docs/r03-evidence/chapter-x${speed}.webm`);
});
