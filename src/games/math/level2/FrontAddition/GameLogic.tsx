import { useState, useCallback, useEffect } from 'react';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';

interface FrontAdditionProblem {
    a: number; // e.g. 37
    b: number; // e.g. 6

    // Grid Values
    row1_tens: number; // 3
    row1_units: number; // 7

    row2_tens: number | null; // null (if 0 and hidden) or number
    row2_units: number; // 6

    // Answers for steps
    step1_val: number; // 3 (Tens sum: 3+0)
    step2_val: number; // 13 (Units sum: 7+6)
    step3_val: number; // 43 (Total)
}

export const useGameLogic = (engine: ReturnType<typeof useGameEngine>, gameId?: string) => {
    const {
        difficultyLevel,
        lives,
        submitAnswer,
        gameState,
        registerEvent
    } = engine;

    const [currentProblem, setCurrentProblem] = useState<FrontAdditionProblem | null>(null);
    const [userInput, setUserInput] = useState<string>('');
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
    // Step 1: Solving Row 1 (Tens)
    // Step 2: Solving Row 2 (Units)
    // Step 3: Answer Row (Total)

    const [completedSteps, setCompletedSteps] = useState<{
        step1: string | null;
        step2: string | null;
        step3: string | null;
    }>({ step1: null, step2: null, step3: null });

    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

    // Track previous game state to detect restart
    const [prevGameState, setPrevGameState] = useState(gameState);

    const generateProblem = useCallback(() => {
        let a, b;
        const isLv2 = gameId === 'math-level2-front-addition-lv2';

        if (!isLv2) {
            // Level 1: 2-digit + 1-digit
            a = Math.floor(Math.random() * 90) + 10;
            b = Math.floor(Math.random() * 9) + 1;
        } else {
            // Level 2: 2-digit + 2-digit
            a = Math.floor(Math.random() * 90) + 10;
            b = Math.floor(Math.random() * 90) + 10;
        }

        const tensA = Math.floor(a / 10);
        const unitsA = a % 10;
        const tensB = Math.floor(b / 10);
        const unitsB = b % 10;

        const step1_val = tensA + tensB; // 3 + 0 = 3
        const step2_val = unitsA + unitsB; // 7 + 6 = 13
        const step3_val = a + b; // 43

        setCurrentProblem({
            a, b,
            row1_tens: tensA,
            row1_units: unitsA,
            row2_tens: tensB === 0 ? null : tensB,
            row2_units: unitsB,
            step1_val,
            step2_val,
            step3_val
        });

        setUserInput('');
        setCompletedSteps({ step1: null, step2: null, step3: null });
        setCurrentStep(1);
        setFeedback(null);
    }, [difficultyLevel]);

    // Reset state when game goes to idle (Restart/Exit)
    useEffect(() => {
        if (gameState === 'idle') {
            setCurrentProblem(null);
            setUserInput('');
            setCompletedSteps({ step1: null, step2: null, step3: null });
            setCurrentStep(1);
            setFeedback(null);
        }
    }, [gameState]);

    // Handle Game Start / Restart
    useEffect(() => {
        if (gameState === 'playing') {
            // Only generate new problem if:
            // 1. No problem exists (Fresh Start)
            // 2. Transitioned from 'gameover' (Play Again)
            // Do NOT generate if transitioning from 'wrong' (Retry same problem)
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
            if (currentStep === 2) targetVal = currentProblem.step2_val;
            if (currentStep === 3) targetVal = currentProblem.step3_val;

            isStepCorrect = numInput === targetVal;

            if (isStepCorrect) {
                registerEvent({ type: 'correct', isFinal: currentStep === 3 });

                // Store completed input
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
            // Limit input length based on expected magnitude
            if (userInput.length < 3) {
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
