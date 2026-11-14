import { test, expect, Page } from '@playwright/test';

async function prepare(page: Page) {
  await page.goto('/');
  await page.locator('.battle-stage').waitFor();
  await page.evaluate(async () => {
    // Resolve the module used by React, including Vite's development version.
    const url = performance.getEntriesByType('resource').find(e => e.name.includes('/src/store/useGameStore.ts'))!.name;
    const { useGameStore: store } = await import(/* @vite-ignore */ url);
    (window as any).__arenaStore = store;
    store.getState().loadStepNode(1);
    store.setState({ isBattling: false, autoCatch: false });
  });
  await page.locator('canvas[data-transition="dither"]').waitFor({ state: 'detached' });
}

test('battle geometry follows the original proportions at both desktop sizes', async ({ page }) => {
  await prepare(page);
  for (const width of [1374, 1904]) {
    await page.setViewportSize({ width, height: 918 });
    await expect.poll(async () => {
      return page.locator('.battle-stage').evaluate(el => Number(getComputedStyle(el).getPropertyValue('--k')));
    }).toBe(width === 1374 ? 3 : 4);
    const stage = await page.locator('.battle-stage').boundingBox();
    expect(Math.abs(stage!.width / stage!.height - 16 / 9)).toBeLessThan(.01);
    const positions = await page.locator('.battle-stage').evaluate(el => {
      const ally = el.querySelector('.battle-mon.ally') as HTMLElement;
      const enemy = el.querySelector('.battle-mon.enemy') as HTMLElement;
      return { ally: parseFloat(getComputedStyle(ally).left) / el.clientWidth, enemy: parseFloat(getComputedStyle(enemy).left) / el.clientWidth };
    });
    expect(positions.ally).toBeCloseTo(.30, 2);
    expect(positions.enemy).toBeCloseTo(.78, 2);
  }
});

test('actual move contact updates HP and accelerates at x3', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await prepare(page);
  const timings: number[] = [];
  for (const speed of [1, 3]) {
    timings.push(await page.evaluate(async speed => {
      const store = (window as any).__arenaStore;
      store.getState().loadStepNode(1);
      store.setState({ isBattling: false, autoCatch: false, gameSpeed: speed });
      const random = Math.random;
      Math.random = () => .1;
      const hp = store.getState().enemy.currentHp;
      const start = performance.now();
      return await new Promise<number>(resolve => {
        const unsubscribe = store.subscribe((state: any) => {
          if (state.enemy?.currentHp < hp) {
            unsubscribe(); Math.random = random; resolve(performance.now() - start);
          }
        });
        store.getState().tickCombat();
      });
    }, speed));
  }
  expect(timings[0]).toBeGreaterThan(100);
  expect(timings[0]).toBeLessThan(2000); // Must use the renderer, never the 3.25s watchdog.
  expect(timings[1]).toBeLessThan(timings[0] * .7);
  expect(errors).toEqual([]);
});

test('capture animation finishes before rewarding or advancing the node', async ({ page }) => {
  const warnings: string[] = [];
  page.on('console', message => { if (message.text().includes('Capture presentation failed')) warnings.push(message.text()); });
  await prepare(page);
  const startStep = await page.evaluate(() => {
    const store = (window as any).__arenaStore;
    store.setState({ selectedBall: 'masterball', gameSpeed: 3, berryBuffs: { greatBall: 0, ultraBall: 0, nanab: 0, pinap: 0 } });
    store.getState().catchEnemy();
    return store.getState().currentStep;
  });
  await expect(page.locator('.capture-sequence')).toBeAttached();
  expect(await page.evaluate(() => (window as any).__arenaStore.getState().catchPhase)).toBe('throw');
  await page.waitForFunction(() => (window as any).__arenaStore.getState().catchPhase === 'reward', undefined, { timeout: 8000 });
  expect(await page.evaluate(() => (window as any).__arenaStore.getState().currentStep)).toBe(startStep);
  expect(warnings).toEqual([]);
});

test('successful duplicate captures use the original quick sequence', async ({ page }) => {
  const warnings: string[] = [];
  page.on('console', message => { if (message.text().includes('Capture presentation failed')) warnings.push(message.text()); });
  await prepare(page);
  await page.evaluate(() => {
    const store = (window as any).__arenaStore;
    store.setState({ pokedexCaught: [...store.getState().pokedexCaught, store.getState().enemy.speciesId], selectedBall:'masterball', gameSpeed:3, berryBuffs:{greatBall:0,ultraBall:0,nanab:0,pinap:0} });
    store.getState().catchEnemy();
  });
  await expect(page.locator('.capture-sequence .cb-pos')).toBeAttached();
  await page.waitForFunction(() => (window as any).__arenaStore.getState().catchPhase === 'reward', undefined, { timeout: 8000 });
  expect(warnings).toEqual([]);
});
