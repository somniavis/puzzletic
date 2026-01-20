import type { GameManifest } from '../games/types';
import type { NurturingPersistentState } from '../types/nurturing';
import { isMasteryUnlockReady } from './resultMetrics';

/**
 * Determines if a game is unlocked based on progression logic.
 * 
 * Rules:
 * 1. First game in list is always unlocked.
 * 2. "Max Reach": If a later game (Index N) is unlocked/played, then all previous games (0..N-1) are unlocked.
 * 3. "Mastery": To unlock Game N, Game N-1 must be MASTERED (Gold Level), not just played.
 */
// Genius Mode Progression Order (+ -> -)
const GENIUS_PROGRESSION_ORDER = [
    'front-addition-lv1', 'front-addition-lv2', 'front-addition-lv3', 'front-addition-lv4',
    'front-subtraction-lv1', 'front-subtraction-lv2', 'front-subtraction-lv3', 'front-subtraction-lv4',
];

export const isGameUnlocked = (
    targetGameId: string,
    allGames: GameManifest[],
    userState: Pick<NurturingPersistentState, 'minigameStats'>
): { unlocked: boolean; reason?: string; requiredGame?: GameManifest } => {
    // Find target game definition
    const targetGame = allGames.find(g => g.id === targetGameId);
    if (!targetGame) return { unlocked: false, reason: 'Game not found' };

    // GENIUS MODE LOGIC
    if (targetGame.mode === 'genius') {
        const orderIndex = GENIUS_PROGRESSION_ORDER.indexOf(targetGameId);

        // If not in our manual order list, fallback to default logic or just unlock
        if (orderIndex === -1) return { unlocked: true };

        // First game is always unlocked
        if (orderIndex === 0) return { unlocked: true };

        // Check Previous Game Mastery
        const prevGameId = GENIUS_PROGRESSION_ORDER[orderIndex - 1];
        const prevGameStats = userState.minigameStats?.[prevGameId];
        const prevGameManifest = allGames.find(g => g.id === prevGameId);

        // Mastery Requirement: 10 Plays
        if (prevGameStats && prevGameStats.playCount >= 10) {
            return { unlocked: true };
        }

        return {
            unlocked: false,
            requiredGame: prevGameManifest,
            reason: prevGameManifest
                ? `Master ${prevGameManifest.title} (10 clears) to unlock`
                : 'Complete previous level'
        };
    }

    // ADVENTURE MODE LOGIC (Existing)
    // Filter games by category so progression is isolated per category (e.g. Math vs Brain)
    const categoryGames = allGames.filter(g => g.category === targetGame.category);
    const targetIndex = categoryGames.findIndex(g => g.id === targetGameId);

    // Rule 1: First game in this category is always unlocked
    if (targetIndex === 0) return { unlocked: true };

    // Get Stats Helper
    const getStats = (gameId: string) => userState.minigameStats?.[gameId];

    // Rule 2: Max Reach (Check forward within this category)
    // If user has played ANY game after this one in the same category, this one must be unlocked.
    let maxPlayedIndex = -1;
    for (let i = categoryGames.length - 1; i >= 0; i--) {
        const stats = getStats(categoryGames[i].id);
        if (stats && stats.playCount > 0) {
            maxPlayedIndex = i;
            break;
        }
    }

    if (maxPlayedIndex >= targetIndex) {
        return { unlocked: true };
    }

    // Rule 3: Mastery of Previous Game (in same category)
    const prevGame = categoryGames[targetIndex - 1];
    const prevStats = getStats(prevGame.id);

    if (isMasteryUnlockReady(prevStats)) {
        return { unlocked: true };
    }

    return {
        unlocked: false,
        requiredGame: prevGame,
        // reason: `Complete mastery of ${prevGame.title} to unlock` // Legacy string, prefer using requiredGame in UI
    };
};

/**
 * Hook logic helper or simple function to get all statuses
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
