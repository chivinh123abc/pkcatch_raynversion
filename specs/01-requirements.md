# Specification 01: Functional & Technical Requirements

## 1. System Overview
Poke'Catch is an idle / auto-battler Pokémon browser game where players field an active team of up to 6 Pokémon to defeat wild Pokémon and trainer gyms across multiple regions (starting with Kanto & Johto).

## 2. Layout & UI Specifications (Reference: In-Game Screenshot)

### 2.1. Top Header Bar
- **Trainer Profile**:
  - Avatar icon (Trainer sprite / customizable).
  - Trainer Name (e.g., `Royle910`).
  - Pokédex Counter badge (e.g., `Pokedex 124/251`).
- **Currencies & Economy**:
  - Pokédollars (e.g., `$181,970 P`).
  - Battle Tokens (e.g., `2,017`).
- **System Controls**:
  - Active players indicator (e.g., `1,227 playing`).
  - Dark / Light mode toggle.
  - Sound Mute / Unmute toggle.
  - Manual Save button with last saved timestamp.

### 2.2. Left Sidebar Navigation
- **Current Stage Header**:
  - Zone type (Route / Dungeon / Gym / Elite Four).
  - Chapter & Title (e.g., `Gym - Chapter 18: Elite Four: Lorelei`).
  - Wave / Boss counter (e.g., `Boss 5/5, Lv. 74-80`).
- **Main Menu Links**:
  - **Progress**: Opens Region/Map selector (Kanto Routes 1-28, Pewter Gym, Cerulean Gym, ..., Indigo Plateau).
  - **Team / PC**: Full Pokémon management modal with active party (6 slots) and PC Storage Boxes (multi-box system with drag/drop and stats view).
  - **Pokédex**: National Dex browser with Caught / Seen / Shiny filters and detailed stats.
  - **Activities**:
    - *Day Care*: Passive EXP gain, breeding eggs, incubator hatch timers.
    - *Game Corner*: Slots and mini-games to win tokens and rare Pokémon.
    - *Raids*: Daily boss raids against Legendary Pokémon (Articuno, Zapdos, Moltres, Mewtwo).
    - *Battle Tower*: Infinite survival battle ladder.
    - *Underground*: Mining grid mini-game for evolution stones, fossils, and shards.
  - **Social**:
    - *Friends*: Friend list and online statuses.
    - *Trades*: Player-to-player trade system or NPC trade requests.
    - *Black Market*: Rare/unobtainable items and high-IV Pokémon for tokens.
  - **Shop**: Pokeballs, Potions, Evolutionary Stones, Battle Items.
  - **Achievements**: Milestone trackers rewarding tokens and stat multipliers.
- **Footer**: Guide and Discord community links.

### 2.3. Central Battle Arena
- **Top Wave & Timer Bar**:
  - Visual icons for trainers/waves remaining in current route/gym (e.g., Pokeball icons filling up).
  - Route clear timer bar (e.g., `28/30s` countdown for boss fights).
- **Party Roster Column (Left side of Arena)**:
  - 6 vertical slots for the player's active team.
  - Displays:
    - PokeSprite miniature icon.
    - Nickname or Pokémon species name.
    - Level (e.g., `Lv. 100`).
    - Health bar (current HP / max HP) with green/yellow/red color thresholds.
    - Active battler glow indicator.
- **Combat Stage (Pixel Art Background)**:
  - Dynamic backgrounds based on location (Grass route, Cave, Sea, Gym pool, Indigo Plateau).
  - **Player Pokémon**:
    - Positioned on the left side facing right.
    - Uses Pokémon Showdown Gen 5 Animated sprite (`ani/{name}.gif` or `ani-back/`).
    - Attack animation triggers (recoil, shake, particle projectile).
  - **Enemy Pokémon**:
    - Positioned on the right side facing left.
    - Shows enemy Name, Level, and HP bar.
    - Floating damage numbers on hit (e.g., `-1824` with critical/super-effective color styling).
    - Particle effects on hit (e.g., green leaves, water splash, flames).
- **Battle Log & Speed Bar**:
  - Live narrative log (e.g., `"Vileplume used Petal Dance! It's super effective!"`).
  - Speed toggle buttons: `x1`, `x2`, `x4` multiplier for game loop pace.

### 2.4. Right Panel
- **Consumables / Quick Bag**:
  - Pokeball inventory counts (Pokeball, Greatball, Ultraball, Masterball).
  - Toggle default Pokeball used for wild encounters.
  - Active Potions / Lures / Lucky Eggs with remaining countdown duration (e.g., `13:21`).
- **Encounter / Zone Info ("Found here")**:
  - Displays wild Pokémon encounter table with catch/spawn rates.
  - Indicates special conditions (e.g., `"No wild Pokemon here: Trainers only"` in Gyms).

---

## 3. Core Gameplay Mechanics

### 3.1. Auto-Battle Loop
1. Every combat tick (default 1000ms divided by speed multiplier):
   - Player's active Pokémon attacks enemy.
   - Damage calculated based on Attack/Sp. Atk vs Defense/Sp. Def and elemental type matchups (0x, 0.5x, 1x, 2x, 4x).
   - If enemy HP drops to 0:
     - Awards EXP to all party members.
     - Awards Pokédollars.
     - If in a Wild Route: Triggers Catch Check.
     - Spawns next encounter or advances wave.
   - If enemy survives, enemy attacks active player Pokémon.
   - If active Pokémon faints, automatically switches to next available alive Pokémon in party.
   - If entire party faints: player is transported back to Pokémon Center / Route checkpoint with no penalty.

### 3.2. Catching Mechanism
- Automatically attempts catch on defeat if player has enabled Pokeballs and wild encounter is not a trainer battle.
- Catch rate formula considers Pokémon catch rate, current HP percentage, Pokeball multiplier:
  - Pokeball: 1.0x
  - Greatball: 1.5x
  - Ultraball: 2.0x
  - Masterball: 100% guarantee
- Caught Pokémon added to party (if space < 6) or stored in PC Box.
- Shiny chance: 1 in 4096 (can be boosted by Shiny Charm / Lures).

### 3.3. Progression System
- Beating a route (defeating 10 wild Pokémon) unlocks the next route or Gym.
- Defeating Gym Leaders awards Badges and unlocks next chapters.
- Defeating Elite Four members (Lorelei, Bruno, Agatha, Lance, Champion Blue) unlocks Johto and endgame Raids.
