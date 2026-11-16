export type PokemonType =
  | 'Normal'
  | 'Fire'
  | 'Water'
  | 'Electric'
  | 'Grass'
  | 'Ice'
  | 'Fighting'
  | 'Poison'
  | 'Ground'
  | 'Flying'
  | 'Psychic'
  | 'Bug'
  | 'Rock'
  | 'Ghost'
  | 'Dark'
  | 'Dragon'
  | 'Steel'
  | 'Fairy';

export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
}

export interface PokemonSpecies {
  id: number;
  name: string;
  types: PokemonType[];
  baseStats: PokemonStats;
  catchRate: number;
  baseExp: number;
  evolvesTo?: {
    speciesId: number;
    level: number;
  };
}

export interface PokemonInstance {
  where?: string;
  how?: string;
  ot?: string;
  orig?: { how?: string; where?: string; ot?: string };
  wins?: number;
  status?: 'sleep' | 'freeze' | 'paralysis' | 'burn' | 'poison';
  sleepTurns?: number;
  confusedTurns?: number;
  uid: string;
  speciesId: number;
  nickname?: string;
  level: number;
  exp: number;
  expToNextLevel: number;
  currentHp: number;
  maxHp: number;
  stats: PokemonStats;
  isShiny: boolean;
  caughtAt: number;
}

export type BallType = 'pokeball' | 'greatball' | 'ultraball' | 'masterball';

export interface RouteWildPokemon {
  speciesId: number;
  minLevel: number;
  maxLevel: number;
  weight: number;
}

export interface TrainerTeamMember {
  speciesId: number;
  level: number;
}

export interface TrainerInfo {
  power?: number;
  gymTrainer?: boolean;
  league?: boolean;
  name: string;
  title: string;
  sprite: string; // 'camper' | 'acetrainer-f' | 'gentleman' | 'brock'
  team: TrainerTeamMember[];
  rewardMoney: number;
}

export type TrainerBattleInfo = TrainerInfo;

export type StepNodeType = 'grass' | 'center' | 'question' | 'red' | 'badge' | 'gift';

export interface AdventureGift {
  key: string;
  choices?: number[];
  items?: string[];
  level?: number;
  text: string;
  trade?: Record<number, string>;
}

export interface StepNode {
  source?: { chapterId: string; templateIndex: number };
  scene?: string;
  indoor?: boolean;
  areas?: string[];
  levelBand?: number[];
  pool?: { id: number; min: number; max: number; w: number }[];
  gift?: AdventureGift;
  unlock?: string;
  static?: { speciesId: number; level: number; once?: string; spirit?: boolean; after?: string; reward?: AdventureGift };
  reward?: { item: string; amount: number; once?: string };
  step: number;
  type: StepNodeType;
  name: string;
  badgeId?: string;
  trainer?: TrainerInfo;
}

export interface GymLeaderInfo {
  name: string;
  title: string;
  badgeName: string;
  badgeSprite: string;
  sprite: string;
  team: TrainerTeamMember[];
  rewardMoney: number;
}

export interface RouteConfig {
  id: string;
  name: string;
  region: 'Kanto' | 'Johto' | 'Hoenn';
  chapter: number;
  chapterTitle: string;
  badgeName: string;
  badgeSprite: string;
  requiredBadges: number;
  recommendedLevel: string;
  totalSteps: number;
  wildPokemon: RouteWildPokemon[];
  gymLeader?: GymLeaderInfo;
  backgroundUrl: string;
}

export interface CombatLog {
  id: string;
  text: string;
  type: 'damage' | 'defeat' | 'catch' | 'info' | 'shiny';
  timestamp: string;
}

export interface CombatEffect {
  speed?: number;
  miss?: boolean;
  crit?: boolean;
  type: 'slash' | 'impact' | 'fire' | 'water' | 'ice' | 'grass' | 'electric' | 'rock' | 'ground' | 'psychic' | 'poison' | 'bug' | 'ghost' | 'dragon' | 'steel' | 'fairy';
  target: 'enemy' | 'player';
  damage: number;
  moveName: string;
  moveKey?: string;
  key: number;
}

export interface ActiveDrop {
  speed?: number;
  id: string;
  type: 'money' | 'berry' | 'ball' | 'item' | 'money-text';
  title: string;
  amount: number;
  iconUrl: string;
  xPercent?: number;
}

export type MysteryReward = ActiveDrop;
