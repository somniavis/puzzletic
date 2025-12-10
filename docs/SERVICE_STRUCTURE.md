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