import { Consumables } from './Consumables';
import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { getItemSpriteUrl, getPokemonSpriteUrl } from '../data/pokemonData';
import { ALL_CHAPTERS, ChapterInfo, DEFAULT_CHAPTER } from '../data/chaptersData';

type FoundPokemon = ChapterInfo['pokemonFound']['base'][number];

const KANTO7_AREAS: Record<string, { count: string; rain?: boolean; pokemon: FoundPokemon[] }> = {
  'Routes 19-20': {
    count: '10/11',
    rain: true,
    pokemon: [
      { speciesId: 72, name: 'Tentacool', rate: '16%', caught: true },
      { speciesId: 73, name: 'Tentacruel', rate: '16%', caught: true },
      { speciesId: 90, name: 'Shellder', rate: '11%', caught: true },
      { speciesId: 91, name: 'Cloyster', rate: '11%', caught: true },
      { speciesId: 130, name: 'Gyarados', rate: '8%', caught: true },
      { speciesId: 129, name: 'Magikarp', rate: '3%', caught: true },
    ],
  },
  'Power Plant': {
    count: '6/7',
    pokemon: [
      { speciesId: 100, name: 'Voltorb', rate: '48%', caught: true },
      { speciesId: 101, name: 'Electrode', rate: '17%', caught: true },
      { speciesId: 25, name: 'Pikachu', rate: '10%', caught: true },
      { speciesId: 81, name: 'Magnemite', rate: '10%', caught: true },
      { speciesId: 82, name: 'Magneton', rate: '7%', caught: true },
      { speciesId: 125, name: 'Electabuzz', rate: '5%', caught: true },
      { speciesId: 26, name: 'Raichu', rate: '3%', caught: true },
    ],
  },
  'Seafoam Islands': {
    count: '8/12',
    pokemon: [
      { speciesId: 86, name: 'Seel', rate: '35%', caught: true },
      { speciesId: 87, name: 'Dewgong', rate: '25%', caught: true },
      { speciesId: 90, name: 'Shellder', rate: '20%', caught: true },
      { speciesId: 91, name: 'Cloyster', rate: '12%', caught: true },
      { speciesId: 120, name: 'Staryu', rate: '13%', caught: true },
      { speciesId: 79, name: 'Slowpoke', rate: '10%', caught: true },
      { speciesId: 80, name: 'Slowbro', rate: '8%', caught: true },
      { speciesId: 54, name: 'Psyduck', rate: '7%', caught: true },
      { speciesId: 55, name: 'Golduck', rate: '5%', caught: true },
      { speciesId: 116, name: 'Horsea', rate: '4%', caught: true },
      { speciesId: 117, name: 'Seadra', rate: '<1%', caught: false },
      { speciesId: 144, name: 'Articuno', rate: '<1%', caught: false },
    ],
  },
  'Pokémon Mansion': {
    count: '8/12',
    pokemon: [
      { speciesId: 58, name: 'Growlithe', rate: '20%', caught: true },
      { speciesId: 77, name: 'Ponyta', rate: '13%', caught: true },
      { speciesId: 126, name: 'Magmar', rate: '13%', caught: true },
      { speciesId: 37, name: 'Vulpix', rate: '12%', caught: true },
      { speciesId: 88, name: 'Grimer', rate: '12%', caught: true },
      { speciesId: 109, name: 'Koffing', rate: '10%', caught: true },
      { speciesId: 19, name: 'Rattata', rate: '7%', caught: true },
      { speciesId: 89, name: 'Muk', rate: '8%', caught: true },
      { speciesId: 110, name: 'Weezing', rate: '5%', caught: true },
      { speciesId: 20, name: 'Raticate', rate: '<1%', caught: true },
      { speciesId: 146, name: 'Moltres', rate: '<1%', caught: false },
      { speciesId: 132, name: 'Ditto', rate: '<1%', caught: false },
    ],
  },
  'Cinnabar Gym': {
    count: '4/5',
    pokemon: [
      { speciesId: 77, name: 'Ponyta', rate: '35%', caught: true },
      { speciesId: 37, name: 'Vulpix', rate: '30%', caught: true },
      { speciesId: 78, name: 'Rapidash', rate: '20%', caught: true },
      { speciesId: 58, name: 'Growlithe', rate: '15%', caught: true },
      { speciesId: 59, name: 'Arcanine', rate: '<1%', caught: false },
    ],
  },
};

export const RightPanel: React.FC = () => {
  const {
    pokedexCaught,
    berries,
    berryBuffs,
    useBerry,
    currentChapterId,
    currentStep,
  } = useGameStore();

  const currentChapter =
    ALL_CHAPTERS.find((c) => c.id === currentChapterId) || DEFAULT_CHAPTER;

  const formatDuration = (sec: number) => {
    if (sec <= 0) return '';
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Dynamic route dropdown name
  const routeDropdownName = React.useMemo(() => {
    if (currentChapterId === 'kanto-7') {
      if (currentStep <= 5) return 'Routes 19-20';
      if (currentStep <= 9) return 'Power Plant';
      if (currentStep <= 16) return 'Seafoam Islands';
      if (currentStep >= 26) return 'Cinnabar Gym';
      return 'Pokémon Mansion';
    }
    return 'Route 1';
  }, [currentChapterId, currentStep]);

  const [selectedFoundArea, setSelectedFoundArea] = useState(routeDropdownName);
  useEffect(() => {
    setSelectedFoundArea(routeDropdownName);
  }, [currentChapterId, routeDropdownName]);

  const [nowTick, setNowTick] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNowTick(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  const isNightNow = nowTick.getHours() >= 19 || nowTick.getHours() < 6;

  const activeArea = KANTO7_AREAS[selectedFoundArea] || KANTO7_AREAS[routeDropdownName] || KANTO7_AREAS['Routes 19-20'];
  const foundSpecies = [...new Set((currentChapterId === 'kanto-7'
    ? activeArea.pokemon
    : Object.values(currentChapter.pokemonFound).flat()).map((mon) => mon.speciesId))];
  const isRaining = currentChapterId === 'kanto-7'
    ? Boolean(activeArea.rain)
    : currentChapter.weather === 'rain';

  const renderFoundCell = (mon: FoundPokemon, activeNow: boolean) => {
    const isCaught = pokedexCaught.includes(mon.speciesId);
    return (
      <div
        key={mon.speciesId}
        className={`relative rounded-[10px] border px-1 pt-1.5 pb-1.5 flex flex-col items-center justify-between gap-0.5 min-h-[72px] transition-opacity ${
          isCaught
            ? 'bg-[#6dff8f12] border-[#6dff8f]/25'
            : 'bg-[#00000040] border-white/10'
        } ${activeNow ? 'opacity-100' : 'opacity-45 brightness-75'}`}
        title={`${mon.name} (${mon.rate})`}
      >
        {isCaught && (
          <span className="absolute top-1 right-1.5 z-10 text-[11px] font-bold text-[#6dff8f] leading-none drop-shadow-[1px_1px_0_#000]">
            ✓
          </span>
        )}
        <div className="w-full h-[46px] flex items-center justify-center overflow-hidden">
          <img
            src={getPokemonSpriteUrl(mon.speciesId, false)}
            alt={mon.name}
            className="w-12 h-11 scale-[1.28] -translate-y-0.5 object-contain pixel-art"
          />
        </div>
        <span className="relative z-10 text-[11px] font-bold text-white tabular-nums font-game leading-none drop-shadow-[1px_1px_0_#000]">
          {mon.rate}
        </span>
      </div>
    );
  };

  const conditionalSections = React.useMemo(() => {
    if (currentChapterId === 'kanto-7') return [];
    const sections: Array<{ key: string; icon: string; label: string; isNow: boolean; list: FoundPokemon[] }> = [];
    if (currentChapter.pokemonFound.day && currentChapter.pokemonFound.day.length > 0) {
      sections.push({
        key: 'day',
        icon: '☀️',
        label: 'DAY',
        isNow: !isNightNow,
        list: currentChapter.pokemonFound.day,
      });
    }
    if (currentChapter.pokemonFound.night && currentChapter.pokemonFound.night.length > 0) {
      sections.push({
        key: 'night',
        icon: '🌙',
        label: 'NIGHT',
        isNow: isNightNow,
        list: currentChapter.pokemonFound.night,
      });
    }
    if (currentChapter.pokemonFound.rain && currentChapter.pokemonFound.rain.length > 0) {
      sections.push({
        key: 'rain',
        icon: '🌧️',
        label: 'RAIN',
        isNow: isRaining,
        list: currentChapter.pokemonFound.rain,
      });
    }
    return sections.sort((a, b) => Number(b.isNow) - Number(a.isNow));
  }, [currentChapterId, currentChapter, isNightNow, isRaining]);

  const caughtHereCount = foundSpecies.filter((id) => pokedexCaught.includes(id)).length;
  const allCaughtHere = foundSpecies.length > 0 && caughtHereCount === foundSpecies.length;

  return (
    <aside className="w-64 shrink-0 flex flex-col gap-2.5 select-none text-xs font-game">
      <Consumables />

      {/* 2. Found Here Box (matches original .zone-box / .zone-head / .zone-grid) */}
      <div className="bg-[#1c2030] border-2 border-[#333a52] rounded-xl px-3.5 py-3 shadow-md flex flex-col gap-2.5">
        <div className="flex items-baseline gap-2 pb-2 border-b-2 border-[#333a52]">
          <b className="text-[14px] font-bold text-white whitespace-nowrap">Found here</b>
          <span
            className="w-4 h-4 rounded-full bg-[#252a3d] border border-[#333a52] text-[#9aa3bb] text-[10px] flex items-center justify-center font-bold cursor-pointer shrink-0"
          >
            i
          </span>

          <div className="flex items-center gap-1.5 min-w-0 flex-1 justify-end">
            {currentChapterId === 'kanto-7' ? (
              <select
                aria-label="Found here area"
                value={selectedFoundArea}
                onChange={(event) => setSelectedFoundArea(event.target.value)}
                className="max-w-[100px] truncate bg-transparent text-[12px] text-[#9aa3bb] outline-none cursor-pointer"
              >
                {Object.keys(KANTO7_AREAS).map((area) => (
                  <option key={area} value={area} className="bg-[#1c2030] text-white">{area}</option>
                ))}
              </select>
            ) : (
              <span className="text-[12px] text-[#9aa3bb] truncate">{routeDropdownName}</span>
            )}
            <span className={`text-[14px] font-bold tabular-nums shrink-0 ${allCaughtHere ? 'text-[#6dff8f]' : 'text-[#ffcb05]'}`}>
              {caughtHereCount}/{foundSpecies.length}
            </span>
          </div>
        </div>

        {/* Always available / Area list */}
        {currentChapterId === 'kanto-7' ? (
          <div>
            {isRaining && (
              <div className="text-[11px] font-bold text-sky-300 mb-1.5 flex items-center gap-1 font-game">
                <span>🌧️</span>
                <span>Rain until 0:00</span>
              </div>
            )}
            <div className="grid grid-cols-4 gap-1.5">
              {activeArea.pokemon.map((mon) => renderFoundCell(mon, true))}
            </div>
          </div>
        ) : (
          <>
            {currentChapter.pokemonFound.base.length > 0 && (
              <div className="grid grid-cols-4 gap-1.5">
                {currentChapter.pokemonFound.base.map((mon) => renderFoundCell(mon, true))}
              </div>
            )}
            {conditionalSections.map((sec) => (
              <div key={sec.key} className="pt-2 border-t border-[#212536]">
                <div className={`flex items-center justify-between text-[11px] font-bold mb-1.5 font-game tracking-wider ${sec.isNow ? 'text-white' : 'text-slate-400 opacity-55'}`}>
                  <span className="flex items-center gap-1">
                    <span>{sec.icon}</span>
                    <span>{sec.label}</span>
                  </span>
                  {sec.isNow && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#ffcb05] text-[#1a1a1a] uppercase leading-none">
                      NOW
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {sec.list.map((mon) => renderFoundCell(mon, sec.isNow))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </aside>
  );
};
