# Profile Page Implementation Guide

This document contains all necessary code and configuration to replicate the Profile Page feature.

---

## Overview

The Profile page provides:
- Account status card with email and membership badge (TRIAL / 👑 PREMIUM)
- Premium subscription buttons (quarterly/yearly)
- Animated gold border effect for premium users
- My Jello Box navigation link
- Auto-pauses game ticks while on page

---

## File Structure

```
src/
├── pages/
│   ├── ProfilePage.tsx      # Main Component
│   └── ProfilePage.css      # Styling
├── i18n/
│   └── locales/
│       └── en.ts            # Translation keys (profile section)
└── App.tsx                  # Route configuration (/profile)
```

---

## Key Features

### 1. Account Status Card
- Shows user email and membership status
- TRIAL badge for free users
- 👑 PREMIUM badge with animated gold border for premium users

### 2. Premium Subscription
- Quarterly: $1.15/month (total $3.45)
- Yearly: $1.00/month (total $12.00) - Best Value badge

### 3. Premium Active Animation
The premium account card uses the same gold shine animation as hidden jellos in the Encyclopedia:
```css
@keyframes goldShine {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}
```

### 4. Tick Pause
Profile page pauses all nurturing ticks when entering (like Play page):
```tsx
useEffect(() => {
    pauseTick();
    return () => resumeTick();
}, [pauseTick, resumeTick]);
```

### 5. Debug Mode (Dev Only)
- Located at the bottom of the profile page.
- Allows adding GRO/XP and fully restoring stats (**Max Stats**).
- **Max Stats**: Instantly sets Fullness, Health, Happiness to 100 and cures illness.

---

## Route Configuration

```tsx
// App.tsx
import { ProfilePage } from './pages/ProfilePage'

<Route path="/profile" element={
  <ProtectedRoute>
    <ProfilePage />
  </ProtectedRoute>
} />
```

---

## Navigation

- **PetRoom header profile click** → navigates to `/profile`
- **Profile X button** → navigates to `/home`
- **My Jello Box button** → navigates to `/encyclopedia`
- **Encyclopedia back button** → navigates to `/profile`

---

## Translation Keys

```typescript
profile: {
  title: 'Profile',
  signedInAs: 'Signed in as',
  guestUser: 'Guest User',
  status: {
    premium: '👑 PREMIUM',
    free: 'TRIAL',
  },
  upgradePrompt: 'Upgrade to Premium',
  subscription: {
    quarterly: { title: 'Billed quarterly', desc: 'Now $3.45' },
    yearly: { title: 'Billed annually', desc: 'Total $12.00', badge: 'Best Value' },
    unit: '/ month',
    currency: 'USD',
  },
  cancelPolicy: 'All plans can be cancelled anytime.',
  myJelloBox: 'My Jello Box',
}
```

---

## Design Notes

- Header height: `0.7rem 1.5rem` padding (unified with Play/Encyclopedia pages)
- Close button: X style matching all pages
- Section padding: `1.5rem` (equal on all sides)
- Premium card: Gold gradient border with 4s animation cycle
