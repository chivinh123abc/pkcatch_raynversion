import { levelExperience } from './chapterOne';
import type { PokemonInstance } from '../../types/game';
import { calculateStats, getPokemonSpecies } from '../../data/pokemonData';
import type { GameplayRuntime } from '../runtime/GameplayRuntime';
// Upgrade only the known previous HP formula; preserve damage, fainting and custom fixtures.
export function migrateReferenceHp(mon: PokemonInstance): PokemonInstance {
    const base = getPokemonSpecies(mon.speciesId).baseStats;
    const oldHp = Math.floor(Math.floor((Math.floor(2 * base.hp * mon.level / 100) + mon.level + 10) * (mon.isShiny ? 1.1 : 1)) * Math.min(2.5, 1 + 1.5 * mon.level / 100));
    if (mon.maxHp !== oldHp || mon.stats.hp !== oldHp) return mon;
    const stats = calculateStats(base, mon.level, mon.isShiny);
    return { ...mon, stats: { ...mon.stats, hp: stats.hp }, maxHp: stats.hp, currentHp: Math.min(mon.currentHp, stats.hp) };
}
export function createPokemonInstance(speciesId: number, level: number, isShiny: boolean, runtime: GameplayRuntime): PokemonInstance {
    const species = getPokemonSpecies(speciesId);
    const stats = calculateStats(species.baseStats, level, isShiny);
    return {
        uid: `${speciesId}-${runtime.now()}-${runtime.nextId()}`,
        speciesId,
        level,
        exp: 0,
        expToNextLevel: levelExperience(level),
        currentHp: stats.hp,
        maxHp: stats.hp,
        stats,
        isShiny,
        caughtAt: runtime.now(),
        wins: 0,
    };
}
