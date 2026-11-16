import { getPokemonSpriteUrl } from '../data/pokemonData';
import BOUNDS from '../data/spriteBounds.json';

/** Compact box icons for list cells; large modal art lives in PokemonArt. */
export function PokemonSprite({ id, shiny = false, size = 132, scale: fixedScale, unknown = false }: { id: number; shiny?: boolean; size?: number; scale?: number; unknown?: boolean }) {
  const bounds = BOUNDS[`assets/pokemon/${shiny ? 'shiny/' : ''}${id}.png`] || [0, 0, 68, 56];
  const width = bounds[2] - bounds[0], height = bounds[3] - bounds[1];
  const scale = fixedScale || Math.max(1, Math.floor(size / Math.max(width, height)));
  return <span className={`replica-sprite ${unknown ? 'unknown' : ''}`} style={{ '--sprite-k': scale, width: `calc(${width}px * var(--sprite-k))`, height: `calc(${height}px * var(--sprite-k))` } as React.CSSProperties}>
    <img src={getPokemonSpriteUrl(id, shiny)} alt="" draggable={false} style={{ width: 'calc(68px * var(--sprite-k))', height: 'calc(56px * var(--sprite-k))', left: `calc(${-bounds[0]}px * var(--sprite-k))`, top: `calc(${-bounds[1]}px * var(--sprite-k))` }} />
  </span>;
}
