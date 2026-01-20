import { useState, useEffect, useCallback } from 'react';


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
        combo: 0,
        bestCombo: 0,
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
        // Since target >= 2, we can always find at least one pair of positive integers
        const a = Math.floor(Math.random() * (target - 1)) + 1;
        const b = target - a;

        // Create Options (4 items)
        // 1. Correct A
        // 2. Correct B
        // 3 & 4. Distractors

        const optionsRaw: NumberItem[] = [
            { id: Math.random(), value: a, emoji: emoji },
            { id: Math.random(), value: b, emoji: emoji }
        ];

        // --- Distractor Logic ---
        // Helper to get a safe random number distinct from exclusions
        // maxT is the upper bound (exclusive) for valid values (value < target)
        // BUT if target is small (e.g. 2, 3), valid values < target might be exhausted by A/B.
        // e.g. Target=2 => a=1, b=1. Valid < 2 is only 1. Since 1 is excluded (a/b), NO valid < target exists!
        // FIX: Allow distractors >= target if strictly needed, OR just ensure distinct ID/Emoji?
        // User requested "value < target" so it's not obviously wrong by size.
        // IF target is too small (e.g. 2 or 3), strict "< target" with unique values is impossible or rare.
        // Strategy: Try to pick < target. If impossible/fails, pick target+1 or just any random 1-9 to unblock.

        const getSafeDistractorValue = (excludeVals: number[], maxLimit: number) => {
            // 1. Try to find good candidates < maxLimit
            const candidates = [];
            for (let i = 1; i < maxLimit; i++) {
                if (!excludeVals.includes(i)) candidates.push(i);
            }

            if (candidates.length > 0) {
                // Pick random from safe candidates
                return candidates[Math.floor(Math.random() * candidates.length)];
            }

            // 2. Fallback: If no valid candidates < target (e.g. target=2), 
            // we MUST violate the rule or reuse a value. 
            // Reusing value with SAME emoji makes it identical to correct answer -> Bad.
            // Reusing value with WRONG emoji is fine.
            // Picking value > target is safer fallback than freezing.

            // Let's pick a random number 1-9 that's NOT in exclusions if possible
            const backupCandidates = [];
            for (let i = 1; i <= 9; i++) {
                if (!excludeVals.includes(i)) backupCandidates.push(i);
            }

            if (backupCandidates.length > 0) {
                return backupCandidates[Math.floor(Math.random() * backupCandidates.length)];
            }

            // Last Resort (Should never happen with 1-9 range and few exclusions)
            return Math.floor(Math.random() * 9) + 1;
        };

        // Distractor 1
        let d1Val: number;
        let d1Emoji: string;

        // 50% chance for Same Emoji (Harder logic logic) vs Wrong Emoji
        if (Math.random() < 0.5) {
            // Harder: Same Emoji -> Value MUST be different from A and B (and Target)
            d1Emoji = emoji;
            d1Val = getSafeDistractorValue([a, b], target);
        } else {
            // Classic: Wrong Emoji
            d1Emoji = wrongEmoji;
            // Can reuse A or B values to be tricky
            d1Val = Math.random() > 0.5 ? a : b;
        }

        optionsRaw.push({
            id: Math.random(),
            value: d1Val,
            emoji: d1Emoji
        });

        // Distractor 2: Same Emoji, Wrong Value
        // Must be different from A, B, and D1 (if D1 is same emoji)
        const exclusions = [a, b];
        if (d1Emoji === emoji) exclusions.push(d1Val);

        const d2Val = getSafeDistractorValue(exclusions, target);

        optionsRaw.push({
            id: Math.random(),
            value: d2Val,
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
            combo: 0,
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
                const comboBonus = gameState.combo * 10;
                const totalAdd = (baseScore + timeBonus + comboBonus) * (doubleScoreActive ? 2 : 1);

                setGameState(prev => ({
                    ...prev,
                    score: prev.score + totalAdd,
                    combo: prev.combo + 1,
                    bestCombo: Math.max(prev.bestCombo, prev.combo + 1),
                    stats: { ...prev.stats, correct: prev.stats.correct + 1 }
                }));

                // Drop Powerup Chance
                if ((gameState.combo + 1) % 3 === 0 && Math.random() > 0.45) {
                    const types: (keyof typeof powerUps)[] = ['timeFreeze', 'extraLife', 'doubleScore'];
                    const type = types[Math.floor(Math.random() * types.length)];
                    setPowerUps(prev => ({ ...prev, [type]: prev[type] + 1 }));
                    // playEatingSound(); // REMOVED
                }

                setTimeout(() => {
                    generateProblem();
                    setIsChecking(false);
                }, 1000);

            } else {
                // Wrong
                // Sound handled by Layout via lastEvent
                setLastEvent({ type: 'wrong', id: Date.now() }); // Trigger shake

                setGameState(prev => {
                    const newLives = prev.lives - 1;
                    return {
                        ...prev,
                        lives: newLives,
                        combo: 0,
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

    }, [gameState.combo, doubleScoreActive, powerUps, generateProblem, questionStartTime, rightPanItems, isChecking, gameState.lives]);

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
        // playButtonSound(); // REMOVED
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
