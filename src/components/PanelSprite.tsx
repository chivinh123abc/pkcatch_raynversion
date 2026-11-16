import { getPokemonSpriteUrl } from '../data/pokemonData';
import bounds from '../data/spriteBounds.json';

/** The reference centers the visible pixels, then clips the 68×56 sprite inside its cell. */
export function PanelSprite({ id, shiny = false, rail = false, tile = 60 }: { id: number; shiny?: boolean; rail?: boolean; tile?: number }) {
  const box = bounds[`assets/pokemon/${shiny ? 'shiny/' : ''}${id}.png`] || [19, 20, 49, 50];
  const dimension = Math.max(box[2] - box[0], box[3] - box[1]);
  // Native fitScale chooses only 1× or 2×; small species must never jump to 3×.
  const scale = rail ? tile >= 56 && dimension * 2 <= tile - 8 ? 2 : 1 : Math.min(44, Math.max(28, dimension * 1.3)) / dimension;
  const x = Math.round(34 - (box[0] + box[2]) / 2) * scale;
  const y = Math.round(28 - (box[1] + box[3]) / 2) * scale;
  return <span className="sprbox" style={{ height: rail ? 56 * scale : 48 }}><img src={getPokemonSpriteUrl(id, shiny)} alt="" draggable={false} style={{ width: 68 * scale, height: 56 * scale, transform: `translate(${x}px, ${y}px)` }} /></span>;
}
