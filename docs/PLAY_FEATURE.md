# Play Feature Documentation

## Overview
The Play feature provides an educational game hub within the Puzzleletic application. It allows users to browse and play games categorized by subject (Math, Science, SW) and difficulty level (1-5).

## Directory Structure

### Core Components
- **`src/pages/PlayPage.tsx`**: The main entry point for the Play feature. Handles UI rendering, category/level selection, and game list display.
- **`src/pages/PlayPage.css`**: Dedicated styling for the Play page, ensuring consistency with the PetRoom aesthetic.

### Game Logic
- **`src/games/`**: Root directory for all game implementations.
  - `registry.ts`: Central registry file where all games are imported and exported.
  - `types.ts`: TypeScript definitions for the game system (`GameManifest` etc).
  - **`src/games/[category]/[level]/[ID]_[GameName]/`**: Standardized structure for individual games.
    - Example: `src/games/math/level1/001_NumberMatch/`
    - Each game folder must contain an `index.tsx` (component) and `manifest.ts` (metadata).

## UI/UX Design

### Responsive Layout
The game list adapts to various screen sizes to ensure optimal visibility:
- **Desktop (> 1024px)**: 4 columns
- **Tablet (768px - 1024px)**: 3 columns
- **Mobile (480px - 768px)**: 2 columns
- **Small Mobile (< 480px)**: 1 column

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
