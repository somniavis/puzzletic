import React from 'react';
import { useTranslation } from 'react-i18next';
import type { GameManifest } from '../../games/types';
import { renderThumbnail } from '../../utils/playPageUtils';
import type { Character } from '../../types/character';
import { JelloAvatar } from '../characters/JelloAvatar';

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
    currentJelloGame: PlayAdventureBoardGame | null;
    currentJelloSlot: { x: number; y: number } | null;
    currentFreeRoamTile: { level: number; x: number; y: number } | null;
}

type ForestClusterVariant =
    | 'trees'
    | 'pines'
    | 'sunflowers'
    | 'tulips'
    | 'hyacinths'
    | 'mushrooms'
    | 'woodpile'
    | 'desert-sprouts'
    | 'cacti'
    | 'rocks'
    | 'scorpions'
    | 'beetles';

interface ScorpionMotionPreset {
    animationName: string;
    delay: string;
    duration: string;
    scaleX: string;
}

const DIAMOND_STEP = 4;
const START_PAD_ROW_OFFSET = 1;
const DEFAULT_LEVEL_ROW_OFFSET = 1;

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
];
const LEVEL_TWO_ENVIRA_DECORATIONS = [
    { top: '23%', left: '64%', size: '1.55rem', duration: '27s', delay: '-6s', opacity: 0.32 },
    { top: '48%', left: '84%', size: '1.75rem', duration: '30s', delay: '-12s', opacity: 0.28 },
    { top: '73%', left: '58%', size: '1.45rem', duration: '28s', delay: '-9s', opacity: 0.3 },
    { top: '36%', left: '46%', size: '1.6rem', duration: '25s', delay: '-4s', opacity: 0.3 },
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
const SCORPION_PRESETS: ScorpionMotionPreset[] = [
    { animationName: 'playBoardScorpionTop', delay: '0s', duration: '16s', scaleX: '-1' },
    { animationName: 'playBoardScorpionLeft', delay: '4s', duration: '16s', scaleX: '1' },
    { animationName: 'playBoardScorpionRight', delay: '8s', duration: '16s', scaleX: '-1' },
    { animationName: 'playBoardScorpionBottom', delay: '12s', duration: '16s', scaleX: '1' },
];

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

const getForestClusterVariant = (
    level: number,
    tile: BoardTile,
    tileBundleIndex: number,
    rowOffset: number
): ForestClusterVariant | null => {
    if (tile.kind !== 'forest') return null;
    const bundleLocalY = tile.y - rowOffset - (tileBundleIndex * DIAMOND_STEP);

    if (level === 2) {
        if (tileBundleIndex === 2) {
            if (tile.x === 2) return 'sunflowers';
            return tile.x === 4 ? 'hyacinths' : 'tulips';
        }

        if (tileBundleIndex === 3) {
            return tile.x === 0 ? 'woodpile' : 'mushrooms';
        }

        return LEVEL_TWO_SIMPLE_CLUSTER_BY_BUNDLE[tileBundleIndex] ?? null;
    }

    if (level === 3) {
        if (tileBundleIndex === 8) {
            if (bundleLocalY === 1) return 'cacti';
            if (bundleLocalY === 2) return tile.x === 2 ? 'cacti' : 'rocks';
            if (bundleLocalY === 3) return 'rocks';
        }

        return LEVEL_THREE_SIMPLE_CLUSTER_BY_BUNDLE[tileBundleIndex] ?? null;
    }

    return null;
};

const renderForestCluster = (
    variant: ForestClusterVariant | null,
    creatureMotion: ScorpionMotionPreset | null
) => {
    if (!variant) return null;

    switch (variant) {
    case 'trees':
        return renderEmojiCluster('🌳');
    case 'pines':
        return renderEmojiCluster('🌲');
    case 'sunflowers':
        return renderEmojiCluster('🌻', 'play-board-tree-cluster play-board-flower-cluster');
    case 'tulips':
        return renderEmojiCluster('🌷', 'play-board-tree-cluster play-board-flower-cluster');
    case 'hyacinths':
        return renderEmojiCluster('🪻', 'play-board-tree-cluster play-board-flower-cluster');
    case 'mushrooms':
        return renderEmojiCluster('🍄', 'play-board-tree-cluster play-board-object-cluster', 'play-board-object', 'object');
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
                style={{
                    animation: `${creatureMotion.animationName} ${creatureMotion.duration} ease-in-out ${creatureMotion.delay} infinite`,
                    ['--scorpion-scale-x' as string]: creatureMotion.scaleX,
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
                style={{
                    animation: `${creatureMotion.animationName} ${creatureMotion.duration} ease-in-out ${creatureMotion.delay} infinite`,
                    ['--scorpion-scale-x' as string]: creatureMotion.scaleX,
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
    const boardLevels = React.useMemo<BoardLevelViewModel[]>(
        () => levelGroups.map(({ level, games }) => {
            const layout = buildBoardLayout(level, games.length);
            const { padSlots, hasStartPad, rowOffset } = layout;
            const accessibleBundleIndexes = buildAccessibleBundleIndexes(games, padSlots, hasStartPad, rowOffset);
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
                level,
                games,
                layout,
                accessibleBundleIndexes,
                currentJelloGame,
                currentJelloSlot: currentFreeRoamTile ?? currentMissionSlot,
                currentFreeRoamTile,
            };
        }),
        [currentJelloGameId, currentJelloTilePosition, levelGroups]
    );
    const scorpionMotionByTileKey = React.useMemo(() => {
        const assignments = new Map<string, ScorpionMotionPreset>();

        boardLevels.forEach(({ level, layout }) => {
            if (level !== 3) return;

            [4, 6].forEach((bundleIndex) => {
                const shuffled = [...SCORPION_PRESETS].sort(() => Math.random() - 0.5);
                const creatureTiles = layout.tiles.filter((tile) =>
                    tile.kind === 'forest' && getBundleIndex(tile.y, layout.rowOffset) === bundleIndex
                );

                creatureTiles.forEach((tile, index) => {
                    assignments.set(`${level}:${tile.x}:${tile.y}`, shuffled[index % shuffled.length]);
                });
            });
        });

        return assignments;
    }, [boardLevels]);

    if (boardLevels.length === 0) {
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
            {boardLevels.map(({ level, games, layout, accessibleBundleIndexes, currentJelloGame, currentJelloSlot, currentFreeRoamTile }, index) => {
                const { boardRows, hasStartPad, tiles, padSlots, rowOffset } = layout;
                const nextLevel = boardLevels[index + 1]?.level;

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
                                <p className="play-board-level-eyebrow">{t('play.modes.adventure')}</p>
                                <h3 className="play-board-level-title">{t('play.controls.level')} {level}</h3>
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
                                            const creatureMotion =
                                                forestClusterVariant === 'scorpions' || forestClusterVariant === 'beetles'
                                                    ? scorpionMotionByTileKey.get(`${level}:${tile.x}:${tile.y}`) ?? null
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
                                                    onSelectTile({ level, x: tile.x, y: tile.y });
                                                }}
                                                aria-disabled={!isTileAccessible}
                                                aria-label={t('play.modes.adventure')}
                                            >
                                                {renderForestCluster(forestClusterVariant, creatureMotion)}
                                            </button>
                                            );
                                        })}
                                    </div>

                                    <div className="play-board-pads">
                                        {hasStartPad && (
                                            <div
                                                className="play-mission-pad start-point"
                                                style={{
                                                    ['--tile-x' as string]: padSlots[0].x,
                                                    ['--tile-y' as string]: padSlots[0].y,
                                                }}
                                                aria-hidden="true"
                                            >
                                                <span className="play-mission-pad-shadow" />
                                                <span className="play-mission-pad-face">
                                                    <span className="play-mission-pad-icon">
                                                        <i className="fas fa-flag" aria-hidden="true" />
                                                    </span>
                                                </span>
                                            </div>
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
                                                    onClick={() => onSelectGame(game.id)}
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
