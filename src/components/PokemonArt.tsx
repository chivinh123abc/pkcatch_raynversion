import { useEffect, useRef, useState } from 'react';
import { getPokemonArtUrl } from '../data/pokemonData';
import SPRITES from '../data/showdownSprites.json';
import BOUNDS from '../data/spriteBounds.json';
import { PokemonSprite } from './PokemonSprite';

/** Large artwork is separate from the 68×56 icons used by the battle field and lists. */
export function PokemonArt({ id, shiny = false, size = 128, unknown = false, animated = true }: { id: number; shiny?: boolean; size?: number; unknown?: boolean; animated?: boolean }) {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [failed, setFailed] = useState<string | null>(null);
  const image = useRef<HTMLImageElement>(null);
  const source = getPokemonArtUrl(id, shiny), meta = SPRITES[id]?.[shiny ? 'gen5ani-shiny' : 'gen5ani'];
  const still = unknown || reduced || !animated;
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)'), update = () => setReduced(media.matches);
    media.addEventListener('change', update); return () => media.removeEventListener('change', update);
  }, []);
  const freeze = () => {
    const img = image.current;
    if (!still || !img?.complete || !img.naturalWidth || img.src.startsWith('data:')) return;
    const canvas = document.createElement('canvas'); canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
    const context = canvas.getContext('2d');
    if (context) { context.drawImage(img,0,0); img.src = canvas.toDataURL('image/png'); }
  };
  if (!meta || failed === source) return <PokemonSprite id={id} shiny={shiny} size={size} unknown={unknown} />;
  const scale = Math.min(2, size / Math.max(meta.width, meta.height));
  const bounds = BOUNDS[`assets/pokemon/art/${shiny ? 'shiny/' : ''}still/${id}.png`];
  const x = bounds ? Math.round((meta.width-bounds[0]-bounds[2])/2*scale) : 0;
  const y = bounds ? Math.round((meta.height-bounds[1]-bounds[3])/2*scale) : 0;
  return <span className={`pokemon-art${unknown ? ' unknown' : ''}`} style={{ width:meta.width*scale,height:meta.height*scale }}>
    <img ref={image} key={`${source}:${still}`} src={source} alt="" draggable={false} onLoad={freeze} onError={() => setFailed(source)} style={{width:'100%',height:'100%',translate:`${x}px ${y}px`}} />
  </span>;
}
