import { lazy, createElement } from 'react';
import type { GameManifest, GameCategory, GameDifficulty } from './types';
import { GameIds } from '../constants/gameIds';

// Helper to enforce minimum loading time (fixes mobile blue flash)
const MIN_LOADING_TIME = 800; // 0.8s
const delayedImport = <T>(importPromise: Promise<T>): Promise<T> => {
    return Promise.all([
        importPromise,
        new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME))
    ]).then(([moduleExports]) => moduleExports);
};

// --- Lazy-loaded Game Components ---
// Each game component is loaded only when the game is accessed

// Math Adventure Level 1 Games (named exports)
const L1_FishingCount = lazy(() => delayedImport(import('./math/adventure/level1/FishingCount').then(m => ({ default: m.FishingCount }))));
const L1_RoundCounting = lazy(() => delayedImport(import('./math/adventure/level1/RoundCounting').then(m => ({ default: m.RoundCounting }))));
const L1_NumberHive = lazy(() => delayedImport(import('./math/adventure/level1/NumberHive').then(m => ({ default: m.NumberHive }))));
const L1_NumberBalance = lazy(() => delayedImport(import('./math/adventure/level1/NumberBalance').then(m => ({ default: m.NumberBalance }))));
const L1_JelloFeeding = lazy(() => delayedImport(import('./math/adventure/level1/JelloFeeding').then(m => ({ default: m.JelloFeeding }))));
const L1_FruitSlice = lazy(() => delayedImport(import('./math/adventure/level1/FruitSlice').then(m => ({ default: m.FruitSlice }))));
const L1_MathArchery = lazy(() => delayedImport(import('./math/adventure/level1/MathArchery').then(m => ({ default: (props: any) => createElement(m.MathArchery, { ...props, level: 1 }) }))));
const L2_MathArchery = lazy(() => delayedImport(import('./math/adventure/level1/MathArchery').then(m => ({ default: (props: any) => createElement(m.MathArchery, { ...props, level: 2 }) }))));
const L1_CompareCritters = lazy(() => delayedImport(import('./math/adventure/level1/CompareCritters/index').then(m => ({ default: m.CompareCritters }))));

// Math Adventure Level 2 Games (mixed exports)
const L2_TenFrameCount = lazy(() => delayedImport(import('./math/adventure/level2/TenFrameCount').then(m => ({ default: m.TenFrameCount }))));
const L2_RocketLauncher = lazy(() => delayedImport(import('./math/adventure/level2/RocketLauncher'))); // default export for new game
const L2_PinwheelPop = lazy(() => delayedImport(import('./math/adventure/level2/PinwheelPop').then(m => ({ default: m.MathPinwheel }))));
const L2_ShapeSumLink = lazy(() => delayedImport(import('./math/adventure/level2/ShapeSumLink').then(m => ({ default: m.ShapeSumLink }))));
const L3_FruitBox = lazy(() => delayedImport(import('./math/adventure/level3/FruitBox').then(m => ({ default: m.FruitBox }))));
const L3_IceStacking = lazy(() => delayedImport(import('./math/adventure/level3/IceStacking').then(m => ({ default: m.IceStacking }))));
const L3_FloorTiler = lazy(() => delayedImport(import('./math/adventure/level3/FloorTiler').then(m => ({ default: m.FloorTiler }))));
const L3_BeginnerWizard = lazy(() => delayedImport(import('./math/adventure/level3/BeginnerWizard').then(m => ({ default: m.BeginnerWizard }))));
const L3_ConstellationFinder = lazy(() => delayedImport(import('./math/adventure/level3/ConstellationFinder').then(m => ({ default: m.ConstellationFinder }))));
const L3_TrollAttack = lazy(() => delayedImport(import('./math/adventure/level3/TrollAttack').then(m => ({ default: m.TrollAttack }))));

const L1_DeepSeaDive = lazy(() => delayedImport(import('./math/adventure/level2/DeepSeaDive').then(m => ({ default: (props: any) => createElement(m.DeepSeaDive, { ...props, level: 1 }) }))));
const L2_DeepSeaDive = lazy(() => delayedImport(import('./math/adventure/level2/DeepSeaDive').then(m => ({ default: (props: any) => createElement(m.DeepSeaDive, { ...props, level: 2 }) }))));
const L2_UFOInvasion = lazy(() => delayedImport(import('./math/adventure/level2/UFOInvasion'))); // default export
const L2_LockOpening = lazy(() => delayedImport(import('./math/adventure/level2/LockOpening').then(m => ({ default: m.LockOpening }))));

// Math Genius Games (calculation drills)
const L2_FrontAddition = lazy(() => delayedImport(import('./math/genius/FrontAddition').then(m => ({ default: m.FrontAdditionGame }))));
const L2_FrontSubtraction = lazy(() => delayedImport(import('./math/genius/FrontSubtraction').then(m => ({ default: m.FrontSubtractionGame }))));
const L2_BackMultiplication = lazy(() => delayedImport(import('./math/genius/BackMultiplication').then(m => ({ default: m.BackMultiplicationGame }))));
const L2_BackMultiplicationLv2 = lazy(() => delayedImport(import('./math/genius/BackMultiplication/Level2').then(m => ({ default: m.BackMultiplicationGameLv2 }))));
const L2_BackMultiplicationLv3 = lazy(() => delayedImport(import('./math/genius/BackMultiplication/Level3').then(m => ({ default: m.BackMultiplicationGameLv3 }))));
const L2_BackMultiplicationLv4 = lazy(() => delayedImport(import('./math/genius/BackMultiplication/Level4').then(m => ({ default: m.BackMultiplicationGameLv4 }))));

// Brain Level 1 (default exports except noted)
const L1_ColorLink = lazy(() => delayedImport(import('./brain/level1/ColorLink'))); // default export
const L1_PairUpTwin = lazy(() => delayedImport(import('./brain/level1/PairUpTwin'))); // default export
const L1_MazeEscape = lazy(() => delayedImport(import('./brain/level1/MazeEscape'))); // default export

// Brain Level 2 (mixed exports)
const L2_WildLink = lazy(() => delayedImport(import('./brain/level2/WildLink'))); // default export
const L2_AnimalBanquet = lazy(() => delayedImport(import('./brain/level2/AnimalBanquet'))); // default export
const L2_PairUpConnect = lazy(() => delayedImport(import('./brain/level2/PairUpConnect'))); // default export
const L2_MazeHunter = lazy(() => delayedImport(import('./brain/level2/MazeHunter'))); // default export
const L2_SignalHunter = lazy(() => delayedImport(import('./brain/level2/SignalHunter').then(m => ({ default: m.SignalHunter })))); // named export
const L2_BlockTower = lazy(() => delayedImport(import('./brain/level2/BlockTower').then(m => ({ default: m.BlockTower })))); // named export

// Brain Level 3
const L3_TicTacToe = lazy(() => delayedImport(import('./brain/level3/TicTacToe'))); // default export
const L3_Omok = lazy(() => delayedImport(import('./brain/level3/Omok').then(m => ({ default: m.OmokGame })))); // named export

// --- Game Manifests (metadata with lazy component references) ---
export const GAMES: GameManifest[] = [
    // [Math Level 1]
    {
        id: GameIds.MATH_ROUND_COUNTING,
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
        id: GameIds.MATH_FISHING_COUNT,
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
        id: GameIds.MATH_NUMBER_HIVE,
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
        id: GameIds.MATH_COMPARE_CRITTERS,
        title: 'Compare Critters',
        titleKey: 'games.math-compare-critters.title',
        subtitle: 'Who has more?',
        subtitleKey: 'games.math-compare-critters.subtitle',
        description: 'Compare groups of animals.',
        descriptionKey: 'games.math-compare-critters.description',
        category: 'math',
        level: 1,
        component: L1_CompareCritters,
        thumbnail: 'quad:>,🐼,🐼,<',
        tagsKey: 'games.tags.comparison'
    },
    {
        id: GameIds.MATH_NUMBER_BALANCE,
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
        id: GameIds.MATH_JELLO_FEEDING,
        title: 'Jello Feeding',
        titleKey: 'games.jello-feeding.title',
        subtitle: 'Jello is Hungry!',
        subtitleKey: 'games.jello-feeding.subtitle',
        description: 'Feed Jello to understand subtraction as taking away.',
        descriptionKey: 'games.jello-feeding.description',
        category: 'math',
        level: 1,
        component: L1_JelloFeeding,
        thumbnail: '🍖',
        tagsKey: 'games.tags.subtraction'
    },
    {
        id: GameIds.MATH_FRUIT_SLICE,
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
        tagsKey: 'games.tags.subtraction'
    },
    {
        id: GameIds.DEEP_SEA_DIVE_LV1,
        title: 'Deep Dive (Lv1)',
        titleKey: 'games.deep-sea-dive.title-lv1',
        subtitle: 'Dive deep!',
        subtitleKey: 'games.deep-sea-dive.subtitle',
        description: 'Explore the ocean depths.',
        descriptionKey: 'games.deep-sea-dive.description',
        category: 'math',
        level: 1,
        component: L1_DeepSeaDive,
        thumbnail: '🤿',
        tagsKey: 'games.tags.subtraction'
    },
    {
        id: GameIds.MATH_LOCK_OPENING,
        title: '자물쇠 열기',
        titleKey: 'games.math-lock-opening.title',
        subtitle: '+/- 유창성 종합',
        subtitleKey: 'games.math-lock-opening.subtitle',
        description: '두 숫자를 선택해 목표 숫자를 만드는 게임',
        descriptionKey: 'games.math-lock-opening.description',
        category: 'math',
        level: 2,
        mode: 'adventure',
        component: L2_LockOpening,
        thumbnail: '🔐',
        tagsKey: 'games.tags.mixedOps'
    },
    {
        id: GameIds.MATH_ARCHERY_LV1,
        title: 'Math Archery (Lv.1)',
        titleKey: 'games.math-archery.title-lv1',
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
        id: GameIds.TEN_FRAME_COUNT,
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
        id: GameIds.MATH_ROCKET_LAUNCHER,
        title: 'Rocket Launcher',
        titleKey: 'games.rocketLauncher.title',
        subtitle: 'Compare Fuel!',
        subtitleKey: 'games.rocketLauncher.subtitle',
        category: 'math',
        level: 2,
        component: L2_RocketLauncher,
        description: 'Launch the rocket with more fuel!',
        descriptionKey: 'games.rocketLauncher.description',
        tagsKey: 'games.tags.comparison',
        thumbnail: '🚀'
    },
    {
        id: GameIds.MATH_CARGO_TRAIN,
        title: 'Cargo Train',
        titleKey: 'games.cargoTrain.title',
        subtitle: 'Make 100!',
        subtitleKey: 'games.cargoTrain.subtitle',
        category: 'math',
        level: 2,
        component: lazy(() => import('./math/adventure/level2/CargoTrain')),
        description: 'Load the cargo to match the engine number!',
        descriptionKey: 'games.cargoTrain.description',
        tagsKey: 'games.tags.addition',
        thumbnail: '🚂'
    },
    {
        id: GameIds.PINWHEEL_POP,
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
        id: GameIds.SHAPE_SUM_LINK,
        title: '3-Dot Link',
        titleKey: 'games.shape-sum-link.title',
        subtitle: 'Draw a triangle in the circle!',
        subtitleKey: 'games.shape-sum-link.subtitle',
        description: 'Connect numbers to complete shape-based sum missions.',
        descriptionKey: 'games.shape-sum-link.description',
        category: 'math',
        level: 2,
        component: L2_ShapeSumLink,
        thumbnail: '🔺',
        tagsKey: 'games.tags.addition'
    },
    {
        id: GameIds.DEEP_SEA_DIVE_LV2,
        title: 'Deep Dive (Lv2)',
        titleKey: 'games.deep-sea-dive.title-lv2',
        subtitle: 'More challenging dive!',
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
        id: GameIds.MATH_ARCHERY_LV2,
        title: 'Math Archery (Lv.2)',
        titleKey: 'games.math-archery.title-lv2',
        subtitle: 'Hit the target!',
        subtitleKey: 'games.math-archery.subtitle',
        description: 'Shoot arrows at math targets.',
        descriptionKey: 'games.math-archery.description',
        category: 'math',
        level: 2,
        component: L2_MathArchery,
        thumbnail: '🏹',
        tagsKey: 'games.tags.mixedOps'
    },
    {
        id: GameIds.MATH_UFO_INVASION,
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
    {
        id: GameIds.MATH_FRUIT_BOX,
        title: 'Fruit Box',
        titleKey: 'games.fruit-box.title',
        subtitle: 'Pack equal bundles!',
        subtitleKey: 'games.fruit-box.subtitle',
        description: 'Pack the same fruit bundles into each box.',
        descriptionKey: 'games.fruit-box.description',
        category: 'math',
        level: 3,
        mode: 'adventure',
        component: L3_FruitBox,
        thumbnail: '📦',
        tagsKey: 'games.tags.multiplication'
    },
    {
        id: GameIds.MATH_ICE_STACKING,
        title: 'Ice Stacking',
        titleKey: 'games.ice-stacking.title',
        subtitle: 'Stack the ice blocks!',
        subtitleKey: 'games.ice-stacking.subtitle',
        description: 'Place ice bundles into the grid and build a stable stack.',
        descriptionKey: 'games.ice-stacking.description',
        category: 'math',
        level: 3,
        mode: 'adventure',
        component: L3_IceStacking,
        thumbnail: '🧊',
        tagsKey: 'games.tags.multiplication'
    },
    {
        id: GameIds.MATH_FLOOR_TILER,
        title: 'Floor Tiler',
        titleKey: 'games.floor-tiler.title',
        subtitle: 'Complete the floor!',
        subtitleKey: 'games.floor-tiler.subtitle',
        description: 'Fill the room using area.',
        descriptionKey: 'games.floor-tiler.description',
        category: 'math',
        level: 3,
        mode: 'adventure',
        component: L3_FloorTiler,
        thumbnail: 'quad:🟧,🟨,🟩,🟦',
        tagsKey: 'games.tags.multiplication'
    },
    {
        id: GameIds.MATH_BEGINNER_WIZARD,
        title: '초보마법사',
        titleKey: 'games.beginner-wizard.title',
        subtitle: '마법으로 동물 가족을 지켜요!',
        subtitleKey: 'games.beginner-wizard.subtitle',
        description: '목표 숫자에 맞춰 보호/삭제 마법을 선택하세요.',
        descriptionKey: 'games.beginner-wizard.description',
        category: 'math',
        level: 3,
        mode: 'adventure',
        component: L3_BeginnerWizard,
        thumbnail: '🧙',
        tagsKey: 'games.tags.mixedOps'
    },
    {
        id: GameIds.MATH_CONSTELLATION_FINDER,
        title: 'Constellation Finder',
        titleKey: 'games.constellation-finder.title',
        subtitle: 'Light up the stars!',
        subtitleKey: 'games.constellation-finder.subtitle',
        description: 'Solve multiplication and find the matching stars.',
        descriptionKey: 'games.constellation-finder.description',
        category: 'math',
        level: 3,
        mode: 'adventure',
        component: L3_ConstellationFinder,
        thumbnail: '⭐',
        tagsKey: 'games.tags.multiplication'
    },
    {
        id: GameIds.MATH_TROLL_ATTACK,
        title: 'Troll Attack',
        titleKey: 'games.troll-attack.title',
        subtitle: 'Defend the Castle!',
        subtitleKey: 'games.troll-attack.subtitle',
        description: 'Stop the troll with the correct cannonball.',
        descriptionKey: 'games.troll-attack.description',
        category: 'math',
        level: 3,
        mode: 'adventure',
        component: L3_TrollAttack,
        thumbnail: '🧌',
        tagsKey: 'games.tags.multiplication'
    },
    // Front Addition Levels
    {
        id: GameIds.FRONT_ADDITION_LV1,
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
        id: GameIds.FRONT_ADDITION_LV2,
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
        id: GameIds.FRONT_ADDITION_LV3,
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
        id: GameIds.FRONT_ADDITION_LV4,
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
        id: GameIds.FRONT_SUBTRACTION_LV1,
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
        id: GameIds.FRONT_SUBTRACTION_LV2,
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
        id: GameIds.FRONT_SUBTRACTION_LV3,
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
        id: GameIds.FRONT_SUBTRACTION_LV4,
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
    // Back Multiplication Levels
    {
        id: GameIds.BACK_MULTIPLICATION_LV1,
        title: 'Back Multiplication Lv.1',
        titleKey: 'games.backMultiplication.lv1.title',
        subtitle: '1-digit x 1-digit',
        subtitleKey: 'games.backMultiplication.lv1.subtitle',
        description: 'Practice back multiplication',
        descriptionKey: 'games.backMultiplication.description',
        category: 'math',
        level: 2,
        mode: 'genius',
        component: L2_BackMultiplication,
        thumbnail: '✖️',
        tagsKey: 'games.tags.mentalMath'
    },
    {
        id: GameIds.BACK_MULTIPLICATION_LV2,
        title: 'Back Multiplication Lv.2',
        titleKey: 'games.backMultiplication.lv2.title',
        subtitle: '2-digit x 1-digit',
        subtitleKey: 'games.backMultiplication.lv2.subtitle',
        description: 'Practice back multiplication',
        descriptionKey: 'games.backMultiplication.description',
        category: 'math',
        level: 2,
        mode: 'genius',
        component: L2_BackMultiplicationLv2,
        thumbnail: '✖️',
        tagsKey: 'games.tags.mentalMath'
    },

    // [Brain Level 1]
    {
        id: GameIds.COLOR_LINK,
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
        id: GameIds.PAIR_UP_TWIN,
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
        id: GameIds.MAZE_ESCAPE,
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
        id: GameIds.WILD_LINK,
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
        id: GameIds.ANIMAL_BANQUET,
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
        id: GameIds.PAIR_UP_CONNECT,
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
        id: GameIds.MAZE_HUNTER,
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
        id: GameIds.SIGNAL_HUNTER,
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
    {
        id: GameIds.BRAIN_BLOCK_TOWER,
        title: 'Block Tower',
        titleKey: 'games.block-tower.title',
        subtitle: 'Stack carefully and don’t topple!',
        subtitleKey: 'games.block-tower.subtitle',
        description: 'Drop equal blocks onto the grid and build a stable tower.',
        descriptionKey: 'games.block-tower.description',
        category: 'brain',
        level: 2,
        component: L2_BlockTower,
        thumbnail: '🏗️',
        tagsKey: 'games.tags.spatial'
    },

    // [Brain Level 3]
    {
        id: GameIds.TIC_TAC_TOE,
        title: 'Tic Tac Toe',
        titleKey: 'games.tic-tac-toe.title',
        subtitle: 'Win 3 in a row!',
        subtitleKey: 'games.tic-tac-toe.subtitle',
        description: 'Win 3 in a row!',
        descriptionKey: 'games.tic-tac-toe.description',
        category: 'brain',
        level: 3,
        component: L3_TicTacToe,
        thumbnail: 'quad:🔥,,,❄️',
        tagsKey: 'games.tags.strategy'
    },
    {
        id: GameIds.BRAIN_OMOK,
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
        thumbnail: 'quad:⚫,⚪,⚪,⚫',
        tagsKey: 'games.tags.strategy'
    },
    {
        id: GameIds.BACK_MULTIPLICATION_LV3,
        title: 'Back Multiplication Lv.3',
        titleKey: 'games.backMultiplication.lv3.title',
        subtitle: '3-digit x 1-digit',
        subtitleKey: 'games.backMultiplication.lv3.subtitle',
        description: 'Practice back multiplication',
        descriptionKey: 'games.backMultiplication.description',
        category: 'math',
        level: 2,
        mode: 'genius',
        component: L2_BackMultiplicationLv3,
        thumbnail: '✖️',
        tagsKey: 'games.tags.mentalMath'
    },
    {
        id: GameIds.BACK_MULTIPLICATION_LV4,
        title: 'Back Multiplication Lv.4',
        titleKey: 'games.backMultiplication.lv4.title',
        subtitle: '2-digit x 2-digit',
        subtitleKey: 'games.backMultiplication.lv4.subtitle',
        description: 'Practice 2x2 cross multiplication',
        descriptionKey: 'games.backMultiplication.description',
        category: 'math',
        level: 2,
        mode: 'genius',
        component: L2_BackMultiplicationLv4,
        thumbnail: '✖️',
        tagsKey: 'games.tags.mentalMath'
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
