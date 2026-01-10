
import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';

// Constants (Relaxed Difficulty)
const SPEED_BASE = 2.0; // Base Rotation Speed (slower start)
const TARGET_TOLERANCE = 20; // Degrees (+/-) - wider hit zone
const MIN_DIST = 90; // Min distance for new target

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

    // Power-Up State (local freeze tracking only - engine handles actual powerups)
    const [isTimeFrozen, setIsTimeFrozen] = useState(false);

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
    }, [engine.gameState]);

    const startRound = (difficulty: number) => {
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
        spawnTarget(0, newCodes[0], difficulty); // Spawn first target relative to 0
        setIsRotating(true);
    };

    const spawnTarget = (currentAngle: number, targetEmoji: string, difficulty: number) => {
        // 1. Target Position
        let newTargetAngle = Math.random() * 360;
        while (Math.abs(newTargetAngle - currentAngle) < MIN_DIST) {
            newTargetAngle = Math.random() * 360;
        }
        setTargetAngle(newTargetAngle);

        // 2. Decoys (1-3 based on difficulty)
        // Level 1-2: 1 decoy, Level 3-4: 2 decoys, Level 5+: 3 decoys
        const decoyCount = Math.min(1 + Math.floor(difficulty / 2), 3);
        const newDecoys: { angle: number; emoji: string }[] = [];

        for (let i = 0; i < decoyCount; i++) {
            let decoyAngle = Math.random() * 360;
            let valid = false;
            let attempts = 0;

            // Find valid angle (far from current needle, target, and other decoys)
            while (!valid && attempts < 20) {
                decoyAngle = Math.random() * 360;
                valid = true;

                // Check dist from needle
                if (Math.abs(decoyAngle - currentAngle) < 60) valid = false; // Decoys can be closer than target but not immediate

                // Check dist from Target
                let distToTarget = Math.abs(decoyAngle - newTargetAngle);
                if (distToTarget > 180) distToTarget = 360 - distToTarget;
                if (distToTarget < 40) valid = false; // Min separation between items

                // Check dist from other Decoys
                for (const d of newDecoys) {
                    let dist = Math.abs(decoyAngle - d.angle);
                    if (dist > 180) dist = 360 - dist;
                    if (dist < 40) valid = false;
                }
                attempts++;
            }

            // Pick distinct emoji
            let decoyEmoji = EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)];
            while (decoyEmoji === targetEmoji) {
                decoyEmoji = EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)];
            }

            if (valid) {
                newDecoys.push({ angle: decoyAngle, emoji: decoyEmoji });
            }
        }
        setDecoys(newDecoys);
    };

    // Ref for frame timing (for cross-platform consistent speed)
    const lastTimeRef = useRef<number>(0);

    // Game Loop with deltaTime normalization (consistent across 60Hz/120Hz/144Hz)
    useEffect(() => {
        if (!isRotating || engine.gameState !== 'playing' || isTimeFrozen) return;

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
    }, [isRotating, direction, engine.gameState, localDifficulty, isTimeFrozen]);


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
    }, [needleAngle, targetAngle, isRotating]);

    const handleSuccess = () => {
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

            // Streak-based PowerUp Reward (same as ColorLink)
            const nextStreak = engine.streak + 1;
            if (nextStreak > 0 && nextStreak % 3 === 0) {
                // 55% Chance on every 3rd streak
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
            spawnTarget(needleAngle, codes[currentCodeIdx + 1], localDifficulty);
        }
    };

    const handleFail = () => {
        engine.registerEvent({ type: 'wrong' });
        engine.submitAnswer(false); // Lose Life
        // Shake effect handled by engine
    };

    const usePowerUp = (type: 'timeFreeze' | 'extraLife' | 'doubleScore') => {
        if (engine.powerUps[type] > 0) {
            engine.activatePowerUp(type);
            if (type === 'timeFreeze') {
                setIsTimeFrozen(true);
                setTimeout(() => setIsTimeFrozen(false), 5000);
            }
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
        usePowerUp,
        isTimeFrozen
    };
};
