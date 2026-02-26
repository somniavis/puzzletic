import { useState, useEffect, useRef, useCallback } from 'react';

export type GameState = 'idle' | 'playing' | 'correct' | 'wrong' | 'gameover';
export type GameOverReason = 'time' | 'lives' | 'cleared' | null;

export interface GameEngineConfig {
    initialLives?: number;
    initialTime?: number;
    maxDifficulty?: number;
    difficultyThresholds?: {
        promoteStreak?: number; // Consecutive correct to promote
        promoteTotal?: number;  // Total correct at current level to promote
        demoteStreak?: number;  // Consecutive wrong to demote
    };
}

export const useGameEngine = (config: GameEngineConfig = {}) => {
    const {
        initialLives = 3,
        initialTime = 60,
        maxDifficulty = 3,
        difficultyThresholds = { promoteStreak: 5, promoteTotal: Infinity, demoteStreak: 1 }
    } = config;

    // Fill defaults for partial config
    const thresholds = {
        promoteStreak: difficultyThresholds.promoteStreak ?? 5,
        promoteTotal: difficultyThresholds.promoteTotal ?? Infinity,
        demoteStreak: difficultyThresholds.demoteStreak ?? 1
    };

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
    const [levelCorrect, setLevelCorrect] = useState(0); // Total correct at current level
    const [gameOverReason, setGameOverReason] = useState<GameOverReason>(null);
    const [achievements, setAchievements] = useState({
        firstCorrect: false,
        lightningSpeed: false,
        comboMaster: false,
        master: false
    });

    const timerRef = useRef<number | undefined>(undefined);
    const eventSeqRef = useRef(0);
    const [deadline, setDeadline] = useState<number | null>(null);
    const [questionStartTime, setQuestionStartTime] = useState<number>(0);
    const [isTimeFrozen, setIsTimeFrozen] = useState(false);
    const [lastEvent, setLastEvent] = useState<{ id: number; type: 'correct' | 'wrong'; isFinal?: boolean } | null>(null);

    const registerEvent = useCallback((event: { type: 'correct' | 'wrong'; isFinal?: boolean }) => {
        eventSeqRef.current += 1;
        setLastEvent({ ...event, id: eventSeqRef.current });
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
        setLives(initialLives);
        setTimeLeft(initialTime);
        setDifficultyLevel(1);
        setConsecutiveCorrect(0);
        setConsecutiveWrong(0);
        setLevelCorrect(0);
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
                const newLevelCorrect = levelCorrect + 1;

                // Promotion Check: ANY condition met
                const shouldPromote =
                    (newConsecutiveCorrect >= thresholds.promoteStreak) ||
                    (newLevelCorrect >= thresholds.promoteTotal);

                if (difficultyLevel < maxDifficulty && shouldPromote) {
                    setDifficultyLevel(prev => prev + 1);
                    setConsecutiveCorrect(0);
                    setLevelCorrect(0);
                } else {
                    setConsecutiveCorrect(newConsecutiveCorrect);
                    setLevelCorrect(newLevelCorrect);
                }
            } else {
                // If skipped, do we update counts? Usually NO for strict control.
                // But keeping 'consecutiveCorrect' same ensures streak is preserved across skipped steps if needed.
                // Actually, if skipped, we shouldn't increment counts towards progression.
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
            if ((consecutiveWrong + 1) >= thresholds.demoteStreak && difficultyLevel > 1) {
                setDifficultyLevel(prev => prev - 1);
                setConsecutiveWrong(0);
                setLevelCorrect(0); // Reset level progress on demotion
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
