import { Fragment } from 'react';
import { getPokemonSpecies } from '../data/pokemonData';
import type { PokemonInstance } from '../types/game';

const labels = { hp:'HP', attack:'Attack', defense:'Defense', spAttack:'Sp. Atk', spDefense:'Sp. Def', speed:'Speed' };
// Native UI.statBars: base-stat scale, with a separate striped shiny bonus.
const gradient = [[0,'#f97316'],[55,'#f97316'],[85,'#eab308'],[110,'#22c55e'],[140,'#22b8a6'],[180,'#3b82f6'],[225,'#8b5cf6'],[275,'#d946ef'],[330,'#ffc83d']].map(([n,c])=>`${c} ${(Number(n)/160*100).toFixed(1)}%`).join(',');
export function PokemonStatBars({speciesId,mon}:{speciesId:number;mon?:PokemonInstance}) {
 const baseStats=getPokemonSpecies(speciesId).baseStats;
 const pct=(n:number)=>Math.min(100,n/160*100);
 return <div className={`statbars${mon?' real':''}`} style={{'--g':`linear-gradient(90deg,${gradient})`,'--nw':'25cqw'} as React.CSSProperties}>
  {Object.entries(baseStats).map(([key,base])=>{
   const bonus=mon?.isShiny?base*.1:0;
   return <Fragment key={key}><span>{labels[key]}</span><b className={bonus?'shiny-up':undefined} title={bonus?'+10 % ✨ (shiny)':undefined}>{mon?(key==='hp'?`${mon.currentHp}/${mon.maxHp}`:mon.stats[key]):base}</b><div className="bar"><i className={bonus?'':'end'} style={{left:0,width:`${pct(base)}%`,'--x':'0cqw'} as React.CSSProperties}/>{bonus>0&&<i className="shiny end" style={{left:`${pct(base)}%`,width:`${pct(base+bonus)-pct(base)}%`,'--x':`${-pct(base)}cqw`} as React.CSSProperties}/>}</div></Fragment>;
  })}
 </div>;
}
