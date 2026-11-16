import type { ChapterInfo } from './chaptersData';
type FoundPokemon = ChapterInfo['pokemonFound']['base'][number];
export const KANTO7_AREAS: Record<string, { count: string; rain?: boolean; pokemon: FoundPokemon[] }> = {
  'Routes 19-20': {
    count: '10/11',
    rain: true,
    pokemon: [
      { speciesId: 72, name: 'Tentacool', rate: '16%', caught: true },
      { speciesId: 73, name: 'Tentacruel', rate: '16%', caught: true },
      { speciesId: 90, name: 'Shellder', rate: '11%', caught: true },
      { speciesId: 91, name: 'Cloyster', rate: '11%', caught: true },
      { speciesId: 130, name: 'Gyarados', rate: '8%', caught: true },
      { speciesId: 129, name: 'Magikarp', rate: '3%', caught: true },
    ],
  },
  'Power Plant': {
    count: '6/7',
    pokemon: [
      { speciesId: 100, name: 'Voltorb', rate: '48%', caught: true },
      { speciesId: 101, name: 'Electrode', rate: '17%', caught: true },
      { speciesId: 25, name: 'Pikachu', rate: '10%', caught: true },
      { speciesId: 81, name: 'Magnemite', rate: '10%', caught: true },
      { speciesId: 82, name: 'Magneton', rate: '7%', caught: true },
      { speciesId: 125, name: 'Electabuzz', rate: '5%', caught: true },
      { speciesId: 26, name: 'Raichu', rate: '3%', caught: true },
    ],
  },
  'Seafoam Islands': {
    count: '8/12',
    pokemon: [
      { speciesId: 86, name: 'Seel', rate: '35%', caught: true },
      { speciesId: 87, name: 'Dewgong', rate: '25%', caught: true },
      { speciesId: 90, name: 'Shellder', rate: '20%', caught: true },
      { speciesId: 91, name: 'Cloyster', rate: '12%', caught: true },
      { speciesId: 120, name: 'Staryu', rate: '13%', caught: true },
      { speciesId: 79, name: 'Slowpoke', rate: '10%', caught: true },
      { speciesId: 80, name: 'Slowbro', rate: '8%', caught: true },
      { speciesId: 54, name: 'Psyduck', rate: '7%', caught: true },
      { speciesId: 55, name: 'Golduck', rate: '5%', caught: true },
      { speciesId: 116, name: 'Horsea', rate: '4%', caught: true },
      { speciesId: 117, name: 'Seadra', rate: '<1%', caught: false },
      { speciesId: 144, name: 'Articuno', rate: '<1%', caught: false },
    ],
  },
  'Pokémon Mansion': {
    count: '8/12',
    pokemon: [
      { speciesId: 58, name: 'Growlithe', rate: '20%', caught: true },
      { speciesId: 77, name: 'Ponyta', rate: '13%', caught: true },
      { speciesId: 126, name: 'Magmar', rate: '13%', caught: true },
      { speciesId: 37, name: 'Vulpix', rate: '12%', caught: true },
      { speciesId: 88, name: 'Grimer', rate: '12%', caught: true },
      { speciesId: 109, name: 'Koffing', rate: '10%', caught: true },
      { speciesId: 19, name: 'Rattata', rate: '7%', caught: true },
      { speciesId: 89, name: 'Muk', rate: '8%', caught: true },
      { speciesId: 110, name: 'Weezing', rate: '5%', caught: true },
      { speciesId: 20, name: 'Raticate', rate: '<1%', caught: true },
      { speciesId: 146, name: 'Moltres', rate: '<1%', caught: false },
      { speciesId: 132, name: 'Ditto', rate: '<1%', caught: false },
    ],
  },
  'Cinnabar Gym': {
    count: '4/5',
    pokemon: [
      { speciesId: 77, name: 'Ponyta', rate: '35%', caught: true },
      { speciesId: 37, name: 'Vulpix', rate: '30%', caught: true },
      { speciesId: 78, name: 'Rapidash', rate: '20%', caught: true },
      { speciesId: 58, name: 'Growlithe', rate: '15%', caught: true },
      { speciesId: 59, name: 'Arcanine', rate: '<1%', caught: false },
    ],
  },
};

