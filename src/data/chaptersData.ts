import { StepNode } from '../types/game';
import { ROUTE_1_STEPS } from './routes';
import { chapterReference, generateChapterSteps } from '../game/data/chapterGenerator';
import { KANTO_CHAPTER_CATALOG } from '../game/data/chapterCatalog';
import { getPokemonSpecies } from './pokemonData';

export interface ChapterInfo {
  themeColor?: string;
  runtimeSupported?: boolean;
  completionKey?: string;
  id: string;
  chapterNumber: number;
  name: string;
  badgeName: string;
  badgeSprite: string;
  leaderName: string;
  leaderSprite: string;
  leaderType: string;
  region: string;
  recommendedLevel: string;
  rewardMoneyRange: string;
  weather?: 'rain' | 'thunderstorm' | 'clear';
  weatherLabel?: string;
  isSpecial?: boolean;
  specialIcon?: string;
  specialCount?: string;
  bgScene: string;
  gymBackdrop: string;
  items: { name: string; icon: string }[];
  pokemonFound: {
    base: { speciesId: number; name: string; rate: string; caught: boolean }[];
    night?: { speciesId: number; name: string; rate: string; caught: boolean }[];
    day?: { speciesId: number; name: string; rate: string; caught: boolean }[];
    rain?: { speciesId: number; name: string; rate: string; caught: boolean }[];
  };
  totalSteps: number;
  steps: StepNode[];
}

/**
 * Danh sách 19 bước chuẩn của Chapter 1: Boulder Badge (Route 1 -> Viridian Forest -> Pewter Gym)
 */
export const CHAPTER_1_STEPS: StepNode[] = [
  { step: 1, type: 'grass', name: 'Route 1 · Wild Pokémon' },
  { step: 2, type: 'grass', name: 'Route 1 · Wild Pokémon' },
  { step: 3, type: 'grass', name: 'Route 1 · Wild Pokémon' },
  { step: 4, type: 'grass', name: 'Route 1 · Wild Pokémon' },
  { step: 5, type: 'question', name: 'Route 1 · Mystery Item' },
  { step: 6, type: 'center', name: 'Viridian City · Pokémon Center' },
  { step: 7, type: 'grass', name: 'Route 2 · Wild Pokémon' },
  { step: 8, type: 'grass', name: 'Route 2 · Wild Pokémon' },
  { step: 9, type: 'grass', name: 'Viridian Forest · Wild Pokémon' },
  { step: 10, type: 'grass', name: 'Viridian Forest · Wild Pokémon' },
  { step: 11, type: 'question', name: 'Viridian Forest · Hidden Item' },
  { step: 12, type: 'center', name: 'Viridian Forest · Rest Stop' },
  { step: 13, type: 'question', name: 'Viridian Forest · Mystery Gift' },
  { step: 14, type: 'center', name: 'Viridian Forest · Pokémon Center' },
  { step: 15, type: 'grass', name: 'Viridian Forest · Deep Grass' },
  { step: 16, type: 'question', name: 'Pewter City · Museum Item' },
  { step: 17, type: 'center', name: 'Pewter City · Pokémon Center' },
  {
    step: 18,
    type: 'red',
    name: 'Pewter Gym · Camper Liam',
    trainer: {
      name: 'Camper Liam',
      title: 'Camper Liam',
      sprite: 'camper',
      team: [
        { speciesId: 74, level: 11 }, // Geodude
        { speciesId: 27, level: 11 }, // Sandshrew
      ],
      rewardMoney: 450,
    },
  },
  {
    step: 19,
    type: 'badge',
    name: 'Pewter Gym · Gym Leader Brock',
    badgeId: 'boulder-badge',
    trainer: {
      name: 'Leader Brock',
      title: 'Gym Leader Brock',
      sprite: 'brock',
      team: [
        { speciesId: 74, level: 14 }, // Geodude Lv.14
        { speciesId: 95, level: 15 }, // Onix Lv.15 (Ace)
      ],
      rewardMoney: 1500,
    },
  },
];

/**
 * Danh sách 30 bước chuẩn của Chapter 7: Volcano Badge (Routes 19-20 -> Seafoam Islands -> Blaine Gym)
 * Khớp 100% video gameplay.mp4 (Sabine, Twins Lina & Ambre, Blaine, Tentacool, Shellder, Gyarados)
 */
export const CHAPTER_7_STEPS: StepNode[] = [
  // 1-5: Routes 19-20 (Biển, Mưa)
  { step: 1, type: 'grass', name: 'Routes 19-20 · Sea Encounter' },
  { step: 2, type: 'grass', name: 'Routes 19-20 · Sea Encounter' },
  {
    step: 3,
    type: 'red',
    name: 'Routes 19-20 · Team Rocket Grunt Sabine',
    trainer: {
      name: 'Team Rocket Grunt Sabine',
      title: 'Team Rocket Grunt Sabine',
      sprite: 'rocketgrunt-f',
      team: [
        { speciesId: 130, level: 56 }, // Gyarados Lv.56
        { speciesId: 110, level: 56 }, // Weezing Lv.56
      ],
      rewardMoney: 1850,
    },
  },
  { step: 4, type: 'grass', name: 'Routes 19-20 · Sea Encounter' },
  { step: 5, type: 'grass', name: 'Routes 19-20 · Sea Encounter' },
  
  // 6-8: Power Plant (Centrale)
  { step: 6, type: 'grass', name: 'Power Plant · Electric Chamber' },
  { step: 7, type: 'question', name: 'Power Plant · Hidden Machine' },
  {
    step: 8,
    type: 'red',
    name: 'Power Plant · Scientist Rodney',
    trainer: {
      name: 'Scientist Rodney',
      title: 'Scientist Rodney',
      sprite: 'scientist',
      team: [
        { speciesId: 82, level: 54 },  // Magneton Lv.54
        { speciesId: 101, level: 55 }, // Electrode Lv.55
      ],
      rewardMoney: 1600,
    },
  },

  // 9: Center
  { step: 9, type: 'center', name: 'Power Plant · Recharge Station' },

  // 10-16: Seafoam Islands (Îles Écume - Hang băng tuyết)
  { step: 10, type: 'grass', name: 'Seafoam Islands · Ice Cave 1F' },
  { step: 11, type: 'grass', name: 'Seafoam Islands · Ice Cave 2F' },
  { step: 12, type: 'question', name: 'Seafoam Islands · Frozen Chest' },
  { step: 13, type: 'grass', name: 'Seafoam Islands · Deep Cavern' },
  { step: 14, type: 'grass', name: 'Seafoam Islands · Water Current' },
  {
    step: 15,
    type: 'red',
    name: 'Seafoam Islands · Twins Lina & Ambre',
    trainer: {
      name: 'Twins Lina & Ambre',
      title: 'Twins Lina & Ambre',
      sprite: 'twins',
      team: [
        { speciesId: 87, level: 58 }, // Dewgong Lv.58
      ],
      rewardMoney: 2100,
    },
  },
  { step: 16, type: 'question', name: 'Seafoam Islands · Rare Item' },

  // 17: Cinnabar Center
  { step: 17, type: 'center', name: 'Cinnabar Island · Pokémon Center' },

  // 18-24: Pokémon Mansion (Manoir Pokémon)
  { step: 18, type: 'grass', name: 'Pokémon Mansion · 1F' },
  { step: 19, type: 'grass', name: 'Pokémon Mansion · 2F' },
  { step: 20, type: 'question', name: 'Pokémon Mansion · Secret Diary' },
  {
    step: 21,
    type: 'red',
    name: 'Pokémon Mansion · Burglar Arnie',
    trainer: {
      name: 'Burglar Arnie',
      title: 'Burglar Arnie',
      sprite: 'burglar',
      team: [
        { speciesId: 126, level: 57 }, // Magmar Lv.57
        { speciesId: 58, level: 57 },  // Growlithe Lv.57
      ],
      rewardMoney: 1900,
    },
  },
  { step: 22, type: 'grass', name: 'Pokémon Mansion · Basement' },
  { step: 23, type: 'grass', name: 'Pokémon Mansion · Deep Lab' },
  { step: 24, type: 'question', name: 'Pokémon Mansion · Secret Key' },

  // 25: Cinnabar Center
  { step: 25, type: 'center', name: 'Cinnabar Island · Pokémon Center' },

  // 26-30: Cinnabar Gym (Blaine)
  { step: 26, type: 'grass', name: 'Cinnabar Gym · Quiz Hall' },
  { step: 27, type: 'question', name: 'Cinnabar Gym · Fire Stone' },
  {
    step: 28,
    type: 'red',
    name: 'Cinnabar Gym · Super Nerd Erik',
    trainer: {
      name: 'Super Nerd Erik',
      title: 'Super Nerd Erik',
      sprite: 'supernerd',
      team: [
        { speciesId: 77, level: 58 }, // Ponyta Lv.58
        { speciesId: 37, level: 58 }, // Vulpix Lv.58
      ],
      rewardMoney: 1750,
    },
  },
  {
    step: 29,
    type: 'red',
    name: 'Cinnabar Gym · Ace Trainer Derek',
    trainer: {
      name: 'Ace Trainer Derek',
      title: 'Ace Trainer Derek',
      sprite: 'acetrainer',
      team: [
        { speciesId: 78, level: 60 }, // Rapidash Lv.60
      ],
      rewardMoney: 2200,
    },
  },
  {
    step: 30,
    type: 'badge',
    name: 'Cinnabar Gym · Gym Leader Blaine',
    badgeId: 'volcano-badge',
    trainer: {
      name: 'Leader Blaine',
      title: 'Gym Leader Blaine',
      sprite: 'blaine',
      team: [
        { speciesId: 58, level: 58 },  // Growlithe Lv.58
        { speciesId: 77, level: 58 },  // Ponyta Lv.58
        { speciesId: 78, level: 60 },  // Rapidash Lv.60
        { speciesId: 59, level: 62 },  // Arcanine Lv.62 (Ace)
      ],
      rewardMoney: 4700,
    },
  },
];

const LEGACY_CHAPTERS: ChapterInfo[] = [
  {
    id: 'kanto-1',
    chapterNumber: 1,
    name: 'Boulder Badge',
    badgeName: 'Boulder Badge',
    badgeSprite: 'boulder-badge',
    leaderName: 'Brock',
    leaderSprite: 'brock',
    leaderType: 'Rock',
    region: 'Kanto',
    recommendedLevel: 'Lv. 14-20',
    rewardMoneyRange: '400-2,400 ₽',
    bgScene: '/assets/bg/scenes/01-prairie-ouverte-710x400.webp',
    gymBackdrop: '/assets/bg/scenes/26-arene-pierre-710x400.webp',
    items: [
      { name: 'Poké Ball', icon: '/assets/ui/poke-ball.png' },
      { name: 'Rare Candy', icon: '/assets/items/rare-candy.png' },
      { name: 'Exp Candy M', icon: '/assets/items/exp-candy-m.png' },
      { name: 'Razz Berry', icon: '/assets/ui/razz-berry.png' },
      { name: 'Nanab Berry', icon: '/assets/ui/nanab-berry.png' },
      { name: 'Pinap Berry', icon: '/assets/ui/pinap-berry.png' },
    ],
    pokemonFound: {
      base: [
        { speciesId: 19, name: 'Rattata', rate: '45%', caught: true },
        { speciesId: 21, name: 'Spearow', rate: '25%', caught: true },
        { speciesId: 50, name: 'Diglett', rate: '15%', caught: true },
      ],
      night: [
        { speciesId: 43, name: 'Oddish', rate: '25%', caught: true },
        { speciesId: 48, name: 'Venonat', rate: '20%', caught: true },
      ],
      day: [
        { speciesId: 16, name: 'Pidgey', rate: '55%', caught: true },
        { speciesId: 10, name: 'Caterpie', rate: '20%', caught: true },
        { speciesId: 13, name: 'Weedle', rate: '20%', caught: true },
        { speciesId: 11, name: 'Metapod', rate: '10%', caught: true },
        { speciesId: 14, name: 'Kakuna', rate: '10%', caught: true },
        { speciesId: 12, name: 'Butterfree', rate: '5%', caught: true },
        { speciesId: 15, name: 'Beedrill', rate: '5%', caught: true },
      ],
      rain: [
        { speciesId: 60, name: 'Poliwag', rate: '8%', caught: true },
      ],
    },
    totalSteps: ROUTE_1_STEPS.length,
    steps: ROUTE_1_STEPS,
  },
  {
    id: 'kanto-2',
    chapterNumber: 2,
    name: 'Cascade Badge',
    badgeName: 'Cascade Badge',
    badgeSprite: 'cascade-badge',
    leaderName: 'Misty',
    leaderSprite: 'misty',
    leaderType: 'Water',
    region: 'Kanto',
    recommendedLevel: 'Lv. 21-24',
    rewardMoneyRange: '600-2,800 ₽',
    bgScene: '/assets/bg/scenes/01-prairie-ouverte-710x400.webp',
    gymBackdrop: '/assets/bg/scenes/01-prairie-ouverte-710x400.webp',
    items: [{ name: 'Water Stone', icon: '/assets/items/water-stone.png' }],
    pokemonFound: {
      base: [
        { speciesId: 120, name: 'Staryu', rate: '35%', caught: true },
        { speciesId: 54, name: 'Psyduck', rate: '25%', caught: true },
        { speciesId: 118, name: 'Goldeen', rate: '20%', caught: true },
      ],
    },
    totalSteps: 20,
    steps: CHAPTER_1_STEPS,
  },
  {
    id: 'special-mewtwo',
    chapterNumber: 0,
    name: 'Mewtwo',
    badgeName: 'Cerulean Cave',
    badgeSprite: 'boulder-badge',
    leaderName: 'Mewtwo',
    leaderSprite: 'psychic',
    leaderType: 'Psychic',
    region: 'Kanto',
    recommendedLevel: 'Lv. 100',
    rewardMoneyRange: '10,000 ₽',
    isSpecial: true,
    specialIcon: '150', // Mewtwo
    bgScene: '/assets/bg/scenes/12-foret-jade-v2-710x400.webp',
    gymBackdrop: '/assets/bg/scenes/12-foret-jade-v2-710x400.webp',
    items: [{ name: 'Master Ball', icon: '/assets/items/master-ball.png' }],
    pokemonFound: {
      base: [{ speciesId: 150, name: 'Mewtwo', rate: '100%', caught: false }],
    },
    totalSteps: 10,
    steps: [
      ...Array.from({ length: 9 }, (_, index) => ({
        step: index + 1,
        type: 'grass' as const,
        name: `Cerulean Cave · Floor ${index + 1}`,
      })),
      {
        step: 10,
        type: 'badge',
        name: 'Cerulean Cave · Mewtwo',
        trainer: {
          name: 'Mewtwo',
          title: 'Legendary Pokémon',
          sprite: 'psychic',
          team: [{ speciesId: 150, level: 100 }],
          rewardMoney: 10000,
        },
      },
    ],
  },
  {
    id: 'kanto-3',
    chapterNumber: 3,
    name: 'Thunder Badge',
    badgeName: 'Thunder Badge',
    badgeSprite: 'thunder-badge',
    leaderName: 'Lt. Surge',
    leaderSprite: 'ltsurge',
    leaderType: 'Electric',
    region: 'Kanto',
    recommendedLevel: 'Lv. 23-30',
    rewardMoneyRange: '800-3,200 ₽',
    weather: 'thunderstorm',
    weatherLabel: 'Thunderstorm',
    bgScene: '/assets/bg/scenes/01-prairie-ouverte-710x400.webp',
    gymBackdrop: '/assets/bg/scenes/01-prairie-ouverte-710x400.webp',
    items: [{ name: 'Thunder Stone', icon: '/assets/items/thunder-stone.png' }],
    pokemonFound: {
      base: [
        { speciesId: 100, name: 'Voltorb', rate: '35%', caught: true },
        { speciesId: 25, name: 'Pikachu', rate: '20%', caught: true },
        { speciesId: 81, name: 'Magnemite', rate: '25%', caught: true },
      ],
    },
    totalSteps: 22,
    steps: CHAPTER_1_STEPS,
  },
  {
    id: 'kanto-4',
    chapterNumber: 4,
    name: 'Rainbow Badge',
    badgeName: 'Rainbow Badge',
    badgeSprite: 'rainbow-badge',
    leaderName: 'Erika',
    leaderSprite: 'erika',
    leaderType: 'Grass',
    region: 'Kanto',
    recommendedLevel: 'Lv. 31-38',
    rewardMoneyRange: '1,200-3,600 ₽',
    bgScene: '/assets/bg/scenes/12-foret-jade-v2-710x400.webp',
    gymBackdrop: '/assets/bg/scenes/12-foret-jade-v2-710x400.webp',
    items: [{ name: 'Leaf Stone', icon: '/assets/items/leaf-stone.png' }],
    pokemonFound: {
      base: [
        { speciesId: 114, name: 'Tangela', rate: '30%', caught: true },
        { speciesId: 44, name: 'Gloom', rate: '25%', caught: true },
        { speciesId: 70, name: 'Weepinbell', rate: '25%', caught: true },
      ],
    },
    totalSteps: 24,
    steps: CHAPTER_1_STEPS,
  },
  {
    id: 'kanto-5',
    chapterNumber: 5,
    name: 'Soul Badge',
    badgeName: 'Soul Badge',
    badgeSprite: 'soul-badge',
    leaderName: 'Koga',
    leaderSprite: 'koga',
    leaderType: 'Poison',
    region: 'Kanto',
    recommendedLevel: 'Lv. 40-46',
    rewardMoneyRange: '1,500-4,200 ₽',
    weather: 'thunderstorm',
    weatherLabel: 'Thunderstorm',
    bgScene: '/assets/bg/scenes/12-foret-jade-v2-710x400.webp',
    gymBackdrop: '/assets/bg/scenes/12-foret-jade-v2-710x400.webp',
    items: [{ name: 'Poison Barb', icon: '/assets/items/rare-candy.png' }],
    pokemonFound: {
      base: [
        { speciesId: 109, name: 'Koffing', rate: '35%', caught: true },
        { speciesId: 88, name: 'Grimer', rate: '30%', caught: true },
        { speciesId: 49, name: 'Venomoth', rate: '20%', caught: true },
      ],
    },
    totalSteps: 25,
    steps: CHAPTER_1_STEPS,
  },
  {
    id: 'kanto-6',
    chapterNumber: 6,
    name: 'Marsh Badge',
    badgeName: 'Marsh Badge',
    badgeSprite: 'marsh-badge',
    leaderName: 'Sabrina',
    leaderSprite: 'sabrina',
    leaderType: 'Psychic',
    region: 'Kanto',
    recommendedLevel: 'Lv. 46-54',
    rewardMoneyRange: '1,800-4,600 ₽',
    bgScene: '/assets/bg/scenes/01-prairie-ouverte-710x400.webp',
    gymBackdrop: '/assets/bg/scenes/01-prairie-ouverte-710x400.webp',
    items: [{ name: 'Twisted Spoon', icon: '/assets/items/rare-candy.png' }],
    pokemonFound: {
      base: [
        { speciesId: 64, name: 'Kadabra', rate: '35%', caught: true },
        { speciesId: 122, name: 'Mr. Mime', rate: '25%', caught: true },
        { speciesId: 97, name: 'Hypno', rate: '25%', caught: true },
      ],
    },
    totalSteps: 26,
    steps: CHAPTER_1_STEPS,
  },
  {
    id: 'kanto-7',
    chapterNumber: 7,
    name: 'Volcano Badge',
    badgeName: 'Volcano Badge',
    badgeSprite: 'volcano-badge',
    leaderName: 'Blaine',
    leaderSprite: 'blaine',
    leaderType: 'Fire',
    region: 'Kanto',
    recommendedLevel: 'Lv. 53-62',
    rewardMoneyRange: '2,000-5,000 ₽',
    weather: 'rain',
    weatherLabel: 'Rain',
    bgScene: '/assets/bg/scenes/sea-travel.webp',
    gymBackdrop: '/assets/bg/scenes/55-casino-celadopole-710x400.webp',
    items: [
      { name: 'Fire Stone', icon: '/assets/items/fire-stone.png' },
      { name: 'Ultra Ball', icon: '/assets/items/ultra-ball.png' },
      { name: 'Exp Candy XL', icon: '/assets/items/exp-candy-xl.png' },
      { name: 'Rare Candy', icon: '/assets/items/rare-candy.png' },
    ],
    pokemonFound: {
      base: [
        { speciesId: 72, name: 'Tentacool', rate: '16%', caught: true },
        { speciesId: 73, name: 'Tentacruel', rate: '16%', caught: true },
        { speciesId: 90, name: 'Shellder', rate: '11%', caught: true },
        { speciesId: 91, name: 'Cloyster', rate: '11%', caught: true },
        { speciesId: 130, name: 'Gyarados', rate: '8%', caught: true },
        { speciesId: 129, name: 'Magikarp', rate: '3%', caught: true },
      ],
      night: [
        { speciesId: 120, name: 'Staryu', rate: '13%', caught: true },
      ],
      rain: [
        { speciesId: 90, name: 'Shellder', rate: '10%', caught: true },
        { speciesId: 91, name: 'Cloyster', rate: '8%', caught: true },
        { speciesId: 116, name: 'Horsea', rate: '4%', caught: true },
        { speciesId: 117, name: 'Seadra', rate: '<1%', caught: true },
      ],
    },
    totalSteps: 30,
    steps: CHAPTER_7_STEPS,
  },
  {
    id: 'special-power-plant',
    chapterNumber: 0,
    name: 'Power Plant',
    badgeName: 'Power Plant',
    badgeSprite: 'thunder-badge',
    leaderName: 'Zapdos',
    leaderSprite: 'scientist',
    leaderType: 'Electric',
    region: 'Kanto',
    recommendedLevel: 'Lv. 40-50',
    rewardMoneyRange: '2,500 ₽',
    isSpecial: true,
    specialCount: '6/8',
    bgScene: '/assets/bg/scenes/12-foret-jade-v2-710x400.webp',
    gymBackdrop: '/assets/bg/scenes/12-foret-jade-v2-710x400.webp',
    items: [{ name: 'Magnet', icon: '/assets/items/rare-candy.png' }],
    pokemonFound: {
      base: [
        { speciesId: 100, name: 'Voltorb', rate: '48%', caught: true },
        { speciesId: 101, name: 'Electrode', rate: '17%', caught: true },
        { speciesId: 25, name: 'Pikachu', rate: '10%', caught: true },
        { speciesId: 81, name: 'Magnemite', rate: '10%', caught: true },
        { speciesId: 82, name: 'Magneton', rate: '7%', caught: true },
        { speciesId: 125, name: 'Electabuzz', rate: '5%', caught: true },
        { speciesId: 26, name: 'Raichu', rate: '3%', caught: true },
      ],
    },
    totalSteps: 15,
    steps: CHAPTER_1_STEPS,
  },
  {
    id: 'special-seafoam',
    chapterNumber: 0,
    name: 'Seafoam Islands',
    badgeName: 'Seafoam Islands',
    badgeSprite: 'cascade-badge',
    leaderName: 'Articuno',
    leaderSprite: 'twins',
    leaderType: 'Ice',
    region: 'Kanto',
    recommendedLevel: 'Lv. 50-60',
    rewardMoneyRange: '3,000 ₽',
    isSpecial: true,
    specialCount: '1/4',
    bgScene: '/assets/bg/scenes/12-foret-jade-v2-710x400.webp',
    gymBackdrop: '/assets/bg/scenes/12-foret-jade-v2-710x400.webp',
    items: [{ name: 'Never-Melt Ice', icon: '/assets/items/rare-candy.png' }],
    pokemonFound: {
      base: [
        { speciesId: 86, name: 'Seel', rate: '35%', caught: true },
        { speciesId: 87, name: 'Dewgong', rate: '25%', caught: true },
        { speciesId: 144, name: 'Articuno', rate: '100%', caught: false },
      ],
    },
    totalSteps: 15,
    steps: CHAPTER_1_STEPS,
  },
  {
    id: 'kanto-8',
    chapterNumber: 8,
    name: 'Earth Badge',
    badgeName: 'Earth Badge',
    badgeSprite: 'earth-badge',
    leaderName: 'Giovanni',
    leaderSprite: 'giovanni',
    leaderType: 'Ground',
    region: 'Kanto',
    recommendedLevel: 'Lv. 59-70',
    rewardMoneyRange: '2,500-6,000 ₽',
    bgScene: '/assets/bg/scenes/01-prairie-ouverte-710x400.webp',
    gymBackdrop: '/assets/bg/scenes/01-prairie-ouverte-710x400.webp',
    items: [{ name: 'Earth Stone', icon: '/assets/items/rare-candy.png' }],
    pokemonFound: {
      base: [
        { speciesId: 111, name: 'Rhyhorn', rate: '35%', caught: true },
        { speciesId: 112, name: 'Rhydon', rate: '25%', caught: true },
        { speciesId: 31, name: 'Nidoqueen', rate: '20%', caught: true },
        { speciesId: 34, name: 'Nidoking', rate: '20%', caught: true },
      ],
    },
    totalSteps: 30,
    steps: CHAPTER_1_STEPS,
  },
  {
    id: 'kanto-9',
    chapterNumber: 9,
    name: 'Victory Road',
    badgeName: 'Indigo Plateau',
    badgeSprite: 'earth-badge',
    leaderName: 'Blue',
    leaderSprite: 'blue',
    leaderType: 'Champion',
    region: 'Kanto',
    recommendedLevel: 'Lv. 64-75',
    rewardMoneyRange: '10,000 ₽',
    bgScene: '/assets/bg/scenes/12-foret-jade-v2-710x400.webp',
    gymBackdrop: '/assets/bg/scenes/12-foret-jade-v2-710x400.webp',
    items: [{ name: 'Champion Trophy', icon: '/assets/items/rare-candy.png' }],
    pokemonFound: {
      base: [
        { speciesId: 68, name: 'Machamp', rate: '25%', caught: true },
        { speciesId: 76, name: 'Golem', rate: '25%', caught: true },
        { speciesId: 95, name: 'Onix', rate: '30%', caught: true },
      ],
    },
    totalSteps: 35,
    steps: CHAPTER_1_STEPS,
  },
  {
    id: 'special-blazing-cave',
    chapterNumber: 0,
    name: 'Blazing Cave',
    badgeName: 'Blazing Cave',
    badgeSprite: 'volcano-badge',
    leaderName: 'Moltres',
    leaderSprite: 'firebreather',
    leaderType: 'Fire',
    region: 'Kanto',
    recommendedLevel: 'Lv. 50-60',
    rewardMoneyRange: '3,000 ₽',
    isSpecial: true,
    specialCount: '8/11',
    bgScene: '/assets/bg/scenes/55-casino-celadopole-710x400.webp',
    gymBackdrop: '/assets/bg/scenes/55-casino-celadopole-710x400.webp',
    items: [{ name: 'Charcoal', icon: '/assets/items/rare-candy.png' }],
    pokemonFound: {
      base: [
        { speciesId: 58, name: 'Growlithe', rate: '35%', caught: true },
        { speciesId: 77, name: 'Ponyta', rate: '35%', caught: true },
        { speciesId: 126, name: 'Magmar', rate: '20%', caught: true },
        { speciesId: 146, name: 'Moltres', rate: '100%', caught: false },
      ],
    },
    totalSteps: 15,
    steps: CHAPTER_1_STEPS,
  },
];

export const ALL_CHAPTERS: ChapterInfo[] = [
  ...KANTO_CHAPTER_CATALOG.chapters.map(template => {
    const ref = chapterReference(template.id), steps = generateChapterSteps(template.id), boss = steps.find(n=>n.type==='badge')!;
    const legacy = LEGACY_CHAPTERS.find(c=>c.id===template.id) || LEGACY_CHAPTERS[0];
    const number = template.sourceIndex+1, hasBadge = number<=8;
    const found = new Map<number, number>();
    for(const step of ref.steps)for(const entry of step.pools['day:clear']||[])if(entry.on)found.set(entry.id,Math.max(found.get(entry.id)||0,entry.pct));
    return {...legacy,id:template.id,chapterNumber:number,runtimeSupported:true,isSpecial:false,
      name:number<=8?legacy.name:number===9?'Victory Road':number===14?'Pokémon League Champion':`Elite Four: ${boss.trainer!.name}`,
      leaderName:boss.trainer!.name,leaderSprite:boss.trainer!.sprite,
      leaderType:boss.trainer!.team.length?String(template.definition.steps[template.definition.steps.length-1].type).replace(/^./,c=>c.toUpperCase()):legacy.leaderType,
      badgeName:hasBadge?legacy.badgeName:number===9?'Victory Road':number===14?'League Champion':`Elite Four: ${boss.trainer!.name}`,
      badgeSprite:hasBadge?legacy.badgeSprite:'',completionKey:hasBadge?legacy.badgeSprite:template.id,themeColor:String(template.definition.steps[template.definition.steps.length-1].color),
      bgScene:ref.steps.find(s=>s.levelBand)?.scene?.src || ref.steps[0].scene?.src || legacy.bgScene,gymBackdrop:boss.scene!,
      recommendedLevel:`Lv. ${ref.band[0]}–${ref.ace}`,rewardMoneyRange:`${Math.round(boss.trainer!.rewardMoney*.9*(template.definition.league?1.25:1)).toLocaleString()} ₽`,
      totalSteps:steps.length,steps,pokemonFound:{base:[...found].map(([speciesId,rate])=>({speciesId,name:getPokemonSpecies(speciesId).name,rate:`${(rate*100).toFixed(1)}%`,caught:false}))},
    } satisfies ChapterInfo;
  }),
  ...LEGACY_CHAPTERS.filter(c=>c.isSpecial).map(c=>({...c,runtimeSupported:false})),
];
export const DEFAULT_CHAPTER = ALL_CHAPTERS[0];
const kantoBadges=new Set(['boulder','cascade','thunder','rainbow','soul','marsh','volcano','earth'].map(name=>`${name}-badge`));
export const chapterIcon = (chapter: ChapterInfo) => chapter.badgeSprite ? kantoBadges.has(chapter.badgeSprite) ? `/assets/badges/kanto/${chapter.badgeSprite}.svg` : `/assets/badges/${chapter.badgeSprite}.png` : `/assets/trainers/${chapter.leaderSprite}.png`;
