import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layout2 } from '../../../../layouts/Standard/Layout2';
import { useGameEngine } from '../../../../layouts/Standard/Layout0/useGameEngine';
import type { GameManifest } from '../../../../types';
import { GameIds } from '../../../../../constants/gameIds';
import { useNurturing } from '../../../../../contexts/NurturingContext';
import { createCharacter } from '../../../../../data/characters';
import { JelloAvatar } from '../../../../../components/characters/JelloAvatar';
import type { EvolutionStage } from '../../../../../types/character';
import './RiverCrossing.css';

interface RiverCrossingProps {
    onExit: () => void;
}

const GRID_ROWS = 4;
const GRID_COLS = 5;
const OPTIONAL_STONE_FILL_RATE = 0.72;
const POWER_UP_REWARD_TYPES = ['timeFreeze', 'extraLife', 'doubleScore'] as const;
const RIVER_THEMES = ['water', 'lava', 'toxic'] as const;

type CellType = 'start' | 'goal' | 'stone';
type RiverTheme = typeof RIVER_THEMES[number];

interface RiverCell {
    id: string;
    row: number;
    col: number;
    type: CellType;
    expression?: string;
    isCorrect?: boolean;
}

interface RiverRound {
    target: number;
    riverTheme: RiverTheme;
    cells: RiverCell[];
}

interface RiverPosition {
    row: number;
    col: number;
}

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const coordKey = (row: number, col: number) => `${row},${col}`;
const RESERVED_EMPTY_KEYS = new Set([coordKey(0, 0)]);

const shuffle = <T,>(items: T[]) => {
    const next = [...items];
    for (let i = next.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [next[i], next[j]] = [next[j], next[i]];
    }
    return next;
};

const buildCorrectExpressionPool = (target: number) => shuffle(
    Array.from({ length: 9 }, (_, index) => {
        const divisor = index + 1;
        const dividend = target * divisor;
        return `${dividend}÷${divisor}`;
    })
);

const buildWrongExpressionPool = (target: number) => shuffle(
    Array.from({ length: 8 }, (_, valueIndex) => valueIndex + 2)
        .filter((value) => value !== target)
        .flatMap((value) => Array.from({ length: 9 }, (_, divisorIndex) => {
            const divisor = divisorIndex + 1;
            const dividend = value * divisor;
            return `${dividend}÷${divisor}`;
        }))
);

const generateSolutionPath = () => {
    const path = [{ row: GRID_ROWS - 1, col: 0 }];
    let row = GRID_ROWS - 1;
    let col = 0;

    while (!(row === 0 && col === GRID_COLS - 1)) {
        const moves: Array<{ row: number; col: number }> = [];

        if (row > 0) moves.push({ row: row - 1, col });
        if (col < GRID_COLS - 1) moves.push({ row, col: col + 1 });
        if (row > 0 && col < GRID_COLS - 1) moves.push({ row: row - 1, col: col + 1 });

        const availableMoves = moves.filter((move) => !RESERVED_EMPTY_KEYS.has(coordKey(move.row, move.col)));
        const nextMoves = availableMoves.length > 0 ? availableMoves : moves;

        const weighted = shuffle([
            ...nextMoves,
            ...nextMoves.filter((move) => move.row !== row && move.col !== col)
        ]);
        const next = weighted[0];
        row = next.row;
        col = next.col;
        path.push({ row, col });
    }

    return path;
};

const collectRiverBand = (solutionPath: Array<{ row: number; col: number }>) => {
    const band = new Set<string>();

    solutionPath.forEach(({ row, col }) => {
        for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
            for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
                const nextRow = row + rowOffset;
                const nextCol = col + colOffset;
                if (nextRow < 0 || nextRow >= GRID_ROWS || nextCol < 0 || nextCol >= GRID_COLS) continue;
                if (RESERVED_EMPTY_KEYS.has(coordKey(nextRow, nextCol))) continue;
                band.add(coordKey(nextRow, nextCol));
            }
        }
    });

    return [...band]
        .map((key) => {
            const [row, col] = key.split(',').map(Number);
            return { row, col };
        })
        .sort((a, b) => (a.row - b.row) || (a.col - b.col));
};

const getAssignedAdjacentExpressions = (
    row: number,
    col: number,
    assignedExpressions: Map<string, string>
) => {
    const adjacent = new Set<string>();

    for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
        for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
            if (rowOffset === 0 && colOffset === 0) continue;
            const expression = assignedExpressions.get(coordKey(row + rowOffset, col + colOffset));
            if (expression) {
                adjacent.add(expression);
            }
        }
    }

    return adjacent;
};

const pickExpression = ({
    pool,
    usageCounts,
    adjacentExpressions,
    recentExpression,
    fallbackPool
}: {
    pool: string[];
    usageCounts: Map<string, number>;
    adjacentExpressions: Set<string>;
    recentExpression: string | null;
    fallbackPool: string[];
}) => {
    const sortedPool = [...pool].sort((a, b) => (usageCounts.get(a) ?? 0) - (usageCounts.get(b) ?? 0));
    const preferred = sortedPool.filter((expression) => (
        !adjacentExpressions.has(expression) && expression !== recentExpression
    ));
    const secondary = sortedPool.filter((expression) => !adjacentExpressions.has(expression));
    const candidate = preferred[0] ?? secondary[0] ?? sortedPool[0] ?? fallbackPool[0];

    usageCounts.set(candidate, (usageCounts.get(candidate) ?? 0) + 1);
    return candidate;
};

const buildRound = (): RiverRound => {
    const target = randInt(2, 9);
    const riverTheme = RIVER_THEMES[randInt(0, RIVER_THEMES.length - 1)];
    const solutionPath = generateSolutionPath();
    const solutionSet = new Set(solutionPath.map(({ row, col }) => coordKey(row, col)));
    const bandCells = collectRiverBand(solutionPath);
    const correctPool = buildCorrectExpressionPool(target);
    const wrongPool = buildWrongExpressionPool(target);
    const correctUsageCounts = new Map<string, number>();
    const wrongUsageCounts = new Map<string, number>();
    const assignedExpressions = new Map<string, string>();
    let recentCorrectExpression: string | null = null;
    let recentWrongExpression: string | null = null;

    const cells = bandCells.flatMap<RiverCell>(({ row, col }) => {
        const isStart = row === GRID_ROWS - 1 && col === 0;
        const isGoal = row === 0 && col === GRID_COLS - 1;
        const cellKey = coordKey(row, col);

        if (isStart) {
            return {
                id: coordKey(row, col),
                row,
                col,
                type: 'start'
            };
        }

        if (isGoal) {
            return {
                id: coordKey(row, col),
                row,
                col,
                type: 'goal'
            };
        }

        if (RESERVED_EMPTY_KEYS.has(cellKey)) {
            return [];
        }

        const isCorrect = solutionSet.has(cellKey);

        if (!isCorrect && Math.random() > OPTIONAL_STONE_FILL_RATE) {
            return [];
        }

        const adjacentExpressions = getAssignedAdjacentExpressions(row, col, assignedExpressions);
        const expression = isCorrect
            ? pickExpression({
                pool: correctPool,
                usageCounts: correctUsageCounts,
                adjacentExpressions,
                recentExpression: recentCorrectExpression,
                fallbackPool: correctPool
            })
            : pickExpression({
                pool: wrongPool,
                usageCounts: wrongUsageCounts,
                adjacentExpressions,
                recentExpression: recentWrongExpression,
                fallbackPool: wrongPool
            });

        assignedExpressions.set(cellKey, expression);
        if (isCorrect) {
            recentCorrectExpression = expression;
        } else {
            recentWrongExpression = expression;
        }

        return {
            id: cellKey,
            row,
            col,
            type: 'stone',
            expression,
            isCorrect
        };
    });

    return {
        target,
        riverTheme,
        cells
    };
};

const START_POSITION: RiverPosition = { row: GRID_ROWS - 1, col: 0 };
const GOAL_POSITION: RiverPosition = { row: 0, col: GRID_COLS - 1 };
const WRONG_SINK_DELAY_MS = 220;
const WRONG_RESET_DELAY_MS = 1100;
const NEXT_ROUND_DELAY_MS = 420;
const MOVE_HINT_VISIBLE_MS = 1800;
const MOVE_HINT_EXIT_MS = 220;

const isAdjacentStep = (from: RiverPosition, to: RiverPosition) => {
    const rowGap = Math.abs(from.row - to.row);
    const colGap = Math.abs(from.col - to.col);
    return (rowGap !== 0 || colGap !== 0) && rowGap <= 1 && colGap <= 1;
};

export const RiverCrossing: React.FC<RiverCrossingProps> = ({ onExit }) => {
    const { t } = useTranslation();
    const nurturing = useNurturing();
    const engine = useGameEngine({ initialLives: 3, initialTime: 90, maxDifficulty: 1 });
    const [round, setRound] = React.useState<RiverRound>(() => buildRound());
    const [currentPosition, setCurrentPosition] = React.useState<RiverPosition>(START_POSITION);
    const [visitedIds, setVisitedIds] = React.useState<string[]>([]);
    const [wrongCellId, setWrongCellId] = React.useState<string | null>(null);
    const [isResolving, setIsResolving] = React.useState(false);
    const [showMoveHint, setShowMoveHint] = React.useState(false);
    const [isMoveHintExiting, setIsMoveHintExiting] = React.useState(false);
    const prevGameStateRef = React.useRef(engine.gameState);
    const resolveTimerRef = React.useRef<number | null>(null);
    const sinkTimerRef = React.useRef<number | null>(null);
    const moveHintTimerRef = React.useRef<number | null>(null);
    const moveHintExitTimerRef = React.useRef<number | null>(null);

    const resetBoardState = React.useCallback(() => {
        setCurrentPosition(START_POSITION);
        setVisitedIds([]);
        setWrongCellId(null);
        setIsResolving(false);
    }, []);

    const clearPendingTimers = React.useCallback(() => {
        if (resolveTimerRef.current != null) {
            window.clearTimeout(resolveTimerRef.current);
            resolveTimerRef.current = null;
        }
        if (sinkTimerRef.current != null) {
            window.clearTimeout(sinkTimerRef.current);
            sinkTimerRef.current = null;
        }
        if (moveHintTimerRef.current != null) {
            window.clearTimeout(moveHintTimerRef.current);
            moveHintTimerRef.current = null;
        }
        if (moveHintExitTimerRef.current != null) {
            window.clearTimeout(moveHintExitTimerRef.current);
            moveHintExitTimerRef.current = null;
        }
    }, []);

    const showMoveHintOverlay = React.useCallback(() => {
        if (moveHintTimerRef.current != null) {
            window.clearTimeout(moveHintTimerRef.current);
            moveHintTimerRef.current = null;
        }
        if (moveHintExitTimerRef.current != null) {
            window.clearTimeout(moveHintExitTimerRef.current);
            moveHintExitTimerRef.current = null;
        }

        setIsMoveHintExiting(false);
        setShowMoveHint(true);

        moveHintTimerRef.current = window.setTimeout(() => {
            setIsMoveHintExiting(true);
            moveHintExitTimerRef.current = window.setTimeout(() => {
                setShowMoveHint(false);
                setIsMoveHintExiting(false);
                moveHintExitTimerRef.current = null;
            }, MOVE_HINT_EXIT_MS);
            moveHintTimerRef.current = null;
        }, MOVE_HINT_VISIBLE_MS);
    }, []);

    const handleStartGame = React.useCallback(() => {
        clearPendingTimers();
        setRound(buildRound());
        resetBoardState();
        showMoveHintOverlay();
        engine.startGame();
    }, [clearPendingTimers, engine, resetBoardState, showMoveHintOverlay]);

    const layoutEngine = React.useMemo(() => ({
        ...engine,
        startGame: handleStartGame
    }), [engine, handleStartGame]);

    const instructions = React.useMemo(() => ([
        {
            icon: '🎯',
            title: t('games.river-crossing.howToPlay.step1.title'),
            description: t('games.river-crossing.howToPlay.step1.description')
        },
        {
            icon: '🪨',
            title: t('games.river-crossing.howToPlay.step2.title'),
            description: t('games.river-crossing.howToPlay.step2.description')
        },
        {
            icon: '🏁',
            title: t('games.river-crossing.howToPlay.step3.title'),
            description: t('games.river-crossing.howToPlay.step3.description')
        }
    ]), [t]);

    const powerUps = React.useMemo(() => ([
        {
            count: engine.powerUps.timeFreeze,
            color: 'blue' as const,
            icon: '❄️',
            title: t('games.river-crossing.powerups.timeFreeze'),
            onClick: () => engine.activatePowerUp('timeFreeze'),
            disabledConfig: engine.isTimeFrozen,
            status: engine.isTimeFrozen ? 'active' as const : 'normal' as const
        },
        {
            count: engine.powerUps.extraLife,
            color: 'red' as const,
            icon: '❤️',
            title: t('games.river-crossing.powerups.extraLife'),
            onClick: () => engine.activatePowerUp('extraLife'),
            disabledConfig: engine.lives >= 3,
            status: engine.lives >= 3 ? 'maxed' as const : 'normal' as const
        },
        {
            count: engine.powerUps.doubleScore,
            color: 'yellow' as const,
            icon: '⚡',
            title: t('games.river-crossing.powerups.doubleScore'),
            onClick: () => engine.activatePowerUp('doubleScore'),
            disabledConfig: engine.isDoubleScore,
            status: engine.isDoubleScore ? 'active' as const : 'normal' as const
        }
    ]), [engine, t]);

    const currentJello = React.useMemo(() => {
        const id = nurturing.speciesId || 'yellowJello';
        const char = createCharacter(id);
        char.evolutionStage = Math.min(5, Math.max(1, nurturing.evolutionStage || 1)) as EvolutionStage;
        if (nurturing.characterName) {
            char.name = nurturing.characterName;
        }
        return { id, char };
    }, [nurturing.speciesId, nurturing.evolutionStage, nurturing.characterName]);

    const jelloWrapperClassName = React.useMemo(() => [
        'river-crossing-jello-wrapper',
        currentJello.char.evolutionStage <= 2 ? 'baby' : '',
        currentJello.char.evolutionStage === 5 ? 'legendary' : ''
    ].filter(Boolean).join(' '), [currentJello.char.evolutionStage]);

    const renderJello = React.useCallback((className: string) => (
        <div className={className} aria-hidden="true">
            <div className={jelloWrapperClassName}>
                <JelloAvatar
                    character={currentJello.char}
                    speciesId={currentJello.id}
                    size="small"
                    action="idle"
                    responsive
                />
            </div>
        </div>
    ), [currentJello.char, currentJello.id, jelloWrapperClassName]);

    const maybeAwardComboPowerUp = React.useCallback((nextCombo: number) => {
        if (nextCombo > 0 && nextCombo % 3 === 0 && Math.random() > 0.45) {
            const reward = POWER_UP_REWARD_TYPES[Math.floor(Math.random() * POWER_UP_REWARD_TYPES.length)];
            engine.setPowerUps((prev) => ({ ...prev, [reward]: prev[reward] + 1 }));
        }
    }, [engine]);

    React.useEffect(() => {
        const prev = prevGameStateRef.current;
        if (layoutEngine.gameState === 'playing' && (prev === 'idle' || prev === 'gameover')) {
            setRound(buildRound());
            resetBoardState();
            showMoveHintOverlay();
        }
        prevGameStateRef.current = layoutEngine.gameState;
    }, [layoutEngine.gameState, resetBoardState, showMoveHintOverlay]);

    React.useEffect(() => () => {
        clearPendingTimers();
    }, [clearPendingTimers]);

    const handleStoneClick = React.useCallback((cell: RiverCell) => {
        if (layoutEngine.gameState !== 'playing' || isResolving || cell.type !== 'stone') return;
        if (!isAdjacentStep(currentPosition, cell)) return;

        setCurrentPosition({ row: cell.row, col: cell.col });

        if (cell.isCorrect) {
            maybeAwardComboPowerUp(engine.combo + 1);
            setVisitedIds((prev) => (prev.includes(cell.id) ? prev : [...prev, cell.id]));
            engine.registerEvent({ type: 'correct', isFinal: false });
            engine.updateScore(20);
            engine.updateCombo(true);
            return;
        }

        engine.registerEvent({ type: 'wrong' });
        engine.updateCombo(false);
        setIsResolving(true);

        clearPendingTimers();
        setWrongCellId(null);

        sinkTimerRef.current = window.setTimeout(() => {
            sinkTimerRef.current = null;
            setWrongCellId(cell.id);
        }, WRONG_SINK_DELAY_MS);

        resolveTimerRef.current = window.setTimeout(() => {
            resolveTimerRef.current = null;
            const nextLives = engine.lives - 1;
            engine.updateLives(false);

            if (nextLives > 0) {
                resetBoardState();
            }
        }, WRONG_RESET_DELAY_MS);
    }, [
        clearPendingTimers,
        currentPosition,
        engine,
        isResolving,
        layoutEngine.gameState,
        resetBoardState
    ]);

    const handleGoalClick = React.useCallback(() => {
        if (layoutEngine.gameState !== 'playing' || isResolving) return;
        if (!isAdjacentStep(currentPosition, GOAL_POSITION)) return;

        setCurrentPosition(GOAL_POSITION);
        setIsResolving(true);
        maybeAwardComboPowerUp(engine.combo + 1);
        engine.registerEvent({ type: 'correct', isFinal: true });
        engine.updateScore(100);
        engine.updateCombo(true);
        clearPendingTimers();
        resolveTimerRef.current = window.setTimeout(() => {
            resolveTimerRef.current = null;
            setRound(buildRound());
            resetBoardState();
        }, NEXT_ROUND_DELAY_MS);
    }, [clearPendingTimers, currentPosition, engine, isResolving, layoutEngine.gameState, maybeAwardComboPowerUp, resetBoardState]);

    return (
        <Layout2
            title={t('games.river-crossing.title')}
            subtitle={t('games.river-crossing.subtitle')}
            description={t('games.river-crossing.description')}
            instructions={instructions}
            engine={layoutEngine}
            onExit={onExit}
            powerUps={powerUps}
            gameId={GameIds.MATH_RIVER_CROSSING}
            gameLevel={3}
            className="river-crossing-layout2"
            cardBackground={
                <div className="river-crossing-card-background">
                    <div className={`river-crossing-card-river is-${round.riverTheme}`}>
                        <span className="river-crossing-current river-crossing-current-a" />
                        <span className="river-crossing-current river-crossing-current-b" />
                        <span className="river-crossing-current river-crossing-current-c" />
                        <span className="river-crossing-current river-crossing-current-d" />
                        <span className="river-crossing-current river-crossing-current-e" />
                    </div>
                </div>
            }
        >
            <section className="river-crossing-board-shell" aria-label={t('games.river-crossing.ui.boardAriaLabel')}>
                <header className="river-crossing-board-header">
                    <div className="river-crossing-target-card">
                        <span className="river-crossing-target-label">{t('games.river-crossing.ui.targetLabel')}</span>
                        <strong>{round.target}</strong>
                    </div>
                </header>

                <div className="river-crossing-board">
                    {showMoveHint && (
                        <div className={`river-crossing-move-hint ${isMoveHintExiting ? 'is-exiting' : ''}`}>
                            {t('games.river-crossing.ui.moveHint')}
                        </div>
                    )}
                    {round.cells.map((cell) => (
                        <div
                            key={cell.id}
                            className={[
                                'river-crossing-cell',
                                `river-crossing-cell-${cell.type}`,
                                visitedIds.includes(cell.id) ? 'is-visited' : '',
                                wrongCellId === cell.id ? 'is-wrong' : '',
                                currentPosition.row === cell.row && currentPosition.col === cell.col ? 'is-current' : ''
                            ].filter(Boolean).join(' ')}
                            style={{
                                gridRow: cell.row + 1,
                                gridColumn: cell.col + 1
                            }}
                        >
                            {cell.type === 'start' && (
                                <div className="river-crossing-start-goal">
                                    <div className="river-crossing-start-marker" aria-hidden="true" />
                                    {currentPosition.row === cell.row && currentPosition.col === cell.col && (
                                        renderJello('river-crossing-jello river-crossing-start-jello')
                                    )}
                                </div>
                            )}

                            {cell.type === 'goal' && (
                                <button
                                    type="button"
                                    className="river-crossing-start-goal river-crossing-goal river-crossing-goal-button"
                                    onClick={handleGoalClick}
                                    disabled={!isAdjacentStep(currentPosition, GOAL_POSITION) || isResolving}
                                >
                                    <span className="river-crossing-goal-label">
                                        {t('games.river-crossing.ui.goalLabel')}
                                    </span>
                                    {currentPosition.row === cell.row && currentPosition.col === cell.col ? (
                                        renderJello('river-crossing-jello')
                                    ) : (
                                        <div className="river-crossing-goal-flag">🏁</div>
                                    )}
                                </button>
                            )}

                            {cell.type === 'stone' && (
                                <>
                                    <button
                                        type="button"
                                        className="river-crossing-stone"
                                        disabled={!isAdjacentStep(currentPosition, cell) || isResolving}
                                        onClick={() => handleStoneClick(cell)}
                                    >
                                        {cell.expression}
                                    </button>
                                    {currentPosition.row === cell.row && currentPosition.col === cell.col && (
                                        renderJello('river-crossing-stone-jello river-crossing-stone-jello-overlay')
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </Layout2>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const manifest: GameManifest = {
    id: GameIds.MATH_RIVER_CROSSING,
    title: 'River Crossing',
    titleKey: 'games.river-crossing.title',
    subtitle: 'Correct Stepping Stones',
    subtitleKey: 'games.river-crossing.subtitle',
    description: 'ㅇㅇㅇ',
    descriptionKey: 'games.river-crossing.description',
    category: 'math',
    level: 3,
    mode: 'adventure',
    component: RiverCrossing,
    thumbnail: '🌉'
};
