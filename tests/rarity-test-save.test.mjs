import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';

const bundle = await build({ entryPoints: ['src/game/runtime/rarityTestSave.ts'], bundle: true, write: false, platform: 'node', format: 'esm' });
const { addRarityTestPokemon, RARITY_TEST_SPECIES, RARITY_TEST_MARKER, RARITY_TEST_BACKUP } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
const key = 'pokecatch_save_v1';
const original = { version: 2, saveVersion: 4, starterChosen: true,
  party: [{ uid: 'my-starter', speciesId: 4, currentHp: 3 }], pcBox: [{ uid: 'my-catch', speciesId: 10 }],
  pokedexCaught: [4, 10], pokedexSeen: [4, 10, 11], currentChapterId: 'kanto-3', currentStep: 7,
  money: 1234, partyPresets: [['my-starter']], encounterCheckpoint: { enemyHp: 7 }, teamReviewedUids: ['my-catch'] };
function storage() {
  const data = new Map([[key, JSON.stringify(original)]]);
  return { getItem: name => data.get(name) ?? null, setItem: (name, value) => data.set(name, value), removeItem: name => data.delete(name) };
}

test('grant preserves progress and the original save, creates valid full-HP specimens and runs once', () => {
  const s = storage(), raw = s.getItem(key);
  assert.equal(addRarityTestPokemon(s), 8);
  assert.equal(s.getItem(RARITY_TEST_BACKUP), raw);
  const save = JSON.parse(s.getItem(key));
  for (const field of Object.keys(original).filter(field => !['pcBox', 'pokedexCaught', 'pokedexSeen'].includes(field))) assert.deepEqual(save[field], original[field], field);
  assert.deepEqual(save.pcBox[0], original.pcBox[0]);
  assert.deepEqual(save.pcBox.slice(1).map(mon => mon.speciesId), [...RARITY_TEST_SPECIES]);
  for (const mon of save.pcBox.slice(1)) {
    assert.equal(mon.level, 20); assert.equal(mon.currentHp, mon.maxHp); assert.ok(mon.maxHp > 0);
    assert.equal(mon.exp, 0); assert.ok(mon.expToNextLevel > 0);
    assert.ok(save.pokedexCaught.includes(mon.speciesId)); assert.ok(save.pokedexSeen.includes(mon.speciesId));
  }
  assert.equal(addRarityTestPokemon(s), 0);
  s.removeItem(RARITY_TEST_MARKER);
  assert.equal(addRarityTestPokemon(s), 0);
  assert.equal(s.getItem(RARITY_TEST_BACKUP), raw);
  assert.equal(JSON.parse(s.getItem(key)).pcBox.length, 9);
});

test('missing/unready saves and backup failures never overwrite the save', () => {
  const s = storage(); s.removeItem(key);
  assert.throws(() => addRarityTestPokemon(s)); assert.equal(s.getItem(key), null);
  s.setItem(key, JSON.stringify({ ...original, starterChosen: false }));
  const raw = s.getItem(key);
  assert.throws(() => addRarityTestPokemon(s)); assert.equal(s.getItem(key), raw);
  const full = storage(), before = full.getItem(key);
  assert.throws(() => addRarityTestPokemon({ getItem: full.getItem, setItem: () => { throw Error('quota'); } }));
  assert.equal(full.getItem(key), before); assert.equal(full.getItem(RARITY_TEST_MARKER), null);
});
