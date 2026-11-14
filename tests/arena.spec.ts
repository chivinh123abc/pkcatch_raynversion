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

for (const width of [1374, 390]) {
  test(`capture success stays above the battle log at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await prepare(page);
    await page.evaluate(() => {
      const store = (window as any).__arenaStore;
      store.setState({ selectedBall: 'masterball', gameSpeed: 1, pokedexCaught: [4], berryBuffs: { greatBall: 0, ultraBall: 0, nanab: 0, pinap: 0 } });
      store.getState().catchEnemy();
    });
    const result = page.locator('.capture-result');
    await expect(result).toBeVisible({ timeout: 10000 });
    const gap = await page.locator('.battle-stage').evaluate(stage => {
      const result = stage.querySelector('.capture-result')!.getBoundingClientRect();
      const log = stage.querySelector('.battle-log')!.getBoundingClientRect();
      return log.top - result.bottom;
    });
    expect(gap).toBeGreaterThanOrEqual(8);
  });
}

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

test('speed changes and Team/PC navigation preserve an active capture request', async ({ page }) => {
  await prepare(page);
  const key = await page.evaluate(() => {
    const store = (window as any).__arenaStore;
    store.setState({ selectedBall: 'masterball', gameSpeed: 1, berryBuffs: { greatBall: 0, ultraBall: 0, nanab: 0, pinap: 0 } });
    store.getState().catchEnemy();
    return store.getState().capturePresentation.key;
  });
  await expect(page.locator('.capture-sequence')).toBeAttached();
  await page.evaluate(() => {
    const store = (window as any).__arenaStore;
    (window as any).__captureElement = document.querySelector('.capture-sequence');
    store.getState().setGameSpeed(3);
  });
  await page.getByRole('button', { name: 'Team/PC', exact: true }).first().click();
  const request = await page.evaluate(() => {
    const store = (window as any).__arenaStore;
    return { key: store.getState().capturePresentation?.key, speed: store.getState().capturePresentation?.speed, sameElement: document.querySelector('.capture-sequence') === (window as any).__captureElement };
  });
  expect(request).toEqual({ key, speed: 1, sameElement: true });
  await page.waitForFunction(() => (window as any).__arenaStore.getState().catchPhase === 'reward', undefined, { timeout: 12000 });
  expect(await page.evaluate(() => (window as any).__arenaStore.runtime.events().filter((e: any) => e.event === 'reward' && String(e.key).startsWith('capture:')).length)).toBe(1);
});

test('changing speed during a real move preserves its key and contact happens once', async ({ page }) => {
  await prepare(page);
  await page.evaluate(() => {
    const store = (window as any).__arenaStore;
    store.setState({ gameSpeed: 1 });
    store.getState().tickCombat();
    (window as any).__effect = store.getState().combatEffect;
    store.getState().setGameSpeed(3);
  });
  expect(await page.evaluate(() => {
    const store = (window as any).__arenaStore;
    return store.getState().combatEffect === (window as any).__effect && store.getState().combatEffect.speed === 1;
  })).toBe(true);
  await page.waitForFunction(() => (window as any).__arenaStore.runtime.events().some((e: any) => e.event === 'combat:finish' && e.key === (window as any).__effect.key));
  expect(await page.evaluate(() => (window as any).__arenaStore.runtime.events().filter((e: any) => e.event === 'combat:impact' && e.key === (window as any).__effect.key).length)).toBe(1);
});

test('healing keeps its animation on speed changes and Skip completes only its own node', async ({ page }) => {
  await prepare(page);
  await page.evaluate(() => {
    const store = (window as any).__arenaStore;
    store.setState({ gameSpeed: 1, currentStep: 6 });
    store.getState().loadStepNode(6);
    (window as any).__healKey = store.getState().healPresentation.key;
  });
  await expect(page.locator('.heal-fx')).toBeAttached();
  await page.evaluate(() => {
    (window as any).__healElement = document.querySelector('.heal-fx');
    (window as any).__arenaStore.getState().setGameSpeed(3);
  });
  expect(await page.evaluate(() => document.querySelector('.heal-fx') === (window as any).__healElement)).toBe(true);
  await page.getByRole('button', { name: 'SKIP ▸▸' }).click();
  await expect.poll(() => page.evaluate(() => (window as any).__arenaStore.getState().currentStep)).toBe(7);
  await page.evaluate(() => (window as any).__arenaStore.getState().finishHealPresentation((window as any).__healKey));
  expect(await page.evaluate(() => (window as any).__arenaStore.getState().currentStep)).toBe(7);
  await expect(page.locator('.heal-fx')).toHaveCount(0);
});

test('reloading an encounter discards native capture layers and late rewards', async ({ page }) => {
  await prepare(page);
  await page.evaluate(() => {
    const store = (window as any).__arenaStore;
    store.setState({ selectedBall: 'masterball', gameSpeed: 1, berryBuffs: { greatBall: 0, ultraBall: 0, nanab: 0, pinap: 0 } });
    (window as any).__partyLength = store.getState().party.length;
    store.getState().catchEnemy();
    (window as any).__captureKey = store.getState().capturePresentation.key;
  });
  await expect(page.locator('.capture-sequence')).toBeAttached();
  await page.evaluate(() => {
    const store = (window as any).__arenaStore;
    store.getState().loadStepNode(1);
    store.getState().finishCapturePresentation((window as any).__captureKey);
  });
  await expect(page.locator('.capture-sequence')).toHaveCount(0);
  await page.waitForTimeout(1500);
  expect(await page.evaluate(() => {
    const store = (window as any).__arenaStore;
    return { sameParty: store.getState().party.length === (window as any).__partyLength, phase: store.runtime.phase, layers: document.querySelectorAll('[data-effect-layer]').length, visible: getComputedStyle(document.querySelector('.battle-mon.enemy img')!).visibility };
  })).toEqual({ sameParty: true, phase: 'battle', layers: 0, visible: 'visible' });
});
