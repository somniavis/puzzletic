# Service Structure & Architecture

## 1. Routing System (React Router)
The application has migrated from state-based routing to a standard URL-based routing system using `react-router-dom`.

### Route Configuration (`App.tsx`)
- **Public Routes**:
  - `/login`: User authentication.
  - `/signup`: New user registration.
- **Protected Routes** (require authentication):
  - `/home`: Main pet room interface.
  - `/play`: Game menu list.
  - `/play/:gameId`: Individual game sessions (Deep linking support).
  - `/stats`: Character statistics and controls.
  - `/gallery`: Character evolution gallery.

### Navigation
- Used `useNavigate` hook for all internal navigation.
- Removed legacy `onNavigate` props from components.
- `ProtectedRoute` component ensures unauthenticated users are redirected to login.

## 2. Authentication (Firebase)
User management is handled via Firebase Authentication.

### Components
- **AuthContext**: Provides global `user`, `loading`, and `logout` states.
- **Firebase Config**: Initialized in `src/firebase.ts`.
- **Login/Signup Pages**: precise UI with error handling, integrated directly with Firebase SDK.

### Backend API Authentication Gate (Cloudflare Worker)
- All `/api/users/:uid*` endpoints require `Authorization: Bearer <Firebase ID Token>`.
- Worker verifies token signature (Google Secure Token JWK) and core claims (`iss`, `aud`, `exp`, `iat`, `sub`).
- Authorization rule: `token.sub` must match path `:uid` (`403 UID mismatch` if different).
- Applies to:
  - `GET /api/users/:uid`
  - `POST /api/users/:uid`
  - `POST /api/users/:uid/purchase`
  - `POST /api/users/:uid/cancel`
- Existing abnormal value checks (e.g. XP/GRO delta limits) remain as a secondary guard; token verification is the primary guard.

### Subscription Schema Requirement (D1)
- Premium APIs require DB columns: `is_premium`, `subscription_end`, `subscription_plan`.
- If migration is missing, `/purchase` and `/cancel` can fail even when auth/token is valid.
- Migration file:
  - `backend/api-grogrojello/migrations/2026-02-13_add_subscription_columns.sql`

## 3. Directory Structure Updates
we have organized the codebase to separate "Pages" from "Components".

```
src/
├── components/      # Reusable UI parts (PetRoom, SettingsMenu)
├── contexts/        # Global state (Auth, Nurturing, Sound)
├── games/           # Mini-game logic and registry
├── pages/           # Route targets
│   ├── CharacterAdmin.tsx
│   ├── GalleryPage.tsx  (New: Wrapper for CharacterAdmin)
│   ├── LoginPage.tsx
│   ├── PlayPage.tsx     (Updated: Handles dynamic routing)
│   ├── SignupPage.tsx
│   └── StatsPage.tsx    (New: Extracted from App.tsx)
└── App.tsx          # Main Router and Provider setup
```

## 4. Game Registry Architecture
The mini-games are managed through a scalable registry system to allow easy reordering and expansion.

### Registry (`src/games/registry.ts`)
- **Centralized Control**: Manages the list of active games and their display order.
- **Level-Based Grouping**: Games are imported and grouped by level/category in the `GAMES` array.
- **Order-Independent naming**: Game folders and IDs do NOT use numeric prefixes (e.g. `FishingCount`, `math-fishing-count`). Ordering is strictly defined by the array order in this file.

### Game Manifest
Each game exports a `manifest` object defining its metadata (ID, title, category, level, component). This metadata drives the UI in `PlayPage.tsx` and `LevelSelect` screens.
