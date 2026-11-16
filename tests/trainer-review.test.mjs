import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
const bundle=await build({stdin:{contents:"export * from './src/game/domain/presentationTiming';export * from './src/game/presentation/railLayout';export {createGameStore} from './src/store/useGameStore';",resolveDir:process.cwd()},bundle:true,write:false,platform:'node',format:'esm'});
const {attackRecoveryDelay,gameplaySpeed,battlePollDelay,trainerIntroDuration,railLayout,createGameStore}=await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);

test('native speed labels and VS/gym waits keep fixed entry and exit animation durations',()=>{
  assert.deepEqual([1,2,3].map(gameplaySpeed),[1,2,2.5]);assert.equal(battlePollDelay(3),130);
  assert.equal(trainerIntroDuration('trainer',1),1790);assert.equal(trainerIntroDuration('trainer',2.5),1340);
  assert.equal(trainerIntroDuration('gym',1),2880);assert.equal(trainerIntroDuration('gym',2.5),2028);
});

test('native attack recovery includes result reading time before the separate queue wait',()=>{
  for(const pace of [1,2,2.5]){
    const normal={miss:false,multiplier:1,crit:false};
    assert.equal(attackRecoveryDelay(normal,pace),260/pace);
    for(const roll of [{...normal,crit:true},{...normal,multiplier:2},{...normal,multiplier:.5}])assert.equal(attackRecoveryDelay(roll,pace),710/pace);
    assert.equal(attackRecoveryDelay({...normal,miss:true},pace),400/pace);
    assert.equal(attackRecoveryDelay({...normal,multiplier:0},pace),500/pace);
  }
});
test('rail uses six-slot capacity and centers the actual number of rows',()=>{
  const full=railLayout(792,442.875,6,1440),single=railLayout(792,442.875,1,1440),wide=railLayout(1200,675,6,1904);
  assert.equal(full.tile,60);assert.equal(full.padding,38);assert.ok(single.padding>full.padding);assert.ok(wide.padding>38);
  const mobile=railLayout(282,282,6,320);assert.equal(mobile.gap,3);assert.ok(mobile.tile*6+15+mobile.padding<=262);
});
test('trainer callbacks gate combat, preserve speed, and reject stale or repeated completions',()=>{
  const timers=new Map();let sequence=0;
  const clock={now:()=>1800000000000,setTimeout:(callback,ms)=>{const id=++sequence;timers.set(id,{callback,ms});return id;},clearTimeout:id=>timers.delete(id)};
  const store=createGameStore({clock,random:()=>.2});store.setState({starterChosen:true});store.getState().loadStepNode(13);
  const request=store.getState().trainerPresentation;assert.equal(store.runtime.phase,'intro');store.getState().tickCombat();assert.equal(store.getState().combatEffect,null);
  store.getState().setGameSpeed(3);assert.equal(store.getState().trainerPresentation,request);assert.equal(request.speed,1);
  store.getState().finishTrainerIntro(request.key);assert.equal(store.getState().trainerPresentation.stage,'sendout');assert.equal(store.getState().bossIntroActive,false);
  store.getState().tickCombat();assert.equal(store.getState().combatEffect,null);
  store.getState().loadStepNode(20);const newer=store.getState().trainerPresentation;
  store.getState().finishTrainerPresentation(request.key);assert.equal(store.getState().trainerPresentation,newer);assert.equal(newer.speed,2.5);
  store.getState().finishTrainerIntro(newer.key);store.getState().finishTrainerPresentation(newer.key);store.getState().finishTrainerPresentation(newer.key);
  assert.equal(store.getState().trainerPresentation,null);assert.equal(store.runtime.phase,'battle');
  store.getState().loadStepNode(1);assert.equal(timers.size,0);
});
