import { create } from 'zustand';
import { PokemonInstance } from '../types/game';
import { ALL_CHAPTERS, DEFAULT_CHAPTER } from '../data/chaptersData';
import { currentChapter, currentNode, chapterCompleted } from '../game/data/chapterSelectors';
import { restoreChapterRun } from '../game/data/chapterGenerator';
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
            starterChosen: false,
            chapterRun: null,
            completedChapters: [],
            pendingAdventureGift: null,
            resolvedNode: null,
            awardedEnemyUids: [],
            items: {},
            gifts: [],
            captureRoll: null,
            chooseStarter: (id, profile) => {
                if (get().starterChosen || ![1, 4, 7, 25].includes(id)) return;
                const mon = createInstance(id, 5);
                set({ starterChosen: true, party: [mon], pcBox: [], pokedexCaught: [id], pokedexSeen: [id], currentStep: 1,
                    ...(profile ? {trainerName:profile.name.trim().slice(0,10)||'Red',trainerSprite:profile.sprite==='leaf'?'leaf':'red'} : {}) });
                get().loadStepNode(1);
                get().saveGame(true);
            },
            ...createBattleActions(context), ...createCaptureActions(context), ...createRewardActions(context), ...createEncounterActions(context),
            // Player state matches gameplay video
            trainerName: 'Ray',
            trainerSprite: 'red',
            trainerTag: '#0910',
            money: 3000,
            tokens: 0,
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
            selectedBall: 'pokeball',
            balls: {
                pokeball: 0,
                greatball: 0,
                ultraball: 0,
                masterball: 0,
            },
            // Fresh saves do not inherit demo inventory or active boosts.
            berries: {
                razz: 0,
                nanab: 0,
                pinap: 0,
                goldenRazz: 0,
            },
            berryBuffs: {
                greatBall: 0,
                nanab: 0,
                ultraBall: 0,
                pinap: 0,
            },
            autoCatch: true,
            gameSpeed: 1,
            nodeType: 'grass',
            isCatchable: true,
            activeTrainer: null,
            bossIntroActive: false,
            trainerPresentation: null,
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
            setGameSpeed: (speed) => { if ([1,2,3].includes(speed)) set({ gameSpeed: speed }); },
            setSelectedBall: (ball) => set({ selectedBall: ball }),
            toggleAutoCatch: () => set((s) => ({ autoCatch: !s.autoCatch })),
            markCollectionVisited: (tab) => {
                const state = get();
                if (tab === 'team') set({ teamReviewedUids: [...state.party, ...state.pcBox].map(mon => mon.uid) });
                else {
                    const reviewed = [...new Set(state.pokedexCaught)];
                    set({ dexNotifiedSpecies: reviewed, pokedexReviewed: reviewed });
                }
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
                  if (runtime.busy || get().trainerPresentation || get().isCatchSequenceActive || !get().party[idx]?.currentHp)
                    return;
                set({ activePartyIndex: idx });
            },
            movePartyMember: (uid, direction) => {
                const s = get();
                  if (runtime.busy || s.trainerPresentation || s.healPulse || s.isCatchSequenceActive || s.playerAttacking || s.enemyAttacking)
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
                        battleLog: `Ate Razz Berry! Catch chance +25% for 30m!`,
                    });
                }
                else if (berryType === 'goldenRazz') {
                    const cur = berryBuffs.ultraBall || 0;
                    const next = Math.min(MAX_BUFF, cur + ADD_BUFF);
                    set({
                        berries: { ...berries, goldenRazz: berries.goldenRazz - 1 },
                        berryBuffs: { ...berryBuffs, ultraBall: next },
                        battleLog: `Ate Golden Razz Berry! Catch chance +50% for 30m!`,
                    });
                }
                else if (berryType === 'nanab') {
                    const cur = berryBuffs.nanab || 0;
                    const next = Math.min(MAX_BUFF, cur + ADD_BUFF);
                    set({
                        berries: { ...berries, nanab: berries.nanab - 1 },
                        berryBuffs: { ...berryBuffs, nanab: next },
                        battleLog: `Ate Nanab Berry! Rare encounter boost ×2 for 30m!`,
                    });
                }
                else if (berryType === 'pinap') {
                    const cur = berryBuffs.pinap || 0;
                    const next = Math.min(MAX_BUFF, cur + ADD_BUFF);
                    set({
                        berries: { ...berries, pinap: berries.pinap - 1 },
                        berryBuffs: { ...berryBuffs, pinap: next },
                        battleLog: `Ate Pinap Berry! Battle XP +25% for 30m!`,
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
                        starterChosen: state.starterChosen,
                        resolvedNode: state.resolvedNode,
                        chapterRun: state.chapterRun,
                        completedChapters: state.completedChapters,
                        items: state.items,
                        gifts: state.gifts,
                        encounterCheckpoint: state.enemy && !state.resolvedNode ? { chapterId: state.currentChapterId, step: state.currentStep, source:currentNode(state).source, enemy: state.enemy, trainer: state.activeTrainer, enemyStatus: state.enemyStatus, awarded: state.awardedEnemyUids, captureRoll: state.captureRoll } : null,
                        savedAt: Date.now(),
                        trainerName: state.trainerName,
                        trainerSprite: state.trainerSprite,
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
            loadGame: (options) => {
                let restoredActivePartyIndex: number | null = null;
                let checkpoint: any = null;
                let terminal: GameState['resolvedNode'] = null;
                try {
                    const saved = localStorage.getItem('pokecatch_save_v1');
                    if (saved) {
                        const obj = JSON.parse(saved);
                        if (!obj || typeof obj !== 'object' || Array.isArray(obj))
                            throw new Error('Invalid save');
                        set({ starterChosen: obj.starterChosen !== false });
                        checkpoint = obj.encounterCheckpoint;
                        const savedChapter = ALL_CHAPTERS.find((chapter) => chapter.id === obj.currentChapterId);
                        const restoredRun = restoreChapterRun(obj.chapterRun, savedChapter?.id || DEFAULT_CHAPTER.id);
                        let chapter = currentChapter({currentChapterId:savedChapter?.id || DEFAULT_CHAPTER.id,chapterRun:restoredRun});
                        const savedStep = Number.isFinite(Number(obj.currentStep)) ? Math.floor(Number(obj.currentStep)) : 1;
                        let currentStep = Math.max(1, Math.min(chapter.totalSteps, savedStep));
                        const resolved = obj.resolvedNode;
                        if (resolved?.chapterId === chapter.id && resolved.step === currentStep) {
                            if (currentStep >= chapter.totalSteps && chapterCompleted(chapter, {badges:obj.badges,completedChapters:obj.completedChapters})) {
                                const next=ALL_CHAPTERS.find(value => value.chapterNumber === chapter.chapterNumber + 1 && !value.isSpecial);
                                if(next){chapter=next;currentStep=1;}else terminal=resolved;
                            } else currentStep = currentStep >= chapter.totalSteps ? 1 : currentStep + 1;
                        }
                        // Question nodes grant their reward on entry. Resume after them so loading
                        // a save cannot roll and award the same item a second time.
                        if (!(resolved?.chapterId === chapter.id && resolved.step === savedStep) && chapter.steps[currentStep - 1]?.type === 'question') {
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
                                trainerSprite: obj.trainerSprite === 'leaf' ? 'leaf' : 'red',
                                trainerTag: typeof obj.trainerTag === 'string' ? obj.trainerTag : get().trainerTag,
                                items: obj.items && typeof obj.items === 'object' && !Array.isArray(obj.items) ? Object.fromEntries(Object.entries(obj.items).filter(([key, value]) => /^[a-z0-9-]+$/.test(key) && Number.isFinite(value) && Number(value) >= 0).map(([key, value]) => [key, Math.floor(Number(value))])) : {},
                                gifts: Array.isArray(obj.gifts) ? obj.gifts.filter(value => typeof value === 'string') : [],
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
                                chapterRun: restoredRun?.chapterId===chapter.id?restoredRun:null,
                                completedChapters: Array.isArray(obj.completedChapters) ? obj.completedChapters.filter(id=>ALL_CHAPTERS.some(c=>c.id===id&&c.runtimeSupported)) : [],
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
                // Title can inspect the saved profile without starting FX, rewards or timers.
                // Continue reloads the untouched payload and restores its encounter once.
                if (options?.deferEncounter) return;
                // Initialize the route on a fresh install too. Without this, the placeholder
                // enemy remains on screen and no encounter is actually active.
                if(terminal){runtime.beginEncounter();runtime.setPhase('awaiting-continue');set({enemy:null,activeTrainer:null,trainerPresentation:null,resolvedNode:terminal,nodeType:'badge',isBattling:false,battleLog:'You are the Kanto Pokémon League Champion!'});}
                else if (get().starterChosen) get().loadStepNode(get().currentStep);
                const matchingSource=checkpoint&&((!checkpoint.source&&get().currentChapterId==='kanto-1')||JSON.stringify(checkpoint.source)===JSON.stringify(currentNode(get()).source));
                if (!terminal && matchingSource && checkpoint?.chapterId === get().currentChapterId && checkpoint.step === get().currentStep && isValidSavedPokemon(checkpoint.enemy)) {
                    const trainer = checkpoint.trainer;
                    const validTrainer = trainer && typeof trainer.name === 'string' && typeof trainer.rewardMoney === 'number' && trainer.rewardMoney >= 0 && Array.isArray(trainer.team) && trainer.team.length > 0 && trainer.team.length <= 6 && trainer.team.every(mon => Number.isInteger(mon.speciesId) && mon.speciesId >= 1 && mon.speciesId <= 151 && Number.isInteger(mon.level) && mon.level >= 1 && mon.level <= 100) && Number.isInteger(trainer.currentMonIndex) && trainer.currentMonIndex >= 0 && trainer.currentMonIndex < trainer.team.length;
                    if (get().nodeType === 'grass' || validTrainer) {
                        const roll = checkpoint.captureRoll;
                        const validRoll = roll?.enemyUid === checkpoint.enemy.uid && typeof roll.success === 'boolean' && Number.isFinite(roll.probability) && roll.probability >= 0 && roll.probability <= 1 && Number.isInteger(roll.shakes) && roll.shakes >= 0 && roll.shakes <= 4 && ['pokeball','greatball','ultraball','masterball'].includes(roll.ball);
                        set({ enemy: checkpoint.enemy, activeTrainer: validTrainer ? trainer : null, bossIntroActive: false, trainerPresentation: null, enemyStatus: checkpoint.enemyStatus === 'SLP' ? 'SLP' : null, awardedEnemyUids: Array.isArray(checkpoint.awarded) ? checkpoint.awarded.filter(uid => typeof uid === 'string') : [], captureRoll: validRoll ? roll : null });
                        runtime.cancelTag('trainer-presentation');runtime.busy=false;runtime.setPhase('battle');
                        if (validRoll) get().catchEnemy();
                    }
                }
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
