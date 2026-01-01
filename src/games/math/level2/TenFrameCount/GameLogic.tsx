import { useState, useCallback, useEffect } from 'react';
import { useGameEngine } from '../../../layouts/Layout0/useGameEngine';
import { TEN_FRAME_COUNT_CONSTANTS, TEN_FRAME_COUNT_EMOJIS } from './constants';
import type { TenFrameCountState } from './types';

export const useTenFrameCountLogic = () => {
    const engine = useGameEngine({
        initialLives: TEN_FRAME_COUNT_CONSTANTS.BASE_LIVES,
        initialTime: TEN_FRAME_COUNT_CONSTANTS.TIME_LIMIT
    });

    const [gameState, setGameState] = useState<TenFrameCountState>({
        targetNumber: 0,
        options: [],
        emoji: '🍎',
        round: 1
    });

    const generateQuestion = useCallback((currentRound: number) => {
        // Determine Difficulty Range
        let range = TEN_FRAME_COUNT_CONSTANTS.DIFFICULTY.INTRO;
        if (currentRound > 3) range = TEN_FRAME_COUNT_CONSTANTS.DIFFICULTY.FULL;

        // Generate Target Number
        // Ensure it's not a multiple of 10 to keep the "incomplete row" concept visible initially?
        // Actually multiples of 10 are fine too (0 ones).
        const target = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;

        // Generate Emoji
        const emoji = TEN_FRAME_COUNT_EMOJIS[Math.floor(Math.random() * TEN_FRAME_COUNT_EMOJIS.length)];

        // Generate Distractors
        const distractors = new Set<number>();

        // Strategy 1: Place Value Error (+/- 10)
        if (target + 10 <= 99) distractors.add(target + 10);
        if (target - 10 >= 1) distractors.add(target - 10);

        // Strategy 2: Counting Error (+/- 1)
        if (target + 1 <= 99) distractors.add(target + 1);
        if (target - 1 >= 1) distractors.add(target - 1);

        // Strategy 3: Reversed Digits (e.g. 23 -> 32)
        const tens = Math.floor(target / 10);
        const ones = target % 10;
        if (tens !== ones && ones !== 0) { // Avoid 22->22, 20 -> 02 (single digit)
            const reversed = ones * 10 + tens;
            if (reversed <= 99 && reversed !== target) distractors.add(reversed);
        }

        // Fill remaining with random close numbers
        while (distractors.size < 3) {
            const d = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
            if (d !== target) distractors.add(d);
        }

        // Select 3 distractors
        const selectedDistractors = Array.from(distractors)
            .sort(() => 0.5 - Math.random()) // Shuffle
            .slice(0, 3);

        const options = [...selectedDistractors, target].sort(() => Math.random() - 0.5);

        setGameState({
            targetNumber: target,
            options,
            emoji,
            round: currentRound
        });

    }, []);

    // Initial Start
    useEffect(() => {
        if (engine.gameState === 'playing' && gameState.targetNumber === 0) {
            generateQuestion(1);
        }
    }, [engine.gameState, generateQuestion, gameState.targetNumber]);


    const handleAnswer = (selected: number) => {
        if (engine.gameState !== 'playing') return;

        if (selected === gameState.targetNumber) {
            // Use submitAnswer to handle stats, score, streak automatically
            engine.submitAnswer(true);
            engine.registerEvent({ type: 'correct', isFinal: true }); // Keep visual event if needed, or submitAnswer does it?
            // submitAnswer sets gameState='correct', but registerEvent sets 'lastEvent' for Layout0 feedback.
            // Layout0 uses lastEvent for particles/sounds. useGameEngine's submitAnswer sets gameState but maybe not lastEvent?
            // Checking useGameEngine: submitAnswer DOES NOT call registerEvent. It sets gameState.
            // But Layout0 feedback depends on lastEvent.
            // So we need BOTH? Or should we use registerEvent?
            // Wait, registerEvent JUST updates lastEvent.
            // submitAnswer updates stats/score/lives.
            // So we need submitAnswer(true) AND registerEvent(...).

            // Next Round
            setTimeout(() => {
                generateQuestion(gameState.round + 1);
            }, 1000);
        } else {
            engine.submitAnswer(false);
            engine.registerEvent({ type: 'wrong' });
            // Do NOT advance round on wrong answer
        }
    };

    return {
        ...engine,
        ...gameState,
        handleAnswer,
        startGame: () => {
            engine.startGame();
            generateQuestion(1);
        }
    };
};
