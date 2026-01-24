# Token Efficiency & Structural Development Guide

## Goal
Minimize token consumption while maintaining high precision in development.

## Core Strategy: "Context-Aware Modular Loading"

### 1. The Map First Rule
**Before** exploring the file system with `list_dir` or reading large files:
*   ALWAYS Read `docs/ARCHITECTURE_MAP.md`.
*   This file contains the "Mental Model" of the system. It replaces the need to scan directories to understand "where things are".

### 2. Context Boundaries
Do not load files outside the immediate scope.
*   **Working on UI?** Read `PetRoom.tsx` + `PetRoom.css`. Do NOT read `gameTickService.ts` unless logic changes are needed.
*   **Working on Logic?** Read `useEvolutionLogic.ts` + `evolutionService.ts`. Do NOT read `App.tsx` or `index.css`.

### 3. Interface-First Debugging
When debugging:
1.  Read the **Interface Definition** first (e.g., `NurturingContextType` in `NurturingContext.tsx`).
2.  If the interface looks correct, check the **Implementation** (the Hook).
3.  Only then check the **Consumer** (the Component).
*   *Why?* Interfaces are small. Components are huge. finding a type mismatch in a small interface saves reading a 2000-line component.

### 4. Summary Artifacts
Maintain `docs/` artifacts up to date.
*   If you create a new module, add it to `ARCHITECTURE_MAP.md`.
*   This ensures the *next* agent turn doesn't need to rediscover it expensive tools.

## Checklist for Every Task
- [ ] Checked `ARCHITECTURE_MAP.md`?
- [ ] Identified the *minimum* set of files needed?
- [ ] Used `grep_search` instead of `view_file` for specific code hunting?
- [ ] Updated the Map if structure changed?
