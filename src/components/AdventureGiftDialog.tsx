import {useEffect,useRef} from 'react';
import {createPortal} from 'react-dom';
import {useGameStore} from '../store/useGameStore';
import {getItemSpriteUrl,getPokemonSpecies} from '../data/pokemonData';
import {PokemonArt} from './PokemonArt';
export function AdventureGiftDialog(){
 const gift=useGameStore(s=>s.pendingAdventureGift),choose=useGameStore(s=>s.chooseAdventureGift),panel=useRef<HTMLElement>(null);
 useEffect(()=>{
  if(!gift)return;
  const shell=document.querySelector<HTMLElement>('.game-shell'),old=shell?.inert,previous=document.activeElement as HTMLElement;
  if(shell)shell.inert=true;panel.current?.querySelector('button')?.focus();
  const trap=(e:KeyboardEvent)=>{if(e.key!=='Tab')return;const buttons=[...panel.current!.querySelectorAll('button')];if(!buttons.length)return;const first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}};
  document.addEventListener('keydown',trap);return()=>{if(shell)shell.inert=!!old;document.removeEventListener('keydown',trap);if(previous?.isConnected)previous.focus();};
 },[gift?.key]);
 if(!gift)return null;
 return createPortal(<div className="starter-overlay"><section className="starter-panel adventure-gift-panel" ref={panel} role="dialog" aria-modal="true" aria-label="Adventure gift"><h2>Choose your gift</h2><p>{gift.text}</p><div className="starter-choices">{gift.choices?.map(id=><button key={id} onClick={()=>choose(id)}><PokemonArt id={id} size={96} animated/><b>{getPokemonSpecies(id).name}</b><span>Lv. {gift.level||5}{gift.trade?.[id]?' · '+gift.trade[id].split('-').join(' '):''}</span></button>)}{gift.items?.map(item=><button key={item} onClick={()=>choose(item)}><img src={getItemSpriteUrl(item)} width={64} height={64} alt=""/><b>{item.split('-').join(' ')}</b></button>)}</div></section></div>,document.body);
}
