import { mainMove } from '../game/domain/chapterOne';
import { PokemonInstance } from '../types/game';

export function experiencePercent(mon: PokemonInstance) {
  return mon.level >= 100 ? 100 : Math.max(0, Math.min(100, mon.exp / Math.max(1, mon.expToNextLevel) * 100));
}
export function collectionMove(mon: PokemonInstance) {
  return mainMove(mon).name;
}
export function totalStats(mon: PokemonInstance) {
  return Object.values(mon.stats).reduce((sum, value) => sum + value, 0);
}
