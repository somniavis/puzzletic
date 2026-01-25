import { useState, useEffect, useRef } from 'react';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';

type GameEngine = ReturnType<typeof useGameEngine>;

const ITEM_TYPES = ['🐾'];

const ANIMAL_TYPES = [
    '🐅', '🐏', '🦬', '🐆', '🐃', '🦌', '🐇', '🦨', '🦡'
];

export interface MazeCell {
    row: number;
    col: number;
    isStart?: boolean;
    isEnd?: boolean;
    isObstacle?: boolean;
    obstacleType?: 'rock' | 'tree';
    isPath?: boolean; // Part of the player's drawn path
    // Directional flags for path rendering
    isItem?: boolean;
    itemType?: string;
    n?: boolean;
    s?: boolean;
    e?: boolean;
    w?: boolean;
}

interface LevelDef {
    size: number;
    start: { r: number, c: number };
    end: { r: number, c: number };
    items: { r: number, c: number, type: string }[]; // Target items (Tracks)
    obstacles: { r: number, c: number, type: 'rock' | 'tree' }[];
    targetAnimal: string;
}

const OBSTACLE_TYPES = ['rock', 'tree'] as const;
const MOVES = [[-1, 0], [1, 0], [0, -1], [0, 1]];

function shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

const generateLevel = (size: number, difficulty: number): LevelDef => {
    // ... (existing generation logic up to item placement)
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

        const moves = shuffle(MOVES);

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

        const moves = shuffle(MOVES);
        let grew = false;

        for (const [dr, dc] of moves) {
            const nextR = r + dr;
            const nextC = c + dc;

            if (nextR >= 0 && nextR < size && nextC >= 0 && nextC < size) {
                if (!isEmpty[nextR][nextC]) {
                    let emptyNeighbors = 0;
                    MOVES.forEach(([nr, nc]) => {
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
    const obstacles: { r: number, c: number, type: 'rock' | 'tree' }[] = [];

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (!isEmpty[r][c]) {
                const type = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
                obstacles.push({ r, c, type });
            }
        }
    }

    // 5. Place Items (Keys) on the Solution Path (One-Stroke requirement)
    // We filter out start and end, then pick random points.
    const potentialItemSpots = solutionPath.filter(p =>
        !(p.r === start.r && p.c === start.c) &&
        !(p.r === end.r && p.c === end.c)
    );

    const items: { r: number, c: number, type: string }[] = [];
    const targetItemCount = Math.min(3, Math.floor(difficulty / 3) + 1); // 1 to 3 items based on difficulty

    // Shuffle spots and pick N
    const shuffledSpots = shuffle(potentialItemSpots);
    for (let i = 0; i < targetItemCount && i < shuffledSpots.length; i++) {
        const type = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
        items.push({ ...shuffledSpots[i], type });
    }

    const targetAnimal = ANIMAL_TYPES[Math.floor(Math.random() * ANIMAL_TYPES.length)];

    return { size, start, end, obstacles, items, targetAnimal };
};

export const useMazeHunterLogic = (engine: GameEngine) => {
    const { activatePowerUp, powerUps, isTimeFrozen, isDoubleScore } = engine;

    // State
    const [levelIndex, setLevelIndex] = useState(0);
    const [grid, setGrid] = useState<MazeCell[][]>([]);
    const [currentLevel, setCurrentLevel] = useState<LevelDef>({ size: 5, start: { r: 0, c: 0 }, end: { r: 4, c: 4 }, obstacles: [], items: [], targetAnimal: '🐅' });

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
        // L0-1: 5x5, L2-3: 6x6, L4-5: 7x7 ... L8+: 9x9
        const size = Math.min(9, Math.floor(5 + levelIndex / 2));
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

        newLevel.items.forEach(i => {
            newGrid[i.r][i.c].isItem = true;
            newGrid[i.r][i.c].itemType = i.type;
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
                const next = prev.map(row => [...row]);
                // Copy cell before mutation
                next[r][c] = {
                    ...next[r][c],
                    isPath: true
                };
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
                        // Reset removed cell (Copy!)
                        next[removed.r][removed.c] = {
                            ...next[removed.r][removed.c],
                            isPath: false,
                            n: false, s: false, e: false, w: false
                        };

                        // Clear directional flag of the NEW last cell (Copy!)
                        const currentTip = { ...next[r][c] };

                        if (removed.r < r) currentTip.n = false;
                        if (removed.r > r) currentTip.s = false;
                        if (removed.c < c) currentTip.w = false;
                        if (removed.c > c) currentTip.e = false;

                        next[r][c] = currentTip;
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

            // Copy cells before mutation
            const prevCell = { ...next[last.r][last.c] };
            const currCell = { ...next[r][c] };

            if (r < last.r) prevCell.n = true;
            if (r > last.r) prevCell.s = true;
            if (c < last.c) prevCell.w = true;
            if (c > last.c) prevCell.e = true;

            if (r < last.r) currCell.s = true;
            if (r > last.r) currCell.n = true;
            if (c < last.c) currCell.e = true;
            if (c > last.c) currCell.w = true;

            currCell.isPath = true;

            // Assign back
            next[last.r][last.c] = prevCell;
            next[r][c] = currCell;

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
            // Validate: collected all items?
            const totalItems = currentLevel.items.length;
            const collectedItems = grid.flat().filter(c => c.isPath && c.isItem).length;

            if (collectedItems < totalItems) {
                // Not enough items!
                // Feedback: Shake or message? For now, just reset path like a failure (or keep path but don't submit?)
                // Defaulting to reset for strictness, or maybe just do nothing and let user continue?
                // "One stroke" implies you can't just pause and go back easily without undoing.
                // Let's reset but maybe play a "locked" sound? For now, plain reset.
                setGrid(prev => prev.map(row => row.map(cell => ({
                    ...cell,
                    isPath: false, n: false, s: false, e: false, w: false
                }))));
                setPathCells([]);
                return;
            }

            // Success
            engine.submitAnswer(true, { scoreMultiplier: 0.2 + (totalItems * 0.1) }); // Bonus for items
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
