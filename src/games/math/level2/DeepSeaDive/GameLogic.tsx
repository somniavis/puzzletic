import { useState, useEffect, useCallback } from 'react';
import { DIFFICULTY_CONFIG, ANIMALS, ANIMATION_TIMING } from './constants';
import { playEatingSound } from '../../../../utils/sound';

export interface Problem {
    a: number;
    b: number; // Subtrahend
    answer: number;
    options: number[];
    equation: string;
}

export const useDeepSeaLogic = () => {
    // Game State
    const [gameState, setGameState] = useState({
        score: 0,
        lives: 3,
        timeLeft: 60,
        streak: 0,
        bestStreak: 0,
        difficultyLevel: 1,
        isPlaying: false,
        gameOver: false,
        stats: { correct: 0, wrong: 0 }
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

    // Logic: Generate Subtraction Problem
    const generateProblem = useCallback((level: number) => {
        const config = DIFFICULTY_CONFIG[level as keyof typeof DIFFICULTY_CONFIG] || DIFFICULTY_CONFIG[3];

        // Generate A (Minuend)
        const a = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;

        // Generate B (Subtrahend)
        // Ensure result > 0
        let b = Math.floor(Math.random() * (a - 1)) + 1;

        // Adjust for "Borrowing" difficulty logic if possible (simple heuristic)
        const wantBorrow = Math.random() < config.borrowChance;
        const unitA = a % 10;

        if (wantBorrow && unitA < 9) {
            // Need unitB > unitA
            const unitB = Math.floor(Math.random() * (9 - unitA)) + (unitA + 1);
            // Reconstruct B: B must still be less than A
            const maxTensB = Math.floor((a - unitB) / 10);
            if (maxTensB >= 0) {
                const tensB = Math.floor(Math.random() * (maxTensB + 1));
                b = tensB * 10 + unitB;
                if (b === 0) b = unitB; // Avoid 0
            }
        }

        const answer = a - b;

        // Options Generation
        const options = new Set<number>();
        options.add(answer);

        while (options.size < 3) {
            const type = Math.random();
            let badOption = answer;

            if (type < 0.3) {
                badOption = answer + (Math.random() > 0.5 ? 10 : -10);
            } else if (type < 0.6) {
                badOption = answer + (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1);
            } else {
                // Reverse digits? e.g. 13 -> 31
                const s = answer.toString();
                if (s.length === 2) badOption = parseInt(s.split('').reverse().join(''));
                else badOption = answer + 1;
            }

            if (badOption > 0 && badOption < 100 && badOption !== answer) {
                options.add(badOption);
            } else {
                // Fallback
                options.add(answer + options.size + 1);
            }
        }

        setCurrentProblem({
            a,
            b,
            answer,
            options: Array.from(options).sort((x, y) => x - y),
            equation: `${a} - ${b} = ?`
        });

        // New Animal
        setCurrentAnimal(ANIMALS[Math.floor(Math.random() * ANIMALS.length)]);
        setIsDiving(false);
        setDiveTargetIndex(null);
        setLastEvent(null);

    }, []);

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

    const startGame = () => {
        setGameState({
            score: 0,
            lives: 3,
            timeLeft: 60,
            streak: 0,
            bestStreak: 0,
            difficultyLevel: 1,
            isPlaying: true,
            gameOver: false,
            stats: { correct: 0, wrong: 0 }
        });
        // Reset Logic State
        setPowerUps({ timeFreeze: 0, extraLife: 0, doubleScore: 0 });
        setTimeFrozen(false);
        setDoubleScoreActive(false);
        setIsDiving(false);
        setDiveTargetIndex(null);
        setLastEvent(null);

        generateProblem(1);
    };

    const stopTimer = () => setGameState(prev => ({ ...prev, isPlaying: false }));

    const handleAnswer = (selected: number, index: number) => {
        if (isDiving) return; // Prevent double click

        // 1. Start Dive Animation to specific index
        setIsDiving(true);
        setDiveTargetIndex(index);
        playEatingSound(); // Splash/Dive sound

        // 2. Wait for dive to reach target
        setTimeout(() => {
            // 3. Check Answer
            if (selected === currentProblem?.answer) {
                setLastEvent({ id: Date.now(), type: 'correct' });
                setGameState(prev => {
                    const newStreak = prev.streak + 1;
                    const newLevel = Math.min(3, Math.floor(newStreak / 5) + 1);
                    const scoreBase = (prev.difficultyLevel * 100) + (newStreak * 10);
                    const finalScore = doubleScoreActive ? scoreBase * 2 : scoreBase;
                    return {
                        ...prev,
                        score: prev.score + finalScore,
                        streak: newStreak,
                        bestStreak: Math.max(prev.bestStreak, newStreak),
                        difficultyLevel: newLevel,
                        stats: { ...prev.stats, correct: prev.stats.correct + 1 }
                    };
                });

                // Power-Up Acquisition Logic
                if ((gameState.streak + 1) % 3 === 0 && Math.random() > 0.45) {
                    const types: (keyof typeof powerUps)[] = ['timeFreeze', 'extraLife', 'doubleScore'];
                    const type = types[Math.floor(Math.random() * types.length)];
                    setPowerUps(prev => ({ ...prev, [type]: prev[type] + 1 }));
                }

                // Next problem
                setTimeout(() => {
                    generateProblem(gameState.difficultyLevel);
                }, ANIMATION_TIMING.NEXT_PROBLEM_DELAY);
            } else {
                setLastEvent({ id: Date.now(), type: 'wrong' });
                setGameState(prev => ({
                    ...prev,
                    lives: prev.lives - 1,
                    streak: 0,
                    gameOver: prev.lives - 1 <= 0,
                    stats: { ...prev.stats, wrong: prev.stats.wrong + 1 }
                }));

                // Reset animal if game not over
                if (gameState.lives > 1) {
                    setTimeout(() => {
                        setIsDiving(false);
                        setDiveTargetIndex(null);
                        setLastEvent(null); // Restore float animation
                    }, ANIMATION_TIMING.RESET_DELAY);
                }
            }
        }, ANIMATION_TIMING.DIVE_DURATION); // Wait for dive
    };

    const usePowerUp = (type: 'freeze' | 'extraLife' | 'doubleScore') => {
        if (gameState.gameOver || !gameState.isPlaying) return;

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
