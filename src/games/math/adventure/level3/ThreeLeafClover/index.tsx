import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layout3 } from '../../../../layouts/Standard/Layout3';
import { useGameEngine } from '../../../../layouts/Standard/Layout0/useGameEngine';
import type { GameManifest } from '../../../../types';
import { GameIds } from '../../../../../constants/gameIds';
import type { PowerUpBtnProps } from '../../../../../components/Game/PowerUpBtn';
import './ThreeLeafClover.css';

interface ThreeLeafCloverProps {
    onExit: () => void;
}
type DotPos = { x: number; y: number };
type RoundState = {
    n: number;
    bloomed: boolean[];
    mirrored: boolean[];
    dotPositions: DotPos[];
    bugPositions: DotPos[];
    options: number[];
};

type DifficultyLevel = 1 | 2;

const N_RANGES: Record<DifficultyLevel, { min: number; max: number }> = {
    1: { min: 1, max: 5 },
    2: { min: 3, max: 9 }
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
        const wrong = Math.max(3, Math.min(27, correct + delta));
        if (wrong !== correct) candidates.add(wrong);
    }
    return shuffle(Array.from(candidates));
};
const COLLISION_MIN_DX = 15.5;
const COLLISION_MIN_DY = 23;
const isOverlapping = (a: DotPos, b: DotPos) =>
    Math.abs(a.x - b.x) < COLLISION_MIN_DX && Math.abs(a.y - b.y) < COLLISION_MIN_DY;

const GRID_ANCHORS_3X3: Array<DotPos> = [
    { x: 18, y: 25 }, { x: 50, y: 25 }, { x: 82, y: 25 },
    { x: 18, y: 52 }, { x: 50, y: 52 }, { x: 82, y: 52 },
    { x: 18, y: 79 }, { x: 50, y: 79 }, { x: 82, y: 79 }
];

const jitterAnchor = (anchor: DotPos) => ({
    x: anchor.x + randFloat(-1.6, 1.6),
    y: anchor.y + randFloat(-1.3, 1.3)
});

const buildNonOverlappingFromAnchors = (count: number): DotPos[] => {
    const selected = shuffle(GRID_ANCHORS_3X3).slice(0, count);
    const points: DotPos[] = [];
    selected.forEach((anchor) => {
        let placed = false;
        for (let attempt = 0; attempt < 40; attempt += 1) {
            const candidate = jitterAnchor(anchor);
            if (points.every((p) => !isOverlapping(p, candidate))) {
                points.push(candidate);
                placed = true;
                break;
            }
        }
        if (!placed) points.push(anchor);
    });
    return points;
};

const generateSpreadDotPositions = (count: number): DotPos[] => {
    const bounds = { minX: 18, maxX: 82, minY: 25, maxY: 79 };
    let best: DotPos[] = [];

    // Random non-overlap sampling with bounded retries (small N: max 9)
    for (let restart = 0; restart < 12; restart += 1) {
        const points: DotPos[] = [];
        while (points.length < count) {
            let placed = false;
            for (let attempt = 0; attempt < 60; attempt += 1) {
                const candidate = {
                    x: randFloat(bounds.minX, bounds.maxX),
                    y: randFloat(bounds.minY, bounds.maxY)
                };
                if (points.every((p) => !isOverlapping(p, candidate))) {
                    points.push(candidate);
                    placed = true;
                    break;
                }
            }
            if (!placed) break;
        }
        if (points.length > best.length) best = points;
        if (points.length === count) return points;
    }
    if (best.length === count) return best;
    return buildNonOverlappingFromAnchors(count);
};
const generateBugPositions = (): DotPos[] => {
    const bugs: DotPos[] = [];
    const bounds = { minX: 18, maxX: 82, minY: 28, maxY: 82 };
    const minDist = 18;
    for (let attempt = 0; attempt < 120 && bugs.length < 3; attempt += 1) {
        const candidate = { x: randFloat(bounds.minX, bounds.maxX), y: randFloat(bounds.minY, bounds.maxY) };
        if (bugs.every((b) => distance(b, candidate) >= minDist)) {
            bugs.push(candidate);
        }
    }
    if (bugs.length < 3) {
        const fallback = shuffle([{ x: 22, y: 72 }, { x: 72, y: 66 }, { x: 48, y: 80 }]);
        while (bugs.length < 3) {
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
        bloomed: Array.from({ length: nextN }, () => false),
        mirrored: Array.from({ length: nextN }, () => Math.random() < 0.5),
        dotPositions: generateSpreadDotPositions(nextN),
        bugPositions: generateBugPositions(),
        options: buildOptions(3 * nextN)
    };
};
export const ThreeLeafClover: React.FC<ThreeLeafCloverProps> = ({ onExit }) => {
    const { t } = useTranslation();
    const engine = useGameEngine({ initialLives: 3, initialTime: 90, maxDifficulty: 2 });
    const [difficultyLevel, setDifficultyLevel] = React.useState<DifficultyLevel>(1);
    const [consecutiveCorrect, setConsecutiveCorrect] = React.useState(0);
    const [consecutiveWrong, setConsecutiveWrong] = React.useState(0);
    const [round, setRound] = React.useState<RoundState>(() => createRoundState(1));
    const [scaredBugs, setScaredBugs] = React.useState<boolean[]>([false, false, false]);
    const [pressingOption, setPressingOption] = React.useState<number | null>(null);
    const [showTapHint, setShowTapHint] = React.useState(false);
    const [isTapHintExiting, setIsTapHintExiting] = React.useState(false);
    const prevGameStateRef = React.useRef(engine.gameState);
    const hasShownTapHintRef = React.useRef(false);
    const scareTimersRef = React.useRef<Array<number | null>>([null, null, null]);
    const tapHintTimerRef = React.useRef<number | null>(null);
    const tapHintExitTimerRef = React.useRef<number | null>(null);

    const setupRound = React.useCallback((difficulty: DifficultyLevel) => {
        setPressingOption(null);
        setRound((prev) => createRoundState(difficulty, prev.n));
        setScaredBugs([false, false, false]);
    }, []);

    React.useEffect(
        () => () => {
            scareTimersRef.current.forEach((timer) => {
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

    const handleDotClick = React.useCallback((index: number) => {
        if (engine.gameState !== 'playing') return;
        setRound((prev) => {
            const current = prev.bloomed[index];
            if (current) return prev;
            const nextBloomed = [...prev.bloomed];
            nextBloomed[index] = true;
            return { ...prev, bloomed: nextBloomed };
        });
    }, [engine.gameState]);
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
    const allBloomed = React.useMemo(() => round.bloomed.length > 0 && round.bloomed.every(Boolean), [round.bloomed]);
    const handleOptionClick = React.useCallback((value: number, buttonEl?: HTMLButtonElement | null) => {
        if (engine.gameState !== 'playing' || !allBloomed) return;
        buttonEl?.blur();
        setPressingOption(null);

        const correct = 3 * round.n;
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
            { icon: '1️⃣', title: t('games.three-leaf-clover.howToPlay.step1.title'), description: t('games.three-leaf-clover.howToPlay.step1.description') },
            { icon: '2️⃣', title: t('games.three-leaf-clover.howToPlay.step2.title'), description: t('games.three-leaf-clover.howToPlay.step2.description') },
            { icon: '3️⃣', title: t('games.three-leaf-clover.howToPlay.step3.title'), description: t('games.three-leaf-clover.howToPlay.step3.description') }
        ],
        [t]
    );
    const target = React.useMemo(() => ({ value: `3 x ${round.n}`, icon: '☘️' }), [round.n]);
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
            title={t('games.three-leaf-clover.title')}
            subtitle={t('games.three-leaf-clover.subtitle')}
            description={t('games.three-leaf-clover.description')}
            gameId={GameIds.MATH_THREE_LEAF_CLOVER}
            engine={layoutEngine as any}
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
                            <button
                                type="button"
                                className={`three-leaf-clover-bug bug-ladybug-a ${scaredBugs[0] ? 'is-scared' : ''}`}
                                style={{ left: `${(round.bugPositions[0]?.x ?? 20).toFixed(2)}%`, top: `${(round.bugPositions[0]?.y ?? 70).toFixed(2)}%` }}
                                onClick={() => handleBugClick(0)}
                                aria-label={t('games.three-leaf-clover.a11y.ladybug1')}
                            >
                                🐞
                            </button>
                            <button
                                type="button"
                                className={`three-leaf-clover-bug bug-ladybug-b ${scaredBugs[1] ? 'is-scared' : ''}`}
                                style={{ left: `${(round.bugPositions[1]?.x ?? 70).toFixed(2)}%`, top: `${(round.bugPositions[1]?.y ?? 66).toFixed(2)}%` }}
                                onClick={() => handleBugClick(1)}
                                aria-label={t('games.three-leaf-clover.a11y.ladybug2')}
                            >
                                🐞
                            </button>
                            <button
                                type="button"
                                className={`three-leaf-clover-bug bug-beetle ${scaredBugs[2] ? 'is-scared' : ''}`}
                                style={{ left: `${(round.bugPositions[2]?.x ?? 46).toFixed(2)}%`, top: `${(round.bugPositions[2]?.y ?? 80).toFixed(2)}%` }}
                                onClick={() => handleBugClick(2)}
                                aria-label={t('games.three-leaf-clover.a11y.beetle')}
                            >
                                🪲
                            </button>
                        </div>
                        {round.bloomed.map((isBloomed, index) => {
                            const pos = round.dotPositions[index] ?? { x: 50, y: 50 };
                            const isMirrored = round.mirrored[index] ?? false;
                            return (
                                <button
                                    key={`dot-${index}`}
                                    type="button"
                                    className={`three-leaf-clover-dot ${isBloomed ? 'is-bloomed' : ''}`}
                                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                                    onClick={() => handleDotClick(index)}
                                    aria-label={t('games.three-leaf-clover.a11y.cloverDot', { index: index + 1 })}
                                >
                                    {isBloomed ? <span className={`three-leaf-clover-sprite ${isMirrored ? 'is-mirrored' : ''}`}>☘️</span> : null}
                                </button>
                            );
                        })}
                    </div>
                </section>

                <section className="three-leaf-clover-bottom">
                    {allBloomed && (
                        <div className="three-leaf-clover-answer-panel is-visible">
                            <p className="three-leaf-clover-question">{t('games.three-leaf-clover.question')}</p>
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

export const manifest: GameManifest = {
    id: GameIds.MATH_THREE_LEAF_CLOVER,
    title: '세잎 클로버',
    titleKey: 'games.three-leaf-clover.title',
    subtitle: '3단 마스터',
    subtitleKey: 'games.three-leaf-clover.subtitle',
    description: '클로버를 피우며 3단을 익혀요!',
    descriptionKey: 'games.three-leaf-clover.description',
    category: 'math',
    level: 3,
    component: ThreeLeafClover,
    thumbnail: '🍀'
};
