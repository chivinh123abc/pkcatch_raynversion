# Specification 03: Implementation Roadmap & Plan

## Phase 1: Project Scaffolding & SpecKit Baseline
- [x] Create `.specify/` configuration, manifest, and constitution.
- [x] Create specifications: Requirements, Architecture, Roadmap, Tasks.
- [ ] Initialize Vite + React 19 + TypeScript project in `d:\Chivinh\2026_pokecatch`.
- [ ] Configure Tailwind CSS, Lucide icons, and Pixel font/styling.
- [ ] Configure Zustand store with LocalStorage persistence.
- [ ] Set up Pokémon Showdown & PokeSprite asset helper with image error fallbacks.

## Phase 2: Core Data Engine (Pokémon & Routes)
- [ ] Full Gen 1 (151 Pokémon) & Gen 2 starter metadata (ID, name, types, base stats, catch rates, evolutions).
- [ ] Pokémon elemental type effectiveness matrix (18 types).
- [ ] EXP curve and leveling calculations (Medium Fast, Medium Slow, Fast, Slow).
- [ ] Kanto Routes dataset (Pallet Town, Viridian Route 1-22, Pewter Gym, Cerulean, Vermilion, ..., Elite Four Lorelei, Bruno, Agatha, Lance, Champion Blue).
- [ ] Consumables and items catalog (Pokeballs, Potions, Lures, Evolution stones).

## Phase 3: Auto-Battle & Catching Engine
- [ ] Tick-based combat scheduler (`useGameLoop`) supporting `1x`, `2x`, `4x` speed multipliers.
- [ ] Damage calculation formula incorporating Level, Attack/Defense, STAB (Same Type Attack Bonus), and elemental effectiveness.
- [ ] Particle and floating damage text system on enemy hit.
- [ ] Turn-based or continuous auto-attack execution for both player and enemy.
- [ ] Pokémon faint handling and auto-switch to next active party member.
- [ ] Wild Pokémon catch calculation and Pokeball consumption.
- [ ] Pokedex caught/seen registration and Shiny roll (1/4096 chance).

## Phase 4: UI Layout & Interactive Battle Arena
- [ ] **Top Header Bar**: Trainer profile avatar, Pokédex counter `124/251`, Cash `$181,970 P`, Tokens `2,017`, Active players `1,227 playing`, Day/Night toggle, Mute/Sound, Save.
- [ ] **Left Sidebar Navigation**: Current Gym/Chapter header with wave counter (`Boss 5/5, Lv. 74-80`), navigation links (Progress, Team/PC, Pokedex, Activities, Social, Shop, Achievements).
- [ ] **Central Battle Arena**:
  - Wave progress bar with Pokeball markers and route timer countdown (`28/30s`).
  - Left Party Roster (6 vertical slots with animated PokeSprite icons, levels, HP bars, active indicator).
  - Combat stage with themed pixel background (e.g., Lorelei's Gym Pool, Route 1 Grass).
  - Player Pokémon (facing right, animated Showdown sprite, attack bounce).
  - Enemy Pokémon (facing left, animated Showdown sprite, hit flash).
  - Battle log text box with status messages ("It's super effective!") and `x1`, `x2`, `x4` buttons.
- [ ] **Right Panel**:
  - Consumables Quick Bag (Pokeball counts, default ball selector).
  - Active buff timers with countdowns.
  - "Found here" zone spawn details.

## Phase 5: Management Modals & Modularity
- [ ] **Team & PC Box Modal**: Reorganize 6-Pokémon team, deposit/withdraw to 30-slot PC boxes, inspect IVs and stats.
- [ ] **Pokédex Modal**: Searchable Gen 1/2 Dex with caught status, types, shiny badge, and base stats.
- [ ] **Shop Modal**: Purchase Pokeballs, healing items, and stones using Pokédollars.
- [ ] **Route / Chapter Selector Modal**: Choose unlocked routes, gyms, and dungeons.

## Phase 6: Activities, Audio & Polish
- [ ] Day Care system: Leave Pokémon to passively gain levels and generate eggs.
- [ ] Raids system: Legendary boss raid battles.
- [ ] Sound & Music: Pokémon cries, hit SFX, Pokeball capture chime.
- [ ] Save management: Export/Import JSON save file.
