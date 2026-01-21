import type { GameManifest } from '../games/types';
import type { NurturingPersistentState, GameScoreValue } from '../types/nurturing';
import { GAME_ORDER, getProgressionCategory } from '../constants/gameOrder';

// Re-export for convenience
export { getProgressionCategory };

/**
 * Hybrid Storage v2 - Category-Based Progression System
 * 
 * Ultra-compact storage format:
 * - categoryProgress: { "math-adventure": "math-lv5" } (last unlocked game per category)
 * - gameScores: { "math-lv1": 2500, "math-lv5": "1200:3" } (score OR "score:count")
 * 
 * Unlock Rules:
 * - Adventure Mode: 1 initial play + 3 challenge clears = 4 total clears to unlock next
 * - Genius Mode: 5 clears to unlock next
 */

// ==================== Constants ====================

/** Clears required to unlock next game (Adventure Mode: 1 + 3 = 4) */
export const ADVENTURE_UNLOCK_THRESHOLD = 4;

/** Clears required to unlock next game (Genius Mode) */
export const GENIUS_UNLOCK_THRESHOLD = 5;

// ==================== Helper Functions ====================

/**
 * Parse compact game score value
 * @param value - number (high score) OR "highScore:clearCount" string
 * @returns { highScore, clearCount }
 */
export const parseGameScore = (value: GameScoreValue | undefined): { highScore: number; clearCount: number } => {
    if (value === undefined || value === null) {
        return { highScore: 0, clearCount: 0 };
    }

    if (typeof value === 'number') {
        // Number only = already mastered/unlocked, count doesn't matter
        // Return a high count to indicate mastery
        return { highScore: value, clearCount: 999 };
    }

    // Parse string format "highScore:clearCount"
    const [scoreStr, countStr] = value.split(':');
    return {
        highScore: parseInt(scoreStr, 10) || 0,
        clearCount: parseInt(countStr, 10) || 0
    };
};

/**
 * Create compact game score value
 * @param highScore - The high score
 * @param clearCount - Number of clears
 * @param isUnlocked - Whether the next game is already unlocked
 * @returns Compact format: number OR "score:count"
 */
export const createGameScore = (
    highScore: number,
    clearCount: number,
    isUnlocked: boolean
): GameScoreValue => {
    // If already unlocked next game, store score only (compact)
    if (isUnlocked) {
        return highScore;
    }
    // Otherwise store both score and count
    return `${highScore}:${clearCount}`;
};

/**
 * Get unlock threshold for a category
 */
export const getUnlockThreshold = (category: string): number => {
    return category.includes('genius') ? GENIUS_UNLOCK_THRESHOLD : ADVENTURE_UNLOCK_THRESHOLD;
};

// ==================== Core Logic ====================

/**
 * Check if a game is unlocked (Hybrid Storage v2)
 */
export const isGameUnlocked = (
    targetGameId: string,
    allGames: GameManifest[],
    userState: Pick<NurturingPersistentState, 'gameScores' | 'categoryProgress'>
): { unlocked: boolean; reason?: string; requiredGame?: GameManifest; clearCount?: number; threshold?: number } => {
    const targetGame = allGames.find(g => g.id === targetGameId);
    if (!targetGame) return { unlocked: false, reason: 'Game not found' };

    // Get category for this game
    const category = getProgressionCategory(targetGameId);
    if (!category) {
        // Game not in any progression order = always unlocked
        return { unlocked: true };
    }

    const order = GAME_ORDER[category];
    const targetIndex = order.indexOf(targetGameId);

    // Rule 1: First game in category is always unlocked
    if (targetIndex === 0) return { unlocked: true };

    // Check categoryProgress for reached game
    const reachedGameId = userState.categoryProgress?.[category];

    if (reachedGameId) {
        const reachedIndex = order.indexOf(reachedGameId);

        // All games up to and including reachedGameId are unlocked
        if (targetIndex <= reachedIndex) {
            return { unlocked: true };
        }

        // Check if the next game (targetIndex === reachedIndex + 1) can be unlocked
        if (targetIndex === reachedIndex + 1) {
            const reachedGameScore = userState.gameScores?.[reachedGameId];
            const { clearCount } = parseGameScore(reachedGameScore);
            const threshold = getUnlockThreshold(category);

            if (clearCount >= threshold) {
                return { unlocked: true };
            }

            // Not yet unlocked - return progress info
            const prevGameManifest = allGames.find(g => g.id === reachedGameId);
            return {
                unlocked: false,
                requiredGame: prevGameManifest,
                clearCount,
                threshold,
                reason: `Clear ${prevGameManifest?.title} ${threshold - clearCount} more time(s) to unlock`
            };
        }
    }

    // Game is locked - return previous game info
    const prevGameId = order[targetIndex - 1];
    const prevGameManifest = allGames.find(g => g.id === prevGameId);
    const threshold = getUnlockThreshold(category);

    return {
        unlocked: false,
        requiredGame: prevGameManifest,
        threshold,
        reason: `Clear ${prevGameManifest?.title} ${threshold} times to unlock`
    };
};

/**
 * Update categoryProgress when a game is completed
 * Only updates if the game is further than current progress
 */
export const updateCategoryProgress = (
    gameId: string,
    currentProgress: Record<string, string> | undefined
): Record<string, string> | undefined => {
    const category = getProgressionCategory(gameId);
    if (!category) return currentProgress;

    const order = GAME_ORDER[category];
    const currentIndex = order.indexOf(gameId);
    const existingProgress = currentProgress || {};
    const existingReachedId = existingProgress[category];
    const existingIndex = existingReachedId ? order.indexOf(existingReachedId) : -1;

    // Update if this game is further than existing progress
    if (currentIndex > existingIndex) {
        return {
            ...existingProgress,
            [category]: gameId
        };
    }

    return currentProgress;
};

/**
 * Get all game unlock statuses (batch)
 */
export const getGameUnlockStatuses = (
    games: GameManifest[],
    userState: NurturingPersistentState
) => {
    return games.map(game => ({
        id: game.id,
        ...isGameUnlocked(game.id, games, userState)
    }));
};
