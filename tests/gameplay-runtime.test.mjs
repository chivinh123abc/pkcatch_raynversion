globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';

const bundle = await build({ stdin: { contents: `export * from './src/game/runtime/GameplayRuntime'; export * from './src/game/runtime/gameLoop'; export * from './src/game/runtime/resetLocalSave'; export * from './src/game/domain/chapterOne'; export * from './src/game/domain/status'; export { createGameStore } from './src/store/useGameStore';`, resolveDir: process.cwd() }, bundle: true, write: false, platform: 'node', format: 'esm', define: { 'process.env.NODE_ENV': '"production"' } });
const { GameplayRuntime, seededRandom, startGameplayLoop, createGameStore, applyRequestedSaveReset, chooseBattleMove, levelExperience, beforeTurn, afterTurn, rareEncounterWeight } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text + '\n//# sourceURL=runtime-test-bundle.js').toString('base64')}`);

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

// Headless tests acknowledge the same presentation callbacks as the browser renderer.
function completeTrainer(store,clock) {
  const request=store.getState().trainerPresentation;if(!request)return;
  if(request.stage==='intro')store.getState().finishTrainerIntro(request.key);
  store.getState().finishTrainerPresentation(request.key);clock.advance(400);
}

test('requested reset backs up the old save once and preserves all later progress', () => {
  const data = new Map([['pokecatch_save_v1', 'old-save'], ['unrelated', 'keep']]);
  const storage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) };
  assert.equal(applyRequestedSaveReset(storage), true);
  assert.equal(storage.getItem('pokecatch_save_v1'), null);
  assert.equal(storage.getItem('pokecatch_backup_before_reset_20261115_02'), 'old-save');
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
  clock.advance(1000); assert.equal(buffs, 99); assert.equal(attacks, 3);
  state.gameSpeed = 3; clock.advance(1200); assert.equal(attacks, 10); assert.equal(buffs, 98);
  state.isBattling = false; clock.stalled(5000);
  assert.equal(buffs, 93); assert.equal(attacks, 10);
  stop(); assert.equal(clock.tasks.size, 0); clock.advance(10000); assert.equal(buffs, 93);
});

const makeStore = (seed = 42) => {
  const clock = new Clock(), store = createGameStore({ clock, random: seededRandom(seed) });
  store.getState().loadStepNode(1);
  store.setState({ starterChosen: true, isBattling: false, gameSpeed: 1, autoCatch: false });
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

test('both actors retain recovery plus queue time and changing node cancels the queued reply',()=>{
  const clock=new Clock(),store=createGameStore({clock,random:()=>.5});
  store.getState().loadStepNode(1);
  const base=store.getState().party[0],enemy=store.getState().enemy;
  store.setState({starterChosen:true,isBattling:false,autoCatch:false,gameSpeed:1,activePartyIndex:0,
    party:[{...base,uid:'timing-ally',speciesId:19,level:1,currentHp:999,maxHp:999,stats:{...base.stats,speed:999}}],
    enemy:{...enemy,uid:'timing-enemy',speciesId:19,level:1,currentHp:999,maxHp:999,stats:{...enemy.stats,speed:1}}});
  for(const target of ['enemy','player']){
    store.getState().tickCombat();
    const effect=store.getState().combatEffect;assert.equal(effect.target,target);
    store.getState().finishCombatEffect(effect.key);
    clock.advance(584);store.getState().tickCombat();assert.equal(store.getState().combatEffect,null);
    clock.advance(1);
  }
  store.getState().tickCombat();assert.equal(store.getState().combatEffect.target,'enemy');
  store.getState().finishCombatEffect(store.getState().combatEffect.key);
  store.getState().loadStepNode(2);clock.advance(1000);
  assert.equal(store.getState().currentStep,2);assert.equal(store.getState().combatEffect,null);
});

test('a KO cannot retaliate; repeated finish cannot grant a second KO reward', () => {
  const { store, clock } = makeStore();
  store.setState({ enemy: { ...store.getState().enemy, currentHp: 1 } });
  store.getState().tickCombat();
  const key = store.getState().combatEffect.key;
  store.getState().finishCombatEffect(key);
  clock.advance(710); // Native recovery precedes KO rewards.
  const party = store.getState().party;
  store.getState().finishCombatEffect(key); clock.advance(100);
  assert.equal(store.getState().enemy.currentHp, 0);
  assert.equal(store.getState().party, party); assert.equal(store.getState().enemyAttacking, false);
  assert.equal(store.runtime.events().filter(e => e.event === 'reward' && String(e.key).startsWith('ko:')).length, 1);
});

test('cancelled captures cannot consume a second ball or grant rewards through their watchdog', () => {
  const { store, clock } = makeStore();
  store.setState({ balls: { pokeball: 0, greatball: 0, ultraball: 0, masterball: 1 }, selectedBall: 'masterball', berryBuffs: { greatBall: 0, ultraBall: 0, nanab: 0, pinap: 0 } });
  const count = store.getState().party.length;
  store.getState().catchEnemy(); const key = store.getState().capturePresentation.key;
  store.getState().loadStepNode(1); store.getState().finishCapturePresentation(key); clock.advance(30000);
  assert.equal(store.getState().party.length, count); assert.equal(store.getState().balls.masterball, 0);
  assert.equal(store.getState().newCatchCard, null); assert.equal(store.getState().currentStep, 1);
});

test('capture watchdog grants one Pokemon and waits for a single dismissal before advancing', () => {
  const { store, clock } = makeStore();
  store.setState({ balls: { pokeball: 0, greatball: 0, ultraball: 0, masterball: 1 }, selectedBall: 'masterball', berryBuffs: { greatBall: 0, ultraBall: 0, nanab: 0, pinap: 0 } });
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
  completeTrainer(store,clock);
  const trainer = store.getState().activeTrainer;
  const money = store.getState().money;
  for (let index = 0; index < trainer.team.length; index++) {
    store.setState({ enemy: { ...store.getState().enemy, currentHp: 1 } });
    store.getState().tickCombat();
    for (let turns = 0; store.getState().enemy.currentHp > 0 && turns < 10; turns++) {
      const effect = store.getState().combatEffect;
      if (effect) { store.getState().finishCombatEffect(effect.key); store.getState().finishCombatEffect(effect.key); }
      clock.advance(300);
    }
    clock.advance(1500); // Includes the hit recovery before recall/victory.
    if (index < trainer.team.length - 1) { assert.equal(store.getState().activeTrainer.currentMonIndex, index + 1); completeTrainer(store,clock); }
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

for (const [starter, speed] of [[7,1], [7,2], [7,3], [1,3], [4,3]]) test(`fresh starter #${starter} can complete Chapter 1 and unlock Cascade at x${speed}`, () => {
  const clock = new Clock(), store = createGameStore({ clock, random: seededRandom(42) });
  assert.equal(store.getState().starterChosen, false);
  assert.equal(store.getState().money, 3000);
  store.getState().chooseStarter(starter);
  store.setState({ gameSpeed: speed, isBattling: false });
  const nodes = new Set();
  let iterations = 0;
  for (; iterations < 60000 && store.getState().currentChapterId === 'kanto-1'; iterations++) {
    const state = store.getState(); nodes.add(state.nodeType);
    if (state.newCatchCard) state.dismissNewCatchCard();
    else if (state.trainerPresentation) { const request=state.trainerPresentation; if(request.stage==='intro')state.finishTrainerIntro(request.key);else state.finishTrainerPresentation(request.key); }
    else if (state.healPresentation) state.finishHealPresentation(state.healPresentation.key);
    else if (state.activeDrop) state.finishItemDrop(state.activeDrop.id);
    else if (state.combatEffect) state.finishCombatEffect(state.combatEffect.key);
    else if (state.capturePresentation) state.finishCapturePresentation(state.capturePresentation.key);
    else state.tickCombat();
    clock.advance(100 / speed);
  }
  assert.equal(store.getState().currentChapterId, 'kanto-2', `stalled after ${iterations}: ${JSON.stringify({ step: store.getState().currentStep, phase: store.runtime.phase, busy:store.runtime.busy, pending:store.runtime.pendingTimers, tasks:[...clock.tasks.values()].map(t=>({at:t.at,now:clock.time})), log: store.getState().battleLog, team: store.getState().party.map(m => [m.speciesId,m.level,m.currentHp]) })}`);
  assert.deepEqual([...nodes].sort(), ['badge','center','grass','question','red']);
  assert.equal(store.getState().badges.filter(b => b === 'boulder-badge').length, 1);
  assert.equal(store.getState().currentStep, 1);
});

test('reference XP thresholds, learned moves and status durations replace demo shortcuts', () => {
  assert.equal(levelExperience(5), 144); assert.equal(levelExperience(15), 1937);
  const { store } = makeStore();
  const mon = store.getState().party[0], enemy = store.getState().enemy;
  assert.equal(chooseBattleMove({ ...mon, level: 1 }, enemy).key, 'scratch');
  const asleep = { ...mon, status: 'sleep', sleepTurns: 2 };
  const first = beforeTurn(asleep, () => .5), second = beforeTurn(first.mon, () => .5), third = beforeTurn(second.mon, () => .5);
  assert.equal(first.skip, true); assert.equal(second.skip, true); assert.equal(third.skip, false); assert.equal(third.mon.status, undefined);
  assert.equal(afterTurn({ ...mon, currentHp: 1, status: 'poison' }).currentHp, 0);
});

test('a shiny capture of an owned species keeps the shiny instead of converting it to duplicate XP', () => {
  const { store } = makeStore();
  const mon = store.getState().party[0];
  store.setState({ enemy: { ...mon, uid: 'shiny-wild', isShiny: true }, balls: { pokeball: 0, greatball: 0, ultraball: 0, masterball: 1 }, selectedBall: 'masterball' });
  store.getState().catchEnemy(); const effect = store.getState().capturePresentation;
  assert.equal(effect.duplicate, false); store.getState().finishCapturePresentation(effect.key);
  assert.ok(store.getState().party.some(m => m.uid === 'shiny-wild' && m.isShiny));
});

test('refreshing a trainer KO resumes its next Pokemon without granting the defeated Pokemon XP again', () => {
  const previous = globalThis.localStorage, data = new Map();
  globalThis.localStorage = { getItem: key => data.get(key) ?? null, setItem: (key,value) => data.set(key,value), removeItem: key => data.delete(key) };
  try {
    const { store, clock } = makeStore();
    store.setState({ currentStep: 13 }); store.getState().loadStepNode(13); clock.advance(1500);
    completeTrainer(store,clock);
    store.setState({ enemy: { ...store.getState().enemy, currentHp: 0 } });
    store.getState().tickCombat();
    const experience = store.getState().party[0].exp;
    const uid = store.getState().enemy.uid;
    const resumedClock = new Clock(), resumed = createGameStore({ clock: resumedClock, random: seededRandom(42) });
    resumed.getState().loadGame();
    assert.equal(resumed.getState().enemy.uid, uid); assert.equal(resumed.getState().enemy.currentHp, 0);
    resumed.getState().tickCombat(); resumedClock.advance(1500);
    assert.equal(resumed.getState().party[0].exp, experience);
    assert.equal(resumed.getState().activeTrainer.currentMonIndex, 1);
  } finally { globalThis.localStorage = previous; }
});

test('refresh during capture reuses its outcome and consumes the master ball only once', () => {
  const previous = globalThis.localStorage, data = new Map();
  globalThis.localStorage = { getItem: key => data.get(key) ?? null, setItem: (key,value) => data.set(key,value), removeItem: key => data.delete(key) };
  try {
    const { store } = makeStore();
    store.setState({ selectedBall: 'masterball', balls: { pokeball: 0, greatball: 0, ultraball: 0, masterball: 1 } });
    store.getState().catchEnemy(); const outcome = store.getState().captureRoll;
    const resumed = createGameStore({ clock: new Clock(), random: () => .999 });
    resumed.getState().loadGame();
    assert.deepEqual(resumed.getState().captureRoll, outcome);
    assert.equal(resumed.getState().balls.masterball, 0);
    resumed.getState().finishCapturePresentation(resumed.getState().capturePresentation.key);
    assert.equal(resumed.getState().party.length, 2);
  } finally { globalThis.localStorage = previous; }
});

test('duplicate XP is credited only to matching family members in party and PC', () => {
  const { store } = makeStore();
  const charmander = store.getState().party[0];
  const pidgey = { ...charmander, speciesId: 16, uid: 'pidgey' };
  const pcCharmeleon = { ...charmander, speciesId: 5, uid: 'charmeleon' };
  store.setState({ party: [charmander, pidgey], pcBox: [pcCharmeleon], enemy: { ...charmander, uid: 'duplicate' } });
  store.getState().catchEnemy(); const effect = store.getState().capturePresentation;
  assert.equal(effect.success, true); assert.equal(effect.duplicate, true);
  store.getState().finishCapturePresentation(effect.key);
  const state = store.getState();
  assert.equal(state.party[1].exp, 0);
  assert.equal(state.party[0].exp, 72); assert.equal(state.pcBox[0].exp, 72);
  assert.equal(state.duplicatePopup.amount, 144);
  assert.equal(state.party.length + state.pcBox.length, 3);
});

test('resuming a completed grass node still grants the following fixed item rather than skipping it', () => {
  const previous = globalThis.localStorage, data = new Map();
  globalThis.localStorage = { getItem: key => data.get(key) ?? null, setItem: (key,value) => data.set(key,value), removeItem: key => data.delete(key) };
  try {
    const { store } = makeStore();
    store.setState({ currentStep: 4, resolvedNode: { chapterId: 'kanto-1', step: 4 } });
    store.getState().saveGame(true);
    const resumed = createGameStore({ clock: new Clock(), random: seededRandom(42) });
    resumed.getState().loadGame();
    assert.equal(resumed.getState().currentStep, 5);
    assert.equal(resumed.getState().activeDrop.type, 'item');
    assert.equal(resumed.getState().items['exp-candy-s'], 1);
  } finally { globalThis.localStorage = previous; }
});

test('all three starters can be chosen only once without granting demo inventory', () => {
  for (const id of [1,4,7]) {
    const store = createGameStore({ clock: new Clock(), random: seededRandom(42) });
    store.getState().chooseStarter(999); assert.equal(store.getState().starterChosen, false);
    store.getState().chooseStarter(id); store.getState().chooseStarter(id === 1 ? 7 : 1);
    assert.deepEqual(store.getState().party.map(mon => mon.speciesId), [id]);
    assert.equal(store.getState().party[0].level, 5);
    assert.equal(store.getState().money, 3000); assert.equal(store.getState().tokens, 0);
    assert.equal(Object.values(store.getState().berries).reduce((a,b) => a+b,0), 0);
  }
});

test('refresh after Brock victory retains the badge and payout and starts the unlocked chapter', () => {
  const previous = globalThis.localStorage, data = new Map();
  globalThis.localStorage = { getItem: key => data.get(key) ?? null, setItem: (key,value) => data.set(key,value), removeItem: key => data.delete(key) };
  try {
    const { store, clock } = makeStore();
    store.setState({ currentStep: 20 }); store.getState().loadStepNode(20); clock.advance(2900);
    completeTrainer(store,clock);
    const money = store.getState().money;
    store.setState({ enemy: { ...store.getState().enemy, currentHp: 0 } });store.getState().tickCombat();clock.advance(1500);
    completeTrainer(store,clock);
    store.setState({ enemy: { ...store.getState().enemy, currentHp: 0 } });store.getState().tickCombat();clock.advance(500);
    assert.equal(store.getState().money - money, 1260);
    const resumed = createGameStore({ clock: new Clock(), random: seededRandom(42) });resumed.getState().loadGame();
    assert.equal(resumed.getState().currentChapterId, 'kanto-2');
    assert.deepEqual(resumed.getState().badges, ['boulder-badge']);
    assert.equal(resumed.getState().money, money + 1260);
  } finally { globalThis.localStorage = previous; }
});

test('Nanab doubles rare weights without boosting common or legendary species', () => {
  assert.equal(rareEncounterWeight(123, 10, 2), 20);
  assert.equal(rareEncounterWeight(16, 10, 2), 10);
  assert.equal(rareEncounterWeight(150, 10, 2), 10);
});
