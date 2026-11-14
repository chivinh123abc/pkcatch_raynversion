# Specification 02: Architecture & Data Model

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Poke'Catch Client                      │
│             (Vite + React 19 + TypeScript + Tailwind)       │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
       ┌───────▼────────┐             ┌────────▼────────┐
       │   Game Store   │             │   Game Engine   │
       │  (Zustand +    │◄────────────┤  (Combat Tick,  │
       │   LocalPersist)│             │   EXP, Catch,   │
       └───────┬────────┘             │   Spawn Loop)   │
               │                      └────────┬────────┘
       ┌───────▼────────┐                      │
       │ Asset Service  │                      ▼
       │(Showdown/Poke- │             ┌─────────────────┐
       │ sprite Resolv) │             │ Database Static │
       └───────┬────────┘             │  (Pokedex, Gen1,│
               │                      │   Moves, Routes)│
       ┌───────▼────────────────┐     └─────────────────┘
       │  Remote Asset CDNs     │
       │ - Pokémon Showdown GIF │
       │ - PokeSprite Icons/Item│
       └────────────────────────┘
```

---

## 2. Core Data Models (TypeScript)

### 2.1. Elemental Types
```typescript
export type PokemonType =
  | 'normal' | 'fire' | 'water' | 'grass' | 'electric' | 'ice'
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug'
  | 'rock' | 'ghost' | 'dragon' | 'steel' | 'dark' | 'fairy';

export interface TypeMatchup {
  [attacker: string]: {
    [defender: string]: number; // 0, 0.5, 1, 2
  };
}
```

### 2.2. Pokémon Definition & Instance
```typescript
export interface BasePokemon {
  id: number;
  name: string;
  types: PokemonType[];
  baseStats: {
    hp: number;
    attack: number;
    defense: number;
    spAtk: number;
    spDef: number;
    speed: number;
  };
  catchRate: number;
  baseExp: number;
  evolution?: {
    level?: number;
    item?: string;
    targetId: number;
  };
}

export interface PokemonInstance {
  uid: string; // Unique UUID
  speciesId: number;
  nickname: string;
  level: number;
  currentExp: number;
  maxExp: number;
  currentHp: number;
  maxHp: number;
  isShiny: boolean;
  ivs: {
    hp: number;
    attack: number;
    defense: number;
    spAtk: number;
    spDef: number;
    speed: number;
  };
  caughtDate: number;
}
```

### 2.3. Route & Gym Definition
```typescript
export interface RouteEncounter {
  speciesId: number;
  minLevel: number;
  maxLevel: number;
  weight: number; // spawn probability weight
}

export interface TrainerMember {
  speciesId: number;
  level: number;
}

export interface TrainerBoss {
  name: string;
  title: string;
  badgeId?: string;
  team: TrainerMember[];
}

export interface RouteZone {
  id: string;
  name: string;
  region: 'kanto' | 'johto';
  chapterNumber: number;
  isGym: boolean;
  backgroundTheme: 'grass' | 'water' | 'cave' | 'indoor' | 'gym_water' | 'league';
  requiredPreviousZoneId?: string;
  encounters?: RouteEncounter[];
  boss?: TrainerBoss;
}
```

### 2.4. Inventory & Economy
```typescript
export type PokeballType = 'pokeball' | 'greatball' | 'ultraball' | 'masterball';

export interface Item {
  id: string;
  name: string;
  category: 'pokeball' | 'medicine' | 'evolution' | 'buff';
  price: number;
  description: string;
}

export interface UserInventory {
  pokeballs: Record<PokeballType, number>;
  selectedPokeball: PokeballType;
  items: Record<string, number>;
  activeBuffs: Array<{
    itemId: string;
    expiresAt: number;
  }>;
}
```

---

## 3. Asset Resolver Engine

```typescript
export const ASSET_CDN = {
  // Animated battle sprites from Pokemon Showdown
  showdownFront: (name: string, isShiny = false) =>
    `https://play.pokemonshowdown.com/sprites/${isShiny ? 'ani-shiny' : 'ani'}/${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.gif`,
  showdownBack: (name: string, isShiny = false) =>
    `https://play.pokemonshowdown.com/sprites/${isShiny ? 'ani-back-shiny' : 'ani-back'}/${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.gif`,
  // Static Gen 5 fallbacks
  showdownStaticFront: (name: string) =>
    `https://play.pokemonshowdown.com/sprites/gen5/${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`,
  // Icons from PokéSprite (Gen 8 standard 68x56)
  pokespriteIcon: (name: string, isShiny = false) =>
    `https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/${isShiny ? 'shiny' : 'regular'}/${name.toLowerCase().replace(/[^a-z0-9-]/g, '')}.png`,
  pokespriteItem: (category: string, name: string) =>
    `https://raw.githubusercontent.com/msikma/pokesprite/master/items/${category}/${name.toLowerCase().replace(/[^a-z0-9-]/g, '-')}.png`,
};
```
