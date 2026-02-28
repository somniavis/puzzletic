import React from 'react';
import { useTranslation } from 'react-i18next';
import type { GameManifest } from '../../../../types';
import { Layout2 } from '../../../../layouts/Standard/Layout2';
import { useGameEngine } from '../../../../layouts/Standard/Layout0/useGameEngine';
import { GameIds } from '../../../../../constants/gameIds';
import './CellClone.css';

interface CellCloneProps {
    onExit: () => void;
}

const randomCellCount = (): number => Math.floor(Math.random() * 9) + 1;
const REAGENT_COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'] as const;
const SCIENTIST_EMOJIS = ['👩🏻‍🔬', '👩🏼‍🔬', '👩🏽‍🔬', '👩🏾‍🔬', '👩🏿‍🔬'] as const;
type ReagentColor = (typeof REAGENT_COLORS)[number];
type ReagentOption = { id: string; color: ReagentColor; multiplier: 2 | 4 };
type CellTone = ReagentColor | 'neutral';
type RoundTarget = {
    color: ReagentColor;
    multiplier: 2 | 4;
    result: number;
};
type ProducedResult = {
    color: ReagentColor;
    result: number;
};
type RoundPlan = {
    baseCount: number;
    targetColor: ReagentColor;
    targetMultiplier: 2 | 4;
    options: ReagentOption[];
};
type DragState = {
    option: ReagentOption;
    x: number;
    y: number;
} | null;
const CELL_BURST_DURATION_MS = 1216;
const JUDGE_DELAY_AFTER_BURST_MS = 220;
const FEEDBACK_DELAY_MS = 720;

const CELL_GRID_GAP = 42;
const CELL_TRIANGLE_GAP_Y = 30;
const CELL_FALLBACK_GRID_GAP = 34;

const CELL_LAYOUTS: Record<number, Array<[number, number]>> = {
    1: [[0, 0]],
    2: [[-CELL_GRID_GAP / 2, 0], [CELL_GRID_GAP / 2, 0]],
    3: [[-CELL_GRID_GAP / 2, -CELL_TRIANGLE_GAP_Y / 2], [CELL_GRID_GAP / 2, -CELL_TRIANGLE_GAP_Y / 2], [0, CELL_TRIANGLE_GAP_Y / 2]],
    4: [[-CELL_GRID_GAP / 2, -CELL_GRID_GAP / 2], [CELL_GRID_GAP / 2, -CELL_GRID_GAP / 2], [-CELL_GRID_GAP / 2, CELL_GRID_GAP / 2], [CELL_GRID_GAP / 2, CELL_GRID_GAP / 2]],
    5: [[-CELL_GRID_GAP / 2, -CELL_GRID_GAP / 2], [CELL_GRID_GAP / 2, -CELL_GRID_GAP / 2], [0, 0], [-CELL_GRID_GAP / 2, CELL_GRID_GAP / 2], [CELL_GRID_GAP / 2, CELL_GRID_GAP / 2]],
    6: [[-CELL_GRID_GAP / 2, -CELL_GRID_GAP], [CELL_GRID_GAP / 2, -CELL_GRID_GAP], [-CELL_GRID_GAP / 2, 0], [CELL_GRID_GAP / 2, 0], [-CELL_GRID_GAP / 2, CELL_GRID_GAP], [CELL_GRID_GAP / 2, CELL_GRID_GAP]],
    7: [[-CELL_GRID_GAP / 2, -CELL_GRID_GAP], [CELL_GRID_GAP / 2, -CELL_GRID_GAP], [-CELL_GRID_GAP / 2, 0], [CELL_GRID_GAP / 2, 0], [-CELL_GRID_GAP / 2, CELL_GRID_GAP], [CELL_GRID_GAP / 2, CELL_GRID_GAP], [0, 0]],
    8: [[-CELL_GRID_GAP, -CELL_GRID_GAP], [0, -CELL_GRID_GAP], [CELL_GRID_GAP, -CELL_GRID_GAP], [-CELL_GRID_GAP, 0], [CELL_GRID_GAP, 0], [-CELL_GRID_GAP, CELL_GRID_GAP], [0, CELL_GRID_GAP], [CELL_GRID_GAP, CELL_GRID_GAP]],
    9: [[-CELL_GRID_GAP, -CELL_GRID_GAP], [0, -CELL_GRID_GAP], [CELL_GRID_GAP, -CELL_GRID_GAP], [-CELL_GRID_GAP, 0], [0, 0], [CELL_GRID_GAP, 0], [-CELL_GRID_GAP, CELL_GRID_GAP], [0, CELL_GRID_GAP], [CELL_GRID_GAP, CELL_GRID_GAP]]
};

const getCellPositions = (count: number): Array<[number, number]> => {
    if (CELL_LAYOUTS[count]) return CELL_LAYOUTS[count];

    // Fallback layout for 10+ cells: compact auto-grid near square shape
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    const width = (cols - 1) * CELL_FALLBACK_GRID_GAP;
    const height = (rows - 1) * CELL_FALLBACK_GRID_GAP;

    return Array.from({ length: count }, (_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = col * CELL_FALLBACK_GRID_GAP - width / 2;
        const y = row * CELL_FALLBACK_GRID_GAP - height / 2;
        return [x, y] as [number, number];
    });
};

const shuffle = <T,>(items: readonly T[]): T[] => {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

const pickTwoRandomColors = (): [ReagentColor, ReagentColor] => {
    const pool = shuffle(REAGENT_COLORS);
    return [pool[0], pool[1]];
};

const createRoundPlan = (): RoundPlan => {
    const baseCount = randomCellCount();
    const [firstColor, secondColor] = pickTwoRandomColors();
    const targetColor = Math.random() < 0.5 ? firstColor : secondColor;
    const targetMultiplier: 2 | 4 = Math.random() < 0.5 ? 2 : 4;
    const options = shuffle([
        { id: `${firstColor}-2-a`, color: firstColor, multiplier: 2 as const },
        { id: `${firstColor}-4-a`, color: firstColor, multiplier: 4 as const },
        { id: `${secondColor}-2-b`, color: secondColor, multiplier: 2 as const },
        { id: `${secondColor}-4-b`, color: secondColor, multiplier: 4 as const }
    ]) satisfies ReagentOption[];

    return { baseCount, targetColor, targetMultiplier, options };
};

const getRoundSignature = (plan: Pick<RoundPlan, 'baseCount' | 'targetColor' | 'targetMultiplier'>): string =>
    `${plan.baseCount}-${plan.targetColor}-${plan.targetMultiplier}`;

export const CellClone: React.FC<CellCloneProps> = ({ onExit }) => {
    const { t } = useTranslation();
    const engine = useGameEngine({ initialLives: 3, initialTime: 90, maxDifficulty: 1 });
    const [cellCount, setCellCount] = React.useState<number>(() => randomCellCount());
    const [reagentOptions, setReagentOptions] = React.useState<ReagentOption[]>([]);
    const [roundTarget, setRoundTarget] = React.useState<RoundTarget | null>(null);
    const [producedResult, setProducedResult] = React.useState<ProducedResult | null>(null);
    const [cellColor, setCellColor] = React.useState<CellTone>('neutral');
    const [isRoundReady, setIsRoundReady] = React.useState(false);
    const [dragState, setDragState] = React.useState<DragState>(null);
    const [isDropTargetActive, setIsDropTargetActive] = React.useState(false);
    const [isCellBursting, setIsCellBursting] = React.useState(false);
    const [isResolving, setIsResolving] = React.useState(false);
    const [showDragHintOverlay, setShowDragHintOverlay] = React.useState(false);
    const [isDragHintExiting, setIsDragHintExiting] = React.useState(false);
    const isDragging = dragState !== null;
    const prevGameStateRef = React.useRef(engine.gameState);
    const roundTokenRef = React.useRef(0);
    const prevRoundSignatureRef = React.useRef<string | null>(null);
    const baseCellCountRef = React.useRef<number>(cellCount);
    const coreRef = React.useRef<HTMLDivElement>(null);
    const dragOptionRef = React.useRef<ReagentOption | null>(null);
    const burstTimeoutRef = React.useRef<number | null>(null);
    const resolveTimeoutRef = React.useRef<number | null>(null);
    const hasShownDragHintRef = React.useRef(false);
    const dragHintTimerRef = React.useRef<number | null>(null);
    const dragHintExitTimerRef = React.useRef<number | null>(null);
    const scientistEmoji = React.useMemo(
        () => SCIENTIST_EMOJIS[Math.floor(Math.random() * SCIENTIST_EMOJIS.length)],
        []
    );
    const cellPositions = React.useMemo(() => getCellPositions(cellCount), [cellCount]);
    const clusterScale = React.useMemo(() => {
        if (cellCount <= 9) return 1;
        if (cellCount <= 16) return 0.84;
        if (cellCount <= 25) return 0.72;
        if (cellCount <= 36) return 0.62;
        return 0.56;
    }, [cellCount]);

    const clearRoundTimeouts = React.useCallback(() => {
        if (burstTimeoutRef.current !== null) {
            window.clearTimeout(burstTimeoutRef.current);
            burstTimeoutRef.current = null;
        }
        if (resolveTimeoutRef.current !== null) {
            window.clearTimeout(resolveTimeoutRef.current);
            resolveTimeoutRef.current = null;
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
        clearRoundTimeouts();
        roundTokenRef.current += 1;
        let nextPlan = createRoundPlan();
        let nextSignature = getRoundSignature(nextPlan);
        let attempts = 0;

        while (
            prevRoundSignatureRef.current
            && nextSignature === prevRoundSignatureRef.current
            && attempts < 8
        ) {
            nextPlan = createRoundPlan();
            nextSignature = getRoundSignature(nextPlan);
            attempts += 1;
        }

        prevRoundSignatureRef.current = nextSignature;

        baseCellCountRef.current = nextPlan.baseCount;
        setCellCount(nextPlan.baseCount);
        setCellColor('neutral');
        setReagentOptions(nextPlan.options);
        setRoundTarget({
            color: nextPlan.targetColor,
            multiplier: nextPlan.targetMultiplier,
            result: nextPlan.baseCount * nextPlan.targetMultiplier
        });
        setProducedResult(null);
        setIsCellBursting(false);
        setIsResolving(false);
        setIsRoundReady(true);
    }, [clearRoundTimeouts]);

    React.useEffect(() => {
        const prev = prevGameStateRef.current;
        if (engine.gameState === 'playing' && (prev === 'idle' || prev === 'gameover')) {
            setIsRoundReady(false);
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
        }
        prevGameStateRef.current = engine.gameState;
    }, [
        clearDragHintTimers,
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

    React.useEffect(() => {
        if (!isDragging) return;

        const handlePointerMove = (event: PointerEvent) => {
            const x = event.clientX;
            const y = event.clientY;
            setDragState((prev) => (prev ? { ...prev, x, y } : prev));

            if (!coreRef.current) return;
            const rect = coreRef.current.getBoundingClientRect();
            const inside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
            setIsDropTargetActive(inside);
        };

        const handlePointerUp = (event: PointerEvent) => {
            const x = event.clientX;
            const y = event.clientY;
            const currentDragOption = dragOptionRef.current;

            let droppedInCore = false;
            if (coreRef.current) {
                const rect = coreRef.current.getBoundingClientRect();
                droppedInCore = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
            }

            if (currentDragOption && droppedInCore && roundTarget && !isResolving && engine.gameState === 'playing') {
                setIsResolving(true);
                const currentRoundToken = roundTokenRef.current;
                const fixedBase = baseCellCountRef.current;
                const nextCount = Math.min(fixedBase * currentDragOption.multiplier, 99);
                const isCorrect = currentDragOption.color === roundTarget.color
                    && nextCount === roundTarget.result
                    && currentDragOption.multiplier === roundTarget.multiplier;

                setCellColor(currentDragOption.color);
                setCellCount(nextCount);
                setProducedResult({
                    color: currentDragOption.color,
                    result: nextCount
                });
                setIsCellBursting(true);
                burstTimeoutRef.current = window.setTimeout(() => {
                    if (roundTokenRef.current !== currentRoundToken || engine.gameState !== 'playing') return;

                    setIsCellBursting(false);
                    resolveTimeoutRef.current = window.setTimeout(() => {
                        if (roundTokenRef.current !== currentRoundToken || engine.gameState !== 'playing') return;

                        if (isCorrect) {
                            const nextCombo = engine.combo + 1;
                            if (nextCombo % 3 === 0 && Math.random() > 0.45) {
                                const rewardTypes: Array<'timeFreeze' | 'extraLife' | 'doubleScore'> = ['timeFreeze', 'extraLife', 'doubleScore'];
                                const reward = rewardTypes[Math.floor(Math.random() * rewardTypes.length)];
                                engine.setPowerUps((prev) => ({ ...prev, [reward]: prev[reward] + 1 }));
                            }
                        }

                        engine.submitAnswer(isCorrect);
                        engine.registerEvent({ type: isCorrect ? 'correct' : 'wrong' });
                        setProducedResult(null);

                        resolveTimeoutRef.current = window.setTimeout(() => {
                            if (roundTokenRef.current !== currentRoundToken || engine.gameState !== 'playing') return;
                            if (isCorrect) {
                                // Correct: always generate a brand-new round from random base cells (1~9)
                                prepareRound();
                                return;
                            }
                            // Wrong: keep the same target/options and reset cells to this round's initial state
                            setCellColor('neutral');
                            setCellCount(baseCellCountRef.current);
                            setIsResolving(false);
                        }, FEEDBACK_DELAY_MS);
                    }, JUDGE_DELAY_AFTER_BURST_MS);
                }, CELL_BURST_DURATION_MS);
            }

            dragOptionRef.current = null;
            setDragState(null);
            setIsDropTargetActive(false);
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [engine, isDragging, isResolving, prepareRound, roundTarget]);

    React.useEffect(() => () => {
        clearRoundTimeouts();
        clearDragHintTimers();
    }, [clearDragHintTimers, clearRoundTimeouts]);

    const handleReagentPointerDown = React.useCallback(
        (event: React.PointerEvent<HTMLButtonElement>, option: ReagentOption) => {
            if (engine.gameState !== 'playing' || isResolving) return;
            event.preventDefault();
            hideDragHintOverlay(true);
            dragOptionRef.current = option;
            setDragState({ option, x: event.clientX, y: event.clientY });
        },
        [engine.gameState, hideDragHintOverlay, isResolving]
    );

    const powerUps = React.useMemo(() => ([
        {
            count: engine.powerUps.timeFreeze,
            color: 'blue' as const,
            icon: '❄️',
            title: t('games.cell-clone.powerups.timeFreeze'),
            onClick: () => engine.activatePowerUp('timeFreeze'),
            disabledConfig: engine.isTimeFrozen,
            status: engine.isTimeFrozen ? 'active' as const : 'normal' as const
        },
        {
            count: engine.powerUps.extraLife,
            color: 'red' as const,
            icon: '❤️',
            title: t('games.cell-clone.powerups.extraLife'),
            onClick: () => engine.activatePowerUp('extraLife'),
            disabledConfig: engine.lives >= 3,
            status: engine.lives >= 3 ? 'maxed' as const : 'normal' as const
        },
        {
            count: engine.powerUps.doubleScore,
            color: 'yellow' as const,
            icon: '⚡',
            title: t('games.cell-clone.powerups.doubleScore'),
            onClick: () => engine.activatePowerUp('doubleScore'),
            disabledConfig: engine.isDoubleScore,
            status: engine.isDoubleScore ? 'active' as const : 'normal' as const
        }
    ]), [engine, t]);

    const instructions = React.useMemo(() => ([
        {
            icon: '🧫',
            title: t('games.cell-clone.howToPlay.step1.title'),
            description: t('games.cell-clone.howToPlay.step1.description')
        },
        {
            icon: '🧪',
            title: t('games.cell-clone.howToPlay.step2.title'),
            description: t('games.cell-clone.howToPlay.step2.description')
        },
        {
            icon: '🖐️',
            title: t('games.cell-clone.howToPlay.step3.title'),
            description: t('games.cell-clone.howToPlay.step3.description')
        }
    ]), [t]);

    return (
        <Layout2
            gameId={GameIds.MATH_CELL_CLONE}
            title={t('games.cell-clone.title')}
            subtitle={t('games.cell-clone.subtitle')}
            description={t('games.cell-clone.description')}
            instructions={instructions}
            engine={engine}
            onExit={onExit}
            powerUps={powerUps}
            className="cell-clone-layout2"
            cardBackground={<div className="cell-clone-card-bg" />}
        >
            <div className="cell-clone-shell">
                {roundTarget && (
                    <div className="cell-clone-target-panel">
                        <div className="cell-clone-target-badge">
                            <span className={`cell-clone-target-dot is-${roundTarget.color}`} />
                            <span className="cell-clone-target-value">{roundTarget.result}</span>
                        </div>
                        <div className="cell-clone-target-badge">
                            <span className={`cell-clone-target-dot ${producedResult ? `is-${producedResult.color}` : 'is-neutral'}`} />
                            <span className="cell-clone-target-value">{producedResult ? producedResult.result : '—'}</span>
                        </div>
                    </div>
                )}
                <div className="cell-clone-main">
                    {isRoundReady && (
                        <div
                            ref={coreRef}
                            className={`cell-clone-core ${isDropTargetActive ? 'is-drop-target' : ''} ${isCellBursting ? 'is-bursting' : ''} is-${cellColor}`}
                            aria-label={t('games.cell-clone.description')}
                        >
                            <div
                                className="cell-clone-cluster"
                                style={{ '--cluster-scale': clusterScale } as React.CSSProperties}
                            >
                                {cellPositions.map(([x, y], idx) => (
                                    <div
                                        key={`cell-${idx}`}
                                        className="cell-clone-cell"
                                        style={
                                            {
                                            '--x': `${x}px`,
                                            '--y': `${y}px`,
                                            '--delay': `${(idx % 12) * 70}ms`
                                        } as React.CSSProperties
                                    }
                                />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="cell-clone-reagents-tray">
                    {showDragHintOverlay && (
                        <div className={`cell-clone-drag-hint-overlay ${isDragHintExiting ? 'is-exiting' : ''}`} aria-hidden="true">
                            <span className="cell-clone-drag-hint-text">{t('games.cell-clone.ui.dragDropHint')}</span>
                        </div>
                    )}
                    <span className="cell-clone-scientist" aria-hidden>
                        {scientistEmoji}
                    </span>
                    <div className="cell-clone-reagents" aria-label="reagent-options">
                        {reagentOptions.map((option) => (
                            <button
                                key={option.id}
                                type="button"
                                className={`cell-clone-reagent-btn is-${option.color}`}
                                onPointerDown={(event) => handleReagentPointerDown(event, option)}
                                disabled={isResolving}
                            >
                                <span className="cell-clone-reagent-color" />
                                <span className="cell-clone-reagent-multiplier">x{option.multiplier}</span>
                            </button>
                        ))}
                    </div>
                </div>
                {dragState && (
                    <div
                        className={`cell-clone-drag-preview is-${dragState.option.color}`}
                        style={{
                            left: dragState.x,
                            top: dragState.y
                        }}
                    >
                        <span className="cell-clone-reagent-color" />
                        <span className="cell-clone-reagent-multiplier">x{dragState.option.multiplier}</span>
                    </div>
                )}
            </div>
        </Layout2>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const manifest: GameManifest = {
    id: GameIds.MATH_CELL_CLONE,
    title: '세포복제',
    titleKey: 'games.cell-clone.title',
    subtitle: '2단 · 4단 마스터',
    subtitleKey: 'games.cell-clone.subtitle',
    description: '2단과 4단을 연습하는 게임입니다.',
    descriptionKey: 'games.cell-clone.description',
    category: 'math',
    level: 3,
    mode: 'adventure',
    component: CellClone,
    thumbnail: '🧫',
    tagsKey: 'games.tags.multiplication'
};
