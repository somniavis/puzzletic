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

                                            return (
                                            <button
                                                key={`tile-${level}-${index}`}
                                                type="button"
                                                className={`play-board-tile ${tile.kind} ${isTileAccessible ? 'open' : 'blocked'}`}
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
                                            />
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
