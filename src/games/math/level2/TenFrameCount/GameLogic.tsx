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
        // ALLOW 'wrong' state interaction to enable rapid retry
        // engine.gameState checks if playing. 
        // We want to allow clicking even if we just clicked wrong (which might put us in a brief state if we used submitAnswer(false)).
        // But here we will NOT use submitAnswer(false) which blocks, we will manually handle penalty.

        if (engine.gameState !== 'playing' && engine.gameState !== 'wrong') return;

        if (selected === gameState.targetNumber) {
            // Correct: Use full submitAnswer to handle score/streak/stats/progression
            engine.submitAnswer(true);
            engine.registerEvent({ type: 'correct', isFinal: true });

            // Next Round
            setTimeout(() => {
                generateQuestion(gameState.round + 1);
            }, 1000);
        } else {
            // Wrong: Manual handling to avoid '1.5s freeze' from engine.submitAnswer(false)
            // We want "Rapid Retry" style.

            // 1. Play feedback
            engine.registerEvent({ type: 'wrong' });

            // 2. Penalties
            // engine.updateLives(false) -> decrements life, checks gameover. 
            // NOTE: It does NOT set gameState='wrong' unless lives<=0. So this is safe!
            engine.updateLives(false);

            // 3. Reset Streak
            engine.updateStreak(false);

            // 4. Update Stats Manually (since we skipped submitAnswer)
            // We can't easily access 'stats' setter from here via 'engine' unless exposed?
            // useGameEngine exposes 'stats' value but not 'setStats'.
            // Actually, does 'submitAnswer(false)' strictly block?
            // It sets setGameState('wrong').
            // If we avoid submitAnswer(false), we avoid block.
            // BUT we miss out on 'stats.wrong' increment.
            // Let's check useGameEngine again... 'stats' is updated inside submitAnswer.
            // We need a way to update stats without blocking.
            // OR we accept blocking but remove the 'gameState !== playing' check?
            // If we remove the check, handleAnswer runs. 
            // calling submitAnswer(false) again while 'wrong' might be weird?
            // It just sets state 'wrong' again (overlap timer). It works.

            // Simplest fix is purely allowing the check at the top:
            // if (engine.gameState !== 'playing' && engine.gameState !== 'wrong') return;
            // AND calling submitAnswer(false).
            // This will keep restarting the 1.5s timer but allowing inputs.
            // It correctly updates stats/lives.

            engine.submitAnswer(false);
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
