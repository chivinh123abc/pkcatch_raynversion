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
const out='docs/strict-parity-evidence';await fs.mkdir(out,{recursive:true});
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
 const keys=new Set(['Passer','Cadeau','Fossile du Souterrain','Super !','Récompense de la Tour','Lot du Casino','Échange avec un habitant','Choisis un fossile !','Choisis un objet !','Tu reçois <b>{name}</b> Nv. {n} !','Attaques','Attaques de {name}','Apprises <b>{n} / {max}</b>',"En combat, le Pokémon choisit sa meilleure attaque apprise contre l'adversaire en face."]);
 for(const key of ['Copain : {perk} · cliquer pour retirer','Choisir comme copain : {perk} · remplace {name}','Choisir comme copain : {perk}'])keys.add(key);
 const source=ts.createSourceFile('native.ts',appBytes.toString(),99,true);
 const extract=node=>{
  if(ts.isBinaryExpression(node)&&['a.LinkFx','a.ItemFX'].includes(node.left.getText(source))) {
   const visit=child=>{if(ts.isCallExpression(child)&&child.expression.getText(source)==='e'&&ts.isStringLiteral(child.arguments[0]))keys.add(child.arguments[0].text);ts.forEachChild(child,visit);};visit(node.right);
  }
  ts.forEachChild(node,extract);
 };extract(source);
 const translations=await page.evaluate(keys=>Object.fromEntries(keys.map(key=>[key,window.__reference.I18n.t(key)])),[...keys]);
 await fs.writeFile(out+'/translations.json',JSON.stringify(translations,null,2));
 if(process.argv.includes('--texts-only'))console.log(Object.fromEntries([...keys].filter(key=>key.startsWith('Attaques')||key.startsWith('Apprises')||key.startsWith('En combat')).map(key=>[key,translations[key]])));
 else {
 const data=await page.evaluate(()=>{const r=window.__reference,g=r.Game;g.S.reducedAnim=true;if(g.S.adv)g.S.adv.paused=true;const mon=g.makeMon(130,100,{shiny:true});Object.assign(mon,{where:'Cycling Road',how:'wild',caughtAt:new Date('2026-11-11T00:00:00Z').getTime(),wins:5363});g.S.mons=[mon];g.S.team=[mon.uid];g.registerDex(130,true);g.S.seen[129]=true;g.setBuddy(mon.uid);document.querySelector('.title-fx')?.remove();document.body.classList.remove('titled');r.Screens.team.init();r.App.show('team');r.Screens.team.render();return {uiKeys:Object.keys(r.UI).filter(k=>/stat|fam|move|glow|skip/i.test(k)),i18nKeys:Object.keys(r.I18n),adventureKeys:Object.keys(r.Adventure),chapters:r.STORY.CHAPTERS.slice(0,14).map((c,i)=>({index:i,name:c.name,steps:c.steps.map((step,index)=>({index,...step})).filter(s=>['gift','find','trade','static'].includes(s.kind))})),spriteGlow:r.UI.spriteGlow.toString(),skippable:r.UI.skippable.toString()};});
 await fs.writeFile(out+'/native-data.json',JSON.stringify(data,null,2));
 const gotIt=page.getByRole('button',{name:/^got it!?$/i});if(await gotIt.isVisible())await gotIt.click();await page.waitForTimeout(350);
 await page.evaluate(()=>window.__reference.UI.monDetail(window.__reference.Game.S.team[0]));await page.locator('.mon-card').waitFor();
 await page.locator('.dc-fold').first().locator('summary').click();await page.locator('.dc-fold').last().locator('summary').click();
 await fs.writeFile(out+'/native-inspect.html',await page.locator('.mon-card').evaluate(e=>e.outerHTML));await page.screenshot({path:out+'/native-inspect.png',timeout:10000});
 const moveRows=await page.evaluate(async()=>{
  const r=window.__reference,g=r.Game;
  document.querySelector('.mon-card .dc-x')?.click();await new Promise(resolve=>setTimeout(resolve,300));
  const result={};
  for(let id=1;id<=151;id++){
   const mon=g.makeMon(id,100);g.receive(mon);await r.UI.monDetail(mon.uid);await new Promise(resolve=>setTimeout(resolve,0));
   const card=[...document.querySelectorAll('.mon-card')].at(-1);if(!card)throw Error(`Missing native inspect ${id}: ${g.getMon(mon.uid)?'owned':'unregistered'}`);card.querySelector('.dc-move').click();
   const drawer=document.querySelector('.mvd-root:not(.out)');
   result[id]=[...drawer.querySelectorAll('.mvd-row')].map(row=>({level:Number(row.querySelector('.mvd-lv').textContent)||0,label:row.querySelector('.mvd-lv').textContent,type:row.querySelector('.type').textContent,name:[...row.querySelector('.n').childNodes].filter(n=>n.nodeType===Node.TEXT_NODE).map(n=>n.textContent).join('').trim(),from:row.querySelector('.mvd-from')?.textContent||'',detail:row.querySelector('small').textContent,power:row.querySelector('.pw').textContent,status:row.classList.contains('fx')}));
   r.UI.closeMovesDrawer();drawer.remove();card.querySelector('.dc-x').click();await new Promise(resolve=>setTimeout(resolve,250));
  }
  return result;
 });
 await fs.writeFile('src/data/inspectMovesReference.json',JSON.stringify({source:{build:'b05c8cc201',app:hash(appBytes)},species:moveRows}));
 console.log({ui:data.uiKeys,i18n:data.i18nKeys,adventure:data.adventureKeys,gifts:data.chapters.map(c=>({index:c.index,steps:c.steps.length}))});
 }
}finally{await browser.close();}
