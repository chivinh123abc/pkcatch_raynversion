import reference from '../../data/kantoRuntimeReference.json';
import { ROUTE_1_STEPS } from '../../data/routes';
import { getPokemonSpecies } from '../../data/pokemonData';
import type { AdventureGift, StepNode, TrainerInfo } from '../../types/game';
import { getChapterTemplate } from './chapterCatalog';

export interface ChapterRun {
  revision: 1;
  chapterId: string;
  seed: number;
  gifts: string[];
  items: Record<string, number>;
  phase: 'morning' | 'day' | 'night';
  weather: 'clear' | 'rain' | 'storm';
}
export const chapterReference = (id: string) => {
  const chapter = reference.chapters.find(c => c.id === id);
  if (!chapter) throw Error('No runtime data for '+id);
  return chapter;
};
export function chapterRandom(seed: number): () => number {
  let value = seed >>> 0;
  return () => { value += 0x6d2b79f5; let n = value; n = Math.imul(n ^ n >>> 15, n | 1); n ^= n + Math.imul(n ^ n >>> 7, n | 61); return ((n ^ n >>> 14) >>> 0) / 4294967296; };
}
export function defaultChapterRun(chapterId: string): ChapterRun {
  return { revision:1, chapterId, seed:20261116, gifts:['starter'], items:{}, phase:'day', weather:'clear' };
}
export function restoreChapterRun(value: unknown, chapterId: string): ChapterRun | null {
  const run = value as ChapterRun;
  if (!run || run.revision !== 1 || run.chapterId !== chapterId || !Number.isInteger(run.seed) || run.seed < 0 || run.seed > 0xffffffff || !Array.isArray(run.gifts) || !run.gifts.every(x => typeof x === 'string') || !run.items || typeof run.items !== 'object' || Array.isArray(run.items) || !Object.entries(run.items).every(([k,v]) => /^[a-z0-9-]+$/.test(k) && Number.isSafeInteger(v) && v >= 0) || !['morning','day','night'].includes(run.phase) || !['clear','rain','storm'].includes(run.weather)) return null;
  return run;
}
const pick = <T,>(list: T[], random: () => number): T => list[Math.floor(random() * list.length)];
export function weightedPick<T extends { w: number }>(pool: T[], random: () => number): T {
  if (!pool.length) throw Error('Encounter pool is empty');
  let roll = random() * pool.reduce((sum,entry) => sum + entry.w, 0);
  return pool.find(entry => (roll -= entry.w) <= 0) || pool[pool.length - 1];
}
export function evolutionChain(id: number, level: number, item = false): number[] {
  const chain = [id];
  for (let depth=0; depth<3; depth++) {
    const next = reference.evolutions[id]?.find(e => e.level ? e.level <= level : item && level >= reference.rules.trainerItemLevel);
    if (!next || chain.includes(next.to)) break;
    chain.push(id = next.to);
  }
  return chain;
}
export function stageDistribution(chain: number[], favorEvolved = false) {
  const weights = reference.rules.stageOdds.slice(0,chain.length);
  if (favorEvolved) weights.reverse();
  const total = weights.reduce((a,b) => a+b,0);
  return chain.map((id,i) => ({id,w:weights[i]/total}));
}
export function generateTrainer(node: StepNode, chapterId: string, random: () => number, classes?: string[], explicit?: { sprite?: string; trainer?: string; size?: number; team?: number[][]; league?: boolean }): TrainerInfo {
  const ref = chapterReference(chapterId), source = ref.steps[node.source!.templateIndex];
  const pool: {id:number;min:number;max:number;w:number}[] = node.pool || source.pools['day:clear']?.filter(e => e.on).map(e=>({id:e.id,min:e.min,max:e.max,w:e.w||0})) || [];
  const candidates = reference.classes.filter(cls => !classes?.length || classes.includes(cls.sprite));
  const eligible = candidates.map(cls => ({cls,pool:pool.filter(entry => !reference.classTypes[cls.sprite] || getPokemonSpecies(entry.id).types.some(type => reference.classTypes[cls.sprite].includes(type.toLowerCase())))})).filter(entry => entry.pool.length);
  const chosen = pick(eligible.length ? eligible : candidates.map(cls=>({cls,pool})),random);
  if (!chosen) throw Error('No trainer class for '+chapterId);
  const cls = explicit?.sprite ? reference.classes.find(c=>c.sprite===explicit.sprite) || chosen.cls : chosen.cls;
  const size = explicit?.team?.length || explicit?.size || (node.trainer?.gymTrainer ? 1 : 1+Math.floor(random()*(Math.min(2,Math.floor((Number(chapterId.slice(6))-1)/2)+1)+1)));
  const team = explicit?.team?.map(([speciesId,level])=>({speciesId,level})) || Array.from({length:size},()=>{
    const entry = weightedPick(chosen.pool,random);
    const level = Math.min(100,ref.ace,entry.min + Math.floor(random()*(entry.max-entry.min+1)) + (node.trainer?.gymTrainer || explicit?.league ? 0 : Math.floor(random()*2)));
    const chain = evolutionChain(entry.id,level,level>=reference.rules.trainerItemLevel);
    const speciesId = level>=reference.rules.trainerItemLevel ? weightedPick(stageDistribution(chain,true),random).id : random()<reference.rules.trainerEvolveChance ? chain[chain.length-1] : entry.id;
    return {speciesId,level};
  });
  const names = cls.f ? reference.namesF : reference.names;
  const name = explicit?.trainer || `${cls.name} ${pick(names,random)}`;
  return {name,title:cls.name,sprite:cls.sprite,team,rewardMoney:30*Math.max(...team.map(mon=>mon.level)),power:node.trainer?.gymTrainer ? .8 : undefined,gymTrainer:!!node.trainer?.gymTrainer,league:!!explicit?.league};
}

/** Pure generator. Persist the immutable run context so refresh never rerolls a route. */
export function generateChapterSteps(chapterId: string, run = defaultChapterRun(chapterId)): StepNode[] {
  const template = getChapterTemplate(chapterId), ref = chapterReference(chapterId), random = chapterRandom(run.seed), nodes: StepNode[]=[];
  if (chapterId==='kanto-1') {
    // Preserve the verified 20-node R03 run and existing save/checkpoint indices.
    return ROUTE_1_STEPS.map(node => {
      const templateIndex = node.step<=4?1:node.step<=6?2:node.step<=8?3:node.step<=15?4:node.step===18?6:node.step>=19?7:5;
      const source = ref.steps[templateIndex];
      return {...node,source:{chapterId,templateIndex},scene:source.scene?.src,indoor:source.scene?.indoor,levelBand:source.levelBand,
        ...(node.step===5 ? {scene:ref.steps[2].townScene?.src} : {}),...(node.step===16?{scene:ref.steps[5].townScene?.src}:{}),
        trainer:node.trainer?{...node.trainer,power:node.type==='badge'?1.22:.8,gymTrainer:node.step===19}:undefined};
    });
  }
  const append = (node: Omit<StepNode,'step'>) => nodes.push({...node,step:nodes.length+1});
  template.definition.steps.forEach((raw,index)=>{
    const step = raw as any, data = ref.steps[index];
    const scene=data.scene || ref.steps.find(s=>s.team)?.scene;
    const base: Omit<StepNode,'step'|'type'>={name:data.name,source:{chapterId,templateIndex:index},scene:scene?.src,indoor:scene?.indoor,areas:step.areas,levelBand:data.levelBand};
    const gift = (value: AdventureGift) => {if(value.trade||!run.gifts.includes(value.key))append({...base,type:'gift',gift:value});};
    if(step.kind==='route') {
      if(template.definition.league) {
        ref.leagueTrainers.forEach(t=>{
          const node: StepNode={...base,step:0,type:'red',levelBand:t.lv,pool:[],trainer:undefined};
          // League lineups are explicitly defined by the original, rather than random route teams.
          node.trainer=generateTrainer(node,chapterId,random,t.classes,{...t,league:true});append(node);
        });return;
      }
      const route: StepNode[]=[];
      for(let i=0;i<step.wild;i++)route.push({...base,step:0,type:'grass'});
      for(let i=0;i<step.trainers;i++){
        const node: StepNode={...base,step:0,type:'red'};node.trainer=generateTrainer(node,chapterId,random,step.classes);
        const at=Math.min(1,route.length)+Math.floor(random()*(route.length-Math.min(1,route.length)+1));route.splice(at,0,node);
      }
      if(step.item&&random()<reference.rules.itemChance)route.splice(Math.floor(random()*(route.length+1)),0,{...base,step:0,type:'question'});
      if(step.candy&&!run.gifts.includes(step.candy))route.splice(Math.floor(random()*(route.length+1)),0,{...base,step:0,type:'question',reward:{item:'rare-candy',amount:1,once:step.candy}});
      route.forEach(append);
    } else if(step.kind==='heal')append({...base,type:'center'});
    else if(step.kind==='gift')gift({...step.gift,text:data.text});
    else if(step.kind==='find'&&!run.gifts.includes(step.once))append({...base,type:'question',reward:{item:step.item,amount:1,once:step.once}});
    else if(step.kind==='unlock'&&!run.gifts.includes(step.once))append({...base,type:'question',unlock:step.once});
    else if(step.kind==='static'&&(!step.once||!run.gifts.includes(step.once))&&(!step.after||run.gifts.includes(step.after)))append({...base,type:'grass',static:{speciesId:step.id,level:step.level,once:step.once,spirit:step.spirit,after:step.after,reward:step.reward?{...step.reward,text:(data as {rewardText?:string}).rewardText||step.reward.text}:undefined}});
    else if(step.kind==='trade'){
      const offers=step.offers.filter(([item]:[string,number])=>run.items[item]>0);
      if(offers.length)gift({key:'trade:'+chapterId,choices:offers.map(([,id]:[string,number])=>id),level:step.level,text:data.text,trade:Object.fromEntries(offers.map(([item,id]:[string,number])=>[id,item]))});
    } else if(!['find','unlock','static','trade'].includes(step.kind)) {
      if(step.kind!=='gym')throw Error('Unsupported chapter step '+step.kind);
      ref.gymTrainers.forEach(t=>{
        const node: StepNode={...base,step:0,type:'red',levelBand:t.lv,pool:t.pool,trainer:{gymTrainer:true} as TrainerInfo};
        node.trainer=generateTrainer(node,chapterId,random,t.classes);append(node);
      });
      const team=data.team!.map(([speciesId,level])=>({speciesId,level}));
      append({...base,type:'badge',trainer:{name:data.leader!,title:template.definition.league?'Elite Four':'Gym Leader',sprite:step.sprite,team,rewardMoney:step.reward,power:step.power,league:!!template.definition.league}});
    }
  });
  return nodes;
}
