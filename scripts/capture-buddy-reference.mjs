import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {chromium} from '@playwright/test';
const root='scratch/live-update-2026-11-16',old='scratch/visual-parity/reference-2026-11-14';
const app='app.c0081498f2.js',css='app.3e06fa8ed6.css';
const appBytes=await fs.readFile(root+'/'+app),cssBytes=await fs.readFile(root+'/'+css);
const hash=b=>createHash('sha256').update(b).digest('hex');
if(!hash(appBytes).startsWith('c0081498f2')||!hash(cssBytes).startsWith('3e06fa8ed6'))throw Error('Reference hash mismatch');
const out='docs/buddy-evidence';await fs.mkdir(out,{recursive:true});
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

 const data=await page.evaluate(()=>{
 const r=window.__reference,g=r.Game;
 r.Game.S.reducedAnim=true;if(g.S.adv)g.S.adv.paused=true;
 const mon=g.makeMon(130,100,{shiny:true});g.S.mons=[mon];g.S.team=[mon.uid];g.registerDex(130,true);g.setBuddy(mon.uid);
 document.querySelector('.title-fx')?.remove();document.body.classList.remove('titled');
 r.Screens.team.init();r.App.show('team');r.Screens.team.render();
 return {config:{mult:r.CONFIG.BUDDY_XP_MULT,kos:r.CONFIG.BUDDY_KOS,ramp:r.CONFIG.BUDDY_RAMP_LEVEL,candyShare:r.CONFIG.CANDY_LEVEL_SHARE,candies:r.CONFIG.EXP_CANDIES},uiKeys:Object.keys(r.UI).filter(k=>/mon|card|buddy/i.test(k)),icon:r.UI.buddyIcon(),family:r.Game.familyOf(130),goals:[1,4,19,129,130,144,150].map(id=>({id,levels:[1,5,10,19,20,100].map(level=>g.buddyGoal(g.makeMon(id,level)))})),species:Object.fromEntries(Array.from({length:151},(_,i)=>{const id=i+1;return[id,{family:g.familyOf(id),goal:g.buddyGoal(g.makeMon(id,100)),evolutions:(r.EVOLUTIONS[id]||[]).filter(e=>e.to<=151).map(({to,level,item})=>({to,level,item}))}]})),candyXp:Object.fromEntries(Object.keys(r.CONFIG.EXP_CANDIES).map(key=>[key,g.expCandyXp(key)]))};
 });
 data.source={build:'b05c8cc201',app,css,appSha256:hash(appBytes),cssSha256:hash(cssBytes)};
 if(!process.argv.includes('--evidence-only'))await fs.writeFile('src/data/buddyReference.json',JSON.stringify({source:data.source,...data.config,candyXp:data.candyXp,species:data.species},null,2)+'\n');
 const nativeKo=await page.evaluate(()=>{
  const g=window.__reference.Game,previous={mons:g.S.mons,team:g.S.team,buddy:g.S.buddy};
  const mon=g.makeMon(19,5),other=g.makeMon(4,5);g.S.mons=[mon,other];g.S.team=[];g.setBuddy(mon.uid);
  g.buddyKo();g.setBuddy(mon.uid);const sameBuddyKo=g.S.buddy.ko;g.setBuddy(other.uid);const changedBuddyKo=g.S.buddy.ko;g.setBuddy(mon.uid);
  const events=Array.from({length:5},()=>g.buddyKo());const result={sameBuddyKo,changedBuddyKo,noTeam:g.S.team.length===0,bonus:events.map(event=>event?.fed?.map(({amount,levels})=>({amount,levels}))||null),counter:g.S.buddy.ko,level:mon.level,xp:mon.xp};
  Object.assign(g.S,previous);return result;
 });
 await fs.writeFile(out+'/native-ko.json',JSON.stringify(nativeKo,null,2));
 console.log('Native mechanics extracted',nativeKo);

 await fs.writeFile(out+'/native.json',JSON.stringify(data,null,2));
 const gotIt=page.getByRole('button',{name:/^got it!?$/i});if(await gotIt.isVisible())await gotIt.click();await page.waitForTimeout(350);
 await page.evaluate(()=>{document.querySelectorAll('.modal-backdrop,.guide-overlay').forEach(el=>el.remove());const r=window.__reference;r.UI.monDetail(r.Game.S.team[0]);});await page.waitForTimeout(400);
 await fs.writeFile(out+'/native-inspect.html',await page.locator('.dexcard.mon-card').evaluate(el=>el.outerHTML));
 const metrics=await page.locator('.mon-card').evaluate(el=>Object.fromEntries(['.dc-head h2','.dc-fact b','.dc-fold>summary','.dc-move','.dc-move>span:first-child','.dc-candy','.dc-head','.dc-top','.dc-id','.dc-hero','.dc-xp','.dc-fold','.fam-sec'].map(selector=>{const e=el.querySelector(selector),r=e.getBoundingClientRect(),s=getComputedStyle(e);return[selector,{width:r.width,height:r.height,font:s.font,padding:s.padding,margin:s.margin,gap:s.gap,border:s.border,background:s.background,color:s.color,whiteSpace:s.whiteSpace,flexDirection:s.flexDirection}]})));
 await fs.writeFile(out+'/native-metrics.json',JSON.stringify(metrics,null,2));
 await page.screenshot({path:out+'/native-inspect.png',timeout:10000,animations:'disabled'});
 const geometry={};for(const width of [1440,390,320]){await page.setViewportSize({width,height:900});geometry[width]=await page.locator('.modal.mon-modal').evaluate(el=>({width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height}));}
 await fs.writeFile(out+'/native-geometry.json',JSON.stringify(geometry,null,2));

}finally{await browser.close();}

