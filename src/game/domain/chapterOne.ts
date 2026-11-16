import reference from '../../data/chapterOneReference.json';
import MOVES from '../../data/moves.json';
import { getPokemonSpecies, MoveData } from '../../data/pokemonData';
import type { PokemonInstance, PokemonType } from '../../types/game';
import { getTypeMultiplier } from '../../data/typeChart';
import type { BallType } from '../../types/game';

export const referenceLevel = (level: number) => reference.tables[Math.min(99, Math.max(0, level - 1))];
export const levelExperience = (level: number) => referenceLevel(level).xp;
export const rareEncounterWeight = (id: number, weight: number, multiplier = 1) => weight * (reference.ballBySpecies[id] === 'ultra-ball' && ![144,145,146,150,151].includes(id) ? multiplier : 1);
export function chapterOnePool(step: number, rareMultiplier = 1) {
  const area = step <= 4 ? 'Route 1' : step <= 8 ? 'Route 2' : 'Forêt de Jade';
  const pool = reference.pools[area].filter(entry => !entry.when?.some(condition => !['day', 'morning'].includes(condition)));
  const weighted = pool.map(entry => ({ ...entry, w: rareEncounterWeight(entry.id, entry.w, rareMultiplier) }));
  const total = weighted.reduce((sum, entry) => sum + entry.w, 0);
  return weighted.map(entry => ({ speciesId: entry.id, minLevel: entry.min, maxLevel: entry.max, weight: entry.w, rate: entry.w / total }));
}
export const automaticBall = (id: number): BallType => ({ 'poke-ball': 'pokeball', 'great-ball': 'greatball', 'ultra-ball': 'ultraball', 'master-ball': 'masterball' } as const)[reference.ballBySpecies[id]] || 'pokeball';
export function familyRoot(id: number): number {
  for (let depth = 0; depth < 10; depth++) {
    const from = Array.from({ length: 151 }, (_, i) => i + 1).find(value => getPokemonSpecies(value).evolvesTo?.speciesId === id);
    if (!from) return id;
    id = from;
  }
  return id;
}

export function movePower(key: string): number {
  const base = reference.powerOverrides[key] ?? MOVES[key]?.power ?? 0;
  const hits = reference.multiHit[key];
  return Array.isArray(hits) ? hits.reduce((sum: number, n: number) => sum + n, 0) : hits === '2-5' ? base * reference.multiHitOdds.reduce((sum, chance, i) => sum + chance * (i + 2), 0) : typeof hits === 'number' ? base * hits : base;
}
export function moveAccuracy(key: string): number {
  const power = movePower(key), [from, to, minimum] = reference.accuracy;
  return power <= 0 ? MOVES[key]?.acc || 100 : 100 - (100 - minimum) * Math.min(1, Math.max(0, power - from) / (to - from));
}
// Collection cards show Game.mainMove, independent of the current opponent.
// Native ranks learned moves using species base ATK/SPA, accuracy and STAB.
export function mainMove(mon: Pick<PokemonInstance, 'speciesId' | 'level'>): MoveData {
  const species = getPokemonSpecies(mon.speciesId);
  let best: string | undefined, last: string | undefined, score = -1;
  for (const [level, key] of reference.dex[mon.speciesId]?.learn || []) {
    if (Number(level) > mon.level) continue;
    last = String(key);
    if (reference.blacklist.includes(last)) continue;
    const data = MOVES[last], power = movePower(last);
    if (!data || power <= 0) continue;
    const type = (data.type[0].toUpperCase() + data.type.slice(1)) as PokemonType;
    const attack = data.cat === 'phys' ? species.baseStats.attack : species.baseStats.spAttack;
    const expected = power * moveAccuracy(last) / 100 * attack * (species.types.includes(type) ? 1.5 : 1);
    if (expected > score) { score = expected; best = last; }
  }
  return describeMove(best || last || 'struggle');
}
export function chooseBattleMove(attacker: PokemonInstance, defender: PokemonInstance): MoveData {
  const species = getPokemonSpecies(attacker.speciesId), target = getPokemonSpecies(defender.speciesId);
  const learn = reference.dex[attacker.speciesId]?.learn || [];
  let best = 'struggle', score = -1;
  for (const [level, key] of learn) {
    if (Number(level) > attacker.level || reference.blacklist.includes(String(key))) continue;
    const entry = MOVES[key], power = movePower(String(key));
    if (!entry || power <= 0) continue;
    const type = (entry.type[0].toUpperCase() + entry.type.slice(1)) as PokemonType;
    const physical = entry.cat === 'phys';
    const attack = physical ? attacker.stats.attack : attacker.stats.spAttack;
    const defense = physical ? defender.stats.defense : defender.stats.spDefense;
    const expected = ((2 * attacker.level / 5 + 2) * power * attack / Math.max(1, defense) / 50 + 2) * moveAccuracy(String(key)) * (species.types.includes(type) ? 1.5 : 1) * getTypeMultiplier([type], target.types);
    if (expected > score) { score = expected; best = String(key); }
  }
  return describeMove(best);
}

function describeMove(key: string): MoveData {
  const data = MOVES[key] || MOVES.tackle;
  const type = (data.type[0].toUpperCase() + data.type.slice(1)) as PokemonType;
  const effect = ({ Fire: 'fire', Water: 'water', Grass: 'grass', Electric: 'electric', Psychic: 'psychic', Ice: 'ice', Poison: 'poison', Ground: 'ground', Rock: 'rock', Ghost: 'ghost', Dragon: 'dragon', Fairy: 'fairy', Bug: 'bug' } as const)[type] || 'impact';
  return { key, name: key.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' '), type, category: data.cat === 'phys' ? 'physical' : 'special', effectType: effect };
}

export function captureOutcome(enemy: PokemonInstance, duplicate: boolean, captureMultiplier: number, random: () => number, master = false) {
  const probability = master || duplicate ? 1 : Math.min(.6 * captureMultiplier, (reference.dex[enemy.speciesId]?.captureRate || 45) * .6 / 255 * captureMultiplier);
  const threshold = Math.pow(probability, .25);
  let shakes = 0;
  while (shakes < 4 && random() < threshold) shakes++;
  return { success: shakes === 4, shakes: Math.min(3, shakes), probability };
}
