import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout3 } from '../../../../layouts/Standard/Layout3';
import { useGameEngine } from '../../../../layouts/Standard/Layout0/useGameEngine';
import { BlobBackground } from '../../../components/BlobBackground';
import type { GameManifest } from '../../../../types';
import { GameIds } from '../../../../../constants/gameIds';
import { useNurturing } from '../../../../../contexts/NurturingContext';
import { createCharacter } from '../../../../../data/characters';
import { JelloAvatar } from '../../../../../components/characters/JelloAvatar';
import { playEatingSound } from '../../../../../utils/sound';
import manifestEn from './locales/en';
import manifestKo from './locales/ko';
import manifestJa from './locales/ja';
import './JelloFeeding.css';

interface JelloFeedingProps {
    onExit: () => void;
}

interface SubtractionProblem {
    total: number;
    minus: number;
}

interface FruitItem {
    id: number;
    fed: boolean;
}

interface FeedReaction {
    id: number;
    x: number;
    y: number;
    emoji: string;
}

const FOOD_EMOJIS = [
    '🍈', '🍉', '🍊', '🍋', '🍌', '🍍', '🥭', '🍎', '🍏', '🍐', '🍑', '🍓', '🥝', '🍅',
    '🥑', '🍆', '🥔', '🥕', '🌽', '🌶️', '🫑', '🥒', '🥬', '🥦', '🧅', '🌰', '🍄‍🟫',
    '🥐', '🥞', '🧀', '🍖', '🍗', '🍔', '🍕', '🌭', '🥪'
] as const;

const FOOD_BG_COLORS: Record<(typeof FOOD_EMOJIS)[number], string> = {
    '🍈': 'rgba(180, 230, 170, 0.15)',
    '🍉': 'rgba(245, 170, 180, 0.15)',
    '🍊': 'rgba(255, 199, 130, 0.15)',
    '🍋': 'rgba(255, 241, 158, 0.15)',
    '🍌': 'rgba(255, 236, 156, 0.15)',
    '🍍': 'rgba(255, 221, 138, 0.15)',
    '🥭': 'rgba(255, 194, 136, 0.15)',
    '🍎': 'rgba(247, 166, 166, 0.15)',
    '🍏': 'rgba(196, 233, 180, 0.15)',
    '🍐': 'rgba(213, 236, 173, 0.15)',
    '🍑': 'rgba(255, 198, 174, 0.15)',
    '🍓': 'rgba(248, 169, 178, 0.15)',
    '🥝': 'rgba(208, 232, 173, 0.15)',
    '🍅': 'rgba(246, 175, 165, 0.15)',
    '🥑': 'rgba(202, 230, 170, 0.15)',
    '🍆': 'rgba(210, 184, 234, 0.15)',
    '🥔': 'rgba(224, 203, 168, 0.15)',
    '🥕': 'rgba(255, 203, 143, 0.15)',
    '🌽': 'rgba(255, 230, 152, 0.15)',
    '🌶️': 'rgba(246, 169, 158, 0.15)',
    '🫑': 'rgba(186, 231, 169, 0.15)',
    '🥒': 'rgba(188, 233, 175, 0.15)',
    '🥬': 'rgba(191, 234, 170, 0.15)',
    '🥦': 'rgba(178, 220, 167, 0.15)',
    '🧅': 'rgba(228, 204, 214, 0.15)',
    '🌰': 'rgba(215, 192, 166, 0.15)',
    '🍄‍🟫': 'rgba(214, 190, 166, 0.15)',
    '🥐': 'rgba(240, 206, 164, 0.15)',
    '🥞': 'rgba(236, 200, 157, 0.15)',
    '🧀': 'rgba(255, 227, 154, 0.15)',
    '🍖': 'rgba(235, 188, 180, 0.15)',
    '🍗': 'rgba(242, 201, 163, 0.15)',
    '🍔': 'rgba(238, 198, 154, 0.15)',
    '🍕': 'rgba(246, 196, 152, 0.15)',
    '🌭': 'rgba(243, 196, 157, 0.15)',
    '🥪': 'rgba(235, 205, 164, 0.15)'
};

const createProblem = (): SubtractionProblem => {
    // 10 이내 뺄셈 개념 학습용
    const total = Math.floor(Math.random() * 8) + 3; // 3..10
    const minus = Math.floor(Math.random() * (total - 1)) + 1; // 1..total-1
    return { total, minus };
};

const makeFruits = (count: number): FruitItem[] => Array.from({ length: count }, (_, i) => ({ id: i, fed: false }));
const pickRandomFoodEmoji = () => FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)];

export const JelloFeeding: React.FC<JelloFeedingProps> = ({ onExit }) => {
    const { t, i18n } = useTranslation();
    const nurturing = useNurturing();
    const [resourcesReady, setResourcesReady] = useState(() =>
        i18n.exists('games.jello-feeding.title', { lng: i18n.language })
    );

    const engine = useGameEngine({
        initialLives: 3,
        initialTime: 90,
        maxDifficulty: 2
    });

    const [problem, setProblem] = useState<SubtractionProblem>(() => createProblem());
    const [fruits, setFruits] = useState<FruitItem[]>(() => makeFruits(problem.total));
    const [foodEmoji, setFoodEmoji] = useState<string>(() => pickRandomFoodEmoji());

    const [draggingFruitId, setDraggingFruitId] = useState<number | null>(null);
    const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
    const [jelloPos, setJelloPos] = useState({ x: 62, y: 45 });
    const [isJelloEating, setIsJelloEating] = useState(false);
    const [showFoodHintOverlay, setShowFoodHintOverlay] = useState(false);
    const [feedReactions, setFeedReactions] = useState<FeedReaction[]>([]);

    const jelloTargetRef = useRef<HTMLDivElement>(null);
    const dragLayerRef = useRef<HTMLDivElement>(null);
    const draggingRef = useRef(false);
    const draggingFruitIdRef = useRef<number | null>(null);
    const dragPosRef = useRef({ x: 0, y: 0 });
    const eatingTimerRef = useRef<number | null>(null);
    const foodHintTimerRef = useRef<number | null>(null);
    const reactionTimersRef = useRef<number[]>([]);
    const fedCountRef = useRef(0);
    const targetMinusRef = useRef(problem.minus);
    const jelloPosRef = useRef(jelloPos);
    const prevGameStateRef = useRef(engine.gameState);

    useEffect(() => {
        if (!i18n.exists('games.jello-feeding.title', { lng: 'en' })) {
            i18n.addResourceBundle('en', 'translation', { games: { 'jello-feeding': manifestEn } }, true, true);
        }
        if (!i18n.exists('games.jello-feeding.title', { lng: 'ko' })) {
            i18n.addResourceBundle('ko', 'translation', { games: { 'jello-feeding': manifestKo } }, true, true);
        }
        if (!i18n.exists('games.jello-feeding.title', { lng: 'ja' })) {
            i18n.addResourceBundle('ja', 'translation', { games: { 'jello-feeding': manifestJa } }, true, true);
        }
        setResourcesReady(true);
    }, [i18n]);

    if (!resourcesReady) return null;

    useEffect(() => {
        const prev = prevGameStateRef.current;

        // Only initialize a fresh round when entering play from start/end states.
        // Do not regenerate on correct/wrong -> playing transition because each flow
        // already controls whether to keep or advance the current problem.
        if (
            engine.gameState === 'playing' &&
            (prev === 'idle' || prev === 'gameover')
        ) {
            const next = createProblem();
            setProblem(next);
            setFruits(makeFruits(next.total));
            setFoodEmoji(pickRandomFoodEmoji());
            setDraggingFruitId(null);
            setShowFoodHintOverlay(true);
            if (foodHintTimerRef.current !== null) {
                window.clearTimeout(foodHintTimerRef.current);
            }
            foodHintTimerRef.current = window.setTimeout(() => {
                setShowFoodHintOverlay(false);
                foodHintTimerRef.current = null;
            }, 1800);
        }

        prevGameStateRef.current = engine.gameState;
    }, [engine.gameState]);

    useEffect(() => {
        draggingFruitIdRef.current = draggingFruitId;
    }, [draggingFruitId]);

    useEffect(() => {
        const handleDragMove = (clientX: number, clientY: number) => {
            if (!draggingRef.current || draggingFruitIdRef.current == null) return;
            dragPosRef.current = { x: clientX, y: clientY };
            const dragLayerRect = dragLayerRef.current?.getBoundingClientRect();
            if (dragLayerRect) {
                setDragPos({
                    x: clientX - dragLayerRect.left,
                    y: clientY - dragLayerRect.top
                });
            } else {
                setDragPos({ x: clientX, y: clientY });
            }
        };

        const handleDragEnd = (clientX?: number, clientY?: number) => {
            const activeId = draggingFruitIdRef.current;
            if (!draggingRef.current || activeId == null) return;
            draggingRef.current = false;

            const dropZone = jelloTargetRef.current;
            let dropped = false;
            if (dropZone) {
                const rect = dropZone.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                // Some Android browsers report touch-end coordinates with small drift.
                // Keep circular hit-test, but add a small tolerance.
                const radius = Math.min(rect.width, rect.height) / 2 + 14;
                // Use a small sample cluster around the final drag point to absorb
                // device-specific touch coordinate drift (observed on some Androids).
                // Use tracked drag position as the primary source.
                // On some newer Android devices, touchend/pointerup coordinates can drift.
                const baseX = dragPosRef.current.x;
                const baseY = dragPosRef.current.y;
                const samplePoints: Array<{ x: number; y: number }> = [
                    { x: baseX, y: baseY },
                    { x: baseX - 12, y: baseY - 12 },
                    { x: baseX + 12, y: baseY - 12 },
                    { x: baseX - 12, y: baseY + 12 },
                    { x: baseX + 12, y: baseY + 12 }
                ];

                // Keep event-end coordinates only as secondary fallback samples.
                if (Number.isFinite(clientX) && Number.isFinite(clientY)) {
                    samplePoints.push(
                        { x: clientX as number, y: clientY as number },
                        { x: (clientX as number) - 10, y: (clientY as number) - 10 },
                        { x: (clientX as number) + 10, y: (clientY as number) + 10 }
                    );
                }

                dropped = samplePoints.some(({ x, y }) => {
                    const dx = x - cx;
                    const dy = y - cy;
                    return (dx * dx + dy * dy) <= (radius * radius);
                });

                // Fallback: trust actual DOM hit at sampled points (robust on mobile WebView).
                if (!dropped && typeof document !== 'undefined') {
                    dropped = samplePoints.some(({ x, y }) => {
                        const hit = document.elementFromPoint(x, y);
                        return !!(hit && (hit === dropZone || dropZone.contains(hit)));
                    });
                }
            }

            if (dropped) {
                const nextFedCount = fedCountRef.current + 1;
                setFruits((prev) => prev.map((fruit) => (
                    fruit.id === activeId && !fruit.fed ? { ...fruit, fed: true } : fruit
                )));
                playEatingSound();
                setIsJelloEating(true);
                spawnFeedReaction(nextFedCount > targetMinusRef.current ? '💔' : '❤️');
                if (eatingTimerRef.current !== null) {
                    window.clearTimeout(eatingTimerRef.current);
                }
                eatingTimerRef.current = window.setTimeout(() => {
                    setIsJelloEating(false);
                    eatingTimerRef.current = null;
                }, 420);
            }

            draggingFruitIdRef.current = null;
            dragPosRef.current = { x: 0, y: 0 };
            setDraggingFruitId(null);
        };

        const onPointerMove = (event: PointerEvent) => {
            handleDragMove(event.clientX, event.clientY);
        };

        const onPointerUp = (event: PointerEvent) => {
            handleDragEnd(event.clientX, event.clientY);
        };

        const onMouseMove = (event: MouseEvent) => {
            handleDragMove(event.clientX, event.clientY);
        };

        const onMouseUp = (event: MouseEvent) => {
            handleDragEnd(event.clientX, event.clientY);
        };

        const onTouchMove = (event: TouchEvent) => {
            if (!draggingRef.current || draggingFruitIdRef.current == null) return;
            const touch = event.touches[0];
            if (!touch) return;
            event.preventDefault();
            handleDragMove(touch.clientX, touch.clientY);
        };

        const onTouchEnd = (event: TouchEvent) => {
            const touch = event.changedTouches[0];
            if (!touch) {
                draggingRef.current = false;
                draggingFruitIdRef.current = null;
                setDraggingFruitId(null);
                return;
            }
            // Prefer last tracked drag position for reliability on Android.
            handleDragEnd();
        };

        window.addEventListener('pointermove', onPointerMove, { passive: true });
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('pointercancel', onPointerUp);
        window.addEventListener('mousemove', onMouseMove, { passive: true });
        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('touchend', onTouchEnd);
        window.addEventListener('touchcancel', onTouchEnd);
        return () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
            window.removeEventListener('pointercancel', onPointerUp);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
            window.removeEventListener('touchcancel', onTouchEnd);
        };
    }, []);

    useEffect(() => {
        return () => {
            if (eatingTimerRef.current !== null) {
                window.clearTimeout(eatingTimerRef.current);
            }
            if (foodHintTimerRef.current !== null) {
                window.clearTimeout(foodHintTimerRef.current);
            }
            reactionTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
        };
    }, []);

    useEffect(() => {
        if (engine.gameState !== 'playing') return;
        const move = () => {
            setJelloPos({
                x: 38 + Math.random() * 48,
                y: 22 + Math.random() * 56
            });
        };

        move();
        const timer = window.setInterval(move, 1800);
        return () => window.clearInterval(timer);
    }, [engine.gameState, problem.total, problem.minus]);

    const fedCount = useMemo(() => fruits.filter((f) => f.fed).length, [fruits]);
    const remainingCount = useMemo(() => problem.total - fedCount, [problem.total, fedCount]);
    const fruitSlots = useMemo(() => Array.from({ length: 10 }, (_, i) => fruits[i] ?? null), [fruits]);

    useEffect(() => {
        fedCountRef.current = fedCount;
    }, [fedCount]);

    useEffect(() => {
        targetMinusRef.current = problem.minus;
    }, [problem.minus]);

    useEffect(() => {
        jelloPosRef.current = jelloPos;
    }, [jelloPos]);

    const nextRound = () => {
        const next = createProblem();
        setProblem(next);
        setFruits(makeFruits(next.total));
        setFoodEmoji(pickRandomFoodEmoji());
        setIsJelloEating(false);
        setFeedReactions([]);
    };

    const retrySameProblem = () => {
        // Keep the same subtraction problem and only reset fruit interaction state.
        setFruits((prev) => prev.map((fruit) => ({ ...fruit, fed: false })));
        setDraggingFruitId(null);
        setIsJelloEating(false);
        setFeedReactions([]);
    };

    const spawnFeedReaction = (emoji: string) => {
        const reactionId = Date.now() + Math.random();
        const nextReaction: FeedReaction = {
            id: reactionId,
            // Keep reaction anchored above Jello (not around random nearby spots)
            x: Math.max(10, Math.min(90, jelloPosRef.current.x)),
            y: Math.max(10, Math.min(88, jelloPosRef.current.y - 12)),
            emoji
        };

        setFeedReactions((prev) => [...prev, nextReaction]);

        const timerId = window.setTimeout(() => {
            setFeedReactions((prev) => prev.filter((reaction) => reaction.id !== reactionId));
            reactionTimersRef.current = reactionTimersRef.current.filter((id) => id !== timerId);
        }, 780);

        reactionTimersRef.current.push(timerId);
    };

    const handleCheck = () => {
        if (engine.gameState !== 'playing') return;

        const isCorrect = fedCount === problem.minus;
        engine.submitAnswer(isCorrect, { skipDifficulty: true });
        engine.registerEvent({ type: isCorrect ? 'correct' : 'wrong' } as any);

        if (isCorrect) {
            nextRound();
            return;
        }

        // Wrong answer: retry the exact same problem.
        retrySameProblem();
    };

    const startFruitDrag = (clientX: number, clientY: number, id: number, fed: boolean) => {
        if (engine.gameState !== 'playing' || fed) return;
        if (draggingRef.current) return;
        draggingRef.current = true;
        draggingFruitIdRef.current = id;
        dragPosRef.current = { x: clientX, y: clientY };
        setDraggingFruitId(id);
        const dragLayerRect = dragLayerRef.current?.getBoundingClientRect();
        if (dragLayerRect) {
            setDragPos({
                x: clientX - dragLayerRect.left,
                y: clientY - dragLayerRect.top
            });
        } else {
            setDragPos({ x: clientX, y: clientY });
        }
    };

    const handleFruitPointerDown = (event: React.PointerEvent<HTMLButtonElement>, id: number, fed: boolean) => {
        event.preventDefault();
        startFruitDrag(event.clientX, event.clientY, id, fed);
        try {
            event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
            // Some mobile browsers can reject pointer capture in edge cases.
            // Global pointer listeners still keep drag interaction functional.
        }
    };

    const handleFruitTouchStart = (event: React.TouchEvent<HTMLButtonElement>, id: number, fed: boolean) => {
        const touch = event.touches[0];
        if (!touch) return;
        event.preventDefault();
        startFruitDrag(touch.clientX, touch.clientY, id, fed);
    };

    const handleFruitMouseDown = (event: React.MouseEvent<HTMLButtonElement>, id: number, fed: boolean) => {
        if (typeof window !== 'undefined' && 'PointerEvent' in window) return;
        startFruitDrag(event.clientX, event.clientY, id, fed);
    };

    const currentCharacter = useMemo(() => {
        const id = nurturing.speciesId || 'yellowJello';
        const char = createCharacter(id as any);
        char.evolutionStage = (nurturing.evolutionStage || 1) as any;
        if (nurturing.characterName) {
            char.name = nurturing.characterName;
        }
        return { id, char };
    }, [nurturing.speciesId, nurturing.evolutionStage, nurturing.characterName]);

    const liveResult = fedCount === 0 ? '?' : String(remainingCount);
    const resultStateClass = fedCount === 0
        ? 'jello-target-result-neutral'
        : (fedCount === problem.minus ? 'jello-target-result-correct' : 'jello-target-result-wrong');
    const targetExpression = (
        <span className="jello-target-expression">
            <span>{problem.total} - {problem.minus} = </span>
            <span className={resultStateClass}>{liveResult}</span>
        </span>
    );
    const foodBgColor = FOOD_BG_COLORS[foodEmoji as (typeof FOOD_EMOJIS)[number]] || 'rgba(255, 255, 255, 0.15)';

    return (
        <Layout3
            className="jello-feeding-layout"
            title={t('games.jello-feeding.title')}
            subtitle={t('games.jello-feeding.subtitle')}
            description={t('games.jello-feeding.description')}
            gameId={GameIds.MATH_JELLO_FEEDING}
            engine={engine}
            onExit={onExit}
            instructions={[
                {
                    icon: '🖐️',
                    title: t('games.jello-feeding.howToPlay.step1.title'),
                    description: t('games.jello-feeding.howToPlay.step1.description')
                },
                {
                    icon: '🍏',
                    title: t('games.jello-feeding.howToPlay.step2.title'),
                    description: t('games.jello-feeding.howToPlay.step2.description')
                },
                {
                    icon: '✅',
                    title: t('games.jello-feeding.howToPlay.step3.title'),
                    description: t('games.jello-feeding.howToPlay.step3.description')
                }
            ]}
            powerUps={[]}
            target={{
                value: targetExpression
            }}
        >
            <>
                <BlobBackground />
                <div ref={dragLayerRef} className="jello-feeding-container">
                    <div className="fruit-board-panel">
                        {showFoodHintOverlay && (
                            <div className="food-hint-overlay" aria-hidden="true">
                                <span className="food-hint-text">{t('games.jello-feeding.ui.dragFeedHint')}</span>
                            </div>
                        )}
                        <div className="fruit-count-sign" aria-label="start-fruit-count">
                            {problem.total}
                        </div>
                        <div className="fruit-board-grid">
                            {fruitSlots.map((fruit, slotIndex) => (
                                <button
                                    key={fruit ? `fruit-${fruit.id}` : `empty-${slotIndex}`}
                                    type="button"
                                    className={`fruit-chip ${!fruit || fruit.fed ? 'fed' : ''}`}
                                    onPointerDown={fruit ? (event) => handleFruitPointerDown(event, fruit.id, fruit.fed) : undefined}
                                    onTouchStart={fruit ? (event) => handleFruitTouchStart(event, fruit.id, fruit.fed) : undefined}
                                    onMouseDown={fruit ? (event) => handleFruitMouseDown(event, fruit.id, fruit.fed) : undefined}
                                    disabled={!fruit || fruit.fed || engine.gameState !== 'playing'}
                                    aria-label={fruit ? `fruit-${fruit.id}` : `empty-slot-${slotIndex}`}
                                    style={fruit && !fruit.fed
                                        ? { background: `linear-gradient(rgba(255, 253, 251, 0.9), rgba(255, 253, 251, 0.9)), ${foodBgColor}` }
                                        : undefined}
                                >
                                    {fruit ? <span className="fruit-emoji">{foodEmoji}</span> : null}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="jello-drop-panel">
                        <div className="stats-stack">
                            <div className="stat-sign-wrap">
                                <div className="stat-sign-label">{t('games.jello-feeding.labels.fed')}</div>
                                <div className="stat-sign">{fedCount}</div>
                            </div>
                            <div className="stat-sign-wrap">
                                <div className="stat-sign-label">{t('games.jello-feeding.labels.remaining')}</div>
                                <div className="stat-sign">{remainingCount}</div>
                            </div>
                        </div>

                        <div className="jello-move-area">
                            {feedReactions.map((reaction) => (
                                <div
                                    key={reaction.id}
                                    className="feed-reaction"
                                    style={{ left: `${reaction.x}%`, top: `${reaction.y}%` }}
                                    aria-hidden="true"
                                >
                                    {reaction.emoji}
                                </div>
                            ))}
                            <div
                                ref={jelloTargetRef}
                                className="jello-target"
                                style={{ left: `${jelloPos.x}%`, top: `${jelloPos.y}%` }}
                            >
                                <JelloAvatar
                                    character={currentCharacter.char}
                                    speciesId={currentCharacter.id}
                                    size="small"
                                    responsive
                                    action={isJelloEating ? 'eating' : 'idle'}
                                    mood="happy"
                                    disableAnimation={false}
                                />
                            </div>
                        </div>
                    </div>

                    {draggingFruitId != null && (
                        <div
                            className="fruit-drag-ghost"
                            style={{ left: dragPos.x, top: dragPos.y, background: foodBgColor }}
                            aria-hidden="true"
                        >
                            {foodEmoji}
                        </div>
                    )}
                </div>
                <button
                    type="button"
                    className="jello-check-btn"
                    onClick={handleCheck}
                    disabled={engine.gameState !== 'playing'}
                    aria-label="check-answer"
                >
                    ✓
                </button>
            </>
        </Layout3>
    );
};

export const manifest: GameManifest = {
    id: GameIds.MATH_JELLO_FEEDING,
    title: 'Jello Feeding',
    titleKey: 'games.jello-feeding.title',
    subtitle: 'Jello is Hungry!',
    subtitleKey: 'games.jello-feeding.subtitle',
    description: 'Drag fruits to Jello and check your subtraction mission.',
    descriptionKey: 'games.jello-feeding.description',
    category: 'math',
    level: 1,
    component: JelloFeeding,
    thumbnail: '🍏',
    tagsKey: 'games.tags.subtraction'
};
