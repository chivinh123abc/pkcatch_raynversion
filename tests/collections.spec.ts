import { test, expect, Page } from '@playwright/test';

async function prepare(page: Page) {
  await page.goto('/');
  await page.locator('.battle-stage').waitFor();
  await page.evaluate(async () => {
    const url = performance.getEntriesByType('resource').find(entry => entry.name.includes('/src/store/useGameStore.ts'))!.name;
    const { useGameStore: store } = await import(/* @vite-ignore */ url);
    (window as any).__uiStore = store;
    store.getState().loadStepNode(1);
    const base = store.getState().party[0];
    store.setState({ isBattling: false, allyRecalling: false, allySendingOut: false, enemyRecalling: false, newCatchCard: null,
      pcBox: [{ ...base, uid: 'ui-pikachu', speciesId: 25, level: 12, caughtAt: Date.now() }, { ...base, uid: 'ui-rattata', speciesId: 19, level: 8, caughtAt: Date.now() - 1000 }],
      pokedexCaught: [...new Set([...store.getState().pokedexCaught, 25, 19])],
      pokedexSeen: [...new Set([...store.getState().pokedexSeen, 25, 19])],
    });
  });
}

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
  await dialog.getByRole('button', { name: 'Add to team' }).click();
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
  await page.getByRole('button', { name: 'PC Pikachu, level 12', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Add to team', exact: true }).click();
  const before = await page.evaluate(() => {
    const s = (window as any).__uiStore.getState();
    return [...s.party, ...s.pcBox].map((mon: any) => mon.uid).sort();
  });
  await page.getByRole('button', { name: 'Save current team as Team 2', exact: true }).click();
  await page.getByRole('button', { name: 'Team Pikachu, level 12', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'To PC', exact: true }).click();
  await page.getByRole('button', { name: 'Use team 1', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Team Pikachu, level 12', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Use team 2', exact: true }).click();
  await expect(page.getByRole('button', { name: 'PC Pikachu, level 12', exact: true })).toBeVisible();
  expect(await page.evaluate(() => { const s = (window as any).__uiStore.getState(); return [...s.party, ...s.pcBox].map((mon: any) => mon.uid).sort(); })).toEqual(before);
});

test('PC dragging fills a slot, and a full team swaps through the details card', async ({ page }) => {
  await prepare(page);
  await page.getByRole('button', { name: 'Team/PC', exact: true }).click();
  await page.getByRole('button', { name: 'PC Pikachu, level 12', exact: true }).dragTo(page.getByRole('button', { name: 'Empty team slot 2', exact: true }));
  await expect(page.getByRole('button', { name: 'Team Pikachu, level 12', exact: true })).toBeVisible();
  await page.evaluate(() => {
    const s = (window as any).__uiStore, base = s.getState().party[0];
    s.setState({ party: [base, ...[10, 13, 16, 19, 21].map(id => ({ ...base, uid: 'swap-' + id, speciesId: id }))], pcBox: [{ ...base, uid: 'swap-pc', speciesId: 25, level: 12 }] });
  });
  await page.getByRole('button', { name: 'PC Pikachu, level 12', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Swap into team', exact: true }).click();
  await page.getByRole('button', { name: 'Team Charmander, level 5', exact: true }).click();
  const state = await page.evaluate(() => { const s = (window as any).__uiStore.getState(); return { team: s.party.map((m: any) => m.uid), pc: s.pcBox.map((m: any) => m.speciesId) }; });
  expect(state.team).toHaveLength(6); expect(state.team[0]).toBe('swap-pc'); expect(state.pc).toContain(4);
});

test('dex unread markers persist and dialogs isolate background keyboard focus', async ({ page }) => {
  await prepare(page);
  await page.getByRole('button', { name: 'Pokédex', exact: true }).click();
  const pikachu = page.getByRole('button', { name: 'Number 25, Pikachu, caught', exact: true });
  await expect(pikachu.locator('.dex-new')).toHaveText('NEW');
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
  const team = page.getByRole('button', { name: 'Team/PC', exact: true });
  const dex = page.getByRole('button', { name: 'Pokédex', exact: true });
  await expect(team.locator('.sidebar-collection-unread')).toHaveText('3');
  await expect(dex.locator('.sidebar-collection-unread')).toHaveText('3');
  await dex.click();
  await expect(dex.locator('.sidebar-collection-unread')).toHaveCount(0);
  await expect(team.locator('.sidebar-collection-unread')).toHaveText('3');
  await expect(page.getByRole('button', { name: 'Number 25, Pikachu, caught', exact: true }).locator('.dex-new')).toHaveText('NEW');
  await team.click();
  await expect(team.locator('.sidebar-collection-unread')).toHaveCount(0);
  await expect(dex.locator('.sidebar-collection-unread')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('.battle-stage')).toBeAttached();
  await expect(page.locator('.sidebar-collection-unread')).toHaveCount(0);
});

test('collection geometry matches the desktop baseline and filters wrap on narrow screens', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await prepare(page);
  await page.getByRole('button', { name: 'Team/PC', exact: true }).click();
  const panel = await page.locator('.team-panel').boundingBox();
  expect(panel).toMatchObject({ x: 280, y: 72, width: 1134, height: 308 });
  expect((await page.locator('.team-slots .slot').first().boundingBox())!.height).toBe(210);
  await page.getByRole('button', { name: 'Pokédex', exact: true }).click();
  expect((await page.locator('.dex-hero').boundingBox())!.height).toBe(252);
  await page.setViewportSize({ width: 320, height: 568 });
  const input = await page.getByRole('searchbox', { name: 'Search Pokédex' }).boundingBox();
  const status = await page.getByRole('combobox', { name: 'Pokédex status' }).boundingBox();
  expect(input!.y + input!.height).toBeLessThanOrEqual(status!.y);
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
