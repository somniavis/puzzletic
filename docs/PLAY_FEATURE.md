# Play Feature Documentation

## Overview
The Play feature provides an educational game hub within the Puzzleletic application. It allows users to browse and play games categorized by subject (Math, Science, SW) and difficulty level (1-5).

## Directory Structure

### Core Components
- **`src/pages/PlayPage.tsx`**: The main entry point for the Play feature. Handles UI rendering, category/level selection, and game list display.
- **`src/pages/PlayPage.css`**: Play page style entry file. Now keeps only shared page layout/base styles plus imports for feature-specific style modules.
- **`src/components/PlayPage/PlayAdventureBoard.tsx`**: Container for the Play Adventure board. Builds level view models, connects motion state, and renders level sections.

### PlayPage Style Structure
`PlayPage.css` became too large to maintain comfortably, so the styling was split by responsibility. This keeps navigation/layout styles separate from board-heavy styling and makes future edits safer.

- **Style Entry**
  - **`src/pages/PlayPage.css`**
  - Responsibility: shared page-level styles such as root tokens, page container background, common loading/header layout, and imports for feature-specific style files.

- **Adventure Board Styles**
  - **`src/pages/play-page-styles/adventure-board.css`**
  - Responsibility: math play adventure board visuals including level backgrounds, board tiles, mission pads, jello, emoji clusters, moving overlay objects, and board-specific animations.

- **Cards / Level Group Styles**
  - **`src/pages/play-page-styles/cards-and-levels.css`**
  - Responsibility: Learn/Brain card styles, math/brain level section styling, level transitions, card variants, and the brain section synapse header effect.

- **Drill / Bottom Navigation Styles**
  - **`src/pages/play-page-styles/drill-and-nav.css`**
  - Responsibility: Genius drill list UI, operator tabs, drill items, mini action buttons, bottom navigation, and shared page animation utilities that belong to these sections.

### Maintenance Notes For PlayPage Styles
- When changing only play adventure board visuals, prefer editing:
  - **`adventure-board.css`**
- When changing Learn cards, Brain cards, or level-group presentation, prefer editing:
  - **`cards-and-levels.css`**
- When changing Genius drills or bottom navigation, prefer editing:
  - **`drill-and-nav.css`**
- Keep **`PlayPage.css`** focused on high-level page layout and imports so the file does not grow back into a single monolithic stylesheet.

### Play Adventure Board Structure
The Play Adventure board was split into smaller modules so that layout, decoration rules, motion state, and rendering concerns are isolated. This improves readability and helps keep re-renders/recalculation scopes smaller on older devices.

- **Container**
  - **`src/components/PlayPage/PlayAdventureBoard.tsx`**
  - Responsibility: compose board-level view models and connect the motion hook.

- **Level Rendering**
  - **`src/components/PlayPage/PlayAdventureBoardLevelSection.tsx`**
  - Responsibility: render a single level section including header, background decor, board content, and level transition divider.
  - **`src/components/PlayPage/PlayAdventureBoardLevelContent.tsx`**
  - Responsibility: render tiles, mission pads, start pad, overlay creatures/vehicles, and the jello avatar.
  - **`src/components/PlayPage/PlayAdventureBoardLevelDecor.tsx`**
  - Responsibility: render background-only decorative layers for each level.

- **Board Data / Rules**
  - **`src/components/PlayPage/playAdventureBoardLayout.ts`**
  - Responsibility: generate board geometry, pad slots, bundle indexes, accessible bundle indexes, and overlay tile key helpers.
  - **`src/components/PlayPage/playAdventureBoardDecorations.ts`**
  - Responsibility: keep level decoration constants and tile decoration rules such as fish, flowers, mushrooms, desert objects, etc.
  - **`src/components/PlayPage/playAdventureBoardOverlayRules.ts`**
  - Responsibility: define which bundle/tile positions are used by moving overlay objects such as boats, camels, bees, and elephants.
  - **`src/components/PlayPage/playAdventureBoardTypes.ts`**
  - Responsibility: shared types for layouts, render models, motion assignments, and overlay rules.

- **Motion / Rendering Helpers**
  - **`src/components/PlayPage/playAdventureBoardMotion.ts`**
  - Responsibility: random motion presets, initial creature assignment, and overlay animation name mapping.
  - **`src/components/PlayPage/playAdventureBoardRenderers.tsx`**
  - Responsibility: render reusable tile overlay visuals such as emoji clusters, fish/jellyfish/scorpions/beetles, and moving overlay objects.
  - **`src/components/PlayPage/usePlayAdventureBoardMotion.ts`**
  - Responsibility: manage all animated board overlay state (`boat`, `sailboat`, `camel`, `bee`, `elephant`, creature motion maps) independently from jello movement.

### Maintenance Notes For Adventure Board
- When adding a new moving overlay object, update:
  - **`playAdventureBoardOverlayRules.ts`** for tile positions
  - **`playAdventureBoardMotion.ts`** if a new animation mapping is needed
  - **`playAdventureBoardRenderers.tsx`** if the overlay visual needs a new renderer branch
- When changing only visual background decorations for a level, prefer editing:
  - **`PlayAdventureBoardLevelDecor.tsx`**
  - **`playAdventureBoardDecorations.ts`**
- When changing board progression/accessibility logic, prefer editing:
  - **`playAdventureBoardLayout.ts`**
- Jello movement should not reset ambient tile effects. Motion state is intentionally stored in **`usePlayAdventureBoardMotion.ts`** and is separate from current jello tile state.

### Game Logic
- **`src/games/`**: Root directory for all game implementations.
### Game Logic
- **`src/games/`**: Root directory for all game implementations.
  - **`registry.ts`**: Central registry where all available games are imported and exported via `GAMES` array. Used by `PlayPage` to list games.
  - **`types.ts`**: TypeScript definitions for the game system (`GameManifest`, `GameDifficulty`, etc).
  - **`src/games/[category]/[level]/[ID]_[GameName]/`**: Standardized structure for individual games.
    - Example: `src/games/math/level1/001_NumberMatch/`
    - Each game folder must contain an `index.tsx` (component) and `manifest.ts` (metadata).

## UI/UX Design

### Responsive Layout
The game list uses a **Vertical Card List** layout to optimize readability and touch targets:
- **Layout**: Vertical list (`flex-direction: column`) where each game is presented as a horizontal card.
- **Card Design**: Includes a large thumbnail, title, subtitle, and a dedicated "Play" button.
- **Adaptability**: The cards automatically adjust their internal spacing and font sizes for mobile devices, ensuring a consistent look across Desktop, Tablet, and Mobile.

### Level Selector
- **Layout**: Fixed 1x5 grid (1 row, 5 columns) across all devices.
- **Design**: Ensures buttons are always accessible in a single row without wrapping, even on small screens.

### Sound Integration
- **Click Sounds**: Interactive elements (buttons, game cards) trigger `playButtonSound()`.
- **Background Music**: `SoundProvider` wraps the entire application in `App.tsx` to ensure BGM persists when navigating between the PetRoom and PlayPage.

## Routing
- **Route**: `/play`
- **Navigation**: Accessible via the "Play" button in the PetRoom. Includes a "Home" button to return to the PetRoom.

## Scalability
The structure is designed to support 1000+ games. New games should be added to the `src/games` directory following the category/level structure and registered in `src/games/registry.ts`.

---

## Game Icon Color Mapping

> **중요**: 신규 게임 추가 시 아래 내용을 참고하여 적절한 아이콘 배경색을 지정해야 합니다.

### 구현 위치
`src/pages/PlayPage.tsx` 내 `getIconBackground` 함수

### 색상 매핑 테이블

| 이모지 | 배경색 | Hex Code | 대표 게임 |
|---|---|---|---|
| 🐟 | Sky-100 | `#e0f2fe` | Fishing Count |
| 🎯 | Red-100 | `#fee2e2` | Round Counting |
| 🐝 | Amber-100 | `#fef3c7` | Number Hive |
| ⚖️ | Blue-100 | `#dbeafe` | Number Balance |
| 🍎 | Rose-100 | `#ffe4e6` | Fruit Slice |
| 🏹 | Emerald-100 | `#d1fae5` | Math Archery |
| 🧱 | Orange-200 | `#fed7aa` | Ten Frame Count |
| 🍭 | Violet-200 | `#ddd6fe` | Pinwheel Pop |
| 🤿 | Cyan-100 | `#cffafe` | Deep Sea Dive |
| 🛸 | Purple-200 | `#e9d5ff` | UFO Invasion |
| 🔗 | Pink-100 | `#fce7f3` | Color Link |
| 👯 | Purple-100 | `#f3e8ff` | Pair Up Twin |
| 🧩 | Emerald-100 | `#d1fae5` | Maze Escape |
| 🐒 | Yellow-100 | `#fef9c3` | Pair Up Connect |
| 🍽️ | Amber-100 | `#fef3c7` | Animal Banquet |
| 📡 | Teal-100 | `#ccfbf1` | Signal Hunter |

### 신규 게임 추가 시
1. 게임의 `thumbnail` 이모지를 선정
2. 이모지에 어울리는 Tailwind 100/200 레벨 파스텔 색상 선택
3. `getIconBackground` 함수의 `emojiColorMap`에 추가

```typescript
// PlayPage.tsx
const emojiColorMap: Record<string, string> = {
    // 기존 매핑...
    '🆕': '#새색상', // 신규 게임
};
```

### 기본값
- **매핑되지 않은 이모지**: `#eef2ff` (Indigo-50)
- **잠금 상태**: `#f1f5f9` (Slate-100)
