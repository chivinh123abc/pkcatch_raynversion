# Poké'Catch Online Clone

A 100% client-side retro pixel art clone of Poké'Catch Online built with React 18, TypeScript, Vite, and Tailwind CSS.

## Features
- **Authentic Pixel Art**: Gen 8 box sprites (68x56) from PokéSprite and original retro UI fonts (Jersey 15 & 10).
- **Procedural Move Visuals (BattleFX)**: Over 500 move animations rendered dynamically on Canvas matching the original game.
- **Combat Mechanics**: Full type advantages/disadvantages, critical hits, status conditions, and STAB calculations based on `mechanics.json`.
- **HealFX & CaptureFX**: Authentic Pokémon Center recovery sequences and Pokéball capture / duplicate conversion animations.
- **Progress & Management**: 20-node chapter progression, Team & PC management, full 151 Kanto Pokédex, local save system with autosave.
- **100% Client-side**: Zero backend or proxy dependencies.

## Quick Start

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run unit tests
npm test

# Build for production
npm run build
```

Team/PC and Pokédex open beside the sidebar. Select a Pokémon to inspect it, move it to/from PC, or swap it into a full team; drag team slots to reorder. New-catch cards wait for **Continue** before advancing.

Use the five Team presets to save/switch lineups without copying Pokémon. Drag PC Pokémon onto a team slot, or select **Custom** PC sort to keep a manual order. Pokédex NEW markers clear when entries are viewed and persist with the save. See [collection UI notes](docs/R01_COLLECTIONS_OVERLAYS.md) for verified behavior and remaining differences.

Run `npm run test:ui` for Chrome browser checks. See [visual alignment notes](docs/VISUAL_ALIGNMENT.md) for reference screenshots, verified changes, and remaining differences. Current species data covers Kanto's 151 Pokémon; full-game parity is not yet verified.
