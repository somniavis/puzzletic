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

const FOOD_EMOJIS = [
    '🍈', '🍉', '🍊', '🍋', '🍋‍🟩', '🍌', '🍍', '🥭', '🍎', '🍏', '🍐', '🍑', '🍓', '🥝', '🍅',
    '🥑', '🍆', '🥔', '🥕', '🌽', '🌶️', '🫑', '🥒', '🥬', '🥦', '🧅', '🌰', '🍄‍🟫',
    '🥐', '🥞', '🧀', '🍖', '🍗', '🍔', '🍕', '🌭', '🥪'
] as const;

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

    const jelloTargetRef = useRef<HTMLDivElement>(null);
    const draggingRef = useRef(false);
    const eatingTimerRef = useRef<number | null>(null);

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
        if (engine.gameState !== 'playing') return;
        const next = createProblem();
        setProblem(next);
        setFruits(makeFruits(next.total));
        setFoodEmoji(pickRandomFoodEmoji());
        setDraggingFruitId(null);
    }, [engine.gameState]);

    useEffect(() => {
        const handlePointerMove = (event: PointerEvent) => {
            if (!draggingRef.current || draggingFruitId == null) return;
            setDragPos({ x: event.clientX, y: event.clientY });
        };

        const handlePointerUp = (event: PointerEvent) => {
            if (!draggingRef.current || draggingFruitId == null) return;
            draggingRef.current = false;

            const dropZone = jelloTargetRef.current;
            let dropped = false;
            if (dropZone) {
                const rect = dropZone.getBoundingClientRect();
                const inside =
                    event.clientX >= rect.left &&
                    event.clientX <= rect.right &&
                    event.clientY >= rect.top &&
                    event.clientY <= rect.bottom;
                if (inside) {
                    dropped = true;
                }
            }

            if (dropped) {
                setFruits((prev) => prev.map((fruit) => (
                    fruit.id === draggingFruitId && !fruit.fed ? { ...fruit, fed: true } : fruit
                )));
                playEatingSound();
                setIsJelloEating(true);
                if (eatingTimerRef.current !== null) {
                    window.clearTimeout(eatingTimerRef.current);
                }
                eatingTimerRef.current = window.setTimeout(() => {
                    setIsJelloEating(false);
                    eatingTimerRef.current = null;
                }, 420);
            }

            setDraggingFruitId(null);
        };

        window.addEventListener('pointermove', handlePointerMove, { passive: true });
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('pointercancel', handlePointerUp);
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('pointercancel', handlePointerUp);
        };
    }, [draggingFruitId]);

    useEffect(() => {
        return () => {
            if (eatingTimerRef.current !== null) {
                window.clearTimeout(eatingTimerRef.current);
            }
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

    const nextRound = () => {
        const next = createProblem();
        setProblem(next);
        setFruits(makeFruits(next.total));
        setFoodEmoji(pickRandomFoodEmoji());
        setIsJelloEating(false);
    };

    const retrySameProblem = () => {
        // Keep the same subtraction problem and only reset fruit interaction state.
        setFruits((prev) => prev.map((fruit) => ({ ...fruit, fed: false })));
        setDraggingFruitId(null);
        setIsJelloEating(false);
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

    const handleFruitPointerDown = (event: React.PointerEvent<HTMLButtonElement>, id: number, fed: boolean) => {
        if (engine.gameState !== 'playing' || fed) return;
        draggingRef.current = true;
        try {
            event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
            // Some mobile browsers can reject pointer capture in edge cases.
            // Global pointer listeners still keep drag interaction functional.
        }
        setDraggingFruitId(id);
        setDragPos({ x: event.clientX, y: event.clientY });
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
    const targetExpression = `${problem.total} - ${problem.minus} = ${liveResult}`;

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
                    icon: '🧮',
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
                <div className="jello-feeding-container">
                    <div className="fruit-board-panel">
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
                                    disabled={!fruit || fruit.fed || engine.gameState !== 'playing'}
                                    aria-label={fruit ? `fruit-${fruit.id}` : `empty-slot-${slotIndex}`}
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
                            <div
                                ref={jelloTargetRef}
                                className="jello-target"
                                style={{ left: `${jelloPos.x}%`, top: `${jelloPos.y}%` }}
                            >
                                <JelloAvatar
                                    character={currentCharacter.char}
                                    speciesId={currentCharacter.id}
                                    size="small"
                                    action={isJelloEating ? 'eating' : 'idle'}
                                    mood="happy"
                                    disableAnimation={false}
                                />
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
                        </div>
                    </div>

                    {draggingFruitId != null && (
                        <div
                            className="fruit-drag-ghost"
                            style={{ left: dragPos.x, top: dragPos.y }}
                            aria-hidden="true"
                        >
                            {foodEmoji}
                        </div>
                    )}
                </div>
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
