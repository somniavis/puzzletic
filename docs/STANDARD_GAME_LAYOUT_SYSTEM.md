# Standard Game Layout System

This document unifies the **Game Layout System**, **Common Functionality**, and **Development Patterns** used to rapidly build and expand the game library.

---

## 1. Architecture Overview

Every Mini-Game follows a 3-layer architecture:

1.  **UI Component (`index.tsx`)**: Renders the game visualization and wraps it in a **Layout**.
2.  **Logic Hook (`GameLogic.tsx`)**: Handles strictly game-specific rules (e.g., "Is 3 + 5 correct?").
3.  **Game Engine (`useGameEngine.ts`)**: Handles shared meta-game state (Score, Lives, Time, Streak, Game Over, BGM).

### Data Flow
```mermaid
graph TD
    A[GameLogic.tsx] -->|Rules & Input| B[useGameEngine]
    B -->|Meta State (Score/Lives)| C[Layout (1/2/3/0)]
    C -->|Wrapper UI| D[index.tsx]
    D -->|Visuals| C
```

---

## 2. Layout Catalog

We use standardized layouts to decouple "Game Mechanics" from "Meta UI".
**New Architecture (2025)**: All layouts now share common UI components (`src/games/layouts/Standard/shared/`) to ensure consistency.

### 2.1 Shared Components (`src/games/layouts/Standard/shared/`)
*   **Hooks**:
    *   `useGameEffects`: Manages Particles, Shake, and Sound logic.
    *   `useGameScoring`: Manages High Score (localStorage), XP/GRO calculation, and New Record tracking.
*   **UI**:
    *   `GameStartScreen`: Standardized overlay with Title, Subtitle, Instructions, and 'How to Play'. **Handles button sound internally**.
    *   `GameOverScreen`: Standardized result screen with Score, High Score (Prev Best), Rewards, and Download/Restart buttons. **Handles button sound internally**.
    *   `GameLayoutHeader`: Top bar with Back button, Title, and BGM toggle.
    *   `GameLayoutDashboard`: Stats row showing Score, Lives, Streak, and Time.
*   **Styles**:
    *   `SharedStyles.css`: Common styles for Game Over screen components (header, result cards, rewards grid). Automatically imported by `GameOverScreen.tsx`.

### Layout 1: Basic View (Standard/Layout1)
**Best For**: Simple puzzle/counting games without Power-Ups or specific Targets.
**Structure**:
*   Uses `GameLayoutHeader`, `GameLayoutDashboard`.
*   **Content**: Centered Game Area (Grid Wrapper).
*   **Props**: `title`, `subtitle`, `description`, `instructions`, `engine`, `background`, `cardBackground`.

### Layout 2: Power-Up Focused (Standard/Layout2)
**Best For**: Games using Power-Ups.
**Structure**:
*   Includes Layout 1 features.
*   **Sub-Header**: Dedicated row for **Power-Up Buttons**.
*   **Props**: `powerUps`, `cardBackground`, `background`.

### Layout 3: Target + Power-Ups (Standard/Layout3)
**Best For**: Math games with specific numerical targets.
**Structure**:
*   Includes Layout 2 features.
*   **Sub-Header**: Power-Ups row + **Target Display Box**.
*   **Props**: `target: { value, icon, label }`, `cardBackground`, `background`.

### Layout 0: Custom Canvas (Standard/Layout0)
**Best For**: Unique UI requirements (e.g., `FishingCount`). Deprecated but kept for complex custom cases.

---

## 3. Power-Up System

Standardized set of Power-Ups available in Layout 2 & 3.

### Types of Power-Ups
1.  **Time Freeze ❄️**: Pauses the timer for 5 seconds.
    *   *Implementation*: `engine.activatePowerUp('timeFreeze')`.
2.  **Extra Life ❤️**: Restores 1 life (max 3).
    *   *Implementation*: `engine.activatePowerUp('extraLife')`.
3.  **Double Score ⚡**: Multiplies score x2 for 10 seconds.
    *   *Implementation*: `engine.activatePowerUp('doubleScore')`.
    *   **Rule**: All Power-Ups must start at **0** count. Players earn them during gameplay.

### Implementation Pattern
Define Power-Ups in `index.tsx` and pass to Layout:
```tsx
const powerUps = [
  {
    count: gameState.powerUps.timeFreeze,
    color: 'blue',
    icon: '❄️',
    onClick: () => handlePowerUp('timeFreeze'),
    status: isFrozen ? 'active' : 'normal'
  },
  // ...
];

<Layout3 powerUps={powerUps} ... />
```

---

## 4. Technical Standards & Snippets

**CRITICAL**: All games must implement these fixes for Cross-Browser (Safari/Mobile) compatibility.

### 4.1. Safari Tap Highlight Fix
**Problem**: Gray box appears on tap.
**Solution**: Add to CSS.
```css
.interactive-element {
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
}
```

### 4.2. Mobile Viewport Height
**Problem**: Layout extends beneath mobile browser UI (URL bar, navigation).
**Solution**: Use `dvh` (dynamic viewport height) instead of `%`.
```css
.layout-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100dvh; /* NOT 100% - use dvh for mobile-safe viewport */
    display: flex;
    flex-direction: column;
}
```
**Note**: All Standard Layouts (Layout1/2/3) use `100dvh` by default.

### 4.3. Sticky Hover Fix (Mobile)
**Problem**: Buttons stay "hovered" after tap on touch devices.
**Solution**: Wrap hover effects.
```css
@media (hover: hover) {
    .btn:hover {
        transform: scale(1.05); /* Only scale on mouse hover */
    }
}
```

### 4.4. Focus Reset (Safari Focus Ring)
**Problem**: Focus remains on clicked button, causing issues with keyboard/gamepad or visual artifacts.
**Solution**: Blur explicitly in `index.tsx`.
```tsx
useEffect(() => {
    // Force blur on problem/round change
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
    }
}, [currentProblem.id, round]);
```

### 4.5. Ghost Click Prevention (Input Lock)
**Problem**: Rapid tapping causes "Double Tap" where the next screen's button is clicked instantly.
**Solution**: Synchronous `useRef` Lock in `GameLogic.tsx`.

```tsx
// 1. Init Lock
const isProcessing = useRef(false);

const handleAnswer = (selected) => {
    // 2. Check Lock
    if (isProcessing.current) return;

    if (isCorrect) {
        // 3. Lock
        isProcessing.current = true;
        engine.submitAnswer(true);

        // 4. Transition & Unlock with Safety Cooldown
        setTimeout(() => {
            generateNextProblem();
            setTimeout(() => { isProcessing.current = false; }, 300); // 300ms Cooldown
        }, 1000); // Animation Time
    }
};
```


### 4.6. Game ID Management (CRITICAL)
**Problem**: Hardcoded ID strings (e.g., `'my-new-game'`) scattered across files lead to mismatches (Registry vs Component vs Manifest) resulting in bugs like high scores not saving or incorrect localized text loading.
**Solution**: Centralize ALL Game IDs in `src/constants/gameIds.ts`.
1.  **Define**: Add `MY_GAME: 'my-game-id'` to `GameIds` object in `src/constants/gameIds.ts`.
2.  **Usage**:
    *   **Manifest**: `id: GameIds.MY_GAME`
    *   **Component**: `const GAME_ID = GameIds.MY_GAME;`
    *   **Registry**: `id: GameIds.MY_GAME` in `GAMES` array.

---

## 5. Development Checklist (New Game)

1.  **Register ID**: Add unique ID to `src/constants/gameIds.ts`.
2.  **Select Layout**: Choose Layout 1, 2, or 3.
3.  **Engine Setup**: `const engine = useGameEngine({ initialTime: 60 });`
4.  **Implement Logic**:
    *   Use `useRef` for Input Lock.
    *   Call `engine.submitAnswer(bool)`.
    *   **Start Power-Ups at 0**.
5.  **Implement Visuals**:
    *   Wrap in `<LayoutX>`.
    *   Pass background: `<LayoutX background={<MyBackgroundComponent />} ... >`
    *   Pass `gameId={GameIds.MY_GAME}` to Layout.
    *   Apply `useEffect` Focus Fix.

## Feedback System (Sound & Animation)
The Layouts automatically handle sensory feedback (sounds, particles, screen shake) by listening to `engine.lastEvent`. **You must manually trigger these events** in your Game Logic.

**IMPORTANT**: Button sounds (clicks on Start/Restart buttons) are handled automatically by `GameStartScreen` and `GameOverScreen` components. **Do NOT call `playButtonSound()` in Layout callback props** to avoid duplicate sounds.

### 1. Correct Answer (Final / Stage Clear)
Use when the user completes a verified step or stage.
```typescript
// GameLogic.tsx
engine.submitAnswer(true); // Updates Score, Streak, Lives
engine.registerEvent({ type: 'correct', isFinal: true }); // Triggers "Clear" Sound + Large Confetti + Green Flash
```

### 2. Intermediate Correct (Multi-step)
Use for multi-part puzzles (e.g., matching 1 of 3 items).
```typescript
// GameLogic.tsx
engine.submitAnswer(true, { skipFeedback: true, skipStreak: true }); // Optional: Skip stats update
engine.registerEvent({ type: 'correct', isFinal: false }); // Triggers "Eating" Sound + Small Sparkles
```

### 3. Wrong Answer
Use when the user makes a mistake.
```typescript
// GameLogic.tsx
engine.submitAnswer(false); // Resets Streak, Deducts Life
engine.registerEvent({ type: 'wrong' }); // Triggers "Jello" Sound + Screen Shake
```

---

## 6. Visual Standards

*   **Font**: `clamp(min, preferred, max)` for scaling.
*   **Touch Targets**: Min 44x44px.
*   **Colors**: use Tailwind (`bg-blue-500`, `text-yellow-400`).

### 6.1. Background Color Strategy
To maintain visual distinction between categories, use specific gradient themes:
*   **Math (Global)**: Violet/Indigo Gradient
    *   `linear-gradient(135deg, #e9d5ff 0%, #b1b2fb 50%, #fecdd3 100%)`
*   **Game Area (cardBackground)**:
    *   Default: White/Transparent (if simple).
    *   Scenes: Use `cardBackground` prop for full-bleed illustrations (e.g., Ocean, Forest) that sit behind game elements but inside the card border.
*   **Science (Future)**: Blue/Cyan Theme
*   **Language (Future)**: Green/Teal Theme

## 7. Game Over Screen Rules

The Game Over screen must follow a strict layout for score comparison (Left vs Right).

### Score Display Logic
*   **Primary (Left/Top)**: **Current Score**
    *   Label: "FINAL SCORE" (Default) OR "NEW RECORD!" (If high score beaten).
    *   Style: Large, Emphasized. Pulse animation if New Record.
*   **Secondary (Right/Bottom)**: **Comparison Score**
    *   Label: "BEST SCORE" (If not beaten) OR "PREV BEST" (If beaten).
    *   Value: The *High Score* stored before this game.
    *   Style: Smaller, Muted.

### Reward Display
*   **XP & GRO**: Displayed in a split grid below the score.
*   **Buttons**: Restart (Left), Download (Right).
