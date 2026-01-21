import { useState, useCallback, useEffect } from 'react';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';

export interface FrontAdditionProblem {
    a: number;
    b: number;

    // Grid Values
    row1_hundreds: number | null;
    row1_tens: number;
    row1_units: number;

    row2_hundreds: number | null;
    row2_tens: number | null;
    row2_units: number;

    // Answers for steps
    step1_val: number; // Hundreds sum (if applicable) or Tens sum
    step2_val: number;
    step3_val: number;
    step4_val?: number; // Total if 4 steps

    totalSteps: 3 | 4;
}

export const useGameLogic = (engine: ReturnType<typeof useGameEngine>, gameId?: string) => {
    const {
        lives,
        submitAnswer,
        gameState,
        registerEvent
    } = engine;

    const [currentProblem, setCurrentProblem] = useState<FrontAdditionProblem | null>(null);
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

    const generateProblem = useCallback(() => {
        let a, b;
        let is3Digit = false;

        if (gameId === 'front-addition-lv4') {
            // Level 4: 3-digit + 3-digit
            a = Math.floor(Math.random() * 900) + 100;
            b = Math.floor(Math.random() * 900) + 100;
            is3Digit = true;
        } else if (gameId === 'front-addition-lv3') {
            // Level 3: 3-digit + 2-digit
            a = Math.floor(Math.random() * 900) + 100;
            b = Math.floor(Math.random() * 90) + 10;
            is3Digit = true;
        } else if (gameId === 'front-addition-lv2') {
            // Level 2: 2-digit + 2-digit
            a = Math.floor(Math.random() * 90) + 10;
            b = Math.floor(Math.random() * 90) + 10;
        } else {
            // Level 1: 2-digit + 1-digit
            a = Math.floor(Math.random() * 90) + 10;
            b = Math.floor(Math.random() * 9) + 1;
        }

        const hA = Math.floor(a / 100);
        const tA = Math.floor((a % 100) / 10);
        const uA = a % 10;

        const hB = Math.floor(b / 100);
        const tB = Math.floor((b % 100) / 10);
        const uB = b % 10;

        let problem: FrontAdditionProblem;

        if (is3Digit) {
            // 4 Steps: Hundreds Sum, Tens Sum, Units Sum, Total
            // Note: If b is 2-digit, hB is 0.
            const s1 = hA + hB;
            const s2 = tA + tB;
            const s3 = uA + uB;
            const s4 = a + b;

            problem = {
                a, b,
                row1_hundreds: hA,
                row1_tens: tA,
                row1_units: uA,
                row2_hundreds: hB === 0 ? null : hB,
                row2_tens: tB, // Always show tens for 3d+2d? Yes (10-99)
                row2_units: uB,
                step1_val: s1,
                step2_val: s2,
                step3_val: s3,
                step4_val: s4,
                totalSteps: 4
            };
        } else {
            // 3 Steps: Tens Sum, Units Sum, Total
            const s1 = tA + tB; // Tens
            const s2 = uA + uB; // Units
            const s3 = a + b;   // Total

            problem = {
                a, b,
                row1_hundreds: null,
                row1_tens: tA,
                row1_units: uA,
                row2_hundreds: null,
                row2_tens: tB === 0 ? null : tB,
                row2_units: uB,
                step1_val: s1,
                step2_val: s2,
                step3_val: s3,
                totalSteps: 3
            };
        }

        setCurrentProblem(problem);
        setUserInput('');
        setCompletedSteps({ step1: null, step2: null, step3: null, step4: null });
        setCurrentStep(1);
        setFeedback(null);
    }, [gameId]);

    // Reset state
    useEffect(() => {
        if (gameState === 'idle') {
            setCurrentProblem(null);
            setUserInput('');
            setCompletedSteps({ step1: null, step2: null, step3: null, step4: null });
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
            const numInput = parseInt(userInput, 10);
            let isStepCorrect = false;
            let targetVal = 0;

            if (currentStep === 1) targetVal = currentProblem.step1_val;
            else if (currentStep === 2) targetVal = currentProblem.step2_val;
            else if (currentStep === 3) targetVal = currentProblem.step3_val;
            else if (currentStep === 4 && currentProblem.step4_val !== undefined) targetVal = currentProblem.step4_val;

            isStepCorrect = numInput === targetVal;

            if (isStepCorrect) {
                registerEvent({ type: 'correct', isFinal: currentStep === currentProblem.totalSteps });
                setCompletedSteps(prev => ({
                    ...prev,
                    [`step${currentStep}`]: userInput
                }));

                if (currentStep < currentProblem.totalSteps) {
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
            if (userInput.length < 4) { // Allow up to 4 digits for total
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
