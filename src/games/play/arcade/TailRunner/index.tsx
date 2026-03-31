import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNurturing } from '../../../../contexts/NurturingContext';
import { createCharacter } from '../../../../data/characters';
import type { EvolutionStage } from '../../../../types/character';
import type { GameComponentProps } from '../../../types';
import { JelloAvatar } from '../../../../components/characters/JelloAvatar';
import {
    TAIL_RUNNER_BASE_SPEED,
    TAIL_RUNNER_BOOST_SPEED,
    TAIL_RUNNER_COIN_EMOJI,
    TAIL_RUNNER_COIN_SCORE,
    TAIL_RUNNER_DEFAULT_TAIL_EMOJI,
    TAIL_RUNNER_ENTITY_RESPAWN_PADDING,
    TAIL_RUNNER_FOOD_EMOJIS,
    TAIL_RUNNER_FOOD_SCORE,
    TAIL_RUNNER_GRID_SIZE,
    TAIL_RUNNER_HISTORY_LIMIT,
    TAIL_RUNNER_INITIAL_COIN_COUNT,
    TAIL_RUNNER_INITIAL_FOOD_COUNT,
    TAIL_RUNNER_INITIAL_OBSTACLE_COUNT,
    TAIL_RUNNER_OBSTACLE_EMOJIS,
    TAIL_RUNNER_OBSTACLE_PENALTY,
    TAIL_RUNNER_PLAYER_RADIUS,
    TAIL_RUNNER_TAIL_SPACING,
    TAIL_RUNNER_TURN_SPEED,
    TAIL_RUNNER_WORLD_SIZE,
    createInitialTailRunnerState,
} from './constants';
import type { TailRunnerEntity, TailRunnerEntityType } from './types';
import './TailRunner.css';
import manifestEn from './locales/en';
import manifestEnUk from './locales/en-UK';
import manifestKo from './locales/ko';

const GAME_LOCALE_KEY = 'games.play-jello-comet';

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

const createEntity = (
    type: TailRunnerEntityType,
    x: number,
    y: number,
    emoji: string,
    radius: number
): TailRunnerEntity => ({
    id: `${type}-${Math.random().toString(36).slice(2, 10)}`,
    x,
    y,
    type,
    emoji,
    radius,
});

const pickRandom = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];

const createRandomEntity = (
    type: TailRunnerEntityType,
    avoidX?: number,
    avoidY?: number
): TailRunnerEntity => {
    let x = randomBetween(TAIL_RUNNER_ENTITY_RESPAWN_PADDING, TAIL_RUNNER_WORLD_SIZE - TAIL_RUNNER_ENTITY_RESPAWN_PADDING);
    let y = randomBetween(TAIL_RUNNER_ENTITY_RESPAWN_PADDING, TAIL_RUNNER_WORLD_SIZE - TAIL_RUNNER_ENTITY_RESPAWN_PADDING);

    if (typeof avoidX === 'number' && typeof avoidY === 'number') {
        let attempts = 0;
        while (Math.hypot(x - avoidX, y - avoidY) < 220 && attempts < 10) {
            x = randomBetween(TAIL_RUNNER_ENTITY_RESPAWN_PADDING, TAIL_RUNNER_WORLD_SIZE - TAIL_RUNNER_ENTITY_RESPAWN_PADDING);
            y = randomBetween(TAIL_RUNNER_ENTITY_RESPAWN_PADDING, TAIL_RUNNER_WORLD_SIZE - TAIL_RUNNER_ENTITY_RESPAWN_PADDING);
            attempts += 1;
        }
    }

    if (type === 'food') {
        return createEntity(type, x, y, pickRandom(TAIL_RUNNER_FOOD_EMOJIS), 20);
    }
    if (type === 'coin') {
        return createEntity(type, x, y, TAIL_RUNNER_COIN_EMOJI, 18);
    }
    return createEntity(type, x, y, pickRandom(TAIL_RUNNER_OBSTACLE_EMOJIS), 22);
};

const createInitialEntities = (playerX: number, playerY: number) => ([
    ...Array.from({ length: TAIL_RUNNER_INITIAL_FOOD_COUNT }, () => createRandomEntity('food', playerX, playerY)),
    ...Array.from({ length: TAIL_RUNNER_INITIAL_COIN_COUNT }, () => createRandomEntity('coin', playerX, playerY)),
    ...Array.from({ length: TAIL_RUNNER_INITIAL_OBSTACLE_COUNT }, () => createRandomEntity('obstacle', playerX, playerY)),
]);

export const TailRunner: React.FC<GameComponentProps> = ({ onExit }) => {
    const { t, i18n } = useTranslation();
    const { speciesId, evolutionStage, characterName } = useNurturing();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const stageRef = useRef<HTMLDivElement | null>(null);
    const stateRef = useRef(createInitialTailRunnerState());
    const animationFrameRef = useRef<number | null>(null);
    const inputRef = useRef({ left: false, right: false, boost: false });
    const historyRef = useRef<{ x: number; y: number }[]>([]);
    const bestScoreRef = useRef(0);
    const steerPointerIdRef = useRef<number | null>(null);
    const [gamePhase, setGamePhase] = useState<'start' | 'playing' | 'gameOver'>('start');
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [hudState, setHudState] = useState({
        score: 0,
        speed: TAIL_RUNNER_BASE_SPEED,
        tailLength: 0,
        positionX: TAIL_RUNNER_WORLD_SIZE / 2,
        positionY: TAIL_RUNNER_WORLD_SIZE / 2,
        highScore: 0,
    });

    const runnerCharacter = useMemo(() => {
        const safeSpeciesId = speciesId || 'yellowJello';
        const character = createCharacter(safeSpeciesId, characterName || 'Jello');
        character.evolutionStage = Math.min(5, Math.max(1, evolutionStage || 1)) as EvolutionStage;
        if (characterName) {
            character.name = characterName;
        }
        return character;
    }, [characterName, evolutionStage, speciesId]);

    useEffect(() => {
        const newResources = {
            en: { translation: { games: { 'play-jello-comet': manifestEn } } },
            'en-UK': { translation: { games: { 'play-jello-comet': manifestEnUk } } },
            ko: { translation: { games: { 'play-jello-comet': manifestKo } } },
        };

        Object.keys(newResources).forEach((lang) => {
            i18n.addResourceBundle(
                lang,
                'translation',
                newResources[lang as keyof typeof newResources].translation,
                true,
                true
            );
        });
    }, [i18n]);

    const clearInputs = useCallback(() => {
        inputRef.current.left = false;
        inputRef.current.right = false;
        inputRef.current.boost = false;
    }, []);

    const setInputPressed = useCallback((key: 'left' | 'right' | 'boost', value: boolean) => {
        inputRef.current[key] = value;
    }, []);

    const updateSteerInput = useCallback((clientX: number) => {
        const stage = stageRef.current;
        if (!stage) return;
        const rect = stage.getBoundingClientRect();
        const relativeX = clientX - rect.left;
        const isLeft = relativeX < rect.width / 2;
        inputRef.current.left = isLeft;
        inputRef.current.right = !isLeft;
    }, []);

    const clearSteerInput = useCallback(() => {
        inputRef.current.left = false;
        inputRef.current.right = false;
        steerPointerIdRef.current = null;
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') inputRef.current.left = true;
            if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') inputRef.current.right = true;
            if (event.code === 'Space') {
                event.preventDefault();
                inputRef.current.boost = true;
            }
        };

        const handleKeyUp = (event: KeyboardEvent) => {
            if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') inputRef.current.left = false;
            if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') inputRef.current.right = false;
            if (event.code === 'Space') inputRef.current.boost = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    useEffect(() => {
        if (gamePhase !== 'playing') {
            clearInputs();
        }
    }, [clearInputs, gamePhase]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || gamePhase !== 'playing') return;

        const context = canvas.getContext('2d');
        if (!context) return;

        const resizeCanvas = () => {
            const { width, height } = canvas.getBoundingClientRect();
            canvas.width = Math.max(1, Math.floor(width * window.devicePixelRatio));
            canvas.height = Math.max(1, Math.floor(height * window.devicePixelRatio));
            context.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        let previousTime = performance.now();

        const update = (deltaMs: number) => {
            const state = stateRef.current;
            const input = inputRef.current;
            const deltaMultiplier = Math.min(deltaMs / 16.6667, 1.8);

            if (input.left) state.playerAngle -= TAIL_RUNNER_TURN_SPEED * deltaMultiplier;
            if (input.right) state.playerAngle += TAIL_RUNNER_TURN_SPEED * deltaMultiplier;

            state.playerSpeed = input.boost ? TAIL_RUNNER_BOOST_SPEED : TAIL_RUNNER_BASE_SPEED;
            state.playerX += Math.cos(state.playerAngle) * state.playerSpeed * deltaMultiplier;
            state.playerY += Math.sin(state.playerAngle) * state.playerSpeed * deltaMultiplier;

            const isOutOfBounds =
                state.playerX < 0
                || state.playerY < 0
                || state.playerX > TAIL_RUNNER_WORLD_SIZE
                || state.playerY > TAIL_RUNNER_WORLD_SIZE;

            if (isOutOfBounds) {
                state.isGameOver = true;
                state.highScore = Math.max(state.highScore, state.score);
                bestScoreRef.current = state.highScore;
                setGamePhase('gameOver');
                setHudState({
                    score: state.score,
                    speed: state.playerSpeed,
                    tailLength: state.tail.length,
                    positionX: Math.round(state.playerX),
                    positionY: Math.round(state.playerY),
                    highScore: state.highScore,
                });
                return;
            }

            historyRef.current.unshift({ x: state.playerX, y: state.playerY });
            if (historyRef.current.length > TAIL_RUNNER_HISTORY_LIMIT) {
                historyRef.current.length = TAIL_RUNNER_HISTORY_LIMIT;
            }

            state.tail = state.tail.map((segment, index) => {
                const point = historyRef.current[(index + 1) * TAIL_RUNNER_TAIL_SPACING] || historyRef.current[historyRef.current.length - 1];
                if (!point) return segment;
                return {
                    ...segment,
                    x: point.x,
                    y: point.y,
                };
            });

            state.entities = state.entities.map((entity) => {
                const distance = Math.hypot(entity.x - state.playerX, entity.y - state.playerY);
                if (distance > entity.radius + TAIL_RUNNER_PLAYER_RADIUS) return entity;

                if (entity.type === 'food') {
                    state.score += TAIL_RUNNER_FOOD_SCORE;
                    const tailPoint = historyRef.current[(state.tail.length + 1) * TAIL_RUNNER_TAIL_SPACING] || historyRef.current[historyRef.current.length - 1] || { x: state.playerX, y: state.playerY };
                    state.tail.push({
                        x: tailPoint.x,
                        y: tailPoint.y,
                        emoji: entity.emoji || TAIL_RUNNER_DEFAULT_TAIL_EMOJI,
                    });
                    return createRandomEntity('food', state.playerX, state.playerY);
                }

                if (entity.type === 'coin') {
                    state.score += TAIL_RUNNER_COIN_SCORE;
                    return createRandomEntity('coin', state.playerX, state.playerY);
                }

                state.score = Math.max(0, state.score - TAIL_RUNNER_OBSTACLE_PENALTY);
                if (state.tail.length > 0) {
                    const nextLength = Math.floor(state.tail.length / 2);
                    state.tail = state.tail.slice(0, nextLength);
                    return createRandomEntity('obstacle', state.playerX, state.playerY);
                }

                state.isGameOver = true;
                state.highScore = Math.max(state.highScore, state.score);
                bestScoreRef.current = state.highScore;
                setGamePhase('gameOver');
                return entity;
            });

            state.highScore = Math.max(state.highScore, state.score);

            setHudState({
                score: state.score,
                speed: state.playerSpeed,
                tailLength: state.tail.length,
                positionX: Math.round(state.playerX),
                positionY: Math.round(state.playerY),
                highScore: state.highScore,
            });
        };

        const draw = () => {
            const state = stateRef.current;
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            const cameraX = state.playerX - width / 2;
            const cameraY = state.playerY - height / 2;

            context.clearRect(0, 0, width, height);

            context.fillStyle = '#102038';
            context.fillRect(0, 0, width, height);

            context.save();
            context.translate(-cameraX, -cameraY);

            context.strokeStyle = 'rgba(181, 207, 250, 0.08)';
            context.lineWidth = 1;
            for (let x = 0; x <= TAIL_RUNNER_WORLD_SIZE; x += TAIL_RUNNER_GRID_SIZE) {
                context.beginPath();
                context.moveTo(x, 0);
                context.lineTo(x, TAIL_RUNNER_WORLD_SIZE);
                context.stroke();
            }
            for (let y = 0; y <= TAIL_RUNNER_WORLD_SIZE; y += TAIL_RUNNER_GRID_SIZE) {
                context.beginPath();
                context.moveTo(0, y);
                context.lineTo(TAIL_RUNNER_WORLD_SIZE, y);
                context.stroke();
            }

            context.strokeStyle = 'rgba(255, 255, 255, 0.26)';
            context.lineWidth = 10;
            context.strokeRect(0, 0, TAIL_RUNNER_WORLD_SIZE, TAIL_RUNNER_WORLD_SIZE);

            state.entities.forEach((entity) => {
                context.save();
                context.translate(entity.x, entity.y);
                context.beginPath();
                context.fillStyle = entity.type === 'obstacle'
                    ? 'rgba(255, 120, 120, 0.18)'
                    : entity.type === 'coin'
                        ? 'rgba(255, 215, 115, 0.16)'
                        : 'rgba(180, 240, 170, 0.16)';
                context.arc(0, 0, entity.radius + 10, 0, Math.PI * 2);
                context.fill();
                context.font = `${entity.radius * 1.5}px system-ui, Apple Color Emoji, Segoe UI Emoji, sans-serif`;
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillText(entity.emoji, 0, 0);
                context.restore();
            });

            state.tail.forEach((segment, index) => {
                const alpha = Math.max(0.38, 0.95 - index * 0.08);
                context.save();
                context.globalAlpha = alpha;
                context.font = '26px system-ui, Apple Color Emoji, Segoe UI Emoji, sans-serif';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillText(segment.emoji, segment.x, segment.y);
                context.restore();
            });

            context.save();
            context.translate(state.playerX, state.playerY);
            context.rotate(state.playerAngle);
            context.beginPath();
            context.fillStyle = '#7cc7ff';
            context.moveTo(TAIL_RUNNER_PLAYER_RADIUS + 12, 0);
            context.lineTo(-TAIL_RUNNER_PLAYER_RADIUS + 2, -12);
            context.lineTo(-TAIL_RUNNER_PLAYER_RADIUS + 2, 12);
            context.closePath();
            context.fill();
            context.restore();

            context.restore();
        };

        const loop = (now: number) => {
            if (stateRef.current.isGameOver) return;
            const deltaMs = now - previousTime;
            previousTime = now;
            update(deltaMs);
            draw();
            animationFrameRef.current = window.requestAnimationFrame(loop);
        };

        animationFrameRef.current = window.requestAnimationFrame(loop);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (animationFrameRef.current) {
                window.cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        };
    }, [gamePhase]);

    const startGame = () => {
        clearInputs();
        const nextState = createInitialTailRunnerState();
        nextState.highScore = bestScoreRef.current;
        nextState.entities = createInitialEntities(nextState.playerX, nextState.playerY);
        stateRef.current = nextState;
        historyRef.current = [];
        setHudState({
            score: 0,
            speed: TAIL_RUNNER_BASE_SPEED,
            tailLength: 0,
            positionX: TAIL_RUNNER_WORLD_SIZE / 2,
            positionY: TAIL_RUNNER_WORLD_SIZE / 2,
            highScore: nextState.highScore,
        });
        setGamePhase('playing');
    };

    const handleStagePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        if (gamePhase !== 'playing') return;
        const target = event.target as HTMLElement;
        if (target.closest('.tail-runner__touch-controls')) return;
        steerPointerIdRef.current = event.pointerId;
        updateSteerInput(event.clientX);
    }, [gamePhase, updateSteerInput]);

    const handleStagePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        if (steerPointerIdRef.current !== event.pointerId) return;
        updateSteerInput(event.clientX);
    }, [updateSteerInput]);

    const handleStagePointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        if (steerPointerIdRef.current !== event.pointerId) return;
        clearSteerInput();
    }, [clearSteerInput]);

    return (
        <div className="tail-runner">
            <div className="tail-runner__panel">
                <header className="tail-runner__header">
                    <div className="tail-runner__header-stats" aria-label="Game stats">
                        <div className="tail-runner__header-stat">
                            <span className="tail-runner__header-stat-label">{t(`${GAME_LOCALE_KEY}.stats.tail`)}</span>
                            <strong className="tail-runner__header-stat-value">{hudState.tailLength}</strong>
                        </div>
                        <div className="tail-runner__header-stat">
                            <span className="tail-runner__header-stat-label">{t(`${GAME_LOCALE_KEY}.stats.score`)}</span>
                            <strong className="tail-runner__header-stat-value">{hudState.score}</strong>
                        </div>
                        <div className="tail-runner__header-stat">
                            <span className="tail-runner__header-stat-label">{t(`${GAME_LOCALE_KEY}.stats.best`)}</span>
                            <strong className="tail-runner__header-stat-value">{hudState.highScore}</strong>
                        </div>
                    </div>
                    <div className="tail-runner__header-actions">
                        <button
                            type="button"
                            className="tail-runner__close tail-runner__help"
                            onClick={() => setIsHelpOpen(true)}
                            aria-label={t(`${GAME_LOCALE_KEY}.controlsTitle`)}
                        >
                            <span className="tail-runner__help-mark">?</span>
                        </button>
                    <button
                        type="button"
                        className="tail-runner__close"
                        onClick={onExit}
                        aria-label={t('common.close')}
                    >
                        <i className="fas fa-xmark" aria-hidden="true" />
                    </button>
                    </div>
                </header>

                <section className="tail-runner__hero">
                    <div
                        ref={stageRef}
                        className="tail-runner__stage"
                        aria-label={t(`${GAME_LOCALE_KEY}.stageLabel`)}
                        onPointerDown={handleStagePointerDown}
                        onPointerMove={handleStagePointerMove}
                        onPointerUp={handleStagePointerUp}
                        onPointerCancel={handleStagePointerUp}
                        onPointerLeave={handleStagePointerUp}
                    >
                        <canvas ref={canvasRef} className="tail-runner__canvas" />
                        <div className="tail-runner__player-overlay" aria-hidden="true">
                            <div className="tail-runner__avatar-core">
                                <div className="tail-runner__avatar-glow" aria-hidden="true" />
                                <JelloAvatar
                                    character={runnerCharacter}
                                    speciesId={runnerCharacter.speciesId}
                                    responsive
                                    disableAnimation
                                />
                            </div>

                            <div className="tail-runner__avatar-tail">
                                <span>🐣</span>
                                <span>🦊</span>
                                <span>💰</span>
                            </div>
                        </div>
                        {gamePhase === 'start' && (
                            <div className="tail-runner__start-screen">
                                <div className="tail-runner__start-card">
                                    <h2>{t(`${GAME_LOCALE_KEY}.startTitle`)}</h2>
                                    <p>{t(`${GAME_LOCALE_KEY}.startDescription`)}</p>
                                    <button type="button" className="tail-runner__start-btn" onClick={startGame}>
                                        {t(`${GAME_LOCALE_KEY}.startButton`)}
                                    </button>
                                </div>
                            </div>
                        )}
                        {gamePhase === 'gameOver' && (
                            <div className="tail-runner__start-screen">
                                <div className="tail-runner__start-card">
                                    <h2>{t(`${GAME_LOCALE_KEY}.gameOverTitle`)}</h2>
                                    <p>{t(`${GAME_LOCALE_KEY}.gameOverDescription`, { score: hudState.score })}</p>
                                    <button type="button" className="tail-runner__start-btn" onClick={startGame}>
                                        {t(`${GAME_LOCALE_KEY}.retryButton`)}
                                    </button>
                                </div>
                            </div>
                        )}
                        <p className="tail-runner__camera-label">
                            {t(`${GAME_LOCALE_KEY}.worldLabel`, { size: TAIL_RUNNER_WORLD_SIZE })}
                        </p>
                        <div className="tail-runner__touch-controls">
                            <button
                                type="button"
                                className="tail-runner__touch-btn"
                                onPointerDown={() => setInputPressed('left', true)}
                                onPointerUp={() => setInputPressed('left', false)}
                                onPointerCancel={() => setInputPressed('left', false)}
                                onPointerLeave={() => setInputPressed('left', false)}
                                disabled={gamePhase !== 'playing'}
                            >
                                <span className="tail-runner__touch-icon">↺</span>
                                <span>{t(`${GAME_LOCALE_KEY}.touchLeft`)}</span>
                            </button>
                            <button
                                type="button"
                                className="tail-runner__touch-btn tail-runner__touch-btn--boost"
                                onPointerDown={() => setInputPressed('boost', true)}
                                onPointerUp={() => setInputPressed('boost', false)}
                                onPointerCancel={() => setInputPressed('boost', false)}
                                onPointerLeave={() => setInputPressed('boost', false)}
                                disabled={gamePhase !== 'playing'}
                            >
                                <span className="tail-runner__touch-icon">⚡</span>
                                <span>{t(`${GAME_LOCALE_KEY}.touchBoost`)}</span>
                            </button>
                            <button
                                type="button"
                                className="tail-runner__touch-btn"
                                onPointerDown={() => setInputPressed('right', true)}
                                onPointerUp={() => setInputPressed('right', false)}
                                onPointerCancel={() => setInputPressed('right', false)}
                                onPointerLeave={() => setInputPressed('right', false)}
                                disabled={gamePhase !== 'playing'}
                            >
                                <span className="tail-runner__touch-icon">↻</span>
                                <span>{t(`${GAME_LOCALE_KEY}.touchRight`)}</span>
                            </button>
                        </div>
                    </div>

                    <div className="tail-runner__sidebar">
                        <div className="tail-runner__card">
                            <h2>{runnerCharacter.name}</h2>
                            <p>{t(`${GAME_LOCALE_KEY}.currentJelloDescription`)}</p>
                        </div>

                        <div className="tail-runner__stats">
                            <div className="tail-runner__stat">
                                <span className="tail-runner__stat-label">{t(`${GAME_LOCALE_KEY}.stats.speed`)}</span>
                                <span className="tail-runner__stat-value">{hudState.speed.toFixed(1)}</span>
                            </div>
                            <div className="tail-runner__stat">
                                <span className="tail-runner__stat-label">{t(`${GAME_LOCALE_KEY}.stats.boost`)}</span>
                                <span className="tail-runner__stat-value">{TAIL_RUNNER_BOOST_SPEED}</span>
                            </div>
                            <div className="tail-runner__stat">
                                <span className="tail-runner__stat-label">{t(`${GAME_LOCALE_KEY}.stats.score`)}</span>
                                <span className="tail-runner__stat-value">{hudState.score}</span>
                            </div>
                            <div className="tail-runner__stat">
                                <span className="tail-runner__stat-label">{t(`${GAME_LOCALE_KEY}.stats.tail`)}</span>
                                <span className="tail-runner__stat-value">{hudState.tailLength}</span>
                            </div>
                            <div className="tail-runner__stat">
                                <span className="tail-runner__stat-label">{t(`${GAME_LOCALE_KEY}.stats.best`)}</span>
                                <span className="tail-runner__stat-value">{hudState.highScore}</span>
                            </div>
                        </div>

                        <div className="tail-runner__card">
                            <h3>{t(`${GAME_LOCALE_KEY}.currentPositionTitle`)}</h3>
                            <p>{t(`${GAME_LOCALE_KEY}.currentPositionValue`, { x: hudState.positionX, y: hudState.positionY })}</p>
                        </div>

                        <div className="tail-runner__card">
                            <h3>{t(`${GAME_LOCALE_KEY}.controlsTitle`)}</h3>
                            <ul className="tail-runner__controls">
                                <li>{t(`${GAME_LOCALE_KEY}.controlsAuto`)}</li>
                                <li>{t(`${GAME_LOCALE_KEY}.controlsTurn`)}</li>
                                <li>{t(`${GAME_LOCALE_KEY}.controlsBoost`)}</li>
                                <li>{t(`${GAME_LOCALE_KEY}.controlsTouch`)}</li>
                            </ul>
                        </div>
                    </div>
                </section>
            </div>
            {isHelpOpen && (
                <div className="tail-runner__modal-backdrop" onClick={() => setIsHelpOpen(false)}>
                    <div
                        className="tail-runner__modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label={t(`${GAME_LOCALE_KEY}.controlsTitle`)}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="tail-runner__modal-head">
                            <h3>{t(`${GAME_LOCALE_KEY}.controlsTitle`)}</h3>
                            <button
                                type="button"
                                className="tail-runner__modal-close"
                                onClick={() => setIsHelpOpen(false)}
                                aria-label={t('common.close')}
                            >
                                <i className="fas fa-xmark" aria-hidden="true" />
                            </button>
                        </div>
                        <ul className="tail-runner__controls tail-runner__controls--modal">
                            <li>{t(`${GAME_LOCALE_KEY}.controlsAuto`)}</li>
                            <li>{t(`${GAME_LOCALE_KEY}.controlsTurn`)}</li>
                            <li>{t(`${GAME_LOCALE_KEY}.controlsBoost`)}</li>
                            <li>{t(`${GAME_LOCALE_KEY}.controlsTouch`)}</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TailRunner;
