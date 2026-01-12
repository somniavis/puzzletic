import { useNavigate } from 'react-router-dom';
import { useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout2 } from '../../../layouts/Standard/Layout2';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';
import type { PowerUpBtnProps } from '../../../../components/Game/PowerUpBtn';
import manifest_en from './locales/en';
import { BlobBackground } from '../../../math/components/BlobBackground';
import { useMazeEscapeLogic } from './GameLogic';
import styles from './MazeEscape.module.css';
import { useNurturing } from '../../../../contexts/NurturingContext';
import { JelloAvatar } from '../../../../components/characters/JelloAvatar';

const GAME_ID = 'brain-level1-maze-escape';

export default function MazeEscape() {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const nurturing = useNurturing();

    useEffect(() => {
        const newResources = { en: { translation: { games: { 'maze-escape': manifest_en } } } };
        Object.keys(newResources).forEach(lang => {
            i18n.addResourceBundle(lang, 'translation', newResources[lang as keyof typeof newResources].translation, true, true);
        });
    }, [i18n]);

    const engine = useGameEngine({
        initialTime: 90,
        initialLives: 3
    });

    const logic = useMazeEscapeLogic(engine);

    // Standard PowerUps
    const powerUps: PowerUpBtnProps[] = useMemo(() => [
        {
            count: logic.powerUps.timeFreeze,
            icon: '❄️',
            color: 'blue' as const,
            onClick: () => logic.activatePowerUp('timeFreeze'),
            status: logic.isTimeFrozen ? 'active' : 'normal',
            title: 'Time Freeze',
            disabledConfig: logic.isTimeFrozen || logic.powerUps.timeFreeze <= 0
        },
        {
            count: logic.powerUps.extraLife,
            icon: '❤️',
            color: 'red' as const,
            onClick: () => logic.activatePowerUp('extraLife'),
            status: engine.lives >= 3 ? 'maxed' : 'normal',
            title: 'Extra Life',
            disabledConfig: engine.lives >= 3 || logic.powerUps.extraLife <= 0
        },
        {
            count: logic.powerUps.doubleScore,
            icon: '⚡',
            color: 'yellow' as const,
            onClick: () => logic.activatePowerUp('doubleScore'),
            status: logic.isDoubleScore ? 'active' : 'normal',
            title: 'Double Score',
            disabledConfig: logic.isDoubleScore || logic.powerUps.doubleScore <= 0
        }
    ], [logic.powerUps, logic.isTimeFrozen, logic.isDoubleScore, logic.activatePowerUp, engine.lives]);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        const element = document.elementFromPoint(e.clientX, e.clientY);
        if (!element) return;
        const cellElement = element.closest('[data-cell]');
        if (!cellElement) return;
        const row = parseInt(cellElement.getAttribute('data-row') || '-1');
        const col = parseInt(cellElement.getAttribute('data-col') || '-1');
        if (row >= 0 && col >= 0) {
            logic.handleMove(row, col);
        }
    }, [logic.handleMove]);

    // Obstacle Emoji Map
    const getObstacleEmoji = (type?: string) => {
        switch (type) {
            case 'rock': return '🪨';
            case 'log': return '🪵';
            case 'cactus': return '🌵';
            default: return '';
        }
    };

    return (
        <Layout2
            title={t('games.maze-escape.title')}
            subtitle={t('games.maze-escape.subtitle')}
            gameId={GAME_ID}
            engine={engine}
            powerUps={powerUps}
            onExit={() => navigate(-1)}
            cardBackground={<BlobBackground colors={{ blob1: '#e0f2fe', blob2: '#f0f9ff', blob3: '#bae6fd', blob4: '#7dd3fc' }} />}
            instructions={[
                { icon: '🏠', title: t('games.maze-escape.howToPlay.step1.title'), description: t('games.maze-escape.howToPlay.step1.desc') },
                { icon: '👆', title: t('games.maze-escape.howToPlay.step2.title'), description: t('games.maze-escape.howToPlay.step2.desc') },
                { icon: '🪨', title: t('games.maze-escape.howToPlay.step3.title'), description: t('games.maze-escape.howToPlay.step3.desc') }
            ]}
        >
            <div
                className={styles.gameContainer}
                onPointerUp={logic.handleEnd}
                onPointerLeave={logic.handleEnd}
            >
                <div
                    className={styles.grid}
                    style={{
                        gridTemplateColumns: `repeat(${logic.currentLevel.size}, minmax(0, 1fr))`,
                        gridTemplateRows: `repeat(${logic.currentLevel.size}, minmax(0, 1fr))`
                    }}
                    onPointerMove={handlePointerMove}
                >
                    {logic.grid.flat().map((cell) => {
                        return (
                            <div
                                key={`${cell.row}-${cell.col}`}
                                className={`${styles.cell} ${cell.isPath ? styles.path : ''}`}
                                data-cell="true"
                                data-row={cell.row}
                                data-col={cell.col}
                                onPointerDown={(e) => {
                                    e.preventDefault(); // Prevent default touch behaviors
                                    e.currentTarget.releasePointerCapture(e.pointerId);
                                    logic.handleStart(cell.row, cell.col);
                                }}
                            >
                                {/* Path Connections */}
                                {cell.n && <div className={`${styles.pipeSegment} ${styles.pipeN}`} />}
                                {cell.s && <div className={`${styles.pipeSegment} ${styles.pipeS}`} />}
                                {cell.e && <div className={`${styles.pipeSegment} ${styles.pipeE}`} />}
                                {cell.w && <div className={`${styles.pipeSegment} ${styles.pipeW}`} />}
                                {cell.isPath && <div className={`${styles.pipeSegment} ${styles.pipeCenter}`} />}

                                {/* Start Node - User's Jello */}
                                {cell.isStart && (
                                    <div className={styles.startNode} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {/* User requested ~85% of grid size even at large grids */}
                                        <div style={{
                                            width: '85%',
                                            height: '85%',
                                            maxWidth: '100%',
                                            maxHeight: '100%',
                                            aspectRatio: '1/1',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <JelloAvatar
                                                character={{
                                                    speciesId: nurturing.speciesId || 'yellowJello',
                                                    evolutionStage: (nurturing.evolutionStage || 1) as any,
                                                    name: nurturing.characterName || 'Jello',
                                                    stats: nurturing.stats
                                                } as any}
                                                size="small"
                                                action="idle"
                                                disableAnimation
                                                responsive
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* End Node */}
                                {cell.isEnd && (
                                    <div
                                        className={styles.endNode}
                                        style={{
                                            // Dynamic Scaling: 3.5rem (size 4) -> 2.5rem (size 9)
                                            // Formula: 3.5 - (size - 4) * 0.2
                                            fontSize: `${Math.max(2.5, 3.5 - (logic.currentLevel.size - 4) * 0.2)}rem`
                                        }}
                                    >
                                        ⛺
                                    </div>
                                )}

                                {/* Obstacles */}
                                <div className={styles.obstacle}>
                                    {[0, 1, 2].map(i => {
                                        // Base size logic from CSS:
                                        // Parts 0, 1: 1.6rem
                                        // Part 2: 2.5rem (and centered)
                                        const isLarge = i === 2;
                                        const baseSize = isLarge ? 2.5 : 1.6;

                                        // User wants 6x6 to be the "perfect" baseline.
                                        // If grid is smaller (e.g. 4), cells are bigger -> scale UP.
                                        // If grid is larger (e.g. 9), cells are smaller -> scale DOWN.
                                        // Formula: Current Scale = Base * (6 / CurrentSize)
                                        const scaleFactor = 6 / Math.max(4, logic.currentLevel.size);
                                        const fontSize = `${baseSize * scaleFactor}rem`;

                                        return (
                                            <span
                                                key={i}
                                                className={styles.obstaclePart}
                                                style={{ fontSize }} // Override CSS font-size
                                            >
                                                {getObstacleEmoji(cell.obstacleType)}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Layout2>
    );
}

export const manifest = {
    id: GAME_ID,
    title: 'Maze Escape',
    titleKey: 'games.maze-escape.title',
    subtitle: 'Find the way!',
    subtitleKey: 'games.maze-escape.subtitle',
    category: 'brain',
    level: 1,
    component: MazeEscape,
    description: 'Help Jello find the way home avoiding obstacles.',
    descriptionKey: 'games.maze-escape.description',
    thumbnail: '🏞️'
} as const;
