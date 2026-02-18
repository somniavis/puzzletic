import { useNavigate } from 'react-router-dom';
import React, { useMemo, useEffect, useCallback, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout2 } from '../../../layouts/Standard/Layout2';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';
import type { PowerUpBtnProps } from '../../../../components/Game/PowerUpBtn';
import manifest_en from './locales/en';
import { BlobBackground } from '../../../math/components/BlobBackground';
import { useMazeHunterLogic } from './GameLogic';
import styles from './MazeEscape.module.css';
import { useNurturing } from '../../../../contexts/NurturingContext';
import { JelloAvatar } from '../../../../components/characters/JelloAvatar';

import { GameIds } from '../../../../constants/gameIds';
const GAME_ID = GameIds.MAZE_HUNTER;

// Memoized Cell Component to prevent grid re-renders on drag
const MazeCell = React.memo(({
    cell,
    levelSize,
    nurturing,
    getObstacleEmoji,
    onStart,
    targetAnimal,
    isTargetEmojiScaled
}: {
    cell: any,
    levelSize: number,
    nurturing: any,
    getObstacleEmoji: (t?: string) => string,
    onStart: (r: number, c: number) => void,
    targetAnimal: string,
    isTargetEmojiScaled: boolean
}) => {
    const edgeInsetPct = 8;
    const edgeInsetStyle: React.CSSProperties = {
        top: cell.row === 0 ? `${edgeInsetPct}%` : '0%',
        right: cell.col === levelSize - 1 ? `${edgeInsetPct}%` : '0%',
        bottom: cell.row === levelSize - 1 ? `${edgeInsetPct}%` : '0%',
        left: cell.col === 0 ? `${edgeInsetPct}%` : '0%',
    };

    const obstacleInsetStyle: React.CSSProperties = {
        paddingTop: cell.row === 0 ? `${edgeInsetPct}%` : undefined,
        paddingRight: cell.col === levelSize - 1 ? `${edgeInsetPct}%` : undefined,
        paddingBottom: cell.row === levelSize - 1 ? `${edgeInsetPct}%` : undefined,
        paddingLeft: cell.col === 0 ? `${edgeInsetPct}%` : undefined,
    };

    return (
        <div
            className={`${styles.cell} ${cell.isPath ? styles.path : ''}`}
            data-cell="true"
            data-row={cell.row}
            data-col={cell.col}
            onPointerDown={(e) => {
                e.preventDefault();
                e.currentTarget.releasePointerCapture(e.pointerId);
                onStart(cell.row, cell.col);
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
                <div className={styles.startNode} style={{ ...edgeInsetStyle, width: 'auto', height: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                        ...edgeInsetStyle,
                        width: 'auto',
                        height: 'auto',
                        // Dynamic Scaling
                        fontSize: `${Math.max(2.5, 3.5 - (levelSize - 4) * 0.2) * (isTargetEmojiScaled ? 0.9 : 1)}rem`
                    }}
                >
                    {/* Show Open Tent ONLY if path reached it AND (we can't check items here easily without passing prop... so maybe just always show Tent, and logic handles success?) */
                        /* Actually, let's show Locked icon if not enough items? But MazeCell doesn't know total items. */
                        /* Let's keep it simple: Show Tent. Maybe add a small lock overlay? */
                    }
                    {targetAnimal}
                </div>
            )}

            {/* Items (Keys) */}
            {cell.isItem && (
                <div style={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: `calc((min(90vmin, 500px) / ${levelSize}) * 0.6)`,
                    zIndex: 5,
                    opacity: cell.isPath ? 0.3 : 1, // Dim if collected
                    transition: 'opacity 0.2s'
                }}>
                    {cell.itemType}
                </div>
            )}

            {/* Obstacles */}
            {cell.isObstacle && (
                <div className={styles.obstacle} style={obstacleInsetStyle}>
                    {[0, 1, 2].map(i => {
                        const isLarge = i === 2;

                        // User Request: Maintain scaling relative to grid size.
                        // Fixed "rem" units fail on small mobile screens because the grid shrinks (vmin) but rem stays constant.
                        // Solution: Calculate font-size relative to the Grid Container's definition.
                        // Grid Width = min(90vmin, 500px).
                        // Cell Width ~= Grid Width / levelSize.
                        // We want Large to be ~64% of Cell, Small to be ~41% of Cell (Reduced by ~8%)

                        const proportion = isLarge ? 0.558 : 0.36;
                        const fontSize = `calc((min(90vmin, 500px) / ${levelSize}) * ${proportion})`;

                        return (
                            <span
                                key={i}
                                className={styles.obstaclePart}
                                style={{ fontSize }}
                            >
                                {getObstacleEmoji(cell.obstacleType)}
                            </span>
                        );
                    })}
                </div>
            )}
        </div>
    );
}, (prev, next) => {
    // Custom comparison for performance
    return (
        prev.cell === next.cell && // Same cell object reference (if immutable)
        prev.cell.isPath === next.cell.isPath && // Check critical changing props
        prev.cell.n === next.cell.n &&
        prev.cell.s === next.cell.s &&
        prev.cell.e === next.cell.e &&
        prev.cell.w === next.cell.w &&
        prev.cell.w === next.cell.w &&
        prev.levelSize === next.levelSize &&
        prev.targetAnimal === next.targetAnimal &&
        prev.isTargetEmojiScaled === next.isTargetEmojiScaled
    );
});

export default function MazeHunter() {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const nurturing = useNurturing();

    useEffect(() => {
        const newResources = { en: { translation: { games: { 'maze-hunter': manifest_en } } } };
        Object.keys(newResources).forEach(lang => {
            i18n.addResourceBundle(lang, 'translation', newResources[lang as keyof typeof newResources].translation, true, true);
        });
    }, [i18n]);

    const engine = useGameEngine({
        initialTime: 90,
        initialLives: 3
    });

    const logic = useMazeHunterLogic(engine);
    const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
    const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isTargetEmojiScaled = isAndroid || isIOS;
    const [showGuideHint, setShowGuideHint] = useState(false);
    const [isGuideHintExiting, setIsGuideHintExiting] = useState(false);
    const hasShownGuideHintRef = useRef(false);
    const guideHintTimerRef = useRef<number | null>(null);
    const guideHintExitTimerRef = useRef<number | null>(null);

    useEffect(() => {
        const isFirstQuestion = engine.score === 0 && engine.stats.correct === 0 && engine.stats.wrong === 0;
        if (engine.gameState !== 'playing') {
            if (engine.gameState === 'gameover' || engine.gameState === 'idle') {
                setShowGuideHint(false);
                setIsGuideHintExiting(false);
                hasShownGuideHintRef.current = false;
            }
            return;
        }
        if (!isFirstQuestion || hasShownGuideHintRef.current) return;

        hasShownGuideHintRef.current = true;
        setShowGuideHint(true);
        setIsGuideHintExiting(false);

        guideHintTimerRef.current = window.setTimeout(() => {
            setIsGuideHintExiting(true);
            guideHintExitTimerRef.current = window.setTimeout(() => {
                setShowGuideHint(false);
                setIsGuideHintExiting(false);
                guideHintExitTimerRef.current = null;
            }, 220);
            guideHintTimerRef.current = null;
        }, 1800);
    }, [engine.gameState, engine.score, engine.stats.correct, engine.stats.wrong]);

    useEffect(() => {
        return () => {
            if (guideHintTimerRef.current != null) {
                window.clearTimeout(guideHintTimerRef.current);
                guideHintTimerRef.current = null;
            }
            if (guideHintExitTimerRef.current != null) {
                window.clearTimeout(guideHintExitTimerRef.current);
                guideHintExitTimerRef.current = null;
            }
        };
    }, []);

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
    const getObstacleEmoji = useCallback((type?: string) => {
        switch (type) {
            case 'rock': return '🪨';
            case 'log': return '🪵';
            case 'tree': return '🌲';
            default: return '';
        }
    }, []);

    return (
        <Layout2
            title={t('games.maze-hunter.title')}
            subtitle={t('games.maze-hunter.subtitle')}
            gameId={GAME_ID}
            engine={engine}
            powerUps={powerUps}
            onExit={() => navigate(-1)}
            cardBackground={<BlobBackground colors={{ blob1: '#dcfce7', blob2: '#f0fdf4', blob3: '#bbf7d0', blob4: '#86efac' }} />}
            instructions={[
                { icon: '🐾', title: t('games.maze-hunter.howToPlay.step1.title'), description: t('games.maze-hunter.howToPlay.step1.description') },
                { icon: '✅', title: t('games.maze-hunter.howToPlay.step2.title'), description: t('games.maze-hunter.howToPlay.step2.description') },
                { icon: '🐅', title: t('games.maze-hunter.howToPlay.step3.title'), description: t('games.maze-hunter.howToPlay.step3.description') }
            ]}
        >
            <div
                className={styles.gameContainer}
                onPointerUp={logic.handleEnd}
                onPointerLeave={logic.handleEnd}
            >
                {showGuideHint && (
                    <div className={`${styles.mazeGuideHint} ${isGuideHintExiting ? styles.exiting : ''}`}>
                        {t('games.maze-hunter.ui.guideHint')}
                    </div>
                )}
                <div
                    className={styles.grid}
                    style={{
                        gridTemplateColumns: `repeat(${logic.currentLevel.size}, minmax(0, 1fr))`,
                        gridTemplateRows: `repeat(${logic.currentLevel.size}, minmax(0, 1fr))`
                    }}
                    onPointerMove={handlePointerMove}
                >
                    {logic.grid.flat().map((cell) => (
                        <MazeCell
                            key={`${cell.row}-${cell.col}`}
                            cell={cell}
                            levelSize={logic.currentLevel.size}
                            nurturing={nurturing}
                            getObstacleEmoji={getObstacleEmoji}
                            onStart={logic.handleStart}
                            targetAnimal={logic.currentLevel.targetAnimal}
                            isTargetEmojiScaled={isTargetEmojiScaled}
                        />
                    ))}
                </div>
            </div>
        </Layout2 >
    );
}

export const manifest = {
    id: GAME_ID,
    title: 'Maze Hunter',
    titleKey: 'games.maze-hunter.title',
    subtitle: 'Track the animal to hunt!',
    subtitleKey: 'games.maze-hunter.subtitle',
    category: 'brain',
    level: 2,
    component: MazeHunter,
    description: 'Follow the tracks to find the animal at the end.',
    descriptionKey: 'games.maze-hunter.description',
    thumbnail: '🐾'
} as const;
