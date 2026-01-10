
import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';
import type { Card, PairUpMode } from './types';
import { TWIN_EMOJIS, CONNECT_PAIRS } from './data';



// --- Helpers (Pure Functions) ---
const getRoundConfig = (r: number) => {
    if (r <= 4) return { rows: 2, cols: 2 }; // Round 1-4: 4 cards (2 pairs)
    if (r <= 9) return { rows: 3, cols: 2 }; // Round 5-9: 6 cards (3 pairs) - 2x3
    if (r <= 15) return { rows: 4, cols: 2 }; // Round 10-15: 8 cards (4 pairs) - 2x4
    return { rows: 4, cols: 3 };              // Round 16+: 12 cards (6 pairs) - 3x4
};

const getPreviewTime = (r: number) => {
    if (r <= 4) return 3000; // 3s
    if (r <= 9) return 4000; // 4s
    if (r <= 15) return 5000; // 5s
    return 6000;              // 6s
};

export const usePairUpLogic = (engine: ReturnType<typeof useGameEngine>, mode: PairUpMode) => {
    // --- State ---
    const [cards, setCards] = useState<Card[]>([]);
    const [gameState, setGameState] = useState<'preview' | 'playing'>('preview');
    const [flippedIds, setFlippedIds] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    // Level Progression
    const [round, setRound] = useState(1);

    // Refs
    // Use setTimeout for single transition instead of interval for progress
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // --- Helper: Generate Cards ---
    const generateCards = useCallback(() => {
        const config = getRoundConfig(round);
        const pairCount = (config.rows * config.cols) / 2;
        let newCards: Card[] = [];

        if (mode === 'twin') {
            // Select random emojis
            const shuffledLibrary = [...TWIN_EMOJIS].sort(() => Math.random() - 0.5);
            const selectedEmojis = shuffledLibrary.slice(0, pairCount);

            selectedEmojis.forEach((emoji, idx) => {
                const pairId = `pair_${idx}`;
                newCards.push({ id: `${pairId}_a`, emoji, pairId, isFlipped: true, isMatched: false });
                newCards.push({ id: `${pairId}_b`, emoji, pairId, isFlipped: true, isMatched: false });
            });
        } else {
            // Connect Mode
            const shuffledPairs = [...CONNECT_PAIRS].sort(() => Math.random() - 0.5);
            const selectedPairs = shuffledPairs.slice(0, pairCount);

            selectedPairs.forEach((pair) => {
                newCards.push({ id: `${pair.pairId}_a`, emoji: pair.items[0], pairId: pair.pairId, isFlipped: true, isMatched: false });
                newCards.push({ id: `${pair.pairId}_b`, emoji: pair.items[1], pairId: pair.pairId, isFlipped: true, isMatched: false });
            });
        }

        // Shuffle Grid
        newCards = newCards.sort(() => Math.random() - 0.5);

        setCards(newCards);
        setGameState('preview');
        setFlippedIds([]);
        setIsProcessing(false);
        // previewProgress removed

        // Start Preview Timer (Optimized)
        const duration = getPreviewTime(round);

        if (timerRef.current) clearTimeout(timerRef.current);

        timerRef.current = setTimeout(() => {
            setGameState('playing');
            // Flip all back
            setCards(prev => prev.map(c => ({ ...c, isFlipped: false })));
        }, duration);

    }, [mode, round]);

    // --- Cleanup Timer ---
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    // --- Init / Reset Logic ---
    const prevGameStateRef = useRef(engine.gameState);

    useEffect(() => {
        // Detect Game Start (Only from Idle or GameOver -> Playing)
        // If coming from 'wrong' or 'correct' (mid-game feedback), do NOT reset.
        const wasInactive = prevGameStateRef.current === 'idle' || prevGameStateRef.current === 'gameover';

        if (wasInactive && engine.gameState === 'playing') {
            console.log("Game Restart/Start detected inside usePairUpLogic");
            setRound(1);
            setCards([]);
        }

        prevGameStateRef.current = engine.gameState;
    }, [engine.gameState]);

    // Generate cards when empty and playing (handling both initial start and round progression)
    useEffect(() => {
        if (engine.gameState === 'playing' && cards.length === 0) {
            generateCards(); // Uses current 'round' state
        }
    }, [engine.gameState, cards.length, generateCards]);

    // --- Interactions ---
    const handleCardClick = (id: string) => {
        if (gameState !== 'playing') return;
        if (isProcessing) return;

        const clickedCard = cards.find(c => c.id === id);
        if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;

        // 1. Flip the card
        // playSound('cardFlip'); // Assuming this exists or generic click
        setCards(prev => prev.map(c => c.id === id ? { ...c, isFlipped: true } : c));

        const newFlippedIds = [...flippedIds, id];
        setFlippedIds(newFlippedIds);

        // 2. Check Match if 2 cards
        if (newFlippedIds.length === 2) {
            setIsProcessing(true);
            const [firstId, secondId] = newFlippedIds;
            const firstCard = cards.find(c => c.id === firstId)!;

            // Check Match
            if (firstCard.pairId === clickedCard.pairId) {
                // MATCH!
                // Give points immediately (e.g. 100 per pair)
                engine.updateScore(100);

                // Do NOT trigger 'correct' event here (user requested animation only at end)

                setTimeout(() => {
                    setCards(prev => prev.map(c =>
                        (c.id === firstId || c.id === secondId)
                            ? { ...c, isMatched: true }
                            : c
                    ));
                    setFlippedIds([]);
                    setIsProcessing(false);
                }, 500);
            } else {
                // MISMATCH
                // Immediately deduct life and show wrong feedback
                engine.submitAnswer(false);
                engine.registerEvent({ type: 'wrong' });

                setTimeout(() => {
                    // Unflip both after delay
                    setCards(prev => prev.map(c =>
                        (c.id === firstId || c.id === secondId)
                            ? { ...c, isFlipped: false }
                            : c
                    ));
                    setFlippedIds([]);
                    setIsProcessing(false);
                }, 1000);
            }
        }
    };

    // --- Check Round Clear ---
    useEffect(() => {
        if (cards.length > 0 && cards.every(c => c.isMatched)) {
            // Round Clear!
            // 1. Register Success (Updates Score/Streak in Engine)
            engine.submitAnswer(true);

            // 2. Trigger Success Animation
            engine.registerEvent({ type: 'correct' });

            // 3. PowerUp Reward Logic (Service Rule: Chance every 3 streaks)
            // Note: engine.streak is the *previous* streak before submitAnswer updates it asynchronously?
            // Actually submitAnswer updates local state via functional update, but engine.streak prop here might be stale closure or updated next render.
            // But we can calculate expected streak: current engine.streak + 1.
            const nextStreak = engine.streak + 1;
            if (nextStreak > 0 && nextStreak % 3 === 0) {
                // 55% Chance to get a random powerup
                if (Math.random() < 0.55) {
                    const types = ['timeFreeze', 'extraLife', 'doubleScore'] as const;
                    const reward = types[Math.floor(Math.random() * types.length)];
                    engine.setPowerUps(prev => ({ ...prev, [reward]: prev[reward] + 1 }));
                }
            }

            setTimeout(() => {
                setRound(prev => prev + 1);
                setCards([]);
            }, 1000);
        }
    }, [cards]);

    return {
        cards,
        round,
        gameState,
        previewDuration: getPreviewTime(round),
        handleCardClick,
        gridConfig: getRoundConfig(round)
    };
};
