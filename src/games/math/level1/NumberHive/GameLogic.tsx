import { useState, useEffect, useCallback, useRef } from 'react';


export interface HiveCell {
    id: number;
    value: number;
    isRevealed: boolean; // Turned blue
}

export interface HiveLevel {
    level: number;
    gridSize: number; // 3 for 3x3, 4 for 4x4
    minNum: number;
    maxNum: number;
    startNum: number; // The number user must click first
    cells: HiveCell[];
}

export interface GameState {
    score: number;
    lives: number;
    timeLeft: number;
    combo: number;
    bestCombo: number;
    difficultyLevel: number;
    gameOver: boolean;
    gameOverReason?: 'time' | 'lives' | 'cleared';
    isPlaying: boolean;
    stats: {
        correct: number;
        wrong: number;
    };
    currentNumber: number; // The next number to click
    levelsCleared: number; // Track completed levels for progression
}

const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const generateLevel = (difficulty: number): HiveLevel => {
    let gridSize: number;
    let minRange: number;

    // Difficulty params
    if (difficulty === 1) {
        // 3x3 Grid (approx 9 items)
        // Range 1-9
        gridSize = 3;
        minRange = 1;
    } else {
        // 4x4 Grid (approx 16 items)
        // Range 10-25 or similar
        gridSize = 4;
        minRange = 10;
    }

    // Determine numbers
    // Ideally we want a contiguous sequence that fits in the grid?
    // User scenario: "If start is 3, grid has 1-9 mixed, user clicks 3~9".
    // This implies the grid contains extraneous numbers (Sound distractor logic) OR just the sequence?
    // User said: "3x3 grid has 1~9 mixed... click 3 to 9". 
    // This implies 1 and 2 are present but should NOT be clicked? Or are they already "done"?
    // "Start number 3... click 3, 4, 5...".
    // Let's assume the grid contains the full set appropriate for that difficulty (e.g. 1-9), 
    // and the "Task" is to start from X.

    // For Level 1: Numbers 1 to 9 fixed?
    // Let's make it a 'window' of numbers.

    // Generate N unique numbers.
    // If Level 1: Generate 1..9.
    // If Level 2: Generate contiguous sequence of length 16, e.g. 10..25.

    let baseNumbers: number[] = [];
    let startNum = minRange;

    if (difficulty === 1) {
        // Always 1-9 base pool
        baseNumbers = Array.from({ length: 9 }, (_, i) => i + 1);

        // Random start number between 1 and 5? 
        // "Early on 1~9 range... if 3 comes out at top, click 3~9".
        startNum = Math.floor(Math.random() * 5) + 1;
    } else {
        // Level 2 (4x4 Grid = 16 numbers)
        // Requirement: Numbers must be within 1 ~ 20.
        // And Target (Start) Number must be >= 10.

        const baseStart = Math.floor(Math.random() * 5) + 1; // 1~5
        baseNumbers = Array.from({ length: 16 }, (_, i) => baseStart + i);

        // Filter for valid start numbers: must be >= 10 and ensure at least 3 numbers to click
        const maxNumVal = baseNumbers[baseNumbers.length - 1];
        const validStarts = baseNumbers.filter(n => n >= 10 && n <= maxNumVal - 2);

        // Pick random from valid starts
        if (validStarts.length > 0) {
            startNum = validStarts[Math.floor(Math.random() * validStarts.length)];
        } else {
            // Fallback (should theoretically not happen given 1~5 baseStart)
            startNum = 10;
        }
    }

    const cells: HiveCell[] = shuffleArray(baseNumbers).map(num => ({
        id: num, // ID is the number itself
        value: num,
        isRevealed: false
    }));

    // Auto-reveal logic removed as per user request to start with clean grid
    // cells.forEach(c => { if (c.value < startNum) c.isRevealed = true; });

    return {
        level: difficulty,
        gridSize,
        minNum: Math.min(...baseNumbers),
        maxNum: Math.max(...baseNumbers),
        startNum,
        cells
    };
};

export const useNumberHiveLogic = () => {
    const [gameState, setGameState] = useState<GameState>({
        score: 0,
        lives: 3,
        timeLeft: 60,
        combo: 0,
        bestCombo: 0,
        difficultyLevel: 1,
        gameOver: false,
        isPlaying: false,
        stats: { correct: 0, wrong: 0 },
        currentNumber: 1,
        levelsCleared: 0
    });

    const [currentLevel, setCurrentLevel] = useState<HiveLevel | null>(null);
    const [shakeId, setShakeId] = useState<number | null>(null);

    const [powerUps, setPowerUps] = useState({ timeFreeze: 0, extraLife: 0, doubleScore: 0 });
    const [timeFrozen, setTimeFrozen] = useState(false);
    const [doubleScoreActive, setDoubleScoreActive] = useState(false);

    const [lastEvent, setLastEvent] = useState<{ type: 'correct' | 'wrong', isFinal?: boolean, id: number } | null>(null);
    const isProcessing = useRef(false);

    const setupNewGame = useCallback(() => {
        const initialLevel = generateLevel(1);
        setCurrentLevel(initialLevel);
        setPowerUps({ timeFreeze: 0, extraLife: 0, doubleScore: 0 });
        setTimeFrozen(false);
        setDoubleScoreActive(false);
        setGameState(prev => ({
            ...prev,
            score: 0,
            lives: 3,
            timeLeft: 60,
            combo: 0,
            bestCombo: 0,
            difficultyLevel: 1,
            gameOver: false,
            isPlaying: false,
            stats: { correct: 0, wrong: 0 },
            currentNumber: initialLevel.startNum,
            levelsCleared: 0
        }));
    }, []);

    const usePowerUp = useCallback((type: keyof typeof powerUps) => {
        if (powerUps[type] > 0) {
            setPowerUps(prev => ({ ...prev, [type]: prev[type] - 1 }));
            if (type === 'timeFreeze') {
                setTimeFrozen(true);
                setTimeout(() => setTimeFrozen(false), 7000);
            } else if (type === 'extraLife') {
                setGameState(prev => ({ ...prev, lives: Math.min(prev.lives + 1, 3) }));
            } else if (type === 'doubleScore') {
                setDoubleScoreActive(true);
                setTimeout(() => setDoubleScoreActive(false), 10000);
            }
        }
    }, [powerUps]);

    const startGame = useCallback(() => {
        setupNewGame();
        setGameState(prev => ({ ...prev, isPlaying: true }));
    }, [setupNewGame]);

    const stopGame = useCallback(() => {
        setGameState(prev => ({ ...prev, isPlaying: false }));
    }, []);

    useEffect(() => {
        if (gameState.isPlaying && !gameState.gameOver && !timeFrozen) {
            const timer = setInterval(() => {
                setGameState(prev => {
                    const newTime = prev.timeLeft - 1;
                    if (newTime <= 0) {
                        return { ...prev, timeLeft: 0, gameOver: true, gameOverReason: 'time', isPlaying: false };
                    }
                    return { ...prev, timeLeft: newTime };
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [gameState.isPlaying, gameState.gameOver]);


    const handleCellClick = useCallback((cell: HiveCell) => {
        if (!gameState.isPlaying || gameState.gameOver || cell.isRevealed || shakeId !== null || isProcessing.current) return;

        if (cell.value === gameState.currentNumber) {
            // Correct
            // playButtonSound(); // REMOVED

            // Mark revealed
            setCurrentLevel(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    cells: prev.cells.map(c => c.id === cell.id ? { ...c, isRevealed: true } : c)
                };
            });

            const isLevelComplete = cell.value === currentLevel?.maxNum;
            setLastEvent({ type: 'correct', isFinal: isLevelComplete, id: Date.now() });

            setGameState(prev => {
                const newLevelsCleared = isLevelComplete ? prev.levelsCleared + 1 : prev.levelsCleared;

                // Score Calculation (Only on Level Complete, similar to RoundCounting)
                let scoreAdd = 0;
                if (isLevelComplete) {
                    const baseScore = 50 * prev.difficultyLevel;
                    const comboBonus = prev.levelsCleared * 10; // Use levelsCleared for consistency
                    scoreAdd = (baseScore + comboBonus) * (doubleScoreActive ? 2 : 1);
                }

                return {
                    ...prev,
                    score: prev.score + scoreAdd,
                    stats: { ...prev.stats, correct: prev.stats.correct + 1 },
                    currentNumber: prev.currentNumber + 1,
                    combo: isLevelComplete ? prev.combo + 1 : prev.combo, // Only increment on full clear
                    bestCombo: isLevelComplete ? Math.max(prev.bestCombo, prev.combo + 1) : prev.bestCombo,
                    levelsCleared: newLevelsCleared
                };
            });

            if (isLevelComplete) {
                // Lock for transition
                isProcessing.current = true;

                // Drop PowerUp Chance (Matched to RoundCounting: every 3rd level, 55% chance)
                if ((gameState.levelsCleared + 1) % 3 === 0 && Math.random() > 0.45) {
                    const types: (keyof typeof powerUps)[] = ['timeFreeze', 'extraLife', 'doubleScore'];
                    const type = types[Math.floor(Math.random() * types.length)];
                    setPowerUps(prev => ({ ...prev, [type]: prev[type] + 1 }));
                    // playEatingSound(); // REMOVED
                }

                // Determine next level
                // Progression: 3 levels (clears) at Difficulty 1 -> Move to Difficulty 2
                setTimeout(() => {
                    setGameState(prev => {
                        // If cleared 3 or more levels, switch to diff 2. Otherwise stay.
                        // Can extend logic for further levels later.
                        const nextDifficulty = prev.levelsCleared >= 3 ? 2 : 1;

                        // Avoid regenerating just to stay same? No, always new level.
                        const nextLevel = generateLevel(nextDifficulty);
                        setCurrentLevel(nextLevel);
                        return {
                            ...prev,
                            difficultyLevel: nextDifficulty,
                            currentNumber: nextLevel.startNum
                            // timeLeft bonus removed as per user request to not auto-increase time
                        };
                    });
                    // Unlock with safety cooldown
                    setTimeout(() => { isProcessing.current = false; }, 300);
                }, 1000);
            }

        } else {
            // Wrong
            if (isProcessing.current) return;
            // Debounce error clicks
            isProcessing.current = true;
            setTimeout(() => { isProcessing.current = false; }, 300);

            // playJelloClickSound(); // Removed to prevent double audio (handled by Layout1)
            setShakeId(cell.id);
            setTimeout(() => setShakeId(null), 500);

            setLastEvent({ type: 'wrong', id: Date.now() });

            setGameState(prev => {
                const newLives = prev.lives - 1;
                return {
                    ...prev,
                    lives: newLives,
                    combo: 0,
                    gameOver: newLives <= 0,
                    gameOverReason: newLives <= 0 ? 'lives' : undefined,
                    isPlaying: newLives > 0,
                    stats: { ...prev.stats, wrong: prev.stats.wrong + 1 }
                };
            });
        }
    }, [gameState.isPlaying, gameState.gameOver, gameState.currentNumber, currentLevel, shakeId]);

    return {
        ...gameState,
        currentLevel,
        shakeId,
        powerUps,
        timeFrozen,
        doubleScoreActive,
        usePowerUp,
        startGame,
        stopGame,
        handleCellClick,
        lastEvent
    };
};
