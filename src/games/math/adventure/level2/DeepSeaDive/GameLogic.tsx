import { useState, useEffect, useCallback, useRef } from 'react';
import { ANIMALS, ANIMATION_TIMING, PROGRESSION_CONFIG } from './constants';

const generateLv1Problem = (internalDifficulty: number) => {
    let a: number, b: number;
    let useStage2Logic = false;

    if (internalDifficulty === 1) {
        useStage2Logic = false;
    } else if (internalDifficulty === 2) {
        useStage2Logic = true;
    } else {
        // Stage 3: Random Mix (50/50)
        useStage2Logic = Math.random() < 0.5;
    }

    if (!useStage2Logic) {
        // Stage 1 Logic: Minus 1-digit
        a = Math.floor(Math.random() * 11) + 10; // 10 ~ 20
        b = Math.floor(Math.random() * 9) + 1; // 1 ~ 9
    } else {
        // Stage 2 Logic: Minus 2-digit
        // Need A >= 11 to have B >= 10 and A - B > 0
        a = Math.floor(Math.random() * 10) + 11; // 11 ~ 20
        // B must be between 10 and A-1
        const maxB = a - 1;
        b = Math.floor(Math.random() * (maxB - 10 + 1)) + 10;
    }
    return { a, b };
};

const generateLv2Problem = (internalDifficulty: number) => {
    let a: number, b: number;
    let currentStageBase = internalDifficulty;

    if (internalDifficulty === 3) {
        // Stage 3 Mix: 50% Stage 3 (2-digit borrow), 50% Stage 2 (1-digit borrow)
        currentStageBase = Math.random() < 0.5 ? 3 : 2;
    }

    if (currentStageBase === 1) {
        // Stage 1: No Borrowing
        a = Math.floor(Math.random() * 91) + 10;
        const unitA = a % 10;
        let tempB;
        let attempts = 0;
        do {
            attempts++;
            const unitB = Math.floor(Math.random() * (unitA + 1));
            const maxTensB = Math.floor((a - unitB - 1) / 10);
            const tensB = (maxTensB < 0) ? 0 : Math.floor(Math.random() * (maxTensB + 1));
            tempB = tensB * 10 + unitB;
            if (tempB === 0) tempB = 1;
        } while ((tempB >= a || (a % 10) < (tempB % 10)) && attempts < 50);
        b = tempB;
        if (b >= a || (a % 10) < (b % 10)) {
            a = Math.floor(Math.random() * 91) + 10;
            b = Math.floor(Math.random() * (a % 10 + 1)) + 1;
            if (b >= a) b = a - 1;
            if (b === 0) b = 1;
        }
    } else if (currentStageBase === 2) {
        // Stage 2: Borrowing (1-digit subtrahend)
        do {
            a = Math.floor(Math.random() * 90) + 11;
        } while (a % 10 === 9);
        const unitA = a % 10;
        const unitB = Math.floor(Math.random() * (9 - unitA)) + (unitA + 1);
        b = unitB;
    } else {
        // Stage 3: Borrowing (2-digit subtrahend)
        do {
            a = Math.floor(Math.random() * 81) + 20;
        } while (a % 10 === 9);
        const unitA = a % 10;
        const unitB = Math.floor(Math.random() * (9 - unitA)) + (unitA + 1);
        const maxTensB = Math.floor((a - unitB - 1) / 10);
        const actualTensB = (maxTensB < 1) ? 1 : (Math.floor(Math.random() * maxTensB) + 1);
        b = actualTensB * 10 + unitB;
        if (b < 10 || b >= a) {
            do {
                a = Math.floor(Math.random() * 81) + 20;
            } while (a % 10 === 9);
            const fallbackUnitA = a % 10;
            const fallbackUnitB = Math.floor(Math.random() * (9 - fallbackUnitA)) + (fallbackUnitA + 1);
            const fallbackMaxTensB = Math.floor((a - fallbackUnitB - 1) / 10);
            const fallbackTensB = Math.floor(Math.random() * Math.max(1, fallbackMaxTensB)) + 1;
            b = fallbackTensB * 10 + fallbackUnitB;
            if (b < 10) b = 10;
            if (b >= a) b = a - 1;
        }
    }
    return { a, b };
};

export interface Problem {
    a: number;
    b: number; // Subtrahend
    answer: number;
    options: number[];
    equation: string;
}

export const useDeepSeaLogic = (levelMode: number = 1) => {
    // Game State
    const [gameState, setGameState] = useState({
        score: 0,
        lives: 3,
        timeLeft: 60,
        combo: 0,
        bestCombo: 0,
        difficultyLevel: 1, // Lv1: 1=Stage1, 2=Stage2, 3=Stage3. Lv2: 1=Default
        isPlaying: false,
        gameOver: false,
        stats: { correct: 0, wrong: 0 }
    });

    // Progression State (Lv1 & Lv2)
    const [progression, setProgression] = useState({
        consecutiveCorrect: 0,
        consecutiveWrong: 0,
        totalCorrectInStage: 0
    });

    const [lastEvent, setLastEvent] = useState<{ id: number; type: 'correct' | 'wrong'; isFinal?: boolean } | null>(null);

    // Power-Ups
    const [powerUps, setPowerUps] = useState({ timeFreeze: 0, extraLife: 0, doubleScore: 0 });
    const [timeFrozen, setTimeFrozen] = useState(false);
    const [doubleScoreActive, setDoubleScoreActive] = useState(false);

    const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
    const [currentAnimal, setCurrentAnimal] = useState(ANIMALS[0]);
    const [isDiving, setIsDiving] = useState(false);
    const [diveTargetIndex, setDiveTargetIndex] = useState<number | null>(null);
    const [questionStartTime, setQuestionStartTime] = useState(0);

    // Logic: Generate Subtraction Problem
    const generateProblem = useCallback((internalDifficulty: number) => {
        // Use the level passed to hook, default to 1 if undefined/unexpected

        let a: number, b: number;
        if (levelMode === 1) {
            ({ a, b } = generateLv1Problem(internalDifficulty));
        } else {
            ({ a, b } = generateLv2Problem(internalDifficulty));
        }

        const answer = a - b;

        // Options Generation
        // Decide target position for answer: 0 (Top/Small), 1 (Mid/Med), 2 (Bottom/Large)
        // Uniform distribution 33% each (where possible)
        let targetPos = Math.floor(Math.random() * 3);

        // Adjust targetPos if impossible (e.g. Answer=1 cannot be at pos 2 because we need 2 smaller +ve integers)
        // We assume options must be > 0.
        if (answer <= 2 && targetPos === 2) targetPos = 1;
        if (answer <= 1 && targetPos === 1) targetPos = 0;

        const newOptions = new Set<number>();
        newOptions.add(answer);

        const generateDistractor = (forceLarger: boolean): number => {
            let limit = 0;
            while (limit++ < 20) {
                let diff = (Math.floor(Math.random() * 5) + 1) + (Math.random() > 0.5 ? 5 : 0); // 1..10
                if (Math.random() > 0.8) diff += 10; // Occasional larger jump

                const val = forceLarger ? answer + diff : answer - diff;

                if (val > 0 && val < 200 && val !== answer && !newOptions.has(val)) {
                    return val;
                }
            }
            // Fallback
            return forceLarger ? answer + limit + newOptions.size : (answer > newOptions.size + 1 ? answer - (newOptions.size + 1) : answer + 10);
        };

        if (targetPos === 0) {
            // Need 2 Larger
            newOptions.add(generateDistractor(true));
            newOptions.add(generateDistractor(true));
        } else if (targetPos === 2) {
            // Need 2 Smaller
            newOptions.add(generateDistractor(false));
            newOptions.add(generateDistractor(false));
        } else {
            // Need 1 Smaller, 1 Larger (Middle)
            newOptions.add(generateDistractor(false));
            newOptions.add(generateDistractor(true));
        }

        // Fill if failed (fallback)
        while (newOptions.size < 3) {
            newOptions.add(generateDistractor(true));
        }

        setCurrentProblem({
            a,
            b,
            answer,
            options: Array.from(newOptions).sort((x, y) => x - y),
            equation: `${a} - ${b} = ?`
        });

        setCurrentAnimal(prev => {
            let next;
            do {
                next = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
            } while (next === prev && ANIMALS.length > 1);
            return next;
        });
        setIsDiving(false);
        setDiveTargetIndex(null);
        setLastEvent(null);
        setQuestionStartTime(Date.now());

    }, [levelMode]);

    // Timer
    useEffect(() => {
        if (!gameState.isPlaying || gameState.gameOver || timeFrozen) return;

        const timer = setInterval(() => {
            setGameState(prev => {
                if (prev.timeLeft <= 0) {
                    return { ...prev, isPlaying: false, gameOver: true };
                }
                return { ...prev, timeLeft: prev.timeLeft - 1 };
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [gameState.isPlaying, gameState.gameOver, timeFrozen]);

    const startGame = useCallback(() => {
        setGameState({
            score: 0,
            lives: 3,
            timeLeft: 60,
            combo: 0,
            bestCombo: 0,
            difficultyLevel: 1,
            isPlaying: true,
            gameOver: false,
            stats: { correct: 0, wrong: 0 }
        });
        setProgression({ consecutiveCorrect: 0, consecutiveWrong: 0, totalCorrectInStage: 0 }); // Reset Progression
        // Reset Logic State
        setPowerUps({ timeFreeze: 0, extraLife: 0, doubleScore: 0 });
        setTimeFrozen(false);
        setDoubleScoreActive(false);
        setIsDiving(false);
        setDiveTargetIndex(null);
        setLastEvent(null);

        generateProblem(1); // Start with difficulty 1
    }, [generateProblem]);

    const stopTimer = useCallback(() => setGameState(prev => ({ ...prev, isPlaying: false })), []);

    const isProcessing = useRef(false);

    const handleAnswer = (selected: number, index: number) => {
        if (isDiving || isProcessing.current) return;

        // Lock
        isProcessing.current = true;

        // 1. Start Dive Animation to specific index
        setIsDiving(true);
        setDiveTargetIndex(index);
        // playButtonSound(); // REMOVED: Managed/Ignored

        // 2. Wait for dive to reach target
        setTimeout(() => {
            // 3. Check Answer
            if (selected === currentProblem?.answer) {
                setLastEvent({ id: Date.now(), type: 'correct' });
                setGameState(prev => {
                    const newCombo = prev.combo + 1;

                    // Score Calculation (Matched to MathArchery)
                    const responseTime = Date.now() - questionStartTime;
                    const baseScore = prev.difficultyLevel * 50;
                    const timeBonus = Math.max(0, 10 - Math.floor(responseTime / 1000)) * 5; // Max 50 pts
                    const comboBonus = prev.combo * 10;

                    const scoreBase = baseScore + timeBonus + comboBonus;
                    const finalScore = doubleScoreActive ? scoreBase * 2 : scoreBase;

                    let newDifficulty = prev.difficultyLevel;

                    // Progression Logic (Shared for Lv1 & Lv2)
                    const newConsecutiveCorrect = progression.consecutiveCorrect + 1;
                    const newTotalCorrect = progression.totalCorrectInStage + 1;

                    // Update Internal Progression State
                    setProgression(p => ({
                        ...p,
                        consecutiveCorrect: newConsecutiveCorrect,
                        totalCorrectInStage: newTotalCorrect,
                        consecutiveWrong: 0
                    }));

                    // Check Promotion (Shared Logic)
                    if (prev.difficultyLevel < PROGRESSION_CONFIG.MAX_DIFFICULTY &&
                        (newConsecutiveCorrect >= PROGRESSION_CONFIG.PROMOTION_STREAK ||
                            newTotalCorrect >= PROGRESSION_CONFIG.PROMOTION_TOTAL)) {
                        newDifficulty = prev.difficultyLevel + 1;
                        setProgression({ consecutiveCorrect: 0, consecutiveWrong: 0, totalCorrectInStage: 0 }); // Reset on promotion
                    }

                    return {
                        ...prev,
                        score: prev.score + finalScore,
                        combo: newCombo,
                        bestCombo: Math.max(prev.bestCombo, newCombo),
                        difficultyLevel: newDifficulty,
                        stats: { ...prev.stats, correct: prev.stats.correct + 1 }
                    };
                });

                // Power-Up Acquisition Logic
                if ((gameState.combo + 1) % 3 === 0 && Math.random() > 0.45) {
                    const types: (keyof typeof powerUps)[] = ['timeFreeze', 'extraLife', 'doubleScore'];
                    const type = types[Math.floor(Math.random() * types.length)];
                    setPowerUps(prev => ({ ...prev, [type]: prev[type] + 1 }));
                }

                // Next problem
                setTimeout(() => {
                    // Need to get latest difficulty for next problem
                    // Recalculate difficulty locally to pass to generateProblem
                    let nextDiff = gameState.difficultyLevel;

                    // Shared Logic for Next Difficulty Prediction (Lv1 & Lv2)
                    const newConsecutiveCorrect = progression.consecutiveCorrect + 1;
                    const newTotalCorrect = progression.totalCorrectInStage + 1;
                    if (gameState.difficultyLevel < PROGRESSION_CONFIG.MAX_DIFFICULTY &&
                        (newConsecutiveCorrect >= PROGRESSION_CONFIG.PROMOTION_STREAK ||
                            newTotalCorrect >= PROGRESSION_CONFIG.PROMOTION_TOTAL)) {
                        nextDiff = gameState.difficultyLevel + 1;
                    }

                    generateProblem(nextDiff);

                    // Add safety cooldown to prevent ghost clicks on new elements
                    setTimeout(() => {
                        isProcessing.current = false;
                    }, 300);
                }, ANIMATION_TIMING.NEXT_PROBLEM_DELAY);
            } else {
                setLastEvent({ id: Date.now(), type: 'wrong' });

                // Progression Logic (Wrong) - Shared Lv1 & Lv2
                setProgression(p => ({
                    consecutiveCorrect: 0,
                    consecutiveWrong: p.consecutiveWrong + 1,
                    totalCorrectInStage: p.totalCorrectInStage
                }));

                setGameState(prev => {
                    let newDifficulty = prev.difficultyLevel;

                    // Demotion Logic (Shared Lv1 & Lv2)
                    const currentWrongStreak = progression.consecutiveWrong + 1;

                    if (prev.difficultyLevel > 1 && currentWrongStreak >= PROGRESSION_CONFIG.DEMOTION_STREAK) {
                        newDifficulty = prev.difficultyLevel - 1;
                        setProgression({ consecutiveCorrect: 0, consecutiveWrong: 0, totalCorrectInStage: 0 }); // Reset on demotion
                    }

                    return {
                        ...prev,
                        lives: prev.lives - 1,
                        combo: 0,
                        difficultyLevel: newDifficulty,
                        gameOver: prev.lives - 1 <= 0,
                        stats: { ...prev.stats, wrong: prev.stats.wrong + 1 }
                    };
                });

                // Reset animal if game not over
                if (gameState.lives > 1) {
                    setTimeout(() => {
                        setIsDiving(false);
                        setDiveTargetIndex(null);
                        setLastEvent(null);
                        isProcessing.current = false; // Unlock after reset
                    }, ANIMATION_TIMING.RESET_DELAY);
                } else {
                    isProcessing.current = false; // Unlock if gameover (though inputs blocked by gameOver check usually)
                }
            }
        }, ANIMATION_TIMING.DIVE_DURATION); // Wait for dive
    };

    const usePowerUp = (type: 'freeze' | 'extraLife' | 'doubleScore') => {
        if (gameState.gameOver || !gameState.isPlaying) return;

        // playEatingSound(); // REMOVED: Managed/Ignored

        if (type === 'freeze' && powerUps.timeFreeze > 0 && !timeFrozen) {
            setPowerUps(prev => ({ ...prev, timeFreeze: prev.timeFreeze - 1 }));
            setTimeFrozen(true);
            setTimeout(() => setTimeFrozen(false), 5000);
        }
        else if (type === 'extraLife' && powerUps.extraLife > 0) {
            setPowerUps(prev => ({ ...prev, extraLife: prev.extraLife - 1 }));
            setGameState(prev => ({ ...prev, lives: prev.lives + 1 }));
        }
        else if (type === 'doubleScore' && powerUps.doubleScore > 0 && !doubleScoreActive) {
            setPowerUps(prev => ({ ...prev, doubleScore: prev.doubleScore - 1 }));
            setDoubleScoreActive(true);
            setTimeout(() => setDoubleScoreActive(false), 10000);
        }
    };

    return {
        ...gameState,
        currentProblem,
        currentAnimal,
        isDiving,
        startGame,
        stopTimer,
        handleAnswer,
        lastEvent,
        diveTargetIndex,
        powerUps,
        timeFrozen,
        doubleScoreActive,
        usePowerUp
    };
};
