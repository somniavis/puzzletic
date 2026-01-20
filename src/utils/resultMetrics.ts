
interface MinigameStats {
    totalScore: number;
    playCount: number;
    highScore: number;
    lastPlayedAt: number;
}

export interface MasteryLevel {
    level: number; // 0, 1, 2, 3 (3 = Gold/Master)
    percent: number; // 0 to 100
    label: 'Novice' | 'Bronze' | 'Silver' | 'Gold';
}

// Mastery Thresholds (Play Counts)
// Simple model: 1 play = Lv1, 5 plays = Lv2, 10 plays = Lv3 (Unlock Next)
const MASTERY_THRESHOLDS = {
    BRONZE: 1,
    SILVER: 2,
    GOLD: 4, // Unlock Threshold (1 initial + 3 challenge)
};

export const calculateMastery = (stats?: MinigameStats): MasteryLevel => {
    if (!stats || stats.playCount === 0) {
        return { level: 0, percent: 0, label: 'Novice' };
    }

    const { playCount } = stats;

    if (playCount >= MASTERY_THRESHOLDS.GOLD) {
        return { level: 3, percent: 100, label: 'Gold' };
    } else if (playCount >= MASTERY_THRESHOLDS.SILVER) {
        // Progress to Gold (3 -> 5)
        // 3 plays = 50%
        const progress = (playCount - MASTERY_THRESHOLDS.SILVER) / (MASTERY_THRESHOLDS.GOLD - MASTERY_THRESHOLDS.SILVER);
        // Map to 60-99%
        const percent = 60 + Math.floor(progress * 39);
        return { level: 2, percent, label: 'Silver' };
    } else {
        // Progress to Silver (1 -> 3)
        // 1 play = 20%
        const progress = playCount / MASTERY_THRESHOLDS.SILVER;
        // Map to 20-59%
        const percent = Math.floor(progress * 59);
        return { level: 1, percent, label: 'Bronze' };
    }
};

export const isMasteryUnlockReady = (stats?: MinigameStats): boolean => {
    const mastery = calculateMastery(stats);
    return mastery.level >= 3; // Gold Level Required
};
