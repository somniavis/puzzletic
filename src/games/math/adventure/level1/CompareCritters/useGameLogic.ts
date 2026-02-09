import React, { useState, useCallback, useEffect } from 'react';
import { useGameEngine } from '../../../../layouts/Standard/Layout0/useGameEngine';

const ANIMALS = ['🦁', '🐯', '🐻', '🐨', '🐼', '🐹', '🐰', '🦊', '🐶', '🐱', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🐺', '🐗', '🐴', '🦄'];

export const useCompareCrittersLogic = (engine: ReturnType<typeof useGameEngine>) => {
    const [leftCount, setLeftCount] = useState(0);
    const [rightCount, setRightCount] = useState(0);
    const [currentAnimal, setCurrentAnimal] = useState(ANIMALS[0]);

    const generateProblem = useCallback(() => {
        const left = Math.floor(Math.random() * 21); // 0-20
        let right = Math.floor(Math.random() * 21); // 0-20

        // Ensure not too many equality cases (optional, but good for variety)
        // logic is fine as is for random distribution

        setLeftCount(left);
        setRightCount(right);
        setCurrentAnimal(ANIMALS[Math.floor(Math.random() * ANIMALS.length)]);
    }, []);

    // Initial problem
    useEffect(() => {
        generateProblem();
    }, [generateProblem]);

    const isMounted = React.useRef(true);
    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    const handleAnswer = useCallback((operator: '>' | '<' | '=') => {
        // Debounce via engine state or local lock if needed. 

        let isCorrect = false;
        if (operator === '>') isCorrect = leftCount > rightCount;
        else if (operator === '<') isCorrect = leftCount < rightCount;
        else if (operator === '=') isCorrect = leftCount === rightCount;

        // Submit to engine. Engine triggers Layout2 effects (sound, particles, shake).
        engine.submitAnswer(isCorrect);
        // Explicitly register event for Layout2 feedback (sound/effects)
        engine.registerEvent({ type: isCorrect ? 'correct' : 'wrong' });

        // If correct, generate new problem. 
        if (isCorrect) {
            setTimeout(() => {
                if (isMounted.current) {
                    generateProblem();
                }
            }, 1000); // Wait for animation
        }
        // If wrong, engine handles lives/shake.
    }, [leftCount, rightCount, engine, generateProblem]);

    return {
        leftCount,
        rightCount,
        currentAnimal,
        handleAnswer
    };
};
