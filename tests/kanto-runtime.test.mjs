import fs from 'node:fs';
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {build} from 'esbuild';
const bundle=await build({stdin:{contents:`export * from './src/game/data/chapterGenerator';export * from './src/game/data/chapterSelectors';export * from './src/game/domain/kantoRewards';export {grantKnockoutReward} from './src/game/systems/rewards';export {calcBattleExp} from './src/game/domain/battle';export {ALL_CHAPTERS} from './src/data/chaptersData';export {createGameStore} from './src/store/useGameStore';export {calculateStats,getPokemonSpecies,getItemSpriteUrl} from './src/data/pokemonData';`,resolveDir:process.cwd()},bundle:true,write:false,platform:'node',format:'esm'});
const api=await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
const reference=JSON.parse(fs.readFileSync('src/data/kantoRuntimeReference.json'));
class Clock {
 time=1800000000000;seq=0;tasks=new Map();now=()=>this.time;
 setTimeout=(fn,ms)=>{const id=++this.seq;this.tasks.set(id,{fn,at:this.time+ms});return id;};clearTimeout=id=>this.tasks.delete(id);
 advance(ms){const end=this.time+ms;for(let n=0;n<10000;n++){const task=[...this.tasks].filter(([,t])=>t.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!task){this.time=end;return;}this.tasks.delete(task[0]);this.time=task[1].at;task[1].fn();}throw Error('Timer loop');}
}
const storage=new Map();globalThis.localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
function fixture(seed=9){const clock=new Clock(),store=api.createGameStore({clock,random:api.chapterRandom(seed)});store.getState().chooseStarter(7);store.setState({isBattling:false});return {clock,store};}
function step(store,clock){const s=store.getState();if(s.newCatchCard)s.dismissNewCatchCard();else if(s.pendingAdventureGift)s.chooseAdventureGift(s.pendingAdventureGift.choices?.[0]??s.pendingAdventureGift.items[0]);else if(s.trainerPresentation){s.finishTrainerIntro(s.trainerPresentation.key);s.finishTrainerPresentation(s.trainerPresentation.key);}else if(s.healPresentation)s.finishHealPresentation(s.healPresentation.key);else if(s.activeDrop)s.finishItemDrop(s.activeDrop.id);else if(s.combatEffect)s.finishCombatEffect(s.combatEffect.key);else if(s.capturePresentation)s.finishCapturePresentation(s.capturePresentation.key);else s.tickCombat();clock.advance(100);}

test('starter profile and hidden Pikachu choice commit once and survive a compatible save',()=>{
 storage.clear();const store=api.createGameStore({clock:new Clock(),random:api.chapterRandom(5)});
 store.getState().chooseStarter(25,{name:'  Linh  ',sprite:'leaf'});store.getState().chooseStarter(4,{name:'Other',sprite:'red'});
 assert.equal(store.getState().trainerName,'Linh');assert.equal(store.getState().trainerSprite,'leaf');assert.deepEqual(store.getState().party.map(m=>m.speciesId),[25]);
 const restored=api.createGameStore({clock:new Clock()});restored.getState().loadGame();assert.equal(restored.getState().trainerSprite,'leaf');assert.equal(restored.getState().trainerName,'Linh');assert.equal(restored.getState().party[0].speciesId,25);
 const saved=JSON.parse(storage.get('pokecatch_save_v1'));delete saved.trainerSprite;storage.set('pokecatch_save_v1',JSON.stringify(saved));
 const legacy=api.createGameStore({clock:new Clock()});legacy.getState().loadGame();assert.equal(legacy.getState().trainerSprite,'red');assert.equal(legacy.getState().party[0].speciesId,25);
});

test('native money factors distinguish normal gyms, League rematches and completed-region trainers',()=>{
 assert.equal(api.kantoTrainerPayout(1000,2,true,false,false),900);
 assert.equal(api.kantoTrainerPayout(1000,2,true,true,false),90);
 assert.equal(api.kantoTrainerPayout(1000,10,true,false,false),1125);
 assert.equal(api.kantoTrainerPayout(1000,10,true,true,false),563);
 assert.equal(api.kantoTrainerPayout(1000,10,true,true,true),113);
 assert.equal(api.kantoTrainerPayout(1000,10,false,false,false),1620);
 assert.equal(api.kantoTrainerPayout(1000,10,false,false,true),450);
});

test('all native random-loot outcomes preserve their weight, chapter gate, asset and stone discovery',()=>{
 for(let chapter=1;chapter<=14;chapter++){
  const table=api.chapterLootTable(chapter),total=table.reduce((n,e)=>n+e.w,0);let start=0;
  for(const entry of table){
   if(!entry.w)continue;
   const draws=[(start+entry.w/2)/total,0,0],loot=api.rollChapterLoot(chapter,[],()=>draws.shift()??0);start+=entry.w;
   assert.equal(loot.item,entry.stone?'fire-stone':entry.item);
   if(entry.money)assert.equal(loot.money,270);
   if(loot.item)assert.ok(fs.existsSync('public'+api.getItemSpriteUrl(loot.item)),loot.item);
   if(entry.stone){assert.equal(loot.discoveredStone,'fire-stone');const second=[(start-entry.w/2)/total,0,0];assert.equal(api.rollChapterLoot(chapter,['fire-stone'],()=>second.shift()??0).money,45);}
  }
 }
 const enabled=ch=>api.chapterLootTable(ch).filter(e=>e.w>0).map(e=>e.item);
 assert.ok(!enabled(3).includes('berry-pecha'));assert.ok(enabled(4).includes('berry-pecha'));
 assert.ok(!enabled(6).includes('nanab-berry'));assert.ok(enabled(7).includes('nanab-berry'));
 assert.ok(!enabled(8).includes('starf-berry'));assert.ok(enabled(9).includes('starf-berry'));
});

test('League KO applies native Kanto XP multiplier before per-member rounding, only once',()=>{
 for(const league of [false,true]){
  const {store}=fixture(),enemy={...store.getState().enemy,level:20};
  store.setState({activeTrainer:{...store.getState().activeTrainer,league}});
  const expected=Math.round(api.calcBattleExp(enemy,true,false)*(league?2.4:1)*1.1);
  const ctx={get:store.getState,set:store.setState,runtime:store.runtime};
  api.grantKnockoutReward(ctx,enemy,true);const exp=store.getState().sidebarExpPopups[store.getState().party[0].uid].amount;
  assert.equal(exp,expected);assert.equal(api.grantKnockoutReward(ctx,enemy,true),false);
 }
});

test('14 Kanto generators are deterministic over 100 seeds with real gym levels, scenes and source indices',()=>{
 for(const chapter of api.ALL_CHAPTERS.filter(c=>c.runtimeSupported))for(let seed=0;seed<100;seed++){
  const run={...api.defaultChapterRun(chapter.id),seed},nodes=api.generateChapterSteps(chapter.id,run);
  assert.deepEqual(nodes,api.generateChapterSteps(chapter.id,run));
  assert.deepEqual(nodes.filter(n=>n.type==='badge').map(n=>n.trainer.team.map(m=>[m.speciesId,m.level])),[reference.chapters.find(c=>c.id===chapter.id).steps.find(s=>s.team).team]);
  nodes.forEach((node,index)=>{assert.equal(node.step,index+1);assert.equal(node.source.chapterId,chapter.id);assert.ok(fs.existsSync('public'+node.scene),`${chapter.id} node ${node.step}: ${node.scene}`);if(node.trainer)for(const mon of node.trainer.team){assert.ok(mon.speciesId<=151&&mon.speciesId>=1);assert.ok(mon.level>=1&&mon.level<=100);}});
 }
});
test('encounters and displayed probabilities use the same context pool without Chapter 1 fallback',()=>{
 for(const chapter of reference.chapters)for(const source of chapter.steps)if(Object.keys(source.pools).length){
  const node={step:1,type:'grass',name:source.name,source:{chapterId:chapter.id,templateIndex:source.templateIndex}};
  for(const phase of ['morning','day','night'])for(const weather of ['clear','rain','storm']){
   const pool=api.nodePool(node,chapter.id,phase,weather),active=pool.filter(e=>e.on);
   assert.ok(active.length);assert.ok(Math.abs(active.reduce((sum,e)=>sum+e.pct,0)-1)<1e-9);
   assert.deepEqual(active.map(e=>[e.id,e.min,e.max,e.w]),source.pools[phase+':'+weather].filter(e=>e.on).map(e=>[e.id,e.min,e.max,e.w]));
   assert.ok(Math.abs(api.nodeDisplayPool(node,chapter.id,phase,weather).filter(e=>e.on).reduce((sum,e)=>sum+e.pct,0)-1)<1e-9);
  }
 }
 assert.throws(()=>api.generateChapterSteps('kanto-999'),/No verified/);
});
test('unlock gate rejects skipped gyms, separates League wins from eight physical badges',()=>{
 const {store}=fixture();store.getState().selectChapter('kanto-3');assert.equal(store.getState().currentChapterId,'kanto-1');
 assert.equal(api.chapterUnlocked('kanto-10',{badges:api.ALL_CHAPTERS.slice(0,8).map(c=>c.badgeSprite),completedChapters:[]}),false);
 assert.equal(api.chapterUnlocked('kanto-10',{badges:[],completedChapters:['kanto-9']}),true);
 assert.equal(api.chapterUnlocked('kanto-14',{badges:['earth-badge'],completedChapters:['kanto-10']}),false);
});
test('gift choices, fossils and seeded route survive refresh without duplicate rewards',()=>{
 storage.clear();const {store}=fixture();store.setState({badges:['boulder-badge']});store.getState().selectChapter('kanto-2');
 const nodes=api.currentChapter(store.getState()).steps,seed=store.getState().chapterRun.seed;
 const gift=nodes.find(n=>n.gift?.key==='magikarp');store.getState().loadStepNode(gift.step);store.getState().saveGame(true);
 const resumed=api.createGameStore({clock:new Clock(),random:api.chapterRandom(1)});resumed.getState().loadGame();
 assert.equal(resumed.getState().chapterRun.seed,seed);assert.deepEqual(api.currentChapter(resumed.getState()).steps,nodes);assert.equal(resumed.getState().pendingAdventureGift.key,'magikarp');
 const before=resumed.getState().party.length;resumed.getState().chooseAdventureGift(129);resumed.getState().chooseAdventureGift(129);assert.equal(resumed.getState().party.length,before+1);
 const fossil=nodes.find(n=>n.gift?.key==='fossil');resumed.getState().loadStepNode(fossil.step);resumed.getState().chooseAdventureGift('dome-fossil');resumed.getState().chooseAdventureGift('helix-fossil');
 assert.equal(resumed.getState().items['dome-fossil'],1);assert.equal(resumed.getState().items['helix-fossil']||0,0);
 const copy=api.createGameStore();copy.getState().loadGame();assert.equal(copy.getState().items['dome-fossil'],1);assert.notEqual(copy.getState().pendingAdventureGift?.key,'fossil');
});
for(const speed of [1,2,3])test(`Chapter 2 walkthrough through Misty at x${speed}`,()=>{
 const {store,clock}=fixture();const base=store.getState().party[0],stats=api.calculateStats(api.getPokemonSpecies(3).baseStats,40);
 store.setState({badges:['boulder-badge'],party:[{...base,speciesId:3,level:40,stats,maxHp:stats.hp,currentHp:stats.hp}],autoCatch:false,gameSpeed:speed});store.getState().selectChapter('kanto-2');
 const visited=new Set();for(let i=0;i<80000&&store.getState().currentChapterId==='kanto-2';i++){visited.add(store.getState().nodeType);step(store,clock);}
 assert.equal(store.getState().currentChapterId,'kanto-3',store.getState().battleLog);assert.ok(store.getState().badges.includes('cascade-badge'));assert.ok(store.getState().completedChapters.includes('kanto-2'));assert.ok(visited.has('gift'));
});
test('Cinnabar fossil exchange consumes exactly its chosen item and unlock receipts persist',()=>{
 const {store}=fixture();store.setState({completedChapters:['kanto-6'],items:{'old-amber':1,'dome-fossil':1}});store.getState().selectChapter('kanto-7');
 const node=api.currentChapter(store.getState()).steps.find(n=>n.gift?.trade);assert.ok(node);store.getState().loadStepNode(node.step);store.getState().chooseAdventureGift(142);
 assert.equal(store.getState().items['old-amber'],0);assert.equal(store.getState().items['dome-fossil'],1);assert.ok(store.getState().party.some(m=>m.speciesId===142));
 store.getState().selectChapter('kanto-7');const second=api.currentChapter(store.getState()).steps.find(n=>n.gift?.trade);store.getState().loadStepNode(second.step);store.getState().chooseAdventureGift(140);assert.equal(store.getState().items['dome-fossil'],0);assert.ok(store.getState().party.some(m=>m.speciesId===140));
});

test('all remaining Kanto chapters, ghost gift and League can finish with a fixed level-100 team',()=>{
 for(let number=3;number<=14;number++){
  const {store,clock}=fixture(number),base=store.getState().party[0];
  const party=[3,6,9,65,94,149].map((speciesId,index)=>{const stats=api.calculateStats(api.getPokemonSpecies(speciesId).baseStats,100);return {...base,uid:'league-fixture-'+index,speciesId,level:100,stats,maxHp:stats.hp,currentHp:stats.hp};});
  store.setState({party,completedChapters:[`kanto-${number-1}`],gifts:['starter','silph-scope'],autoCatch:false,gameSpeed:3});store.getState().selectChapter(`kanto-${number}`);
  for(let iteration=0;iteration<80000&&!store.getState().completedChapters.includes(`kanto-${number}`);iteration++)step(store,clock);
  assert.ok(store.getState().completedChapters.includes(`kanto-${number}`),`Chapter ${number} stalled: ${JSON.stringify({step:store.getState().currentStep,log:store.getState().battleLog,enemy:store.getState().enemy&&[store.getState().enemy.speciesId,store.getState().enemy.currentHp],phase:store.runtime.phase,busy:store.runtime.busy,gift:store.getState().pendingAdventureGift,gifts:store.getState().gifts,party:store.getState().party.map(m=>[m.speciesId,m.currentHp]),timers:store.runtime.pendingTimers})}`);
  if(number>=9)assert.equal(store.getState().badges.length,0,'League wins must not award an Earth Badge');
  if(number===5){assert.ok(store.getState().gifts.includes('marowak-ghost'));assert.ok(store.getState().gifts.includes('cubone-fuji'));}
  clock.advance(10000);
  if(number<14)assert.equal(store.getState().currentChapterId,`kanto-${number+1}`);
  else {
   assert.equal(store.getState().currentChapterId,'kanto-14');assert.equal(store.getState().isBattling,false);
   const money=store.getState().money,copy=api.createGameStore({clock:new Clock()});copy.getState().loadGame();assert.equal(copy.getState().money,money);assert.equal(copy.getState().isBattling,false);assert.equal(copy.getState().enemy,null);assert.equal(copy.getState().currentStep,api.currentChapter(copy.getState()).totalSteps);
  }
 }
});
