import { useState, useCallback, useEffect } from 'react';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';

export interface BackMultiplicationProblem {
    a: number; // 1 digit (X)
    b: number; // 1 digit (Y)

    // Logic Values
    step1_val: number; // Total (X * Y)

    // Target String
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
    // Level 1 is single step (direct answer)
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [prevGameState, setPrevGameState] = useState(gameState);

    const generateProblem = useCallback(() => {
        // Level 1: 1-digit x 1-digit
        // Range: [2, 9] x [2, 9]
        const a = Math.floor(Math.random() * 8) + 2;
        const b = Math.floor(Math.random() * 8) + 2;

        const total = a * b;

        const problem: BackMultiplicationProblem = {
            a, b,
            step1_val: total,
            step1_str: total.toString()
        };

        setCurrentProblem(problem);
        setUserInput('');
        setFeedback(null);
    }, []);

    // Reset state
    useEffect(() => {
        if (gameState === 'idle') {
            setCurrentProblem(null);
            setUserInput('');
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
            const isCorrect = userInput === currentProblem.step1_str;

            if (isCorrect) {
                registerEvent({ type: 'correct', isFinal: true });
                setFeedback('correct');
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
            // Max length is length of total (1 or 2 digits)
            const maxLen = currentProblem.step1_str.length;
            if (userInput.length < maxLen) {
                setUserInput(prev => prev + key);
            }
        }
    }, [gameState, feedback, userInput, currentProblem, submitAnswer, registerEvent, generateProblem]);

    return {
        currentProblem,
        userInput,
        feedback,
        handleInput,
        lives
    };
};
