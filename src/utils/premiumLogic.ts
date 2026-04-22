import { useNurturing } from '../contexts/NurturingContext';
import { GameIds } from '../constants/gameIds';
import type { GameManifest } from '../games/types';

// Connected Hook for Premium Status
export const usePremiumStatus = () => {
    const { subscription } = useNurturing();
    // Return true if premium is active
    return { isPremium: subscription.isPremium };
};

export const isPremiumGame = (game: GameManifest): boolean => {
    // Policy:
    // 1. Math Level 1 & Brain Level 1 are FREE
    // 2. All other levels (2, 3...) are PREMIUM
    // 3. All "Genius" mode games are PREMIUM
    // 4. Play: Tail Runner is FREE, GroGro Land and Jello Knight are PREMIUM

    if (game.id === GameIds.PLAY_JELLO_KNIGHT || game.id === GameIds.PLAY_GROGRO_LAND) {
        return true;
    }

    if (game.category === 'play') return false;

    if (game.mode === 'genius') return true;
    if (game.level > 1) return true;

    return false;
};
