import fs from 'node:fs';
import { createHash } from 'node:crypto';

// Data export captured from the pinned original; never execute its bundle in production.
const input='scratch/r03/reference-runtime.json';
const bytes=fs.readFileSync(input), reference=JSON.parse(bytes);
const definitions=reference.story.CHAPTERS.filter(chapter => !chapter.reg || chapter.reg === 'kanto');
if(definitions.length !== 14) throw Error(`Expected 14 native Kanto chapters, got ${definitions.length}`);
const catalog={
 schemaVersion:1,
 source:{version:'0.4.103',build:'5598c5890a',bundle:'app.c0c995f8f9.js',snapshot:input,sha256:createHash('sha256').update(bytes).digest('hex')},
 region:{id:'kanto',minSpecies:1,maxSpecies:151},
 chapters:definitions.map((definition,index)=>({id:`kanto-${index+1}`,sourceIndex:reference.story.CHAPTERS.indexOf(definition),nextChapterId:index+1<definitions.length?`kanto-${index+2}`:null,definition})),
};
fs.writeFileSync('src/data/kantoChapterReference.json',JSON.stringify(catalog,null,2)+'\n');
console.log(`Exported ${catalog.chapters.length} chapter templates; no generated node counts or invented encounters.`);
