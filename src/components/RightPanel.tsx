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

  const activeArea = KANTO7_AREAS[selectedFoundArea] || KANTO7_AREAS[routeDropdownName] || KANTO7_AREAS['Routes 19-20'];
  const foundSpecies = [...new Set((currentChapterId === 'kanto-7'
    ? activeArea.pokemon
    : Object.values(currentChapter.pokemonFound).flat()).map((mon) => mon.speciesId))];
  const isRaining = currentChapterId === 'kanto-7'
    ? Boolean(activeArea.rain)
    : currentChapter.weather === 'rain';

  return (
    <aside className="w-56 shrink-0 flex flex-col gap-2.5 select-none text-xs font-game">
      <Consumables />

      {/* 2. Found Here Header Box (Khớp 100% video gameplay frame 00s, 10s) */}
      <div className="bg-[#141624] border border-[#212536] rounded-2xl p-3 shadow-md flex flex-col gap-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-[#212536]">
          <div className="flex items-center gap-1.5">
            <span className="font-pixel text-white text-[19px]">Found here</span>
            <span
              className="w-3.5 h-3.5 rounded-full bg-[#202538] text-slate-400 text-[10px] flex items-center justify-center font-bold cursor-pointer font-game"
            >
              ?
            </span>
          </div>

          <div className="flex items-center gap-1 min-w-0">
            {currentChapterId === 'kanto-7' ? (
              <select
                aria-label="Found here area"
                value={selectedFoundArea}
                onChange={(event) => setSelectedFoundArea(event.target.value)}
                className="max-w-[112px] truncate bg-transparent text-[11px] font-bold text-slate-300 outline-none cursor-pointer"
              >
                {Object.keys(KANTO7_AREAS).map((area) => (
                  <option key={area} value={area} className="bg-[#141624] text-white">{area}</option>
                ))}
              </select>
            ) : (
              <span className="text-[11px] font-bold text-slate-300">{routeDropdownName}</span>
            )}
            <span className="text-[11px] font-black text-emerald-400 ml-1">
              {foundSpecies.filter((id) => pokedexCaught.includes(id)).length}/{foundSpecies.length}
            </span>
            <span className="text-[10px] text-slate-400">▾</span>
          </div>
        </div>

        {/* Rain Section */}
        {currentChapterId === 'kanto-7' && !isRaining && <div className="grid grid-cols-4 gap-1.5">
          {activeArea.pokemon.map(mon => <div key={mon.speciesId} className="relative rounded-lg bg-[#181d2e] border border-[#365442] flex flex-col items-center justify-center" title={`${mon.name} (${mon.rate})`}>
            <img src={getPokemonSpriteUrl(mon.speciesId)} alt={mon.name} className="pixel-art" />
            <span className="text-slate-200">{mon.rate}</span>
          </div>)}
        </div>}
        {isRaining && (
          <div>
            <div className="text-[11px] font-bold text-sky-300 mb-1 flex items-center gap-1">
              <span>🌧️</span>
              <span>Rain until 0:00</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {(currentChapterId === 'kanto-7' ? activeArea.pokemon : currentChapter.pokemonFound.base).map((mon) => (
                <div
                  key={mon.speciesId}
                  className="relative rounded-lg bg-[#181d2e] border border-[#252c44] p-1 flex flex-col items-center justify-center"
                  title={`${mon.name} (${mon.rate})`}
                >
                  <img
                    src={getPokemonSpriteUrl(mon.speciesId, false)}
                    alt={mon.name}
                    className="w-7 h-7 object-contain pixel-art drop-shadow"
                  />
                  <span className="text-[8px] font-bold text-slate-300 tabular-nums">
                    {mon.rate}
                  </span>
                  {pokedexCaught.includes(mon.speciesId) && (
                    <img
                      src="/assets/ui/poke-ball.png"
                      alt="Caught"
                      className="absolute -top-1 -right-1 w-3 h-3 pixel-art"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Night Section */}
        {currentChapterId !== 'kanto-7' && currentChapter.pokemonFound.night && currentChapter.pokemonFound.night.length > 0 && (
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-indigo-300 mb-1">
              <span className="flex items-center gap-1">
                <span>🌙</span>
                <span>NIGHT</span>
              </span>
              <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500 text-black uppercase">
                NOW
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {currentChapter.pokemonFound.night.map((mon) => (
                <div
                  key={mon.speciesId}
                  className="relative rounded-lg bg-[#181d2e] border border-indigo-900/50 p-1 flex flex-col items-center justify-center"
                  title={`${mon.name} (${mon.rate})`}
                >
                  <img
                    src={getPokemonSpriteUrl(mon.speciesId, false)}
                    alt={mon.name}
                    className="w-7 h-7 object-contain pixel-art drop-shadow"
                  />
                  <span className="text-[8px] font-bold text-slate-300 tabular-nums">
                    {mon.rate}
                  </span>
                  {pokedexCaught.includes(mon.speciesId) && (
                    <img
                      src="/assets/ui/poke-ball.png"
                      alt="Caught"
                      className="absolute -top-1 -right-1 w-3 h-3 pixel-art"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rain Bonus Section */}
        {currentChapterId !== 'kanto-7' && currentChapter.pokemonFound.rain && currentChapter.pokemonFound.rain.length > 0 && (
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-sky-300 mb-1">
              <span className="flex items-center gap-1">
                <span>🌧️</span>
                <span>RAIN</span>
              </span>
              <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500 text-black uppercase">
                NOW
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {currentChapter.pokemonFound.rain.map((mon) => (
                <div
                  key={mon.speciesId}
                  className="relative rounded-lg bg-[#181d2e] border border-sky-900/50 p-1 flex flex-col items-center justify-center"
                  title={`${mon.name} (${mon.rate})`}
                >
                  <img
                    src={getPokemonSpriteUrl(mon.speciesId, false)}
                    alt={mon.name}
                    className="w-7 h-7 object-contain pixel-art drop-shadow"
                  />
                  <span className="text-[8px] font-bold text-slate-300 tabular-nums">
                    {mon.rate}
                  </span>
                  {pokedexCaught.includes(mon.speciesId) && (
                    <img
                      src="/assets/ui/poke-ball.png"
                      alt="Caught"
                      className="absolute -top-1 -right-1 w-3 h-3 pixel-art"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Day Section */}
        {currentChapterId !== 'kanto-7' && currentChapter.pokemonFound.day && currentChapter.pokemonFound.day.length > 0 && (
          <div>
            <div className="text-[11px] font-bold text-amber-300 mb-1 flex items-center gap-1">
              <span>☀️</span>
              <span>DAY</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {currentChapter.pokemonFound.day.map((mon) => (
                <div
                  key={mon.speciesId}
                  className="relative rounded-lg bg-[#181d2e] border border-amber-900/50 p-1 flex flex-col items-center justify-center"
                  title={`${mon.name} (${mon.rate})`}
                >
                  <img
                    src={getPokemonSpriteUrl(mon.speciesId, false)}
                    alt={mon.name}
                    className="w-7 h-7 object-contain pixel-art drop-shadow"
                  />
                  <span className="text-[8px] font-bold text-slate-300 tabular-nums">
                    {mon.rate}
                  </span>
                  {pokedexCaught.includes(mon.speciesId) && (
                    <img
                      src="/assets/ui/poke-ball.png"
                      alt="Caught"
                      className="absolute -top-1 -right-1 w-3 h-3 pixel-art"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
