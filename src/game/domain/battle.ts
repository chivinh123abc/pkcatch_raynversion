import { levelExperience, referenceLevel, moveAccuracy, movePower } from './chapterOne';
import type { PokemonInstance } from '../../types/game';
import { calculateStats, getPokemonMove, getPokemonSpecies } from '../../data/pokemonData';
import { getTypeMultiplier } from '../../data/typeChart';
import MOVES from '../../data/moves.json';
import { BUDDY_XP_MULT } from './buddy';
export function rollDamage(attacker: PokemonInstance, defender: PokemonInstance, move: ReturnType<typeof getPokemonMove>, random: () => number = Math.random) {
    const species = getPokemonSpecies(attacker.speciesId);
    const multiplier = getTypeMultiplier([move.type], getPokemonSpecies(defender.speciesId).types);
    const data = MOVES[move.key];
    const miss = random() * 100 >= moveAccuracy(move.key);
    const crit = !miss && random() < 1 / 24;
    const physical = move.category === 'physical';
    const attack = physical ? attacker.stats.attack * (attacker.status === 'burn' ? .5 : 1) : attacker.stats.spAttack;
    const defense = physical ? defender.stats.defense : defender.stats.spDefense;
    const base = (2 * attacker.level / 5 + 2) * (movePower(move.key) || 50) * attack / Math.max(1, defense) / 50 + 2;
    const damage = miss || multiplier === 0 ? 0 : Math.max(1, Math.floor(base * (species.types.includes(move.type) ? 1.5 : 1) * multiplier * Math.pow(1.06, attacker.level - defender.level) * (crit ? 1.5 : 1) * (.85 + random() * .15)));
    return { damage, miss, crit, multiplier };
}
const XP_WINS_PER_LEVEL = 15;
const XP_BASE_REF = 60;
export const XP_ACTIVE_BONUS = 1.1;
export function calcBattleExp(enemy: PokemonInstance, isTrainer: boolean, hasPinap: boolean): number {
    const sp = getPokemonSpecies(enemy.speciesId);
    const levelCurve = referenceLevel(enemy.level).levelXp;
    const raw = (levelCurve / XP_WINS_PER_LEVEL)
        * Math.sqrt((sp.baseExp || XP_BASE_REF) / XP_BASE_REF)
        * (isTrainer ? 1.5 : 1)
        * (hasPinap ? 1.25 : 1);
    return raw;
}
export function applyExpToParty(party: PokemonInstance[], activeIndex: number, baseExp: number, buddyUid: string | null = null, cap = 100): {
    party: PokemonInstance[];
    activeGain: number;
    gains: Record<string, {
        amount: number;
        active: boolean;
    }>;
} {
    let activeGain = 0;
    const gains: Record<string, {
        amount: number;
        active: boolean;
    }> = {};
    const nextParty = party.map((mon, idx) => {
        if (mon.level >= cap)
            return mon;
        const isActive = idx === activeIndex;
        const gain = Math.round(baseExp * (isActive ? XP_ACTIVE_BONUS : 1) * (mon.uid === buddyUid ? BUDDY_XP_MULT : 1));
        if (isActive)
            activeGain = gain;
        gains[mon.uid] = { amount: gain, active: isActive };
        return gainExperience(mon, gain, cap);
    });
    return { party: nextParty, activeGain, gains };
}
/** Shared by battle, Buddy bonus and candies; a fainted Pokémon stays fainted. */
export function gainExperience(mon: PokemonInstance, amount: number, cap = 100): PokemonInstance {
    if (mon.level >= cap) return mon;
    let level = mon.level, exp = mon.exp + Math.round(amount), needed = mon.expToNextLevel;
    while (level < cap && exp >= needed) {
        exp -= needed;
        needed = levelExperience(++level);
    }
    if (level === mon.level) return { ...mon, exp };
    const stats = calculateStats(getPokemonSpecies(mon.speciesId).baseStats, level, mon.isShiny);
    return { ...mon, level, exp: level === 100 ? 0 : level >= cap ? Math.min(exp, needed - 1) : exp, expToNextLevel: needed, stats, maxHp: stats.hp,
        currentHp: mon.currentHp > 0 ? Math.min(stats.hp, mon.currentHp + Math.max(0, stats.hp - mon.maxHp)) : 0 };
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
