import type {
    BoardTile,
    BrainPulseDecoration,
    ForestClusterVariant,
    PlayAdventureBoardTheme,
} from './playAdventureBoardTypes';

export const COMING_SOON_THEMES = new Set<PlayAdventureBoardTheme>(['math', 'brain']);
export const COMING_SOON_PREVIEW_TILE_CLASSES = [
    'tile-a path',
    'tile-b path',
    'tile-c forest',
    'tile-d forest',
] as const;
export const COMING_SOON_PREVIEW_PAD_CLASSES = ['pad-l4', 'pad-l5'] as const;

export const LEVEL_ONE_CREATURE_BUNDLE_INDEXES = [0, 2, 4, 5] as const;
export const LEVEL_THREE_CREATURE_BUNDLE_INDEXES = [4, 6] as const;
export const CREATURE_VARIANTS = new Set<ForestClusterVariant>(['fish', 'jellyfish', 'whale', 'pufferfish', 'scorpions', 'beetles']);

export const LEVEL_ONE_WATER_DECORATIONS = [
    { top: '8%', left: '4%', size: '2.18rem', duration: '19s', delay: '-4s', opacity: 0.34 },
    { top: '16%', left: '24%', size: '1.65rem', duration: '15s', delay: '-9s', opacity: 0.28 },
    { top: '24%', left: '46%', size: '2.55rem', duration: '23s', delay: '-3s', opacity: 0.3 },
    { top: '38%', left: '8%', size: '1.8rem', duration: '17s', delay: '-11s', opacity: 0.26 },
    { top: '44%', left: '54%', size: '2.33rem', duration: '21s', delay: '-7s', opacity: 0.3 },
    { top: '58%', left: '30%', size: '1.58rem', duration: '16s', delay: '-5s', opacity: 0.24 },
    { top: '66%', left: '56%', size: '2.1rem', duration: '20s', delay: '-13s', opacity: 0.3 },
    { top: '78%', left: '22%', size: '1.88rem', duration: '18s', delay: '-2s', opacity: 0.28 },
] as const;

export const LEVEL_ONE_SAILBOAT_DECORATIONS = [
    { top: '21%', left: '18%', size: '1.55rem', duration: '26s', delay: '-6s', opacity: 0.42 },
    { top: '49%', left: '48%', size: '1.8rem', duration: '31s', delay: '-14s', opacity: 0.38 },
    { top: '71%', left: '34%', size: '1.45rem', duration: '28s', delay: '-10s', opacity: 0.4 },
] as const;

export const LEVEL_TWO_LEAF_DECORATIONS = [
    { top: '10%', left: '72%', size: '2.1rem', duration: '20s', delay: '-5s', opacity: 0.28 },
    { top: '18%', left: '48%', size: '1.7rem', duration: '16s', delay: '-9s', opacity: 0.24 },
    { top: '29%', left: '86%', size: '2.35rem', duration: '24s', delay: '-3s', opacity: 0.26 },
    { top: '41%', left: '57%', size: '1.85rem', duration: '18s', delay: '-11s', opacity: 0.23 },
    { top: '54%', left: '79%', size: '2.2rem', duration: '22s', delay: '-7s', opacity: 0.26 },
    { top: '67%', left: '43%', size: '1.6rem', duration: '17s', delay: '-13s', opacity: 0.22 },
    { top: '79%', left: '68%', size: '2rem', duration: '21s', delay: '-2s', opacity: 0.25 },
    { top: '24%', left: '50%', size: '1.9rem', duration: '19s', delay: '-8s', opacity: 0.24 },
    { top: '60%', left: '48%', size: '1.75rem', duration: '18s', delay: '-6s', opacity: 0.23 },
    { top: '14%', left: '60%', size: '1.95rem', duration: '23s', delay: '-10s', opacity: 0.24 },
    { top: '36%', left: '70%', size: '1.7rem', duration: '20s', delay: '-1s', opacity: 0.22 },
    { top: '72%', left: '55%', size: '1.85rem', duration: '19s', delay: '-14s', opacity: 0.23 },
] as const;

export const LEVEL_TWO_ENVIRA_DECORATIONS = [
    { top: '23%', left: '64%', size: '1.55rem', duration: '27s', delay: '-6s', opacity: 0.32 },
    { top: '48%', left: '84%', size: '1.75rem', duration: '30s', delay: '-12s', opacity: 0.28 },
    { top: '73%', left: '58%', size: '1.45rem', duration: '28s', delay: '-9s', opacity: 0.3 },
    { top: '36%', left: '46%', size: '1.6rem', duration: '25s', delay: '-4s', opacity: 0.3 },
    { top: '18%', left: '56%', size: '1.5rem', duration: '26s', delay: '-16s', opacity: 0.29 },
    { top: '62%', left: '74%', size: '1.68rem', duration: '29s', delay: '-7s', opacity: 0.27 },
] as const;

export const LEVEL_TWO_BIRD_DECORATIONS = [
    { top: '14%', left: '12%', size: '1.7rem', duration: '34s', delay: '-8s', opacity: 0.44, icon: 'dove' },
    { top: '32%', left: '30%', size: '1.45rem', duration: '38s', delay: '-15s', opacity: 0.36, icon: 'twitter' },
    { top: '57%', left: '10%', size: '1.6rem', duration: '36s', delay: '-4s', opacity: 0.4, icon: 'dove' },
    { top: '74%', left: '36%', size: '1.35rem', duration: '40s', delay: '-18s', opacity: 0.34, icon: 'twitter' },
] as const;

export const LEVEL_THREE_WIND_DECORATIONS = [
    { top: '12%', left: '8%', size: '1.9rem', duration: '24s', delay: '-5s', opacity: 0.26 },
    { top: '22%', left: '28%', size: '1.55rem', duration: '18s', delay: '-11s', opacity: 0.22 },
    { top: '38%', left: '16%', size: '2.15rem', duration: '26s', delay: '-3s', opacity: 0.24 },
    { top: '51%', left: '34%', size: '1.75rem', duration: '21s', delay: '-9s', opacity: 0.2 },
    { top: '66%', left: '10%', size: '2.05rem', duration: '25s', delay: '-14s', opacity: 0.24 },
    { top: '79%', left: '30%', size: '1.6rem', duration: '19s', delay: '-7s', opacity: 0.22 },
    { top: '16%', left: '46%', size: '1.7rem', duration: '20s', delay: '-12s', opacity: 0.22 },
    { top: '30%', left: '58%', size: '2rem', duration: '27s', delay: '-6s', opacity: 0.24 },
    { top: '46%', left: '50%', size: '1.45rem', duration: '17s', delay: '-16s', opacity: 0.2 },
    { top: '61%', left: '64%', size: '1.85rem', duration: '23s', delay: '-10s', opacity: 0.22 },
    { top: '74%', left: '48%', size: '1.7rem', duration: '18s', delay: '-4s', opacity: 0.21 },
    { top: '84%', left: '62%', size: '1.5rem', duration: '22s', delay: '-13s', opacity: 0.2 },
    { top: '10%', left: '72%', size: '1.8rem', duration: '21s', delay: '-8s', opacity: 0.22 },
    { top: '26%', left: '82%', size: '1.55rem', duration: '19s', delay: '-2s', opacity: 0.2 },
    { top: '42%', left: '74%', size: '1.95rem', duration: '24s', delay: '-12s', opacity: 0.23 },
    { top: '57%', left: '86%', size: '1.6rem', duration: '20s', delay: '-6s', opacity: 0.2 },
    { top: '72%', left: '76%', size: '1.75rem', duration: '22s', delay: '-15s', opacity: 0.21 },
] as const;

export const BRAIN_LEVEL_PULSE_DECORATIONS: Record<number, readonly BrainPulseDecoration[]> = {
    1: [
        { className: 'horizontal-right', top: '18%', left: '-10%', duration: '7.2s', delay: '0s' },
        { className: 'horizontal-left', top: '54%', left: '108%', duration: '9.1s', delay: '2.1s' },
        { className: 'vertical-down', top: '-12%', left: '24%', duration: '8.3s', delay: '1.2s' },
        { className: 'vertical-up', top: '104%', left: '78%', duration: '10.2s', delay: '4.1s' },
    ],
    2: [
        { className: 'horizontal-right', top: '24%', left: '-10%', duration: '8.4s', delay: '0.7s' },
        { className: 'horizontal-left', top: '66%', left: '108%', duration: '9.8s', delay: '2.9s' },
        { className: 'vertical-down', top: '-12%', left: '42%', duration: '7.9s', delay: '1.4s' },
        { className: 'vertical-up', top: '104%', left: '16%', duration: '10.8s', delay: '4.8s' },
    ],
    3: [
        { className: 'horizontal-right', top: '22%', left: '-10%', duration: '7.8s', delay: '0.4s' },
        { className: 'horizontal-left', top: '62%', left: '108%', duration: '10.4s', delay: '3.2s' },
        { className: 'vertical-down', top: '-12%', left: '70%', duration: '8.6s', delay: '1.8s' },
        { className: 'vertical-up', top: '104%', left: '34%', duration: '9.6s', delay: '4.6s' },
    ],
};

const LEVEL_TWO_SIMPLE_CLUSTER_BY_BUNDLE: Partial<Record<number, ForestClusterVariant>> = {
    0: 'trees',
    1: 'pines',
    4: 'pines',
    5: 'trees',
};

const LEVEL_THREE_SIMPLE_CLUSTER_BY_BUNDLE: Partial<Record<number, ForestClusterVariant>> = {
    0: 'desert-sprouts',
    1: 'cacti',
    2: 'cacti',
    3: 'rocks',
    4: 'scorpions',
    5: 'cacti',
    6: 'beetles',
    7: 'cacti',
};

export const PLAY_LEVEL_WORLD_TITLE_KEYS: Record<number, string> = {
    1: 'play.worlds.level1',
    2: 'play.worlds.level2',
    3: 'play.worlds.level3',
};

export const getPlayAdventureBoardTitleKey = (theme: PlayAdventureBoardTheme, level: number) => {
    if (theme === 'brain') return 'play.categories.brain';
    return PLAY_LEVEL_WORLD_TITLE_KEYS[level] ?? 'play.controls.level';
};

export const getForestClusterVariant = (
    theme: PlayAdventureBoardTheme,
    level: number,
    tile: BoardTile,
    tileBundleIndex: number,
    rowOffset: number,
    diamondStep: number
): ForestClusterVariant | null => {
    if (theme === 'brain') return null;
    if (tile.kind !== 'forest') return null;
    const bundleLocalY = tile.y - rowOffset - (tileBundleIndex * diamondStep);

    if (level === 1) {
        if (tileBundleIndex === 0) return 'fish';
        if (tileBundleIndex === 2) return 'jellyfish';
        if (tileBundleIndex === 4) return 'whale';
        if (tileBundleIndex === 5) return 'pufferfish';
        if (tileBundleIndex === 1 && bundleLocalY === 2 && tile.x === 0) return 'island';
        if (tileBundleIndex === 3 && bundleLocalY === 2 && tile.x === 2) return 'beach';
        return null;
    }

    if (level === 2) {
        if (tileBundleIndex === 2) {
            if (tile.x === 2) return 'sunflowers';
            return tile.x === 4 ? null : 'tulips';
        }

        if (tileBundleIndex === 3) {
            return tile.x === 0 ? 'woodpile' : 'mushrooms';
        }

        if (tileBundleIndex === 4) {
            return bundleLocalY === 3 && tile.x === 3 ? 'pines' : null;
        }

        return LEVEL_TWO_SIMPLE_CLUSTER_BY_BUNDLE[tileBundleIndex] ?? null;
    }

    if (level === 3) {
        if (tileBundleIndex === 2) {
            if (bundleLocalY === 2 && tile.x === 4) return 'desert-oasis';
            return null;
        }

        if (tileBundleIndex === 8) {
            if (bundleLocalY === 1) return 'cacti';
            if (bundleLocalY === 2) return tile.x === 2 ? 'cacti' : 'rocks';
            if (bundleLocalY === 3) return 'rocks';
        }

        return LEVEL_THREE_SIMPLE_CLUSTER_BY_BUNDLE[tileBundleIndex] ?? null;
    }

    return null;
};
