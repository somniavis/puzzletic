# Mobile UI Guard Audit

Date: 2026-04-17
Scope: `mobile-ui-guard`, `useMobileInteractionGuard`, `usePreventArcadeBrowserGestures`, and existing mobile interaction suppression rules across `src/`

## Audit Method

This audit was performed with:

- full-text code search across `src/` and relevant docs
- implementation review of:
  - [`src/index.css`](../src/index.css)
  - [`src/hooks/useMobileInteractionGuard.ts`](../src/hooks/useMobileInteractionGuard.ts)
  - [`src/games/play/shared/usePreventArcadeBrowserGestures.ts`](../src/games/play/shared/usePreventArcadeBrowserGestures.ts)
  - currently guarded page roots
- static build verification via `npm run build`

What was **not** performed in this audit:

- real-device manual testing on iOS Safari / Android Chrome
- automated browser E2E tests

Because of that, this report is a **code audit + static verification report**, not a full device-behavior certification.

## Verified Current State

### 1. Common guard exists and is wired correctly

The shared mobile guard is implemented in:

- [`src/index.css`](../src/index.css)
- [`src/hooks/useMobileInteractionGuard.ts`](../src/hooks/useMobileInteractionGuard.ts)

Current common behavior:

- removes tap highlight via `-webkit-tap-highlight-color: transparent`
- blocks long-tap callout via `-webkit-touch-callout: none`
- disables selection for guarded roots by default
- restores text selection for:
  - `input`
  - `textarea`
  - `select`
  - `[contenteditable="true"]`
- blocks:
  - `contextmenu`
  - `dragstart`
  - `selectstart`
- optionally blocks:
  - `copy`
  - `cut`
  - `touchstart`
  - `touchmove`
- currently defaults to blocking only `gesturestart` among touch gestures

### 2. Common guard is currently applied to 6 page roots

Confirmed usage:

- [`src/pages/LandingPagePreview2.tsx`](../src/pages/LandingPagePreview2.tsx)
- [`src/pages/LoginPage.tsx`](../src/pages/LoginPage.tsx)
- [`src/pages/SignupPage.tsx`](../src/pages/SignupPage.tsx)
- [`src/pages/ProfilePage.tsx`](../src/pages/ProfilePage.tsx)
- [`src/pages/EncyclopediaPage.tsx`](../src/pages/EncyclopediaPage.tsx)
- [`src/pages/PlayPage.tsx`](../src/pages/PlayPage.tsx)

These pages now use both:

- root class: `mobile-ui-guard`
- hook: `useMobileInteractionGuard({ rootRef })`

### 3. Duplicate page-level suppression rules were partially cleaned up

Confirmed cleaned:

- [`src/pages/ProfilePage.css`](../src/pages/ProfilePage.css)
- [`src/pages/EncyclopediaPage.css`](../src/pages/EncyclopediaPage.css)
- [`src/pages/PlayPage.css`](../src/pages/PlayPage.css)

Remaining matches in currently guarded page CSS are limited to generic container-level `user-select: none` and not the old full per-control suppression block.

### 4. Arcade games still use a stronger dedicated guard

Confirmed:

- [`src/games/play/arcade/GroGroLand/index.tsx`](../src/games/play/arcade/GroGroLand/index.tsx)
- [`src/games/play/arcade/TailRunner/index.tsx`](../src/games/play/arcade/TailRunner/index.tsx)
- [`src/games/play/arcade/JelloKnight/index.tsx`](../src/games/play/arcade/JelloKnight/index.tsx)

All 3 use:

- [`src/games/play/shared/usePreventArcadeBrowserGestures.ts`](../src/games/play/shared/usePreventArcadeBrowserGestures.ts)

This is stronger than `useMobileInteractionGuard` because it blocks:

- `copy`
- `cut`
- `gesturestart`
- `touchstart`
- `touchmove`

and also applies separate stage/control-level prevention.

This separation is currently appropriate for arcade gameplay.

### 5. Static build passes

Verified with:

```bash
npm run build
```

Result:

- build passed successfully on 2026-04-17

## Quantitative Findings

### A. Files still containing local mobile suppression CSS

Search result:

- `60` files in `src/` still contain one or more of:
  - `-webkit-touch-callout: none`
  - `-webkit-tap-highlight-color: transparent`
  - `-webkit-user-select: none`
  - `user-select: none`

Interpretation:

- the codebase is **not yet centralized**
- current common guard is only a first layer, not the final single source of truth

### B. Pages currently using the new common guard

Search result:

- `6` page files

Interpretation:

- this is a focused rollout, not a whole-app rollout

### C. Arcade-specific strong guard usage

Search result:

- `3` live arcade game roots use `usePreventArcadeBrowserGestures`

Interpretation:

- arcade interactions still correctly sit behind a dedicated stronger policy

### D. Other game logic with direct `touchmove` listeners

Confirmed direct `touchmove` listeners exist in at least:

- [`src/games/math/adventure/level1/JelloFeeding/index.tsx`](../src/games/math/adventure/level1/JelloFeeding/index.tsx)
- [`src/games/math/adventure/level2/MagicPotion/index.tsx`](../src/games/math/adventure/level2/MagicPotion/index.tsx)
- [`src/games/math/adventure/level3/DonutShop/index.tsx`](../src/games/math/adventure/level3/DonutShop/index.tsx)
- [`src/games/math/adventure/level3/FairShare/index.tsx`](../src/games/math/adventure/level3/FairShare/index.tsx)
- [`src/games/math/adventure/level3/FruitBox/index.tsx`](../src/games/math/adventure/level3/FruitBox/index.tsx)
- [`src/games/math/adventure/level3/TrollAttack/index.tsx`](../src/games/math/adventure/level3/TrollAttack/index.tsx)

Interpretation:

- these games may need a separate interaction policy review
- they should not be blindly migrated to `mobile-ui-guard` defaults without gameplay verification

## Clear Conclusions

## Conclusion 1. The new common guard itself is structurally sound

From code inspection, the shared pair of:

- [`src/index.css`](../src/index.css)
- [`src/hooks/useMobileInteractionGuard.ts`](../src/hooks/useMobileInteractionGuard.ts)

is internally consistent for standard page UI.

Why:

- CSS handles passive visual suppression globally inside guarded roots
- hook handles event-level prevention and selection cleanup
- text-entry controls are explicitly exempted

## Conclusion 2. The app is not yet in a “fully standardized” state

This is the most important truth in this audit.

It would be inaccurate to say:

- “the issue is fully solved everywhere”
- “future recurrence is impossible”
- “all mobile interaction suppression is now centralized”

Those statements would be false.

What is true:

- the common pattern now exists
- several high-traffic page roots already use it
- duplicate rules have started to be removed
- but many local CSS suppression rules still remain across the repo

## Conclusion 3. Arcade gameplay needs separate handling

This is not technical debt by itself.

For arcade games, stronger prevention is justified because:

- joystick/stage dragging must not trigger browser gestures
- stage touchmove must remain tightly controlled
- overlay buttons need selective exceptions

So the current split is valid:

- general pages: `mobile-ui-guard` + `useMobileInteractionGuard`
- arcade playfields: `usePreventArcadeBrowserGestures`

## Risks and Open Issues

### Risk 1. Broad global `touch-action: manipulation`

In [`src/index.css`](../src/index.css), the global rule:

```css
*,
*::before,
*::after {
  touch-action: manipulation;
}
```

is very broad.

Potential concern:

- it affects the entire app, not only guarded UI roots
- some gesture-heavy or future custom interaction surfaces may behave unexpectedly

Current status:

- no breakage was proven in this audit
- but this rule is broad enough to deserve separate review

### Risk 2. Mixed policy across the repo

Because 60 files still carry local suppression styles, the current system is mixed:

- common guard in some roots
- legacy CSS suppression in many components/games
- direct touchmove handlers in some games

This means:

- behavior consistency is improved, but not guaranteed everywhere
- future contributors may still add one-off fixes if standards are not documented and enforced

### Risk 3. No real device verification yet

This audit did **not** prove actual behavior on:

- iOS Safari
- iOS Chrome
- Android Chrome
- Samsung Internet

So claims about:

- long-press copy menu fully suppressed
- text highlight fully suppressed
- no regression in input fields

are still only code-level confidence, not device-certified facts

## Recommended Next Actions

### Priority A. Keep current split architecture

Do not merge arcade strong guard into the normal page guard yet.

Maintain:

- `useMobileInteractionGuard` for general page roots
- `usePreventArcadeBrowserGestures` for arcade/game stage roots

### Priority B. Expand common guard to additional non-game page roots

Good next candidates:

- other modal-heavy standard pages
- menu/dashboard roots
- non-drag, non-canvas interfaces

### Priority C. Audit remaining local suppression CSS in batches

Recommended batches:

1. `src/pages/*`
2. `src/components/PetRoom/*`
3. `src/games/layouts/Standard/*`
4. non-arcade drag games
5. arcade CSS cleanup last

### Priority D. Add real device verification checklist

Recommended manual matrix:

- iPhone Safari
- iPhone Chrome
- Android Chrome
- Android Samsung Internet

For each:

- tap button
- long-tap button
- long-tap text
- drag on gameplay area
- input focus and typing
- copy/paste in allowed input field

## Follow-up Roadmap

The following direction should be treated as the next implementation roadmap.

### Phase 1. Expand common guard only in safe general UI roots

Target:

- standard pages
- modal-heavy non-game screens
- menu/dashboard roots

Rule:

- apply `mobile-ui-guard` and `useMobileInteractionGuard`
- remove duplicated per-page CSS suppression only after each target page is verified
- do not touch drag/gameplay-heavy screens in this phase

### Phase 2. Audit remaining legacy local suppression CSS in batches

Execution order:

1. `src/pages/*`
2. `src/components/*` general UI
3. `src/components/PetRoom/*`
4. `src/games/layouts/Standard/*`
5. non-arcade interactive games
6. arcade-specific CSS last

Rule:

- for each batch, classify rules into:
  - safe to delete
  - safe to absorb into common guard
  - must remain local because interaction behavior is special

### Phase 3. Preserve separate strong protection for arcade playfields

Keep arcade gameplay under:

- [`src/games/play/shared/usePreventArcadeBrowserGestures.ts`](../src/games/play/shared/usePreventArcadeBrowserGestures.ts)

Direction:

- do not merge this directly into the general page guard yet
- instead, later refactor both guards so they share small utilities while keeping different behavior levels

### Phase 4. Review direct `touchmove` game handlers separately

Games with explicit `touchmove` listeners must be reviewed one by one before any commonization.

Reason:

- these are often tied to drag, aiming, slicing, or continuous movement systems
- replacing them carelessly can break real gameplay input

### Phase 5. Add real-device verification before calling the migration complete

Minimum matrix:

- iOS Safari
- iOS Chrome
- Android Chrome
- Samsung Internet

Completion condition:

- long-tap copy/highlight suppression works on protected UI
- inputs still allow normal text interaction
- gameplay drag/touch remains intact
- no noticeable regression in button response or gesture handling

### Phase 6. Document the rule for future development

When new screens are added:

- default to `mobile-ui-guard` for standard UI roots
- use the common hook instead of page-local CSS when possible
- only add page-local or game-local suppression when the interaction model truly requires stronger behavior

This is necessary to prevent recurrence of one-off mobile fixes across the codebase.

## Final Verdict

The current common mobile interaction guard is a **good and valid foundation**, but the codebase is **not yet fully consolidated**.

So the honest status is:

- `mobile-ui-guard` implementation: **good**
- current guarded page rollout: **good**
- arcade split strategy: **correct**
- whole-project standardization: **not finished**
- full mobile behavior guarantee across all screens/devices: **not yet proven**

That is the most accurate statement this audit can support.
