import React from 'react';
import { useTranslation } from 'react-i18next';
import type { GameManifest } from '../../../../types';
import { Layout2 } from '../../../../layouts/Standard/Layout2';
import { useGameEngine } from '../../../../layouts/Standard/Layout0/useGameEngine';
import { GameIds } from '../../../../../constants/gameIds';
import './ChocolateSplit.css';

interface ChocolateSplitProps {
    onExit: () => void;
}

type ChocolateRound = {
    rows: number;
    cols: number;
    totalPieces: number;
    groupCount: number;
    piecesPerGroup: number;
};

type CutOrientation = 'vertical' | 'horizontal';

type DragCutState = {
    pointerId: number;
    orientation: CutOrientation | null;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    cutIndex: number | null;
} | null;

const FEEDBACK_DELAY_MS = 720;
const EMPTY_PLACEHOLDER = 'ㅇㅇㅇ';
type PowerUpReward = 'timeFreeze' | 'extraLife' | 'doubleScore';
const POWER_UP_REWARDS: PowerUpReward[] = ['timeFreeze', 'extraLife', 'doubleScore'];
const DRAG_DIRECTION_LOCK_PX = 10;
const CUT_COMPLETE_RATIO = 0.82;
const CUT_START_EXTENSION_PX = 28;
const WRAPPER_HOLD_MS = 750;
const WRAPPER_UNWRAP_MS = 1180;
const DRAG_HINT_VISIBLE_MS = 1800;
const DRAG_HINT_EXIT_MS = 220;

type ChocolateGroupMap = {
    groupCount: number;
    cellToGroup: number[][];
};

type PieceAnimation = {
    key: string;
    style: React.CSSProperties;
};

type WrapperState = 'covered' | 'unwrapping' | 'hidden';

const CHOCOLATE_BACKGROUND_DECORS = [
    { top: '8%', left: '10%', rotate: -12, scale: 1.45, opacity: 0.11 },
    { top: '12%', left: '34%', rotate: 9, scale: 1.35, opacity: 0.1 },
    { top: '9%', left: '63%', rotate: -7, scale: 1.5, opacity: 0.1 },
    { top: '15%', left: '86%', rotate: 14, scale: 1.38, opacity: 0.11 },
    { top: '31%', left: '18%', rotate: 11, scale: 1.42, opacity: 0.09 },
    { top: '28%', left: '47%', rotate: -15, scale: 1.55, opacity: 0.12 },
    { top: '34%', left: '74%', rotate: 8, scale: 1.4, opacity: 0.1 },
    { top: '48%', left: '8%', rotate: -9, scale: 1.5, opacity: 0.1 },
    { top: '52%', left: '30%', rotate: 13, scale: 1.36, opacity: 0.09 },
    { top: '46%', left: '58%', rotate: -11, scale: 1.48, opacity: 0.11 },
    { top: '55%', left: '84%', rotate: 10, scale: 1.43, opacity: 0.1 },
    { top: '70%', left: '14%', rotate: 7, scale: 1.37, opacity: 0.11 },
    { top: '74%', left: '41%', rotate: -13, scale: 1.52, opacity: 0.1 },
    { top: '79%', left: '68%', rotate: 12, scale: 1.44, opacity: 0.09 },
    { top: '85%', left: '89%', rotate: -8, scale: 1.33, opacity: 0.11 }
] as const;

const CHOCOLATE_ROUND_CANDIDATES: ChocolateRound[] = (() => {
    const candidates: ChocolateRound[] = [];

    for (let rows = 2; rows <= 4; rows += 1) {
        for (let cols = 3; cols <= 6; cols += 1) {
            const totalPieces = rows * cols;
            for (let groupCount = 2; groupCount <= 6; groupCount += 1) {
                if (totalPieces % groupCount !== 0) continue;
                const piecesPerGroup = totalPieces / groupCount;
                if (piecesPerGroup < 2) continue;
                const canSplitWithOnlyVerticalCuts = cols % groupCount === 0;
                const canSplitWithOnlyHorizontalCuts = rows % groupCount === 0;
                if (!canSplitWithOnlyVerticalCuts && !canSplitWithOnlyHorizontalCuts) continue;
                candidates.push({
                    rows,
                    cols,
                    totalPieces,
                    groupCount,
                    piecesPerGroup
                });
            }
        }
    }

    return candidates;
})();

const getRoundSignature = (round: ChocolateRound): string =>
    `${round.rows}x${round.cols}-${round.groupCount}`;

const createChocolateRound = (): ChocolateRound =>
    CHOCOLATE_ROUND_CANDIDATES[Math.floor(Math.random() * CHOCOLATE_ROUND_CANDIDATES.length)];

const pickRandom = <T,>(items: readonly T[]): T =>
    items[Math.floor(Math.random() * items.length)];

const addSortedCut = (cuts: number[], index: number): number[] =>
    cuts.includes(index) ? cuts : [...cuts, index].sort((a, b) => a - b);

const getNearestCutIndex = (
    round: ChocolateRound,
    rect: DOMRect,
    orientation: CutOrientation,
    clientX: number,
    clientY: number
): number | null => {
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;

    if (localX < 0 || localY < 0 || localX > rect.width || localY > rect.height) {
        return null;
    }

    if (orientation === 'vertical') {
        const step = rect.width / round.cols;
        const threshold = Math.min(44, step * 0.48);
        let bestIndex = -1;
        let bestDistance = Number.POSITIVE_INFINITY;

        for (let index = 0; index < round.cols - 1; index += 1) {
            const seamX = step * (index + 1);
            const distance = Math.abs(localX - seamX);
            if (distance < bestDistance) {
                bestDistance = distance;
                bestIndex = index;
            }
        }

        return bestDistance <= threshold ? bestIndex : null;
    }

    const step = rect.height / round.rows;
    const threshold = Math.min(44, step * 0.48);
    let bestIndex = -1;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (let index = 0; index < round.rows - 1; index += 1) {
        const seamY = step * (index + 1);
        const distance = Math.abs(localY - seamY);
        if (distance < bestDistance) {
            bestDistance = distance;
            bestIndex = index;
        }
    }

    return bestDistance <= threshold ? bestIndex : null;
};

const buildChocolateGroupMap = (
    round: ChocolateRound,
    verticalCuts: number[],
    horizontalCuts: number[]
): ChocolateGroupMap => {
    const verticalSet = new Set(verticalCuts);
    const horizontalSet = new Set(horizontalCuts);
    const visited = Array.from({ length: round.rows }, () => Array.from({ length: round.cols }, () => false));
    const cellToGroup = Array.from({ length: round.rows }, () =>
        Array.from({ length: round.cols }, () => -1)
    );
    let groupIndex = 0;

    for (let row = 0; row < round.rows; row += 1) {
        for (let col = 0; col < round.cols; col += 1) {
            if (visited[row][col]) continue;

            const stack: Array<[number, number]> = [[row, col]];
            visited[row][col] = true;
            cellToGroup[row][col] = groupIndex;

            while (stack.length > 0) {
                const [currentRow, currentCol] = stack.pop() as [number, number];

                const tryVisit = (nextRow: number, nextCol: number) => {
                    if (
                        nextRow < 0 ||
                        nextRow >= round.rows ||
                        nextCol < 0 ||
                        nextCol >= round.cols
                    ) {
                        return;
                    }

                    if (visited[nextRow][nextCol]) return;
                    visited[nextRow][nextCol] = true;
                    cellToGroup[nextRow][nextCol] = groupIndex;
                    stack.push([nextRow, nextCol]);
                };

                if (currentCol < round.cols - 1 && !verticalSet.has(currentCol)) {
                    tryVisit(currentRow, currentCol + 1);
                }

                if (currentCol > 0 && !verticalSet.has(currentCol - 1)) {
                    tryVisit(currentRow, currentCol - 1);
                }

                if (currentRow < round.rows - 1 && !horizontalSet.has(currentRow)) {
                    tryVisit(currentRow + 1, currentCol);
                }

                if (currentRow > 0 && !horizontalSet.has(currentRow - 1)) {
                    tryVisit(currentRow - 1, currentCol);
                }
            }

            groupIndex += 1;
        }
    }

    return { groupCount: groupIndex, cellToGroup };
};

const isEvenChocolateSplit = (
    round: ChocolateRound,
    groupMap: ChocolateGroupMap | null
): boolean => {
    if (!groupMap) return false;
    if (groupMap.groupCount !== round.groupCount) return false;

    const pieceCounts = Array.from({ length: groupMap.groupCount }, () => 0);

    for (let row = 0; row < round.rows; row += 1) {
        for (let col = 0; col < round.cols; col += 1) {
            const groupIndex = groupMap.cellToGroup[row]?.[col] ?? -1;
            if (groupIndex < 0) return false;
            pieceCounts[groupIndex] += 1;
        }
    }

    return pieceCounts.every((count) => count === round.piecesPerGroup);
};

export const ChocolateSplit: React.FC<ChocolateSplitProps> = ({ onExit }) => {
    const { t } = useTranslation();
    const engine = useGameEngine({ initialLives: 3, initialTime: 90, maxDifficulty: 1 });
    const { submitAnswer, registerEvent } = engine;
    const [round, setRound] = React.useState<ChocolateRound | null>(null);
    const [verticalCuts, setVerticalCuts] = React.useState<number[]>([]);
    const [horizontalCuts, setHorizontalCuts] = React.useState<number[]>([]);
    const [dragCutState, setDragCutState] = React.useState<DragCutState>(null);
    const [isResolving, setIsResolving] = React.useState(false);
    const [isBreaking, setIsBreaking] = React.useState(false);
    const [wrapperState, setWrapperState] = React.useState<WrapperState>('covered');
    const [showDragHint, setShowDragHint] = React.useState(false);
    const [isDragHintExiting, setIsDragHintExiting] = React.useState(false);
    const prevGameStateRef = React.useRef(engine.gameState);
    const prevRoundSignatureRef = React.useRef<string | null>(null);
    const resolveTimerRef = React.useRef<number | null>(null);
    const wrapperRevealTimerRef = React.useRef<number | null>(null);
    const wrapperHideTimerRef = React.useRef<number | null>(null);
    const dragHintTimerRef = React.useRef<number | null>(null);
    const dragHintExitTimerRef = React.useRef<number | null>(null);
    const hasShownDragHintRef = React.useRef(false);
    const cutLayerRef = React.useRef<HTMLDivElement | null>(null);

    const clearResolveTimer = React.useCallback(() => {
        if (resolveTimerRef.current !== null) {
            window.clearTimeout(resolveTimerRef.current);
            resolveTimerRef.current = null;
        }
    }, []);

    const clearWrapperTimers = React.useCallback(() => {
        if (wrapperRevealTimerRef.current !== null) {
            window.clearTimeout(wrapperRevealTimerRef.current);
            wrapperRevealTimerRef.current = null;
        }

        if (wrapperHideTimerRef.current !== null) {
            window.clearTimeout(wrapperHideTimerRef.current);
            wrapperHideTimerRef.current = null;
        }
    }, []);

    const clearDragHintTimers = React.useCallback(() => {
        if (dragHintTimerRef.current !== null) {
            window.clearTimeout(dragHintTimerRef.current);
            dragHintTimerRef.current = null;
        }

        if (dragHintExitTimerRef.current !== null) {
            window.clearTimeout(dragHintExitTimerRef.current);
            dragHintExitTimerRef.current = null;
        }
    }, []);

    const resetBoardState = React.useCallback(() => {
        setVerticalCuts([]);
        setHorizontalCuts([]);
        setDragCutState(null);
        setIsResolving(false);
        setIsBreaking(false);
    }, []);

    const resetHintState = React.useCallback(() => {
        setShowDragHint(false);
        setIsDragHintExiting(false);
        hasShownDragHintRef.current = false;
        clearDragHintTimers();
    }, [clearDragHintTimers]);

    const scheduleWrapperReveal = React.useCallback(() => {
        clearWrapperTimers();
        setWrapperState('covered');

        wrapperRevealTimerRef.current = window.setTimeout(() => {
            setWrapperState('unwrapping');
        }, WRAPPER_HOLD_MS);

        wrapperHideTimerRef.current = window.setTimeout(() => {
            setWrapperState('hidden');
            wrapperRevealTimerRef.current = null;
            wrapperHideTimerRef.current = null;
        }, WRAPPER_HOLD_MS + WRAPPER_UNWRAP_MS);
    }, [clearWrapperTimers]);

    const prepareRound = React.useCallback(() => {
        let nextRound = createChocolateRound();
        let signature = getRoundSignature(nextRound);
        let attempts = 0;

        while (
            prevRoundSignatureRef.current &&
            prevRoundSignatureRef.current === signature &&
            attempts < 8
        ) {
            nextRound = createChocolateRound();
            signature = getRoundSignature(nextRound);
            attempts += 1;
        }

        prevRoundSignatureRef.current = signature;
        setRound(nextRound);
        resetBoardState();
        clearResolveTimer();
        scheduleWrapperReveal();
    }, [clearResolveTimer, resetBoardState, scheduleWrapperReveal]);

    React.useEffect(() => {
        const prevGameState = prevGameStateRef.current;

        if (engine.gameState === 'playing' && (prevGameState === 'idle' || prevGameState === 'gameover')) {
            prepareRound();
        }

        if (engine.gameState === 'idle' || engine.gameState === 'gameover') {
            setRound(null);
            resetBoardState();
            setWrapperState('covered');
            resetHintState();
            clearResolveTimer();
            clearWrapperTimers();
        }

        prevGameStateRef.current = engine.gameState;
    }, [clearResolveTimer, clearWrapperTimers, engine.gameState, prepareRound, resetBoardState, resetHintState]);

    React.useEffect(() => () => {
        clearResolveTimer();
        clearWrapperTimers();
        clearDragHintTimers();
    }, [clearDragHintTimers, clearResolveTimer, clearWrapperTimers]);

    const powerUps = React.useMemo(() => ([
        {
            count: engine.powerUps.timeFreeze,
            color: 'blue' as const,
            icon: '❄️',
            title: t('games.chocolate-split.powerups.timeFreeze'),
            onClick: () => engine.activatePowerUp('timeFreeze'),
            disabledConfig: engine.isTimeFrozen,
            status: engine.isTimeFrozen ? 'active' as const : 'normal' as const
        },
        {
            count: engine.powerUps.extraLife,
            color: 'red' as const,
            icon: '❤️',
            title: t('games.chocolate-split.powerups.extraLife'),
            onClick: () => engine.activatePowerUp('extraLife'),
            disabledConfig: engine.lives >= 3,
            status: engine.lives >= 3 ? 'maxed' as const : 'normal' as const
        },
        {
            count: engine.powerUps.doubleScore,
            color: 'yellow' as const,
            icon: '⚡',
            title: t('games.chocolate-split.powerups.doubleScore'),
            onClick: () => engine.activatePowerUp('doubleScore'),
            disabledConfig: engine.isDoubleScore,
            status: engine.isDoubleScore ? 'active' as const : 'normal' as const
        }
    ]), [engine, t]);

    const instructions = React.useMemo(() => [
        {
            icon: '✏️',
            title: t('games.chocolate-split.howToPlay.step1.title'),
            description: t('games.chocolate-split.howToPlay.step1.description')
        },
        {
            icon: '🧩',
            title: t('games.chocolate-split.howToPlay.step2.title'),
            description: t('games.chocolate-split.howToPlay.step2.description')
        },
        {
            icon: '👆',
            title: t('games.chocolate-split.howToPlay.step3.title'),
            description: t('games.chocolate-split.howToPlay.step3.description')
        }
    ], [t]);

    const groupMap = React.useMemo(() => {
        if (!round) return null;
        return buildChocolateGroupMap(round, verticalCuts, horizontalCuts);
    }, [horizontalCuts, round, verticalCuts]);

    const isCurrentSplitEven = React.useMemo(() => {
        if (!round) return false;
        return isEvenChocolateSplit(round, groupMap);
    }, [groupMap, round]);

    const boardStyle = React.useMemo(
        () =>
            round
                ? ({
                      ['--choco-cols' as string]: round.cols,
                      ['--choco-rows' as string]: round.rows
                  } as React.CSSProperties)
                : undefined,
        [round]
    );

    const pieceAnimations = React.useMemo<PieceAnimation[]>(() => {
        if (!round) return [];

        return Array.from({ length: round.totalPieces }, (_, index) => {
            const row = Math.floor(index / round.cols);
            const col = index % round.cols;
            const groupIndex = groupMap?.cellToGroup[row]?.[col] ?? 0;
            const offsetX = ((groupIndex % 3) - 1) * 26;
            const offsetY = (Math.floor(groupIndex / 3) - 0.5) * 18;
            const rotation = ((groupIndex % 2 === 0 ? 1 : -1) * (groupIndex + 1)) * 3;

            return {
                key: `piece-${index}`,
                style: {
                    ['--break-x' as string]: `${offsetX}px`,
                    ['--break-y' as string]: `${offsetY}px`,
                    ['--break-rotate' as string]: `${rotation}deg`
                }
            };
        });
    }, [groupMap, round]);

    const verticalCutSet = React.useMemo(() => new Set(verticalCuts), [verticalCuts]);
    const horizontalCutSet = React.useMemo(() => new Set(horizontalCuts), [horizontalCuts]);

    const hintCutOrientation = React.useMemo<CutOrientation>(() => {
        if (!round) return 'vertical';
        if (round.cols > 2) return 'vertical';
        return 'horizontal';
    }, [round]);

    const hintCutIndex = React.useMemo(() => {
        if (!round) return 0;
        if (hintCutOrientation === 'vertical') {
            return Math.max(0, Math.floor((round.cols - 1) / 2));
        }

        return Math.max(0, Math.floor((round.rows - 1) / 2));
    }, [hintCutOrientation, round]);

    React.useEffect(() => {
        const isFirstProblem = engine.stats.correct === 0 && engine.stats.wrong === 0;
        if (
            engine.gameState !== 'playing' ||
            !round ||
            wrapperState !== 'hidden' ||
            !isFirstProblem ||
            hasShownDragHintRef.current
        ) {
            return;
        }

        hasShownDragHintRef.current = true;
        setShowDragHint(true);
        setIsDragHintExiting(false);

        dragHintTimerRef.current = window.setTimeout(() => {
            setIsDragHintExiting(true);
            dragHintExitTimerRef.current = window.setTimeout(() => {
                setShowDragHint(false);
                setIsDragHintExiting(false);
                dragHintExitTimerRef.current = null;
            }, DRAG_HINT_EXIT_MS);
            dragHintTimerRef.current = null;
        }, DRAG_HINT_VISIBLE_MS);

        return () => {
            clearDragHintTimers();
        };
    }, [clearDragHintTimers, engine.gameState, engine.stats.correct, engine.stats.wrong, round, wrapperState]);

    const isPreviewCutComplete = React.useMemo(() => {
        if (!round || !dragCutState?.orientation || dragCutState.cutIndex === null || !cutLayerRef.current) {
            return false;
        }

        const rect = cutLayerRef.current.getBoundingClientRect();
        if (dragCutState.orientation === 'vertical') {
            const covered = Math.abs(dragCutState.currentY - dragCutState.startY) + CUT_START_EXTENSION_PX;
            return covered / Math.max(rect.height, 1) >= CUT_COMPLETE_RATIO;
        }

        const covered = Math.abs(dragCutState.currentX - dragCutState.startX) + CUT_START_EXTENSION_PX;
        return covered / Math.max(rect.width, 1) >= CUT_COMPLETE_RATIO;
    }, [dragCutState, round]);

    const previewCut = React.useMemo(() => {
        if (!round || !dragCutState?.orientation || dragCutState.cutIndex === null || !cutLayerRef.current) {
            return null;
        }

        const rect = cutLayerRef.current.getBoundingClientRect();
        const startLocalX = dragCutState.startX - rect.left;
        const startLocalY = dragCutState.startY - rect.top;
        const currentLocalX = dragCutState.currentX - rect.left;
        const currentLocalY = dragCutState.currentY - rect.top;

        if (dragCutState.orientation === 'vertical') {
            const top = Math.max(0, Math.min(startLocalY, currentLocalY) - CUT_START_EXTENSION_PX);
            const height = Math.min(
                rect.height - top,
                Math.abs(currentLocalY - startLocalY) + CUT_START_EXTENSION_PX
            );

            return {
                className: 'chocolate-split-cut-preview chocolate-split-cut-preview-vertical',
                style: {
                    left: `${((dragCutState.cutIndex + 1) / round.cols) * 100}%`,
                    top: `${(top / rect.height) * 100}%`,
                    height: `${(height / rect.height) * 100}%`
                } as React.CSSProperties
            };
        }

        const left = Math.max(0, Math.min(startLocalX, currentLocalX) - CUT_START_EXTENSION_PX);
        const width = Math.min(
            rect.width - left,
            Math.abs(currentLocalX - startLocalX) + CUT_START_EXTENSION_PX
        );

        return {
            className: 'chocolate-split-cut-preview chocolate-split-cut-preview-horizontal',
            style: {
                top: `${((dragCutState.cutIndex + 1) / round.rows) * 100}%`,
                left: `${(left / rect.width) * 100}%`,
                width: `${(width / rect.width) * 100}%`
            } as React.CSSProperties
        };
    }, [dragCutState, round]);

    const handleConfirm = React.useCallback(() => {
        if (!round || isResolving || engine.gameState !== 'playing') return;

        const isCorrect = isCurrentSplitEven;
        setIsResolving(true);

        if (isCorrect) {
            const nextCombo = engine.combo + 1;
            if (nextCombo % 3 === 0 && Math.random() > 0.45) {
                const reward = pickRandom(POWER_UP_REWARDS);
                engine.setPowerUps((prev) => ({ ...prev, [reward]: prev[reward] + 1 }));
            }
            submitAnswer(true);
            setIsBreaking(true);
        } else {
            submitAnswer(false, { skipFeedback: true });
            setVerticalCuts([]);
            setHorizontalCuts([]);
            setDragCutState(null);
        }

        registerEvent(isCorrect ? { type: 'correct' } : { type: 'wrong' });

        resolveTimerRef.current = window.setTimeout(() => {
            if (isCorrect) {
                prepareRound();
            } else {
                setIsResolving(false);
            }
        }, FEEDBACK_DELAY_MS);
    }, [
        engine.gameState,
        isCurrentSplitEven,
        isResolving,
        prepareRound,
        registerEvent,
        round,
        submitAnswer
    ]);

    const activateCut = React.useCallback((orientation: CutOrientation, index: number) => {
        if (orientation === 'vertical') {
            setVerticalCuts((prev) => addSortedCut(prev, index));
            return;
        }

        setHorizontalCuts((prev) => addSortedCut(prev, index));
    }, []);

    const handleCutLayerPointerDown = React.useCallback(
        (event: React.PointerEvent<HTMLDivElement>) => {
            if (isResolving) return;
            if (!round || !cutLayerRef.current) return;

            event.preventDefault();
            setDragCutState({
                pointerId: event.pointerId,
                orientation: null,
                startX: event.clientX,
                startY: event.clientY,
                currentX: event.clientX,
                currentY: event.clientY,
                cutIndex: null
            });
        },
        [isResolving, round]
    );

    React.useEffect(() => {
        if (!dragCutState) return;

        const handlePointerMove = (event: PointerEvent) => {
            if (event.pointerId !== dragCutState.pointerId) return;
            if (!round || !cutLayerRef.current) return;

            let activeOrientation = dragCutState.orientation;

            if (!activeOrientation) {
                const deltaX = event.clientX - dragCutState.startX;
                const deltaY = event.clientY - dragCutState.startY;
                const absX = Math.abs(deltaX);
                const absY = Math.abs(deltaY);

                if (Math.max(absX, absY) < DRAG_DIRECTION_LOCK_PX) return;
                activeOrientation = absY >= absX ? 'vertical' : 'horizontal';

                setDragCutState((prev) =>
                    prev && prev.pointerId === event.pointerId
                        ? {
                              ...prev,
                              orientation: activeOrientation,
                              currentX: event.clientX,
                              currentY: event.clientY
                          }
                        : prev
                );
            }

            const rect = cutLayerRef.current.getBoundingClientRect();
            const cutIndex =
                dragCutState.cutIndex ??
                getNearestCutIndex(
                    round,
                    rect,
                    activeOrientation,
                    dragCutState.startX,
                    dragCutState.startY
                ) ??
                getNearestCutIndex(
                    round,
                    rect,
                    activeOrientation,
                    event.clientX,
                    event.clientY
                );

            if (cutIndex === null) return;

            setDragCutState((prev) =>
                prev && prev.pointerId === event.pointerId
                    ? {
                          ...prev,
                          orientation: activeOrientation,
                          currentX: event.clientX,
                          currentY: event.clientY,
                          cutIndex
                      }
                    : prev
            );
        };

        const stopDragging = (event: PointerEvent) => {
            if (event.pointerId !== dragCutState.pointerId) return;

            if (dragCutState.orientation && dragCutState.cutIndex !== null && isPreviewCutComplete) {
                activateCut(dragCutState.orientation, dragCutState.cutIndex);
            }

            setDragCutState(null);
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', stopDragging);
        window.addEventListener('pointercancel', stopDragging);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', stopDragging);
            window.removeEventListener('pointercancel', stopDragging);
        };
    }, [activateCut, dragCutState, isPreviewCutComplete, round]);

    return (
        <Layout2
            gameId={GameIds.MATH_CHOCOLATE_SPLIT}
            title={t('games.chocolate-split.title')}
            subtitle={t('games.chocolate-split.subtitle')}
            description={t('games.chocolate-split.description')}
            instructions={instructions}
            engine={engine}
            onExit={onExit}
            powerUps={powerUps}
            className="chocolate-split-layout2"
        >
            <div className="chocolate-split-shell">
                <div className="chocolate-split-background-decor" aria-hidden="true">
                    {CHOCOLATE_BACKGROUND_DECORS.map((decor, index) => (
                        <span
                            key={`choco-bg-${index}`}
                            className="chocolate-split-background-emoji"
                            style={{
                                top: decor.top,
                                left: decor.left,
                                opacity: decor.opacity,
                                transform: `translate(-50%, -50%) rotate(${decor.rotate}deg) scale(${decor.scale})`
                            }}
                        >
                            🍫
                        </span>
                    ))}
                </div>
                <div className="chocolate-split-board">
                    <header className="chocolate-split-topbar">
                        <div className="chocolate-split-target-badge">
                            <strong className="chocolate-split-target-total">
                                {round ? round.totalPieces : EMPTY_PLACEHOLDER}
                            </strong>
                            <strong className="chocolate-split-target-symbol">÷</strong>
                            <strong className="chocolate-split-target-value">
                                <span className="chocolate-split-target-value-text">
                                    {round ? round.groupCount : EMPTY_PLACEHOLDER}
                                </span>
                            </strong>
                        </div>
                    </header>

                    <section className="chocolate-split-play-area" aria-label="chocolate-board">
                        <div
                            className="chocolate-split-chocolate-frame"
                            style={boardStyle}
                        >
                            {round ? (
                                <div className="chocolate-split-grid-shell">
                                    {showDragHint && (
                                        <div
                                            className={`chocolate-split-demo-overlay ${isDragHintExiting ? 'is-exiting' : ''}`}
                                            aria-hidden="true"
                                        >
                                            <div
                                                className={`chocolate-split-demo-line chocolate-split-demo-line-${hintCutOrientation}`}
                                                style={
                                                    hintCutOrientation === 'vertical'
                                                        ? { left: `${((hintCutIndex + 1) / round.cols) * 100}%` }
                                                        : { top: `${((hintCutIndex + 1) / round.rows) * 100}%` }
                                                }
                                            />
                                            <div
                                                className={`chocolate-split-demo-finger chocolate-split-demo-finger-${hintCutOrientation}`}
                                                style={
                                                    hintCutOrientation === 'vertical'
                                                        ? { left: `${((hintCutIndex + 1) / round.cols) * 100}%` }
                                                        : { top: `${((hintCutIndex + 1) / round.rows) * 100}%` }
                                                }
                                            >
                                                👆
                                            </div>
                                        </div>
                                    )}

                                    <div
                                        className="chocolate-split-grid"
                                        style={boardStyle}
                                    >
                                        {pieceAnimations.map((piece) => (
                                            <div
                                                key={piece.key}
                                                className={`chocolate-split-piece${isBreaking ? ' is-breaking' : ''}`}
                                                style={piece.style}
                                            />
                                        ))}
                                    </div>

                                    <div
                                        className={`chocolate-split-wrapper chocolate-split-wrapper-${wrapperState}`}
                                        aria-hidden={wrapperState === 'hidden'}
                                    >
                                        <div className="chocolate-split-wrapper-fold chocolate-split-wrapper-fold-left" />
                                        <div className="chocolate-split-wrapper-fold chocolate-split-wrapper-fold-right" />
                                        <div className="chocolate-split-wrapper-seal">
                                            <span className="chocolate-split-wrapper-seal-mark">Jello</span>
                                        </div>
                                        <div className="chocolate-split-wrapper-label">
                                            <span className="chocolate-split-wrapper-brand">Jello's</span>
                                            <span className="chocolate-split-wrapper-title">Chocolate</span>
                                        </div>
                                    </div>

                                    <div
                                        ref={cutLayerRef}
                                        className="chocolate-split-cut-layer"
                                        onPointerDown={handleCutLayerPointerDown}
                                    >
                                        {previewCut ? (
                                            <div className={previewCut.className} style={previewCut.style} />
                                        ) : null}
                                        {Array.from({ length: Math.max(0, round.cols - 1) }, (_, index) => (
                                            <div
                                                key={`vertical-cut-${index}`}
                                                className={`chocolate-split-cut-slot chocolate-split-cut-slot-vertical${
                                                    verticalCutSet.has(index) ? ' is-active' : ''
                                                }`}
                                                style={{ left: `${((index + 1) / round.cols) * 100}%` }}
                                            />
                                        ))}
                                        {Array.from({ length: Math.max(0, round.rows - 1) }, (_, index) => (
                                            <div
                                                key={`horizontal-cut-${index}`}
                                                className={`chocolate-split-cut-slot chocolate-split-cut-slot-horizontal${
                                                    horizontalCutSet.has(index) ? ' is-active' : ''
                                                }`}
                                                style={{ top: `${((index + 1) / round.rows) * 100}%` }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="chocolate-split-placeholder">{EMPTY_PLACEHOLDER}</div>
                            )}
                        </div>
                    </section>

                    <footer className="chocolate-split-actions">
                        <div className="chocolate-split-action-stack">
                            {showDragHint && (
                                <div className={`chocolate-split-actions-hint-overlay ${isDragHintExiting ? 'is-exiting' : ''}`} aria-hidden="true">
                                    <span className="chocolate-split-actions-hint-text">
                                        {t('games.chocolate-split.ui.dragCutHint')}
                                    </span>
                                </div>
                            )}
                            <div className="chocolate-split-group-readout">
                                {round
                                    ? isCurrentSplitEven
                                        ? t('games.chocolate-split.ui.perGroupValue', { value: round.piecesPerGroup })
                                        : t('games.chocolate-split.ui.perGroupUnknown')
                                    : EMPTY_PLACEHOLDER}
                            </div>
                            <button
                                type="button"
                                className="chocolate-split-confirm-button"
                                disabled={!round || isResolving}
                                onClick={handleConfirm}
                            >
                                {t('games.chocolate-split.ui.confirm')}
                            </button>
                        </div>
                    </footer>
                </div>
            </div>
        </Layout2>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const manifest: GameManifest = {
    id: GameIds.MATH_CHOCOLATE_SPLIT,
    title: 'Chocolate Split',
    titleKey: 'games.chocolate-split.title',
    subtitle: 'Make Equal Groups',
    subtitleKey: 'games.chocolate-split.subtitle',
    description: 'ㅇㅇㅇ',
    descriptionKey: 'games.chocolate-split.description',
    category: 'math',
    level: 3,
    mode: 'adventure',
    component: ChocolateSplit,
    thumbnail: '🍫',
    tagsKey: 'games.tags.multiplication'
};
