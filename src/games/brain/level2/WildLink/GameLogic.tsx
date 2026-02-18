import { useState, useEffect, useRef } from 'react';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';

type GameEngineInterface = ReturnType<typeof useGameEngine>;

// --- Data Definitions ---
export const SPECIES_DATA = {
    mammal: {
        id: 'mammal',
        icons: ['🐒', '🦍', '🦧', '🐕', '🐩', '🦝', '🐈', '🐈‍⬛', '🐅', '🐆', '🫏', '🐎', '🦓', '🦌', '🦬', '🐂', '🐃', '🐄', '🐖', '🐏', '🐑', '🐐', '🐪', '🐫', '🦙', '🦒', '🐘', '🦣', '🦏', '🦛', '🐁', '🐀', '🐇', '🐿️', '🦫', '🦔', '🦇', '🦥', '🦦', '🦨', '🦘', '🦡']
    },
    bird: {
        id: 'bird',
        icons: ['🦃', '🐓', '🐥', '🕊️', '🦅', '🦆', '🦢', '🦉', '🦤', '🦩', '🦚', '🦜', '🐦‍⬛', '🪿']
    },
    reptile: {
        id: 'reptile',
        icons: ['🐊', '🐢', '🦎', '🐍']
    },
    marine: {
        id: 'marine',
        icons: ['🐟', '🐠', '🐡', '🦈', '🐙', '🦀', '🦞', '🦐', '🦑']
    },
    bug: {
        id: 'bug',
        icons: ['🐌', '🦋', '🐜', '🐝', '🪲', '🐞', '🦗', '🦂']
    },
    flower: {
        id: 'flower',
        icons: ['💐', '🪷', '🌹', '🌺', '🌻', '🌷', '🪻', '🌲', '🌳', '🌴', '🌵', '🌾', '🍀', '🍄']
    }
};

type CategoryId = keyof typeof SPECIES_DATA;

interface Cell {
    row: number;
    col: number;
    dot?: string; // The Emoji to display
    category?: CategoryId; // The logical category (mammal, bird, etc.)
    path?: CategoryId; // If part of a path, which category?
    n?: boolean;
    s?: boolean;
    e?: boolean;
    w?: boolean;
}

interface LevelDef {
    size: number;
    dots: { r: number, c: number, category: CategoryId, dot: string }[];
}


// Helper: Select distinct random items from array
const getRandomItems = <T,>(arr: T[], count: number): T[] => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};


// Procedural Level Generator (Ported from ColorLink)
// Generates a grid filled with non-overlapping paths.
// Returns the endpoints (Dots) of those paths.
const generateLevel = (size: number, targetPairCount: number): LevelDef => {
    const CATEGORIES = Object.keys(SPECIES_DATA) as CategoryId[];
    const selectedCategories = getRandomItems(CATEGORIES, targetPairCount); // Pre-select needed categories

    // Initialize grid tracking
    const gridUsed: boolean[][] = Array(size).fill(false).map(() => Array(size).fill(false));
    const dots: { r: number, c: number, category: CategoryId, dot: string }[] = [];
    let catIdx = 0;

    // Heuristic: Limit max length to ensure space for all colors
    const totalCells = size * size;
    const buffer = size >= 5 ? 2 : 1;
    const maxPathLength = Math.floor(totalCells / targetPairCount) + buffer;

    // Helper: Get random unvisited neighbor
    const getNeighbors = (r: number, c: number) => {
        const moves = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        return moves
            .map(([dr, dc]) => ({ r: r + dr, c: c + dc }))
            .filter(n => n.r >= 0 && n.r < size && n.c >= 0 && n.c < size && !gridUsed[n.r][n.c]);
    };

    // Helper: Get ALL empty cells
    const getEmptyCells = () => {
        const empty: { r: number, c: number }[] = [];
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (!gridUsed[r][c]) empty.push({ r, c });
            }
        }
        return empty;
    };

    // Attempt to fill grid with paths
    // Increase attempts to ensure we find fits
    for (let attempts = 0; attempts < size * size * 20; attempts++) {
        if (catIdx >= targetPairCount) break;

        // Find a RANDOM empty cell to start
        const emptyCells = getEmptyCells();
        if (emptyCells.length === 0) break; // Grid full

        const start = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        let currR = start.r;
        let currC = start.c;

        const path: { r: number, c: number }[] = [{ r: currR, c: currC }];
        gridUsed[currR][currC] = true;

        // Random Walk
        while (true) {
            if (path.length >= maxPathLength) break;

            const neighbors = getNeighbors(currR, currC);
            if (neighbors.length === 0) break; // Stuck

            // Randomly pick next step
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];

            gridUsed[next.r][next.c] = true;
            path.push(next);
            currR = next.r;
            currC = next.c;
        }

        // Validate Path Length
        const minLength = size <= 3 ? 2 : 3;

        if (path.length >= minLength) {
            // Valid Path -> Save Endpoints
            const startPos = path[0];
            const endPos = path[path.length - 1];

            const currentCat = selectedCategories[catIdx];
            const icons = getRandomItems(SPECIES_DATA[currentCat].icons, 2);

            dots.push({ r: startPos.r, c: startPos.c, category: currentCat, dot: icons[0] });
            dots.push({ r: endPos.r, c: endPos.c, category: currentCat, dot: icons[1] });
            catIdx++;
        } else {
            // Path too short -> Discard and reset grid cells
            path.forEach(p => gridUsed[p.r][p.c] = false);
        }
    }

    return { size, dots };
};


export const useColorLinkLogic = (engine: GameEngineInterface) => {
    const { activatePowerUp, powerUps, isTimeFrozen, isDoubleScore } = engine;

    // State
    const [levelIndex, setLevelIndex] = useState(0);
    const [grid, setGrid] = useState<Cell[][]>([]);
    const [currentLevel, setCurrentLevel] = useState<LevelDef>({ size: 3, dots: [] });

    // Auto-Reset on New Game
    const prevGameState = useRef(engine.gameState);
    useEffect(() => {
        // Only reset if starting a FRESH game (from idle or gameover)
        if ((prevGameState.current === 'idle' || prevGameState.current === 'gameover') && engine.gameState === 'playing') {
            setLevelIndex(0);
        }
        prevGameState.current = engine.gameState;
    }, [engine.gameState]);

    // Interaction State
    const [activeCategory, setActiveCategory] = useState<CategoryId | null>(null);
    const [lastPos, setLastPos] = useState<{ r: number, c: number } | null>(null);
    const [startPos, setStartPos] = useState<{ r: number, c: number } | null>(null);

    // Init Level (Procedural)
    useEffect(() => {
        // Progression Logic:
        // 0-1: 3x3 (2 pairs)
        // 2-5: 4x4 (3 or 4 pairs)
        // 6+: 5x5 (4, 5, or 6 pairs)
        let size = 3;
        let targetPairs = 2;

        if (levelIndex >= 2) {
            size = 4;
            targetPairs = Math.random() < 0.5 ? 3 : 4;
        }
        if (levelIndex >= 6) {
            size = 5;
            const rand = Math.random();
            if (rand < 0.33) targetPairs = 4;
            else if (rand < 0.66) targetPairs = 5;
            else targetPairs = 6;
        }

        // Generate Solvable Level
        // Retry loop to ensure we get EXACTLY the target pairs
        let newLevel = generateLevel(size, targetPairs);
        let safety = 0;

        while (newLevel.dots.length < targetPairs * 2 && safety < 1000) {
            newLevel = generateLevel(size, targetPairs);
            safety++;
        }

        setCurrentLevel(newLevel);

        // Create Empty Grid UI
        const newGrid: Cell[][] = [];
        for (let r = 0; r < size; r++) {
            const row: Cell[] = [];
            for (let c = 0; c < size; c++) {
                row.push({ row: r, col: c });
            }
            newGrid.push(row);
        }

        // Place Dots
        newLevel.dots.forEach(({ r, c, category, dot }) => {
            if (newGrid[r] && newGrid[r][c]) {
                newGrid[r][c].category = category;
                newGrid[r][c].dot = dot;
            }
        });

        setGrid(newGrid);
        setActiveCategory(null);
        setLastPos(null);
        setStartPos(null);

    }, [levelIndex]);

    const handleStart = (r: number, c: number) => {
        const cell = grid[r][c];
        // Can start from a Dot (category) OR an existing Path
        const categoryToUse = cell.category || cell.path;

        if (categoryToUse) {
            setActiveCategory(categoryToUse);
            setLastPos({ r, c });
            setStartPos({ r, c });

            // If starting on a dot, clear previous path of this category
            if (cell.category) { // Start is a Dot
                setGrid(prev => {
                    const next = [...prev.map(row => [...row])];
                    // Clear all pipe paths of this category (except dots which are fixed props)
                    // Note: cell.category is fixed, cell.path is dynamic
                    for (let i = 0; i < currentLevel.size; i++) {
                        for (let j = 0; j < currentLevel.size; j++) {
                            if (next[i][j].path === categoryToUse) {
                                next[i][j].path = undefined;
                                next[i][j].n = next[i][j].s = next[i][j].e = next[i][j].w = undefined;
                            }
                        }
                    }
                    // Set current start path 'seed' if needed? 
                    // Actually handleMove draws path. Starting on dot just clears old path.
                    // But we should visually mark this cell as 'active path source'.
                    next[r][c].path = categoryToUse;
                    return next;
                });
            }
        }
    };

    const handleMove = (r: number, c: number) => {
        if (!activeCategory || !lastPos) return;
        if (r === lastPos.r && c === lastPos.c) return; // No move

        // Check adjacency (cardinal only)
        const dr = Math.abs(r - lastPos.r);
        const dc = Math.abs(c - lastPos.c);
        if (dr + dc !== 1) return; // Only orthogonal moves allowed

        const targetCell = grid[r][c];

        // Collision Logic

        // 1. Hitting a Cell with a Category (Dot)
        if (targetCell.category) {
            // Must match Category
            if (targetCell.category !== activeCategory) {
                // PENALTY: Wrong Category Match
                engine.submitAnswer(false);
                engine.registerEvent({ type: 'wrong' });

                // Clear current partial path
                setGrid(prev => prev.map(row => row.map(curr => {
                    if (curr.path === activeCategory) {
                        return { ...curr, path: undefined, n: undefined, s: undefined, e: undefined, w: undefined };
                    }
                    return curr;
                })));

                setActiveCategory(null);
                setLastPos(null);
                return;
            }
            // Else: Correct Match! Connect and allow path (will be handled by update below)
        }

        // 2. Crossing existing path of DIFFERENT category
        if (targetCell.path && targetCell.path !== activeCategory) return; // Blocked

        // Valid Move: Update Grid
        setGrid(prev => {
            const next = [...prev.map(row => [...row])];
            const prevCell = next[lastPos!.r][lastPos!.c];
            const currCell = next[r][c];

            // Update Direction flags for previous cell
            if (r < lastPos!.r) prevCell.n = true; // Moved Up
            if (r > lastPos!.r) prevCell.s = true; // Moved Down
            if (c < lastPos!.c) prevCell.w = true; // Moved Left
            if (c > lastPos!.c) prevCell.e = true; // Moved Right

            // Update Direction flags for current cell
            if (r < lastPos!.r) currCell.s = true; // Came from Down
            if (r > lastPos!.r) currCell.n = true; // Came from Up
            if (c < lastPos!.c) currCell.e = true; // Came from Right
            if (c > lastPos!.c) currCell.w = true; // Came from Left

            currCell.path = activeCategory;
            return next;
        });

        setLastPos({ r, c });
    };

    const handleEnd = () => {
        if (activeCategory && lastPos && startPos) {
            // Keep path only when this drag connects the two endpoints of the same category.
            const sameCategoryDots = currentLevel.dots.filter(d => d.category === activeCategory);
            const hasTwoEndpoints = sameCategoryDots.length === 2;
            const [dotA, dotB] = sameCategoryDots;

            const startedAtEndpointA = !!dotA && startPos.r === dotA.r && startPos.c === dotA.c;
            const startedAtEndpointB = !!dotB && startPos.r === dotB.r && startPos.c === dotB.c;
            const endedAtEndpointA = !!dotA && lastPos.r === dotA.r && lastPos.c === dotA.c;
            const endedAtEndpointB = !!dotB && lastPos.r === dotB.r && lastPos.c === dotB.c;

            const isValidEndpointConnection = hasTwoEndpoints && (
                (startedAtEndpointA && endedAtEndpointB) ||
                (startedAtEndpointB && endedAtEndpointA)
            );

            if (!isValidEndpointConnection) {
                setGrid(prev => prev.map(row => row.map(cell => {
                    if (cell.path === activeCategory) {
                        return { ...cell, path: undefined, n: undefined, s: undefined, e: undefined, w: undefined };
                    }
                    return cell;
                })));
            } else {
                checkWin();
            }
        }

        setActiveCategory(null);
        setLastPos(null);
        setStartPos(null);
    };

    const checkWin = () => {
        const size = currentLevel.size;

        // Connectivity Check: Ensure each category pair is connected
        const catGroups: Record<CategoryId, { r: number, c: number }[]> = {} as any;
        currentLevel.dots.forEach(d => {
            if (!catGroups[d.category]) catGroups[d.category] = [];
            catGroups[d.category].push(d);
        });

        const allConnected = Object.entries(catGroups).every(([cat, dots]) => {
            if (dots.length !== 2) return false;
            const [start, end] = dots;
            const category = cat as CategoryId;

            const startCell = grid[start.r][start.c];
            if (!startCell.path || startCell.path !== category) return false;

            // Traverse
            let currR = start.r;
            let currC = start.c;
            let visited = new Set<string>();
            let reachedEnd = false;

            for (let i = 0; i < size * size; i++) {
                const key = `${currR},${currC}`;
                if (visited.has(key)) break;
                visited.add(key);

                if (currR === end.r && currC === end.c) {
                    reachedEnd = true;
                    break;
                }

                const cell = grid[currR][currC];

                // Follow pipe directions (path must match category)
                if (cell.n && grid[currR - 1]?.[currC].path === category && !visited.has(`${currR - 1},${currC}`)) { currR--; continue; }
                if (cell.s && grid[currR + 1]?.[currC].path === category && !visited.has(`${currR + 1},${currC}`)) { currR++; continue; }
                if (cell.e && grid[currR]?.[currC + 1].path === category && !visited.has(`${currR},${currC + 1}`)) { currC++; continue; }
                if (cell.w && grid[currR]?.[currC - 1].path === category && !visited.has(`${currR},${currC - 1}`)) { currC--; continue; }

                break;
            }
            return reachedEnd;
        });

        if (allConnected) {
            engine.submitAnswer(true);
            engine.registerEvent({ type: 'correct', isFinal: true });

            // Combo Logic
            const nextCombo = engine.combo + 1;
            if (nextCombo > 0 && nextCombo % 3 === 0) {
                if (Math.random() < 0.55) {
                    const types = ['timeFreeze', 'extraLife', 'doubleScore'] as const;
                    const reward = types[Math.floor(Math.random() * types.length)];
                    engine.setPowerUps(prev => ({ ...prev, [reward]: prev[reward] + 1 }));
                }
            }

            setTimeout(() => {
                setLevelIndex(prev => prev + 1);
            }, 1000);
        }
    };

    return {
        grid,
        currentLevel,
        handleStart,
        handleMove,
        handleEnd,
        powerUps,
        activatePowerUp,
        isTimeFrozen,
        isDoubleScore
    };
};
