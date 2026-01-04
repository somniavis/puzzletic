# Puzzletic Game Layout & Development System

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

We use standardized layouts to decouple "Game Mechanics" from "Meta UI" (Start Screens, Scoreboards, Result Pages).

### Layout 1: Basic View (Canvas)
**Best For**: Simple puzzle/counting games without Power-Ups or specific Targets.
**Features**:
*   Header: Back, Title, BGM Toggle.
*   Stats Bar: Score, Lives (Hearts), Streak, Time.
*   Content: Centered Game Area.
*   **Props**: `title`, `subtitle`, `description`, `instructions`, `engine`, `background`.
*   **Background**: Pass a React Node to `background` prop (rendered at z-index 0).

### Layout 2: Power-Up Focused
**Best For**: Games where users use Power-Ups but the goal is internal or dynamic (no fixed target box).
**Features**:
*   Includes Layout 1 features.
*   **Sub-Header**: Dedicated row for **Power-Up Buttons**.
*   **Props**: `powerUps: PowerUpBtnProps[]`.

### Layout 3: Target + Power-Ups (Complete)
**Best For**: Math games where the player must match a specific target (e.g., "Make 10").
**Features**:
*   Includes Layout 2 features.
*   **Sub-Header**: Power-Ups row + **Target Display Box**.
*   **Target Box**: Prominently shows the goal value/icon.
*   **Props**: `target: { value, icon, label }`.

### Layout 0: Custom Canvas
**Best For**: Unique UI requirements that don't fit the grid (e.g., `FishingCount`).
**Features**:
*   Provides logic wrapper (Start/Game Over logic).
*   **Stats Bar**: Rendered, but positioning is flexible (absolute/overlay).
*   **Content**: Full control over DOM.

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

### 4.2. Sticky Hover Fix (Mobile)
**Problem**: Buttons stay "hovered" after tap on touch devices.
**Solution**: Wrap hover effects.
```css
@media (hover: hover) {
    .btn:hover {
        transform: scale(1.05); /* Only scale on mouse hover */
    }
}
```

### 4.3. Focus Reset (Safari Focus Ring)
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

### 4.4. Ghost Click Prevention (Input Lock)
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

---

## 5. Development Checklist (New Game)

1.  **Select Layout**: Choose Layout 1, 2, or 3.
2.  **Engine Setup**: `const engine = useGameEngine({ initialTime: 60 });`
3.  **Implement Logic**:
    *   Use `useRef` for Input Lock.
    *   Call `engine.submitAnswer(bool)`.
    *   **Start Power-Ups at 0**.
4.  **Implement Visuals**:
    *   Wrap in `<LayoutX>`.
    *   Pass background: `<LayoutX background={<MyBackgroundComponent />} ... >`
    *   Apply `useEffect` Focus Fix.

## Feedback System (Sound & Animation)
The Layouts automatically handle sensory feedback (sounds, particles, screen shake) by listening to `engine.lastEvent`. **You must manually trigger these events** in your Game Logic.

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
*   **Math (Current)**: Violet/Indigo Gradient
    *   `linear-gradient(135deg, #e9d5ff 0%, #b1b2fb 50%, #fecdd3 100%)`
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
