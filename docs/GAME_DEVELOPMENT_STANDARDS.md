# Game Development Standards & Common Patterns

This document outlines the technical standards and common patterns to be used across all mini-games in Puzzletic. Follow these guidelines to ensure consistency, accessibility, and a high-quality user experience.

## 1. Global UX & Accessibility

### Text Selection Prevention
**Rule**: All game interfaces must prevent accidental text selection during gameplay (dragging, rapid clicking).

*   **Implementation**: Apply `user-select: none` to the main game container or the shared Layout component.
*   **Where**: `src/games/layouts/Layout*.css` or individual Game CSS files.
*   **Code Snippet**:
    ```css
    .game-container {
        user-select: none;
        -webkit-user-select: none; /* Safari Support */
        touch-action: none; /* Prevent browser scrolling/zooming on mobile */
    }
    ```

### Responsive Scaling
**Rule**: Game assets (especially central focal points) must scale proportionally to the viewport size, ensuring visibility on both small (mobile) and large (desktop) screens.

*   **Pattern**: Use `vmin` units combined with `clamp()` for font-sizes and dimensions.
*   **Example (Fruit Slice)**:
    ```css
    .central-object {
        /* Minimum 4rem, Ideal 24% of viewport min dimension, Maximum 12rem */
        font-size: clamp(4rem, 24vmin, 12rem);
    }
    ```

---

## 2. State Management & Reset Logic

### Persistent UI State Reset
**Problem**: React's reconciliation engine reuses DOM nodes (buttons, inputs) when their identity remains stable across renders. This causes "Selected", "Focused", or "Active" sets (like browser focus rings or clicked states) to persist incorrectly when a new problem is generated.

**Solution**: Force React to unmount and remount interactive elements when the game state (round/problem) changes.

**Implementation**: Use the `key` prop effectively.
*   **Pattern**: Combine the unique Item ID with the current Round, Level, or Problem Identifier.
*   **Code Example**:
    ```tsx
    // BAD: Key is stable, button reused, focus persists
    <button key={option.id} ... />

    // GOOD: Key changes when problem changes, button remounted, focus cleared
    <button key={`${option.id}-${currentProblem.id}`} ... />
    ```

**Applied Games**: `TenFrameCount`, `NumberBalance`, `PinwheelPop`, `DeepSeaDive`.

---

## 3. Asset Standards

### Emoji & Icon Usage
*   **Consistency**: Use standard Unicode Emojis for consistency unless a custom SVG is required for animation.
*   **Target Icons**: Ensure target icons (like in `NumberHive`) match the theme (e.g., use 🐝 instead of 🎯 for a hive theme).

---

## 4. Layout Architecture

### Standard Layouts
Use the pre-built `Layout` components to ensure consistent Header, Footer, and Feedback experiences.

*   **Layout0**: Full Canvas (Custom UI).
*   **Layout2**: Power-up focused (No top target box).
*   **Layout3**: Standard (Target Box + Power-ups).

### CSS Centering
To vertically center a game element (like a fruit) between a top header and a bottom control bar:
1.  **Container**: `display: flex; flex-direction: column; justify-content: space-between; height: 100%;`
2.  **Top/Bottom Elements**: Fixed height or natural height (e.g., `flex: 0`).
3.  **Center Element**: `flex: 1; display: flex; align-items: center; justify-content: center;`
