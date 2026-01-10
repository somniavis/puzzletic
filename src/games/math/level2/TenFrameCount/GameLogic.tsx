import { useState, useCallback, useEffect, useRef } from 'react';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';
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

        // Position-First Option Generation Strategy
        // Ensure Target Position is valid for the Target Number
        // e.g. If Target=1, it MUST be at index 0 (0 items smaller).
        // If Target=2, it can be at 0 or 1.
        // If Target=3, it can be at 0, 1, or 2.
        // If Target>=4, it can be anywhere (0..3).
        const maxPos = Math.min(3, target - 1);
        const targetPos = Math.floor(Math.random() * (maxPos + 1));

        const sortedOptions = new Array(4).fill(0);
        sortedOptions[targetPos] = target;

        // Fill Left (Smaller)
        for (let i = targetPos - 1; i >= 0; i--) {
            const ceiling = sortedOptions[i + 1];
            // Safe to decrement because we ensured proper space exists via maxPos constraint
            let val = ceiling - 1;

            // Try meaningful distractors if space allows
            // e.g. if ceiling=10, we can pick 9, 1, 5...
            // If ceiling=2, MUST be 1.

            const candidates = [target - 10, target - 1, target - range.min];
            const valid = candidates.filter(c => c > 0 && c < ceiling && !sortedOptions.includes(c));

            if (valid.length > 0) {
                val = valid[Math.floor(Math.random() * valid.length)];
            } else {
                // If smart distractors fail, try random offset
                // But fallback to strictly sequential descending if needed
                val = ceiling - (Math.floor(Math.random() * 3) + 1);
                // Ensure strictly positive and less than ceiling
                if (val <= 0) val = 1;
                while (val >= ceiling || sortedOptions.includes(val)) {
                    val--;
                    if (val <= 0) {
                        // Should technically not happen due to maxPos constraint, 
                        // but strictly enforce sequential filler if logic breaks
                        val = sortedOptions[i + 1] - 1;
                    }
                }
            }
            sortedOptions[i] = val;
        }

        // Fill Right (Larger)
        for (let i = targetPos + 1; i < 4; i++) {
            const floor = sortedOptions[i - 1];
            let val = floor + 1;

            const candidates = [target + 10, target + 1];
            const valid = candidates.filter(c => c > floor && c <= 99 && !sortedOptions.includes(c));

            if (valid.length > 0) {
                val = valid[Math.floor(Math.random() * valid.length)];
            } else {
                val = floor + (Math.floor(Math.random() * 3) + 1);
                while (sortedOptions.includes(val)) val++;
            }
            sortedOptions[i] = val;
        }

        setGameState({
            targetNumber: target,
            options: sortedOptions,
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


    // Ref for synchronous debounce
    const isProcessing = useRef(false);

    const handleAnswer = (selected: number) => {
        // ALLOW 'wrong' state interaction to enable rapid retry
        // engine.gameState checks if playing. 
        if (engine.gameState !== 'playing' && engine.gameState !== 'wrong') return;

        // Block if processing transition
        if (isProcessing.current) return;

        if (selected === gameState.targetNumber) {
            // Lock inputs
            isProcessing.current = true;

            // Correct: Use full submitAnswer to handle score/combo/stats/progression
            engine.submitAnswer(true);
            engine.registerEvent({ type: 'correct', isFinal: true });

            // Next Round
            setTimeout(() => {
                generateQuestion(gameState.round + 1);
                // Add safety cooldown to prevent ghost clicks on new elements
                setTimeout(() => {
                    isProcessing.current = false;
                }, 300);
            }, 1000);
        } else {
            // Wrong: Manual handling to avoid '1.5s freeze' from engine.submitAnswer(false)
            // We want "Rapid Retry" style.

            // Note: Since we allow rapid retry, we do NOT lock isProcessing here unless we want a tiny cooldown?
            // Let's add a micro-debounce (300ms) to prevent accidental double-taps on WRONG answers too
            isProcessing.current = true;
            setTimeout(() => { isProcessing.current = false; }, 300);

            // 1. Play feedback
            engine.registerEvent({ type: 'wrong' });

            // 2. Penalties
            // engine.updateLives(false) -> decrements life, checks gameover. 
            // NOTE: It does NOT set gameState='wrong' unless lives<=0. So this is safe!

            // 3. Reset Combo
            engine.updateCombo(false);

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
