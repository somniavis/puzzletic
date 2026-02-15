import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layout2 } from '../../../../layouts/Standard/Layout2';
import { useGameEngine } from '../../../../layouts/Standard/Layout0/useGameEngine';
import { BlobBackground } from '../../../components/BlobBackground';
import { GameIds } from '../../../../../constants/gameIds';
import './IceStacking.css';

interface IceStackingProps {
    onExit: () => void;
}

interface Problem {
    bundleSize: number;
    boxCount: number;
    target: number;
}

interface SettledPiece {
    id: number;
    row: number;
    startCol: number;
    size: number;
}

const GRID_ROWS = 10;
const GRID_COLS = 10;
const FALL_STEP_MS = 55;
const ARM_SPEED_COLS_PER_SEC = 2.8;

const createEmptyGrid = (): boolean[][] =>
    Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(false));

const PROBLEM_CANDIDATES: Problem[] = (() => {
    const candidates: Problem[] = [];
    for (let bundleSize = 1; bundleSize <= 9; bundleSize += 1) {
        for (let boxCount = 2; boxCount <= 10; boxCount += 1) {
            const target = bundleSize * boxCount;
            candidates.push({ bundleSize, boxCount, target });
        }
    }
    return candidates;
})();

const isSameProblem = (a: Problem, b: Problem): boolean =>
    a.bundleSize === b.bundleSize && a.boxCount === b.boxCount;

const createProblem = (prev?: Problem): Problem => {
    const pool = prev
        ? PROBLEM_CANDIDATES.filter((candidate) => !isSameProblem(candidate, prev))
        : PROBLEM_CANDIDATES;
    const finalPool = pool.length > 0 ? pool : PROBLEM_CANDIDATES;
    return finalPool[Math.floor(Math.random() * finalPool.length)];
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

const isStackStable = (grid: boolean[][]): boolean => {
    // Base center is determined ONLY by row 1 (bottom row) bundle cells.
    const centerCols = new Set<number>(getBaseCenterCols(grid));
    if (centerCols.size === 0) return false;

    // Every upper row that has blocks must overlap at least one base-center cell.
    for (let row = 0; row < GRID_ROWS - 1; row += 1) {
        const rowCols = Array.from({ length: GRID_COLS }, (_, col) => col).filter((col) => grid[row][col]);
        if (rowCols.length === 0) continue;

        const overlapsCenter = rowCols.some((col) => centerCols.has(col));
        if (!overlapsCenter) return false;
    }

    return true;
};

export const IceStacking: React.FC<IceStackingProps> = ({ onExit }) => {
    const { t } = useTranslation();

    const engine = useGameEngine({
        initialLives: 3,
        initialTime: 90,
        maxDifficulty: 3
    });

    const [problem, setProblem] = React.useState<Problem>(() => createProblem());
    const [armCol, setArmCol] = React.useState(0);
    const [placedBundles, setPlacedBundles] = React.useState(0);
    const [isDropping, setIsDropping] = React.useState(false);
    const [activePiece, setActivePiece] = React.useState<{ row: number; startCol: number } | null>(null);
    const [settledPieces, setSettledPieces] = React.useState<SettledPiece[]>([]);
    const [stackStable, setStackStable] = React.useState<boolean | null>(null);
    const [isCollapsing, setIsCollapsing] = React.useState(false);

    const boardRef = React.useRef<HTMLDivElement | null>(null);
    const carriageRef = React.useRef<HTMLDivElement | null>(null);
    const gridRef = React.useRef<boolean[][]>(createEmptyGrid());
    const placedBundlesRef = React.useRef(placedBundles);
    const problemRef = React.useRef(problem);
    const prevGameStateRef = React.useRef(engine.gameState);
    const fallTimerRef = React.useRef<number | null>(null);
    const roundTimerRef = React.useRef<number | null>(null);
    const pieceIdRef = React.useRef(0);
    const armColRef = React.useRef(0);
    const armDirRef = React.useRef<1 | -1>(1);
    const armRafRef = React.useRef<number | null>(null);
    const armLastTsRef = React.useRef(0);
    const snappedArmColRef = React.useRef(0);

    React.useEffect(() => {
        placedBundlesRef.current = placedBundles;
    }, [placedBundles]);

    React.useEffect(() => {
        problemRef.current = problem;
    }, [problem]);

    const clearTimers = React.useCallback(() => {
        if (fallTimerRef.current != null) {
            window.clearTimeout(fallTimerRef.current);
            fallTimerRef.current = null;
        }
        if (roundTimerRef.current != null) {
            window.clearTimeout(roundTimerRef.current);
            roundTimerRef.current = null;
        }
    }, []);

    const resetBoard = React.useCallback((nextProblem?: Problem) => {
        const targetProblem = nextProblem ?? problemRef.current;
        const maxStartCol = Math.max(0, GRID_COLS - targetProblem.bundleSize);
        const startArmCol = Math.floor(maxStartCol / 2);
        gridRef.current = createEmptyGrid();
        setPlacedBundles(0);
        placedBundlesRef.current = 0;
        setIsDropping(false);
        setActivePiece(null);
        setSettledPieces([]);
        setArmCol(startArmCol);
        armColRef.current = startArmCol;
        armDirRef.current = 1;
        armLastTsRef.current = 0;
        setStackStable(null);
        setIsCollapsing(false);
    }, []);

    const startNewProblem = React.useCallback(() => {
        const next = createProblem(problemRef.current);
        setProblem(next);
        problemRef.current = next;
        resetBoard(next);
    }, [resetBoard]);

    const handleRoundResult = React.useCallback((isCorrect: boolean, keepSameProblem: boolean) => {
        engine.submitAnswer(isCorrect, { skipDifficulty: true, skipFeedback: true });
        engine.registerEvent({ type: isCorrect ? 'correct' : 'wrong' } as any);

        roundTimerRef.current = window.setTimeout(() => {
            if (keepSameProblem) {
                resetBoard();
            } else {
                startNewProblem();
            }
        }, 850);
    }, [engine, resetBoard, startNewProblem]);

    React.useEffect(() => {
        const prev = prevGameStateRef.current;
        const enteredPlaying = engine.gameState === 'playing' && (prev === 'idle' || prev === 'gameover');
        if (enteredPlaying) {
            clearTimers();
            startNewProblem();
            const wrapper = document.querySelector('.ice-stacking-layout2 .layout2-grid-wrapper');
            if (wrapper instanceof HTMLElement) {
                wrapper.scrollTop = 0;
            }
        }
        prevGameStateRef.current = engine.gameState;
    }, [engine.gameState, clearTimers, startNewProblem]);

    React.useEffect(() => {
        return () => clearTimers();
    }, [clearTimers]);

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
        setStackStable(false);
        setIsCollapsing(true);
        roundTimerRef.current = window.setTimeout(() => {
            handleRoundResult(false, true);
        }, 520);
    }, [handleRoundResult]);

    React.useEffect(() => {
        if (engine.gameState !== 'playing' || isDropping || isCollapsing || placedBundles >= problem.boxCount) {
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
    }, [engine.gameState, isDropping, isCollapsing, placedBundles, problem.boxCount, problem.bundleSize]);

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
                size: currentProblem.bundleSize
            }
        ]);
        setActivePiece(null);
        setIsDropping(false);

        const stableNow = isStackStable(nextGrid);
        setStackStable(stableNow);
        if (!stableNow) {
            triggerCollapseFail();
            return false;
        }

        const nextPlaced = placedBundlesRef.current + 1;
        placedBundlesRef.current = nextPlaced;
        setPlacedBundles(nextPlaced);

        if (nextPlaced >= currentProblem.boxCount) {
            handleRoundResult(true, false);
        }
        return true;
    }, [handleRoundResult, triggerCollapseFail]);

    const runFallAnimation = React.useCallback((landingRow: number, startCol: number, currentProblem: Problem) => {
        let animatedRow = -1;
        setActivePiece({ row: animatedRow, startCol });

        const tick = () => {
            if (animatedRow < landingRow) {
                animatedRow += 1;
                setActivePiece({ row: animatedRow, startCol });
                fallTimerRef.current = window.setTimeout(tick, FALL_STEP_MS);
                return;
            }
            fallTimerRef.current = null;
            finalizeLanding(landingRow, startCol, currentProblem);
        };

        tick();
    }, [finalizeLanding]);

    const dropBundle = React.useCallback(() => {
        if (engine.gameState !== 'playing' || isDropping || isCollapsing) return;

        const currentProblem = problemRef.current;
        if (placedBundlesRef.current >= currentProblem.boxCount) return;

        const startCol = computeDropStartCol(currentProblem.bundleSize);
        const landingRow = getLandingRow(gridRef.current, startCol, currentProblem.bundleSize);

        if (landingRow < 0) {
            triggerCollapseFail();
            return;
        }

        setIsDropping(true);
        runFallAnimation(landingRow, startCol, currentProblem);
    }, [computeDropStartCol, engine.gameState, isCollapsing, isDropping, runFallAnimation, triggerCollapseFail]);

    const currentTotal = placedBundles * problem.bundleSize;
    const atTarget = placedBundles === problem.boxCount;
    const centerHintCols = React.useMemo(() => getBaseCenterCols(gridRef.current), [settledPieces]);
    const resultClass = currentTotal === 0
        ? 'ice-order-result-neutral'
        : atTarget && stackStable
            ? 'ice-order-result-correct'
            : 'ice-order-result-wrong';

    return (
        <Layout2
            title={t('games.ice-stacking.title')}
            subtitle={t('games.ice-stacking.subtitle')}
            description={t('games.ice-stacking.description')}
            gameId={GameIds.MATH_ICE_STACKING}
            engine={engine}
            onExit={onExit}
            className="ice-stacking-layout2"
            powerUps={[]}
            instructions={[
                {
                    icon: '🧾',
                    title: t('games.ice-stacking.howToPlay.step1.title'),
                    description: t('games.ice-stacking.howToPlay.step1.description')
                },
                {
                    icon: '🧊',
                    title: t('games.ice-stacking.howToPlay.step2.title'),
                    description: t('games.ice-stacking.howToPlay.step2.description')
                },
                {
                    icon: '✅',
                    title: t('games.ice-stacking.howToPlay.step3.title'),
                    description: t('games.ice-stacking.howToPlay.step3.description')
                }
            ]}
            cardBackground={<BlobBackground colors={{ blob1: '#e0f2fe', blob2: '#f0f9ff', blob3: '#bae6fd', blob4: '#7dd3fc' }} />}
        >
            <div className="ice-stacking-shell">
                <section className="ice-order-card" aria-label="order card">
                    <div className="ice-order-row">
                        <span className="ice-order-badge">
                            <span className="ice-order-icon">🧊</span>
                            <span className="ice-order-num">{problem.bundleSize}</span>
                        </span>
                        <span className="ice-order-operator">×</span>
                        <span className="ice-order-badge">
                            <span className="ice-order-num">{problem.boxCount}</span>
                        </span>
                        <span className="ice-order-operator">=</span>
                        <span className={`ice-order-result ${resultClass}`}>{currentTotal}</span>
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
                                    '--bundle-cols': problem.bundleSize
                                } as React.CSSProperties}
                            >
                                <div className="ice-robot-arm">
                                    <div className="ice-robot-head" />
                                    <div className="ice-robot-line" />
                                </div>
                                <div className="ice-source-bundle">
                                    <span className="ice-bundle-fruits ice-bundle-cells">
                                        {Array.from({ length: problem.bundleSize }).map((_, idx) => (
                                            <span key={idx} className="ice-bundle-fruit">🧊</span>
                                        ))}
                                    </span>
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
                                        '--collapse-index': idx
                                    } as React.CSSProperties}
                                >
                                    {Array.from({ length: piece.size }).map((_, idx) => (
                                        <span key={idx} className="ice-cube">🧊</span>
                                    ))}
                                </div>
                            ))}

                            {activePiece && (
                                <div
                                    className="ice-falling-piece"
                                    style={{
                                        '--piece-col': activePiece.startCol,
                                        '--piece-row': activePiece.row,
                                        '--piece-size': problem.bundleSize
                                    } as React.CSSProperties}
                                >
                                    {Array.from({ length: problem.bundleSize }).map((_, idx) => (
                                        <span key={idx} className="ice-cube">🧊</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </Layout2>
    );
};

export default IceStacking;
