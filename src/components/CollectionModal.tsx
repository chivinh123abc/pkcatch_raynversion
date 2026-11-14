import React, { useEffect, useRef, useState } from 'react';
import { ALL_SPECIES, getPokemonSpecies, getPokemonSpriteUrl } from '../data/pokemonData';
import { useGameStore } from '../store/useGameStore';
import { PokemonInstance } from '../types/game';

type Tab = 'team' | 'pokedex';
const button = 'rounded-lg border border-[#35405a] bg-[#20283b] px-3 py-1.5 hover:bg-[#303c54] disabled:opacity-40 disabled:cursor-not-allowed';

export function CollectionModal({ tab, onTabChange, onClose }: {
  tab: Tab; onTabChange: (tab: Tab) => void; onClose: () => void;
}) {
  const { party, pcBox, activePartyIndex, pokedexSeen, pokedexCaught,
    movePartyMember, depositPokemon, withdrawPokemon } = useGameStore();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedSpecies, setSelectedSpecies] = useState<number | null>(null);
  const [notice, setNotice] = useState('');
  const [page, setPage] = useState(0);
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const elements = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input, select, [tabindex="0"]') || []);
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog.current)) {
        event.preventDefault(); first?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
      previousFocus?.focus();
    };
  }, [onClose]);

  const attempt = (action: () => boolean) => {
    setNotice(action() ? 'Team updated and saved.' : 'Wait for the current move to finish. Keep at least one healthy Pokémon in your team.');
  };
  const matches = (id: number) => {
    const species = getPokemonSpecies(id);
    return `${id} ${species.name} ${species.types.join(' ')}`.toLowerCase().includes(query.trim().toLowerCase());
  };
  const box = pcBox.filter((mon) => matches(mon.speciesId));
  const maxPage = Math.max(0, Math.ceil(box.length / 30) - 1);
  const currentPage = Math.min(page, maxPage);
  const known = new Set([...pokedexSeen, ...pokedexCaught]);
  const caught = new Set(pokedexCaught);
  const speciesList = ALL_SPECIES.filter((s) => matches(s.id)
    && (filter === 'all' || (filter === 'caught' ? caught.has(s.id) : filter === 'seen' ? known.has(s.id) : !known.has(s.id))));
  const detail = selectedSpecies && known.has(selectedSpecies) ? getPokemonSpecies(selectedSpecies) : null;
  const sprite = (mon: PokemonInstance) => <img src={getPokemonSpriteUrl(mon.speciesId, mon.isShiny)} alt="" className="pixel-art h-14 w-16 object-contain" />;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 font-game" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="collection-title" className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border-2 border-[#35405a] bg-[#101522] shadow-2xl outline-none">
        <header className="flex items-center justify-between gap-3 border-b border-[#2b334c] p-4">
          <h2 id="collection-title" className="font-pixel text-2xl">{tab === 'team' ? 'Team / PC' : 'Pokédex · Kanto'}</h2>
          <button className={button} onClick={onClose} aria-label="Close collection">✕</button>
        </header>
        <div className="flex flex-wrap gap-2 border-b border-[#2b334c] p-3">
          <button className={button} aria-pressed={tab === 'team'} onClick={() => { onTabChange('team'); setQuery(''); }}>Team / PC ({party.length} + {pcBox.length})</button>
          <button className={button} aria-pressed={tab === 'pokedex'} onClick={() => { onTabChange('pokedex'); setQuery(''); }}>Pokédex ({caught.size} / {ALL_SPECIES.length})</button>
          <input aria-label="Search Pokémon by name, number or type" placeholder="Name, number or type…" value={query} onChange={(event) => { setQuery(event.target.value); setPage(0); }} className="ml-auto min-w-0 rounded-lg border border-[#35405a] bg-[#0b101b] px-3 py-1.5" />
        </div>
        <div className="overflow-y-auto p-4">
          {tab === 'team' ? <>
            <p className="mb-3 text-slate-400">Select a team slot to swap with a Pokémon in the PC. Team changes are available between moves.</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {party.map((mon, index) => <article key={mon.uid} className={`rounded-xl border p-3 ${selectedSlot === mon.uid ? 'border-emerald-400 bg-[#172c31]' : 'border-[#30394f] bg-[#181e2d]'}`}>
                <button onClick={() => setSelectedSlot(mon.uid)} aria-pressed={selectedSlot === mon.uid} className="flex w-full items-center gap-2 text-left">
                  {sprite(mon)}
                  <span><strong className="font-pixel text-lg">{mon.nickname || getPokemonSpecies(mon.speciesId).name}{mon.isShiny ? ' ★' : ''}</strong><br />Lv. {mon.level} {index === activePartyIndex && <span className="text-emerald-400">· Active</span>}</span>
                </button>
                <div className="my-2 h-2 overflow-hidden rounded-full bg-black/40"><div className="h-full bg-emerald-400" style={{ width: `${100 * mon.currentHp / mon.maxHp}%` }} /></div>
                <p className="mb-2 text-sm text-slate-300">HP {mon.currentHp} / {mon.maxHp} · EXP {mon.exp.toLocaleString()} / {mon.expToNextLevel.toLocaleString()}</p>
                <div className="flex gap-2">
                  <button className={button} disabled={index === 0} aria-label={`Move ${getPokemonSpecies(mon.speciesId).name} earlier`} onClick={() => attempt(() => movePartyMember(mon.uid, -1))}>↑</button>
                  <button className={button} disabled={index === party.length - 1} aria-label={`Move ${getPokemonSpecies(mon.speciesId).name} later`} onClick={() => attempt(() => movePartyMember(mon.uid, 1))}>↓</button>
                  <button className={button} disabled={!party.some((p) => p.uid !== mon.uid && p.currentHp > 0)} onClick={() => attempt(() => depositPokemon(mon.uid))}>To PC</button>
                </div>
              </article>)}
            </div>
            <p role="status" className="my-3 min-h-6 text-amber-300">{notice}</p>
            <h3 className="mb-3 font-pixel text-xl">PC Storage · {pcBox.length} Pokémon</h3>
            {!box.length && <p className="py-6 text-center text-slate-400">{pcBox.length ? 'No matching Pokémon.' : 'Your PC is empty. New catches go here when your team is full.'}</p>}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
              {box.slice(currentPage * 30, (currentPage + 1) * 30).map((mon) => <article key={mon.uid} className="flex flex-col items-center rounded-xl border border-[#30394f] bg-[#181e2d] p-2">
                {sprite(mon)}<span>{mon.nickname || getPokemonSpecies(mon.speciesId).name}{mon.isShiny ? ' ★' : ''}</span><span className="mb-2 text-slate-400">Lv. {mon.level}</span>
                <button className={button} disabled={party.length >= 6 && !party.some((p) => p.uid === selectedSlot)} onClick={() => attempt(() => withdrawPokemon(mon.uid, party.length >= 6 ? selectedSlot || undefined : undefined))}>{party.length >= 6 ? 'Swap selected' : 'Add to team'}</button>
              </article>)}
            </div>
            {maxPage > 0 && <div className="mt-4 flex items-center justify-center gap-3"><button className={button} disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Previous</button><span>{currentPage + 1} / {maxPage + 1}</span><button className={button} disabled={currentPage === maxPage} onClick={() => setPage(currentPage + 1)}>Next</button></div>}
          </> : <>
            <div className="mb-4 flex items-center justify-between gap-3"><p className="text-slate-400">Seen {known.size} · Caught {caught.size} · Total {ALL_SPECIES.length}</p><select aria-label="Pokédex status filter" value={filter} onChange={(event) => setFilter(event.target.value)} className={button}><option value="all">All</option><option value="caught">Caught</option><option value="seen">Seen</option><option value="unknown">Unknown</option></select></div>
            {detail && <section className="mb-4 rounded-xl border border-emerald-700 bg-[#17232b] p-4" aria-live="polite"><h3 className="font-pixel text-xl">#{detail.id} {detail.name} · {detail.types.join(' / ')}</h3><p className="text-slate-300">Base stats: HP {detail.baseStats.hp} · Attack {detail.baseStats.attack} · Defense {detail.baseStats.defense} · Sp. Atk {detail.baseStats.spAttack} · Sp. Def {detail.baseStats.spDefense} · Speed {detail.baseStats.speed}</p></section>}
            {!speciesList.length && <p className="py-8 text-center text-slate-400">No matching Pokémon.</p>}
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-8">
              {speciesList.map((s) => <button key={s.id} onClick={() => setSelectedSpecies(s.id)} aria-label={`Number ${s.id}, ${known.has(s.id) ? s.name : 'unknown'}, ${caught.has(s.id) ? 'caught' : known.has(s.id) ? 'seen' : 'unseen'}`} className={`flex flex-col items-center rounded-xl border p-2 ${caught.has(s.id) ? 'border-emerald-700 bg-[#17282b]' : 'border-[#30394f] bg-[#181e2d]'}`}>
                <span className="text-xs text-slate-400">#{String(s.id).padStart(3, '0')} {caught.has(s.id) ? '●' : ''}</span>
                <img loading="lazy" src={getPokemonSpriteUrl(s.id)} alt="" className={`pixel-art h-14 w-16 object-contain ${known.has(s.id) ? '' : 'brightness-0 opacity-50'}`} />
                <span>{known.has(s.id) ? s.name : '???'}</span>
              </button>)}
            </div>
          </>}
        </div>
      </div>
    </div>
  );
}
