import { useState, useCallback, useEffect } from 'react';
import { useGameEngine } from '../../../layouts/Layout0/useGameEngine'; // Generic engine
import { PINWHEEL_POP_CONSTANTS as CONSTS } from './constants';

export type PinwheelProblemType = 'tens_ones_add' | 'tens_tens_add' | 'tens_tens_sub' | 'mixed';

interface PinwheelState {
    centerOperator: '+' | '-';
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
        centerOperator: '+',
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
        // Tens + Tens (e.g. 20 + 30)
        if (type === 'tens_tens_add' || type === 'tens_tens_sub') {
            return Math.floor(Math.random() * 9 + 1) * 10;
        }
        return Math.floor(Math.random() * 50 + 10);
    };

    const generateOptions = (correct: number): number[] => {
        const set = new Set<number>();
        set.add(correct);
        while (set.size < 3) {
            let distractor = correct + (Math.random() > 0.5 ? 10 : -10);
            if (Math.random() > 0.7) distractor = correct + (Math.random() > 0.5 ? 1 : -1);

            // Ensure positive
            if (distractor <= 0) distractor = Math.abs(distractor) + 1; // Flip to positive
            if (distractor === correct || distractor <= 0) distractor = correct + Math.floor(Math.random() * 10) + 1; // Fallback to definitely positive

            set.add(distractor);
        }
        return Array.from(set).sort((a, b) => a - b); // Sort ascending (optional for number line feel) or random
    };

    const generateRound = useCallback((difficulty: number) => {
        let type: PinwheelProblemType = 'tens_ones_add';
        // Revert to Addition Only
        const operator: '+' | '-' = '+';

        // Difficulty mapping
        if (difficulty === 1) type = 'tens_ones_add';
        else if (difficulty === 2) type = 'tens_tens_add';
        else if (difficulty >= 3) {
            type = 'tens_tens_add';
        }

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
            centerOperator: operator,
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
