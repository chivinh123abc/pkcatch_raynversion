import type { PokemonInstance } from '../../types/game';
import { calculateStats, getPokemonMove, getPokemonSpecies } from '../../data/pokemonData';
import { getTypeMultiplier } from '../../data/typeChart';
import MOVES from '../../data/moves.json';
export function rollDamage(attacker: PokemonInstance, defender: PokemonInstance, move: ReturnType<typeof getPokemonMove>, random: () => number = Math.random) {
    const species = getPokemonSpecies(attacker.speciesId);
    const multiplier = getTypeMultiplier([move.type], getPokemonSpecies(defender.speciesId).types);
    const data = MOVES[move.key];
    const miss = random() * 100 >= (data?.acc || 100);
    const crit = !miss && random() < 1 / 24;
    const physical = move.category === 'physical';
    const attack = physical ? attacker.stats.attack : attacker.stats.spAttack;
    const defense = physical ? defender.stats.defense : defender.stats.spDefense;
    const base = (2 * attacker.level / 5 + 2) * (data?.power || 50) * attack / Math.max(1, defense) / 50 + 2;
    const damage = miss || multiplier === 0 ? 0 : Math.max(1, Math.floor(base * (species.types.includes(move.type) ? 1.5 : 1) * multiplier * Math.pow(1.06, attacker.level - defender.level) * (crit ? 1.5 : 1) * (.85 + random() * .15)));
    return { damage, miss, crit, multiplier };
}
const XP_WINS_PER_LEVEL = 15;
const XP_BASE_REF = 60;
export const XP_ACTIVE_BONUS = 1.1;
export function calcBattleExp(enemy: PokemonInstance, isTrainer: boolean, hasPinap: boolean): number {
    const sp = getPokemonSpecies(enemy.speciesId);
    const levelCurve = Math.max(25, Math.floor((4 * Math.pow(enemy.level + 1, 3)) / 5));
    const raw = (levelCurve / XP_WINS_PER_LEVEL)
        * Math.sqrt((sp.baseExp || XP_BASE_REF) / XP_BASE_REF)
        * (isTrainer ? 1.5 : 1)
        * (hasPinap ? 2 : 1);
    return Math.max(4, Math.round(raw));
}
export function applyExpToParty(party: PokemonInstance[], activeIndex: number, baseExp: number): {
    party: PokemonInstance[];
    activeGain: number;
    gains: Record<string, {
        amount: number;
        active: boolean;
    }>;
} {
    let activeGain = Math.round(baseExp * XP_ACTIVE_BONUS);
    const gains: Record<string, {
        amount: number;
        active: boolean;
    }> = {};
    const nextParty = party.map((mon, idx) => {
        if (mon.level >= 100)
            return mon;
        const isActive = idx === activeIndex;
        const gain = isActive ? Math.round(baseExp * XP_ACTIVE_BONUS) : Math.round(baseExp);
        if (isActive)
            activeGain = gain;
        gains[mon.uid] = { amount: gain, active: isActive };
        let level = mon.level;
        let exp = mon.exp + gain;
        let expToNext = mon.expToNextLevel;
        let stats = mon.stats;
        let maxHp = mon.maxHp;
        let currentHp = mon.currentHp;
        while (exp >= expToNext && level < 100) {
            exp -= expToNext;
            level += 1;
            const nextStats = calculateStats(getPokemonSpecies(mon.speciesId).baseStats, level);
            const hpDiff = Math.max(0, nextStats.hp - maxHp);
            stats = nextStats;
            maxHp = nextStats.hp;
            currentHp = currentHp > 0 ? Math.min(maxHp, currentHp + hpDiff) : 0;
            expToNext = Math.floor((4 * Math.pow(level, 3)) / 5) || 50;
        }
        return { ...mon, level, exp, expToNextLevel: expToNext, stats, maxHp, currentHp };
    });
    return { party: nextParty, activeGain, gains };
}
export function nextHealthyPartyIndex(party: PokemonInstance[], currentIndex: number): number {
    for (let offset = 1; offset <= party.length; offset += 1) {
        const index = (currentIndex + offset) % party.length;
        if (party[index]?.currentHp > 0)
            return index;
    }
    return currentIndex;
}
export function bestPartyIndexForEnemy(party: PokemonInstance[], currentIndex: number, enemy: PokemonInstance): number {
    const enemyTypes = getPokemonSpecies(enemy.speciesId).types;
    const scoreFor = (mon: PokemonInstance) => {
        const allyTypes = getPokemonSpecies(mon.speciesId).types;
        const off = Math.max(...allyTypes.map((t) => getTypeMultiplier([t], enemyTypes)));
        const def = Math.max(...enemyTypes.map((t) => getTypeMultiplier([t], allyTypes)));
        const offScore = off === 0 ? -100 : off > 1 ? 2 : off < 1 ? -1 : 0;
        const defScore = def > 1 ? -1 : def < 1 ? 1 : 0;
        return offScore + defScore;
    };
    const current = party[currentIndex];
    let bestIdx = current && current.currentHp > 0 ? currentIndex : -1;
    let bestScore = bestIdx >= 0 ? scoreFor(current) : -Infinity;
    for (let i = 0; i < party.length; i += 1) {
        const mon = party[i];
        if (!mon || mon.currentHp <= 0 || i === currentIndex)
            continue;
        const score = scoreFor(mon);
        if (score > bestScore) {
            bestScore = score;
            bestIdx = i;
        }
    }
    return bestIdx >= 0 ? bestIdx : currentIndex;
}
