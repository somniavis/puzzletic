import { useState, useEffect, useRef } from 'react';
import { useNurturing } from '../../../../contexts/NurturingContext';
import { calculateMinigameReward } from '../../../../services/rewardService';
import { parseGameScore } from '../../../../utils/progression';
import type { RewardCalculation, MinigameDifficulty } from '../../../../types/gameMechanics';

interface ScoringProps {
    gameState: string; // 'idle' | 'playing' | 'gameover' etc.
    score: number;
    lives: number;
    gameId?: string;
    engineDifficulty: string | MinigameDifficulty;
    stats?: { correct: number; wrong: number };
}

export const useGameScoring = ({
    gameState,
    score,
    lives,
    gameId,
    engineDifficulty,
    stats
}: ScoringProps) => {
    // Context is the Single Source of Truth for High Scores
    const { evolutionStage, addRewards, recordGameScore, gameScores } = useNurturing();

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
    const processResult = () => {
        // Calculate Reward
        const totalAttempts = (stats?.correct || 0) + (stats?.wrong || 0);
        const accuracyVal = totalAttempts > 0 ? (stats?.correct || 0) / totalAttempts : 0;

        const calculated = calculateMinigameReward({
            difficulty: engineDifficulty as MinigameDifficulty,
            accuracy: accuracyVal,
            isPerfect: lives === 3,
            masteryBonus: 1.0
        }, evolutionStage as any);

        setRewardResult(calculated);
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

            // Persist (Context updates state and saves to localStorage/Cloud)
            recordGameScore(gameId, score);
        }
    };

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
    }, [gameState, rewardResult]);

    return {
        rewardResult,
        highScore,
        prevBest,
        isNewRecord
    };
};
