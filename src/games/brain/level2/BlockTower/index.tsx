import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layout2 } from '../../../layouts/Standard/Layout2';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';
import { BlobBackground } from '../../../math/components/BlobBackground';
import { GameIds } from '../../../../constants/gameIds';
import './BlockTower.css';

interface BlockTowerProps {
    onExit: () => void;
}

interface Problem {
    bundleSize: number;
    symbol: string;
    color: string;
}

interface SettledPiece {
    id: number;
    row: number;
    startCol: number;
    size: number;
    symbol: string;
    color: string;
}

const GRID_ROWS = 10;
const GRID_COLS = 10;
const FALL_STEP_MS = 55;
const ARM_SPEED_COLS_PER_SEC = 2.8;

const createEmptyGrid = (): boolean[][] =>
    Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(false));

const BLOCK_SYMBOLS = ['🟥', '🟧', '🟨', '🟩', '🟦'] as const;
const BLOCK_COLORS = ['#ef4444', '#fb923c', '#facc15', '#22c55e', '#3b82f6'] as const;
const MIN_BUNDLE_SIZE = 1;
const MAX_BUNDLE_SIZE = 5;

const createProblem = (prev?: Problem): Problem => {
    const prevSize = prev?.bundleSize ?? -1;
    let nextSize = MIN_BUNDLE_SIZE + Math.floor(Math.random() * MAX_BUNDLE_SIZE);
    if (nextSize === prevSize) {
        nextSize = (nextSize % MAX_BUNDLE_SIZE) + 1;
    }
    return {
        bundleSize: nextSize,
        symbol: BLOCK_SYMBOLS[nextSize - 1],
        color: BLOCK_COLORS[nextSize - 1]
    };
};

const clamp = (value: number, min: number, max: number): number =>
    Math.max(min, Math.min(max, value));

const findTopFilledRow = (grid: boolean[][], col: number): number => {
    for (let row = 0; row < GRID_ROWS; row += 1) {
        if (grid[row][col]) return row;
    }
    return GRID_ROWS;
};

const getLandingRow = (grid: boolean[][], startCol: number, width: number): number => {
    const safeWidth = clamp(width, 1, GRID_COLS);
    const safeStartCol = clamp(startCol, 0, GRID_COLS - safeWidth);
    let minTopFilled = GRID_ROWS;
    for (let c = safeStartCol; c < safeStartCol + safeWidth; c += 1) {
        minTopFilled = Math.min(minTopFilled, findTopFilledRow(grid, c));
    }
    return minTopFilled - 1;
};

const placeBundle = (grid: boolean[][], row: number, startCol: number, width: number): boolean[][] => {
    const safeWidth = clamp(width, 1, GRID_COLS);
    const safeStartCol = clamp(startCol, 0, GRID_COLS - safeWidth);
    const next = grid.map((line) => line.slice(0, GRID_COLS));
    for (let c = safeStartCol; c < safeStartCol + safeWidth; c += 1) {
        next[row][c] = true;
    }
    return next;
};

const getBaseCenterCols = (grid: boolean[][]): number[] => {
    const row1Cols = Array.from({ length: GRID_COLS }, (_, col) => col).filter((col) => grid[GRID_ROWS - 1][col]);
    if (row1Cols.length === 0) return [];

    const baseMin = Math.min(...row1Cols);
    const baseMax = Math.max(...row1Cols);
    const baseWidth = baseMax - baseMin + 1;
    const leftCenterOffset = Math.floor((baseWidth - 1) / 2);
    const rightCenterOffset = Math.floor(baseWidth / 2);

    const centerCols = [baseMin + leftCenterOffset, baseMin + rightCenterOffset];
    return Array.from(new Set(centerCols));
};

interface TowerMetrics {
    baseCols: number[];
    totalBlocks: number;
    weightedXSum: number;
    topMostRow: number;
}

const getTowerMetrics = (grid: boolean[][]): TowerMetrics => {
    const baseCols = Array.from({ length: GRID_COLS }, (_, col) => col).filter((col) => grid[GRID_ROWS - 1][col]);

    let totalBlocks = 0;
    let weightedXSum = 0;
    let topMostRow = GRID_ROWS - 1;

    for (let row = 0; row < GRID_ROWS; row += 1) {
        for (let col = 0; col < GRID_COLS; col += 1) {
            if (!grid[row][col]) continue;
            totalBlocks += 1;
            weightedXSum += col + 0.5;
            if (row < topMostRow) topMostRow = row;
        }
    }

    return { baseCols, totalBlocks, weightedXSum, topMostRow };
};

const isStackStable = (grid: boolean[][]): boolean => {
    const { baseCols, totalBlocks, weightedXSum, topMostRow } = getTowerMetrics(grid);
    if (baseCols.length === 0) return false;

    // Row-by-row rigid-body check:
    // each row's COM must be inside the horizontal span of its contact points
    // with the row directly below.
    for (let row = GRID_ROWS - 2; row >= 0; row -= 1) {
        const rowCols = Array.from({ length: GRID_COLS }, (_, col) => col).filter((col) => grid[row][col]);
        if (rowCols.length === 0) continue;

        const supportContacts = rowCols.filter((col) => grid[row + 1][col]);
        if (supportContacts.length === 0) return false;

        const rowComX = rowCols.reduce((sum, col) => sum + (col + 0.5), 0) / rowCols.length;
        const supportMinX = Math.min(...supportContacts);
        const supportMaxX = Math.max(...supportContacts) + 1;
        if (rowComX < supportMinX || rowComX > supportMaxX) return false;
    }

    // Global COM check over bottom support.
    // As tower gets taller, we tighten the effective support span slightly.
    const baseSupportMinX = Math.min(...baseCols);
    const baseSupportMaxX = Math.max(...baseCols) + 1;
    const baseSupportWidth = baseSupportMaxX - baseSupportMinX;

    if (totalBlocks === 0) return false;

    const centerOfMassX = weightedXSum / totalBlocks;
    const towerHeight = GRID_ROWS - topMostRow;

    const shrinkByHeight = Math.max(0, towerHeight - 1) * 0.04;
    const maxShrink = Math.max(0, (baseSupportWidth - 0.5) / 2);
    const appliedShrink = Math.min(shrinkByHeight, maxShrink);

    const effectiveMinX = baseSupportMinX + appliedShrink;
    const effectiveMaxX = baseSupportMaxX - appliedShrink;
    if (centerOfMassX < effectiveMinX || centerOfMassX > effectiveMaxX) return false;

    return true;
};

type BalanceStatus = 'good' | 'normal' | 'risk';

const getBalanceStatus = (grid: boolean[][]): BalanceStatus => {
    const { baseCols, totalBlocks, weightedXSum, topMostRow } = getTowerMetrics(grid);
    if (baseCols.length === 0) return 'normal';
    if (!isStackStable(grid)) return 'risk';
    if (totalBlocks === 0) return 'normal';

    const baseMinX = Math.min(...baseCols);
    const baseMaxX = Math.max(...baseCols) + 1;
    const supportWidth = baseMaxX - baseMinX;
    const towerHeight = GRID_ROWS - topMostRow;
    const shrinkByHeight = Math.max(0, towerHeight - 1) * 0.04;
    const maxShrink = Math.max(0, (supportWidth - 0.5) / 2);
    const appliedShrink = Math.min(shrinkByHeight, maxShrink);
    const effectiveMinX = baseMinX + appliedShrink;
    const effectiveMaxX = baseMaxX - appliedShrink;
    const effectiveWidth = Math.max(0.0001, effectiveMaxX - effectiveMinX);

    const comX = weightedXSum / totalBlocks;
    const edgeDistance = Math.min(comX - effectiveMinX, effectiveMaxX - comX);
    const normalized = edgeDistance / (effectiveWidth / 2);

    if (normalized <= 0.22) return 'risk';
    if (normalized <= 0.5) return 'normal';
    return 'good';
};

const getPredictedBalanceStatus = (grid: boolean[][], startCol: number, bundleSize: number): BalanceStatus => {
    const landingRow = getLandingRow(grid, startCol, bundleSize);
    if (landingRow < 0) return 'risk';
    if (grid[landingRow].some(Boolean)) return 'risk';

    const simulatedGrid = placeBundle(grid, landingRow, startCol, bundleSize);
    if (!isStackStable(simulatedGrid)) return 'risk';
    return getBalanceStatus(simulatedGrid);
};

export const BlockTower: React.FC<BlockTowerProps> = ({ onExit }) => {
    const { t } = useTranslation();

    const engine = useGameEngine({
        initialLives: 3,
        initialTime: 90,
        maxDifficulty: 3
    });

    const [problem, setProblem] = React.useState<Problem>(() => createProblem());
    const [nextProblem, setNextProblem] = React.useState<Problem>(() => createProblem());
    const [armCol, setArmCol] = React.useState(0);
    const [isDropping, setIsDropping] = React.useState(false);
    const [activePiece, setActivePiece] = React.useState<{ row: number; startCol: number; size: number; symbol: string; color: string } | null>(null);
    const [settledPieces, setSettledPieces] = React.useState<SettledPiece[]>([]);
    const [isCollapsing, setIsCollapsing] = React.useState(false);
    const [isRoundClearing, setIsRoundClearing] = React.useState(false);
    const [showClickDropHint, setShowClickDropHint] = React.useState(false);
    const [isClickDropHintExiting, setIsClickDropHintExiting] = React.useState(false);
    const [gridCellHeightPx, setGridCellHeightPx] = React.useState(0);

    const boardRef = React.useRef<HTMLDivElement | null>(null);
    const carriageRef = React.useRef<HTMLDivElement | null>(null);
    const gridRef = React.useRef<boolean[][]>(createEmptyGrid());
    const problemRef = React.useRef(problem);
    const nextProblemRef = React.useRef(nextProblem);
    const prevGameStateRef = React.useRef(engine.gameState);
    const fallTimerRef = React.useRef<number | null>(null);
    const roundTimerRef = React.useRef<number | null>(null);
    const pieceIdRef = React.useRef(0);
    const armColRef = React.useRef(0);
    const armDirRef = React.useRef<1 | -1>(1);
    const armRafRef = React.useRef<number | null>(null);
    const armLastTsRef = React.useRef(0);
    const snappedArmColRef = React.useRef(0);
    const hasShownClickDropHintRef = React.useRef(false);
    const clickDropHintTimerRef = React.useRef<number | null>(null);
    const clickDropHintExitTimerRef = React.useRef<number | null>(null);

    React.useEffect(() => {
        problemRef.current = problem;
    }, [problem]);

    React.useEffect(() => {
        nextProblemRef.current = nextProblem;
    }, [nextProblem]);

    const clearTimers = React.useCallback(() => {
        if (fallTimerRef.current != null) {
            window.clearTimeout(fallTimerRef.current);
            fallTimerRef.current = null;
        }
        if (roundTimerRef.current != null) {
            window.clearTimeout(roundTimerRef.current);
            roundTimerRef.current = null;
        }
        if (clickDropHintTimerRef.current != null) {
            window.clearTimeout(clickDropHintTimerRef.current);
            clickDropHintTimerRef.current = null;
        }
        if (clickDropHintExitTimerRef.current != null) {
            window.clearTimeout(clickDropHintExitTimerRef.current);
            clickDropHintExitTimerRef.current = null;
        }
    }, []);

    const resetBoard = React.useCallback((nextProblem?: Problem) => {
        const targetProblem = nextProblem ?? problemRef.current;
        const maxStartCol = Math.max(0, GRID_COLS - targetProblem.bundleSize);
        const startArmCol = Math.floor(maxStartCol / 2);
        gridRef.current = createEmptyGrid();
        setIsDropping(false);
        setActivePiece(null);
        setSettledPieces([]);
        setArmCol(startArmCol);
        armColRef.current = startArmCol;
        armDirRef.current = 1;
        armLastTsRef.current = 0;
        setIsCollapsing(false);
        setIsRoundClearing(false);
    }, []);

    const startNewProblem = React.useCallback(() => {
        const current = createProblem(problemRef.current);
        const upcoming = createProblem(current);
        setProblem(current);
        problemRef.current = current;
        setNextProblem(upcoming);
        nextProblemRef.current = upcoming;
        resetBoard(current);
    }, [resetBoard]);

    React.useEffect(() => {
        const prev = prevGameStateRef.current;
        const enteredPlaying = engine.gameState === 'playing' && (prev === 'idle' || prev === 'gameover');
        if (enteredPlaying) {
            clearTimers();
            startNewProblem();
            const isFirstQuestion = engine.score === 0 && engine.stats.correct === 0 && engine.stats.wrong === 0;
            if (isFirstQuestion && !hasShownClickDropHintRef.current) {
                hasShownClickDropHintRef.current = true;
                setShowClickDropHint(true);
                setIsClickDropHintExiting(false);
                clickDropHintTimerRef.current = window.setTimeout(() => {
                    setIsClickDropHintExiting(true);
                    clickDropHintExitTimerRef.current = window.setTimeout(() => {
                        setShowClickDropHint(false);
                        setIsClickDropHintExiting(false);
                        clickDropHintExitTimerRef.current = null;
                    }, 220);
                    clickDropHintTimerRef.current = null;
                }, 1800);
            } else {
                setShowClickDropHint(false);
                setIsClickDropHintExiting(false);
            }
            const wrapper = document.querySelector('.ice-stacking-layout2 .layout2-grid-wrapper');
            if (wrapper instanceof HTMLElement) {
                wrapper.scrollTop = 0;
            }
        }
        prevGameStateRef.current = engine.gameState;
    }, [engine.gameState, clearTimers, engine.score, engine.stats.correct, engine.stats.wrong, startNewProblem]);

    React.useEffect(() => {
        if (engine.gameState !== 'gameover') return;
        setShowClickDropHint(false);
        setIsClickDropHintExiting(false);
        hasShownClickDropHintRef.current = false;
    }, [engine.gameState]);

    React.useEffect(() => {
        return () => clearTimers();
    }, [clearTimers]);

    React.useEffect(() => {
        const board = boardRef.current;
        if (!board) return;

        const updateCellSize = () => {
            const rect = board.getBoundingClientRect();
            const next = rect.height > 0 ? rect.height / GRID_ROWS : 0;
            setGridCellHeightPx(next);
        };

        updateCellSize();

        if (typeof ResizeObserver === 'undefined') {
            window.addEventListener('resize', updateCellSize);
            return () => window.removeEventListener('resize', updateCellSize);
        }

        const observer = new ResizeObserver(updateCellSize);
        observer.observe(board);
        return () => observer.disconnect();
    }, []);

    const snappedArmCol = React.useMemo(() => {
        const maxStartCol = Math.max(0, GRID_COLS - problem.bundleSize);
        return clamp(Math.round(armCol), 0, maxStartCol);
    }, [armCol, problem.bundleSize]);

    React.useEffect(() => {
        snappedArmColRef.current = snappedArmCol;
    }, [snappedArmCol]);

    const triggerCollapseFail = React.useCallback(() => {
        setActivePiece(null);
        setIsDropping(false);
        setIsCollapsing(true);
        roundTimerRef.current = window.setTimeout(() => {
            engine.submitAnswer(false, { skipDifficulty: true, skipFeedback: true });
            engine.registerEvent({ type: 'wrong' } as any);
            const next = createProblem(problemRef.current);
            setProblem(next);
            problemRef.current = next;
            const upcoming = createProblem(next);
            setNextProblem(upcoming);
            nextProblemRef.current = upcoming;
            resetBoard(next);
        }, 520);
    }, [engine, resetBoard]);

    React.useEffect(() => {
        if (engine.gameState !== 'playing' || isDropping || isCollapsing || isRoundClearing) {
            if (armRafRef.current != null) {
                cancelAnimationFrame(armRafRef.current);
                armRafRef.current = null;
            }
            return;
        }

        const maxStartCol = Math.max(0, GRID_COLS - problem.bundleSize);
        if (maxStartCol <= 0) {
            setArmCol(0);
            armColRef.current = 0;
            return;
        }

        const animate = (ts: number) => {
            if (armLastTsRef.current === 0) {
                armLastTsRef.current = ts;
            }

            const dtSec = Math.min(0.05, (ts - armLastTsRef.current) / 1000);
            armLastTsRef.current = ts;

            let next = armColRef.current + armDirRef.current * ARM_SPEED_COLS_PER_SEC * dtSec;
            if (next <= 0) {
                next = 0;
                armDirRef.current = 1;
            } else if (next >= maxStartCol) {
                next = maxStartCol;
                armDirRef.current = -1;
            }

            armColRef.current = next;
            setArmCol(next);
            armRafRef.current = requestAnimationFrame(animate);
        };

        armRafRef.current = requestAnimationFrame(animate);

        return () => {
            if (armRafRef.current != null) {
                cancelAnimationFrame(armRafRef.current);
                armRafRef.current = null;
            }
        };
    }, [engine.gameState, isDropping, isCollapsing, isRoundClearing, problem.bundleSize]);

    const computeDropStartCol = React.useCallback((bundleSize: number): number => {
        let startCol = clamp(snappedArmColRef.current, 0, GRID_COLS - bundleSize);
        if (!boardRef.current || !carriageRef.current) return startCol;

        const boardRect = boardRef.current.getBoundingClientRect();
        const carriageRect = carriageRef.current.getBoundingClientRect();
        const cellWidth = boardRect.width / GRID_COLS;
        if (cellWidth <= 0) return startCol;

        const visualStartCol = Math.round((carriageRect.left - boardRect.left) / cellWidth);
        return clamp(visualStartCol, 0, GRID_COLS - bundleSize);
    }, []);

    const finalizeLanding = React.useCallback((landingRow: number, startCol: number, currentProblem: Problem): boolean => {
        // Rule: each row can contain only one placed bundle.
        if (gridRef.current[landingRow].some(Boolean)) {
            triggerCollapseFail();
            return false;
        }

        const nextGrid = placeBundle(gridRef.current, landingRow, startCol, currentProblem.bundleSize);
        gridRef.current = nextGrid;
        setSettledPieces((prev) => [
            ...prev,
            {
                id: pieceIdRef.current++,
                row: landingRow,
                startCol,
                size: currentProblem.bundleSize,
                symbol: currentProblem.symbol,
                color: currentProblem.color
            }
        ]);
        setActivePiece(null);
        setIsDropping(false);

        const stableNow = isStackStable(nextGrid);
        if (!stableNow) {
            triggerCollapseFail();
            return false;
        }

        const reachedTop = nextGrid[0].some(Boolean);
        if (reachedTop) {
            setIsRoundClearing(true);
            engine.submitAnswer(true, { skipDifficulty: true });
            engine.registerEvent({ type: 'correct', isFinal: true } as any);
            roundTimerRef.current = window.setTimeout(() => {
                startNewProblem();
            }, 850);
            return true;
        }

        engine.submitAnswer(true, { skipDifficulty: true, skipFeedback: true });
        engine.registerEvent({ type: 'correct', isFinal: false } as any);

        const upcoming = nextProblemRef.current;
        setProblem(upcoming);
        problemRef.current = upcoming;
        const generatedNext = createProblem(upcoming);
        setNextProblem(generatedNext);
        nextProblemRef.current = generatedNext;
        return true;
    }, [engine, startNewProblem, triggerCollapseFail]);

    const runFallAnimation = React.useCallback((landingRow: number, startCol: number, currentProblem: Problem) => {
        let animatedRow = -1;
        setActivePiece({ row: animatedRow, startCol, size: currentProblem.bundleSize, symbol: currentProblem.symbol, color: currentProblem.color });

        const tick = () => {
            if (animatedRow < landingRow) {
                animatedRow += 1;
                setActivePiece({ row: animatedRow, startCol, size: currentProblem.bundleSize, symbol: currentProblem.symbol, color: currentProblem.color });
                fallTimerRef.current = window.setTimeout(tick, FALL_STEP_MS);
                return;
            }
            fallTimerRef.current = null;
            finalizeLanding(landingRow, startCol, currentProblem);
        };

        tick();
    }, [finalizeLanding]);

    const dropBundle = React.useCallback(() => {
        if (engine.gameState !== 'playing' || isDropping || isCollapsing || isRoundClearing) return;

        const currentProblem = problemRef.current;
        const startCol = computeDropStartCol(currentProblem.bundleSize);
        const landingRow = getLandingRow(gridRef.current, startCol, currentProblem.bundleSize);

        if (landingRow < 0) {
            triggerCollapseFail();
            return;
        }

        setIsDropping(true);
        runFallAnimation(landingRow, startCol, currentProblem);
    }, [computeDropStartCol, engine.gameState, isCollapsing, isDropping, isRoundClearing, runFallAnimation, triggerCollapseFail]);

    const centerHintCols = React.useMemo(() => getBaseCenterCols(gridRef.current), [settledPieces]);
    const balanceStatus = React.useMemo(
        () => getPredictedBalanceStatus(gridRef.current, snappedArmCol, problem.bundleSize),
        [settledPieces, snappedArmCol, problem.bundleSize]
    );

    return (
        <Layout2
            title={t('games.block-tower.title')}
            subtitle={t('games.block-tower.subtitle')}
            description={t('games.block-tower.description')}
            gameId={GameIds.BRAIN_BLOCK_TOWER}
            engine={engine}
            onExit={onExit}
            className="ice-stacking-layout2"
            powerUps={[]}
            instructions={[
                {
                    icon: '👆',
                    title: t('games.block-tower.howToPlay.step1.title'),
                    description: t('games.block-tower.howToPlay.step1.description')
                },
                {
                    icon: '⚖️',
                    title: t('games.block-tower.howToPlay.step2.title'),
                    description: t('games.block-tower.howToPlay.step2.description')
                },
                {
                    icon: '🏗️',
                    title: t('games.block-tower.howToPlay.step3.title'),
                    description: t('games.block-tower.howToPlay.step3.description')
                }
            ]}
            cardBackground={<BlobBackground colors={{ blob1: '#e0f2fe', blob2: '#f0f9ff', blob3: '#bae6fd', blob4: '#7dd3fc' }} />}
        >
            <div className="ice-stacking-shell">
                <section className="ice-order-card" aria-label="order card">
                    <div className="ice-order-row">
                        <div className="ice-balance-panel" aria-label={t('games.block-tower.ui.balanceStatus')}>
                            <div className="ice-panel-title">{t('games.block-tower.ui.balanceStatus')}</div>
                            <div className="ice-balance-dots">
                                <span
                                    className={`ice-balance-dot is-good ${balanceStatus === 'good' ? 'is-active' : ''}`}
                                    title={t('games.block-tower.ui.good')}
                                />
                                <span
                                    className={`ice-balance-dot is-normal ${balanceStatus === 'normal' ? 'is-active' : ''}`}
                                    title={t('games.block-tower.ui.normal')}
                                />
                                <span
                                    className={`ice-balance-dot is-risk ${balanceStatus === 'risk' ? 'is-active' : ''}`}
                                    title={t('games.block-tower.ui.risk')}
                                />
                            </div>
                        </div>

                        <div className="ice-next-panel" aria-label={t('games.block-tower.ui.nextBlock')}>
                            <div className="ice-panel-title">{t('games.block-tower.ui.nextBlock')}</div>
                            <div
                                className="ice-next-piece"
                                style={{
                                    '--piece-color': nextProblem.color,
                                    '--next-cols': nextProblem.bundleSize,
                                    '--next-width': `${(nextProblem.bundleSize / MAX_BUNDLE_SIZE) * 100}%`
                                } as React.CSSProperties}
                            >
                                {Array.from({ length: nextProblem.bundleSize }).map((_, idx) => (
                                    <span key={idx} className="ice-next-cube" />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="ice-grid-panel" aria-label="stack grid" onPointerDown={dropBundle}>
                    <div className="ice-bundle-launcher">
                        <div className="ice-y-spacer" aria-hidden="true" />
                        <div className="ice-arm-lane" aria-hidden="true">
                            <div className="ice-robot-rail" />
                            <div
                                ref={carriageRef}
                                className="ice-carriage"
                                style={{
                                    '--arm-col': armCol,
                                    '--bundle-size': problem.bundleSize,
                                    '--bundle-cols': problem.bundleSize,
                                    '--grid-cell-h': `${Math.max(26, gridCellHeightPx)}px`,
                                    '--piece-color': problem.color
                                } as React.CSSProperties}
                            >
                                <div className="ice-robot-arm">
                                    <div className="ice-robot-head" />
                                    <div className="ice-robot-line" />
                                </div>
                                <div className="ice-source-piece ice-source-bundle-flat">
                                    {Array.from({ length: problem.bundleSize }).map((_, idx) => (
                                        <span key={idx} className="ice-cube ice-source-cube" aria-hidden="true" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="ice-grid-frame">
                        <div className="ice-y-axis" aria-hidden="true">
                            {Array.from({ length: GRID_ROWS }).map((_, idx) => (
                                <span key={idx}>{GRID_ROWS - idx}</span>
                            ))}
                        </div>

                        <div
                            ref={boardRef}
                            className="ice-grid-board"
                        >
                            {centerHintCols.map((col) => (
                                <div
                                    key={`center-hint-${col}`}
                                    className="ice-center-hint-column"
                                    style={{ '--center-col': col } as React.CSSProperties}
                                />
                            ))}

                            {Array.from({ length: GRID_ROWS }).map((_, row) => (
                                <React.Fragment key={`row-${row}`}>
                                    {Array.from({ length: GRID_COLS }).map((__, col) => {
                                        const inGhost =
                                            !isDropping &&
                                            row === 0 &&
                                            col >= snappedArmCol &&
                                            col < snappedArmCol + problem.bundleSize;

                                        return (
                                            <div
                                                key={`cell-${row}-${col}`}
                                                className={`ice-cell${inGhost ? ' ghost' : ''}`}
                                            />
                                        );
                                    })}
                                </React.Fragment>
                            ))}

                            {settledPieces.map((piece, idx) => (
                                <div
                                    key={piece.id}
                                    className={`ice-settled-piece${isCollapsing ? ' collapsing' : ''}`}
                                    style={{
                                        '--piece-col': piece.startCol,
                                        '--piece-row': piece.row,
                                        '--piece-size': piece.size,
                                        '--collapse-index': idx,
                                        '--piece-color': piece.color
                                    } as React.CSSProperties}
                                >
                                    {Array.from({ length: piece.size }).map((_, idx) => (
                                        <span key={idx} className="ice-cube">{piece.symbol}</span>
                                    ))}
                                </div>
                            ))}

                            {activePiece && (
                                <div
                                    className="ice-falling-piece"
                                    style={{
                                        '--piece-col': activePiece.startCol,
                                        '--piece-row': activePiece.row,
                                        '--piece-size': activePiece.size,
                                        '--piece-color': activePiece.color
                                    } as React.CSSProperties}
                                >
                                    {Array.from({ length: activePiece.size }).map((_, idx) => (
                                        <span key={idx} className="ice-cube">{activePiece.symbol}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {showClickDropHint && (
                    <div className={`ice-click-drop-hint ${isClickDropHintExiting ? 'is-exiting' : ''}`}>
                        {t('games.block-tower.ui.clickDropHint')}
                    </div>
                )}
            </div>
        </Layout2>
    );
};

export default BlockTower;
