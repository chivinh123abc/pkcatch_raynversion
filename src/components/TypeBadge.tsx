import type { CSSProperties } from 'react';
import type { PokemonType } from '../types/game';
import { TYPE_COLORS } from '../data/typeChart';

export function TypeBadge({ type, small = false }: { type: PokemonType; small?: boolean }) {
  return <span className={`type${small ? ' sm' : ''}`} data-type={type.toLowerCase()} style={{ '--tc': TYPE_COLORS[type], background: 'var(--tc)' } as CSSProperties}>{type}</span>;
}
