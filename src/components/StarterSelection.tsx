import { CSSProperties, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PokemonArt } from './PokemonArt';
import { TitleField } from './TitleField';
import { getPokemonSpecies } from '../data/pokemonData';
import { useGameStore } from '../store/useGameStore';
import '../styles/onboarding-reference.css';
import '../styles/onboarding.css';

type Stage = 'title' | 'intro' | 'avatar' | 'name' | 'welcome' | 'starter' | 'leaving';
const INTRO = [
  "Hello there! Welcome to the world of Pokémon! My name is Oak, but people call me the Pokémon Professor.",
  'Here, your team battles and catches wild Pokémon automatically as you explore.',
  'Defeat Gym Leaders to earn their badges and open up new routes.',
  'Explore Kanto, build your team, and challenge the Pokémon League!',
];
/** Own timers are cancelled on unmount. The runtime starts after the choice commits. */
export function StarterSelection({ hasSave = false, onContinue }: { hasSave?: boolean; onContinue?: () => void }) {
  const [stage,setStage]=useState<Stage>('title'), [line,setLine]=useState(0), [typed,setTyped]=useState(0);
  const [avatar,setAvatar]=useState<'red'|'leaf'|null>(null), [name,setName]=useState('');
  const [selected,setSelected]=useState<number|null>(null), [pikachu,setPikachu]=useState(false), [ready,setReady]=useState(false);
  const [help,setHelp]=useState<'how'|'changes'|'google'|'discord'|null>(null);
  const root=useRef<HTMLElement>(null), leaving=useRef(false);
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const text=stage==='intro'?INTRO[line]:stage==='avatar'?'Now tell me… which character represents you best?':stage==='name'?"And what's your name?":stage==='welcome'?(line===0?`${name.trim()}! Your Pokémon adventure is about to begin!`:'But first, you need a partner. Come on, choose your first Pokémon!'):'';
  useEffect(()=>{
    const shell=document.querySelector<HTMLElement>('.game-shell'), previous=shell?.inert, overflow=document.body.style.overflow;
    if(shell)shell.inert=true;document.body.style.overflow='hidden';
    return()=>{if(shell)shell.inert=!!previous;document.body.style.overflow=overflow;};
  },[]);
  useEffect(()=>{
    setTyped(reduced?text.length:0);if(reduced||!text)return;
    const timer=window.setInterval(()=>setTyped(n=>{if(n>=text.length){clearInterval(timer);return n;}return n+1;}),18);
    return()=>clearInterval(timer);
  },[text,reduced]);
  useEffect(()=>{
    root.current?.focus();if(stage!=='starter')return;
    const timer=window.setTimeout(()=>setReady(true),reduced?0:2600);return()=>clearTimeout(timer);
  },[stage,reduced]);
  useEffect(()=>{if(help)root.current?.querySelector<HTMLButtonElement>('.onboarding-help button')?.focus();},[help]);
  useEffect(()=>{
    if(stage!=='leaving'||selected===null)return;
    const timer=window.setTimeout(()=>useGameStore.getState().chooseStarter(selected,{name,sprite:avatar||'red'}),reduced?0:1150);
    return()=>clearTimeout(timer);
  },[stage,selected,name,avatar,reduced]);
  const advance=()=>{
    if(typed<text.length){setTyped(text.length);return;}
    if(stage==='intro'){if(line<3)setLine(line+1);else setStage('avatar');}
    else if(stage==='welcome'){if(line===0)setLine(1);else setStage('starter');}
  };
  const keys=(event:React.KeyboardEvent)=>{
    if(event.key==='Escape'){
      if(help){setHelp(null);root.current?.focus();return;}
      if(stage==='intro'){setStage('avatar');return;}
      if(stage==='starter'&&ready&&!pikachu){setPikachu(true);setSelected(25);return;}
    }
    if(event.key==='Tab'){
      const elements=[...root.current!.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),[tabindex="0"]')].filter(el=>el.getClientRects().length&&!el.closest('[inert]'));
      const first=elements[0],last=elements[elements.length-1];
      if(event.shiftKey&&(document.activeElement===first||document.activeElement===root.current)){event.preventDefault();last?.focus();}
      else if(!event.shiftKey&&(document.activeElement===last||document.activeElement===root.current)){event.preventDefault();first?.focus();}
    }
  };
  const title=stage==='title', choosing=stage==='starter'||stage==='leaving';
  const start=()=>{if(hasSave){onContinue?.();return;}setHelp(null);setLine(0);setStage('intro');};
  return createPortal(<div className="onboarding-root"><section ref={root} tabIndex={-1} onKeyDown={keys} role="dialog" aria-modal="true" aria-label={choosing?'Choose your first Pokémon':title?'Poké’Catch Online':"Professor Oak's Laboratory"} className={title?'title-fx':choosing?`rc-fx lk-fx lk-choice multi ${ready?'starter-ready':''} ${stage==='leaving'?'starter-leaving':''}`:`lab-fx ${stage==='avatar'||stage==='name'?'asking':''}`}>
    {title?<>
      <TitleField/><div className="ti-main" ref={element=>{if(element)element.inert=!!help;}}><h1 className="ti-logo"><span className="a">Poke'</span><span className="b">Catch</span></h1>
      <div className="ti-menu"><button className="ob-btn primary" onClick={start}>{hasSave?'Continue':'New game'}</button><div className="ti-row"><button className="ob-btn" onClick={()=>setHelp('how')}>How to play</button><button className="ob-btn" onClick={()=>setHelp('changes')}>Changelogs</button></div>
      <div className="ti-account"><button className="ob-btn ti-discord" onClick={()=>setHelp('discord')}><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20 4a19 19 0 0 0-5-2l-.6 1.2a18 18 0 0 0-4.8 0L9 2a19 19 0 0 0-5 2C1 8 0 12 1 17a20 20 0 0 0 6 3l1.2-2-1.9-1A13 13 0 0 0 12 18a13 13 0 0 0 5.7-1l-1.9 1L17 20a20 20 0 0 0 6-3c1-5 0-9-3-13ZM8 14c-1 0-1.7-.9-1.7-2S7 10 8 10s1.7.9 1.7 2S9 14 8 14Zm8 0c-1 0-1.7-.9-1.7-2s.7-2 1.7-2 1.7.9 1.7 2S17 14 16 14Z"/></svg>Sign in with Discord</button>
      <button className="ob-btn ti-google" onClick={()=>setHelp('google')}><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285f4" d="M22 12.2c0-.7-.1-1.4-.2-2.2H12v4h5.6a4.8 4.8 0 0 1-2.1 3.1v2.6h3.4c2-1.8 3.1-4.4 3.1-7.5Z"/><path fill="#34a853" d="M12 22c2.8 0 5.2-.9 6.9-2.3l-3.4-2.6A6.2 6.2 0 0 1 6.2 14H2.7v2.7A10 10 0 0 0 12 22Z"/><path fill="#fbbc05" d="M6.2 14a6 6 0 0 1 0-4V7.3H2.7a10 10 0 0 0 0 9.4Z"/><path fill="#ea4335" d="M12 6c1.5 0 2.9.5 4 1.6L19 4.7A10 10 0 0 0 2.7 7.3L6.2 10A6.1 6.1 0 0 1 12 6Z"/></svg>Sign in with Google</button><small className="ti-local-note">Local edition · progress saved on this device</small></div>
      </div></div>
      <p className="ti-legal">A fan-made game, free and unofficial.<br/>Pokémon and all related names belong to Nintendo, Game Freak and The Pokémon Company.</p>
      {help&&<div className="onboarding-help" role="region" aria-label={help==='how'?'How to play':help==='changes'?'Changelogs':`${help==='google'?'Google':'Discord'} sign-in`}><h2>{help==='how'?'How to play':help==='changes'?'Kanto adventure':`${help==='google'?'Google':'Discord'} sign-in`}</h2>{help==='how'?<><p>Your team battles and catches wild Pokémon automatically.</p><p>Earn eight badges, explore Kanto and challenge the Pokémon League.</p><p>Manage your Pokémon in Team/PC. Your progress is saved on this device.</p></>:help==='changes'?<p>Fourteen Kanto chapters, Gym challenges, fossil choices and the Pokémon League.</p>:<><p>This local edition saves your adventure on this device.</p><p>{help==='google'?'Google':'Discord'} sign-in and cloud saves require an online account service, which is not connected here.</p><button className="ob-btn primary" onClick={start}>{hasSave?'Continue locally':'Play locally'}</button></>}<button className="ob-btn" onClick={()=>{setHelp(null);root.current?.focus();}}>Got it!</button></div>}
    </>:choosing?<>
      <i className="lk-sky"/><h1 className="rc-title lk-title">{pikachu?"Oh? None of these? Then take this Pikachu!":'Professor Oak is offering you a Pokémon!'}</h1>
      <div className="lk-stage">{(pikachu?[25]:[1,4,7]).map((id,i)=><button key={id} aria-label={getPokemonSpecies(id).name} aria-pressed={selected===id} disabled={!ready||stage==='leaving'} onClick={()=>setSelected(id)} className={`lk-slot pick ${selected===id?'on':selected!==null?'off':''}`} style={{'--i':i,'--g':id===1?'119,248,130':id===4?'248,194,119':'119,194,248'} as CSSProperties}>
        <span className="lk-pad"/><span className="starter-beam"/><span className="starter-sparks"/><img className="starter-ball" src="/assets/items/poke-ball.png" alt=""/><span className="lk-mon"><PokemonArt id={id} size={128} animated={selected===id}/></span>
      </button>)}</div>
      <div className="lk-box"><p className="lk-say" aria-live="polite">{stage==='leaving'?<>You choose <b>{getPokemonSpecies(selected!).name}</b>!</>:selected?<><b>{getPokemonSpecies(selected).name}</b> <span className="starter-types">{getPokemonSpecies(selected).types.join(' / ')}</span> <small>Lv. 5</small></>:ready?'Pick a Pokémon!':'…'}</p><i className="lk-more">▼</i></div>
      <button className="ob-btn primary lk-go" disabled={!ready||selected===null||stage==='leaving'} onClick={()=>{if(leaving.current||selected===null)return;leaving.current=true;setStage('leaving');}}>{selected?`Choose ${getPokemonSpecies(selected).name}`:'Pick a Pokémon'}</button>
      {!ready&&<button className="ob-btn ob-skip" onClick={()=>setReady(true)}>Skip ⏭</button>}
    </>:<>
      <div className="lab-bg"/>{stage!=='avatar'&&stage!=='name'&&<img className="lab-oak" src="/assets/trainers/oak.png" alt="Professor Oak"/>}
      {(stage==='intro'||stage==='welcome')?<button className="chen-box" onClick={advance} aria-label="Next dialogue"><b className="chen-name">Prof. Oak</b><span className="chen-text">{text.slice(0,typed)}</span><span className={`chen-next ${typed>=text.length?'on':''}`}>▼</span></button>:<div className="chen-box"><b className="chen-name">Prof. Oak</b><div className="chen-text">{text}</div></div>}
      {stage==='intro'&&<button className="ob-btn ob-skip" onClick={()=>setStage('avatar')}>Skip ⏭</button>}
      {stage==='avatar'&&<div className="lab-ask"><div className="lab-pick">{(['red','leaf'] as const).map(id=><button key={id} className={`lab-av ${avatar===id?'on':''}`} aria-pressed={avatar===id} onClick={()=>setAvatar(id)}><img src={`/assets/trainers/${id}.png`} alt=""/>{id==='red'?'Red':'Leaf'}</button>)}</div><button className="ob-btn primary lab-ok" disabled={!avatar} onClick={()=>{setName(avatar==='leaf'?'Leaf':'Red');setStage('name');}}>Confirm</button></div>}
      {stage==='name'&&<form className="lab-name" onSubmit={event=>{event.preventDefault();if(name.trim()){setLine(0);setStage('welcome');}}}><img src={`/assets/trainers/${avatar}.png`} alt=""/><input aria-label="Your name" maxLength={10} value={name} onChange={event=>setName(event.target.value)} autoComplete="off"/><button className="ob-btn primary" disabled={!name.trim()} type="submit">Confirm</button></form>}
    </>}
  </section></div>,document.body);
}
