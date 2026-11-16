import { forwardRef, useEffect, useState } from 'react';
import { getPokemonSpriteUrl } from '../data/pokemonData';
import { battleSpriteBounds, loadBattleSprite } from '../game/presentation/battleSprite';

export const BattleSprite = forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement> & { idNumber: number; shiny?: boolean }>(function BattleSprite({ idNumber, shiny = false, style, ...props },ref) {
  const source = getPokemonSpriteUrl(idNumber,shiny), box=battleSpriteBounds(idNumber,shiny);
  const [loaded,setLoaded]=useState<{source:string;url:string;width:number;height:number}|null>(null);
  useEffect(()=>{let current=true;loadBattleSprite(idNumber,shiny).then(sprite=>{if(current)setLoaded(sprite);});return()=>{current=false;};},[idNumber,shiny]);
  const ready=loaded?.source===source ? loaded : null;
  return <img {...props} ref={ref} src={ready?.url || source} style={{...style,'--sprite-width':`${ready?.width || box[2]-box[0]}px`,'--sprite-height':`${ready?.height || box[3]-box[1]}px`,visibility:ready ? style?.visibility : 'hidden'} as React.CSSProperties} />;
});
