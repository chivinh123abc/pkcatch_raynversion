import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';

const data = new Map();
globalThis.localStorage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
const bundle = await build({ entryPoints: ['src/store/useGameStore.ts'], bundle: true, write: false, platform: 'node', format: 'esm', define: { 'process.env.NODE_ENV': '"production"' } });
const { createGameStore } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);

test('title hydration preserves the save without starting a Gym presentation or encounter timers', () => {
  const tasks = new Map(); let id = 0;
  const clock = { now: () => 1800000000000, setTimeout: (fn, ms) => { tasks.set(++id, { fn, ms }); return id; }, clearTimeout: key => tasks.delete(key) };
  const source = createGameStore({ clock });
  source.getState().chooseStarter(4, { name: 'Kept', sprite: 'leaf' });
  const payload = JSON.parse(data.get('pokecatch_save_v1'));
  payload.currentStep = 20; payload.encounterCheckpoint = null;
  const raw = JSON.stringify(payload); data.set('pokecatch_save_v1', raw);
  const store = createGameStore({ clock });
  store.getState().loadGame({ deferEncounter: true });
  assert.equal(store.getState().trainerName, 'Kept');
  assert.equal(store.getState().currentStep, 20);
  assert.equal(store.getState().trainerPresentation, null);
  assert.equal(store.getState().healPresentation, null);
  assert.equal(tasks.size, 0);
  assert.equal(data.get('pokecatch_save_v1'), raw);
  store.getState().loadGame();
  assert.equal(store.getState().trainerPresentation?.kind, 'gym');
  assert.ok(tasks.size > 0);
  source.runtime.beginEncounter(); store.runtime.beginEncounter();
});
