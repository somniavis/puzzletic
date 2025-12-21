import { useState, useEffect, useCallback } from 'react';
import { playButtonSound, playEatingSound, playJelloClickSound } from '../../../../utils/sound';

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

export interface NumberItem {
    id: number;
    value: number;
    emoji: string;
}

export interface Problem {
    targetValue: number;
    targetEmoji: string;
    options: NumberItem[];
}

const ITEMS = ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥑', '🍆'];

const getRandomEmoji = () => ITEMS[Math.floor(Math.random() * ITEMS.length)];

export const useNumberBalanceLogic = () => {

    // Core Game State
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

    // Level State
    const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
    const [rightPanItems, setRightPanItems] = useState<NumberItem[]>([]);

    // Scale Physics
    const [scaleAngle, setScaleAngle] = useState(-15); // Negative = Left heavy, Positive = Right heavy, 0 = Balanced

    // Power Ups
    const [powerUps, setPowerUps] = useState({ timeFreeze: 0, extraLife: 0, doubleScore: 0 });
    const [timeFrozen, setTimeFrozen] = useState(false);
    const [doubleScoreActive, setDoubleScoreActive] = useState(false);

    const [lastEvent, setLastEvent] = useState<{ type: 'correct' | 'wrong', isFinal?: boolean, id: number } | null>(null);
    const [questionStartTime, setQuestionStartTime] = useState(0);



    const generateProblem = useCallback(() => {
        // Target: 2 to 10
        const target = Math.floor(Math.random() * 9) + 2;
        const emoji = getRandomEmoji();
        let wrongEmoji = getRandomEmoji();
        while (wrongEmoji === emoji) {
            wrongEmoji = getRandomEmoji();
        }

        // Find a valid pair (A + B = Target)
        const a = Math.floor(Math.random() * (target - 1)) + 1;
        const b = target - a;

        // Create Options (4 items)
        // 1. Correct A (Correct Value, Correct Emoji)
        // 2. Correct B (Correct Value, Correct Emoji)
        // 3. Distractor 1 (Similar Value, WRONG Emoji) - Tricky!
        // 4. Distractor 2 (Random Value, Correct Emoji) - Tricky!

        const optionsRaw: NumberItem[] = [
            { id: Math.random(), value: a, emoji: emoji },
            { id: Math.random(), value: b, emoji: emoji }
        ];

        // Distractor 1: Wrong Emoji (Value MUST NOT be Target to enforce 2-item rule)
        // If distractor value equals target (impossible if a,b < target), but for safety:
        // Actually a and b are parts of target, so they are always < target.
        // But what if we want a random distractor?
        // Let's stick to using A or B or a random close number, but strictly != target.

        let d1Val = Math.random() > 0.5 ? a : b;
        // Optional: randomization
        if (Math.random() > 0.7) {
            d1Val = Math.floor(Math.random() * 9) + 1;
            while (d1Val === target) {
                d1Val = Math.floor(Math.random() * 9) + 1;
            }
        }

        optionsRaw.push({
            id: Math.random(),
            value: d1Val,
            emoji: wrongEmoji
        });

        // Distractor 2: Correct Emoji, Wrong Value (MUST NOT be Target)
        let wrongValue = Math.floor(Math.random() * 9) + 1;
        // Avoid A, B (correct parts) and TARGET (to prevent single-item balance)
        while (wrongValue === a || wrongValue === b || wrongValue === target) {
            wrongValue = Math.floor(Math.random() * 9) + 1;
        }
        optionsRaw.push({
            id: Math.random(),
            value: wrongValue,
            emoji: emoji
        });


        // Create Options Array and Shuffle
        const options = optionsRaw.sort(() => Math.random() - 0.5);

        setCurrentProblem({
            targetValue: target,
            targetEmoji: emoji,
            options: options
        });
        setRightPanItems([]);
        setQuestionStartTime(Date.now());

    }, []);

    const startGame = useCallback(() => {
        setIsChecking(false); // Reset check lock
        setGameState(prev => ({
            ...prev,
            isPlaying: true,
            gameOver: false,
            score: 0,
            lives: 3,
            timeLeft: 60,
            streak: 0,
            stats: { correct: 0, wrong: 0 }
        }));
        setPowerUps({ timeFreeze: 0, extraLife: 0, doubleScore: 0 });
        generateProblem();
    }, [generateProblem]);

    const stopGame = useCallback(() => {
        setGameState(prev => ({ ...prev, isPlaying: false }));
    }, []);

    const [isChecking, setIsChecking] = useState(false);

    const checkAnswer = useCallback((rightWeight: number, target: number, targetEmoji: string) => {
        if (isChecking || gameState.gameOver) return;
        setIsChecking(true);

        // Validation: Correct Sum AND Correct Emoji Type
        const isSumCorrect = rightWeight === target;
        const isEmojiCorrect = rightPanItems.every(item => item.emoji === targetEmoji);

        const isCorrect = isSumCorrect && isEmojiCorrect;

        setTimeout(() => {
            if (isCorrect) {
                // Correct
                // Sound handled by Layout1 via lastEvent
                setLastEvent({ type: 'correct', isFinal: true, id: Date.now() });

                // Score Calc
                const responseTime = Date.now() - questionStartTime;
                const baseScore = 100; // Fixed base for this game type
                const timeBonus = Math.max(0, 10 - Math.floor(responseTime / 1000)) * 5;
                const streakBonus = gameState.streak * 10;
                const totalAdd = (baseScore + timeBonus + streakBonus) * (doubleScoreActive ? 2 : 1);

                setGameState(prev => ({
                    ...prev,
                    score: prev.score + totalAdd,
                    streak: prev.streak + 1,
                    bestStreak: Math.max(prev.bestStreak, prev.streak + 1),
                    stats: { ...prev.stats, correct: prev.stats.correct + 1 }
                }));

                // Drop Powerup Chance
                if ((gameState.streak + 1) % 3 === 0 && Math.random() > 0.45) {
                    const types: (keyof typeof powerUps)[] = ['timeFreeze', 'extraLife', 'doubleScore'];
                    const type = types[Math.floor(Math.random() * types.length)];
                    setPowerUps(prev => ({ ...prev, [type]: prev[type] + 1 }));
                    playEatingSound();
                }

                setTimeout(() => {
                    generateProblem();
                    setIsChecking(false);
                }, 1000);

            } else {
                // Wrong
                // Sound handled by Layout1 via lastEvent, but calling directly for redundancy/immediacy
                playJelloClickSound();
                setLastEvent({ type: 'wrong', id: Date.now() }); // Trigger shake

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

                // Check if game over, else reset pan after delay
                if (gameState.lives > 1) {
                    setTimeout(() => {
                        setRightPanItems([]); // Reset pan to try again
                        setIsChecking(false);
                    }, 800);
                } else {
                    // Game Over: Keep isChecking=true to prevent loop
                }
            }
        }, 500); // 500ms delay to see the balance

    }, [gameState.streak, doubleScoreActive, powerUps, generateProblem, questionStartTime, rightPanItems, isChecking, gameState.lives]);

    // Calculate Scale Angle whenever items change
    useEffect(() => {
        if (!currentProblem) return;

        const leftWeight = currentProblem.targetValue;
        const rightWeight = rightPanItems.reduce((sum, item) => sum + item.value, 0);

        // Simple Physics Simulation
        // Angle proportional to weight difference
        // Clamped between -20 and 20 degrees
        const diff = rightWeight - leftWeight;

        let targetAngle = 0;
        if (rightWeight === 0) {
            targetAngle = -15; // Fully Left down if empty
        } else if (diff === 0) {
            targetAngle = 0; // Balanced
        } else if (diff > 0) {
            targetAngle = Math.min(15, diff * 3); // Right heavy
        } else {
            targetAngle = Math.max(-15, diff * 3); // Left heavy
        }

        setScaleAngle(targetAngle);

        // Check Win Condition if 2 items placed OR if weight already exceeds target
        if (rightWeight > leftWeight || rightPanItems.length === 2) {
            checkAnswer(rightWeight, leftWeight, currentProblem.targetEmoji);
        }

    }, [rightPanItems, currentProblem, checkAnswer]);

    // Timer
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


    // Handlers
    const handleDrop = (item: NumberItem) => {
        if (rightPanItems.length >= 2 || gameState.gameOver) return;

        // Add to pan
        playButtonSound();
        setRightPanItems(prev => [...prev, item]);

        // Remove from current options visually? 
        // User asked for "drag and drop 2 number combination". 
        // Usually choices remain or disappear. Let's make used choices disappear from list to prevent re-use?
        // Or allow re-use? "2 combinations" implies picking from available.
        // Let's remove from options list logic handled in UI or just filter here?
        // Better to manage "used" ids in UI, or just check ID.
    };

    const handleRemoveFromPan = (index: number) => {
        if (gameState.gameOver) return;
        setRightPanItems(prev => prev.filter((_, i) => i !== index));
    };

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

    return {
        ...gameState,
        currentProblem,
        rightPanItems,
        scaleAngle,
        powerUps,
        timeFrozen,
        doubleScoreActive,
        startGame,
        stopGame,
        handleDrop,
        handleRemoveFromPan,
        usePowerUp,
        lastEvent
    };
};
