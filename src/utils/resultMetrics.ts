import type { GameScoreValue } from '../types/nurturing';
import { parseGameScore, ADVENTURE_UNLOCK_THRESHOLD } from './progression';

/**
 * Result Metrics - Mastery Level Calculation
 * 
 * Hybrid Storage v2: Uses compact gameScores format
 */

export interface MasteryLevel {
    level: number; // 0, 1, 2, 3 (3 = Gold/Master)
    percent: number; // 0 to 100
    label: 'Novice' | 'Bronze' | 'Silver' | 'Gold';
}

// Mastery Thresholds (Clear Counts)
// Adventure: 1 clear = Bronze, 2 = Silver, 4 = Gold (Unlock Next)
const MASTERY_THRESHOLDS = {
    BRONZE: 1,
    SILVER: 2,
    GOLD: ADVENTURE_UNLOCK_THRESHOLD, // 4 clears
};

/**
 * Calculate mastery level from compact game score
 */
export const calculateMastery = (scoreValue?: GameScoreValue): MasteryLevel => {
    const { clearCount } = parseGameScore(scoreValue);

    if (clearCount === 0) {
        return { level: 0, percent: 0, label: 'Novice' };
    }

    if (clearCount >= MASTERY_THRESHOLDS.GOLD) {
        return { level: 3, percent: 100, label: 'Gold' };
    } else if (clearCount >= MASTERY_THRESHOLDS.SILVER) {
        // Progress to Gold (2 -> 4)
        const progress = (clearCount - MASTERY_THRESHOLDS.SILVER) / (MASTERY_THRESHOLDS.GOLD - MASTERY_THRESHOLDS.SILVER);
        const percent = 60 + Math.floor(progress * 39);
        return { level: 2, percent, label: 'Silver' };
    } else {
        // Progress to Silver (1 -> 2)
        const progress = clearCount / MASTERY_THRESHOLDS.SILVER;
        const percent = Math.floor(progress * 59);
        return { level: 1, percent, label: 'Bronze' };
    }
};

/**
 * Check if mastery level is enough to unlock next game (Adventure Mode)
 */
export const isMasteryUnlockReady = (scoreValue?: GameScoreValue): boolean => {
    const { clearCount } = parseGameScore(scoreValue);
    return clearCount >= MASTERY_THRESHOLDS.GOLD;
};
