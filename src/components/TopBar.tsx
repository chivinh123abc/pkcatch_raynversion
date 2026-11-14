import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { getItemSpriteUrl, getPokemonSpriteUrl } from '../data/pokemonData';

export const TopBar: React.FC = () => {
  const {
    trainerName,
    trainerTag,
    pokedexCaught,
    money,
    tokens,
    saveGame,
    topToastBanner,
  } = useGameStore();

  return (
    <header className="sticky top-0 z-40 border-b border-[#212536] bg-[#131622] text-[#e8ecf4] px-4 py-2 flex items-center justify-between select-none relative font-game">
      {/* Top Toast Banner (frame 12s) - Duplicate EXP Notification */}
      {topToastBanner && (
        <div className="top-toast-banner absolute top-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-2xl border border-slate-700/80 bg-[#141828]/95 px-5 py-2.5 shadow-2xl backdrop-blur-md">
          {topToastBanner.iconSpeciesId && (
            <img
              src={getPokemonSpriteUrl(topToastBanner.iconSpeciesId, false)}
              alt="Mon"
              className="w-7 h-7 object-contain pixel-art drop-shadow"
            />
          )}
          <span className="font-pixel text-white text-sm tracking-wide">
            {topToastBanner.text}
          </span>
        </div>
      )}

      {/* Left: Trainer Profile Pill + Currency */}
      <div className="flex items-center gap-3">
        {/* Trainer Profile Card matching video (Ray#0910) */}
        <div className="flex items-center gap-2.5 rounded-2xl border border-[#24283c] bg-[#181b29] px-3 py-1.5 shadow-sm">
          <div className="relative h-9 w-9 rounded-xl border border-rose-500/70 bg-[#25293d] flex items-center justify-center overflow-visible">
            <img
              src="/assets/trainers/red.png"
              alt="Avatar"
              className="pixel-art h-11 w-auto object-contain -mt-1"
            />
            {/* Curved NEW badge top-left */}
            <span className="absolute -left-1.5 -top-1.5 rounded-full bg-[#ffcb05] px-1.5 py-0.2 text-[8px] font-black uppercase text-[#12141c] shadow">
              NEW
            </span>
          </div>
          <div className="leading-tight">
            <div className="text-xs font-black text-white tracking-tight flex items-center gap-0.5">
              <span>{trainerName}</span>
              <span className="text-[#8e95ac] font-bold text-[11px]">{trainerTag}</span>
            </div>
            <div className="text-[11px] font-bold text-[#8e95ac]">
              Pokédex <span className="text-white font-black">{pokedexCaught.length} / 151</span>
            </div>
          </div>
        </div>

        {/* Currency Pill with Red Border */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-[#e3353b]/80 bg-[#181b29] px-3.5 py-1.5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black tracking-wider text-[#e3353b] uppercase">
              KANTO
            </span>
            <span className="text-sm font-black text-white tracking-wide">
              {money.toLocaleString()} <span className="font-sans text-rose-300">₽</span>
            </span>
          </div>

          <div className="h-4 w-[1px] bg-[#2d3247]" />

          <div className="flex items-center gap-1.5" title="Coins">
            <img
              src="/assets/ui/coin-case.png"
              alt="Coins"
              className="pixel-art h-4 w-4"
              onError={(e) => {
                (e.target as HTMLImageElement).src = getItemSpriteUrl('rare-candy');
              }}
            />
            <span className="text-xs font-black text-white">
              {tokens.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Online Counter, Weather Toggle, Save, Options */}
      <div className="flex items-center gap-2.5">
        <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-[#24283c] bg-[#181b29] px-3 py-1.5 text-xs font-extrabold text-[#c8ccd6]">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
          <span>7,378 playing</span>
        </div>

        <button
          title="Day / Night"
          className="flex h-9 w-9 items-center justify-center rounded-2xl border border-[#24283c] bg-[#181b29] text-[#ffcb05] hover:bg-[#252a3e] transition"
        >
          🌙
        </button>

        <button
          onClick={() => saveGame()}
          title="Save game"
          className="relative flex items-center gap-1.5 rounded-2xl border border-[#24283c] bg-[#181b29] px-3 py-1.5 text-xs font-extrabold text-white hover:bg-[#252a3e] transition"
        >
          <img
            src="/assets/ui/floppy.svg"
            alt="Save"
            className="h-4 w-4 pixel-art"
          />
          <span>Save</span>
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#161822]" />
        </button>

        <button
          title="Settings"
          className="flex h-9 w-9 items-center justify-center rounded-2xl border border-[#24283c] bg-[#181b29] text-slate-300 hover:text-white hover:bg-[#252a3e] transition"
        >
          ⚙️
        </button>
      </div>
    </header>
  );
};
