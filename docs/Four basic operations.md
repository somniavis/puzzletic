# Four Basic Operations - Complete Specification

This document covers the game logic specifications for all four basic operations games in Puzzleletic.

---

# Front Subtraction Game

## Overview
Front Subtraction (앞에서 빼기) is a mental math game that teaches subtraction using the "front-end" method. Players solve problems step-by-step, working from hundreds to units, with special handling for "bar numbers" (negative intermediate results).

---

## Game Levels

| Level | Problem Type | Steps | Description |
|-------|--------------|-------|-------------|
| Lv1 | 2자리 - 1자리 | 3 | e.g., 84 - 7 |
| Lv2 | 2자리 - 2자리 | 3 | e.g., 84 - 27 |
| Lv3 | 3자리 - 2자리 | 4 or 5 | e.g., 980 - 35 |
| Lv4 | 3자리 - 3자리 | 4 or 5 | e.g., 543 - 278 |

---

## Core Game Rules

### Bar Number ([-])
When a subtraction results in a negative number, we flip the operands and display a "bar" (−) above the result:
- `3 - 7 = -4` → Display as `4̄` (Bar 4)
- This indicates the value must be subtracted in the next step

### Step Validation
- Each step is validated independently
- Correct answer: Green highlight, proceed to next step
- Wrong answer: Red highlight, input clears after 500ms

---

## 2-Digit Problems (Lv1/Lv2)

### Flow: 3 Steps
```
Step 1: Tens Difference
Step 2: Units Difference (may have [-])
Step 3: Final Total
```

### Scenario A: No Borrow (Units >= 0)
**Example:** `84 - 21 = 63`
```
    [8] [4]
  - [2] [1]
  ─────────
    [6]     ← Step 1: 8-2=6
        [3] ← Step 2: 4-1=3
  ─────────
    [6] [3] ← Step 3: 63 (No tooltip)
```

### Scenario B: Borrow Needed (Units < 0)
**Example:** `84 - 27 = 57`
```
    [8] [4]
  - [2] [7]
  ─────────
    [6]     ← Step 1: 8-2=6
       [̄3]  ← Step 2: 7-4=3 (Bar 3, shown with [-] above)
  ─────────
   [50-3]   ← Tooltip appears
    [5] [7] ← Step 3: 60-3=57
```

---

## 3-Digit Problems (Lv3/Lv4)

### Conditional Flow

| Condition | totalSteps | Description |
|-----------|------------|-------------|
| Tens is Negative (T[-]) | 5 | Full step-by-step flow with Intermediate |
| Tens is NOT Negative | 4 | Skip Intermediate step, go directly to Total |

---

### 5-Step Flow (T[-] 있음)
**When:** `step2_is_negative = true` (Tens subtraction is negative)

**Example:** `843 - 278 = 565`
```
Calculation:
- H: 8 - 2 = 6
- T: 4 - 7 = -3 → Bar 3 (T[-])
- U: 3 - 8 = -5 → Bar 5 (U[-])
- Intermediate: 60 - 3 = 57
- Total: 570 - 5 = 565

UI Flow:
    [8] [4] [3]
  - [2] [7] [8]
  ─────────────
    [6]         ← Step 1: INPUT (Hundreds)
       [̄3]  [0] ← Step 2: INPUT (Tens, with Ghost 0)
           [̄5] ← Step 3: INPUT (Units)
  ─────────────   
   [60-3]       ← Tooltip for Step 4 (Separator 1.5)
       [5] [7]  ← Step 4: INPUT (Intermediate)
  ─────────────
   [70-5]       ← Tooltip for Step 5 (Separator 2)
   [5] [6] [5] ← Step 5: INPUT (Final)
```

---

### 4-Step Flow (T[-] 없음)
**When:** `step2_is_negative = false` (Tens subtraction is positive or zero)

**Example:** `980 - 35 = 945`
```
Calculation:
- H: 9 - 0 = 9
- T: 8 - 3 = 5 (NOT negative → 4-step mode)
- U: 0 - 5 = -5 → Bar 5 (U[-])
- Total: 945 (skip Intermediate)

UI Flow:
    [9] [8] [0]
  -     [3] [5]
  ─────────────
    [9]         ← Step 1: INPUT (Hundreds)
        [5] [0] ← Step 2: INPUT (Tens, with Ghost 0)
           [̄5] ← Step 3: INPUT (Units)
  ─────────────
   [50-5]       ← Tooltip for Step 4 (Separator 2, NOT Separator 1.5!)
   [9] [4] [5] ← Step 4: INPUT (Final Total)
```

**Key Difference from 5-Step:**
- Intermediate row is **hidden** (not input)
- Step 4 is the **Total** (not Intermediate)
- U[-] tooltip appears at **Separator 2** (above Total row)

---

## Tooltip Position Rules

| Mode | Step | Tooltip Location |
|------|------|------------------|
| 5-step | Step 4 (Intermediate) | Separator 1.5 (below H/T row) |
| 5-step | Step 5 (Total) | Separator 2 (below U/Intermed row) |
| 4-step | Step 4 (Total) | Separator 2 (below U row) |
| 2-digit | Step 3 (Total) | Separator 2 |

---

## UI Grid Layout

### Grid Structure
```
4 Columns: [Sign/Empty] [Hundreds] [Tens] [Units]
```

### Row Template (3-Digit)
```css
gridTemplateRows: 'repeat(2, 1fr) auto repeat(2, 1fr) auto 1fr auto 1fr'
```
- Row 1-2: Problem (Operands)
- Row 3: Separator 1
- Row 4-5: H/T Steps
- Row 6: Separator 1.5 (Tooltip anchor for 5-step Intermediate)
- Row 7: U + Intermediate (Merged Row)
- Row 8: Separator 2 (Tooltip anchor for Total)
- Row 9: Final Total

### Tile Types
| Type | State | Description |
|------|-------|-------------|
| `static` | Completed/Display | Gray border, shows value |
| `input` | Active Input | Blue border, cursor here |
| `ghost` | Placeholder | Light gray, shows "0" for ghost zeros |

### Bar Number Indicator
- Position: Absolute, above the number
- Style: Red badge with "−" symbol
- Background: `#fef2f2` (light red)
- Border: `1px solid #fecaca`

---

## Arrow Guide

### Purpose
Indicates which column is currently active for input.

### Display Rules
| Step | Column | Arrow Direction |
|------|--------|-----------------|
| Step 1 (3D) | Hundreds | Down (↓) |
| Step 2 (3D) / Step 1 (2D) | Tens | Down or Up (↑ if T[-]) |
| Step 3 (3D) / Step 2 (2D) | Units | Down or Up (↑ if U[-]) |

- **Down Arrow (↓)**: Normal subtraction (Top - Bottom)
- **Up Arrow (↑)**: Borrow/Flip (Bottom - Top)

---

## State Management

### `currentStep`
- Type: `1 | 2 | 3 | 4 | 5`
- Increments on correct answer

### `completedSteps`
```typescript
{
  step1: string | null;
  step2: string | null;
  step3: string | null;
  step4: string | null;
  step5: string | null;
}
```

### `totalSteps`
- Type: `3 | 4 | 5`
- `3`: 2-digit problems (Lv1/Lv2)
- `4`: 3-digit problems where T is NOT negative (skip Intermediate)
- `5`: 3-digit problems where T IS negative (full flow)

### `step4_val`
- For 5-step mode: Intermediate value (H*10 + T)
- For 4-step mode: **Total** (final answer)

### `is4Step` (derived in UI)
- Calculated as: `is3Digit && currentProblem?.totalSteps === 4`
- Controls visibility of Intermediate row and tooltip positions

---

## Code Optimization Notes

### Removed Variables
- `difficultyLevel`: Removed from GameLogic (unused)
- `activeStep`: Removed alias, use `currentStep` directly
- `isDirectAnswer`: Removed property (replaced by `totalSteps` 4/5 logic)

### Performance Improvements
- Consolidated `is4Step` calculation (was duplicate)
- Fixed dead code in tooltip left position calculation
- Updated dependency arrays for proper memoization

---
---

# Front Addition Game

## Overview
Front Addition (앞에서 더하기) is a mental math game that teaches addition using the "front-end" method. Players solve problems step-by-step, working from hundreds to units. Unlike subtraction, there are **no bar numbers** since addition always produces positive results.

---

## Game Levels

| Level | Problem Type | Steps | Description |
|-------|--------------|-------|-------------|
| Lv1 | 2자리 + 1자리 | 3 | e.g., 84 + 7 = 91 |
| Lv2 | 2자리 + 2자리 | 3 | e.g., 84 + 27 = 111 |
| Lv3 | 3자리 + 2자리 | 4 | e.g., 980 + 35 = 1015 |
| Lv4 | 3자리 + 3자리 | 4 | e.g., 543 + 278 = 821 |

---

## Core Game Rules

### No Bar Numbers
- Addition always produces positive numbers
- No "flip" or "borrow" mechanism needed
- Each column sum is written directly

### Carry Handling
- If a column sum >= 10, both digits are written
- Example: `8 + 7 = 15` → Write `15` (occupies two columns)

### Step Validation
- Same as subtraction: Green for correct, Red for wrong
- Wrong answer clears after 500ms

---

## 2-Digit Problems (Lv1/Lv2)

### Flow: 3 Steps
```
Step 1: Tens Sum
Step 2: Units Sum  
Step 3: Final Total
```

### Example: `84 + 27 = 111`
```
Calculation:
- T: 8 + 2 = 10
- U: 4 + 7 = 11
- Total: 111

UI Flow:
    [8] [4]
  + [2] [7]
  ─────────
[1] [0]     ← Step 1: INPUT (10, occupies 2 columns)
    [1] [1] ← Step 2: INPUT (11, occupies 2 columns)
  ─────────
[1] [1] [1] ← Step 3: INPUT (111)
```

### Example: `84 + 5 = 89` (2-digit + 1-digit)
```
Calculation:
- T: 8 + 0 = 8
- U: 4 + 5 = 9
- Total: 89

UI Flow:
    [8] [4]
  +     [5]
  ─────────
    [8]     ← Step 1: INPUT (8)
        [9] ← Step 2: INPUT (9)
  ─────────
    [8] [9] ← Step 3: INPUT (89)
```

---

## 3-Digit Problems (Lv3/Lv4)

### Flow: 4 Steps (Always)
```
Step 1: Hundreds Sum
Step 2: Tens Sum
Step 3: Units Sum
Step 4: Final Total
```

> **Note:** Unlike Front Subtraction, there is NO conditional flow. Always 4 steps.

### Example: `543 + 278 = 821`
```
Calculation:
- H: 5 + 2 = 7
- T: 4 + 7 = 11
- U: 3 + 8 = 11
- Total: 821

UI Flow:
    [5] [4] [3]
  + [2] [7] [8]
  ─────────────
    [7]         ← Step 1: INPUT (Hundreds = 7)
[1] [1]         ← Step 2: INPUT (Tens = 11, occupies 2 columns)
    [1] [1]     ← Step 3: INPUT (Units = 11, occupies 2 columns)
  ─────────────
    [8] [2] [1] ← Step 4: INPUT (Total = 821)
```

### Example: `980 + 35 = 1015` (3-digit + 2-digit)
```
Calculation:
- H: 9 + 0 = 9
- T: 8 + 3 = 11
- U: 0 + 5 = 5
- Total: 1015

UI Flow:
    [9] [8] [0]
  +     [3] [5]
  ─────────────
    [9]         ← Step 1: INPUT (Hundreds = 9)
[1] [1]         ← Step 2: INPUT (Tens = 11)
        [5]     ← Step 3: INPUT (Units = 5)
  ─────────────
[1][0] [1] [5] ← Step 4: INPUT (Total = 1015)
```

---

## UI Grid Layout

### Grid Structure
```
4 Columns: [Sign/Empty] [Hundreds] [Tens] [Units]
```

### Row Template (3-Digit, 4-Step)
```css
gridTemplateRows: 'repeat(2, 1fr) auto repeat(3, 1fr) auto 1fr'
```
- Row 1-2: Problem (Operands)
- Row 3: Separator 1
- Row 4: Hundreds Sum
- Row 5: Tens Sum
- Row 6: Units Sum
- Row 7: Separator 2
- Row 8: Final Total

### Row Template (2-Digit, 3-Step)
```css
gridTemplateRows: 'repeat(2, 1fr) auto repeat(2, 1fr) auto 1fr'
```
- Row 1-2: Problem (Operands)
- Row 3: Separator 1
- Row 4: Tens Sum
- Row 5: Units Sum
- Row 6: Separator 2
- Row 7: Final Total

---

## Digit Alignment Rules

| Step Type | 1 Digit | 2 Digits | Columns Used |
|-----------|---------|----------|--------------|
| Hundreds | 7 → `[7]` | 15 → `[1][5]` | H or (Th,H) |
| Tens | 5 → `[5]` | 13 → `[1][3]` | T or (H,T) |
| Units | 3 → `[3]` | 11 → `[1][1]` | U or (T,U) |
| Total | Right-aligned across all columns |

---

## Arrow Guide

### Purpose
Indicates which column is currently active for input.

### Display Rules
| Step | Column | Arrow |
|------|--------|-------|
| Step 1 (3D) | Hundreds | ↓ |
| Step 2 (3D) / Step 1 (2D) | Tens | ↓ |
| Step 3 (3D) / Step 2 (2D) | Units | ↓ |

- **Always Down Arrow (↓)**: Addition is always top + bottom

---

## State Management

### `totalSteps`
- Type: `3 | 4`
- `3`: 2-digit problems (Lv1/Lv2)
- `4`: 3-digit problems (Lv3/Lv4)

### `currentStep`
- Type: `1 | 2 | 3 | 4`
- Increments on correct answer

### `completedSteps`
```typescript
{
  step1: string | null;
  step2: string | null;
  step3: string | null;
  step4: string | null;
}
```

---

## Key Differences from Front Subtraction

| Feature | Front Addition | Front Subtraction |
|---------|----------------|-------------------|
| Bar Numbers | ❌ None | ✅ For negative results |
| Arrow Direction | Always ↓ | ↓ or ↑ (if borrow) |
| Conditional Flow | ❌ Always fixed | ✅ 4 or 5 steps based on T[-] |
| Tooltips | ❌ None | ✅ Shows calculation hint |
| 3-Digit Steps | Always 4 | 4 or 5 |

---

## Key Implementation Files

| File | Purpose |
|------|---------|
| `FrontAddition/GameLogic.tsx` | Problem generation, step validation |
| `FrontAddition/index.tsx` | UI rendering, grid layout, Tile components |
| `FrontAddition/Keypad.tsx` | Numeric input handling |

---

## Code Optimization Notes

### Removed Variables
- `difficultyLevel`: Removed from GameLogic (unused)
- `activeStep`: Removed alias, use `currentStep` directly

### Performance Improvements
- Updated dependency arrays for proper memoization
- Consistent with FrontSubtraction optimization patterns
