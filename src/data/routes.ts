import { RouteConfig, StepNode } from '../types/game';

/**
 * Standard 20 nodes of Kanto Chapter 1 (Boulder Badge)
 * Node sequence: wild, item, wild, wild, item, heal, wild, wild, wild, wild, wild, item, trainer, trainer, wild, item, heal, item, trainer, gym
 */
export const ROUTE_1_STEPS: StepNode[] = [
  { step: 1, type: 'grass', name: 'Route 1 · Wild Pokémon' },
  { step: 2, type: 'question', name: 'Route 1 · Mystery Item' },
  { step: 3, type: 'grass', name: 'Route 1 · Wild Pokémon' },
  { step: 4, type: 'grass', name: 'Route 1 · Wild Pokémon' },
  { step: 5, type: 'question', name: 'Viridian City · Hidden Item', reward: { item: 'exp-candy-s', amount: 1 } },
  { step: 6, type: 'center', name: 'Viridian City · Pokémon Center' },
  { step: 7, type: 'grass', name: 'Route 2 · Wild Pokémon' },
  { step: 8, type: 'grass', name: 'Route 2 · Wild Pokémon' },
  { step: 9, type: 'grass', name: 'Viridian Forest · Wild Pokémon' },
  { step: 10, type: 'grass', name: 'Viridian Forest · Wild Pokémon' },
  { step: 11, type: 'grass', name: 'Viridian Forest · Wild Pokémon' },
  { step: 12, type: 'question', name: 'Viridian Forest · Hidden Item' },
  {
    step: 13,
    type: 'red',
    name: 'Viridian Forest · Bug Catcher Sammy',
    trainer: {
      name: 'Bug Catcher Sammy',
      title: 'Bug Catcher',
      sprite: 'bugcatcher',
      team: [
        { speciesId: 10, level: 7 }, // Caterpie Lv.7
        { speciesId: 13, level: 7 }, // Weedle Lv.7
      ],
      rewardMoney: 180,
    },
  },
  {
    step: 14,
    type: 'red',
    name: 'Viridian Forest · Bug Catcher Charlie',
    trainer: {
      name: 'Bug Catcher Charlie',
      title: 'Bug Catcher',
      sprite: 'bugcatcher',
      team: [
        { speciesId: 11, level: 8 }, // Metapod Lv.8
        { speciesId: 14, level: 8 }, // Kakuna Lv.8
      ],
      rewardMoney: 240,
    },
  },
  { step: 15, type: 'grass', name: 'Viridian Forest · Wild Pokémon' },
  { step: 16, type: 'question', name: 'Pewter City · Hidden Item' },
  { step: 17, type: 'center', name: 'Pewter City · Pokémon Center' },
  { step: 18, type: 'question', name: 'Pewter Museum · Ancient Fossil', reward: { item: 'old-amber', amount: 1, once: 'old-amber' } },
  {
    step: 19,
    type: 'red',
    name: 'Pewter Gym · Camper Liam',
    trainer: {
      name: 'Camper Liam',
      title: 'Gym Trainer',
      sprite: 'camper',
      team: [
        { speciesId: 74, level: 11 }, // Geodude Lv.11
        { speciesId: 27, level: 11 }, // Sandshrew Lv.11
      ],
      rewardMoney: 450,
    },
  },
  {
    step: 20,
    type: 'badge',
    name: 'Pewter Gym · Leader Brock',
    badgeId: 'boulder-badge',
    trainer: {
      name: 'Leader Brock',
      title: 'Pewter Gym Leader',
      sprite: 'brock',
      team: [
        { speciesId: 74, level: 14 }, // Geodude Lv.14
        { speciesId: 95, level: 15 }, // Onix Lv.15 (Ace)
      ],
      rewardMoney: 1400,
    },
  },
];

export const ROUTES: RouteConfig[] = [
  {
    id: 'kanto-1',
    name: 'Route 1',
    region: 'Kanto',
    chapter: 1,
    chapterTitle: 'Chapter 1: Boulder Badge',
    badgeName: 'Boulder Badge',
    badgeSprite: 'boulder-badge',
    requiredBadges: 0,
    recommendedLevel: 'Lv. 2-15',
    totalSteps: 20,
    backgroundUrl: '/assets/bg/scenes/01-prairie-ouverte-710x400.webp',
    wildPokemon: [
      { speciesId: 16, minLevel: 2, maxLevel: 5, weight: 55 }, // Pidgey
      { speciesId: 19, minLevel: 2, maxLevel: 4, weight: 45 }, // Rattata
    ],
    gymLeader: {
      name: 'Brock',
      title: 'Pewter Gym Leader',
      badgeName: 'Boulder Badge',
      badgeSprite: 'boulder-badge',
      sprite: 'brock',
      rewardMoney: 1400,
      team: [
        { speciesId: 74, level: 14 }, // Geodude Lv.14
        { speciesId: 95, level: 15 }, // Onix Lv.15 (Ace)
      ],
    },
  },
];
