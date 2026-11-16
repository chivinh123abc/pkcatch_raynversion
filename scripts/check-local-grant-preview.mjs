import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {build} from 'esbuild';
import {chromium} from '@playwright/test';

// A separate test profile and owned preview server; never touches the user's browser.
const bundle=await build({stdin:{contents:"export {createGameStore} from './src/store/useGameStore'; export {RARITY_TEST_BACKUP,RARITY_TEST_MARKER} from './src/game/runtime/rarityTestSave';",resolveDir:process.cwd()},bundle:true,write:false,platform:'node',format:'esm'});
const {createGameStore,RARITY_TEST_BACKUP,RARITY_TEST_MARKER}=await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
const data=new Map();globalThis.localStorage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};
const store=createGameStore();store.setState({starterChosen:true,isBattling:false});store.getState().saveGame(true);
const raw=data.get('pokecatch_save_v1'),before=JSON.parse(raw);
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','3011','--strictPort'],{windowsHide:true,stdio:['ignore','pipe','pipe']});
let browser;
try{
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Preview failed to start')),10000);server.stdout.on('data',chunk=>{if(chunk.toString().includes('http://127.0.0.1:3011/')){clearTimeout(timer);resolve();}});server.once('exit',code=>{clearTimeout(timer);reject(Error(`Preview exited ${code}`));});server.stderr.on('data',chunk=>process.stderr.write(chunk));});
 browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage();
 await page.route('**/*',route=>new URL(route.request().url()).origin==='http://127.0.0.1:3011'?route.continue():route.abort());
 await page.addInitScript(raw=>{if(!localStorage.getItem('pokecatch_save_v1')){localStorage.setItem('pokecatch_save_v1',raw);localStorage.setItem('pokecatch_reset_20261115_02','done');}},raw);
 await page.goto('http://127.0.0.1:3011/',{waitUntil:'domcontentloaded'});await page.getByRole('button',{name:'Continue',exact:true}).waitFor();
 const result=await page.evaluate(({backup,marker})=>({save:JSON.parse(localStorage.getItem('pokecatch_save_v1')),backup:localStorage.getItem(backup),marker:localStorage.getItem(marker)}),{backup:RARITY_TEST_BACKUP,marker:RARITY_TEST_MARKER});
 assert.equal(result.save.pcBox.length,before.pcBox.length+36);assert.equal(result.save.pcBox.filter(mon=>mon.isShiny).length,24);assert.deepEqual(result.save.party,before.party);assert.equal(result.backup,raw);assert.equal(result.marker,'done');
 await page.getByRole('button',{name:'Continue',exact:true}).click();await page.getByRole('button',{name:'PC Mew, level 20',exact:true}).first().waitFor();
 await page.reload({waitUntil:'domcontentloaded'});await page.getByRole('button',{name:'Continue',exact:true}).waitFor();
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('pokecatch_save_v1')).pcBox.length),before.pcBox.length+36);
 await fs.writeFile('docs/team-pc-evidence/preview-grant.json',JSON.stringify({origin:'http://127.0.0.1:3011',mode:'production preview',added:36,shiny:24,partyPreserved:true,backupPreserved:true,reloadNoDuplicate:true},null,2));
 console.log('Production localhost preview grant: passed (12 regular + 24 shiny, original party/backup preserved, no duplicates).');
}finally{await browser?.close();server.kill();}
