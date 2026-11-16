import { getPokemonSpriteUrl } from '../../data/pokemonData';
import BOUNDS from '../../data/spriteBounds.json';

const cache = new Map<string, Promise<{ source: string; url: string; width: number; height: number }>>();
export function battleSpriteBounds(id: number, shiny = false): number[] {
  return BOUNDS[`assets/pokemon/${shiny ? 'shiny/' : ''}${id}.png`] || [0,0,68,56];
}

/** Match native UI.trimSprite: effects target the visible Pokémon, not its transparent box. */
export function loadBattleSprite(id: number, shiny = false) {
  const source = getPokemonSpriteUrl(id, shiny);
  if (!cache.has(source)) cache.set(source, (async () => {
    const image = new Image(); image.src = source; await image.decode();
    const [x0,y0,x1,y1] = battleSpriteBounds(id, shiny), width = x1-x0, height = y1-y0;
    const canvas = document.createElement('canvas'); canvas.width=width; canvas.height=height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('No sprite canvas context');
    context.drawImage(image,x0,y0,width,height,0,0,width,height);
    return { source, url:canvas.toDataURL('image/png'),width,height };
  })().catch(() => ({ source,url:source,width:68,height:56 })));
  return cache.get(source)!;
}
