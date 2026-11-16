import raw from '../../data/kantoChapterReference.json';
import runtimeReference from '../../data/kantoRuntimeReference.json';
import type { ChapterInfo } from '../../data/chaptersData';

export type NativeStepKind = 'route' | 'heal' | 'gift' | 'find' | 'gym' | 'static' | 'unlock' | 'trade';
export interface NativeStep {
  kind: NativeStepKind;
  name: string;
  [key: string]: unknown;
}
export interface ChapterTemplate {
  id: string;
  sourceIndex: number;
  nextChapterId: string | null;
  definition: { name: string; region?: string; league?: boolean; steps: NativeStep[]; [key: string]: unknown };
}
export interface ChapterCatalog {
  schemaVersion: number;
  source: { version: string; build: string; bundle: string; snapshot: string; sha256: string };
  region: { id: string; minSpecies: number; maxSpecies: number };
  chapters: ChapterTemplate[];
}
export interface DataIssue { path: string; code: string; message: string; }
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const integer = (value: unknown, min: number, max: number) => Number.isInteger(value) && Number(value) >= min && Number(value) <= max;
const text = (value: unknown) => typeof value === 'string' && value.trim().length > 0;

/** Validate templates before a generator consumes them; a template is not a flattened runtime route. */
export function validateChapterCatalog(value: unknown): DataIssue[] {
  const issues: DataIssue[] = [];
  const error = (path: string, code: string, message: string) => issues.push({ path, code, message });
  if (!record(value)) return [{ path:'catalog',code:'invalid_catalog',message:'Expected an object.' }];
  if (value.schemaVersion !== 1) error('schemaVersion','unsupported_schema','Expected schemaVersion 1.');
  if (!record(value.source) || !text(value.source.bundle) || !/^[a-f0-9]{64}$/.test(String(value.source.sha256))) error('source','missing_provenance','Expected bundle and snapshot SHA-256.');
  const region = value.region;
  if (!record(region) || region.id !== 'kanto' || region.minSpecies !== 1 || region.maxSpecies !== 151) error('region','unsupported_region','Only verified Kanto 1–151 is enabled in this catalog.');
  if (!Array.isArray(value.chapters) || !value.chapters.length) { error('chapters','empty_chapters','Expected chapter templates.'); return issues; }
  const ids = new Set<string>(), indices = new Set<number>();
  const references: { path: string; from: string; to: string | null }[] = [];
  const species = (id: unknown, path: string) => { if (!integer(id,1,151)) error(path,'unknown_species','Species is outside verified Kanto 1–151.'); };
  const level = (n: unknown, path: string) => { if (!integer(n,1,100)) error(path,'invalid_level','Expected a level from 1 to 100.'); };
  value.chapters.forEach((chapter: unknown, index: number) => {
    const path = `chapters[${index}]`;
    if (!record(chapter)) { error(path,'invalid_chapter','Expected an object.'); return; }
    const id = String(chapter.id);
    if (!/^kanto-\d+$/.test(id) || ids.has(id)) error(path+'.id','duplicate_or_invalid_id','Expected a unique Kanto chapter ID.');
    ids.add(id);
    if (!integer(chapter.sourceIndex,0,13) || indices.has(Number(chapter.sourceIndex))) error(path+'.sourceIndex','invalid_source_index','Expected a unique source index 0–13.');
    if (id !== `kanto-${Number(chapter.sourceIndex) + 1}`) error(path+'.id','source_id_mismatch','Chapter ID must map to its verified source index.');
    indices.add(Number(chapter.sourceIndex));
    if (chapter.nextChapterId !== null && !text(chapter.nextChapterId)) error(path+'.nextChapterId','invalid_unlock','Expected a chapter ID or null.');
    references.push({path:path+'.nextChapterId',from:id,to:chapter.nextChapterId === null ? null : String(chapter.nextChapterId)});
    const definition = chapter.definition;
    if (!record(definition) || !text(definition.name) || !Array.isArray(definition.steps) || !definition.steps.length) { error(path+'.definition','empty_steps','Expected a named chapter with steps.'); return; }
    definition.steps.forEach((step: unknown, nodeIndex: number) => {
      const nodePath = `${path}.definition.steps[${nodeIndex}]`;
      if (!record(step) || !text(step.name)) { error(nodePath,'invalid_step','Expected a named step.'); return; }
      if (!['route','heal','gift','find','gym','static','unlock','trade'].includes(String(step.kind))) error(nodePath+'.kind','unsupported_kind','Step kind needs an explicit adapter; do not convert it to wild.');
      if (step.kind === 'route') {
        for (const key of ['wild','trainers']) if (!integer(step[key],0,100)) error(nodePath+'.'+key,'invalid_count','Expected a nonnegative encounter count.');
        if (Number(step.wild) > 0 && !Array.isArray(step.areas) && !Array.isArray(step.species)) error(nodePath,'missing_pool','Wild routes need areas or a species pool.');
        if (step.lv !== undefined && (!Array.isArray(step.lv) || step.lv.length !== 2 || !integer(step.lv[0],1,100) || !integer(step.lv[1],Number(step.lv[0]),100))) error(nodePath+'.lv','invalid_level_band','Expected ordered [min,max] levels.');
      }
      if (step.kind === 'gym') {
        if (!text(step.leader) || !text(step.sprite)) error(nodePath,'missing_boss','Gym needs a named leader and sprite.');
        if (!Array.isArray(step.team) || !step.team.length) error(nodePath+'.team','empty_team','Boss team cannot be empty.');
        else step.team.forEach((member: unknown, memberIndex: number) => {
          if (!Array.isArray(member) || member.length !== 2) error(`${nodePath}.team[${memberIndex}]`,'invalid_team_member','Expected [species,level].');
          else { species(member[0],`${nodePath}.team[${memberIndex}][0]`); level(member[1],`${nodePath}.team[${memberIndex}][1]`); }
        });
        if (typeof step.reward !== 'number' || step.reward < 0 || !Number.isFinite(step.reward)) error(nodePath+'.reward','invalid_reward','Expected a nonnegative finite reward.');
      }
      if (step.kind === 'static') { species(step.id,nodePath+'.id'); level(step.level,nodePath+'.level'); }
      if (step.kind === 'gift') {
        if (!record(step.gift) || !text(step.gift.key)) error(nodePath+'.gift','invalid_gift','Gift needs a stable key.');
        else if (Array.isArray(step.gift.choices)) {
          if (!step.gift.choices.length) error(nodePath+'.gift.choices','empty_choices','Gift choices cannot be empty.');
          step.gift.choices.forEach((id: unknown) => species(id,nodePath+'.gift.choices'));
          level(step.gift.level,nodePath+'.gift.level');
        }
      }
    });
  });
  for (const reference of references) if (reference.to !== null && (!ids.has(reference.to) || reference.from === reference.to)) error(reference.path,'invalid_unlock','Next chapter must exist and differ from the current chapter.');
  for (const start of references) {
    const visited = new Set<string>(); let cursor: string | null = start.from;
    while (cursor !== null) {
      if (visited.has(cursor)) { error(start.path,'unlock_cycle','Chapter unlock chain contains a cycle.'); break; }
      visited.add(cursor); cursor = references.find(reference => reference.from === cursor)?.to ?? null;
    }
  }
  return issues;
}

const issues = validateChapterCatalog(raw);
if (issues.length) throw new Error(`Invalid reference chapter catalog: ${JSON.stringify(issues)}`);
export const KANTO_CHAPTER_CATALOG = raw as ChapterCatalog;
export function getChapterTemplate(id: string): ChapterTemplate {
  const chapter = KANTO_CHAPTER_CATALOG.chapters.find(chapter => chapter.id === id);
  if (!chapter) throw new Error(`No verified chapter template for ${id}`);
  return chapter;
}

/** Audit current runtime separately: do not mistake legacy node arrays for verified templates. */
export function auditRuntimeChapters(chapters: ChapterInfo[]): DataIssue[] {
  const issues: DataIssue[] = [], ids = new Set<string>();
  chapters.filter(chapter=>chapter.runtimeSupported!==false).forEach((chapter,index) => {
    const path = `runtime[${index}](${chapter.id})`;
    if (ids.has(chapter.id)) issues.push({path,code:'duplicate_runtime_id',message:'Chapter ID is duplicated.'});
    ids.add(chapter.id);
    if (chapter.totalSteps !== chapter.steps.length) issues.push({path,code:'step_count_mismatch',message:`totalSteps=${chapter.totalSteps}, nodes=${chapter.steps.length}`});
    chapter.steps.forEach((node,nodeIndex) => {
      if (node.step !== nodeIndex + 1) issues.push({path:`${path}.steps[${nodeIndex}]`,code:'invalid_step_number',message:'Runtime nodes must be numbered sequentially from 1.'});
      if ((node.type === 'red' || node.type === 'badge') && !node.trainer?.team.length) issues.push({path:`${path}.steps[${nodeIndex}]`,code:'missing_runtime_trainer',message:'Combat node has no trainer team.'});
    });
    const reused = chapters.slice(0,index).find(other => other.steps === chapter.steps || JSON.stringify(other.steps) === JSON.stringify(chapter.steps));
    if (reused) issues.push({path,code:'reused_runtime_route',message:`Shares the same node array as ${reused.id}.`});
    const native = KANTO_CHAPTER_CATALOG.chapters.find(template => template.id === chapter.id);
    const expected = native?.definition.steps.find(step => step.kind === 'gym');
    if (expected) {
      const actual = chapter.steps.find(node => node.type === 'badge')?.trainer;
      const team = actual?.team.map(mon => [mon.speciesId,mon.level]);
      const scaled = runtimeReference.chapters.find(c=>c.id===chapter.id)?.steps.find(s=>s.team)?.team || expected.team;
      if (actual?.sprite !== expected.sprite || JSON.stringify(team) !== JSON.stringify(scaled)) issues.push({path,code:'boss_template_mismatch',message:'Runtime boss sprite/team differs from the verified scaled chapter definition.'});
    }
  });
  for (const chapter of KANTO_CHAPTER_CATALOG.chapters) if (!ids.has(chapter.id)) issues.push({path:chapter.id,code:'missing_runtime_chapter',message:'Native Kanto chapter has no runtime adapter yet.'});
  return issues;
}
