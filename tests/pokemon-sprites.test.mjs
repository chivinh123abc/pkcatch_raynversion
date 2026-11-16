import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import { build } from 'esbuild';
const bundle=await build({entryPoints:['src/data/pokemonData.ts'],bundle:true,write:false,platform:'node',format:'esm'});
const {ALL_SPECIES,getPokemonArtUrl,getPokemonBattleSpriteUrl,getPokemonSpriteUrl}=await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
const inventory=JSON.parse(await fs.readFile('docs/sprite-evidence/resource-inventory.json','utf8'));

test('all 604 published GIFs retain the user-provided gen5ani bytes and dimensions',async()=>{
  assert.equal(inventory.family,'Pokemon Showdown gen5ani');assert.equal(inventory.published.length,604);
  for(const asset of inventory.published){
    const bytes=await fs.readFile('public/assets/pokemon/showdown/'+asset.relative);
    assert.match(bytes.subarray(0,6).toString(),/^GIF8[79]a$/);
    assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256,asset.relative);
    assert.ok(bytes.readUInt16LE(6)>0&&bytes.readUInt16LE(8)>0,asset.relative);
  }
});

test('every supported normal/shiny/front/back art URL resolves locally; icons remain separate',async()=>{
  for(const species of ALL_SPECIES)for(const shiny of [false,true]){
    const art=getPokemonArtUrl(species.id,shiny);assert.match(art,/^\/assets\/pokemon\/showdown\/gen5ani(?:-shiny)?\/[^/]+\.gif$/);
    for(const back of [false,true])await fs.access('public'+getPokemonBattleSpriteUrl(species.id,shiny,back));
    const icon=getPokemonSpriteUrl(species.id,shiny);assert.match(icon,/^\/assets\/pokemon\/(shiny\/)?\d+\.png$/);await fs.access('public'+icon);
  }
  assert.match(getPokemonArtUrl(29),/nidoranf\.gif$/);assert.match(getPokemonArtUrl(32),/nidoranm\.gif$/);assert.match(getPokemonArtUrl(83),/farfetchd\.gif$/);assert.match(getPokemonArtUrl(122),/mrmime\.gif$/);
});

test('obsolete ani source and runtime directories are absent',async()=>{
  for(const root of ['resources/pokemon/showdown','public/assets/pokemon/showdown'])for(const name of ['ani','ani-shiny','ani-back','ani-back-shiny'])await assert.rejects(fs.access(`${root}/${name}`));
});
