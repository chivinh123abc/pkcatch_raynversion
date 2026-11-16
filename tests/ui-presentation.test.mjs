import assert from 'node:assert/strict';
import {test} from 'node:test';
import fs from 'node:fs/promises';
const reference=JSON.parse(await fs.readFile('docs/ui-polish-evidence/reference.json','utf8'));
test('decorative title pool has native eligible species and usable local regular/shiny sprites',async()=>{
 const data=JSON.parse(await fs.readFile('src/data/titlePresentation.json','utf8'));
 assert.deepEqual(data.pool,reference.title.pool);assert.equal(new Set(data.pool).size,data.pool.length);assert.ok(data.pool.length>=30);
 for(const id of data.pool)for(const folder of ['','shiny/']){
  const png=await fs.readFile(`public/assets/pokemon/${folder}${id}.png`);
  assert.equal(png.subarray(1,4).toString(),'PNG');assert.equal(png.readUInt32BE(16),68);assert.equal(png.readUInt32BE(20),56);
 }
});
test('all eighteen shared type colors match the pinned native presentation',async()=>{
 const colors=JSON.parse(await fs.readFile('src/data/typePresentation.json','utf8'));
 assert.equal(Object.keys(colors).length,18);assert.deepEqual(colors,reference.colors);
});
