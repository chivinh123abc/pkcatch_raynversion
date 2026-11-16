# Poké'Catch Online Clone

For AI/contributor handoff, start with [AGENTS.md](AGENTS.md) and [current state](docs/AI_HANDOFF.md). Read only the report relevant to your task; older implementation notes are archived in [project history](docs/PROJECT_HISTORY.md). Check live builds cheaply with `npm run reference:check`.

A 100% client-side retro pixel art clone of Poké'Catch Online built with React 18, TypeScript, Vite, and Tailwind CSS.

Học từ đầu bằng tiếng Việt: [Học làm webgame từ dự án này](docs/HOC_LAM_GAME_TU_DAU.md). Trạng thái mới: [runtime 14 chương Kanto](docs/R04_2_KANTO_RUNTIME.md) và [màn mở đầu/chọn starter](docs/ONBOARDING_PARITY.md).

Tra lỗi và cách xử lý: [Các bug đã gặp và cách khắc phục](docs/BUGS_VA_CACH_KHAC_PHUC.md).

## Features
- **Authentic Pixel Art**: Gen 8 box sprites (68x56) from PokéSprite and original retro UI fonts (Jersey 15 & 10).
- **Procedural Move Visuals (BattleFX)**: Over 500 move animations rendered dynamically on Canvas matching the original game.
- **Combat Mechanics**: Full type advantages/disadvantages, critical hits, status conditions, and STAB calculations based on `mechanics.json`.
- **HealFX & CaptureFX**: Authentic Pokémon Center recovery sequences and Pokéball capture / duplicate conversion animations.
- **Progress & Management**: 14 Kanto chapters with seeded routes, Gym/League progression, Team & PC management, 151 Kanto Pokédex, local saves and autosave. Chapter 1 preserves its verified 20-node route.
- **New game**: title animation, Professor Oak introduction, Red/Leaf and name selection, animated starter choice using local Gen5ani artwork.
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

Use the five Team presets to save/switch lineups without copying Pokémon. Drag PC Pokémon onto a team slot, or select **Custom** PC sort to keep a manual order. Collection menu notifications clear on entering their screen; Pokédex tiles have no individual NEW markers. See [current layout and notification notes](docs/LAYOUT_PARITY_REVIEW.md) for verified behavior and remaining differences.

Run `npm run test:ui` for Chrome browser checks. See [visual alignment notes](docs/VISUAL_ALIGNMENT.md) for reference screenshots, verified changes, and remaining differences. Current species data covers Kanto's 151 Pokémon; full-game parity is not yet verified.
