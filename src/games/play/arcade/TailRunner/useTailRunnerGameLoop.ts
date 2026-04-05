import { useEffect, useRef } from 'react';
import type React from 'react';
import { getTailRunnerRenderPixelRatio } from './rendering';
import { drawTailRunnerFrame, updateTailRunnerState } from './engine';
import type { TailRunnerState } from './types';

type UseTailRunnerGameLoopParams = {
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    stateRef: React.RefObject<TailRunnerState>;
    historyRef: React.RefObject<Array<{ x: number; y: number }>>;
    inputRef: React.RefObject<{ left: boolean; right: boolean; boost: boolean }>;
    animationFrameRef: React.RefObject<number | null>;
    gamePhase: 'start' | 'playing' | 'gameOver';
    shouldUseDomMovingEmojiOverlay: boolean;
    onGuardFrameTick: () => void;
    onFinishGame: () => void;
    onHeartBurst: () => void;
    onScoreBurst: (value: number) => void;
    onSyncHud: () => void;
    onSyncMovingEmojiOverlay: (frameNow: number) => void;
};

export const useTailRunnerGameLoop = ({
    canvasRef,
    stateRef,
    historyRef,
    inputRef,
    animationFrameRef,
    gamePhase,
    shouldUseDomMovingEmojiOverlay,
    onGuardFrameTick,
    onFinishGame,
    onHeartBurst,
    onScoreBurst,
    onSyncHud,
    onSyncMovingEmojiOverlay,
}: UseTailRunnerGameLoopParams) => {
    const onGuardFrameTickRef = useRef(onGuardFrameTick);
    const onFinishGameRef = useRef(onFinishGame);
    const onHeartBurstRef = useRef(onHeartBurst);
    const onScoreBurstRef = useRef(onScoreBurst);
    const onSyncHudRef = useRef(onSyncHud);
    const onSyncMovingEmojiOverlayRef = useRef(onSyncMovingEmojiOverlay);

    useEffect(() => {
        onGuardFrameTickRef.current = onGuardFrameTick;
        onFinishGameRef.current = onFinishGame;
        onHeartBurstRef.current = onHeartBurst;
        onScoreBurstRef.current = onScoreBurst;
        onSyncHudRef.current = onSyncHud;
        onSyncMovingEmojiOverlayRef.current = onSyncMovingEmojiOverlay;
    }, [
        onFinishGame,
        onGuardFrameTick,
        onHeartBurst,
        onScoreBurst,
        onSyncHud,
        onSyncMovingEmojiOverlay,
    ]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || gamePhase !== 'playing') return undefined;

        const context = canvas.getContext('2d');
        if (!context) return undefined;

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
                onGuardFrameTick: onGuardFrameTickRef.current,
                onFinishGame: onFinishGameRef.current,
                onHeartBurst: onHeartBurstRef.current,
                onScoreBurst: onScoreBurstRef.current,
                onSyncHud: onSyncHudRef.current,
            });
        };

        const draw = (frameNow: number) => {
            drawTailRunnerFrame({
                context,
                canvas,
                state: stateRef.current,
                frameNow,
                hidePlayerTail: shouldUseDomMovingEmojiOverlay,
                hideMovingEmojiActors: shouldUseDomMovingEmojiOverlay,
                hideFoodEmojiEntities: shouldUseDomMovingEmojiOverlay,
            });
            onSyncMovingEmojiOverlayRef.current(frameNow);
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
    }, [
        animationFrameRef,
        canvasRef,
        gamePhase,
        historyRef,
        inputRef,
        shouldUseDomMovingEmojiOverlay,
        stateRef,
    ]);
};
