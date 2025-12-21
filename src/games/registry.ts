import type { GameManifest, GameCategory, GameDifficulty } from './types';

// --- Level 1 Games (Math) ---
import { manifest as L1_FishingCount } from './math/level1/FishingCount';
import { manifest as L1_RoundCounting } from './math/level1/RoundCounting';
import { manifest as L1_NumberBalance } from './math/level1/NumberBalance';
import { manifest as L1_FruitSlice } from './math/level1/FruitSlice';

// --- Level 2 Games (TBD) ---
// import ...

export const GAMES: GameManifest[] = [
    // [Level 1] -----------------------------------------------------------
    L1_FishingCount,
    L1_RoundCounting,
    L1_NumberBalance,
    L1_FruitSlice,

    // [Level 2] -----------------------------------------------------------
    // ...
];

export const getGames = (category?: GameCategory, level?: GameDifficulty): GameManifest[] => {
    return GAMES.filter(game => {
        if (category && game.category !== category) return false;
        if (level && game.level !== level) return false;
        return true;
    });
};

export const getGameById = (id: string): GameManifest | undefined => {
    return GAMES.find(game => game.id === id);
};
