import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {chromium} from '@playwright/test';
import ts from 'typescript';
const root='scratch/live-update-2026-11-16',old='scratch/visual-parity/reference-2026-11-14';
const app='app.c0081498f2.js',css='app.3e06fa8ed6.css';
const appBytes=await fs.readFile(root+'/'+app),cssBytes=await fs.readFile(root+'/'+css);
const hash=b=>createHash('sha256').update(b).digest('hex');
if(!hash(appBytes).startsWith('c0081498f2')||!hash(cssBytes).startsWith('3e06fa8ed6'))throw Error('Reference hash mismatch');
const out='docs/notification-inspect-evidence';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const context=await browser.newContext({viewport:{width:1440,height:900},serviceWorkers:'block'});
 await context.addInitScript(()=>localStorage.setItem('pokecatch.lang','en'));
 await context.route('**/*',async route=>{
  const pathname=decodeURIComponent(new URL(route.request().url()).pathname),name=path.basename(pathname);
  for(const file of pathname==='/'?[root+'/index.html']:[root+'/'+name,old+'/'+name,'public'+pathname])try{
   let body=await fs.readFile(file);if(name===app)body=Buffer.from(body.toString().replace('a.App={','globalThis.__reference=a,a.App={'));
   return route.fulfill({body,contentType:{'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.svg':'image/svg+xml'}[path.extname(file)]||'application/octet-stream'});
  }catch{}await route.abort();
 });
 const page=await context.newPage();page.setDefaultTimeout(10000);await page.goto('https://ui-reference.local/');await page.waitForFunction(()=>window.__reference?.Screens?.team);
 const evidence=await page.evaluate(()=>{
  const r=window.__reference,g=r.Game;g.S.reducedAnim=true;if(g.S.adv)g.S.adv.paused=true;
  document.querySelector('.title-fx')?.remove();document.body.classList.remove('titled');
  const functions={};for(const key of ['newCount'])for(const screen of ['team','pokedex'])functions[screen+'.'+key]=r.Screens[screen][key].toString();
  for(const key of ['statBars','showDexCard','modal'])functions['UI.'+key]=r.UI[key]?.toString();
  const now=Date.now();g.S.pcVisit=now-10000;g.S.dexVisit=now-10000;g.S.mons=[];g.S.team=[];g.S.dex={};
  const cases=[];const snap=label=>cases.push({label,team:r.Screens.team.newCount(),pokedex:r.Screens.pokedex.newCount()});
  const first=g.makeMon(4,5);g.receive(first);snap('received in party');
  for(const id of [1,7,25,16,19])g.receive(g.makeMon(id,5));snap('six in party');
  g.receive(g.makeMon(133,5));snap('seventh goes to PC');
  const shiny=g.makeMon(130,100,{shiny:true});g.receive(shiny);snap('new shiny in PC');
  g.S.team[0]=shiny.uid;snap('same shiny moved into party');
  shiny.ot='Other#123';snap('traded shiny excluded');delete shiny.ot;
  return {functions,cases,source:{build:window.BUILD}};
 });
 const props=['fontFamily','fontSize','fontWeight','lineHeight','color','textShadow','boxShadow','backgroundColor','backdropFilter','borderColor','borderWidth','borderRadius','padding','width','transform','transitionDuration'];
 const frameProps=['boxShadow','backgroundColor','backgroundImage','content','filter','transform','inset','maskImage','maskSize','clipPath'];
 const measure=async selectors=>page.evaluate(({selectors,props,frameProps})=>Object.fromEntries(selectors.map(sel=>{const el=document.querySelector(sel);return [sel,el?{style:Object.fromEntries(props.map(p=>[p,getComputedStyle(el)[p]])),before:Object.fromEntries(frameProps.map(p=>[p,getComputedStyle(el,'::before')[p]])),after:Object.fromEntries(frameProps.map(p=>[p,getComputedStyle(el,'::after')[p]]))}:null];})),{selectors,props,frameProps});
 evidence.screens={};
 for(const screen of ['team','pokedex']){
  await page.evaluate(screen=>{const r=window.__reference;r.Screens[screen].init();r.App.show(screen);r.Screens[screen].render();},screen);
  const gotIt=page.getByRole('button',{name:/^got it!?$/i});if(await gotIt.isVisible())await gotIt.click();await page.waitForTimeout(350);
  evidence.screens[screen]=await measure(['.side-nav>button.active','.side-nav>button:not(.active)']);
  await page.locator('.side-nav>button.active').hover();
  evidence.screens[screen].hover=(await measure(['.side-nav>button.active']))['.side-nav>button.active'];await page.mouse.move(0,0);
 }
 await page.evaluate(()=>{const r=window.__reference;const m=r.Game.makeMon(130,100,{shiny:true});r.Game.S.mons.push(m);r.Game.S.team[0]=m.uid;r.UI.monDetail(m.uid);});
 await page.locator('.mon-card').waitFor();
 evidence.inspect=await measure(['.modal-root','.modal','.mon-card','.mon-card .dc-head h2']);
 evidence.stats=await page.locator('.statbars').evaluate(el=>el.outerHTML);
 await page.locator('.mon-card .dc-x').click();await page.waitForTimeout(350);
 await page.evaluate(()=>{const r=window.__reference,m=r.Game.makeMon(25,5,{shiny:true});r.Game.registerDex(25,true);r.UI.showDexCard(25,{mon:m,isNew:true,actions:[{label:'Continue',cls:'gold'}]});});
 await page.locator('.dexcard.v2').waitFor();await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(400);
 evidence.capture=await measure(['.modal-root','.modal','.dexcard.v2','.dc-head h2','.dc-new','.genus','.dc-fact','.dc-fact b','.flavor','.modal-actions .btn']);
 evidence.captureHtml=await page.locator('.modal').evaluate(el=>el.outerHTML);
 await page.screenshot({path:out+'/native-capture.png'});
 evidence.source={...evidence.source,app:hash(appBytes),css:hash(cssBytes),capturedAt:new Date().toISOString()};
 await fs.writeFile(out+'/reference.json',JSON.stringify(evidence,null,2));
 console.log(JSON.stringify({cases:evidence.cases,output:out+'/reference.json'},null,2));
}finally{await browser.close();}
