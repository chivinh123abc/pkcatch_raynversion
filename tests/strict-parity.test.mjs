import assert from 'node:assert/strict';
import {test} from 'node:test';
import fs from 'node:fs';
import {build} from 'esbuild';
const bundle=await build({stdin:{contents:`export {createGameStore} from './src/store/useGameStore';export * from './src/game/domain/pokemon';export {calculateStats,getPokemonSpecies} from './src/data/pokemonData';export {currentChapter} from './src/game/data/chapterSelectors';`,resolveDir:process.cwd()},bundle:true,write:false,platform:'node',format:'esm'});
const api=await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
const storage=new Map();globalThis.localStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)};
const clock={now:()=>1800000000000,setTimeout:()=>1,clearTimeout(){}};

test('all Kanto gift, fossil, fixed-item and static-reward definitions retain native conditions',()=>{
 const local=JSON.parse(fs.readFileSync('src/data/kantoChapterReference.json')).chapters;
 const native=JSON.parse(fs.readFileSync('docs/strict-parity-evidence/native-data.json')).chapters;
 const fields=['kind','gift','once','item','level','offers','after','reward','id','spirit'];
 const pick=value=>Object.fromEntries(fields.filter(key=>value[key]!==undefined).map(key=>[key,value[key]]));
 for(const chapter of local) {
  const expected=native[chapter.sourceIndex].steps.map(pick);
  const actual=chapter.definition.steps.filter(step=>['gift','find','trade','static'].includes(step.kind)).map(pick);
  assert.deepEqual(actual,expected,chapter.id);
 }
});

test('native HP boost is real and known old saves upgrade once without healing or changing identity',()=>{
 const store=api.createGameStore({clock,random:()=>.5}),mon=api.createPokemonInstance(130,100,true,store.runtime);
 assert.equal(mon.maxHp,907);assert.deepEqual(mon.stats,{hp:907,attack:280,defense:179,spAttack:137,spDefense:225,speed:183});
 const old={...mon,maxHp:825,currentHp:234,stats:{...mon.stats,hp:825},where:'Cycling Road',how:'wild',wins:5363};
 const upgraded=api.migrateReferenceHp(old);assert.equal(upgraded.currentHp,234);assert.equal(upgraded.maxHp,907);assert.equal(upgraded.uid,old.uid);assert.equal(upgraded.wins,5363);
 assert.deepEqual(api.migrateReferenceHp(upgraded),upgraded);assert.equal(api.migrateReferenceHp({...old,currentHp:0}).currentHp,0);
 assert.deepEqual(api.migrateReferenceHp({...old,maxHp:999}),{...old,maxHp:999});
 store.setState({party:[old],pcBox:[{...old,uid:'pc',currentHp:0}],starterChosen:true});store.getState().saveGame(true);
 const restored=api.createGameStore({clock,random:()=>.5});restored.getState().loadGame({deferEncounter:true});
 assert.equal(restored.getState().party[0].maxHp,907);assert.equal(restored.getState().party[0].currentHp,234);assert.equal(restored.getState().pcBox[0].currentHp,0);assert.equal(restored.getState().party[0].where,'Cycling Road');
});

test('a missing fossil cannot be exchanged, and a received gift retains native location, origin and shiny roll',()=>{
 const store=api.createGameStore({clock,random:()=>0});store.getState().chooseStarter(4);
 store.setState({isBattling:false,badges:['boulder-badge'],completedChapters:['kanto-1']});store.getState().selectChapter('kanto-2');
 const node=api.currentChapter(store.getState()).steps.find(node=>node.gift?.key==='magikarp');store.getState().loadStepNode(node.step);store.getState().chooseAdventureGift(129);
 const received=store.getState().party.find(mon=>mon.speciesId===129);assert.equal(received.how,'gift');assert.equal(received.where,node.name);assert.equal(received.level,5);assert.equal(received.isShiny,true);assert.equal(store.getState().newCatchCard.isShiny,true);
 const before=store.getState().party.length;store.setState({newCatchCard:null,pendingAdventureGift:{key:'trade:kanto-7',choices:[140],level:30,text:'',trade:{140:'dome-fossil'}}});store.getState().chooseAdventureGift(140);assert.equal(store.getState().party.length,before);assert.equal(store.getState().items['dome-fossil']||0,0);
});
