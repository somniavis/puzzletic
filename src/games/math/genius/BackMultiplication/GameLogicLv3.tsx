import { useState, useCallback, useEffect } from 'react';
import { playButtonSound, playClearSound } from '../../../../utils/sound';

export interface BackMultiplicationProblemLv3 {
    num1: number; // Top number (e.g. 83)
    num2: number; // Bottom number (e.g. 46)

    // Step Targets (Strings for loosen comparison/display)
    step1_target: string; // Units x Units (e.g. 3x6=18)
    step2_target: string; // Tens x Tens (e.g. 8x4=32)
    step3_target: string; // Outer: Tens1 x Units2 (e.g. 8x6=48)
    step4_target: string; // Inner: Units1 x Tens2 (e.g. 3x4=12)
    step5_target: string; // Final Sum
}

// Fixed length for partial steps (always 2 digits, padded)
const PAD_LEN = 2;

// Partial interface for the engine helpers we use
interface GameLogicEngine {
    updateScore: (amount: number) => void;
    updateLives: (isCorrect: boolean) => void;
    registerEvent: (event: { type: 'correct' | 'wrong'; isFinal?: boolean }) => void;
}

export const useBackMultiplicationLogicLv3 = (engine: GameLogicEngine) => {
    const [currentProblem, setCurrentProblem] = useState<BackMultiplicationProblemLv3 | null>(null);
    const [currentStep, setCurrentStep] = useState<number>(1); // 1..5
    const [userInput, setUserInput] = useState<string>('');
    const [completedSteps, setCompletedSteps] = useState<{ [key: number]: string }>({});
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

    const { updateScore, updateLives, registerEvent } = engine;

    // Generate Problem
    const generateProblem = useCallback(() => {
        // Random 2-digit numbers (10-99)
        const n1 = Math.floor(Math.random() * 90) + 10;
        const n2 = Math.floor(Math.random() * 90) + 10;

        const u1 = n1 % 10;
        const t1 = Math.floor(n1 / 10);
        const u2 = n2 % 10;
        const t2 = Math.floor(n2 / 10);

        // Step 1: Units x Units (Right aligned)
        const s1 = u1 * u2;
        // Step 2: Tens x Tens (Left aligned)
        const s2 = t1 * t2;
        // Step 3: Outer (T1 x U2)
        const s3 = t1 * u2;
        // Step 4: Inner (U1 x T2)
        const s4 = u1 * t2;
        // Step 5: Final
        const final = n1 * n2;

        setCurrentProblem({
            num1: n1,
            num2: n2,
            step1_target: s1.toString().padStart(PAD_LEN, '0'),
            step2_target: s2.toString().padStart(PAD_LEN, '0'),
            step3_target: s3.toString().padStart(PAD_LEN, '0'),
            step4_target: s4.toString().padStart(PAD_LEN, '0'),
            step5_target: final.toString()
        });
        setCurrentStep(1);
        setUserInput('');
        setCompletedSteps({});
        setFeedback(null);
    }, []);

    // Initial Load
    useEffect(() => {
        generateProblem();
    }, [generateProblem]);

    // Handle Input
    const handleInput = (val: string) => {
        if (feedback) return; // Block input during feedback animation

        if (val === 'CHECK') return; // Ignore Check key (Auto-check enabled)

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

        // Determine max length based on current step
        let maxLength = 2; // Steps 1-4 are 2 digits
        if (currentStep === 5) maxLength = currentProblem.step5_target.length;

        if (userInput.length < maxLength) {
            playButtonSound();
            const nextInput = userInput + val;
            setUserInput(nextInput);

            // Auto-Check if full length reached
            if (nextInput.length === maxLength) {
                checkAnswer(nextInput, currentProblem);
            }
        }
    };

    const checkAnswer = (input: string, problem: BackMultiplicationProblemLv3) => {
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
                    registerEvent({ type: 'correct' });
                    updateScore(100);
                    generateProblem();
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
        handleInput
    };
};
