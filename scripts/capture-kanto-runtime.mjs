import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from '@playwright/test';
const raw='scratch/visual-parity/reference-2026-11-14';
await fs.mkdir('scratch/r04',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 const context=await browser.newContext({viewport:{width:1440,height:900},serviceWorkers:'block'});
 const save=JSON.parse(await fs.readFile(raw+'/new-game-save.json','utf8'));save.lastTick=Date.now();save.adv.paused=true;
 await context.addInitScript(save=>{localStorage.setItem('gachamon-save-v1',JSON.stringify(save));localStorage.setItem('pokecatch.lang','en');},save);
 await context.route('**/*',async route=>{
  const pathname=decodeURIComponent(new URL(route.request().url()).pathname);
  for(const file of pathname==='/'?[raw+'/index.html']:[raw+'/'+path.basename(pathname),'public'+pathname,'thamkhao/extracted_apk/assets'+pathname])try{
   let body=await fs.readFile(file);if(file.endsWith('app.c0c995f8f9.js'))body=Buffer.from(body.toString().replace('t.App={','globalThis.__reference=t,t.App={'));
   return route.fulfill({body,contentType:{'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.svg':'image/svg+xml'}[path.extname(file)]||'application/octet-stream'});
  }catch{}
  await route.abort();
 });
 const page=await context.newPage();await page.goto('https://r04-reference.local/');await page.waitForFunction(()=>window.__reference?.Game);
 const data=await page.evaluate(()=>{
  const r=window.__reference,functions=o=>Object.fromEntries(Object.entries(o||{}).filter(([,v])=>typeof v==='function').map(([k,v])=>[k,String(v)]));
  if(window.BUILD!=='5598c5890a')throw Error('Kanto adapter requires BUILD5598c5890a');
  const chapters=[];
  for(let index=0;index<14;index++){
   r.DAYTIME.force('day');r.WEATHER.force('clear');
   r.Adventure.buildChapter(index,true);
   const def=r.STORY.CHAPTERS[index],routes=def.steps.filter(s=>s.kind==='route');
   const steps=def.steps.map((step,templateIndex)=>{
    const node={...step,ch:index,type:step.kind==='route'?'wild':step.kind,bg:step.kind==='heal'?'pokecenter':step.bg,lv:step.lv||(step.kind==='route'?r.STORY.routeBand(index,routes.indexOf(step),routes.length):undefined)};
    const pools={};
    if(step.kind==='route')for(const phase of ['morning','day','night'])for(const weather of ['clear','rain','storm']){
     r.DAYTIME.force(phase);r.WEATHER.force(weather);
     pools[phase+':'+weather]=r.Adventure.zonePool(node,index,true).map(({id,w,min,max,when,on,pct})=>({id,w,min,max,when,on,pct}));
    }
    return {templateIndex,name:r.STORY.placeName(node),text:r.STORY.trainerLabel(step.gift?.text||step.text||''),rewardText:step.reward?.text?r.STORY.trainerLabel(step.reward.text):undefined,leader:step.leader?r.STORY.trainerLabel(step.leader):undefined,levelBand:node.lv,scene:r.SCENES?.resolve(node),townScene:step.kind==='heal'?r.SCENES?.resolve({...node,type:'item',bg:step.bg}):undefined,pools,team:step.kind==='gym'?r.STORY.gymTeam(index,step):undefined};
   });
   chapters.push({id:'kanto-'+(index+1),ace:r.STORY.aceOf(index),band:r.STORY.bandOf(index),steps,
     gymTrainers:r.Game.S.adv.nodes.filter(n=>n.gymTrainer),leagueTrainers:r.Game.S.adv.nodes.filter(n=>n.league&&n.type==='trainer').map(n=>({...n,trainer:r.STORY.trainerLabel(n.trainer)}))});
  }
  return {keys:Object.keys(r),storyFunctions:functions(r.STORY),daytime:functions(r.DAYTIME),weather:functions(r.WEATHER),chapters,story:r.STORY,classes:r.STORY.TRAINER_CLASSES.map(cls=>({...cls,name:r.STORY.trainerLabel(cls.name)})),evolutions:r.EVOLUTIONS,prevo:r.Game.PREVO,scenes:r.SCENES,sceneKeys:Object.keys(r).filter(k=>/SCENE|BG|START|INTRO/.test(k))};
 });
 await fs.writeFile('scratch/r04/reference-extra.json',JSON.stringify(data,null,2));console.log({storyFunctions:Object.keys(data.storyFunctions),sceneKeys:data.sceneKeys,keys:data.keys});
} finally {await browser.close();}
