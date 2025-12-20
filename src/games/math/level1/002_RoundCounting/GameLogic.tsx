import { useState, useEffect, useCallback } from 'react';

import { playButtonSound, playEatingSound } from '../../../../utils/sound';

export interface GridItem {
    id: number;
    emoji: string;
    isTarget: boolean;
}

export interface Problem {
    id: number;
    targetEmoji: string;
    targetCount: number;
    gridItems: GridItem[];
    difficulty: number;
    cols: number;
}

export interface GameState {
    score: number;
    lives: number;
    timeLeft: number;
    streak: number;
    bestStreak: number;
    difficultyLevel: number;
    gameOver: boolean;
    gameOverReason?: 'time' | 'lives' | 'cleared';
    isPlaying: boolean;
    stats: {
        correct: number;
        wrong: number;
    };
}

const ITEMS = [
    // Mammals
    '🐒', '🦍', '🦧', '🐕', '🐩', '🐈‍⬛', '🐅', '🐆', '🐎', '🦌', '🦬', '🐂', '🐃', '🐄', '🐖', '🐏', '🐐', '🐪', '🦙', '🦒', '🐘', '🦣', '🦏', '🦛', '🐁', '🐀', '🐇', '🐿️', '🦫', '🦔', '🦇', '🦥', '🦦', '🦨', '🦘', '🦡', '🦝', '🦓',
    // Birds
    '🦃', '🐓', '🕊️', '🦅', '🦆', '🦢', '🦉', '🦤', '🦩', '🦜',
    // Sea & others
    '🐳', '🐬', '🦭', '🐟', '🐠', '🐡', '🦈', '🐙', '🦑', '🦐', '🦞', '🦀', '🪼',
    '🐌', '🦋', '🐛', '🐜', '🐝', '🪲', '🐞', '🦗', '🕷️', '🦂'
];

const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const generateProblem = (difficulty: number): Problem => {
    let gridSize: number;
    let cols: number;
    let targetCount: number;
    let distractorCount: number;

    if (difficulty === 1) {
        // Beginner: 3x3
        cols = 3;
        gridSize = 9;
        targetCount = Math.floor(Math.random() * 3) + 1;
    } else {
        // Intermediate+: 4x4
        cols = 4;
        gridSize = 16;


        if (difficulty === 2) {
            // Level 2: 3~5 uniform
            // Math.random() * 3 is 0~2, +3 is 3~5
            targetCount = Math.floor(Math.random() * 3) + 3;
        } else {
            // Level 3: 2~9 uniform
            // Math.random() * 8 is 0~7, +2 is 2~9
            targetCount = Math.floor(Math.random() * 8) + 2;
        }
    }

    targetCount = Math.min(targetCount, gridSize - 1);
    distractorCount = gridSize - targetCount;

    const targetEmoji = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    const distractors = shuffleArray(ITEMS.filter(i => i !== targetEmoji)).slice(0, distractorCount);

    const gridItems: GridItem[] = [];

    // Add targets
    for (let i = 0; i < targetCount; i++) {
        gridItems.push({ id: Math.random(), emoji: targetEmoji, isTarget: true });
    }

    // Add distractors
    let currentDistractorIndex = 0;
    if (distractors.length > 0) {
        for (let i = 0; i < distractorCount; i++) {
            gridItems.push({ id: Math.random(), emoji: distractors[currentDistractorIndex], isTarget: false });
            currentDistractorIndex = (currentDistractorIndex + 1) % distractors.length;
        }
    }

    return {
        id: Math.random(),
        targetEmoji,
        targetCount,
        gridItems: shuffleArray(gridItems),
        difficulty,
        cols
    };
};

export const useRoundCountingLogic = () => {
    // State
    const [gameState, setGameState] = useState<GameState>({
        score: 0,
        lives: 3,
        timeLeft: 60,
        streak: 0,
        bestStreak: 0,
        difficultyLevel: 1,
        gameOver: false,
        isPlaying: false,
        stats: { correct: 0, wrong: 0 }
    });

    const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
    const [foundIds, setFoundIds] = useState<number[]>([]);
    const [incorrectClickIndex, setIncorrectClickIndex] = useState<number | null>(null);
    const [isShuffling, setIsShuffling] = useState(false);

    const [powerUps, setPowerUps] = useState({ timeFreeze: 0, extraLife: 0, doubleScore: 0 });
    const [timeFrozen, setTimeFrozen] = useState(false);
    const [doubleScoreActive, setDoubleScoreActive] = useState(false);
    const [questionStartTime, setQuestionStartTime] = useState(0);
    const [lastEvent, setLastEvent] = useState<{ type: 'correct' | 'wrong', isFinal?: boolean, id: number } | null>(null);

    // Initialize/Reset Game
    const setupNewGame = useCallback(() => {
        const initialDifficulty = 1;
        const newProblem = generateProblem(initialDifficulty);
        setCurrentProblem(newProblem);
        setFoundIds([]);
        setGameState(prev => ({
            ...prev,
            difficultyLevel: initialDifficulty,
            score: 0,
            lives: 3,
            timeLeft: 60,
            gameOver: false,
            isPlaying: false,
            streak: 0,
            bestStreak: prev.bestStreak, // Preserve session best
            stats: { correct: 0, wrong: 0 }
        }));
        setLastEvent(null);
    }, []);

    const startGame = useCallback(() => {
        // Reset state for a new game
        const initialDifficulty = 1;

        // Reset problem state
        setFoundIds([]);
        setIncorrectClickIndex(null);
        setPowerUps({ timeFreeze: 0, extraLife: 0, doubleScore: 0 });
        setTimeFrozen(false);
        setDoubleScoreActive(false);
        setLastEvent(null);

        // Generate initial problem
        const newProblem = generateProblem(initialDifficulty);
        setCurrentProblem(newProblem);

        setQuestionStartTime(Date.now());

        setGameState(prev => ({
            ...prev,
            isPlaying: true,
            gameOver: false,
            score: 0,
            lives: 3,
            timeLeft: 60,
            streak: 0,
            difficultyLevel: initialDifficulty,
            stats: { correct: 0, wrong: 0 }
        }));
    }, []);

    const stopTimer = useCallback(() => {
        setGameState(prev => ({ ...prev, isPlaying: false }));
    }, []);

    // Timer effect to pause decrementing when frozen
    useEffect(() => {
        if (gameState.isPlaying && !gameState.gameOver && !timeFrozen) {
            const id = setInterval(() => {
                setGameState(prev => {
                    if (prev.timeLeft <= 0) {
                        return { ...prev, gameOver: true, gameOverReason: 'time', isPlaying: false };
                    }
                    return { ...prev, timeLeft: prev.timeLeft - 1 };
                });
            }, 1000);
            return () => clearInterval(id);
        }
    }, [gameState.isPlaying, gameState.gameOver, timeFrozen]);


    const adjustDifficulty = useCallback((isCorrect: boolean) => {
        setGameState(prev => {
            let newLevel = prev.difficultyLevel;
            if (isCorrect && prev.streak > 0 && prev.streak % 3 === 0 && prev.difficultyLevel < 3) {
                newLevel++;
            }
            return { ...prev, difficultyLevel: newLevel };
        });
    }, []);

    const generateNewProblem = useCallback(() => {
        setGameState(currentState => {
            const level = currentState.difficultyLevel;

            // Generate new problem
            // Ensure ID/content is slightly different if needed, but random is usually enough.
            // With enough entropy in generateProblem, collision is unlikely, but let's be safe.
            // We can't access 'currentProblem' inside the setGameState callback safely if strict mode, 
            // but for this logic we just generate fresh.
            // If we really want to ensure no repeat target:
            // This requires correct closure or ref usage.
            // For now, simple generation is 99% fine.
            let newProblem = generateProblem(level);


            setCurrentProblem(newProblem);
            setFoundIds([]);
            setQuestionStartTime(Date.now());
            return currentState;
        });
    }, []);

    const handleItemClick = useCallback((index: number) => {
        if (gameState.gameOver || !currentProblem || isShuffling || incorrectClickIndex !== null) return;

        const clickedItem = currentProblem.gridItems[index];
        if (foundIds.includes(clickedItem.id)) return;

        if (clickedItem.isTarget) {
            // Correct
            playButtonSound();
            const newFoundIds = [...foundIds, clickedItem.id];
            setFoundIds(newFoundIds);

            // Trigger feedback event
            const isRoundComplete = newFoundIds.length === currentProblem.targetCount;
            setLastEvent({ type: 'correct', isFinal: isRoundComplete, id: Date.now() });

            // Update stats immediately for every correct click
            setGameState(prev => ({
                ...prev,
                stats: { ...prev.stats, correct: prev.stats.correct + 1 }
            }));

            if (isRoundComplete) {
                // Round Complete
                const responseTime = Date.now() - questionStartTime;
                const baseScore = currentProblem.difficulty * 50;
                const timeBonus = Math.max(0, 10 - Math.floor(responseTime / 1000)) * 5;
                const streakBonus = gameState.streak * 10;
                const totalAdd = (baseScore + timeBonus + streakBonus) * (doubleScoreActive ? 2 : 1);

                setGameState(prev => {
                    const newStreak = prev.streak + 1;
                    const newBestStreak = Math.max(prev.bestStreak, newStreak);

                    return {
                        ...prev,
                        score: prev.score + totalAdd,
                        streak: newStreak,
                        bestStreak: newBestStreak,
                        // stats updated separately above
                    };
                });

                // Check for powerups
                if ((gameState.streak + 1) % 3 === 0 && Math.random() > 0.45) {
                    const types: (keyof typeof powerUps)[] = ['timeFreeze', 'extraLife', 'doubleScore'];
                    const type = types[Math.floor(Math.random() * types.length)];
                    setPowerUps(prev => ({ ...prev, [type]: prev[type] + 1 }));
                    playEatingSound(); // Sound for powerup drop?
                }

                adjustDifficulty(true);
                setTimeout(() => generateNewProblem(), 500);
            } else {
                // Shuffle
                setIsShuffling(true);
                setTimeout(() => {
                    setCurrentProblem(prev => {
                        if (!prev) return null;
                        return { ...prev, gridItems: shuffleArray(prev.gridItems) };
                    });
                    setIsShuffling(false);
                }, 300);
            }
        } else {
            // Wrong
            playButtonSound(); // Simple click sound for error or maybe add a specific error sound later
            setIncorrectClickIndex(index);

            // Trigger feedback event
            setLastEvent({ type: 'wrong', id: Date.now() });

            setTimeout(() => setIncorrectClickIndex(null), 500);
            setGameState(prev => {
                const newLives = prev.lives - 1;
                return {
                    ...prev,
                    lives: newLives,
                    streak: 0,
                    gameOver: newLives <= 0,
                    gameOverReason: newLives <= 0 ? 'lives' : undefined,
                    stats: { ...prev.stats, wrong: prev.stats.wrong + 1 }
                };
            });
            adjustDifficulty(false);
        }
    }, [gameState, currentProblem, foundIds, isShuffling, incorrectClickIndex, questionStartTime, doubleScoreActive, adjustDifficulty, generateNewProblem, powerUps]);

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

    useEffect(() => {
        setupNewGame();
        return () => stopTimer();
    }, [setupNewGame, stopTimer]);

    return {
        ...gameState, // Expose score, lives, timeLeft, Streak, bestStreak, difficultyLevel, gameOverReason, stats
        currentProblem,
        foundIds,
        incorrectClickIndex,
        isShuffling,
        powerUps,
        timeFrozen,
        doubleScoreActive,
        startGame,
        handleItemClick,
        usePowerUp,
        stopTimer,
        lastEvent
    };
};
