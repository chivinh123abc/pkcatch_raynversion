import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import reference from '../data/inspectMovesReference.json';
import { getPokemonSpecies } from '../data/pokemonData';
import type { PokemonInstance, PokemonType } from '../types/game';
import { TypeBadge } from './TypeBadge';

// Native UI.movesDrawer: separate drawer, including future and inherited moves.
export function InspectMovesDrawer({mon,onClose}:{mon:PokemonInstance;onClose:()=>void}) {
  const root=useRef<HTMLDivElement>(null);
  const list=reference.species[mon.speciesId] || [];
  useEffect(()=>{
    const previous=document.activeElement as HTMLElement|null;
    root.current?.querySelector<HTMLButtonElement>('button')?.focus({preventScroll:true});
    const learned=root.current?.querySelectorAll('.mvd-row.done');learned?.[learned.length-1]?.scrollIntoView({block:'center'});
    const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();onClose();}if(event.key==='Tab'){event.preventDefault();root.current?.querySelector<HTMLButtonElement>('button')?.focus();}};
    document.addEventListener('keydown',key,true);
    return()=>{document.removeEventListener('keydown',key,true);previous?.isConnected&&previous.focus({preventScroll:true});};
  },[mon.uid]);
  return createPortal(<div className="mvd-root" ref={root} onMouseDown={event=>event.target===event.currentTarget&&onClose()}><aside className="mvd" role="dialog" aria-label="Moves"><div className="mvd-head"><h3>{getPokemonSpecies(mon.speciesId).name}'s moves</h3><button className="dc-x" aria-label="Close moves" onClick={onClose}>✕</button></div><div className="mvd-sum"><span>Lv. <b>{mon.level}</b></span><span>Learned <b>{list.filter(row=>row.level<=mon.level).length} / {list.length}</b></span></div><ol className="mvd-road">{list.map((row,index)=>{
    return <li key={index} className={`mvd-row${row.level<=mon.level?' done':''}${row.status?' fx':''}`}><span className="mvd-lv">{row.label}</span><div className="mvd-mv"><TypeBadge type={row.type as PokemonType} small/><span className="n">{row.name}{row.from&&<span className="mvd-from">{row.from}</span>}<small>{row.detail}</small></span><span className="pw">{row.power}</span></div></li>;
  })}</ol><p className="mvd-foot">In battle, the Pokémon picks its best learned move against the opponent in front of it.</p></aside></div>,document.querySelector('.game-shell')||document.body);
}
