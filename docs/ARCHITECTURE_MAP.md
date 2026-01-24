# System Architecture Map (Token Saver)

> **Purpose**: This file serves as a map for the AI Agent. Read this file *first* to locate relevant code, instead of using expensive `list_dir` or reading entire directories.

## Core System
*   **Entry Point**: `src/App.tsx` (Routing, Global Providers)
*   **Providers**:
    *   `src/contexts/NurturingContext.tsx`: Main game state (stats, inventory, evolution).
    *   `src/contexts/AuthContext.tsx`: Firebase Auth user session.
    *   `src/contexts/SoundContext.tsx`: Audio settings and playback.

## Domain Modules

### 1. Nurturing (Pet Room)
*   **Main Component**: `src/components/PetRoom/PetRoom.tsx`
*   **Overlay UI**: `src/components/PetRoom/EvolutionOverlay.tsx` (Manages triggers & animations)
*   **Logic Hooks**:
    *   `src/contexts/hooks/useNurturingSync.ts`: Hybrid Storage & Cloud Sync.
    *   `src/contexts/hooks/useNurturingTick.ts`: Game Loop (Hunger decay, etc).
    *   `src/contexts/hooks/useNurturingActions.ts`: Feed, Clean, Play actions.
    *   `src/contexts/hooks/useEvolutionLogic.ts`: Evolution state machine.
*   **Services**:
    *   `src/services/evolutionService.ts`: Pure logic for XP/State calculation.
    *   `src/services/gameTickService.ts`: Condition evaluation logic.

### 2. Mini-Games
*   **Registry**: `src/games/registry.ts` (List of all available games)
*   **Engine**: `src/games/engine/` (Common game loop logic)
*   **Specific Games**: `src/games/[game-name]/`

### 3. Data & Types
*   **Interfaces**: `src/types/nurturing.ts`, `src/types/character.ts`
*   **Static Data**: `src/data/species.ts`, `src/data/characters.ts`
*   **Constants**: `src/constants/gameMechanics.ts`

## Key Workflows

### Evolution Flow
1.  **XP Gain**: `useEvolutionLogic.addRewards()` -> Updates `xp` state.
2.  **Phase Check**: `evolutionService.getEvolutionPhase()` returns `READY_TO_EVOLVE` / `MATURE`.
3.  **UI Trigger**: `EvolutionOverlay.tsx` renders `WallButton` based on phase.
4.  **Animation**: User clicks button -> `isEvolving=true` -> `EvolutionAnimation` renders.
5.  **Completion**: Animation ends -> `completeEvolutionAnimation()` called -> `evolutionStage` updates.

## Development Rules
1.  **Separation**: Logic belongs in `hooks/` or `services/`. UI components should only render data.
2.  **Decoupling**: `PetRoom` does not know about internal evolution logic, only the `phase` exposed by Context.
3.  **Token Efficiency**: Read this map first. Only `view_file` the specific files needed for the task.
