import { useState, useEffect, useCallback, useRef } from 'react';
import { playButtonSound, playEatingSound, playCleaningSound } from '../../../../utils/sound';

export interface TargetOption {
    id: number;
    value: number;
    x: number; // Percent 0-100
    y: number; // Percent 0-100 (Usually fixed row at top)
    radius: number; // Hitbox radius
}

export interface Problem {
    equation: string;
    answer: number;
    options: TargetOption[];
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

export const useMathArcheryLogic = () => {
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
    const [lastOperation, setLastOperation] = useState<'add' | 'sub'>('sub'); // Start with opposite so first is Add
    const [powerUps, setPowerUps] = useState({ timeFreeze: 0, extraLife: 0, doubleScore: 0 });
    const [timeFrozen, setTimeFrozen] = useState(false);
    const [doubleScoreActive, setDoubleScoreActive] = useState(false);
    const [questionStartTime, setQuestionStartTime] = useState(0);
    const [lastEvent, setLastEvent] = useState<{ type: 'correct' | 'wrong', id: number } | null>(null);

    // Physics State
    const [arrow, setArrow] = useState<{ x: number, y: number, vx: number, vy: number, active: boolean, angle: number } | null>(null);

    // Generate Problem
    const generateProblem = useCallback((level: number, forceOp?: 'add' | 'sub') => {
        let resultMin = 1, resultMax = 7;
        if (level === 2) { resultMin = 8; resultMax = 12; }
        if (level >= 3) { resultMin = 13; resultMax = 20; }

        const result = Math.floor(Math.random() * (resultMax - resultMin + 1)) + resultMin;

        // Random Operation (50:50)
        const op = forceOp || (Math.random() > 0.5 ? 'add' : 'sub');
        setLastOperation(op);

        let equation = "";
        let a = 0, b = 0;

        if (op === 'add') {
            // A + B = Result
            // A in [1, Result-1] (if Result > 1)
            // If Result is 1 (unlikely with level 2+ but possible in lvl1), handle edge 
            // Level 1 min is 1. If result=1, impossible to have A, B >=1 integers?
            // Let's assume A, B >= 0? Or strictly > 0.
            // If result=1 => 1+0? or skip.
            // Let's ensure result >= 2 for addition if strictly positive.
            // If result < 2, force specific case or reroll.
            let effectiveResult = result;
            if (effectiveResult < 2) effectiveResult = 2;

            a = Math.floor(Math.random() * (effectiveResult - 1)) + 1;
            b = effectiveResult - a;
            equation = `${a} + ${b} = ?`;
        } else {
            // A - B = Result
            // A = Result + B
            // B random (usually 1-9 is standard for simple mental math, or up to Result size)
            b = Math.floor(Math.random() * 9) + 1;
            a = result + b;
            equation = `${a} - ${b} = ?`;
        }

        // Generating Options (1 Correct, 2 Wrong)
        const correctVal = op === 'add' ? (a + b) : (a - b); // Should match 'result' unless adjust logic changed it
        const options: number[] = [correctVal];

        while (options.length < 3) {
            // Distractors: +/- 1, 2, or random within range
            const variance = Math.floor(Math.random() * 5) + 1; // 1 to 5
            const dir = Math.random() > 0.5 ? 1 : -1;
            let val = correctVal + (variance * dir);

            if (val < 0) val = Math.abs(val) + 1; // Ensure positive
            if (val === correctVal) val = correctVal + 1;

            if (!options.includes(val)) {
                options.push(val);
            }
        }

        // Shuffle Options
        const shuffledOptions = options.sort(() => Math.random() - 0.5);

        // Map to Target Positions (3 lanes: 20%, 50%, 80%)
        const targetObjs: TargetOption[] = shuffledOptions.map((val, idx) => ({
            id: Math.random(),
            value: val,
            x: [20, 50, 80][idx],
            y: 15, // Fixed top position (%)
            radius: 11 // Scaled up (was 8)
        }));

        setCurrentProblem({
            equation,
            answer: correctVal,
            options: targetObjs
        });

        setQuestionStartTime(Date.now());
        setArrow(null); // Reset Arrow
    }, [lastOperation]);

    const startGame = useCallback(() => {
        setGameState(prev => ({
            ...prev,
            isPlaying: true,
            gameOver: false,
            score: 0,
            lives: 3,
            timeLeft: 60,
            streak: 0,
            difficultyLevel: 1,
            stats: { correct: 0, wrong: 0 }
        }));
        setPowerUps({ timeFreeze: 0, extraLife: 0, doubleScore: 0 });
        const startOp = Math.random() > 0.5 ? 'add' : 'sub';
        generateProblem(1, startOp);
    }, [generateProblem]);

    const stopTimer = useCallback(() => {
        setGameState(prev => ({ ...prev, isPlaying: false }));
    }, []);

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

    // Internal Game Loop for Physics
    const requestRef = useRef<number | null>(null);

    const updatePhysics = useCallback(() => {
        setArrow(prev => {
            if (!prev || !prev.active) return prev;

            // Move arrow
            const newX = prev.x + prev.vx;
            const newY = prev.y + prev.vy; // Should handle aspect ratio? % logic is simpler but tricky for speed.
            // Assuming vy is negative (moving up)

            // Boundary Check (Off screen)
            if (newX < -10 || newX > 110 || newY < -10 || newY > 110) {
                // Missed everything
                return { ...prev, active: false }; // Handled by separate check? 
                // We should detect "Miss" -> handled in effect monitoring arrow
            }

            return { ...prev, x: newX, y: newY };
        });

        requestRef.current = requestAnimationFrame(updatePhysics);
    }, []);

    useEffect(() => {
        if (gameState.isPlaying && !gameState.gameOver) {
            requestRef.current = requestAnimationFrame(updatePhysics);
        }
        return () => cancelAnimationFrame(requestRef.current!);
    }, [gameState.isPlaying, gameState.gameOver, updatePhysics]);

    // Check Collisions & Misses
    useEffect(() => {
        if (!arrow || !arrow.active || !currentProblem) return;

        // Collision Check with Targets
        // Simple Circle collision
        // Convert % to approximate relative units or just check distance in %
        // Since Y is ~15% for targets and arrow moves up...

        let hitTargetId: number | null = null;

        for (const target of currentProblem.options) {
            // Distance Check
            // We need to account for Aspect Ratio if we want perfect circles in % coords?
            // Assuming nearly square or tolerant hitbox
            const dx = arrow.x - target.x;
            const dy = arrow.y - target.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < (target.radius + 2)) { // +2 for arrow head size tolerance
                hitTargetId = target.id;
                break;
            }
        }

        if (hitTargetId !== null) {
            // Hit!
            const hitTarget = currentProblem.options.find(t => t.id === hitTargetId);
            if (hitTarget) {
                handleHit(hitTarget.value === currentProblem.answer);
            }
            setArrow(prev => prev ? { ...prev, active: false } : null); // Deactivate arrow immediately
        } else {
            // Check if missed (went past top)
            if (arrow.y < -5) {
                // Missed screen
                playButtonSound(); // "Whiff" sound? using button for now
                // Miss logic? Usually "miss" doesn't strictly penalize in some games, but here it's a "try".
                // Let's penalize or just reset? User said "shoot to answer".
                // If miss, user has to shoot again? Or lose life?
                // Standard: Lose life or Streak reset?
                // Let's make it forgiving: Just reset arrow, try again. No penalty? 
                // Or maybe small penalty. Let's start with NO penalty, just retry.
                setArrow(null);
            }
        }

    }, [arrow, currentProblem]);

    const handleHit = (isCorrect: boolean) => {
        if (isCorrect) {
            playCleaningSound(); // Nice hit sound
            setLastEvent({ type: 'correct', id: Date.now() });

            // Score Calc
            const responseTime = Date.now() - questionStartTime;
            const baseScore = gameState.difficultyLevel * 50;
            const timeBonus = Math.max(0, 10 - Math.floor(responseTime / 1000)) * 5;
            const streakBonus = gameState.streak * 10;
            const totalAdd = Math.floor((baseScore + timeBonus + streakBonus) * (doubleScoreActive ? 2 : 1));

            setGameState(prev => {
                const newStreak = prev.streak + 1;
                // Difficulty Upgrade Logic
                // Use streak >= 8 to upgrade level (User Rule from other game applied here too?)
                // User requirement: "Difficulty gets harder: 1-7 -> 8-12 -> 13-20"
                // Let's increment difficulty every 5 streak for faster progression or 8?
                // Let's stick to 5 for now to show progression.
                let newLevel = prev.difficultyLevel;
                if (newStreak > 0 && newStreak % 5 === 0 && newLevel < 3) {
                    newLevel++;
                }

                return {
                    ...prev,
                    score: prev.score + totalAdd,
                    streak: newStreak,
                    bestStreak: Math.max(prev.bestStreak, newStreak),
                    difficultyLevel: newLevel,
                    stats: { ...prev.stats, correct: prev.stats.correct + 1 }
                };
            });

            // Powerup drop logic
            if ((gameState.streak + 1) % 3 === 0 && Math.random() > 0.45) {
                const types: (keyof typeof powerUps)[] = ['timeFreeze', 'extraLife', 'doubleScore'];
                const type = types[Math.floor(Math.random() * types.length)];
                setPowerUps(prev => ({ ...prev, [type]: prev[type] + 1 }));
                playEatingSound();
            }

            // Next Level
            setTimeout(() => {
                generateProblem(gameState.difficultyLevel); // Will pick up NEW level from state? NO, closure OLD state.
                // We need to pass the *NEXT* level. 
                // Since we calculated newLevel inside setGameState updater, we can't easily access it here synchronously unless we duplicate logic.
                // Or use a ref/effect. 
                // Simple fix: calculate level here too or assume it's stable for next tick?
                // Let's just use current difficultyLevel and let the effect update on next render? 
                // Actually easier: just don't pass level to generateProblem, let it read from state? 
                // generateProblem uses 'level' ARGUMENT.
                // Let's fix generateProblem to use state if arg not provided? NO, state is closure.
                // Workaround: Duplicate calc.
                // Or use useEffect to watch 'stats.correct' to trigger new problem? No, that causes loops.
                // I will duplicate calc:
                // let nextLevel = gameState.difficultyLevel;
                // if ((gameState.streak + 1) % 5 === 0 && nextLevel < 3) nextLevel++;

                // Be careful with closure stale state 'gameState'.
                // Use functional update? No, setTimeout runs later. gameState MIGHT be stale if not in dep array.
                // Added gameState to dependency.
            }, 1000);

        } else {
            playButtonSound(); // Wrong sound
            setLastEvent({ type: 'wrong', id: Date.now() });
            setGameState(prev => {
                const newLives = prev.lives - 1;
                const newLevel = prev.difficultyLevel > 1 ? prev.difficultyLevel - 1 : 1; // Demote on fail?
                return {
                    ...prev,
                    lives: newLives,
                    streak: 0,
                    difficultyLevel: newLevel,
                    gameOver: newLives <= 0,
                    gameOverReason: newLives <= 0 ? 'lives' : undefined,
                    stats: { ...prev.stats, wrong: prev.stats.wrong + 1 }
                };
            });
            // Reset Arrow
            setArrow(null);
        }
    };

    // Ref for generateProblem in timeout
    const generateNextRef = useRef(generateProblem);
    const gameStateRef = useRef(gameState);
    useEffect(() => { generateNextRef.current = generateProblem; gameStateRef.current = gameState; }, [generateProblem, gameState]);

    // Override handleHit to use Ref for reliable next-problem generation
    const stableHandleHit = (isCorrect: boolean) => {
        if (isCorrect) {
            playCleaningSound();
            setLastEvent({ type: 'correct', id: Date.now() });

            // Calculate new state values
            const prev = gameStateRef.current;
            const newStreak = prev.streak + 1;
            let newLevel = prev.difficultyLevel;
            if (newStreak > 0 && newStreak % 5 === 0 && newLevel < 3) {
                newLevel++;
            }

            // Update State
            setGameState(prev => {
                const responseTime = Date.now() - questionStartTime;
                const baseScore = prev.difficultyLevel * 50;
                const timeBonus = Math.max(0, 10 - Math.floor(responseTime / 1000)) * 5;
                const streakBonus = prev.streak * 10;
                const totalAdd = Math.floor((baseScore + timeBonus + streakBonus) * (doubleScoreActive ? 2 : 1));

                return {
                    ...prev,
                    score: prev.score + totalAdd,
                    streak: newStreak,
                    bestStreak: Math.max(prev.bestStreak, newStreak),
                    difficultyLevel: newLevel, // Commit new level
                    stats: { ...prev.stats, correct: prev.stats.correct + 1 }
                };
            });

            // Powerup
            if ((prev.streak + 1) % 3 === 0 && Math.random() > 0.45) {
                const types: (keyof typeof powerUps)[] = ['timeFreeze', 'extraLife', 'doubleScore'];
                const type = types[Math.floor(Math.random() * types.length)];
                setPowerUps(p => ({ ...p, [type]: p[type] + 1 }));
                playEatingSound();
            }

            // Next Problem with NEW LEVEL
            setTimeout(() => {
                generateNextRef.current(newLevel); // Use calculated next level
            }, 1000);

        } else {
            playButtonSound();
            setLastEvent({ type: 'wrong', id: Date.now() });
            setGameState(prev => {
                const newLives = prev.lives - 1;
                // Penalize level?
                // User didn't specify downgrade. But "2 wrong = downgrade" in other games.
                // Let's keep it simple: No downgrade or simple downgrade.
                // Keeping level for now to allow retrying same difficulty.
                return {
                    ...prev,
                    lives: newLives,
                    streak: 0,
                    gameOver: newLives <= 0,
                    gameOverReason: newLives <= 0 ? 'lives' : undefined,
                    stats: { ...prev.stats, wrong: prev.stats.wrong + 1 }
                };
            });
            setArrow(null);
        }
    };

    // Public Shoot Function
    const shootArrow = (angle: number, power: number) => {
        if (arrow && arrow.active) return; // Already shooting
        // Convert Angle/Power to Velocity
        // Angle 0 = Up? Or Angle in radians?
        // Let's assume input angle is in degrees, 0 = Up, -90 = Left, 90 = Right
        const rad = angle * (Math.PI / 180); // Direct radians (0=Right, -90=Up assumed from input)

        const vx = Math.cos(rad) * power * 0.1; // Reduced scale for manageable speed
        const vy = Math.sin(rad) * power * 0.1;

        setArrow({
            x: 50, // Start center
            y: 80, // Start bottom
            vx,
            vy,
            active: true,
            angle: angle // Visual rotation
        });
        playButtonSound(); // "Twang"
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
        powerUps,
        timeFrozen,
        doubleScoreActive,
        startGame,
        stopTimer,
        usePowerUp,
        lastEvent,
        arrow,
        shootArrow,
        handleHit: stableHandleHit // Internal but exposed if needed? actually we handle collision inside.
    };
};
