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
import type { GameComponentProps } from '../../../types';
import {
    GROGRO_LAND_ENEMY_PERSONALITY_CONFIG,
    GROGRO_LAND_STATUS_BADGE_FADE_FRAMES,
    GROGRO_LAND_PLAYER_OWNER_ID,
    GROGRO_LAND_TURN_SPEED,
    GROGRO_LAND_WORLD_HEIGHT,
    GROGRO_LAND_WORLD_WIDTH,
} from './constants';
import {
    GROGRO_LAND_TIMINGS,
    appendTrailPoint,
    buildGroGroLandHudState,
    captureTrailBoundingArea,
    createInitialGroGroLandState,
    doTrailsOverlap,
    eliminateEnemyFromGame,
    getGroGroLandActorSpeed,
    getOwnerAtWorldPosition,
    hasBoostWarning,
    hasLostCaptureAnchor,
    isGroGroLandOutOfBounds,
    isPointTouchingTrail,
    refreshGroGroLandMetrics,
    collectOwnedGroGroLandItems,
    seedGroGroLandItems,
    steerGroGroLandActorToward,
    tickActorEffectTimers,
    tickGroGroLandCaptureEffects,
    tickGroGroLandItems,
} from './helpers';
import { createGroGroLandTranslator } from './i18n';
import { drawGroGroLandScene } from './rendering';
import type { GroGroLandHudState } from './types';
import './GroGroLand.css';

export const GroGroLand: React.FC<GameComponentProps> = ({ onExit }) => {
    const { i18n } = useTranslation();
    const { speciesId, evolutionStage, characterName, addRewards } = useNurturing();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const stageRef = useRef<HTMLDivElement | null>(null);
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

    const clearDuelPair = (actorId: string, opponentId: string | null) => {
        const state = stateRef.current;
        const actors = [state.player, ...state.enemies];
        const actor = actors.find((candidate) => candidate.id === actorId);
        if (actor) actor.duelWithId = null;
        if (!opponentId) return;
        const opponent = actors.find((candidate) => candidate.id === opponentId);
        if (opponent?.duelWithId === actorId) {
            opponent.duelWithId = null;
        }
    };

    const resolveReturnDuel = (winnerId: string) => {
        const state = stateRef.current;
        const winner = winnerId === state.player.id
            ? state.player
            : state.enemies.find((enemy) => enemy.id === winnerId);
        if (!winner?.duelWithId) return;

        const loserId = winner.duelWithId;
        clearDuelPair(winnerId, loserId);

        if (loserId === state.player.id) {
            finishGame();
            return;
        }

        const loserIndex = state.enemies.findIndex((enemy) => enemy.id === loserId);
        if (loserIndex >= 0) {
            eliminateEnemyFromGame(state, loserIndex);
            refreshGroGroLandMetrics(state);
        }
    };

    const resolveTrailCollisions = () => {
        const state = stateRef.current;
        const player = state.player;

        if (player.status === 'drawing' && player.trail.length > 10 && isPointTouchingTrail(player.x, player.y, player.trail.slice(0, -6), 8)) {
            finishGame();
            return;
        }

        const drawingActors = [
            state.player,
            ...state.enemies.filter((enemy) => enemy.status === 'drawing'),
        ].filter((actor) => actor.status === 'drawing');

        for (let leftIndex = 0; leftIndex < drawingActors.length; leftIndex += 1) {
            const leftActor = drawingActors[leftIndex];
            if (leftActor.duelWithId) continue;

            for (let rightIndex = leftIndex + 1; rightIndex < drawingActors.length; rightIndex += 1) {
                const rightActor = drawingActors[rightIndex];
                if (rightActor.duelWithId) continue;
                if (!doTrailsOverlap(leftActor.trail, rightActor.trail, 12)) continue;

                leftActor.duelWithId = rightActor.id;
                rightActor.duelWithId = leftActor.id;
                break;
            }
        }
    };

    const updateEnemy = (enemyIndex: number, deltaMultiplier: number) => {
        const state = stateRef.current;
        const enemy = state.enemies[enemyIndex];
        if (!enemy || enemy.status === 'dead') return;
        const personalityConfig = GROGRO_LAND_ENEMY_PERSONALITY_CONFIG[enemy.personality];
        const findNearestItemDirection = (searchRadius: number) => {
            let nearestItem: { x: number; y: number } | null = null;
            let nearestDistanceSq = searchRadius * searchRadius;

            for (let index = 0; index < state.items.length; index += 1) {
                const item = state.items[index];
                const dx = item.x - enemy.x;
                const dy = item.y - enemy.y;
                const distanceSq = (dx * dx) + (dy * dy);
                if (distanceSq > nearestDistanceSq) continue;
                nearestDistanceSq = distanceSq;
                nearestItem = item;
            }

            if (!nearestItem) return null;
            return Math.atan2(nearestItem.y - enemy.y, nearestItem.x - enemy.x);
        };

        tickActorEffectTimers(enemy, deltaMultiplier);
        if (enemy.freezeTimer > 0) {
            return;
        }

        enemy.decisionCooldown -= deltaMultiplier;
        const ownerAtEnemy = getOwnerAtWorldPosition(state.grid, state.cols, state.rows, enemy.x, enemy.y);
        const isInsideOwnTerritory = ownerAtEnemy === enemy.ownerId;

        if (enemy.aiMode === 'patrol') {
            if (enemy.decisionCooldown <= 0) {
                enemy.aiMode = 'expand';
                enemy.expandFrames = personalityConfig.expandFrames + Math.floor(Math.random() * personalityConfig.expandVariance);
                enemy.decisionCooldown = personalityConfig.decisionCooldown;
                enemy.direction += enemyIndex % 2 === 0 ? -0.9 : 0.9;
            }
            const itemDirection = findNearestItemDirection(320);
            if (itemDirection !== null) {
                steerGroGroLandActorToward(enemy, itemDirection, GROGRO_LAND_TURN_SPEED * 0.68 * deltaMultiplier);
                if (isInsideOwnTerritory && enemy.decisionCooldown > 8) {
                    enemy.decisionCooldown = 8;
                }
            }
        } else if (enemy.aiMode === 'expand') {
            enemy.expandFrames -= deltaMultiplier;
            if (enemy.expandFrames <= 0) {
                enemy.aiMode = 'return';
            } else if (enemy.decisionCooldown <= 0) {
                enemy.direction += (Math.random() - 0.5) * personalityConfig.turnJitter;
                enemy.decisionCooldown = personalityConfig.decisionCooldown;
            }
            const itemDirection = findNearestItemDirection(420);
            if (itemDirection !== null) {
                steerGroGroLandActorToward(enemy, itemDirection, GROGRO_LAND_TURN_SPEED * 0.9 * deltaMultiplier);
                enemy.expandFrames = Math.max(enemy.expandFrames, 24);
            }
        } else if (enemy.aiMode === 'return') {
            const targetDirection = Math.atan2(enemy.spawnY - enemy.y, enemy.spawnX - enemy.x);
            steerGroGroLandActorToward(enemy, targetDirection, GROGRO_LAND_TURN_SPEED * 0.9 * deltaMultiplier);
            if (isInsideOwnTerritory) {
                enemy.aiMode = 'patrol';
                enemy.decisionCooldown = personalityConfig.patrolCooldown + Math.floor(Math.random() * personalityConfig.patrolVariance);
            }
        }

        const wouldHitOwnTrail = (direction: number) => {
            if (enemy.status !== 'drawing' || enemy.trail.length <= 10) return false;
            const nextSpeed = getGroGroLandActorSpeed(enemy);
            const nextX = enemy.x + (Math.cos(direction) * nextSpeed);
            const nextY = enemy.y + (Math.sin(direction) * nextSpeed);
            return isPointTouchingTrail(nextX, nextY, enemy.trail.slice(0, -6), 8);
        };

        if (enemy.status === 'drawing' && wouldHitOwnTrail(enemy.direction)) {
            const targetDirection = Math.atan2(enemy.spawnY - enemy.y, enemy.spawnX - enemy.x);
            steerGroGroLandActorToward(enemy, targetDirection, GROGRO_LAND_TURN_SPEED * personalityConfig.avoidTurnBoost * deltaMultiplier);
            enemy.aiMode = 'return';

            if (wouldHitOwnTrail(enemy.direction)) {
                const alternateDirections = [
                    enemy.direction + 0.9,
                    enemy.direction - 0.9,
                    enemy.direction + 1.35,
                    enemy.direction - 1.35,
                ];
                for (let index = 0; index < alternateDirections.length; index += 1) {
                    if (!wouldHitOwnTrail(alternateDirections[index])) {
                        enemy.direction = alternateDirections[index];
                        break;
                    }
                }
            }
        }

        const previousEnemyX = enemy.x;
        const previousEnemyY = enemy.y;
        const enemySpeed = getGroGroLandActorSpeed(enemy);
        enemy.x += Math.cos(enemy.direction) * enemySpeed * deltaMultiplier;
        enemy.y += Math.sin(enemy.direction) * enemySpeed * deltaMultiplier;

        if (isGroGroLandOutOfBounds(enemy.x, enemy.y)) {
            enemy.direction += Math.PI * 0.72;
            enemy.x = Math.max(16, Math.min(GROGRO_LAND_WORLD_WIDTH - 16, enemy.x));
            enemy.y = Math.max(16, Math.min(GROGRO_LAND_WORLD_HEIGHT - 16, enemy.y));
            enemy.aiMode = 'return';
            return;
        }

        const ownerAfterMove = getOwnerAtWorldPosition(state.grid, state.cols, state.rows, enemy.x, enemy.y);
        const reenteredOwnTerritory = ownerAfterMove === enemy.ownerId;

        if (enemy.status === 'safe' && !reenteredOwnTerritory) {
            enemy.status = 'drawing';
            enemy.captureExitPoint = { x: previousEnemyX, y: previousEnemyY };
            enemy.trail = [
                { x: previousEnemyX, y: previousEnemyY },
                { x: enemy.x, y: enemy.y },
            ];
        } else if (enemy.status === 'drawing') {
            appendTrailPoint(enemy);
            if (hasLostCaptureAnchor(state.grid, state.cols, state.rows, enemy)) {
                eliminateEnemyFromGame(state, enemyIndex);
                refreshGroGroLandMetrics(state);
                return;
            }
            if (reenteredOwnTerritory && enemy.trail.length > 1) {
                captureTrailBoundingArea(state, enemy);
                collectOwnedGroGroLandItems(state, enemy);
                refreshGroGroLandMetrics(state);
                resolveReturnDuel(enemy.id);
                if (state.phase !== 'playing' || state.enemies[enemyIndex]?.status === 'dead') return;
                enemy.aiMode = 'patrol';
                enemy.decisionCooldown = personalityConfig.returnCooldown + Math.floor(Math.random() * personalityConfig.returnVariance);
            }
        }
    };

    const updateEnemies = (deltaMultiplier: number) => {
        const enemyCount = stateRef.current.enemies.length;
        for (let index = 0; index < enemyCount; index += 1) {
            updateEnemy(index, deltaMultiplier);
        }
    };

    const updatePlayer = (deltaMultiplier: number) => {
        const state = stateRef.current;
        const player = state.player;

        tickActorEffectTimers(player, deltaMultiplier);

        if (inputRef.current.left) player.direction -= GROGRO_LAND_TURN_SPEED * deltaMultiplier;
        if (inputRef.current.right) player.direction += GROGRO_LAND_TURN_SPEED * deltaMultiplier;

        const previousPlayerX = player.x;
        const previousPlayerY = player.y;
        const playerSpeed = getGroGroLandActorSpeed(player);
        player.x += Math.cos(player.direction) * playerSpeed * deltaMultiplier;
        player.y += Math.sin(player.direction) * playerSpeed * deltaMultiplier;

        if (isGroGroLandOutOfBounds(player.x, player.y)) {
            finishGame();
            return;
        }

        const ownerAtPlayer = getOwnerAtWorldPosition(state.grid, state.cols, state.rows, player.x, player.y);
        const isOwnTerritory = ownerAtPlayer === GROGRO_LAND_PLAYER_OWNER_ID;

        if (player.status === 'safe' && !isOwnTerritory) {
            player.status = 'drawing';
            player.captureExitPoint = { x: previousPlayerX, y: previousPlayerY };
            player.trail = [
                { x: previousPlayerX, y: previousPlayerY },
                { x: player.x, y: player.y },
            ];
            return;
        }

        if (player.status === 'drawing') {
            appendTrailPoint(player);
            if (hasLostCaptureAnchor(state.grid, state.cols, state.rows, player)) {
                finishGame();
                return;
            }
            if (isOwnTerritory && player.trail.length > 1) {
                captureTrailBoundingArea(state, player);
                playEatingSound(0.42);
                if (collectOwnedGroGroLandItems(state, player)) {
                    playClearSound(0.46);
                }
                refreshGroGroLandMetrics(state);
                triggerHeartBurst();
                resolveReturnDuel(player.id);
                if (state.phase !== 'playing') return;
            }
        }
    };

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
        const stage = stageRef.current;
        if (!stage) return undefined;

        const shouldIgnoreTarget = (target: EventTarget | null) => {
            if (!(target instanceof HTMLElement)) return false;
            return Boolean(
                target.closest('.grogro-land__touch-controls') ||
                target.closest('.play-arcade-game__start-overlay') ||
                target.closest('.play-arcade-game__game-over-overlay') ||
                target.closest('button')
            );
        };

        const blockGesture = (event: Event) => {
            if (shouldIgnoreTarget(event.target)) return;
            event.preventDefault();
        };

        stage.addEventListener('gesturestart', blockGesture, { passive: false });
        stage.addEventListener('touchstart', blockGesture, { passive: false });
        stage.addEventListener('touchmove', blockGesture, { passive: false });

        return () => {
            stage.removeEventListener('gesturestart', blockGesture);
            stage.removeEventListener('touchstart', blockGesture);
            stage.removeEventListener('touchmove', blockGesture);
        };
    }, []);

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

            updatePlayer(deltaMultiplier);
            updateEnemies(deltaMultiplier);
            resolveTrailCollisions();
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
            className="play-arcade-game grogro-land"
            onContextMenu={preventDefaultEvent}
            onDragStart={preventDefaultEvent}
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
                            <div className="grogro-land__touch-controls">
                                <button
                                    type="button"
                                    className="grogro-land__touch-button grogro-land__touch-button--left"
                                    onPointerDown={() => { setInputPressed('left', true); }}
                                    onPointerUp={() => { setInputPressed('left', false); }}
                                    onPointerLeave={() => { setInputPressed('left', false); }}
                                    onPointerCancel={() => { setInputPressed('left', false); }}
                                    aria-label={gt('touchLeft')}
                                >
                                    ←
                                </button>
                                <button
                                    type="button"
                                    className="grogro-land__touch-button grogro-land__touch-button--right"
                                    onPointerDown={() => { setInputPressed('right', true); }}
                                    onPointerUp={() => { setInputPressed('right', false); }}
                                    onPointerLeave={() => { setInputPressed('right', false); }}
                                    onPointerCancel={() => { setInputPressed('right', false); }}
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
                </section>
            </div>
        </div>
    );
};

export default GroGroLand;
