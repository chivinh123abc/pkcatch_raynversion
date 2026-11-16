import assert from 'node:assert/strict';
import {test} from 'node:test';
import fs from 'node:fs';
import {build} from 'esbuild';
const moves=JSON.parse(fs.readFileSync('src/data/moves.json'));
const ref=JSON.parse(fs.readFileSync('src/data/chapterOneReference.json'));
const update=JSON.parse(fs.readFileSync('src/data/liveMoveUpdate.json'));
const bundle=await build({stdin:{contents:"export * from './src/game/domain/chapterOne';export {calculateStats,getPokemonSpecies} from './src/data/pokemonData';export {collectionMove} from './src/components/collectionUtils';",resolveDir:process.cwd()},bundle:true,write:false,platform:'node',format:'esm'});
const {movePower,mainMove,collectionMove,chooseBattleMove,calculateStats,getPokemonSpecies}=await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);

test('live v0.5.02 adds 160 catalog entries and exposes all 116 new damaging moves',()=>{
  assert.equal(Object.keys(moves).length,661);assert.equal(update.added.length,160);
  assert.equal(update.added.filter(key=>movePower(key)>0).length,116);
  for(const key of update.removed)assert.equal(moves[key],undefined);
  assert.equal(movePower('bide'),0);assert.equal(movePower('dragon-rage'),60);assert.equal(movePower('triple-axel'),120);
});

test('all 151 effective learnsets resolve and follow native high-power levels and recharge exclusions',()=>{
  const recharge=new Set(['hyper-beam','giga-impact','blast-burn','hydro-cannon','frenzy-plant','rock-wrecker','roar-of-time','prismatic-laser','eternabeam','meteor-assault']);
  let addedEntries=0;
  for(let id=1;id<=151;id++)for(const [level,key]of ref.dex[id].learn){
    assert.ok(moves[key],`${id}: ${key}`);assert.ok(!recharge.has(key),`${id}: ${key} must not be learned`);
    const power=movePower(key);
    if(power>=100)assert.ok(level>=(power>110?85:65),`${id}: ${key} learned too early at ${level}`);
    if(update.added.includes(key))addedEntries++;
  }
  assert.ok(addedEntries>100);
  assert.equal(ref.moveSource.build,update.source.build);
});

test('new moves enter real battle selection instead of only the FX catalog',()=>{
  const selected=new Set(),added=new Set(update.added);
  const mon=(speciesId,level)=>({speciesId,level,stats:calculateStats(getPokemonSpecies(speciesId).baseStats,level)});
  for(let id=1;id<=151;id++)for(const level of [15,30,65,85])for(const target of [19,7,74,92,63,10]){
    const move=chooseBattleMove(mon(id,level),mon(target,level));if(added.has(move.key))selected.add(move.key);
  }
  assert.ok(selected.size>=10,`Only ${selected.size} new moves were selectable`);
});

test('collection previews match 1057 native v0.5.02 mainMove samples, including level boundaries',()=>{
  const fixture=JSON.parse(fs.readFileSync('docs/live-update-2026-11-16/main-moves.json'));
  assert.equal(fixture.build,update.source.build);
  for(let speciesId=1;speciesId<=151;speciesId++)fixture.levels.forEach((level,index)=>{
    const mon={speciesId,level},move=mainMove(mon);
    assert.equal(move.key,fixture.moves[speciesId][index],`${speciesId} at ${level}`);
    assert.equal(collectionMove(mon),move.name);
  });
  assert.equal(mainMove({speciesId:4,level:64}).key,'flamethrower');
  assert.equal(mainMove({speciesId:4,level:65}).key,'fire-blast');
  assert.equal(mainMove({speciesId:4,level:84}).key,'fire-blast');
  assert.equal(mainMove({speciesId:4,level:85}).key,'overheat');
  assert.equal(mainMove({speciesId:130,level:1}).key,'splash');
});
