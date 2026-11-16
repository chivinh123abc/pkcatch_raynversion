import { gameplaySpeed } from '../domain/presentationTiming';
import { currentNode } from '../data/chapterSelectors';
import { getPokemonSpecies } from '../../data/pokemonData';
import { applyExpToParty, nextHealthyPartyIndex } from '../domain/battle';
import { currentLevelCap } from '../domain/levelCap';
import { captureOutcome, familyRoot, automaticBall } from '../domain/chapterOne';
import { familyCandyExperience } from '../domain/buddy';
import type { GameState } from '../domain/GameState';
import type { BallType } from '../../types/game';
import type { SystemContext } from './context';

export function createCaptureActions({ set, get, runtime }: SystemContext): Pick<GameState, 'catchEnemy' | 'dismissNewCatchCard' | 'finishCapturePresentation'> {
  const recallAndAdvance = () => {
    runtime.setPhase('recall');
    set(state => ({ newCatchCard: null, enemy: null, allyRecalling: true, activePartyIndex: nextHealthyPartyIndex(state.party, state.activePartyIndex), transitionTick: state.transitionTick + 1 }));
    runtime.schedule(() => get().advanceStep(), Math.max(160, 260 / gameplaySpeed(get().gameSpeed)));
  };
  return {
    catchEnemy: () => {
      const state = get(), enemy = state.enemy;
      if (!enemy || runtime.hasOperation('combat') || state.isCatchSequenceActive || !state.isCatchable) return;
      const speed = gameplaySpeed(state.gameSpeed), name = getPokemonSpecies(enemy.speciesId).name;
      const duplicate = [...state.party, ...state.pcBox].some(mon => mon.speciesId === enemy.speciesId && mon.isShiny === enemy.isShiny);
      const master = state.selectedBall === 'masterball' && state.balls.masterball > 0;
      // Balls are chosen by species tier in the reference. Legacy master inventory remains usable.
      const ball: BallType = master ? 'masterball' : automaticBall(enemy.speciesId);
      const multiplier = state.berryBuffs.ultraBall > 0 ? 1.5 : state.berryBuffs.greatBall > 0 ? 1.25 : 1;
      const roll = state.captureRoll?.enemyUid === enemy.uid ? state.captureRoll : { enemyUid: enemy.uid, ...captureOutcome(enemy, duplicate, multiplier, runtime.random, master), ball, duplicate };
      if (!state.captureRoll && master && !duplicate) set(s => ({ balls: { ...s.balls, masterball: s.balls.masterball - 1 } }));
      set({ captureRoll: roll, isCatchSequenceActive: true, catchPhase: 'throw', trainerOnField: true, battleLog: roll.duplicate ? `${name} is already in your collection!` : `Throwing a ${roll.ball === 'pokeball' ? 'Poké Ball' : roll.ball === 'greatball' ? 'Great Ball' : roll.ball === 'ultraball' ? 'Ultra Ball' : 'Master Ball'}…` });
      get().saveGame(true);
      const key = runtime.beginOperation('capture', { watchdogMs: 25000 / speed, complete: () => {
        runtime.commitReward('capture:' + enemy.uid, () => {
          let familyAmount = 0;
          set(s => {
            const gains: NonNullable<GameState['sidebarExpPopups']> = {};
            let party = s.party, pcBox = s.pcBox;
            const isNew = !s.pokedexCaught.includes(enemy.speciesId), destination = party.length < 6 ? 'party' as const : 'pc' as const;
            if (roll.success && roll.duplicate) {
              const cap=currentLevelCap(s),root = familyRoot(enemy.speciesId), members = [...party, ...pcBox].filter(mon => familyRoot(mon.speciesId) === root && mon.level < cap);
              const feed = (mon: typeof enemy) => {
                if (!members.some(member => member.uid === mon.uid)) return mon;
                const amount = Math.round(familyCandyExperience(mon.level) / members.length);
                familyAmount += amount;
                gains[mon.uid] = { amount, active: s.party[s.activePartyIndex]?.uid === mon.uid };
                return applyExpToParty([mon], -1, amount, null, cap).party[0];
              };
              party = party.map(feed); pcBox = pcBox.map(feed);
            } else if (roll.success) {
              const captured = { ...enemy, currentHp: enemy.maxHp, caughtAt: runtime.now(), where: currentNode(get()).name, how: 'wild', status: undefined, sleepTurns: undefined, confusedTurns: undefined };
              if (!party.some(mon => mon.uid === captured.uid) && !pcBox.some(mon => mon.uid === captured.uid)) {
                if (destination === 'party') party = [...party, captured]; else pcBox = [...pcBox, captured];
              }
            }
            const message = !roll.success ? `${name} broke free!` : roll.duplicate ? `Duplicate: +${familyAmount.toLocaleString()} family XP for ${name}!` : `${name} caught! Added to ${destination === 'party' ? 'your team' : 'the PC'}.`;
            return {
              party, pcBox, capturePresentation: null, captureRoll: null, catchPhase: 'reward',
              resolvedNode: { chapterId: s.currentChapterId, step: s.currentStep },
              pokedexCaught: roll.success && isNew ? [...s.pokedexCaught, enemy.speciesId] : s.pokedexCaught,
              pokedexSeen: s.pokedexSeen.includes(enemy.speciesId) ? s.pokedexSeen : [...s.pokedexSeen, enemy.speciesId],
              battleLog: message, topToastBanner: { text: message, iconSpeciesId: enemy.speciesId },
              duplicatePopup: roll.success && roll.duplicate ? { text: `+${familyAmount.toLocaleString()} family XP`, amount: familyAmount, speciesId: enemy.speciesId } : null,
              sidebarExpPopup: familyAmount ? `+${familyAmount.toLocaleString()} XP` : null, sidebarExpPopups: familyAmount ? gains : null,
              newCatchCard: roll.success && !roll.duplicate && (isNew || enemy.isShiny) ? { speciesId: enemy.speciesId, level: enemy.level, isShiny: enemy.isShiny, isNew, destination } : null,
            };
          });
          get().saveGame(true);
          if (get().newCatchCard) runtime.setPhase('awaiting-continue');
          else runtime.schedule(recallAndAdvance, 950 / speed);
        });
      }});
      set({ capturePresentation: { key, speed, success: roll.success, duplicate: roll.duplicate, ball: roll.ball, shakes: roll.shakes } });
    },
    dismissNewCatchCard: () => { if (get().newCatchCard) recallAndAdvance(); },
    finishCapturePresentation: key => { runtime.finish('capture', key); },
  };
}
