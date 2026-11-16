import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { build } from 'esbuild';

const root=fileURLToPath(new URL('../',import.meta.url));
const source=path.join(root,'resources/pokemon/showdown');
const destination=path.join(root,'public/assets/pokemon/showdown');
const profiles=['gen5ani','gen5ani-shiny','gen5ani-back','gen5ani-back-shiny'];
const bundle=await build({entryPoints:[path.join(root,'src/data/pokemonData.ts')],bundle:true,write:false,platform:'node',format:'esm'});
const {ALL_SPECIES}=await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
const slug=name=>name.toLowerCase().replace(/♀/g,'f').replace(/♂/g,'m').replace(/['.\s-]/g,'');
const manifest={},selected=[],inventory=[];
for(const profile of profiles){
 const entries=await fs.readdir(path.join(source,profile),{withFileTypes:true});
 inventory.push({profile,gifs:entries.filter(entry=>entry.isFile()&&entry.name.endsWith('.gif')).length});
}
// Preflight all currently supported species before publishing any runtime files.
for(const species of ALL_SPECIES){
 const name=slug(species.name);const record={slug:name};
 for(const profile of profiles){
  const relative=`${profile}/${name}.gif`,file=path.join(source,relative);
  const bytes=await fs.readFile(file);
  if(!['GIF87a','GIF89a'].includes(bytes.subarray(0,6).toString()))throw Error(`Invalid GIF: ${relative}`);
  const width=bytes.readUInt16LE(6),height=bytes.readUInt16LE(8);
  if(!width||!height)throw Error(`Invalid dimensions: ${relative}`);
  record[profile]={width,height};
  selected.push({relative,source:file,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
 }
 manifest[species.id]=record;
}
for(const profile of profiles)await fs.mkdir(path.join(destination,profile),{recursive:true});
await Promise.all(selected.map(file=>fs.copyFile(file.source,path.join(destination,file.relative))));
await fs.writeFile(path.join(root,'src/data/showdownSprites.json'),JSON.stringify(manifest)+'\n');
await fs.mkdir(path.join(root,'docs/sprite-evidence'),{recursive:true});
await fs.writeFile(path.join(root,'docs/sprite-evidence/resource-inventory.json'),JSON.stringify({source:'resources/pokemon/showdown',family:'Pokemon Showdown gen5ani',supportedSpecies:ALL_SPECIES.length,inventory,published: selected.map(({source,...metadata})=>metadata)},null,2)+'\n');
console.log(`Published ${selected.length} unchanged GIFs for ${ALL_SPECIES.length} species; source collection preserved.`);
