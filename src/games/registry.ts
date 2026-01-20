import { lazy } from 'react';
import type { GameManifest, GameCategory, GameDifficulty } from './types';

// --- Lazy-loaded Game Components ---
// Each game component is loaded only when the game is accessed

// Math Level 1 (named exports)
const L1_FishingCount = lazy(() => import('./math/level1/FishingCount').then(m => ({ default: m.FishingCount })));
const L1_RoundCounting = lazy(() => import('./math/level1/RoundCounting').then(m => ({ default: m.RoundCounting })));
const L1_NumberHive = lazy(() => import('./math/level1/NumberHive').then(m => ({ default: m.NumberHive })));
const L1_NumberBalance = lazy(() => import('./math/level1/NumberBalance').then(m => ({ default: m.NumberBalance })));
const L1_FruitSlice = lazy(() => import('./math/level1/FruitSlice').then(m => ({ default: m.FruitSlice })));
const L1_MathArchery = lazy(() => import('./math/level1/MathArchery').then(m => ({ default: m.MathArchery })));

// Math Level 2 (mixed exports)
const L2_TenFrameCount = lazy(() => import('./math/level2/TenFrameCount').then(m => ({ default: m.TenFrameCount })));
const L2_PinwheelPop = lazy(() => import('./math/level2/PinwheelPop').then(m => ({ default: m.MathPinwheel })));
const L2_DeepSeaDive = lazy(() => import('./math/level2/DeepSeaDive').then(m => ({ default: m.DeepSeaDive })));
const L2_UFOInvasion = lazy(() => import('./math/level2/UFOInvasion')); // default export
const L2_FrontAddition = lazy(() => import('./math/level2/FrontAddition').then(m => ({ default: m.FrontAdditionGame })));
const L2_FrontSubtraction = lazy(() => import('./math/level2/FrontSubtraction').then(m => ({ default: m.FrontSubtractionGame })));

// Brain Level 1 (default exports except noted)
const L1_ColorLink = lazy(() => import('./brain/level1/ColorLink')); // default export
const L1_PairUpTwin = lazy(() => import('./brain/level1/PairUpTwin')); // default export
const L1_MazeEscape = lazy(() => import('./brain/level1/MazeEscape')); // default export

// Brain Level 2 (mixed exports)
const L2_WildLink = lazy(() => import('./brain/level2/WildLink')); // default export
const L2_AnimalBanquet = lazy(() => import('./brain/level2/AnimalBanquet')); // default export
const L2_PairUpConnect = lazy(() => import('./brain/level2/PairUpConnect')); // default export
const L2_MazeHunter = lazy(() => import('./brain/level2/MazeHunter')); // default export
const L2_SignalHunter = lazy(() => import('./brain/level2/SignalHunter').then(m => ({ default: m.SignalHunter }))); // named export

// --- Game Manifests (metadata with lazy component references) ---
export const GAMES: GameManifest[] = [
    // [Math Level 1]
    {
        id: 'math-fishing-count',
        title: 'Fishing Count',
        titleKey: 'games.math-fishing-count.title',
        subtitle: 'Count the fish!',
        subtitleKey: 'games.math-fishing-count.sub',
        description: 'Catch the requested number of fish.',
        descriptionKey: 'games.math-fishing-count.desc',
        category: 'math',
        level: 1,
        component: L1_FishingCount,
        thumbnail: '🎣'
    },
    {
        id: 'math-round-counting',
        title: 'Round Counting',
        titleKey: 'games.math-round-counting.title',
        subtitle: 'Hit the marks!',
        subtitleKey: 'games.math-round-counting.sub',
        description: 'Count and hit the targets.',
        descriptionKey: 'games.math-round-counting.desc',
        category: 'math',
        level: 1,
        component: L1_RoundCounting,
        thumbnail: '🎯'
    },
    {
        id: 'math-number-hive',
        title: 'Number Hive',
        titleKey: 'games.math-number-hive.title',
        subtitle: 'Collect the bees!',
        subtitleKey: 'games.math-number-hive.sub',
        description: 'Collect bees to complete the hive.',
        descriptionKey: 'games.math-number-hive.desc',
        category: 'math',
        level: 1,
        component: L1_NumberHive,
        thumbnail: '🐝'
    },
    {
        id: 'math-number-balance',
        title: 'Number Balance',
        titleKey: 'games.math-number-balance.title',
        subtitle: 'Balance the scales!',
        subtitleKey: 'games.math-number-balance.sub',
        description: 'Balance numbers on both sides.',
        descriptionKey: 'games.math-number-balance.desc',
        category: 'math',
        level: 1,
        component: L1_NumberBalance,
        thumbnail: '⚖️'
    },
    {
        id: 'math-fruit-slice',
        title: 'Fruit Slice',
        titleKey: 'games.math-fruit-slice.title',
        subtitle: 'Slice the fruits!',
        subtitleKey: 'games.math-fruit-slice.sub',
        description: 'Slice fruits to match the target.',
        descriptionKey: 'games.math-fruit-slice.desc',
        category: 'math',
        level: 1,
        component: L1_FruitSlice,
        thumbnail: '🍎'
    },
    {
        id: 'math-archery',
        title: 'Math Archery',
        titleKey: 'games.math-archery.title',
        subtitle: 'Hit the target!',
        subtitleKey: 'games.math-archery.sub',
        description: 'Shoot arrows at math targets.',
        descriptionKey: 'games.math-archery.desc',
        category: 'math',
        level: 1,
        component: L1_MathArchery,
        thumbnail: '🏹'
    },

    // [Math Level 2]
    {
        id: 'ten-frame-count',
        title: 'Ten Frame',
        titleKey: 'games.ten-frame-count.title',
        subtitle: 'Fill the frame!',
        subtitleKey: 'games.ten-frame-count.sub',
        description: 'Count using ten frames.',
        descriptionKey: 'games.ten-frame-count.desc',
        category: 'math',
        level: 2,
        component: L2_TenFrameCount,
        thumbnail: '🧱'
    },
    {
        id: 'pinwheel-pop',
        title: 'Pinwheel Pop',
        titleKey: 'games.pinwheel-pop.title',
        subtitle: 'Spin and pop!',
        subtitleKey: 'games.pinwheel-pop.sub',
        description: 'Pop the correct pinwheel.',
        descriptionKey: 'games.pinwheel-pop.desc',
        category: 'math',
        level: 2,
        component: L2_PinwheelPop,
        thumbnail: '🍭'
    },
    {
        id: 'deep-sea-dive',
        title: 'Deep Sea Dive',
        titleKey: 'games.deep-sea-dive.title',
        subtitle: 'Dive deep!',
        subtitleKey: 'games.deep-sea-dive.sub',
        description: 'Explore the ocean depths.',
        descriptionKey: 'games.deep-sea-dive.desc',
        category: 'math',
        level: 2,
        component: L2_DeepSeaDive,
        thumbnail: '🤿'
    },
    {
        id: 'math-level2-ufo-invasion',
        title: 'UFO Invasion',
        titleKey: 'games.math-level2-ufo-invasion.title',
        subtitle: 'Defend Earth!',
        subtitleKey: 'games.math-level2-ufo-invasion.sub',
        description: 'Stop the UFO invasion.',
        descriptionKey: 'games.math-level2-ufo-invasion.desc',
        category: 'math',
        level: 2,
        component: L2_UFOInvasion,
        thumbnail: '🛸'
    },
    // Front Addition Levels
    {
        id: 'front-addition-lv1',
        title: 'Front Addition Lv.1',
        titleKey: 'games.frontAddition.title',
        subtitle: '2+1 digits',
        subtitleKey: 'games.frontAddition.levels.lv1.sub',
        description: 'Practice front addition',
        descriptionKey: 'games.frontAddition.desc',
        category: 'math',
        level: 2,
        mode: 'genius',
        component: L2_FrontAddition,
        thumbnail: '➕'
    },
    {
        id: 'front-addition-lv2',
        title: 'Front Addition Lv.2',
        titleKey: 'games.frontAddition.title',
        subtitle: '2+2 digits',
        subtitleKey: 'games.frontAddition.levels.lv2.sub',
        description: 'Practice front addition',
        descriptionKey: 'games.frontAddition.desc',
        category: 'math',
        level: 2,
        mode: 'genius',
        component: L2_FrontAddition,
        thumbnail: '➕'
    },
    {
        id: 'front-addition-lv3',
        title: 'Front Addition Lv.3',
        titleKey: 'games.frontAddition.title',
        subtitle: '3+2 digits',
        subtitleKey: 'games.frontAddition.levels.lv3.sub',
        description: 'Practice front addition',
        descriptionKey: 'games.frontAddition.desc',
        category: 'math',
        level: 2,
        mode: 'genius',
        component: L2_FrontAddition,
        thumbnail: '➕'
    },
    {
        id: 'front-addition-lv4',
        title: 'Front Addition Lv.4',
        titleKey: 'games.frontAddition.title',
        subtitle: '3+3 digits',
        subtitleKey: 'games.frontAddition.levels.lv4.sub',
        description: 'Practice front addition',
        descriptionKey: 'games.frontAddition.desc',
        category: 'math',
        level: 2,
        mode: 'genius',
        component: L2_FrontAddition,
        thumbnail: '➕'
    },
    // Front Subtraction Levels
    {
        id: 'front-subtraction-lv1',
        title: 'Front Subtraction Lv.1',
        titleKey: 'games.frontSubtraction.title',
        subtitle: '2-1 digits',
        subtitleKey: 'games.frontSubtraction.levels.lv1.sub',
        description: 'Practice front subtraction',
        descriptionKey: 'games.frontSubtraction.desc',
        category: 'math',
        level: 2,
        mode: 'genius',
        component: L2_FrontSubtraction,
        thumbnail: '➖'
    },
    {
        id: 'front-subtraction-lv2',
        title: 'Front Subtraction Lv.2',
        titleKey: 'games.frontSubtraction.title',
        subtitle: '2-2 digits',
        subtitleKey: 'games.frontSubtraction.levels.lv2.sub',
        description: 'Practice front subtraction',
        descriptionKey: 'games.frontSubtraction.desc',
        category: 'math',
        level: 2,
        mode: 'genius',
        component: L2_FrontSubtraction,
        thumbnail: '➖'
    },
    {
        id: 'front-subtraction-lv3',
        title: 'Front Subtraction Lv.3',
        titleKey: 'games.frontSubtraction.title',
        subtitle: '3-2 digits',
        subtitleKey: 'games.frontSubtraction.levels.lv3.sub',
        description: 'Practice front subtraction',
        descriptionKey: 'games.frontSubtraction.desc',
        category: 'math',
        level: 2,
        mode: 'genius',
        component: L2_FrontSubtraction,
        thumbnail: '➖'
    },
    {
        id: 'front-subtraction-lv4',
        title: 'Front Subtraction Lv.4',
        titleKey: 'games.frontSubtraction.title',
        subtitle: '3-3 digits',
        subtitleKey: 'games.frontSubtraction.levels.lv4.sub',
        description: 'Practice front subtraction',
        descriptionKey: 'games.frontSubtraction.desc',
        category: 'math',
        level: 2,
        mode: 'genius',
        component: L2_FrontSubtraction,
        thumbnail: '➖'
    },

    // [Brain Level 1]
    {
        id: 'color-link',
        title: 'Color Link',
        titleKey: 'games.color-link.title',
        subtitle: 'Connect colors!',
        subtitleKey: 'games.color-link.sub',
        description: 'Link matching colors.',
        descriptionKey: 'games.color-link.desc',
        category: 'brain',
        level: 1,
        component: L1_ColorLink,
        thumbnail: '🔗'
    },
    {
        id: 'pair-up-twin',
        title: 'Pair Up Twin',
        titleKey: 'games.pair-up-twin.title',
        subtitle: 'Find twins!',
        subtitleKey: 'games.pair-up-twin.sub',
        description: 'Match identical pairs.',
        descriptionKey: 'games.pair-up-twin.desc',
        category: 'brain',
        level: 1,
        component: L1_PairUpTwin,
        thumbnail: '👯'
    },
    {
        id: 'maze-escape',
        title: 'Maze Escape',
        titleKey: 'games.maze-escape.title',
        subtitle: 'Escape the maze!',
        subtitleKey: 'games.maze-escape.sub',
        description: 'Navigate the maze.',
        descriptionKey: 'games.maze-escape.desc',
        category: 'brain',
        level: 1,
        component: L1_MazeEscape,
        thumbnail: '🧩'
    },

    // [Brain Level 2]
    {
        id: 'wild-link',
        title: 'Wild Link',
        titleKey: 'games.wild-link.title',
        subtitle: 'Connect animals!',
        subtitleKey: 'games.wild-link.sub',
        description: 'Link wild animals.',
        descriptionKey: 'games.wild-link.desc',
        category: 'brain',
        level: 2,
        component: L2_WildLink,
        thumbnail: '🐾'
    },
    {
        id: 'animal-banquet',
        title: 'Animal Banquet',
        titleKey: 'games.animal-banquet.title',
        subtitle: 'Serve the animals!',
        subtitleKey: 'games.animal-banquet.sub',
        description: 'Feed the hungry animals.',
        descriptionKey: 'games.animal-banquet.desc',
        category: 'brain',
        level: 2,
        component: L2_AnimalBanquet,
        thumbnail: '🍽️'
    },
    {
        id: 'pair-up-connect',
        title: 'Pair Up Connect',
        titleKey: 'games.pair-up-connect.title',
        subtitle: 'Find Related Pairs',
        subtitleKey: 'games.pair-up-connect.sub',
        description: 'Connect related items.',
        descriptionKey: 'games.pair-up-connect.desc',
        category: 'brain',
        level: 2,
        component: L2_PairUpConnect,
        thumbnail: '🐒'
    },
    {
        id: 'maze-hunter',
        title: 'Maze Hunter',
        titleKey: 'games.maze-hunter.title',
        subtitle: 'Hunt in the maze!',
        subtitleKey: 'games.maze-hunter.sub',
        description: 'Find treasures in the maze.',
        descriptionKey: 'games.maze-hunter.desc',
        category: 'brain',
        level: 2,
        component: L2_MazeHunter,
        thumbnail: '🔍'
    },
    {
        id: 'signal-hunter',
        title: 'Signal Hunter',
        titleKey: 'games.signal-hunter.title',
        subtitle: 'Find the signal!',
        subtitleKey: 'games.signal-hunter.sub',
        description: 'Hunt for signals.',
        descriptionKey: 'games.signal-hunter.desc',
        category: 'brain',
        level: 2,
        component: L2_SignalHunter,
        thumbnail: '📡'
    },
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
