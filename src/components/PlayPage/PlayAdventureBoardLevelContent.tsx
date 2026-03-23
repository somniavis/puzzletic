import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Character } from '../../types/character';
import { renderThumbnail } from '../../utils/playPageUtils';
import { JelloAvatar } from '../characters/JelloAvatar';
import { DIAMOND_STEP, getBundleIndex } from './playAdventureBoardLayout';
import { CREATURE_VARIANTS, getForestClusterVariant } from './playAdventureBoardDecorations';
import { renderBoat, renderForestCluster } from './playAdventureBoardRenderers';
import type {
    BoardLevelRenderModel,
    BoatMotionAssignment,
    CreatureMotionAssignment,
} from './playAdventureBoardTypes';

interface PlayAdventureBoardLevelContentProps {
    boardLevel: BoardLevelRenderModel;
    selectedGameId: string | null;
    currentJelloGameId?: string | null;
    jelloCharacter?: Character | null;
    creatureMotionByTileKey: Map<string, CreatureMotionAssignment>;
    boatMotion: BoatMotionAssignment | null;
    sailboatMotion: BoatMotionAssignment | null;
    camelMotion: BoatMotionAssignment | null;
    beeMotion: BoatMotionAssignment | null;
    elephantMotion: BoatMotionAssignment | null;
    onCreatureAnimationIteration: (tileKey: string) => void;
    onBoatAnimationIteration: () => void;
    onSailboatAnimationIteration: () => void;
    onCamelAnimationIteration: () => void;
    onBeeAnimationIteration: () => void;
    onElephantAnimationIteration: () => void;
    onPlayJelloMoveSound: () => void;
    onSelectGame: (gameId: string) => void;
    onSelectTile: (position: { level: number; x: number; y: number }) => void;
}

export const PlayAdventureBoardLevelContent: React.FC<PlayAdventureBoardLevelContentProps> = ({
    boardLevel,
    selectedGameId,
    currentJelloGameId,
    jelloCharacter,
    creatureMotionByTileKey,
    boatMotion,
    sailboatMotion,
    camelMotion,
    beeMotion,
    elephantMotion,
    onCreatureAnimationIteration,
    onBoatAnimationIteration,
    onSailboatAnimationIteration,
    onCamelAnimationIteration,
    onBeeAnimationIteration,
    onElephantAnimationIteration,
    onPlayJelloMoveSound,
    onSelectGame,
    onSelectTile,
}) => {
    const { t } = useTranslation();
    const { level, games, layout, accessibleBundleIndexes, currentJelloGame, currentJelloSlot, currentFreeRoamTile } = boardLevel;
    const { boardRows, hasStartPad, tiles, padSlots, rowOffset } = layout;

    return (
        <div
            className="play-board-track"
            style={{ ['--board-rows' as string]: boardRows }}
        >
            <div className="play-board-surface">
                <div className="play-board-tiles">
                    {tiles.map((tile, index) => {
                        const tileBundleIndex = getBundleIndex(tile.y, rowOffset);
                        const isTileAccessible = accessibleBundleIndexes.has(tileBundleIndex);
                        const forestClusterVariant = getForestClusterVariant(level, tile, tileBundleIndex, rowOffset, DIAMOND_STEP);
                        const tileKey = `${level}:${tile.x}:${tile.y}`;
                        const creatureMotion = forestClusterVariant && CREATURE_VARIANTS.has(forestClusterVariant)
                            ? creatureMotionByTileKey.get(tileKey) ?? null
                            : null;
                        const activeBoatMotion = boatMotion?.tileKey === tileKey ? boatMotion : null;
                        const activeSailboatMotion = sailboatMotion?.tileKey === tileKey ? sailboatMotion : null;
                        const activeCamelMotion = camelMotion?.tileKey === tileKey ? camelMotion : null;
                        const activeBeeMotion = beeMotion?.tileKey === tileKey ? beeMotion : null;
                        const activeElephantMotion = elephantMotion?.tileKey === tileKey ? elephantMotion : null;

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
                                        onPlayJelloMoveSound();
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
                                    onCreatureAnimationIteration
                                )}
                                {renderBoat(activeBoatMotion, '🚢', 'play-board-boat', onBoatAnimationIteration)}
                                {renderBoat(activeSailboatMotion, '⛵', 'play-board-sailboat', onSailboatAnimationIteration)}
                                {renderBoat(activeCamelMotion, '🐫', 'play-board-camel', onCamelAnimationIteration)}
                                {renderBoat(activeBeeMotion, '🐝', 'play-board-bee', onBeeAnimationIteration)}
                                {renderBoat(activeElephantMotion, '🐅', 'play-board-elephant', onElephantAnimationIteration)}
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
                                    onPlayJelloMoveSound();
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
                                        onPlayJelloMoveSound();
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
    );
};
