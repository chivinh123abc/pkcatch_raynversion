import type { ActiveDrop, AdventureGift, BallType, CombatEffect, CombatLog, MysteryReward, PokemonInstance, StepNodeType } from '../../types/game';
import type { ChapterRun } from '../data/chapterGenerator';
import type { RuntimeSnapshot } from '../runtime/GameplayRuntime';
export interface ActiveTrainerState {
    power?: number;
    league?: boolean;
    name: string;
    title: string;
    sprite: string;
    team: {
        speciesId: number;
        level: number;
        fainted?: boolean;
    }[];
    currentMonIndex: number;
    rewardMoney: number;
}
export interface DamagePopupItem {
    id: string;
    target: 'player' | 'enemy';
    text: string;
    isCrit?: boolean;
}
export interface GameState {
    buddy: import('./buddy').BuddyState;
    setBuddy: (uid: string | null) => boolean;
    useExpCandy: (uid: string, item: string) => boolean;
    encounter: RuntimeSnapshot;
    starterChosen: boolean;
    chooseStarter: (speciesId: number, profile?: {name: string; sprite: 'red' | 'leaf'}) => void;
    resolvedNode: { chapterId: string; step: number } | null;
    awardedEnemyUids: string[];
    items: Record<string, number>;
    gifts: string[];
    captureRoll: { enemyUid: string; success: boolean; shakes: number; probability: number; ball: BallType; duplicate: boolean } | null;
    // Player state
    trainerName: string;
    trainerSprite: 'red' | 'leaf';
    trainerTag: string;
    money: number;
    tokens: number;
    party: PokemonInstance[];
    pcBox: PokemonInstance[];
    partyPresets: (string[] | null)[];
    activePartyPreset: number;
    selectPartyPreset: (index: number) => boolean;
    activePartyIndex: number;
    pokedexCaught: number[];
    pokedexSeen: number[];
    pokedexReviewed: number[];
    teamReviewedUids: string[];
    dexNotifiedSpecies: number[];
    markCollectionVisited: (tab: 'team' | 'pokedex') => void;
    reviewPokedexEntry: (id: number) => void;
    movePcPokemon: (uid: string, beforeUid: string) => boolean;
    // Chapter & Route & Timeline
    currentChapterId: string;
    chapterRun: ChapterRun | null;
    completedChapters: string[];
    pendingAdventureGift: AdventureGift | null;
    chooseAdventureGift: (choice: string | number) => void;
    finishStaticEncounter: () => boolean;
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
        nanab: number; // Seconds
        pinap: number; // Seconds
    };
    useBerry: (berryType: 'razz' | 'nanab' | 'pinap' | 'goldenRazz') => void;
    autoCatch: boolean;
    gameSpeed: number; // 1, 2, 3
    // Current Node State
    nodeType: StepNodeType;
    isCatchable: boolean;
    activeTrainer: ActiveTrainerState | null;
    bossIntroActive: boolean;
    trainerPresentation: { key: number; speed: number; kind: 'trainer' | 'gym'; stage: 'intro' | 'sendout'; sendAlly: boolean; enterTrainer?: boolean } | null;
    finishTrainerIntro: (key: number) => void;
    finishTrainerPresentation: (key: number) => void;
    allyRecalling: boolean;
    allySendingOut: boolean;
    enemyRecalling: boolean;
    newCatchCard: {
        source?: 'gift';
        speciesId: number;
        level: number;
        isShiny: boolean;
        isNew: boolean;
        destination: 'party' | 'pc';
    } | null;
    dismissNewCatchCard: () => void;
    chapterCompleteBanner: string | null;
    mysteryReward: MysteryReward | null;
    activeDrop: ActiveDrop | null;
    healPulse: boolean;
    healPresentation: {
        key: number;
        speed: number;
        initialHp: Record<string, number>;
    } | null;
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
    topToastBanner: {
        text: string;
        iconSpeciesId?: number;
    } | null;
    sidebarExpPopup: string | null;
    sidebarExpPopups: Record<string, {
        amount: number;
        active: boolean;
    }> | null;
    duplicatePopup: {
        text: string;
        amount: number;
        speciesId: number;
    } | null;
    isCatchSequenceActive: boolean;
    catchPhase: 'none' | 'enter' | 'throw' | 'absorb' | 'land' | 'reward';
    trainerOnField: boolean;
    capturePresentation: {
        key: number;
        speed: number;
        success: boolean;
        duplicate: boolean;
        ball: BallType;
        shakes: number;
    } | null;
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
    tickBerryBuffs: (seconds?: number) => void;
    catchEnemy: () => void;
    saveGame: (silent?: boolean) => void;
    loadGame: (options?: { deferEncounter?: boolean }) => void;
}
