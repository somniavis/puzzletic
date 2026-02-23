# Locale Expansion Checkpoints

This document captures the step-by-step checkpoints used while adding and stabilizing new locales (`es-ES`, `pt-PT`, `vi-VN`, `en-UK`) so the same flow can be reused for future language expansion.

## Goal

- Keep current architecture unchanged:
  - System locale files: `src/i18n/locales/*.ts`
  - Game locale files: `src/games/**/locales/*.ts`
  - Final merge in system locale via `games` object imports
- Ensure translation quality is meaning-based (not literal), using `en` + `ko` together as reference.

## Scope Order (Always Sequential)

1. System core locale file
2. i18n config and language selector wiring
3. Game locale files (batch-by-batch)
4. Build validation
5. Residual English and quality sweep
6. Device/UX sensitive text verification (short labels, badges, tutorial lines)
7. Runtime locale-code alias verification (`xx` vs `xx-YY`)

## Step 0: Pre-check

- Confirm branch/worktree status:
  - `git status --short`
- Confirm locale architecture is intact:
  - `src/i18n/config.ts`
  - `src/components/SettingsMenu/SettingsMenu.tsx`
  - `src/i18n/locales/en.ts`, `ko.ts`
- Confirm target locale files do not already exist (or identify partial work).

## Step 1: Create Locale Skeleton

- System:
  - `src/i18n/locales/<lang>.ts`
- Game files:
  - `src/games/**/locales/<lang>.ts`

Rules:
- Keep key structure identical to `en.ts` source file.
- Do not change keys or nesting.
- Only translate values.

## Step 2: Register Locale in Runtime

Update:
- `src/i18n/config.ts`
  - import new locale
  - add it to `resources`
  - include language detection mapping if needed
  - add language-code aliases when needed:
    - e.g. `vi` -> `vi-VN`, `pt` -> `pt-PT`, `es` -> `es-ES`, `en-US` -> `en`
- `src/components/SettingsMenu/SettingsMenu.tsx`
  - add language option button/label

Checkpoint:
- Language appears in settings.
- Language switch works and persists.
- Locale-code variant still resolves translated strings in runtime overlays/components.

Example alias pattern:

```ts
const resources = {
  en: { translation: en },
  'en-US': { translation: en },
  'en-UK': { translation: enUK },
  es: { translation: esES },
  'es-ES': { translation: esES },
  pt: { translation: ptPT },
  'pt-PT': { translation: ptPT },
  vi: { translation: viVN },
  'vi-VN': { translation: viVN },
};
```

## Step 3: System Text Translation (High Priority)

Translate `src/i18n/locales/<lang>.ts` in this order:

1. `common`, `auth`, `settings`, `play`, `share`
2. `profile`, `landing`, `shop`, `food`
3. `character` and `evolutions`
4. `emotions` and `toddler` blocks
5. Any game metadata merged under `games`

Quality rules:
- Use natural phrasing in target language.
- Keep UI strings short (buttons, badges, hints).
- Preserve placeholders exactly:
  - `{{count}}`, `{{time}}`, etc.

## Step 4: Game Locale Translation (Batch Mode)

Translate game locale files in manageable batches (recommended by category/level):

- `src/games/math/adventure/...`
- `src/games/math/genius/...`
- `src/games/brain/...`

After each batch:
- run build
- smoke-check critical screens

## Step 5: Automated Consistency Checks

Use these checks each batch:

- Find residual English:
  - `rg -n -i "\\b(start|target|tap|ready|game over|how to play|next|back|score|time|lives)\\b" src/i18n/locales/<lang>.ts src/games/**/locales/<lang>.ts`
- Find encoding issues:
  - `rg -n "�" src/i18n/locales/<lang>.ts src/games/**/locales/<lang>.ts`
- Find exact-structure drift:
  - compare key structure against `en` when suspicious.
- Find high-risk hardcoded labels in UI pages/components:
  - `rg -n "\"[A-Za-z].*\"|'[A-Za-z].*'" src/pages src/components | rg -v "className|style|import|http|\\.css|console|id|type|aria|fa-|<|>|\\btrue\\b|\\bfalse\\b"`

## Step 6: Build Validation (Required)

Run:
- `npm run build`

Pass criteria:
- TypeScript build passes
- Vite build passes
- No locale import errors

## Step 7: Quality Sweep (Meaning Accuracy)

For each changed file:
- Compare `en` + `ko` intent first
- Ensure translated sentence matches intended gameplay meaning
- Avoid direct literal translation when unnatural

Specific hot spots:
- How-to-play title/description brevity
- Emotion/onomatopoeia lines
- Shop item labels and flavor text
- Badge/target/timer short UI text
- Premium lock overlays and locked badges (Play list)
- Profile/My Jello areas (subscription labels, expiry/cancel prompts)

### Emotion Data Policy (Important)

- Keep mode separation explicit:
  - `emotions`: growth-stage text output (`emoji + short phrase`)
  - `emotions.emoji`: emoji-only output
  - `emotions.toddler`: emoji-only output
- Do not collapse all emotion modes into emoji-only for mature stages.
- If rebuilding emotion lines programmatically, ensure:
  - key structure parity with `en`
  - natural tone in target language (not literal translation)
  - no placeholder/key drift

## Step 8: Known Pitfalls and Preventive Rules

1. Encoding corruption during bulk replace
- Pitfall: automated replace can insert broken characters (`�`).
- Rule: always run `rg -n "�"` after bulk replacement.

2. Residual English in emotional text
- Pitfall: interjections remain in English.
- Rule: run residual-English scan and review manually.

3. Placeholder breakage
- Pitfall: accidental change of `{{var}}` token names.
- Rule: verify placeholders unchanged before build.

4. Oversized text in UI
- Pitfall: long localized text breaks compact UI areas.
- Rule: keep badges/buttons concise and test visually.

5. Locale code mismatch at runtime
- Pitfall: UI shows fallback English because app language is `vi`, but resources only define `vi-VN`.
- Rule: add resource aliases in `i18n/config.ts` for major code variants.

6. Overlay text bypassing locale review
- Pitfall: lock/premium overlays keep English while main pages are translated.
- Rule: include overlay/badge components in every locale QA pass.

## Step 9: Completion Report Format

When finishing each batch, report:

1. Files/areas translated
2. Checks run (`rg`, build)
3. Issues fixed (if any)
4. Remaining next batch scope

## Recommended Command Set

```bash
git status --short
rg --files src/games | rg '/locales/<lang>.ts$'
rg -n "�" src/i18n/locales/<lang>.ts src/games/**/locales/<lang>.ts
rg -n -i "\\b(start|target|tap|ready|game over|how to play|next|back|score|time|lives)\\b" src/i18n/locales/<lang>.ts src/games/**/locales/<lang>.ts
npm run build
```

## Definition of Done

- Locale is selectable in settings.
- System text translated with natural language quality.
- All game locale files for target language exist and are translated.
- Build passes.
- No encoding artifacts.
- No obvious residual English in user-facing strings.
- Overlay/lock/premium badges also localized.
- Emotion output follows mode policy (`text` vs `emoji-only`) correctly.
