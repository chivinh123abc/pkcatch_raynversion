import { test, expect, Page } from '@playwright/test';

async function prepare(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.locator('.battle-stage').waitFor();
  await page.evaluate(async () => {
    const url = performance.getEntriesByType('resource').find(e => e.name.includes('/src/store/useGameStore.ts'))!.name;
    const { useGameStore: store } = await import(/* @vite-ignore */ url);
    (window as any).__panelStore = store;
    store.getState().loadStepNode(1);
    const base = store.getState().party[0];
    const ids = [4, 7, 25, 16, 10, 19];
    store.setState({ starterChosen: true, isBattling: false, autoCatch: false, activePartyIndex: 2, newCatchCard: null,
      party: ids.map((speciesId, i) => ({ ...base, uid: `panel-${speciesId}`, speciesId, level: 10, maxHp: 100, currentHp: [100, 45, 15, 0, 80, 100][i], exp: [0, 35, 80, 0, 50, 95][i], expToNextLevel: 100, status: i === 2 ? 'poison' : undefined })),
      pcBox: [], pokedexSeen: [4, 16, 19], pokedexCaught: [4, 19],
      berries: { razz: 29, nanab: 2, pinap: 1, goldenRazz: 2 }, berryBuffs: { greatBall: 21301, nanab: 3305, ultraBall: 0, pinap: 0 },
      items: { 'exp-candy-s': 1 }, balls: { pokeball: 0, greatball: 0, ultraball: 0, masterball: 0 },
    });
  });
  await expect(page.locator('.tr-row')).toHaveCount(6);
}

test('rail shows actual HP, EXP and status; selection and reordering preserve Pokémon', async ({ page }) => {
  await prepare(page);
  const rail = page.getByLabel('Battle send-out order');
  await expect(rail.getByRole('progressbar', { name: 'Charmander EXP' })).toHaveAttribute('aria-valuenow', '0');
  await expect(rail.getByRole('progressbar', { name: 'Pikachu EXP' })).toHaveAttribute('aria-valuenow', '80');
  await expect(rail.getByRole('progressbar', { name: 'Pikachu HP' })).toHaveAttribute('aria-valuenow', '15');
  await expect(rail.locator('.tr-st')).toHaveText('PSN');
  await expect(rail.locator('.ko')).toHaveAttribute('aria-disabled', 'true');
  await rail.locator('.ko').click({ force: true });
  expect(await page.evaluate(() => (window as any).__panelStore.getState().activePartyIndex)).toBe(2);
  await rail.getByRole('button', { name: /^Squirtle,/ }).click();
  await expect(rail.getByRole('button', { name: /^Squirtle,/ })).toHaveAttribute('aria-pressed', 'true');
  const transfer = await page.evaluateHandle(() => new DataTransfer());
  await rail.getByRole('button', { name: /^Charmander,/ }).dispatchEvent('dragstart', { dataTransfer: transfer });
  await rail.locator('.rail-entry').nth(2).dispatchEvent('drop', { dataTransfer: transfer });
  expect(await page.evaluate(() => {
    const s = (window as any).__panelStore.getState();
    return { order: s.party.map((m: any) => m.uid), active: s.party[s.activePartyIndex].uid, hp: s.party.find((m: any) => m.speciesId === 25).currentHp, xp: s.party.find((m: any) => m.speciesId === 25).exp };
  })).toEqual({ order: ['panel-7', 'panel-25', 'panel-4', 'panel-16', 'panel-10', 'panel-19'], active: 'panel-7', hp: 15, xp: 80 });
});

test('berries consume inventory, fold, and hide when empty', async ({ page }) => {
  await prepare(page);
  const panel = page.getByRole('region', { name: 'Consumables', exact: true });
  await expect(panel.locator('.bag-cell')).toHaveCount(4);
  await panel.getByRole('button', { name: 'Use Razz Berry', exact: true }).click();
  await expect(panel.getByRole('button', { name: 'Use Razz Berry', exact: true }).locator('.bag-qty')).toHaveText('×28');
  expect(await page.evaluate(() => (window as any).__panelStore.getState().berryBuffs.greatBall)).toBeGreaterThan(23000);
  await panel.getByRole('button', { name: 'Collapse Consumables', exact: true }).click();
  await expect(panel.locator('.bag-grid')).toBeHidden();
  await panel.getByRole('button', { name: 'Expand Consumables', exact: true }).click();
  await page.evaluate(() => (window as any).__panelStore.setState({ berries: { razz: 0, nanab: 0, pinap: 0, goldenRazz: 0 } }));
  await expect(panel).toContainText('No Berries for now.');
  await page.evaluate(() => (window as any).__panelStore.setState({ items: {} }));
  await expect(panel).toHaveCount(0);
});

test('Found here follows route, ownership and active encounter weights', async ({ page }) => {
  await prepare(page);
  const panel = page.getByRole('region', { name: 'Found here', exact: true });
  await expect(panel.locator('.zone-count')).toHaveText('1/3');
  await expect(panel.locator('.zone-cell.caught')).toHaveAttribute('aria-label', 'Rattata, 45% of encounters, caught');
  await expect(panel.locator('.zone-cell.seen')).toHaveAttribute('aria-label', 'Pidgey, 55% of encounters');
  await expect(panel.locator('.zone-cell.unknown')).toHaveAttribute('aria-label', '???, 6% of encounters, currently unavailable');
  await panel.locator('.zone-cell.seen').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(panel.locator('.zone-cell.seen')).toBeFocused();
  await page.evaluate(() => (window as any).__panelStore.setState({ currentStep: 7, pcBox: [{ ...(window as any).__panelStore.getState().party[1], speciesId: 50, uid: 'pc-diglett' }], pokedexCaught: [4, 19, 50], pokedexSeen: [4, 16, 19, 50] }));
  await expect(panel.locator('.zone-head')).toContainText('Route 2');
  await expect(panel.locator('.zone-cell.caught')).toHaveCount(2);
});

test('Bag opens real inventory, traps focus, and capture takes precedence', async ({ page }) => {
  await prepare(page);
  const bag = page.getByRole('button', { name: 'Bag', exact: true });
  await bag.click();
  const dialog = page.getByRole('dialog', { name: 'Bag', exact: true });
  await expect(dialog.getByRole('img', { name: 'Exp. Candy S' })).toHaveAttribute('src', '/assets/items/exp-candy-s.png');
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('button', { name: 'Close Bag' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(bag).toBeFocused();
  await bag.click();
  await page.evaluate(() => {
    const s = (window as any).__panelStore;
    s.setState({ newCatchCard: { speciesId: 4, level: 10, isShiny: false, isNew: true, destination: 'party' } });
  });
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('dialog')).toHaveCount(1);
  await expect(page.getByRole('dialog').getByRole('heading', { name: /Charmander/ })).toBeVisible();
  expect(await page.locator('.adventure-view').evaluate(el => !!el.closest('[inert]'))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(1);
  expect(await page.evaluate(() => (window as any).__panelStore.getState().items['exp-candy-s'])).toBe(1);
});

for (const width of [1440, 390, 320]) test(`six slots and sidebar stay inside the screen at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  await prepare(page);
  await expect.poll(async () => {
    const stage = await page.locator('.battle-stage').boundingBox();
    const row = await page.locator('.tr-row').last().boundingBox();
    return row!.y + row!.height <= stage!.y + stage!.height - 4;
  }).toBe(true);
  const stage = (await page.locator('.battle-stage').boundingBox())!;
  if (width < 801) expect(Math.abs(stage.width - stage.height)).toBeLessThan(1);
  else expect((await page.locator('.tr-row').first().boundingBox())!.width).toBe(60);
  const side = (await page.getByLabel('Battle sidebar', { exact: true }).boundingBox())!;
  expect(side.x + side.width).toBeLessThanOrEqual(width);
  if (width < 801) expect(side.width).toBeCloseTo(stage.width, 0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
});
