import { useState, useCallback, useEffect } from 'react';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';

export interface BackMultiplicationProblemLv2 {
    a: number; // 2 digit (XY)
    b: number; // 1 digit (Z)

    // Grid Display
    row1_tens: number;
    row1_units: number;
    row2_units: number;

    // Logic Values
    step1_val: number; // Y * Z (e.g. 15)
    step2_val: number; // X * Z (e.g. 12)
    step3_val: number; // Total (e.g. 135)

    // Strict string expectation for steps (to enforce "00" or padded "06")
    step1_str: string;
    step2_str: string;
    step3_str: string;
}

export const useBackMultiplicationLogicLv2 = (engine: ReturnType<typeof useGameEngine>) => {
    const {
        lives,
        submitAnswer,
        gameState,
        registerEvent
    } = engine;

    const [currentProblem, setCurrentProblem] = useState<BackMultiplicationProblemLv2 | null>(null);
    const [userInput, setUserInput] = useState<string>('');
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

    const [completedSteps, setCompletedSteps] = useState<{
        step1: string | null;
        step2: string | null;
        step3: string | null;
    }>({ step1: null, step2: null, step3: null });

    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [prevGameState, setPrevGameState] = useState(gameState);

    // Padding helper: 6 -> '06', 0 -> '00', 12 -> '12'
    // Modified: User requested NO leading zeros if < 10. e.g. 6 -> '6', 0 -> '0'.
    const toExpectationStr = (num: number): string => {
        return num.toString().padStart(2, '0');
    };

    const generateProblem = useCallback(() => {
        // Level 1: 2-digit x 1-digit
        // Avoid trivial cases check? Maybe (x1, x0 usually too simple, but x0 is instructive)
        // Let's generate range [10, 99] x [2, 9] to make it meaningful.
        const a = Math.floor(Math.random() * 90) + 10; // 10-99
        const b = Math.floor(Math.random() * 8) + 2;   // 2-9

        const tA = Math.floor(a / 10);
        const uA = a % 10;

        // Step 1: Units * Multiplier
        const s1 = uA * b;
        // Step 2: Tens * Multiplier 
        const s2 = tA * b;

        // Final Total
        // Logic: (s2 * 10) + s1  <-- Standard math
        // But our grid adds them vertically:
        //    (s1)  <-- aligned right
        //   (s2)   <-- shifted left
        const total = (s2 * 10) + s1;

        const problem: BackMultiplicationProblemLv2 = {
            a, b,
            row1_tens: tA,
            row1_units: uA,
            row2_units: b,
            step1_val: s1,
            step2_val: s2,
            step3_val: total,
            step1_str: toExpectationStr(s1),
            step2_str: toExpectationStr(s2),
            step3_str: total.toString()
        };

        setCurrentProblem(problem);
        setUserInput('');
        setCompletedSteps({ step1: null, step2: null, step3: null });
        setCurrentStep(1);
        setFeedback(null);
    }, []);

    // ... (useEffect reset and start logic unchanged, skipping for brevity) ...

    // Reset state
    useEffect(() => {
        if (gameState === 'idle') {
            setCurrentProblem(null);
            setUserInput('');
            setCompletedSteps({ step1: null, step2: null, step3: null });
            setCurrentStep(1);
            setFeedback(null);
        }
    }, [gameState]);

    // Handle Game Start
    useEffect(() => {
        if (gameState === 'playing') {
            if (!currentProblem || prevGameState === 'gameover') {
                generateProblem();
            }
        }
        setPrevGameState(gameState);
    }, [gameState, currentProblem, generateProblem, prevGameState]);

    const handleInput = useCallback((key: string) => {
        if (gameState !== 'playing' || feedback === 'correct' || !currentProblem) return;

        if (key === 'ENTER' || key === 'CHECK') {
            // Validate against STRING target to enforce padding (e.g. "00")
            let targetStr = '';
            if (currentStep === 1) targetStr = currentProblem.step1_str;
            else if (currentStep === 2) targetStr = currentProblem.step2_str;
            else if (currentStep === 3) targetStr = currentProblem.step3_str;

            const isStepCorrect = userInput === targetStr;

            if (isStepCorrect) {
                registerEvent({ type: 'correct', isFinal: currentStep === 3 });
                setCompletedSteps(prev => ({
                    ...prev,
                    [`step${currentStep}`]: userInput
                }));

                if (currentStep < 3) {
                    setUserInput('');
                    setCurrentStep(prev => (prev + 1) as 1 | 2 | 3);
                } else {
                    setFeedback('correct');
                    submitAnswer(true);
                    setTimeout(() => generateProblem(), 1500);
                }
            } else {
                setFeedback('wrong');
                registerEvent({ type: 'wrong' });
                // We don't skip difficulty on partial step failure, but penalize combo/lives
                submitAnswer(false, { skipDifficulty: true, skipCombo: true });
                setTimeout(() => {
                    setFeedback(null);
                    setUserInput('');
                }, 500);
            }
        } else if (key === 'AC' || key === 'CLEAR') {
            setUserInput('');
        } else if (key === 'DEL' || key === 'BACKSPACE') {
            setUserInput(prev => prev.slice(0, -1));
        } else {
            // Limit input length based on EXPECTED length (now dynamic)
            let maxLen = 2; // default
            if (currentStep === 1) maxLen = currentProblem.step1_str.length;
            else if (currentStep === 2) maxLen = currentProblem.step2_str.length;
            else if (currentStep === 3) maxLen = currentProblem.step3_str.length;

            if (userInput.length < maxLen) {
                setUserInput(prev => prev + key);
            }
        }
    }, [gameState, feedback, userInput, currentStep, currentProblem, submitAnswer, registerEvent, generateProblem]);

    return {
        currentProblem,
        userInput,
        currentStep,
        completedSteps,
        feedback,
        handleInput,
        lives
    };
};
