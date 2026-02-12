
import { useState, useCallback, useEffect } from 'react';
import { useGameEngine } from '../../../../layouts/Standard/Layout0/useGameEngine';

export type ProblemType = 'A' | 'B'; // A: Fixed + [] = Target, B: [] + [] = Target

export interface CargoProblem {
    type: ProblemType;
    fixed: number | null;   // Value on the fixed car (null for Type B)
    target: number;  // Value on the engine
    missing: number[]; // The correct answer(s) (1 for Type A, 2 for Type B)
    options: number[]; // 4 choices
}

const ENGINE_CONFIG = {
    initialLives: 3,
    initialTime: 60
};

export const useCargoTrainLogic = () => {
    // 1. Initialize Standard Engine
    const engine = useGameEngine(ENGINE_CONFIG);

    // 2. Game Specific State
    const [currentProblem, setCurrentProblem] = useState<CargoProblem | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Difficulty State
    const [level, setLevel] = useState(1);
    const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
    const [consecutiveWrong, setConsecutiveWrong] = useState(0);
    const [levelCorrectCount, setLevelCorrectCount] = useState(0);

    // 3. Problem Generation
    const generateProblem = useCallback(() => {
        // Determine Requirements based on Level
        let maxSum = 50;
        let allowCarry = true; // Default true for 1, 2, 4
        let typeBChance = 0; // 0% by default

        if (level === 1 || level === 2) {
            maxSum = 50;
            allowCarry = true; // Level 1-2: Mixed (natural random)
            typeBChance = 0;
        } else if (level === 3) {
            maxSum = 100;
            allowCarry = false; // Level 3: No Carry
            typeBChance = 0.3;  // 30% Type B
        } else if (level === 4) {
            maxSum = 100;
            allowCarry = true;
            typeBChance = 0.3;
        }

        // 1. Determine Type
        const isTypeB = Math.random() < typeBChance;
        const type: ProblemType = isTypeB ? 'B' : 'A';

        // 2. Generate Numbers
        let target = 0;
        let val1 = 0;
        let val2 = 0;

        // Helper to check carry
        const hasCarry = (a: number, b: number) => {
            return (a % 10) + (b % 10) >= 10;
        };

        // Retry loop for valid generation
        while (true) {
            target = Math.floor(Math.random() * (maxSum - 20)) + 20; // 20 ~ maxSum
            val1 = Math.floor(Math.random() * (target - 2)) + 1;
            val2 = target - val1;

            if (val1 <= 0 || val2 <= 0) continue;

            if (!allowCarry && hasCarry(val1, val2)) {
                continue; // Retry if carry exists but not allowed
            }
            break; // Valid pair found
        }

        // 3. Define Missing & Fixed
        let fixed: number | null = null;
        let missing: number[] = [];

        if (type === 'A') {
            fixed = val1;
            missing = [val2];
        } else {
            fixed = null;
            missing = [val1, val2]; // Order doesn't matter for initial missing array
        }

        // 4. Generate Options
        const options = new Set<number>();
        missing.forEach(m => options.add(m));

        while (options.size < 4) {
            // Pick a base from missing values to generate distractors around
            const base = missing[Math.floor(Math.random() * missing.length)];
            let d = base + Math.floor(Math.random() * 21) - 10;

            // Ensure positive
            if (d <= 0) d = 1;

            if (!options.has(d)) {
                options.add(d);
            }
        }

        const shuffledOptions = Array.from(options).sort(() => Math.random() - 0.5);

        setCurrentProblem({
            type,
            fixed,
            target,
            missing,
            options: shuffledOptions
        });

        setIsTransitioning(false);
    }, [level]);

    // 4. Start Game / Init
    useEffect(() => {
        if (engine.gameState === 'playing' && !currentProblem) {
            generateProblem();
        }
    }, [engine.gameState, currentProblem, generateProblem]);

    // 5. Interaction Handler
    // For Type A: selectedNodes is a number (dragged value)
    // For Type B: selectedNodes should be an array of values, but dnd logic might call this one by one or all at once.
    // Let's assume we change index.tsx to handle the aggregation and pass the final set of values here.
    const checkAnswer = useCallback((filledValues: number[]) => {
        if (!currentProblem || isTransitioning || engine.gameState !== 'playing') return;

        // Validation
        let isCorrect = false;

        if (currentProblem.type === 'A') {
            // Expect 1 value
            isCorrect = filledValues[0] === currentProblem.missing[0];
        } else {
            // Type B: Expect 2 values. Sum should match target.
            // AND (strict check?) No, usually just Sum == Target is sufficient if options are constructed well.
            // But strict math 'filling in gaps' implies finding the specific pair?
            // Actually, in 'missing + missing = target', any pair that sums to target is mathematically correct.
            // Since we generated specific pair, let's check if the SUM is correct.
            // HOWEVER, options might contain other pairs?
            // Our generation logic puts random distractors. It's unlikely to form another valid pair by accident 
            // unless we specifically generate 'pair distractors'.
            // For now, let's check exact match with missing values (order agnostic).
            // OR simply check Sum == Target.
            // Let's use SUM check for better UX (if user finds another valid pair, allow it).
            const sum = filledValues.reduce((a, b) => a + b, 0);
            isCorrect = sum === currentProblem.target;
        }

        // Progression Logic
        if (isCorrect) {
            const newConsec = consecutiveCorrect + 1;
            const newLevelTotal = levelCorrectCount + 1;

            setConsecutiveCorrect(newConsec);
            setConsecutiveWrong(0);
            setLevelCorrectCount(newLevelTotal);

            // Level Up Check
            if (newConsec >= 3 || newLevelTotal >= 4) {
                setLevel(prev => Math.min(4, prev + 1));
                // Reset counters for new level
                setConsecutiveCorrect(0);
                setLevelCorrectCount(0);
            }
        } else {
            const newWrong = consecutiveWrong + 1;
            setConsecutiveWrong(newWrong);
            setConsecutiveCorrect(0);

            // Level Down Check
            if (newWrong >= 2) {
                setLevel(prev => Math.max(1, prev - 1));
                // Reset counters
                setConsecutiveWrong(0);
                setLevelCorrectCount(0); // Optional: Reset level progress on drop? usually yes.
            }
        }

        // Register event
        engine.registerEvent({ type: isCorrect ? 'correct' : 'wrong', isFinal: true });
        engine.submitAnswer(isCorrect);

        if (isCorrect) {
            // PowerUp Acquisition Logic (Standard: Combo % 3 == 0, 55% Chance)
            const nextCombo = engine.combo + 1;
            if (nextCombo > 0 && nextCombo % 3 === 0) {
                if (Math.random() < 0.55 && engine.setPowerUps) {
                    const rewards = ['timeFreeze', 'extraLife', 'doubleScore'] as const;
                    const reward = rewards[Math.floor(Math.random() * rewards.length)];
                    engine.setPowerUps(prev => ({ ...prev, [reward]: prev[reward] + 1 }));
                }
            }

            setIsTransitioning(true);
            setTimeout(() => {
                generateProblem();
            }, 2500);
        }
    }, [currentProblem, isTransitioning, engine, generateProblem, consecutiveCorrect, consecutiveWrong, levelCorrectCount]);

    return {
        ...engine,
        currentProblem,
        checkAnswer,
        isTransitioning,
        level // Export level for UI if needed
    };
};
