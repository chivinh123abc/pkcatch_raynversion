import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';

const bundle = await build({ stdin: { contents: `export * from './src/game/runtime/GameplayRuntime'; export * from './src/game/runtime/gameLoop'; export * from './src/game/runtime/resetLocalSave'; export { createGameStore } from './src/store/useGameStore';`, resolveDir: process.cwd() }, bundle: true, write: false, platform: 'node', format: 'esm', define: { 'process.env.NODE_ENV': '"production"' } });
const { GameplayRuntime, seededRandom, startGameplayLoop, createGameStore, applyRequestedSaveReset } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);

class Clock {
  time = 1800000000000;
  sequence = 0;
  tasks = new Map();
  now = () => this.time;
  setTimeout = (callback, delay) => { const id = ++this.sequence; this.tasks.set(id, { callback, at: this.time + delay }); return id; };
  clearTimeout = id => { this.tasks.delete(id); };
  advance(milliseconds) {
    const until = this.time + milliseconds;
    for (let limit = 0; limit < 10000; limit++) {
      const entry = [...this.tasks].filter(([, t]) => t.at <= until).sort((a,b) => a[1].at - b[1].at)[0];
      if (!entry) { this.time = until; return; }
      this.tasks.delete(entry[0]); this.time = entry[1].at; entry[1].callback();
    }
    throw Error('Timer loop failed to settle');
  }
  stalled(milliseconds) { this.time += milliseconds; const due = [...this.tasks].filter(([, t]) => t.at <= this.time); for (const [id,t] of due) if (this.tasks.delete(id)) t.callback(); }
}

test('requested reset backs up the old save once and preserves all later progress', () => {
  const data = new Map([['pokecatch_save_v1', 'old-save'], ['unrelated', 'keep']]);
  const storage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) };
  assert.equal(applyRequestedSaveReset(storage), true);
  assert.equal(storage.getItem('pokecatch_save_v1'), null);
  assert.equal(storage.getItem('pokecatch_backup_before_reset_20261115_01'), 'old-save');
  storage.setItem('pokecatch_save_v1', 'new-progress');
  assert.equal(applyRequestedSaveReset(storage), false);
  assert.equal(storage.getItem('pokecatch_save_v1'), 'new-progress');
  assert.equal(storage.getItem('unrelated'), 'keep');
});

test('impact, completion and a reentrant completion run once, with no watchdog left behind', () => {
  const clock = new Clock(), runtime = new GameplayRuntime({ clock });
  runtime.beginEncounter();
  let hits = 0, finishes = 0, key;
  key = runtime.beginOperation('combat', { watchdogMs: 100, impact: () => { hits++; runtime.finish('combat', key); }, complete: () => finishes++ });
  runtime.impact('combat', key); runtime.impact('combat', key); runtime.finish('combat', key);
  clock.advance(1000);
  assert.equal(hits, 1); assert.equal(finishes, 1); assert.equal(runtime.pendingTimers, 0);
});

test('queued timers, impacts and capture callbacks from a previous encounter are rejected', () => {
  const clock = new Clock(), runtime = new GameplayRuntime({ clock });
  let writes = 0;
  runtime.beginEncounter();
  runtime.schedule(() => writes++, 100);
  const queued = [...clock.tasks.values()][0].callback;
  const key = runtime.beginOperation('capture', { watchdogMs: 200, complete: () => writes++ });
  runtime.beginEncounter();
  queued(); runtime.finish('capture', key); clock.advance(1000);
  assert.equal(writes, 0); assert.equal(runtime.pendingTimers, 0);
});

test('encounter change during impact cannot finish the old operation in the new encounter', () => {
  const runtime = new GameplayRuntime({ clock: new Clock() });
  let finishes = 0;
  const key = runtime.beginOperation('combat', { watchdogMs: 100, impact: () => runtime.beginEncounter('heal'), complete: () => finishes++ });
  runtime.finish('combat', key);
  assert.equal(finishes, 0); assert.equal(runtime.phase, 'heal');
});

test('watchdog reports a missing renderer and completes the operation exactly once', () => {
  const clock = new Clock(), runtime = new GameplayRuntime({ clock });
  let writes = 0;
  const key = runtime.beginOperation('capture', { watchdogMs: 100, complete: () => writes++ });
  clock.advance(100); runtime.finish('capture', key);
  assert.equal(writes, 1); assert.equal(runtime.pendingTimers, 0);
  assert.equal(runtime.events().filter(e => e.event === 'watchdog').length, 1);
});

test('rewards are guarded against duplicate and reentrant commits, and reset for a new encounter', () => {
  const runtime = new GameplayRuntime({ clock: new Clock() });
  let writes = 0;
  const apply = () => { writes++; runtime.commitReward('ko:a', apply); };
  assert.equal(runtime.commitReward('ko:a', apply), true);
  assert.equal(runtime.commitReward('ko:a', apply), false);
  runtime.beginEncounter(); runtime.commitReward('ko:a', apply);
  assert.equal(writes, 2);
});

test('timer tags replace only their own task, without cancelling another encounter task', () => {
  const clock = new Clock(), runtime = new GameplayRuntime({ clock });
  const calls = [];
  runtime.schedule(() => calls.push('obsolete'), 10, 'heal');
  runtime.schedule(() => calls.push('heal'), 10, 'heal');
  runtime.schedule(() => calls.push('item'), 10, 'item');
  clock.advance(10); assert.deepEqual(calls, ['heal', 'item']);
});

test('real-time buffs catch up after a stalled tab and remain independent of battle speed', () => {
  const clock = new Clock();
  let buffs = 100, attacks = 0;
  const state = { gameSpeed: 1, isBattling: true, tickCombat: () => attacks++, tickBerryBuffs: seconds => buffs -= seconds };
  const stop = startGameplayLoop({ runtime: { clock }, getState: () => state });
  clock.advance(1000); assert.equal(buffs, 99); assert.equal(attacks, 0);
  state.gameSpeed = 3; clock.advance(1200); assert.equal(attacks, 3); assert.equal(buffs, 98);
  state.isBattling = false; clock.stalled(5000);
  assert.equal(buffs, 93); assert.equal(attacks, 3);
  stop(); assert.equal(clock.tasks.size, 0); clock.advance(10000); assert.equal(buffs, 93);
});

const makeStore = (seed = 42) => {
  const clock = new Clock(), store = createGameStore({ clock, random: seededRandom(seed) });
  store.getState().loadStepNode(1);
  store.setState({ isBattling: false, gameSpeed: 1, autoCatch: false });
  return { store, clock };
};

test('separate game stores own independent encounters and damage callbacks', () => {
  const a = makeStore(), b = makeStore();
  a.store.getState().tickCombat(); b.store.getState().tickCombat();
  const effect = b.store.getState().combatEffect;
  const hp = b.store.getState().enemy.currentHp;
  a.store.getState().loadStepNode(1);
  b.store.getState().resolveCombatImpact(effect.key);
  assert.equal(b.store.getState().enemy.currentHp, Math.max(0, hp - effect.damage));
  assert.equal(b.store.runtime.hasOperation('combat'), true);
  assert.equal(a.store.runtime.hasOperation('combat'), false);
});

test('the same clock and seed reproduce encounter, move and damage outcomes', () => {
  const a = makeStore(123), b = makeStore(123);
  a.store.getState().tickCombat(); b.store.getState().tickCombat();
  assert.deepEqual(a.store.getState().enemy, b.store.getState().enemy);
  assert.deepEqual(a.store.getState().combatEffect, b.store.getState().combatEffect);
});

test('changing speed preserves the current request and completion uses its original timing', () => {
  const { store, clock } = makeStore();
  store.getState().tickCombat();
  const effect = store.getState().combatEffect;
  store.getState().setGameSpeed(3);
  assert.equal(store.getState().combatEffect, effect); assert.equal(effect.speed, 1);
  store.getState().finishCombatEffect(effect.key);
  assert.equal(store.getState().combatEffect, null);
  clock.advance(100); assert.equal(store.runtime.busy, true);
});

test('a KO cannot retaliate; repeated finish cannot grant a second KO reward', () => {
  const { store, clock } = makeStore();
  store.setState({ enemy: { ...store.getState().enemy, currentHp: 1 } });
  store.getState().tickCombat();
  const key = store.getState().combatEffect.key;
  store.getState().finishCombatEffect(key);
  const party = store.getState().party;
  store.getState().finishCombatEffect(key); clock.advance(500);
  assert.equal(store.getState().enemy.currentHp, 0);
  assert.equal(store.getState().party, party); assert.equal(store.getState().enemyAttacking, false);
  assert.equal(store.runtime.events().filter(e => e.event === 'reward' && String(e.key).startsWith('ko:')).length, 1);
});

test('cancelled captures cannot consume a second ball or grant rewards through their watchdog', () => {
  const { store, clock } = makeStore();
  store.setState({ selectedBall: 'masterball', berryBuffs: { greatBall: 0, ultraBall: 0, nanab: 0, pinap: 0 } });
  const count = store.getState().party.length;
  store.getState().catchEnemy(); const key = store.getState().capturePresentation.key;
  store.getState().loadStepNode(1); store.getState().finishCapturePresentation(key); clock.advance(30000);
  assert.equal(store.getState().party.length, count); assert.equal(store.getState().balls.masterball, 0);
  assert.equal(store.getState().newCatchCard, null); assert.equal(store.getState().currentStep, 1);
});

test('capture watchdog grants one Pokemon and waits for a single dismissal before advancing', () => {
  const { store, clock } = makeStore();
  store.setState({ selectedBall: 'masterball', berryBuffs: { greatBall: 0, ultraBall: 0, nanab: 0, pinap: 0 } });
  const count = store.getState().party.length;
  store.getState().catchEnemy(); const request = store.getState().capturePresentation;
  store.getState().setGameSpeed(3); assert.equal(request.speed, 1);
  clock.advance(25000); store.getState().finishCapturePresentation(request.key);
  assert.equal(store.getState().party.length, count + 1);
  assert.equal(store.runtime.phase, 'awaiting-continue'); assert.equal(store.getState().currentStep, 1);
  store.getState().dismissNewCatchCard(); store.getState().dismissNewCatchCard(); clock.advance(1000);
  assert.equal(store.getState().currentStep, 2);
});

test('an entirely fainted party heals before returning to step one', () => {
  const { store, clock } = makeStore();
  store.setState({ currentStep: 2, party: store.getState().party.map(mon => ({ ...mon, currentHp: 0 })) });
  store.getState().tickCombat(); clock.advance(1100);
  assert.equal(store.runtime.phase, 'heal'); assert.equal(store.getState().currentStep, 2);
  const key = store.getState().healPresentation.key;
  store.getState().finishHealPresentation(key); store.getState().finishHealPresentation(key);
  assert.equal(store.getState().currentStep, 1);
  assert.equal(store.getState().party[0].currentHp, store.getState().party[0].maxHp);
  assert.equal(store.runtime.pendingTimers, 0);
});

test('trainer replacements finish before the next turn and victory pays only once', () => {
  const { store, clock } = makeStore();
  store.setState({ currentStep: 13 }); store.getState().loadStepNode(13);
  clock.advance(1500);
  const trainer = store.getState().activeTrainer;
  const money = store.getState().money;
  for (let index = 0; index < trainer.team.length; index++) {
    store.setState({ enemy: { ...store.getState().enemy, currentHp: 1 } });
    store.getState().tickCombat();
    const effect = store.getState().combatEffect;
    assert.ok(effect); store.getState().finishCombatEffect(effect.key);
    store.getState().finishCombatEffect(effect.key);
    clock.advance(index === trainer.team.length - 1 ? 500 : 1500);
    if (index < trainer.team.length - 1) assert.equal(store.getState().activeTrainer.currentMonIndex, index + 1);
  }
  assert.equal(store.getState().money, money + trainer.rewardMoney);
  clock.advance(1000); assert.equal(store.getState().money, money + trainer.rewardMoney);
});

test('item completion and its watchdog cannot advance or award the node twice', () => {
  const { store, clock } = makeStore();
  store.setState({ currentStep: 2 }); store.getState().loadStepNode(2);
  const drop = store.getState().activeDrop;
  const money = store.getState().money, berries = store.getState().berries;
  store.getState().finishItemDrop(drop.id); store.getState().finishItemDrop(drop.id);
  clock.advance(30000);
  assert.equal(store.getState().currentStep, 3);
  assert.equal(store.getState().money, money); assert.deepEqual(store.getState().berries, berries);
});

test('combat and capture cannot run concurrently in the same encounter', () => {
  const runtime = new GameplayRuntime({ clock: new Clock() });
  runtime.beginOperation('combat', { watchdogMs: 100, complete() {} });
  assert.throws(() => runtime.beginOperation('capture', { watchdogMs: 100, complete() {} }));
  const { store } = makeStore();
  store.getState().tickCombat(); store.getState().catchEnemy();
  assert.equal(store.getState().capturePresentation, null);
});
