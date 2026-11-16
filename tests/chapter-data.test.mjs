import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
const bundle=await build({entryPoints:['src/game/data/chapterCatalog.ts'],bundle:true,write:false,platform:'node',format:'esm'});
const {KANTO_CHAPTER_CATALOG:catalog,validateChapterCatalog:validate,getChapterTemplate,auditRuntimeChapters}=await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);

test('verified Kanto templates include eight gyms, Victory Road and five league chapters',()=>{
  assert.deepEqual(validate(catalog),[]);
  assert.equal(catalog.chapters.length,14);
  assert.equal(catalog.chapters.filter(chapter=>chapter.definition.league).length,5);
  assert.equal(getChapterTemplate('kanto-1').definition.steps.find(step=>step.kind==='gym').sprite,'brock');
  assert.equal(getChapterTemplate('kanto-2').definition.steps.find(step=>step.kind==='gym').sprite,'misty');
  assert.equal(getChapterTemplate('kanto-14').nextChapterId,null);
  assert.throws(()=>getChapterTemplate('missing-chapter'),/No verified chapter template/);
});

test('catalog rejects bad species, inverted levels, empty bosses and unknown node kinds',()=>{
  const data=structuredClone(catalog),steps=data.chapters[0].definition.steps;
  steps.find(step=>step.kind==='gift').gift.choices=[999];
  steps.find(step=>step.kind==='route').lv=[10,2];
  steps.find(step=>step.kind==='gym').team=[];
  steps.push({kind:'pretend-wild',name:'Unimplemented node'});
  const codes=validate(data).map(issue=>issue.code);
  for(const code of ['unknown_species','invalid_level_band','empty_team','unsupported_kind'])assert.ok(codes.includes(code),code);
});

test('catalog rejects dangling and cyclic unlocks rather than falling back to Chapter 1',()=>{
  const dangling=structuredClone(catalog);dangling.chapters[0].nextChapterId='kanto-999';
  assert.ok(validate(dangling).some(issue=>issue.code==='invalid_unlock'));
  const cyclic=structuredClone(catalog);cyclic.chapters.at(-1).nextChapterId='kanto-1';
  assert.ok(validate(cyclic).some(issue=>issue.code==='unlock_cycle'));
  const duplicate=structuredClone(catalog);duplicate.chapters[1].id='kanto-1';
  assert.ok(validate(duplicate).some(issue=>issue.code==='duplicate_or_invalid_id'));
});

test('runtime audit distinguishes templates, node counts and copied route arrays',()=>{
  const shared=[{step:1,type:'badge',name:'Boss without a team'}];
  const problems=auditRuntimeChapters([{id:'kanto-1',totalSteps:3,steps:shared},{id:'kanto-2',totalSteps:1,steps:structuredClone(shared)}]);
  for(const code of ['step_count_mismatch','missing_runtime_trainer','reused_runtime_route','missing_runtime_chapter','boss_template_mismatch'])assert.ok(problems.some(issue=>issue.code===code),code);
});
