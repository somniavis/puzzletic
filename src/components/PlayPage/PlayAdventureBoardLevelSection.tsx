import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Character } from '../../types/character';
import { PLAY_LEVEL_WORLD_TITLE_KEYS } from './playAdventureBoardDecorations';
import { PlayAdventureBoardLevelContent } from './PlayAdventureBoardLevelContent';
import { PlayAdventureBoardLevelDecor } from './PlayAdventureBoardLevelDecor';
import type {
    BoardLevelRenderModel,
    BoatMotionAssignment,
    CreatureMotionAssignment,
} from './playAdventureBoardTypes';

interface PlayAdventureBoardLevelSectionProps {
    boardLevel: BoardLevelRenderModel;
    nextLevel?: number;
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

export const PlayAdventureBoardLevelSection: React.FC<PlayAdventureBoardLevelSectionProps> = ({
    boardLevel,
    nextLevel,
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
    const { level } = boardLevel;

    return (
        <>
            <section className={`play-board-level level-${level}`} data-level={level}>
                <PlayAdventureBoardLevelDecor level={level} />
                <div className="play-board-level-header">
                    <p className="play-board-level-eyebrow">{t('play.controls.level')} {level}</p>
                    <h3 className="play-board-level-title">{t(PLAY_LEVEL_WORLD_TITLE_KEYS[level] ?? 'play.controls.level', { level })}</h3>
                </div>
                <PlayAdventureBoardLevelContent
                    boardLevel={boardLevel}
                    selectedGameId={selectedGameId}
                    currentJelloGameId={currentJelloGameId}
                    jelloCharacter={jelloCharacter}
                    creatureMotionByTileKey={creatureMotionByTileKey}
                    boatMotion={boatMotion}
                    sailboatMotion={sailboatMotion}
                    camelMotion={camelMotion}
                    beeMotion={beeMotion}
                    elephantMotion={elephantMotion}
                    onCreatureAnimationIteration={onCreatureAnimationIteration}
                    onBoatAnimationIteration={onBoatAnimationIteration}
                    onSailboatAnimationIteration={onSailboatAnimationIteration}
                    onCamelAnimationIteration={onCamelAnimationIteration}
                    onBeeAnimationIteration={onBeeAnimationIteration}
                    onElephantAnimationIteration={onElephantAnimationIteration}
                    onPlayJelloMoveSound={onPlayJelloMoveSound}
                    onSelectGame={onSelectGame}
                    onSelectTile={onSelectTile}
                />
            </section>
            {typeof nextLevel === 'number' && (
                <div
                    className={`play-board-transition from-${level} to-${nextLevel}`}
                    data-to-level={nextLevel}
                    aria-hidden="true"
                />
            )}
        </>
    );
};
