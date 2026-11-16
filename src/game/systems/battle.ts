import { attackRecoveryDelay, gameplaySpeed } from '../domain/presentationTiming';
import { beforeTurn, afterTurn, inflictStatus } from '../domain/status';
import { chooseBattleMove } from '../domain/chapterOne';
import { grantKnockoutReward, grantTrainerReward } from './rewards';
import { getPokemonMove, getPokemonSpecies } from '../../data/pokemonData';
import { bestPartyIndexForEnemy } from '../domain/battle';
import type { GameState } from '../domain/GameState';
import type { SystemContext } from './context';
import { rollDamage } from '../domain/battle';
import type { CombatEffect } from '../../types/game';
export function createBattleActions(context: SystemContext): Pick<GameState, 'resolveCombatImpact' | 'finishCombatEffect' | 'tickCombat'> {
    const { set, get, runtime, createInstance } = context;
    // Unlock and dispatch in one callback: polling must not slip a new turn
    // between recovery finishing and the already queued counterattack.
    const waitForBattleStep = (milliseconds: number, callback: () => void) => {
        runtime.cancelTag('turn-cooldown');
        runtime.busy = true;
        runtime.schedule(() => { runtime.busy = false; callback(); }, milliseconds, 'battle-step');
    };
    const scheduleCombatImpact = (effect: Omit<CombatEffect, 'key'>, impact: () => void, after: () => void, recoveryMs: number) => {
        const speed = effect.speed || gameplaySpeed(get().gameSpeed);
        const key = runtime.beginOperation('combat', { impact, watchdogMs: 8000 / speed + 500, complete: () => {
                set({ combatEffect: null, playerAttacking: false, enemyAttacking: false, arenaShaking: false });
                waitForBattleStep(recoveryMs, after);
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
            const speed = gameplaySpeed(s.gameSpeed);
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
                    const currentSpeed = gameplaySpeed(get().gameSpeed);
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
            if (!s.enemy)
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
                if (!runtime.commitReward('ko-flow:' + defeated.uid, () => {})) return;
                grantKnockoutReward(context, defeated, Boolean(trainer));
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
                            const mon = createInstance(team[next].speciesId, team[next].level);
                            if (get().nodeType === 'badge') mon.maxHp = mon.currentHp = Math.floor(mon.maxHp * 1.3 * (trainer.power ?? 1) * Math.pow(Math.max(1, 6 / team.length), .7));
                            const bestIdx = bestPartyIndexForEnemy(get().party, get().activePartyIndex, mon);
                            const switchAlly = bestIdx !== get().activePartyIndex;
                            set({ enemyRecalling: true,allyRecalling:switchAlly });
                            scheduleNodeTimeout(() => {
                                runtime.setPhase('intro');
                                set({
                                    enemyRecalling: false,
                                    allyRecalling:false,
                                    trainerPresentation: { key:runtime.nextId(),speed,kind:get().nodeType==='badge'?'gym':'trainer',stage:'sendout',sendAlly:switchAlly },
                                    activeTrainer: { ...trainer, team, currentMonIndex: next },
                                    activePartyIndex: bestIdx,
                                    enemy: mon,
                                    battleLog: trainer.name + ' sends out ' + getPokemonSpecies(mon.speciesId).name + '!',
                                });
                                const key=get().trainerPresentation!.key;
                                scheduleNodeTimeout(()=>get().finishTrainerPresentation(key),20000,'trainer-presentation');
                            }, switchAlly ? Math.max(220,400/speed) : 280/speed);
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
                        if (get().finishStaticEncounter()) return;
                        if (get().autoCatch && get().isCatchable)
                            get().catchEnemy();
                        else {
                            set({ allyRecalling: true });
                            scheduleNodeTimeout(() => get().advanceStep(), Math.max(160, 260 / speed));
                        }
                    }, 500 / speed);
                }
            };
            if (s.enemy.currentHp <= 0) { defeatedEnemy(); return; }
            const updateMon = (side: 'player' | 'enemy', mon: typeof attacker) => {
                if (side === 'enemy') set({ enemy: mon, enemyStatus: mon.status === 'sleep' ? 'SLP' : null });
                else set(state => ({ party: state.party.map(value => value.uid === mon.uid ? mon : value) }));
            };
            const currentMon = (side: 'player' | 'enemy') => side === 'enemy' ? get().enemy : get().party[get().activePartyIndex];
            const conclude = (side: 'player' | 'enemy', next?: () => void) => {
                const actor = currentMon(side);
                if (actor) updateMon(side, afterTurn(actor));
                if (get().enemy?.uid !== enemyUid) return;
                if (get().enemy.currentHp <= 0) { defeatedEnemy(); return; }
                if (get().party[get().activePartyIndex]?.currentHp <= 0) {
                    runtime.setPhase('faint');
                    scheduleNodeTimeout(recoverOrSwitch, 500 / speed);
                    return;
                }
                get().saveGame(true);
                // Native Adventure.step processes one actor, then awaits 325/pace
                // after its presentation. This applies to both actors in a round.
                waitForBattleStep(325 / speed, () => {
                    if (next) next();
                    else if (get().isBattling && get().starterChosen) get().tickCombat();
                });
            };
            const strike = (side: 'player' | 'enemy', next?: () => void) => {
                if (get().enemy?.uid !== enemyUid || get().enemy.currentHp <= 0) return;
                const actor = currentMon(side), target = currentMon(side === 'player' ? 'enemy' : 'player');
                if (!actor || !target || actor.currentHp <= 0 || target.currentHp <= 0) return;
                const prepared = beforeTurn(actor, runtime.random);
                updateMon(side, prepared.mon);
                if (prepared.message) set({ battleLog: getPokemonSpecies(actor.speciesId).name + ' ' + prepared.message });
                if (prepared.skip) { runtime.lockFor(650 / speed); runtime.schedule(() => conclude(side, next), 650 / speed); return; }
                const move = chooseBattleMove(prepared.mon, target), roll = rollDamage(prepared.mon, target, move, runtime.random);
                if (side === 'enemy' && roll.damage > 0) roll.damage = Math.max(1, Math.round(roll.damage * (get().nodeType === 'badge' ? 1.3 * (get().activeTrainer?.power ?? 1) : get().activeTrainer ? get().activeTrainer.power ?? .9 : .85)));
                const name = (side === 'enemy' ? 'Foe ' : '') + getPokemonSpecies(actor.speciesId).name;
                set({ battleLog: name + ' used ' + move.name + '!' });
                scheduleCombatImpact({ type: move.effectType, target: side === 'player' ? 'enemy' : 'player', damage: roll.damage, moveName: move.name, moveKey: move.key, speed, miss: roll.miss || roll.multiplier === 0, crit: roll.crit }, () => {
                    if (get().enemy?.uid !== enemyUid || !currentMon(side)?.currentHp) return;
                    const victimSide = side === 'player' ? 'enemy' : 'player', victim = currentMon(victimSide);
                    if (!victim || victim.uid !== target.uid || victim.currentHp <= 0) return;
                    let hit = { ...victim, currentHp: Math.max(0, victim.currentHp - roll.damage) };
                    if (!roll.miss && roll.multiplier > 0) hit = inflictStatus(hit, move.key, runtime.random);
                    updateMon(victimSide, hit);
                    showHit(victimSide, roll, move.name, name);
                }, () => conclude(side, next), attackRecoveryDelay(roll, speed));
            };
            const enemySpeed = s.enemy.stats.speed * (s.enemy.status === 'paralysis' ? .25 : 1);
            const allySpeed = attacker.stats.speed * (attacker.status === 'paralysis' ? .25 : 1);
            if (enemySpeed > allySpeed) strike('enemy', () => strike('player'));
            else strike('player', () => strike('enemy'));
        }
    };
}
