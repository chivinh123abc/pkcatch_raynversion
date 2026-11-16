import reference from '../../data/buddyReference.json';
import type { PokemonInstance } from '../../types/game';
import { referenceLevel } from './chapterOne';

export interface BuddyState { uid: string | null; ko: number }
export const BUDDY_XP_MULT = reference.mult;
export const EXP_CANDIES = { ...reference.candyXp, 'rare-candy': 0 };
/** Native candyXp before its separate progress-cap guard; old table samples were capped at Lv20. */
export const familyCandyExperience = (level: number) => Math.round(referenceLevel(level).levelXp * reference.candyShare);
export function buddyGoal(mon: Pick<PokemonInstance, 'speciesId' | 'level'>) {
    const goal = reference.species[mon.speciesId]?.goal ?? 5;
    return mon.level < reference.ramp ? Math.max(Math.min(5, goal), Math.round(goal * mon.level / reference.ramp)) : goal;
}
export function pokemonFamily(id: number): number[] {
    return reference.species[id]?.family ?? [id];
}
export const familyEvolutions = (id: number) => reference.species[id]?.evolutions ?? [];
export function restoreBuddy(saved: unknown, owned: PokemonInstance[]): BuddyState {
    const value = saved as Partial<BuddyState> | null;
    const mon = owned.find(mon => mon.uid === value?.uid);
    return mon ? { uid: mon.uid, ko: Number.isSafeInteger(value?.ko) && value!.ko! >= 0 ? Math.min(value!.ko!, buddyGoal(mon) - 1) : 0 } : { uid: null, ko: 0 };
}
