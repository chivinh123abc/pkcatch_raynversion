import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {useGameStore} from '../store/useGameStore';
import {getItemSpriteUrl,getPokemonSpecies} from '../data/pokemonData';
import {gameplaySpeed} from '../game/domain/presentationTiming';
import {adventureGiftEffects} from '../utils/adventureGiftEffects';
import {PokemonArt} from './PokemonArt';
import {TypeBadge} from './TypeBadge';

export function AdventureGiftDialog(){
 const gift=useGameStore(s=>s.pendingAdventureGift),panel=useRef<HTMLDivElement>(null);
 const [selected,setSelected]=useState<string|number|null>(null);
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 useEffect(()=>{
  if(!gift)return;
  setSelected(null);
  const controller=new AbortController(),effect=adventureGiftEffects(controller.signal);
  const previous=document.activeElement as HTMLElement|null;
  const shell=document.querySelector<HTMLElement>('.game-shell');
  const arena=document.querySelector('.battle-stage');
  // Fossil choices live inside the arena, which must remain available to pointer input.
  const background=[...(shell?.children||[])].filter(node=>!node.contains(arena)&&!node.contains(panel.current)).map(node=>({node:node as HTMLElement,inert:(node as HTMLElement).inert}));
  background.forEach(({node})=>node.inert=true);
  if(reduced)panel.current?.querySelector<HTMLElement>('button')?.focus({preventScroll:true});
  else void effect.play(gift,gameplaySpeed(useGameStore.getState().gameSpeed)).then(choice=>{
   if(!controller.signal.aborted&&useGameStore.getState().pendingAdventureGift===gift)useGameStore.getState().chooseAdventureGift(choice);
  }).catch(error=>{if(!controller.signal.aborted)console.error('Native gift presentation failed',error);});
  return()=>{controller.abort();effect.dispose();background.forEach(({node,inert})=>node.inert=inert);if(previous?.isConnected)previous.focus({preventScroll:true});};
 },[gift,reduced]);
 if(!gift||!reduced)return null;
 const options=gift.items||gift.choices||[],single=options.length===1,choice=single?options[0]:selected;
 const claim=()=>{if(choice!==null)useGameStore.getState().chooseAdventureGift(choice);};
 return createPortal(<div ref={panel} className={`hatch-fx gift native-gift${single?' auto':''}`} role="dialog" aria-modal="true" aria-label="Adventure gift" onPointerDown={()=>single&&claim()}><div className="hx-title">{gift.text}</div><div className="gift-balls">{options.map(id=><button key={id} className={`gift-ball${typeof id==='string'?' gift-item':''} ready sway${id===choice?' on':''}`} onClick={()=>setSelected(id)} aria-label={typeof id==='number'?getPokemonSpecies(id).name:id.replaceAll('-',' ')}><span className="gb-ring"/><span className="gb-shadow"/>{typeof id==='number'&&<><div className="gb-mon" style={{visibility:'visible'}}><div className="gb-art"><PokemonArt id={id} size={128} animated={false}/></div><b className="gb-lv">Lv. {gift.level}</b></div><i className="gb-arrow"/></>}<span className="gb-body"><img className="gb-ball" src={typeof id==='number'?'/assets/items/poke-ball.png':getItemSpriteUrl(id)} alt=""/></span></button>)}</div><div className="gift-info"><b className="gi-name">{choice===null?(gift.items?'Pick a fossil':'Pick a Pokémon'):typeof choice==='number'?getPokemonSpecies(choice).name:String(choice).split('-').map(w=>w[0].toUpperCase()+w.slice(1)).join(' ')}</b><span className="gi-types">{typeof choice==='number'&&getPokemonSpecies(choice).types.map(type=><TypeBadge key={type} type={type} small/>)}</span>{!gift.items&&<small className="gi-lv">Lv. {gift.level}</small>}</div>{!single&&<button className="btn primary lg gift-go" disabled={choice===null} onClick={claim}>{choice===null?'Confirm':`Choose ${typeof choice==='number'?getPokemonSpecies(choice).name:String(choice).split('-').map(w=>w[0].toUpperCase()+w.slice(1)).join(' ')}`}</button>}<div className="hx-tap gift-tap" style={{opacity:single?1:0}}>Tap to continue</div></div>,document.querySelector('.game-shell')||document.body);
}
