import { ALL_CHAPTERS, DEFAULT_CHAPTER, type ChapterInfo } from '../../data/chaptersData';
import { rareEncounterWeight } from '../domain/chapterOne';
import type { StepNode } from '../../types/game';
import { chapterReference, defaultChapterRun, generateChapterSteps, stageDistribution, evolutionChain, type ChapterRun } from './chapterGenerator';

export type ChapterState = {currentChapterId:string; currentStep:number; chapterRun?:ChapterRun|null; gifts?:string[]; badges?:string[]; completedChapters?:string[]};
const cache = new WeakMap<ChapterRun,ChapterInfo>();
export function currentChapter(state: Pick<ChapterState,'currentChapterId'|'chapterRun'>): ChapterInfo {
  const base = ALL_CHAPTERS.find(c=>c.id===state.currentChapterId);
  if (!base || base.runtimeSupported===false) return DEFAULT_CHAPTER;
  const run = state.chapterRun;
  if (!run || run.chapterId!==base.id) return base;
  let chapter = cache.get(run);
  if (!chapter) { const steps=generateChapterSteps(base.id,run);chapter={...base,steps,totalSteps:steps.length};cache.set(run,chapter); }
  return chapter;
}
export function currentNode(state: ChapterState): StepNode {
  const chapter=currentChapter(state);
  const node=chapter.steps[state.currentStep-1];
  if (!node) throw Error(`Node ${state.currentStep} outside ${chapter.id}`);
  return node;
}
export function chapterCompleted(chapter: ChapterInfo, state: Pick<ChapterState,'badges'|'completedChapters'>): boolean {
  return !!state.completedChapters?.includes(chapter.id) || chapter.chapterNumber<=8 && !!state.badges?.includes(chapter.badgeSprite);
}
export function chapterUnlocked(chapterId: string, state: Pick<ChapterState,'badges'|'completedChapters'>): boolean {
  const chapter=ALL_CHAPTERS.find(c=>c.id===chapterId);
  if (!chapter?.runtimeSupported) return false;
  if(chapter.chapterNumber===1 || chapterCompleted(chapter,state)) return true;
  const previous=ALL_CHAPTERS.find(c=>c.chapterNumber===chapter.chapterNumber-1&&!c.isSpecial);
  return !!previous && chapterCompleted(previous,state);
}
export interface PoolEntry {id:number;w:number;min:number;max:number;when?:string[];on:boolean;pct:number;boost?:boolean;}
export function nodePool(node: StepNode, chapterId: string, phase='day', weather='clear', rareMultiplier=1): PoolEntry[] {
  if (node.static) return [{id:node.static.speciesId,w:1,min:node.static.level,max:node.static.level,on:true,pct:1}];
  if (!node.source) return [];
  const source=chapterReference(chapterId).steps[node.source.templateIndex];
  const raw: PoolEntry[]=node.pool?node.pool.map(e=>({...e,on:true,pct:0})):source.pools[`${phase}:${weather}`]||source.pools['day:clear']||[];
  const active=raw.filter(e=>e.on).map(e=>({...e,w:rareEncounterWeight(e.id,e.w,rareMultiplier)}));
  const total=active.reduce((sum,e)=>sum+e.w,0);
  return raw.map(e=>{
    const weight=e.on?rareEncounterWeight(e.id,e.w,rareMultiplier):e.w;
    return {...e,w:weight,pct:e.on?weight/Math.max(total,1):e.pct,boost:e.on&&weight>e.w};
  });
}
export function nodeDisplayPool(node: StepNode, chapterId: string, phase='day', weather='clear', rareMultiplier=1): PoolEntry[] {
  const merged=new Map<string,PoolEntry>();
  for(const entry of nodePool(node,chapterId,phase,weather,rareMultiplier)) {
    for(const stage of stageDistribution(evolutionChain(entry.id,entry.max))) {
      const key=stage.id+':'+entry.on;
      const old=merged.get(key);
      if(old){old.pct+=entry.pct*stage.w;old.min=Math.min(old.min,entry.min);old.max=Math.max(old.max,entry.max);}
      else merged.set(key,{...entry,id:stage.id,pct:entry.pct*stage.w});
    }
  }
  return [...merged.values()].sort((a,b)=>Number(b.on)-Number(a.on)||b.pct-a.pct);
}
export function encounterContext(state: Pick<ChapterState,'currentChapterId'|'chapterRun'>, now = Date.now()) {
  const hour=new Date(now).getHours();
  // R03's first chapter is explicitly daytime in the reference.
  return {phase:state.currentChapterId==='kanto-1'?'day':hour>=18||hour<6?'night':hour<10?'morning':'day',weather:state.chapterRun?.weather||'clear'};
}
export { defaultChapterRun };
