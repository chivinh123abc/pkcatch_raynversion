import type {CSSProperties} from 'react';
import {pokemonRarity} from '../game/presentation/pokemonRarity';
import '../styles/rarity-reference.css';
import '../styles/rarity.css';

export function RarityGlow({id}:{id:number}) {
  const tier=pokemonRarity(id);
  return <i className={`tglow t-${tier.key}`} style={{'--tc':tier.color} as CSSProperties} aria-hidden="true"/>;
}
