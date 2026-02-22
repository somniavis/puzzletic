import { useState, useEffect, useCallback, useRef } from 'react';

export interface TargetOption {
    id: number;
    value: number;
    symbol: string;
    x: number; // Percent 0-100
    y: number; // Percent 0-100 (Usually fixed row at top)
    radius: number; // Hitbox radius
}

const generateLv1Problem = (_internalDifficulty: number, forceOp?: 'add' | 'sub') => {
    const op = forceOp || (Math.random() > 0.5 ? 'add' : 'sub');
    let a = 0, b = 0;

    if (op === 'add') {
        // Lv1: A + B <= 20
        const minResult = 2;
        const maxResult = 20;
        const result = Math.floor(Math.random() * (maxResult - minResult + 1)) + minResult;
        a = Math.floor(Math.random() * (result - 1)) + 1; // 1 ~ Result-1
        b = result - a;
    } else {
        // Lv1: A - B >= 0 (Positive?) -> "Subtraction within 20" usually means positive result
        // A <= 20
        a = Math.floor(Math.random() * 19) + 2; // 2 ~ 20 (Ensure result >= 0 and subtrahend >=1)
        b = Math.floor(Math.random() * (a - 1)) + 1; // 1 ~ A-1
    }
    return { a, b, op };
};

const generateLv2Problem = (_internalDifficulty: number, forceOp?: 'add' | 'sub') => {
    const op = forceOp || (Math.random() > 0.5 ? 'add' : 'sub');
    let a = 0, b = 0;

    if (op === 'add') {
        // Lv2: 2-digit + 1-digit <= 100
        // A: 10 ~ 90
        a = Math.floor(Math.random() * 81) + 10;
        // B: 1 ~ 9 (Ensure A+B <= 100)
        const maxB = Math.min(9, 100 - a);
        b = Math.floor(Math.random() * maxB) + 1;
    } else {
        // Lv2: 2-digit - 1-digit
        // A: 10 ~ 99
        a = Math.floor(Math.random() * 90) + 10;
        // B: 1 ~ 9
        b = Math.floor(Math.random() * 9) + 1;
        // Ensure result positive? Yes A >= 10, B <= 9. Always > 0.
    }
    return { a, b, op };
};

export interface Problem {
    equation: string;
    answer: number;
    targetSymbol: string;
    options: TargetOption[];
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
}

export const useMathArcheryLogic = (gameLevel: number = 1) => {
    const TARGET_START_OFFSET_X = -30;
    const TARGET_SPEED_PER_SEC = 18; // percent / sec
    const TARGET_SPEED_STEP = 1.2; // every 3-combo

    const TARGET_SYMBOLS = [
        '🔴', '🟠', '🟡', '🟢', '🔵', '🟣',
        '🟥', '🟧', '🟨', '🟩', '🟦', '🟪',
        '❤️', '🩷', '🧡', '💛', '💙', '💜'
    ];
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

    const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
    const [powerUps, setPowerUps] = useState({ timeFreeze: 0, extraLife: 0, doubleScore: 0 });
    const [timeFrozen, setTimeFrozen] = useState(false);
    const [doubleScoreActive, setDoubleScoreActive] = useState(false);
    const [lastEvent, setLastEvent] = useState<{ type: 'correct' | 'wrong', id: number } | null>(null);
    const [lastHitRingScore, setLastHitRingScore] = useState<number | null>(null);
    const [targetOffsetX, setTargetOffsetX] = useState(TARGET_START_OFFSET_X);

    // Physics State
    const [arrow, setArrow] = useState<{ x: number, y: number, vx: number, vy: number, active: boolean, angle: number } | null>(null);
    const [stuckArrow, setStuckArrow] = useState<{ targetId: number, xOffset: number, angle: number } | null>(null);
    const roundResolvedRef = useRef(false);
    const targetDirectionRef = useRef<1 | -1>(1);
    const stuckArrowTimerRef = useRef<number | null>(null);

    // Generate Problem
    const generateProblem = useCallback((internalDifficulty: number, forceOp?: 'add' | 'sub') => {
        let a: number, b: number, op: 'add' | 'sub';

        if (gameLevel === 1) {
            ({ a, b, op } = generateLv1Problem(internalDifficulty, forceOp));
        } else {
            ({ a, b, op } = generateLv2Problem(internalDifficulty, forceOp));
        }

        let equation = '';
        let correctVal = 0;

        if (op === 'add') {
            equation = `${a} + ${b} = ?`;
            correctVal = a + b;
        } else {
            equation = `${a} - ${b} = ?`;
            correctVal = a - b;
        }

        // Generating Options (1 Correct, 1 Wrong)
        const options: number[] = [correctVal];

        while (options.length < 2) {
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

        // Pick symbol pair (1 target, 1 decoy)
        const targetSymbol = TARGET_SYMBOLS[Math.floor(Math.random() * TARGET_SYMBOLS.length)];
        let wrongSymbol = targetSymbol;
        while (wrongSymbol === targetSymbol) {
            wrongSymbol = TARGET_SYMBOLS[Math.floor(Math.random() * TARGET_SYMBOLS.length)];
        }

        // Shuffle Options
        const shuffledOptions = options.sort(() => Math.random() - 0.5);

        // Map to Target Positions (2 lanes: 30%, 70%)
        const targetObjs: TargetOption[] = shuffledOptions.map((val, idx) => ({
            id: Math.random(),
            value: val,
            symbol: val === correctVal ? targetSymbol : wrongSymbol,
            x: [30, 70][idx],
            y: 15, // Fixed top position (%)
            // Hit radius in % coordinate space.
            // Tuned to match the visual target's largest ring (~94px diameter) on typical game-card widths.
            radius: 11
        }));

        setCurrentProblem({
            equation,
            answer: correctVal,
            targetSymbol,
            options: targetObjs
        });

        setArrow(null); // Reset Arrow
        setStuckArrow(null);
        if (stuckArrowTimerRef.current) {
            window.clearTimeout(stuckArrowTimerRef.current);
            stuckArrowTimerRef.current = null;
        }
        setTargetOffsetX(TARGET_START_OFFSET_X);
        setLastHitRingScore(null);
        roundResolvedRef.current = false;
        targetDirectionRef.current = 1;
    }, [gameLevel]);

    const startGame = useCallback(() => {
        setGameState(prev => ({
            ...prev,
            isPlaying: true,
            gameOver: false,
            score: 0,
            lives: 3,
            timeLeft: 60,
            combo: 0,
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

    // Target horizontal motion (left -> right). If it disappears, round fails.
    useEffect(() => {
        if (!gameState.isPlaying || gameState.gameOver || !currentProblem || roundResolvedRef.current) return;

        const leadTarget = [...currentProblem.options].sort((a, b) => b.x - a.x)[0];
        // Reverse when the front/right target touches the right edge.
        const rightTurnOffset = 100 - (leadTarget.x + leadTarget.radius);
        // Fail only after both targets pass the left edge:
        // right-most target's right edge <= 0.
        const leftExitOffset = -(leadTarget.x + leadTarget.radius);
        const speedTier = Math.floor(gameState.combo / 3);
        const currentTargetSpeed = TARGET_SPEED_PER_SEC * Math.pow(TARGET_SPEED_STEP, speedTier);

        let rafId = 0;
        let lastTs = performance.now();

        const step = (ts: number) => {
            // Stop immediately once the round is resolved (prevents 1-frame drift on hit feedback).
            if (roundResolvedRef.current) return;

            const dtSec = Math.max(0, (ts - lastTs) / 1000);
            lastTs = ts;

            setTargetOffsetX(prev => {
                if (roundResolvedRef.current) return prev;

                let next = prev + currentTargetSpeed * dtSec * targetDirectionRef.current;

                // 1) Go right to the end, then reverse.
                if (targetDirectionRef.current === 1 && next >= rightTurnOffset) {
                    next = rightTurnOffset;
                    targetDirectionRef.current = -1;
                }

                // 2) Come back left and disappear/fail after fully passing.
                if (targetDirectionRef.current === -1 && next <= leftExitOffset && !roundResolvedRef.current) {
                    stableHandleHit(false);
                    return leftExitOffset;
                }
                return next;
            });

            if (!roundResolvedRef.current) {
                rafId = requestAnimationFrame(step);
            }
        };

        rafId = requestAnimationFrame(step);
        return () => cancelAnimationFrame(rafId);
    }, [gameState.isPlaying, gameState.gameOver, gameState.combo, currentProblem]);

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
            // Horizontal-line based hit check:
            // judge on target's center horizontal line band and horizontal offset.
            const dx = arrow.x - (target.x + targetOffsetX);
            const dy = arrow.y - target.y;
            const hitRadius = target.radius;
            // Horizontal-line based check, but wide enough to match visible target diameter.
            const horizontalLineTolerance = hitRadius;
            const withinHorizontalBand = Math.abs(dy) <= horizontalLineTolerance;
            const withinHorizontalRange = Math.abs(dx) <= hitRadius;

            if (withinHorizontalBand && withinHorizontalRange) {
                hitTargetId = target.id;
                break;
            }
        }

        if (hitTargetId !== null) {
            // Hit!
            const hitTarget = currentProblem.options.find(t => t.id === hitTargetId);
            if (hitTarget) {
                const hitCenterX = hitTarget.x + targetOffsetX;
                const dx = Math.abs(arrow.x - hitCenterX);
                const wideHitRadius = hitTarget.radius;
                // Score by horizontal line offset only (target center line 기준).
                const ratio = Math.max(0, Math.min(1, dx / wideHitRadius));
                const ringScore =
                    ratio <= 0.33 ? 10 :
                        ratio <= 0.66 ? 8 : 6;
                setLastHitRingScore(ringScore);

                // Show hit feedback: arrow stuck in target for 300ms.
                setStuckArrow({
                    // Keep arrow relative to hit target center to avoid visual drift.
                    targetId: hitTarget.id,
                    xOffset: arrow.x - hitCenterX,
                    angle: arrow.angle
                });
                if (stuckArrowTimerRef.current) {
                    window.clearTimeout(stuckArrowTimerRef.current);
                }
                stuckArrowTimerRef.current = window.setTimeout(() => {
                    setStuckArrow(null);
                    stuckArrowTimerRef.current = null;
                }, 300);

                const isCorrectTarget = hitTarget.value === currentProblem.answer;
                stableHandleHit(isCorrectTarget, ringScore);
            }
            setArrow(prev => prev ? { ...prev, active: false } : null); // Deactivate arrow immediately
        } else {
            // Check if missed (went past top)
            if (arrow.y < -5) {
                // Missed screen
                // playButtonSound(); // REMOVED: Managed by Layout (could add 'miss' event if needed, but for now silent fail or wrong logic?)
                // Actually if missed, we should probably trigger 'wrong' if it counts as a miss, OR just reset.
                // Current logic just resets arrow. Let's keep it silent.
                setArrow(null);
            }
        }

    }, [arrow, currentProblem, targetOffsetX]);

    // Ref for generateProblem in timeout
    const generateNextRef = useRef(generateProblem);
    const gameStateRef = useRef(gameState);
    useEffect(() => { generateNextRef.current = generateProblem; gameStateRef.current = gameState; }, [generateProblem, gameState]);

    // Override handleHit to use Ref for reliable next-problem generation
    const stableHandleHit = (isCorrect: boolean, ringScore?: number) => {
        if (roundResolvedRef.current) return;
        roundResolvedRef.current = true;

        if (isCorrect) {
            // playCleaningSound(); // REMOVED
            setLastEvent({ type: 'correct', id: Date.now() });

            // Calculate new state values
            const prev = gameStateRef.current;
            const newCombo = prev.combo + 1;
            let newLevel = prev.difficultyLevel;
            if (newCombo > 0 && newCombo % 5 === 0 && newLevel < 3) {
                newLevel++;
            }

            // Update State
            setGameState(prev => {
                const ringBase = Math.max(6, Math.min(10, ringScore ?? 6));
                const totalAdd = (ringBase * 10) * (doubleScoreActive ? 2 : 1);

                return {
                    ...prev,
                    score: prev.score + totalAdd,
                    combo: newCombo,
                    bestCombo: Math.max(prev.bestCombo, newCombo),
                    difficultyLevel: newLevel, // Commit new level
                    stats: { ...prev.stats, correct: prev.stats.correct + 1 }
                };
            });

            // Powerup
            if ((prev.combo + 1) % 3 === 0 && Math.random() > 0.45) {
                const types: (keyof typeof powerUps)[] = ['timeFreeze', 'extraLife', 'doubleScore'];
                const type = types[Math.floor(Math.random() * types.length)];
                setPowerUps(p => ({ ...p, [type]: p[type] + 1 }));
                // playEatingSound(); // REMOVED
            }

            // Next Problem with NEW LEVEL
            setTimeout(() => {
                generateNextRef.current(newLevel); // Use calculated next level
            }, 1000);

        } else {
            // playButtonSound(); // REMOVED
            const prev = gameStateRef.current;
            const nextLives = prev.lives - 1;

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
                    combo: 0,
                    gameOver: newLives <= 0,
                    gameOverReason: newLives <= 0 ? 'lives' : undefined,
                    stats: { ...prev.stats, wrong: prev.stats.wrong + 1 }
                };
            });
            setArrow(null);

            // On failure, immediately proceed to next target set unless game is over.
            if (nextLives > 0) {
                setTimeout(() => {
                    generateNextRef.current(prev.difficultyLevel);
                }, 120);
            }
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
        // playButtonSound(); // REMOVED
        // Shooting sound is UI feedback, arguably logic layer shouldn't play it? 
        // Layout doesn't have a 'shoot' event. 
        // But removing it might make game feel silent on shoot.
        // User requested removing REDUNDANT sounds (correct/wrong). 
        // Shoot sound is unique. I should probably keep it OR trigger a custom event.
        // Since playButtonSound is imported from utils, using it here is consistent with UI layer if we consider this "User Action".
        // BUT user said "Remove redundant sounds". 
        // I'll keep shoot sound or move it to UI component? 
        // Logic handles "shootArrow" call. 
        // Ideally UI calls shootArrow AND plays sound.
        // But let's check index.tsx.
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
        targetOffsetX,
        lastHitRingScore,
        stuckArrow,
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
