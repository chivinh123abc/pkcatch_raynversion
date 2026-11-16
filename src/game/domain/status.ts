import reference from '../../data/chapterOneReference.json';
import { getPokemonSpecies } from '../../data/pokemonData';
import type { PokemonInstance } from '../../types/game';

export function beforeTurn(mon: PokemonInstance, random: () => number) {
  const next = { ...mon };
  let message = '', skip = false;
  if (next.status === 'sleep') {
    if ((next.sleepTurns || 0) > 0) { next.sleepTurns--; skip = true; message = 'is fast asleep…'; }
    else { delete next.status; delete next.sleepTurns; message = 'woke up!'; }
  } else if (next.status === 'freeze') {
    if (random() < .2) { delete next.status; message = 'thawed out!'; }
    else { skip = true; message = 'is frozen solid!'; }
  } else if (next.status === 'paralysis' && random() < .25) { skip = true; message = "is paralyzed! It can't move!"; }
  if (!skip && next.confusedTurns) {
    next.confusedTurns--;
    if (!next.confusedTurns) message = 'snapped out of its confusion!';
    else if (random() < .33) {
      const damage = Math.max(1, Math.floor((2 * next.level / 5 + 2) * 40 * next.stats.attack / next.stats.defense / 50 + 2));
      next.currentHp = Math.max(0, next.currentHp - damage); skip = true; message = 'hurt itself in its confusion!';
    }
  }
  return { mon: next, skip, message };
}
export function afterTurn(mon: PokemonInstance): PokemonInstance {
  return mon.currentHp > 0 && (mon.status === 'burn' || mon.status === 'poison') ? { ...mon, currentHp: Math.max(0, mon.currentHp - Math.max(1, Math.floor(mon.maxHp / 8))) } : mon;
}
export function inflictStatus(mon: PokemonInstance, key: string, random: () => number): PokemonInstance {
  const rule = reference.status.MOVES[key];
  if (!rule || mon.currentHp <= 0 || random() * 100 >= Number(rule[1])) return mon;
  const status = String(rule[0]), types = getPokemonSpecies(mon.speciesId).types;
  if (status === 'confusion') return mon.confusedTurns ? mon : { ...mon, confusedTurns: 2 + Math.floor(random() * 4) };
  if (mon.status || status === 'burn' && types.includes('Fire') || status === 'poison' && (types.includes('Poison') || types.includes('Steel')) || status === 'freeze' && types.includes('Ice')) return mon;
  return { ...mon, status: status as PokemonInstance['status'], ...(status === 'sleep' ? { sleepTurns: 1 + Math.floor(random() * 3) } : {}) };
}
