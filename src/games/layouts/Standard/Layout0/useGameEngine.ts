import { useState, useEffect, useRef, useCallback } from 'react';

export type GameState = 'idle' | 'playing' | 'correct' | 'wrong' | 'gameover';
export type GameOverReason = 'time' | 'lives' | 'cleared' | null;

export interface GameEngineConfig {
    initialLives?: number;
    initialTime?: number;
    maxDifficulty?: number;
}

export const useGameEngine = (config: GameEngineConfig = {}) => {
    const { initialLives = 3, initialTime = 60, maxDifficulty = 3 } = config;

    // State
    const [gameState, setGameState] = useState<GameState>('idle');
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(initialLives);
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const [difficultyLevel, setDifficultyLevel] = useState(1);
    const [combo, setCombo] = useState(0);
    const [bestCombo, setBestCombo] = useState(0);
    const [stats, setStats] = useState({ correct: 0, wrong: 0 });

    // Internal counters
    const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
    const [consecutiveWrong, setConsecutiveWrong] = useState(0);
    const [gameOverReason, setGameOverReason] = useState<GameOverReason>(null);
    const [achievements, setAchievements] = useState({
        firstCorrect: false,
        lightningSpeed: false,
        comboMaster: false,
        master: false
    });

    const timerRef = useRef<number | undefined>(undefined);
    const [deadline, setDeadline] = useState<number | null>(null);
    const [questionStartTime, setQuestionStartTime] = useState<number>(0);
    const [isTimeFrozen, setIsTimeFrozen] = useState(false);
    const [lastEvent, setLastEvent] = useState<{ id: number; type: 'correct' | 'wrong'; isFinal?: boolean } | null>(null);

    const registerEvent = useCallback((event: { type: 'correct' | 'wrong'; isFinal?: boolean }) => {
        setLastEvent({ ...event, id: Date.now() });
    }, []);

    const updateScore = useCallback((amount: number) => setScore(prev => prev + amount), []);
    const updateLives = useCallback((param: boolean | number) => {
        if (typeof param === 'boolean') {
            if (!param) setLives(prev => {
                const newLives = prev - 1;
                if (newLives <= 0) {
                    setGameOverReason('lives');
                    setTimeout(() => setGameState('gameover'), 1500);
                }
                return newLives;
            });
        } else {
            setLives(param);
        }
    }, []);
    const updateCombo = useCallback((hit: boolean) => {
        if (hit) {
            setCombo(prev => {
                const n = prev + 1;
                setBestCombo(b => Math.max(b, n));
                return n;
            });
        } else {
            setCombo(0);
        }
    }, []);

    // Timer Logic
    useEffect(() => {
        if (gameState !== 'playing' || !deadline) {
            if (timerRef.current) cancelAnimationFrame(timerRef.current);
            return;
        }

        const loop = () => {
            if (!isTimeFrozen) {
                const remaining = deadline - Date.now();
                const newTimeLeft = Math.max(0, Math.ceil(remaining / 1000));
                setTimeLeft(newTimeLeft);

                if (remaining <= 0) {
                    setGameOverReason('time');
                    setGameState('gameover');
                    return;
                }
            }
            timerRef.current = requestAnimationFrame(loop);
        };
        timerRef.current = requestAnimationFrame(loop);
        return () => { if (timerRef.current) cancelAnimationFrame(timerRef.current); };
    }, [gameState, deadline, isTimeFrozen]);

    const startGame = useCallback(() => {
        setGameState('playing');
        setScore(0);
        setLives(initialLives);
        setTimeLeft(initialTime);
        setDifficultyLevel(1);
        setCombo(0);
        setBestCombo(0);
        setGameOverReason(null);
        setDeadline(Date.now() + initialTime * 1000);
        setQuestionStartTime(Date.now());
        setAchievements({ firstCorrect: false, lightningSpeed: false, comboMaster: false, master: false });
        setStats({ correct: 0, wrong: 0 });
        setPowerUps({ timeFreeze: 0, extraLife: 0, doubleScore: 0 });
    }, [initialLives, initialTime]);

    const submitAnswer = useCallback((isCorrect: boolean, options: { skipCombo?: boolean; skipDifficulty?: boolean; skipFeedback?: boolean; scoreMultiplier?: number } = {}) => {
        const now = Date.now();
        const responseTime = now - questionStartTime;

        if (isCorrect) {
            // Update State (unless skipped)
            if (!options.skipFeedback) {
                setGameState('correct');
            }

            setStats(prev => ({ ...prev, correct: prev.correct + 1 }));

            let newCombo = combo;
            if (!options.skipCombo) {
                newCombo = combo + 1;
                setCombo(newCombo);
                setBestCombo(prev => Math.max(prev, newCombo));
            }

            // Difficulty Adjustment
            // Only count towards progression if difficulty update isn't skipped
            let newConsecutiveCorrect = consecutiveCorrect;
            if (!options.skipDifficulty) {
                newConsecutiveCorrect = consecutiveCorrect + 1;
                // Match MathArchery: Update every 5 consecutive correct answers
                if (difficultyLevel < maxDifficulty && newConsecutiveCorrect >= 5) {
                    setDifficultyLevel(prev => prev + 1);
                    setConsecutiveCorrect(0);
                } else {
                    setConsecutiveCorrect(newConsecutiveCorrect);
                }
            }
            setConsecutiveWrong(0);

            // Score Calculation
            let timeBonus = Math.max(0, 10 - Math.floor(responseTime / 1000)) * 5;
            // Combo Bonus - Use current combo (which might be unchanged if skipped)
            let comboBonus = combo * 10;
            let baseScore = difficultyLevel * 50;

            // Apply Multiplier (Double Score)
            let totalScore = baseScore + timeBonus + comboBonus;

            // Apply Manual Multiplier (e.g. for easy games)
            if (options.scoreMultiplier !== undefined) {
                totalScore *= options.scoreMultiplier;
            }

            if (isDoubleScore) totalScore *= 2;

            setScore(prev => prev + Math.floor(totalScore));

            // Achievements
            if (!achievements.firstCorrect) setAchievements(prev => ({ ...prev, firstCorrect: true }));
            if (responseTime < 3000) setAchievements(prev => ({ ...prev, lightningSpeed: true }));
            if (!options.skipCombo && newCombo >= 5) setAchievements(prev => ({ ...prev, comboMaster: true }));

        } else {
            setGameState('wrong');
            setStats(prev => ({ ...prev, wrong: prev.wrong + 1 }));
            setCombo(0); // Wrong answer always resets combo? Yes.
            setConsecutiveCorrect(0);
            setConsecutiveWrong(prev => prev + 1);
            setLives(prev => {
                const newLives = prev - 1;
                if (newLives <= 0) {
                    setGameOverReason('lives');
                    setTimeout(() => setGameState('gameover'), 1500);
                }
                return newLives;
            });

            // Difficulty Down
            if (consecutiveWrong >= 1 && difficultyLevel > 1) {
                setDifficultyLevel(prev => prev - 1);
                setConsecutiveWrong(0);
            }
        }

        // Reset for next question (if not gameover)
        // Skip restart timer if feedback was skipped (continuous play)
        if (lives > (isCorrect ? 0 : 1)) {
            if (isCorrect && options.skipFeedback) {
                // Just reset start time for next question tracking
                setQuestionStartTime(Date.now());
            } else {
                setTimeout(() => {
                    setGameState('playing');
                    setQuestionStartTime(Date.now());
                }, 1500);
            }
        }

    }, [combo, difficultyLevel, consecutiveCorrect, consecutiveWrong, achievements, maxDifficulty, lives, questionStartTime]);

    const [powerUps, setPowerUps] = useState({
        timeFreeze: 0,
        extraLife: 0,
        doubleScore: 0
    });
    const [isDoubleScore, setIsDoubleScore] = useState(false);

    // ... (existing code) ...

    const activatePowerUp = useCallback((type: 'timeFreeze' | 'extraLife' | 'doubleScore') => {
        if (powerUps[type] <= 0) return; // Prevent usage if count is 0

        setPowerUps(prev => ({ ...prev, [type]: prev[type] - 1 }));

        if (type === 'timeFreeze') {
            setIsTimeFrozen(true);
            setTimeout(() => setIsTimeFrozen(false), 5000);
        } else if (type === 'extraLife') {
            setLives(prev => Math.min(prev + 1, initialLives));
        } else if (type === 'doubleScore') {
            setIsDoubleScore(true);
            setTimeout(() => setIsDoubleScore(false), 10000);
        }
    }, [powerUps, initialLives]);

    // Note: submitAnswer updated to handle multiplier directly

    return {
        gameState,
        score,
        lives,
        timeLeft,
        difficultyLevel,
        combo,
        bestCombo,
        achievements,
        stats,
        gameOverReason,
        startGame,
        submitAnswer,
        activatePowerUp,
        lastEvent,
        registerEvent,
        updateScore,
        updateLives,
        updateCombo,
        // Exposed PowerUp State
        powerUps,
        isTimeFrozen,
        isDoubleScore,
        setPowerUps // Allow games to award powerups
    };
};
