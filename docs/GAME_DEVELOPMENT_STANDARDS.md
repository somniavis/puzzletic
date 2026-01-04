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

---

## 5. Cross-Browser & Mobile Compatibility

### Safari Tap Highlight
**Problem**: On iOS/Safari, tapping interactive elements creates a gray background highlight box, which looks unpolished in a game context.

**Solution**: Reset the tap highlight color to transparent globally or on specific interactive classes.

**Code Snippet**:
```css
.interactive-element {
    -webkit-tap-highlight-color: transparent;
}
```

### Mobile "Sticky Hover"
**Problem**: On touch devices, the `:hover` state persists after a tap until another element is tapped, leaving buttons looking "stuck" in their hover state.

**Solution**: Wrap all hover effects in a media query that checks if the device supports true hovering.

**Code Snippet**:
```css
/* Only apply hover effect if the primary input mechanism can hover */
@media (hover: hover) {
    .btn:hover {
        transform: scale(1.05);
        background-color: #f0f0f0;
    }
}
```

### Programmatic Focus Reset
**Problem**: In some browsers (especially Safari), `document.activeElement` might retain focus on a button (like an option in a previous round) even after the React component re-renders or updates. This can cause keyboard events to misfire or visual focus rings to persist inappropriately.

**Solution**: Explicitly blur the active element when the game's core state (problem/round) advances.

**Code Snippet**:
```tsx
// Inside your main Game Component (index.tsx)
useEffect(() => {
    // Force blur on problem/round change to prevent sticky focus
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
    }
}, [currentProblem.id, round]); // Depend on your state trigger
```

### Ghost Click Prevention (Input Lock)
**Problem**: On touch devices, rapid tapping or "Ghost Clicks" can cause an input on the current screen to accidentally trigger an element on the *next* screen (e.g., selecting an answer immediately after the new problem loads).

**Solution**: Implement a synchronous Input Lock using `useRef` that blocks interactions for a short "Safety Cooldown" (e.g., 300ms) after a transition occurs.

**Code Snippet**:
```tsx
// 1. Init Lock Ref
const isProcessing = useRef(false);

const handleAnswer = (selected) => {
    // 2. Check Lock
    if (isProcessing.current) return;

    if (isCorrect) {
        // 3. Lock immediately
        isProcessing.current = true;
        
        // ... Logic ...

        // 4. Unlock after Transition + Cooldown
        setTimeout(() => {
            generateNextProblem();
            setTimeout(() => { isProcessing.current = false; }, 300); // Safety Cooldown
        }, 1000);
    }
};
```
