import type { PokemonInstance } from '../../types/game';
import { calculateStats, getPokemonSpecies } from '../../data/pokemonData';
import type { GameplayRuntime } from '../runtime/GameplayRuntime';
export function createPokemonInstance(speciesId: number, level: number, isShiny: boolean, runtime: GameplayRuntime): PokemonInstance {
    const species = getPokemonSpecies(speciesId);
    const stats = calculateStats(species.baseStats, level);
    return {
        uid: `${speciesId}-${runtime.now()}-${runtime.nextId()}`,
        speciesId,
        level,
        exp: 0,
        expToNextLevel: Math.floor(4 * Math.pow(level, 3) / 5) || 50,
        currentHp: stats.hp,
        maxHp: stats.hp,
        stats,
        isShiny,
        caughtAt: runtime.now(),
    };
}
