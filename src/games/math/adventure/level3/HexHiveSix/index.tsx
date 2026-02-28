import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layout3 } from '../../../../layouts/Standard/Layout3';
import { useGameEngine } from '../../../../layouts/Standard/Layout0/useGameEngine';
import type { GameManifest } from '../../../../types';
import { GameIds } from '../../../../../constants/gameIds';
import type { PowerUpBtnProps } from '../../../../../components/Game/PowerUpBtn';
import './HexHiveSix.css';

interface HexHiveSixProps {
    onExit: () => void;
}
type DotPos = { x: number; y: number };
type RoundState = {
    n: number;
    bloomed: boolean[];
    mirrored: boolean[];
    bugPositions: DotPos[];
    options: number[];
};

type DifficultyLevel = 1 | 2;
const MULTIPLIER = 6;
const BEE_COUNT = 5;

const N_RANGES: Record<DifficultyLevel, { min: number; max: number }> = {
    1: { min: 1, max: 9 },
    2: { min: 1, max: 9 }
};
const REWARD_TYPES: Array<'timeFreeze' | 'extraLife' | 'doubleScore'> = ['timeFreeze', 'extraLife', 'doubleScore'];
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min: number, max: number) => Math.random() * (max - min) + min;
const distance = (a: DotPos, b: DotPos) => {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
};
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
        const wrong = Math.max(6, Math.min(54, correct + delta));
        if (wrong !== correct) candidates.add(wrong);
    }
    return shuffle(Array.from(candidates));
};
const HEX_ROWS: number[][] = [
    [0, 1, 2, 3],
    [4, 5, 6, 7],
    [8, 9, 10, 11]
];
const generateBugPositions = (): DotPos[] => {
    const bugs: DotPos[] = [];
    const bounds = { minX: 18, maxX: 82, minY: 28, maxY: 82 };
    const minDist = 14;
    for (let attempt = 0; attempt < 220 && bugs.length < BEE_COUNT; attempt += 1) {
        const candidate = { x: randFloat(bounds.minX, bounds.maxX), y: randFloat(bounds.minY, bounds.maxY) };
        if (bugs.every((b) => distance(b, candidate) >= minDist)) {
            bugs.push(candidate);
        }
    }
    if (bugs.length < BEE_COUNT) {
        const fallback = shuffle([
            { x: 20, y: 72 },
            { x: 72, y: 66 },
            { x: 48, y: 80 },
            { x: 30, y: 52 },
            { x: 64, y: 44 }
        ]);
        while (bugs.length < BEE_COUNT) {
            bugs.push(fallback[bugs.length]);
        }
    }
    return bugs;
};
const getFarBugPosition = (current: DotPos, others: DotPos[]): DotPos => {
    const bounds = { minX: 18, maxX: 82, minY: 28, maxY: 82 };
    const minDistanceFromCurrent = 26;
    const minDistanceFromOthers = 14;

    for (let attempt = 0; attempt < 80; attempt += 1) {
        const candidate = {
            x: randFloat(bounds.minX, bounds.maxX),
            y: randFloat(bounds.minY, bounds.maxY)
        };
        const dx = candidate.x - current.x;
        const dy = candidate.y - current.y;
        const fromCurrent = Math.sqrt(dx * dx + dy * dy);
        if (fromCurrent < minDistanceFromCurrent) continue;
        const separated = others.every((other) => distance(candidate, other) >= minDistanceFromOthers);
        if (separated) return candidate;
    }

    return {
        x: current.x < 50 ? 78 : 22,
        y: current.y < 55 ? 78 : 32
    };
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
        bloomed: Array.from({ length: 12 }, () => false),
        mirrored: Array.from({ length: nextN }, () => Math.random() < 0.5),
        bugPositions: generateBugPositions(),
        options: buildOptions(MULTIPLIER * nextN)
    };
};
export const HexHiveSix: React.FC<HexHiveSixProps> = ({ onExit }) => {
    const { t } = useTranslation();
    const engine = useGameEngine({ initialLives: 3, initialTime: 90, maxDifficulty: 2 });
    const [difficultyLevel, setDifficultyLevel] = React.useState<DifficultyLevel>(1);
    const [consecutiveCorrect, setConsecutiveCorrect] = React.useState(0);
    const [consecutiveWrong, setConsecutiveWrong] = React.useState(0);
    const [round, setRound] = React.useState<RoundState>(() => createRoundState(1));
    const [scaredBugs, setScaredBugs] = React.useState<boolean[]>(Array.from({ length: BEE_COUNT }, () => false));
    const [wrongCells, setWrongCells] = React.useState<boolean[]>(Array.from({ length: 12 }, () => false));
    const [pressingOption, setPressingOption] = React.useState<number | null>(null);
    const [showTapHint, setShowTapHint] = React.useState(false);
    const [isTapHintExiting, setIsTapHintExiting] = React.useState(false);
    const prevGameStateRef = React.useRef(engine.gameState);
    const hasShownTapHintRef = React.useRef(false);
    const scareTimersRef = React.useRef<Array<number | null>>(Array.from({ length: BEE_COUNT }, () => null));
    const wrongCellTimersRef = React.useRef<Array<number | null>>(Array.from({ length: 12 }, () => null));
    const tapHintTimerRef = React.useRef<number | null>(null);
    const tapHintExitTimerRef = React.useRef<number | null>(null);

    const setupRound = React.useCallback((difficulty: DifficultyLevel) => {
        setPressingOption(null);
        setRound((prev) => createRoundState(difficulty, prev.n));
        setScaredBugs(Array.from({ length: BEE_COUNT }, () => false));
        setWrongCells(Array.from({ length: 12 }, () => false));
    }, []);

    React.useEffect(
        () => () => {
            scareTimersRef.current.forEach((timer) => {
                if (timer != null) window.clearTimeout(timer);
            });
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

    const handleDotClick = React.useCallback((index: number) => {
        if (engine.gameState !== 'playing') return;
        let isOverClick = false;
        setRound((prev) => {
            const current = prev.bloomed[index];
            if (current) return prev;
            const bloomedCount = prev.bloomed.filter(Boolean).length;
            if (bloomedCount >= prev.n) {
                isOverClick = true;
                return prev;
            }
            const nextBloomed = [...prev.bloomed];
            nextBloomed[index] = true;
            return { ...prev, bloomed: nextBloomed };
        });
        if (isOverClick) {
            handleWrongHiveClick(index);
        }
    }, [engine.gameState, handleWrongHiveClick]);
    const handleBugClick = React.useCallback((index: number) => {
        if (engine.gameState !== 'playing') return;

        setScaredBugs((prev) => {
            if (prev[index]) return prev;
            const next = [...prev];
            next[index] = true;
            return next;
        });

        setRound((prev) => {
            const nextBugPositions = [...prev.bugPositions];
            const current = nextBugPositions[index] ?? { x: 50, y: 50 };
            const others = nextBugPositions.filter((_, i) => i !== index);
            nextBugPositions[index] = getFarBugPosition(current, others);
            return { ...prev, bugPositions: nextBugPositions };
        });

        if (scareTimersRef.current[index] != null) {
            window.clearTimeout(scareTimersRef.current[index]!);
        }
        scareTimersRef.current[index] = window.setTimeout(() => {
            setScaredBugs((prev) => {
                const next = [...prev];
                next[index] = false;
                return next;
            });
            scareTimersRef.current[index] = null;
        }, 420);
    }, [engine.gameState]);
    const allBloomed = React.useMemo(
        () => round.bloomed.filter(Boolean).length >= round.n,
        [round.bloomed, round.n]
    );
    const handleOptionClick = React.useCallback((value: number, buttonEl?: HTMLButtonElement | null) => {
        if (engine.gameState !== 'playing' || !allBloomed) return;
        buttonEl?.blur();
        setPressingOption(null);

        const correct = MULTIPLIER * round.n;
        const isCorrect = value === correct;

        if (isCorrect) {
            const nextConsecutiveCorrect = consecutiveCorrect + 1;
            const shouldPromote = difficultyLevel === 1 && nextConsecutiveCorrect >= 3;
            const nextDifficulty: DifficultyLevel = shouldPromote ? 2 : difficultyLevel;

            setConsecutiveWrong(0);
            setConsecutiveCorrect(shouldPromote ? 0 : nextConsecutiveCorrect);
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
        setConsecutiveWrong(shouldDemote ? 0 : nextConsecutiveWrong);
        if (shouldDemote) {
            setDifficultyLevel(1);
        }

        engine.registerEvent({ type: 'wrong' });
        engine.updateLives(false);
        engine.updateCombo(false);
    }, [allBloomed, consecutiveCorrect, consecutiveWrong, difficultyLevel, engine, round.n, setupRound]);
    const handleOptionPointerDown = React.useCallback((value: number) => {
        if (engine.gameState !== 'playing' || !allBloomed) return;
        setPressingOption(value);
    }, [allBloomed, engine.gameState]);
    const clearPressingOption = React.useCallback(() => setPressingOption(null), []);
    const instructions = React.useMemo(
        () => [
            { icon: '🔎', title: t('games.hex-hive-six.howToPlay.step1.title'), description: t('games.hex-hive-six.howToPlay.step1.description') },
            { icon: '🍯', title: t('games.hex-hive-six.howToPlay.step2.title'), description: t('games.hex-hive-six.howToPlay.step2.description') },
            { icon: '✅', title: t('games.hex-hive-six.howToPlay.step3.title'), description: t('games.hex-hive-six.howToPlay.step3.description') }
        ],
        [t]
    );
    const target = React.useMemo(() => ({ value: `6 x ${round.n}`, icon: '⬢' }), [round.n]);
    const powerUps = React.useMemo<PowerUpBtnProps[]>(
        () => [
            {
                count: engine.powerUps.timeFreeze,
                color: 'blue',
                icon: '❄️',
                title: t('games.three-leaf-clover.powerups.timeFreeze'),
                onClick: () => engine.activatePowerUp('timeFreeze'),
                disabledConfig: engine.isTimeFrozen,
                status: engine.isTimeFrozen ? 'active' : 'normal'
            },
            {
                count: engine.powerUps.extraLife,
                color: 'red',
                icon: '❤️',
                title: t('games.three-leaf-clover.powerups.extraLife'),
                onClick: () => engine.activatePowerUp('extraLife'),
                disabledConfig: engine.lives >= 3,
                status: engine.lives >= 3 ? 'maxed' : 'normal'
            },
            {
                count: engine.powerUps.doubleScore,
                color: 'yellow',
                icon: '⚡',
                title: t('games.three-leaf-clover.powerups.doubleScore'),
                onClick: () => engine.activatePowerUp('doubleScore'),
                disabledConfig: engine.isDoubleScore,
                status: engine.isDoubleScore ? 'active' : 'normal'
            }
        ],
        [engine, t]
    );

    return (
        <Layout3
            title="6각형 벌집"
            subtitle="6단 마스터"
            description="ㅇㅇㅇ"
            gameId={GameIds.MATH_HEX_HIVE_SIX}
            engine={layoutEngineForLayout}
            powerUps={powerUps}
            cardBackground={<div className="three-leaf-clover-card-bg" />}
            target={target}
            instructions={instructions}
            onExit={onExit}
        >
            <div className="three-leaf-clover-playfield">
                {showTapHint && (
                    <div className={`archery-pull-shoot-hint ${isTapHintExiting ? 'is-exiting' : ''}`}>
                        {t('games.three-leaf-clover.ui.tapEverySpotFirst')}
                    </div>
                )}
                <section className="three-leaf-clover-mid">
                    <div className="three-leaf-clover-ground">
                        <div className="three-leaf-clover-bugs">
                            {round.bugPositions.map((bugPos, index) => (
                                <button
                                    key={`bee-${index}`}
                                    type="button"
                                    className={`three-leaf-clover-bug bug-bee-${(index % 3) + 1} ${scaredBugs[index] ? 'is-scared' : ''}`}
                                    style={{ left: `${bugPos.x.toFixed(2)}%`, top: `${bugPos.y.toFixed(2)}%` }}
                                    onClick={() => handleBugClick(index)}
                                    aria-label={`Bee ${index + 1}`}
                                >
                                    🐝
                                </button>
                            ))}
                        </div>
                        <div className="hex-hive-grid-area">
                            <div className="hex-hive-container grid-4">
                                {HEX_ROWS.map((row, rowIndex) => (
                                    <div key={`hex-row-${rowIndex}`} className="hex-hive-row">
                                        {row.map((index) => {
                                            const isBloomed = round.bloomed[index] ?? false;
                                            return (
                                                <button
                                                    key={`dot-${index}`}
                                                    type="button"
                                                    className={`hex-hive-cell ${isBloomed ? 'is-bloomed' : ''} ${wrongCells[index] ? 'is-wrong' : ''}`}
                                                    onClick={() => handleDotClick(index)}
                                                    aria-label={t('games.three-leaf-clover.a11y.cloverDot', { index: index + 1 })}
                                                />
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="three-leaf-clover-bottom">
                    {allBloomed && (
                        <div className="three-leaf-clover-answer-panel is-visible">
                            <p className="three-leaf-clover-question">{t('games.hex-hive-six.question')}</p>
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
    id: GameIds.MATH_HEX_HIVE_SIX,
    title: '6각형 벌집',
    titleKey: 'games.hex-hive-six.title',
    subtitle: '6단 마스터',
    subtitleKey: 'games.hex-hive-six.subtitle',
    description: 'ㅇㅇㅇ',
    descriptionKey: 'games.hex-hive-six.description',
    category: 'math',
    level: 3,
    component: HexHiveSix,
    thumbnail: '🍯'
};
