# Puzzleletic Internationalization (i18n) Guide

This document outlines the architecture and workflow for managing multi-language support in Puzzleletic. We use a **Hybrid Approach**: separating global app translations from game-specific translations to ensure scalability as the number of games grows.

## Architecture Overview

1.  **Global Scope (`src/i18n/`)**:
    *   Contains common UI terms (Play, Settings, Cancel), domain terms (Math, Science), and the master game list metadata (Titles, Descriptions).
    *   Loaded at app startup.

2.  **Local Game Scope (`src/games/.../[GameID]/locales/`)**:
    *   Contains text specific to a single game (Questions, specific instructional text).
    *   **Dynamically loaded** only when the game is played.

---

## 1. Global Translations (App-wide)

Use this for text that appears in the main UI, menus, or is shared across many games.

**File Location:**
*   English: `src/i18n/locales/en.ts`
*   Korean: `src/i18n/locales/ko.ts` (to be created)

**How to Add:**
1.  Open the locale file for the target language.
2.  Add your key-value pair under the appropriate namespace.

```typescript
// src/i18n/locales/en.ts
export const en = {
  common: {
    start: "Start Game",
    score: "Score",
  },
  // ...
};
```

**Usage in Code:**
```tsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  return <button>{t('common.start')}</button>;
};
```

---

## 2. Game Metadata (Registry)

Game titles and descriptions displayed in the `PlayPage` list must be translated. Since these are needed *before* entering a game, they are kept in a separate global namespace or a dedicated "game list" locale file to avoid loading every single game's full translation bundle.

**Strategy:**
*   Add game titles/descriptions to the global `en.ts` / `ko.ts` under a `gameList` or `games` key structure.

**Implementation Step:**
1.  Add keys to `src/i18n/locales/en.ts`:
    ```typescript
    games: {
      "math-01": {
        title: "Number Match",
        desc: "Match the numbers to solve the puzzle!"
      }
    }
    ```
2.  Update `manifest.ts` to use keys (see Section 3).

---

## 3. Game-Specific Translations (Dynamic)

Use this for text that exists ONLY inside a specific game.

**File Structure:**
Each game folder should have a `locales` directory:
```
src/games/math/level1/001_NumberMatch/
├── index.tsx
├── manifest.ts
└── locales/
    ├── en.ts  <-- English resources
    └── ko.ts  <-- Korean resources
```

**Step 1: Create Locale Files**
```typescript
// src/games/math/level1/001_NumberMatch/locales/en.ts
export default {
  instruction: "Select two numbers that add up to {{target}}",
  correct: "Correct!",
  game_over: "Game Over"
};
```

**Step 2: Load in Game Component**
We use a custom hook or directly use `i18n.addResourceBundle` inside the game component.

```tsx
// src/games/math/level1/001_NumberMatch/index.tsx
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import en from './locales/en';
import ko from './locales/ko';

export const NumberMatch = () => {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    // Inject translations dynamically
    i18n.addResourceBundle('en', 'math-01', en, true, true);
    i18n.addResourceBundle('ko', 'math-01', ko, true, true);
    
    // Config cleanup is optional depending on memory requirements
  }, [i18n]);

  // Use with namespace 'math-01' (Game ID)
  return <div>{t('math-01:instruction', { target: 10 })}</div>;
};
```

---

## 4. How to Add a New Language

1.  **Create Global Locale File:**
    *   Create `src/i18n/locales/[lang].ts` (e.g., `ja.ts` for Japanese).
    *   Copy the structure from `en.ts` and translate.

2.  **Register in Config:**
    *   Open `src/i18n/config.ts`.
    *   Import the new file.
    *   Add it to the `resources` object.

3.  **Update Settings Menu:**
    *   Update `src/components/SettingsMenu/SettingsMenu.tsx` to include the new language option in the UI.

4.  **Update Games (Iterative):**
    *   For each existing game, add the corresponding `[lang].ts` in its `locales/` folder.
