import type { ActiveDrop, PokemonInstance } from '../../types/game';
import { getItemSpriteUrl, getPokemonSpecies } from '../../data/pokemonData';
import { ALL_CHAPTERS, DEFAULT_CHAPTER } from '../../data/chaptersData';
import { applyExpToParty, calcBattleExp } from '../domain/battle';
import type { ActiveTrainerState } from '../domain/GameState';
import type { GameState } from '../domain/GameState';
import type { SystemContext } from './context';
export function grantKnockoutReward({ runtime, set, get }: SystemContext, enemy: PokemonInstance, isTrainer: boolean) {
    return runtime.commitReward('ko:' + enemy.uid, () => {
        const battleExp = calcBattleExp(enemy, isTrainer, get().berryBuffs.pinap > 0);
        set(state => {
            const result = applyExpToParty(state.party, state.activePartyIndex, battleExp);
            return { party: result.party, sidebarExpPopup: `+${result.activeGain.toLocaleString()} XP`, sidebarExpPopups: result.gains, battleLog: getPokemonSpecies(enemy.speciesId).name + ' fainted!' };
        });
    });
}
export function grantTrainerReward({ runtime, set, get }: SystemContext, enemyUid: string, trainer: ActiveTrainerState) {
    return runtime.commitReward('trainer:' + enemyUid, () => {
        const chapter = ALL_CHAPTERS.find(c => c.id === get().currentChapterId) || DEFAULT_CHAPTER;
        const badge = get().nodeType === 'badge' ? chapter.badgeSprite : null;
        set(state => ({
            money: state.money + trainer.rewardMoney,
            badges: badge && !state.badges.includes(badge) ? [...state.badges, badge] : state.badges,
            chapterCompleteBanner: badge ? chapter.badgeName : null,
            battleLog: 'Defeated ' + trainer.name + '! Received ₽' + trainer.rewardMoney.toLocaleString() + '!',
        }));
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
            const roll = runtime.random();
            let drop: ActiveDrop;
            if (roll < 0.55) {
                const berryTypes = ['razz', 'nanab', 'pinap', 'goldenRazz'] as const;
                const b = berryTypes[Math.floor(runtime.random() * berryTypes.length)];
                const count = 1;
                const berryName = b === 'razz'
                    ? 'Razz Berry'
                    : b === 'nanab'
                        ? 'Nanab Berry'
                        : b === 'pinap'
                            ? 'Pinap Berry'
                            : 'Golden Razz Berry';
                const iconUrl = b === 'goldenRazz' ? '/assets/ui/golden-razz-berry.png' : getItemSpriteUrl(b);
                runtime.commitReward(rewardId, () => set((s) => ({
                    berries: {
                        ...s.berries,
                        [b]: s.berries[b] + count,
                    },
                })));
                drop = {
                    id: `drop-${runtime.nextId()}-${runtime.random()}`,
                    type: 'berry',
                    title: `${count}x ${berryName}`,
                    amount: count,
                    iconUrl,
                    xPercent: xPos ?? Math.floor(55 + runtime.random() * 20),
                };
            }
            else {
                const foundMoney = Math.floor(runtime.random() * 350) + 150;
                runtime.commitReward(rewardId, () => set((s) => ({ money: s.money + foundMoney })));
                drop = {
                    id: `drop-${runtime.nextId()}-${runtime.random()}`,
                    type: 'money',
                    title: `₽${foundMoney.toLocaleString()}`,
                    amount: foundMoney,
                    iconUrl: '/assets/ui/coin-spin-frames.png',
                    xPercent: xPos ?? Math.floor(55 + runtime.random() * 20),
                };
            }
            drop.speed = get().gameSpeed;
            set({
                activeDrop: drop,
                battleLog: customTitle || `🎁 Found ${drop.title}!`,
            });
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
                scheduleNodeTimeout(() => get().advanceStep(), Math.max(160, 260 / get().gameSpeed));
            }
            else if (advance) {
                get().advanceStep();
            }
        }
    };
}
