import { useState, useRef, useCallback, useEffect } from 'react';
import { useGameEngine } from '../../../../layouts/Standard/Layout0/useGameEngine';

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
    diedAt?: number; // Time when death started
}

export interface Rocket {
    id: string;
    targetId: string;
    startX: number;
    startY: number;
    targetX: number;
    targetY: number;
    createdAt: number;
    arrivalTime: number; // For game loop impact check
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
    // Slower speeds: 60s / 50s / 40s crossing time
    slow: (115 / (60 * 60)),
    normal: (115 / (50 * 60)),
    fast: (115 / (40 * 60)),
    boss: (115 / (80 * 60))
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

    // Game State Refs (Source of Truth for Loop)
    const ufosRef = useRef<UFO[]>([]);
    const rocketsRef = useRef<Rocket[]>([]);
    const effectsRef = useRef<Effect[]>([]);

    // Power-Ups State
    const [powerUps, setPowerUps] = useState({ timeFreeze: 0, extraLife: 0, doubleScore: 0 });
    const [isTimeFrozen, setIsTimeFrozen] = useState(false);
    const [isDoubleScore, setIsDoubleScore] = useState(false);
    const [answerOptions, setAnswerOptions] = useState<number[]>([]);

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

            // Reset Refs
            ufosRef.current = [];
            rocketsRef.current = [];
            effectsRef.current = [];
            gameTimeRef.current = 0;
            lastSpawnTimeRef.current = -3000;

            // Reset State
            setUfos([]);
            setRockets([]);
            setEffects([]);
            setLockedUfoId(null);
            setAnswerOptions([]);

            // Reset PowerUps
            setPowerUps({ timeFreeze: 0, extraLife: 0, doubleScore: 0 });
            setIsTimeFrozen(false);
            setIsDoubleScore(false);
        }
        prevGameState.current = engine.gameState;
    }, [engine.gameState]);

    // Cleanup locked target if it dies or disappears
    useEffect(() => {
        if (lockedUfoId) {
            const target = ufos.find(u => u.id === lockedUfoId);
            // specific check: if missing or dying, unlock
            if (!target || target.isDying) {
                setLockedUfoId(null);
                setAnswerOptions([]);
            }
        }
    }, [ufos, lockedUfoId]);


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

        // --- Logic Update (Operate on Refs) ---

        let currentUfos = [...ufosRef.current];
        let currentRockets = [...rocketsRef.current];
        let currentEffects = [...effectsRef.current];

        // 1. Process Rockets
        const arrivedRockets = currentRockets.filter(r => r.arrivalTime <= gameTimeRef.current);
        const activeRockets = currentRockets.filter(r => r.arrivalTime > gameTimeRef.current);

        // Update Rockets Ref immediately (removing arrived ones)
        currentRockets = activeRockets;

        if (arrivedRockets.length > 0) {
            let scoreUpdate = 0;
            let correctEvent = false;

            arrivedRockets.forEach(rocket => {
                const targetIndex = currentUfos.findIndex(u => u.id === rocket.targetId);
                if (targetIndex === -1) return;

                const target = currentUfos[targetIndex];
                const newHp = target.hp - 1;

                currentEffects.push({
                    id: crypto.randomUUID(),
                    x: rocket.targetX,
                    y: rocket.targetY,
                    type: newHp <= 0 ? 'explosion' : 'hit',
                    createdAt: gameTimeRef.current
                });

                if (newHp <= 0) {
                    correctEvent = true;
                    scoreUpdate += (target.type === 'boss' ? 1000 : 100) * (isDoubleScore ? 2 : 1);

                    currentUfos[targetIndex] = {
                        ...target,
                        hp: 0,
                        isDying: true,
                        diedAt: gameTimeRef.current
                    };
                } else {
                    correctEvent = true;
                    currentUfos[targetIndex] = { ...target, hp: newHp };
                }
            });

            if (correctEvent) engineRef.current.registerEvent({ type: 'correct' });
            if (scoreUpdate > 0) engineRef.current.updateScore(scoreUpdate);
        }

        // 2. Move & Cleanup UFOs
        let lifeLost = false;
        currentUfos = currentUfos.map(u => {
            if (u.isDying && u.diedAt && (gameTimeRef.current - u.diedAt > 500)) return null;
            if (u.isDying) return u;

            const { x: nextX, y: nextY } = calculateUFOPosition(u, gameTimeRef.current);
            if (nextY >= GROUND_Y) {
                lifeLost = true;
                return null;
            }
            return { ...u, x: nextX, y: nextY };
        }).filter(Boolean) as UFO[];

        if (lifeLost) {
            engineRef.current.updateLives(false);
            engineRef.current.registerEvent({ type: 'wrong' });
        }

        // 3. Spawn Logic
        const elapsedSec = gameTimeRef.current / 1000;

        // Revised Progression: Cap at 6 (Elementary Level)
        // 0-20s: 3
        // 20-40s: 4
        // 40-60s: 5
        // 60s+: 6
        let targetCount = 3;
        if (elapsedSec >= 60) targetCount = 6;
        else if (elapsedSec >= 40) targetCount = 5;
        else if (elapsedSec >= 20) targetCount = 4;

        // Initial burst: If game just started (< 2s) and empty, ensure we spawn 3 scattered
        if (elapsedSec < 3 && currentUfos.length < 3) {
            targetCount = 3;
            // Allow instant spawn for the first 3
            if (gameTimeRef.current - lastSpawnTimeRef.current > 500) {
                lastSpawnTimeRef.current = -1000;
            }
        }

        const bossExists = currentUfos.some(u => u.type === 'boss');
        let didSpawn = false;

        if (elapsedSec >= 60 && !bossExists && Math.random() < 0.002) {
            const initialX = 50;
            currentUfos.push({
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
            didSpawn = true;
        } else if (currentUfos.length < targetCount) {
            // Adaptive Interval Logic
            let requiredInterval = 2500; // Standard Slow (2.5s)

            // If extremely low (0-1), speed up slightly (1.5s)
            if (currentUfos.length <= 1) requiredInterval = 1500;

            // If moderately low (missing 3+), medium speed (2s)
            else if (targetCount - currentUfos.length >= 3) requiredInterval = 2000;

            // First 5s startup: Fast (200ms)
            if (elapsedSec < 5 && currentUfos.length < 3) requiredInterval = 200;

            if (gameTimeRef.current - lastSpawnTimeRef.current > requiredInterval) {
                // Spawn!
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

                const lane = Math.floor(Math.random() * 3);
                let startX = 50;
                if (lane === 0) startX = 10 + Math.random() * 20;
                else if (lane === 1) startX = 40 + Math.random() * 20;
                else startX = 70 + Math.random() * 20;

                currentUfos.push({
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
                    baseX: startX,
                    isFlipped: Math.random() < 0.5
                });
                didSpawn = true;
            }
        }

        if (didSpawn) {
            lastSpawnTimeRef.current = gameTimeRef.current;
        }

        // 4. Cleanup Effects
        currentEffects = currentEffects.filter(e => gameTimeRef.current - e.createdAt < 800);

        // --- Commit to Refs & State ---
        ufosRef.current = currentUfos;
        rocketsRef.current = currentRockets;
        effectsRef.current = currentEffects;

        // Sync to React State for Render
        setUfos(currentUfos);
        setRockets(currentRockets);
        setEffects(currentEffects);

        frameRef.current = requestAnimationFrame(updateGame);
    }, [isDoubleScore]);

    // Start Loop
    useEffect(() => {
        frameRef.current = requestAnimationFrame(updateGame);
        return () => cancelAnimationFrame(frameRef.current);
    }, [updateGame]);

    /* REMATCHING TARGET SECTION: Auto-unlock handled in main effect above now */


    // --- Interactions ---

    const handleSelectUFO = (id: string) => {
        setLockedUfoId(id);

        // Generate Options ONCE on selection
        const target = ufosRef.current.find(u => u.id === id); // Read from Ref for latest
        if (target) {
            const ans = target.problem.a;
            const distractors = new Set<number>();
            while (distractors.size < 2) {
                const d = ans + Math.floor(Math.random() * 10) - 5;
                if (d !== ans && d > 0 && d < 100) distractors.add(d);
            }
            const opts = [ans, ...Array.from(distractors)];
            opts.sort(() => Math.random() - 0.5);
            setAnswerOptions(opts);
        }
    };

    const handleAnswer = (ans: number) => {
        if (!lockedUfoId) return;

        const target = ufosRef.current.find(u => u.id === lockedUfoId); // Read from Ref
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
            // Base choice on targetX relative to center screen
            if (predictedX > 55) visualType = 'right';
            else if (predictedX < 45) visualType = 'left';
            else visualType = 'center';

            const arrivalTime = gameTimeRef.current + flightTime; // Define arrival time
            const newRocket: Rocket = {
                id: crypto.randomUUID(),
                targetId: target.id,
                startX: 50,
                startY: 90,
                targetX: predictedX, // Use Predicted X
                targetY: predictedY,
                createdAt: gameTimeRef.current,
                arrivalTime, // New property
                visualType
            };

            // Update Rocket Ref & State
            rocketsRef.current.push(newRocket);
            setRockets([...rocketsRef.current]);

            setLockedUfoId(null);
            setAnswerOptions([]);

        } else {
            // Wrong
            engine.submitAnswer(false);
            engine.registerEvent({ type: 'wrong' });

            const newEffect: Effect = {
                id: crypto.randomUUID(),
                x: 50,
                y: 80,
                type: 'miss',
                createdAt: gameTimeRef.current
            };
            effectsRef.current.push(newEffect);
            setEffects([...effectsRef.current]);
        }
    };

    // --- Power-Ups Implementation ---
    // Acquisition Rule: Deep Sea Dive Style (Combo 3 -> 55% Chance)
    const prevCombo = useRef(0);
    useEffect(() => {
        const combo = engine.combo;
        // In Deep Sea Dive: (combo + 1) % 3 === 0. 
        // Logic there runs BEFORE state update, so it checks "next combo".
        // Here, we react to `engine.combo` changing. So `combo` IS the new combo.
        // So we check: combo > 0 && combo % 3 === 0.
        if (combo > prevCombo.current && combo % 3 === 0) {
            if (Math.random() > 0.45) { // 55% Chance (Matches Deep Sea: Math.random() > 0.45)
                const types: (keyof typeof powerUps)[] = ['timeFreeze', 'extraLife', 'doubleScore'];
                const type = types[Math.floor(Math.random() * types.length)];
                setPowerUps(prev => ({ ...prev, [type]: prev[type] + 1 }));
            }
        }
        prevCombo.current = combo;
    }, [engine.combo]);

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
        isDoubleScore,
        answerOptions // Expose to view
    };
};
