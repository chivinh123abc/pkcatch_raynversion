import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { getPokemonSpecies } from '../data/pokemonData';
import { TYPE_COLORS } from '../data/typeChart';
import DETAILS from '../data/pokemonDetails.json';
import { useGameStore } from '../store/useGameStore';
import { PokemonInstance } from '../types/game';
import { PokemonArt } from './PokemonArt';
import { pokemonRarity } from '../game/presentation/pokemonRarity';
import { TypeBadge } from './TypeBadge';
import { InspectPokemonCard } from './InspectPokemonCard';
import { PokemonStatBars } from './PokemonStatBars';

export { PokemonSprite } from './PokemonSprite';

export function PokemonDetails({ speciesId, level, shiny = false, isNew = false, capture = false, gift = false, onClose, actions, mon, notice }: {
  speciesId: number; level?: number; shiny?: boolean; isNew?: boolean; capture?: boolean; gift?:boolean; onClose: () => void; actions?: React.ReactNode; mon?: PokemonInstance; notice?: string;
}) {
  const dialog = useRef<HTMLDivElement>(null);
  const close = useRef(onClose); close.current = onClose;
  const caught = useGameStore(s => s.pokedexCaught);
  const seen = useGameStore(s => s.pokedexSeen);
  const ownedCount = useGameStore(s => [...s.party, ...s.pcBox].filter(mon => mon.speciesId === speciesId).length);
  const species = getPokemonSpecies(speciesId);
  const known = isNew || caught.includes(speciesId) || seen.includes(speciesId);
  const info = DETAILS[speciesId];
  const color = TYPE_COLORS[species.types[0]];
  const rarity = pokemonRarity(speciesId);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const background = [...(document.querySelector('.game-shell')?.children || [])].filter(element => !element.classList.contains('replica-modal-backdrop')).map(element => ({ element: element as HTMLElement, inert: (element as HTMLElement).inert }));
    background.forEach(({ element }) => { element.inert = true; });
    dialog.current?.focus({ preventScroll: true });
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); if (!capture) close.current(); }
      if (event.key !== 'Tab') return;
      const elements = [...(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), summary, [tabindex="0"]') || [])];
      const first = elements[0], last = elements[elements.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog.current)) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.body.style.overflow = overflow; background.forEach(({ element, inert }) => { element.inert = inert; }); document.removeEventListener('keydown', keydown); if (previous?.isConnected) previous.focus({ preventScroll: true }); };
  }, [capture]);
  return createPortal(<div className="replica-modal-backdrop" onMouseDown={event => { if (!capture && event.target === event.currentTarget) onClose(); }}>
    <div ref={dialog} className={`modal dexcard-modal ${mon && !capture ? 'replica-inspect mon-modal' : 'replica-detail'}`} role="dialog" aria-modal="true" aria-labelledby="pokemon-detail-name" tabIndex={-1} style={{ '--c': color } as React.CSSProperties}>
      {mon && !capture ? <div className="modal-body"><InspectPokemonCard mon={mon} onClose={onClose}/></div> : <div className="modal-body"><div className="dexcard v2">
        <div className="dc-head"><h2 id="pokemon-detail-name">{known ? species.name : '???'}{shiny && <i className="shiny-mk" role="img" aria-label="Shiny"/>}</h2>{(isNew || shiny) && <span className="dc-new">{isNew ? 'New' : 'Shiny'}</span>}
          <div className="dc-sum"><span>No. <b>{String(speciesId).padStart(3, '0')}</b></span><span>Kanto <b>{new Set(caught).size}</b>/151</span>{!capture && <button className="dc-x" aria-label="Close Pokémon details" onClick={onClose}>✕</button>}</div>
        </div>
        <div className="dc-top">
          <div className={`dc-hero ${caught.includes(speciesId) ? 'caught' : 'not-caught'}`}>
            {caught.includes(speciesId) && <img className="dc-ball" src="/assets/items/poke-ball.png" alt="Caught" />}
            <span className={capture ? 'capture-pokemon-idle' : undefined}>
              <PokemonArt id={speciesId} shiny={shiny} size={128} unknown={!known} />
            </span>
          </div>
          <div className="dc-id"><div className="genus">{known ? info?.genus || 'Pokémon' : 'Unknown Pokémon'}</div>
            {known && <div className="badges">{species.types.map(type => <TypeBadge key={type} type={type}/>)}<span className="rarity" style={{color:rarity.color}}><span className={`rpips r-${rarity.label.toLowerCase()}`} style={{'--rc':rarity.color} as React.CSSProperties}><i/></span>{rarity.label}</span></div>}
            <div className="dc-facts">
              {level !== undefined && <div className="dc-fact">Level<b>{level}</b></div>}
              {known && <><div className="dc-fact">Height<b>{info?.height ?? '—'} m</b></div><div className="dc-fact">Weight<b>{info?.weight ?? '—'} kg</b></div></>}
              <div className="dc-fact">Caught<b><img src="/assets/items/poke-ball.png" alt="" />{Math.max(ownedCount, caught.includes(speciesId) ? 1 : 0)}</b></div>
            </div>
          </div>
        </div>
        <p className={`flavor ${known ? '' : 'muted'}`}>{known ? info?.flavor || species.name : 'Never encountered… for now!'}</p>
        {known && !capture && <details className="dc-sec dc-fold inspect-stats"><summary><h4>Stats</h4><span className="dc-tot">Total <b>{Object.values(species.baseStats).reduce((a,b)=>a+b,0)}</b></span><span className="dc-chev">▸</span></summary>
          <div className="stats-slot"><PokemonStatBars speciesId={speciesId}/></div>
        </details>}
        {actions && <div className="replica-mon-actions">{actions}</div>}
        {notice && <p className="replica-action-status" role="status">{notice}</p>}
      </div></div>}
      {capture && <div className="modal-actions solo"><button className="btn gold" onClick={onClose}>{gift?'Awesome!':'Continue'}</button></div>}
    </div>
  </div>, document.querySelector('.game-shell') || document.body);
}
