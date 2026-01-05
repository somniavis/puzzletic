import { useState, useRef, useCallback, useEffect } from 'react';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';

type GameEngine = ReturnType<typeof useGameEngine>;

export interface Problem {
    q: string;
    a: number;
}

export type UFOType = 'slow' | 'normal' | 'fast' | 'boss';

export type MovementType = 'straight' | 'zigzag' | 'drift_left' | 'drift_right';

export interface UFO {
    id: string;
    x: number; // 0-100%
    y: number; // 0-100%
    speed: number; // % per tick (approx 60fps)
    type: UFOType;
    problem: Problem;
    hp: number;
    maxHp: number;
    spawnTime: number;
    movementPhase: number;
    movementType: MovementType;
    baseX: number; // Reference X for oscillation
    isDying?: boolean; // For death animation
    isFlipped?: boolean; // Visual variation
}

export interface Rocket {
    id: string;
    targetId: string;
    startX: number;
    startY: number;
    targetX: number;
    targetY: number;
    createdAt: number;
    visualType: 'right' | 'left' | 'center';
}

export interface Effect {
    id: string;
    x: number;
    y: number;
    type: 'explosion' | 'hit' | 'miss';
    createdAt: number;
}

const TICK_RATE = 16;
const GROUND_Y = 90; // Impact zone
const SPAWN_Y = 25; // Start lower (25% down) to avoid waiting

// Difficulty / Speed Config
// Descent duration: Slower (multiplied speed by 0.9)
const SPEEDS = {
    slow: (115 / (35 * 60)) * 0.9,
    normal: (115 / (25 * 60)) * 0.9,
    fast: (115 / (18 * 60)) * 0.9,
    boss: (115 / (60 * 60)) * 0.9
};

const HP_CONFIG = {
    slow: 1,
    normal: 1,
    fast: 1,
    boss: 3
};

export const useUFOInvasionLogic = (engine: GameEngine) => {
    const [ufos, setUfos] = useState<UFO[]>([]);
    const [rockets, setRockets] = useState<Rocket[]>([]);
    const [effects, setEffects] = useState<Effect[]>([]);
    const [lockedUfoId, setLockedUfoId] = useState<string | null>(null);

    // Power-Ups State
    const [powerUps, setPowerUps] = useState({ timeFreeze: 0, extraLife: 0, doubleScore: 0 });
    const [isTimeFrozen, setIsTimeFrozen] = useState(false);
    const [isDoubleScore, setIsDoubleScore] = useState(false);

    // Refs for loop state
    const gameTimeRef = useRef(0);
    const lastSpawnTimeRef = useRef(0);
    const frameRef = useRef<number>(0);
    const engineRef = useRef(engine);

    // Sync engine ref for loop access
    useEffect(() => { engineRef.current = engine; }, [engine]);

    // Reset local state on Game Start/Restart
    const prevGameState = useRef(engine.gameState);
    useEffect(() => {
        // Only reset if coming from specific non-playing states (idle or gameover)
        // implying a fresh start. Transitions from 'wrong' or 'correct' should NOT reset.
        const wasStopped = prevGameState.current === 'idle' || prevGameState.current === 'gameover';
        const isNowPlaying = engine.gameState === 'playing';

        if (wasStopped && isNowPlaying) {
            console.log("Game Restarted: Resetting UFO Logic");
            setUfos([]);
            setRockets([]);
            setEffects([]);
            setLockedUfoId(null);

            // Reset PowerUps
            setPowerUps({ timeFreeze: 0, extraLife: 0, doubleScore: 0 });
            setIsTimeFrozen(false);
            setIsDoubleScore(false);

            gameTimeRef.current = 0;
            lastSpawnTimeRef.current = 0;
        }
        prevGameState.current = engine.gameState;
    }, [engine.gameState]);

    // --- Math Generation ---
    const generateProblem = (type: UFOType): Problem => {
        const isAddition = Math.random() > 0.5;
        let n1, n2, ans;

        if (type === 'slow') {
            // Early: 2-digit +/- 1-digit (Lower range 2-digit)
            // Range: 10~30 +/- 1~9
            n1 = Math.floor(Math.random() * 21) + 10; // 10-30
            n2 = Math.floor(Math.random() * 9) + 1;   // 1-9
        } else if (type === 'normal') {
            // Mid: 2-digit +/- 2-digit (Mid range)
            // Range: 20~60 +/- 10~29
            n1 = Math.floor(Math.random() * 41) + 20; // 20-60
            n2 = Math.floor(Math.random() * 20) + 10; // 10-29
        } else {
            // Fast/Boss: 2-digit +/- 2-digit (High range)
            // Range: 50~99 +/- 10~49
            n1 = Math.floor(Math.random() * 50) + 50; // 50-99
            n2 = Math.floor(Math.random() * 40) + 10; // 10-49
        }

        if (isAddition) {
            ans = n1 + n2;
            return { q: `${n1} + ${n2} = ?`, a: ans };
        } else {
            // Ensure positive result for subtraction
            if (n1 < n2) {
                // Swap to ensure n1 >= n2
                const temp = n1;
                n1 = n2;
                n2 = temp;
            }
            ans = n1 - n2;
            return { q: `${n1} - ${n2} = ?`, a: ans };
        }
    };

    // --- Helper: Movement Math ---
    // Make position strictly time-deterministic to ensure prediction matches reality regardless of framerate
    const calculateUFOPosition = (u: UFO, timeMs: number): { x: number, y: number } => {
        const timeFactor = timeMs * 0.001; // Seconds
        // elapsed time since spawn (used for drift/y)
        const elapsedSinceSpawn = u.spawnTime > 0 ? (timeMs - u.spawnTime) : 0;

        let nextX = u.x;

        // Horizontal Movement (X)
        if (u.type === 'boss') {
            nextX = u.baseX + Math.sin(timeFactor * 0.5 + u.movementPhase) * 25;
        } else {
            switch (u.movementType) {
                case 'zigzag':
                    nextX = u.baseX + Math.sin(timeFactor * 0.8 + u.movementPhase) * 15;
                    break;
                case 'drift_left':
                    // Drift uses seconds
                    nextX = u.baseX - (elapsedSinceSpawn / 1000) * 1.5 + Math.sin(timeFactor * 2 + u.movementPhase) * 2;
                    break;
                case 'drift_right':
                    nextX = u.baseX + (elapsedSinceSpawn / 1000) * 1.5 + Math.sin(timeFactor * 2 + u.movementPhase) * 2;
                    break;
                case 'straight':
                default:
                    nextX = u.baseX + Math.sin(timeFactor * 0.5 + u.movementPhase) * 2;
                    break;
            }
        }

        // Clamp X
        if (nextX < 2) nextX = 2;
        if (nextX > 98) nextX = 98;

        // Vertical Movement (Y)
        // u.speed is defined as "% per tick (16ms)". 
        // We convert elapsed time to 'ticks' to apply speed consistently.
        const elapsedTicks = elapsedSinceSpawn / 16;
        const nextY = SPAWN_Y + (u.speed * elapsedTicks); // SPAWN_Y is 25

        return { x: nextX, y: nextY };
    };

    // --- Core Loop ---
    const lastFrameTimeRef = useRef<number>(0);

    const updateGame = useCallback((timestamp: number) => {
        if (engineRef.current.gameState !== 'playing') {
            frameRef.current = requestAnimationFrame(updateGame);
            lastFrameTimeRef.current = timestamp; // Keep sync
            return;
        }

        if (lastFrameTimeRef.current === 0) {
            lastFrameTimeRef.current = timestamp;
        }

        const dt = timestamp - lastFrameTimeRef.current;
        lastFrameTimeRef.current = timestamp;

        gameTimeRef.current += dt;

        setUfos(prev => {
            let nextUfos = [...prev];
            let lifeLost = false;

            // 1. Move
            nextUfos = nextUfos.map(u => {
                // Calculate position based on absolute GameTime
                const { x: nextX, y: nextY } = calculateUFOPosition(u, gameTimeRef.current);

                // Check Ground Impact
                if (nextY >= GROUND_Y) {
                    lifeLost = true;
                    return null; // Remove
                }
                return { ...u, x: nextX, y: nextY };
            }).filter(Boolean) as UFO[];

            if (lifeLost) {
                engineRef.current.updateLives(false);
                engineRef.current.registerEvent({ type: 'wrong' }); // Shake effect
            }

            // 2. Spawn Logic (OMITTED for brevity in replacement, assuming it matches existing logic flow or I need to preserve it carefully)
            // ... explicit spawn logic matching previous ... 
            // Wait, I am replacing the whole block. I must include Spawn Logic.

            const elapsedSec = gameTimeRef.current / 1000;
            let targetCount = 3;
            if (elapsedSec >= 10) targetCount = 5;
            if (elapsedSec >= 30) targetCount = 7;
            if (elapsedSec >= 60) targetCount = 9;

            if (targetCount > 8) targetCount = 8;

            const bossExists = nextUfos.some(u => u.type === 'boss');
            if (elapsedSec >= 60 && !bossExists && Math.random() < 0.005) {
                const initialX = 50;
                nextUfos.push({
                    id: crypto.randomUUID(),
                    x: initialX,
                    y: SPAWN_Y,
                    speed: SPEEDS.boss,
                    type: 'boss',
                    problem: generateProblem('boss'),
                    hp: HP_CONFIG.boss,
                    maxHp: HP_CONFIG.boss,
                    spawnTime: gameTimeRef.current,
                    movementPhase: Math.random() * 10,
                    movementType: 'straight',
                    baseX: initialX,
                    isFlipped: Math.random() < 0.5
                });
            } else if (nextUfos.length < targetCount) {
                if (gameTimeRef.current - lastSpawnTimeRef.current > 3500) {
                    let type: UFOType = 'slow';
                    const rand = Math.random();
                    if (elapsedSec < 20) type = 'slow';
                    else if (elapsedSec < 60) type = rand > 0.6 ? 'normal' : 'slow';
                    else {
                        if (rand > 0.8) type = 'fast';
                        else if (rand > 0.4) type = 'normal';
                        else type = 'slow';
                    }

                    const moveRand = Math.random();
                    let movement: MovementType = 'zigzag';
                    if (moveRand < 0.4) movement = 'zigzag';
                    else if (moveRand < 0.7) movement = Math.random() > 0.5 ? 'drift_left' : 'drift_right';
                    else movement = 'straight';

                    // Lane Logic: Pick a random lane index (0, 1, 2)
                    // Lane 0: 10-30%
                    // Lane 1: 40-60%
                    // Lane 2: 70-90%
                    // This ensures broad distribution but allows randomness within lanes
                    const lane = Math.floor(Math.random() * 3);
                    let startX = 50;
                    if (lane === 0) startX = 10 + Math.random() * 20; // 10-30
                    else if (lane === 1) startX = 40 + Math.random() * 20; // 40-60
                    else startX = 70 + Math.random() * 20; // 70-90

                    // Minor adjustment to prevent complete predictability if same lane picked twice
                    // (Already handled by Math.random() * 20)

                    nextUfos.push({
                        id: crypto.randomUUID(),
                        x: startX,
                        y: SPAWN_Y,
                        speed: SPEEDS[type],
                        type: type,
                        problem: generateProblem(type),
                        hp: HP_CONFIG[type],
                        maxHp: HP_CONFIG[type],
                        spawnTime: gameTimeRef.current,
                        movementPhase: Math.random() * 10,
                        movementType: movement,
                        baseX: startX
                    });
                    lastSpawnTimeRef.current = gameTimeRef.current;
                }
            }

            return nextUfos;
        });

        // Cleanup Effects only (Rockets handled by impact)
        setEffects(prev => prev.filter(e => gameTimeRef.current - e.createdAt < 800));
        // Safety cleanup for rockets just in case?
        setRockets(prev => prev.filter(r => gameTimeRef.current - r.createdAt < 5000));

        frameRef.current = requestAnimationFrame(updateGame);
    }, []);

    // Start Loop
    useEffect(() => {
        frameRef.current = requestAnimationFrame(updateGame);
        return () => cancelAnimationFrame(frameRef.current);
    }, [updateGame]);

    // Auto-unlock if target destroyed
    useEffect(() => {
        setLockedUfoId(prev => {
            if (!prev) return null;
            return prev;
        });
    }, [ufos]);


    // --- Interactions ---

    const handleSelectUFO = (id: string) => {
        setLockedUfoId(id);
    };

    const handleAnswer = (ans: number) => {
        if (!lockedUfoId) return;

        const target = ufos.find(u => u.id === lockedUfoId);
        if (!target) return;

        if (ans === target.problem.a) {
            // Correct
            engine.submitAnswer(true, { skipFeedback: true });

            // Visual Rocket Logic
            const flightTime = 2300;
            const flightTicks = flightTime / TICK_RATE;

            // Predict Y (Linear Speed)
            const predictedY = target.y + (target.speed * flightTicks);

            // Predict X (Using Helper with future time)
            const futureTime = gameTimeRef.current + flightTime;
            const { x: predictedX } = calculateUFOPosition(target, futureTime);

            // Calculate Visual Orientation based on PREDICTED position vs Start(50)
            let visualType: 'right' | 'left' | 'center' = 'right';
            // Start is 50. If target X < 45 -> Left.
            // CAUTION: Visual logic was: 
            // - Right: Standard
            // - Left: Flip
            // - Center: Tilt
            // Base choice on targetX relative to center screen
            if (predictedX > 55) visualType = 'right';
            else if (predictedX < 45) visualType = 'left';
            else visualType = 'center';

            const rocketId = crypto.randomUUID();
            setRockets(prev => [...prev, {
                id: rocketId,
                targetId: target.id,
                startX: 50,
                startY: 90,
                targetX: predictedX, // Use Predicted X
                targetY: predictedY,
                createdAt: gameTimeRef.current,
                visualType
            }]);

            // Delay Impact Logic
            setTimeout(() => {
                // remove rocket explicitly
                setRockets(prev => prev.filter(r => r.id !== rocketId));

                setUfos(currentUfos => {
                    const currentTarget = currentUfos.find(u => u.id === target.id);
                    if (!currentTarget) return currentUfos;

                    const newHp = currentTarget.hp - 1;

                    // Register Effect at ACTUAL impact location (predicted vs current might differ slightly, best use current)
                    // Or use the predicted location where the rocket is visually?
                    // Let's use the rocket's target location for visual consistency
                    setEffects(prev => [...prev, {
                        id: crypto.randomUUID(),
                        x: predictedX,
                        y: predictedY,
                        type: newHp <= 0 ? 'explosion' : 'hit',
                        createdAt: gameTimeRef.current + flightTime // Time reference might be stale? No, effects cleanup uses delta.
                    }]);

                    // ... same logic ...
                    if (newHp <= 0) {
                        engine.registerEvent({ type: 'correct' });

                        if (currentTarget.type === 'boss') {
                            const points = 1000 * (isDoubleScore ? 2 : 1);
                            engine.updateScore(points);
                        } else {
                            const points = 100 * (isDoubleScore ? 2 : 1);
                            engine.updateScore(points);
                        }

                        const dyingUfos = currentUfos.map(u => u.id === target.id ? { ...u, hp: 0, isDying: true } : u);

                        setTimeout(() => {
                            setUfos(prev => prev.filter(u => u.id !== target.id));
                        }, 500);

                        return dyingUfos;

                    } else {
                        engine.registerEvent({ type: 'correct' });
                        return currentUfos.map(u => u.id === target.id ? { ...u, hp: newHp } : u);
                    }
                });
            }, flightTime);

            setLockedUfoId(null);

        } else {
            // Wrong
            engine.submitAnswer(false);
            engine.registerEvent({ type: 'wrong' });

            setEffects(prev => [...prev, {
                id: crypto.randomUUID(),
                x: 50,
                y: 80,
                type: 'miss',
                createdAt: gameTimeRef.current
            }]);
        }
    };

    // --- Power-Ups Implementation ---
    // State moved to top

    // Acquisition Rule: Deep Sea Dive Style (Streak 3 -> 55% Chance)
    const prevStreak = useRef(0);
    useEffect(() => {
        const streak = engine.streak;
        // In Deep Sea Dive: (streak + 1) % 3 === 0. 
        // Logic there runs BEFORE state update, so it checks "next streak".
        // Here, we react to `engine.streak` changing. So `streak` IS the new streak.
        // So we check: streak > 0 && streak % 3 === 0.
        if (streak > prevStreak.current && streak % 3 === 0) {
            if (Math.random() > 0.45) { // 55% Chance (Matches Deep Sea: Math.random() > 0.45)
                const types: (keyof typeof powerUps)[] = ['timeFreeze', 'extraLife', 'doubleScore'];
                const type = types[Math.floor(Math.random() * types.length)];
                setPowerUps(prev => ({ ...prev, [type]: prev[type] + 1 }));
            }
        }
        prevStreak.current = streak;
    }, [engine.streak]);

    const activatePowerUp = (type: keyof typeof powerUps) => {
        if (powerUps[type] <= 0) return;

        if (type === 'timeFreeze' && !isTimeFrozen) {
            setPowerUps(prev => ({ ...prev, timeFreeze: prev.timeFreeze - 1 }));
            setIsTimeFrozen(true);
            engine.activatePowerUp('timeFreeze');
            setTimeout(() => setIsTimeFrozen(false), 5000); // Visual sync
        }
        else if (type === 'extraLife') {
            setPowerUps(prev => ({ ...prev, extraLife: prev.extraLife - 1 }));
            engine.activatePowerUp('extraLife');
        }
        else if (type === 'doubleScore' && !isDoubleScore) {
            setPowerUps(prev => ({ ...prev, doubleScore: prev.doubleScore - 1 }));
            setIsDoubleScore(true);
            engine.activatePowerUp('doubleScore');
            setTimeout(() => setIsDoubleScore(false), 10000);
        }
    };

    const currentLockedUfo = ufos.find(u => u.id === lockedUfoId) || null;

    return {
        ufos,
        handleAnswer,
        rockets,
        effects,
        currentLockedUfo,
        handleSelectUFO,
        powerUps,
        activatePowerUp,
        isTimeFrozen,
        isDoubleScore
    };
};
