import { getPokemonSpecies } from '../../data/pokemonData';
import { applyExpToParty, calcBattleExp, nextHealthyPartyIndex, XP_ACTIVE_BONUS } from '../domain/battle';
import type { GameState } from '../domain/GameState';
import type { SystemContext } from './context';
export function createCaptureActions(context: SystemContext): Pick<GameState, 'catchEnemy' | 'dismissNewCatchCard' | 'finishCapturePresentation'> {
    const { set, get, runtime } = context;
    const scheduleNodeTimeout = runtime.schedule.bind(runtime);
    const lockTurnFor = runtime.lockFor.bind(runtime);
    return {
        catchEnemy: () => {
            const { enemy, gameSpeed, party, pcBox, pokedexCaught, selectedBall, balls, berryBuffs } = get();
            if (!enemy || runtime.hasOperation('combat') || get().isCatchSequenceActive || !get().isCatchable)
                return;
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
            const caught = runtime.random() < catchChance;
            const capturedMon = { ...enemy, currentHp: enemy.maxHp, caughtAt: runtime.now() };
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
            const captureKey = runtime.beginOperation('capture', { watchdogMs: 25000 / gameSpeed, complete: () => {
                    runtime.commitReward('capture:' + enemy.uid, () => {
                        set({ capturePresentation: null });
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
                        if (get().newCatchCard) {
                            runtime.setPhase('awaiting-continue');
                            return;
                        }
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
                    });
                } });
            set({ capturePresentation: { key: captureKey, speed: gameSpeed, success: caught, duplicate: isDuplicate, ball: ballType, shakes: caught ? 4 : Math.floor(runtime.random() * 3) } });
        },
        dismissNewCatchCard: () => {
            if (!get().newCatchCard)
                return;
            runtime.setPhase('recall');
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
        finishCapturePresentation: (key) => { runtime.finish('capture', key); }
    };
}
