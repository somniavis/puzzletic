import { useState, useEffect, useRef } from 'react';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';

type GameEngine = ReturnType<typeof useGameEngine>;

export interface MazeCell {
    row: number;
    col: number;
    isStart?: boolean;
    isEnd?: boolean;
    isObstacle?: boolean;
    obstacleType?: 'rock' | 'cactus';
    isPath?: boolean; // Part of the player's drawn path
    // Directional flags for path rendering
    n?: boolean;
    s?: boolean;
    e?: boolean;
    w?: boolean;
}

interface LevelDef {
    size: number;
    start: { r: number, c: number };
    end: { r: number, c: number };
    obstacles: { r: number, c: number, type: 'rock' | 'cactus' }[];
}

const OBSTACLE_TYPES = ['rock', 'cactus'] as const;

// Helper to shuffle array logic
// Helper to shuffle array logic
function shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Procedural Level Generator
// Strategy: "Carve the Maze"
// 1. Consider all grid cells as obstacles initially.
// 2. Carve a Solution Path.
// 3. Carve Decoy Paths from the solution path.
// Procedural Level Generator
// Strategy: "Carve the Maze" with Distant Start/End
const generateLevel = (size: number, difficulty: number): LevelDef => {
    // 0. Setup
    const isEmpty: boolean[][] = Array(size).fill(false).map(() => Array(size).fill(false));

    // 1. Pick Start and End in Opposite Quadrants
    // Quadrants: 0 (TL), 1 (TR), 2 (BL), 3 (BR)
    const quadrants = [
        { rMin: 0, rMax: Math.floor(size / 2) - 1, cMin: 0, cMax: Math.floor(size / 2) - 1 }, // TL
        { rMin: 0, rMax: Math.floor(size / 2) - 1, cMin: Math.ceil(size / 2), cMax: size - 1 }, // TR
        { rMin: Math.ceil(size / 2), rMax: size - 1, cMin: 0, cMax: Math.floor(size / 2) - 1 }, // BL
        { rMin: Math.ceil(size / 2), rMax: size - 1, cMin: Math.ceil(size / 2), cMax: size - 1 } // BR
    ];

    // Pick random start quadrant
    const startQIdx = Math.floor(Math.random() * 4);
    // Pick opposite end quadrant (0<->3, 1<->2)
    const endQIdx = 3 - startQIdx;

    const getRandomInQuadrant = (q: typeof quadrants[0]) => ({
        r: Math.floor(Math.random() * (q.rMax - q.rMin + 1)) + q.rMin,
        c: Math.floor(Math.random() * (q.cMax - q.cMin + 1)) + q.cMin
    });

    const start = getRandomInQuadrant(quadrants[startQIdx]);
    const end = getRandomInQuadrant(quadrants[endQIdx]);

    // 2. Carve Solution Path (Random DFS)
    const visitedForSolution: boolean[][] = Array(size).fill(false).map(() => Array(size).fill(false));
    const solutionPath: { r: number, c: number }[] = [];

    const carveSolution = (curr: { r: number, c: number }): boolean => {
        visitedForSolution[curr.r][curr.c] = true;
        solutionPath.push(curr);

        if (curr.r === end.r && curr.c === end.c) return true;

        const moves = shuffle([[-1, 0], [1, 0], [0, -1], [0, 1]]);

        for (const [dr, dc] of moves) {
            const nextR = curr.r + dr;
            const nextC = curr.c + dc;
            if (nextR >= 0 && nextR < size && nextC >= 0 && nextC < size && !visitedForSolution[nextR][nextC]) {
                if (carveSolution({ r: nextR, c: nextC })) return true;
            }
        }

        solutionPath.pop();
        return false;
    };

    carveSolution(start);
    solutionPath.forEach(p => isEmpty[p.r][p.c] = true);

    // 3. Carve Decoy Paths (Dead Ends)
    // Increase density of "empty" paths to create more confusion (more potential wrong turns)
    const totalCells = size * size;
    // Difficulty 0 -> 45% empty (more walls, simpler paths)
    // Difficulty 10 -> 65% empty (more open, more wrong turns)
    const targetEmpty = Math.floor(totalCells * (0.45 + (difficulty / 10) * 0.2));
    let currentEmptyCount = solutionPath.length;

    let growthPoints = [...solutionPath];
    let loopCount = 0;
    const maxLoops = totalCells * 10;

    while (currentEmptyCount < targetEmpty && growthPoints.length > 0 && loopCount < maxLoops) {
        loopCount++;
        const idx = Math.floor(Math.random() * growthPoints.length);
        const { r, c } = growthPoints[idx];

        const moves = shuffle([[-1, 0], [1, 0], [0, -1], [0, 1]]);
        let grew = false;

        for (const [dr, dc] of moves) {
            const nextR = r + dr;
            const nextC = c + dc;

            if (nextR >= 0 && nextR < size && nextC >= 0 && nextC < size) {
                if (!isEmpty[nextR][nextC]) {
                    let emptyNeighbors = 0;
                    [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([nr, nc]) => {
                        const nRR = nextR + nr;
                        const nCC = nextC + nc;
                        if (nRR >= 0 && nRR < size && nCC >= 0 && nCC < size && isEmpty[nRR][nCC]) {
                            emptyNeighbors++;
                        }
                    });

                    if (emptyNeighbors <= 1) {
                        isEmpty[nextR][nextC] = true;
                        growthPoints.push({ r: nextR, c: nextC });
                        currentEmptyCount++;
                        grew = true;
                        break;
                    }
                }
            }
        }

        if (!grew) {
            growthPoints[idx] = growthPoints[growthPoints.length - 1];
            growthPoints.pop();
        }
    }

    // 4. Generate Obstacles List
    const obstacles: { r: number, c: number, type: 'rock' | 'cactus' }[] = [];

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (!isEmpty[r][c]) {
                const type = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
                obstacles.push({ r, c, type });
            }
        }
    }

    return { size, start, end, obstacles };
};

export const useMazeEscapeLogic = (engine: GameEngine) => {
    const { activatePowerUp, powerUps, isTimeFrozen, isDoubleScore } = engine;

    // State
    const [levelIndex, setLevelIndex] = useState(0);
    const [grid, setGrid] = useState<MazeCell[][]>([]);
    const [currentLevel, setCurrentLevel] = useState<LevelDef>({ size: 4, start: { r: 0, c: 0 }, end: { r: 3, c: 3 }, obstacles: [] });

    // Drag State
    const [isDragging, setIsDragging] = useState(false);
    const [pathCells, setPathCells] = useState<{ r: number, c: number }[]>([]);

    // Auto-Reset on New Game
    const prevGameState = useRef(engine.gameState);
    useEffect(() => {
        if ((prevGameState.current === 'idle' || prevGameState.current === 'gameover') && engine.gameState === 'playing') {
            setLevelIndex(0);
        }
        prevGameState.current = engine.gameState;
    }, [engine.gameState]);

    // Init Level
    useEffect(() => {
        // Size Progression: Faster ramp up (every 2 levels)
        // L0-1: 4x4, L2-3: 5x5, L4-5: 6x6 ... L10+: 9x9
        const size = Math.min(9, Math.floor(4 + levelIndex / 2));
        const difficulty = Math.min(10, levelIndex);

        const newLevel = generateLevel(size, difficulty);
        setCurrentLevel(newLevel);

        // Build Grid UI
        const newGrid: MazeCell[][] = [];
        for (let r = 0; r < size; r++) {
            const row: MazeCell[] = [];
            for (let c = 0; c < size; c++) {
                row.push({ row: r, col: c });
            }
            newGrid.push(row);
        }

        // Apply Level Data
        newGrid[newLevel.start.r][newLevel.start.c].isStart = true;
        newGrid[newLevel.end.r][newLevel.end.c].isEnd = true;
        newLevel.obstacles.forEach(o => {
            newGrid[o.r][o.c].isObstacle = true;
            newGrid[o.r][o.c].obstacleType = o.type;
        });

        setGrid(newGrid);
        setIsDragging(false);
        setPathCells([]);
    }, [levelIndex]);

    // Interaction Handlers
    const handleStart = (r: number, c: number) => {
        const cell = grid[r][c];

        // Drag Start
        if (cell.isStart) {
            setIsDragging(true);
            setPathCells([{ r, c }]);

            setGrid(prev => {
                const next = prev.map(row => row.map(cell => ({
                    ...cell,
                    isPath: false, n: false, s: false, e: false, w: false
                })));
                next[r][c].isPath = true;
                return next;
            });
        }
    };

    const handleMove = (r: number, c: number) => {
        if (!isDragging || pathCells.length === 0) return;

        const last = pathCells[pathCells.length - 1];
        if (last.r === r && last.c === c) return; // No move

        // Check Adjacency
        const dr = Math.abs(r - last.r);
        const dc = Math.abs(c - last.c);
        if (dr + dc !== 1) return; // Only orthogonal

        const targetCell = grid[r][c];

        // 1. Cannot hit obstacle
        if (targetCell.isObstacle) return;

        // 2. Backtracking Logic
        if (pathCells.length > 1) {
            const prev = pathCells[pathCells.length - 2];
            if (prev.r === r && prev.c === c) {
                const removed = pathCells.pop();
                setPathCells([...pathCells]);

                setGrid(prevGrid => {
                    const next = prevGrid.map(row => [...row]);
                    if (removed) {
                        const cell = next[removed.r][removed.c];
                        cell.isPath = false;
                        cell.n = cell.s = cell.e = cell.w = false;

                        // Clear directional flag of the NEW last cell
                        const currentTip = next[r][c];
                        if (removed.r < r) currentTip.n = false;
                        if (removed.r > r) currentTip.s = false;
                        if (removed.c < c) currentTip.w = false;
                        if (removed.c > c) currentTip.e = false;
                    }
                    return next;
                });
                return;
            }
        }

        // 3. Cannot cross own path
        if (targetCell.isPath) return;

        // Valid Move Forward
        setPathCells(prev => [...prev, { r, c }]);

        setGrid(prev => {
            const next = prev.map(row => [...row]);
            const prevCell = next[last.r][last.c];
            const currCell = next[r][c];

            if (r < last.r) prevCell.n = true;
            if (r > last.r) prevCell.s = true;
            if (c < last.c) prevCell.w = true;
            if (c > last.c) prevCell.e = true;

            if (r < last.r) currCell.s = true;
            if (r > last.r) currCell.n = true;
            if (c < last.c) currCell.e = true;
            if (c > last.c) currCell.w = true;

            currCell.isPath = true;
            return next;
        });

        if (targetCell.isEnd) {
            handleEndRaw(r, c);
        }
    };

    const handleEnd = () => {
        if (isDragging) {
            setIsDragging(false);
            setGrid(prev => prev.map(row => row.map(cell => ({
                ...cell,
                isPath: false,
                n: false, s: false, e: false, w: false
            }))));
            setPathCells([]);
        }
    };

    const handleEndRaw = (r: number, c: number) => {
        setIsDragging(false);
        if (grid[r][c].isEnd) {
            // Success
            engine.submitAnswer(true, { scoreMultiplier: 0.2 });
            engine.registerEvent({ type: 'correct', isFinal: true });

            const nextCombo = engine.combo + 1;
            if (nextCombo > 0 && nextCombo % 3 === 0) {
                if (Math.random() < 0.55) {
                    const rewards: ('timeFreeze' | 'extraLife' | 'doubleScore')[] = ['timeFreeze', 'extraLife', 'doubleScore'];
                    const reward = rewards[Math.floor(Math.random() * rewards.length)];
                    engine.setPowerUps(prev => ({ ...prev, [reward]: prev[reward] + 1 }));
                }
            }

            setTimeout(() => {
                setLevelIndex(prev => prev + 1);
            }, 1000);
        } else {
            setGrid(prev => prev.map(row => row.map(cell => ({
                ...cell,
                isPath: false, n: false, s: false, e: false, w: false
            }))));
            setPathCells([]);
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
