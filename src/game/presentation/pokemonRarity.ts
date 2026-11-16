import reference from '../../data/pokemonRarity.json';

/** Native tierIndex includes evolution/stat/legendary rules, beyond capture rate alone. */
export function pokemonRarity(speciesId: number) {
  const index: number = reference.species[speciesId] ?? 0;
  return {...reference.tiers[index],index};
}
