import { useState, useCallback, useEffect } from 'react';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';

export interface BackMultiplicationProblem {
    a: number; // 1 digit
    b: number; // 1 digit

    // Grid Display
    row1_units: number;
    row2_units: number;

    // Logic Values
    step1_val: number; // a * b (Total)

    // String Expectations
    step1_str: string;
}

export const useBackMultiplicationLogic = (engine: ReturnType<typeof useGameEngine>) => {
    const {
        lives,
        submitAnswer,
        gameState,
        registerEvent
    } = engine;

    const [currentProblem, setCurrentProblem] = useState<BackMultiplicationProblem | null>(null);
    const [userInput, setUserInput] = useState<string>('');
    const [currentStep, setCurrentStep] = useState<1>(1);

    const [completedSteps, setCompletedSteps] = useState<{
        step1: string | null;
    }>({ step1: null });

    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [prevGameState, setPrevGameState] = useState(gameState);

    const generateProblem = useCallback(() => {
        // Level 1: 1-digit x 1-digit
        const a = Math.floor(Math.random() * 9) + 1; // 1-9
        const b = Math.floor(Math.random() * 9) + 1; // 1-9

        const total = a * b;

        const problem: BackMultiplicationProblem = {
            a, b,
            row1_units: a,
            row2_units: b,
            step1_val: total,
            step1_str: total.toString()
        };

        setCurrentProblem(problem);
        setUserInput('');
        setCompletedSteps({ step1: null });
        setCurrentStep(1);
        setFeedback(null);
    }, []);

    // Reset state
    useEffect(() => {
        if (gameState === 'idle') {
            setCurrentProblem(null);
            setUserInput('');
            setCompletedSteps({ step1: null });
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
            const targetStr = currentProblem.step1_str;
            const isStepCorrect = userInput === targetStr;

            if (isStepCorrect) {
                setCompletedSteps({ step1: userInput });
                setFeedback('correct');
                registerEvent({ type: 'correct', isFinal: true });
                submitAnswer(true);
                setTimeout(() => generateProblem(), 1500);
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
            const maxLen = currentProblem.step1_str.length;
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
