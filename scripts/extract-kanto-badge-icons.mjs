import fs from 'node:fs';
import {createHash} from 'node:crypto';
const reference=JSON.parse(fs.readFileSync('docs/progress-heal-evidence/reference.json','utf8'));
if(reference.source.app!=='c0081498f217061d529fb18ecc4833e9490c93e0b425fc3d04b713d990fdda11')throw Error('Unverified badge build');
const names=['boulder','cascade','thunder','rainbow','soul','marsh','volcano','earth'];
fs.mkdirSync('public/assets/badges/kanto',{recursive:true});
const sources=names.map((name,i)=>{
 const src=`public/assets/badges/frlg-${i+1}.png`,bytes=fs.readFileSync(src);
 if(bytes.readUInt32BE(16)!==128||bytes.readUInt32BE(20)!==16)throw Error('Unexpected badge strip dimensions');
 const badge=reference.center.storyBadges[i],tile=reference.engine.badges[badge];
 if(tile!==i+1)throw Error('Native badge order changed');
 // Native badgeHtml crops the nth 16px tile of its 128x16 strip. Embed it so img SVG has no external dependency.
 const output=`public/assets/badges/kanto/${name}-badge.svg`;
 fs.writeFileSync(output,`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${i*16} 0 16 16" width="16" height="16"><image width="128" height="16" href="data:image/png;base64,${bytes.toString('base64')}" style="image-rendering:pixelated"/></svg>\n`);
 return {src,output,tile,sha256:createHash('sha256').update(bytes).digest('hex')};
});
fs.writeFileSync('docs/progress-heal-evidence/badge-assets.json',JSON.stringify({source:reference.source,sources},null,2)+'\n');
console.log(`Extracted ${sources.length} native colored Kanto badge tiles.`);
