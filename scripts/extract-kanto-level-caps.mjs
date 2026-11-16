import fs from 'node:fs';
const reference=JSON.parse(fs.readFileSync('docs/team-pc-evidence/reference.json','utf8'));
if(reference.source.app!=='c0081498f217061d529fb18ecc4833e9490c93e0b425fc3d04b713d990fdda11')throw Error('Unverified level cap build');
const caps=reference.caps.chapters.map(c=>c.cap);
if(caps.length!==14||caps.some((cap,i)=>!Number.isInteger(cap)||cap<1||cap>reference.caps.maxLevel||i>0&&cap<caps[i-1]))throw Error('Invalid native Kanto caps');
fs.writeFileSync('src/data/kantoLevelCaps.json',JSON.stringify({source:reference.source,max:reference.caps.maxLevel,leagueDone:reference.caps.leagueDone,caps},null,2)+'\n');
console.log({kantoCaps:caps});
