import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';

const bundle = await build({ entryPoints: ['src/game/runtime/rarityTestSave.ts'], bundle: true, write: false, platform: 'node', format: 'esm' });
const { addRarityTestPokemon, hasPendingRarityTestGrant, RARITY_TEST_SPECIES, SHINY_TEST_SPECIES, RARITY_TEST_MARKER, RARITY_TEST_BACKUP } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
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
  assert.equal(hasPendingRarityTestGrant(s),true);
  assert.equal(addRarityTestPokemon(s), 36);
  assert.equal(s.getItem(RARITY_TEST_BACKUP), raw);
  const save = JSON.parse(s.getItem(key));
  for (const field of Object.keys(original).filter(field => !['pcBox', 'pokedexCaught', 'pokedexSeen'].includes(field))) assert.deepEqual(save[field], original[field], field);
  assert.deepEqual(save.pcBox[0], original.pcBox[0]);
  assert.deepEqual(save.pcBox.slice(1).map(mon => mon.speciesId), [...RARITY_TEST_SPECIES, ...SHINY_TEST_SPECIES]);
  assert.deepEqual(save.pcBox.filter(mon=>mon.isShiny).map(mon=>mon.speciesId), [...SHINY_TEST_SPECIES]);
  for (const mon of save.pcBox.slice(1)) {
    assert.equal(mon.level, 20); assert.equal(mon.currentHp, mon.maxHp); assert.ok(mon.maxHp > 0);
    assert.equal(mon.exp, 0); assert.ok(mon.expToNextLevel > 0);
    assert.ok(save.pokedexCaught.includes(mon.speciesId)); assert.ok(save.pokedexSeen.includes(mon.speciesId));
  }
  assert.equal(addRarityTestPokemon(s), 0);
  assert.equal(hasPendingRarityTestGrant(s),false);
  s.removeItem(RARITY_TEST_MARKER);
  assert.equal(addRarityTestPokemon(s), 0);
  assert.equal(s.getItem(RARITY_TEST_BACKUP), raw);
  assert.equal(JSON.parse(s.getItem(key)).pcBox.length, 37);
});

test('upgrade adds three specimens per supported native rarity without duplicating the old grant', async () => {
  const {readFile}=await import('node:fs/promises');
  const rarity=JSON.parse(await readFile('src/data/pokemonRarity.json','utf8'));
  assert.deepEqual(rarity.tiers.map((_,i)=>RARITY_TEST_SPECIES.filter(id=>rarity.species[id]===i).length),[3,3,3,3,0]);
  const s=storage(),legacyMarker='pokecatch_rarity_test_20261116_01',legacyBackup='pokecatch_backup_before_rarity_test_20261116_01';
  const legacyIds=[19,25,20,17,3,149,144,150];
  const legacy={...original,pcBox:[...original.pcBox,...legacyIds.map(speciesId=>({uid:`${legacyMarker}-${speciesId}`,speciesId,currentHp:7}))]};
  // A specimen moved into the party still counts as already granted.
  legacy.party=[...legacy.party,legacy.pcBox.pop()];
  const before=JSON.stringify(legacy);s.setItem(key,before);s.setItem(legacyMarker,'done');s.setItem(legacyBackup,'original backup');
  assert.equal(addRarityTestPokemon(s),28);
  const after=JSON.parse(s.getItem(key));
  assert.deepEqual(after.party,legacy.party);assert.deepEqual(after.pcBox.slice(0,legacy.pcBox.length),legacy.pcBox);
  assert.equal(new Set([...after.party,...after.pcBox].map(m=>m.uid)).size,after.party.length+after.pcBox.length);
  assert.equal(s.getItem(RARITY_TEST_BACKUP),before);assert.equal(s.getItem(legacyBackup),'original backup');
  assert.equal(addRarityTestPokemon(s),0);
});

test('upgrading the previous twelve-mon grant adds only shinies and preserves old markers and backups',()=>{
  const s=storage();addRarityTestPokemon(s);
  const previous=JSON.parse(s.getItem(key));previous.pcBox=previous.pcBox.filter(mon=>!mon.isShiny);
  s.setItem(key,JSON.stringify(previous));s.removeItem(RARITY_TEST_MARKER);s.removeItem(RARITY_TEST_BACKUP);
  const oldMarker='pokecatch_rarity_test_20261116_03',oldBackup='pokecatch_backup_before_rarity_test_20261116_03';
  s.setItem(oldMarker,'done');s.setItem(oldBackup,'previous backup');
  assert.equal(addRarityTestPokemon(s),24);
  const next=JSON.parse(s.getItem(key));assert.deepEqual(next.pcBox.slice(0,previous.pcBox.length),previous.pcBox);
  assert.equal(next.pcBox.filter(mon=>mon.isShiny).length,24);assert.equal(s.getItem(oldBackup),'previous backup');assert.equal(s.getItem(oldMarker),'done');
  assert.equal(s.getItem(RARITY_TEST_BACKUP),JSON.stringify(previous));assert.equal(addRarityTestPokemon(s),0);
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
