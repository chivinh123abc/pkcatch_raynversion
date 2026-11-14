import { getPokemonSpecies, TYPE_MOVES_MAP } from '../data/pokemonData';
import { PokemonInstance } from '../types/game';

export function experiencePercent(mon: PokemonInstance) {
  return mon.level >= 100 ? 100 : Math.max(0, Math.min(100, mon.exp / Math.max(1, mon.expToNextLevel) * 100));
}
export function collectionMove(mon: PokemonInstance) {
  const type = getPokemonSpecies(mon.speciesId).types[0];
  const pool = TYPE_MOVES_MAP[type];
  return (pool?.find(move => move.type === type) || pool?.[0])?.name || '—';
}
export function totalStats(mon: PokemonInstance) {
  return Object.values(mon.stats).reduce((sum, value) => sum + value, 0);
}
