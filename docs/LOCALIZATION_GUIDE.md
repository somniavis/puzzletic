# Localization (i18n) Guide

This document provides a comprehensive guide to the internationalization (i18n) architecture of Puzzleletic. It explains how to add new languages, localize new games, and maintain the system.

## Related Operational Checklist

For practical rollout work (batch order, quality gates, validation commands, and common pitfalls), use:

- `docs/LOCALE_EXPANSION_CHECKPOINTS.md`

Recommended usage:
- Use this document (`LOCALIZATION_GUIDE.md`) for architecture and implementation rules.
- Use `LOCALE_EXPANSION_CHECKPOINTS.md` as the execution playbook when adding a new language.

## 1. Architecture Overview

Puzzleletic uses `react-i18next` for localization. The system is designed to handle both global application text (menus, auth, settings) and game-specific content.

### Directory Structure
```
src/
├── i18n/
│   ├── config.ts          # i18n initialization, detection, and persistence logic
│   └── locales/
│       ├── en.ts          # English Master Translation File (Global)
│       └── ko.ts          # Korean Master Translation File (Global)
└── games/
    └── [category]/
        └── [level]/
            └── [GameName]/
                └── locales/
                    ├── en.ts  # Game-specific English keys
                    └── ko.ts  # Game-specific Korean keys
```

### Key Concepts
- **Global Scope**: Common UI elements (`common`, `auth`, `settings`, `share`) are defined directly in `src/i18n/locales/[lang].ts`.
- **Game Scope**: Each game manages its own translations in its folder. These are **imported and merged** into the global locale file to ensure strict type safety and centralized management.
- **Persistence**: Language preference is saved in `localStorage` ('language') to persist across sessions.
- **Detection**: The app automatically detects the browser language if no user preference is saved.
- **Alias Safety**: Runtime language code may differ from selected locale tag (e.g. `vi` vs `vi-VN`), so `config.ts` should include alias resources where needed.

---

## 2. Managing Languages

### Supported Languages
- **English (`en`)**: Default / Fallback language.
- **Korean (`ko`)**: Fully supported.

### How to Add a New Language (e.g., Japanese `ja`)

1.  **Create Global Locale File**:
    - Create `src/i18n/locales/ja.ts`.
    - Copy the structure from `ko.ts` (as it likely contains the most up-to-date keys) and translate all values.
    ```typescript
    import pairUpTwinJa from '../../games/brain/level1/PairUpTwin/locales/ja';
    // Import other game locales...

    export const ja = {
        common: { startGame: 'ゲーム開始' },
        // ...
        games: {
            'pair-up-twin': pairUpTwinJa,
            // ...
        }
    } as const;
    export default ja;
    ```

2.  **Register the Language**:
    - Open `src/i18n/config.ts`.
    - Import `ja` and add it to `resources`.
    ```typescript
    import { ja } from './locales/ja';
    // ...
    const resources = {
      en: { translation: en },
      ko: { translation: ko },
      ja: { translation: ja }, // Add this
    };
    ```

3.  **Update Detection Logic (Optional)**:
    - Update `src/i18n/config.ts` if you want auto-detection for the new language.
    ```typescript
    const browserLanguage = navigator.language.startsWith('ja') ? 'ja' : ...
    ```

4.  **Add Alias Codes (Recommended)**:
    - Register common short/full-code pairs in `resources`:
      - `vi` + `vi-VN`
      - `pt` + `pt-PT`
      - `es` + `es-ES`
      - `en-US` + `en`
    - This prevents fallback-English leaks in overlays/badges.

4.  **Update Settings Menu**:
    - Open `src/components/SettingsMenu/SettingsMenu.tsx`.
    - Add a new button for the language in the `language` view section.
    ```tsx
    <button onClick={() => handleLanguageSelect('ja')}>
      <span className="food-item-name">日本語</span>
    </button>
    ```

---

## 3. Localizing a New Game

When creating a new game, follow these steps to ensure it supports localization:

1.  **Create Locale Files**:
    - Inside your game folder, create a `locales` directory.
    - Create `en.ts` and `ko.ts`.
    ```typescript
    // src/games/brain/level3/NewGame/locales/en.ts
    export default {
        title: "New Game",
        desc: "Description of the game",
        howToPlay: { ... }
    };
    ```

2.  **Register in Global Locales**:
    - Open `src/i18n/locales/en.ts` and `src/i18n/locales/ko.ts`.
    - Import your game's locale file.
    - Add it to the `games` object using the Game ID as the key.
    ```typescript
    // src/i18n/locales/en.ts
    import newGameEn from '../../games/brain/level3/NewGame/locales/en';

    export const en = {
        // ...
        games: {
            // ...
            'new-game-id': newGameEn,
        }
    };
    ```

3.  **Usage in Game Components**:
    - Use keys prefixed with `games.[game-id]`.
    ```tsx
    const { t } = useTranslation();
    <h1>{t('games.new-game-id.title')}</h1>
    ```

---

## 4. Tone & Manner Guidelines

To maintain a consistent user experience, please adhere to the following translation guidelines:

### Korean (한국어)
- **Voice**: Friendly, cute, and polite (존댓말).
- **Style**:
    - Use `~요` or `~세요` endings (e.g., "시작하세요", "로그인해요").
    - Use emoticons freely to enhance the mood (e.g., "성공! 🎉").
    - **Avoid** dry or bureaucratic language.
    - **Exceptions**: Certain UI buttons can be concise (e.g., "취소", "확인").
- **Terminology**:
    - `XP`, `Gro` -> Keep as English/Universal terms usually, or distinct variations if needed.
    - `SW` -> `코딩` (Coding) implies software education.
    - `Game Over` -> `게임 오버!`

### English
- **Voice**: Energetic, encouraging, and clear.
- **Style**:
    - Concise labels.
    - Enthusiastic punctuation (!).

### Emotion Output Modes (Cross-locale Rule)
- `emotions`: growth-stage lines should be `emoji + short text`.
- `emotions.emoji`: emoji-only.
- `emotions.toddler`: emoji-only.
- Keep this policy consistent across all locales.

---

## 5. Persistence & Auth

- **Persistence**: The app saves the selected language to `localStorage.getItem('language')`. This ensures the language remains selected even after a page refresh.
- **Auth Pages**: Login and Signup pages use the `auth` namespace keys (`auth.login`, `auth.signup`, `auth.errors`). Ensure all validation error messages are localized.

## 6. Share Page

- The Share Page (`src/pages/SharePage.tsx`) is accessed by external users via link.
- It relies on browser language detection (`navigator.language`) if the user has never visited before.
- Ensure keys in `share` namespace are friendly and inviting.
