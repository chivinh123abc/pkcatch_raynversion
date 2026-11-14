import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { ALL_CHAPTERS, DEFAULT_CHAPTER } from '../data/chaptersData';

export const LeftSidebar: React.FC<{ onOpenCollection: (tab: 'team' | 'pokedex') => void }> = ({ onOpenCollection }) => {
  const {
    currentChapterId,
    currentStep,
    openAdventureModal,
    sidebarExpPopup,
  } = useGameStore();

  const currentChapter =
    ALL_CHAPTERS.find((c) => c.id === currentChapterId) || DEFAULT_CHAPTER;
  const [activeTab, setActiveTab] = useState<'progress' | 'team' | 'pokedex' | 'shop' | 'achievements'>('progress');
  const [activitiesOpen, setActivitiesOpen] = useState(true);
  const [socialOpen, setSocialOpen] = useState(true);

  const pct = Math.round((currentStep / currentChapter.totalSteps) * 100);

  const handleOpenProgress = () => {
    setActiveTab('progress');
    openAdventureModal();
  };

  return (
    <aside className="w-56 shrink-0 flex flex-col gap-2 select-none font-game">
      {/* Chapter Progress Card (Clickable to open Adventure screen) */}
      <div
        onClick={handleOpenProgress}
        className="rounded-2xl border-2 border-[#e3353b] bg-gradient-to-b from-[#241723] to-[#14131d] p-3 shadow-lg cursor-pointer hover:border-rose-400 transition"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#3b2d3c] bg-[#1a1522] p-1">
            <img
              src={`/assets/badges/${currentChapter.badgeSprite}.png`}
              alt="Badge"
              className="pixel-art max-h-8 max-w-8 object-contain"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-game text-[#a69fad]">
              {currentChapter.region} · Chapter {currentChapter.chapterNumber}
            </div>
            <div className="truncate text-[17px] font-pixel text-white leading-tight">
              {currentChapter.name}
            </div>
          </div>
        </div>

        {/* Red Progress Bar */}
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#121018]">
          <div
            className="h-full rounded-full bg-[#e3353b] transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="mt-1 flex items-center justify-between text-[13px] font-game">
          <span className="text-[#c8ccd6]">
            Step {currentStep} / {currentChapter.totalSteps} · {pct} %
          </span>
          <span className="text-[#8e95ac]">{currentChapter.recommendedLevel}</span>
        </div>
      </div>

      {/* Navigation List with Authentic Game Icons & Jersey 15 Font */}
      <nav className="flex flex-col gap-1 text-[#c8ccd6]">
        {/* 1. Progress -> Opens Adventure Modal */}
        <button
          onClick={handleOpenProgress}
          className={`side-nav-btn ${activeTab === 'progress' ? 'active' : ''}`}
        >
          <div className="w-8 h-8 flex items-center justify-center shrink-0">
            <img
              src="/assets/sidebar/progress.png"
              alt="Progress"
              className="max-w-[28px] max-h-[28px] object-contain pixel-art"
            />
          </div>
          <span className="truncate">Progress</span>
        </button>

        {/* 2. Team/PC with floating EXP popup */}
        <div className="relative">
          {sidebarExpPopup && (
            <span className="sidebar-exp-pop absolute -top-3.5 right-3 text-emerald-400 font-pixel text-xs font-black drop-shadow pointer-events-none z-30">
              {sidebarExpPopup}
            </span>
          )}
          <button
            onClick={() => { setActiveTab('team'); onOpenCollection('team'); }}
            className={`side-nav-btn w-full ${activeTab === 'team' ? 'active' : ''}`}
          >
            <div className="w-8 h-8 flex items-center justify-center shrink-0">
              <img
                src="/assets/sidebar/team_pc.png"
                alt="Team/PC"
                className="max-w-[28px] max-h-[28px] object-contain pixel-art"
              />
            </div>
            <span className="truncate">Team/PC</span>
          </button>
        </div>

        {/* 3. Pokédex */}
        <button
          onClick={() => { setActiveTab('pokedex'); onOpenCollection('pokedex'); }}
          className={`side-nav-btn ${activeTab === 'pokedex' ? 'active' : ''}`}
        >
          <div className="w-8 h-8 flex items-center justify-center shrink-0">
            <img
              src="/assets/sidebar/pok_dex.png"
              alt="Pokédex"
              className="max-w-[28px] max-h-[28px] object-contain pixel-art"
            />
          </div>
          <span className="truncate">Pokédex</span>
        </button>

        {/* 4. Activities Accordion */}
        <div className="flex flex-col">
          <button
            onClick={() => setActivitiesOpen(!activitiesOpen)}
            className="side-nav-btn"
          >
            <div className="w-8 h-8 flex items-center justify-center shrink-0">
              <img
                src="/assets/sidebar/activities.png"
                alt="Activities"
                className="max-w-[28px] max-h-[28px] object-contain pixel-art"
              />
            </div>
            <span className="flex-1 text-left truncate">Activities</span>
            <span className="text-xs text-slate-400 transition-transform">
              {activitiesOpen ? '▾' : '▸'}
            </span>
          </button>

          {activitiesOpen && (
            <div className="flex flex-col gap-1 pl-4 pt-1">
              <button className="side-nav-sub-btn">
                <img
                  src="/assets/sidebar/day_care.png"
                  alt="Day Care"
                  className="w-5 h-5 object-contain pixel-art shrink-0"
                />
                <span className="truncate">Day Care</span>
              </button>

              <button className="side-nav-sub-btn">
                <img
                  src="/assets/sidebar/game_corner.png"
                  alt="Game Corner"
                  className="w-5 h-5 object-contain pixel-art shrink-0"
                />
                <span className="truncate">Game Corner</span>
              </button>

              <button className="side-nav-sub-btn">
                <img
                  src="/assets/sidebar/raids.png"
                  alt="Raids"
                  className="w-5 h-5 object-contain pixel-art shrink-0"
                />
                <span className="truncate">Raids</span>
              </button>

              <button disabled className="side-nav-sub-btn locked opacity-60 cursor-not-allowed">
                <img
                  src="/assets/sidebar/battle_tower.png"
                  alt="Battle Tower"
                  className="w-5 h-5 object-contain pixel-art shrink-0 grayscale"
                />
                <span className="flex-1 text-left truncate text-slate-400">Battle Tower</span>
                <img
                  src="/assets/sidebar/padlock_pixel.svg"
                  alt="Locked"
                  className="w-3.5 h-3.5 pixel-art"
                />
              </button>

              <button disabled className="side-nav-sub-btn locked opacity-60 cursor-not-allowed">
                <img
                  src="/assets/sidebar/underground.png"
                  alt="Underground"
                  className="w-5 h-5 object-contain pixel-art shrink-0 grayscale"
                />
                <span className="flex-1 text-left truncate text-slate-400">Underground</span>
                <img
                  src="/assets/sidebar/padlock_pixel.svg"
                  alt="Locked"
                  className="w-3.5 h-3.5 pixel-art"
                />
              </button>
            </div>
          )}
        </div>

        {/* 5. Social Accordion */}
        <div className="flex flex-col">
          <button
            onClick={() => setSocialOpen(!socialOpen)}
            className="side-nav-btn"
          >
            <div className="w-8 h-8 flex items-center justify-center shrink-0">
              <img
                src="/assets/sidebar/social.png"
                alt="Social"
                className="max-w-[28px] max-h-[28px] object-contain pixel-art"
              />
            </div>
            <span className="flex-1 text-left truncate">Social</span>
            <span className="text-xs text-slate-400">
              {socialOpen ? '▾' : '▸'}
            </span>
          </button>

          {socialOpen && (
            <div className="flex flex-col gap-1 pl-4 pt-1">
              <button className="side-nav-sub-btn">
                <img
                  src="/assets/sidebar/friends.png"
                  alt="Friends"
                  className="w-5 h-5 object-contain pixel-art shrink-0"
                />
                <span className="truncate">Friends</span>
              </button>

              <button className="side-nav-sub-btn">
                <img
                  src="/assets/sidebar/trades.svg"
                  alt="Trades"
                  className="w-5 h-5 object-contain pixel-art shrink-0"
                />
                <span className="truncate">Trades</span>
              </button>

              <button className="side-nav-sub-btn">
                <img
                  src="/assets/sidebar/black_market.svg"
                  alt="Black Market"
                  className="w-5 h-5 object-contain pixel-art shrink-0"
                />
                <span className="truncate">Black Market</span>
              </button>
            </div>
          )}
        </div>

        {/* 6. Shop */}
        <button
          onClick={() => setActiveTab('shop')}
          className={`side-nav-btn ${activeTab === 'shop' ? 'active' : ''}`}
        >
          <div className="w-8 h-8 flex items-center justify-center shrink-0">
            <img
              src="/assets/sidebar/shop.png"
              alt="Shop"
              className="max-w-[28px] max-h-[28px] object-contain pixel-art"
            />
          </div>
          <span className="truncate">Shop</span>
        </button>

        {/* 7. Achievements */}
        <button
          onClick={() => setActiveTab('achievements')}
          className={`side-nav-btn ${activeTab === 'achievements' ? 'active' : ''}`}
        >
          <div className="w-8 h-8 flex items-center justify-center shrink-0">
            <img
              src="/assets/sidebar/achievements.png"
              alt="Achievements"
              className="max-w-[28px] max-h-[28px] object-contain pixel-art"
            />
          </div>
          <span className="truncate">Achievements</span>
        </button>
      </nav>
    </aside>
  );
};
