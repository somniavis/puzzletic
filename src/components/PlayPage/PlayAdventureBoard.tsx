import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Character } from '../../types/character';
import { playJelloClickSound } from '../../utils/sound';
import {
    buildAccessibleBundleIndexes,
    buildBoardLayout,
} from './playAdventureBoardLayout';
import { PlayAdventureBoardLevelSection } from './PlayAdventureBoardLevelSection';
import { usePlayAdventureBoardMotion } from './usePlayAdventureBoardMotion';
import type {
    BoardLevelRenderModel,
    BoardLevelViewModel,
    PlayAdventureBoardGame,
} from './playAdventureBoardTypes';
export type { PlayAdventureBoardGame } from './playAdventureBoardTypes';

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
    const {
        creatureMotionByTileKey,
        boatMotion,
        sailboatMotion,
        camelMotion,
        beeMotion,
        elephantMotion,
        handleCreatureAnimationIteration,
        handleBoatAnimationIteration,
        handleSailboatAnimationIteration,
        handleCamelAnimationIteration,
        handleBeeAnimationIteration,
        handleElephantAnimationIteration,
    } = usePlayAdventureBoardMotion(boardLevels);

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
            {renderBoardLevels.map((boardLevel, index) => (
                <PlayAdventureBoardLevelSection
                    key={boardLevel.level}
                    boardLevel={boardLevel}
                    nextLevel={renderBoardLevels[index + 1]?.level}
                    selectedGameId={selectedGameId}
                    currentJelloGameId={currentJelloGameId}
                    jelloCharacter={jelloCharacter}
                    creatureMotionByTileKey={creatureMotionByTileKey}
                    boatMotion={boatMotion}
                    sailboatMotion={sailboatMotion}
                    camelMotion={camelMotion}
                    beeMotion={beeMotion}
                    elephantMotion={elephantMotion}
                    onCreatureAnimationIteration={handleCreatureAnimationIteration}
                    onBoatAnimationIteration={handleBoatAnimationIteration}
                    onSailboatAnimationIteration={handleSailboatAnimationIteration}
                    onCamelAnimationIteration={handleCamelAnimationIteration}
                    onBeeAnimationIteration={handleBeeAnimationIteration}
                    onElephantAnimationIteration={handleElephantAnimationIteration}
                    onPlayJelloMoveSound={playJelloMoveSound}
                    onSelectGame={onSelectGame}
                    onSelectTile={onSelectTile}
                />
            ))}
        </div>
    );
};
