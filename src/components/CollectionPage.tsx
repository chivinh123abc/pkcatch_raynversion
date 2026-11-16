import { useMemo, useRef, useState } from 'react';
import { ALL_SPECIES, getPokemonSpecies } from '../data/pokemonData';
import { TYPE_COLORS } from '../data/typeChart';
import { useGameStore } from '../store/useGameStore';
import { PokemonInstance, PokemonType } from '../types/game';
import { PokemonDetails, PokemonSprite } from './PokemonDetails';
import { collectionMove, experiencePercent, totalStats } from './collectionUtils';
import { RarityGlow } from './RarityGlow';
import { pokemonRarity } from '../game/presentation/pokemonRarity';
import { TypeBadge } from './TypeBadge';
import { FilterSelect } from './FilterSelect';

type Tab = 'team' | 'pokedex';
const regions = ['Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova'];
const PAGE_SIZE = 60;

export function CollectionPage({ tab }: { tab: Tab }) {
  const { party, pcBox, pokedexSeen, pokedexCaught, newCatchCard, partyPresets, activePartyPreset,
    selectPartyPreset, depositPokemon, withdrawPokemon, movePartyMember, movePcPokemon } = useGameStore();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('all');
  const [shinyOnly, setShinyOnly] = useState(false);
  const [canEvolve, setCanEvolve] = useState(false);
  const [sort, setSort] = useState('recent');
  const [descending, setDescending] = useState(true);
  const [page, setPage] = useState(0);
  const [notice, setNotice] = useState('');
  const [pendingSwap, setPendingSwap] = useState<string | null>(null);
  const [detail, setDetail] = useState<{ id: number; uid?: string } | null>(null);
  const [dexOpen, setDexOpen] = useState(true);
  const [moreFilters, setMoreFilters] = useState(false);
  const search = useRef<HTMLInputElement>(null);
  const caught = new Set(pokedexCaught.filter(id => id >= 1 && id <= 151));
  const seen = new Set([...pokedexSeen, ...caught]);
  const owned = [...party, ...pcBox];
  const shinyIds = new Set(owned.filter(mon => mon.isShiny).map(mon => mon.speciesId));
  const percent = caught.size / ALL_SPECIES.length * 100;
  const matches = (id: number) => {
    const species = getPokemonSpecies(id);
    return `${id} ${species.name}`.toLowerCase().includes(query.trim().toLowerCase()) && (!type || species.types.includes(type as PokemonType));
  };
  const box = useMemo(() => {
    const filtered = pcBox.filter(mon => matches(mon.speciesId) && (!shinyOnly || mon.isShiny)
      && (!canEvolve || (getPokemonSpecies(mon.speciesId).evolvesTo?.level <= mon.level)));
    if (sort === 'custom') return descending ? filtered : filtered.reverse();
    return filtered.sort((a, b) => {
      const value = sort === 'name' ? getPokemonSpecies(a.speciesId).name.localeCompare(getPokemonSpecies(b.speciesId).name)
        : sort === 'number' ? a.speciesId - b.speciesId : sort === 'level' ? a.level - b.level
        : sort === 'rarity' ? pokemonRarity(a.speciesId).index - pokemonRarity(b.speciesId).index
        : sort === 'stats' ? totalStats(a) - totalStats(b) : a.caughtAt - b.caughtAt;
      return descending ? -value : value;
    });
  }, [pcBox, query, type, shinyOnly, canEvolve, sort, descending]);
  const maxPage = Math.max(0, Math.ceil(box.length / PAGE_SIZE) - 1);
  const currentPage = Math.min(page, maxPage);
  const dex = ALL_SPECIES.filter(species => matches(species.id) && (!shinyOnly || shinyIds.has(species.id))
    && (status === 'all' || (status === 'caught' ? caught.has(species.id) : status === 'seen' ? seen.has(species.id) && !caught.has(species.id) : status === 'missing' ? !caught.has(species.id) : !seen.has(species.id))));
  const selectedMon = detail?.uid ? owned.find(mon => mon.uid === detail.uid) : undefined;
  const attempt = (action: () => boolean) => {
    const success = action();
    setNotice(success ? 'Team updated.' : 'Wait for the current animation to finish. Keep at least one healthy Pokémon in your team.');
    if (success) { setDetail(null); setPendingSwap(null); }
    return success;
  };
  const inspect = (id: number, uid?: string) => { setNotice(''); setDetail({ id, uid }); };
  const chooseTeam = (mon: PokemonInstance) => pendingSwap ? attempt(() => withdrawPokemon(pendingSwap, mon.uid)) : inspect(mon.speciesId, mon.uid);
  const dropOnSlot = (uid: string, index: number) => {
    if (pcBox.some(mon => mon.uid === uid)) return attempt(() => withdrawPokemon(uid, party[index]?.uid));
    const from = party.findIndex(mon => mon.uid === uid);
    if (from < 0 || from === index || index >= party.length) return;
    const direction = from < index ? 1 : -1;
    attempt(() => { for (let i = from; i !== index; i += direction) if (!movePartyMember(uid, direction)) return false; return true; });
  };
  const types = <FilterSelect value={type} aria-label="Filter by type" onChange={event => { setType(event.target.value); setPage(0); }}><option value="">Types</option>{Object.keys(TYPE_COLORS).map(value => <option key={value}>{value}</option>)}</FilterSelect>;
  const shiny = <button className={`chip btn small replica-shiny-filter ${shinyOnly ? 'gold' : 'ghost'}`} aria-label="Shinies" aria-pressed={shinyOnly} onClick={() => { setShinyOnly(!shinyOnly); setPage(0); }}><span aria-hidden="true">✦</span><span className="filter-label"> Shinies</span></button>;
  const evolveFilter = <button className={`chip btn small replica-evolve-filter ${canEvolve ? 'gold' : 'ghost'}`} aria-pressed={canEvolve} onClick={() => { setCanEvolve(!canEvolve); setPage(0); }}>Can evolve</button>;
  const sortFilter = <select className="replica-sort" aria-label="Sort PC" value={sort} onChange={event => setSort(event.target.value)}><option value="recent">Recent</option><option value="number">Pokédex No.</option><option value="name">Name</option><option value="level">Level</option><option value="rarity">Rarity</option><option value="stats">Stats</option><option value="custom">Custom</option></select>;
  const reverseFilter = <button className="btn small ghost" aria-label="Reverse PC sort" onClick={() => setDescending(!descending)}>{descending ? '↓' : '↑'}</button>;
  const regionFilter = <FilterSelect aria-label="Pokédex region" defaultValue=""><option value="">Regions</option><option value="kanto">Kanto</option>{regions.slice(1).map(name => <option key={name} disabled>{name} · Locked</option>)}</FilterSelect>;
  const extraFilters = <>
    <button className="btn small ghost replica-more-filters" aria-label="More filters" aria-expanded={moreFilters} aria-controls="collection-extra-filters" onClick={() => setMoreFilters(!moreFilters)}>☷</button>
    {moreFilters && <div id="collection-extra-filters" className="replica-filter-popover" role="group" aria-label="Additional filters" onKeyDown={event => { if(event.key==='Escape'){setMoreFilters(false);event.currentTarget.parentElement?.querySelector<HTMLButtonElement>('.replica-more-filters')?.focus();} }}>
      {types}{tab==='team'?<>{evolveFilter}{sortFilter}{reverseFilter}</>:regionFilter}
      <button className="btn small ghost" onClick={()=>setMoreFilters(false)}>Done</button>
    </div>}
  </>;
  const findSpace = () => { search.current?.focus(); search.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }); };

  return <section className="collection-page" id={`screen-${tab}`} aria-label={tab === 'team' ? 'Team and PC' : 'Pokédex'}>
    {tab === 'team' ? <>
      <div className="map-region team-panel" style={{ '--c': '#3b6fe0' } as React.CSSProperties}>
        <div className="map-head"><img src="/assets/items/poke-ball.png" alt="" /><h2>Team</h2><span className="replica-help" title="Select a Pokémon for details. Drag to reorder, or use the Move buttons on its card.">?</span>
          <div className="seg team-sets" aria-label="Saved teams">{Array.from({ length: 5 }, (_, index) => {
            const ids = index === activePartyPreset ? party.map(mon => mon.uid) : partyPresets[index];
            const lead = owned.find(mon => mon.uid === ids?.[0]);
            return <button key={index} className={index === activePartyPreset ? 'on' : ids ? '' : 'ts-free'} aria-pressed={index === activePartyPreset} aria-label={ids ? `Use team ${index + 1}` : `Save current team as Team ${index + 1}`} title={ids ? `Team ${index + 1}` : 'Save the current team in this slot'} onClick={() => attempt(() => selectPartyPreset(index))}>
              {lead && <span className="ts-lead"><PokemonSprite id={lead.speciesId} shiny={lead.isShiny} size={22} /></span>}{ids ? index + 1 : '+'}
            </button>;
          })}</div>
          <div className="map-sum team-avg">Average level <b>{Math.round(party.reduce((sum, mon) => sum + mon.level, 0) / Math.max(1, party.length))}</b></div>
        </div>
        <div className={`team-slots ${pendingSwap ? 'awaiting-swap' : ''}`}>
          {Array.from({ length: 6 }, (_, index) => {
            const mon = party[index];
            return mon ? <button className="slot filled" key={mon.uid} data-fainted={mon.currentHp <= 0 ? '' : undefined} draggable onDragStart={event => event.dataTransfer.setData('text/plain', mon.uid)} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); dropOnSlot(event.dataTransfer.getData('text/plain'), index); }} onClick={() => chooseTeam(mon)} aria-label={`Team ${getPokemonSpecies(mon.speciesId).name}, level ${mon.level}`}>
              <div className="slot-types">{getPokemonSpecies(mon.speciesId).types.map(value => <TypeBadge key={value} type={value} small/>)}</div>
              <div className="replica-team-art"><PokemonSprite id={mon.speciesId} shiny={mon.isShiny} scale={3} /></div>
              <div className="name">{mon.nickname || getPokemonSpecies(mon.speciesId).name}{mon.isShiny && <span className="replica-shiny" aria-label="Shiny"> ✦</span>}</div><div className="lv" title="Move preview">Lv. {mon.level} · {collectionMove(mon)}</div>
              <div className="xpbar" role="progressbar" aria-label={`${getPokemonSpecies(mon.speciesId).name} EXP`} aria-valuenow={Math.round(experiencePercent(mon))} aria-valuemin={0} aria-valuemax={100}><div style={{ width: `${experiencePercent(mon)}%` }} /></div>
            </button> : <button className="slot empty" key={`empty-${index}`} onClick={findSpace} aria-label={`Empty team slot ${index + 1}`} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); dropOnSlot(event.dataTransfer.getData('text/plain'), index); }}><span>Free slot</span><small>Pick a Pokémon from the PC</small></button>;
          })}
        </div>
      </div>
      {pendingSwap && <div className="replica-swap-hint" role="status">Choose the team Pokémon to replace.<button className="btn small ghost" onClick={() => setPendingSwap(null)}>Cancel</button></div>}
      <div className="pc-sticky"><div className="pc-filters">
        <input ref={search} type="search" placeholder="Search a Pokémon…" aria-label="Search PC" value={query} onChange={event => { setQuery(event.target.value); setPage(0); }} />
        {types}{shiny}{evolveFilter}<div className="replica-sortbox">{sortFilter}{reverseFilter}</div>{extraFilters}
      </div></div>
      <div className="pc-grid" aria-label="PC storage" onDragOver={event => event.preventDefault()} onDrop={event => { if (event.target !== event.currentTarget) return; const uid = event.dataTransfer.getData('text/plain'); if (party.some(mon => mon.uid === uid)) attempt(() => depositPokemon(uid)); }}>
        {!box.length && <p className="replica-empty">{pcBox.length ? 'No matching Pokémon.' : 'The PC is empty. Pokémon caught while your team is full end up here.'}</p>}
        {box.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE).map(mon => <button className="pc-cell" key={mon.uid} draggable onDragStart={event => event.dataTransfer.setData('text/plain', mon.uid)} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); event.stopPropagation(); const uid = event.dataTransfer.getData('text/plain'); if (party.some(mon => mon.uid === uid)) attempt(() => depositPokemon(uid)); else if (sort === 'custom') attempt(() => movePcPokemon(uid, mon.uid)); }} onClick={() => inspect(mon.speciesId, mon.uid)} aria-label={`PC ${getPokemonSpecies(mon.speciesId).name}, level ${mon.level}`} title={`${getPokemonSpecies(mon.speciesId).name} · Lv. ${mon.level}`}>
          <RarityGlow id={mon.speciesId}/><div className="replica-pc-art"><PokemonSprite id={mon.speciesId} shiny={mon.isShiny} scale={2} /></div><span className="lvl">Lv. {mon.level}</span><div className="pc-xp"><div style={{ width: `${experiencePercent(mon)}%` }} /></div>
        </button>)}
      </div>
      {maxPage > 0 && <div className="replica-pagination"><button className="btn small ghost" disabled={!currentPage} onClick={() => setPage(currentPage - 1)}>Previous</button><span>{currentPage + 1} / {maxPage + 1}</span><button className="btn small ghost" disabled={currentPage === maxPage} onClick={() => setPage(currentPage + 1)}>Next</button></div>}
    </> : <>
      <div className="map-region dex-hero" style={{ '--c': '#e3353b' } as React.CSSProperties}>
        <div className="map-head"><img src="/assets/sidebar/pok_dex.png" alt="" /><h2>Pokédex</h2><span className="replica-help" title="Track the Pokémon you have seen and caught.">?</span><div className="map-sum"><span>Seen <b>{seen.size}</b></span><span>✦ Shinies <b>{shinyIds.size}</b></span><span>Regions complete <b>{caught.size === ALL_SPECIES.length ? 1 : 0}/1</b></span></div></div>
        <div className="dex-hero-body"><div className="dex-ring" style={{ '--p': percent } as React.CSSProperties}><div><b>{percent < 10 ? percent.toFixed(1) : Math.round(percent)} %</b><small>{caught.size} / {ALL_SPECIES.length}</small></div></div>
          <div className="dex-hero-side"><div className="dex-reg-bars">{regions.map((name, index) => <div className={`replica-region-progress ${index ? 'locked' : ''}`} key={name}><b>{name}</b><div><i style={{ width: index ? 0 : `${percent}%` }} /></div><small>{index ? <img src="/assets/sidebar/padlock_pixel.svg" alt="Locked" /> : `${caught.size} / ${ALL_SPECIES.length}`}</small></div>)}</div>
            <div className="dex-last"><span>Latest catches</span><div>{[...caught].reverse().slice(0, 8).map(id => <button key={id} aria-label={`Latest catch ${getPokemonSpecies(id).name}`} onClick={() => inspect(id)}><PokemonSprite id={id} size={40} /></button>)}</div></div>
          </div>
        </div>
      </div>
      <div className="pc-sticky"><div className="pc-filters dex-filters"><input type="search" aria-label="Search Pokédex" placeholder="Name or number…" value={query} onChange={event => setQuery(event.target.value)} />
        <FilterSelect value={status} aria-label="Pokédex status" onChange={event => setStatus(event.target.value)}><option value="all">Status</option><option value="caught">Caught</option><option value="missing">Not caught</option><option value="seen">Seen, not caught</option><option value="unknown">Unknown</option></FilterSelect>{types}{regionFilter}{shiny}{extraFilters}
      </div></div>
      <div className="map-region dex-region replica-dex-region" style={{ '--c': '#e3353b', '--rc': '#e3353b' } as React.CSSProperties}>
        <button className="map-head replica-region-heading" onClick={() => setDexOpen(!dexOpen)} aria-expanded={dexOpen}><h2>Kanto</h2><div className="map-sum">{ALL_SPECIES.length - caught.size} to go <b>{caught.size} / {ALL_SPECIES.length}</b><span className="replica-region-meter"><i style={{ width: `${percent}%` }} /></span>{dexOpen ? '▾' : '▸'}</div></button>
        {dexOpen && <div className="dex-grid">{!dex.length && <p className="replica-empty">No matching Pokémon.</p>}{dex.map(species => <button key={species.id} className={`dex-cell ${caught.has(species.id) ? 'caught' : seen.has(species.id) ? 'seen' : 'unknown'}`} onClick={() => inspect(species.id)} aria-label={`Number ${species.id}, ${seen.has(species.id) ? species.name : 'unknown'}, ${caught.has(species.id) ? 'caught' : 'not caught'}`}>
          <RarityGlow id={species.id}/><span className="replica-dex-owned">{caught.has(species.id) && <img src="/assets/items/poke-ball.png" alt="Caught" />}</span><div className="replica-dex-art"><PokemonSprite id={species.id} scale={2} unknown={!seen.has(species.id)} /></div><div className="num">No. {String(species.id).padStart(3, '0')}</div><div className="nm">{seen.has(species.id) ? species.name : '???'}</div>
        </button>)}</div>}
      </div>
      {regions.slice(1).map(name => <div className="map-region dex-locked-region" key={name}><h2>{name}</h2><span><img src="/assets/sidebar/padlock_pixel.svg" alt="" />Region locked ▾</span></div>)}
    </>}
    <p className="replica-collection-notice" role="status">{notice}</p>
    {detail && !newCatchCard && <PokemonDetails speciesId={detail.id} level={selectedMon?.level} shiny={selectedMon?.isShiny} mon={selectedMon} notice={notice} onClose={() => setDetail(null)} actions={selectedMon && <>
      {party.some(mon => mon.uid === selectedMon.uid) ? <><button className="btn small ghost" disabled={party[0]?.uid === selectedMon.uid} onClick={() => attempt(() => movePartyMember(selectedMon.uid, -1))}>← Move</button><button className="btn small ghost" disabled={party[party.length - 1]?.uid === selectedMon.uid} onClick={() => attempt(() => movePartyMember(selectedMon.uid, 1))}>Move →</button><button className="btn small" disabled={!party.some(mon => mon.uid !== selectedMon.uid && mon.currentHp > 0)} onClick={() => attempt(() => depositPokemon(selectedMon.uid))}>To PC</button></> : <button className="btn gold" onClick={() => party.length < 6 ? attempt(() => withdrawPokemon(selectedMon.uid)) : (setPendingSwap(selectedMon.uid), setDetail(null))}>{party.length < 6 ? 'Add to team' : 'Swap into team'}</button>}
    </>} />}
  </section>;
}
