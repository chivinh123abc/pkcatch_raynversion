import assert from 'node:assert/strict';
import {test} from 'node:test';
import {build} from 'esbuild';
import fs from 'node:fs';

const bundle=await build({stdin:{contents:`export {createGameStore} from './src/store/useGameStore'; export {createPokemonInstance} from './src/game/domain/pokemon'; export {currentLevelCap} from './src/game/domain/levelCap'; export {gainExperience} from './src/game/domain/battle'; export {experiencePercent} from './src/components/collectionUtils'; export {grantKnockoutReward} from './src/game/systems/rewards';`,resolveDir:process.cwd()},bundle:true,write:false,platform:'node',format:'esm',define:{'process.env.NODE_ENV':'"production"'}});
const {createGameStore,createPokemonInstance,currentLevelCap,gainExperience,experiencePercent,grantKnockoutReward}=await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
globalThis.localStorage={getItem:()=>null,setItem(){}};
test('Kanto caps follow native unlocked progress, including saved badges and replay selection',()=>{
 const native=JSON.parse(fs.readFileSync('docs/team-pc-evidence/reference.json','utf8'));
 for(let i=0;i<14;i++)assert.equal(currentLevelCap({completedChapters:Array.from({length:i},(_,n)=>`kanto-${n+1}`)}),native.caps.chapters[i].cap);
 assert.equal(currentLevelCap({badges:['boulder-badge']}),24);
 assert.equal(currentLevelCap({badges:['earth-badge']}),75);
 assert.equal(currentLevelCap({completedChapters:['kanto-14']}),100);
});
test('reaching the progress cap bounds excess EXP without reviving or downgrading owned Pokemon',()=>{
 const store=createGameStore(),a={...createPokemonInstance(4,19,false,store.runtime),currentHp:0};
 const capped=gainExperience(a,Number.MAX_SAFE_INTEGER,20);
 assert.equal(capped.level,20);assert.equal(capped.exp,capped.expToNextLevel-1);assert.equal(capped.currentHp,0);assert.equal(capped.uid,a.uid);assert.equal(experiencePercent(capped,20),100);
 const legacy=createPokemonInstance(130,100,false,store.runtime);assert.equal(gainExperience(legacy,600,20),legacy);
});
test('a PC Buddy at the current cap gets no EXP or candy; completing Brock permits its native bonus again',()=>{
 let now=1800000000000;
 const store=createGameStore({random:()=>.5,clock:{now:()=>now++,setTimeout:()=>1,clearTimeout(){}}}),ally=createPokemonInstance(4,5,false,store.runtime),buddy=createPokemonInstance(19,20,false,store.runtime);
 store.setState({party:[ally],pcBox:[buddy],buddy:{uid:buddy.uid,ko:4},items:{'rare-candy':2},isBattling:false});
 const ko=()=>{store.runtime.beginEncounter();return grantKnockoutReward({get:store.getState,set:store.setState,runtime:store.runtime},createPokemonInstance(16,5,false,store.runtime),false);};
 assert.equal(ko(),true);assert.deepEqual(store.getState().pcBox,[buddy]);assert.equal(store.getState().buddy.ko,0);
 assert.equal(store.getState().useExpCandy(buddy.uid,'rare-candy'),false);assert.equal(store.getState().items['rare-candy'],2);
 store.setState({completedChapters:['kanto-1'],buddy:{uid:buddy.uid,ko:4}});
 assert.equal(ko(),true);assert.notDeepEqual(store.getState().pcBox[0],buddy);assert.ok(store.getState().pcBox[0].level>=20);assert.ok(store.getState().pcBox[0].level<=24);
});
