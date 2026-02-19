import { useState, useCallback, useEffect, useRef } from 'react';
import { playButtonSound, playClearSound } from '../../../../utils/sound';

export interface BackMultiplicationProblemLv4 {
    num1: number; // Top number (e.g. 83)
    num2: number; // Bottom number (e.g. 46)

    // Step Targets (Strings for loosen comparison/display)
    step1_target: string; // Units x Units (e.g. 3x6=18)
    step2_target: string; // Tens x Tens (e.g. 8x4=32)
    step3_target: string; // Outer: Tens1 x Units2 (e.g. 8x6=48)
    step4_target: string; // Inner: Units1 x Tens2 (e.g. 3x4=12)
    step5_target: string; // Final Sum
}

// Partial interface for the engine helpers we use
interface GameLogicEngine {
    gameState: 'idle' | 'playing' | 'correct' | 'wrong' | 'gameover';
    updateScore: (amount: number) => void;
    updateLives: (isCorrect: boolean) => void;
    registerEvent: (event: { type: 'correct' | 'wrong'; isFinal?: boolean }) => void;
    submitAnswer: (isCorrect: boolean, options?: any) => void;
    lives: number;
}

export const useBackMultiplicationLogicLv4 = (engine: GameLogicEngine) => {
    const { gameState, registerEvent, submitAnswer, updateScore, updateLives, lives } = engine;

    const [currentProblem, setCurrentProblem] = useState<BackMultiplicationProblemLv4 | null>(null);
    const [currentStep, setCurrentStep] = useState<number>(1); // 1..5
    const [userInput, setUserInput] = useState<string>('');
    const [completedSteps, setCompletedSteps] = useState<{ [key: number]: string }>({});
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const solvedCountRef = useRef(0);

    // Generate Problem
    const generateProblem = useCallback(() => {
        let n1 = 0, n2 = 0, s1 = 0, s2 = 0, s3 = 0, s4 = 0, final = 0;
        const stage = solvedCountRef.current;
        let attempts = 0;

        while (attempts < 5000) {
            n1 = Math.floor(Math.random() * 90) + 10;
            n2 = Math.floor(Math.random() * 90) + 10;

            const u1 = n1 % 10;
            const t1 = Math.floor(n1 / 10);
            const u2 = n2 % 10;
            const t2 = Math.floor(n2 / 10);

            s1 = u1 * u2;
            s2 = t1 * t2;
            s3 = t1 * u2;
            s4 = u1 * t2;
            final = n1 * n2;

            // Check carries during final addition:
            // tens column = s1_tens + s3_units + s4_units
            const c2_sum = Math.floor(s1 / 10) + (s3 % 10) + (s4 % 10);
            const c2_carry = Math.floor(c2_sum / 10);

            // hundreds column = s2_units + s3_tens + s4_tens + carry-from-tens
            const c1_sum = (s2 % 10) + Math.floor(s3 / 10) + Math.floor(s4 / 10) + c2_carry;
            const c1_carry = Math.floor(c1_sum / 10);

            const uuTwoDigits = s1 >= 10;
            const ttTwoDigits = s2 >= 10;
            const tensCarry = c2_carry > 0;
            const hundredsCarry = c1_carry > 0;

            const isValid =
                ((stage === 0 || stage === 1) &&
                    uuTwoDigits &&
                    ttTwoDigits &&
                    !tensCarry &&
                    !hundredsCarry) ||
                (stage === 2 &&
                    tensCarry &&
                    !hundredsCarry) ||
                (stage === 3 &&
                    !tensCarry &&
                    hundredsCarry) ||
                (stage >= 4);

            if (isValid) {
                break;
            }
            attempts++;
        }

        setCurrentProblem({
            num1: n1,
            num2: n2,
            step1_target: s1.toString(),
            step2_target: s2.toString(),
            step3_target: s3.toString(),
            step4_target: s4.toString(),
            step5_target: final.toString()
        });
        setCurrentStep(1);
        setUserInput('');
        setCompletedSteps({});
        setFeedback(null);
    }, []);

    // Initial Load & Restart Handler
    useEffect(() => {
        if (gameState === 'playing') {
            generateProblem();
        }
    }, [gameState, generateProblem]);

    useEffect(() => {
        if (gameState === 'idle' || gameState === 'gameover') {
            solvedCountRef.current = 0;
        }
    }, [gameState]);

    // Handle Input
    const handleInput = (val: string) => {
        if (feedback) return; // Block input during feedback animation

        if (val === 'CHECK') {
            if (userInput.length > 0 && currentProblem) {
                checkAnswer(userInput, currentProblem);
            }
            return;
        }

        if (val === 'AC') {
            setUserInput('');
            playButtonSound();
            return;
        }

        if (val === 'BS') {
            setUserInput(prev => prev.slice(0, -1));
            playButtonSound();
            return;
        }

        if (!currentProblem) return;

        // Determine max length based on current step target length
        let maxLength = currentProblem.step1_target.length;
        if (currentStep === 2) maxLength = currentProblem.step2_target.length;
        else if (currentStep === 3) maxLength = currentProblem.step3_target.length;
        else if (currentStep === 4) maxLength = currentProblem.step4_target.length;
        else if (currentStep === 5) maxLength = currentProblem.step5_target.length;

        if (userInput.length < maxLength) {
            playButtonSound();
            const nextInput = userInput + val;
            setUserInput(nextInput);
        }
    };

    const checkAnswer = (input: string, problem: BackMultiplicationProblemLv4) => {
        let target = '';
        if (currentStep === 1) target = problem.step1_target;
        else if (currentStep === 2) target = problem.step2_target;
        else if (currentStep === 3) target = problem.step3_target;
        else if (currentStep === 4) target = problem.step4_target;
        else if (currentStep === 5) target = problem.step5_target;

        if (input === target) {
            // Correct
            setFeedback('correct');
            playClearSound();

            setTimeout(() => {
                setFeedback(null);
                setCompletedSteps(prev => ({ ...prev, [currentStep]: input }));

                if (currentStep < 5) {
                    setCurrentStep(prev => prev + 1);
                    setUserInput('');
                } else {
                    // Game Over / Next Round
                    solvedCountRef.current += 1;
                    registerEvent({ type: 'correct' });
                    updateScore(100);
                    submitAnswer(true);
                    setTimeout(() => generateProblem(), 1500);
                }
            }, 600); // Delay for visual feedback
        } else {
            // Wrong
            setFeedback('wrong');
            playButtonSound();
            registerEvent({ type: 'wrong' });
            updateLives(false);

            setTimeout(() => {
                setFeedback(null);
                setUserInput(''); // Clear wrong input
            }, 600);
        }
    };

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
