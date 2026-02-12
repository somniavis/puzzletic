import { useState, useCallback, useEffect, useRef } from 'react';
import { useGameEngine } from '../../../../layouts/Standard/Layout0/useGameEngine';

export type RocketState = 'idle' | 'launch-left' | 'launch-right' | 'launch-both' | 'crash' | 'grabbing-left' | 'grabbing-right' | 'placing';
export type AnswerType = '>' | '<' | '=';

export const useRocketLauncherLogic = (engine: ReturnType<typeof useGameEngine>) => {
    const [leftValue, setLeftValue] = useState(0);
    const [rightValue, setRightValue] = useState(0);
    const [rocketState, setRocketState] = useState<RocketState>('idle');
    const [isProcessing, setIsProcessing] = useState(false);

    // Simplified problem generation: 0-100, variable gaps
    const generateProblem = useCallback(() => {
        // Range 0-100
        const min = 0;
        const max = 100;

        // Randomly choose gap type (Probabilities per User Request)
        // 30% Small Gap (1-5)
        // 30% Medium Gap (6-30)
        // 35% Large Gap (31-100)
        // 5% Equal
        const gapType = Math.random();

        let left = Math.floor(Math.random() * (max - min + 1)) + min;
        let right = left;

        if (gapType < 0.05) {
            // Equal (5%)
            right = left;
        } else {
            // Calculate Gap
            let gap;
            if (gapType < 0.35) { // 0.05 + 0.30
                // Small Gap (1-5)
                gap = Math.floor(Math.random() * 5) + 1;
            } else if (gapType < 0.65) { // 0.35 + 0.30
                // Medium Gap (6-30)
                gap = Math.floor(Math.random() * 25) + 6;
            } else { // Remaining 35%
                // Large Gap (31-100)
                // Note: Max gap is limited by the range 0-100.
                // We'll generate a random large gap, but clamp it if needed.
                gap = Math.floor(Math.random() * 70) + 31;
            }

            // Decide direction (add or subtract gap)
            // Ensure within bounds
            if (Math.random() < 0.5) {
                // Try Right = Left + Gap
                if (left + gap <= max) {
                    right = left + gap;
                } else {
                    // Fallback to Left - Gap if + is out of bounds
                    // If - is also out of bounds (which implies gap > left and gap > 100-left),
                    // we might need to adjust gap or just pick valid one.
                    // Given max gap is 100, one direction should usually work unless left is in middle and gap is huge.
                    // Actually if gap is 60 and left is 50, + is 110 (X), - is -10 (X).
                    // In that case, we can't apply this gap. Let's just pick a valid random number in range if initial gap fails.
                    if (left - gap >= min) {
                        right = left - gap;
                    } else {
                        // Gap is too big for this 'left' position in either direction.
                        // Just pick a random number far away if possible, or any random number.
                        right = Math.floor(Math.random() * (max - min + 1)) + min;
                    }
                }
            } else {
                // Try Right = Left - Gap
                if (left - gap >= min) {
                    right = left - gap;
                } else {
                    if (left + gap <= max) {
                        right = left + gap;
                    } else {
                        right = Math.floor(Math.random() * (max - min + 1)) + min;
                    }
                }
            }
        }

        // Final bound check just in case
        if (right < min) right = min;
        if (right > max) right = max;

        setLeftValue(left);
        setRightValue(right);
        setRocketState('idle');
        setIsProcessing(false);
    }, []);

    // Timer Ref for cleanup
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    // Initial problem
    useEffect(() => {
        generateProblem();

        // Initialize Powerups
        if (engine.setPowerUps) {
            engine.setPowerUps({
                timeFreeze: 1,
                extraLife: 1,
                doubleScore: 1
            });
        }
    }, []); // Run once on mount

    const handleAnswer = useCallback((operator: AnswerType) => {
        if (isProcessing) return;
        setIsProcessing(true);

        const isCorrect =
            (operator === '>' && leftValue > rightValue) ||
            (operator === '<' && leftValue < rightValue) ||
            (operator === '=' && leftValue === rightValue);

        if (isCorrect) {
            // Determine animation
            if (operator === '>') setRocketState('launch-left');
            else if (operator === '<') setRocketState('launch-right');
            else setRocketState('launch-both');

            // Trigger Standard Feedback (Animation & Sound)
            // Note: registerEvent triggers useGameEffects which plays 'playClearSound' (which is cleaning sound)
            engine.registerEvent({ type: 'correct', isFinal: true });

            // Apply modifications (Double Score handled by engine)
            engine.submitAnswer(true);

            // PowerUp Acquisition Logic (Standard: Combo % 3 == 0, 55% Chance)
            const nextCombo = engine.combo + 1;
            if (nextCombo > 0 && nextCombo % 3 === 0) {
                if (Math.random() < 0.55 && engine.setPowerUps) {
                    const rewards = ['timeFreeze', 'extraLife', 'doubleScore'] as const;
                    const reward = rewards[Math.floor(Math.random() * rewards.length)];
                    engine.setPowerUps(prev => ({ ...prev, [reward]: prev[reward] + 1 }));
                }
            }

            // Wait for animation then next problem
            // Wait for animation then start robot sequence
            timerRef.current = setTimeout(() => {
                // If one rocket launched, grab the other one
                // If both launched ('='), skip grabbing
                const nextState = operator === '>' ? 'grabbing-right' :
                    operator === '<' ? 'grabbing-left' :
                        'placing';

                setRocketState(nextState as RocketState);

                // Wait for grab animation (e.g., 2s)
                // If '=', skip grab delay (0s)
                const grabDelay = operator === '=' ? 0 : 2000;

                timerRef.current = setTimeout(() => {
                    setRocketState('placing'); // Place new rockets

                    // Wait for place animation (e.g., 2s)
                    timerRef.current = setTimeout(() => {
                        generateProblem(); // Update numbers
                        // Reset to idle happens via animation end or here
                    }, 1000); // Wait for arms to enter and place

                    timerRef.current = setTimeout(() => {
                        setRocketState('idle'); // Arms retreat
                    }, 2000); // Full placing sequence duration
                }, grabDelay);
            }, 3500); // 3.5s for rocket launch animation
        } else {
            setRocketState('crash');

            // Trigger Standard Feedback (Failure Animation & Sound)
            engine.registerEvent({ type: 'wrong' });
            engine.submitAnswer(false);

            // Wait for shake/crash then reset state check
            // DO NOT regenerate problem on failure (User Request: Retry on fail)
            timerRef.current = setTimeout(() => {
                setRocketState('idle');
                setIsProcessing(false);
            }, 500);
        }
    }, [leftValue, rightValue, isProcessing, engine, generateProblem]);

    // Wrapper for power ups to fit interface expected by index.tsx
    const usePowerUp = useCallback((type: 'timeFreeze' | 'extraLife' | 'doubleScore') => {
        if (engine.activatePowerUp) {
            engine.activatePowerUp(type);
        }
    }, [engine]);

    return {
        leftValue,
        rightValue,
        rocketState,
        handleAnswer,
        // Expose engine state for UI
        powerUps: engine.powerUps || { timeFreeze: 0, extraLife: 0, doubleScore: 0 },
        usePowerUp,
        isTimeFrozen: engine.isTimeFrozen || false,
        doubleScoreActive: engine.isDoubleScore || false
    };
};
