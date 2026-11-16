import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {chromium} from '@playwright/test';
const root='scratch/live-update-2026-11-16',old='scratch/visual-parity/reference-2026-11-14';
const app='app.c0081498f2.js',css='app.3e06fa8ed6.css';
const appBytes=await fs.readFile(root+'/'+app),cssBytes=await fs.readFile(root+'/'+css);
const hash=b=>createHash('sha256').update(b).digest('hex');
if(!hash(appBytes).startsWith('c0081498f2')||!hash(cssBytes).startsWith('3e06fa8ed6'))throw Error('Reference hash mismatch');
const out='docs/ui-polish-evidence';await fs.mkdir(out,{recursive:true});
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
 const page=await context.newPage();await page.goto('https://ui-reference.local/');await page.waitForFunction(()=>window.__reference?.Screens?.team);
 const available=(await fs.readdir('public/assets/pokemon')).filter(n=>/^\d+\.png$/.test(n)).map(n=>Number(n.slice(0,-4))).filter(id=>id<1000);
 const shiny=new Set(await fs.readdir('public/assets/pokemon/shiny'));
 const reference=await page.evaluate(available=>{
  const r=window.__reference,s=getComputedStyle(document.body),types=['Normal','Fire','Water','Electric','Grass','Ice','Fighting','Poison','Ground','Flying','Psychic','Bug','Rock','Ghost','Dragon','Dark','Steel','Fairy'];
  const typeHtml=Object.fromEntries(types.map(t=>[t,r.UI.typeBadge(t.toLowerCase())]));
  const regions=r.STORY.REGIONS.filter(region=>region.dex&&!region.wip),nativeRegion=regions.at(-1),localRegion=regions.filter(region=>available.some(id=>id>=region.dex[0]&&id<=region.dex[1])).at(-1);
  const pool=r.POKEDEX.filter(mon=>mon.id>=localRegion.dex[0]&&mon.id<=localRegion.dex[1]&&!mon.legendary&&!mon.mythical&&available.includes(mon.id)).map(mon=>mon.id);
  return {build:window.BUILD,title:{nativeRegion:{key:nativeRegion.key,dex:nativeRegion.dex},localRegion:{key:localRegion.key,dex:localRegion.dex},pool},typeHtml,colors:Object.fromEntries(Object.entries(typeHtml).map(([t,h])=>[t,h.match(/--tc:([^;\"]+)/)[1]])),tokens:Object.fromEntries(['--font','--font-title','--font-pixel','--bg','--panel','--panel-2','--sunken','--text','--text-2','--muted','--line','--line-hover','--ink','--mon-lines'].map(p=>[p,s.getPropertyValue(p)]))};
 },available.filter(id=>shiny.has(id+'.png')));
 await page.evaluate(()=>{
  const r=window.__reference; r.Game.S.reducedAnim=true;if(r.Game.S.adv)r.Game.S.adv.paused=true;
  const ids=[4,7,1,25,149,144,19,20,3,150];
  r.Game.S.mons=ids.map((id,i)=>r.Game.makeMon(id,20,{shiny:i===3}));r.Game.S.team=r.Game.S.mons.slice(0,6).map(m=>m.uid);
  for(const id of ids)r.Game.registerDex(id,id===25);
  r.Game.S.seen[2]=true;document.querySelectorAll('.title-fx').forEach(el=>el.remove());document.body.classList.remove('titled');
 });
 const props=['fontFamily','fontSize','fontWeight','lineHeight','color','backgroundColor','backgroundImage','borderTopColor','borderTopWidth','borderRadius','boxShadow','textShadow','opacity'];
 reference.screens={};
 for(const screen of ['team','pokedex']){
  await page.evaluate(screen=>{const r=window.__reference;r.Screens[screen].init();r.App.show(screen);r.Screens[screen].render();},screen);
  await page.locator('#screen-'+screen).waitFor({state:'visible'});await page.evaluate(()=>document.fonts.ready);
  const gotIt=page.getByRole('button',{name:/^got it!?$/i});if(await gotIt.isVisible()){await gotIt.click();await page.waitForTimeout(350);}
  reference.screens[screen]=await page.evaluate(({screen,props})=>{
   const root=document.querySelector('#screen-'+screen),selectors=['.map-head h2','.slot.filled','.slot .name','.slot .lv','.slot .type','.pc-cell','.pc-cell .lvl','.dex-cell.caught','.dex-cell.seen','.dex-cell.unknown','.dex-cell .nm','.dex-cell .num','.dex-ring','.dex-hero','.dex-hero-body','.pc-filters .chip','.pc-filters input'];
   return Object.fromEntries(selectors.map(sel=>{const el=root.querySelector(sel);return [sel,el?{style:Object.fromEntries(props.map(p=>[p,getComputedStyle(el)[p]])),rect:{width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height},html:el.outerHTML.slice(0,2000)}:null];}));
  },{screen,props});
  await fs.writeFile(`${out}/native-${screen}.html`,await page.locator('#screen-'+screen).evaluate(el=>el.outerHTML));
  if(screen==='team')reference.shell=await page.evaluate(props=>Object.fromEntries(['header','.side-nav>button.active','.side-nav>button:not(.active)'].map(sel=>{
   const el=document.querySelector(sel),s=getComputedStyle(el);return [sel,Object.fromEntries([...props,'borderImageSource','borderImageSlice','borderImageWidth','borderImageOutset','borderImageRepeat','clipPath'].map(p=>[p,s[p]]))];
  })),props);
  if(screen==='team')reference.frames=await page.evaluate(()=>Object.fromEntries(['.side-nav>button.active','.pc-filters .chip'].map(sel=>{
   const el=document.querySelector(sel);return [sel,Object.fromEntries(['::before','::after'].map(pseudo=>[pseudo,Object.fromEntries(['content','position','inset','background','borderImage','boxShadow','clipPath','maskImage','maskSize','maskRepeat','zIndex','pointerEvents','opacity'].map(p=>[p,getComputedStyle(el,pseudo)[p]]))]))];
  })));
  await page.screenshot({path:`${out}/native-${screen}.png`});
 }
 const fixture=await page.evaluate(({html,props})=>{
  const node=document.createElement('div');node.id='type-fixture';node.style.cssText='position:fixed;inset:0;z-index:99999;background:#141826;display:flex;flex-wrap:wrap;gap:12px;align-content:center;justify-content:center';node.innerHTML=Object.values(html).join('');document.body.append(node);
  return Object.fromEntries([...node.children].map(el=>[el.dataset.type,Object.fromEntries(props.map(p=>[p,getComputedStyle(el)[p]]))]));
 },{html:reference.typeHtml,props});
 reference.types=fixture;reference.source={app,css,appSha256:hash(appBytes),cssSha256:hash(cssBytes)};
 await page.screenshot({path:`${out}/native-types.png`});
 await fs.writeFile(`${out}/reference.json`,JSON.stringify(reference,null,2));console.log({build:reference.build,colors:reference.colors,screens:Object.keys(reference.screens)});
}finally{await browser.close();}
