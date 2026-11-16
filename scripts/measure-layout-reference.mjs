import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {chromium} from '@playwright/test';
const root='scratch/live-update-2026-11-16',old='scratch/visual-parity/reference-2026-11-14',out='docs/layout-evidence';
const source=JSON.parse(await fs.readFile('docs/ui-polish-evidence/reference.json','utf8')).source;
for(const key of ['app','css']){
 const bytes=await fs.readFile(root+'/'+source[key]);
 if(createHash('sha256').update(bytes).digest('hex')!==source[key+'Sha256'])throw Error('Reference hash mismatch: '+key);
}
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 const context=await browser.newContext({serviceWorkers:'block'});
 await context.addInitScript(()=>localStorage.setItem('pokecatch.lang','en'));
 await context.route('**/*',async route=>{
  const pathname=decodeURIComponent(new URL(route.request().url()).pathname),name=path.basename(pathname);
  for(const file of pathname==='/'?[root+'/index.html']:[root+'/'+name,old+'/'+name,'public'+pathname])try{
   let body=await fs.readFile(file);if(name==='app.c0081498f2.js')body=Buffer.from(body.toString().replace('a.App={','globalThis.__reference=a,a.App={'));
   return route.fulfill({body,contentType:{'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.svg':'image/svg+xml'}[path.extname(file)]||'application/octet-stream'});
  }catch{}await route.abort();
 });
 const page=await context.newPage();await page.goto('https://ui-reference.local/');await page.waitForFunction(()=>window.__reference?.Screens?.team);
 await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important}'});
 await page.evaluate(()=>{
  const r=window.__reference;r.Game.S.reducedAnim=true;if(r.Game.S.adv)r.Game.S.adv.paused=true;
  const ids=[4,7,1,25,149,144,19,20,3,150];r.Game.S.mons=ids.map((id,i)=>r.Game.makeMon(id,20,{shiny:i===3}));r.Game.S.team=r.Game.S.mons.slice(0,6).map(m=>m.uid);
  for(const id of ids)r.Game.registerDex(id,id===25);r.Game.S.seen[2]=true;
  document.querySelectorAll('.title-fx').forEach(el=>el.remove());document.body.classList.remove('titled');
 });
 const result={source:{build:'b05c8cc201',...source},viewports:{}};
 for(const width of [2560,1920,1440,1100,1000,800,641,640,390,320]){
  await page.setViewportSize({width,height:900});const screens={};
  for(const screen of ['team','pokedex']){
   await page.evaluate(screen=>{const r=window.__reference;r.Screens[screen].init();r.App.show(screen);r.Screens[screen].render();},screen);
   await page.locator('#screen-'+screen).waitFor({state:'visible'});await page.evaluate(()=>document.fonts.ready);
   const gotIt=page.getByRole('button',{name:/^got it!?$/i});if(await gotIt.isVisible()){await gotIt.click();await page.waitForTimeout(350);}
   screens[screen]=await page.evaluate(screen=>{
    const root=document.querySelector('#screen-'+screen);
    const read=el=>{if(!el)return null;const r=el.getBoundingClientRect(),s=getComputedStyle(el);return {x:r.x,y:r.y,width:r.width,height:r.height,css:Object.fromEntries(['display','gridTemplateColumns','gap','padding','margin','minWidth','maxWidth','minHeight','aspectRatio','fontSize','zoom','position'].map(p=>[p,s[p]]))};};
    return {shell:Object.fromEntries(['#app','.topbar','.side','#app>main'].map(s=>[s,read(document.querySelector(s))])),elements:Object.fromEntries(['','.team-panel','.map-head','.team-slots','.slot.filled','.slot .w','.slot .sprbox','.slot .name','.pc-filters','.pc-grid','.pc-cell','.pc-cell .sprbox','.dex-hero','.dex-hero-body','.dex-ring','.dex-grid','.dex-cell','.dex-cell .sprbox','.dex-cell .num','.dex-cell .nm','#arena','.arena','.battlefield','.timeline'].map(sel=>[sel||'screen',read(sel?root.querySelector(sel):root)]))};
   },screen);
   if([1920,1440,800,390].includes(width)&&screen!=='adventure')await page.screenshot({path:`${out}/native-${screen}-${width}.png`});
  }
  result.viewports[width]=screens;
 }
 await page.evaluate(()=>{const r=window.__reference;r.Screens.adventure.init();r.App.show('adventure');r.Screens.adventure.render();if(r.Game.S.adv)r.Game.S.adv.paused=true;document.querySelectorAll('.hatch-fx').forEach(el=>el.remove());});
 result.arena={};
 for(const width of [1920,1440,1100,1000,800,641,640,390]){
  await page.setViewportSize({width,height:900});
  result.arena[width]=await page.evaluate(()=>{
   const root=document.querySelector('#screen-adventure');
   return [...root.querySelectorAll('*')].filter(el=>/arena|timeline|adv-grid|adv-layout|consumable|found/.test(el.className||'')||el.id==='arena').filter(el=>{const r=el.getBoundingClientRect();return r.width>100&&r.height>20;}).slice(0,16).map(el=>{const r=el.getBoundingClientRect();return {id:el.id,cls:el.className,rect:[r.x,r.y,r.width,r.height]};});
  });
 }
 await fs.writeFile(out+'/reference.json',JSON.stringify(result,null,2));
 console.log('Saved native layout matrix:',Object.keys(result.viewports));
}finally{await browser.close();}
