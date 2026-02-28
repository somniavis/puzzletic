import React from 'react';
import { useTranslation } from 'react-i18next';
import type { GameManifest } from '../../../../types';
import { Layout2 } from '../../../../layouts/Standard/Layout2';
import { useGameEngine } from '../../../../layouts/Standard/Layout0/useGameEngine';
import { BlobBackground } from '../../../components/BlobBackground';
import { GameIds } from '../../../../../constants/gameIds';
import './FloorTiler.css';

interface FloorTilerProps {
    onExit: () => void;
}

interface Problem {
    width: number;
    height: number;
    color: string;
    pattern: TilePattern;
}

interface Rect {
    top: number;
    left: number;
    bottom: number;
    right: number;
    width: number;
    height: number;
}

interface CellData {
    tileId: number;
    color: string;
    pattern: TilePattern;
}

interface BoardMetrics {
    left: number;
    top: number;
    width: number;
    height: number;
}

type TilePattern =
    | 'dots'
    | 'stripes'
    | 'grid'
    | 'diag'
    | 'cross'
    | 'zigzag'
    | 'bricks'
    | 'waves';

const BOARD_SIZE = 10;
const TILE_COLORS = [
    '#5B8FF9', '#61DDAA', '#F6BD16', '#E8684A', '#6DC8EC',
    '#9270CA', '#FF9D4D', '#269A99', '#FF6F91', '#7CC36A'
] as const;
const TILE_PATTERNS: TilePattern[] = ['dots', 'stripes', 'grid', 'diag', 'cross', 'zigzag', 'bricks', 'waves'];
const PATTERN_BACKGROUND_MAP: Record<TilePattern, string> = {
    dots: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.48) 0 10%, transparent 11%), radial-gradient(circle at 75% 75%, rgba(15,23,42,0.2) 0 10%, transparent 11%)',
    stripes: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.35) 0 8%, rgba(0,0,0,0.08) 8% 16%)',
    grid: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.34) 0 10%, transparent 10% 20%), repeating-linear-gradient(90deg, rgba(0,0,0,0.09) 0 10%, transparent 10% 20%)',
    diag: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.36) 0 7%, transparent 7% 14%), repeating-linear-gradient(315deg, rgba(0,0,0,0.08) 0 7%, transparent 7% 14%)',
    cross: 'linear-gradient(90deg, transparent 42%, rgba(255,255,255,0.42) 42% 58%, transparent 58%), linear-gradient(0deg, transparent 42%, rgba(0,0,0,0.1) 42% 58%, transparent 58%)',
    zigzag: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.36) 0 8%, transparent 8% 16%, rgba(0,0,0,0.1) 16% 24%, transparent 24% 32%)',
    bricks: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.33) 0 12%, transparent 12% 24%), repeating-linear-gradient(90deg, rgba(0,0,0,0.1) 0 24%, transparent 24% 48%)',
    waves: 'radial-gradient(120% 75% at 0% 100%, rgba(255,255,255,0.34) 0 28%, transparent 29%), radial-gradient(120% 75% at 100% 0%, rgba(0,0,0,0.11) 0 28%, transparent 29%)'
};
const SIMPLE_PATTERN_BACKGROUND_MAP: Record<TilePattern, string> = {
    dots: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0 12%, transparent 13%)',
    stripes: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.24) 0 10%, transparent 10% 20%)',
    grid: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.2) 0 12%, transparent 12% 24%)',
    diag: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.22) 0 10%, transparent 10% 20%)',
    cross: 'linear-gradient(90deg, transparent 44%, rgba(255,255,255,0.24) 44% 56%, transparent 56%)',
    zigzag: 'repeating-linear-gradient(120deg, rgba(255,255,255,0.22) 0 8%, transparent 8% 16%)',
    bricks: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.2) 0 14%, transparent 14% 28%)',
    waves: 'radial-gradient(120% 80% at 0% 100%, rgba(255,255,255,0.22) 0 24%, transparent 25%)'
};

const createEmptyBoard = (): Array<Array<CellData | null>> =>
    Array.from({ length: BOARD_SIZE }, () => Array<CellData | null>(BOARD_SIZE).fill(null));

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

const makeRect = (startRow: number, startCol: number, endRow: number, endCol: number): Rect => {
    const top = Math.min(startRow, endRow);
    const bottom = Math.max(startRow, endRow);
    const left = Math.min(startCol, endCol);
    const right = Math.max(startCol, endCol);
    return {
        top,
        left,
        bottom,
        right,
        width: right - left + 1,
        height: bottom - top + 1
    };
};

const isRectEmpty = (board: Array<Array<CellData | null>>, rect: Rect): boolean => {
    for (let row = rect.top; row <= rect.bottom; row += 1) {
        for (let col = rect.left; col <= rect.right; col += 1) {
            if (board[row][col] !== null) return false;
        }
    }
    return true;
};

const fillRect = (
    board: Array<Array<CellData | null>>,
    rect: Rect,
    tileId: number,
    color: string,
    pattern: TilePattern
): Array<Array<CellData | null>> => {
    const next = board.map((line) => [...line]);
    for (let row = rect.top; row <= rect.bottom; row += 1) {
        for (let col = rect.left; col <= rect.right; col += 1) {
            next[row][col] = { tileId, color, pattern };
        }
    }
    return next;
};

const isBoardFull = (board: Array<Array<CellData | null>>): boolean =>
    board.every((row) => row.every((cell) => cell !== null));

const buildOccupiedPrefix = (board: Array<Array<CellData | null>>): number[][] => {
    const prefix = Array.from({ length: BOARD_SIZE + 1 }, () => Array<number>(BOARD_SIZE + 1).fill(0));
    for (let row = 0; row < BOARD_SIZE; row += 1) {
        for (let col = 0; col < BOARD_SIZE; col += 1) {
            const occupied = board[row][col] ? 1 : 0;
            prefix[row + 1][col + 1] =
                occupied +
                prefix[row][col + 1] +
                prefix[row + 1][col] -
                prefix[row][col];
        }
    }
    return prefix;
};

const isRectEmptyByPrefix = (
    prefix: number[][],
    top: number,
    left: number,
    height: number,
    width: number
): boolean => {
    const bottom = top + height;
    const right = left + width;
    const occupiedCount =
        prefix[bottom][right] -
        prefix[top][right] -
        prefix[bottom][left] +
        prefix[top][left];
    return occupiedCount === 0;
};

const scanPossibleDimensions = (board: Array<Array<CellData | null>>): Array<{ width: number; height: number; count: number }> => {
    const dimMap = new Map<string, { width: number; height: number; count: number }>();
    const prefix = buildOccupiedPrefix(board);

    for (let height = 1; height <= BOARD_SIZE; height += 1) {
        for (let width = 1; width <= BOARD_SIZE; width += 1) {
            for (let row = 0; row <= BOARD_SIZE - height; row += 1) {
                for (let col = 0; col <= BOARD_SIZE - width; col += 1) {
                    if (!isRectEmptyByPrefix(prefix, row, col, height, width)) continue;
                    const key = `${width}x${height}`;
                    const prev = dimMap.get(key);
                    if (prev) prev.count += 1;
                    else dimMap.set(key, { width, height, count: 1 });
                }
            }
        }
    }

    return [...dimMap.values()];
};

const weightedPick = <T,>(items: T[], getWeight: (item: T) => number): T | null => {
    if (items.length === 0) return null;
    const totalWeight = items.reduce((sum, item) => sum + Math.max(0, getWeight(item)), 0);
    if (totalWeight <= 0) return items[Math.floor(Math.random() * items.length)];

    let target = Math.random() * totalWeight;
    for (const item of items) {
        target -= Math.max(0, getWeight(item));
        if (target <= 0) return item;
    }
    return items[items.length - 1];
};

const toHex = (value: number): string => value.toString(16).padStart(2, '0');

const hslToHex = (h: number, s: number, l: number): string => {
    const hh = h / 360;
    const ss = s / 100;
    const ll = l / 100;
    const hue2rgb = (p: number, q: number, t: number) => {
        let tt = t;
        if (tt < 0) tt += 1;
        if (tt > 1) tt -= 1;
        if (tt < 1 / 6) return p + (q - p) * 6 * tt;
        if (tt < 1 / 2) return q;
        if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
        return p;
    };
    let r: number;
    let g: number;
    let b: number;
    if (ss === 0) {
        r = g = b = ll;
    } else {
        const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss;
        const p = 2 * ll - q;
        r = hue2rgb(p, q, hh + 1 / 3);
        g = hue2rgb(p, q, hh);
        b = hue2rgb(p, q, hh - 1 / 3);
    }
    return `#${toHex(Math.round(r * 255))}${toHex(Math.round(g * 255))}${toHex(Math.round(b * 255))}`;
};

const pickUniqueColor = (usedColors: Set<string>): string => {
    const paletteColor = TILE_COLORS.find((color) => !usedColors.has(color));
    if (paletteColor) return paletteColor;

    const baseIndex = usedColors.size + 1;
    for (let i = 0; i < 24; i += 1) {
        const idx = baseIndex + i;
        const hue = (idx * 137.508) % 360;
        const sat = 68 + (idx % 3) * 8;
        const light = 52 + (idx % 2) * 6;
        const candidate = hslToHex(hue, sat, light);
        if (!usedColors.has(candidate)) return candidate;
    }

    return `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`;
};

const pickUniquePattern = (usedPatterns: Set<TilePattern>): TilePattern => {
    const available = TILE_PATTERNS.filter((pattern) => !usedPatterns.has(pattern));
    if (available.length > 0) {
        return available[Math.floor(Math.random() * available.length)];
    }
    return TILE_PATTERNS[Math.floor(Math.random() * TILE_PATTERNS.length)];
};

const isLowEndAndroidDevice = (): boolean => {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    if (!/Android/i.test(ua)) return false;

    const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    const cores = navigator.hardwareConcurrency ?? 8;
    return deviceMemory <= 4 || cores <= 6;
};

const getPatternBackground = (pattern: TilePattern, simplified = false): string =>
    (simplified ? SIMPLE_PATTERN_BACKGROUND_MAP : PATTERN_BACKGROUND_MAP)[pattern];

export const FloorTiler: React.FC<FloorTilerProps> = ({ onExit }) => {
    const { t } = useTranslation();
    const useSimplifiedPatterns = React.useMemo(() => isLowEndAndroidDevice(), []);

    const engine = useGameEngine({
        initialLives: 3,
        initialTime: 90,
        maxDifficulty: 3
    });

    const [board, setBoard] = React.useState<Array<Array<CellData | null>>>(() => createEmptyBoard());
    const [problem, setProblem] = React.useState<Problem | null>(null);
    const [previewRect, setPreviewRect] = React.useState<Rect | null>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [roundClearing, setRoundClearing] = React.useState(false);
    const [filledCount, setFilledCount] = React.useState(0);
    const [showDragHint, setShowDragHint] = React.useState(false);
    const [isDragHintExiting, setIsDragHintExiting] = React.useState(false);
    const boardRef = React.useRef<Array<Array<CellData | null>>>(board);
    const dragStartRef = React.useRef<{ row: number; col: number } | null>(null);
    const boardAreaRef = React.useRef<HTMLDivElement | null>(null);
    const tileIdRef = React.useRef(1);
    const lastProblemKeyRef = React.useRef<string | null>(null);
    const usedColorsRef = React.useRef<Set<string>>(new Set());
    const usedPatternsRef = React.useRef<Set<TilePattern>>(new Set());
    const prevGameStateRef = React.useRef(engine.gameState);
    const clearTimerRef = React.useRef<number | null>(null);
    const hasShownDragHintRef = React.useRef(false);
    const dragHintTimerRef = React.useRef<number | null>(null);
    const dragHintExitTimerRef = React.useRef<number | null>(null);
    const moveRafRef = React.useRef<number | null>(null);
    const previewRectRef = React.useRef<Rect | null>(null);
    const boardMetricsRef = React.useRef<BoardMetrics | null>(null);

    React.useEffect(() => {
        boardRef.current = board;
    }, [board]);
    React.useEffect(() => {
        previewRectRef.current = previewRect;
    }, [previewRect]);

    React.useEffect(() => {
        return () => {
            if (clearTimerRef.current != null) {
                window.clearTimeout(clearTimerRef.current);
                clearTimerRef.current = null;
            }
            if (dragHintTimerRef.current != null) {
                window.clearTimeout(dragHintTimerRef.current);
                dragHintTimerRef.current = null;
            }
            if (dragHintExitTimerRef.current != null) {
                window.clearTimeout(dragHintExitTimerRef.current);
                dragHintExitTimerRef.current = null;
            }
            if (moveRafRef.current != null) {
                window.cancelAnimationFrame(moveRafRef.current);
                moveRafRef.current = null;
            }
        };
    }, []);

    const pickNextProblem = React.useCallback((baseBoard: Array<Array<CellData | null>>): Problem | null => {
        const dims = scanPossibleDimensions(baseBoard);
        if (dims.length === 0) return null;

        const filtered = dims.filter((dim) => `${dim.width}x${dim.height}` !== lastProblemKeyRef.current);
        const source = filtered.length > 0 ? filtered : dims;
        const picked = weightedPick(source, (dim) => dim.count * Math.max(1, dim.width * dim.height));
        if (!picked) return null;

        const key = `${picked.width}x${picked.height}`;
        lastProblemKeyRef.current = key;
        const color = pickUniqueColor(usedColorsRef.current);
        const pattern = pickUniquePattern(usedPatternsRef.current);
        usedColorsRef.current.add(color);
        usedPatternsRef.current.add(pattern);
        return { width: picked.width, height: picked.height, color, pattern };
    }, []);

    const resetRound = React.useCallback(() => {
        const nextBoard = createEmptyBoard();
        tileIdRef.current = 1;
        usedColorsRef.current = new Set();
        usedPatternsRef.current = new Set();
        boardRef.current = nextBoard;
        setBoard(nextBoard);
        setFilledCount(0);
        setPreviewRect(null);
        setIsDragging(false);
        setRoundClearing(false);
        setProblem(pickNextProblem(nextBoard));
    }, [pickNextProblem]);

    React.useEffect(() => {
        const prev = prevGameStateRef.current;
        const enteredPlaying = engine.gameState === 'playing' && (prev === 'idle' || prev === 'gameover');
        if (enteredPlaying) {
            resetRound();
            const isFirstQuestion = engine.score === 0 && engine.stats.correct === 0 && engine.stats.wrong === 0;
            if (isFirstQuestion && !hasShownDragHintRef.current) {
                hasShownDragHintRef.current = true;
                setShowDragHint(true);
                setIsDragHintExiting(false);
                if (dragHintTimerRef.current != null) {
                    window.clearTimeout(dragHintTimerRef.current);
                }
                if (dragHintExitTimerRef.current != null) {
                    window.clearTimeout(dragHintExitTimerRef.current);
                }
                dragHintTimerRef.current = window.setTimeout(() => {
                    setIsDragHintExiting(true);
                    dragHintExitTimerRef.current = window.setTimeout(() => {
                        setShowDragHint(false);
                        setIsDragHintExiting(false);
                        dragHintExitTimerRef.current = null;
                    }, 220);
                    dragHintTimerRef.current = null;
                }, 1800);
            } else {
                setShowDragHint(false);
                setIsDragHintExiting(false);
            }
        }
        prevGameStateRef.current = engine.gameState;
    }, [engine.gameState, engine.score, engine.stats.correct, engine.stats.wrong, resetRound]);

    React.useEffect(() => {
        if (engine.gameState !== 'gameover') return;
        if (dragHintTimerRef.current != null) {
            window.clearTimeout(dragHintTimerRef.current);
            dragHintTimerRef.current = null;
        }
        if (dragHintExitTimerRef.current != null) {
            window.clearTimeout(dragHintExitTimerRef.current);
            dragHintExitTimerRef.current = null;
        }
        setShowDragHint(false);
        setIsDragHintExiting(false);
        hasShownDragHintRef.current = false;
    }, [engine.gameState]);

    const measureBoard = React.useCallback((): BoardMetrics | null => {
        const el = boardAreaRef.current;
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return null;
        const metrics = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
        boardMetricsRef.current = metrics;
        return metrics;
    }, []);

    const getCellFromPoint = React.useCallback((clientX: number, clientY: number): { row: number; col: number } | null => {
        const metrics = boardMetricsRef.current ?? measureBoard();
        if (!metrics) return null;

        const relX = clamp(clientX - metrics.left, 0, metrics.width - 1);
        const relY = clamp(clientY - metrics.top, 0, metrics.height - 1);
        const col = clamp(Math.floor((relX / metrics.width) * BOARD_SIZE), 0, BOARD_SIZE - 1);
        const row = clamp(Math.floor((relY / metrics.height) * BOARD_SIZE), 0, BOARD_SIZE - 1);
        return { row, col };
    }, [measureBoard]);

    const finalizeRect = React.useCallback((rect: Rect | null) => {
        setIsDragging(false);
        dragStartRef.current = null;
        if (!rect || !problem || engine.gameState !== 'playing' || roundClearing) {
            setPreviewRect(null);
            return;
        }

        const boardNow = boardRef.current;
        const sameShape =
            (rect.width === problem.width && rect.height === problem.height) ||
            (rect.width === problem.height && rect.height === problem.width);
        const canPlace = sameShape && isRectEmpty(boardNow, rect);

        if (!canPlace) {
            engine.submitAnswer(false, { skipFeedback: true });
            engine.registerEvent({ type: 'wrong' });
            setPreviewRect(null);
            return;
        }

        const tileId = tileIdRef.current++;
        const nextBoard = fillRect(boardNow, rect, tileId, problem.color, problem.pattern);
        boardRef.current = nextBoard;
        setBoard(nextBoard);
        setFilledCount((prev) => prev + rect.width * rect.height);
        setPreviewRect(null);

        engine.submitAnswer(true, { skipFeedback: true });
        engine.registerEvent({ type: 'correct' });

        if (isBoardFull(nextBoard)) {
            setRoundClearing(true);
            if (clearTimerRef.current != null) window.clearTimeout(clearTimerRef.current);
            clearTimerRef.current = window.setTimeout(() => {
                clearTimerRef.current = null;
                if (engine.gameState !== 'playing') return;
                resetRound();
            }, 480);
            return;
        }

        setProblem(pickNextProblem(nextBoard));
    }, [engine, pickNextProblem, problem, resetRound, roundClearing]);

    const handlePointerDown = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        if (engine.gameState !== 'playing' || !problem || roundClearing) return;
        measureBoard();
        const start = getCellFromPoint(event.clientX, event.clientY);
        if (!start) return;
        if (boardRef.current[start.row][start.col] !== null) return;

        dragStartRef.current = start;
        const initialRect = makeRect(start.row, start.col, start.row, start.col);
        setPreviewRect(initialRect);
        setIsDragging(true);
        event.currentTarget.setPointerCapture(event.pointerId);
        event.preventDefault();
    }, [engine.gameState, getCellFromPoint, measureBoard, problem, roundClearing]);

    const handlePointerMove = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging || !dragStartRef.current) return;
        const { clientX, clientY } = event;
        if (moveRafRef.current != null) return;
        moveRafRef.current = window.requestAnimationFrame(() => {
            moveRafRef.current = null;
            const point = getCellFromPoint(clientX, clientY);
            if (!point || !dragStartRef.current) return;
            const rect = makeRect(dragStartRef.current.row, dragStartRef.current.col, point.row, point.col);
            const prev = previewRectRef.current;
            const changed = !prev ||
                prev.top !== rect.top ||
                prev.left !== rect.left ||
                prev.bottom !== rect.bottom ||
                prev.right !== rect.right;
            if (changed) setPreviewRect(rect);
        });
        event.preventDefault();
    }, [getCellFromPoint, isDragging]);

    const handlePointerUp = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        event.currentTarget.releasePointerCapture(event.pointerId);
        finalizeRect(previewRectRef.current);
    }, [finalizeRect]);

    const handlePointerCancel = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        event.currentTarget.releasePointerCapture(event.pointerId);
        finalizeRect(previewRectRef.current);
    }, [finalizeRect]);

    const previewValid = React.useMemo(() => {
        if (!problem || !previewRect) return false;
        const sameShape =
            (previewRect.width === problem.width && previewRect.height === problem.height) ||
            (previewRect.width === problem.height && previewRect.height === problem.width);
        if (!sameShape) return false;
        return isRectEmpty(board, previewRect);
    }, [board, previewRect, problem]);

    const instructions = React.useMemo(() => ([
        {
            icon: '🧩',
            title: t('games.floor-tiler.howToPlay.step1.title'),
            description: t('games.floor-tiler.howToPlay.step1.description')
        },
        {
            icon: '👆',
            title: t('games.floor-tiler.howToPlay.step2.title'),
            description: t('games.floor-tiler.howToPlay.step2.description')
        },
        {
            icon: '✅',
            title: t('games.floor-tiler.howToPlay.step3.title'),
            description: t('games.floor-tiler.howToPlay.step3.description')
        }
    ]), [t]);

    return (
        <Layout2
            gameId={GameIds.MATH_FLOOR_TILER}
            title={t('games.floor-tiler.title')}
            subtitle={t('games.floor-tiler.subtitle')}
            description={t('games.floor-tiler.description')}
            instructions={instructions}
            engine={engine}
            onExit={onExit}
            className="floor-tiler-layout2"
            powerUps={[]}
            cardBackground={<BlobBackground disableMotion colors={{ blob1: '#dbeafe', blob2: '#e0f2fe', blob3: '#bfdbfe', blob4: '#93c5fd' }} />}
        >
            <div className="floor-tiler-board-wrap">
                <div className="floor-tiler-problem-bar">
                    <div className="floor-tiler-problem-left">
                        <span className="floor-tiler-label">{t('games.floor-tiler.ui.targetLabel')}</span>
                        <span
                            className="floor-tiler-color-chip"
                            style={{
                                backgroundColor: problem?.color ?? '#9ca3af',
                                backgroundImage: problem ? getPatternBackground(problem.pattern, useSimplifiedPatterns) : 'none'
                            }}
                            aria-hidden
                        />
                    </div>
                    <div className="floor-tiler-problem-center">
                        <span className="floor-tiler-problem-text">{problem ? `${problem.width}x${problem.height}` : '-'}</span>
                    </div>
                    <div className="floor-tiler-progress floor-tiler-problem-right">
                        {t('games.floor-tiler.ui.progress', {
                            filled: filledCount,
                            total: BOARD_SIZE * BOARD_SIZE
                        })}
                    </div>
                </div>

                <div
                    className="floor-tiler-board"
                    ref={boardAreaRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerCancel}
                >
                    {board.map((row, rowIdx) =>
                        row.map((cell, colIdx) => {
                            const inPreview = previewRect
                                ? rowIdx >= previewRect.top &&
                                  rowIdx <= previewRect.bottom &&
                                  colIdx >= previewRect.left &&
                                  colIdx <= previewRect.right
                                : false;

                            const style: React.CSSProperties = {};
                            if (cell) {
                                style.backgroundColor = cell.color;
                                style.backgroundImage = getPatternBackground(cell.pattern, useSimplifiedPatterns);
                            } else if (inPreview) {
                                style.backgroundColor = previewValid
                                    ? 'rgba(34, 197, 94, 0.45)'
                                    : 'rgba(239, 68, 68, 0.45)';
                            }

                            return (
                                <div
                                    key={`${rowIdx}-${colIdx}`}
                                    className="floor-tiler-cell"
                                    style={style}
                                />
                            );
                        })
                    )}
                </div>

                {showDragHint && (
                    <div className={`floor-tiler-drag-hint ${isDragHintExiting ? 'is-exiting' : ''}`}>
                        {t('games.floor-tiler.ui.dragHintShort')}
                    </div>
                )}

            </div>
        </Layout2>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const manifest: GameManifest = {
    id: GameIds.MATH_FLOOR_TILER,
    title: 'Floor Tiler',
    titleKey: 'games.floor-tiler.title',
    subtitle: 'Fill the tiles perfectly!',
    subtitleKey: 'games.floor-tiler.subtitle',
    description: 'Fill the room by area.',
    descriptionKey: 'games.floor-tiler.description',
    category: 'math',
    level: 3,
    mode: 'adventure',
    component: FloorTiler,
    thumbnail: 'quad:🟧,🟨,🟩,🟦',
    tagsKey: 'games.tags.multiplication'
};
