import {test,expect} from '@playwright/test';
import fs from 'node:fs/promises';
import {readFileSync} from 'node:fs';
const update=JSON.parse(readFileSync('src/data/liveMoveUpdate.json','utf8'));
const moves=JSON.parse(readFileSync('src/data/moves.json','utf8'));
const reference=JSON.parse(readFileSync('src/data/chapterOneReference.json','utf8'));

async function prepare(page:any){
 await page.goto('/',{waitUntil:'domcontentloaded'});await page.locator('.battle-stage').waitFor();
 await page.evaluate(async()=>{
  const url=performance.getEntriesByType('resource').find(e=>e.name.includes('/src/store/useGameStore.ts'))!.name;
  const {useGameStore:s}=await import(/* @vite-ignore */url);s.setState({starterChosen:true,isBattling:false,autoCatch:false});s.getState().loadStepNode(1);
  const engineUrl=performance.getEntriesByType('resource').find(e=>e.name.includes('/src/utils/battleFxEngine.ts'))!.name;
  (window as any).__newFX=(await import(/* @vite-ignore */engineUrl)).BattleFX;
  (window as any).__fxOptions=()=>({attEl:document.querySelector('.ally')!,defEl:document.querySelector('.enemy')!,fxEl:document.querySelector('#arena-fx'),shakeEl:document.querySelector('.battle-stage'),mirror:false});
 });
}

test('all 116 new damaging moves render with an impact and no watchdog fallback',async({page})=>{
 test.setTimeout(240000);
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await prepare(page);
 const keys=update.added.filter(key=>(reference.powerOverrides[key]??moves[key]?.power??0)>0);
 const results=await page.evaluate(async keys=>{
  const fx=(window as any).__newFX,options=(window as any).__fxOptions();
  // Use the arena's existing dedicated effect container.
  options.fxEl ||= document.querySelector('.battle-stage .fx-container');
  if(!options.fxEl)throw Error('Missing effect container');
  const results=[];
  for(const move of keys){
   let impacts=0;const start=performance.now();
   if(!fx.has(move))throw Error('Missing move '+move);
   const played=await fx.play({...options,move,speed:2.5,onImpact:()=>impacts++});
   results.push({move,played,impacts,elapsed:performance.now()-start});fx.cancel();
  }
  return results;
 },keys);
 await fs.mkdir('docs/live-update-2026-11-16',{recursive:true});
 await fs.writeFile('docs/live-update-2026-11-16/fx-coverage.json',JSON.stringify(results,null,2));
 expect(results).toHaveLength(116);expect(results.filter(r=>!r.played||r.impacts!==1||r.elapsed>3500)).toEqual([]);
 expect(errors).toEqual([]);
});

for(const speed of [1,2,2.5])test(`new signature FX preserve their speed snapshot and cancel cleanly at pace ${speed}`,async({page})=>{
 await prepare(page);
 const result=await page.evaluate(async speed=>{
  const fx=(window as any).__newFX,options=(window as any).__fxOptions();options.fxEl ||= document.querySelector('.battle-stage .fx-container');
  let impacts=0;
  const first=fx.play({...options,move:'poltergeist',speed,onImpact:()=>impacts++});
  // Cancellation must invalidate deferred work before the next move uses the canvas.
  await new Promise(r=>setTimeout(r,25));fx.cancel();
  let secondImpacts=0;await fx.play({...options,move:'focus-blast',speed,onImpact:()=>secondImpacts++});
  await new Promise(r=>setTimeout(r,100));fx.cancel();void first;
  return {impacts,secondImpacts,clones:options.fxEl.querySelectorAll('.fxclone').length};
 },speed);
 expect(result).toEqual({impacts:0,secondImpacts:1,clones:0});
});
