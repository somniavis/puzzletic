
import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';

// Constants (Relaxed Difficulty)
const SPEED_BASE = 2.0; // Base Rotation Speed (slower start)
const TARGET_TOLERANCE = 20; // Degrees (+/-) - wider hit zone

// Emoji Pool: Fruits + Animal Faces
const EMOJI_POOL = [
    // Fruits (10)
    '🍎', '🍌', '🍇', '🍓', '🍒', '🍑', '🍍', '🥥', '🥝', '🍅',
    // Animal Faces (10)
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯'
];

export const useSignalHunterLogic = () => {
    const engine = useGameEngine({
        initialTime: 90,
        initialLives: 3
    });

    const [codes, setCodes] = useState<string[]>([]); // Sequence of emojis to unlock
    const [currentCodeIdx, setCurrentCodeIdx] = useState(0);

    // Physics State
    const [needleAngle, setNeedleAngle] = useState(0);
    const [targetAngle, setTargetAngle] = useState(0);
    const [decoys, setDecoys] = useState<{ angle: number; emoji: string }[]>([]); // Decoy items
    const [direction, setDirection] = useState(1); // 1 or -1
    const [isRotating, setIsRotating] = useState(false);

    // Local difficulty tracking (increments every 2 rounds for slower progression)
    const [localDifficulty, setLocalDifficulty] = useState(1);
    const [roundsCleared, setRoundsCleared] = useState(0); // Track rounds for difficulty progression
    const lastGameStateRef = useRef<string>('idle');

    const spawnTarget = useCallback((targetEmoji: string, difficulty: number, prevTargetAngle: number | null) => {
        // 1. Determine Counts
        // Level 1-2: 1 decoy, Level 3-4: 2 decoys, Level 5+: 3 decoys
        const decoyCount = Math.min(1 + Math.floor(difficulty / 2), 3);
        const totalItems = 1 + decoyCount;

        // 2. Generate Random Angles
        const validAngles: number[] = [];
        const MIN_SEPARATION = 40; // Min dist between items
        const PREV_TARGET_BUFFER = 40; // Min dist from PREVIOUS target (to prevent double-tap)

        // Try to find valid configuration
        let attempts = 0;
        // Reset if we get stuck (rare, but prevents infinite loop)
        while (validAngles.length < totalItems && attempts < 100) {
            const angle = Math.random() * 360;
            let isValid = true;

            // Check vs Previous Target (if exists)
            if (prevTargetAngle !== null) {
                let dist = Math.abs(angle - prevTargetAngle);
                if (dist > 180) dist = 360 - dist;
                if (dist < PREV_TARGET_BUFFER) isValid = false;
            }

            // Check vs Other generated items in this batch
            if (isValid) {
                for (const existing of validAngles) {
                    let dist = Math.abs(angle - existing);
                    if (dist > 180) dist = 360 - dist;
                    if (dist < MIN_SEPARATION) {
                        isValid = false;
                        break;
                    }
                }
            }

            if (isValid) {
                validAngles.push(angle);
            }

            attempts++;
            // detailed fail-safe: if we tried too many times for one item, maybe clear and retry or just accept fewer decoys?
            // For simplicity, if we really struggle (density high), we just break and spawn what we have, 
            // but 360 degrees usually fits 4 items easily.
        }

        // 3. Shuffle Angles to assign Target randomly
        // Fisher-Yates Shuffle
        for (let i = validAngles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [validAngles[i], validAngles[j]] = [validAngles[j], validAngles[i]];
        }

        // Assign Target to the first angle in the shuffled list
        const newTargetAngle = validAngles[0];
        setTargetAngle(newTargetAngle);

        // 4. Assign Decoys to the rest
        const newDecoys: { angle: number; emoji: string }[] = [];
        for (let i = 1; i < validAngles.length; i++) {
            // Pick distinct emoji
            let decoyEmoji = EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)];
            while (decoyEmoji === targetEmoji) {
                decoyEmoji = EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)];
            }
            newDecoys.push({ angle: validAngles[i], emoji: decoyEmoji });
        }
        setDecoys(newDecoys);
    }, []);

    const startRound = useCallback((difficulty: number) => {
        // Generate Codes - Random count within difficulty tier
        let minCount = 2;
        let maxCount = 2;

        if (difficulty >= 5) {
            minCount = 2; maxCount = 4;  // 5+: 2~4개
        } else if (difficulty >= 3) {
            minCount = 2; maxCount = 3;  // 3-4: 2~3개
        } else {
            minCount = 2; maxCount = 2;  // 1-2: 2개 고정
        }

        const count = minCount + Math.floor(Math.random() * (maxCount - minCount + 1));
        const newCodes = [];
        for (let i = 0; i < count; i++) newCodes.push(EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)]);

        setCodes(newCodes);
        setCurrentCodeIdx(0);
        setNeedleAngle(0);
        setDirection(1);
        spawnTarget(newCodes[0], difficulty, null); // First spawn, no previous target
        setIsRotating(true);
    }, [spawnTarget]);

    // Initial Setup & Restart Handler
    useEffect(() => {
        const prevState = lastGameStateRef.current;
        lastGameStateRef.current = engine.gameState;

        // Only reset difficulty on FRESH game start (from idle or gameover)
        if (engine.gameState === 'playing' && (prevState === 'idle' || prevState === 'gameover')) {
            setLocalDifficulty(1);
            setRoundsCleared(0);
            startRound(1);
        }
    }, [engine.gameState, startRound]);

    // Ref for frame timing (for cross-platform consistent speed)
    const lastTimeRef = useRef<number>(0);

    // Game Loop with deltaTime normalization (consistent across 60Hz/120Hz/144Hz)
    // Note: isTimeFrozen only affects timer in engine, NOT needle rotation
    useEffect(() => {
        if (!isRotating || engine.gameState !== 'playing') return;

        let frameId: number;
        // Speed in degrees per second (not per frame)
        const speedPerSecond = (SPEED_BASE + (localDifficulty * 0.15)) * 60; // Slower difficulty scaling

        const loop = (timestamp: number) => {
            if (lastTimeRef.current === 0) {
                lastTimeRef.current = timestamp;
            }

            const deltaTime = timestamp - lastTimeRef.current;
            const timeScale = deltaTime / 16.67; // Normalize to 60FPS (16.67ms per frame)

            // Cap max timescale to prevent huge jumps if tab was inactive
            const cappedTimeScale = Math.min(timeScale, 3.0);

            // Calculate actual speed for this frame
            const frameSpeed = (speedPerSecond / 60) * cappedTimeScale;

            setNeedleAngle(prev => (prev + (frameSpeed * direction) + 360) % 360);

            lastTimeRef.current = timestamp;
            frameId = requestAnimationFrame(loop);
        };

        lastTimeRef.current = 0; // Reset on start
        frameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(frameId);
    }, [isRotating, direction, engine.gameState, localDifficulty]);


    const handleSuccess = useCallback(() => {
        engine.registerEvent({ type: 'correct', isFinal: currentCodeIdx >= codes.length - 1 });

        if (currentCodeIdx >= codes.length - 1) {
            // Round Clear
            const newRoundsCleared = roundsCleared + 1;
            setRoundsCleared(newRoundsCleared);

            // Increase difficulty every 3 rounds (slower progression)
            let nextDifficulty = localDifficulty;
            if (newRoundsCleared % 3 === 0) {
                nextDifficulty = localDifficulty + 1;
                setLocalDifficulty(nextDifficulty);
            }

            engine.submitAnswer(true);
            setIsRotating(false);

            // Combo-based PowerUp Reward (same as ColorLink)
            const nextCombo = engine.combo + 1;
            if (nextCombo > 0 && nextCombo % 3 === 0) {
                // 55% Chance on every 3rd combo
                if (Math.random() < 0.55) {
                    const rewards: ('timeFreeze' | 'extraLife' | 'doubleScore')[] = ['timeFreeze', 'extraLife', 'doubleScore'];
                    const reward = rewards[Math.floor(Math.random() * rewards.length)];
                    engine.setPowerUps(prev => ({ ...prev, [reward]: prev[reward] + 1 }));
                }
            }

            setTimeout(() => startRound(nextDifficulty), 1000);
        } else {
            // Next Code
            setCurrentCodeIdx(prev => prev + 1);
            setDirection(prev => prev * -1); // Reverse Direction

            // Pass the CURRENT target angle as the 'previous' one for the new spawn
            spawnTarget(codes[currentCodeIdx + 1], localDifficulty, targetAngle);
        }
    }, [engine, currentCodeIdx, codes, roundsCleared, localDifficulty, targetAngle, startRound, spawnTarget]);

    const handleFail = useCallback(() => {
        engine.registerEvent({ type: 'wrong' });
        engine.submitAnswer(false); // Lose Life
        // Shake effect handled by engine
    }, [engine]);

    // Interaction
    const handleTap = useCallback(() => {
        if (!isRotating) return;

        // Normalize angles to 0-360 positive
        const n = (needleAngle + 360) % 360;
        const t = (targetAngle + 360) % 360;

        // Check distance (handling wrap-around)
        let diff = Math.abs(n - t);
        if (diff > 180) diff = 360 - diff;

        if (diff <= TARGET_TOLERANCE) {
            // Success
            handleSuccess();
        } else {
            // Fail
            handleFail();
        }
    }, [needleAngle, targetAngle, isRotating, handleSuccess, handleFail]);

    const usePowerUp = (type: 'timeFreeze' | 'extraLife' | 'doubleScore') => {
        if (engine.powerUps[type] > 0) {
            engine.activatePowerUp(type);
        }
    };

    // Current target emoji
    const targetValue = codes[currentCodeIdx] || '?';

    return {
        ...engine,
        needleAngle,
        targetAngle,
        codes,
        currentCodeIdx,
        target: { value: targetValue },
        decoys,
        handleTap,
        usePowerUp
    };
};
