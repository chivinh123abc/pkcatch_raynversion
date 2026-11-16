import { useState } from 'react';
import { getPokemonSpecies } from '../data/pokemonData';
import { TYPE_COLORS } from '../data/typeChart';
import DETAILS from '../data/pokemonDetails.json';
import nativeText from '../data/giftTranslations.json';
import { buddyGoal, EXP_CANDIES, pokemonFamily, familyEvolutions } from '../game/domain/buddy';
import { mainMove, movePower } from '../game/domain/chapterOne';
import { pokemonRarity } from '../game/presentation/pokemonRarity';
import { useGameStore } from '../store/useGameStore';
import type { PokemonInstance } from '../types/game';
import { PokemonArt } from './PokemonArt';
import { PokemonSprite } from './PokemonSprite';
import { TypeBadge } from './TypeBadge';
import { InspectMovesDrawer } from './InspectMovesDrawer';
import { PokemonStatBars } from './PokemonStatBars';
import { currentLevelCap } from '../game/domain/levelCap';

const compact = (n: number) => n >= 1e6 ? `${+(n / 1e6).toFixed(1)}M` : n >= 1000 ? `${+(n / 1000).toFixed(1)}k` : String(n);

export function InspectPokemonCard({ mon, onClose }: {
  mon: PokemonInstance; onClose: () => void;
}) {
  const [movesOpen, setMovesOpen] = useState(false);
  const { buddy, setBuddy, party, pcBox, items, useExpCandy, pokedexSeen, pokedexCaught,badges,completedChapters } = useGameStore();
  const species = getPokemonSpecies(mon.speciesId), info = DETAILS[mon.speciesId], rarity = pokemonRarity(mon.speciesId);
  const move = mainMove(mon), isBuddy = buddy.uid === mon.uid, goal = buddyGoal(mon), max = mon.level >= currentLevelCap({badges,completedChapters});
  const owned = [...party, ...pcBox], family = pokemonFamily(mon.speciesId).filter(id => id <= 151);
  const familyOwned = owned.filter(m => family.includes(m.speciesId) && m.isShiny === mon.isShiny);
  const perk = `+30% battle EXP · EXP bonus every ${goal} KOs`;
  const previousBuddy=owned.find(member=>member.uid===buddy.uid);
  const buddyTitle=(nativeText[isBuddy?'Copain : {perk} · cliquer pour retirer':previousBuddy?'Choisir comme copain : {perk} · remplace {name}':'Choisir comme copain : {perk}']).replace('{perk}',perk).replace('{name}',previousBuddy?getPokemonSpecies(previousBuddy.speciesId).name:'');
  const relativeCard = (id: number, scale: 1 | 2 = 2) => {
    const relatives = familyOwned.filter(m => m.speciesId === id);
    const relative = relatives.find(m => m.uid === mon.uid) || relatives.sort((a,b)=>b.level-a.level)[0];
    const known = pokedexSeen.includes(id) || pokedexCaught.includes(id) || !!relative;
    return <div className={`evo ${relative ? 'own' : 'free'}${!known ? ' unknown' : ''}${id === mon.speciesId ? ' cur' : ''}`}>
      <div className="sprbox" style={{height:72}}><PokemonSprite id={id} shiny={mon.isShiny} scale={scale} unknown={!known} /></div><span>{known ? getPokemonSpecies(id).name : '???'}</span><small>{relative ? <>Lv. {relative.level}{relatives.length>1 ? ` ×${relatives.length}` : ''}</> : '\u00a0'}</small>
    </div>;
  };
  const arrow = (edge: {level?:number;item?:string}) => <div className="arrow">{edge.level ? `Lv. ${edge.level}` : edge.item ? <img src={`/assets/items/${edge.item}.png`} alt={edge.item.split('-').join(' ')} /> : null}<span>→</span></div>;
  const familyBranch = (id: number, scale: 1 | 2 = 2): React.ReactNode => {
    const edges=familyEvolutions(id).filter(edge=>family.includes(edge.to));
    return <>{relativeCard(id,scale)}{edges.length===1 ? <>{arrow(edges[0])}{familyBranch(edges[0].to,scale)}</> : edges.length>1 ? <div className={`evo-branches${edges.length>2 ? ' grid' : ''}`}>{edges.map(edge=><div className="evo-branch" key={edge.to}>{arrow(edge)}{familyBranch(edge.to,edges.length>2 ? 1 : scale)}</div>)}</div> : null}</>;
  };
  const origin = mon.orig || (mon.ot ? {ot:mon.ot} : {how:mon.how,where:mon.where});
  const originLabels: Record<string,string> = {wild:'Caught in the wild',gift:'Gift',egg:'Hatched from an Egg',raid:'Caught in a raid',fossil:'Underground Fossil',tower:'Battle Tower reward',casino:'Game Corner prize',npc:'Trade with a local'};
  return <div className="dexcard v2 mon-card">
    <div className="dc-head">
      <button className={`dc-buddy${isBuddy ? ' on' : ''}`} aria-label={isBuddy ? 'Remove Buddy' : 'Choose as Buddy'} aria-pressed={isBuddy}
        title={buddyTitle}
        onClick={() => setBuddy(isBuddy ? null : mon.uid)}><img src="/assets/items/love-ball.png" alt="" /></button>
      <h2 id="pokemon-detail-name">{species.name}{mon.isShiny && <i className="shiny-mk" role="img" aria-label="Shiny"/>}</h2>
      <div className="dc-sum"><span>No. <b>{String(mon.speciesId).padStart(3, '0')}</b></span><button className="dc-x" aria-label="Close Pokémon details" onClick={onClose}>✕</button></div>
    </div>
    <div className="dc-top">
      <div className="dc-hero sprite"><div className="w"><PokemonArt id={mon.speciesId} shiny={mon.isShiny} size={128} /></div><span className="dc-tag">{party.some(m => m.uid === mon.uid) ? 'In team' : 'PC'}</span></div>
      <div className="dc-id"><div className="genus">{info?.genus || 'Pokémon'}</div>
        <div className="badges">{species.types.map(type => <TypeBadge key={type} type={type} />)}<span className="rarity" style={{ color: rarity.color }}><span className={`rpips r-${rarity.label.toLowerCase()}`} style={{ '--rc': rarity.color } as React.CSSProperties} aria-hidden="true"><i /></span> {rarity.label}</span></div>
        <div className="dc-facts"><div className="dc-fact">Level<b className="lvl">Lv. {mon.level}</b></div><div className="dc-fact">HP<b className="hp-now">{mon.currentHp}/{mon.maxHp}</b></div><div className="dc-fact gt-tile locked">Tastes<b><img className="lock-ic" src="/assets/ui/padlock.svg" alt=""/> ???</b></div></div>
        <button className="dc-move tap replica-move-fact" style={{ '--tc': TYPE_COLORS[move.type] } as React.CSSProperties} aria-label="Move details" onClick={()=>setMovesOpen(true)}><span><b>{move.name}</b> <TypeBadge type={move.type} small /></span><span className="pw">Power <b>{movePower(move.key)}</b></span></button>
      </div>
    </div>
    <div className="dc-sec dc-xp">
      {isBuddy && <div className="dc-bud-gauge" title={`Buddy: ${buddy.ko} / ${goal} KOs before the next EXP bonus`} aria-label={`Buddy ${buddy.ko} of ${goal} KOs`}><div className="bar"><div style={{ width: `${buddy.ko / goal * 100}%` }} /></div><span className="end">+EXP</span></div>}
      <div className="xpbar big" role="progressbar" aria-label="Pokémon EXP" aria-valuemin={0} aria-valuemax={mon.expToNextLevel} aria-valuenow={max ? mon.expToNextLevel : mon.exp}><div style={{ width: `${max ? 100 : mon.exp / mon.expToNextLevel * 100}%` }} /><span>{max ? 'Max level' : `${mon.exp.toLocaleString()} / ${mon.expToNextLevel.toLocaleString()} EXP`}</span></div>
      <div className="dc-candies">{Object.entries(EXP_CANDIES).map(([item, amount]) => <button key={item} className="dc-candy" disabled={max || !(items[item] > 0)} title={item.split('-').join(' ')} aria-label={`Use ${item}`} onClick={() => useExpCandy(mon.uid, item)}><img src={`/assets/items/${item}.png`} alt="" /><i>{compact(items[item] || 0)}</i><span>{item === 'rare-candy' ? '+1 Lv.' : `+${compact(amount)}`}</span></button>)}</div>
    </div>
    <details className="dc-sec dc-fold inspect-stats"><summary><h4>Stats</h4> <span className="dc-tot">Total <b>{Object.values(species.baseStats).reduce((a, b) => a + b, 0)}</b></span><span className="dc-chev">▸</span></summary>
      <div className="stats-slot"><PokemonStatBars speciesId={mon.speciesId} mon={mon}/></div>
    </details>
    {family.length > 1 && <div className="dc-sec fam-sec"><h4>Family <button type="button" className="info-tip" aria-label="Info">i<span className="bag-tip info-tip-box" role="tooltip"><b>Family</b><p>One of each species: duplicates turn into EXP for the family, except those “Keep duplicates” keeps. Shinies count separately and always keep one duplicate of the base form.</p><span className="fam-key"><span><i className="fam-sw own"/>Owned</span><span><i className="fam-sw cur"/>This Pokémon</span><span><i className="fam-sw free"/>Free place</span></span></span></button><span className="fam-n"><b>{familyOwned.length}</b> / {family.length + (mon.isShiny ? 1 : 0)}</span></h4>
      <div className={`evo-chain${family.some(id=>familyEvolutions(id).length>2) ? ' wide' : ''}`}>{familyBranch(family[0])}</div>
    </div>}
    <details className="dc-sec dc-fold inspect-history"><summary><h4>History</h4> <span className="dc-tot"><span className="buddy-sum">{isBuddy && <>Buddy · <b>{perk}</b></>}</span></span><span className="dc-chev">▸</span></summary>
      <div className="dc-facts two dc-history"><div className="dc-fact">{mon.ot ? 'Received on' : 'Caught on'}<b>{mon.caughtAt ? new Date(mon.caughtAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</b></div><div className="dc-fact">Location<b>{origin.where || '—'}</b></div><div className="dc-fact">Origin<b>{originLabels[origin.how || ''] || (origin.ot ? 'Received from a Trainer' : '—')}</b></div><div className="dc-fact">Original Trainer<b>{origin.ot?.split('#')[0] || (origin.how==='npc' ? '—' : 'You')}</b></div><div className="dc-fact">Wins<b>{mon.wins?.toLocaleString('en-US') ?? '—'}</b></div></div>
    </details>
    {movesOpen && <InspectMovesDrawer mon={mon} onClose={()=>setMovesOpen(false)} />}
  </div>;
}
