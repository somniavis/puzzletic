
import { useState, useCallback, useEffect } from 'react';
import { useGameEngine } from '../../../../layouts/Standard/Layout0/useGameEngine';

export interface CargoProblem {
    fixed: number;   // Value on the fixed car (e.g. 13)
    target: number;  // Value on the engine (e.g. 30)
    missing: number; // The correct answer (e.g. 17)
    options: number[]; // 4 choices including the answer
}

export const useCargoTrainLogic = () => {
    // 1. Initialize Standard Engine
    const engine = useGameEngine({
        initialLives: 3,
        initialTime: 60
    });

    // 2. Game Specific State
    const [currentProblem, setCurrentProblem] = useState<CargoProblem | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // 3. Problem Generation
    const generateProblem = useCallback(() => {
        // Level 2 Config: Target 20-99
        const target = Math.floor(Math.random() * 80) + 20;

        // Fixed part (ensure at least 1, and leaving at least 1 for missing)
        const fixed = Math.floor(Math.random() * (target - 2)) + 1;
        const missing = target - fixed;

        // Generate Distractors
        const options = new Set<number>();
        options.add(missing);

        while (options.size < 4) {
            // Distractors roughly in range of the missing number (+- 10 or random)
            let d = missing + Math.floor(Math.random() * 21) - 10;
            if (d <= 0) d = 1; // logical minimum
            if (d !== missing && !options.has(d)) {
                options.add(d);
            }
        }

        // Convert to array and shuffle
        const shuffledOptions = Array.from(options).sort(() => Math.random() - 0.5);

        setCurrentProblem({
            fixed,
            target,
            missing,
            options: shuffledOptions
        });

        setIsTransitioning(false);
    }, []);

    // 4. Start Game / Init
    useEffect(() => {
        if (engine.gameState === 'playing' && !currentProblem) {
            generateProblem();
        }
    }, [engine.gameState, currentProblem, generateProblem]);

    // 5. Interaction Handler
    const checkAnswer = useCallback((selectedNodes: number) => {
        if (!currentProblem || isTransitioning || engine.gameState !== 'playing') return;

        const isCorrect = selectedNodes === currentProblem.missing;

        // Register event with Engine (Triggers Layout2 Feedback)
        engine.registerEvent({ type: isCorrect ? 'correct' : 'wrong', isFinal: true });
        engine.submitAnswer(isCorrect);

        if (isCorrect) {
            setIsTransitioning(true);
            setTimeout(() => {
                generateProblem();
            }, 2500); // Wait for Feedback (1.5s) + Departure Animation (1s)
        }
    }, [currentProblem, isTransitioning, engine, generateProblem]);

    return {
        ...engine,           // Spread standard props (lives, score, time, powerUps...)
        currentProblem,      // The active problem data
        checkAnswer,         // Hook to call when dropped
        isTransitioning      // Flag for animations
    };
};
