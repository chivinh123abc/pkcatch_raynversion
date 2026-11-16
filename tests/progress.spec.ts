import { test, expect, Page } from '@playwright/test';

async function prepare(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.locator('.battle-stage').waitFor();
  await page.evaluate(async () => {
    const url = performance.getEntriesByType('resource').find(entry => entry.name.includes('/src/store/useGameStore.ts'))!.name;
    const { useGameStore: store } = await import(/* @vite-ignore */ url);
    (window as any).__progressStore = store;
    store.getState().loadStepNode(3);
    store.setState({ currentStep: 3, starterChosen: true, isBattling: false, autoCatch: false, allyRecalling: false, allySendingOut: false, enemyRecalling: false, badges: [], newCatchCard: null });
    (document.querySelector('.battle-stage') as HTMLElement).dataset.progressTest = 'same-arena';
  });
}

test('Progress is a page; Continue preserves the route and the mounted arena geometry', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await prepare(page);
  const before = await page.locator('.battle-stage').boundingBox();
  expect(before!.x).toBe(280);
  expect(before!.y).toBe(108);
  expect(before!.width).toBe(798);
  await page.getByRole('button', { name: 'Progress', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Adventure', exact: true })).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const continueBox = await page.getByRole('button', { name: 'Continue', exact: true }).boundingBox();
  expect(continueBox!.y + continueBox!.height).toBeLessThanOrEqual(884);
  const sections = await page.locator('.progress-page .mp-in > .mp-pk').evaluateAll(elements => elements.map(element => {
    const rect = element.getBoundingClientRect(); return { top: rect.top, bottom: rect.bottom };
  }));
  expect(sections[0].bottom).toBeLessThanOrEqual(sections[1].top);
  await expect(page.locator('.adventure-view')).toHaveAttribute('aria-hidden', 'true');
  expect(await page.locator('.battle-stage').boundingBox()).toEqual(before);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.locator('.adventure-view')).not.toHaveAttribute('hidden');
  await expect(page.locator('.battle-stage')).toHaveAttribute('data-progress-test', 'same-arena');
  expect(await page.evaluate(() => (window as any).__progressStore.getState().currentStep)).toBe(3);
});

test('chapter previews show a real lock and start an unlocked chapter only on confirmation', async ({ page }) => {
  await prepare(page);
  await page.getByRole('button', { name: 'Progress', exact: true }).click();
  const screen = page.getByRole('region', { name: 'Adventure', exact: true });
  await screen.getByRole('button', { name: 'Preview Cascade Badge', exact: true }).click();
  await expect(screen.getByRole('heading', { name: 'Cascade Badge', exact: true })).toBeVisible();
  await expect(screen.locator('.progress-lock-reason')).toContainText('Boulder Badge');
  await expect(screen.getByRole('button', { name: 'Locked', exact: true })).toBeDisabled();
  expect(await page.evaluate(() => (window as any).__progressStore.getState().currentChapterId)).toBe('kanto-1');
  await page.evaluate(() => (window as any).__progressStore.setState({ badges: ['boulder-badge'] }));
  await screen.getByRole('button', { name: 'Start the chapter', exact: true }).click();
  await expect(screen).toHaveCount(0);
  expect(await page.evaluate(() => (window as any).__progressStore.getState().currentChapterId)).toBe('kanto-2');
  expect(await page.evaluate(() => (window as any).__progressStore.getState().currentStep)).toBe(1);
});

test('mobile Progress and chapter details fit without hiding Continue behind navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await prepare(page);
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('button', { name: 'Progress', exact: true }).click();
  const screen = page.getByRole('region', { name: 'Adventure', exact: true });
  await expect(screen).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  const button = screen.getByRole('button', { name: 'Continue', exact: true });
  await button.scrollIntoViewIfNeeded();
  const box = await button.boundingBox();
  const navigation = await page.getByRole('navigation', { name: 'Mobile navigation' }).boundingBox();
  expect(box!.y + box!.height).toBeLessThanOrEqual(navigation!.y);
  await button.click();
  await expect(page.locator('.adventure-view')).not.toHaveAttribute('hidden');
});

test('chapter summary resumes the selected encounter directly from Progress or Team/PC', async ({ page }) => {
  await prepare(page);
  const before = await page.evaluate(() => {
    const store = (window as any).__progressStore;
    return { chapter: store.getState().currentChapterId, step: store.getState().currentStep, enemy: store.getState().enemy.uid, encounter: store.runtime.encounterId };
  });
  for (const name of ['Progress', 'Team/PC']) {
    await page.getByRole('button', { name, exact: true }).click();
    await page.getByRole('button', { name: 'Resume current adventure', exact: true }).click();
    await expect(page.locator('.adventure-view')).not.toHaveAttribute('hidden');
    await expect(page.getByRole('region', { name: 'Adventure', exact: true })).toHaveCount(0);
    expect(await page.evaluate(() => {
      const store = (window as any).__progressStore;
      return { chapter: store.getState().currentChapterId, step: store.getState().currentStep, enemy: store.getState().enemy.uid, encounter: store.runtime.encounterId };
    })).toEqual(before);
  }
});

test('requested save reset runs once, backs up old data and retains progress on later reloads', async ({ page }) => {
  await prepare(page);
  await page.evaluate(() => {
    const store = (window as any).__progressStore;
    store.setState({ money: 999999, currentStep: 15 });
    store.getState().saveGame(true);
    localStorage.removeItem('pokecatch_reset_20261115_02');
  });
  await page.reload();
  await page.locator('.battle-stage').waitFor();
  const reset = await page.evaluate(async () => {
    const url = performance.getEntriesByType('resource').find(entry => entry.name.includes('/src/store/useGameStore.ts'))!.name;
    const { useGameStore: store } = await import(/* @vite-ignore */ url);
    store.setState({ starterChosen: true, isBattling: false });
    const state = store.getState();
    const result = { money: state.money, step: state.currentStep, party: state.party.map((mon: any) => mon.speciesId), pc: state.pcBox.length,
      backupMoney: JSON.parse(localStorage.getItem('pokecatch_backup_before_reset_20261115_02')!).money };
    store.setState({ money: 1234 }); store.getState().saveGame(true);
    return result;
  });
  expect(reset).toEqual({ money: 3000, step: 1, party: [4], pc: 0, backupMoney: 999999 });
  await page.reload();
  await page.locator('.battle-stage').waitFor();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('pokecatch_save_v1')!).money)).toBe(1234);
});
