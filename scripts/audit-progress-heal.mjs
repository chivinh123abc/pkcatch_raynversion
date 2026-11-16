import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {chromium} from '@playwright/test';
const root='scratch/live-update-2026-11-16',old='scratch/visual-parity/reference-2026-11-14';
const app='app.c0081498f2.js',css='app.3e06fa8ed6.css';
const appBytes=await fs.readFile(root+'/'+app),cssBytes=await fs.readFile(root+'/'+css);
const hash=b=>createHash('sha256').update(b).digest('hex');
if(!hash(appBytes).startsWith('c0081498f2')||!hash(cssBytes).startsWith('3e06fa8ed6'))throw Error('Reference hash mismatch');
const out='docs/progress-heal-evidence';await fs.mkdir(out,{recursive:true});
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
 const data={source:{build:'b05c8cc201',app:hash(appBytes),css:hash(cssBytes)}};
 data.adventure=await page.evaluate(()=>{const r=window.__reference;return Object.fromEntries(['init','goChapter','chapterBadge','chapterMeta'].map(k=>[k,r.Screens.adventure[k].toString()]));});
 data.engine=await page.evaluate(()=>{const r=window.__reference;return {scene:r.SCENES.css.toString(),badges:r.STORY.BADGE_IMG,badgeHtml:r.STORY.badgeHtml.toString()};});
 await page.evaluate(()=>{const r=window.__reference,g=r.Game;document.querySelector('.title-fx')?.remove();document.body.classList.remove('titled');g.S.mons=[g.makeMon(4,5)];g.S.team=g.S.mons.map(m=>m.uid);r.Adventure.ensure();r.Screens.team.init();r.Screens.map.init();r.Screens.adventure.init();r.Adventure.state.paused=true;r.App.show('team');});
 await page.waitForTimeout(300);
 // Title bootstrap is deliberately skipped in this isolated harness. Bridge its Adventure tab to native App.show;
 // the summary's original onclick and map.open remain untouched for both branch checks.
 await page.locator('#tabs [data-screen="adventure"]').evaluate(el=>el.onclick=()=>window.__reference.App.show('adventure'));
 data.clickHarness='Title bootstrap skipped; Adventure tab bridged to native App.show. Summary onclick and map.open are native.';
 data.summaryHandler=await page.locator('#side-chapter').evaluate(el=>el.onclick.toString());
 data.sideMarkup=await page.locator('#side-chapter').evaluate(el=>el.outerHTML);
 data.clicks={before:await page.evaluate(()=>window.__reference.App.current)};
 await page.locator('#side-chapter').evaluate(el=>el.click());data.clicks.first=await page.evaluate(()=>({current:window.__reference.App.current,active:[...document.querySelectorAll('.screen.active')].map(e=>e.id)}));
 await page.locator('#side-chapter').evaluate(el=>el.click());data.clicks.second=await page.evaluate(()=>({current:window.__reference.App.current,active:[...document.querySelectorAll('.screen.active')].map(e=>e.id),dialogs:[...document.querySelectorAll('.modal')].map(e=>({id:e.id,cls:e.className,display:getComputedStyle(e).display}))}));
 data.center=await page.evaluate(()=>{const r=window.__reference;return {scene:r.SCENES.css({name:'Pokemon Center',bg:'pokecenter',fallback:'town'},0),storyBadges:Object.fromEntries(r.STORY.CHAPTERS.slice(0,8).map((c,i)=>[i,c.steps.filter(s=>s.kind==='gym').at(-1)?.badge]))};});
 const source=appBytes.toString(),defeatAt=source.indexOf('case"defeat":{const U=c.reason');
 if(defeatAt<0)throw Error('Native defeat renderer missing');data.defeatRenderer=source.slice(defeatAt,defeatAt+1300);
 await fs.writeFile(out+'/reference.json',JSON.stringify(data,null,2));console.log({output:out+'/reference.json',adventure:Object.keys(data.adventure)});
}finally{await browser.close();}
