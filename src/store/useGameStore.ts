import { create } from 'zustand';
import {
  ActiveDrop,
  BallType,
  CombatEffect,
  CombatLog,
  MysteryReward,
  PokemonInstance,
  StepNodeType,
} from '../types/game';
import {
  calculateStats,
  getItemSpriteUrl,
  getPokemonMove,
  getPokemonSpecies,
} from '../data/pokemonData';
import { ALL_CHAPTERS, DEFAULT_CHAPTER, CHAPTER_1_STEPS, CHAPTER_7_STEPS, ChapterInfo } from '../data/chaptersData';
import { getTypeMultiplier } from '../data/typeChart';
import MOVES from '../data/moves.json';

export interface ActiveTrainerState {
  name: string;
  title: string;
  sprite: string;
  team: { speciesId: number; level: number; fainted?: boolean }[];
  currentMonIndex: number;
  rewardMoney: number;
}

export interface DamagePopupItem {
  id: string;
  target: 'player' | 'enemy';
  text: string;
  isCrit?: boolean;
}

interface GameState {
  // Player state
  trainerName: string;
  trainerTag: string;
  money: number;
  tokens: number;
  party: PokemonInstance[];
  pcBox: PokemonInstance[];
  activePartyIndex: number;
  pokedexCaught: number[];
  pokedexSeen: number[];

  // Chapter & Route & Timeline
  currentChapterId: string;
  currentStep: number;
  badges: string[];
  isAdventureModalOpen: boolean;

  // Inventory & Balls & Berries
  selectedBall: BallType;
  balls: Record<BallType, number>;
  berries: {
    razz: number;
    nanab: number;
    pinap: number;
    goldenRazz: number;
  };
  berryBuffs: {
    greatBall: number; // Seconds (0 - 28800 = 8h max)
    ultraBall: number; // Seconds
    nanab: number;     // Seconds
    pinap: number;     // Seconds
  };
  useBerry: (berryType: 'razz' | 'nanab' | 'pinap' | 'goldenRazz') => void;
  autoCatch: boolean;
  gameSpeed: number; // 1, 2, 3

  // Current Node State
  nodeType: StepNodeType;
  isCatchable: boolean;
  activeTrainer: ActiveTrainerState | null;
  bossIntroActive: boolean;
  allyRecalling: boolean;
  allySendingOut: boolean;
  enemyRecalling: boolean;
  newCatchCard: { speciesId: number; level: number; isShiny: boolean; isNew: boolean; destination: 'party' | 'pc' } | null;
  dismissNewCatchCard: () => void;
  chapterCompleteBanner: string | null;
  mysteryReward: MysteryReward | null;
  activeDrop: ActiveDrop | null;
  healPulse: boolean;
  healPresentation: { key: number; speed: number; initialHp: Record<string, number> } | null;
  finishHealPresentation: (key: number) => void;
  finishItemDrop: (id: string) => void;

  // Battle state
  enemy: PokemonInstance | null;
  battleLog: string;
  combatLogs: CombatLog[];
  isBattling: boolean;
  playerAttacking: boolean;
  enemyAttacking: boolean;
  combatEffect: CombatEffect | null;
  arenaShaking: boolean;
  enemyStatus: 'SLP' | null;

  // Floating Popups & Toasts matching Gameplay Video
  damagePopups: DamagePopupItem[];
  topToastBanner: { text: string; iconSpeciesId?: number } | null;
  sidebarExpPopup: string | null;
  sidebarExpPopups: Record<string, { amount: number; active: boolean }> | null;
  duplicatePopup: { text: string; amount: number; speciesId: number } | null;
  isCatchSequenceActive: boolean;
  catchPhase: 'none' | 'enter' | 'throw' | 'absorb' | 'land' | 'reward';
  trainerOnField: boolean;
  capturePresentation: { key: number; success: boolean; duplicate: boolean; ball: BallType; shakes: number } | null;
  finishCapturePresentation: (key: number) => void;
  transitionTick: number;

  // Actions
  setGameSpeed: (speed: number) => void;
  setSelectedBall: (ball: BallType) => void;
  toggleAutoCatch: () => void;
  setActivePartyIndex: (idx: number) => void;
  movePartyMember: (uid: string, direction: -1 | 1) => boolean;
  depositPokemon: (uid: string) => boolean;
  withdrawPokemon: (uid: string, replaceUid?: string) => boolean;
  openAdventureModal: () => void;
  closeAdventureModal: () => void;
  selectChapter: (chapterId: string) => void;
  loadStepNode: (stepNumber: number) => void;
  advanceStep: () => void;
  skipHeal: () => void;
  triggerRandomGift: (customTitle?: string, xPos?: number) => ActiveDrop;
  tickCombat: () => void;
  resolveCombatImpact: (effectKey: number) => void;
  finishCombatEffect: (effectKey: number) => void;
  tickBerryBuffs: () => void;
  catchEnemy: () => void;
  saveGame: (silent?: boolean) => void;
  loadGame: () => void;
}

let healTimeoutId: any = null;
// Khóa lượt đánh: tránh các đòn chồng lên nhau khi setInterval chạy nhanh hơn animation (x2, x3)
let turnBusy = false;
let unlockTimer: any = null;
let mewtwoHitsTakenThisRound = 0;
let chapterCompleteTimer: ReturnType<typeof setTimeout> | null = null;
let chapterCompleteHideTimer: ReturnType<typeof setTimeout> | null = null;
export const TRANSITION_MS = 520;
const lockTurnFor = (ms: number) => {
  turnBusy = true;
  if (unlockTimer) clearTimeout(unlockTimer);
  unlockTimer = setTimeout(() => {
    turnBusy = false;
  }, ms);
};
let scheduledNodeTimeouts: ReturnType<typeof setTimeout>[] = [];
let combatEffectSequence = 0;
let pendingCombatImpact: { key: number; apply: () => void; after: () => void; impacted: boolean; fallback: ReturnType<typeof setTimeout> } | null = null;
let pendingCaptureResult: { key: number; apply: () => void } | null = null;
let pendingDropAdvance = false;
let recoveringParty = false;
let returnToStartAfterHeal = false;

function clearScheduledNodeTimeouts() {
  scheduledNodeTimeouts.forEach(clearTimeout);
  scheduledNodeTimeouts = [];
  healTimeoutId = null;
  pendingCombatImpact = null;
  pendingCaptureResult = null;
  pendingDropAdvance = false;
  recoveringParty = false;
  returnToStartAfterHeal = false;
  turnBusy = false;
  if (unlockTimer) clearTimeout(unlockTimer);
}

function scheduleNodeTimeout(callback: () => void, delayMs: number) {
  let timer: ReturnType<typeof setTimeout>;
  timer = setTimeout(() => {
    scheduledNodeTimeouts = scheduledNodeTimeouts.filter((id) => id !== timer);
    callback();
  }, delayMs);
  scheduledNodeTimeouts.push(timer);
  return timer;
}

// The renderer reports the actual contact frame. The watchdog also permits
// progression when the tab is hidden and requestAnimationFrame is suspended.
function scheduleCombatImpact(effect: Omit<CombatEffect, 'key'>, apply: () => void, after: () => void) {
  const key = ++combatEffectSequence;
  const speed = effect.speed || useGameStore.getState().gameSpeed;
  const fallback = scheduleNodeTimeout(() => useGameStore.getState().finishCombatEffect(key), 8000 / speed + 500);
  pendingCombatImpact = { key, apply, after, impacted: false, fallback };
  turnBusy = true;
  useGameStore.setState({ combatEffect: { ...effect, speed, key }, playerAttacking: effect.target === 'enemy', enemyAttacking: effect.target === 'player' });
}

function rollDamage(attacker: PokemonInstance, defender: PokemonInstance, move: ReturnType<typeof getPokemonMove>) {
  const species = getPokemonSpecies(attacker.speciesId);
  const multiplier = getTypeMultiplier([move.type], getPokemonSpecies(defender.speciesId).types);
  const data = MOVES[move.key];
  const miss = Math.random() * 100 >= (data?.acc || 100);
  const crit = !miss && Math.random() < 1 / 24;
  const physical = move.category === 'physical';
  const attack = physical ? attacker.stats.attack : attacker.stats.spAttack;
  const defense = physical ? defender.stats.defense : defender.stats.spDefense;
  const base = (2 * attacker.level / 5 + 2) * (data?.power || 50) * attack / Math.max(1, defense) / 50 + 2;
  const damage = miss || multiplier === 0 ? 0 : Math.max(1, Math.floor(base * (species.types.includes(move.type) ? 1.5 : 1) * multiplier * Math.pow(1.06, attacker.level - defender.level) * (crit ? 1.5 : 1) * (.85 + Math.random() * .15)));
  return { damage, miss, crit, multiplier };
}

function createInstance(speciesId: number, level: number, isShiny: boolean = false): PokemonInstance {
  const species = getPokemonSpecies(speciesId);
  const stats = calculateStats(species.baseStats, level);
  return {
    uid: `${speciesId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    speciesId,
    level,
    exp: 0,
    expToNextLevel: Math.floor(4 * Math.pow(level, 3) / 5) || 50,
    currentHp: stats.hp,
    maxHp: stats.hp,
    stats,
    isShiny,
    caughtAt: Date.now(),
  };
}

const XP_WINS_PER_LEVEL = 15;
const XP_BASE_REF = 60;
const XP_ACTIVE_BONUS = 1.1;

function calcBattleExp(enemy: PokemonInstance, isTrainer: boolean, hasPinap: boolean): number {
  const sp = getPokemonSpecies(enemy.speciesId);
  const levelCurve = Math.max(25, Math.floor((4 * Math.pow(enemy.level + 1, 3)) / 5));
  const raw = (levelCurve / XP_WINS_PER_LEVEL)
    * Math.sqrt((sp.baseExp || XP_BASE_REF) / XP_BASE_REF)
    * (isTrainer ? 1.5 : 1)
    * (hasPinap ? 2 : 1);
  return Math.max(4, Math.round(raw));
}

function applyExpToParty(party: PokemonInstance[], activeIndex: number, baseExp: number): {
  party: PokemonInstance[];
  activeGain: number;
  gains: Record<string, { amount: number; active: boolean }>;
} {
  let activeGain = Math.round(baseExp * XP_ACTIVE_BONUS);
  const gains: Record<string, { amount: number; active: boolean }> = {};
  const nextParty = party.map((mon, idx) => {
    if (mon.level >= 100) return mon;
    const isActive = idx === activeIndex;
    const gain = isActive ? Math.round(baseExp * XP_ACTIVE_BONUS) : Math.round(baseExp);
    if (isActive) activeGain = gain;
    gains[mon.uid] = { amount: gain, active: isActive };
    let level = mon.level;
    let exp = mon.exp + gain;
    let expToNext = mon.expToNextLevel;
    let stats = mon.stats;
    let maxHp = mon.maxHp;
    let currentHp = mon.currentHp;
    while (exp >= expToNext && level < 100) {
      exp -= expToNext;
      level += 1;
      const nextStats = calculateStats(getPokemonSpecies(mon.speciesId).baseStats, level);
      const hpDiff = Math.max(0, nextStats.hp - maxHp);
      stats = nextStats;
      maxHp = nextStats.hp;
      currentHp = currentHp > 0 ? Math.min(maxHp, currentHp + hpDiff) : 0;
      expToNext = Math.floor((4 * Math.pow(level, 3)) / 5) || 50;
    }
    return { ...mon, level, exp, expToNextLevel: expToNext, stats, maxHp, currentHp };
  });
  return { party: nextParty, activeGain, gains };
}

function nextHealthyPartyIndex(party: PokemonInstance[], currentIndex: number): number {
  for (let offset = 1; offset <= party.length; offset += 1) {
    const index = (currentIndex + offset) % party.length;
    if (party[index]?.currentHp > 0) return index;
  }
  return currentIndex;
}

function bestPartyIndexForEnemy(party: PokemonInstance[], currentIndex: number, enemy: PokemonInstance): number {
  const enemyTypes = getPokemonSpecies(enemy.speciesId).types;
  const scoreFor = (mon: PokemonInstance) => {
    const allyTypes = getPokemonSpecies(mon.speciesId).types;
    const off = Math.max(...allyTypes.map((t) => getTypeMultiplier([t], enemyTypes)));
    const def = Math.max(...enemyTypes.map((t) => getTypeMultiplier([t], allyTypes)));
    const offScore = off === 0 ? -100 : off > 1 ? 2 : off < 1 ? -1 : 0;
    const defScore = def > 1 ? -1 : def < 1 ? 1 : 0;
    return offScore + defScore;
  };
  const current = party[currentIndex];
  let bestIdx = current && current.currentHp > 0 ? currentIndex : -1;
  let bestScore = bestIdx >= 0 ? scoreFor(current) : -Infinity;
  for (let i = 0; i < party.length; i += 1) {
    const mon = party[i];
    if (!mon || mon.currentHp <= 0 || i === currentIndex) continue;
    const score = scoreFor(mon);
    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  }
  return bestIdx >= 0 ? bestIdx : currentIndex;
}

function isValidSavedPokemon(mon: PokemonInstance): boolean {
  return !!mon && typeof mon.uid === 'string' && Number.isInteger(mon.speciesId)
    && mon.speciesId >= 1 && mon.speciesId <= 151
    && Number.isInteger(mon.level) && mon.level >= 1 && mon.level <= 100
    && Number.isFinite(mon.exp) && mon.exp >= 0
    && Number.isFinite(mon.expToNextLevel) && mon.expToNextLevel > 0
    && typeof mon.isShiny === 'boolean'
    && Number.isFinite(mon.maxHp) && mon.maxHp > 0
    && Number.isFinite(mon.currentHp) && mon.currentHp >= 0 && mon.currentHp <= mon.maxHp
    && !!mon.stats && ['hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed']
      .every((key) => Number.isFinite(mon.stats[key]) && mon.stats[key] > 0);
}

function restoreCounters<T extends Record<string, number>>(defaults: T, saved: unknown, max = Number.MAX_SAFE_INTEGER): T {
  const restored = { ...defaults };
  if (!saved || typeof saved !== 'object') return restored;
  for (const key of Object.keys(defaults)) {
    const value = saved[key];
    if (Number.isFinite(value) && value >= 0) restored[key as keyof T] = Math.min(max, Math.floor(value)) as T[keyof T];
  }
  return restored;
}

function restoreDex(saved: unknown, fallback: number[]): number[] {
  return Array.isArray(saved) ? [...new Set(saved.filter((id) => Number.isInteger(id) && id >= 1 && id <= 151))] : fallback;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Player state matches gameplay video
  trainerName: 'Ray',
  trainerTag: '#0910',
  money: 30808,
  tokens: 3017,
  // Chapter 1 starter party: Charmander Lv. 5 & Pidgey Lv. 4
  party: [
    createInstance(4, 5),   // Charmander Lv. 5
    createInstance(16, 4),  // Pidgey Lv. 4
  ],
  pcBox: [],
  activePartyIndex: 0,
  pokedexCaught: [4, 16],
  pokedexSeen: [4, 16],

  // Start on the Boulder Badge route reflected in the Rocgym HAR reference.
  currentChapterId: 'kanto-1',
  currentStep: 1,
  badges: [],
  isAdventureModalOpen: false,

  selectedBall: 'ultraball',
  balls: {
    pokeball: 48,
    greatball: 25,
    ultraball: 95,
    masterball: 1,
  },
  // Berries matching gameplay video
  berries: {
    razz: 22,
    nanab: 1,
    pinap: 1,
    goldenRazz: 2,
  },
  // Active Buffs matching gameplay video (5:55:01 and 55:05)
  berryBuffs: {
    greatBall: 21301, // 5h 55m 01s
    nanab: 3305,     // 55m 05s
    ultraBall: 0,
    pinap: 0,
  },
  autoCatch: true,
  gameSpeed: 3, // Matches gameplay video (x3 in red)

  nodeType: 'grass',
  isCatchable: true,
  activeTrainer: null,
  bossIntroActive: false,
  allyRecalling: false,
  allySendingOut: false,
  enemyRecalling: false,
  newCatchCard: null,
  chapterCompleteBanner: null,
  mysteryReward: null,
  activeDrop: null,
  healPulse: false,
  healPresentation: null,

  enemy: createInstance(16, 4), // Replaced by loadStepNode() during app startup.
  battleLog: 'A wild Pidgey appeared!',
  combatLogs: [],
  isBattling: true,
  playerAttacking: false,
  enemyAttacking: false,
  combatEffect: null,
  arenaShaking: false,
  enemyStatus: null,

  damagePopups: [],
  topToastBanner: null,
  sidebarExpPopup: null,
  sidebarExpPopups: null,
  duplicatePopup: null,
  isCatchSequenceActive: false,
  catchPhase: 'none',
  trainerOnField: false,
  capturePresentation: null,
  transitionTick: 0,

  setGameSpeed: (speed) => set({ gameSpeed: speed }),
  setSelectedBall: (ball) => set({ selectedBall: ball }),
  toggleAutoCatch: () => set((s) => ({ autoCatch: !s.autoCatch })),
  setActivePartyIndex: (idx) => {
    if (turnBusy || get().isCatchSequenceActive || !get().party[idx]?.currentHp) return;
    set({ activePartyIndex: idx });
  },
  movePartyMember: (uid, direction) => {
    const s = get();
    if (turnBusy || s.healPulse || s.isCatchSequenceActive || s.playerAttacking || s.enemyAttacking) return false;
    const index = s.party.findIndex((mon) => mon.uid === uid);
    const next = index + direction;
    if (index < 0 || next < 0 || next >= s.party.length) return false;
    const activeUid = s.party[s.activePartyIndex]?.uid;
    const party = [...s.party];
    [party[index], party[next]] = [party[next], party[index]];
    set({ party, activePartyIndex: Math.max(0, party.findIndex((mon) => mon.uid === activeUid)) });
    get().saveGame(true);
    return true;
  },
  depositPokemon: (uid) => {
    const s = get();
    if (turnBusy || s.healPulse || s.isCatchSequenceActive || s.playerAttacking || s.enemyAttacking) return false;
    const mon = s.party.find((p) => p.uid === uid);
    const party = s.party.filter((p) => p.uid !== uid);
    if (!mon || !party.some((p) => p.currentHp > 0)) return false;
    const activeUid = s.party[s.activePartyIndex]?.uid;
    const activeIndex = party.findIndex((p) => p.uid === activeUid);
    set({ party, pcBox: [...s.pcBox, mon], activePartyIndex: activeIndex >= 0 ? activeIndex : party.findIndex((p) => p.currentHp > 0) });
    get().saveGame(true);
    return true;
  },
  withdrawPokemon: (uid, replaceUid) => {
    const s = get();
    if (turnBusy || s.healPulse || s.isCatchSequenceActive || s.playerAttacking || s.enemyAttacking) return false;
    const mon = s.pcBox.find((p) => p.uid === uid);
    if (!mon) return false;
    const index = s.party.findIndex((p) => p.uid === replaceUid);
    if (s.party.length >= 6 && index < 0) return false;
    const party = [...s.party];
    const pcBox = s.pcBox.filter((p) => p.uid !== uid);
    if (index >= 0) {
      pcBox.push(party[index]);
      party[index] = mon;
    } else party.push(mon);
    if (!party.some((p) => p.currentHp > 0)) return false;
    set({ party, pcBox, activePartyIndex: party[s.activePartyIndex]?.currentHp > 0 ? s.activePartyIndex : party.findIndex((p) => p.currentHp > 0) });
    get().saveGame(true);
    return true;
  },
  openAdventureModal: () => set({ isAdventureModalOpen: true }),
  closeAdventureModal: () => set({ isAdventureModalOpen: false }),

  selectChapter: (chapterId: string) => {
    clearScheduledNodeTimeouts();
    if (chapterCompleteTimer) clearTimeout(chapterCompleteTimer);
    if (chapterCompleteHideTimer) clearTimeout(chapterCompleteHideTimer);
    set({
      currentChapterId: chapterId,
      currentStep: 1,
      activeDrop: null,
      mysteryReward: null,
      isCatchSequenceActive: false,
      duplicatePopup: null,
      topToastBanner: null,
      sidebarExpPopup: null,
      capturePresentation: null,
      damagePopups: [],
      combatEffect: null,
      arenaShaking: false,
      playerAttacking: false,
      enemyAttacking: false,
      chapterCompleteBanner: null,
    });
    get().loadStepNode(1);
  },

  /**
   * Load node details based on current chapter and step
   */
  loadStepNode: (stepNumber: number) => {
    clearScheduledNodeTimeouts();
    const { currentChapterId } = get();
    const chapter = ALL_CHAPTERS.find((c) => c.id === currentChapterId) || DEFAULT_CHAPTER;
    const steps = chapter.steps;
    const node = steps.find((s) => s.step === stepNumber) || steps[0];
    if (currentChapterId === 'special-mewtwo') mewtwoHitsTakenThisRound = 0;

    set({
      activeDrop: null,
      mysteryReward: null,
      activeTrainer: null,
      bossIntroActive: false,
      allyRecalling: false,
      allySendingOut: false,
      enemyRecalling: false,
      newCatchCard: null,
      enemyStatus: null,
      healPulse: false,
      healPresentation: null,
      playerAttacking: false,
      enemyAttacking: false,
      combatEffect: null,
      arenaShaking: false,
      damagePopups: [],
      isCatchSequenceActive: false,
      capturePresentation: null,
      trainerOnField: false,
      duplicatePopup: null,
      topToastBanner: null,
      sidebarExpPopup: null,
    });

    // 1. TALL GRASS NODE
    if (node.type === 'grass') {
      const { pokedexSeen } = get();

      let speciesId = 73; // Tentacruel default for Ch7
      let minLv = 52;
      let maxLv = 58;
      let status: 'SLP' | null = null;

      if (currentChapterId === 'kanto-7') {
        if (stepNumber <= 5) {
          // Routes 19-20 (Sea encounter)
          const pool = [
            { id: 72, min: 50, max: 54 }, // Tentacool
            { id: 73, min: 52, max: 56 }, // Tentacruel
            { id: 90, min: 54, max: 58 }, // Shellder
            { id: 130, min: 55, max: 60 }, // Gyarados
          ];
          const pick = pool[Math.floor(Math.random() * pool.length)];
          speciesId = pick.id;
          minLv = pick.min;
          maxLv = pick.max;
          // Sometimes enemy appears asleep (like frame 18-20s)
          if (stepNumber === 2 || Math.random() < 0.3) {
            status = 'SLP';
          }
        } else if (stepNumber <= 9) {
          // Power Plant
          const pool = [100, 101, 25, 81, 82];
          speciesId = pool[Math.floor(Math.random() * pool.length)];
          minLv = 50;
          maxLv = 55;
        } else if (stepNumber <= 16) {
          // Seafoam Islands (Dewgong, Seel, Shellder, Cloyster)
          const pool = [86, 87, 90, 91];
          speciesId = pool[Math.floor(Math.random() * pool.length)];
          minLv = 55;
          maxLv = 60;
        } else {
          // Pokemon Mansion
          const pool = [58, 77, 126, 37];
          speciesId = pool[Math.floor(Math.random() * pool.length)];
          minLv = 56;
          maxLv = 60;
        }
      } else if (currentChapterId === 'special-mewtwo') {
        const cavePool = [42, 42, 64, 64, 93, 93, 42, 64];
        speciesId = cavePool[Math.floor(Math.random() * cavePool.length)];
        minLv = 65;
        maxLv = 75;
      } else {
        // Chapter 1 (Route 1 / Viridian Forest)
        if (stepNumber <= 4) {
          speciesId = Math.random() < 0.55 ? 16 : 19;
          minLv = 2;
          maxLv = 5;
        } else if (stepNumber <= 8) {
          const pool = [16, 19, 29, 32];
          speciesId = pool[Math.floor(Math.random() * pool.length)];
          minLv = 4;
          maxLv = 7;
        } else {
          const pool = [10, 13, 11, 14, 25];
          speciesId = pool[Math.floor(Math.random() * pool.length)];
          minLv = 6;
          maxLv = 9;
        }
      }

      const lvl = Math.floor(Math.random() * (maxLv - minLv + 1)) + minLv;
      const enemyMon = createInstance(speciesId, lvl, false);
      const enemySpecies = getPokemonSpecies(speciesId);

      set({
        nodeType: 'grass',
        isCatchable: true,
        activeTrainer: null,
        mysteryReward: null,
        healPulse: false,
        activePartyIndex: bestPartyIndexForEnemy(get().party, get().activePartyIndex, enemyMon),
        enemy: enemyMon,
        enemyStatus: status,
        battleLog: status === 'SLP' ? `🌙 It's fast asleep...` : `A wild ${enemySpecies.name} appeared!`,
        isCatchSequenceActive: false,
        pokedexSeen: pokedexSeen.includes(speciesId) ? pokedexSeen : [...pokedexSeen, speciesId],
      });
      return;
    }

    // 2. POKÉMON CENTER HEAL NODE
    if (node.type === 'center') {
      const healKey = ++combatEffectSequence;
      const speed = get().gameSpeed;
      set({
        nodeType: 'center',
        isCatchable: false,
        activeTrainer: null,
        mysteryReward: null,
        activeDrop: null,
        enemy: null,
        healPulse: true,
        healPresentation: { key: healKey, speed, initialHp: Object.fromEntries(get().party.map(mon => [mon.uid, mon.currentHp])) },
        battleLog: `💖 Pokémon Center: Restoring all Pokémon to full health!`,
      });

      healTimeoutId = scheduleNodeTimeout(() => get().finishHealPresentation(healKey), 30000 / speed);
      return;
    }

    // 3. MYSTERY ITEM NODE ('?')
    if (node.type === 'question') {
      const drop = get().triggerRandomGift('🎁 Found an item along the path!', 65);

      set({
        nodeType: 'question',
        isCatchable: false,
        activeTrainer: null,
        enemy: null,
        healPulse: false,
        mysteryReward: drop,
      });

      return;
    }

    // 4. TRAINER BATTLE (RED NODE)
    if (node.type === 'red' && node.trainer) {
      const t = node.trainer;
      const firstMonData = t.team[0];
      const firstEnemy = createInstance(firstMonData.speciesId, firstMonData.level, false);
      const enemySpecies = getPokemonSpecies(firstEnemy.speciesId);

      set({
        nodeType: 'red',
        isCatchable: false,
        mysteryReward: null,
        healPulse: false,
        activeTrainer: {
          name: t.name,
          title: t.title,
          sprite: t.sprite,
          team: t.team.map((m) => ({ ...m, fainted: false })),
          currentMonIndex: 0,
          rewardMoney: t.rewardMoney,
        },
        activePartyIndex: bestPartyIndexForEnemy(get().party, get().activePartyIndex, firstEnemy),
        bossIntroActive: true,
        enemy: firstEnemy,
        battleLog: `${t.name} wants to battle! ${t.name} sends out ${enemySpecies.name}!`,
      });
      scheduleNodeTimeout(() => set({ bossIntroActive: false }), 1500 / get().gameSpeed);
      return;
    }

    // 5. GYM LEADER BATTLE (BADGE NODE)
    if (node.type === 'badge' && node.trainer) {
      const t = node.trainer;
      const firstMonData = t.team[0];
      const bossEnemy = createInstance(firstMonData.speciesId, firstMonData.level, false);
      const enemySpecies = getPokemonSpecies(bossEnemy.speciesId);

      set({
        nodeType: 'badge',
        isCatchable: false,
        mysteryReward: null,
        healPulse: false,
        activeTrainer: {
          name: t.name,
          title: t.title,
          sprite: t.sprite,
          team: t.team.map((m) => ({ ...m, fainted: false })),
          currentMonIndex: 0,
          rewardMoney: t.rewardMoney,
        },
        bossIntroActive: true,
        chapterCompleteBanner: null,
        activePartyIndex: bestPartyIndexForEnemy(get().party, get().activePartyIndex, bossEnemy),
        enemy: bossEnemy,
        battleLog: `${t.name} challenged you! ${t.name} sends out ${enemySpecies.name}!`,
      });
      scheduleNodeTimeout(() => set({ bossIntroActive: false }), 2900);
      return;
    }
  },

  tickBerryBuffs: () => {
    set((s) => ({
      berryBuffs: {
        greatBall: Math.max(0, s.berryBuffs.greatBall - 1),
        ultraBall: Math.max(0, s.berryBuffs.ultraBall - 1),
        nanab: Math.max(0, s.berryBuffs.nanab - 1),
        pinap: Math.max(0, s.berryBuffs.pinap - 1),
      },
    }));
  },

  useBerry: (berryType) => {
    const { berries, berryBuffs } = get();
    if (berries[berryType] <= 0) {
      set({ battleLog: `You have no ${berryType} berries left!` });
      return;
    }

    const MAX_BUFF = 8 * 3600;
    const ADD_BUFF = 30 * 60;

    if (berryType === 'razz') {
      const cur = berryBuffs.greatBall || 0;
      const next = Math.min(MAX_BUFF, cur + ADD_BUFF);
      set({
        berries: { ...berries, razz: berries.razz - 1 },
        berryBuffs: { ...berryBuffs, greatBall: next },
        battleLog: `Ate Razz Berry! Poké Balls upgraded to Great Balls (+30m)!`,
      });
    } else if (berryType === 'goldenRazz') {
      const cur = berryBuffs.ultraBall || 0;
      const next = Math.min(MAX_BUFF, cur + ADD_BUFF);
      set({
        berries: { ...berries, goldenRazz: berries.goldenRazz - 1 },
        berryBuffs: { ...berryBuffs, ultraBall: next },
        battleLog: `Ate Golden Razz Berry! Poké Balls upgraded to Ultra Balls (+30m)!`,
      });
    } else if (berryType === 'nanab') {
      const cur = berryBuffs.nanab || 0;
      const next = Math.min(MAX_BUFF, cur + ADD_BUFF);
      set({
        berries: { ...berries, nanab: berries.nanab - 1 },
        berryBuffs: { ...berryBuffs, nanab: next },
        battleLog: `Ate Nanab Berry! Wild Pokémon pacified (+catch rate) for +30m!`,
      });
    } else if (berryType === 'pinap') {
      const cur = berryBuffs.pinap || 0;
      const next = Math.min(MAX_BUFF, cur + ADD_BUFF);
      set({
        berries: { ...berries, pinap: berries.pinap - 1 },
        berryBuffs: { ...berryBuffs, pinap: next },
        battleLog: `Ate Pinap Berry! Double Rewards boost active for +30m!`,
      });
    }
  },

  triggerRandomGift: (customTitle?: string, xPos?: number) => {
    const roll = Math.random();
    let drop: ActiveDrop;

    if (roll < 0.55) {
      const berryTypes = ['razz', 'nanab', 'pinap', 'goldenRazz'] as const;
      const b = berryTypes[Math.floor(Math.random() * berryTypes.length)];
      const count = 1;
      const berryName =
        b === 'razz'
          ? 'Razz Berry'
          : b === 'nanab'
          ? 'Nanab Berry'
          : b === 'pinap'
          ? 'Pinap Berry'
          : 'Golden Razz Berry';
      const iconUrl = b === 'goldenRazz' ? '/assets/ui/golden-razz-berry.png' : getItemSpriteUrl(b);

      set((s) => ({
        berries: {
          ...s.berries,
          [b]: s.berries[b] + count,
        },
      }));

      drop = {
        id: `drop-${Date.now()}-${Math.random()}`,
        type: 'berry',
        title: `${count}x ${berryName}`,
        amount: count,
        iconUrl,
        xPercent: xPos ?? Math.floor(55 + Math.random() * 20),
      };
    } else {
      const foundMoney = Math.floor(Math.random() * 350) + 150;
      set((s) => ({ money: s.money + foundMoney }));

      drop = {
        id: `drop-${Date.now()}-${Math.random()}`,
        type: 'money',
        title: `₽${foundMoney.toLocaleString()}`,
        amount: foundMoney,
        iconUrl: '/assets/ui/coin-spin-frames.png',
        xPercent: xPos ?? Math.floor(55 + Math.random() * 20),
      };
    }

    drop.speed = get().gameSpeed;
    set({
      activeDrop: drop,
      battleLog: customTitle || `🎁 Found ${drop.title}!`,
    });

    scheduleNodeTimeout(() => get().finishItemDrop(drop.id), 20000 / drop.speed);

    return drop;
  },

  advanceStep: () => {
    const { currentChapterId, currentStep } = get();
    const chapter = ALL_CHAPTERS.find((c) => c.id === currentChapterId) || DEFAULT_CHAPTER;
    const total = chapter.totalSteps;
    const nextStep = currentStep >= total ? 1 : currentStep + 1;

    set((s) => ({
      currentStep: nextStep,
      mysteryReward: null,
      isCatchSequenceActive: false,
      allyRecalling: false,
      allySendingOut: false,
      enemyRecalling: false,
      newCatchCard: null,
      catchPhase: 'none',
      trainerOnField: false,
      duplicatePopup: null,
      topToastBanner: null,
      sidebarExpPopup: null,
      sidebarExpPopups: null,
      damagePopups: [],
      combatEffect: null,
      playerAttacking: false,
      enemyAttacking: false,
      transitionTick: s.transitionTick + 1,
    }));
    get().loadStepNode(nextStep);
  },

  skipHeal: () => {
    const heal = get().healPresentation;
    if (heal) get().finishHealPresentation(heal.key);
  },
  finishHealPresentation: (key) => {
    if (get().nodeType !== 'center' || get().healPresentation?.key !== key) return;
    if (healTimeoutId) clearTimeout(healTimeoutId);
    const shouldReturnToStart = returnToStartAfterHeal;
    returnToStartAfterHeal = false;
    set((state) => ({
      party: state.party.map((mon) => ({ ...mon, currentHp: mon.maxHp })),
      healPulse: false,
      healPresentation: null,
      ...(shouldReturnToStart
        ? {
            activePartyIndex: 0,
            currentStep: 1,
            transitionTick: state.transitionTick + 1,
          }
        : {}),
    }));
    if (shouldReturnToStart) {
      get().loadStepNode(1);
    } else {
      get().advanceStep();
    }
  },
  finishItemDrop: (id) => {
    if (get().activeDrop?.id !== id) return;
    const advance = pendingDropAdvance || get().nodeType === 'question';
    const shouldRecall = advance && ['grass', 'red', 'badge'].includes(get().nodeType);
    pendingDropAdvance = false;
    set({ activeDrop: null, mysteryReward: null, chapterCompleteBanner: null });
    if (shouldRecall) {
      set({ allyRecalling: true });
      scheduleNodeTimeout(() => get().advanceStep(), Math.max(160, 260 / get().gameSpeed));
    } else if (advance) {
      get().advanceStep();
    }
  },

  /**
   * Wild Pokémon Capture & Duplicate EXP Animation Sequence (Identical to Gameplay Video)
   */
  catchEnemy: () => {
    const { enemy, gameSpeed, party, pcBox, pokedexCaught, selectedBall, balls, berryBuffs } = get();
    if (!enemy || get().isCatchSequenceActive || !get().isCatchable) return;

    const enemySpecies = getPokemonSpecies(enemy.speciesId);
    const isDuplicate = pokedexCaught.includes(enemy.speciesId);
    const upgradedBall = berryBuffs.ultraBall > 0 ? 'ultraball' : berryBuffs.greatBall > 0 ? 'greatball' : null;
    const hasSelectedBall = selectedBall === 'pokeball' || balls[selectedBall] > 0;
    const ballType = upgradedBall || (hasSelectedBall ? selectedBall : 'pokeball');
    const ballMultiplier = { pokeball: 1, greatball: 1.5, ultraball: 2, masterball: 255 }[ballType];
    // The encounter is weakened to 0 HP before this sequence, matching the
    // original game's one-throw-after-KO capture flow.
    const catchValue = Math.min(255, enemySpecies.catchRate * ballMultiplier);
    const catchChance = ballType === 'masterball'
      ? 1
      : 1 - Math.pow(1 - catchValue / 255, 3);
    const caught = Math.random() < catchChance;
    const capturedMon = { ...enemy, currentHp: enemy.maxHp, caughtAt: Date.now() };
    const captureDestination = party.length < 6 ? 'party' : 'pc';

    if (ballType !== 'pokeball' && !upgradedBall) {
      set((s) => ({ balls: { ...s.balls, [ballType]: Math.max(0, s.balls[ballType] - 1) } }));
    }

    // Lock turns so tickCombat does not run while catch is in progress
    const totalCatchDuration = Math.max(1200, Math.floor(2200 / gameSpeed));
    lockTurnFor(totalCatchDuration);

    const battleExp = calcBattleExp(enemy, false, berryBuffs.pinap > 0);
    const activeExp = Math.round(battleExp * XP_ACTIVE_BONUS);
    const baseExpReward = isDuplicate ? battleExp * 3 : activeExp;
    const expFormatted = baseExpReward.toLocaleString();
    const rewardText = !caught
      ? `${enemySpecies.name} broke free!`
      : isDuplicate
        ? `Duplicate: +${expFormatted} EXP for the ${enemySpecies.name} family`
        : `${enemySpecies.name} caught! Added to ${captureDestination === 'party' ? 'your team' : 'the PC'}.`;

    // 1. Enter Catch Sequence: Red slides in with throwing pose!
    set({
      isCatchSequenceActive: true,
      catchPhase: 'throw',
      trainerOnField: true,
      battleLog: `Throwing a ${ballType === 'pokeball' ? 'Poké Ball' : ballType === 'greatball' ? 'Great Ball' : ballType === 'ultraball' ? 'Ultra Ball' : 'Master Ball'}…`,
    });

    const rewardDuration = 950 / gameSpeed;
    const captureKey = ++combatEffectSequence;
    pendingCaptureResult = { key: captureKey, apply: () => {
        set((s) => {
          if (!caught) {
            return {
              catchPhase: 'reward',
              duplicatePopup: null,
              topToastBanner: { text: rewardText, iconSpeciesId: enemy.speciesId },
              sidebarExpPopup: null,
              sidebarExpPopups: null,
            };
          }

          if (isDuplicate) {
            const expRes = applyExpToParty(s.party, s.activePartyIndex, battleExp);
            return {
              catchPhase: 'reward',
              party: expRes.party,
              duplicatePopup: {
                text: `+${expFormatted} EXP`,
                amount: baseExpReward,
                speciesId: enemy.speciesId,
              },
              topToastBanner: {
                text: rewardText,
                iconSpeciesId: enemy.speciesId,
              },
              sidebarExpPopup: `+${expRes.activeGain.toLocaleString()} XP`,
              sidebarExpPopups: expRes.gains,
            };
          }

          const alreadyStored = s.pokedexCaught.includes(enemy.speciesId);
          const expRes = applyExpToParty(s.party, s.activePartyIndex, battleExp);
          return {
            catchPhase: 'reward',
            party: !alreadyStored && captureDestination === 'party'
              ? [...expRes.party, capturedMon]
              : expRes.party,
            pcBox: !alreadyStored && captureDestination === 'pc'
              ? [...s.pcBox, capturedMon]
              : s.pcBox,
            pokedexCaught: alreadyStored
              ? s.pokedexCaught
              : [...s.pokedexCaught, enemy.speciesId],
            pokedexSeen: s.pokedexSeen.includes(enemy.speciesId)
              ? s.pokedexSeen
              : [...s.pokedexSeen, enemy.speciesId],
            duplicatePopup: null,
            newCatchCard: !alreadyStored || enemy.isShiny
              ? {
                  speciesId: enemy.speciesId,
                  level: enemy.level,
                  isShiny: enemy.isShiny,
                  isNew: !alreadyStored,
                  destination: captureDestination,
                }
              : null,
            topToastBanner: alreadyStored && !enemy.isShiny
              ? { text: rewardText, iconSpeciesId: enemy.speciesId }
              : null,
            sidebarExpPopup: `+${expRes.activeGain.toLocaleString()} XP`,
            sidebarExpPopups: expRes.gains,
          };
        });

        // If a new species (or shiny) Dex Card is shown, wait for the user to dismiss it before advancing.
        if (get().newCatchCard) return;

        // 4. Advance to next step with smooth dither transition
        scheduleNodeTimeout(() => {
          set((s) => ({
            enemy: null,
            allyRecalling: true,
            activePartyIndex: get().nodeType === 'grass'
              ? nextHealthyPartyIndex(s.party, s.activePartyIndex)
              : s.activePartyIndex,
            transitionTick: s.transitionTick + 1,
          }));
          scheduleNodeTimeout(() => get().advanceStep(), Math.max(160, 260 / get().gameSpeed));
        }, rewardDuration);

    }};
    set({ capturePresentation: { key: captureKey, success: caught, duplicate: isDuplicate, ball: ballType, shakes: caught ? 4 : Math.floor(Math.random() * 3) } });
    scheduleNodeTimeout(() => get().finishCapturePresentation(captureKey), 25000 / gameSpeed);
  },

  dismissNewCatchCard: () => {
    if (!get().newCatchCard) return;
    set((s) => ({
      newCatchCard: null,
      enemy: null,
      allyRecalling: true,
      activePartyIndex: get().nodeType === 'grass'
        ? nextHealthyPartyIndex(s.party, s.activePartyIndex)
        : s.activePartyIndex,
      transitionTick: s.transitionTick + 1,
    }));
    scheduleNodeTimeout(() => get().advanceStep(), Math.max(160, 260 / get().gameSpeed));
  },

  finishCapturePresentation: (key) => {
    if (!pendingCaptureResult || pendingCaptureResult.key !== key) return;
    const result = pendingCaptureResult;
    pendingCaptureResult = null;
    result.apply();
  },

  resolveCombatImpact: (key) => {
    const pending = pendingCombatImpact;
    if (!pending || pending.key !== key || pending.impacted) return;
    pending.impacted = true;
    pending.apply();
  },

  finishCombatEffect: (key) => {
    if (!pendingCombatImpact || pendingCombatImpact.key !== key) return;
    get().resolveCombatImpact(key);
    const pending = pendingCombatImpact;
    pendingCombatImpact = null;
    clearTimeout(pending.fallback);
    scheduledNodeTimeouts = scheduledNodeTimeouts.filter(timer => timer !== pending.fallback);
    set({ combatEffect: null, playerAttacking: false, enemyAttacking: false, arenaShaking: false });
    lockTurnFor(200 / get().gameSpeed);
    pending.after();
  },

  tickCombat: () => {
    const s = get();
    if (turnBusy || pendingCombatImpact || recoveringParty || s.isCatchSequenceActive || s.allyRecalling || s.allySendingOut || s.enemyRecalling || s.healPulse || s.activeDrop || s.bossIntroActive || Boolean(s.newCatchCard)) return;
    const speed = s.gameSpeed;
    const recoverOrSwitch = () => {
      const state = get();
      if (state.party[state.activePartyIndex]?.currentHp > 0) return;
      const healthy = state.enemy
        ? bestPartyIndexForEnemy(state.party, state.activePartyIndex, state.enemy)
        : state.party.findIndex(mon => mon.currentHp > 0);
      if (healthy >= 0 && state.party[healthy]?.currentHp > 0) {
        const faintedName = getPokemonSpecies(state.party[state.activePartyIndex]?.speciesId || 1).name;
        const nextName = getPokemonSpecies(state.party[healthy].speciesId).name;
        turnBusy = true;
        set({
          allyRecalling: true,
          battleLog: `Come back, ${faintedName}!`,
        });
        scheduleNodeTimeout(() => {
          set({
            allyRecalling: false,
            activePartyIndex: healthy,
            allySendingOut: true,
            battleLog: `Go, ${nextName}!`,
          });
          scheduleNodeTimeout(() => {
            set({ allySendingOut: false });
            turnBusy = false;
            lockTurnFor(160 / speed);
          }, Math.max(220, 420 / speed));
        }, Math.max(220, 400 / speed));
        return;
      }
      if (recoveringParty) return;
      recoveringParty = true;
      turnBusy = true;
      set({
        allyRecalling: true,
        topToastBanner: { text: 'Defeated! Your entire team fainted.' },
        battleLog: 'You were defeated! Returning to the Pokémon Center…',
      });
      scheduleNodeTimeout(() => {
        const healKey = ++combatEffectSequence;
        const currentSpeed = get().gameSpeed;
        returnToStartAfterHeal = true;
        set((state) => ({
          nodeType: 'center',
          isCatchable: false,
          activeTrainer: null,
          trainerOnField: false,
          mysteryReward: null,
          activeDrop: null,
          topToastBanner: null,
          enemy: null,
          allyRecalling: false,
          allySendingOut: false,
          healPulse: true,
          transitionTick: state.transitionTick + 1,
          healPresentation: {
            key: healKey,
            speed: currentSpeed,
            initialHp: Object.fromEntries(state.party.map((mon) => [mon.uid, mon.currentHp])),
          },
          battleLog: '💖 Pokémon Center: Restoring all Pokémon to full health!',
        }));
        healTimeoutId = scheduleNodeTimeout(() => get().finishHealPresentation(healKey), 30000 / currentSpeed);
      }, Math.max(600, 1100 / speed));
    };
    const attacker = s.party[s.activePartyIndex];
    if (!attacker || attacker.currentHp <= 0) { recoverOrSwitch(); return; }
    if (!s.enemy || s.enemy.currentHp <= 0) return;
    const enemyUid = s.enemy.uid;
    const actorName = getPokemonSpecies(attacker.speciesId).name;
    const enemyName = getPokemonSpecies(s.enemy.speciesId).name;
    const showHit = (target: 'enemy' | 'player', roll: ReturnType<typeof rollDamage>, moveName: string, name: string) => {
      const id = 'damage-' + (++combatEffectSequence);
      const text = roll.miss ? 'Miss!' : roll.multiplier === 0 ? 'No effect' : '-' + roll.damage;
      const detail = roll.miss ? ' It missed!' : roll.multiplier === 0 ? ' It had no effect.' : roll.crit ? ' A critical hit!' : roll.multiplier > 1 ? " It's super effective!" : roll.multiplier < 1 ? " It's not very effective…" : '';
      set(state => ({ battleLog: name + ' used ' + moveName + '!' + detail, damagePopups: [...state.damagePopups, { id, target, text, isCrit: roll.crit }] }));
      scheduleNodeTimeout(() => set(state => ({ damagePopups: state.damagePopups.filter(pop => pop.id !== id) })), 950 / speed);
    };
    const defeatedEnemy = () => {
      const defeated = get().enemy;
      if (!defeated || defeated.uid !== enemyUid || defeated.currentHp > 0) return;
      lockTurnFor(700 / speed);
      const trainer = get().activeTrainer;
      const battleExp = calcBattleExp(defeated, Boolean(trainer), get().berryBuffs.pinap > 0);
      set(state => {
        const expRes = applyExpToParty(state.party, state.activePartyIndex, battleExp);
        return {
          party: expRes.party,
          sidebarExpPopup: `+${expRes.activeGain.toLocaleString()} XP`,
          sidebarExpPopups: expRes.gains,
          battleLog: enemyName + ' fainted!',
        };
      });
      scheduleNodeTimeout(() => set({ sidebarExpPopup: null, sidebarExpPopups: null }), 900 / speed);
      if (trainer) {
        const team = trainer.team.map((mon, index) => index === trainer.currentMonIndex ? { ...mon, fainted: true } : mon);
        const next = trainer.currentMonIndex + 1;
        set({ activeTrainer: { ...trainer, team } });
        if (next < team.length) {
          lockTurnFor(1350 / speed);
          scheduleNodeTimeout(() => {
            set({ enemyRecalling: true });
            scheduleNodeTimeout(() => {
              const mon = createInstance(team[next].speciesId, team[next].level);
              const bestIdx = bestPartyIndexForEnemy(get().party, get().activePartyIndex, mon);
              set({
                enemyRecalling: false,
                activeTrainer: { ...trainer, team, currentMonIndex: next },
                activePartyIndex: bestIdx,
                enemy: mon,
                battleLog: trainer.name + ' sends out ' + getPokemonSpecies(mon.speciesId).name + '!',
              });
            }, 280 / speed);
          }, 350 / speed);
          return;
        }
        scheduleNodeTimeout(() => {
          const chapter = ALL_CHAPTERS.find(c => c.id === get().currentChapterId) || DEFAULT_CHAPTER;
          const badge = get().nodeType === 'badge' ? chapter.badgeSprite : null;
          const isBadge = get().nodeType === 'badge';
          set(state => ({
            money: state.money + trainer.rewardMoney,
            badges: badge && !state.badges.includes(badge) ? [...state.badges, badge] : state.badges,
            chapterCompleteBanner: badge ? chapter.badgeName : null,
            battleLog: 'Defeated ' + trainer.name + '! Received ₽' + trainer.rewardMoney.toLocaleString() + '!',
          }));
          scheduleNodeTimeout(() => {
            set({ chapterCompleteBanner: null, allyRecalling: true });
            scheduleNodeTimeout(() => get().advanceStep(), Math.max(160, 260 / speed));
          }, (isBadge ? 1400 : 800) / speed);
        }, 500 / speed);
      } else {
        scheduleNodeTimeout(() => {
          if (get().autoCatch && get().isCatchable) get().catchEnemy();
          else {
            set({ allyRecalling: true });
            scheduleNodeTimeout(() => get().advanceStep(), Math.max(160, 260 / speed));
          }
        }, 500 / speed);
      }
    };
    const retaliate = () => {
      const state = get();
      if (state.enemy?.uid !== enemyUid || state.enemy.currentHp <= 0 || state.isCatchSequenceActive) return;
      const target = state.party[state.activePartyIndex];
      if (!target || target.currentHp <= 0) { recoverOrSwitch(); return; }
      if (state.enemyStatus === 'SLP') {
        set({ battleLog: enemyName + ' is fast asleep…', enemyStatus: null });
        return;
      }
      const move = getPokemonMove(getPokemonSpecies(state.enemy.speciesId).types, getPokemonSpecies(target.speciesId).types);
      const roll = rollDamage(state.enemy, target, move);
      set({ battleLog: 'Foe ' + enemyName + ' used ' + move.name + '!' });
      scheduleCombatImpact({ type: move.effectType, target: 'player', damage: roll.damage, moveName: move.name, moveKey: move.key, speed, miss: roll.miss || roll.multiplier === 0, crit: roll.crit }, () => {
        if (get().enemy?.uid !== enemyUid || get().enemy.currentHp <= 0) return;
        const current = get().party.find(mon => mon.uid === target.uid);
        if (!current || current.currentHp <= 0) return;
        set(state => ({ party: state.party.map(mon => mon.uid === target.uid ? { ...mon, currentHp: Math.max(0, mon.currentHp - roll.damage) } : mon) }));
        showHit('player', roll, move.name, 'Foe ' + enemyName);
      }, () => {
        if (get().party.find(mon => mon.uid === target.uid)?.currentHp <= 0) {
          set({ battleLog: getPokemonSpecies(target.speciesId).name + ' fainted!' });
          lockTurnFor(600 / speed);
          scheduleNodeTimeout(recoverOrSwitch, 500 / speed);
        }
      });
    };
    const move = getPokemonMove(getPokemonSpecies(attacker.speciesId).types, getPokemonSpecies(s.enemy.speciesId).types);
    const roll = rollDamage(attacker, s.enemy, move);
    if (roll.multiplier === 0) {
      const bestIdx = bestPartyIndexForEnemy(s.party, s.activePartyIndex, s.enemy);
      if (bestIdx !== s.activePartyIndex && s.party[bestIdx]?.currentHp > 0) {
        set({ activePartyIndex: bestIdx, battleLog: 'Switched to ' + getPokemonSpecies(s.party[bestIdx].speciesId).name + ' for a better matchup!' });
        lockTurnFor(400 / speed);
        return;
      }
    }
    set({ battleLog: actorName + ' used ' + move.name + '!' });
    scheduleCombatImpact({ type: move.effectType, target: 'enemy', damage: roll.damage, moveName: move.name, moveKey: move.key, speed, miss: roll.miss || roll.multiplier === 0, crit: roll.crit }, () => {
      const current = get().enemy;
      const alive = get().party.find(mon => mon.uid === attacker.uid);
      if (!current || current.uid !== enemyUid || current.currentHp <= 0 || !alive || alive.currentHp <= 0) return;
      set({ enemy: { ...current, currentHp: Math.max(0, current.currentHp - roll.damage) } });
      showHit('enemy', roll, move.name, actorName);
    }, () => {
      if (get().enemy?.uid !== enemyUid) return;
      if (get().enemy.currentHp <= 0) defeatedEnemy();
      else {
        lockTurnFor(300 / speed);
        scheduleNodeTimeout(retaliate, 250 / speed);
      }
    });
  },

  saveGame: (silent = false) => {
    try {
      const state = get();
      const saveObj = {
        version: 2,
        saveVersion: 3,
        savedAt: Date.now(),
        trainerName: state.trainerName,
        trainerTag: state.trainerTag,
        money: state.money,
        tokens: state.tokens,
        party: state.party,
        pcBox: state.pcBox,
        activePartyIndex: state.activePartyIndex,
        pokedexCaught: state.pokedexCaught,
        pokedexSeen: state.pokedexSeen,
        badges: state.badges,
        balls: state.balls,
        selectedBall: state.selectedBall,
        autoCatch: state.autoCatch,
        gameSpeed: state.gameSpeed,
        currentChapterId: state.currentChapterId,
        currentStep: state.currentStep,
        berries: state.berries,
        berryBuffs: state.berryBuffs,
      };
      localStorage.setItem('pokecatch_save_v1', JSON.stringify(saveObj));
      if (!silent) set({ battleLog: '💾 Game state saved successfully!' });
    } catch (e) {
      if (!silent) set({ battleLog: 'Unable to save. Check browser storage space and permissions.' });
      console.error(e);
    }
  },

  loadGame: () => {
    let restoredActivePartyIndex: number | null = null;
    try {
      const saved = localStorage.getItem('pokecatch_save_v1');
      if (saved) {
        const obj = JSON.parse(saved);
        if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('Invalid save');
        const savedChapter = ALL_CHAPTERS.find((chapter) => chapter.id === obj.currentChapterId);
        const chapter = savedChapter || DEFAULT_CHAPTER;
        const savedStep = Number.isFinite(Number(obj.currentStep)) ? Math.floor(Number(obj.currentStep)) : 1;
        let currentStep = Math.max(1, Math.min(chapter.totalSteps, savedStep));

        // Question nodes grant their reward on entry. Resume after them so loading
        // a save cannot roll and award the same item a second time.
        if (chapter.steps[currentStep - 1]?.type === 'question') {
          currentStep = currentStep >= chapter.totalSteps ? 1 : currentStep + 1;
        }

        const isOldDemoParty =
          obj.saveVersion !== 3 &&
          Array.isArray(obj.party) &&
          obj.party.some((m: PokemonInstance) => m && m.level >= 80);

        set({
          trainerName: obj.trainerName || 'Ray',
          trainerTag: typeof obj.trainerTag === 'string' ? obj.trainerTag : get().trainerTag,
          money: Number.isFinite(obj.money) && obj.money >= 0 ? Math.floor(obj.money) : get().money,
          tokens: Number.isFinite(obj.tokens) && obj.tokens >= 0 ? Math.floor(obj.tokens) : get().tokens,
          party: isOldDemoParty
            ? get().party
            : Array.isArray(obj.party) && obj.party.length > 0 && obj.party.length <= 6 && obj.party.every(isValidSavedPokemon)
            ? obj.party
            : get().party,
          pcBox: Array.isArray(obj.pcBox) && obj.pcBox.every(isValidSavedPokemon) ? obj.pcBox : [],
          activePartyIndex: 0,
          pokedexCaught: isOldDemoParty ? get().pokedexCaught : restoreDex(obj.pokedexCaught, get().pokedexCaught),
          pokedexSeen: isOldDemoParty ? get().pokedexSeen : restoreDex(obj.pokedexSeen, restoreDex(obj.pokedexCaught, get().pokedexSeen)),
          badges: Array.isArray(obj.badges) ? obj.badges.filter((badge) => typeof badge === 'string') : [],
          balls: restoreCounters(get().balls, obj.balls),
          selectedBall: ['pokeball', 'greatball', 'ultraball', 'masterball'].includes(obj.selectedBall) ? obj.selectedBall : get().selectedBall,
          autoCatch: typeof obj.autoCatch === 'boolean' ? obj.autoCatch : get().autoCatch,
          gameSpeed: [1, 2, 3].includes(obj.gameSpeed) ? obj.gameSpeed : get().gameSpeed,
          currentChapterId: chapter.id,
          currentStep,
          berries: restoreCounters(get().berries, obj.berries),
          berryBuffs: restoreCounters(get().berryBuffs, obj.berryBuffs, 28800),
        });
        const party = get().party;
        restoredActivePartyIndex = Number.isInteger(obj.activePartyIndex) && party[obj.activePartyIndex] ? obj.activePartyIndex : 0;
        set({ activePartyIndex: restoredActivePartyIndex });
        if (isOldDemoParty) {
          get().saveGame(true);
        }
      }
    } catch (e) {
      console.error(e);
    }
    // Initialize the route on a fresh install too. Without this, the placeholder
    // enemy remains on screen and no encounter is actually active.
    get().loadStepNode(get().currentStep);
    if (restoredActivePartyIndex !== null) {
      set({ activePartyIndex: restoredActivePartyIndex });
    }
  },
}));
