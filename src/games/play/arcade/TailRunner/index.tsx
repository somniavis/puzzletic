import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNurturing } from '../../../../contexts/NurturingContext';
import { createCharacter } from '../../../../data/characters';
import type { EvolutionStage } from '../../../../types/character';
import type { GameComponentProps } from '../../../types';
import {
    TAIL_RUNNER_BASE_SPEED,
    TAIL_RUNNER_BOOST_SPEED,
    TAIL_RUNNER_DEFAULT_TAIL_EMOJI,
    TAIL_RUNNER_FOOD_EMOJIS,
    TAIL_RUNNER_SHIELD_DURATION,
    TAIL_RUNNER_WORLD_SIZE,
    createInitialTailRunnerState,
} from './constants';
import type { TailRunnerHudState, TailRunnerTailSegment } from './types';
import { createTailRunnerTranslator } from './i18n';
import {
    buildHudState,
    createPreparedTailRunnerState,
} from './helpers';
import {
    getTailRunnerEmojiSprite,
    getTailRunnerRenderPixelRatio,
} from './rendering';
import { drawTailRunnerFrame, updateTailRunnerState } from './engine';
import {
    TailRunnerGameOverScreen,
    TailRunnerHeader,
    TailRunnerHelpModal,
    TailRunnerPlayerOverlay,
    TailRunnerSidebar,
    TailRunnerStartScreen,
    TailRunnerTouchControls,
} from './components';
import { calculatePlayArcadeReward } from '../../shared/playArcadeRewards';
import './TailRunner.css';

const TAIL_RUNNER_HUD_SYNC_INTERVAL_MS = 100;
const TAIL_RUNNER_POWERUP_VISUAL_GUARD_FRAMES = 8;
const isTailRunnerIpadSafari = () => {
    if (typeof navigator === 'undefined') return false;
    const userAgent = navigator.userAgent;
    return /iPad/i.test(userAgent) && /Safari/i.test(userAgent) && !/CriOS|FxiOS|EdgiOS/i.test(userAgent);
};

type TailRunnerScoreBurst = {
    id: number;
    label: string;
};

type TailRunnerGameOverHighlights = {
    score: boolean;
    tail: boolean;
};

type TailRunnerDomTailSegment = TailRunnerTailSegment & {
    screenX: number;
    screenY: number;
};

export const TailRunner: React.FC<GameComponentProps> = ({ onExit }) => {
    const { i18n } = useTranslation();
    const { speciesId, evolutionStage, characterName, addRewards } = useNurturing();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const stageRef = useRef<HTMLDivElement | null>(null);
    const stateRef = useRef(createInitialTailRunnerState());
    const animationFrameRef = useRef<number | null>(null);
    const inputRef = useRef({ left: false, right: false, boost: false });
    const historyRef = useRef<{ x: number; y: number }[]>([]);
    const bestScoreRef = useRef(0);
    const bestTailRef = useRef(0);
    const lastHudSyncRef = useRef(0);
    const steerPointerIdRef = useRef<number | null>(null);
    const powerupVisualGuardFramesRef = useRef(0);
    const [gamePhase, setGamePhase] = useState<'start' | 'playing' | 'gameOver'>('start');
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [heartBursts, setHeartBursts] = useState<number[]>([]);
    const [scoreBursts, setScoreBursts] = useState<TailRunnerScoreBurst[]>([]);
    const [domTailSegments, setDomTailSegments] = useState<TailRunnerDomTailSegment[]>([]);
    const [gameOverHighlights, setGameOverHighlights] = useState<TailRunnerGameOverHighlights>({
        score: false,
        tail: false,
    });
    const rewardGrantedRef = useRef(false);
    const [hudState, setHudState] = useState<TailRunnerHudState>({
        score: 0,
        speed: TAIL_RUNNER_BASE_SPEED,
        tailLength: 0,
        bestTail: 0,
        positionX: TAIL_RUNNER_WORLD_SIZE / 2,
        positionY: TAIL_RUNNER_WORLD_SIZE / 2,
        highScore: 0,
        shieldCharges: 0,
    });
    const canShowPowerupVisuals = gamePhase === 'playing' && powerupVisualGuardFramesRef.current <= 0;
    const liveShieldActive = canShowPowerupVisuals && stateRef.current.shieldTimer > 0;
    const liveShieldWarning = liveShieldActive && stateRef.current.shieldTimer <= 120;
    const liveMagnetActive = canShowPowerupVisuals && stateRef.current.magnetTimer > 0;
    const isScoreBeyondBest = gamePhase === 'playing' && hudState.score > bestScoreRef.current;
    const isTailBeyondBest = gamePhase === 'playing' && hudState.tailLength > bestTailRef.current;

    const runnerCharacter = useMemo(() => {
        const safeSpeciesId = speciesId || 'yellowJello';
        const character = createCharacter(safeSpeciesId, characterName || 'Jello');
        character.evolutionStage = Math.min(5, Math.max(1, evolutionStage || 1)) as EvolutionStage;
        if (characterName) {
            character.name = characterName;
        }
        return character;
    }, [characterName, evolutionStage, speciesId]);

    const gt = useMemo(
        () => createTailRunnerTranslator(i18n.resolvedLanguage || i18n.language),
        [i18n.language, i18n.resolvedLanguage]
    );
    const safeEvolutionStage = Math.min(5, Math.max(1, evolutionStage || 1)) as EvolutionStage;
    const tailRunnerRewards = useMemo(
        () => calculatePlayArcadeReward(safeEvolutionStage, gameOverHighlights.score || gameOverHighlights.tail),
        [gameOverHighlights.score, gameOverHighlights.tail, safeEvolutionStage]
    );
    const shouldUseDomTailOverlay = useMemo(() => isTailRunnerIpadSafari(), []);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const warmup = () => {
            const allTailEmojis = Array.from(new Set([
                ...TAIL_RUNNER_FOOD_EMOJIS,
                TAIL_RUNNER_DEFAULT_TAIL_EMOJI,
                '🪨',
                '👿',
                '🦖',
                '💢',
            ]));

            allTailEmojis.forEach((emoji) => {
                getTailRunnerEmojiSprite(emoji, 26, 1);
                getTailRunnerEmojiSprite(emoji, 26, -1);
            });
            getTailRunnerEmojiSprite('🪨', 24, 1);
            getTailRunnerEmojiSprite('🪨', 24, -1);
            getTailRunnerEmojiSprite('👿', 32, 1);
            getTailRunnerEmojiSprite('👿', 32, -1);
            getTailRunnerEmojiSprite('🦖', 68, 1);
            getTailRunnerEmojiSprite('🦖', 68, -1);
            getTailRunnerEmojiSprite('💢', 18, 1);
        };

        let idleId: number | null = null;
        let timeoutId: number | null = null;
        const idleWindow = window as Window & {
            requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
            cancelIdleCallback?: (handle: number) => void;
        };

        if (typeof idleWindow.requestIdleCallback === 'function') {
            idleId = idleWindow.requestIdleCallback(warmup, { timeout: 600 });
        } else {
            timeoutId = window.setTimeout(warmup, 120);
        }

        return () => {
            if (typeof idleWindow.cancelIdleCallback === 'function' && idleId !== null) {
                idleWindow.cancelIdleCallback(idleId);
            }
            if (timeoutId !== null) {
                window.clearTimeout(timeoutId);
            }
        };
    }, []);

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

    const triggerHeartBurst = useCallback(() => {
        const id = Date.now() + Math.random();
        setHeartBursts((current) => [...current, id]);
        window.setTimeout(() => {
            setHeartBursts((current) => current.filter((item) => item !== id));
        }, 850);
    }, []);

    const triggerScoreBurst = useCallback((value: number) => {
        const id = Date.now() + Math.random();
        setScoreBursts((current) => [...current, { id, label: `+${value}` }]);
        window.setTimeout(() => {
            setScoreBursts((current) => current.filter((item) => item.id !== id));
        }, 850);
    }, []);

    const syncHudState = useCallback((force = false) => {
        const now = performance.now();
        if (!force && now - lastHudSyncRef.current < TAIL_RUNNER_HUD_SYNC_INTERVAL_MS) {
            return;
        }
        lastHudSyncRef.current = now;
        setHudState(buildHudState(stateRef.current));
    }, []);

    const activateShield = useCallback(() => {
        if (gamePhase !== 'playing') return;
        const state = stateRef.current;
        if (state.shieldCharges <= 0 || state.shieldTimer > 0) return;
        state.shieldCharges -= 1;
        state.shieldTimer = TAIL_RUNNER_SHIELD_DURATION;
        syncHudState(true);
    }, [gamePhase, syncHudState]);

    const finishGame = useCallback(() => {
        const state = stateRef.current;
        const wasBestScore = state.score > bestScoreRef.current;
        const wasBestTail = state.tail.length > bestTailRef.current;
        state.isGameOver = true;
        state.highScore = Math.max(state.highScore, state.score);
        state.bestTail = Math.max(state.bestTail, state.tail.length);
        bestScoreRef.current = state.highScore;
        bestTailRef.current = state.bestTail;
        setGameOverHighlights({
            score: wasBestScore,
            tail: wasBestTail,
        });
        syncHudState(true);
        setGamePhase('gameOver');
    }, [syncHudState]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') inputRef.current.left = true;
            if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') inputRef.current.right = true;
            if (event.code === 'Space') {
                event.preventDefault();
                activateShield();
            }
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
    }, [activateShield]);

    useEffect(() => {
        if (gamePhase !== 'playing') {
            clearInputs();
        }
    }, [clearInputs, gamePhase]);

    useEffect(() => {
        if (gamePhase !== 'playing' || !shouldUseDomTailOverlay) {
            setDomTailSegments([]);
        }
    }, [gamePhase, shouldUseDomTailOverlay]);

    useEffect(() => {
        if (gamePhase !== 'gameOver') {
            rewardGrantedRef.current = false;
            return;
        }
        if (rewardGrantedRef.current) return;
        rewardGrantedRef.current = true;
        addRewards(tailRunnerRewards.xp, tailRunnerRewards.gro);
    }, [addRewards, gamePhase, tailRunnerRewards.gro, tailRunnerRewards.xp]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || gamePhase !== 'playing') return;

        const context = canvas.getContext('2d');
        if (!context) return;

        const resizeCanvas = () => {
            const { width, height } = canvas.getBoundingClientRect();
            const pixelRatio = getTailRunnerRenderPixelRatio();
            canvas.width = Math.max(1, Math.floor(width * pixelRatio));
            canvas.height = Math.max(1, Math.floor(height * pixelRatio));
            context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        let previousTime = performance.now();

        const update = (deltaMs: number) => {
            updateTailRunnerState({
                state: stateRef.current,
                input: inputRef.current,
                history: historyRef.current,
                deltaMs,
                onGuardFrameTick: () => {
                    if (powerupVisualGuardFramesRef.current > 0) {
                        powerupVisualGuardFramesRef.current -= 1;
                    }
                },
                onFinishGame: finishGame,
                onHeartBurst: triggerHeartBurst,
                onScoreBurst: triggerScoreBurst,
                onSyncHud: syncHudState,
            });
        };

        const draw = (frameNow: number) => {
            drawTailRunnerFrame({
                context,
                canvas,
                state: stateRef.current,
                frameNow,
                hidePlayerTail: shouldUseDomTailOverlay,
            });

            if (shouldUseDomTailOverlay) {
                const width = canvas.clientWidth;
                const height = canvas.clientHeight;
                const cameraX = stateRef.current.playerX - width / 2;
                const cameraY = stateRef.current.playerY - height / 2;
                setDomTailSegments(
                    stateRef.current.tail.map((segment) => ({
                        ...segment,
                        screenX: segment.x - cameraX,
                        screenY: segment.y - cameraY,
                    }))
                );
            }
        };

        const loop = (now: number) => {
            if (stateRef.current.isGameOver) return;
            const deltaMs = now - previousTime;
            previousTime = now;
            update(deltaMs);
            draw(now);
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
    }, [finishGame, gamePhase, shouldUseDomTailOverlay, syncHudState, triggerHeartBurst, triggerScoreBurst]);

    const startGame = () => {
        clearInputs();
        rewardGrantedRef.current = false;
        setGameOverHighlights({
            score: false,
            tail: false,
        });
        const nextState = createPreparedTailRunnerState(bestScoreRef.current, bestTailRef.current);
        stateRef.current = nextState;
        powerupVisualGuardFramesRef.current = TAIL_RUNNER_POWERUP_VISUAL_GUARD_FRAMES;
        historyRef.current = [];
        lastHudSyncRef.current = 0;
        setHudState(buildHudState(nextState));
        setDomTailSegments([]);
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

    const preventDefaultEvent = useCallback((event: React.SyntheticEvent) => {
        event.preventDefault();
    }, []);

    return (
        <div
            className="play-arcade-game tail-runner"
            onContextMenu={preventDefaultEvent}
            onDragStart={preventDefaultEvent}
        >
            <div className="play-arcade-game__panel tail-runner__panel">
                <TailRunnerHeader
                    gt={gt}
                    hudState={hudState}
                    isScoreBeyondBest={isScoreBeyondBest}
                    isTailBeyondBest={isTailBeyondBest}
                    onExit={onExit}
                />

                <section className="play-arcade-game__hero tail-runner__hero">
                    <div
                        ref={stageRef}
                        className="play-arcade-game__stage tail-runner__stage"
                        aria-label={gt('stageLabel')}
                        onPointerDown={handleStagePointerDown}
                        onPointerMove={handleStagePointerMove}
                        onPointerUp={handleStagePointerUp}
                        onPointerCancel={handleStagePointerUp}
                        onPointerLeave={handleStagePointerUp}
                        onContextMenu={preventDefaultEvent}
                        onDragStart={preventDefaultEvent}
                    >
                        <canvas ref={canvasRef} className="tail-runner__canvas" />
                        {shouldUseDomTailOverlay && domTailSegments.length > 0 && (
                            <div className="tail-runner__tail-dom-overlay" aria-hidden="true">
                                {domTailSegments.map((segment, index) => (
                                    <span
                                        key={`${index}-${segment.screenX}-${segment.screenY}-${segment.emoji}`}
                                        className="tail-runner__tail-dom-segment"
                                        style={{
                                            left: `${segment.screenX}px`,
                                            top: `${segment.screenY}px`,
                                            transform: `translate(-50%, -50%) scaleX(${segment.facing})`,
                                        }}
                                    >
                                        {segment.emoji}
                                    </span>
                                ))}
                            </div>
                        )}
                        <TailRunnerPlayerOverlay
                            runnerCharacter={runnerCharacter}
                            liveShieldActive={liveShieldActive}
                            liveShieldWarning={liveShieldWarning}
                            liveMagnetActive={liveMagnetActive}
                            heartBursts={heartBursts}
                            scoreBursts={scoreBursts}
                        />
                        {gamePhase === 'start' && (
                            <TailRunnerStartScreen
                                gt={gt}
                                runnerCharacter={runnerCharacter}
                                onStart={startGame}
                            />
                        )}
                        {gamePhase === 'gameOver' && (
                            <TailRunnerGameOverScreen
                                gt={gt}
                                hudState={hudState}
                                gameOverHighlights={gameOverHighlights}
                                rewards={tailRunnerRewards}
                                onRetry={startGame}
                            />
                        )}
                        <TailRunnerTouchControls
                            gt={gt}
                            gamePhase={gamePhase}
                            liveShieldActive={liveShieldActive}
                            shieldCharges={hudState.shieldCharges}
                            onSetInputPressed={setInputPressed}
                            onActivateShield={activateShield}
                        />
                    </div>

                    <TailRunnerSidebar
                        gt={gt}
                        runnerCharacterName={runnerCharacter.name}
                        hudState={hudState}
                        boostSpeed={TAIL_RUNNER_BOOST_SPEED}
                    />
                </section>
            </div>
            {isHelpOpen && (
                <TailRunnerHelpModal
                    gt={gt}
                    onClose={() => setIsHelpOpen(false)}
                />
            )}
        </div>
    );
};

export default TailRunner;
