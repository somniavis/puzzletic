import React from 'react';
import { useTranslation } from 'react-i18next';
import type { GameManifest } from '../../../../types';
import { Layout2 } from '../../../../layouts/Standard/Layout2';
import { useGameEngine } from '../../../../layouts/Standard/Layout0/useGameEngine';
import { GameIds } from '../../../../../constants/gameIds';
import './NeonMatrix.css';

interface NeonMatrixProps {
    onExit: () => void;
}

type Cell = {
    value: number;
    tens: number;
    ones: number;
    maskedTens: boolean;
    maskedOnes: boolean;
    filledTens: number | null;
    filledOnes: number | null;
};

type RoundMode = 'pattern' | 'verticalMatch';

type RoundState = {
    cells: Cell[];
    blankIndices: number[];
    activeCursor: number;
    activePart: 'tens' | 'ones';
    mode: RoundMode;
};
type DifficultyLevel = 1 | 2;

const MATRIX_VALUES = [8, 16, 24, 32, 40, 48, 56, 64, 72, 80] as const;
const LEVEL1_KEYPAD_DIGITS = [8, 6, 4, 2, 0] as const;
const LEVEL2_KEYPAD_DIGITS = [8, 6, 4, 2, 0, 9, 7, 5, 3, 1] as const;
const COLUMN_PAIRS: Array<[number, number]> = [[0, 5], [1, 6], [2, 7], [3, 8], [4, 9]];
const REWARD_TYPES: Array<'timeFreeze' | 'extraLife' | 'doubleScore'> = ['timeFreeze', 'extraLife', 'doubleScore'];

const shuffle = <T,>(items: readonly T[]): T[] => {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

const pickBlankIndices = (difficultyLevel: number): { blankIndices: number[]; mode: RoundMode } => {
    if (difficultyLevel >= 2) {
        const blanksCount = 3 + Math.floor(Math.random() * 3); // 3~5
        const shuffledPairs = shuffle(COLUMN_PAIRS);
        const picked = shuffledPairs.slice(0, blanksCount).map(([top, bottom]) => (Math.random() < 0.5 ? top : bottom));
        return { blankIndices: picked, mode: 'verticalMatch' };
    }

    const blanksCount = 2 + Math.floor(Math.random() * 3); // 2~4
    const candidates = shuffle(MATRIX_VALUES.map((_, idx) => idx));
    return { blankIndices: candidates.slice(0, blanksCount), mode: 'pattern' };
};

const createRound = (difficultyLevel: number, prevSignature?: string): RoundState => {
    let blankIndices: number[] = [];
    let mode: RoundMode = 'pattern';
    let signature = '';

    for (let attempt = 0; attempt < 8; attempt += 1) {
        const picked = pickBlankIndices(difficultyLevel);
        blankIndices = picked.blankIndices.sort((a, b) => a - b);
        mode = picked.mode;
        signature = `${mode}:${blankIndices.join('-')}`;
        if (!prevSignature || signature !== prevSignature) break;
    }

    const blankSet = new Set(blankIndices);
    const cells: Cell[] = MATRIX_VALUES.map((value, index) => ({
        value,
        tens: Math.floor(value / 10),
        ones: value % 10,
        maskedTens: difficultyLevel >= 2 && blankSet.has(index),
        maskedOnes: blankSet.has(index),
        filledTens: null,
        filledOnes: null
    }));

    return { cells, blankIndices, activeCursor: 0, activePart: difficultyLevel >= 2 ? 'tens' : 'ones', mode };
};

const isCellResolved = (cell: Cell): boolean => {
    const tensResolved = !cell.maskedTens || cell.filledTens !== null;
    const onesResolved = !cell.maskedOnes || cell.filledOnes !== null;
    return tensResolved && onesResolved;
};

export const NeonMatrix: React.FC<NeonMatrixProps> = ({ onExit }) => {
    const { t } = useTranslation();
    const engine = useGameEngine({ initialLives: 3, initialTime: 90, maxDifficulty: 2 });

    const [difficultyLevel, setDifficultyLevel] = React.useState<DifficultyLevel>(1);
    const [consecutiveSetSuccess, setConsecutiveSetSuccess] = React.useState(0);
    const [setSuccessCountAtLevel, setSetSuccessCountAtLevel] = React.useState(0);
    const [consecutiveWrong, setConsecutiveWrong] = React.useState(0);
    const [round, setRound] = React.useState<RoundState>(() => createRound(1));
    const [feedbackKind, setFeedbackKind] = React.useState<'correct' | 'wrong' | null>(null);
    const [hintPairIndices, setHintPairIndices] = React.useState<number[] | null>(null);
    const [rowPulse, setRowPulse] = React.useState<0 | 1 | null>(null);
    const [cyclePulse, setCyclePulse] = React.useState(false);
    const [showPatternHint, setShowPatternHint] = React.useState(false);
    const [isPatternHintExiting, setIsPatternHintExiting] = React.useState(false);

    const prevGameStateRef = React.useRef(engine.gameState);
    const prevRoundSignatureRef = React.useRef<string>('');
    const hasShownPatternHintRef = React.useRef(false);
    const feedbackTimerRef = React.useRef<number | null>(null);
    const nextRoundTimerRef = React.useRef<number | null>(null);
    const hintPairTimerRef = React.useRef<number | null>(null);
    const rowPulseTimerRef = React.useRef<number | null>(null);
    const cyclePulseTimerRef = React.useRef<number | null>(null);
    const patternHintTimerRef = React.useRef<number | null>(null);
    const patternHintExitTimerRef = React.useRef<number | null>(null);

    const clearTimers = React.useCallback(() => {
        if (feedbackTimerRef.current != null) {
            window.clearTimeout(feedbackTimerRef.current);
            feedbackTimerRef.current = null;
        }
        if (nextRoundTimerRef.current != null) {
            window.clearTimeout(nextRoundTimerRef.current);
            nextRoundTimerRef.current = null;
        }
        if (hintPairTimerRef.current != null) {
            window.clearTimeout(hintPairTimerRef.current);
            hintPairTimerRef.current = null;
        }
        if (rowPulseTimerRef.current != null) {
            window.clearTimeout(rowPulseTimerRef.current);
            rowPulseTimerRef.current = null;
        }
        if (cyclePulseTimerRef.current != null) {
            window.clearTimeout(cyclePulseTimerRef.current);
            cyclePulseTimerRef.current = null;
        }
        if (patternHintTimerRef.current != null) {
            window.clearTimeout(patternHintTimerRef.current);
            patternHintTimerRef.current = null;
        }
        if (patternHintExitTimerRef.current != null) {
            window.clearTimeout(patternHintExitTimerRef.current);
            patternHintExitTimerRef.current = null;
        }
    }, []);

    const startNextRound = React.useCallback((nextDifficulty: DifficultyLevel) => {
        setRound(() => {
            const next = createRound(nextDifficulty, prevRoundSignatureRef.current);
            prevRoundSignatureRef.current = `${next.mode}:${next.blankIndices.join('-')}`;
            return next;
        });
    }, []);

    React.useEffect(
        () => () => {
            clearTimers();
        },
        [clearTimers]
    );

    React.useEffect(() => {
        const prev = prevGameStateRef.current;
        if (engine.gameState === 'playing' && (prev === 'idle' || prev === 'gameover')) {
            clearTimers();
            setDifficultyLevel(1);
            setConsecutiveSetSuccess(0);
            setSetSuccessCountAtLevel(0);
            setConsecutiveWrong(0);
            setFeedbackKind(null);
            setHintPairIndices(null);
            setRowPulse(null);
            setCyclePulse(false);
            setShowPatternHint(false);
            setIsPatternHintExiting(false);
            hasShownPatternHintRef.current = false;
            startNextRound(1);
        }

        if (engine.gameState === 'idle' || engine.gameState === 'gameover') {
            clearTimers();
            setFeedbackKind(null);
            setHintPairIndices(null);
            setRowPulse(null);
            setCyclePulse(false);
            setShowPatternHint(false);
            setIsPatternHintExiting(false);
            hasShownPatternHintRef.current = false;
        }

        prevGameStateRef.current = engine.gameState;
    }, [clearTimers, engine.gameState, startNextRound]);

    const activeIndex = round.blankIndices[round.activeCursor] ?? null;
    const playKeyPressAnimation = React.useCallback((element: HTMLButtonElement) => {
        element.classList.remove('is-pressing');
        // Restart CSS animation reliably across Chromium browsers.
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        element.offsetWidth;
        element.classList.add('is-pressing');
        element.blur();
    }, []);

    const handleOptionTap = React.useCallback((selectedOnes: number) => {
        if (engine.gameState !== 'playing' || activeIndex === null) return;

        const activeCell = round.cells[activeIndex];
        const expectedDigit = round.activePart === 'tens' ? activeCell.tens : activeCell.ones;
        const isCorrect = expectedDigit === selectedOnes;
        engine.submitAnswer(isCorrect, { skipFeedback: true, skipDifficulty: true, skipCombo: false, scoreMultiplier: 0.5 });

        setFeedbackKind(isCorrect ? 'correct' : 'wrong');
        if (feedbackTimerRef.current != null) window.clearTimeout(feedbackTimerRef.current);
        const feedbackDuration = isCorrect ? 220 : 760;
        feedbackTimerRef.current = window.setTimeout(() => {
            setFeedbackKind(null);
            feedbackTimerRef.current = null;
        }, feedbackDuration);

        if (!isCorrect) {
            engine.registerEvent({ type: 'wrong' });
            const nextConsecutiveWrong = consecutiveWrong + 1;
            const shouldDemote = difficultyLevel === 2 && nextConsecutiveWrong >= 4;
            setConsecutiveSetSuccess(0);
            setConsecutiveWrong(shouldDemote ? 0 : nextConsecutiveWrong);
            if (shouldDemote) {
                setDifficultyLevel(1);
                setSetSuccessCountAtLevel(0);
            }

            const pair = COLUMN_PAIRS.find(([top, bottom]) => top === activeIndex || bottom === activeIndex);
            if (pair) {
                const peerIndex = pair[0] === activeIndex ? pair[1] : pair[0];
                setHintPairIndices([peerIndex]);
            }
            if (hintPairTimerRef.current != null) window.clearTimeout(hintPairTimerRef.current);
            hintPairTimerRef.current = window.setTimeout(() => {
                setHintPairIndices(null);
                hintPairTimerRef.current = null;
            }, 760);
            return;
        }

        const rowStart = activeIndex < 5 ? 0 : 5;
        const rowBlankIndices = Array.from({ length: 5 }, (_, offset) => rowStart + offset).filter((idx) => {
            const cell = round.cells[idx];
            return cell.maskedTens || cell.maskedOnes;
        });

        const projectedActiveCell: Cell = {
            ...activeCell,
            filledTens: round.activePart === 'tens' ? selectedOnes : activeCell.filledTens,
            filledOnes: round.activePart === 'ones' ? selectedOnes : activeCell.filledOnes
        };
        const rowWillComplete =
            rowBlankIndices.length > 0 &&
            rowBlankIndices.every((idx) => {
                if (idx !== activeIndex) return isCellResolved(round.cells[idx]);
                return isCellResolved(projectedActiveCell);
            });
        if (rowWillComplete) {
            setRowPulse(rowStart === 0 ? 0 : 1);
            if (rowPulseTimerRef.current != null) window.clearTimeout(rowPulseTimerRef.current);
            rowPulseTimerRef.current = window.setTimeout(() => {
                setRowPulse(null);
                rowPulseTimerRef.current = null;
            }, 520);
        }

        const nextCombo = engine.combo + 1;
        if (nextCombo % 3 === 0 && Math.random() > 0.45) {
            const reward = REWARD_TYPES[Math.floor(Math.random() * REWARD_TYPES.length)];
            engine.setPowerUps((prev) => ({ ...prev, [reward]: prev[reward] + 1 }));
        }

        if (nextCombo % 5 === 0) {
            setCyclePulse(true);
            if (cyclePulseTimerRef.current != null) window.clearTimeout(cyclePulseTimerRef.current);
            cyclePulseTimerRef.current = window.setTimeout(() => {
                setCyclePulse(false);
                cyclePulseTimerRef.current = null;
            }, 650);
        }

        const projectedCellResolved =
            (!projectedActiveCell.maskedTens || projectedActiveCell.filledTens !== null) &&
            (!projectedActiveCell.maskedOnes || projectedActiveCell.filledOnes !== null);
        const projectedNextCursor = projectedCellResolved ? round.activeCursor + 1 : round.activeCursor;
        const roundCompleted = projectedNextCursor >= round.blankIndices.length;

        setConsecutiveWrong(0);
        if (roundCompleted && difficultyLevel === 1) {
            const nextConsecutiveSetSuccess = consecutiveSetSuccess + 1;
            const nextSetSuccessCountAtLevel = setSuccessCountAtLevel + 1;
            const shouldPromote = nextSetSuccessCountAtLevel >= 5;
            if (shouldPromote) {
                setDifficultyLevel(2);
                setConsecutiveSetSuccess(0);
                setSetSuccessCountAtLevel(0);
            } else {
                setConsecutiveSetSuccess(nextConsecutiveSetSuccess);
                setSetSuccessCountAtLevel(nextSetSuccessCountAtLevel);
            }
        }

        setRound((prev) => {
            const nextCells = [...prev.cells];
            const target = nextCells[activeIndex];
            const updatedTarget: Cell = {
                ...target,
                filledTens: prev.activePart === 'tens' ? selectedOnes : target.filledTens,
                filledOnes: prev.activePart === 'ones' ? selectedOnes : target.filledOnes
            };
            updatedTarget.value = (updatedTarget.filledTens ?? target.tens) * 10 + (updatedTarget.filledOnes ?? target.ones);
            nextCells[activeIndex] = updatedTarget;

            const tensResolved = !updatedTarget.maskedTens || updatedTarget.filledTens !== null;
            const onesResolved = !updatedTarget.maskedOnes || updatedTarget.filledOnes !== null;
            const shouldMoveNextCell = tensResolved && onesResolved;

            const nextCursor = shouldMoveNextCell ? prev.activeCursor + 1 : prev.activeCursor;
            const nextActiveIndex = prev.blankIndices[nextCursor];
            const nextActivePart = shouldMoveNextCell
                ? (nextActiveIndex != null && nextCells[nextActiveIndex].maskedTens ? 'tens' : 'ones')
                : 'ones';

            return { ...prev, cells: nextCells, activeCursor: nextCursor, activePart: nextActivePart };
        });
        if (roundCompleted) {
            engine.registerEvent({ type: 'correct', isFinal: true });
        }
    }, [activeIndex, consecutiveSetSuccess, consecutiveWrong, difficultyLevel, engine, round.activePart, round.activeCursor, round.blankIndices.length, round.cells, setSuccessCountAtLevel]);

    React.useEffect(() => {
        if (engine.gameState !== 'playing') return;
        if (activeIndex !== null) return;

        if (nextRoundTimerRef.current != null) window.clearTimeout(nextRoundTimerRef.current);
        nextRoundTimerRef.current = window.setTimeout(() => {
            startNextRound(difficultyLevel);
            nextRoundTimerRef.current = null;
        }, 260);
    }, [activeIndex, difficultyLevel, engine.gameState, startNextRound]);

    React.useEffect(() => {
        const isFirstProblem = engine.stats.correct === 0 && engine.stats.wrong === 0;
        if (engine.gameState !== 'playing' || activeIndex === null || !isFirstProblem || hasShownPatternHintRef.current) {
            return;
        }

        hasShownPatternHintRef.current = true;
        setShowPatternHint(true);
        setIsPatternHintExiting(false);

        patternHintTimerRef.current = window.setTimeout(() => {
            setIsPatternHintExiting(true);
            patternHintExitTimerRef.current = window.setTimeout(() => {
                setShowPatternHint(false);
                setIsPatternHintExiting(false);
                patternHintExitTimerRef.current = null;
            }, 220);
            patternHintTimerRef.current = null;
        }, 1800);
    }, [activeIndex, engine.gameState, engine.stats.correct, engine.stats.wrong]);

    const powerUps = React.useMemo(() => ([
        {
            count: engine.powerUps.timeFreeze,
            color: 'blue' as const,
            icon: '❄️',
            title: t('games.neon-matrix.powerups.timeFreeze'),
            onClick: () => engine.activatePowerUp('timeFreeze'),
            disabledConfig: engine.isTimeFrozen,
            status: engine.isTimeFrozen ? 'active' as const : 'normal' as const
        },
        {
            count: engine.powerUps.extraLife,
            color: 'red' as const,
            icon: '❤️',
            title: t('games.neon-matrix.powerups.extraLife'),
            onClick: () => engine.activatePowerUp('extraLife'),
            disabledConfig: engine.lives >= 3,
            status: engine.lives >= 3 ? 'maxed' as const : 'normal' as const
        },
        {
            count: engine.powerUps.doubleScore,
            color: 'yellow' as const,
            icon: '⚡',
            title: t('games.neon-matrix.powerups.doubleScore'),
            onClick: () => engine.activatePowerUp('doubleScore'),
            disabledConfig: engine.isDoubleScore,
            status: engine.isDoubleScore ? 'active' as const : 'normal' as const
        }
    ]), [engine, t]);

    const instructions = React.useMemo(() => ([
        { icon: '🧠', title: t('games.neon-matrix.howToPlay.step1.title'), description: t('games.neon-matrix.howToPlay.step1.description') },
        { icon: '🔢', title: t('games.neon-matrix.howToPlay.step2.title'), description: t('games.neon-matrix.howToPlay.step2.description') },
        { icon: '⚡', title: t('games.neon-matrix.howToPlay.step3.title'), description: t('games.neon-matrix.howToPlay.step3.description') }
    ]), [t]);

    const layoutEngine = React.useMemo(
        () => ({ ...engine, difficultyLevel }),
        [difficultyLevel, engine]
    );

    return (
        <Layout2
            gameId={GameIds.MATH_NEON_MATRIX}
            title={t('games.neon-matrix.title')}
            subtitle={t('games.neon-matrix.subtitle')}
            description={t('games.neon-matrix.description')}
            instructions={instructions}
            engine={layoutEngine}
            onExit={onExit}
            powerUps={powerUps}
            className="neon-matrix-layout2"
            cardBackground={<div className="neon-matrix-card-bg" />}
        >
            <div className="neon-matrix-shell">
                {showPatternHint && (
                    <div className={`neon-matrix-pattern-hint ${isPatternHintExiting ? 'is-exiting' : ''}`}>
                        {t('games.neon-matrix.ui.patternHint')}
                    </div>
                )}

                <div className="neon-matrix-sign">
                    <div className="neon-matrix-sign-title">{t('games.neon-matrix.ui.signTitle')}</div>
                    <div className="neon-matrix-sign-code">{t('games.neon-matrix.ui.signCode')}</div>
                </div>

                <div className={`neon-matrix-board ${feedbackKind ? `is-${feedbackKind}` : ''} ${rowPulse !== null ? `is-row-pulse-${rowPulse}` : ''} ${cyclePulse ? 'is-cycle-pulse' : ''}`}>
                    {round.cells.map((cell, index) => {
                        const isActive = activeIndex === index;
                        const isMasked = (cell.maskedTens && cell.filledTens === null) || (cell.maskedOnes && cell.filledOnes === null);
                        const isHintPair = hintPairIndices?.includes(index) ?? false;
                        const displayTens = cell.filledTens ?? cell.tens;
                        const displayOnes = cell.filledOnes ?? cell.ones;
                        const tensQuestion = cell.maskedTens && cell.filledTens === null && isActive && round.activePart === 'tens';
                        const onesQuestion =
                            cell.maskedOnes &&
                            cell.filledOnes === null &&
                            (!isActive || round.activePart === 'ones' || !cell.maskedTens);
                        return (
                            <button
                                key={`neon-cell-${index}`}
                                type="button"
                                className={`neon-matrix-cell row-${Math.floor(index / 5)} ${isActive ? 'is-active' : ''} ${isMasked ? 'is-masked' : ''} ${isHintPair ? 'is-hint-pair' : ''}`}
                                style={{ '--col-index': index % 5 } as React.CSSProperties}
                                disabled
                                aria-label={t('games.neon-matrix.ui.cellAriaLabel', { index: index + 1 })}
                            >
                                <span className="neon-matrix-cell-label">{t('games.neon-matrix.ui.cellLabel', { index: index + 1 })}</span>
                                <span className="neon-matrix-cell-value">
                                    <span className={`neon-matrix-tens ${tensQuestion ? 'is-question' : ''}`}>
                                        {cell.maskedTens && cell.filledTens === null ? '?' : displayTens}
                                    </span>
                                    <span className={`neon-matrix-ones ${onesQuestion ? 'is-question' : ''}`}>
                                        {cell.maskedOnes && cell.filledOnes === null ? '?' : displayOnes}
                                    </span>
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="neon-matrix-keypad">
                    {(difficultyLevel >= 2 ? LEVEL2_KEYPAD_DIGITS : LEVEL1_KEYPAD_DIGITS).map((digit) => (
                        <button
                            key={`ones-${digit}`}
                            type="button"
                            className="neon-matrix-key-btn"
                            onAnimationEnd={(event) => {
                                event.currentTarget.classList.remove('is-pressing');
                            }}
                            onClick={(event) => {
                                playKeyPressAnimation(event.currentTarget);
                                handleOptionTap(digit);
                            }}
                            disabled={engine.gameState !== 'playing' || activeIndex === null}
                        >
                            {digit}
                        </button>
                    ))}
                </div>

            </div>
        </Layout2>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const manifest: GameManifest = {
    id: GameIds.MATH_NEON_MATRIX,
    title: 'Neon Matrix',
    titleKey: 'games.neon-matrix.title',
    subtitle: 'Master 8s',
    subtitleKey: 'games.neon-matrix.subtitle',
    description: 'A multiplication game for the 8 times table.',
    descriptionKey: 'games.neon-matrix.description',
    category: 'math',
    level: 3,
    mode: 'adventure',
    component: NeonMatrix,
    thumbnail: '8',
    tagsKey: 'games.tags.multiplication'
};
