import React from 'react';
import { useTranslation } from 'react-i18next';
import type { GameManifest } from '../../../../types';
import { Layout2 } from '../../../../layouts/Standard/Layout2';
import { useGameEngine } from '../../../../layouts/Standard/Layout0/useGameEngine';
import { GameIds } from '../../../../../constants/gameIds';
import './DonutShop.css';

interface DonutShopProps {
    onExit: () => void;
}

type DonutRound = {
    totalDonuts: number;
    boxCount: number;
    donutsPerBox: number;
};

type DonutSlot = {
    id: string;
    assignedTo: number | null;
};

type AssignmentMeta = {
    key: string;
    allAssigned: boolean;
    counts: number[];
    groups: DonutSlot[][];
    unassigned: DonutSlot[];
};

type DragState = {
    donutId: string;
    x: number;
    y: number;
    fromAssigned: boolean;
} | null;

const FEEDBACK_DELAY_MS = 720;
const POWER_UP_REWARDS: Array<'timeFreeze' | 'extraLife' | 'doubleScore'> = ['timeFreeze', 'extraLife', 'doubleScore'];
const CHEF_EMOJIS = ['🧑🏻‍🍳', '🧑🏼‍🍳', '🧑🏽‍🍳', '🧑🏾‍🍳', '🧑🏿‍🍳'] as const;

const DONUT_ROUND_CANDIDATES: DonutRound[] = (() => {
    const candidates: DonutRound[] = [];
    for (let totalDonuts = 2; totalDonuts <= 10; totalDonuts += 1) {
        for (let boxCount = 2; boxCount <= 5; boxCount += 1) {
            if (totalDonuts % boxCount !== 0) continue;
            candidates.push({
                totalDonuts,
                boxCount,
                donutsPerBox: totalDonuts / boxCount
            });
        }
    }
    return candidates;
})();

const createDonutRound = (): DonutRound =>
    DONUT_ROUND_CANDIDATES[Math.floor(Math.random() * DONUT_ROUND_CANDIDATES.length)];

const getDonutRoundSignature = (round: DonutRound): string =>
    `${round.totalDonuts}-${round.boxCount}-${round.donutsPerBox}`;

const pickRandom = <T,>(items: readonly T[]): T =>
    items[Math.floor(Math.random() * items.length)];

const getDisplaySlotCount = (boxCount: number): number => (boxCount <= 3 ? 4 : 6);
const getDisplaySlotCols = (boxCount: number): number => (boxCount <= 3 ? 2 : 3);

const buildAssignmentMeta = (
    slots: DonutSlot[],
    boxCount: number,
    activeBoxIndexes: number[]
): AssignmentMeta => {
    const counts = Array.from({ length: boxCount }, () => 0);
    const groups = Array.from({ length: boxCount }, () => [] as DonutSlot[]);
    const unassigned: DonutSlot[] = [];
    const logicalByDisplay = new Map(activeBoxIndexes.map((displayIdx, logicalIdx) => [displayIdx, logicalIdx]));
    let allAssigned = true;

    for (let i = 0; i < slots.length; i += 1) {
        const slot = slots[i];
        if (slot.assignedTo === null) {
            allAssigned = false;
            unassigned.push(slot);
            continue;
        }
        const logicalIndex = logicalByDisplay.get(slot.assignedTo);
        if (logicalIndex === undefined) {
            allAssigned = false;
            unassigned.push(slot);
            continue;
        }
        counts[logicalIndex] += 1;
        groups[logicalIndex].push(slot);
    }

    const key = `a:${activeBoxIndexes.join('.')};s:${slots
        .map((slot) => (slot.assignedTo === null ? 'x' : String(slot.assignedTo)))
        .join(',')}`;
    return { key, allAssigned, counts, groups, unassigned };
};

export const DonutShop: React.FC<DonutShopProps> = ({ onExit }) => {
    const { t } = useTranslation();
    const engine = useGameEngine({ initialLives: 3, initialTime: 90, maxDifficulty: 1 });
    const { submitAnswer, registerEvent } = engine;
    const [donutRound, setDonutRound] = React.useState<DonutRound | null>(null);
    const [donutSlots, setDonutSlots] = React.useState<DonutSlot[]>([]);
    const [activeBoxIndexes, setActiveBoxIndexes] = React.useState<number[]>([]);
    const [dragState, setDragState] = React.useState<DragState>(null);
    const [isRoundReady, setIsRoundReady] = React.useState(false);
    const [isResolving, setIsResolving] = React.useState(false);
    const [showBoxHint, setShowBoxHint] = React.useState(false);
    const [chefEmoji, setChefEmoji] = React.useState<string>(() => pickRandom(CHEF_EMOJIS));
    const prevRoundSignatureRef = React.useRef<string | null>(null);
    const prevGameStateRef = React.useRef(engine.gameState);
    const wasPlayingRef = React.useRef(false);
    const draggingDonutIdRef = React.useRef<string | null>(null);
    const activePointerIdRef = React.useRef<number | null>(null);
    const activeTouchIdRef = React.useRef<number | null>(null);
    const boxRefs = React.useRef<Array<HTMLDivElement | null>>([]);
    const resolveTimerRef = React.useRef<number | null>(null);
    const hasShownHintRef = React.useRef(false);
    const hintTimerRef = React.useRef<number | null>(null);
    const lastJudgedAssignmentKeyRef = React.useRef<string | null>(null);
    const overfillPenaltyAssignmentKeyRef = React.useRef<string | null>(null);
    const gestureEventAssignmentKeyRef = React.useRef<string | null>(null);
    const dragFromAssignedRef = React.useRef(false);

    const clearResolveTimer = React.useCallback(() => {
        if (resolveTimerRef.current !== null) {
            window.clearTimeout(resolveTimerRef.current);
            resolveTimerRef.current = null;
        }
    }, []);

    const clearHintTimer = React.useCallback(() => {
        if (hintTimerRef.current !== null) {
            window.clearTimeout(hintTimerRef.current);
            hintTimerRef.current = null;
        }
    }, []);

    const prepareRound = React.useCallback(() => {
        let nextRound = createDonutRound();
        let signature = getDonutRoundSignature(nextRound);
        let attempts = 0;

        while (
            prevRoundSignatureRef.current &&
            signature === prevRoundSignatureRef.current &&
            attempts < 8
        ) {
            nextRound = createDonutRound();
            signature = getDonutRoundSignature(nextRound);
            attempts += 1;
        }

        prevRoundSignatureRef.current = signature;
        setDonutRound(nextRound);
        const displaySlotCount = getDisplaySlotCount(nextRound.boxCount);
        setDonutSlots(
            Array.from({ length: nextRound.totalDonuts }, (_, i) => ({
                id: `donut-${Date.now()}-${i}`,
                assignedTo: null
            }))
        );
        setActiveBoxIndexes([]);
        boxRefs.current = Array.from({ length: displaySlotCount }, () => null);
        setIsRoundReady(true);
        setIsResolving(false);
        clearResolveTimer();
        setShowBoxHint(false);
        clearHintTimer();
        lastJudgedAssignmentKeyRef.current = null;
        overfillPenaltyAssignmentKeyRef.current = null;
        gestureEventAssignmentKeyRef.current = null;
    }, [clearHintTimer, clearResolveTimer]);

    React.useEffect(() => {
        const prev = prevGameStateRef.current;

        if (engine.gameState === 'playing' && (prev === 'idle' || prev === 'gameover')) {
            setIsRoundReady(false);
            setChefEmoji(pickRandom(CHEF_EMOJIS));
            prepareRound();
        }

        if (engine.gameState === 'idle' || engine.gameState === 'gameover') {
            setIsRoundReady(false);
            setIsResolving(false);
            clearResolveTimer();
            setShowBoxHint(false);
            clearHintTimer();
            lastJudgedAssignmentKeyRef.current = null;
            overfillPenaltyAssignmentKeyRef.current = null;
            gestureEventAssignmentKeyRef.current = null;
        }

        prevGameStateRef.current = engine.gameState;
    }, [clearHintTimer, clearResolveTimer, engine.gameState, prepareRound]);

    React.useEffect(() => {
        if (engine.gameState === 'playing' && !wasPlayingRef.current) {
            hasShownHintRef.current = false;
            setShowBoxHint(false);
            clearHintTimer();
        }
        wasPlayingRef.current = engine.gameState === 'playing';
    }, [clearHintTimer, engine.gameState]);

    React.useEffect(() => {
        if (engine.gameState !== 'playing' || !donutRound || hasShownHintRef.current) return;

        const isFirstQuestion = engine.score === 0 && engine.stats.correct === 0 && engine.stats.wrong === 0;
        if (!isFirstQuestion) return;

        hasShownHintRef.current = true;
        setShowBoxHint(true);
        hintTimerRef.current = window.setTimeout(() => {
            setShowBoxHint(false);
            hintTimerRef.current = null;
        }, 1800);
    }, [donutRound, engine.gameState, engine.score, engine.stats.correct, engine.stats.wrong]);

    React.useEffect(() => {
        if (!dragState) return;

        const handlePointerMove = (event: PointerEvent) => {
            if (activePointerIdRef.current !== null && event.pointerId !== activePointerIdRef.current) return;
            setDragState((prev) => (prev ? { ...prev, x: event.clientX, y: event.clientY } : prev));
        };

        const handleDropAt = (clientX: number, clientY: number) => {
            const draggingDonutId = draggingDonutIdRef.current;
            if (!draggingDonutId || !donutRound) return;

            let hitBoxIndex: number | null = null;
            for (let i = 0; i < activeBoxIndexes.length; i += 1) {
                const displaySlotIndex = activeBoxIndexes[i];
                const node = boxRefs.current[displaySlotIndex];
                if (!node) continue;
                const rect = node.getBoundingClientRect();
                const inside =
                    clientX >= rect.left &&
                    clientX <= rect.right &&
                    clientY >= rect.top &&
                    clientY <= rect.bottom;
                if (inside) {
                    hitBoxIndex = displaySlotIndex;
                    break;
                }
            }

            if (hitBoxIndex !== null) {
                const nextSlots = donutSlots.map((slot) =>
                    slot.id === draggingDonutId ? { ...slot, assignedTo: hitBoxIndex } : slot
                );
                setDonutSlots(nextSlots);
                const nextMeta = buildAssignmentMeta(nextSlots, donutRound.boxCount, activeBoxIndexes);
                const logicalHitIndex = activeBoxIndexes.indexOf(hitBoxIndex);

                if (logicalHitIndex >= 0 && nextMeta.counts[logicalHitIndex] > donutRound.donutsPerBox) {
                    overfillPenaltyAssignmentKeyRef.current = nextMeta.key;
                    gestureEventAssignmentKeyRef.current = nextMeta.key;
                    submitAnswer(false, { skipFeedback: true });
                    registerEvent({ type: 'wrong' });
                } else if (nextMeta.allAssigned) {
                    const isCorrectNow = nextMeta.counts.every((count) => count === donutRound.donutsPerBox);
                    gestureEventAssignmentKeyRef.current = nextMeta.key;
                    registerEvent(isCorrectNow ? { type: 'correct' } : { type: 'wrong' });
                }
            } else if (dragFromAssignedRef.current) {
                setDonutSlots((prev) =>
                    prev.map((slot) =>
                        slot.id === draggingDonutId ? { ...slot, assignedTo: null } : slot
                    )
                );
            }
        };

        const clearDragging = () => {
            setDragState(null);
            draggingDonutIdRef.current = null;
            activePointerIdRef.current = null;
            activeTouchIdRef.current = null;
            dragFromAssignedRef.current = false;
        };

        const handlePointerUp = (event: PointerEvent) => {
            if (activePointerIdRef.current !== null && event.pointerId !== activePointerIdRef.current) return;
            handleDropAt(event.clientX, event.clientY);
            clearDragging();
        };

        const handlePointerCancel = (event: PointerEvent) => {
            if (activePointerIdRef.current !== null && event.pointerId !== activePointerIdRef.current) return;
            clearDragging();
        };

        const getActiveTouch = (touches: TouchList): Touch | null => {
            const id = activeTouchIdRef.current;
            if (id === null) return null;
            for (let i = 0; i < touches.length; i += 1) {
                if (touches[i].identifier === id) return touches[i];
            }
            return null;
        };

        const handleTouchMove = (event: TouchEvent) => {
            const touch = getActiveTouch(event.touches);
            if (!touch) return;
            event.preventDefault();
            setDragState((prev) => (prev ? { ...prev, x: touch.clientX, y: touch.clientY } : prev));
        };

        const handleTouchEnd = (event: TouchEvent) => {
            const touch = getActiveTouch(event.changedTouches);
            if (!touch) return;
            handleDropAt(touch.clientX, touch.clientY);
            clearDragging();
        };

        const handleTouchCancel = (event: TouchEvent) => {
            const touch = getActiveTouch(event.changedTouches);
            if (!touch) return;
            clearDragging();
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('pointercancel', handlePointerCancel);
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd, { passive: false });
        window.addEventListener('touchcancel', handleTouchCancel, { passive: false });

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('pointercancel', handlePointerCancel);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('touchcancel', handleTouchCancel);
        };
    }, [activeBoxIndexes, donutRound, donutSlots, dragState?.donutId, registerEvent, submitAnswer]);

    const handleShelfDonutPointerDown = React.useCallback((event: React.PointerEvent<HTMLButtonElement>, donutId: string) => {
        if (engine.gameState !== 'playing' || isResolving) return;
        event.preventDefault();
        if (event.pointerType === 'touch') {
            event.currentTarget.setPointerCapture?.(event.pointerId);
        }
        draggingDonutIdRef.current = donutId;
        activePointerIdRef.current = event.pointerId;
        activeTouchIdRef.current = null;
        dragFromAssignedRef.current = false;
        setDragState({ donutId, x: event.clientX, y: event.clientY, fromAssigned: false });
    }, [engine.gameState, isResolving]);

    const handleShelfDonutTouchStart = React.useCallback((event: React.TouchEvent<HTMLButtonElement>, donutId: string) => {
        if (engine.gameState !== 'playing' || isResolving) return;
        const touch = event.changedTouches[0];
        if (!touch) return;
        event.preventDefault();
        draggingDonutIdRef.current = donutId;
        activePointerIdRef.current = -1;
        activeTouchIdRef.current = touch.identifier;
        dragFromAssignedRef.current = false;
        setDragState({ donutId, x: touch.clientX, y: touch.clientY, fromAssigned: false });
    }, [engine.gameState, isResolving]);

    const handleAssignedDonutPointerDown = React.useCallback((event: React.PointerEvent<HTMLButtonElement>, donutId: string) => {
        if (engine.gameState !== 'playing' || isResolving) return;
        event.preventDefault();
        if (event.pointerType === 'touch') {
            event.currentTarget.setPointerCapture?.(event.pointerId);
        }
        draggingDonutIdRef.current = donutId;
        activePointerIdRef.current = event.pointerId;
        activeTouchIdRef.current = null;
        dragFromAssignedRef.current = true;
        setDragState({ donutId, x: event.clientX, y: event.clientY, fromAssigned: true });
    }, [engine.gameState, isResolving]);

    const handleAssignedDonutTouchStart = React.useCallback((event: React.TouchEvent<HTMLButtonElement>, donutId: string) => {
        if (engine.gameState !== 'playing' || isResolving) return;
        const touch = event.changedTouches[0];
        if (!touch) return;
        event.preventDefault();
        draggingDonutIdRef.current = donutId;
        activePointerIdRef.current = -1;
        activeTouchIdRef.current = touch.identifier;
        dragFromAssignedRef.current = true;
        setDragState({ donutId, x: touch.clientX, y: touch.clientY, fromAssigned: true });
    }, [engine.gameState, isResolving]);

    const handleBoxSlotTap = React.useCallback((slotIndex: number, event: React.MouseEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement;
        if (target.closest('.donut-shop-box-donut-btn')) return;
        if (engine.gameState !== 'playing' || isResolving || !donutRound) return;
        const isActive = activeBoxIndexes.includes(slotIndex);
        if (isActive) {
            setActiveBoxIndexes((prev) => prev.filter((idx) => idx !== slotIndex));
            setDonutSlots((prev) =>
                prev.map((slot) =>
                    slot.assignedTo === slotIndex ? { ...slot, assignedTo: null } : slot
                )
            );
            return;
        }
        if (activeBoxIndexes.length >= donutRound.boxCount) {
            submitAnswer(false, { skipFeedback: true });
            registerEvent({ type: 'wrong' });
            return;
        }
        setActiveBoxIndexes((prev) => [...prev, slotIndex].sort((a, b) => a - b));
    }, [activeBoxIndexes, donutRound, engine.gameState, isResolving, registerEvent, submitAnswer]);

    const assignmentMeta = React.useMemo(
        () => (donutRound ? buildAssignmentMeta(donutSlots, donutRound.boxCount, activeBoxIndexes) : null),
        [activeBoxIndexes, donutRound, donutSlots]
    );
    const donutsByBox = assignmentMeta?.groups ?? [];
    const assignmentKey = assignmentMeta?.key ?? '';

    React.useEffect(() => () => {
        clearResolveTimer();
        clearHintTimer();
    }, [clearHintTimer, clearResolveTimer]);

    React.useEffect(() => {
        if (!donutRound) return;
        if (!assignmentMeta) return;
        if (engine.gameState !== 'playing') return;
        if (isResolving) return;
        if (donutSlots.length === 0) return;
        if (activeBoxIndexes.length !== donutRound.boxCount) {
            lastJudgedAssignmentKeyRef.current = null;
            return;
        }

        if (!assignmentMeta.allAssigned) {
            lastJudgedAssignmentKeyRef.current = null;
            return;
        }
        if (lastJudgedAssignmentKeyRef.current === assignmentKey) return;
        lastJudgedAssignmentKeyRef.current = assignmentKey;

        const isCorrect = assignmentMeta.counts.every((count) => count === donutRound.donutsPerBox);
        const alreadyPenalizedByOverfill =
            !isCorrect && overfillPenaltyAssignmentKeyRef.current === assignmentKey;
        if (alreadyPenalizedByOverfill) return;

        setIsResolving(true);

        if (isCorrect) {
            const nextCombo = engine.combo + 1;
            if (nextCombo % 3 === 0 && Math.random() > 0.45) {
                const reward = pickRandom(POWER_UP_REWARDS);
                engine.setPowerUps((prev) => ({ ...prev, [reward]: prev[reward] + 1 }));
            }
        }

        if (isCorrect) {
            engine.submitAnswer(true);
        } else {
            engine.submitAnswer(false, { skipFeedback: true });
        }

        if (gestureEventAssignmentKeyRef.current !== assignmentKey) {
            engine.registerEvent(isCorrect ? { type: 'correct' } : { type: 'wrong' });
        } else {
            gestureEventAssignmentKeyRef.current = null;
        }

        clearResolveTimer();
        resolveTimerRef.current = window.setTimeout(() => {
            if (engine.gameState !== 'playing') return;
            if (isCorrect) {
                prepareRound();
                return;
            }
            setIsResolving(false);
        }, FEEDBACK_DELAY_MS);
    }, [
        assignmentKey,
        assignmentMeta,
        clearResolveTimer,
        donutRound,
        donutSlots.length,
        engine,
        activeBoxIndexes.length,
        isResolving,
        prepareRound
    ]);

    const powerUps = React.useMemo(() => ([
        {
            count: engine.powerUps.timeFreeze,
            color: 'blue' as const,
            icon: '❄️',
            title: t('games.donut-shop.powerups.timeFreeze'),
            onClick: () => engine.activatePowerUp('timeFreeze'),
            disabledConfig: engine.isTimeFrozen,
            status: engine.isTimeFrozen ? 'active' as const : 'normal' as const
        },
        {
            count: engine.powerUps.extraLife,
            color: 'red' as const,
            icon: '❤️',
            title: t('games.donut-shop.powerups.extraLife'),
            onClick: () => engine.activatePowerUp('extraLife'),
            disabledConfig: engine.lives >= 3,
            status: engine.lives >= 3 ? 'maxed' as const : 'normal' as const
        },
        {
            count: engine.powerUps.doubleScore,
            color: 'yellow' as const,
            icon: '⚡',
            title: t('games.donut-shop.powerups.doubleScore'),
            onClick: () => engine.activatePowerUp('doubleScore'),
            disabledConfig: engine.isDoubleScore,
            status: engine.isDoubleScore ? 'active' as const : 'normal' as const
        }
    ]), [engine, t]);

    const boxOrientation = React.useMemo<'horizontal' | 'vertical'>(() => {
        if (!donutRound) return 'horizontal';
        return donutRound.boxCount >= 4 ? 'vertical' : 'horizontal';
    }, [donutRound]);

    const displaySlotCount = React.useMemo(
        () => (donutRound ? getDisplaySlotCount(donutRound.boxCount) : 4),
        [donutRound]
    );
    const boxCols = React.useMemo(
        () => (donutRound ? getDisplaySlotCols(donutRound.boxCount) : 2),
        [donutRound]
    );

    const shelfRows = React.useMemo(() => {
        if (!donutRound) return 2;
        return Math.max(2, Math.ceil(donutRound.totalDonuts / 5));
    }, [donutRound]);

    const instructions = React.useMemo(() => ([
        {
            icon: '🍩',
            title: t('games.donut-shop.howToPlay.step1.title'),
            description: t('games.donut-shop.howToPlay.step1.description')
        },
        {
            icon: '🧺',
            title: t('games.donut-shop.howToPlay.step2.title'),
            description: t('games.donut-shop.howToPlay.step2.description')
        },
        {
            icon: '🙌',
            title: t('games.donut-shop.howToPlay.step3.title'),
            description: t('games.donut-shop.howToPlay.step3.description')
        }
    ]), [t]);

    return (
        <Layout2
            gameId={GameIds.MATH_DONUT_SHOP}
            title={t('games.donut-shop.title')}
            subtitle={t('games.donut-shop.subtitle')}
            description={t('games.donut-shop.description')}
            instructions={instructions}
            engine={engine}
            onExit={onExit}
            powerUps={powerUps}
            className="donut-shop-layout2"
        >
            <div className="donut-shop-shell">
                {isRoundReady && donutRound ? (
                    <div className="donut-shop-board">
                        <section className="donut-shop-top-panel" aria-label="donut-shelf">
                            <div className="donut-shop-top-mission-row">
                                <span className="donut-shop-chef" aria-hidden>{chefEmoji}</span>
                                <div className="donut-shop-mission-bubble" aria-live="polite">
                                    <span className="donut-shop-mission-text">
                                        {t('games.donut-shop.ui.mission', { count: donutRound.donutsPerBox })}
                                    </span>
                                </div>
                            </div>
                            <div className="donut-shop-shelf-wrap">
                                <div className="donut-shop-shelf-box">
                                    <div
                                        className="donut-shop-shelf-grid"
                                        style={{ '--shelf-rows': shelfRows } as React.CSSProperties}
                                    >
                                        {donutSlots.map((slot, idx) =>
                                            slot.assignedTo === null ? (
                                                <button
                                                    key={slot.id}
                                                    type="button"
                                                    className="donut-shop-donut-btn donut-shop-donut-btn--wave-in"
                                                    style={{ '--donut-entry-delay': `${Math.min(idx, 11) * 48}ms` } as React.CSSProperties}
                                                    onPointerDown={(event) => handleShelfDonutPointerDown(event, slot.id)}
                                                    onTouchStart={(event) => handleShelfDonutTouchStart(event, slot.id)}
                                                    disabled={isResolving}
                                                >
                                                    🍩
                                                </button>
                                            ) : (
                                                <div key={slot.id} className="donut-shop-shelf-slot-placeholder" aria-hidden="true" />
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="donut-shop-bottom-boxes" aria-label="donut-boxes">
                            {showBoxHint && (
                                <div className="donut-shop-hint-overlay" aria-hidden="true">
                                    <span className="donut-shop-hint-text">{t('games.donut-shop.ui.dragDropHint')}</span>
                                </div>
                            )}
                            <div className="donut-shop-boxes-title">
                                {`${donutRound.boxCount} boxes`}
                            </div>
                            <div
                                className={`donut-shop-box-grid donut-shop-box-grid--${boxOrientation}`}
                                style={{ '--box-cols': boxCols } as React.CSSProperties}
                            >
                                {Array.from({ length: displaySlotCount }, (_, idx) => (
                                    <div
                                        key={`box-slot-${idx}`}
                                        ref={(node) => {
                                            boxRefs.current[idx] = node;
                                        }}
                                        className={`donut-shop-box donut-shop-box--${boxOrientation} ${
                                            activeBoxIndexes.includes(idx) ? 'is-slot-active' : 'is-slot-inactive'
                                        }`}
                                        onClick={(event) => handleBoxSlotTap(idx, event)}
                                    >
                                        <div className={`donut-shop-box-donuts donut-shop-box-donuts--${boxOrientation}`}>
                                            {activeBoxIndexes.includes(idx) &&
                                                donutsByBox[activeBoxIndexes.indexOf(idx)]?.map((slot) => (
                                                    <button
                                                        key={slot.id}
                                                        type="button"
                                                        className="donut-shop-box-donut-btn"
                                                        onPointerDown={(event) => handleAssignedDonutPointerDown(event, slot.id)}
                                                        onTouchStart={(event) => handleAssignedDonutTouchStart(event, slot.id)}
                                                        disabled={isResolving}
                                                    >
                                                        🍩
                                                    </button>
                                                ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                ) : (
                    <div className="donut-shop-placeholder">ㅇㅇㅇ</div>
                )}
                {dragState && (
                    <div
                        className="donut-shop-drag-preview"
                        style={{ left: dragState.x, top: dragState.y }}
                        aria-hidden
                    >
                        🍩
                    </div>
                )}
            </div>
        </Layout2>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const manifest: GameManifest = {
    id: GameIds.MATH_DONUT_SHOP,
    title: '도넛가게',
    titleKey: 'games.donut-shop.title',
    subtitle: 'Pack Donuts Equally!',
    subtitleKey: 'games.donut-shop.subtitle',
    description: 'ㅇㅇㅇ',
    descriptionKey: 'games.donut-shop.description',
    category: 'math',
    level: 3,
    mode: 'adventure',
    component: DonutShop,
    thumbnail: '🍩',
    tagsKey: 'games.tags.multiplication'
};
