import { useState, useEffect, useRef } from 'react';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';

type GameEngine = ReturnType<typeof useGameEngine>;

export type Color = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';

export interface CellData {
    row: number;
    col: number;
    dot?: Color;      // Fixed dot color
    path?: Color;     // Current pipe path color
    // Directional flags for pipe rendering
    n?: boolean;
    s?: boolean;
    e?: boolean;
    w?: boolean;
}

interface LevelDef {
    size: number;
    dots: { r: number, c: number, color: Color }[];
}

// Procedural Level Generator
// Generates a grid filled with non-overlapping paths.
// Returns the endpoints (Dots) of those paths.
const generateLevel = (size: number, targetPairCount: number): LevelDef => {
    const COLORS: Color[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
    // Initialize grid tracking
    const gridUsed: boolean[][] = Array(size).fill(false).map(() => Array(size).fill(false));
    const dots: { r: number, c: number, color: Color }[] = [];
    let colorIdx = 0;

    // Heuristic: Limit max length to ensure space for all colors
    // Tighter constraint for smaller grids to allow high density packing
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
        if (colorIdx >= targetPairCount) break;

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
            const startDot = path[0];
            const endDot = path[path.length - 1];
            dots.push({ r: startDot.r, c: startDot.c, color: COLORS[colorIdx] });
            dots.push({ r: endDot.r, c: endDot.c, color: COLORS[colorIdx] });
            colorIdx++;
        } else {
            // Path too short -> Discard and reset grid cells
            path.forEach(p => gridUsed[p.r][p.c] = false);
        }
    }

    return { size, dots };
};

export const useColorLinkLogic = (engine: GameEngine) => {
    const { activatePowerUp, powerUps, isTimeFrozen, isDoubleScore } = engine;

    // State
    const [levelIndex, setLevelIndex] = useState(0);
    const [grid, setGrid] = useState<CellData[][]>([]);
    // Default initial level
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

    // Drag State
    const [activeColor, setActiveColor] = useState<Color | null>(null);
    const [lastPos, setLastPos] = useState<{ r: number, c: number } | null>(null);

    // Init Level (Procedural)
    useEffect(() => {
        // Progression Logic:
        // 0-1: 3x3 (2 colors)
        // 2-5: 4x4 (3 or 4 colors)
        // 6+: 5x5 (4, 5, or 6 colors)
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

        // Critical: Retry until we actually hit the count. 
        while (newLevel.dots.length < targetPairs * 2 && safety < 1000) {
            newLevel = generateLevel(size, targetPairs);
            safety++;
        }

        setCurrentLevel(newLevel);

        // Create Empty Grid UI
        const newGrid: CellData[][] = [];
        for (let r = 0; r < size; r++) {
            const row: CellData[] = [];
            for (let c = 0; c < size; c++) {
                row.push({ row: r, col: c });
            }
            newGrid.push(row);
        }

        // Place Dots
        newLevel.dots.forEach(({ r, c, color }) => {
            if (newGrid[r] && newGrid[r][c]) {
                newGrid[r][c].dot = color;
            }
        });

        setGrid(newGrid);
        setActiveColor(null);
        setLastPos(null);
    }, [levelIndex]);

    // Interaction Handlers
    const handleStart = (r: number, c: number) => {
        const cell = grid[r][c];
        let colorToUse = cell.dot || cell.path;

        if (colorToUse) {
            setActiveColor(colorToUse);
            setLastPos({ r, c });

            // If starting on a dot, clear previous path of this color
            if (cell.dot) {
                setGrid(prev => {
                    const next = [...prev.map(row => [...row])];
                    // Clear all pipe paths of this color (except dots)
                    for (let i = 0; i < currentLevel.size; i++) {
                        for (let j = 0; j < currentLevel.size; j++) {
                            if (next[i][j].path === colorToUse) {
                                // Reset pipe flags
                                next[i][j].path = undefined;
                                next[i][j].n = next[i][j].s = next[i][j].e = next[i][j].w = undefined;
                            }
                        }
                    }
                    // Set current start
                    next[r][c].path = colorToUse;
                    return next;
                });
            }
        }
    };

    const handleMove = (r: number, c: number) => {
        if (!activeColor || !lastPos) return;
        if (r === lastPos.r && c === lastPos.c) return; // No move

        // Check adjacency (cardinal only)
        const dr = Math.abs(r - lastPos.r);
        const dc = Math.abs(c - lastPos.c);
        if (dr + dc !== 1) return; // Only orthogonal moves allowed

        const targetCell = grid[r][c];

        // Collision Logic
        // 1. Cannot cross fixed dots of DIFFERENT color -> PENALTY
        if (targetCell.dot && targetCell.dot !== activeColor) {
            // Trigger Wrong Answer (Deduct Life)
            engine.submitAnswer(false);
            // TRIGGER VISUAL FEEDBACK
            engine.registerEvent({ type: 'wrong' });

            // Clear the incomplete path (Penalty effect aka 'Shock')
            setGrid(prev => prev.map(row => row.map(cell => {
                if (cell.path === activeColor) {
                    return { ...cell, path: undefined, n: undefined, s: undefined, e: undefined, w: undefined };
                }
                return cell;
            })));

            // Cancel Drag
            setActiveColor(null);
            setLastPos(null);
            return;
        }

        // 2. Cannot cross existing paths of DIFFERENT color
        if (targetCell.path && targetCell.path !== activeColor) return;

        // Valid Move: Update Grid
        setGrid(prev => {
            const next = [...prev.map(row => [...row])];
            const prevCell = next[lastPos.r as number][lastPos!.c as number];
            const currCell = next[r][c];

            // Update Direction flags for previous cell
            if (r < (lastPos?.r ?? -1)) prevCell.n = true; // Moved Up
            if (r > (lastPos?.r ?? -1)) prevCell.s = true; // Moved Down
            if (c < (lastPos?.c ?? -1)) prevCell.w = true; // Moved Left
            if (c > (lastPos?.c ?? -1)) prevCell.e = true; // Moved Right

            // Update Direction flags for current cell (from previous)
            if (r < (lastPos?.r ?? -1)) currCell.s = true; // Came from Down
            if (r > (lastPos?.r ?? -1)) currCell.n = true; // Came from Up
            if (c < (lastPos?.c ?? -1)) currCell.e = true; // Came from Right
            if (c > (lastPos?.c ?? -1)) currCell.w = true; // Came from Left

            currCell.path = activeColor;
            return next;
        });

        setLastPos({ r, c });
    };

    const handleEnd = () => {
        if (activeColor && lastPos) {
            // Check if we landed on a dot of the same color
            const landedOnDot = currentLevel.dots.some(d =>
                d.color === activeColor && d.r === lastPos.r && d.c === lastPos.c
            );

            if (!landedOnDot) {
                // Incomplete path -> Erase
                setGrid(prev => prev.map(row => row.map(cell => {
                    if (cell.path === activeColor) {
                        return { ...cell, path: undefined, n: undefined, s: undefined, e: undefined, w: undefined };
                    }
                    return cell;
                })));
            } else {
                // Stopped on a dot -> Valid path state -> Check if this completes the level
                checkWin();
            }
        }

        setActiveColor(null);
        setLastPos(null);
    };

    const checkWin = () => {
        const size = currentLevel.size;

        // Connectivity Check: Ensure each color pair is actually connected
        // Group dots by color
        const colorGroups: Record<Color, { r: number, c: number }[]> = {} as any;
        currentLevel.dots.forEach(d => {
            if (!colorGroups[d.color]) colorGroups[d.color] = [];
            colorGroups[d.color].push(d);
        });

        const allConnected = Object.entries(colorGroups).every(([color, dots]) => {
            if (dots.length !== 2) return false; // Should always be pairs
            const [start, end] = dots;

            // Access grid cells
            const startCell = grid[start.r][start.c];
            if (!startCell.path || startCell.path !== color) return false; // Start not touched

            // Traverse Logic
            let currR = start.r;
            let currC = start.c;
            let visited = new Set<string>();
            let reachedEnd = false;

            // Loop to follow path
            // Max iterations to prevent infinite loops (size*size)
            for (let i = 0; i < size * size; i++) {
                const key = `${currR},${currC}`;
                if (visited.has(key)) break; // Loop detected
                visited.add(key);

                if (currR === end.r && currC === end.c) {
                    reachedEnd = true;
                    break;
                }

                const cell = grid[currR][currC];
                // Check neighbors based on pipe directions

                // Check North
                if (cell.n && !visited.has(`${currR - 1},${currC}`)) {
                    currR--; continue;
                }
                // Check South
                if (cell.s && !visited.has(`${currR + 1},${currC}`)) {
                    currR++; continue;
                }
                // Check East
                if (cell.e && !visited.has(`${currR},${currC + 1}`)) {
                    currC++; continue;
                }
                // Check West
                if (cell.w && !visited.has(`${currR},${currC - 1}`)) {
                    currC--; continue;
                }

                break;
            }

            return reachedEnd;
        });

        if (allConnected) {
            engine.submitAnswer(true);
            engine.registerEvent({ type: 'correct', isFinal: true });

            // Combo Logic for PowerUps
            const nextCombo = engine.combo + 1;
            if (nextCombo > 0 && nextCombo % 3 === 0) {
                // 55% Chance
                if (Math.random() < 0.55) {
                    const types = ['timeFreeze', 'extraLife', 'doubleScore'] as const;
                    const reward = types[Math.floor(Math.random() * types.length)];
                    engine.setPowerUps(prev => ({ ...prev, [reward]: prev[reward] + 1 }));
                }
            }

            // Wait a moment then load next level
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

        // PowerUp State (Pass-Through)
        powerUps,
        activatePowerUp,
        isTimeFrozen,
        isDoubleScore
    };
};
