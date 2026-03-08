import React from 'react';
import { useTranslation } from 'react-i18next';
import type { GameManifest } from '../../../../types';
import { Layout2 } from '../../../../layouts/Standard/Layout2';
import { useGameEngine } from '../../../../layouts/Standard/Layout0/useGameEngine';
import { GameIds } from '../../../../../constants/gameIds';
import { primeFeedbackSoundsSilently } from '../../../../../utils/sound';
import './FairShare.css';

interface FairShareProps {
    onExit: () => void;
}

const ANIMAL_EMOJIS = ['🐶', '🐱', '🐰', '🐻', '🐼', '🐵', '🦊', '🐯', '🦁', '🐷'] as const;
const FRUIT_EMOJIS = ['🍎', '🍓', '🍊', '🍇', '🍉', '🍐', '🍑', '🥭', '🍅', '🍌'] as const;
const SCIENTIST_EMOJIS = ['💁🏻‍♀️', '💁🏼‍♀️', '💁🏽‍♀️', '💁🏾‍♀️', '💁🏿‍♀️'] as const;

type DivisionRound = {
    totalFruits: number;
    animalCount: number;
    fruitsPerAnimal: number;
    fruitEmoji: string;
    animals: string[];
};

type FruitSlot = {
    id: string;
    assignedTo: number | null;
};

type DragState = {
    fruitId: string;
    x: number;
    y: number;
    fromAssigned: boolean;
} | null;

type AnimalBodyTone = {
    base: string;
    shade: string;
};
type AnimalReaction = {
    emoji: string;
    mode: 'good' | 'sad';
};
type AssignmentMeta = {
    key: string;
    allAssigned: boolean;
    counts: number[];
    groups: FruitSlot[][];
    unassigned: FruitSlot[];
};

const FEEDBACK_DELAY_MS = 720;
const ROUND_SLIDE_OUT_MS = 340;
const ROUND_SLIDE_IN_MS = 380;
const REACTION_MS = 1150;
const GOOD_REACTIONS = ['😁', '🥰', '☺️', '💖', '❤️'] as const;
const SAD_REACTIONS = ['😰', '😱', '😡'] as const;
const POWER_UP_REWARDS: Array<'timeFreeze' | 'extraLife' | 'doubleScore'> = ['timeFreeze', 'extraLife', 'doubleScore'];

const shuffle = <T,>(items: readonly T[]): T[] => {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

const pickRandom = <T,>(items: readonly T[]): T =>
    items[Math.floor(Math.random() * items.length)];

const buildAssignmentMeta = (slots: FruitSlot[], animalCount: number): AssignmentMeta => {
    const counts = Array.from({ length: animalCount }, () => 0);
    const groups = Array.from({ length: animalCount }, () => [] as FruitSlot[]);
    const unassigned: FruitSlot[] = [];
    let allAssigned = true;

    for (let i = 0; i < slots.length; i += 1) {
        const slot = slots[i];
        const { assignedTo } = slot;
        if (assignedTo === null) {
            allAssigned = false;
            unassigned.push(slot);
            continue;
        }
        counts[assignedTo] += 1;
        groups[assignedTo].push(slot);
    }

    const key = slots.map((slot) => (slot.assignedTo === null ? 'x' : String(slot.assignedTo))).join(',');
    return { key, allAssigned, counts, groups, unassigned };
};

const createDivisionRound = (): DivisionRound => {
    const animalCount = Math.floor(Math.random() * 4) + 2; // 2..5
    const maxPerAnimal = Math.max(1, Math.floor(10 / animalCount));
    const fruitsPerAnimal = Math.floor(Math.random() * maxPerAnimal) + 1;
    const totalFruits = animalCount * fruitsPerAnimal;
    const fruitEmoji = FRUIT_EMOJIS[Math.floor(Math.random() * FRUIT_EMOJIS.length)];
    const animals = shuffle(ANIMAL_EMOJIS).slice(0, animalCount);
    return { totalFruits, animalCount, fruitsPerAnimal, fruitEmoji, animals: [...animals] };
};

const getDivisionSignature = (round: DivisionRound): string =>
    `${round.totalFruits}-${round.animalCount}-${round.fruitsPerAnimal}-${round.fruitEmoji}-${round.animals.join('')}`;

const getAnimalBodyTone = (animal: string): AnimalBodyTone => {
    switch (animal) {
        case '🐶':
            return { base: '#e8c59b', shade: '#c99969' };
        case '🐱':
            return { base: '#f6d59b', shade: '#e1ad67' };
        case '🐰':
            return { base: '#f7eff6', shade: '#e2d3df' };
        case '🐻':
            return { base: '#d6b08a', shade: '#b48358' };
        case '🐼':
            return { base: '#ececec', shade: '#cccccc' };
        case '🐵':
            return { base: '#e7be98', shade: '#c78f68' };
        case '🦊':
            return { base: '#f7c08a', shade: '#e08a4f' };
        case '🐯':
            return { base: '#ffc67d', shade: '#e39a4f' };
        case '🦁':
            return { base: '#f2c77f', shade: '#d89d52' };
        case '🐷':
            return { base: '#f7c2cc', shade: '#de96a3' };
        default:
            return { base: '#f8efdf', shade: '#eadac2' };
    }
};

export const FairShare: React.FC<FairShareProps> = ({ onExit }) => {
    const { t } = useTranslation();
    const engine = useGameEngine({ initialLives: 3, initialTime: 90, maxDifficulty: 1 });

    const [divisionRound, setDivisionRound] = React.useState<DivisionRound | null>(null);
    const [fruitSlots, setFruitSlots] = React.useState<FruitSlot[]>([]);
    const [dragState, setDragState] = React.useState<DragState>(null);
    const [showDragHintOverlay, setShowDragHintOverlay] = React.useState(false);
    const [isDragHintExiting, setIsDragHintExiting] = React.useState(false);
    const [isRoundReady, setIsRoundReady] = React.useState(false);
    const [isResolving, setIsResolving] = React.useState(false);
    const [roundSlideState, setRoundSlideState] = React.useState<'idle' | 'out' | 'in'>('idle');
    const [animalReactions, setAnimalReactions] = React.useState<Array<AnimalReaction | null>>([]);

    const prevGameStateRef = React.useRef(engine.gameState);
    const prevDivisionSignatureRef = React.useRef<string | null>(null);
    const draggingFruitIdRef = React.useRef<string | null>(null);
    const activePointerIdRef = React.useRef<number | null>(null);
    const activeTouchIdRef = React.useRef<number | null>(null);
    const animalBoxRefs = React.useRef<Array<HTMLDivElement | null>>([]);
    const hasShownDragHintRef = React.useRef(false);
    const dragHintTimerRef = React.useRef<number | null>(null);
    const dragHintExitTimerRef = React.useRef<number | null>(null);
    const resolveTimerRef = React.useRef<number | null>(null);
    const slideOutTimerRef = React.useRef<number | null>(null);
    const slideInTimerRef = React.useRef<number | null>(null);
    const reactionTimersRef = React.useRef<number[]>([]);
    const lastJudgedAssignmentKeyRef = React.useRef<string | null>(null);
    const overfillPenaltyAssignmentKeyRef = React.useRef<string | null>(null);
    const gestureEventAssignmentKeyRef = React.useRef<string | null>(null);
    const audioPrimedRef = React.useRef(false);

    const scientistEmoji = React.useMemo(
        () => SCIENTIST_EMOJIS[Math.floor(Math.random() * SCIENTIST_EMOJIS.length)],
        []
    );

    const isDragging = dragState !== null;

    const clearResolveTimer = React.useCallback(() => {
        if (resolveTimerRef.current !== null) {
            window.clearTimeout(resolveTimerRef.current);
            resolveTimerRef.current = null;
        }
        if (slideOutTimerRef.current !== null) {
            window.clearTimeout(slideOutTimerRef.current);
            slideOutTimerRef.current = null;
        }
        if (slideInTimerRef.current !== null) {
            window.clearTimeout(slideInTimerRef.current);
            slideInTimerRef.current = null;
        }
    }, []);

    const clearReactionTimers = React.useCallback(() => {
        reactionTimersRef.current.forEach((timer) => window.clearTimeout(timer));
        reactionTimersRef.current = [];
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

    const primeAudioOnce = React.useCallback(() => {
        if (audioPrimedRef.current) return;
        audioPrimedRef.current = true;
        // Prime actual correct/wrong feedback channels silently at first gesture.
        primeFeedbackSoundsSilently();
    }, []);

    const hideDragHintOverlay = React.useCallback((withExit: boolean) => {
        if (!showDragHintOverlay) return;
        clearDragHintTimers();
        if (withExit) {
            setIsDragHintExiting(true);
            dragHintExitTimerRef.current = window.setTimeout(() => {
                setShowDragHintOverlay(false);
                setIsDragHintExiting(false);
                dragHintExitTimerRef.current = null;
            }, 220);
            return;
        }
        setShowDragHintOverlay(false);
        setIsDragHintExiting(false);
    }, [clearDragHintTimers, showDragHintOverlay]);

    const prepareRound = React.useCallback(() => {
        let nextDivision = createDivisionRound();
        let nextDivisionSignature = getDivisionSignature(nextDivision);
        let attempts = 0;

        while (
            prevDivisionSignatureRef.current &&
            nextDivisionSignature === prevDivisionSignatureRef.current &&
            attempts < 8
        ) {
            nextDivision = createDivisionRound();
            nextDivisionSignature = getDivisionSignature(nextDivision);
            attempts += 1;
        }

        prevDivisionSignatureRef.current = nextDivisionSignature;
        clearReactionTimers();
        setDivisionRound(nextDivision);
        setFruitSlots(
            Array.from({ length: nextDivision.totalFruits }, (_, i) => ({
                id: `fruit-${Date.now()}-${i}`,
                assignedTo: null
            }))
        );
        animalBoxRefs.current = Array.from({ length: nextDivision.animalCount }, () => null);
        setAnimalReactions(Array.from({ length: nextDivision.animalCount }, () => null));
        setIsResolving(false);
        setIsRoundReady(true);
        lastJudgedAssignmentKeyRef.current = null;
        overfillPenaltyAssignmentKeyRef.current = null;
        gestureEventAssignmentKeyRef.current = null;
    }, [clearReactionTimers]);

    React.useEffect(() => {
        const prev = prevGameStateRef.current;
        if (engine.gameState === 'playing' && (prev === 'idle' || prev === 'gameover')) {
            setIsRoundReady(false);
            setRoundSlideState('idle');
            prepareRound();

            const isFirstQuestion =
                engine.score === 0 &&
                engine.stats.correct === 0 &&
                engine.stats.wrong === 0;

            if (isFirstQuestion && !hasShownDragHintRef.current) {
                hasShownDragHintRef.current = true;
                clearDragHintTimers();
                setShowDragHintOverlay(true);
                setIsDragHintExiting(false);
                dragHintTimerRef.current = window.setTimeout(() => {
                    setIsDragHintExiting(true);
                    dragHintExitTimerRef.current = window.setTimeout(() => {
                        setShowDragHintOverlay(false);
                        setIsDragHintExiting(false);
                        dragHintExitTimerRef.current = null;
                    }, 220);
                    dragHintTimerRef.current = null;
                }, 1800);
            } else {
                hideDragHintOverlay(false);
            }
        }

        if (engine.gameState === 'idle' || engine.gameState === 'gameover') {
            setIsRoundReady(false);
            setIsResolving(false);
            setRoundSlideState('idle');
            clearReactionTimers();
            setAnimalReactions([]);
            lastJudgedAssignmentKeyRef.current = null;
            overfillPenaltyAssignmentKeyRef.current = null;
            gestureEventAssignmentKeyRef.current = null;
        }

        prevGameStateRef.current = engine.gameState;
    }, [
        clearDragHintTimers,
        clearReactionTimers,
        engine.gameState,
        engine.score,
        engine.stats.correct,
        engine.stats.wrong,
        hideDragHintOverlay,
        prepareRound
    ]);

    React.useEffect(() => {
        if (engine.gameState !== 'gameover') return;
        hideDragHintOverlay(false);
        hasShownDragHintRef.current = false;
    }, [engine.gameState, hideDragHintOverlay]);

    const showGoodReaction = React.useCallback((animalIndex: number) => {
        setAnimalReactions((prev) =>
            prev.map((reaction, idx) =>
                idx === animalIndex
                    ? {
                        emoji: pickRandom(GOOD_REACTIONS),
                        mode: 'good'
                    }
                    : reaction
            )
        );
        const timer = window.setTimeout(() => {
            setAnimalReactions((prev) => prev.map((reaction, idx) => (idx === animalIndex ? null : reaction)));
        }, REACTION_MS);
        reactionTimersRef.current.push(timer);
    }, []);

    const showSadReactionsForOthers = React.useCallback((skipAnimalIndex: number, animalCount: number) => {
        setAnimalReactions(
            Array.from({ length: animalCount }, (_, idx) => {
                if (idx === skipAnimalIndex) return null;
                return {
                    emoji: pickRandom(SAD_REACTIONS),
                    mode: 'sad'
                };
            })
        );
        const timer = window.setTimeout(() => {
            setAnimalReactions((prev) => prev.map(() => null));
        }, REACTION_MS);
        reactionTimersRef.current.push(timer);
    }, []);

    React.useEffect(() => {
        if (!isDragging) return;

        const handlePointerMove = (event: PointerEvent) => {
            if (activePointerIdRef.current !== null && event.pointerId !== activePointerIdRef.current) return;
            setDragState((prev) => (prev ? { ...prev, x: event.clientX, y: event.clientY } : prev));
        };

        const handlePointerUp = (event: PointerEvent) => {
            if (activePointerIdRef.current !== null && event.pointerId !== activePointerIdRef.current) return;
            const draggingFruitId = draggingFruitIdRef.current;
            if (!draggingFruitId || !divisionRound) {
                setDragState(null);
                draggingFruitIdRef.current = null;
                activePointerIdRef.current = null;
                activeTouchIdRef.current = null;
                return;
            }

            let hitAnimalIndex: number | null = null;
            for (let i = 0; i < divisionRound.animalCount; i += 1) {
                const node = animalBoxRefs.current[i];
                if (!node) continue;
                const rect = node.getBoundingClientRect();
                const inside =
                    event.clientX >= rect.left &&
                    event.clientX <= rect.right &&
                    event.clientY >= rect.top &&
                    event.clientY <= rect.bottom;
                if (inside) {
                    hitAnimalIndex = i;
                    break;
                }
            }

            if (hitAnimalIndex !== null) {
                const nextSlots = fruitSlots.map((slot) =>
                    slot.id === draggingFruitId ? { ...slot, assignedTo: hitAnimalIndex } : slot
                );
                const nextAssignmentMeta = buildAssignmentMeta(nextSlots, divisionRound.animalCount);
                setFruitSlots(nextSlots);
                if (nextAssignmentMeta.counts[hitAnimalIndex] > divisionRound.fruitsPerAnimal) {
                    overfillPenaltyAssignmentKeyRef.current = nextAssignmentMeta.key;
                    gestureEventAssignmentKeyRef.current = nextAssignmentMeta.key;
                    setAnimalReactions((prev) => prev.map((reaction, idx) => (idx === hitAnimalIndex ? null : reaction)));
                    showSadReactionsForOthers(hitAnimalIndex, divisionRound.animalCount);
                    // Penalize immediately when a basket exceeds the allowed count.
                    engine.submitAnswer(false, { skipFeedback: true });
                    engine.registerEvent({ type: 'wrong' });
                } else {
                    showGoodReaction(hitAnimalIndex);
                    if (nextAssignmentMeta.allAssigned) {
                        const isCorrectNow = nextAssignmentMeta.counts.every(
                            (count) => count === divisionRound.fruitsPerAnimal
                        );
                        gestureEventAssignmentKeyRef.current = nextAssignmentMeta.key;
                        engine.registerEvent(isCorrectNow ? { type: 'correct' } : { type: 'wrong' });
                    }
                }
            } else if (dragState?.fromAssigned) {
                // Dropped outside any basket: return fruit to source area
                setFruitSlots((prev) =>
                    prev.map((slot) =>
                        slot.id === draggingFruitId ? { ...slot, assignedTo: null } : slot
                    )
                );
            }

            setDragState(null);
            draggingFruitIdRef.current = null;
            activePointerIdRef.current = null;
            activeTouchIdRef.current = null;
        };

        const handlePointerCancel = (event: PointerEvent) => {
            if (activePointerIdRef.current !== null && event.pointerId !== activePointerIdRef.current) return;
            setDragState(null);
            draggingFruitIdRef.current = null;
            activePointerIdRef.current = null;
            activeTouchIdRef.current = null;
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
            handlePointerUp({
                pointerId: activePointerIdRef.current ?? -1,
                clientX: touch.clientX,
                clientY: touch.clientY
            } as PointerEvent);
        };

        const handleTouchCancel = (event: TouchEvent) => {
            const touch = getActiveTouch(event.changedTouches);
            if (!touch) return;
            setDragState(null);
            draggingFruitIdRef.current = null;
            activePointerIdRef.current = null;
            activeTouchIdRef.current = null;
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
    }, [
        divisionRound,
        dragState?.fromAssigned,
        fruitSlots,
        isDragging,
        showGoodReaction,
        showSadReactionsForOthers
    ]);

    React.useEffect(() => () => {
        clearDragHintTimers();
        clearResolveTimer();
        clearReactionTimers();
    }, [clearDragHintTimers, clearResolveTimer, clearReactionTimers]);

    const handleFruitPointerDown = React.useCallback((event: React.PointerEvent<HTMLButtonElement>, fruitId: string) => {
        if (engine.gameState !== 'playing' || isResolving) return;
        primeAudioOnce();
        event.preventDefault();
        if (event.pointerType === 'touch') {
            event.currentTarget.setPointerCapture?.(event.pointerId);
        }
        hideDragHintOverlay(true);
        draggingFruitIdRef.current = fruitId;
        activePointerIdRef.current = event.pointerId;
        activeTouchIdRef.current = null;
        setDragState({ fruitId, x: event.clientX, y: event.clientY, fromAssigned: false });
    }, [engine.gameState, hideDragHintOverlay, isResolving, primeAudioOnce]);

    const handleFruitTouchStart = React.useCallback((event: React.TouchEvent<HTMLButtonElement>, fruitId: string) => {
        if (engine.gameState !== 'playing' || isResolving) return;
        const touch = event.changedTouches[0];
        if (!touch) return;
        primeAudioOnce();
        event.preventDefault();
        hideDragHintOverlay(true);
        draggingFruitIdRef.current = fruitId;
        activePointerIdRef.current = -1;
        activeTouchIdRef.current = touch.identifier;
        setDragState({ fruitId, x: touch.clientX, y: touch.clientY, fromAssigned: false });
    }, [engine.gameState, hideDragHintOverlay, isResolving, primeAudioOnce]);

    const handleAssignedFruitPointerDown = React.useCallback(
        (event: React.PointerEvent<HTMLButtonElement>, fruitId: string) => {
            if (engine.gameState !== 'playing' || isResolving) return;
            primeAudioOnce();
            event.preventDefault();
            if (event.pointerType === 'touch') {
                event.currentTarget.setPointerCapture?.(event.pointerId);
            }
            hideDragHintOverlay(true);
            draggingFruitIdRef.current = fruitId;
            activePointerIdRef.current = event.pointerId;
            activeTouchIdRef.current = null;
            setDragState({ fruitId, x: event.clientX, y: event.clientY, fromAssigned: true });
        },
        [engine.gameState, hideDragHintOverlay, isResolving, primeAudioOnce]
    );

    const handleAssignedFruitTouchStart = React.useCallback(
        (event: React.TouchEvent<HTMLButtonElement>, fruitId: string) => {
            if (engine.gameState !== 'playing' || isResolving) return;
            const touch = event.changedTouches[0];
            if (!touch) return;
            primeAudioOnce();
            event.preventDefault();
            hideDragHintOverlay(true);
            draggingFruitIdRef.current = fruitId;
            activePointerIdRef.current = -1;
            activeTouchIdRef.current = touch.identifier;
            setDragState({ fruitId, x: touch.clientX, y: touch.clientY, fromAssigned: true });
        },
        [engine.gameState, hideDragHintOverlay, isResolving, primeAudioOnce]
    );

    const missionText = React.useMemo(() => {
        if (!divisionRound) return '';
        return t('games.fair-share.ui.mission', { count: divisionRound.animalCount });
    }, [divisionRound, t]);

    const assignmentMeta = React.useMemo(
        () => (divisionRound ? buildAssignmentMeta(fruitSlots, divisionRound.animalCount) : null),
        [divisionRound, fruitSlots]
    );

    const remainingFruits = assignmentMeta?.unassigned ?? [];
    const fruitsByAnimal = assignmentMeta?.groups ?? [];
    const assignmentKey = assignmentMeta?.key ?? '';

    React.useEffect(() => {
        if (!divisionRound) return;
        if (!assignmentMeta) return;
        if (engine.gameState !== 'playing') return;
        if (isResolving) return;
        if (fruitSlots.length === 0) return;

        if (!assignmentMeta.allAssigned) {
            lastJudgedAssignmentKeyRef.current = null;
            return;
        }
        if (lastJudgedAssignmentKeyRef.current === assignmentKey) return;
        lastJudgedAssignmentKeyRef.current = assignmentKey;

        const isCorrect = assignmentMeta.counts.every((count) => count === divisionRound.fruitsPerAnimal);
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
            // Keep the same round active on wrong answers while still losing one life.
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
                setRoundSlideState('out');
                slideOutTimerRef.current = window.setTimeout(() => {
                    if (engine.gameState !== 'playing') return;
                    prepareRound();
                    setIsResolving(true);
                    setRoundSlideState('in');
                    slideInTimerRef.current = window.setTimeout(() => {
                        if (engine.gameState !== 'playing') return;
                        setRoundSlideState('idle');
                        setIsResolving(false);
                    }, ROUND_SLIDE_IN_MS);
                }, ROUND_SLIDE_OUT_MS);
                return;
            }
            setIsResolving(false);
        }, FEEDBACK_DELAY_MS);
    }, [
        assignmentMeta,
        assignmentKey,
        clearResolveTimer,
        divisionRound,
        engine,
        fruitSlots,
        isResolving,
        prepareRound
    ]);

    const powerUps = React.useMemo(() => ([
        {
            count: engine.powerUps.timeFreeze,
            color: 'blue' as const,
            icon: '❄️',
            title: t('games.fair-share.powerups.timeFreeze'),
            onClick: () => engine.activatePowerUp('timeFreeze'),
            disabledConfig: engine.isTimeFrozen,
            status: engine.isTimeFrozen ? 'active' as const : 'normal' as const
        },
        {
            count: engine.powerUps.extraLife,
            color: 'red' as const,
            icon: '❤️',
            title: t('games.fair-share.powerups.extraLife'),
            onClick: () => engine.activatePowerUp('extraLife'),
            disabledConfig: engine.lives >= 3,
            status: engine.lives >= 3 ? 'maxed' as const : 'normal' as const
        },
        {
            count: engine.powerUps.doubleScore,
            color: 'yellow' as const,
            icon: '⚡',
            title: t('games.fair-share.powerups.doubleScore'),
            onClick: () => engine.activatePowerUp('doubleScore'),
            disabledConfig: engine.isDoubleScore,
            status: engine.isDoubleScore ? 'active' as const : 'normal' as const
        }
    ]), [engine, t]);

    const instructions = React.useMemo(() => ([
        {
            icon: '👫',
            title: t('games.fair-share.howToPlay.step1.title'),
            description: t('games.fair-share.howToPlay.step1.description')
        },
        {
            icon: '🍎',
            title: t('games.fair-share.howToPlay.step2.title'),
            description: t('games.fair-share.howToPlay.step2.description')
        },
        {
            icon: '⚖️',
            title: t('games.fair-share.howToPlay.step3.title'),
            description: t('games.fair-share.howToPlay.step3.description')
        }
    ]), [t]);

    return (
        <Layout2
            gameId={GameIds.MATH_FAIR_SHARE}
            title={t('games.fair-share.title')}
            subtitle={t('games.fair-share.subtitle')}
            description={t('games.fair-share.description')}
            instructions={instructions}
            engine={engine}
            onExit={onExit}
            powerUps={powerUps}
            className="cell-clone-layout2 fair-share-layout2"
            cardBackground={<div className="cell-clone-card-bg" />}
        >
            <div className="cell-clone-shell">
                <div className="fair-share-main">
                    {isRoundReady && divisionRound && (
                        <div
                            className={`fair-share-animal-grid ${roundSlideState === 'out' ? 'is-slide-out' : ''} ${roundSlideState === 'in' ? 'is-slide-in' : ''}`}
                            style={{ '--animal-cols': divisionRound.animalCount } as React.CSSProperties}
                        >
                            {divisionRound.animals.map((animal, idx) => {
                                const tone = getAnimalBodyTone(animal);
                                return (
                                    <div key={`animal-${idx}`} className="fair-share-animal-card">
                                        <div
                                            className="fair-share-animal"
                                            style={
                                                {
                                                    '--animal-float-duration': `${2.4 + (idx % 3) * 0.35}s`,
                                                    '--animal-float-delay': `${(idx % 4) * 0.12}s`
                                                } as React.CSSProperties
                                            }
                                        >
                                            {animal}
                                        </div>
                                        {animalReactions[idx] && (
                                            <span
                                                className={`fair-share-reaction ${animalReactions[idx]?.mode === 'sad' ? 'is-sad' : 'is-good'}`}
                                                aria-hidden
                                            >
                                                {animalReactions[idx]?.emoji}
                                            </span>
                                        )}
                                        <span
                                            className="fair-share-animal-body"
                                            style={
                                                {
                                                    '--animal-body-base': tone.base,
                                                    '--animal-body-shade': tone.shade
                                                } as React.CSSProperties
                                            }
                                            aria-hidden
                                        />
                                        <div
                                            ref={(node) => {
                                                animalBoxRefs.current[idx] = node;
                                            }}
                                            className="fair-share-drop-box"
                                            aria-label={`animal-box-${idx + 1}`}
                                        >
                                            {fruitsByAnimal[idx].map((slot) => (
                                                <button
                                                    key={slot.id}
                                                    type="button"
                                                    className="fair-share-box-fruit"
                                                    onPointerDown={(event) => handleAssignedFruitPointerDown(event, slot.id)}
                                                    onTouchStart={(event) => handleAssignedFruitTouchStart(event, slot.id)}
                                                    disabled={isResolving}
                                                >
                                                    {divisionRound.fruitEmoji}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="cell-clone-reagents-tray">
                    <div className="fair-share-mission-row">
                        <span className="cell-clone-scientist" aria-hidden>
                            {scientistEmoji}
                        </span>
                        <div className="fair-share-mission-bubble" aria-live="polite">
                            <span className="fair-share-mission-text">{missionText}</span>
                        </div>
                    </div>

                    <div className="fair-share-fruit-box">
                        {showDragHintOverlay && (
                            <div className={`cell-clone-drag-hint-overlay ${isDragHintExiting ? 'is-exiting' : ''}`} aria-hidden="true">
                                <span className="cell-clone-drag-hint-text">{t('games.fair-share.ui.dragDropHint')}</span>
                            </div>
                        )}
                        <div className="fair-share-fruit-source" aria-label="fruit-options">
                            {remainingFruits.map((slot) => (
                                <button
                                    key={slot.id}
                                    type="button"
                                    className={`fair-share-fruit-btn ${isResolving ? 'is-disabled' : ''}`}
                                    onPointerDown={(event) => handleFruitPointerDown(event, slot.id)}
                                    onTouchStart={(event) => handleFruitTouchStart(event, slot.id)}
                                    disabled={isResolving}
                                >
                                    <span aria-hidden>{divisionRound?.fruitEmoji ?? '🍎'}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {dragState && divisionRound && (
                    <div
                        className="fair-share-drag-preview"
                        style={{ left: dragState.x, top: dragState.y }}
                        aria-hidden
                    >
                        {divisionRound.fruitEmoji}
                    </div>
                )}
            </div>
        </Layout2>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const manifest: GameManifest = {
    id: GameIds.MATH_FAIR_SHARE,
    title: '똑같이 나눠 줄게',
    titleKey: 'games.fair-share.title',
    subtitle: '같은 수로 나눠요!',
    subtitleKey: 'games.fair-share.subtitle',
    description: '2단과 4단을 연습하는 게임입니다.',
    descriptionKey: 'games.fair-share.description',
    category: 'math',
    level: 3,
    mode: 'adventure',
    component: FairShare,
    thumbnail: '🧺',
    tagsKey: 'games.tags.multiplication'
};
