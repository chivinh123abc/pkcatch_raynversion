import { test, expect } from '@playwright/test';

test('requested local grant applies on ordinary reload, preserves the save and opens PC once', async ({ page }) => {
  test.setTimeout(60000);
  await page.goto('/', {waitUntil:'domcontentloaded'});
  await page.locator('.battle-stage').waitFor();
  const before = await page.evaluate(async () => {
    const url = performance.getEntriesByType('resource').find(entry => entry.name.includes('/src/store/useGameStore.ts'))!.name;
    const { useGameStore: store } = await import(/* @vite-ignore */ url);
    store.setState({ starterChosen: true, isBattling: false });
    store.getState().saveGame(true);
    return JSON.parse(localStorage.getItem('pokecatch_save_v1')!);
  });
  await page.goto('/', {waitUntil:'domcontentloaded'});
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('button', { name: 'PC Mewtwo, level 20', exact: true }).first()).toBeVisible();
  await expect(page.locator('.pc-cell')).toHaveCount(before.pcBox.length + 36);
  await expect(page.getByRole('button', { name: 'PC Mew, level 20', exact: true }).first()).toBeVisible();
  const shinies=await page.evaluate(()=>JSON.parse(localStorage.getItem('pokecatch_save_v1')!).pcBox.filter((mon:any)=>mon.isShiny));
  expect(shinies).toHaveLength(24);expect(shinies.every((mon:any)=>mon.currentHp===mon.maxHp&&mon.level===20)).toBe(true);
  expect(new URL(page.url()).searchParams.has('rarity-test')).toBe(false);
  const backup = await page.evaluate(() => JSON.parse(localStorage.getItem('pokecatch_backup_before_rarity_test_20261116_04')!));
  expect(backup.party).toEqual(before.party);
  expect(backup.pcBox).toEqual(before.pcBox);
  expect(backup.currentChapterId).toBe(before.currentChapterId);
  expect(backup.currentStep).toBe(before.currentStep);
  await page.goto('/?rarity-test=1', {waitUntil:'domcontentloaded'});
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.locator('.pc-cell')).toHaveCount(before.pcBox.length + 36);
});
