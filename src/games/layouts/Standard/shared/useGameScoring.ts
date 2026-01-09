import { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNurturing } from '../../../../contexts/NurturingContext';
import { calculateMinigameReward } from '../../../../services/rewardService';
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
    const { user } = useAuth();
    const { evolutionStage, addRewards, recordGameScore } = useNurturing();

    const [rewardResult, setRewardResult] = useState<RewardCalculation | null>(null);
    const [highScore, setHighScore] = useState<number>(0);
    const [prevBest, setPrevBest] = useState<number>(0);
    const [isNewRecord, setIsNewRecord] = useState(false);

    // Helper to get consistent storage key
    const getHighScoreKey = (gId: string) => user?.uid ? `minigame_highscore_${user.uid}_${gId}` : `minigame_highscore_${gId}`;

    // 1. Initial Load of High Score
    useEffect(() => {
        if (gameId) {
            const savedkey = getHighScoreKey(gameId);
            const savedScore = localStorage.getItem(savedkey);
            if (savedScore) {
                setHighScore(parseInt(savedScore, 10));
            } else {
                setHighScore(0);
            }
        }
    }, [gameId, user?.uid]);

    // 2. Handle Game Over & Rewards
    useEffect(() => {
        if (gameState === 'gameover' && !rewardResult) {
            // Calculate Reward
            const totalAttempts = (stats?.correct || 0) + (stats?.wrong || 0);
            const accuracyVal = totalAttempts > 0 ? (stats?.correct || 0) / totalAttempts : 0;

            const calculated = calculateMinigameReward({
                difficulty: engineDifficulty as MinigameDifficulty,
                accuracy: accuracyVal,
                isPerfect: lives === 3,
                masteryBonus: 1.0
            }, evolutionStage as any); // Type cast if evolutionStage type mismatch occurs, usually safe

            setRewardResult(calculated);
            addRewards(calculated.xpEarned, calculated.groEarned);

            // Record Global Cumulative Score
            if (gameId) {
                recordGameScore(gameId, score);
            }

            // Update High Score (Local)

            // Update High Score
            if (gameId) {
                const savedkey = getHighScoreKey(gameId);
                const currentScore = score;
                const storedScore = localStorage.getItem(savedkey);
                const currentBest = storedScore ? parseInt(storedScore, 10) : 0;

                if (currentScore > currentBest) {
                    localStorage.setItem(savedkey, currentScore.toString());
                    setPrevBest(currentBest); // The "old" best
                    setHighScore(currentScore); // The "new" best
                    setIsNewRecord(true);
                } else {
                    setHighScore(currentBest);
                    setIsNewRecord(false);
                    setPrevBest(currentBest);
                }
            }
        } else if (gameState === 'playing' || gameState === 'idle') {
            if (rewardResult) setRewardResult(null);
            setIsNewRecord(false);
        }
    }, [gameState, rewardResult, score, lives, engineDifficulty, evolutionStage, addRewards, gameId, stats, user?.uid, recordGameScore]);

    return {
        rewardResult,
        highScore,
        prevBest,
        isNewRecord
    };
};
