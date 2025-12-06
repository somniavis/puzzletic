import type { GameManifest, GameCategory, GameDifficulty } from './types';

// Import future games here
import { manifest as Math01Manifest } from './math/level1/001_NumberMatch/manifest';

export const GAMES: GameManifest[] = [
    Math01Manifest,
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
