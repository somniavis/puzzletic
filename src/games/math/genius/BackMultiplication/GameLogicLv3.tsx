import { useState, useCallback, useEffect } from 'react';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';

export interface BackMultiplicationProblemLv3 {
    a: number; // 3 digit (XYZ)
    b: number; // 1 digit (W)

    // Grid Display
    row1_hundreds: number;
    row1_tens: number;
    row1_units: number;
    row2_units: number;

    // Logic Values
    step1_val: number; // Z * W
    step2_val: number; // Y * W
    step3_val: number; // X * W
    step4_val: number; // Total

    // Target Strings (padded)
    step1_str: string;
    step2_str: string;
    step3_str: string;
    step4_str: string;
}

export const useBackMultiplicationLogicLv3 = (engine: ReturnType<typeof useGameEngine>) => {
    const {
        lives,
        submitAnswer,
        gameState,
        registerEvent
    } = engine;

    const [currentProblem, setCurrentProblem] = useState<BackMultiplicationProblemLv3 | null>(null);
    const [userInput, setUserInput] = useState<string>('');
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

    const [completedSteps, setCompletedSteps] = useState<{
        step1: string | null;
        step2: string | null;
        step3: string | null;
        step4: string | null;
    }>({ step1: null, step2: null, step3: null, step4: null });

    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [prevGameState, setPrevGameState] = useState(gameState);
    const [generatedCount, setGeneratedCount] = useState(0);

    const toExpectationStr = (num: number): string => {
        return num.toString();
    };

    const generateProblem = useCallback(() => {
        // Level 3: 3-digit x 1-digit
        // Range: [100, 999] x [2, 9]
        let a = 0;
        let b = 0;
        let hA = 0;
        let tA = 0;
        let uA = 0;

        const stage = generatedCount;
        do {
            a = Math.floor(Math.random() * 900) + 100; // 100-999
            b = Math.floor(Math.random() * 8) + 2;     // 2-9

            hA = Math.floor(a / 100);
            tA = Math.floor((a % 100) / 10);
            uA = a % 10;

            const s1 = uA * b;
            const s2 = tA * b;
            const s3 = hA * b;

            // Column carry checks when summing partial products
            // tens-column: tens(s1) + units(s2)
            const tensCarry = Math.floor(s1 / 10) + (s2 % 10) >= 10;
            // hundreds-column: hundreds(s2) + units(s3) + carry-from-tens
            const hundredsCarry = Math.floor(s2 / 10) + (s3 % 10) + (tensCarry ? 1 : 0) >= 10;

            const isValid =
                (stage < 3 && !tensCarry && !hundredsCarry) ||             // 1-3: no carry in tens/hundreds
                (stage === 3 && tensCarry && !hundredsCarry) ||            // 4th: tens carry only
                (stage === 4 && !tensCarry && hundredsCarry) ||            // 5th: hundreds carry only
                (stage >= 5 && !(tensCarry && hundredsCarry));             // 6th+: random, but no simultaneous carries

            if (isValid) break;
        } while (true);

        // Step 1: Units * Multiplier
        const s1 = uA * b;
        // Step 2: Tens * Multiplier
        const s2 = tA * b;
        // Step 3: Hundreds * Multiplier
        const s3 = hA * b;

        // Final Total
        // Logic: (s3 * 100) + (s2 * 10) + s1
        const total = (s3 * 100) + (s2 * 10) + s1;

        const problem: BackMultiplicationProblemLv3 = {
            a, b,
            row1_hundreds: hA,
            row1_tens: tA,
            row1_units: uA,
            row2_units: b,
            step1_val: s1,
            step2_val: s2,
            step3_val: s3,
            step4_val: total,
            step1_str: toExpectationStr(s1),
            step2_str: toExpectationStr(s2),
            step3_str: toExpectationStr(s3),
            step4_str: total.toString()
        };

        setCurrentProblem(problem);
        setUserInput('');
        setCompletedSteps({ step1: null, step2: null, step3: null, step4: null });
        setCurrentStep(1);
        setFeedback(null);
        setGeneratedCount(prev => prev + 1);
    }, [generatedCount]);

    // Reset state
    useEffect(() => {
        if (gameState === 'idle' || gameState === 'gameover') {
            setCurrentProblem(null);
            setUserInput('');
            setCompletedSteps({ step1: null, step2: null, step3: null, step4: null });
            setCurrentStep(1);
            setFeedback(null);
            setGeneratedCount(0);
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
            let targetStr = '';
            if (currentStep === 1) targetStr = currentProblem.step1_str;
            else if (currentStep === 2) targetStr = currentProblem.step2_str;
            else if (currentStep === 3) targetStr = currentProblem.step3_str;
            else if (currentStep === 4) targetStr = currentProblem.step4_str;

            const isStepCorrect = userInput === targetStr;

            if (isStepCorrect) {
                registerEvent({ type: 'correct', isFinal: currentStep === 4 });
                setCompletedSteps(prev => ({
                    ...prev,
                    [`step${currentStep}`]: userInput
                }));

                if (currentStep < 4) {
                    setUserInput('');
                    setCurrentStep(prev => (prev + 1) as 1 | 2 | 3 | 4);
                } else {
                    setFeedback('correct');
                    submitAnswer(true);
                    setTimeout(() => generateProblem(), 1500);
                }
            } else {
                setFeedback('wrong');
                registerEvent({ type: 'wrong' });
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
            let maxLen = 2; // default
            if (currentStep === 4) maxLen = currentProblem.step4_str.length; // Total length
            // Partial steps check (digits of partial prod are usually 1 or 2, max 2 for 9*9=81)
            else if (currentStep === 1) maxLen = currentProblem.step1_str.length;
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
