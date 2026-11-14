import { getPokemonSpecies } from '../../data/pokemonData';
import { ALL_CHAPTERS, DEFAULT_CHAPTER } from '../../data/chaptersData';
import { bestPartyIndexForEnemy } from '../domain/battle';
import type { GameState } from '../domain/GameState';
import type { SystemContext } from './context';
export function createEncounterActions(context: SystemContext): Pick<GameState, 'selectChapter' | 'loadStepNode' | 'advanceStep' | 'skipHeal' | 'finishHealPresentation'> {
    const { set, get, runtime, createInstance } = context;
    const scheduleNodeTimeout = runtime.schedule.bind(runtime);
    const lockTurnFor = runtime.lockFor.bind(runtime);
    return {
        selectChapter: (chapterId: string) => {
            runtime.beginEncounter();
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
        loadStepNode: (stepNumber: number) => {
            runtime.beginEncounter();
            const { currentChapterId } = get();
            const chapter = ALL_CHAPTERS.find((c) => c.id === currentChapterId) || DEFAULT_CHAPTER;
            const steps = chapter.steps;
            const node = steps.find((s) => s.step === stepNumber) || steps[0];
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
                        const pick = pool[Math.floor(runtime.random() * pool.length)];
                        speciesId = pick.id;
                        minLv = pick.min;
                        maxLv = pick.max;
                        // Sometimes enemy appears asleep (like frame 18-20s)
                        if (stepNumber === 2 || runtime.random() < 0.3) {
                            status = 'SLP';
                        }
                    }
                    else if (stepNumber <= 9) {
                        // Power Plant
                        const pool = [100, 101, 25, 81, 82];
                        speciesId = pool[Math.floor(runtime.random() * pool.length)];
                        minLv = 50;
                        maxLv = 55;
                    }
                    else if (stepNumber <= 16) {
                        // Seafoam Islands (Dewgong, Seel, Shellder, Cloyster)
                        const pool = [86, 87, 90, 91];
                        speciesId = pool[Math.floor(runtime.random() * pool.length)];
                        minLv = 55;
                        maxLv = 60;
                    }
                    else {
                        // Pokemon Mansion
                        const pool = [58, 77, 126, 37];
                        speciesId = pool[Math.floor(runtime.random() * pool.length)];
                        minLv = 56;
                        maxLv = 60;
                    }
                }
                else if (currentChapterId === 'special-mewtwo') {
                    const cavePool = [42, 42, 64, 64, 93, 93, 42, 64];
                    speciesId = cavePool[Math.floor(runtime.random() * cavePool.length)];
                    minLv = 65;
                    maxLv = 75;
                }
                else {
                    // Chapter 1 (Route 1 / Viridian Forest)
                    if (stepNumber <= 4) {
                        speciesId = runtime.random() < 0.55 ? 16 : 19;
                        minLv = 2;
                        maxLv = 5;
                    }
                    else if (stepNumber <= 8) {
                        const pool = [16, 19, 29, 32];
                        speciesId = pool[Math.floor(runtime.random() * pool.length)];
                        minLv = 4;
                        maxLv = 7;
                    }
                    else {
                        const pool = [10, 13, 11, 14, 25];
                        speciesId = pool[Math.floor(runtime.random() * pool.length)];
                        minLv = 6;
                        maxLv = 9;
                    }
                }
                const lvl = Math.floor(runtime.random() * (maxLv - minLv + 1)) + minLv;
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
                runtime.setPhase('heal');
                const healKey = runtime.nextId();
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
                scheduleNodeTimeout(() => get().finishHealPresentation(healKey), 30000 / speed, 'heal');
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
                runtime.setPhase('intro');
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
                scheduleNodeTimeout(() => { runtime.setPhase('battle'); set({ bossIntroActive: false }); }, 1500 / get().gameSpeed);
                return;
            }
            // 5. GYM LEADER BATTLE (BADGE NODE)
            if (node.type === 'badge' && node.trainer) {
                runtime.setPhase('intro');
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
                scheduleNodeTimeout(() => { runtime.setPhase('battle'); set({ bossIntroActive: false }); }, 2900);
                return;
            }
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
            if (heal)
                get().finishHealPresentation(heal.key);
        },
        finishHealPresentation: (key) => {
            if (get().nodeType !== 'center' || get().healPresentation?.key !== key)
                return;
            runtime.cancelTag('heal');
            runtime.setPhase('transition');
            const shouldReturnToStart = runtime.context.returnToStartAfterHeal;
            runtime.context.returnToStartAfterHeal = false;
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
            }
            else {
                get().advanceStep();
            }
        }
    };
}
