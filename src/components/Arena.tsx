import { useArenaEffects } from '../game/presentation/useArenaEffects';
import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import {
  POKEMON_SPECIES_MAP,
  getItemSpriteUrl,
  getPokemonSpriteUrl,
  getPokemonSpecies,
} from '../data/pokemonData';
import { ALL_CHAPTERS, DEFAULT_CHAPTER } from '../data/chaptersData';
import { runDitherTransition } from '../utils/ditherTransition';
import SPRITE_BOUNDS from '../data/spriteBounds.json';

// Animated pixel rain canvas matching Poke'Catch
const RainEffect: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const width = (canvas.width = canvas.parentElement?.clientWidth || 710);
    const height = (canvas.height = canvas.parentElement?.clientHeight || 460);

    const drops = Array.from({ length: 90 }, () => ({
      x: Math.random() * (width + 60),
      y: Math.random() * height,
      len: 12 + Math.random() * 16,
      speed: 11 + Math.random() * 8,
      slant: -2.8,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(215, 235, 255, 0.42)';
      ctx.lineWidth = 1.6;

      ctx.beginPath();
      for (const d of drops) {
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + d.slant, d.y + d.len);
        d.y += d.speed;
        d.x += d.slant;
        if (d.y > height) {
          d.y = -d.len;
          d.x = Math.random() * (width + 60);
        }
      }
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="weather-fx absolute inset-0 w-full h-full pointer-events-none z-15"
    />
  );
};

export const Arena: React.FC = () => {
  const [gameClock, setGameClock] = useState(() => new Date());
  const {
    encounter,
    party,
    activePartyIndex,
    setActivePartyIndex,
    enemy,
    currentChapterId,
    currentStep,
    battleLog,
    gameSpeed,
    setGameSpeed,
    playerAttacking,
    enemyAttacking,
    combatEffect,
    arenaShaking,
    nodeType,
    isCatchable,
    activeTrainer,
    bossIntroActive,
    allyRecalling,
    allySendingOut,
    enemyRecalling,
    newCatchCard,
    dismissNewCatchCard,
    chapterCompleteBanner,
    activeDrop,
    berryBuffs,
    skipHeal,
    enemyStatus,
    damagePopups,
    isCatchSequenceActive,
    catchPhase,
    trainerOnField,
    transitionTick,
    duplicatePopup,
    sidebarExpPopups,
    selectedBall,
    pokedexCaught,
    resolveCombatImpact,
    finishCombatEffect,
    capturePresentation,
    finishCapturePresentation,
    healPresentation,
    finishHealPresentation,
    finishItemDrop,
    autoCatch,
  } = useGameStore();

  const activeCatchBall = React.useMemo(() => {
    if (berryBuffs.ultraBall > 0) return '/assets/items/ultra-ball.png';
    if (berryBuffs.greatBall > 0) return '/assets/items/great-ball.png';
    if (selectedBall === 'ultraball') return '/assets/items/ultra-ball.png';
    if (selectedBall === 'greatball') return '/assets/items/great-ball.png';
    if (selectedBall === 'masterball') return '/assets/items/master-ball.png';
    return '/assets/items/poke-ball.png';
  }, [berryBuffs.ultraBall, berryBuffs.greatBall, selectedBall]);

  const arenaRef = useRef<HTMLDivElement | null>(null);
  const [stageWidth, setStageWidth] = useState(710);
  useEffect(() => {
    if (!arenaRef.current) return;
    const observer = new ResizeObserver(([entry]) => setStageWidth(entry.contentRect.width));
    observer.observe(arenaRef.current);
    return () => observer.disconnect();
  }, []);
  const spriteScale = Math.max(2, Math.round(stageWidth * .24 / 68));
  const partyTile = Math.max(38, Math.min(60, Math.floor((stageWidth * 9 / 16 - 85) / party.length) - 5));
  const spriteTop = (speciesId: number) => (SPRITE_BOUNDS[`assets/pokemon/${speciesId}.png`]?.[1] || 0) * spriteScale;
  const railContainerRef = useRef<HTMLDivElement | null>(null);
  const activeNodeRef = useRef<HTMLDivElement | null>(null);
  const fxContainerRef = useRef<HTMLDivElement | null>(null);
  const playerMonRef = useRef<HTMLDivElement | null>(null);
  const enemyMonRef = useRef<HTMLDivElement | null>(null);
  const enemySpriteRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const clockTimer = window.setInterval(() => setGameClock(new Date()), 30_000);
    return () => window.clearInterval(clockTimer);
  }, []);

  // Auto-scroll timeline to keep active step smoothly centered without any scrollbar
  useEffect(() => {
    if (activeNodeRef.current && railContainerRef.current) {
      activeNodeRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [currentStep]);

  const currentChapter =
    ALL_CHAPTERS.find((c) => c.id === currentChapterId) || DEFAULT_CHAPTER;
  const steps = currentChapter.steps;
  const activeMon = party[activePartyIndex];
  const activeSpecies = activeMon ? getPokemonSpecies(activeMon.speciesId) : null;
  const enemySpecies = enemy ? getPokemonSpecies(enemy.speciesId) : null;

  // Format buff duration
  const formatSecs = (sec: number) => {
    if (sec <= 0) return '';
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Dynamic zone title
  const currentZoneTitle = React.useMemo(() => {
    if (currentChapterId === 'special-mewtwo') {
      return currentStep === 10 ? 'Cerulean Cave · Mewtwo' : `Cerulean Cave · Floor ${currentStep}`;
    }
    if (currentChapterId === 'kanto-7') {
      if (currentStep <= 5) return 'Routes 19-20';
      if (currentStep <= 9) return 'Power Plant';
      if (currentStep <= 16) return 'Seafoam Islands';
      if (currentStep === 17 || currentStep === 25) return 'Cinnabar Island';
      if (currentStep <= 24) return 'Pokémon Mansion';
      return 'Cinnabar Gym';
    }
    if (currentStep <= 4) return 'Route 1';
    if (currentStep <= 8) return 'Route 2';
    if (currentStep <= 15) return 'Viridian Forest';
    if (currentStep <= 18) return 'Pewter City';
    return 'Pewter Gym';
  }, [currentChapterId, currentStep]);

  // Stage background
  const stageBackground = React.useMemo(() => {
    if (currentChapterId === 'special-mewtwo') {
      return '/assets/bg/scenes/25-caverne-azuree-710x400.webp';
    }
    if (nodeType === 'center') {
      return '/assets/bg/scenes/50-centre-pokemon-v2-710x400.webp';
    }
    if (currentChapterId === 'kanto-7') {
      if (currentStep <= 5) return '/assets/bg/scenes/sea-travel.webp';
      if (currentStep <= 9) return '/assets/bg/scenes/19-centrale-abandonnee-710x400.webp';
      if (currentStep <= 16) return '/assets/bg/scenes/20-iles-ecume-v2-710x400.webp';
      if (currentStep <= 25) return '/assets/bg/scenes/21-manoir-pokemon-710x400.webp';
      return '/assets/bg/scenes/32-arene-auguste-710x400.webp';
    }
    if (currentStep >= 19) return '/assets/bg/scenes/26-arene-pierre-710x400.webp';
    if (currentStep >= 9 && currentStep <= 15) return '/assets/bg/scenes/12-foret-jade-v2-710x400.webp';
    return currentChapter.bgScene;
  }, [nodeType, currentChapterId, currentStep, currentChapter.bgScene]);

  // Use a single transition when the chapter or actual scene changes
  const previousSceneKey = useRef(`${currentChapterId}:${stageBackground}`);
  useEffect(() => {
    const sceneKey = `${currentChapterId}:${stageBackground}`;
    if (previousSceneKey.current === sceneKey) return;
    const [previousChapterId] = previousSceneKey.current.split(':', 1);
    const chapterChanged = previousChapterId !== currentChapterId;
    previousSceneKey.current = sceneKey;

    if (!arenaRef.current) return;
    runDitherTransition(arenaRef.current, {
      color: '#0b0d14',
      sweep: 'diag',
      durationMs: (chapterChanged ? 460 : 380) / gameSpeed,
    });
  }, [currentChapterId, stageBackground, gameSpeed]);

  // Run dither transition when step advances
  const prevTransitionTick = useRef(transitionTick);
  useEffect(() => {
    if (prevTransitionTick.current === transitionTick || transitionTick === 0) {
      prevTransitionTick.current = transitionTick;
      return;
    }
    prevTransitionTick.current = transitionTick;
    if (!arenaRef.current) return;
    runDitherTransition(arenaRef.current, {
      color: '#0b0d14',
      sweep: 'diag',
      durationMs: 380 / gameSpeed,
    });
  }, [transitionTick, gameSpeed]);

  useArenaEffects({ arenaRef, fxContainerRef, playerMonRef, enemyMonRef, enemySpriteRef, currentChapter });

  const isRaining = currentChapterId === 'kanto-7' ? currentStep <= 5 : currentChapter.weather === 'rain';
  const clockLabel = gameClock.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const rainEndLabel = `${String((gameClock.getHours() + 1) % 24).padStart(2, '0')}:00`;

  return (
    <div className="battle-column flex-1 flex flex-col gap-2.5 min-w-0 font-game">
      {/* 1. Authentic Top Step Timeline Rail matching Poke'Catch Gameplay Video */}
      <div className="battle-timeline bg-[#141624] border border-[#212536] rounded-2xl px-4 py-2 flex items-center justify-between text-xs select-none shadow-md">
        <span className="font-extrabold text-white text-sm shrink-0 mr-3">
          {currentZoneTitle}
        </span>

        {/* Timeline Rail Container with scrollbars strictly disabled */}
        <div
          ref={railContainerRef}
          className="flex-1 flex items-center justify-center overflow-x-hidden py-1 select-none scrollbar-none no-scrollbar"
          onWheel={(e) => {
            if (railContainerRef.current) {
              railContainerRef.current.scrollLeft += e.deltaY || e.deltaX;
            }
          }}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex items-center">
            {steps.map((node, idx) => {
              const isDone = node.step < currentStep;
              const isCur = node.step === currentStep;
              const showLink = idx < steps.length - 1;

              return (
                <React.Fragment key={node.step}>
                  {/* Step Node with Authentic Retro Brackets '[' ']' when active */}
                  <div
                    ref={isCur ? activeNodeRef : null}
                    className="relative flex items-center justify-center transition-all px-0.5"
                    title={`Step ${node.step}: ${node.name}`}
                  >
                    {isCur && (
                      <span className="font-pixel text-white text-[15px] -mr-0.5 select-none font-bold">
                        [
                      </span>
                    )}

                    <div
                      className={`flex items-center justify-center p-0.5 ${
                        isCur
                          ? 'rounded-md bg-[#222a44]/80 shadow-[0_0_10px_rgba(255,255,255,0.6)]'
                          : ''
                      }`}
                    >
                      {node.type === 'grass' && (
                        <img
                          src="/assets/ui/tallgrass-icon.png"
                          alt="Tall Grass"
                          className={`pixel-art w-[18px] h-[16px] object-contain ${
                            isDone ? 'opacity-40 grayscale' : 'opacity-100'
                          }`}
                        />
                      )}

                      {node.type === 'center' && (
                        <img
                          src="/assets/ui/pokecenter.png"
                          alt="Pokémon Center"
                          className={`pixel-art w-[20px] h-[20px] object-contain ${
                            isDone ? 'opacity-50' : 'opacity-100'
                          }`}
                        />
                      )}

                      {node.type === 'question' && (
                        <span
                          className={`font-black text-xs px-0.5 leading-none ${
                            isDone ? 'text-slate-500' : 'text-white'
                          }`}
                        >
                          ?
                        </span>
                      )}

                      {node.type === 'red' && (
                        <span
                          className={`w-2.5 h-2.5 rounded-[3px] border border-[#1b1b22] block shadow-sm ${
                            isDone ? 'bg-[#7f1d1d] opacity-50' : 'bg-[#e3353b]'
                          }`}
                        />
                      )}

                      {node.type === 'badge' && (
                        <div className="w-[20px] h-[20px] rounded-md border border-[#ffcb05] bg-[#1a1a24] flex items-center justify-center p-0.5">
                          <img
                            src={`/assets/badges/${currentChapter.badgeSprite}.png`}
                            alt="Badge"
                            className="w-3.5 h-3.5 pixel-art object-contain"
                          />
                        </div>
                      )}
                    </div>

                    {isCur && (
                      <span className="font-pixel text-white text-[15px] -ml-0.5 select-none font-bold">
                        ]
                      </span>
                    )}
                  </div>

                  {/* Connecting Link between nodes */}
                  {showLink && (
                    <i
                      className={`h-0.5 sm:h-1 w-1.5 sm:w-2 transition-all duration-300 rounded-full mx-0.5 ${
                        node.step < currentStep ? 'bg-[#22c55e]' : 'bg-[#28324a]'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <span className="font-black text-[#ffcb05] text-sm tabular-nums shrink-0 ml-3">
          {currentStep}/{currentChapter.totalSteps}
        </span>
      </div>

      {/* 2. Main Pixel Arena Stage */}
      <div
        ref={arenaRef}
        className="battle-stage relative w-full overflow-hidden bg-cover bg-center select-none"
        style={{ backgroundImage: `url("${stageBackground}")`, '--k': spriteScale, '--tile': `${partyTile}px` } as React.CSSProperties}
      >
        {/* Animated Pixel Rain Layer */}
        {isRaining && nodeType !== 'center' && <RainEffect />}

        {/* Official Canvas FX Container for 503 Moves and Pixel Particle Dissolve */}
        <div
          ref={fxContainerRef}
          id="arena-fx"
          className="absolute inset-0 pointer-events-none z-30 overflow-hidden"
        />

        {/* Daytime / Nighttime & Weather Pills (Top Left) */}
        <div className="battle-weather absolute z-20 flex items-center text-white">
          <span aria-hidden="true">{gameClock.getHours() >= 6 && gameClock.getHours() < 18 ? '☀️' : '🌙'}</span>
          <span className="tabular-nums">{clockLabel}</span>
          <span className="mx-0.5 h-6 w-px bg-white/30" />
          <span aria-hidden="true">{isRaining ? '🌧️' : '⛅'}</span>
          <span className={isRaining ? 'text-sky-100' : 'text-slate-200'}>
            {isRaining ? `Rain until ${rainEndLabel}` : 'Clear skies'}
          </span>
        </div>

        {/* Trainer Card on Top Right (During Trainer Battles) */}
        {activeTrainer && (
          <div className="battle-trainer-card absolute top-3 right-3 z-20 flex flex-col items-end gap-1 pointer-events-none">
            <div className="bg-[#181d2e]/95 border border-slate-600/90 rounded-2xl px-3.5 py-1.5 shadow-xl flex flex-col items-center">
              <span className="font-bold text-white text-xs tracking-tight">
                {activeTrainer.name}
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                {activeTrainer.team.map((m, i) => (
                  <img
                    key={i}
                    src="/assets/ui/poke-ball.png"
                    alt="Ball"
                    className={`w-3.5 h-3.5 pixel-art ${
                      m.fainted ? 'grayscale opacity-40 brightness-75' : 'brightness-110 drop-shadow'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Trainer VS Intro before trainer battles */}
        {bossIntroActive && nodeType === 'red' && activeTrainer && (
          <div className="vs-intro" aria-live="polite">
            <div className="vs-card left">
              <img src="/assets/trainers/red.png" alt="Red" />
              <span className="vs-name">Red</span>
            </div>
            <div className="vs-card right">
              <img src={`/assets/trainers/${activeTrainer.sprite}.png`} alt={activeTrainer.name} />
              <span className="vs-name">
                {activeTrainer.name}
                {activeTrainer.title && <small>{activeTrainer.title}</small>}
              </span>
            </div>
            <div className="vs-text">VS</div>
          </div>
        )}

        {/* Gym leader reveal before combat */}
        {bossIntroActive && nodeType === 'badge' && activeTrainer && (
          <div className="gym-boss-intro" aria-live="polite" style={{ '--boss-color': '#ffcb05' } as React.CSSProperties}>
            <i className="gym-boss-band gym-boss-band-top" />
            <i className="gym-boss-band gym-boss-band-bottom" />
            <div className="gym-boss-who">
              <img
                src={`/assets/trainers/${currentChapter.leaderSprite}.png`}
                alt={currentChapter.leaderName}
                className="gym-boss-portrait pixel-art"
              />
            </div>
            <div className="gym-boss-info">
              <small>GYM LEADER</small>
              <strong>{currentChapter.leaderName}</strong>
              <span className="gym-boss-tags">
                <img src={`/assets/badges/${currentChapter.badgeSprite}.png`} alt="" />
                <em>{currentChapter.leaderType}</em>
                <em>{currentChapter.badgeName}</em>
              </span>
            </div>
            <div className="gym-boss-flash" />
          </div>
        )}

        {nodeType === 'badge' && activeTrainer && battleLog.startsWith('Defeated ') && (
          <div className="gym-victory-banner" aria-live="polite">
            <strong>You defeated {currentChapter.leaderName}!</strong>
            <span>+₽{activeTrainer.rewardMoney.toLocaleString()}</span>
          </div>
        )}

        {chapterCompleteBanner && (
          <div className="gym-chapter-banner" aria-live="polite">
            <strong>Chapter complete!</strong>
            <span>{chapterCompleteBanner}</span>
          </div>
        )}

        {/* Floating Berry Buff Badges on Right Edge inside Arena */}
        <div className="buff-stack absolute z-20 flex flex-col items-end pointer-events-none">
          {berryBuffs.greatBall > 0 && (
            <div className="flex flex-col items-center">
              <img
                src="/assets/ui/razz-berry.png"
                alt="Razz Berry"
                className="w-7 h-7 object-contain pixel-art drop-shadow"
              />
              <span className="text-[10px] font-black text-amber-300 drop-shadow-[0_1px_2px_#000] -mt-0.5">
                {formatSecs(berryBuffs.greatBall)}
              </span>
            </div>
          )}
          {berryBuffs.nanab > 0 && (
            <div className="flex flex-col items-center">
              <img
                src="/assets/ui/nanab-berry.png"
                alt="Nanab Berry"
                className="w-7 h-7 object-contain pixel-art drop-shadow"
              />
              <span className="text-[10px] font-black text-amber-300 drop-shadow-[0_1px_2px_#000] -mt-0.5">
                {formatSecs(berryBuffs.nanab)}
              </span>
            </div>
          )}
        </div>

        {/* 6 Left Party Slots Column (Compact 52x52px cards matching .team-rail) */}
        <div className="battle-team-rail absolute z-20 flex flex-col pointer-events-auto">
          {party.map((mon, idx) => {
            const sp = POKEMON_SPECIES_MAP[mon.speciesId];
            const isCurrent = idx === activePartyIndex;
            const isKo = mon.currentHp <= 0;
            const hpPct = Math.max(0, Math.min(100, (mon.currentHp / mon.maxHp) * 100));

            const expPop = sidebarExpPopups?.[mon.uid];

            return (
              <div
                key={mon.uid}
                className="relative flex-none"
                style={{ width: 'var(--tile)', height: 'var(--tile)' }}
              >
                <button
                  onClick={() => setActivePartyIndex(idx)}
                  className={`battle-team-slot rounded-xl border-2 flex flex-col items-center justify-between relative ${
                    isKo
                      ? 'slot-ko bg-[#141722]/90 border-[#222638] opacity-85'
                      : isCurrent
                        ? 'bg-[#2b2824]/95 border-[#ffcb05] shadow-[0_2px_0_rgba(0,0,0,0.45),0_0_10px_rgba(255,203,5,0.45)] scale-105 z-10'
                        : 'bg-[#151825]/90 border-[#252a3e] hover:border-slate-400'
                  }`}
                  title={`${sp?.name || 'Mon'} — Lv.${mon.level}`}
                >
                  <img
                    src={getPokemonSpriteUrl(mon.speciesId, mon.isShiny)}
                    alt={sp?.name || 'Mon'}
                    className={`object-contain pixel-art ${isKo ? 'grayscale brightness-75 opacity-75' : ''}`}
                  />
                  <span className={`font-black leading-none font-game ${isKo ? 'text-[#a0a4ae]' : 'text-white'}`}>
                    Lv.{mon.level}
                  </span>
                  <div className="w-[88%] h-[5px] bg-black/35 rounded-full overflow-hidden mb-0.5">
                    {!isKo && (
                      <div
                        className={`h-full transition-all duration-300 shadow-[inset_0_1px_rgba(255,255,255,0.3)] ${
                          hpPct > 20 ? 'bg-[#f0607a]' : 'bg-[#d6334f]'
                        }`}
                        style={{ width: `${hpPct}%` }}
                      />
                    )}
                  </div>
                </button>
                {expPop && (
                  <div
                    key={`${mon.uid}-${expPop.amount}`}
                    className={`xp-pop rail-xp${expPop.active ? ' bonus' : ''}`}
                    style={{
                      left: 'calc(100% + 8px)',
                      top: '50%',
                    }}
                  >
                    +{expPop.amount.toLocaleString()} <small>XP{expPop.active ? ' ×1.1' : ''}</small>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Floating Damage Numbers */}
        {damagePopups.map((dmg) => (
          <div
            key={dmg.id}
            className={`retro-damage-number ${
              dmg.target === 'player' ? 'damage-target-player text-[#ff4d4d]' : 'damage-target-enemy text-white'
            } ${dmg.isCrit ? 'damage-critical text-amber-300' : ''}`}
          >
            {dmg.text}
          </div>
        ))}

        {/* Duplicate EXP Flying Particles (positioned directly over caught enemy at left: 78%) */}
        {duplicatePopup && (
          <>
            <div
              className="xp-pop dup"
              style={{ left: '78%', top: '58%' }}
            >
              <small className="dup-tag">DUPLICATE</small>
              {duplicatePopup.text}
            </div>
            <div
              className="xp-ball"
              style={{ left: '78%', top: '63%' }}
            />
          </>
        )}

        {/* Main Stage Arena Area */}
        {nodeType === 'center' || nodeType === 'question' ? null : (
          <div className="relative z-10 w-full h-full pointer-events-none">
            {/* Red Trainer (Slides in to left of hero during catch sequence only) */}
            {trainerOnField && !bossIntroActive && (
              <div className="capture-trainer hero absolute left-[19%] bottom-[22%] -translate-x-1/2 flex flex-col items-center z-20 pointer-events-auto">
                <img
                  src="/assets/trainers/red.png"
                  alt="Red"
                  className="h-32 sm:h-36 w-auto object-contain pixel-art -scale-x-100"
                />

              </div>
            )}

            {/* PLAYER SIDE: Active Pokémon (left: 30%, bottom: 22%) */}
            {activeMon && activeSpecies && !bossIntroActive && (
              <div
                key={`ally-${encounter.encounterId}-${party[activePartyIndex]?.uid}`}
                ref={playerMonRef}
                className="battle-mon ally absolute pointer-events-auto z-10"
                style={{ '--sprite-top': `${spriteTop(activeMon.speciesId)}px` } as React.CSSProperties}
              >
                <div
                  className="relative"
                >
                  {/* Authentic mini-hp pill bar above head (hidden when HP <= 0 or recalling) */}
                  {activeMon.currentHp > 0 && !allyRecalling && (
                    <div className="mini-hp">
                      <div className="hp">
                        <div
                          style={{
                            width: `${(activeMon.currentHp / activeMon.maxHp) * 100}%`,
                            background: (activeMon.currentHp / activeMon.maxHp) > 0.2 ? '#f0607a' : '#d6334f',
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Authentic pixel ground shadow (behind sprite) */}
                  {activeMon.currentHp > 0 && !allyRecalling && (
                    <div className="cb-shadow-pixel" />
                  )}

                  {/* Clean sprite with KO red-glow silhouette (stays visible until recalled into Pokéball) */}
                  <img
                    src={getPokemonSpriteUrl(activeMon.speciesId, activeMon.isShiny)}
                    alt={activeSpecies.name}
                    className={`battle-sprite pixel-art select-none -scale-x-100 ${
                      activeMon.currentHp <= 0
                        ? !allyRecalling
                          ? 'mon-ko [filter:brightness(0)_invert(1)_drop-shadow(0_0_2px_#ff3b3b)_drop-shadow(0_0_5px_#ff3b3b)]'
                          : 'mon-ko'
                        : ''
                    }`}
                  />

                  {/* Authentic mini-lv text below feet (hidden when HP <= 0 or recalling) */}
                  {activeMon.currentHp > 0 && !allyRecalling && (
                    <div className="mini-lv">
                      <span className="lvn">Lv.{activeMon.level}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* OPPONENT TRAINER (During Trainer Battles: right 4%, bottom 24%) */}
            {activeTrainer && currentChapterId !== 'special-mewtwo' && !bossIntroActive && (
              <div className="trainer-slot absolute inset-0 pointer-events-none">
                <div className="battle-opponent-trainer trainer absolute flex flex-col items-center">
                  <div className="cb-shadow-pixel z-0" />
                  <img
                    src={`/assets/trainers/${activeTrainer.sprite}.png`}
                    alt={activeTrainer.name}
                    className="relative z-[1] w-24 h-24 sm:w-28 sm:h-28 object-contain pixel-art"
                  />
                </div>
              </div>
            )}

            {/* ENEMY SIDE: Wild Pokémon, Trainer Mon, or Caught Pokéball (left: 78%, bottom: 25%) */}
            <div
              key={`enemy-${encounter.encounterId}-${enemy?.uid}`}
              ref={enemyMonRef}
              className="battle-mon enemy absolute pointer-events-auto z-10"
              style={{ '--sprite-top': `${spriteTop(enemy?.speciesId || 16)}px` } as React.CSSProperties}
            >
              {enemy && enemySpecies && !bossIntroActive ? (
                <div
                  key={enemy.uid}
                  className="relative"
                >
                  {/* Sleeping 'Z' */}
                  {enemyStatus === 'SLP' && (
                    <span className="absolute -top-7 right-4 text-white font-pixel text-sm animate-sleep-z pointer-events-none">
                      Z
                    </span>
                  )}

                  {/* Authentic mini-hp pill bar above head (hidden during faint/capture/recall) */}
                  {enemy.currentHp > 0 && !isCatchSequenceActive && !capturePresentation && !enemyRecalling && (
                    <div className="mini-hp">
                      <div className="hp">
                        <div
                          style={{
                            width: `${(enemy.currentHp / enemy.maxHp) * 100}%`,
                            background: (enemy.currentHp / enemy.maxHp) > 0.2 ? '#f0607a' : '#d6334f',
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Authentic pixel ground shadow (behind sprite, hidden when in-ball/fainted/recalling) */}
                  {enemy.currentHp > 0 && !isCatchSequenceActive && !capturePresentation && !enemyRecalling && (
                    <div className="cb-shadow-pixel" />
                  )}

                  {/* Clean sprite with KO fade-out (wild) or KO red glow (trainer) */}
                  <img
                    ref={enemySpriteRef}
                    src={getPokemonSpriteUrl(enemy.speciesId, enemy.isShiny)}
                    alt={enemySpecies.name}
                    className={`battle-sprite pixel-art select-none ${
                      enemy.currentHp <= 0
                        ? isCatchSequenceActive
                          ? 'mon-ko'
                          : activeTrainer
                            ? !enemyRecalling
                              ? 'mon-ko [filter:brightness(0)_invert(1)_drop-shadow(0_0_2px_#ff3b3b)_drop-shadow(0_0_5px_#ff3b3b)]'
                              : 'mon-ko'
                            : !(autoCatch && isCatchable)
                              ? 'mon-ko animate-faint'
                              : 'mon-ko'
                        : ''
                    }`}
                  />

                  {/* Authentic mini-lv text below feet (hidden when HP <= 0 or in-ball/recalling) */}
                  {enemy.currentHp > 0 && !isCatchSequenceActive && !capturePresentation && !enemyRecalling && (
                    <div className="mini-lv">
                      {enemyStatus === 'SLP' && (
                        <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-700 text-white uppercase mr-1">
                          SLP
                        </span>
                      )}
                      <span className="lvn">Lv.{enemy.level}</span>
                      {pokedexCaught.includes(enemy.speciesId) && (
                        <img
                          src="/assets/items/poke-ball.png"
                          alt="Caught"
                          className="owned ml-1"
                          title="Already caught"
                        />
                      )}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Lightweight Wild KO Money Text (Item/Money Drops at '?' nodes use authentic ItemFX engine) */}
        {activeDrop && activeDrop.type === 'money-text' && (
          <div
            key={activeDrop.id}
            className="absolute bottom-20 z-30 flex flex-col items-center pointer-events-none transition-all duration-300"
            style={{ left: `${activeDrop.xPercent ?? 65}%` }}
          >
            <div className="text-sm font-black text-[#ffcb05] drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] animate-drop-text font-game whitespace-nowrap mb-1">
              +{activeDrop.title}
            </div>
          </div>
        )}

        {/* Bottom Bar: White RPG Dialog during Combat, or Speed Multipliers on the right */}
        <div className="battle-bottom absolute z-30 flex pointer-events-auto">
          {nodeType !== 'center' ? (
            <div className="battle-log flex min-w-0 flex-1 items-center bg-white text-slate-900 border-[4px] border-[#3a4a6b] rounded-[10px] px-4 py-2 shadow-[inset_0_0_0_3px_#a9c1e8] text-[16px] font-bold truncate tracking-tight font-pixel">
              {battleLog}
            </div>
          ) : (
            <div className="flex-1" />
          )}

          <div className="battle-speed flex items-center shrink-0">
            {([1, 2, 3] as const).map((spd) => (
              <button
                key={spd}
                onClick={() => setGameSpeed(spd)}
                className={`flex-1 py-1 rounded-lg text-xs font-black transition ${
                  gameSpeed === spd
                    ? 'bg-[#e3353b] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                x{spd}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Community Feats Card matching original screenshot dab26b22 */}
      <div className="battle-news flex flex-col items-center justify-center text-center bg-[#10131f]">
        <p className="text-xs font-bold text-[#8e95ac]">
          Other trainers' feats show up here.
        </p>
      </div>


    </div>
  );
};
