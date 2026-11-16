import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {chromium} from '@playwright/test';
const root='scratch/live-update-2026-11-16',old='scratch/visual-parity/reference-2026-11-14';
const app='app.c0081498f2.js',css='app.3e06fa8ed6.css',build='b05c8cc201';
const appBytes=await fs.readFile(root+'/'+app),cssBytes=await fs.readFile(root+'/'+css);
const hash=b=>createHash('sha256').update(b).digest('hex');
if(!hash(appBytes).startsWith('c0081498f2')||!hash(cssBytes).startsWith('3e06fa8ed6'))throw Error('Unexpected reference source');
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const context=await browser.newContext({viewport:{width:900,height:350},serviceWorkers:'block'});
 await context.addInitScript(()=>localStorage.setItem('pokecatch.lang','en'));
 await context.route('**/*',async route=>{
  const pathname=decodeURIComponent(new URL(route.request().url()).pathname),name=path.basename(pathname);
  for(const file of pathname==='/'?[root+'/index.html']:[root+'/'+name,old+'/'+name,'public'+pathname])try{
   let body=await fs.readFile(file);if(name===app)body=Buffer.from(body.toString().replace('a.App={','globalThis.__reference=a,a.App={'));
   return route.fulfill({body,contentType:{'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.svg':'image/svg+xml'}[path.extname(file)]||'application/octet-stream'});
  }catch{}await route.abort();
 });
 const page=await context.newPage();await page.goto('https://rarity-reference.local/');await page.waitForFunction(()=>window.__reference?.UI?.tierGlow);
 const data=await page.evaluate(()=>{
  if(window.BUILD!=='b05c8cc201')throw Error('Rarity capture build mismatch');
  const r=window.__reference,tiers=r.CONFIG.TIERS.map(t=>({key:t.key,color:t.color,label:r.I18n.t(t.label)}));
  const species=Object.fromEntries(Array.from({length:151},(_,i)=>[i+1,r.Game.tierIndex(i+1)]));
  return {tiers,species,htmlBySpecies:Object.fromEntries([19,20,25,3,144,150,151].map(id=>[id,r.UI.tierGlow(id)]))};
 });
 const fixture=await page.evaluate(()=>{
  const r=window.__reference,node=document.createElement('div');node.className='rarity-reference-fixture';node.style.cssText='position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;gap:12px;background:#141826;padding:20px';
  node.innerHTML=[19,20,3,144,151].map(id=>`<div class="pc-cell" style="width:140px;height:160px;flex:none">${r.UI.tierGlow(id)}${r.UI.sprBox(id,false,2,76)}<b style="position:relative">${r.Game.DEX[id].name}</b></div>`).join('');document.body.append(node);
  return [...node.querySelectorAll('.tglow')].map(el=>({className:el.className,background:getComputedStyle(el).backgroundImage,animation:getComputedStyle(el).animationName}));
 });
 await fs.mkdir('docs/rarity-evidence',{recursive:true});await page.screenshot({path:'docs/rarity-evidence/native-colors.png'});
 const output={schemaVersion:1,source:{build,app,css,appSha256:hash(appBytes),cssSha256:hash(cssBytes)},...data,fixture};
 await fs.writeFile('docs/rarity-evidence/native.json',JSON.stringify(output,null,2));console.log({build,tiers:data.tiers,species:Object.keys(data.species).length,fixture});
}finally{await browser.close();}
