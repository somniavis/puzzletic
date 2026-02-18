import { useState, useEffect, useCallback } from 'react';


export interface FruitItem {
    id: number;
    value: number; // The answer (C)
    equationA: number; // Minuend (A)
    equationResult: number; // Subtrahend (B) - REUSING FIELD NAME to minimize interface change
    fruitType: 'grape' | 'melon' | 'watermelon' | 'orange' | 'lemon' | 'banana' | 'pineapple' | 'mango' | 'apple' | 'green-apple' | 'pear' | 'peach' | 'cherry' | 'strawberry' | 'blueberry' | 'kiwi' | 'tomato';
}

export interface KnifeOption {
    id: number;
    value: number;
}

export interface Problem {
    id: number;
    fruit: FruitItem;
    knives: KnifeOption[];
    difficulty: number;
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
    correctInLevel: number;
}

export const FRUITS = [
    { type: 'grape', emoji: '🍇', color: '#A855F7' },
    { type: 'melon', emoji: '🍈', color: '#bef264' },
    { type: 'watermelon', emoji: '🍉', color: '#4ADE80' },
    { type: 'orange', emoji: '🍊', color: '#FB923C' },
    { type: 'lemon', emoji: '🍋', color: '#FACC15' },
    { type: 'banana', emoji: '🍌', color: '#fde047' },
    { type: 'pineapple', emoji: '🍍', color: '#fbbf24' },
    { type: 'mango', emoji: '🥭', color: '#f59e0b' },
    { type: 'apple', emoji: '🍎', color: '#EF4444' },
    { type: 'green-apple', emoji: '🍏', color: '#8bdd45' },
    { type: 'pear', emoji: '🍐', color: '#d9f99d' },
    { type: 'peach', emoji: '🍑', color: '#fca5a5' },
    { type: 'cherry', emoji: '🍒', color: '#dc2626' },
    { type: 'strawberry', emoji: '🍓', color: '#F87171' },
    { type: 'blueberry', emoji: '🫐', color: '#3b82f6' },
    { type: 'kiwi', emoji: '🥝', color: '#65a30d' },
    { type: 'tomato', emoji: '🍅', color: '#ef4444' },
] as const;

const generateProblem = (difficulty: number, lastProblem?: Problem | null): Problem => {
    let a: number, b: number;
    let attempts = 0;

    do {
        attempts++;
        if (difficulty === 1) {
            // Level 1: Subtraction within 5
            a = Math.floor(Math.random() * 4) + 2; // 2 to 5
            b = Math.floor(Math.random() * (a - 1)) + 1; // 1 to a-1
        } else {
            // Level 2: Subtraction within 10
            a = Math.floor(Math.random() * 5) + 6; // 6 to 10
            b = Math.floor(Math.random() * (a - 1)) + 1; // 1 to a-1
        }

        // Break if different or tried too many times (safety)
        if (!lastProblem || lastProblem.fruit.equationA !== a || lastProblem.fruit.equationResult !== b) {
            break;
        }
    } while (attempts < 5);

    const result = a - b;
    const correctValue = result; // User finds the result (C)

    const randomFruit = FRUITS[Math.floor(Math.random() * FRUITS.length)];

    const fruit: FruitItem = {
        id: Date.now(),
        value: correctValue,
        equationA: a,
        equationResult: b, // Note: We store 'B' in equationResult field to pass to UI, UI will show A - B = ?
        fruitType: randomFruit.type as any
    };

    // Generate Knives (1 correct + 3 distractors)
    const knives: KnifeOption[] = [];
    knives.push({ id: Math.random(), value: correctValue });

    while (knives.length < 4) {
        let distractor: number;
        // Smart distractors: close to answer
        const variance = Math.floor(Math.random() * 5) + 1;

        // Randomly choose direction, but force positive if subtraction would go below 1
        let isAddition = Math.random() > 0.5;
        if (correctValue - variance < 1) isAddition = true;

        if (isAddition) {
            distractor = correctValue + variance;
        } else {
            distractor = correctValue - variance;
        }

        // Ensure non-negative and unique (strictly >= 1)
        if (distractor < 1) distractor = 1;

        if (!knives.find(k => k.value === distractor)) {
            knives.push({ id: Math.random(), value: distractor });
        }
    }

    // Shuffle knives
    for (let i = knives.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [knives[i], knives[j]] = [knives[j], knives[i]];
    }

    return {
        id: Math.random(),
        fruit,
        knives,
        difficulty
    };
};

export const useFruitSliceLogic = () => {
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
        correctInLevel: 0
    });

    const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
    const [powerUps, setPowerUps] = useState({ timeFreeze: 0, extraLife: 0, doubleScore: 0 });
    const [timeFrozen, setTimeFrozen] = useState(false);
    const [doubleScoreActive, setDoubleScoreActive] = useState(false);
    const [questionStartTime, setQuestionStartTime] = useState(0);
    const [lastEvent, setLastEvent] = useState<{ type: 'correct' | 'wrong', id: number } | null>(null);

    // Initialize/Reset Game
    const startGame = useCallback(() => {
        const initialDifficulty = 1;
        setPowerUps({ timeFreeze: 0, extraLife: 0, doubleScore: 0 });
        setTimeFrozen(false);
        setDoubleScoreActive(false);
        setLastEvent(null);
        setCurrentProblem(generateProblem(initialDifficulty));
        setQuestionStartTime(Date.now());

        setGameState(prev => ({
            ...prev,
            score: 0,
            lives: 3,
            timeLeft: 60,
            combo: 0,
            difficultyLevel: initialDifficulty,
            gameOver: false,
            isPlaying: true,
            stats: { correct: 0, wrong: 0 },
            correctInLevel: 0
        }));
    }, []);

    const stopTimer = useCallback(() => {
        setGameState(prev => ({ ...prev, isPlaying: false }));
    }, []);

    // Timer effect
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

    const handleAnswer = useCallback((knifeValue: number) => {
        if (gameState.gameOver || !currentProblem) return;

        const isCorrect = knifeValue === currentProblem.fruit.value;

        if (isCorrect) {
            // playCleaningSound(); // REMOVED
            setLastEvent({ type: 'correct', id: Date.now() });

            const responseTime = Date.now() - questionStartTime;
            const baseScore = currentProblem.difficulty * 50;
            const timeBonus = Math.max(0, 10 - Math.floor(responseTime / 1000)) * 5;
            const comboBonus = gameState.combo * 10;

            const totalAdd = Math.floor((baseScore + timeBonus + comboBonus) * (doubleScoreActive ? 2 : 1));

            // State Update & Difficulty Logic
            setGameState(prev => {
                const newCombo = prev.combo + 1;
                const newCorrectInLevel = prev.correctInLevel + 1;
                let newLevel = prev.difficultyLevel;

                // Difficulty Upgrade Logic:
                // Level 1 -> 2: Combo >= 6 OR Total Correct in Level >= 8
                if (prev.difficultyLevel === 1) {
                    if (newCombo >= 6 || newCorrectInLevel >= 8) {
                        newLevel = 2;
                    }
                }

                // If level changed, reset correctInLevel
                const finalCorrectInLevel = newLevel !== prev.difficultyLevel ? 0 : newCorrectInLevel;

                return {
                    ...prev,
                    score: prev.score + totalAdd,
                    combo: newCombo,
                    bestCombo: Math.max(prev.bestCombo, newCombo),
                    difficultyLevel: newLevel,
                    stats: { ...prev.stats, correct: prev.stats.correct + 1 },
                    correctInLevel: finalCorrectInLevel
                };
            });

            // Powerup drop logic
            if ((gameState.combo + 1) % 3 === 0 && Math.random() > 0.45) {
                const types: (keyof typeof powerUps)[] = ['timeFreeze', 'extraLife', 'doubleScore'];
                const type = types[Math.floor(Math.random() * types.length)];
                setPowerUps(prev => ({ ...prev, [type]: prev[type] + 1 }));
                // playEatingSound(); // REMOVED
            }

            // Wait for animation then new problem
            setTimeout(() => {
                // Determine next level based on CURRENT state logic (replicated here because state update is async)
                setGameState(latest => {
                    // Use latest difficulty level for generation
                    setCurrentProblem(prevProblem => generateProblem(latest.difficultyLevel, prevProblem));
                    setQuestionStartTime(Date.now());
                    setLastEvent(null);

                    return latest; // Return state unchanged
                });
            }, 1500);

        } else {
            // playButtonSound(); // REMOVED
            setLastEvent({ type: 'wrong', id: Date.now() });

            setGameState(prev => {
                const newLives = prev.lives - 1;
                return {
                    ...prev,
                    lives: newLives,
                    combo: 0, // Reset combo
                    gameOver: newLives <= 0,
                    gameOverReason: newLives <= 0 ? 'lives' : undefined,
                    stats: { ...prev.stats, wrong: prev.stats.wrong + 1 }
                };
            });
            // Downgrade logic skipped as agreed
        }
    }, [gameState, currentProblem, doubleScoreActive, powerUps, questionStartTime]);


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

    // Initial Start
    // useEffect(() => {
    //     startGame();
    //     return () => stopTimer();
    // }, []);

    return {
        gameState,
        currentProblem,
        powerUps,
        timeFrozen,
        doubleScoreActive,
        startGame,
        stopTimer,
        handleAnswer,
        usePowerUp,
        lastEvent
    };
};
