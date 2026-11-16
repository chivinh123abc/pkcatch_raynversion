import assert from 'node:assert/strict';
import { test, beforeEach } from 'node:test';
import { build } from 'esbuild';
import fs from 'node:fs';

const bundle = await build({ stdin: {contents:`export {createGameStore} from './src/store/useGameStore'; export * from './src/game/domain/battle'; export * from './src/game/domain/buddy'; export * from './src/game/domain/pokemon'; export {referenceLevel} from './src/game/domain/chapterOne'; export {grantKnockoutReward} from './src/game/systems/rewards';`,resolveDir:process.cwd()},bundle:true,write:false,platform:'node',format:'esm',define:{'process.env.NODE_ENV':'"production"'}});
const {createGameStore,createPokemonInstance,applyExpToParty,gainExperience,buddyGoal,referenceLevel,grantKnockoutReward}=await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
const storage=new Map();
globalThis.localStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)};
beforeEach(()=>storage.clear());
const fixture=()=>{
 const clock={now:()=>1800000000000,setTimeout:()=>1,clearTimeout(){}},store=createGameStore({clock,random:()=>.5});
 const mon=(id=19,level=20,shiny=false)=>createPokemonInstance(id,level,shiny,store.runtime);
 store.runtime.beginEncounter();
 return {store,mon,ko:enemy=>grantKnockoutReward({get:store.getState,set:store.setState,runtime:store.runtime},enemy,false)};
};

test('Buddy goals match actual native samples, including family rarity and the level ramp',()=>{
 const native=JSON.parse(fs.readFileSync('docs/buddy-evidence/native.json','utf8'));
 for(const {id,levels} of native.goals)assert.deepEqual([1,5,10,19,20,100].map(level=>buddyGoal({speciesId:id,level})),levels);
 assert.equal(buddyGoal({speciesId:130,level:100}),5);
});
test('Buddy multiplies battle EXP before rounding, independently of the active member; PC gets no battle XP',()=>{
 const {mon}=fixture(),a=mon(),b=mon(),pc=mon();
 const baseline=applyExpToParty([a,b],0,10.49);
 assert.equal(baseline.gains[a.uid].amount,12);
 const result=applyExpToParty([a,b],0,10.49,b.uid);
 assert.equal(result.gains[b.uid].amount,14);
 assert.equal(result.gains[a.uid].amount,12);
 assert.equal(applyExpToParty([a,b],0,10.49,a.uid).gains[a.uid].amount,15);
 assert.deepEqual(applyExpToParty([a,b],0,10.49,pc.uid),baseline);
});

test('ordinary PC members receive no knockout battle EXP and PC Buddy only receives its milestone bonus',()=>{
 const {store,mon,ko}=fixture(),ally=mon(),regular=mon(25,5),buddy=mon(19,5);
 store.setState({party:[ally],pcBox:[regular,buddy],buddy:{uid:buddy.uid,ko:0},isBattling:false});
 for(let i=0;i<4;i++){ko(mon(16,5));assert.deepEqual(store.getState().pcBox,[regular,buddy]);}
 ko(mon(16,5));assert.deepEqual(store.getState().pcBox[0],regular);
 assert.notDeepEqual(store.getState().pcBox[1],buddy);
 assert.equal(store.getState().sidebarExpPopups[regular.uid],undefined);
});
test('KO bonus reaches a Buddy in PC on the fifth KO, applies once, and survives a save checkpoint',()=>{
 const native=JSON.parse(fs.readFileSync('docs/buddy-evidence/native-ko.json','utf8'));
 const {store,mon,ko}=fixture(),ally=mon(),buddy=mon(19,5);
 store.setState({party:[ally],pcBox:[buddy],starterChosen:true,buddy:{uid:buddy.uid,ko:4},isBattling:false});
 const enemy=mon(16,5);
 assert.equal(ko(enemy),true);
 const expected=store.getState().pcBox[0];
 assert.equal(expected.level,native.level);assert.equal(expected.exp,native.xp);
 assert.equal(store.getState().sidebarExpPopups[buddy.uid].amount,native.bonus[4][0].amount);
 assert.equal(store.getState().buddy.ko,0);
 assert.equal(store.getState().party[0].wins,1);
 assert.equal(ko(enemy),false);
 assert.deepEqual(store.getState().pcBox[0],expected);
 const restored=fixture().store;restored.getState().loadGame({deferEncounter:true});
 assert.deepEqual(restored.getState().buddy,{uid:buddy.uid,ko:0});
 assert.deepEqual(restored.getState().pcBox[0],expected);
});
test('Buddy selection validates ownership, resets only when changed and follows a deposit without changing HP/EXP',()=>{
 const {store,mon}=fixture(),a=mon(),b=mon();store.setState({party:[a,b],buddy:{uid:a.uid,ko:3}});
 assert.equal(store.getState().setBuddy('unknown'),false);
 assert.equal(store.getState().setBuddy(a.uid),true);assert.equal(store.getState().buddy.ko,3);
 store.getState().depositPokemon(a.uid);assert.equal(store.getState().buddy.uid,a.uid);assert.deepEqual(store.getState().pcBox[0],a);
 store.getState().setBuddy(b.uid);assert.equal(store.getState().buddy.ko,0);
 store.getState().setBuddy(null);assert.deepEqual(store.getState().buddy,{uid:null,ko:0});
});
test('old and malformed Buddy saves preserve owned Pokémon and default to an unselected Buddy',()=>{
 const {store,mon}=fixture(),a=mon();store.setState({party:[a],starterChosen:true});store.getState().saveGame(true);
 const save=JSON.parse(storage.get('pokecatch_save_v1'));delete save.buddy;storage.set('pokecatch_save_v1',JSON.stringify(save));
 const restored=fixture().store;restored.getState().loadGame({deferEncounter:true});
 assert.deepEqual(restored.getState().buddy,{uid:null,ko:0});assert.equal(restored.getState().party[0].uid,a.uid);
 save.buddy={uid:a.uid,ko:NaN};storage.set('pokecatch_save_v1',JSON.stringify(save));restored.getState().loadGame({deferEncounter:true});assert.deepEqual(restored.getState().buddy,{uid:a.uid,ko:0});
 save.buddy={uid:'missing',ko:4};storage.set('pokecatch_save_v1',JSON.stringify(save));restored.getState().loadGame({deferEncounter:true});assert.equal(restored.getState().buddy.uid,null);
});
test('candies consume the real inventory once, preserve fainted HP and UID, and stop at level 100',()=>{
 const {store,mon}=fixture(),a={...mon(4,5),currentHp:0};
 store.setState({party:[a],items:{'exp-candy-s':1,'rare-candy':2}});
 assert.equal(store.getState().useExpCandy('unknown','exp-candy-s'),false);
 assert.equal(store.getState().useExpCandy(a.uid,'exp-candy-s'),true);
 let actual=store.getState().party[0];assert.deepEqual(actual,gainExperience(a,600));assert.equal(actual.currentHp,0);
 assert.equal(store.getState().useExpCandy(a.uid,'exp-candy-s'),false);
 const level=actual.level;assert.equal(store.getState().useExpCandy(a.uid,'rare-candy'),true);assert.equal(store.getState().party[0].level,level+1);assert.equal(store.getState().party[0].exp,0);
 store.setState({party:[mon(130,100)]});actual=store.getState().party[0];assert.equal(store.getState().useExpCandy(actual.uid,'rare-candy'),false);assert.equal(store.getState().items['rare-candy'],1);
});
test('fresh starter becomes Buddy and a capped Buddy still cycles KOs without banking XP',()=>{
 const {store,mon,ko}=fixture();store.getState().chooseStarter(4);assert.equal(store.getState().buddy.uid,store.getState().party[0].uid);
 const capped=mon(130,100);store.setState({party:[capped],buddy:{uid:capped.uid,ko:4},awardedEnemyUids:[]});ko(mon(16,5));
 assert.equal(store.getState().buddy.ko,0);assert.equal(store.getState().party[0].exp,0);
});
test('small EXP gains preserve saved HP and stats until leveling; reaching the cap clears leftover XP',()=>{
 const {mon}=fixture(),saved={...mon(4,20),maxHp:999,currentHp:23};
 assert.deepEqual(gainExperience(saved,1),{...saved,exp:1});
 const capped=gainExperience(mon(130,99),Number.MAX_SAFE_INTEGER);
 assert.equal(capped.level,100);assert.equal(capped.exp,0);
});
