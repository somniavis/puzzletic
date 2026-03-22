import React from 'react';
import { useTranslation } from 'react-i18next';
import type { GameManifest } from '../../games/types';
import { renderThumbnail } from '../../utils/playPageUtils';
import type { Character } from '../../types/character';
import { JelloAvatar } from '../characters/JelloAvatar';
import { playJelloClickSound } from '../../utils/sound';

export interface PlayAdventureBoardGame {
    game: GameManifest;
    unlocked: boolean;
    isPremiumLocked: boolean;
    displayReason?: string;
    clearCount: number;
    isMastered: boolean;
}

interface PlayAdventureBoardProps {
    levelGroups: Array<{
        level: number;
        games: PlayAdventureBoardGame[];
    }>;
    selectedGameId: string | null;
    currentJelloGameId?: string | null;
    currentJelloTilePosition?: {
        level: number;
        x: number;
        y: number;
    } | null;
    jelloCharacter?: Character | null;
    onSelectGame: (gameId: string) => void;
    onSelectTile: (position: { level: number; x: number; y: number }) => void;
}

type BoardTileKind = 'path' | 'forest';

interface BoardTile {
    x: number;
    y: number;
    kind: BoardTileKind;
}

interface BoardSlot {
    x: number;
    y: number;
}

interface BoardLayout {
    boardRows: number;
    tiles: BoardTile[];
    padSlots: BoardSlot[];
    hasStartPad: boolean;
    rowOffset: number;
}

interface BoardLevelViewModel {
    level: number;
    games: PlayAdventureBoardGame[];
    layout: BoardLayout;
    accessibleBundleIndexes: Set<number>;
}

interface BoardLevelRenderModel extends BoardLevelViewModel {
    currentJelloGame: PlayAdventureBoardGame | null;
    currentJelloSlot: { x: number; y: number } | null;
    currentFreeRoamTile: { level: number; x: number; y: number } | null;
}

type ForestClusterVariant =
    | 'island'
    | 'beach'
    | 'desert-oasis'
    | 'fish'
    | 'jellyfish'
    | 'whale'
    | 'pufferfish'
    | 'trees'
    | 'pines'
    | 'sunflowers'
    | 'tulips'
    | 'mushrooms'
    | 'woodpile'
    | 'desert-sprouts'
    | 'cacti'
    | 'rocks'
    | 'scorpions'
    | 'beetles';

interface CreatureMotionPreset {
    animationName: string;
    delay: string;
    duration: string;
}

interface CreatureFacingPreset {
    scaleX: string;
    angle: string;
}

interface CreatureMotionAssignment extends CreatureMotionPreset, CreatureFacingPreset {
}

interface BoatMotionAssignment {
    tileKey: string;
    animationName: string;
    delay: string;
    duration: string;
}

const randomizeArray = <T,>(items: T[]) => {
    const nextItems = [...items];

    for (let index = nextItems.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [nextItems[index], nextItems[swapIndex]] = [nextItems[swapIndex], nextItems[index]];
    }

    return nextItems;
};

const DIAMOND_STEP = 4;
const START_PAD_ROW_OFFSET = 1;
const DEFAULT_LEVEL_ROW_OFFSET = 1;
const LEVEL_ONE_CREATURE_BUNDLE_INDEXES = [0, 2, 4, 5] as const;
const LEVEL_THREE_CREATURE_BUNDLE_INDEXES = [4, 6] as const;
const CREATURE_VARIANTS = new Set<ForestClusterVariant>(['fish', 'jellyfish', 'whale', 'pufferfish', 'scorpions', 'beetles']);

const DIAMOND_A_TILES: BoardTile[] = [
    { x: 2, y: 0, kind: 'path' },
    { x: 1, y: 1, kind: 'path' },
    { x: 3, y: 1, kind: 'forest' },
    { x: 0, y: 2, kind: 'path' },
    { x: 2, y: 2, kind: 'forest' },
    { x: 4, y: 2, kind: 'forest' },
    { x: 1, y: 3, kind: 'path' },
    { x: 3, y: 3, kind: 'forest' },
    { x: 2, y: 4, kind: 'path' },
];

const DIAMOND_B_TILES: BoardTile[] = [
    { x: 2, y: 0, kind: 'path' },
    { x: 1, y: 1, kind: 'forest' },
    { x: 3, y: 1, kind: 'path' },
    { x: 0, y: 2, kind: 'forest' },
    { x: 2, y: 2, kind: 'forest' },
    { x: 4, y: 2, kind: 'path' },
    { x: 1, y: 3, kind: 'forest' },
    { x: 3, y: 3, kind: 'path' },
    { x: 2, y: 4, kind: 'path' },
];

const PAD_X_SEQUENCE = [2, 0, 2, 4];
const LEVEL_ONE_WATER_DECORATIONS = [
    { top: '8%', left: '4%', size: '2.18rem', duration: '19s', delay: '-4s', opacity: 0.34 },
    { top: '16%', left: '24%', size: '1.65rem', duration: '15s', delay: '-9s', opacity: 0.28 },
    { top: '24%', left: '46%', size: '2.55rem', duration: '23s', delay: '-3s', opacity: 0.3 },
    { top: '38%', left: '8%', size: '1.8rem', duration: '17s', delay: '-11s', opacity: 0.26 },
    { top: '44%', left: '54%', size: '2.33rem', duration: '21s', delay: '-7s', opacity: 0.3 },
    { top: '58%', left: '30%', size: '1.58rem', duration: '16s', delay: '-5s', opacity: 0.24 },
    { top: '66%', left: '56%', size: '2.1rem', duration: '20s', delay: '-13s', opacity: 0.3 },
    { top: '78%', left: '22%', size: '1.88rem', duration: '18s', delay: '-2s', opacity: 0.28 },
];
const LEVEL_ONE_SAILBOAT_DECORATIONS = [
    { top: '21%', left: '18%', size: '1.55rem', duration: '26s', delay: '-6s', opacity: 0.42 },
    { top: '49%', left: '48%', size: '1.8rem', duration: '31s', delay: '-14s', opacity: 0.38 },
    { top: '71%', left: '34%', size: '1.45rem', duration: '28s', delay: '-10s', opacity: 0.4 },
];
const LEVEL_TWO_LEAF_DECORATIONS = [
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
];
const LEVEL_TWO_ENVIRA_DECORATIONS = [
    { top: '23%', left: '64%', size: '1.55rem', duration: '27s', delay: '-6s', opacity: 0.32 },
    { top: '48%', left: '84%', size: '1.75rem', duration: '30s', delay: '-12s', opacity: 0.28 },
    { top: '73%', left: '58%', size: '1.45rem', duration: '28s', delay: '-9s', opacity: 0.3 },
    { top: '36%', left: '46%', size: '1.6rem', duration: '25s', delay: '-4s', opacity: 0.3 },
    { top: '18%', left: '56%', size: '1.5rem', duration: '26s', delay: '-16s', opacity: 0.29 },
    { top: '62%', left: '74%', size: '1.68rem', duration: '29s', delay: '-7s', opacity: 0.27 },
];
const LEVEL_TWO_BIRD_DECORATIONS = [
    { top: '14%', left: '12%', size: '1.7rem', duration: '34s', delay: '-8s', opacity: 0.44, icon: 'dove' },
    { top: '32%', left: '30%', size: '1.45rem', duration: '38s', delay: '-15s', opacity: 0.36, icon: 'twitter' },
    { top: '57%', left: '10%', size: '1.6rem', duration: '36s', delay: '-4s', opacity: 0.4, icon: 'dove' },
    { top: '74%', left: '36%', size: '1.35rem', duration: '40s', delay: '-18s', opacity: 0.34, icon: 'twitter' },
];
const LEVEL_THREE_WIND_DECORATIONS = [
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
];
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
const PLAY_LEVEL_WORLD_TITLE_KEYS: Record<number, string> = {
    1: 'play.worlds.level1',
    2: 'play.worlds.level2',
    3: 'play.worlds.level3',
};
const CREATURE_PRESETS: CreatureMotionAssignment[] = [
    { animationName: 'playBoardFishLeft', delay: '0s', duration: '18s', scaleX: '1', angle: '0deg' },
    { animationName: 'playBoardFishRight', delay: '3s', duration: '19s', scaleX: '-1', angle: '0deg' },
    { animationName: 'playBoardFishUpLeft', delay: '6s', duration: '17s', scaleX: '1', angle: '-28deg' },
    { animationName: 'playBoardFishDownRight', delay: '9s', duration: '20s', scaleX: '-1', angle: '28deg' },
    { animationName: 'playBoardFishUpRight', delay: '12s', duration: '18s', scaleX: '-1', angle: '-28deg' },
    { animationName: 'playBoardFishDownLeft', delay: '15s', duration: '19s', scaleX: '1', angle: '28deg' },
];

const BOAT_PRESETS: Omit<BoatMotionAssignment, 'tileKey'>[] = [
    { animationName: 'playBoardBoatRight', delay: '0s', duration: '14s' },
    { animationName: 'playBoardBoatLeft', delay: '0s', duration: '15s' },
];

type SeaCreatureEmojiProfile = 'default' | 'fallback';

let cachedSeaCreatureEmojiProfile: SeaCreatureEmojiProfile | null = null;

const getRandomCreaturePreset = (exclude?: CreatureMotionAssignment | null) => {
    const candidates = CREATURE_PRESETS.filter((preset) =>
        !exclude
        || preset.animationName !== exclude.animationName
        || preset.scaleX !== exclude.scaleX
        || preset.angle !== exclude.angle
    );

    const pool = candidates.length > 0 ? candidates : CREATURE_PRESETS;
    return pool[Math.floor(Math.random() * pool.length)];
};

const getRandomBoatPreset = (tileKeys: string[], exclude?: BoatMotionAssignment | null): BoatMotionAssignment | null => {
    if (tileKeys.length === 0) return null;

    const tilePool = tileKeys.filter((tileKey) => tileKey !== exclude?.tileKey);
    const nextTileKey = (tilePool.length > 0 ? tilePool : tileKeys)[Math.floor(Math.random() * (tilePool.length > 0 ? tilePool : tileKeys).length)];

    const presetPool = BOAT_PRESETS.filter((preset) => preset.animationName !== exclude?.animationName);
    const nextPreset = (presetPool.length > 0 ? presetPool : BOAT_PRESETS)[Math.floor(Math.random() * (presetPool.length > 0 ? presetPool : BOAT_PRESETS).length)];

    return {
        tileKey: nextTileKey,
        ...nextPreset,
    };
};

const getOverlayTileKeys = (
    layout: BoardLayout | null,
    level: number,
    bundleIndex: number,
    matcher: (bundleLocalY: number, tile: BoardTile) => boolean
) => {
    if (!layout) return [] as string[];

    return layout.tiles
        .filter((tile) => {
            const tileBundleIndex = getBundleIndex(tile.y, layout.rowOffset);
            if (tileBundleIndex !== bundleIndex || tile.kind !== 'forest') return false;
            const bundleLocalY = tile.y - layout.rowOffset - (tileBundleIndex * DIAMOND_STEP);
            return matcher(bundleLocalY, tile);
        })
        .map((tile) => `${level}:${tile.x}:${tile.y}`);
};

const renderEmojiCluster = (
    emoji: string,
    clusterClassName = 'play-board-tree-cluster',
    itemClassName = 'play-board-tree',
    slotPrefix: 'tree' | 'object' = 'tree'
) => (
    <span className={clusterClassName} aria-hidden="true">
        <span className={`${itemClassName} ${slotPrefix}-a`}>{emoji}</span>
        <span className={`${itemClassName} ${slotPrefix}-b`}>{emoji}</span>
        <span className={`${itemClassName} ${slotPrefix}-c`}>{emoji}</span>
        <span className={`${itemClassName} ${slotPrefix}-d`}>{emoji}</span>
    </span>
);

const renderCenteredEmoji = (emoji: string, className = 'play-board-centered-object') => (
    <span className={className} aria-hidden="true">
        {emoji}
    </span>
);

const getSeaCreatureEmojiProfile = (): SeaCreatureEmojiProfile => {
    if (cachedSeaCreatureEmojiProfile) return cachedSeaCreatureEmojiProfile;
    if (typeof navigator === 'undefined') return 'default';

    const ua = navigator.userAgent || '';
    const platform = navigator.platform || '';
    const isIOSDevice = /iP(hone|od|ad)/.test(ua) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isWindowsDevice = /Windows/i.test(ua) || /Win/i.test(platform);

    if (isWindowsDevice) {
        cachedSeaCreatureEmojiProfile = 'fallback';
        return cachedSeaCreatureEmojiProfile;
    }

    if (!isIOSDevice) {
        cachedSeaCreatureEmojiProfile = 'default';
        return cachedSeaCreatureEmojiProfile;
    }

    const iosVersionMatch = ua.match(/OS (\d+)_/);
    const iosMajorVersion = iosVersionMatch ? parseInt(iosVersionMatch[1], 10) : null;
    const isLegacyIOS = iosMajorVersion !== null && iosMajorVersion <= 15;

    cachedSeaCreatureEmojiProfile = isLegacyIOS ? 'fallback' : 'default';
    return cachedSeaCreatureEmojiProfile;
};

const getSeaCreatureEmoji = (variant: 'fish' | 'jellyfish') => {
    if (variant === 'fish') return '🐟';

    return getSeaCreatureEmojiProfile() === 'fallback' ? '🐢' : '🪼';
};

const getOverlayAnimationName = (animationName: string, emoji: string) => {
    if (emoji === '🐫' || emoji === '🐘') {
        switch (animationName) {
        case 'playBoardBoatRight':
            return 'playBoardCamelRight';
        case 'playBoardBoatLeft':
            return 'playBoardCamelLeft';
        default:
            return animationName;
        }
    }

    if (emoji === '🐝') {
        switch (animationName) {
        case 'playBoardBoatRight':
            return 'playBoardBeeRight';
        case 'playBoardBoatLeft':
            return 'playBoardBeeLeft';
        default:
            return animationName;
        }
    }

    if (emoji !== '⛵') return animationName;

    switch (animationName) {
    case 'playBoardBoatRight':
        return 'playBoardSailboatRight';
    case 'playBoardBoatLeft':
        return 'playBoardSailboatLeft';
    default:
        return animationName;
    }
};

const getForestClusterVariant = (
    level: number,
    tile: BoardTile,
    tileBundleIndex: number,
    rowOffset: number
): ForestClusterVariant | null => {
    if (tile.kind !== 'forest') return null;
    const bundleLocalY = tile.y - rowOffset - (tileBundleIndex * DIAMOND_STEP);

    if (level === 1) {
        if (tileBundleIndex === 0) {
            return 'fish';
        }

        if (tileBundleIndex === 2) {
            return 'jellyfish';
        }

        if (tileBundleIndex === 4) {
            return 'whale';
        }

        if (tileBundleIndex === 5) {
            return 'pufferfish';
        }

        if (tileBundleIndex === 1 && bundleLocalY === 2 && tile.x === 0) {
            return 'island';
        }

        if (tileBundleIndex === 3 && bundleLocalY === 2 && tile.x === 2) {
            return 'beach';
        }

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
            if (bundleLocalY === 2 && tile.x === 4) {
                return 'desert-oasis';
            }
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

const renderBoat = (
    boatMotion: BoatMotionAssignment | null,
    emoji: string,
    className: string,
    onBoatAnimationIteration?: () => void
) => {
    if (!boatMotion) return null;

    return (
        <span
            className={className}
            aria-hidden="true"
            onAnimationIteration={() => {
                if (onBoatAnimationIteration) {
                    onBoatAnimationIteration();
                }
            }}
            style={{
                animation: `${getOverlayAnimationName(boatMotion.animationName, emoji)} ${boatMotion.duration} ease-in-out ${boatMotion.delay} infinite`,
            }}
        >
            {emoji === '🚢' ? (
                <>
                    <span className="play-board-boat-icon left">🚢</span>
                    <span className="play-board-boat-icon right">🚢</span>
                </>
            ) : emoji === '🐫' ? (
                <span
                    className={`play-board-camel-icon ${boatMotion.animationName === 'playBoardBoatRight' ? 'is-flipped' : ''}`}
                >
                    🐫
                </span>
            ) : emoji === '🐘' ? (
                <span
                    className={`play-board-elephant-icon ${boatMotion.animationName === 'playBoardBoatRight' ? 'is-flipped' : ''}`}
                >
                    🐘
                </span>
            ) : emoji === '🐝' ? (
                <span
                    className={`play-board-bee-icon ${boatMotion.animationName === 'playBoardBoatRight' ? 'is-flipped' : ''}`}
                >
                    🐝
                </span>
            ) : (
                <span className="play-board-overlay-sailboat-icon">{emoji}</span>
            )}
        </span>
    );
};

const renderForestCluster = (
    variant: ForestClusterVariant | null,
    creatureMotion: CreatureMotionAssignment | null,
    tileKey?: string,
    onCreatureAnimationIteration?: (tileKey: string) => void
) => {
    if (!variant) return null;

    switch (variant) {
    case 'island':
        return renderCenteredEmoji('🏝️');
    case 'beach':
        return renderCenteredEmoji('🏖️');
    case 'desert-oasis':
        return renderCenteredEmoji('🏜️');
    case 'fish':
        return creatureMotion ? (
            <span
                className="play-board-scorpion play-board-fish"
                aria-hidden="true"
                onAnimationIteration={() => {
                    if (tileKey && onCreatureAnimationIteration) {
                        onCreatureAnimationIteration(tileKey);
                    }
                }}
                style={{
                    animation: `${creatureMotion.animationName} ${creatureMotion.duration} ease-in-out ${creatureMotion.delay} infinite`,
                    ['--scorpion-scale-x' as string]: creatureMotion.scaleX,
                    ['--creature-angle' as string]: creatureMotion.angle,
                }}
            >
                {getSeaCreatureEmoji('fish')}
            </span>
        ) : null;
    case 'jellyfish':
        return creatureMotion ? (
            <span
                className="play-board-scorpion play-board-fish play-board-jellyfish"
                aria-hidden="true"
                onAnimationIteration={() => {
                    if (tileKey && onCreatureAnimationIteration) {
                        onCreatureAnimationIteration(tileKey);
                    }
                }}
                style={{
                    animation: `${creatureMotion.animationName} ${creatureMotion.duration} ease-in-out ${creatureMotion.delay} infinite`,
                    ['--scorpion-scale-x' as string]: creatureMotion.scaleX,
                    ['--creature-angle' as string]: creatureMotion.angle,
                }}
            >
                {getSeaCreatureEmoji('jellyfish')}
            </span>
        ) : null;
    case 'whale':
        return creatureMotion ? (
            <span
                className="play-board-scorpion play-board-fish play-board-whale"
                aria-hidden="true"
                onAnimationIteration={() => {
                    if (tileKey && onCreatureAnimationIteration) {
                        onCreatureAnimationIteration(tileKey);
                    }
                }}
                style={{
                    animation: `${creatureMotion.animationName} ${creatureMotion.duration} ease-in-out ${creatureMotion.delay} infinite`,
                    ['--scorpion-scale-x' as string]: creatureMotion.scaleX,
                    ['--creature-angle' as string]: creatureMotion.angle,
                }}
            >
                🐳
            </span>
        ) : null;
    case 'pufferfish':
        return creatureMotion ? (
            <span
                className="play-board-scorpion play-board-fish play-board-pufferfish"
                aria-hidden="true"
                onAnimationIteration={() => {
                    if (tileKey && onCreatureAnimationIteration) {
                        onCreatureAnimationIteration(tileKey);
                    }
                }}
                style={{
                    animation: `${creatureMotion.animationName} ${creatureMotion.duration} ease-in-out ${creatureMotion.delay} infinite`,
                    ['--scorpion-scale-x' as string]: creatureMotion.scaleX,
                    ['--creature-angle' as string]: creatureMotion.angle,
                }}
            >
                🐡
            </span>
        ) : null;
    case 'trees':
        return renderEmojiCluster('🌳');
    case 'pines':
        return renderEmojiCluster('🌲');
    case 'sunflowers':
        return renderEmojiCluster('🌻', 'play-board-tree-cluster play-board-flower-cluster');
    case 'tulips':
        return renderEmojiCluster('🌷', 'play-board-tree-cluster play-board-flower-cluster');
    case 'mushrooms':
        return renderEmojiCluster('🍄', 'play-board-tree-cluster play-board-object-cluster play-board-mushroom-cluster', 'play-board-object', 'object');
    case 'woodpile':
        return renderEmojiCluster('🪵', 'play-board-tree-cluster play-board-object-cluster play-board-woodpile-cluster', 'play-board-object', 'object');
    case 'desert-sprouts':
        return renderEmojiCluster('🪾', 'play-board-tree-cluster play-board-desert-cluster');
    case 'cacti':
        return renderEmojiCluster('🌵', 'play-board-tree-cluster play-board-desert-cluster');
    case 'rocks':
        return renderEmojiCluster('🪨', 'play-board-tree-cluster play-board-desert-cluster');
    case 'scorpions':
        return creatureMotion ? (
            <span
                className="play-board-scorpion"
                aria-hidden="true"
                onAnimationIteration={() => {
                    if (tileKey && onCreatureAnimationIteration) {
                        onCreatureAnimationIteration(tileKey);
                    }
                }}
                style={{
                    animation: `${creatureMotion.animationName} ${creatureMotion.duration} ease-in-out ${creatureMotion.delay} infinite`,
                    ['--scorpion-scale-x' as string]: creatureMotion.scaleX,
                    ['--creature-angle' as string]: creatureMotion.angle,
                }}
            >
                🦂
            </span>
        ) : null;
    case 'beetles':
        return creatureMotion ? (
            <span
                className="play-board-scorpion play-board-beetle"
                aria-hidden="true"
                onAnimationIteration={() => {
                    if (tileKey && onCreatureAnimationIteration) {
                        onCreatureAnimationIteration(tileKey);
                    }
                }}
                style={{
                    animation: `${creatureMotion.animationName} ${creatureMotion.duration} ease-in-out ${creatureMotion.delay} infinite`,
                    ['--scorpion-scale-x' as string]: creatureMotion.scaleX,
                    ['--creature-angle' as string]: creatureMotion.angle,
                }}
            >
                🪲
            </span>
        ) : null;
    default:
        return null;
    }
};

const buildTiles = (diamondCount: number) => {
    const tiles = new Map<string, BoardTile>();

    Array.from({ length: diamondCount }).forEach((_, diamondIndex) => {
        const source = diamondIndex % 2 === 0 ? DIAMOND_A_TILES : DIAMOND_B_TILES;
        const yOffset = diamondIndex * DIAMOND_STEP;

        source.forEach((tile) => {
            const nextTile = {
                ...tile,
                y: tile.y + yOffset,
            };
            tiles.set(`${nextTile.x}:${nextTile.y}`, nextTile);
        });
    });

    return Array.from(tiles.values()).sort((a, b) => (a.y - b.y) || (a.x - b.x));
};

const buildPadSlots = (slotCount: number) =>
    Array.from({ length: slotCount }).map((_, index) => ({
        x: PAD_X_SEQUENCE[index % PAD_X_SEQUENCE.length],
        y: index * 2,
    }));

const buildBoardLayout = (level: number, gameCount: number): BoardLayout => {
    const hasStartPad = level === 1;
    const rowOffset = hasStartPad ? START_PAD_ROW_OFFSET : DEFAULT_LEVEL_ROW_OFFSET;
    const totalPadCount = gameCount + (hasStartPad ? 1 : 0);
    const boardRows = Math.max(5, totalPadCount * 2 + 1 + rowOffset);
    const diamondCount = Math.max(2, Math.ceil((boardRows - 1) / DIAMOND_STEP) + 1);

    return {
        boardRows,
        hasStartPad,
        rowOffset,
        tiles: buildTiles(diamondCount).map((tile) => ({
            ...tile,
            y: tile.y + rowOffset,
        })),
        padSlots: buildPadSlots(totalPadCount).map((slot) => ({
            ...slot,
            y: slot.y + rowOffset,
        })),
    };
};

const getBundleIndex = (y: number, rowOffset: number) =>
    Math.max(0, Math.floor((y - rowOffset) / DIAMOND_STEP));

const buildAccessibleBundleIndexes = (
    games: PlayAdventureBoardGame[],
    padSlots: BoardSlot[],
    hasStartPad: boolean,
    rowOffset: number
) => {
    const representativeMissionByBundle = new Map<number, PlayAdventureBoardGame>();

    games.forEach((boardGame, gameIndex) => {
        const slot = padSlots[gameIndex + (hasStartPad ? 1 : 0)];
        const bundleIndex = getBundleIndex(slot.y, rowOffset);
        // Use the trailing mission in each bundle as the unlock representative.
        representativeMissionByBundle.set(bundleIndex, boardGame);
    });

    const accessibleBundleIndexes = new Set<number>([0]);
    Array.from(representativeMissionByBundle.entries())
        .sort(([a], [b]) => a - b)
        .forEach(([bundleIndex, boardGame]) => {
            if (bundleIndex > 0 && boardGame.unlocked) {
                accessibleBundleIndexes.add(bundleIndex);
            }
        });

    return accessibleBundleIndexes;
};

export const PlayAdventureBoard: React.FC<PlayAdventureBoardProps> = ({
    levelGroups,
    selectedGameId,
    currentJelloGameId,
    currentJelloTilePosition,
    jelloCharacter,
    onSelectGame,
    onSelectTile,
}) => {
    const { t } = useTranslation();
    const playJelloMoveSound = React.useCallback(() => {
        playJelloClickSound(0.35);
    }, []);
    const boardLevels = React.useMemo<BoardLevelViewModel[]>(
        () => levelGroups.map(({ level, games }) => {
            const layout = buildBoardLayout(level, games.length);
            const { padSlots, hasStartPad, rowOffset } = layout;

            return {
                level,
                games,
                layout,
                accessibleBundleIndexes: buildAccessibleBundleIndexes(games, padSlots, hasStartPad, rowOffset),
            };
        }),
        [levelGroups]
    );
    const renderBoardLevels = React.useMemo<BoardLevelRenderModel[]>(
        () => boardLevels.map((boardLevel) => {
            const { level, games, layout } = boardLevel;
            const { padSlots, hasStartPad } = layout;
            const currentJelloIndex = currentJelloGameId
                ? games.findIndex(({ game }) => game.id === currentJelloGameId)
                : -1;
            const currentJelloGame = currentJelloIndex >= 0 ? games[currentJelloIndex] : null;
            const currentMissionSlot = currentJelloIndex >= 0
                ? padSlots[currentJelloIndex + (hasStartPad ? 1 : 0)]
                : null;
            const currentFreeRoamTile = currentJelloTilePosition?.level === level
                ? currentJelloTilePosition
                : null;

            return {
                ...boardLevel,
                currentJelloGame,
                currentJelloSlot: currentFreeRoamTile ?? currentMissionSlot,
                currentFreeRoamTile,
            };
        }),
        [boardLevels, currentJelloGameId, currentJelloTilePosition]
    );
    const levelOneLayout = React.useMemo(
        () => boardLevels.find(({ level }) => level === 1)?.layout ?? null,
        [boardLevels]
    );
    const initialCreatureMotionByTileKey = React.useMemo(() => {
        const assignments = new Map<string, CreatureMotionAssignment>();

        boardLevels.forEach(({ level, layout }) => {
            const creatureBundleIndexes =
                level === 1 ? LEVEL_ONE_CREATURE_BUNDLE_INDEXES
                    : level === 3 ? LEVEL_THREE_CREATURE_BUNDLE_INDEXES
                        : [];

            creatureBundleIndexes.forEach((bundleIndex) => {
                const creatureTiles = layout.tiles.filter((tile) =>
                    tile.kind === 'forest' && getBundleIndex(tile.y, layout.rowOffset) === bundleIndex
                );

                const shuffledPresets = randomizeArray(CREATURE_PRESETS);

                creatureTiles.forEach((tile, index) => {
                    assignments.set(`${level}:${tile.x}:${tile.y}`, shuffledPresets[index % shuffledPresets.length]);
                });
            });
        });

        return assignments;
    }, [boardLevels]);
    const levelOneBoatTileKeys = React.useMemo(
        () => getOverlayTileKeys(levelOneLayout, 1, 3, (bundleLocalY, tile) =>
            (bundleLocalY === 1 && tile.x === 1) || (bundleLocalY === 2 && tile.x === 0) || (bundleLocalY === 3 && tile.x === 1)
        ),
        [levelOneLayout]
    );
    const levelOneSailboatTileKeys = React.useMemo(
        () => getOverlayTileKeys(levelOneLayout, 1, 1, (bundleLocalY, tile) =>
            (bundleLocalY === 1 && tile.x === 1) || (bundleLocalY === 2 && tile.x === 2) || (bundleLocalY === 3 && tile.x === 1)
        ),
        [levelOneLayout]
    );
    const levelThreeLayout = React.useMemo(
        () => boardLevels.find(({ level }) => level === 3)?.layout ?? null,
        [boardLevels]
    );
    const levelThreeCamelTileKeys = React.useMemo(
        () => getOverlayTileKeys(levelThreeLayout, 3, 2, (bundleLocalY, tile) =>
            (bundleLocalY === 1 && tile.x === 3) || (bundleLocalY === 2 && tile.x === 2) || (bundleLocalY === 3 && tile.x === 3)
        ),
        [levelThreeLayout]
    );
    const levelTwoLayout = React.useMemo(
        () => boardLevels.find(({ level }) => level === 2)?.layout ?? null,
        [boardLevels]
    );
    const levelTwoBeeTileKeys = React.useMemo(
        () => getOverlayTileKeys(levelTwoLayout, 2, 2, (bundleLocalY, tile) =>
            bundleLocalY === 2 && tile.x === 4
        ),
        [levelTwoLayout]
    );
    const levelTwoElephantTileKeys = React.useMemo(
        () => getOverlayTileKeys(levelTwoLayout, 2, 4, (bundleLocalY, tile) =>
            (bundleLocalY === 1 && tile.x === 3) || (bundleLocalY === 2 && (tile.x === 2 || tile.x === 4))
        ),
        [levelTwoLayout]
    );
    const [creatureMotionByTileKey, setCreatureMotionByTileKey] = React.useState<Map<string, CreatureMotionAssignment>>(
        () => initialCreatureMotionByTileKey
    );
    const [boatMotion, setBoatMotion] = React.useState<BoatMotionAssignment | null>(
        () => getRandomBoatPreset(levelOneBoatTileKeys)
    );
    const [sailboatMotion, setSailboatMotion] = React.useState<BoatMotionAssignment | null>(
        () => getRandomBoatPreset(levelOneSailboatTileKeys)
    );
    const [camelMotion, setCamelMotion] = React.useState<BoatMotionAssignment | null>(
        () => getRandomBoatPreset(levelThreeCamelTileKeys)
    );
    const [beeMotion, setBeeMotion] = React.useState<BoatMotionAssignment | null>(
        () => getRandomBoatPreset(levelTwoBeeTileKeys)
    );
    const [elephantMotion, setElephantMotion] = React.useState<BoatMotionAssignment | null>(
        () => getRandomBoatPreset(levelTwoElephantTileKeys)
    );

    React.useEffect(() => {
        setCreatureMotionByTileKey(initialCreatureMotionByTileKey);
    }, [initialCreatureMotionByTileKey]);

    React.useEffect(() => {
        setBoatMotion(getRandomBoatPreset(levelOneBoatTileKeys));
    }, [levelOneBoatTileKeys]);
    React.useEffect(() => {
        setSailboatMotion(getRandomBoatPreset(levelOneSailboatTileKeys));
    }, [levelOneSailboatTileKeys]);
    React.useEffect(() => {
        setCamelMotion(getRandomBoatPreset(levelThreeCamelTileKeys));
    }, [levelThreeCamelTileKeys]);
    React.useEffect(() => {
        setBeeMotion(getRandomBoatPreset(levelTwoBeeTileKeys));
    }, [levelTwoBeeTileKeys]);
    React.useEffect(() => {
        setElephantMotion(getRandomBoatPreset(levelTwoElephantTileKeys));
    }, [levelTwoElephantTileKeys]);

    const handleCreatureAnimationIteration = React.useCallback((tileKey: string) => {
        setCreatureMotionByTileKey((previous) => {
            const next = new Map(previous);
            next.set(tileKey, getRandomCreaturePreset(previous.get(tileKey) ?? null));
            return next;
        });
    }, []);
    const handleBoatAnimationIteration = React.useCallback(() => {
        setBoatMotion((previous) => getRandomBoatPreset(levelOneBoatTileKeys, previous));
    }, [levelOneBoatTileKeys]);
    const handleSailboatAnimationIteration = React.useCallback(() => {
        setSailboatMotion((previous) => getRandomBoatPreset(levelOneSailboatTileKeys, previous));
    }, [levelOneSailboatTileKeys]);
    const handleCamelAnimationIteration = React.useCallback(() => {
        setCamelMotion((previous) => getRandomBoatPreset(levelThreeCamelTileKeys, previous));
    }, [levelThreeCamelTileKeys]);
    const handleBeeAnimationIteration = React.useCallback(() => {
        setBeeMotion((previous) => getRandomBoatPreset(levelTwoBeeTileKeys, previous));
    }, [levelTwoBeeTileKeys]);
    const handleElephantAnimationIteration = React.useCallback(() => {
        setElephantMotion((previous) => getRandomBoatPreset(levelTwoElephantTileKeys, previous));
    }, [levelTwoElephantTileKeys]);

    if (renderBoardLevels.length === 0) {
        return (
            <div className="play-board-empty">
                <div className="play-board-empty-card">
                    <span className="play-board-empty-icon">🧭</span>
                    <h3>{t('play.game.noGames')}</h3>
                </div>
            </div>
        );
    }

    return (
        <div className="play-adventure-board">
            {renderBoardLevels.map(({ level, games, layout, accessibleBundleIndexes, currentJelloGame, currentJelloSlot, currentFreeRoamTile }, index) => {
                const { boardRows, hasStartPad, tiles, padSlots, rowOffset } = layout;
                const nextLevel = renderBoardLevels[index + 1]?.level;

                return (
                    <React.Fragment key={level}>
                        <section className={`play-board-level level-${level}`} data-level={level}>
                            {level === 1 && (
                                <div className="play-board-water-decor" aria-hidden="true">
                                    {LEVEL_ONE_WATER_DECORATIONS.map((decor, decorIndex) => (
                                        <span
                                            key={`water-${decorIndex}`}
                                            className="play-board-water-icon"
                                            style={{
                                                top: decor.top,
                                                left: decor.left,
                                                fontSize: decor.size,
                                                opacity: decor.opacity,
                                                animationDuration: decor.duration,
                                                animationDelay: decor.delay,
                                            }}
                                        >
                                            <i className="fas fa-water" aria-hidden="true" />
                                        </span>
                                    ))}
                                    {LEVEL_ONE_SAILBOAT_DECORATIONS.map((decor, decorIndex) => (
                                        <span
                                            key={`sailboat-${decorIndex}`}
                                            className="play-board-sailboat-icon"
                                            style={{
                                                top: decor.top,
                                                left: decor.left,
                                                fontSize: decor.size,
                                                opacity: decor.opacity,
                                                animationDuration: decor.duration,
                                                animationDelay: decor.delay,
                                            }}
                                        >
                                            <i className="fas fa-sailboat" aria-hidden="true" />
                                        </span>
                                    ))}
                                </div>
                            )}
                            {level === 2 && (
                                <div className="play-board-water-decor play-board-forest-decor" aria-hidden="true">
                                    {LEVEL_TWO_LEAF_DECORATIONS.map((decor, decorIndex) => (
                                        <span
                                            key={`leaf-${decorIndex}`}
                                            className="play-board-leaf-icon"
                                            style={{
                                                top: decor.top,
                                                left: decor.left,
                                                fontSize: decor.size,
                                                opacity: decor.opacity,
                                                animationDuration: decor.duration,
                                                animationDelay: decor.delay,
                                            }}
                                        >
                                            <i className="fas fa-leaf" aria-hidden="true" />
                                        </span>
                                    ))}
                                    {LEVEL_TWO_ENVIRA_DECORATIONS.map((decor, decorIndex) => (
                                        <span
                                            key={`envira-${decorIndex}`}
                                            className="play-board-envira-icon"
                                            style={{
                                                top: decor.top,
                                                left: decor.left,
                                                fontSize: decor.size,
                                                opacity: decor.opacity,
                                                animationDuration: decor.duration,
                                                animationDelay: decor.delay,
                                            }}
                                        >
                                            <i className="fab fa-envira" aria-hidden="true" />
                                        </span>
                                    ))}
                                    {LEVEL_TWO_BIRD_DECORATIONS.map((decor, decorIndex) => (
                                        <span
                                            key={`level-two-bird-${decorIndex}`}
                                            className={`play-board-bird-icon ${decor.icon === 'twitter' ? 'twitter' : 'dove'}`}
                                            style={{
                                                top: decor.top,
                                                left: decor.left,
                                                fontSize: decor.size,
                                                opacity: decor.opacity,
                                                animationDuration: decor.duration,
                                                animationDelay: decor.delay,
                                            }}
                                        >
                                            <i
                                                className={decor.icon === 'twitter' ? 'fab fa-twitter' : 'fas fa-dove'}
                                                aria-hidden="true"
                                            />
                                        </span>
                                    ))}
                                </div>
                            )}
                            {level === 3 && (
                                <div className="play-board-water-decor play-board-wind-decor" aria-hidden="true">
                                    {LEVEL_THREE_WIND_DECORATIONS.map((decor, decorIndex) => (
                                        <span
                                            key={`wind-${decorIndex}`}
                                            className="play-board-wind-icon"
                                            style={{
                                                top: decor.top,
                                                left: decor.left,
                                                fontSize: decor.size,
                                                opacity: decor.opacity,
                                                animationDuration: decor.duration,
                                                animationDelay: decor.delay,
                                            }}
                                        >
                                            <i className="fas fa-wind" aria-hidden="true" />
                                        </span>
                                    ))}
                                </div>
                            )}
                            <div className="play-board-level-header">
                                <p className="play-board-level-eyebrow">{t('play.controls.level')} {level}</p>
                                <h3 className="play-board-level-title">{t(PLAY_LEVEL_WORLD_TITLE_KEYS[level] ?? 'play.controls.level', { level })}</h3>
                            </div>

                            <div
                                className="play-board-track"
                                style={{ ['--board-rows' as string]: boardRows }}
                            >
                                <div className="play-board-surface">
                                    <div className="play-board-tiles">
                                        {tiles.map((tile, index) => {
                                            const tileBundleIndex = getBundleIndex(tile.y, rowOffset);
                                            const isTileAccessible = accessibleBundleIndexes.has(tileBundleIndex);
                                            const forestClusterVariant = getForestClusterVariant(level, tile, tileBundleIndex, rowOffset);
                                            const tileKey = `${level}:${tile.x}:${tile.y}`;
                                            const creatureMotion = forestClusterVariant && CREATURE_VARIANTS.has(forestClusterVariant)
                                                ? creatureMotionByTileKey.get(tileKey) ?? null
                                                : null;
                                            const activeBoatMotion =
                                                boatMotion?.tileKey === tileKey
                                                    ? boatMotion
                                                    : null;
                                            const activeSailboatMotion =
                                                sailboatMotion?.tileKey === tileKey
                                                    ? sailboatMotion
                                                    : null;
                                            const activeCamelMotion =
                                                camelMotion?.tileKey === tileKey
                                                    ? camelMotion
                                                    : null;
                                            const activeBeeMotion =
                                                beeMotion?.tileKey === tileKey
                                                    ? beeMotion
                                                    : null;
                                            const activeElephantMotion =
                                                elephantMotion?.tileKey === tileKey
                                                    ? elephantMotion
                                                    : null;

                                            return (
                                            <button
                                                key={`tile-${level}-${index}`}
                                                type="button"
                                                className={`play-board-tile ${tile.kind} ${forestClusterVariant ? 'forest-cluster' : ''} ${isTileAccessible ? 'open' : 'blocked'}`}
                                                style={{
                                                    ['--tile-x' as string]: tile.x,
                                                    ['--tile-y' as string]: tile.y,
                                                }}
                                                onClick={() => {
                                                    if (!isTileAccessible) return;
                                                    if (
                                                        currentJelloSlot?.x !== tile.x
                                                        || currentJelloSlot?.y !== tile.y
                                                        || currentFreeRoamTile?.level !== level
                                                    ) {
                                                        playJelloMoveSound();
                                                    }
                                                    onSelectTile({ level, x: tile.x, y: tile.y });
                                                }}
                                                aria-disabled={!isTileAccessible}
                                                aria-label={t('play.modes.adventure')}
                                            >
                                                {renderForestCluster(
                                                    forestClusterVariant,
                                                    creatureMotion,
                                                    tileKey,
                                                    handleCreatureAnimationIteration
                                                )}
                                                {renderBoat(activeBoatMotion, '🚢', 'play-board-boat', handleBoatAnimationIteration)}
                                                {renderBoat(activeSailboatMotion, '⛵', 'play-board-sailboat', handleSailboatAnimationIteration)}
                                                {renderBoat(activeCamelMotion, '🐫', 'play-board-camel', handleCamelAnimationIteration)}
                                                {renderBoat(activeBeeMotion, '🐝', 'play-board-bee', handleBeeAnimationIteration)}
                                                {renderBoat(activeElephantMotion, '🐘', 'play-board-elephant', handleElephantAnimationIteration)}
                                            </button>
                                            );
                                        })}
                                    </div>

                                    <div className="play-board-pads">
                                        {hasStartPad && (
                                            <button
                                                type="button"
                                                className="play-mission-pad start-point"
                                                style={{
                                                    ['--tile-x' as string]: padSlots[0].x,
                                                    ['--tile-y' as string]: padSlots[0].y,
                                                }}
                                                onClick={() => {
                                                    if (
                                                        currentJelloSlot?.x !== padSlots[0].x
                                                        || currentJelloSlot?.y !== padSlots[0].y
                                                        || currentFreeRoamTile?.level !== level
                                                    ) {
                                                        playJelloMoveSound();
                                                    }
                                                    onSelectTile({ level, x: padSlots[0].x, y: padSlots[0].y });
                                                }}
                                                aria-label="Start point"
                                            >
                                                <span className="play-mission-pad-shadow" />
                                                <span className="play-mission-pad-face">
                                                    <span className="play-mission-pad-icon">
                                                        <i className="fas fa-flag" aria-hidden="true" />
                                                    </span>
                                                </span>
                                            </button>
                                        )}
                                        {games.map((boardGame, index) => {
                                            const { game, unlocked, isPremiumLocked } = boardGame;
                                            const slot = padSlots[index + (hasStartPad ? 1 : 0)];
                                            const isSelected = selectedGameId === game.id;
                                            const label = game.titleKey ? t(game.titleKey) : game.title;

                                            return (
                                                <button
                                                    key={game.id}
                                                    id={`play-mission-pad-${game.id}`}
                                                    type="button"
                                                    className={`play-mission-pad ${isSelected ? 'selected' : ''} ${currentJelloGameId === game.id ? 'recent' : ''} ${unlocked && !isPremiumLocked ? 'unlocked' : 'locked'} ${isPremiumLocked ? 'premium-locked' : ''}`}
                                                    style={{
                                                        ['--tile-x' as string]: slot.x,
                                                        ['--tile-y' as string]: slot.y,
                                                    }}
                                                    onClick={() => {
                                                        if (
                                                            unlocked
                                                            && !isPremiumLocked
                                                            && currentJelloGameId !== game.id
                                                        ) {
                                                            playJelloMoveSound();
                                                        }
                                                        onSelectGame(game.id);
                                                    }}
                                                    aria-label={label}
                                                >
                                                    <span className="play-mission-pad-shadow" />
                                                    <span className="play-mission-pad-face">
                                                        <span className="play-mission-pad-icon">
                                                            {renderThumbnail(game.thumbnail, game.category)}
                                                        </span>
                                                        {(!unlocked || isPremiumLocked) && (
                                                            <span className="play-mission-pad-lock">
                                                                <i className="fas fa-lock" aria-hidden="true" />
                                                            </span>
                                                        )}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {currentJelloSlot && jelloCharacter && (
                                        <div
                                            className="play-board-jello"
                                            style={{
                                                ['--tile-x' as string]: currentJelloSlot.x,
                                                ['--tile-y' as string]: currentJelloSlot.y,
                                            }}
                                            aria-hidden="true"
                                        >
                                            {!currentFreeRoamTile && currentJelloGame && (
                                                <div className="play-board-jello-bubble">
                                                    <span className="play-board-jello-bubble-icon">
                                                        {renderThumbnail(currentJelloGame.game.thumbnail, currentJelloGame.game.category)}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="play-board-jello-avatar">
                                                <JelloAvatar
                                                    character={jelloCharacter}
                                                    speciesId={jelloCharacter.speciesId}
                                                    action="idle"
                                                    size="small"
                                                    responsive={true}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                        {index < levelGroups.length - 1 && (
                            <div
                                className={`play-board-transition from-${level} to-${nextLevel}`}
                                data-to-level={nextLevel}
                                aria-hidden="true"
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};
