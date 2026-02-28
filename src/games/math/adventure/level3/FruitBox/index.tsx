import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layout2 } from '../../../../layouts/Standard/Layout2';
import { useGameEngine } from '../../../../layouts/Standard/Layout0/useGameEngine';
import { BlobBackground } from '../../../components/BlobBackground';
import type { GameManifest } from '../../../../types';
import { GameIds } from '../../../../../constants/gameIds';
import './FruitBox.css';

interface FruitBoxProps {
    onExit: () => void;
}

interface Problem {
    perBox: number;
    boxCount: number;
}

const BOX_ICON = '📦';
const FRUIT_EMOJIS = [
    '🍈', '🍉', '🍊', '🍋', '🍌', '🍍', '🥭', '🍎', '🍏', '🍐', '🍑', '🍓', '🥝', '🍅'
] as const;
type FruitEmoji = (typeof FRUIT_EMOJIS)[number];

const FRUIT_BG_COLORS: Record<FruitEmoji, string> = {
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
    '🍅': 'rgba(246, 175, 165, 0.15)'
};

const pickRandomFruitEmoji = (): FruitEmoji =>
    FRUIT_EMOJIS[Math.floor(Math.random() * FRUIT_EMOJIS.length)];

const isSameProblem = (a: Problem, b: Problem): boolean =>
    a.perBox === b.perBox && a.boxCount === b.boxCount;

const PROBLEM_CANDIDATES: Problem[] = (() => {
    const candidates: Problem[] = [];
    for (let perBox = 2; perBox <= 9; perBox += 1) {
        for (let boxCount = 2; boxCount <= 7; boxCount += 1) {
            const total = perBox * boxCount;
            const highFruitRule = perBox >= 7 ? boxCount === 2 : true;
            if (total <= 18 && highFruitRule) {
                candidates.push({ perBox, boxCount });
            }
        }
    }
    return candidates;
})();

const createBundleIds = (boxCount: number): number[] => Array.from({ length: boxCount }, (_, i) => i);
const createEmptyBoxes = (boxCount: number): Array<number | null> => Array(boxCount).fill(null);

const createProblem = (prevProblem?: Problem): Problem => {
    if (PROBLEM_CANDIDATES.length === 0) {
        return { perBox: 2, boxCount: 2 };
    }

    const pool = prevProblem
        ? PROBLEM_CANDIDATES.filter((candidate) => !isSameProblem(candidate, prevProblem))
        : PROBLEM_CANDIDATES;

    const finalPool = pool.length > 0 ? pool : PROBLEM_CANDIDATES;
    return finalPool[Math.floor(Math.random() * finalPool.length)];
};

export const FruitBox: React.FC<FruitBoxProps> = ({ onExit }) => {
    const { t, i18n } = useTranslation();

    const engine = useGameEngine({
        initialLives: 3,
        initialTime: 90,
        maxDifficulty: 2
    });
    const { setPowerUps } = engine;

    const [problem, setProblem] = React.useState<Problem>(() => createProblem());
    const [sourceBundles, setSourceBundles] = React.useState<number[]>(() => createBundleIds(problem.boxCount));
    const [fruitEmoji, setFruitEmoji] = React.useState<FruitEmoji>(() => pickRandomFruitEmoji());
    const [boxValues, setBoxValues] = React.useState<Array<number | null>>(() => createEmptyBoxes(problem.boxCount));
    const [draggingBundle, setDraggingBundle] = React.useState<number | null>(null);
    const [dragPos, setDragPos] = React.useState({ x: 0, y: 0 });
    const [feedbackText, setFeedbackText] = React.useState('');
    const [isCheckPressed, setIsCheckPressed] = React.useState(false);
    const [showBundleHintOverlay, setShowBundleHintOverlay] = React.useState(false);

    const isDraggingRef = React.useRef(false);
    const draggingBundleRef = React.useRef<number | null>(null);
    const draggingPointerIdRef = React.useRef<number | null>(null);
    const dragPosRef = React.useRef({ x: 0, y: 0 });
    const timersRef = React.useRef<number[]>([]);
    const prevGameStateRef = React.useRef(engine.gameState);
    const boxValuesRef = React.useRef<Array<number | null>>(boxValues);
    const lastProblemRef = React.useRef<Problem>(problem);
    const perBoxRef = React.useRef(problem.perBox);
    const dropZoneRef = React.useRef<HTMLElement | null>(null);
    const hasShownBundleHintRef = React.useRef(false);

    React.useEffect(() => {
        boxValuesRef.current = boxValues;
    }, [boxValues]);
    React.useEffect(() => {
        perBoxRef.current = problem.perBox;
    }, [problem.perBox]);

    const clearTimers = React.useCallback(() => {
        timersRef.current.forEach((timer) => window.clearTimeout(timer));
        timersRef.current = [];
    }, []);

    const resetRoundVisuals = React.useCallback(() => {
        setFeedbackText('');
        setDraggingBundle(null);
        draggingBundleRef.current = null;
        isDraggingRef.current = false;
        draggingPointerIdRef.current = null;
    }, []);

    const startNewProblem = React.useCallback(() => {
        const next = createProblem(lastProblemRef.current);
        lastProblemRef.current = next;
        const nextBoxes = createEmptyBoxes(next.boxCount);
        setProblem(next);
        setSourceBundles(createBundleIds(next.boxCount));
        setFruitEmoji(pickRandomFruitEmoji());
        setBoxValues(nextBoxes);
        boxValuesRef.current = nextBoxes;
        resetRoundVisuals();
    }, [resetRoundVisuals]);

    const resetSameProblem = React.useCallback(() => {
        const resetBoxes = createEmptyBoxes(problem.boxCount);
        setBoxValues(resetBoxes);
        boxValuesRef.current = resetBoxes;
        setSourceBundles(createBundleIds(problem.boxCount));
        setDraggingBundle(null);
        setFeedbackText(t('games.fruit-box.feedback.retry'));
        const timer = window.setTimeout(() => setFeedbackText(''), 900);
        timersRef.current.push(timer);
    }, [problem.boxCount, t]);

    React.useEffect(() => {
        const prev = prevGameStateRef.current;
        const enteredPlaying = engine.gameState === 'playing' && (prev === 'idle' || prev === 'gameover');
        if (enteredPlaying) {
            clearTimers();
            startNewProblem();

            const isFirstQuestion =
                engine.score === 0 &&
                engine.stats.correct === 0 &&
                engine.stats.wrong === 0;

            if (isFirstQuestion && !hasShownBundleHintRef.current) {
                hasShownBundleHintRef.current = true;
                setShowBundleHintOverlay(true);
                const timer = window.setTimeout(() => {
                    setShowBundleHintOverlay(false);
                }, 1800);
                timersRef.current.push(timer);
            } else {
                setShowBundleHintOverlay(false);
            }
        }
        prevGameStateRef.current = engine.gameState;
    }, [engine.gameState, startNewProblem, clearTimers, engine.score, engine.stats.correct, engine.stats.wrong]);

    React.useEffect(() => {
        return () => clearTimers();
    }, [clearTimers]);

    // FruitBox: power-ups are intentionally disabled.
    React.useEffect(() => {
        setPowerUps((prev) => (
            prev.timeFreeze === 0 && prev.extraLife === 0 && prev.doubleScore === 0
                ? prev
                : { timeFreeze: 0, extraLife: 0, doubleScore: 0 }
        ));
    }, [setPowerUps]);

    const highFruitTwoRowLayout = problem.perBox >= 7 && problem.boxCount === 2;
    const bundleMaxPerRow = highFruitTwoRowLayout
        ? 1
        : (problem.perBox === 3
            ? 3
            : ([4, 5, 6].includes(problem.perBox) ? 2 : 4));
    const bundleRows: 1 | 2 = sourceBundles.length > bundleMaxPerRow ? 2 : 1;
    const bundleCols = Math.max(1, bundleRows === 1 ? sourceBundles.length : bundleMaxPerRow);

    React.useEffect(() => {
        const handleDragMove = (clientX: number, clientY: number) => {
            if (!isDraggingRef.current || draggingBundleRef.current == null) return;
            const nextPos = { x: clientX, y: clientY };
            dragPosRef.current = nextPos;
            setDragPos(nextPos);
        };

        const handleDragEnd = (clientX: number, clientY: number) => {
            const activeBundleId = draggingBundleRef.current;
            if (!isDraggingRef.current || activeBundleId == null) return;

            isDraggingRef.current = false;
            draggingPointerIdRef.current = null;

            const pointerX = clientX || dragPosRef.current.x;
            const pointerY = clientY || dragPosRef.current.y;

            const target = document.elementFromPoint(pointerX, pointerY);
            let boxEl = target instanceof Element ? target.closest('[data-box-index]') : null;
            if (!boxEl) {
                const allBoxes = (dropZoneRef.current ?? document).querySelectorAll<HTMLElement>('[data-box-index]');
                boxEl = Array.from(allBoxes).find((box) => {
                    const rect = box.getBoundingClientRect();
                    return pointerX >= rect.left && pointerX <= rect.right && pointerY >= rect.top && pointerY <= rect.bottom;
                }) ?? null;
            }
            if (boxEl) {
                const idxAttr = boxEl.getAttribute('data-box-index');
                const idx = idxAttr == null ? NaN : Number(idxAttr);
                if (Number.isFinite(idx)) {
                    const canPlace = boxValuesRef.current[idx] == null;
                    if (canPlace) {
                        const nextBoxes = [...boxValuesRef.current];
                        nextBoxes[idx] = perBoxRef.current;
                        boxValuesRef.current = nextBoxes;
                        setBoxValues(nextBoxes);
                        setSourceBundles((prev) => prev.filter((id) => id !== activeBundleId));
                    }
                }
            }

            draggingBundleRef.current = null;
            setDraggingBundle(null);
        };

        const handlePointerMove = (event: PointerEvent) => {
            if (draggingPointerIdRef.current !== null && event.pointerId !== draggingPointerIdRef.current) return;
            handleDragMove(event.clientX, event.clientY);
        };

        const handlePointerUp = (event: PointerEvent) => {
            if (draggingPointerIdRef.current !== null && event.pointerId !== draggingPointerIdRef.current) return;
            handleDragEnd(event.clientX, event.clientY);
        };

        const handleMouseMove = (event: MouseEvent) => {
            handleDragMove(event.clientX, event.clientY);
        };

        const handleMouseUp = (event: MouseEvent) => {
            handleDragEnd(event.clientX, event.clientY);
        };

        const handleTouchMove = (event: TouchEvent) => {
            if (!isDraggingRef.current || draggingBundleRef.current == null) return;
            const touch = event.touches[0];
            if (!touch) return;
            event.preventDefault();
            handleDragMove(touch.clientX, touch.clientY);
        };

        const handleTouchEnd = (event: TouchEvent) => {
            const touch = event.changedTouches[0];
            if (!touch) {
                isDraggingRef.current = false;
                draggingPointerIdRef.current = null;
                draggingBundleRef.current = null;
                setDraggingBundle(null);
                return;
            }
            handleDragEnd(touch.clientX, touch.clientY);
        };

        window.addEventListener('pointermove', handlePointerMove, { passive: true });
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('pointercancel', handlePointerUp);
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);
        window.addEventListener('touchcancel', handleTouchEnd);
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('pointercancel', handlePointerUp);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('touchcancel', handleTouchEnd);
        };
    }, []);

    const onBundleDown = (event: React.PointerEvent<HTMLButtonElement>, bundleId: number) => {
        if (engine.gameState !== 'playing') return;
        isDraggingRef.current = true;
        draggingPointerIdRef.current = event.pointerId;
        draggingBundleRef.current = bundleId;
        setDraggingBundle(bundleId);
        const startPos = { x: event.clientX, y: event.clientY };
        dragPosRef.current = startPos;
        setDragPos(startPos);
        try {
            event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
            // Mobile browsers can reject pointer capture in edge cases.
            // Global listeners still keep drag interaction functional.
        }
        setFeedbackText('');
    };

    const onBundleTouchStart = (event: React.TouchEvent<HTMLButtonElement>, bundleId: number) => {
        if (engine.gameState !== 'playing') return;
        const touch = event.touches[0];
        if (!touch) return;
        event.preventDefault();
        isDraggingRef.current = true;
        draggingPointerIdRef.current = null;
        draggingBundleRef.current = bundleId;
        setDraggingBundle(bundleId);
        const startPos = { x: touch.clientX, y: touch.clientY };
        dragPosRef.current = startPos;
        setDragPos(startPos);
        setFeedbackText('');
    };

    const onBundleMouseDown = (event: React.MouseEvent<HTMLButtonElement>, bundleId: number) => {
        if (engine.gameState !== 'playing') return;
        event.preventDefault();
        isDraggingRef.current = true;
        draggingPointerIdRef.current = null;
        draggingBundleRef.current = bundleId;
        setDraggingBundle(bundleId);
        const startPos = { x: event.clientX, y: event.clientY };
        dragPosRef.current = startPos;
        setDragPos(startPos);
        setFeedbackText('');
    };

    const handleCheck = () => {
        if (engine.gameState !== 'playing') return;

        const allFilled = boxValues.every((v) => v != null);
        if (!allFilled) {
            engine.submitAnswer(false, { skipDifficulty: true, skipFeedback: true });
            engine.registerEvent({ type: 'wrong' });
            return;
        }

        const first = boxValues[0];
        const allSame = boxValues.every((v) => v === first);
        const isCorrect = allSame && first === problem.perBox;

        engine.submitAnswer(isCorrect, { skipDifficulty: true, skipFeedback: true });
        engine.registerEvent({ type: isCorrect ? 'correct' : 'wrong' });

        if (!isCorrect) {
            resetSameProblem();
            return;
        }

        setFeedbackText('');
        startNewProblem();
    };

    const repeatedAddition = Array(problem.boxCount).fill(problem.perBox).join(' + ');
    const foodBgColor = FRUIT_BG_COLORS[fruitEmoji] || 'rgba(255, 255, 255, 0.15)';
    const liveTotal = boxValues.reduce<number>((acc, value) => acc + (value ?? 0), 0);
    const targetTotal = problem.perBox * problem.boxCount;
    const maxBoxesPerRow = 5;
    const isMultiRow = boxValues.length > maxBoxesPerRow;
    const dropRows = Array.from(
        { length: Math.ceil(boxValues.length / maxBoxesPerRow) },
        (_, rowIdx) => {
            const start = rowIdx * maxBoxesPerRow;
            return boxValues
                .slice(start, start + maxBoxesPerRow)
                .map((value, localIdx) => ({ value, idx: start + localIdx }));
        }
    );
    const resultStateClass =
        liveTotal === 0
            ? 'order-result-neutral'
            : (liveTotal === targetTotal ? 'order-result-correct' : 'order-result-wrong');
    const isEachFirstOrder = i18n.language.startsWith('ko') || i18n.language.startsWith('ja');

    return (
        <Layout2
            title={t('games.fruit-box.title')}
            subtitle={t('games.fruit-box.subtitle')}
            description={t('games.fruit-box.description')}
            gameId={GameIds.MATH_FRUIT_BOX}
            engine={engine}
            cardBackground={<BlobBackground />}
            onExit={onExit}
            powerUps={[]}
            instructions={[
                {
                    icon: '📦',
                    title: t('games.fruit-box.howToPlay.step1.title'),
                    description: t('games.fruit-box.howToPlay.step1.description')
                },
                {
                    icon: '🍎',
                    title: t('games.fruit-box.howToPlay.step2.title'),
                    description: t('games.fruit-box.howToPlay.step2.description')
                },
                {
                    icon: '✅',
                    title: t('games.fruit-box.howToPlay.step3.title'),
                    description: t('games.fruit-box.howToPlay.step3.description')
                }
            ]}
        >
            <div className="fruit-box-shell">
                <div className="fruit-box-board">
                    <section className="fruit-box-order-card" aria-label="order card">
                        <div className="order-row">
                            {isEachFirstOrder ? (
                                <>
                                    <span className="order-text-part">
                                        {fruitEmoji} {problem.perBox}
                                        {t('games.fruit-box.ui.orderEachUnit')}
                                    </span>
                                    <span className="order-text-part">
                                        {BOX_ICON} {problem.boxCount}
                                        {t('games.fruit-box.ui.orderGroupsUnit')}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span className="order-text-part">
                                        {BOX_ICON} {problem.boxCount}
                                        {t('games.fruit-box.ui.orderGroupsUnit')}
                                    </span>
                                    <span className="order-text-part">
                                        {fruitEmoji} {problem.perBox}
                                        {t('games.fruit-box.ui.orderEachUnit')}
                                    </span>
                                </>
                            )}
                            <span className="order-equals">=</span>
                            <span className={`order-result ${resultStateClass}`}>
                                {liveTotal === 0 ? '?' : liveTotal}
                            </span>
                        </div>
                    </section>

                    <section
                        className="fruit-box-bundle-tray"
                        style={{
                            '--bundle-rows': bundleRows,
                            '--bundle-cols': bundleCols,
                            '--per-box': problem.perBox
                        } as React.CSSProperties}
                        aria-label="bundle tray"
                    >
                        {showBundleHintOverlay && (
                            <div className="bundle-hint-overlay" aria-hidden="true">
                                <span className="bundle-hint-text">{t('games.fruit-box.ui.dragToBoxHint')}</span>
                            </div>
                        )}
                        {sourceBundles.length > 0 ? (
                            sourceBundles.map((bundleId) => (
                                <button
                                    key={bundleId}
                                    type="button"
                                    className="source-bundle"
                                    onPointerDown={(event) => onBundleDown(event, bundleId)}
                                    onTouchStart={(event) => onBundleTouchStart(event, bundleId)}
                                    onMouseDown={(event) => onBundleMouseDown(event, bundleId)}
                                >
                                    <span className="bundle-fruits" aria-hidden="true">
                                        {Array.from({ length: problem.perBox }).map((_, idx) => (
                                            <span key={idx} className="bundle-fruit">{fruitEmoji}</span>
                                        ))}
                                    </span>
                                </button>
                            ))
                        ) : (
                            <div className="bundle-summary" aria-live="polite">
                                <p className="bundle-summary-line">{problem.perBox} × {problem.boxCount} =</p>
                                <p className="bundle-summary-add">{repeatedAddition}</p>
                            </div>
                        )}
                    </section>

                    <section
                        className="fruit-box-drop-zone"
                        aria-label="drop boxes"
                        ref={(el) => { dropZoneRef.current = el; }}
                    >
                        {dropRows.map((row, rowIdx) => (
                            <div
                                key={`drop-row-${rowIdx}`}
                                className="drop-row"
                                style={{
                                    '--row-box-count': isMultiRow ? maxBoxesPerRow : row.length
                                } as React.CSSProperties}
                            >
                                {(isMultiRow
                                    ? Array.from({ length: maxBoxesPerRow }, (_, slotIdx) => row[slotIdx] ?? null)
                                    : row
                                ).map((slot, itemIdx) => (
                                    <React.Fragment key={`slot-${rowIdx}-${itemIdx}`}>
                                        <div
                                            className={`drop-box${slot ? '' : ' drop-box-placeholder'}`}
                                            {...(slot ? { 'data-box-index': slot.idx } : {})}
                                        >
                                            <div className="drop-box-value">
                                                {slot?.value == null ? '' : slot.value}
                                            </div>
                                        </div>
                                        {itemIdx < (isMultiRow ? maxBoxesPerRow : row.length) - 1 && (
                                            <div
                                                className={`drop-plus${
                                                    slot && (isMultiRow
                                                        ? (row[itemIdx + 1] ?? null)
                                                        : row[itemIdx + 1]) ? '' : ' drop-plus-hidden'
                                                }`}
                                                aria-hidden="true"
                                            >
                                                +
                                            </div>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        ))}
                    </section>

                    <section className="fruit-box-formula-area" aria-live="polite">
                        {feedbackText ? <p className="formula-feedback">{feedbackText}</p> : null}
                    </section>

                </div>

                <button
                    type="button"
                    className={`fruit-box-check-btn${isCheckPressed ? ' is-pressed' : ''}`}
                    onPointerDown={() => setIsCheckPressed(true)}
                    onPointerUp={() => setIsCheckPressed(false)}
                    onPointerCancel={() => setIsCheckPressed(false)}
                    onPointerLeave={() => setIsCheckPressed(false)}
                    onClick={handleCheck}
                >
                    ✓
                </button>

                {draggingBundle != null && (
                    <div className="bundle-drag-ghost" style={{ left: dragPos.x, top: dragPos.y, background: foodBgColor }}>
                        {Array.from({ length: problem.perBox }).map((_, idx) => (
                            <span key={idx}>{fruitEmoji}</span>
                        ))}
                    </div>
                )}
            </div>
        </Layout2>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const manifest: GameManifest = {
    id: GameIds.MATH_FRUIT_BOX,
    title: 'Fruit Box',
    titleKey: 'games.fruit-box.title',
    subtitle: 'Pack equal bundles!',
    subtitleKey: 'games.fruit-box.subtitle',
    description: 'Pack the same fruit bundles into each box.',
    descriptionKey: 'games.fruit-box.description',
    category: 'math',
    level: 3,
    component: FruitBox,
    thumbnail: '📦',
    tagsKey: 'games.tags.multiplication'
};

export default FruitBox;
