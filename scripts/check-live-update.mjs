import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';

// One small public request. No browser, full asset download, account or save.
const url='https://pokecatch-online.pages.dev/boot.js';
const response=await fetch(url,{signal:AbortSignal.timeout(15000)});
if(!response.ok)throw Error(`boot.js: HTTP ${response.status}`);
const boot=await response.text(),build=boot.match(/window.BUILD="([a-f0-9]+)"/)?.[1];
if(!build)throw Error('Unrecognized boot manifest; inspect instead of guessing');
const applied=JSON.parse(await fs.readFile('src/data/liveMoveUpdate.json','utf8'));
const report={checkedAt:new Date().toISOString(),build,appliedMovesBuild:applied.source.build,
 movesBuildMatches:build===applied.source.build,
 bootSha256:createHash('sha256').update(boot).digest('hex'),
 app:boot.match(/js:"(https:\/\/pokecatch-online.pages.dev\/bundle\/app\.[a-f0-9]+\.js)"/)?.[1],
 css:boot.match(/css:"(https:\/\/pokecatch-online.pages.dev\/bundle\/app\.[a-f0-9]+\.css)"/)?.[1]};
await fs.mkdir('scratch/live-update-check',{recursive:true});
await fs.writeFile('scratch/live-update-check/latest.json',JSON.stringify(report,null,2));
if(!report.movesBuildMatches)await fs.writeFile('scratch/live-update-check/boot.js',boot);
console.log(report);
console.log(report.movesBuildMatches?'Moves/FX already match this build; no bundle download needed.':'Build changed: download only changed app data/FX and compare before syncing. UI/chapters require their own review.');
