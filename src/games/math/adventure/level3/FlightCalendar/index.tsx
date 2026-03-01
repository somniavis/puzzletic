import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layout3 } from '../../../../layouts/Standard/Layout3';
import { useGameEngine } from '../../../../layouts/Standard/Layout0/useGameEngine';
import type { GameManifest } from '../../../../types';
import { GameIds } from '../../../../../constants/gameIds';
import type { PowerUpBtnProps } from '../../../../../components/Game/PowerUpBtn';
import './FlightCalendar.css';

interface FlightCalendarProps {
    onExit: () => void;
}
type RoundState = {
    n: number;
    filledWeeks: boolean[];
    options: number[];
};

type DifficultyLevel = 1 | 2;
const MULTIPLIER = 7;

const N_RANGES: Record<DifficultyLevel, { min: number; max: number }> = {
    1: { min: 1, max: 4 },
    2: { min: 2, max: 9 }
};
const REWARD_TYPES: Array<'timeFreeze' | 'extraLife' | 'doubleScore'> = ['timeFreeze', 'extraLife', 'doubleScore'];
const CALENDAR_ROWS = 9;
const CALENDAR_COLS = 7;
const CALENDAR_CELLS = CALENDAR_ROWS * CALENDAR_COLS;
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const shuffle = <T,>(arr: T[]): T[] => {
    const next = [...arr];
    for (let i = next.length - 1; i > 0; i -= 1) {
        const j = randInt(0, i);
        [next[i], next[j]] = [next[j], next[i]];
    }
    return next;
};
const buildOptions = (correct: number): number[] => {
    const candidates = new Set<number>([correct]);
    while (candidates.size < 3) {
        const delta = randInt(1, 6) * (Math.random() < 0.5 ? -1 : 1);
        const wrong = Math.max(7, Math.min(63, correct + delta));
        if (wrong !== correct) candidates.add(wrong);
    }
    return shuffle(Array.from(candidates));
};
const getCalendarRowCount = (n: number): number => {
    if (n <= 3) return 4;
    if (n <= 6) return n + 2; // n=4,5,6 -> rows=6,7,8
    return 9;
};
const createRoundState = (difficulty: DifficultyLevel, prevN?: number): RoundState => {
    const range = N_RANGES[difficulty];
    let nextN = randInt(range.min, range.max);
    if (prevN !== undefined && range.max > range.min) {
        for (let i = 0; i < 10 && nextN === prevN; i += 1) {
            nextN = randInt(range.min, range.max);
        }
    }
    return {
        n: nextN,
        filledWeeks: Array.from({ length: CALENDAR_ROWS }, () => false),
        options: buildOptions(MULTIPLIER * nextN)
    };
};
export const FlightCalendar: React.FC<FlightCalendarProps> = ({ onExit }) => {
    const { t } = useTranslation();
    const engine = useGameEngine({ initialLives: 3, initialTime: 90, maxDifficulty: 2 });
    const [difficultyLevel, setDifficultyLevel] = React.useState<DifficultyLevel>(1);
    const [consecutiveCorrect, setConsecutiveCorrect] = React.useState(0);
    const [correctCountAtLevel, setCorrectCountAtLevel] = React.useState(0);
    const [consecutiveWrong, setConsecutiveWrong] = React.useState(0);
    const [round, setRound] = React.useState<RoundState>(() => createRoundState(1));
    const [wrongCells, setWrongCells] = React.useState<boolean[]>(Array.from({ length: CALENDAR_CELLS }, () => false));
    const [pressingOption, setPressingOption] = React.useState<number | null>(null);
    const [showTapHint, setShowTapHint] = React.useState(false);
    const [isTapHintExiting, setIsTapHintExiting] = React.useState(false);
    const prevGameStateRef = React.useRef(engine.gameState);
    const hasShownTapHintRef = React.useRef(false);
    const wrongCellTimersRef = React.useRef<Array<number | null>>(Array.from({ length: CALENDAR_CELLS }, () => null));
    const tapHintTimerRef = React.useRef<number | null>(null);
    const tapHintExitTimerRef = React.useRef<number | null>(null);

    const setupRound = React.useCallback((difficulty: DifficultyLevel) => {
        setPressingOption(null);
        setRound((prev) => createRoundState(difficulty, prev.n));
        setWrongCells(Array.from({ length: CALENDAR_CELLS }, () => false));
    }, []);

    React.useEffect(
        () => () => {
            wrongCellTimersRef.current.forEach((timer) => {
                if (timer != null) window.clearTimeout(timer);
            });
            if (tapHintTimerRef.current != null) {
                window.clearTimeout(tapHintTimerRef.current);
                tapHintTimerRef.current = null;
            }
            if (tapHintExitTimerRef.current != null) {
                window.clearTimeout(tapHintExitTimerRef.current);
                tapHintExitTimerRef.current = null;
            }
        },
        []
    );

    React.useEffect(() => {
        const prev = prevGameStateRef.current;
        if (engine.gameState === 'playing' && (prev === 'idle' || prev === 'gameover')) {
            setDifficultyLevel(1);
            setConsecutiveCorrect(0);
            setCorrectCountAtLevel(0);
            setConsecutiveWrong(0);
            setupRound(1);
        }
        if (engine.gameState === 'gameover') {
            if (tapHintTimerRef.current != null) {
                window.clearTimeout(tapHintTimerRef.current);
                tapHintTimerRef.current = null;
            }
            if (tapHintExitTimerRef.current != null) {
                window.clearTimeout(tapHintExitTimerRef.current);
                tapHintExitTimerRef.current = null;
            }
            setShowTapHint(false);
            setIsTapHintExiting(false);
            hasShownTapHintRef.current = false;
        }
        prevGameStateRef.current = engine.gameState;
    }, [engine.gameState, setupRound]);
    React.useEffect(() => {
        const isFirstProblem = engine.stats.correct === 0 && engine.stats.wrong === 0;
        if (engine.gameState !== 'playing' || !isFirstProblem || hasShownTapHintRef.current) return;

        hasShownTapHintRef.current = true;
        setShowTapHint(true);
        setIsTapHintExiting(false);

        tapHintTimerRef.current = window.setTimeout(() => {
            setIsTapHintExiting(true);
            tapHintExitTimerRef.current = window.setTimeout(() => {
                setShowTapHint(false);
                setIsTapHintExiting(false);
                tapHintExitTimerRef.current = null;
            }, 220);
            tapHintTimerRef.current = null;
        }, 1800);

        return () => {
            if (tapHintTimerRef.current != null) {
                window.clearTimeout(tapHintTimerRef.current);
                tapHintTimerRef.current = null;
            }
            if (tapHintExitTimerRef.current != null) {
                window.clearTimeout(tapHintExitTimerRef.current);
                tapHintExitTimerRef.current = null;
            }
        };
    }, [engine.gameState, engine.stats.correct, engine.stats.wrong]);

    const layoutEngine = React.useMemo(
        () => ({
            ...engine,
            onExit,
            difficultyLevel,
            maxLevel: 2
        }),
        [difficultyLevel, engine, onExit]
    );
    const layoutEngineForLayout = layoutEngine as typeof engine;

    const handleWrongHiveClick = React.useCallback((index: number) => {
        if (engine.gameState !== 'playing') return;

        setWrongCells((prev) => {
            const next = [...prev];
            next[index] = true;
            return next;
        });

        if (wrongCellTimersRef.current[index] != null) {
            window.clearTimeout(wrongCellTimersRef.current[index]!);
        }
        wrongCellTimersRef.current[index] = window.setTimeout(() => {
            setWrongCells((prev) => {
                const next = [...prev];
                next[index] = false;
                return next;
            });
            wrongCellTimersRef.current[index] = null;
        }, 360);

        engine.registerEvent({ type: 'wrong' });
        engine.updateLives(false);
        engine.updateCombo(false);
    }, [engine]);

    const handleWeekClick = React.useCallback((index: number) => {
        if (engine.gameState !== 'playing') return;

        const rowIndex = Math.floor(index / CALENDAR_COLS);
        let isOverClick = false;

        setRound((prev) => {
            const filledWeekCount = prev.filledWeeks.filter(Boolean).length;
            if (filledWeekCount >= prev.n) {
                isOverClick = true;
                return prev;
            }

            if (prev.filledWeeks[rowIndex]) return prev;

            const nextFilledWeeks = [...prev.filledWeeks];
            nextFilledWeeks[rowIndex] = true;
            return { ...prev, filledWeeks: nextFilledWeeks };
        });

        if (isOverClick) {
            handleWrongHiveClick(index);
        }
    }, [engine.gameState, handleWrongHiveClick]);
    const allBloomed = React.useMemo(
        () => round.filledWeeks.filter(Boolean).length >= round.n,
        [round.filledWeeks, round.n]
    );
    const handleOptionClick = React.useCallback((value: number, buttonEl?: HTMLButtonElement | null) => {
        if (engine.gameState !== 'playing' || !allBloomed) return;
        buttonEl?.blur();
        setPressingOption(null);

        const correct = MULTIPLIER * round.n;
        const isCorrect = value === correct;

        if (isCorrect) {
            const nextConsecutiveCorrect = consecutiveCorrect + 1;
            const nextCorrectCountAtLevel = correctCountAtLevel + 1;
            const shouldPromote = difficultyLevel === 1 && (nextConsecutiveCorrect >= 3 || nextCorrectCountAtLevel >= 4);
            const nextDifficulty: DifficultyLevel = shouldPromote ? 2 : difficultyLevel;

            setConsecutiveWrong(0);
            setConsecutiveCorrect(shouldPromote ? 0 : (difficultyLevel === 1 ? nextConsecutiveCorrect : 0));
            setCorrectCountAtLevel(shouldPromote ? 0 : (difficultyLevel === 1 ? nextCorrectCountAtLevel : 0));
            if (shouldPromote) {
                setDifficultyLevel(2);
            }

            const nextCombo = engine.combo + 1;
            if (nextCombo % 3 === 0 && Math.random() > 0.45) {
                const reward = REWARD_TYPES[Math.floor(Math.random() * REWARD_TYPES.length)];
                engine.setPowerUps((prev) => ({ ...prev, [reward]: prev[reward] + 1 }));
            }
            engine.submitAnswer(true, { skipFeedback: true, skipDifficulty: true });
            engine.registerEvent({ type: 'correct', isFinal: true });
            setupRound(nextDifficulty);
            return;
        }

        const nextConsecutiveWrong = consecutiveWrong + 1;
        const shouldDemote = difficultyLevel === 2 && nextConsecutiveWrong >= 2;
        setConsecutiveCorrect(0);
        setCorrectCountAtLevel(0);
        setConsecutiveWrong(shouldDemote ? 0 : nextConsecutiveWrong);
        if (shouldDemote) {
            setDifficultyLevel(1);
        }

        engine.registerEvent({ type: 'wrong' });
        engine.updateLives(false);
        engine.updateCombo(false);
    }, [allBloomed, consecutiveCorrect, consecutiveWrong, correctCountAtLevel, difficultyLevel, engine, round.n, setupRound]);
    const handleOptionPointerDown = React.useCallback((value: number) => {
        if (engine.gameState !== 'playing' || !allBloomed) return;
        setPressingOption(value);
    }, [allBloomed, engine.gameState]);
    const clearPressingOption = React.useCallback(() => setPressingOption(null), []);
    const calendarRowCount = React.useMemo(() => getCalendarRowCount(round.n), [round.n]);
    const visibleCells = React.useMemo(() => calendarRowCount * CALENDAR_COLS, [calendarRowCount]);
    const weekdays = React.useMemo(
        () => ([
            t('games.flight-calendar.weekdays.mon'),
            t('games.flight-calendar.weekdays.tue'),
            t('games.flight-calendar.weekdays.wed'),
            t('games.flight-calendar.weekdays.thu'),
            t('games.flight-calendar.weekdays.fri'),
            t('games.flight-calendar.weekdays.sat'),
            t('games.flight-calendar.weekdays.sun')
        ]),
        [t]
    );
    const instructions = React.useMemo(
        () => [
            { icon: '🎯', title: t('games.flight-calendar.howToPlay.step1.title'), description: t('games.flight-calendar.howToPlay.step1.description') },
            { icon: '🗓️', title: t('games.flight-calendar.howToPlay.step2.title'), description: t('games.flight-calendar.howToPlay.step2.description') },
            { icon: '✅', title: t('games.flight-calendar.howToPlay.step3.title'), description: t('games.flight-calendar.howToPlay.step3.description') }
        ],
        [t]
    );
    const target = React.useMemo(() => ({ value: `7 x ${round.n}`, icon: '🛩️' }), [round.n]);
    const powerUps = React.useMemo<PowerUpBtnProps[]>(
        () => [
            {
                count: engine.powerUps.timeFreeze,
                color: 'blue',
                icon: '❄️',
                title: t('games.flight-calendar.powerups.timeFreeze'),
                onClick: () => engine.activatePowerUp('timeFreeze'),
                disabledConfig: engine.isTimeFrozen,
                status: engine.isTimeFrozen ? 'active' : 'normal'
            },
            {
                count: engine.powerUps.extraLife,
                color: 'red',
                icon: '❤️',
                title: t('games.flight-calendar.powerups.extraLife'),
                onClick: () => engine.activatePowerUp('extraLife'),
                disabledConfig: engine.lives >= 3,
                status: engine.lives >= 3 ? 'maxed' : 'normal'
            },
            {
                count: engine.powerUps.doubleScore,
                color: 'yellow',
                icon: '⚡',
                title: t('games.flight-calendar.powerups.doubleScore'),
                onClick: () => engine.activatePowerUp('doubleScore'),
                disabledConfig: engine.isDoubleScore,
                status: engine.isDoubleScore ? 'active' : 'normal'
            }
        ],
        [engine, t]
    );

    return (
        <Layout3
            title={t('games.flight-calendar.title')}
            subtitle={t('games.flight-calendar.subtitle')}
            description={t('games.flight-calendar.description')}
            gameId={GameIds.MATH_FLIGHT_CALENDAR}
            engine={layoutEngineForLayout}
            powerUps={powerUps}
            cardBackground={<div className="three-leaf-clover-card-bg" />}
            target={target}
            instructions={instructions}
            onExit={onExit}
            className="flight-calendar-theme"
        >
            <div className="three-leaf-clover-playfield">
                {showTapHint && (
                    <div className={`archery-pull-shoot-hint ${isTapHintExiting ? 'is-exiting' : ''}`}>
                        {t('games.flight-calendar.ui.tapEverySpotFirst')}
                    </div>
                )}
                <section className="three-leaf-clover-mid">
                    <div className="three-leaf-clover-ground">
                        <div className="flight-calendar-ground-layer">
                            <div className="flight-calendar-weekdays">
                                {weekdays.map((day) => (
                                    <div key={day} className="flight-calendar-weekday">{day}</div>
                                ))}
                            </div>
                            <div className="flight-calendar-grid" style={{ '--calendar-rows': calendarRowCount } as React.CSSProperties}>
                                {Array.from({ length: visibleCells }).map((_, index) => {
                                    const rowIndex = Math.floor(index / CALENDAR_COLS);
                                    const isBloomed = round.filledWeeks[rowIndex] ?? false;
                                    const isGoal = index === (round.n * CALENDAR_COLS) - 1;
                                    const isStart = index === 0;
                                    const isSunday = (index + 1) % CALENDAR_COLS === 0;

                                    return (
                                        <button
                                            key={`calendar-cell-${index}`}
                                            type="button"
                                            className={`flight-calendar-cell ${isBloomed ? 'is-bloomed' : ''} ${wrongCells[index] ? 'is-wrong' : ''} ${isStart ? 'is-start' : ''} ${isGoal ? 'is-goal' : ''} ${isSunday ? 'is-sunday-trigger' : ''}`}
                                            onClick={() => handleWeekClick(index)}
                                            disabled={!isSunday || engine.gameState !== 'playing'}
                                            aria-label={t('games.flight-calendar.a11y.cloverDot', { index: index + 1 })}
                                        >
                                            {isStart ? <span className="flight-calendar-goal-emoji">🏠</span> : isGoal ? <span className="flight-calendar-goal-emoji">🛩️</span> : ''}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="three-leaf-clover-bottom">
                    {allBloomed && (
                        <div className="three-leaf-clover-answer-panel is-visible">
                            <p className="three-leaf-clover-question">{t('games.flight-calendar.question')}</p>
                            <div className="three-leaf-clover-options">
                                {round.options.map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        className={`three-leaf-clover-option-btn ${pressingOption === option ? 'is-pressing' : ''}`}
                                        disabled={engine.gameState !== 'playing'}
                                        onPointerDown={() => handleOptionPointerDown(option)}
                                        onPointerUp={clearPressingOption}
                                        onPointerCancel={clearPressingOption}
                                        onPointerLeave={clearPressingOption}
                                        onClick={(event) => handleOptionClick(option, event.currentTarget)}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </Layout3>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const manifest: GameManifest = {
    id: GameIds.MATH_FLIGHT_CALENDAR,
    title: 'flight calendar',
    titleKey: 'games.flight-calendar.title',
    subtitle: 'master 7s',
    subtitleKey: 'games.flight-calendar.subtitle',
    description: 'Practice the 7-times table by filling calendar weeks.',
    descriptionKey: 'games.flight-calendar.description',
    category: 'math',
    level: 3,
    component: FlightCalendar,
    thumbnail: '📜'
};
