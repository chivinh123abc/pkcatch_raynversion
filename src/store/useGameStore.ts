import { create } from 'zustand';
import { PokemonInstance } from '../types/game';
import { ALL_CHAPTERS, DEFAULT_CHAPTER } from '../data/chaptersData';
import { GameplayRuntime, RuntimeDependencies } from '../game/runtime/GameplayRuntime';
import type { GameState } from '../game/domain/GameState';
import { createPokemonInstance } from '../game/domain/pokemon';
import { createBattleActions } from '../game/systems/battle';
import { createCaptureActions } from '../game/systems/capture';
import { createRewardActions } from '../game/systems/rewards';
import { createEncounterActions } from '../game/systems/encounter';
export type { ActiveTrainerState, DamagePopupItem, GameState } from '../game/domain/GameState';
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
    if (!saved || typeof saved !== 'object')
        return restored;
    for (const key of Object.keys(defaults)) {
        const value = saved[key];
        if (Number.isFinite(value) && value >= 0)
            restored[key as keyof T] = Math.min(max, Math.floor(value)) as T[keyof T];
    }
    return restored;
}
function restoreDex(saved: unknown, fallback: number[]): number[] {
    return Array.isArray(saved) ? [...new Set(saved.filter((id) => Number.isInteger(id) && id >= 1 && id <= 151))] : fallback;
}
export function createGameStore(dependencies: RuntimeDependencies = {}) {
    const runtime = new GameplayRuntime(dependencies);
    const createInstance = (id: number, level: number, shiny = false) => createPokemonInstance(id, level, shiny, runtime);
    const store = create<GameState>((set, get) => {
        const context = { set, get, runtime, createInstance };
        return {
            encounter: runtime.snapshot(),
            ...createBattleActions(context), ...createCaptureActions(context), ...createRewardActions(context), ...createEncounterActions(context),
            // Player state matches gameplay video
            trainerName: 'Ray',
            trainerTag: '#0910',
            money: 30808,
            tokens: 3017,
            // Starter party: Charmander Lv. 5 only
            party: [
                createInstance(4, 5), // Charmander Lv. 5
            ],
            pcBox: [],
            partyPresets: [null, null, null, null, null],
            activePartyPreset: 0,
            activePartyIndex: 0,
            pokedexCaught: [4],
            pokedexSeen: [4],
            pokedexReviewed: [],
            teamReviewedUids: [],
            dexNotifiedSpecies: [],
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
                nanab: 3305, // 55m 05s
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
            markCollectionVisited: (tab) => {
                const state = get();
                if (tab === 'team') set({ teamReviewedUids: [...state.party, ...state.pcBox].map(mon => mon.uid) });
                else set({ dexNotifiedSpecies: [...new Set(state.pokedexCaught)] });
                get().saveGame(true);
            },
            reviewPokedexEntry: (id) => {
                const state = get();
                if (!state.pokedexCaught.includes(id) || state.pokedexReviewed.includes(id))
                    return;
                set({ pokedexReviewed: [...state.pokedexReviewed, id] });
                get().saveGame(true);
            },
            movePcPokemon: (uid, beforeUid) => {
                const state = get();
                if (runtime.busy || state.healPulse || state.isCatchSequenceActive || state.playerAttacking || state.enemyAttacking)
                    return false;
                const mon = state.pcBox.find(mon => mon.uid === uid);
                if (!mon || uid === beforeUid || !state.pcBox.some(mon => mon.uid === beforeUid))
                    return false;
                const pcBox = state.pcBox.filter(mon => mon.uid !== uid);
                pcBox.splice(pcBox.findIndex(mon => mon.uid === beforeUid), 0, mon);
                set({ pcBox });
                get().saveGame(true);
                return true;
            },
            selectPartyPreset: (index) => {
                const state = get();
                if (!Number.isInteger(index) || index < 0 || index >= 5 || runtime.busy || state.healPulse || state.isCatchSequenceActive || state.playerAttacking || state.enemyAttacking || state.newCatchCard)
                    return false;
                const owned = [...state.party, ...state.pcBox];
                const byUid = new Map(owned.map(mon => [mon.uid, mon]));
                if (byUid.size !== owned.length)
                    return false;
                const presets = Array.from({ length: 5 }, (_, i) => state.partyPresets[i] ? [...state.partyPresets[i]!] : null);
                presets[state.activePartyPreset] = state.party.map(mon => mon.uid);
                // New presets start with the current team: the battle engine requires a healthy member.
                const ids = [...new Set(presets[index] || state.party.map(mon => mon.uid))].filter(uid => byUid.has(uid)).slice(0, 6);
                const party = ids.map(uid => byUid.get(uid)!);
                if (!party.some(mon => mon.currentHp > 0))
                    return false;
                presets[index] = ids;
                const activeUid = state.party[state.activePartyIndex]?.uid;
                const activeIndex = party.findIndex(mon => mon.uid === activeUid && mon.currentHp > 0);
                set({ party, pcBox: owned.filter(mon => !ids.includes(mon.uid)), partyPresets: presets, activePartyPreset: index, activePartyIndex: activeIndex >= 0 ? activeIndex : party.findIndex(mon => mon.currentHp > 0) });
                get().saveGame(true);
                return true;
            },
            setActivePartyIndex: (idx) => {
                if (runtime.busy || get().isCatchSequenceActive || !get().party[idx]?.currentHp)
                    return;
                set({ activePartyIndex: idx });
            },
            movePartyMember: (uid, direction) => {
                const s = get();
                if (runtime.busy || s.healPulse || s.isCatchSequenceActive || s.playerAttacking || s.enemyAttacking)
                    return false;
                const index = s.party.findIndex((mon) => mon.uid === uid);
                const next = index + direction;
                if (index < 0 || next < 0 || next >= s.party.length)
                    return false;
                const activeUid = s.party[s.activePartyIndex]?.uid;
                const party = [...s.party];
                [party[index], party[next]] = [party[next], party[index]];
                set({ party, activePartyIndex: Math.max(0, party.findIndex((mon) => mon.uid === activeUid)) });
                get().saveGame(true);
                return true;
            },
            depositPokemon: (uid) => {
                const s = get();
                if (runtime.busy || s.healPulse || s.isCatchSequenceActive || s.playerAttacking || s.enemyAttacking)
                    return false;
                const mon = s.party.find((p) => p.uid === uid);
                const party = s.party.filter((p) => p.uid !== uid);
                if (!mon || !party.some((p) => p.currentHp > 0))
                    return false;
                const activeUid = s.party[s.activePartyIndex]?.uid;
                const activeIndex = party.findIndex((p) => p.uid === activeUid);
                set({ party, pcBox: [...s.pcBox, mon], activePartyIndex: activeIndex >= 0 ? activeIndex : party.findIndex((p) => p.currentHp > 0) });
                get().saveGame(true);
                return true;
            },
            withdrawPokemon: (uid, replaceUid) => {
                const s = get();
                if (runtime.busy || s.healPulse || s.isCatchSequenceActive || s.playerAttacking || s.enemyAttacking)
                    return false;
                const mon = s.pcBox.find((p) => p.uid === uid);
                if (!mon)
                    return false;
                const index = s.party.findIndex((p) => p.uid === replaceUid);
                if (s.party.length >= 6 && index < 0)
                    return false;
                const party = [...s.party];
                const pcBox = s.pcBox.filter((p) => p.uid !== uid);
                if (index >= 0) {
                    pcBox.push(party[index]);
                    party[index] = mon;
                }
                else
                    party.push(mon);
                if (!party.some((p) => p.currentHp > 0))
                    return false;
                set({ party, pcBox, activePartyIndex: party[s.activePartyIndex]?.currentHp > 0 ? s.activePartyIndex : party.findIndex((p) => p.currentHp > 0) });
                get().saveGame(true);
                return true;
            },
            openAdventureModal: () => set({ isAdventureModalOpen: true }),
            closeAdventureModal: () => set({ isAdventureModalOpen: false }),
            tickBerryBuffs: (seconds = 1) => {
                const elapsed = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
                set((s) => ({
                    berryBuffs: {
                        greatBall: Math.max(0, s.berryBuffs.greatBall - elapsed),
                        ultraBall: Math.max(0, s.berryBuffs.ultraBall - elapsed),
                        nanab: Math.max(0, s.berryBuffs.nanab - elapsed),
                        pinap: Math.max(0, s.berryBuffs.pinap - elapsed),
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
                }
                else if (berryType === 'goldenRazz') {
                    const cur = berryBuffs.ultraBall || 0;
                    const next = Math.min(MAX_BUFF, cur + ADD_BUFF);
                    set({
                        berries: { ...berries, goldenRazz: berries.goldenRazz - 1 },
                        berryBuffs: { ...berryBuffs, ultraBall: next },
                        battleLog: `Ate Golden Razz Berry! Poké Balls upgraded to Ultra Balls (+30m)!`,
                    });
                }
                else if (berryType === 'nanab') {
                    const cur = berryBuffs.nanab || 0;
                    const next = Math.min(MAX_BUFF, cur + ADD_BUFF);
                    set({
                        berries: { ...berries, nanab: berries.nanab - 1 },
                        berryBuffs: { ...berryBuffs, nanab: next },
                        battleLog: `Ate Nanab Berry! Wild Pokémon pacified (+catch rate) for +30m!`,
                    });
                }
                else if (berryType === 'pinap') {
                    const cur = berryBuffs.pinap || 0;
                    const next = Math.min(MAX_BUFF, cur + ADD_BUFF);
                    set({
                        berries: { ...berries, pinap: berries.pinap - 1 },
                        berryBuffs: { ...berryBuffs, pinap: next },
                        battleLog: `Ate Pinap Berry! Double Rewards boost active for +30m!`,
                    });
                }
            },
            /**
             * Wild Pokémon Capture & Duplicate EXP Animation Sequence (Identical to Gameplay Video)
             */
            saveGame: (silent = false) => {
                try {
                    const state = get();
                    const saveObj = {
                        version: 2,
                        saveVersion: 4,
                        savedAt: Date.now(),
                        trainerName: state.trainerName,
                        trainerTag: state.trainerTag,
                        money: state.money,
                        tokens: state.tokens,
                        party: state.party,
                        pcBox: state.pcBox,
                        partyPresets: Array.from({ length: 5 }, (_, index) => index === state.activePartyPreset ? state.party.map(mon => mon.uid) : state.partyPresets[index] || null),
                        activePartyPreset: state.activePartyPreset,
                        activePartyIndex: state.activePartyIndex,
                        pokedexCaught: state.pokedexCaught,
                        pokedexSeen: state.pokedexSeen,
                        pokedexReviewed: state.pokedexReviewed,
                        teamReviewedUids: state.teamReviewedUids,
                        dexNotifiedSpecies: state.dexNotifiedSpecies,
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
                    if (!silent)
                        set({ battleLog: '💾 Game state saved successfully!' });
                }
                catch (e) {
                    if (!silent)
                        set({ battleLog: 'Unable to save. Check browser storage space and permissions.' });
                    console.error(e);
                }
            },
            loadGame: () => {
                let restoredActivePartyIndex: number | null = null;
                try {
                    const saved = localStorage.getItem('pokecatch_save_v1');
                    if (saved) {
                        const obj = JSON.parse(saved);
                        if (!obj || typeof obj !== 'object' || Array.isArray(obj))
                            throw new Error('Invalid save');
                        const savedChapter = ALL_CHAPTERS.find((chapter) => chapter.id === obj.currentChapterId);
                        const chapter = savedChapter || DEFAULT_CHAPTER;
                        const savedStep = Number.isFinite(Number(obj.currentStep)) ? Math.floor(Number(obj.currentStep)) : 1;
                        let currentStep = Math.max(1, Math.min(chapter.totalSteps, savedStep));
                        // Question nodes grant their reward on entry. Resume after them so loading
                        // a save cannot roll and award the same item a second time.
                        if (chapter.steps[currentStep - 1]?.type === 'question') {
                            currentStep = currentStep >= chapter.totalSteps ? 1 : currentStep + 1;
                        }
                        const isOldDemoParty = obj.saveVersion !== 3 &&
                            obj.saveVersion !== 4 &&
                            Array.isArray(obj.party) &&
                            obj.party.some((m: PokemonInstance) => m && m.level >= 80);
                        const isResetToCharmander = obj.saveVersion === 3;
                        if (isResetToCharmander) {
                            set({
                                party: [createInstance(4, 5)],
                                pcBox: [],
                                activePartyIndex: 0,
                                pokedexCaught: [4],
                                pokedexSeen: [4],
                                currentChapterId: DEFAULT_CHAPTER.id,
                                currentStep: 1,
                                badges: [],
                            });
                            get().saveGame(true);
                        }
                        else {
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
                                pokedexReviewed: restoreDex(obj.pokedexReviewed, []),
                                teamReviewedUids: Array.isArray(obj.teamReviewedUids)
                                    ? obj.teamReviewedUids.filter(uid => typeof uid === 'string')
                                    : [...(Array.isArray(obj.party) ? obj.party : []), ...(Array.isArray(obj.pcBox) ? obj.pcBox : [])].filter(isValidSavedPokemon).map(mon => mon.uid),
                                dexNotifiedSpecies: restoreDex(obj.dexNotifiedSpecies, restoreDex(obj.pokedexCaught, get().pokedexCaught)),
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
                            const ownedIds = new Set([...party, ...get().pcBox].map(mon => mon.uid));
                            const presets: (string[] | null)[] = Array.from({ length: 5 }, (_, index) => Array.isArray(obj.partyPresets?.[index]) ? [...new Set<string>(obj.partyPresets[index].filter((uid: unknown) => typeof uid === 'string' && ownedIds.has(uid)))].slice(0, 6) : null);
                            const presetIndex = Number.isInteger(obj.activePartyPreset) && obj.activePartyPreset >= 0 && obj.activePartyPreset < 5 ? obj.activePartyPreset : 0;
                            presets[presetIndex] = party.map(mon => mon.uid);
                            set({ partyPresets: presets, activePartyPreset: presetIndex });
                            restoredActivePartyIndex = Number.isInteger(obj.activePartyIndex) && party[obj.activePartyIndex] ? obj.activePartyIndex : 0;
                            set({ activePartyIndex: restoredActivePartyIndex });
                            if (isOldDemoParty) {
                                get().saveGame(true);
                            }
                        }
                    }
                }
                catch (e) {
                    console.error(e);
                }
                // Initialize the route on a fresh install too. Without this, the placeholder
                // enemy remains on screen and no encounter is actually active.
                get().loadStepNode(get().currentStep);
                if (restoredActivePartyIndex !== null) {
                    set({ activePartyIndex: restoredActivePartyIndex });
                }
            },
        };
    });
    runtime.subscribe(encounter => store.setState({ encounter }));
    return Object.assign(store, { runtime });
}
export const useGameStore = createGameStore();
