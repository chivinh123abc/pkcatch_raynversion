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
const out='docs/team-pc-evidence';await fs.mkdir(out,{recursive:true});
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
 await page.evaluate(()=>{const r=window.__reference,g=r.Game;g.S.reducedAnim=true;if(g.S.adv)g.S.adv.paused=true;document.querySelector('.title-fx')?.remove();document.body.classList.remove('titled');g.S.mons=Array.from({length:100},(_,i)=>g.makeMon(i+1,20));g.S.team=g.S.mons.slice(0,6).map(m=>m.uid);for(const m of g.S.mons)m.xp=Math.floor(g.xpForNext(m.level,m)*.4);r.Screens.team.init();r.App.show('team');r.Screens.team.render();});
 const gotIt=page.getByRole('button',{name:/^got it!?$/i});if(await gotIt.isVisible())await gotIt.click();await page.waitForTimeout(400);
 const measure=async selectors=>page.evaluate(selectors=>Object.fromEntries(selectors.map(sel=>{const el=document.querySelector(sel);if(!el)return[sel,null];const style=pseudo=>{const c=getComputedStyle(el,pseudo);return Object.fromEntries([...c].filter(k=>/^(?:mask-|background|border|font|padding|margin|grid|gap|row-gap|column-gap|position$|top$|left$|right$|bottom$|width$|height$|display$|opacity$|visibility$|pointer-events$|transform|transition|box-shadow$|text-shadow$|clip-path$|z-index$|isolation$|overflow|zoom$|justify-|align-)/.test(k)).map(k=>[k,c.getPropertyValue(k)]));};return[sel,{style:style(),before:style('::before'),after:style('::after'),html:el.outerHTML.slice(0,1200),rect:el.getBoundingClientRect().toJSON()}];})),selectors);
 const data={source:{build:'b05c8cc201',app:hash(appBytes),css:hash(cssBytes)},rest:await measure(['.side-nav>button.active','.pc-filters .chip','.pc-cell','.pc-xp','.pc-xp>div','#team-mini','.pc-sticky'])};
 const tab=await page.locator('.side-nav>button.active').boundingBox();await page.screenshot({path:out+'/native-tab.png',clip:{x:Math.max(0,tab.x-10),y:tab.y-10,width:tab.width+20,height:tab.height+24}});
 await page.locator('.side-nav>button.active').hover();data.hover=await measure(['.side-nav>button.active']);await page.mouse.move(0,0);
 data.game=await page.evaluate(()=>{const g=window.__reference.Game;return Object.fromEntries(Object.keys(g).filter(k=>/buddy|fam|xp|exp|cap/i.test(k)&&typeof g[k]==='function').map(k=>[k,g[k].toString()]));});
 data.expSamples=await page.evaluate(()=>{const g=window.__reference.Game;return [5,20,100].map(level=>{const m=g.makeMon(19,level);return{level:m.level,capped:g.capped(m),next:g.xpForNext(m.level,m)};});});
 data.caps=await page.evaluate(()=>{const r=window.__reference,s=r.STORY;return {maxLevel:r.CONFIG.MAX_LEVEL,leagueDone:r.CONFIG.LEAGUE_DONE_CAP,chapters:s.CHAPTERS.slice(0,14).map((c,i)=>({index:i,name:c.name,ace:s.aceOf(i),cap:s.capOf(i),gym:c.steps.some(n=>n.kind==='gym')})),methods:Object.fromEntries(['levelCap','nextGymOf','capOf','aceOf'].map(k=>[k,s[k].toString()]))};});
 data.sprites=await page.evaluate(()=>[1,2,3,4,5,6].map(id=>({id,desktop:window.__reference.UI.fitScale(id,96),mobile:window.__reference.UI.tileScale(id,24,34)})));
 await page.evaluate(()=>window.scrollTo(0,600));await page.waitForTimeout(300);
 data.scrolled=await measure(['#team-mini','#team-mini .slot.filled','#team-mini .w','#team-mini .xpbar','#team-mini .name','#team-mini .lv','.pc-sticky']);
 await page.screenshot({path:out+'/native-scrolled.png'});
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(300);data.mobile=await measure(['#team-mini','#team-mini .slot.filled','#team-mini .w','#team-mini .name','#team-mini .lv','.pc-sticky']);
 await page.setViewportSize({width:1440,height:900});
 await page.evaluate(()=>{const r=window.__reference,g=r.Game;g.S.mons=[4,130,94,25,144,150,19,26,149,151].map(id=>({...g.makeMon(id,20),shiny:true}));g.S.team=g.S.mons.slice(0,6).map(m=>m.uid);r.Screens.team.render();window.scrollTo(0,0);});
 await page.waitForTimeout(250);
 data.shiny=await measure(['#team-slots .slot.filled','#team-slots .name','#team-slots .shiny-mk','#pc-grid .pc-cell','#pc-grid .pc-cell .lvl','#pc-grid .pc-cell .shiny-mk','#team-mini .name','#team-mini .lv']);
 data.shinyHelpers=await page.evaluate(()=>{const r=window.__reference;return Object.fromEntries(Object.keys(r.UI).filter(k=>/shiny|star/i.test(k)).map(k=>[k,typeof r.UI[k]==='function'?r.UI[k].toString():r.UI[k]]));});
 data.shinyMarkup=await page.evaluate(()=>Object.fromEntries(['#team-slots .slot.filled','#team-mini .slot.filled','#pc-grid .pc-cell'].map(sel=>[sel,document.querySelector(sel)?.outerHTML.slice(0,6000)])));
 await page.screenshot({path:out+'/native-shiny.png'});
 await fs.writeFile(out+'/reference.json',JSON.stringify(data,null,2));console.log({output:out+'/reference.json',gameMethods:Object.keys(data.game),shinyHelpers:Object.keys(data.shinyHelpers)});
}finally{await browser.close();}
