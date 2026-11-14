import { grantKnockoutReward, grantTrainerReward } from './rewards';
import { getPokemonMove, getPokemonSpecies } from '../../data/pokemonData';
import { bestPartyIndexForEnemy } from '../domain/battle';
import type { GameState } from '../domain/GameState';
import type { SystemContext } from './context';
import { rollDamage } from '../domain/battle';
import type { CombatEffect } from '../../types/game';
export function createBattleActions(context: SystemContext): Pick<GameState, 'resolveCombatImpact' | 'finishCombatEffect' | 'tickCombat'> {
    const { set, get, runtime, createInstance } = context;
    const scheduleCombatImpact = (effect: Omit<CombatEffect, 'key'>, impact: () => void, after: () => void) => {
        const speed = effect.speed || get().gameSpeed;
        const key = runtime.beginOperation('combat', { impact, watchdogMs: 8000 / speed + 500, complete: () => {
                set({ combatEffect: null, playerAttacking: false, enemyAttacking: false, arenaShaking: false });
                runtime.lockFor(200 / speed);
                after();
            } });
        set({ combatEffect: { ...effect, speed, key }, playerAttacking: effect.target === 'enemy', enemyAttacking: effect.target === 'player' });
    };
    const scheduleNodeTimeout = runtime.schedule.bind(runtime);
    const lockTurnFor = runtime.lockFor.bind(runtime);
    return {
        resolveCombatImpact: (key) => { runtime.impact('combat', key); },
        finishCombatEffect: (key) => { runtime.finish('combat', key); },
        tickCombat: () => {
            const s = get();
            if (runtime.phase !== 'battle')
                return;
            if (runtime.busy || runtime.hasOperation('combat') || runtime.hasOperation('capture') || runtime.context.recoveringParty || s.isCatchSequenceActive || s.allyRecalling || s.allySendingOut || s.enemyRecalling || s.healPulse || s.activeDrop || s.bossIntroActive || Boolean(s.newCatchCard))
                return;
            const speed = s.gameSpeed;
            const recoverOrSwitch = () => {
                const state = get();
                if (state.party[state.activePartyIndex]?.currentHp > 0)
                    return;
                const healthy = state.enemy
                    ? bestPartyIndexForEnemy(state.party, state.activePartyIndex, state.enemy)
                    : state.party.findIndex(mon => mon.currentHp > 0);
                if (healthy >= 0 && state.party[healthy]?.currentHp > 0) {
                    const faintedName = getPokemonSpecies(state.party[state.activePartyIndex]?.speciesId || 1).name;
                    const nextName = getPokemonSpecies(state.party[healthy].speciesId).name;
                    runtime.busy = true;
                    runtime.setPhase('recall');
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
                            runtime.busy = false;
                            runtime.setPhase('battle');
                            lockTurnFor(160 / speed);
                        }, Math.max(220, 420 / speed));
                    }, Math.max(220, 400 / speed));
                    return;
                }
                if (runtime.context.recoveringParty)
                    return;
                runtime.context.recoveringParty = true;
                runtime.busy = true;
                set({
                    allyRecalling: true,
                    topToastBanner: { text: 'Defeated! Your entire team fainted.' },
                    battleLog: 'You were defeated! Returning to the Pokémon Center…',
                });
                scheduleNodeTimeout(() => {
                    const healKey = runtime.nextId();
                    const currentSpeed = get().gameSpeed;
                    runtime.context.returnToStartAfterHeal = true;
                    runtime.setPhase('heal');
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
                    scheduleNodeTimeout(() => get().finishHealPresentation(healKey), 30000 / currentSpeed, 'heal');
                }, Math.max(600, 1100 / speed));
            };
            const attacker = s.party[s.activePartyIndex];
            if (!attacker || attacker.currentHp <= 0) {
                recoverOrSwitch();
                return;
            }
            if (!s.enemy || s.enemy.currentHp <= 0)
                return;
            const enemyUid = s.enemy.uid;
            const actorName = getPokemonSpecies(attacker.speciesId).name;
            const enemyName = getPokemonSpecies(s.enemy.speciesId).name;
            const showHit = (target: 'enemy' | 'player', roll: ReturnType<typeof rollDamage>, moveName: string, name: string) => {
                const id = 'damage-' + (runtime.nextId());
                const text = roll.miss ? 'Miss!' : roll.multiplier === 0 ? 'No effect' : '-' + roll.damage;
                const detail = roll.miss ? ' It missed!' : roll.multiplier === 0 ? ' It had no effect.' : roll.crit ? ' A critical hit!' : roll.multiplier > 1 ? " It's super effective!" : roll.multiplier < 1 ? " It's not very effective…" : '';
                set(state => ({ battleLog: name + ' used ' + moveName + '!' + detail, damagePopups: [...state.damagePopups, { id, target, text, isCrit: roll.crit }] }));
                scheduleNodeTimeout(() => set(state => ({ damagePopups: state.damagePopups.filter(pop => pop.id !== id) })), 950 / speed);
            };
            const defeatedEnemy = () => {
                const defeated = get().enemy;
                if (!defeated || defeated.uid !== enemyUid || defeated.currentHp > 0)
                    return;
                const trainer = get().activeTrainer;
                if (!grantKnockoutReward(context, defeated, Boolean(trainer)))
                    return;
                runtime.setPhase('faint');
                lockTurnFor(700 / speed);
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
                                runtime.setPhase('battle');
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
                        if (!grantTrainerReward(context, enemyUid, trainer))
                            return;
                        runtime.setPhase('reward');
                        const isBadge = get().nodeType === 'badge';
                        scheduleNodeTimeout(() => {
                            set({ chapterCompleteBanner: null, allyRecalling: true });
                            scheduleNodeTimeout(() => get().advanceStep(), Math.max(160, 260 / speed));
                        }, (isBadge ? 1400 : 800) / speed);
                    }, 500 / speed);
                }
                else {
                    scheduleNodeTimeout(() => {
                        if (get().autoCatch && get().isCatchable)
                            get().catchEnemy();
                        else {
                            set({ allyRecalling: true });
                            scheduleNodeTimeout(() => get().advanceStep(), Math.max(160, 260 / speed));
                        }
                    }, 500 / speed);
                }
            };
            const retaliate = () => {
                const state = get();
                if (state.enemy?.uid !== enemyUid || state.enemy.currentHp <= 0 || state.isCatchSequenceActive)
                    return;
                const target = state.party[state.activePartyIndex];
                if (!target || target.currentHp <= 0) {
                    recoverOrSwitch();
                    return;
                }
                if (state.enemyStatus === 'SLP') {
                    set({ battleLog: enemyName + ' is fast asleep…', enemyStatus: null });
                    return;
                }
                const move = getPokemonMove(getPokemonSpecies(state.enemy.speciesId).types, getPokemonSpecies(target.speciesId).types, runtime.random);
                const roll = rollDamage(state.enemy, target, move, runtime.random);
                set({ battleLog: 'Foe ' + enemyName + ' used ' + move.name + '!' });
                scheduleCombatImpact({ type: move.effectType, target: 'player', damage: roll.damage, moveName: move.name, moveKey: move.key, speed, miss: roll.miss || roll.multiplier === 0, crit: roll.crit }, () => {
                    if (get().enemy?.uid !== enemyUid || get().enemy.currentHp <= 0)
                        return;
                    const current = get().party.find(mon => mon.uid === target.uid);
                    if (!current || current.currentHp <= 0)
                        return;
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
            const move = getPokemonMove(getPokemonSpecies(attacker.speciesId).types, getPokemonSpecies(s.enemy.speciesId).types, runtime.random);
            const roll = rollDamage(attacker, s.enemy, move, runtime.random);
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
                if (!current || current.uid !== enemyUid || current.currentHp <= 0 || !alive || alive.currentHp <= 0)
                    return;
                set({ enemy: { ...current, currentHp: Math.max(0, current.currentHp - roll.damage) } });
                showHit('enemy', roll, move.name, actorName);
            }, () => {
                if (get().enemy?.uid !== enemyUid)
                    return;
                if (get().enemy.currentHp <= 0)
                    defeatedEnemy();
                else {
                    lockTurnFor(300 / speed);
                    scheduleNodeTimeout(retaliate, 250 / speed);
                }
            });
        }
    };
}
