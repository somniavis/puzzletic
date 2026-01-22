import { lazy } from 'react';
import type { GameManifest, GameCategory, GameDifficulty } from './types';

// --- Lazy-loaded Game Components ---
// Each game component is loaded only when the game is accessed

// Math Adventure Level 1 Games (named exports)
const L1_FishingCount = lazy(() => import('./math/adventure/level1/FishingCount').then(m => ({ default: m.FishingCount })));
const L1_RoundCounting = lazy(() => import('./math/adventure/level1/RoundCounting').then(m => ({ default: m.RoundCounting })));
const L1_NumberHive = lazy(() => import('./math/adventure/level1/NumberHive').then(m => ({ default: m.NumberHive })));
const L1_NumberBalance = lazy(() => import('./math/adventure/level1/NumberBalance').then(m => ({ default: m.NumberBalance })));
const L1_FruitSlice = lazy(() => import('./math/adventure/level1/FruitSlice').then(m => ({ default: m.FruitSlice })));
const L1_MathArchery = lazy(() => import('./math/adventure/level1/MathArchery').then(m => ({ default: m.MathArchery })));

// Math Adventure Level 2 Games (mixed exports)
const L2_TenFrameCount = lazy(() => import('./math/adventure/level2/TenFrameCount').then(m => ({ default: m.TenFrameCount })));
const L2_PinwheelPop = lazy(() => import('./math/adventure/level2/PinwheelPop').then(m => ({ default: m.MathPinwheel })));
const L2_DeepSeaDive = lazy(() => import('./math/adventure/level2/DeepSeaDive').then(m => ({ default: m.DeepSeaDive })));
const L2_UFOInvasion = lazy(() => import('./math/adventure/level2/UFOInvasion')); // default export

// Math Genius Games (calculation drills)
const L2_FrontAddition = lazy(() => import('./math/genius/FrontAddition').then(m => ({ default: m.FrontAdditionGame })));
const L2_FrontSubtraction = lazy(() => import('./math/genius/FrontSubtraction').then(m => ({ default: m.FrontSubtractionGame })));

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

// Brain Level 3
const L3_TicTacToe = lazy(() => import('./brain/level3/TicTacToe')); // default export
const L3_Omok = lazy(() => import('./brain/level3/Omok').then(m => ({ default: m.OmokGame }))); // named export

// --- Game Manifests (metadata with lazy component references) ---
export const GAMES: GameManifest[] = [
    // [Math Level 1]
    {
        id: 'math-fishing-count',
        title: 'Fishing Count',
        titleKey: 'games.math-fishing-count.title',
        subtitle: 'Count the fish!',
        subtitleKey: 'games.math-fishing-count.subtitle',
        description: 'Catch the requested number of fish.',
        descriptionKey: 'games.math-fishing-count.description',
        category: 'math',
        level: 1,
        component: L1_FishingCount,
        thumbnail: '🎣',
        tagsKey: 'games.tags.counting'
    },
    {
        id: 'math-round-counting',
        title: 'Round Counting',
        titleKey: 'games.math-round-counting.title',
        subtitle: 'Hit the marks!',
        subtitleKey: 'games.math-round-counting.subtitle',
        description: 'Count and hit the targets.',
        descriptionKey: 'games.math-round-counting.description',
        category: 'math',
        level: 1,
        component: L1_RoundCounting,
        thumbnail: '🌀',
        tagsKey: 'games.tags.counting'
    },
    {
        id: 'math-number-hive',
        title: 'Number Hive',
        titleKey: 'games.math-number-hive.title',
        subtitle: 'Collect the bees!',
        subtitleKey: 'games.math-number-hive.subtitle',
        description: 'Collect bees to complete the hive.',
        descriptionKey: 'games.math-number-hive.description',
        category: 'math',
        level: 1,
        component: L1_NumberHive,
        thumbnail: '🐝',
        tagsKey: 'games.tags.sequence'
    },
    {
        id: 'math-number-balance',
        title: 'Number Balance',
        titleKey: 'games.math-number-balance.title',
        subtitle: 'Balance the scales!',
        subtitleKey: 'games.math-number-balance.subtitle',
        description: 'Balance numbers on both sides.',
        descriptionKey: 'games.math-number-balance.description',
        category: 'math',
        level: 1,
        component: L1_NumberBalance,
        thumbnail: '⚖️',
        tagsKey: 'games.tags.addition'
    },
    {
        id: 'math-fruit-slice',
        title: 'Fruit Slice',
        titleKey: 'games.math-fruit-slice.title',
        subtitle: 'Slice the fruits!',
        subtitleKey: 'games.math-fruit-slice.subtitle',
        description: 'Slice fruits to match the target.',
        descriptionKey: 'games.math-fruit-slice.description',
        category: 'math',
        level: 1,
        component: L1_FruitSlice,
        thumbnail: '🍎',
        tagsKey: 'games.tags.partWhole'
    },
    {
        id: 'math-archery',
        title: 'Math Archery',
        titleKey: 'games.math-archery.title',
        subtitle: 'Hit the target!',
        subtitleKey: 'games.math-archery.subtitle',
        description: 'Shoot arrows at math targets.',
        descriptionKey: 'games.math-archery.description',
        category: 'math',
        level: 1,
        component: L1_MathArchery,
        thumbnail: '🏹',
        tagsKey: 'games.tags.mixedOps'
    },

    // [Math Level 2]
    {
        id: 'ten-frame-count',
        title: 'Ten Frame',
        titleKey: 'games.ten-frame-count.title',
        subtitle: 'Fill the frame!',
        subtitleKey: 'games.ten-frame-count.subtitle',
        description: 'Count using ten frames.',
        descriptionKey: 'games.ten-frame-count.description',
        category: 'math',
        level: 2,
        component: L2_TenFrameCount,
        thumbnail: '🧱',
        tagsKey: 'games.tags.numberSense'
    },
    {
        id: 'pinwheel-pop',
        title: 'Pinwheel Pop',
        titleKey: 'games.pinwheel-pop.title',
        subtitle: 'Spin and pop!',
        subtitleKey: 'games.pinwheel-pop.subtitle',
        description: 'Pop the correct pinwheel.',
        descriptionKey: 'games.pinwheel-pop.description',
        category: 'math',
        level: 2,
        component: L2_PinwheelPop,
        thumbnail: '🍭',
        tagsKey: 'games.tags.addition'
    },
    {
        id: 'deep-sea-dive',
        title: 'Deep Sea Dive',
        titleKey: 'games.deep-sea-dive.title',
        subtitle: 'Dive deep!',
        subtitleKey: 'games.deep-sea-dive.subtitle',
        description: 'Explore the ocean depths.',
        descriptionKey: 'games.deep-sea-dive.description',
        category: 'math',
        level: 2,
        component: L2_DeepSeaDive,
        thumbnail: '🤿',
        tagsKey: 'games.tags.subtraction'
    },
    {
        id: 'math-level2-ufo-invasion',
        title: 'UFO Invasion',
        titleKey: 'games.math-level2-ufo-invasion.title',
        subtitle: 'Defend Earth!',
        subtitleKey: 'games.math-level2-ufo-invasion.subtitle',
        description: 'Stop the UFO invasion.',
        descriptionKey: 'games.math-level2-ufo-invasion.description',
        category: 'math',
        level: 2,
        component: L2_UFOInvasion,
        thumbnail: '🛸',
        tagsKey: 'games.tags.speedMath'
    },
    // Front Addition Levels
    {
        id: 'front-addition-lv1',
        title: 'Front Addition Lv.1',
        titleKey: 'games.frontAddition.lv1.title',
        subtitle: '2+1 digits',
        subtitleKey: 'games.frontAddition.lv1.subtitle',
        description: 'Practice front addition',
        descriptionKey: 'games.frontAddition.description',
        category: 'math',
        level: 2,
        mode: 'genius',
        component: L2_FrontAddition,
        thumbnail: '➕',
        tagsKey: 'games.tags.mentalMath'
    },
    {
        id: 'front-addition-lv2',
        title: 'Front Addition Lv.2',
        titleKey: 'games.frontAddition.lv2.title',
        subtitle: '2+2 digits',
        subtitleKey: 'games.frontAddition.lv2.subtitle',
        description: 'Practice front addition',
        descriptionKey: 'games.frontAddition.description',
        category: 'math',
        level: 2,
        mode: 'genius',
        component: L2_FrontAddition,
        thumbnail: '➕',
        tagsKey: 'games.tags.mentalMath'
    },
    {
        id: 'front-addition-lv3',
        title: 'Front Addition Lv.3',
        titleKey: 'games.frontAddition.lv3.title',
        subtitle: '3+2 digits',
        subtitleKey: 'games.frontAddition.lv3.subtitle',
        description: 'Practice front addition',
        descriptionKey: 'games.frontAddition.description',
        category: 'math',
        level: 2,
        mode: 'genius',
        component: L2_FrontAddition,
        thumbnail: '➕',
        tagsKey: 'games.tags.mentalMath'
    },
    {
        id: 'front-addition-lv4',
        title: 'Front Addition Lv.4',
        titleKey: 'games.frontAddition.lv4.title',
        subtitle: '3+3 digits',
        subtitleKey: 'games.frontAddition.lv4.subtitle',
        description: 'Practice front addition',
        descriptionKey: 'games.frontAddition.description',
        category: 'math',
        level: 2,
        mode: 'genius',
        component: L2_FrontAddition,
        thumbnail: '➕',
        tagsKey: 'games.tags.mentalMath'
    },
    // Front Subtraction Levels
    {
        id: 'front-subtraction-lv1',
        title: 'Front Subtraction Lv.1',
        titleKey: 'games.frontSubtraction.lv1.title',
        subtitle: '2-1 digits',
        subtitleKey: 'games.frontSubtraction.lv1.subtitle',
        description: 'Practice front subtraction',
        descriptionKey: 'games.frontSubtraction.description',
        category: 'math',
        level: 2,
        mode: 'genius',
        component: L2_FrontSubtraction,
        thumbnail: '➖',
        tagsKey: 'games.tags.mentalMath'
    },
    {
        id: 'front-subtraction-lv2',
        title: 'Front Subtraction Lv.2',
        titleKey: 'games.frontSubtraction.lv2.title',
        subtitle: '2-2 digits',
        subtitleKey: 'games.frontSubtraction.lv2.subtitle',
        description: 'Practice front subtraction',
        descriptionKey: 'games.frontSubtraction.description',
        category: 'math',
        level: 2,
        mode: 'genius',
        component: L2_FrontSubtraction,
        thumbnail: '➖',
        tagsKey: 'games.tags.mentalMath'
    },
    {
        id: 'front-subtraction-lv3',
        title: 'Front Subtraction Lv.3',
        titleKey: 'games.frontSubtraction.lv3.title',
        subtitle: '3-2 digits',
        subtitleKey: 'games.frontSubtraction.lv3.subtitle',
        description: 'Practice front subtraction',
        descriptionKey: 'games.frontSubtraction.description',
        category: 'math',
        level: 2,
        mode: 'genius',
        component: L2_FrontSubtraction,
        thumbnail: '➖',
        tagsKey: 'games.tags.mentalMath'
    },
    {
        id: 'front-subtraction-lv4',
        title: 'Front Subtraction Lv.4',
        titleKey: 'games.frontSubtraction.lv4.title',
        subtitle: '3-3 digits',
        subtitleKey: 'games.frontSubtraction.lv4.subtitle',
        description: 'Practice front subtraction',
        descriptionKey: 'games.frontSubtraction.description',
        category: 'math',
        level: 2,
        mode: 'genius',
        component: L2_FrontSubtraction,
        thumbnail: '➖',
        tagsKey: 'games.tags.mentalMath'
    },

    // [Brain Level 1]
    {
        id: 'color-link',
        title: 'Color Link',
        titleKey: 'games.color-link.title',
        subtitle: 'Connect colors!',
        subtitleKey: 'games.color-link.subtitle',
        description: 'Link matching colors.',
        descriptionKey: 'games.color-link.description',
        category: 'brain',
        level: 1,
        component: L1_ColorLink,
        thumbnail: 'quad:🔴,,,🔴',
        tagsKey: 'games.tags.spatial'
    },
    {
        id: 'pair-up-twin',
        title: 'Pair Up Twin',
        titleKey: 'games.pair-up-twin.title',
        subtitle: 'Find twins!',
        subtitleKey: 'games.pair-up-twin.subtitle',
        description: 'Match identical pairs.',
        descriptionKey: 'games.pair-up-twin.description',
        category: 'brain',
        level: 1,
        component: L1_PairUpTwin,
        thumbnail: '👯',
        tagsKey: 'games.tags.observation'
    },
    {
        id: 'maze-escape',
        title: 'Maze Escape',
        titleKey: 'games.maze-escape.title',
        subtitle: 'Escape the maze!',
        subtitleKey: 'games.maze-escape.subtitle',
        description: 'Navigate the maze.',
        descriptionKey: 'games.maze-escape.description',
        category: 'brain',
        level: 1,
        component: L1_MazeEscape,
        thumbnail: '🏕️',
        tagsKey: 'games.tags.spatial'
    },

    // [Brain Level 2]
    {
        id: 'wild-link',
        title: 'Wild Link',
        titleKey: 'games.wild-link.title',
        subtitle: 'Connect animals!',
        subtitleKey: 'games.wild-link.subtitle',
        description: 'Link wild animals.',
        descriptionKey: 'games.wild-link.description',
        category: 'brain',
        level: 2,
        component: L2_WildLink,
        thumbnail: 'quad:🦉,,,🦢',
        tagsKey: 'games.tags.categorization'
    },
    {
        id: 'animal-banquet',
        title: 'Animal Banquet',
        titleKey: 'games.animal-banquet.title',
        subtitle: 'Serve the animals!',
        subtitleKey: 'games.animal-banquet.subtitle',
        description: 'Feed the hungry animals.',
        descriptionKey: 'games.animal-banquet.description',
        category: 'brain',
        level: 2,
        component: L2_AnimalBanquet,
        thumbnail: '🍽️',
        tagsKey: 'games.tags.workingMemory'
    },
    {
        id: 'pair-up-connect',
        title: 'Pair Up Connect',
        titleKey: 'games.pair-up-connect.title',
        subtitle: 'Find Related Pairs',
        subtitleKey: 'games.pair-up-connect.subtitle',
        description: 'Connect related items.',
        descriptionKey: 'games.pair-up-connect.description',
        category: 'brain',
        level: 2,
        component: L2_PairUpConnect,
        thumbnail: 'quad:🐒,,,🍌',
        tagsKey: 'games.tags.association'
    },
    {
        id: 'maze-hunter',
        title: 'Maze Hunter',
        titleKey: 'games.maze-hunter.title',
        subtitle: 'Hunt in the maze!',
        subtitleKey: 'games.maze-hunter.subtitle',
        description: 'Find treasures in the maze.',
        descriptionKey: 'games.maze-hunter.description',
        category: 'brain',
        level: 2,
        component: L2_MazeHunter,
        thumbnail: '🐾',
        tagsKey: 'games.tags.spatial'
    },
    {
        id: 'signal-hunter',
        title: 'Signal Hunter',
        titleKey: 'games.signal-hunter.title',
        subtitle: 'Find the signal!',
        subtitleKey: 'games.signal-hunter.subtitle',
        description: 'Hunt for signals.',
        descriptionKey: 'games.signal-hunter.description',
        category: 'brain',
        level: 2,
        component: L2_SignalHunter,
        thumbnail: '📡',
        tagsKey: 'games.tags.concentration'
    },

    // [Brain Level 3]
    {
        id: 'tic-tac-toe',
        title: 'Tic Tac Toe',
        titleKey: 'games.tic-tac-toe.title',
        subtitle: 'Win 3 in a row!',
        subtitleKey: 'games.tic-tac-toe.subtitle',
        description: 'Win 3 in a row!',
        descriptionKey: 'games.tic-tac-toe.description',
        category: 'brain',
        level: 3,
        component: L3_TicTacToe,
        thumbnail: '❌',
        tagsKey: 'games.tags.strategy'
    },
    {
        id: 'brain-omok',
        title: 'Omok',
        titleKey: 'games.omok.title',
        subtitle: 'Make 5 in a row',
        subtitleKey: 'games.omok.subtitle',
        description: 'Connect 5 stones in a row to win.',
        descriptionKey: 'games.omok.description',
        category: 'brain',
        mode: 'adventure',
        level: 3,
        component: L3_Omok,
        thumbnail: '⚫',
        tagsKey: 'games.tags.strategy'
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
