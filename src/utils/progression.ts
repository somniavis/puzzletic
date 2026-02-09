import type { GameManifest } from '../games/types';
import type { NurturingPersistentState, GameScoreValue } from '../types/nurturing';
import { GAMES } from '../games/registry';

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

/** Clears required to unlock next game (Adventure Mode: Total 3) */
export const ADVENTURE_UNLOCK_THRESHOLD = 3;

/** Clears required to unlock next game (Genius Mode: Total 3) */
export const GENIUS_UNLOCK_THRESHOLD = 3;

// ==================== Helper Functions ====================

/**
 * Get category for a game ID dynamically from registry
 */
export const getProgressionCategory = (gameId: string): string | null => {
    const game = GAMES.find(g => g.id === gameId);
    if (!game) return null;

    if (game.category === 'math') {
        return game.mode === 'genius' ? 'math-genius' : 'math-adventure';
    } else if (game.category === 'brain') {
        return 'brain-adventure';
    }
    return null;
};

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
        // Legacy: Number only = already mastered/unlocked (old format)
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
 * Always uses string format to preserve play count even after unlock
 * @param highScore - The high score
 * @param clearCount - Number of clears
 * @param _isUnlocked - Whether the next game is already unlocked (deprecated, ignored)
 * @returns Compact format: "score:count"
 */
export const createGameScore = (
    highScore: number,
    clearCount: number,
    _isUnlocked: boolean
): GameScoreValue => {
    // Always store both score and count to track actual play stats
    return `${highScore}:${clearCount}`;
};

/**
 * Get unlock threshold for a category
 */
export const getUnlockThreshold = (category: string): number => {
    return category.includes('genius') ? GENIUS_UNLOCK_THRESHOLD : ADVENTURE_UNLOCK_THRESHOLD;
};

/**
 * Get dynamic game order for a category based on the game registry
 * Sorts games by level (ascending) to determine progression order
 */
export const getDynamicGameOrder = (allGames: GameManifest[], category: string): string[] => {
    return allGames
        .filter(g => {
            // Check if game belongs to this category
            // 1. Math Adventure: category='math' & mode!='genius'
            // 2. Math Genius: category='math' & mode='genius'
            // 3. Brain Adventure: category='brain'

            if (category === 'math-adventure') return g.category === 'math' && g.mode !== 'genius';
            if (category === 'math-genius') return g.category === 'math' && g.mode === 'genius';
            if (category === 'brain-adventure') return g.category === 'brain';
            return false;
        })
        .sort((a, b) => {
            // Primary sort: Level
            return a.level - b.level;
        })
        .map(g => g.id);
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

    // Determine category dynamically
    let category = '';
    if (targetGame.category === 'math') {
        category = targetGame.mode === 'genius' ? 'math-genius' : 'math-adventure';
    } else if (targetGame.category === 'brain') {
        category = 'brain-adventure';
    }

    if (!category) {
        // Game not in any progression order = always unlocked
        return { unlocked: true };
    }

    // Get dynamic order from registry
    const order = getDynamicGameOrder(allGames, category);
    const targetIndex = order.indexOf(targetGameId);

    // Rule 1: First game in category (sorted by difficulty) is always unlocked
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
    currentProgress: Record<string, string> | undefined,
    allGames: GameManifest[]
): Record<string, string> | undefined => {
    const targetGame = allGames.find(g => g.id === gameId);
    if (!targetGame) return currentProgress;

    // Determine category
    let category = '';
    if (targetGame.category === 'math') {
        category = targetGame.mode === 'genius' ? 'math-genius' : 'math-adventure';
    } else if (targetGame.category === 'brain') {
        category = 'brain-adventure';
    }

    if (!category) return currentProgress;

    const order = getDynamicGameOrder(allGames, category);
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
