# Play Game Structure

`Play` tab games are managed separately from the legacy `math` / `brain` catalog.

## Goal

- Do not depend on the old `layout1 / layout2 / layout3` structure.
- Allow each `Play` game to ship with its own UI, controls, and scene composition.
- Keep launcher metadata and actual game routing in one dedicated registry.

## Files

- Registry: `src/games/play/registry.ts`
- Types: `src/games/play/types.ts`
- Shared standalone shell: `src/games/play/shared/StandalonePlayGameShell.tsx`
- Starter placeholder games:
  - `src/games/play/arcade/JelloComet/index.tsx`
  - `src/games/play/arcade/SnackSprint/index.tsx`
  - `src/games/play/arcade/StarBridge/index.tsx`

## How It Connects

1. Add a new ID in `src/constants/gameIds.ts`
2. Create a standalone game component under `src/games/play/...`
3. Register it in `src/games/play/registry.ts`
4. The `PlayPage` retro launcher reads from `PLAY_GAMES`
5. Pressing `Start` navigates to `/play/:gameId`
6. `PlayPage` resolves that route from the regular registry first, then the play registry

## Manifest Shape

`PlayGameManifest` extends the normal `GameManifest` and adds `launcher` metadata:

- `sticker`
- `shell`
- `shellDark`
- `accent`
- `accentLight`
- `ink`
- `edge`
- `glow`
- `order`

These values drive the cartridge appearance in the retro launcher.

## Recommended Pattern For New Games

- Keep one folder per game.
- Do not import `Layout1`, `Layout2`, or `Layout3`.
- Build each game as a self-contained screen with:
  - its own HUD
  - its own scene layout
  - its own CSS
  - its own state model

## Reward Policy

`Play` tab arcade games do not use the standard math-game difficulty flow directly, so their reward baseline is mapped from the current Jello evolution stage.

- Reward source table:
  - `src/constants/gameMechanics.ts`
  - uses `DIFFICULTY_REWARDS`
- Reward calculator:
  - `src/games/play/shared/playArcadeRewards.ts`

### Mapping Rule

- Jello stage 1 -> difficulty 1 reward baseline
- Jello stage 2 -> difficulty 2 reward baseline
- Jello stage 3 -> difficulty 3 reward baseline
- Jello stage 4 -> difficulty 4 reward baseline
- Jello stage 5 -> difficulty 5 reward baseline

### Arcade Adjustment

- `Play` tab rewards use the math-game baseline at `0.8x`
- This keeps learning games more rewarding than arcade/play games

### Best Bonus

- If the run sets a new `best` record, the final reward gets `1.2x`
- Tail Runner:
  - applied when score best or tail best is updated
- GroGro Land:
  - applied when best land percent is exceeded

### Current Integration

- Tail Runner:
  - reward display and payout are both wired to the shared calculator
- GroGro Land:
  - reward display and payout are both wired to the shared calculator

## Current Starter Games

- `Jello Comet`
- `Snack Sprint`
- `Star Bridge`

These are only starter placeholders so new custom `Play` games can be added and wired quickly.
