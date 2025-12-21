import type { GameManifest, GameCategory, GameDifficulty } from './types';

// Import future games here
import { manifest as FishingCountManifest } from './math/level1/001_FishingCount';
import { manifest as RoundCountingManifest } from './math/level1/002_RoundCounting';
import { manifest as FruitSliceManifest } from './math/level1/003_FruitSlice';
import { manifest as NumberBalanceManifest } from './math/level1/004_NumberBalance';

export const GAMES: GameManifest[] = [
    FishingCountManifest,
    RoundCountingManifest,
    FruitSliceManifest,
    NumberBalanceManifest,
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
