import { useState, useCallback, useEffect } from 'react';
import { useGameEngine } from '../../../layouts/Layout0/useGameEngine'; // Generic engine
import { PINWHEEL_POP_CONSTANTS as CONSTS } from './constants';

export type PinwheelProblemType = 'tens_ones_add' | 'tens_tens_add';

interface PinwheelState {
    innerNumbers: number[]; // [TL, TR, BR, BL] - 4 numbers
    outerAnswers: (number | null)[]; // 4 slots, null = pending
    currentStage: number; // 0..3 (Pop-up index)
    options: number[]; // 3 choices
    finalSpin: boolean; // Triggers finale animation
}

export const usePinwheelLogic = () => {
    const engine = useGameEngine({
        initialTime: CONSTS.TIME_LIMIT,
        initialLives: CONSTS.BASE_LIVES
    });

    const [pinwheel, setPinwheel] = useState<PinwheelState>({
        innerNumbers: [0, 0, 0, 0],
        outerAnswers: [null, null, null, null],
        currentStage: 0,
        options: [],
        finalSpin: false
    });

    const [powerUps, setPowerUps] = useState({ timeFreeze: 0, extraLife: 0, doubleScore: 0 });
    const [isTimeFrozen, setIsTimeFrozen] = useState(false);
    const [doubleScoreActive, setDoubleScoreActive] = useState(false);

    // Helper: Generate Random Number based on difficulty
    const generateNumber = (type: PinwheelProblemType): number => {
        // Tens + Ones (e.g. 20 + 5)
        if (type === 'tens_ones_add') {
            return Math.random() > 0.5
                ? Math.floor(Math.random() * 9 + 1) * 10 // Tens (10, 20..)
                : Math.floor(Math.random() * 9 + 1);      // Ones (1..9)
        }
        // Tens + Tens (e.g. 20 + 30) - Default fallback
        return Math.floor(Math.random() * 9 + 1) * 10;
    };

    const generateOptions = (correct: number): number[] => {
        // Position-First Strategy to ensure uniform 33% distribution
        const targetPos = Math.floor(Math.random() * 3); // 0, 1, or 2
        const options = new Array(3).fill(0);

        // Place correct answer
        options[targetPos] = correct;

        // Fill other slots (Distractors)
        // To maintain sorted order (visual comfort), we generate based on position.
        // If target is 0: [Correct, >Correct, >Correct]
        // If target is 1: [<Correct, Correct, >Correct]
        // If target is 2: [<Correct, <Correct, Correct]

        const generateDistractor = (base: number, isLarger: boolean): number => {
            let val = base + (isLarger ? (Math.floor(Math.random() * 10) + 1) : -(Math.floor(Math.random() * 10) + 1));
            if (val <= 0) val = base + 10; // Fallback to larger if negative
            if (val === base) val = base + 1;
            return val;
        };

        if (targetPos === 0) {
            // Correct is Smallest
            let d1 = generateDistractor(correct, true);
            let d2 = generateDistractor(d1, true);
            // Ensure distinct and sorted
            if (d1 === correct) d1 = correct + 1;
            if (d2 === d1) d2 = d1 + 1;
            options[1] = d1;
            options[2] = d2;
        } else if (targetPos === 1) {
            // Correct is Middle
            let smaller = generateDistractor(correct, false);
            let larger = generateDistractor(correct, true);

            // Safety: Ensure smaller is valid positive
            if (smaller <= 0) {
                // If cannot allow smaller, we must shift strategy or force min 1
                // But wait, if Correct is e.g. 5, smaller can be 1-4.
                smaller = Math.max(1, correct - (Math.floor(Math.random() * (correct - 1)) + 1));
                if (smaller >= correct) smaller = Math.max(1, correct - 1);
            }
            // If correct is 1, smaller can't exist -> Fallback to all larger logic (Target Pos becomes 0 effectively but shuffled? No, we want distinct.)
            // Edge case: Correct = 0? (Not possible with logic 10+). Correct min is usually >10.
            // So smaller is safe.

            options[0] = smaller;
            options[2] = larger;
        } else {
            // Correct is Largest (Pos 2)
            let d1 = generateDistractor(correct, false); // Smaller
            let d2 = generateDistractor(d1, false);     // Even Smaller

            // Validate d1
            if (d1 >= correct) d1 = correct - 1;
            if (d1 <= 0) d1 = 1;

            // Validate d2
            if (d2 >= d1) d2 = d1 - 1;
            if (d2 <= 0) {
                // If space is too tight (e.g. Correct=2), we can't have 2 smaller.
                // This edge case is rare for >10 sums.
                // Fallback: Just make them distinct? 
                // If we fail to find 2 smaller, we simply swap to "Larger" mode for the remaining slots and re-sort?
                // No, that breaks the "Target Pos" promise.
                // Simple Fix: Shift correct answer to index 0 or 1 if generation fails?
                // Or just force d1, d2 to be 1, 2 and correct to be 3+?
                d2 = 1;
                d1 = Math.max(2, Math.min(correct - 1, 3));
            }

            options[0] = d2; // Smallest
            options[1] = d1; // Middle
        }

        // Final fail-safe sort to ensure options are strictly increasing (visual consistency)
        // Since we filled slots logically [Small, Med, Large], this just confirms it.
        // Wait, if we Sort at the end, does it undo our Target Position?
        // YES. If we generate random numbers and sort them, the position is determined by magnitude, not our choice.
        // SO: We MUST generate numbers such that their magnitude PRESERVES our chosen slot.
        // My Logic above (targetPos 0 -> others are larger) DOES preserve it.
        // So Sorting is redundant but harmless verification.

        return options;
    };

    const generateRound = useCallback((difficulty: number) => {
        let type: PinwheelProblemType = 'tens_ones_add';

        // Difficulty mapping
        if (difficulty >= 2) type = 'tens_tens_add';

        // Generate 4 Inner Numbers
        const inners = [
            generateNumber(type),
            generateNumber(type),
            generateNumber(type),
            generateNumber(type)
        ];

        // Determine correct answer for the FIRST target stage (0)
        // Stage 0: Top (0 & 1)
        const targetA = inners[0];
        const targetB = inners[1];
        const correct = targetA + targetB;

        setPinwheel({
            innerNumbers: inners,
            outerAnswers: [null, null, null, null],
            currentStage: 0,
            options: generateOptions(correct),
            finalSpin: false
        });
    }, []);

    // Initial Start & Restart Logic
    useEffect(() => {
        // Start game on mount
        generateRound(engine.difficultyLevel);
    }, []); // Run on mount only

    // Force regeneration ONLY when lives reset (Explicit Restart / Try Again)
    // We do NOT listen to difficultyLevel here, as it changes mid-game and shouldn't interrupt the set.
    // Force regeneration when game restarts (e.g. from Game Over -> Playing)
    // We check if score is 0 and lives are full to confirm it's a fresh start, not just a resume.
    useEffect(() => {
        if (engine.gameState === 'playing' && engine.score === 0 && engine.lives === CONSTS.BASE_LIVES) {
            generateRound(1); // Force Difficulty 1 on Restart
        }
    }, [engine.gameState, engine.score, engine.lives, generateRound]);

    const handleAnswer = (selected: number) => {
        // Enforce Game Over or Time Up
        if (engine.gameState !== 'playing' || engine.timeLeft <= 0 || pinwheel.finalSpin) return;

        const { innerNumbers, currentStage } = pinwheel;

        // Calculate correct for CURRENT stage
        // Array Layout: [TL, TR, BR, BL] (Clockwise)
        // Stage 0 (Top Wing): Above TL. Sum of Top Edge (TL + TR). Indices [0] + [1].
        // Stage 1 (Right Wing): Right of TR. Sum of Right Edge (TR + BR). Indices [1] + [2].
        // Stage 2 (Bottom Wing): Below BR. Sum of Bottom Edge (BR + BL). Indices [2] + [3].
        // Stage 3 (Left Wing): Left of BL. Sum of Left Edge (BL + TL). Indices [3] + [0].

        const idx1 = currentStage;
        const idx2 = (currentStage + 1) % 4;
        const correct = innerNumbers[idx1] + innerNumbers[idx2];

        if (selected === correct) {
            // Correct
            // User Request: Streak increases ONLY explicitly on round completion (Stage 3).
            // Also logically, difficulty should progress per round, not per wing?
            // Let's skip difficulty update on partial stages too to treat "Pinwheel" as 1 Unit.
            const isRoundComplete = currentStage === 3;

            engine.submitAnswer(true, {
                skipStreak: !isRoundComplete,
                skipDifficulty: !isRoundComplete,
                skipFeedback: !isRoundComplete // Skip 'correct' state delay for intermediate wings
            });
            engine.registerEvent({ type: 'correct', isFinal: isRoundComplete });

            // Apply Double Score bonus manually if active
            if (doubleScoreActive) {
                engine.updateScore(50 * engine.difficultyLevel);
            }

            const newAnswers = [...pinwheel.outerAnswers];
            newAnswers[currentStage] = selected;

            if (currentStage >= 3) {
                // Round Complete
                setPinwheel(prev => ({ ...prev, outerAnswers: newAnswers, finalSpin: true }));
                setTimeout(() => {
                    generateRound(engine.difficultyLevel);
                }, 1200);
            } else {
                // Next Stage
                const nextStage = currentStage + 1;
                const nIdx1 = nextStage;
                const nIdx2 = (nextStage + 1) % 4;
                const nextCorrect = innerNumbers[nIdx1] + innerNumbers[nIdx2];

                setPinwheel(prev => ({
                    ...prev,
                    outerAnswers: newAnswers,
                    currentStage: nextStage,
                    options: generateOptions(nextCorrect)
                }));
            }
        } else {
            // Wrong
            engine.registerEvent({ type: 'wrong' });
            engine.submitAnswer(false);
        }
    };

    const usePowerUp = useCallback((type: 'timeFreeze' | 'extraLife' | 'doubleScore') => {
        if (powerUps[type] > 0) {
            setPowerUps(prev => ({ ...prev, [type]: prev[type] - 1 }));

            if (type === 'timeFreeze') {
                engine.activatePowerUp('timeFreeze');
                setIsTimeFrozen(true);
                setTimeout(() => setIsTimeFrozen(false), 5000);
            } else if (type === 'extraLife') {
                engine.activatePowerUp('extraLife');
            } else if (type === 'doubleScore') {
                setDoubleScoreActive(true);
                setTimeout(() => setDoubleScoreActive(false), 10000); // 10s duration
            }
        }
    }, [powerUps, engine]);

    return {
        ...engine,
        ...pinwheel,
        powerUps,
        isTimeFrozen,
        doubleScoreActive,
        usePowerUp,
        handleAnswer
    };
};
