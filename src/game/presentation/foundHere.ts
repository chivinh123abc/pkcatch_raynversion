import reference from '../../data/chapterOneReference.json';
import { rareEncounterWeight } from '../domain/chapterOne';
import type { ChapterInfo } from '../../data/chaptersData';
import { currentChapter, encounterContext, nodeDisplayPool, type ChapterState } from '../data/chapterSelectors';
export function runtimeFoundHere(state: ChapterState, rareMultiplier = 1): {area:string;sections:FoundSection[]} {
  const chapter=currentChapter(state), env=encounterContext(state);
  let node=chapter.steps[state.currentStep-1];
  if(!node) return {area:chapter.name,sections:[]};
  if(node.type!=='grass'&&!node.pool) node=[...chapter.steps.slice(0,state.currentStep)].reverse().find(n=>n.type==='grass') || chapter.steps.find(n=>n.type==='grass') || node;
  const sections:FoundSection[]=[];
  for(const entry of nodeDisplayPool(node,chapter.id,env.phase,env.weather,rareMultiplier)){
    const key=entry.when?.join('+') || 'base';
    let section=sections.find(s=>s.key===key&&s.active===entry.on);
    if(!section){section={key,active:entry.on,label:key==='base'?undefined:key.split('+').map(s=>s[0].toUpperCase()+s.slice(1)).join(' · '),icon:({day:'☀️',morning:'🌅',night:'🌙',rain:'🌧️',storm:'⛈️'})[key]||'📅',entries:[]};sections.push(section);}
    section.entries.push({speciesId:entry.id,rate:entry.pct,minLevel:entry.min,maxLevel:entry.max,boosted:entry.boost});
  }
  return {area:node.name,sections};
}
export interface FoundEntry { speciesId: number; rate: number; minLevel?: number; maxLevel?: number; boosted?: boolean; special?: boolean; }
export interface FoundSection { key: string; label?: string; icon?: string; active: boolean; entries: FoundEntry[]; }
export function chapterOneFoundHere(step: number, rareMultiplier = 1): { area: string; sections: FoundSection[] } {
  const key = step <= 4 ? 'Route 1' : step <= 8 ? 'Route 2' : 'Forêt de Jade';
  const raw = reference.pools[key];
  const available = (entry: typeof raw[number]) => !entry.when || entry.when.some(value => ['day','morning'].includes(value));
  const weight = (entry: typeof raw[number]) => rareEncounterWeight(entry.id, entry.w, rareMultiplier);
  const total = raw.filter(available).reduce((sum, entry) => sum + weight(entry), 0);
  const sections: FoundSection[] = [];
  for (const entry of raw) {
    const conditions: string[] = entry.when?.length ? entry.when : ['base'];
    for (const condition of conditions) {
      const active = condition === 'base' || ['day','morning'].includes(condition);
      let section = sections.find(value => value.key === condition);
      if (!section) { section = { key: condition, active, label: condition === 'base' ? undefined : condition[0].toUpperCase() + condition.slice(1), icon: ({ day:'☀️',morning:'🌅',night:'🌙',rain:'🌧️' })[condition] || '📅', entries: [] }; sections.push(section); }
      // Native zonePool boosts only active encounters; a locked entry uses its original wOn.
      if (!section.entries.some(value => value.speciesId === entry.id)) section.entries.push({ speciesId: entry.id, minLevel: entry.min, maxLevel: entry.max, rate: active ? weight(entry) / total : entry.w / (total + entry.w), boosted: active && weight(entry) > entry.w });
    }
  }
  sections.sort((a,b) => a.key === 'base' ? -1 : b.key === 'base' ? 1 : Number(b.active) - Number(a.active));
  return { area: key === 'Forêt de Jade' ? 'Viridian Forest' : key, sections };
}
export function chapterFoundHere(chapter: ChapterInfo): { area: string; sections: FoundSection[] } {
  const sections: FoundSection[] = Object.entries(chapter.pokemonFound).filter(([, list]) => list?.length).map(([key,list]) => ({ key, label: key === 'base' ? undefined : key[0].toUpperCase() + key.slice(1), icon: ({ day:'☀️',night:'🌙',rain:'🌧️' })[key], active: key === 'base' || key === 'day', entries: list.map(entry => ({ speciesId: entry.speciesId, rate: entry.rate.startsWith('<') ? .005 : parseFloat(entry.rate) / 100 })) }));
  return { area: chapter.name, sections };
}
