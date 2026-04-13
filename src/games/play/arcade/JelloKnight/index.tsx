import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNurturing } from '../../../../contexts/NurturingContext';
import { createCharacter } from '../../../../data/characters';
import { CHARACTER_SPECIES_CORE } from '../../../../data/speciesCore';
import type { EvolutionStage } from '../../../../types/character';
import type { GameComponentProps } from '../../../types';
import { PlayArcadeHeader } from '../../shared/PlayArcadeUI';
import { calculatePlayArcadeReward } from '../../shared/playArcadeRewards';
import { usePreventArcadeBrowserGestures } from '../../shared/usePreventArcadeBrowserGestures';
import {
    JelloKnightField,
    JelloKnightGameOverOverlay,
    JelloKnightLevelUpOverlay,
    JelloKnightStartOverlay,
} from './components';
import { createJelloKnightTranslator } from './i18n';
import { useJelloKnightGame } from './useJelloKnightGame';
import './JelloKnight.css';

export const JelloKnight: React.FC<GameComponentProps> = ({ onExit }) => {
    const { i18n } = useTranslation();
    const { speciesId, evolutionStage, characterName, addRewards } = useNurturing();
    const safeSpeciesId = useMemo(
        () => (speciesId && CHARACTER_SPECIES_CORE[speciesId] ? speciesId : 'yellowJello'),
        [speciesId]
    );
    const safeEvolutionStage = Math.min(5, Math.max(1, evolutionStage || 1)) as EvolutionStage;
    const gt = useMemo(
        () => createJelloKnightTranslator(i18n.resolvedLanguage || i18n.language),
        [i18n.language, i18n.resolvedLanguage]
    );
    const runnerCharacter = useMemo(() => {
        const character = createCharacter(safeSpeciesId, characterName || gt('title'));
        character.evolutionStage = safeEvolutionStage;
        if (characterName) {
            character.name = characterName;
        }
        return character;
    }, [characterName, gt, safeEvolutionStage, safeSpeciesId]);

    const [lastRunWasBestFlag, setLastRunWasBestFlag] = React.useState(false);
    const rewards = useMemo(
        () => calculatePlayArcadeReward(safeEvolutionStage, lastRunWasBestFlag),
        [lastRunWasBestFlag, safeEvolutionStage]
    );

    const game = useJelloKnightGame({
        addRewards,
        gt,
        rewards,
        onReward: (wasBest) => {
            setLastRunWasBestFlag(wasBest);
        },
    });

    usePreventArcadeBrowserGestures({
        rootRef: game.rootRef,
        stageRef: game.stageRef,
        controlsRef: game.controlsRef,
        stageIgnoreSelectors: [
            '.play-arcade-game__start-overlay',
            '.play-arcade-game__game-over-overlay',
            '.jello-knight__controls',
            'button',
        ],
    });

    const orbPalette = game.orbitPaletteForSpecies(safeSpeciesId);

    return (
        <div className="jello-knight" ref={game.rootRef}>
            <PlayArcadeHeader
                stats={game.headerStats}
                statsAriaLabel={gt('headerStatsLabel')}
                closeLabel={gt('closeButton')}
                onExit={onExit}
            />

            <JelloKnightField
                activeObstacles={game.activeObstacles}
                announcement={game.announcement}
                bombBlasts={game.bombBlasts}
                bombRadius={game.bombRadius}
                bombStrikes={game.bombStrikes}
                controlsRef={game.controlsRef}
                damageFlashOpacity={game.damageFlashOpacity}
                elapsedMs={game.hudState.elapsedMs}
                gt={gt}
                joystickBaseRef={game.joystickBaseRef}
                eliteEnemy={game.eliteEnemy}
                enemies={game.enemies}
                fieldStyle={game.fieldStyle}
                gamePhase={game.gamePhase}
                handleJoystickPointerCancel={game.handleJoystickPointerCancel}
                handleJoystickPointerDown={game.handleJoystickPointerDown}
                handleJoystickPointerMove={game.handleJoystickPointerMove}
                handleJoystickPointerUp={game.handleJoystickPointerUp}
                joystickKnobStyle={game.joystickKnobStyle}
                orbitPositions={game.orbitPositions}
                orbitPalette={orbPalette}
                playerStyle={game.playerStyle}
                runnerMotionStyle={game.runnerMotionStyle}
                projectiles={game.projectiles}
                rangedEnemies={game.rangedEnemies}
                runnerCharacter={runnerCharacter}
                safeSpeciesId={safeSpeciesId}
                spawnSignals={game.spawnSignals}
                stageMoodStyle={game.stageMoodStyle}
                stageRef={game.stageRef}
                webZones={game.webZones}
                xpPickups={game.xpPickups}
            />

            {game.gamePhase === 'start' && <JelloKnightStartOverlay gt={gt} onStart={game.startRun} />}
            {game.gamePhase === 'levelUp' && (
                <JelloKnightLevelUpOverlay
                    gt={gt}
                    options={game.upgradeOptions}
                    onSelect={game.handleUpgradeSelect}
                />
            )}
            {game.gamePhase === 'gameOver' && (
                <JelloKnightGameOverOverlay
                    bestScore={game.bestScore}
                    bestTimeMs={game.bestTimeMs}
                    wave={game.hudState.wave}
                    elapsedMs={game.hudState.elapsedMs}
                    gt={gt}
                    lastRunWasBest={game.lastRunWasBest}
                    onRetry={game.startRun}
                    rewards={rewards}
                    score={game.hudState.score}
                />
            )}
        </div>
    );
};

export default JelloKnight;
