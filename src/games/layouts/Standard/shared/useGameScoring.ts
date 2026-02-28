import { useState, useEffect, useRef, useCallback } from 'react';
import { useOptionalNurturing } from '../../../../contexts/NurturingContext';
import { calculateMinigameReward } from '../../../../services/rewardService';
import { parseGameScore } from '../../../../utils/progression';
import type { RewardCalculation, MinigameDifficulty, EvolutionStage } from '../../../../types/gameMechanics';

interface ScoringProps {
    gameState: string; // 'idle' | 'playing' | 'gameover' etc.
    score: number;
    lives: number;
    gameId?: string;
    gameLevel?: number; // Added to avoid circular dependency with registry
    engineDifficulty: string | MinigameDifficulty;
    stats?: { correct: number; wrong: number };
    gameOverReason?: 'time' | 'lives' | 'cleared' | null;
}

export const useGameScoring = ({
    gameState,
    score,
    lives,
    gameId,
    gameLevel = 1, // Default to 1 if not provided
    engineDifficulty,
    stats,
    gameOverReason
}: ScoringProps) => {
    const nurturing = useOptionalNurturing();
    // Fallback-safe defaults so layout can render even outside NurturingProvider.
    const evolutionStage = nurturing?.evolutionStage ?? 1;
    const addRewards = useCallback((xp: number, gro: number) => {
        nurturing?.addRewards?.(xp, gro);
    }, [nurturing]);
    const recordGameScore = useCallback((id: string, value: number, incrementPlayCount?: boolean, starsEarned?: number) => {
        nurturing?.recordGameScore?.(id, value, incrementPlayCount, starsEarned);
    }, [nurturing]);
    const gameScores = nurturing?.gameScores;
    const safeEvolutionStage: EvolutionStage = [1, 2, 3, 4, 5].includes(evolutionStage)
        ? (evolutionStage as EvolutionStage)
        : 1;

    const [rewardResult, setRewardResult] = useState<RewardCalculation | null>(null);
    const [highScore, setHighScore] = useState<number>(0);
    const [prevBest, setPrevBest] = useState<number>(0);
    const [isNewRecord, setIsNewRecord] = useState(false);

    // 1. Initial Load of High Score from Context (Compact Format)
    useEffect(() => {
        if (gameId && gameScores) {
            const { highScore: storedHigh } = parseGameScore(gameScores[gameId]);
            setHighScore(storedHigh);
        } else {
            setHighScore(0);
        }
    }, [gameId, gameScores]);

    // Helper to process results (Memoized to be callable from outside)
    const processResult = useCallback(() => {
        // Calculate Reward
        const totalAttempts = (stats?.correct || 0) + (stats?.wrong || 0);
        const accuracyVal = totalAttempts > 0 ? (stats?.correct || 0) / totalAttempts : 0;

        const calculated = calculateMinigameReward({
            difficulty: engineDifficulty as MinigameDifficulty,
            accuracy: accuracyVal,
            isPerfect: lives === 3,
            masteryBonus: 1.0
        }, safeEvolutionStage);

        // Calculate Stars (Clear or Time Over with Score)
        let starsEarned = 0;
        // CRITICAL: Do NOT award stars if gameOverReason is 'lives' (Survival Failed)
        if (gameId && (gameOverReason === 'cleared' || (gameOverReason === 'time' && score > 0))) {
            starsEarned = gameLevel;
        }

        setRewardResult({
            ...calculated,
            starsEarned
        });
        addRewards(calculated.xpEarned, calculated.groEarned);

        // Record Global Cumulative Score & Handle High Score Persistence
        if (gameId) {
            const { highScore: currentBest } = parseGameScore(gameScores?.[gameId]);

            // Determine if it's a new record
            if (score > currentBest) {
                setIsNewRecord(true);
                setPrevBest(currentBest); // Previous best is what it was BEFORE this game
                setHighScore(score);      // New high score is the current score
            } else {
                setIsNewRecord(false);
                setPrevBest(currentBest); // Previous best remains the same
                setHighScore(currentBest); // High score remains the same
            }

            // Increment play count (Unlock Progress) if:
            // 1. Cleared (Objective Met)
            // 2. Score > 0 (Earned points) - Must have played effectively
            const shouldIncrementPlayCount = score > 0;

            // Persist (Context updates state and saves to localStorage/Cloud)
            recordGameScore(gameId, score, shouldIncrementPlayCount, starsEarned);
        }
    }, [
        stats,
        engineDifficulty,
        lives,
        safeEvolutionStage,
        gameId,
        gameOverReason,
        score,
        gameLevel,
        addRewards,
        gameScores,
        recordGameScore
    ]);

    // 2. Handle Game Over & Rewards
    // Track processing status to prevent double-execution (Critical for "New Record" check)
    const processedRef = useRef(false);

    // 2. Handle Game Over & Rewards
    useEffect(() => {
        if (gameState === 'gameover' && !processedRef.current) {
            processedRef.current = true; // Mark as processed immediately
            processResult();
        } else if (gameState === 'playing' || gameState === 'idle') {
            // Reset for next game
            if (processedRef.current) processedRef.current = false;
            if (rewardResult) setRewardResult(null);
            setIsNewRecord(false);
        }
    }, [gameState, rewardResult, processResult]);

    return {
        rewardResult,
        highScore,
        prevBest,
        isNewRecord
    };
};
