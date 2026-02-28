import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layout1 } from '../../../../layouts/Standard/Layout1';
import { useTenFramePopLogic } from './GameLogic';
import { buildOptions } from './optionGenerator';
import {
    applyDifficultyByAnswer,
    createInitialDifficultyProgress,
    DIFFICULTY_1,
    type DifficultyLevel,
    pickNextNForDifficulty
} from './difficulty';
import { usePopHint } from './usePopHint';
import './TenFramePop.css';
import type { GameManifest } from '../../../../types';
import { GameIds } from '../../../../../constants/gameIds';

interface TenFramePopProps {
    onExit: () => void;
}

const WaveBackground = () => (
    <div className="ten-frame-pop-wave-bg">
        <div className="ten-frame-pop-wave" />
        <div className="ten-frame-pop-wave" />
        <div className="ten-frame-pop-wave" />
    </div>
);

const CELLS_PER_ROW = 10;
const LAST_CELL_INDEX = 9;
const WRONG_BUBBLE_RESPAWN_MS = 440;
const RESPAWN_ANIMATION_MS = 320;
const ANSWER_FEEDBACK_MS = 900;
const POP_HINT_VISIBLE_MS = 1800;
const POP_HINT_EXIT_MS = 220;

export const TenFramePop: React.FC<TenFramePopProps> = ({ onExit }) => {
    const { t } = useTranslation();
    const logic = useTenFramePopLogic();
    const [n, setN] = React.useState(1);
    const [difficulty, setDifficulty] = React.useState(createInitialDifficultyProgress());
    const [roundKey, setRoundKey] = React.useState(0);
    const [rows, setRows] = React.useState<boolean[][]>([]);
    const [respawningCells, setRespawningCells] = React.useState<Set<string>>(new Set());
    const [options, setOptions] = React.useState<number[]>([]);
    const [selectedChoice, setSelectedChoice] = React.useState<number | null>(null);
    const [answerFeedback, setAnswerFeedback] = React.useState<'idle' | 'correct' | 'wrong'>('idle');
    const prevGameStateRef = React.useRef(logic.gameState);
    const respawnTimersRef = React.useRef<number[]>([]);
    const answerTimerRef = React.useRef<number | null>(null);
    const previousProblemNRef = React.useRef<number | null>(null);
    const rowsRef = React.useRef<boolean[][]>([]);

    const clearRespawnTimers = React.useCallback(() => {
        respawnTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
        respawnTimersRef.current = [];
    }, []);

    const clearAnswerTimer = React.useCallback(() => {
        if (answerTimerRef.current != null) {
            window.clearTimeout(answerTimerRef.current);
            answerTimerRef.current = null;
        }
    }, []);

    const setupRound = React.useCallback((forcedDifficulty?: DifficultyLevel) => {
        clearRespawnTimers();
        clearAnswerTimer();
        setRoundKey((prev) => prev + 1);
        const activeDifficulty = forcedDifficulty ?? difficulty.level;
        const nextN = pickNextNForDifficulty(activeDifficulty, previousProblemNRef.current);
        previousProblemNRef.current = nextN;
        setN(nextN);
        setRows(Array.from({ length: nextN }, () => Array(CELLS_PER_ROW).fill(false)));
        setRespawningCells(new Set());
        setOptions(buildOptions(nextN));
        setSelectedChoice(null);
        setAnswerFeedback('idle');
    }, [clearAnswerTimer, clearRespawnTimers, difficulty.level]);

    React.useEffect(() => {
        rowsRef.current = rows;
    }, [rows]);

    React.useEffect(() => {
        const prev = prevGameStateRef.current;
        if (logic.gameState === 'playing' && (prev === 'idle' || prev === 'gameover')) {
            setDifficulty(createInitialDifficultyProgress());
            previousProblemNRef.current = null;
            setupRound(DIFFICULTY_1);
        }
        prevGameStateRef.current = logic.gameState;
    }, [logic.gameState, setupRound]);

    React.useEffect(() => {
        return () => {
            clearRespawnTimers();
            clearAnswerTimer();
        };
    }, [clearAnswerTimer, clearRespawnTimers]);

    const isFirstProblem = logic.stats.correct === 0 && logic.stats.wrong === 0;
    const { showPopHint, isPopHintExiting } = usePopHint({
        gameState: logic.gameState,
        isFirstProblem,
        hasRows: rows.length > 0,
        visibleMs: POP_HINT_VISIBLE_MS,
        exitMs: POP_HINT_EXIT_MS
    });

    const handleBubbleClick = React.useCallback((rowIndex: number, cellIndex: number) => {
        if (logic.gameState !== 'playing') return;
        if (rowsRef.current[rowIndex]?.[cellIndex]) return;
        const cellKey = `${rowIndex}-${cellIndex}`;

        setRows((prev) => prev.map((row, rIdx) => {
            if (rIdx !== rowIndex || row[cellIndex]) return row;
            const next = [...row];
            next[cellIndex] = true;
            return next;
        }));

        if (cellIndex !== LAST_CELL_INDEX) {
            const timerId = window.setTimeout(() => {
                setRows((prev) => prev.map((row, rIdx) => {
                    if (rIdx !== rowIndex) return row;
                    if (!row[cellIndex]) return row;
                    const next = [...row];
                    next[cellIndex] = false;
                    return next;
                }));

                setRespawningCells((prev) => {
                    const next = new Set(prev);
                    next.add(cellKey);
                    return next;
                });

                const clearRespawnClassTimerId = window.setTimeout(() => {
                    setRespawningCells((prev) => {
                        const next = new Set(prev);
                        next.delete(cellKey);
                        return next;
                    });
                }, RESPAWN_ANIMATION_MS);
                respawnTimersRef.current.push(clearRespawnClassTimerId);

                // Refilled first -> then wrong feedback and life decrement.
                logic.registerEvent({ type: 'wrong' });
                logic.updateLives(false);
                logic.updateCombo(false);
            }, WRONG_BUBBLE_RESPAWN_MS);
            respawnTimersRef.current.push(timerId);
        }
    }, [logic]);

    const showChoices = rows.length > 0 && rows.every((row) => row[LAST_CELL_INDEX]);

    const handleChoiceClick = React.useCallback((value: number) => {
        if (!showChoices || logic.gameState !== 'playing' || answerFeedback !== 'idle') return;

        const correct = 9 * n;
        const isCorrect = value === correct;
        setSelectedChoice(value);
        setAnswerFeedback(isCorrect ? 'correct' : 'wrong');
        clearAnswerTimer();

        if (isCorrect) {
            const nextDifficulty = applyDifficultyByAnswer(difficulty, true);
            setDifficulty(nextDifficulty);

            logic.submitAnswer(true);
            logic.registerEvent({ type: 'correct', isFinal: true });
            answerTimerRef.current = window.setTimeout(() => {
                setupRound(nextDifficulty.level);
            }, ANSWER_FEEDBACK_MS);
            return;
        }

        setDifficulty(applyDifficultyByAnswer(difficulty, false));

        logic.registerEvent({ type: 'wrong' });
        logic.updateLives(false);
        logic.updateCombo(false);
        answerTimerRef.current = window.setTimeout(() => {
            setSelectedChoice(null);
            setAnswerFeedback('idle');
        }, ANSWER_FEEDBACK_MS);
    }, [answerFeedback, clearAnswerTimer, difficulty, logic, n, setupRound, showChoices]);

    const layoutEngine = {
        ...logic,
        onExit,
        difficultyLevel: difficulty.level,
        maxLevel: 2
    };
    const layoutEngineForLayout = layoutEngine as typeof logic;

    return (
        <Layout1
            title={t('games.ten-frame-pop.title')}
            subtitle={t('games.ten-frame-pop.subtitle')}
            description={t('games.ten-frame-pop.description')}
            gameId={GameIds.MATH_TEN_FRAME_POP}
            engine={layoutEngineForLayout}
            cardBackground={<WaveBackground />}
            instructions={[
                { icon: '1️⃣', title: t('games.ten-frame-pop.howToPlay.step1.title'), description: t('games.ten-frame-pop.howToPlay.step1.description') },
                { icon: '2️⃣', title: t('games.ten-frame-pop.howToPlay.step2.title'), description: t('games.ten-frame-pop.howToPlay.step2.description') },
                { icon: '3️⃣', title: t('games.ten-frame-pop.howToPlay.step3.title'), description: t('games.ten-frame-pop.howToPlay.step3.description') }
            ]}
            onExit={onExit}
        >
            <div className="ten-frame-pop-layout">
                <section className="ten-frame-pop-problem-box">
                    <div className="ten-frame-pop-problem-col ten-frame-pop-problem-col-left">
                        <h3>🫧 9x{n}</h3>
                    </div>
                    <div className={`ten-frame-pop-problem-col ten-frame-pop-problem-col-mid ${showChoices ? 'is-visible' : ''}`}>
                        =
                    </div>
                    <div className={`ten-frame-pop-problem-col ten-frame-pop-problem-col-right ${showChoices ? 'is-visible' : ''}`}>
                        <div className="ten-frame-pop-formula-pill">{10 * n}-{n}</div>
                    </div>
                </section>

                <section className="ten-frame-pop-stack-area" aria-label="ten-frame-stack-preview">
                    {showPopHint && (
                        <div className={`ten-frame-pop-hint ${isPopHintExiting ? 'is-exiting' : ''}`}>
                            {t('games.ten-frame-pop.ui.popHint')}
                        </div>
                    )}

                    <div className="ten-frame-pop-stack">
                        <div className="ten-frame-pop-number-row" aria-label="ten-frame-number-row">
                            {Array.from({ length: 10 }).map((_, index) => (
                                <div key={`number-cell-${index}`} className="ten-frame-pop-number-cell">
                                    {index + 1}
                                </div>
                            ))}
                        </div>
                        {rows.map((row, rowIndex) => (
                            <div
                                key={`round-${roundKey}-row-${rowIndex}`}
                                className="ten-frame-pop-row"
                                style={{ animationDelay: `${rowIndex * 0.078}s` }}
                            >
                                {row.map((isPopped, colIndex) => {
                                    const isLastBubble = colIndex === LAST_CELL_INDEX;
                                    return (
                                        <button
                                            key={`cell-${rowIndex}-${colIndex}`}
                                            type="button"
                                            className={`ten-frame-pop-bubble ${isLastBubble ? 'is-last-bubble' : ''} ${isPopped ? 'is-popped' : ''} ${respawningCells.has(`${rowIndex}-${colIndex}`) ? 'is-respawning' : ''}`}
                                            onClick={() => handleBubbleClick(rowIndex, colIndex)}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    <div className={`ten-frame-pop-choices-overlay ${showChoices ? 'is-visible' : ''}`}>
                        <div className="ten-frame-pop-choices">
                            {options.map((option, index) => (
                                <button
                                    key={`choice-${index}-${option}`}
                                    type="button"
                                    className={`ten-frame-pop-choice-btn ${selectedChoice === option ? 'is-selected' : ''} ${selectedChoice === option && answerFeedback === 'correct' ? 'is-correct' : ''} ${selectedChoice === option && answerFeedback === 'wrong' ? 'is-wrong' : ''}`}
                                    onClick={() => handleChoiceClick(option)}
                                    disabled={answerFeedback !== 'idle'}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </Layout1>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const manifest: GameManifest = {
    id: GameIds.MATH_TEN_FRAME_POP,
    title: '10-Frame Pop',
    titleKey: 'games.ten-frame-pop.title',
    subtitle: 'Master 9s!',
    subtitleKey: 'games.ten-frame-pop.subtitle',
    description: 'Pop the last bubbles and solve 9-times fast.',
    descriptionKey: 'games.ten-frame-pop.description',
    category: 'math',
    level: 3,
    component: TenFramePop,
    thumbnail: '🫧'
};
