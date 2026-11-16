import { getPokemonSpecies } from '../../data/pokemonData';
import { ALL_CHAPTERS, DEFAULT_CHAPTER } from '../../data/chaptersData';
import { bestPartyIndexForEnemy } from '../domain/battle';
import { currentChapter, currentNode, nodePool, encounterContext, chapterCompleted, chapterUnlocked } from '../data/chapterSelectors';
import { defaultChapterRun, weightedPick, evolutionChain, stageDistribution } from '../data/chapterGenerator';
import type { AdventureGift } from '../../types/game';
import { familyRoot, referenceLevel } from '../domain/chapterOne';
import { applyExpToParty } from '../domain/battle';
import type { GameState } from '../domain/GameState';
import type { SystemContext } from './context';
import { gameplaySpeed } from '../domain/presentationTiming';
import { kantoTrainerPayout } from '../domain/kantoRewards';
export function createEncounterActions(context: SystemContext): Pick<GameState, 'selectChapter' | 'loadStepNode' | 'advanceStep' | 'skipHeal' | 'finishHealPresentation' | 'finishTrainerIntro' | 'finishTrainerPresentation' | 'chooseAdventureGift' | 'finishStaticEncounter'> {
    const { set, get, runtime, createInstance } = context;
    const scheduleNodeTimeout = runtime.schedule.bind(runtime);
    const lockTurnFor = runtime.lockFor.bind(runtime);
    const showGift = (gift: AdventureGift) => {
        runtime.setPhase('awaiting-continue');
        set({ nodeType:'gift',pendingAdventureGift:gift,enemy:null,isCatchable:false,battleLog:gift.text });
    };
    return {
        chooseAdventureGift: (choice) => {
            const gift=get().pendingAdventureGift;
            if(!gift || !gift.trade && get().gifts.includes(gift.key)) return;
            const species=typeof choice==='number'?choice:null;
            if(species!==null ? !gift.choices?.includes(species) : !gift.items?.includes(String(choice))) return;
            const cost=species!==null?gift.trade?.[species]:undefined;
            if(cost && !(get().items[cost]>0)) return;
            runtime.commitReward('story-gift:'+gift.key,()=>{
                const mon=species!==null?createInstance(species,gift.level||5):null;
                const duplicate=mon&&[...get().party,...get().pcBox].some(m=>m.speciesId===mon.speciesId&&m.isShiny===mon.isShiny);
                const members=mon?[...get().party,...get().pcBox].filter(m=>familyRoot(m.speciesId)===familyRoot(mon.speciesId)&&m.level<100):[];
                const feed=(m:typeof mon)=>duplicate&&members.some(member=>member.uid===m.uid)?applyExpToParty([m],-1,Math.round(referenceLevel(m.level).candyXp/members.length)).party[0]:m;
                set(state=>({
                    pendingAdventureGift:null,gifts:gift.trade?state.gifts:[...new Set([...state.gifts,gift.key])],
                    items:{...state.items,...(cost?{[cost]:state.items[cost]-1}:{}),...(species===null?{[String(choice)]:(state.items[String(choice)]||0)+1}:{})},
                    party:duplicate?state.party.map(feed):mon&&state.party.length<6?[...state.party,mon]:state.party,
                    pcBox:duplicate?state.pcBox.map(feed):mon&&state.party.length>=6?[...state.pcBox,mon]:state.pcBox,
                    newCatchCard:mon&&!duplicate&&!state.pokedexCaught.includes(mon.speciesId)?{speciesId:mon.speciesId,level:mon.level,isShiny:false,isNew:true,destination:state.party.length<6?'party':'pc'}:null,
                    pokedexCaught:species!==null?[...new Set([...state.pokedexCaught,species])]:state.pokedexCaught,
                    pokedexSeen:species!==null?[...new Set([...state.pokedexSeen,species])]:state.pokedexSeen,
                    resolvedNode:{chapterId:state.currentChapterId,step:state.currentStep},
                }));
                get().saveGame(true);
            });
            if(get().newCatchCard)runtime.setPhase('awaiting-continue');else get().advanceStep();
        },
        finishStaticEncounter: () => {
            const node=currentNode(get()),story=node.static;
            if(!story?.spirit) return false;
            if(story.once) set(state=>({gifts:[...new Set([...state.gifts,story.once!])]}));
            if(story.reward && !get().gifts.includes(story.reward.key)) showGift(story.reward);
            else get().advanceStep();
            get().saveGame(true);return true;
        },
        finishTrainerIntro: (key) => {
            const request=get().trainerPresentation;
            if (!request || request.key !== key || request.stage !== 'intro') return;
            set({ bossIntroActive:false,trainerPresentation:{...request,speed:gameplaySpeed(get().gameSpeed),stage:'sendout'} });
        },
        finishTrainerPresentation: (key) => {
            const request=get().trainerPresentation;
            if (!request || request.key !== key) return;
            runtime.cancelTag('trainer-presentation');
            set({ bossIntroActive:false,trainerPresentation:null });
            runtime.setPhase('battle');runtime.lockFor(325/gameplaySpeed(get().gameSpeed));
        },
        selectChapter: (chapterId: string) => {
            if (!chapterUnlocked(chapterId,get())) return;
            runtime.beginEncounter();
            const run={...defaultChapterRun(chapterId),seed:Math.floor(runtime.random()*4294967296),gifts:[...get().gifts,'starter'],items:{...get().items}};
            set({
                chapterRun:run,
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
            set({ currentStep: stepNumber, resolvedNode: null, awardedEnemyUids: [], captureRoll: null });
            const chapter = currentChapter(get());
            const steps = chapter.steps;
            const node = steps.find((s) => s.step === stepNumber);
            if (!node) throw Error(`Invalid node ${stepNumber} in ${currentChapterId}`);
            set({
                activeDrop: null,
                pendingAdventureGift:null,
                mysteryReward: null,
                activeTrainer: null,
                bossIntroActive: false,
                trainerPresentation: null,
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
                const env=encounterContext(get(),runtime.now());
                const pool=nodePool(node,currentChapterId,env.phase,env.weather,get().berryBuffs.nanab>0?2:1).filter(entry=>entry.on);
                const selected=weightedPick(pool,runtime.random);
                const encounterLevel=selected.min+Math.floor(runtime.random()*(selected.max-selected.min+1));
                const speciesId=node.static?selected.id:weightedPick(stageDistribution(evolutionChain(selected.id,encounterLevel)),runtime.random).id;
                const status: 'SLP' | null = null;
                const enemyMon=createInstance(speciesId,encounterLevel,runtime.random()<1/4096);
                if(node.static?.once && get().gifts.includes(node.static.once)){
                    if(node.static.reward&&!get().gifts.includes(node.static.reward.key))showGift(node.static.reward);
                    else get().advanceStep();return;
                }
                const enemySpecies = getPokemonSpecies(speciesId);
                set({
                    nodeType: 'grass',
                    isCatchable: !node.static?.spirit,
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
            if (node.type==='gift' && node.gift) {
                if(!node.gift.trade&&get().gifts.includes(node.gift.key)){get().advanceStep();return;}
                showGift(node.gift);return;
            }
            if(node.unlock){
                set(state=>({gifts:[...new Set([...state.gifts,node.unlock!])],resolvedNode:{chapterId:state.currentChapterId,step:state.currentStep}}));
                get().saveGame(true);get().advanceStep();return;
            }
            // 2. POKÉMON CENTER HEAL NODE
            if (node.type === 'center') {
                runtime.setPhase('heal');
                const healKey = runtime.nextId();
                const speed = gameplaySpeed(get().gameSpeed);
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
                if (node.reward?.once && get().gifts.includes(node.reward.once)) { get().advanceStep(); return; }
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
                runtime.busy=true;
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
                        rewardMoney: kantoTrainerPayout(t.rewardMoney,chapter.chapterNumber,false,false,get().completedChapters.includes('kanto-14')),
                        power:t.power,league:t.league,
                    },
                    activePartyIndex: bestPartyIndexForEnemy(get().party, get().activePartyIndex, firstEnemy),
                    bossIntroActive: true,
                    trainerPresentation: { key:runtime.nextId(),speed:gameplaySpeed(get().gameSpeed),kind:'trainer',stage:'intro',sendAlly:true,enterTrainer:true },
                    enemy: firstEnemy,
                    battleLog: `${t.name} wants to battle! ${t.name} sends out ${enemySpecies.name}!`,
                });
                const trainerKey=get().trainerPresentation!.key;
                scheduleNodeTimeout(() => get().finishTrainerPresentation(trainerKey),20000,'trainer-presentation');
                return;
            }
            // 5. GYM LEADER BATTLE (BADGE NODE)
            if (node.type === 'badge' && node.trainer) {
                runtime.setPhase('intro');
                runtime.busy=true;
                const t = node.trainer;
                const firstMonData = t.team[0];
                const bossEnemy = createInstance(firstMonData.speciesId, firstMonData.level, false);
                const hpMultiplier = 1.3 * (t.power ?? 1) * Math.pow(Math.max(1, 6 / t.team.length), .7);
                bossEnemy.maxHp = bossEnemy.currentHp = Math.floor(bossEnemy.maxHp * hpMultiplier);
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
                        rewardMoney: kantoTrainerPayout(t.rewardMoney,chapter.chapterNumber,true,chapterCompleted(chapter,get()),get().completedChapters.includes('kanto-14')),
                        power:t.power,league:t.league,
                    },
                    bossIntroActive: true,
                    trainerPresentation: { key:runtime.nextId(),speed:gameplaySpeed(get().gameSpeed),kind:'gym',stage:'intro',sendAlly:true,enterTrainer:true },
                    chapterCompleteBanner: null,
                    activePartyIndex: bestPartyIndexForEnemy(get().party, get().activePartyIndex, bossEnemy),
                    enemy: bossEnemy,
                    battleLog: `${t.name} challenged you! ${t.name} sends out ${enemySpecies.name}!`,
                });
                const gymKey=get().trainerPresentation!.key;
                scheduleNodeTimeout(() => get().finishTrainerPresentation(gymKey),20000,'trainer-presentation');
                return;
            }
        },
        advanceStep: () => {
            const { currentChapterId, currentStep } = get();
            const chapter = currentChapter(get());
            const total = chapter.totalSteps;
            if (currentStep >= total && chapterCompleted(chapter,get())) {
                const next = ALL_CHAPTERS.find(value => value.chapterNumber === chapter.chapterNumber + 1 && !value.isSpecial);
                if (next) { get().selectChapter(next.id); get().saveGame(true); return; }
                set({isBattling:false,battleLog:'You are the Kanto Pokémon League Champion!'});get().saveGame(true);return;
            }
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
                party: state.party.map((mon) => ({ ...mon, currentHp: mon.maxHp, status: undefined, sleepTurns: undefined, confusedTurns: undefined })),
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
