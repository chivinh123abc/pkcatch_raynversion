import { gameplaySpeed } from '../domain/presentationTiming';
import type { ActiveDrop, PokemonInstance } from '../../types/game';
import { getItemSpriteUrl, getPokemonSpecies } from '../../data/pokemonData';
import { ALL_CHAPTERS, DEFAULT_CHAPTER } from '../../data/chaptersData';
import { currentChapter, currentNode } from '../data/chapterSelectors';
import { applyExpToParty, calcBattleExp, gainExperience } from '../domain/battle';
import { buddyGoal, familyCandyExperience } from '../domain/buddy';
import { currentLevelCap } from '../domain/levelCap';
import { rollChapterLoot, kantoLeagueXp } from '../domain/kantoRewards';
import type { ActiveTrainerState } from '../domain/GameState';
import type { GameState } from '../domain/GameState';
import type { SystemContext } from './context';
export function grantKnockoutReward({ runtime, set, get }: SystemContext, enemy: PokemonInstance, isTrainer: boolean) {
    if (get().awardedEnemyUids.includes(enemy.uid)) return false;
    return runtime.commitReward('ko:' + enemy.uid, () => {
        const battleExp = calcBattleExp(enemy, isTrainer, get().berryBuffs.pinap > 0) * (get().activeTrainer?.league?kantoLeagueXp:1);
        set(state => {
            const cap=currentLevelCap(state);
            const result = applyExpToParty(state.party, state.activePartyIndex, battleExp, state.buddy.uid, cap);
            let party = result.party.map((mon, index) => index === state.activePartyIndex ? { ...mon, wins: (mon.wins || 0) + 1 } : mon);
            let pcBox = state.pcBox;
            const buddyMon = [...party, ...pcBox].find(mon => mon.uid === state.buddy.uid);
            let buddy = state.buddy;
            if (buddyMon) {
                const ko = buddy.ko + 1, bonus = ko >= buddyGoal(buddyMon);
                buddy = { uid: buddyMon.uid, ko: bonus ? 0 : ko };
                if (bonus && buddyMon.level < cap) {
                    const amount = familyCandyExperience(buddyMon.level);
                    const award = (mon: PokemonInstance) => mon.uid === buddyMon.uid ? gainExperience(mon, amount, cap) : mon;
                    party = party.map(award); pcBox = pcBox.map(award);
                    const gain = result.gains[buddyMon.uid];
                    result.gains[buddyMon.uid] = { amount: (gain?.amount || 0) + amount, active: !!gain?.active };
                    if (gain?.active) result.activeGain += amount;
                }
            }
            return { buddy, pcBox, awardedEnemyUids: [...state.awardedEnemyUids, enemy.uid], party, sidebarExpPopup: `+${result.activeGain.toLocaleString()} XP`, sidebarExpPopups: result.gains, battleLog: getPokemonSpecies(enemy.speciesId).name + ' fainted!' };
        });
        get().saveGame(true);
    });
}
export function grantTrainerReward({ runtime, set, get }: SystemContext, enemyUid: string, trainer: ActiveTrainerState) {
    return runtime.commitReward('trainer:' + enemyUid, () => {
        const chapter = currentChapter(get());
        const finished = get().nodeType === 'badge';
        const badge = finished && chapter.chapterNumber<=8 ? chapter.badgeSprite : null;
        set(state => ({
            resolvedNode: { chapterId: state.currentChapterId, step: state.currentStep },
            money: state.money + trainer.rewardMoney,
            badges: badge && !state.badges.includes(badge) ? [...state.badges, badge] : state.badges,
            completedChapters: finished ? [...new Set([...state.completedChapters,chapter.id])] : state.completedChapters,
            chapterCompleteBanner: finished ? chapter.badgeName : null,
            battleLog: 'Defeated ' + trainer.name + '! Received ₽' + trainer.rewardMoney.toLocaleString() + '!',
        }));
        get().saveGame(true);
    });
}
export function createRewardActions(context: SystemContext): Pick<GameState, 'triggerRandomGift' | 'finishItemDrop'> {
    const { set, get, runtime } = context;
    const scheduleNodeTimeout = runtime.schedule.bind(runtime);
    const lockTurnFor = runtime.lockFor.bind(runtime);
    return {
        triggerRandomGift: (customTitle?: string, xPos?: number) => {
            runtime.setPhase('item');
            const rewardId = 'item:' + runtime.nextId();
            let drop: ActiveDrop;
            const current = get();
            const fixed = currentNode(current).reward;
            if (fixed) {
                runtime.commitReward(rewardId, () => set(state => ({ items: { ...state.items, [fixed.item]: (state.items[fixed.item] || 0) + fixed.amount }, gifts: [...new Set([...state.gifts,...(fixed.once?[fixed.once]:[]),...(fixed.item.endsWith('-stone')?['found-stone:'+fixed.item]:[])])] })));
                drop = { id: rewardId, type: 'item', title: fixed.item.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' '), amount: fixed.amount, iconUrl: getItemSpriteUrl(fixed.item), xPercent: xPos ?? 65 };
            } else {
                const stonesSeen = [...current.gifts.filter(g=>g.startsWith('found-stone:')).map(g=>g.slice('found-stone:'.length)),...Object.keys(current.items).filter(key=>key.endsWith('-stone')&&current.items[key]>0)];
                const loot = rollChapterLoot(currentChapter(current).chapterNumber,stonesSeen,runtime.random);
                if(loot.money!==undefined){
                    runtime.commitReward(rewardId,()=>set(state=>({money:state.money+loot.money!})));
                    drop={id:rewardId,type:'money',title:`₽${loot.money.toLocaleString()}`,amount:loot.money,iconUrl:'/assets/ui/coin-spin-frames.png',xPercent:xPos??65};
                }else{
                    const item=loot.item!,keys:Record<string,'razz'|'nanab'|'pinap'|'goldenRazz'>={'razz-berry':'razz','nanab-berry':'nanab','pinap-berry':'pinap','golden-razz-berry':'goldenRazz'},berry=keys[item];
                    runtime.commitReward(rewardId,()=>set(state=>berry?{berries:{...state.berries,[berry]:state.berries[berry]+loot.amount}}:{items:{...state.items,[item]:(state.items[item]||0)+loot.amount},gifts:loot.discoveredStone?[...new Set([...state.gifts,'found-stone:'+loot.discoveredStone])]:state.gifts}));
                    const words=item.startsWith('berry-')?item.slice(6)+'-berry':item;
                    const title=words.split('-').map(word=>word[0].toUpperCase()+word.slice(1)).join(' ');
                    drop={id:rewardId,type:berry?'berry':'item',title:`${loot.amount}x ${title}`,amount:loot.amount,iconUrl:getItemSpriteUrl(item),xPercent:xPos??65};
                }
            }
            drop.speed = gameplaySpeed(get().gameSpeed);
            set({
                activeDrop: drop,
                resolvedNode: { chapterId: get().currentChapterId, step: get().currentStep },
                battleLog: customTitle || `🎁 Found ${drop.title}!`,
            });
            get().saveGame(true);
            scheduleNodeTimeout(() => get().finishItemDrop(drop.id), 20000 / drop.speed, 'item');
            return drop;
        },
        finishItemDrop: (id) => {
            if (get().activeDrop?.id !== id)
                return;
            const advance = get().nodeType === 'question';
            const shouldRecall = advance && ['grass', 'red', 'badge'].includes(get().nodeType);
            runtime.cancelTag('item');
            set({ activeDrop: null, mysteryReward: null, chapterCompleteBanner: null });
            runtime.setPhase('battle');
            if (shouldRecall) {
                set({ allyRecalling: true });
                scheduleNodeTimeout(() => get().advanceStep(), Math.max(160, 260 / gameplaySpeed(get().gameSpeed)));
            }
            else if (advance) {
                get().advanceStep();
            }
        }
    };
}
