import assert from 'node:assert/strict';
import { beforeEach, afterEach, test } from 'node:test';
import { build } from 'esbuild';

// Bundle the TypeScript store in memory, using the compiler already used by Vite.
const bundle = await build({ entryPoints: ['src/store/useGameStore.ts'], bundle: true, write: false, platform: 'node', format: 'esm', define: { 'process.env.NODE_ENV': '"production"' } });
const { useGameStore: store } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
const baseInitial = store.getInitialState();
const makeTestMon = (speciesId, level, suffix) => ({
  ...baseInitial.party[0],
  uid: `test-${speciesId}-${suffix}`,
  speciesId,
  level,
});
const initial = {
  ...baseInitial,
  party: [
    baseInitial.party[0],
    baseInitial.party[1],
    makeTestMon(45, 100, '3'),
    makeTestMon(149, 100, '4'),
    makeTestMon(6, 100, '5'),
    makeTestMon(9, 100, '6'),
  ],
};
const storage = new Map();
globalThis.localStorage = { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };

beforeEach((t) => {
  t.mock.timers.enable({ apis: ['setTimeout', 'setInterval', 'Date'], now: 1800000000000 });
  storage.clear();
  store.getState().loadStepNode(1);
  store.setState(initial, true);
});
afterEach((t) => { store.getState().loadStepNode(1); t.mock.restoreAll(); t.mock.timers.reset(); });

test('save/load preserves PC, inventory, badges, dex and preferences', () => {
  const pcMon = { ...initial.party[0], uid: 'pc-test', currentHp: 15 };
  store.setState({ pcBox: [pcMon], badges: ['boulder-badge'], pokedexSeen: [16, 19],
    activePartyIndex: 2, selectedBall: 'masterball', balls: { pokeball: 0, greatball: 3, ultraball: 4, masterball: 0 },
    gameSpeed: 2, autoCatch: false, trainerTag: '#test', berryBuffs: { greatBall: 20, ultraBall: 0, nanab: 0, pinap: 18 } });
  store.getState().saveGame(true);
  store.setState(initial, true);
  store.getState().loadGame();
  const state = store.getState();
  assert.deepEqual(state.pcBox, [pcMon]);
  assert.deepEqual(state.badges, ['boulder-badge']);
  assert.equal(state.balls.masterball, 0);
  assert.equal(state.balls.greatball, 3);
  assert.equal(state.activePartyIndex, 2);
  assert.equal(state.selectedBall, 'masterball');
  assert.equal(state.autoCatch, false);
  assert.equal(state.gameSpeed, 2);
  assert.equal(state.trainerTag, '#test');
  assert.equal(state.berryBuffs.pinap, 18);
  assert(state.pokedexSeen.includes(19));
});

test('legacy saves load without new fields and keep zero berry quantities', () => {
  storage.set('pokecatch_save_v1', JSON.stringify({ party: initial.party, pokedexCaught: [16], money: 0, berries: { razz: 0 } }));
  store.getState().loadGame();
  assert.equal(store.getState().money, 0);
  assert.equal(store.getState().berries.razz, 0);
  assert.equal(store.getState().berries.nanab, initial.berries.nanab);
  assert.deepEqual(store.getState().pcBox, []);
  assert(store.getState().pokedexSeen.includes(16));
});

test('invalid saved party and counters cannot break the battle state', () => {
  storage.set('pokecatch_save_v1', JSON.stringify({ party: [{ uid: 'broken' }], pcBox: [null], balls: { greatball: -99 }, pokedexCaught: 'bad', berryBuffs: { nanab: 999999 }, currentStep: -999 }));
  store.getState().loadGame();
  assert.equal(store.getState().party.length, 6);
  assert.equal(store.getState().balls.greatball, initial.balls.greatball);
  assert.equal(store.getState().berryBuffs.nanab, 28800);
  assert(Array.isArray(store.getState().pokedexCaught));
  assert.equal(store.getState().currentStep, 1);
});

test('deposit and withdrawal preserve Pokemon identity, HP and active member', () => {
  const mon = initial.party[1];
  assert.equal(store.getState().depositPokemon(mon.uid), true);
  assert.equal(store.getState().party.length, 5);
  assert.equal(store.getState().pcBox[0].uid, mon.uid);
  assert.equal(store.getState().withdrawPokemon(mon.uid), true);
  assert.equal(store.getState().party.length, 6);
  assert.equal(store.getState().party[5].currentHp, mon.currentHp);
  assert.equal(store.getState().pcBox.length, 0);
  assert.equal(store.getState().party[store.getState().activePartyIndex].uid, initial.party[0].uid);
});

test('full teams exchange the selected slot with PC without losing either Pokemon', () => {
  const pcMon = { ...initial.party[0], uid: 'pc-test' };
  store.setState({ pcBox: [pcMon] });
  assert.equal(store.getState().withdrawPokemon(pcMon.uid), false);
  assert.equal(store.getState().withdrawPokemon(pcMon.uid, initial.party[2].uid), true);
  assert.equal(store.getState().party[2].uid, pcMon.uid);
  assert.equal(store.getState().pcBox[0].uid, initial.party[2].uid);
  assert.equal(new Set([...store.getState().party, ...store.getState().pcBox].map((p) => p.uid)).size, 7);
});

test('the final healthy party member cannot be deposited or swapped for a fainted one', () => {
  store.setState({ party: [initial.party[0]], pcBox: [{ ...initial.party[1], currentHp: 0 }] });
  assert.equal(store.getState().depositPokemon(initial.party[0].uid), false);
  assert.equal(store.getState().withdrawPokemon(initial.party[1].uid, initial.party[0].uid), false);
});

test('reordering keeps the same active Pokemon and rejects invalid indices', () => {
  const uid = initial.party[0].uid;
  assert.equal(store.getState().movePartyMember(uid, -1), false);
  assert.equal(store.getState().movePartyMember(uid, 1), true);
  assert.equal(store.getState().activePartyIndex, 1);
  assert.equal(store.getState().party[1].uid, uid);
  store.getState().setActivePartyIndex(999);
  assert.equal(store.getState().activePartyIndex, 1);
});

test('team changes are rejected during capture and healing', () => {
  store.setState({ isCatchSequenceActive: true });
  assert.equal(store.getState().depositPokemon(initial.party[0].uid), false);
  assert.equal(store.getState().movePartyMember(initial.party[0].uid, 1), false);
  store.setState({ isCatchSequenceActive: false, healPulse: true });
  assert.equal(store.getState().depositPokemon(initial.party[0].uid), false);
});

test('loading an item-node save skips its already-awarded reward', () => {
  storage.set('pokecatch_save_v1', JSON.stringify({ currentChapterId: 'kanto-1', currentStep: 2, money: 100 }));
  store.getState().loadGame();
  assert.equal(store.getState().currentStep, 3);
  assert.equal(store.getState().money, 100);
});

test('HP changes on the engine contact callback, exactly once', () => {
  store.setState({ autoCatch: false, activePartyIndex: 4 }); // Charizard (Fire/Flying) deals reliable damage to Pidgey
  const hp = store.getState().enemy.currentHp;
  store.getState().tickCombat();
  const key = store.getState().combatEffect.key;
  assert.equal(store.getState().enemy.currentHp, hp);
  store.getState().resolveCombatImpact(key + 1);
  assert.equal(store.getState().enemy.currentHp, hp);
  store.getState().resolveCombatImpact(key);
  const after = store.getState().enemy.currentHp;
  assert(after < hp);
  store.getState().resolveCombatImpact(key);
  assert.equal(store.getState().enemy.currentHp, after);
});

test('changing nodes discards the old impact callback', () => {
  store.getState().tickCombat();
  const key = store.getState().combatEffect.key;
  store.getState().loadStepNode(3);
  const hp = store.getState().enemy.currentHp;
  store.getState().resolveCombatImpact(key);
  assert.equal(store.getState().enemy.currentHp, hp);
});

test('capture rewards wait for the presentation and cannot be applied twice', () => {
  store.setState({ selectedBall: 'masterball', berryBuffs: { greatBall: 0, ultraBall: 0, nanab: 0, pinap: 0 }, pokedexCaught: [4] });
  store.getState().catchEnemy();
  const presentation = store.getState().capturePresentation;
  assert.equal(store.getState().catchPhase, 'throw');
  assert.equal(store.getState().pcBox.length, 0);
  store.getState().finishCapturePresentation(presentation.key);
  assert.equal(store.getState().catchPhase, 'reward');
  assert.equal(store.getState().pcBox.length, 1);
  store.getState().finishCapturePresentation(presentation.key);
  assert.equal(store.getState().pcBox.length, 1);
});

test('berry ball shown by the renderer matches the capture ball without consuming inventory', () => {
  const count = store.getState().balls.greatball;
  store.getState().catchEnemy();
  assert.equal(store.getState().capturePresentation.ball, 'greatball');
  assert.equal(store.getState().balls.greatball, count);
});
