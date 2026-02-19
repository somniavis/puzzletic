import { useState, useCallback, useEffect } from 'react';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';

export interface FrontSubtractionProblem {
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
    step1_val: number; // Hundreds diff or Tens diff
    step2_val: number;
    step3_val: number;
    step4_val?: number; // Intermediate Step (e.g. 30-1 = 29)
    step5_val?: number; // Total

    // Negative Flags (for Bar Numbers)
    step1_is_negative?: boolean;
    step2_is_negative?: boolean;
    step3_is_negative?: boolean;

    totalSteps: 3 | 4 | 5;
}

export const useGameLogic = (engine: ReturnType<typeof useGameEngine>, gameId?: string) => {
    const {
        lives,
        submitAnswer,
        gameState,
        registerEvent
    } = engine;

    const [currentProblem, setCurrentProblem] = useState<FrontSubtractionProblem | null>(null);
    const [userInput, setUserInput] = useState<string>('');
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

    const [completedSteps, setCompletedSteps] = useState<{
        step1: string | null;
        step2: string | null;
        step3: string | null;
        step4: string | null;
        step5: string | null;
    }>({ step1: null, step2: null, step3: null, step4: null, step5: null });

    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [prevGameState, setPrevGameState] = useState(gameState);
    const [lv1GeneratedCount, setLv1GeneratedCount] = useState(0);
    const [lv2GeneratedCount, setLv2GeneratedCount] = useState(0);
    const [lv3GeneratedCount, setLv3GeneratedCount] = useState(0);

    const generateProblem = useCallback(() => {
        let a = 0, b = 0;
        let is3Digit = false;

        // Weighted Unit Generation Helper: 80% Borrow (uA < uB), 20% Normal (uA >= uB)
        const getWeightedUnits = () => {
            const wantBorrow = Math.random() < 0.8;
            let uA, uB;
            if (wantBorrow) {
                // Borrow Case: uA < uB. uB must be >= 1.
                uB = Math.floor(Math.random() * 9) + 1; // 1-9
                uA = Math.floor(Math.random() * uB);    // 0 to uB-1
            } else {
                // Normal Case: uA >= uB.
                uB = Math.floor(Math.random() * 10); // 0-9
                uA = Math.floor(Math.random() * (10 - uB)) + uB; // uB to 9
            }
            return { uA, uB, wantBorrow };
        };

        if (gameId === 'front-subtraction-lv4') {
            // Level 4: 3-digit - 3-digit
            const { uA, uB } = getWeightedUnits();
            const prefixA = Math.floor(Math.random() * 90) + 10;
            const prefixB = Math.floor(Math.random() * (prefixA - 10)) + 10;
            a = prefixA * 10 + uA;
            b = prefixB * 10 + uB;
            is3Digit = true;

        } else if (gameId === 'front-subtraction-lv3') {
            // Level 3: 3-digit - 2-digit
            const stage = lv3GeneratedCount;
            const hA = Math.floor(Math.random() * 9) + 1;
            let tA: number, tB: number, uA: number, uB: number;

            if (stage === 0) {
                // 1st: H direct, T direct, U direct
                tB = Math.floor(Math.random() * 8) + 1; // 1-8
                tA = Math.floor(Math.random() * (9 - tB)) + (tB + 1); // (tB+1)-9
                uB = Math.floor(Math.random() * 10); // 0-9
                uA = Math.floor(Math.random() * (10 - uB)) + uB; // uB-9
            } else if (stage < 3) {
                // 2nd-3rd: H direct, T direct, U borrow
                tB = Math.floor(Math.random() * 8) + 1; // 1-8
                tA = Math.floor(Math.random() * (9 - tB)) + (tB + 1); // (tB+1)-9
                uB = Math.floor(Math.random() * 9) + 1; // 1-9
                uA = Math.floor(Math.random() * uB); // 0-(uB-1)
            } else if (stage < 5) {
                // 4th-5th: H direct, T borrow, U direct
                tB = Math.floor(Math.random() * 9) + 1; // 1-9
                tA = Math.floor(Math.random() * tB); // 0-(tB-1)
                uB = Math.floor(Math.random() * 10); // 0-9
                uA = Math.floor(Math.random() * (10 - uB)) + uB; // uB-9
            } else if (stage < 7) {
                // 6th-7th: H direct, T borrow, U borrow
                tB = Math.floor(Math.random() * 9) + 1; // 1-9
                tA = Math.floor(Math.random() * tB); // 0-(tB-1)
                uB = Math.floor(Math.random() * 9) + 1; // 1-9
                uA = Math.floor(Math.random() * uB); // 0-(uB-1)
            } else {
                // 8th+: random (with T non-zero diff rule maintained)
                tB = Math.floor(Math.random() * 9) + 1; // 1-9
                tA = Math.floor(Math.random() * 10); // 0-9
                while (tA === tB) {
                    tA = Math.floor(Math.random() * 10);
                }
                uA = Math.floor(Math.random() * 10); // 0-9
                uB = Math.floor(Math.random() * 10); // 0-9
            }

            a = hA * 100 + tA * 10 + uA;
            b = tB * 10 + uB;
            is3Digit = true;

        } else if (gameId === 'front-subtraction-lv2') {
            // Level 2: 2-digit - 2-digit
            const stage = lv2GeneratedCount;
            do {
                let tA, tB, uA, uB;

                if (stage < 2) {
                    // 1st-2nd problems:
                    // - Tens: direct subtraction (tA > tB)
                    // - Units: direct subtraction (uA >= uB)
                    tB = Math.floor(Math.random() * 8) + 1; // 1-8
                    tA = Math.floor(Math.random() * (9 - tB)) + (tB + 1); // (tB+1)-9
                    uB = Math.floor(Math.random() * 10); // 0-9
                    uA = Math.floor(Math.random() * (10 - uB)) + uB; // uB-9
                } else if (stage < 4) {
                    // 3rd-4th problems:
                    // - Tens: direct subtraction, tens result within 30 (0 < tA - tB <= 3)
                    // - Units: borrow case (uA < uB)
                    tB = Math.floor(Math.random() * 8) + 1; // 1-8
                    const minTA = tB + 1;
                    const maxTA = Math.min(9, tB + 3);
                    tA = Math.floor(Math.random() * (maxTA - minTA + 1)) + minTA; // (tB+1)-maxTA
                    uB = Math.floor(Math.random() * 9) + 1; // 1-9
                    uA = Math.floor(Math.random() * uB); // 0-(uB-1)
                } else {
                    // 5th+ problems: fully random (valid 2-digit - 2-digit range)
                    tB = Math.floor(Math.random() * 8) + 1; // 1-8
                    tA = Math.floor(Math.random() * (9 - tB)) + (tB + 1); // (tB+1)-9
                    uA = Math.floor(Math.random() * 10);
                    uB = Math.floor(Math.random() * 10);
                }

                a = tA * 10 + uA;
                b = tB * 10 + uB;
            } while (a === b);

        } else {
            // Level 1: 2-digit - 1-digit
            const stage = lv1GeneratedCount;
            let tA: number;
            let uA: number;
            let uB: number;

            if (stage === 0) {
                // First problem:
                // - Units: directly subtractable (uA >= uB)
                tA = Math.floor(Math.random() * 9) + 1;
                uB = Math.floor(Math.random() * 10); // 0-9
                uA = Math.floor(Math.random() * (10 - uB)) + uB; // uB-9
            } else if (stage === 1) {
                // Second problem:
                // - Tens digit fixed to 1
                // - Units: borrow case (uA < uB)
                tA = 1;
                uB = Math.floor(Math.random() * 9) + 1; // 1-9
                uA = Math.floor(Math.random() * uB); // 0-(uB-1)
            } else if (stage === 2) {
                // Third problem:
                // - Tens digit fixed to 2
                // - Units: borrow case (uA < uB)
                tA = 2;
                uB = Math.floor(Math.random() * 9) + 1; // 1-9
                uA = Math.floor(Math.random() * uB); // 0-(uB-1)
            } else {
                // From fourth problem: fully random
                tA = Math.floor(Math.random() * 9) + 1;
                uA = Math.floor(Math.random() * 10);
                uB = Math.floor(Math.random() * 10);
            }

            a = tA * 10 + uA;
            b = uB;
        }

        const hA = Math.floor(a / 100);
        const tA = Math.floor((a % 100) / 10);
        const uA = a % 10;

        const hB = Math.floor(b / 100);
        const tB = Math.floor((b % 100) / 10);
        const uB = b % 10;

        let problem: FrontSubtractionProblem;

        if (is3Digit) {
            // 3-digit Logic (Front Subtraction with Bar Numbers)

            // Step 1: Hundreds Diff (Assume Positive for now as Lv3/Lv4 usually A > B)
            const s1 = hA - hB;
            const step1_is_negative = s1 < 0;
            const val1 = step1_is_negative ? (hB - hA) : s1;

            // Step 2: Tens Diff (Can be Negative/Bar)
            let s2 = tA - tB;
            let step2_is_negative = false;
            let val2 = s2;
            if (s2 < 0) {
                step2_is_negative = true;
                val2 = tB - tA; // Flip for "Bar Number"
            }

            // Step 3: Units Diff (Can be Negative/Bar)
            let s3 = uA - uB;
            let step3_is_negative = false;
            let val3 = s3;
            if (s3 < 0) {
                step3_is_negative = true;
                val3 = uB - uA; // Flip for "Bar Number"
            }

            // Step 4: Intermediate Result (Combining Hundreds and Tens)
            // Logic: H_unit (val1) * 10 + T_signed_val
            // e.g. 30 - 1 = 29.
            const tSigned = step2_is_negative ? -val2 : val2;
            const val4 = (val1 * 10) + tSigned;

            // Step 5: Final Total (Combining Intermediate + Units)
            const total = a - b;

            problem = {
                a, b,
                row1_hundreds: hA,
                row1_tens: tA,
                row1_units: uA,
                row2_hundreds: hB === 0 ? null : hB,
                row2_tens: tB,
                row2_units: uB,
                step1_val: val1,
                step2_val: val2,
                step3_val: val3,
                // When T is NOT negative, skip Intermediate step. Step 4 becomes Total.
                step4_val: step2_is_negative ? val4 : total,
                step5_val: total,
                step1_is_negative: step1_is_negative,
                step2_is_negative: step2_is_negative,
                step3_is_negative: step3_is_negative,
                totalSteps: step2_is_negative ? 5 : 4 // 4 steps when T is not negative (skip Intermediate)
            };
        } else {
            // 2-digit Logic (Focused on User Request)
            // Step 1: Tens Subtraction
            // For 2d - 1d: Tens is just A's tens (since B's tens is 0)
            // For 2d - 2d: Tens is A - B

            const tensDiff = tA - tB; // e.g. 8 - 0 = 8

            // Step 2: Units Subtraction (The Flip Logic)
            let unitsDiff = 0;
            let unitsNegative = false;

            if (uA >= uB) {
                // Case 1: Normal
                unitsDiff = uA - uB;
                unitsNegative = false;
            } else {
                // Case 2: Borrow (Flip)
                unitsDiff = uB - uA; // e.g. 7 - 4 = 3
                unitsNegative = true;
            }

            // Step 3: Total
            // If negative: (Tens * 10) - Units
            // If positive: (Tens * 10) + Units  <-- Wait, strictly it's Tens + Units. 
            // But conceptually: 80 + 2 = 82 vs 80 - 3 = 77.
            // The logic: 
            // Case 1: 80 (Tens) + 2 (Units) = 82
            // Case 2: 80 (Tens) - 3 (Units) = 77

            const total = a - b;

            problem = {
                a, b,
                row1_hundreds: null,
                row1_tens: tA,
                row1_units: uA,
                row2_hundreds: null,
                row2_tens: tB === 0 ? null : tB,
                row2_units: uB,
                step1_val: tensDiff,
                step2_val: unitsDiff,
                step3_val: total,
                step1_is_negative: tensDiff < 0, // Shouldn't happen for valid a > b
                step2_is_negative: unitsNegative,
                totalSteps: 3
            };
        }

        setCurrentProblem(problem);
        setUserInput('');
        setCompletedSteps({ step1: null, step2: null, step3: null, step4: null, step5: null });
        setCurrentStep(1);
        setFeedback(null);
        if (!gameId || gameId === 'front-subtraction-lv1') {
            setLv1GeneratedCount(prev => prev + 1);
        } else if (gameId === 'front-subtraction-lv2') {
            setLv2GeneratedCount(prev => prev + 1);
        } else if (gameId === 'front-subtraction-lv3') {
            setLv3GeneratedCount(prev => prev + 1);
        }
    }, [gameId, lv1GeneratedCount, lv2GeneratedCount, lv3GeneratedCount]);

    // Reset state
    useEffect(() => {
        if (gameState === 'idle' || gameState === 'gameover') {
            setCurrentProblem(null);
            setUserInput('');
            setCompletedSteps({ step1: null, step2: null, step3: null, step4: null, step5: null });
            setCurrentStep(1);
            setFeedback(null);
            setLv1GeneratedCount(0);
            setLv2GeneratedCount(0);
            setLv3GeneratedCount(0);
        }
    }, [gameState]);

    useEffect(() => {
        setLv1GeneratedCount(0);
        setLv2GeneratedCount(0);
        setLv3GeneratedCount(0);
    }, [gameId]);

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
            else if (currentStep === 5 && currentProblem.step5_val !== undefined) targetVal = currentProblem.step5_val;

            isStepCorrect = numInput === targetVal;

            if (isStepCorrect) {
                registerEvent({ type: 'correct', isFinal: currentStep === currentProblem.totalSteps });
                setCompletedSteps(prev => ({
                    ...prev,
                    [`step${currentStep}`]: userInput
                }));

                if (currentStep < currentProblem.totalSteps) {
                    setUserInput('');
                    setCurrentStep(prev => (prev + 1) as 1 | 2 | 3 | 4 | 5);
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
