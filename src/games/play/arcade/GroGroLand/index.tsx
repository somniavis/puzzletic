import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { JelloAvatar } from '../../../../components/characters/JelloAvatar';
import { createCharacter } from '../../../../data/characters';
import { CHARACTER_SPECIES_CORE } from '../../../../data/speciesCore';
import { useNurturing } from '../../../../contexts/NurturingContext';
import type { EvolutionStage } from '../../../../types/character';
import { playClearSound, playEatingSound } from '../../../../utils/sound';
import {
    PlayArcadeGameOverOverlay,
    PlayArcadeHeader,
    PlayArcadeStartOverlay,
} from '../../shared/PlayArcadeUI';
import { calculatePlayArcadeReward } from '../../shared/playArcadeRewards';
import { usePreventArcadeBrowserGestures } from '../../shared/usePreventArcadeBrowserGestures';
import type { GameComponentProps } from '../../../types';
import {
    GROGRO_LAND_STATUS_BADGE_FADE_FRAMES,
} from './constants';
import {
    GROGRO_LAND_TIMINGS,
    buildGroGroLandHudState,
    createInitialGroGroLandState,
    hasBoostWarning,
    seedGroGroLandItems,
    tickGroGroLandCaptureEffects,
    tickGroGroLandItems,
    refreshGroGroLandMetrics,
} from './helpers';
import { createGroGroLandTranslator } from './i18n';
import { drawGroGroLandScene } from './rendering';
import type { GroGroLandHudState } from './types';
import {
    resolveGroGroLandTrailCollisions,
    updateGroGroLandEnemies,
    updateGroGroLandPlayer,
} from './engine';
import './GroGroLand.css';

export const GroGroLand: React.FC<GameComponentProps> = ({ onExit }) => {
    const { i18n } = useTranslation();
    const { speciesId, evolutionStage, characterName, addRewards } = useNurturing();
    const rootRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const stageRef = useRef<HTMLDivElement | null>(null);
    const touchControlsRef = useRef<HTMLDivElement | null>(null);
    const playerOverlayRef = useRef<HTMLDivElement | null>(null);
    const enemyOverlayRefs = useRef<Array<HTMLDivElement | null>>([]);
    const stateRef = useRef(createInitialGroGroLandState());
    const inputRef = useRef({ left: false, right: false });
    const steerPointerIdRef = useRef<number | null>(null);
    const frameRef = useRef<number | null>(null);
    const lastFrameTimeRef = useRef<number | null>(null);
    const heartBurstIdRef = useRef(0);
    const rewardGrantedRef = useRef(false);
    const [gamePhase, setGamePhase] = useState<'start' | 'playing' | 'gameOver'>('start');
    const [hudState, setHudState] = useState<GroGroLandHudState>(() => buildGroGroLandHudState(stateRef.current));
    const [heartBursts, setHeartBursts] = useState<number[]>([]);
    const [gameOverWasBest, setGameOverWasBest] = useState(false);
    const gt = useMemo(
        () => createGroGroLandTranslator(i18n.resolvedLanguage || i18n.language),
        [i18n.language, i18n.resolvedLanguage]
    );
    const safeEvolutionStage = Math.min(5, Math.max(1, evolutionStage || 1)) as EvolutionStage;
    const runnerCharacter = useMemo(() => {
        const safeSpeciesId = speciesId || 'yellowJello';
        const character = createCharacter(safeSpeciesId, characterName || 'Jello');
        character.evolutionStage = (evolutionStage || 1) as EvolutionStage;
        return character;
    }, [characterName, evolutionStage, speciesId]);
    const runnerImageUrl = useMemo(() => {
        const safeSpeciesId = speciesId || 'yellowJello';
        const safeStage = (evolutionStage || 1) as EvolutionStage;
        const species = CHARACTER_SPECIES_CORE[safeSpeciesId];
        return species?.evolutions.find((item) => item.stage === safeStage)?.imageUrl ?? '';
    }, [evolutionStage, speciesId]);

    const headerStats = useMemo(() => ([
        {
            label: gt('stats.myLand'),
            bestLabel: gt('stats.best'),
            current: `${hudState.landPercent}%`,
            best: `${hudState.bestLandPercent}%`,
            widthWeight: 3.4,
            className: 'grogro-land__header-stat--mine',
        },
        ...hudState.enemyLandPercents.map((landPercent, index) => ({
            label: hudState.enemyEmojis[index] ?? gt('stats.enemyLand', { index: index + 1 }),
            current: `${landPercent}%`,
            muted: !hudState.enemyAlive[index],
            widthWeight: 0.58,
            currentClassName: 'grogro-land__enemy-percent',
            className: hudState.enemyAlive[index]
                ? 'grogro-land__header-stat--enemy'
                : 'grogro-land__header-stat--enemy-dead',
        })),
    ]), [gt, hudState]);

    const gameOverRewards = useMemo(
        () => calculatePlayArcadeReward(safeEvolutionStage, gameOverWasBest),
        [gameOverWasBest, safeEvolutionStage]
    );

    usePreventArcadeBrowserGestures({
        rootRef,
        stageRef,
        controlsRef: touchControlsRef,
        stageIgnoreSelectors: [
            '.play-arcade-game__start-overlay',
            '.play-arcade-game__game-over-overlay',
            'button',
        ],
    });

    const getActorStatusBadges = (boostTimer: number, slowTimer: number, freezeTimer: number) => {
        const badges: Array<{ emoji: string; fading: boolean }> = [];
        if (freezeTimer > 0) {
            badges.push({ emoji: '🧊', fading: freezeTimer <= GROGRO_LAND_STATUS_BADGE_FADE_FRAMES });
        }
        if (boostTimer > 0) {
            badges.push({ emoji: '⚡', fading: boostTimer <= GROGRO_LAND_STATUS_BADGE_FADE_FRAMES });
        }
        if (slowTimer > 0) {
            badges.push({ emoji: '🐢', fading: slowTimer <= GROGRO_LAND_STATUS_BADGE_FADE_FRAMES });
        }
        return badges;
    };

    const syncHudState = () => {
        setHudState(buildGroGroLandHudState(stateRef.current));
    };

    const clearInputs = () => {
        inputRef.current.left = false;
        inputRef.current.right = false;
    };

    const triggerHeartBurst = () => {
        const burstId = heartBurstIdRef.current + 1;
        heartBurstIdRef.current = burstId;
        setHeartBursts((previous) => [...previous, burstId]);
        window.setTimeout(() => {
            setHeartBursts((previous) => previous.filter((id) => id !== burstId));
        }, 850);
    };

    const setInputPressed = (key: 'left' | 'right', value: boolean) => {
        inputRef.current[key] = value;
    };

    const updateSteerInput = (clientX: number) => {
        const stage = stageRef.current;
        if (!stage) return;
        const rect = stage.getBoundingClientRect();
        const relativeX = clientX - rect.left;
        const isLeft = relativeX < rect.width / 2;
        inputRef.current.left = isLeft;
        inputRef.current.right = !isLeft;
    };

    const clearSteerInput = () => {
        clearInputs();
        steerPointerIdRef.current = null;
    };

    const preventDefaultEvent = (event: React.SyntheticEvent) => {
        event.preventDefault();
    };

    const drawScene = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        drawGroGroLandScene({
            canvas,
            playerOverlay: playerOverlayRef.current,
            enemyOverlays: enemyOverlayRefs.current,
            state: stateRef.current,
        });
    };

    const finishGame = () => {
        stateRef.current.phase = 'gameOver';
        setGameOverWasBest(stateRef.current.landPercent > stateRef.current.bestLandPercent);
        refreshGroGroLandMetrics(stateRef.current);
        syncHudState();
        setGamePhase('gameOver');
    };

    useEffect(() => {
        if (gamePhase !== 'gameOver') {
            rewardGrantedRef.current = false;
            return;
        }
        if (rewardGrantedRef.current) return;
        rewardGrantedRef.current = true;
        addRewards(gameOverRewards.xp, gameOverRewards.gro);
    }, [addRewards, gameOverRewards.gro, gameOverRewards.xp, gamePhase]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return undefined;
        const context = canvas.getContext('2d');
        if (!context) return undefined;

        const resize = () => {
            const { width, height } = canvas.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            canvas.width = Math.max(1, Math.floor(width * dpr));
            canvas.height = Math.max(1, Math.floor(height * dpr));
            context.setTransform(dpr, 0, 0, dpr, 0, 0);
            drawScene();
        };

        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, []);

    useEffect(() => {
        if (!runnerImageUrl) return undefined;

        const preloadImage = new Image();
        preloadImage.crossOrigin = 'anonymous';
        preloadImage.src = runnerImageUrl;

        if (typeof preloadImage.decode === 'function') {
            preloadImage.decode().catch(() => {});
        }

        return () => {
            preloadImage.onload = null;
            preloadImage.onerror = null;
        };
    }, [runnerImageUrl]);

    useEffect(() => {
        drawScene();
    }, [gamePhase]);

    useEffect(() => {
        if (gamePhase !== 'playing') {
            clearInputs();
        }
    }, [gamePhase]);

    useEffect(() => {
        if (gamePhase !== 'playing') return undefined;

        let lastHudSync = 0;
        const loop = (now: number) => {
            const deltaMs = lastFrameTimeRef.current === null ? 16.6667 : now - lastFrameTimeRef.current;
            lastFrameTimeRef.current = now;
            const deltaMultiplier = Math.min(deltaMs / 16.6667, 1.8);

            updateGroGroLandPlayer(stateRef.current, inputRef.current, deltaMultiplier, {
                onFinishGame: finishGame,
                onPlayerCapture: (collectedItem) => {
                    playEatingSound(0.42);
                    if (collectedItem) {
                        playClearSound(0.46);
                    }
                    triggerHeartBurst();
                },
            });
            updateGroGroLandEnemies(stateRef.current, deltaMultiplier, { onFinishGame: finishGame });
            resolveGroGroLandTrailCollisions(stateRef.current, { onFinishGame: finishGame });
            tickGroGroLandItems(stateRef.current, deltaMultiplier);
            tickGroGroLandCaptureEffects(stateRef.current, deltaMultiplier);
            drawScene();

            if (now - lastHudSync >= GROGRO_LAND_TIMINGS.hudSyncMs) {
                syncHudState();
                lastHudSync = now;
            }

            if (stateRef.current.phase === 'playing') {
                frameRef.current = window.requestAnimationFrame(loop);
            }
        };

        frameRef.current = window.requestAnimationFrame(loop);
        return () => {
            lastFrameTimeRef.current = null;
            if (frameRef.current) {
                window.cancelAnimationFrame(frameRef.current);
            }
        };
    }, [gamePhase]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') inputRef.current.left = true;
            if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') inputRef.current.right = true;
        };

        const handleKeyUp = (event: KeyboardEvent) => {
            if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') inputRef.current.left = false;
            if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') inputRef.current.right = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    const startGame = () => {
        const previousState = stateRef.current;
        const nextState = createInitialGroGroLandState(previousState.bestScore, previousState.bestLandPercent);
        nextState.phase = 'playing';
        seedGroGroLandItems(nextState);
        clearInputs();
        rewardGrantedRef.current = false;
        setGameOverWasBest(false);
        lastFrameTimeRef.current = null;
        stateRef.current = nextState;
        syncHudState();
        setGamePhase('playing');
    };

    const handleStagePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        if (gamePhase !== 'playing') return;
        const target = event.target as HTMLElement;
        if (target.closest('.grogro-land__touch-controls')) return;
        steerPointerIdRef.current = event.pointerId;
        updateSteerInput(event.clientX);
    };

    const handleStagePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        if (steerPointerIdRef.current !== event.pointerId) return;
        updateSteerInput(event.clientX);
    };

    const handleStagePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
        if (steerPointerIdRef.current !== event.pointerId) return;
        clearSteerInput();
    };

    return (
        <div
            ref={rootRef}
            className="play-arcade-game grogro-land"
            onContextMenu={preventDefaultEvent}
            onDragStart={preventDefaultEvent}
            onCopy={preventDefaultEvent}
            onCut={preventDefaultEvent}
        >
            {runnerImageUrl ? (
                <img
                    src={runnerImageUrl}
                    alt=""
                    aria-hidden="true"
                    className="grogro-land__avatar-preload-image"
                    crossOrigin="anonymous"
                />
            ) : null}
            <div className="play-arcade-game__panel grogro-land__panel">
                <PlayArcadeHeader
                    stats={headerStats}
                    statsAriaLabel={gt('headerStatsLabel')}
                    closeLabel={gt('closeButton')}
                    onExit={onExit}
                />

                <section className="play-arcade-game__hero grogro-land__hero">
                    <div className="grogro-land__stage-shell">
                        <div
                            ref={stageRef}
                            className="play-arcade-game__stage grogro-land__stage"
                            onContextMenu={preventDefaultEvent}
                            onDragStart={preventDefaultEvent}
                            onPointerDown={handleStagePointerDown}
                            onPointerMove={handleStagePointerMove}
                            onPointerUp={handleStagePointerUp}
                            onPointerCancel={handleStagePointerUp}
                            onPointerLeave={handleStagePointerUp}
                        >
                        <canvas ref={canvasRef} className="grogro-land__canvas" aria-label={gt('stageLabel')} />

                        {gamePhase === 'playing' && (
                            <div
                                ref={playerOverlayRef}
                                className={`grogro-land__player-overlay${hasBoostWarning(stateRef.current.player) ? ' grogro-land__player-overlay--warning' : ''}`}
                                aria-hidden="true"
                            >
                                <div className="grogro-land__avatar-core">
                                    <div className="grogro-land__heart-layer" aria-hidden="true">
                                        {heartBursts.map((burstId) => (
                                            <span key={burstId} className="grogro-land__heart-burst">♥️</span>
                                        ))}
                                    </div>
                                    {getActorStatusBadges(
                                        stateRef.current.player.boostTimer,
                                        stateRef.current.player.slowTimer,
                                        stateRef.current.player.freezeTimer
                                    ).length > 0 && (
                                        <span className="grogro-land__status-badges">
                                            {getActorStatusBadges(
                                                stateRef.current.player.boostTimer,
                                                stateRef.current.player.slowTimer,
                                                stateRef.current.player.freezeTimer
                                            ).map((badge) => (
                                                <span
                                                    key={badge.emoji}
                                                    className={`grogro-land__status-badge${badge.fading ? ' grogro-land__status-badge--fading' : ''}`}
                                                >
                                                    {badge.emoji}
                                                </span>
                                            ))}
                                        </span>
                                    )}
                                    <JelloAvatar
                                        character={runnerCharacter}
                                        speciesId={runnerCharacter.speciesId}
                                        responsive
                                        disableAnimation={false}
                                    />
                                </div>
                            </div>
                        )}

                        {gamePhase === 'playing' && stateRef.current.enemies.map((enemy, index) => (
                            <div
                                key={enemy.id}
                                ref={(node) => {
                                    enemyOverlayRefs.current[index] = node;
                                }}
                                className={`grogro-land__enemy-overlay${hasBoostWarning(enemy) ? ' grogro-land__enemy-overlay--warning' : ''}`}
                                aria-hidden="true"
                            >
                                {getActorStatusBadges(enemy.boostTimer, enemy.slowTimer, enemy.freezeTimer).length > 0 && (
                                    <span className="grogro-land__status-badges grogro-land__status-badges--enemy">
                                        {getActorStatusBadges(enemy.boostTimer, enemy.slowTimer, enemy.freezeTimer).map((badge) => (
                                            <span
                                                key={`${enemy.id}-${badge.emoji}`}
                                                className={`grogro-land__status-badge grogro-land__status-badge--enemy${badge.fading ? ' grogro-land__status-badge--fading' : ''}`}
                                            >
                                                {badge.emoji}
                                            </span>
                                        ))}
                                    </span>
                                )}
                                <span className="grogro-land__enemy-face">{enemy.emoji}</span>
                            </div>
                        ))}

                        {gamePhase !== 'playing' && (
                            <div className="grogro-land__placeholder">
                                <div className="grogro-land__placeholder-badge">🌱</div>
                                <h3>{gt('startTitle')}</h3>
                                <p>{gt('stageHint')}</p>
                            </div>
                        )}

                        {gamePhase === 'start' && (
                            <PlayArcadeStartOverlay
                                title={gt('startTitle')}
                                description={gt('startDescription')}
                                actionLabel={gt('startButton')}
                                onAction={startGame}
                                visual={<span className="grogro-land__start-icon">🗺️</span>}
                                iconOnly
                                guides={[
                                    { keys: ['←', '→'], text: gt('controlsMoveShort') },
                                    { keys: ['⚡', '🐢', '🧊', '💣'], text: gt('controlsActionShort') },
                                ]}
                            />
                        )}

                        {gamePhase === 'playing' && (
                            <div ref={touchControlsRef} className="grogro-land__touch-controls">
                                <button
                                    type="button"
                                    className="grogro-land__touch-button grogro-land__touch-button--left"
                                    onTouchStart={preventDefaultEvent}
                                    onTouchMove={preventDefaultEvent}
                                    onTouchEnd={preventDefaultEvent}
                                    onTouchCancel={preventDefaultEvent}
                                    onPointerDown={(event) => {
                                        event.preventDefault();
                                        setInputPressed('left', true);
                                    }}
                                    onPointerUp={(event) => {
                                        event.preventDefault();
                                        setInputPressed('left', false);
                                    }}
                                    onPointerLeave={(event) => {
                                        event.preventDefault();
                                        setInputPressed('left', false);
                                    }}
                                    onPointerCancel={(event) => {
                                        event.preventDefault();
                                        setInputPressed('left', false);
                                    }}
                                    onContextMenu={preventDefaultEvent}
                                    onDragStart={preventDefaultEvent}
                                    aria-label={gt('touchLeft')}
                                >
                                    ←
                                </button>
                                <button
                                    type="button"
                                    className="grogro-land__touch-button grogro-land__touch-button--right"
                                    onTouchStart={preventDefaultEvent}
                                    onTouchMove={preventDefaultEvent}
                                    onTouchEnd={preventDefaultEvent}
                                    onTouchCancel={preventDefaultEvent}
                                    onPointerDown={(event) => {
                                        event.preventDefault();
                                        setInputPressed('right', true);
                                    }}
                                    onPointerUp={(event) => {
                                        event.preventDefault();
                                        setInputPressed('right', false);
                                    }}
                                    onPointerLeave={(event) => {
                                        event.preventDefault();
                                        setInputPressed('right', false);
                                    }}
                                    onPointerCancel={(event) => {
                                        event.preventDefault();
                                        setInputPressed('right', false);
                                    }}
                                    onContextMenu={preventDefaultEvent}
                                    onDragStart={preventDefaultEvent}
                                    aria-label={gt('touchRight')}
                                >
                                    →
                                </button>
                            </div>
                        )}

                            {gamePhase === 'gameOver' && (
                                <PlayArcadeGameOverOverlay
                                    title={gt('gameOverTitle')}
                                    retryLabel={gt('retryButton')}
                                    onRetry={startGame}
                                    iconOnly
                                    records={[
                                        {
                                            label: `${gt('stats.land')} / ${gt('stats.best')}`,
                                            current: `${hudState.landPercent}%`,
                                            best: `${hudState.bestLandPercent}%`,
                                            highlighted: gameOverWasBest,
                                            badgeText: gt('newBest'),
                                        },
                                    ]}
                                    rewards={[
                                        {
                                            icon: '✨',
                                            label: gt('rewards.xp'),
                                            value: `+${gameOverRewards.xp}`,
                                            tone: 'xp',
                                        },
                                        {
                                            icon: '💰',
                                            label: gt('rewards.gro'),
                                            value: `+${gameOverRewards.gro}`,
                                            tone: 'gro',
                                        },
                                    ]}
                                />
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default GroGroLand;
