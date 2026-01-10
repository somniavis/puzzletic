import type { GameManifest, GameCategory, GameDifficulty } from './types';

// --- Level 1 Games (Math) ---
import { manifest as L1_FishingCount } from './math/level1/FishingCount';
import { manifest as L1_RoundCounting } from './math/level1/RoundCounting';
import { manifest as L1_NumberHive } from './math/level1/NumberHive';
import { manifest as L1_NumberBalance } from './math/level1/NumberBalance';
import { manifest as L1_FruitSlice } from './math/level1/FruitSlice';
import { manifest as L1_MathArchery } from './math/level1/MathArchery';

// --- Level 2 Games (TBD) ---
import { manifest as L2_TenFrameCount } from './math/level2/TenFrameCount';
import { manifest as L2_Pinwheel } from './math/level2/PinwheelPop';
import { manifest as DeepSeaManifest } from './math/level2/DeepSeaDive';
import { manifest as L2_UFOInvasion } from './math/level2/UFOInvasion/index';

// --- Brain Level 1 ---
// --- Brain Level 1 ---
import { manifest as L1_ColorLink } from './brain/level1/ColorLink/index';
import { manifest as L1_PairUpTwin } from './brain/level1/PairUpTwin/index';

// --- Brain Level 2 ---
import { manifest as L2_WildLink } from './brain/level2/WildLink/index';
import { manifest as L2_AnimalBanquet } from './brain/level2/AnimalBanquet/index';
import { manifest as L2_PairUpConnect } from './brain/level2/PairUpConnect/index';

import { manifest as signalHunter } from './brain/level2/SignalHunter';

export const GAMES: GameManifest[] = [
    // [Level 1] -----------------------------------------------------------
    L1_FishingCount,
    L1_RoundCounting,
    L1_NumberHive,
    L1_NumberBalance,
    L1_FruitSlice,
    L1_MathArchery,

    // [Level 2] -----------------------------------------------------------
    L2_TenFrameCount,
    L2_Pinwheel,
    DeepSeaManifest,
    L2_UFOInvasion,

    // [Brain Level 1] -----------------------------------------------------
    // [Brain Level 1] -----------------------------------------------------
    L1_ColorLink,
    L1_PairUpTwin,

    // [Brain Level 2] -----------------------------------------------------
    L2_WildLink,
    L2_AnimalBanquet,
    L2_PairUpConnect,
    signalHunter,
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
