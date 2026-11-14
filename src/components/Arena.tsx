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
import { BattleFX } from '../utils/battleFxEngine';
import { CaptureFX } from '../utils/captureFxEngine';
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

// Authentic Poke'Catch Pokemon Center Heal Stage with Canvas Pads
const PokemonCenterHealStage: React.FC<{
  chapterName: string;
  party: any[];
  healProgress: number;
  onSkip: () => void;
}> = ({ chapterName, party, healProgress, onSkip }) => {
  const padsCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const trayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = padsCanvasRef.current;
    const tray = trayRef.current;
    if (!canvas || !tray) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    const ce = 2; // pixel scale
    const pinkPal = ['#ffffff', '#ffe0e8', '#ffb3c7', '#ff8fb1', '#d85a80', '#8c2a48'];
    const darkBase = ['#2a2440', '#1a1628', '#0d0b16'];

    const putPixel = (x: number, y: number, color: string, alpha: number = 1) => {
      x = Math.round(x);
      y = Math.round(y);
      if (alpha < 1 && (alpha <= 0 || (((x + y) & 3) / 4 >= alpha * 1.2 && (x ^ y) % 2))) return;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    };

    const drawEllipse = (
      cx: number,
      cy: number,
      rx: number,
      ry: number,
      color: string,
      alpha: number = 1,
      innerCut: number = 0
    ) => {
      for (let dy = -Math.ceil(ry); dy <= ry; dy++) {
        for (let dx = -Math.ceil(rx); dx <= rx; dx++) {
          const dist = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);
          if (dist <= 1 && dist >= innerCut * innerCut) {
            putPixel(cx + dx, cy + dy, color, alpha);
          }
        }
      }
    };

    const render = (now: number) => {
      const machineEl = canvas.parentElement;
      if (!machineEl) return;
      const mRect = machineEl.getBoundingClientRect();
      const targetW = Math.ceil(mRect.width / ce);
      const targetH = Math.ceil(mRect.height / ce);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const isHealing = healProgress < 100;
      const j = 0.5 + 0.5 * Math.sin(now / (isHealing ? 100 : 300));
      const slots = tray.querySelectorAll('.hm-slot');

      slots.forEach((slot) => {
        const sRect = slot.getBoundingClientRect();
        const cx = Math.round((sRect.left + sRect.width / 2 - mRect.left) / ce);
        const cy = Math.round((sRect.bottom - sRect.height * 0.16 - mRect.top) / ce);
        const rx = Math.round((sRect.width * 0.42) / ce);
        const ry = Math.max(3, Math.round(rx * 0.32));

        // Ground shadow
        drawEllipse(cx, cy + ry + 4, rx * 0.8, ry * 0.6, '#000000', 0.45);
        // Dark bevels
        drawEllipse(cx, cy + 2, rx, ry, darkBase[2]);
        drawEllipse(cx, cy + 1, rx, ry, darkBase[1]);
        drawEllipse(cx, cy, rx, ry, isHealing ? pinkPal[4] : darkBase[0]);
        drawEllipse(cx, cy, rx, ry, isHealing ? pinkPal[2] : '#5d6788', 1, 0.82);

        if (isHealing) {
          drawEllipse(cx, cy, rx * (0.5 + 0.08 * j), ry * (0.5 + 0.08 * j), pinkPal[3], 0.9);
          drawEllipse(cx, cy, rx * 0.25, ry * 0.25, pinkPal[1], 0.8);
        }

        // Top rim highlight
        for (let dx = -rx * 0.55; dx <= rx * 0.55; dx++) {
          const topDy = -ry * Math.sqrt(Math.max(0, 1 - (dx / rx) ** 2));
          putPixel(cx + dx, cy + topDy, isHealing ? pinkPal[0] : '#c9d2e6');
        }
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [healProgress]);

  return (
    <div className="heal-fx select-none relative">
      <div className="hm-stage -translate-y-2">
        <div className="hm-title font-pixel text-lg sm:text-xl">
          {chapterName} Pokémon Center
        </div>

        <div className="hm-machine">
          <canvas ref={padsCanvasRef} className="hm-pads" />
          <div ref={trayRef} className="hm-tray">
            {party.map((mon, slotIdx) => (
              <div key={mon.uid || slotIdx} className="hm-slot on">
                <div
                  className="absolute -top-7 text-emerald-400 font-black text-sm drop-shadow-[0_0_8px_#34d399] animate-heal-cross select-none pointer-events-none"
                  style={{ animationDelay: `${(slotIdx % 3) * 350}ms` }}
                >
                  ✚
                </div>

                <img
                  src="/assets/items/poke-ball.png"
                  alt="Pokéball"
                  className={`w-9 h-9 sm:w-10 sm:h-10 object-contain pixel-art transition-all duration-300 ${
                    healProgress >= 90 ? 'brightness-125 scale-105' : 'brightness-100'
                  }`}
                  style={{
                    filter:
                      healProgress < 100
                        ? 'drop-shadow(0 0 6px #ff8fb1)'
                        : 'drop-shadow(0 0 10px rgba(52,211,153,0.8))',
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {healProgress >= 90 && (
          <div className="hm-msg animate-fade-in" style={{ visibility: 'visible' }}>
            Your team is in great shape!
          </div>
        )}
      </div>

      <button onClick={onSkip} className="fx-skip-btn">
        <span>SKIP</span>
        <span className="text-[11px] text-slate-300">▸▸</span>
      </button>
    </div>
  );
};

export const Arena: React.FC = () => {
  const [gameClock, setGameClock] = useState(() => new Date());
  const {
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
    selectedBall,
    pokedexCaught,
    resolveCombatImpact,
    finishCombatEffect,
    capturePresentation,
    finishCapturePresentation,
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

  // One animation engine owns movement and reports the actual contact frame.
  const lastCombatKey = useRef<number | null>(null);
  useEffect(() => {
    BattleFX.cancel();
    return () => BattleFX.cancel();
  }, [currentChapterId, currentStep]);
  useEffect(() => {
    if (!combatEffect || lastCombatKey.current === combatEffect.key) return;
    lastCombatKey.current = combatEffect.key;

    const moveKey = combatEffect.moveKey || combatEffect.moveName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const isTargetEnemy = combatEffect.target === 'enemy';
    const attEl = isTargetEnemy ? playerMonRef.current : enemyMonRef.current;
    const defEl = isTargetEnemy ? enemyMonRef.current : playerMonRef.current;

    const effectiveMove = BattleFX.has(moveKey) ? moveKey : (BattleFX.has('tackle') ? 'tackle' : 'pound');
    if (attEl && defEl && fxContainerRef.current) {
      BattleFX.play({
        move: effectiveMove,
        attEl,
        defEl,
        fxEl: fxContainerRef.current,
        shakeEl: arenaRef.current,
        mirror: !isTargetEnemy,
        speed: combatEffect.speed || gameSpeed,
        miss: combatEffect.miss,
        crit: combatEffect.crit,
        onImpact: () => resolveCombatImpact(combatEffect.key),
      }).then(() => finishCombatEffect(combatEffect.key))
        .catch(() => finishCombatEffect(combatEffect.key));
    } else {
      finishCombatEffect(combatEffect.key);
    }
  }, [combatEffect, resolveCombatImpact, finishCombatEffect]);

  // Keep the ball trajectory, absorption, bounce and shakes on one clock.
  useEffect(() => {
    if (!capturePresentation || !arenaRef.current || !fxContainerRef.current || !enemyMonRef.current) return;
    BattleFX.cancel();
    let cancelled = false;
    const arena = arenaRef.current;
    const target = enemyMonRef.current;
    const fx = fxContainerRef.current;
    const rect = arena.getBoundingClientRect();
    const hero = arena.querySelector('.capture-trainer')?.getBoundingClientRect();
    const present = capturePresentation.success && capturePresentation.duplicate ? CaptureFX.quick : CaptureFX.play;
    present(arena, fx, target, {
      ball: capturePresentation.ball,
      speed: gameSpeed,
      shakes: capturePresentation.shakes,
      success: capturePresentation.success,
      name: enemy ? getPokemonSpecies(enemy.speciesId).name : undefined,
      from: hero ? { x: hero.right - rect.left - hero.width * .2, y: hero.top - rect.top + hero.height * .3 } : undefined,
    }).then(() => { if (!cancelled) finishCapturePresentation(capturePresentation.key); })
      .catch((error) => {
        console.warn('Capture presentation failed:', error);
        if (!cancelled) finishCapturePresentation(capturePresentation.key);
      });
    return () => {
      cancelled = true;
      fx.querySelectorAll('.capture-sequence').forEach(el => el.remove());
      target.getAnimations().forEach(animation => animation.cancel());
      target.style.opacity = '';
    };
  }, [capturePresentation, finishCapturePresentation]);

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

  // Pokémon Center gradual heal progress
  const [healProgress, setHealProgress] = useState(0);

  useEffect(() => {
    if (nodeType === 'center') {
      setHealProgress(0);

      const startTime = performance.now();
      const duration = 2400 / gameSpeed;
      let animId: number;

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(100, Math.round((elapsed / duration) * 100));
        setHealProgress(progress);
        if (progress < 100) {
          animId = requestAnimationFrame(tick);
        }
      };

      animId = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(animId);
    } else {
      setHealProgress(0);
    }
  }, [nodeType, currentStep, gameSpeed]);

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
            const hpPct = Math.max(0, Math.min(100, (mon.currentHp / mon.maxHp) * 100));

            return (
              <button
                key={mon.uid}
                onClick={() => setActivePartyIndex(idx)}
                className={`battle-team-slot rounded-xl border-2 flex flex-col items-center justify-between relative ${
                  isCurrent
                    ? 'bg-[#22212d]/95 border-[#ffcb05] shadow-[0_0_10px_rgba(255,203,5,0.45)] scale-105 z-10'
                    : 'bg-[#151825]/90 border-[#252a3e] hover:border-slate-400'
                }`}
                title={`${sp?.name || 'Mon'} — Lv.${mon.level}`}
              >
                <img
                  src={getPokemonSpriteUrl(mon.speciesId, mon.isShiny)}
                  alt={sp?.name || 'Mon'}
                  className="w-8 h-8 object-contain pixel-art mt-0.5"
                />
                <span className="text-[9px] font-black text-white leading-none font-game">
                  Lv.{mon.level}
                </span>
                <div className="w-[88%] h-[3px] bg-slate-950 rounded-full overflow-hidden mb-0.5">
                  <div
                    className={`h-full transition-all duration-300 ${
                      hpPct > 50 ? 'bg-[#f0607a]' : hpPct > 20 ? 'bg-amber-400' : 'bg-red-600'
                    }`}
                    style={{ width: `${hpPct}%` }}
                  />
                </div>
              </button>
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

        {/* Duplicate EXP Flying Particles */}
        {duplicatePopup && (
          <>
            <div
              className="xp-pop dup"
              style={{ right: '28%', top: '55%' }}
            >
              <small className="dup-tag">DUPLICATE</small>
              {duplicatePopup.text}
            </div>
            <div
              className="xp-ball"
              style={{ right: '28%', top: '60%' }}
            />
          </>
        )}

        {/* Main Stage Arena Area */}
        {nodeType === 'center' ? (
          /* AUTHENTIC POKÉMON CENTER HEAL SCENE */
          <PokemonCenterHealStage
            chapterName={currentChapter.name}
            party={party}
            healProgress={healProgress}
            onSkip={skipHeal}
          />
        ) : (
          <div className="relative z-10 w-full h-full pointer-events-none">
            {/* Red Trainer (Slides in to left of hero during wild battles and catch sequence) */}
            {trainerOnField && (
              <div className="capture-trainer hero absolute left-[19%] bottom-[22%] -translate-x-1/2 flex flex-col items-center z-20 pointer-events-auto">
                <img
                  src="/assets/trainers/red.png"
                  alt="Red"
                  className="h-32 sm:h-36 w-auto object-contain pixel-art -scale-x-100"
                />

              </div>
            )}

            {/* PLAYER SIDE: Active Pokémon (left: 38%, bottom: 22%) */}
            {activeMon && activeSpecies && (
              <div
                ref={playerMonRef}
                className={`battle-mon ally absolute pointer-events-auto z-10 ${isCatchSequenceActive ? 'invisible' : ''}`}
                style={{ '--sprite-top': `${spriteTop(activeMon.speciesId)}px` } as React.CSSProperties}
              >
                <div
                  className="relative"
                >
                  {/* Authentic mini-hp pill bar above head */}
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

                  {/* Clean sprite with no outer shadow */}
                  <img
                    src={getPokemonSpriteUrl(activeMon.speciesId, activeMon.isShiny)}
                    alt={activeSpecies.name}
                    className={`battle-sprite pixel-art select-none -scale-x-100 ${activeMon.currentHp <= 0 ? 'animate-faint' : ''}`}
                  />

                  {/* Authentic pixel ground shadow */}
                  <div className="cb-shadow-pixel" />

                  {/* Authentic mini-lv text below feet */}
                  <div className="mini-lv">
                    <span className="lvn">Lv.{activeMon.level}</span>
                  </div>
                </div>
              </div>
            )}

            {/* OPPONENT TRAINER (During Trainer Battles: right 4%, bottom 24%) */}
            {activeTrainer && currentChapterId !== 'special-mewtwo' && !bossIntroActive && (
              <div className="trainer-slot absolute inset-0 pointer-events-none">
                <div className="battle-opponent-trainer trainer absolute flex flex-col items-center">
                  <img
                    src={`/assets/trainers/${activeTrainer.sprite}.png`}
                    alt={activeTrainer.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 object-contain pixel-art"
                  />
                  <div className="cb-shadow-pixel" />
                </div>
              </div>
            )}

            {/* ENEMY SIDE: Wild Pokémon, Trainer Mon, or Caught Pokéball (left: 78%, bottom: 25%) */}
            <div
              ref={enemyMonRef}
              className="battle-mon enemy absolute pointer-events-auto z-10"
              style={{ '--sprite-top': `${spriteTop(enemy?.speciesId || 16)}px` } as React.CSSProperties}
            >
              {enemy && enemySpecies ? (
                <div
                  className="relative"
                >
                  {/* Sleeping 'Z' */}
                  {enemyStatus === 'SLP' && (
                    <span className="absolute -top-7 right-4 text-white font-pixel text-sm animate-sleep-z pointer-events-none">
                      Z
                    </span>
                  )}

                  {/* Authentic mini-hp pill bar above head */}
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

                  {/* Clean sprite with no outer shadow */}
                  <img
                    src={getPokemonSpriteUrl(enemy.speciesId, enemy.isShiny)}
                    alt={enemySpecies.name}
                    className={`battle-sprite pixel-art select-none ${enemy.currentHp <= 0 && !isCatchSequenceActive ? 'animate-faint' : ''}`}
                  />

                  {/* Authentic pixel ground shadow */}
                  <div className="cb-shadow-pixel" />

                  {/* Authentic mini-lv text below feet with owned icon if in dex */}
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
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Floating Item Drop */}
        {activeDrop && (
          <div
            key={activeDrop.id}
            className="absolute bottom-20 z-30 flex flex-col items-center pointer-events-none transition-all duration-300"
            style={{ left: `${activeDrop.xPercent ?? 65}%` }}
          >
            <div className="text-sm font-black text-[#ffcb05] drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] animate-drop-text font-game whitespace-nowrap mb-1">
              +{activeDrop.title}
            </div>

            {activeDrop.type !== 'money-text' && (
              <div className="relative flex flex-col items-center animate-item-drop">
                {activeDrop.type === 'money' ? (
                  <div className="coin-spin-sprite scale-125 drop-shadow-[0_4px_6px_rgba(0,0,0,0.85)] my-2" />
                ) : (
                  <img
                    src={activeDrop.iconUrl}
                    alt={activeDrop.title}
                    className="w-12 h-12 object-contain pixel-art drop-shadow-[0_6px_8px_rgba(0,0,0,0.85)]"
                  />
                )}
                <div className="w-10 h-2 bg-black/60 rounded-full blur-[1px] animate-drop-shadow -mt-1" />
              </div>
            )}
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
