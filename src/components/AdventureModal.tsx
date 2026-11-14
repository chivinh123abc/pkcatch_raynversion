import React, { useEffect, useState } from 'react';
import { ALL_CHAPTERS, ChapterInfo } from '../data/chaptersData';
import { useGameStore } from '../store/useGameStore';
import { getPokemonSpriteUrl } from '../data/pokemonData';

interface AdventureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChapter: (chapterId: string) => void;
}

export const AdventureModal: React.FC<AdventureModalProps> = ({
  isOpen,
  onClose,
  onSelectChapter,
}) => {
  const { currentChapterId, pokedexCaught } = useGameStore();
  const [selectedChapId, setSelectedChapId] = useState<string>(currentChapterId || 'kanto-7');

  useEffect(() => {
    if (isOpen) setSelectedChapId(currentChapterId);
  }, [isOpen, currentChapterId]);

  if (!isOpen) return null;

  const selectedChap =
    ALL_CHAPTERS.find((c) => c.id === selectedChapId) || ALL_CHAPTERS[0];

  const handleStartOrReplay = () => {
    // CONTINUE keeps the saved step; selecting another chapter starts its replay.
    if (selectedChap.id !== currentChapterId) onSelectChapter(selectedChap.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none animate-fade-in font-game">
      {/* Modal Dialog Container */}
      <div className="relative w-full max-w-5xl h-[88vh] max-h-[720px] rounded-3xl border-2 border-[#2b334c] bg-[#0e111a] shadow-2xl flex overflow-hidden">
        {/* Close Button Top Right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-[#1b2030] border border-slate-700 text-slate-300 hover:text-white hover:bg-rose-600 transition flex items-center justify-center font-bold text-sm"
        >
          ✕
        </button>

        {/* LEFT COLUMN: CHAPTERS LIST */}
        <div className="w-80 shrink-0 border-r border-[#1e2436] bg-[#121624] flex flex-col">
          <div className="p-3 border-b border-[#1e2436] flex items-center justify-between">
            <span className="font-pixel text-white text-lg tracking-wide">Adventure</span>
            <span className="text-[11px] font-bold text-slate-400">Regions 2/8</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-2 custom-scrollbar">
            {ALL_CHAPTERS.map((chap) => {
              const isCur = chap.id === selectedChapId;
              const isCurrentPlaying = chap.id === currentChapterId;

              return (
                <div
                  key={chap.id}
                  onClick={() => setSelectedChapId(chap.id)}
                  className={`group relative rounded-2xl border transition-all p-2 flex items-center justify-between cursor-pointer ${
                    isCur
                      ? 'border-emerald-400 bg-[#1a233a] shadow-[0_0_14px_rgba(52,211,153,0.35)]'
                      : 'border-[#22293e] bg-[#141928] hover:border-slate-500 hover:bg-[#181e30]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Chapter Number or Special Icon */}
                    <div className="flex flex-col items-center justify-center w-7 shrink-0 text-slate-400 font-bold text-[11px]">
                      {chap.chapterNumber > 0 ? (
                        <span>{chap.chapterNumber < 10 ? `0${chap.chapterNumber}` : chap.chapterNumber}</span>
                      ) : (
                        <span className="text-amber-400 text-sm">★</span>
                      )}
                    </div>

                    {/* Leader / Boss Avatar */}
                    <div className="w-10 h-10 rounded-xl bg-[#20273c] border border-slate-700/80 flex items-center justify-center overflow-hidden shrink-0">
                      {chap.leaderSprite ? (
                        <img
                          src={`/assets/trainers/${chap.leaderSprite}.png`}
                          alt={chap.leaderName}
                          className="w-9 h-9 object-contain pixel-art drop-shadow"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `/assets/badges/${chap.badgeSprite}.png`;
                          }}
                        />
                      ) : (
                        <img
                          src={`/assets/badges/${chap.badgeSprite}.png`}
                          alt={chap.badgeName}
                          className="w-6 h-6 object-contain pixel-art"
                        />
                      )}
                    </div>

                    {/* Chapter Title & Level */}
                    <div className="min-w-0 flex-1">
                      <div className="font-pixel text-white text-[15px] truncate leading-tight">
                        {chap.name}
                      </div>
                      <div className="text-[11px] font-bold text-slate-400 truncate">
                        {chap.recommendedLevel}
                      </div>
                      {chap.weatherLabel && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-sky-950/80 text-sky-300 border border-sky-800/80">
                            🌧️ {chap.weatherLabel}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Status Badge */}
                  <div className="shrink-0 flex items-center gap-1 pl-1">
                    {chap.specialCount && (
                      <span className="text-[10px] font-bold text-slate-400">{chap.specialCount}</span>
                    )}
                    {isCurrentPlaying && (
                      <span className="text-[10px] font-bold text-emerald-400 px-1.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-600">
                        Playing
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: CHAPTER DETAIL & ENCOUNTERS */}
        <div className="flex-1 flex flex-col bg-[#0b0e17] overflow-y-auto">
          {/* Gym Backdrop Banner */}
          <div
            className="relative w-full h-44 bg-cover bg-center border-b border-[#21273b] p-6 flex flex-col justify-end"
            style={{ backgroundImage: `url("${selectedChap.gymBackdrop}")` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e17] via-black/40 to-black/20 pointer-events-none" />

            {/* Gym Leader Portrait Floating on Top Right */}
            {selectedChap.leaderSprite && (
              <img
                src={`/assets/trainers/${selectedChap.leaderSprite}.png`}
                alt={selectedChap.leaderName}
                className="absolute right-8 bottom-0 h-40 w-auto object-contain pixel-art drop-shadow-[0_12px_16px_rgba(0,0,0,0.85)] pointer-events-none"
              />
            )}

            {/* Chapter Header Titles */}
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#1a2034]/90 border border-slate-600 p-1 flex items-center justify-center shrink-0 shadow-lg">
                <img
                  src={`/assets/badges/${selectedChap.badgeSprite}.png`}
                  alt={selectedChap.badgeName}
                  className="w-9 h-9 object-contain pixel-art"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-300">
                    {selectedChap.leaderName}
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/80 text-black uppercase">
                    {selectedChap.leaderType}
                  </span>
                </div>
                <h2 className="font-pixel text-white text-2xl tracking-wide leading-tight drop-shadow">
                  {selectedChap.name}
                </h2>
              </div>
            </div>

            {/* Info Badges Row */}
            <div className="relative z-10 flex items-center gap-2 mt-2">
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-600">
                Recommended {selectedChap.recommendedLevel}
              </span>
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-800/90 text-white border border-slate-700">
                Reward {selectedChap.rewardMoneyRange}
              </span>
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-950/90 text-indigo-200 border border-indigo-700">
                🌙 Night
              </span>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 p-6 flex flex-col gap-5">
            {/* 1. Items Found Here */}
            <div>
              <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>ITEMS FOUND HERE</span>
                <span className="text-white font-bold">{selectedChap.items.length}/{selectedChap.items.length} found</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {selectedChap.items.map((item, i) => (
                  <div
                    key={i}
                    className="w-11 h-11 rounded-xl bg-[#141826] border border-[#23293e] flex items-center justify-center p-1"
                    title={item.name}
                  >
                    <img src={item.icon} alt={item.name} className="w-8 h-8 object-contain pixel-art drop-shadow" />
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Pokémon Found Here */}
            <div>
              <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>POKÉMON FOUND HERE</span>
                <span className="text-emerald-400 font-bold">Caught in area</span>
              </div>

              {/* Base Species */}
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedChap.pokemonFound.base.map((mon) => (
                  <div
                    key={mon.speciesId}
                    className="relative w-12 h-12 rounded-xl bg-[#151928] border border-[#242c44] flex flex-col items-center justify-center p-0.5 group"
                    title={`${mon.name} (${mon.rate})`}
                  >
                    <img
                      src={getPokemonSpriteUrl(mon.speciesId, false)}
                      alt={mon.name}
                      className="w-8 h-8 object-contain pixel-art drop-shadow"
                    />
                    <span className="text-[8px] font-bold text-slate-400">{mon.rate}</span>
                    {pokedexCaught.includes(mon.speciesId) && (
                      <img
                        src="/assets/ui/poke-ball.png"
                        alt="Caught"
                        className="absolute -top-1 -right-1 w-3.5 h-3.5 pixel-art"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Night Habitat */}
              {selectedChap.pokemonFound.night && selectedChap.pokemonFound.night.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 mb-1.5">
                    <span>🌙 NIGHT</span>
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500 text-black uppercase">NOW</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedChap.pokemonFound.night.map((mon) => (
                      <div
                        key={mon.speciesId}
                        className="relative w-12 h-12 rounded-xl bg-[#151928] border border-indigo-900/60 flex flex-col items-center justify-center p-0.5"
                        title={`${mon.name} (${mon.rate})`}
                      >
                        <img
                          src={getPokemonSpriteUrl(mon.speciesId, false)}
                          alt={mon.name}
                          className="w-8 h-8 object-contain pixel-art"
                        />
                        <span className="text-[8px] font-bold text-slate-400">{mon.rate}</span>
                        {pokedexCaught.includes(mon.speciesId) && (
                          <img
                            src="/assets/ui/poke-ball.png"
                            alt="Caught"
                            className="absolute -top-1 -right-1 w-3.5 h-3.5 pixel-art"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Day Habitat */}
              {selectedChap.pokemonFound.day && selectedChap.pokemonFound.day.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs font-bold text-amber-300 mb-1.5 flex items-center gap-1.5">
                    <span>☀️ DAY</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedChap.pokemonFound.day.map((mon) => (
                      <div
                        key={mon.speciesId}
                        className="relative w-12 h-12 rounded-xl bg-[#151928] border border-amber-900/40 flex flex-col items-center justify-center p-0.5"
                        title={`${mon.name} (${mon.rate})`}
                      >
                        <img
                          src={getPokemonSpriteUrl(mon.speciesId, false)}
                          alt={mon.name}
                          className="w-8 h-8 object-contain pixel-art"
                        />
                        <span className="text-[8px] font-bold text-slate-400">{mon.rate}</span>
                        {pokedexCaught.includes(mon.speciesId) && (
                          <img
                            src="/assets/ui/poke-ball.png"
                            alt="Caught"
                            className="absolute -top-1 -right-1 w-3.5 h-3.5 pixel-art"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rain Habitat */}
              {selectedChap.pokemonFound.rain && selectedChap.pokemonFound.rain.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-sky-300 mb-1.5">
                    <span>🌧️ RAIN</span>
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500 text-black uppercase">NOW</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedChap.pokemonFound.rain.map((mon) => (
                      <div
                        key={mon.speciesId}
                        className="relative w-12 h-12 rounded-xl bg-[#151928] border border-sky-900/60 flex flex-col items-center justify-center p-0.5"
                        title={`${mon.name} (${mon.rate})`}
                      >
                        <img
                          src={getPokemonSpriteUrl(mon.speciesId, false)}
                          alt={mon.name}
                          className="w-8 h-8 object-contain pixel-art"
                        />
                        <span className="text-[8px] font-bold text-slate-400">{mon.rate}</span>
                        {pokedexCaught.includes(mon.speciesId) && (
                          <img
                            src="/assets/ui/poke-ball.png"
                            alt="Caught"
                            className="absolute -top-1 -right-1 w-3.5 h-3.5 pixel-art"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="p-4 border-t border-[#1e2436] bg-[#0d101a] mt-auto">
            <button
              onClick={handleStartOrReplay}
              className="w-full py-3.5 rounded-2xl bg-[#e3353b] hover:bg-[#ff3b42] text-white font-pixel text-lg uppercase tracking-wider transition shadow-lg active:scale-98"
            >
              {selectedChap.id === currentChapterId ? 'CONTINUE' : 'REPLAY THE CHAPTER'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
