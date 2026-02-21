import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layout2 } from '../../../../layouts/Standard/Layout2';
import { useGameEngine } from '../../../../layouts/Standard/Layout0/useGameEngine';
import type { GameManifest } from '../../../../types';
import { GameIds } from '../../../../../constants/gameIds';
import './FrogJump.css';

interface FrogJumpProps {
    onExit: () => void;
}

interface JumpRipple {
    id: number;
    index: number;
}

interface FrogProblem {
    a: number;
    b: number;
    answer: number;
    ticks: number[];
}

const POWERUP_TYPES: Array<'timeFreeze' | 'extraLife' | 'doubleScore'> = ['timeFreeze', 'extraLife', 'doubleScore'];
const HOP_INTERVAL_MS = 330;
const SETTLE_DELAY_MS = 140;
const NEXT_ROUND_DELAY_CORRECT_MS = 520;
const NEXT_ROUND_DELAY_WRONG_MS = 1550;
const RIPPLE_DURATION_MS = 1700;

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const createProblem = (excludeKey?: string): FrogProblem => {
    let a = randInt(2, 9);
    let b = randInt(1, 9);
    let key = `${a}x${b}`;

    if (excludeKey) {
        let guard = 0;
        while (key === excludeKey && guard < 20) {
            a = randInt(2, 9);
            b = randInt(1, 9);
            key = `${a}x${b}`;
            guard += 1;
        }
    }

    const answer = a * b;
    const step = a;       // a x b -> big tick unit is a
    const jumpCount = b;  // frog must jump b times to reach answer

    const maxAbove = 9 - jumpCount;
    const aboveCount = maxAbove <= 0 ? 0 : randInt(1, Math.min(2, maxAbove));
    const count = jumpCount + aboveCount + 1; // +1 for 0 tick, max 10 major ticks
    const ticks = Array.from({ length: count }, (_, idx) => idx * step);

    return {
        a,
        b,
        answer,
        ticks
    };
};

export const FrogJump: React.FC<FrogJumpProps> = ({ onExit }) => {
    const { t } = useTranslation();
    const engine = useGameEngine({ initialLives: 3, initialTime: 60, maxDifficulty: 1 });

    const [problem, setProblem] = React.useState<FrogProblem | null>(null);
    const [frogIndex, setFrogIndex] = React.useState(0);
    const [selectedValue, setSelectedValue] = React.useState<number | null>(null);
    const [isResolving, setIsResolving] = React.useState(false);
    const [hopTick, setHopTick] = React.useState(0);
    const [ripples, setRipples] = React.useState<JumpRipple[]>([]);

    const prevGameStateRef = React.useRef(engine.gameState);
    const jumpTimerRef = React.useRef<number | null>(null);
    const settleTimerRef = React.useRef<number | null>(null);
    const nextRoundTimerRef = React.useRef<number | null>(null);
    const rippleTimersRef = React.useRef<number[]>([]);
    const rippleIdRef = React.useRef(0);
    const prevProblemKeyRef = React.useRef<string | null>(null);

    const clearTimer = React.useCallback((ref: React.MutableRefObject<number | null>) => {
        if (ref.current != null) {
            window.clearTimeout(ref.current);
            ref.current = null;
        }
    }, []);

    const resetRoundUi = React.useCallback(() => {
        rippleTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
        rippleTimersRef.current = [];
        setFrogIndex(0);
        setSelectedValue(null);
        setIsResolving(false);
        setRipples([]);
    }, []);

    const generateNext = React.useCallback(() => {
        const next = createProblem(prevProblemKeyRef.current ?? undefined);
        prevProblemKeyRef.current = `${next.a}x${next.b}`;
        setProblem(next);
        resetRoundUi();
    }, [resetRoundUi]);

    React.useEffect(() => {
        const prev = prevGameStateRef.current;
        if (engine.gameState === 'playing' && (prev === 'idle' || prev === 'gameover' || !problem)) {
            generateNext();
        }
        prevGameStateRef.current = engine.gameState;
    }, [engine.gameState, generateNext, problem]);

    React.useEffect(() => {
        return () => {
            clearTimer(jumpTimerRef);
            clearTimer(settleTimerRef);
            clearTimer(nextRoundTimerRef);
            rippleTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
            rippleTimersRef.current = [];
        };
    }, [clearTimer]);

    React.useEffect(() => {
        if (!problem) return;
        setSelectedValue(null);
        const active = document.activeElement;
        if (active instanceof HTMLElement) {
            active.blur();
        }
    }, [problem]);

    const submitCorrect = React.useCallback(() => {
        const nextCombo = engine.combo + 1;
        if (nextCombo % 3 === 0 && Math.random() > 0.45) {
            const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
            engine.setPowerUps((prev) => ({ ...prev, [type]: prev[type] + 1 }));
        }

        engine.submitAnswer(true, { skipFeedback: true });
        engine.registerEvent({ type: 'correct' });
        clearTimer(nextRoundTimerRef);
        nextRoundTimerRef.current = window.setTimeout(() => {
            generateNext();
        }, NEXT_ROUND_DELAY_CORRECT_MS);
    }, [clearTimer, engine, generateNext]);

    const submitWrong = React.useCallback(() => {
        engine.submitAnswer(false);
        engine.registerEvent({ type: 'wrong' });
        clearTimer(nextRoundTimerRef);
        nextRoundTimerRef.current = window.setTimeout(() => {
            generateNext();
        }, NEXT_ROUND_DELAY_WRONG_MS);
    }, [clearTimer, engine, generateNext]);

    const handlePickValue = React.useCallback((value: number, targetIndex: number) => {
        if (!problem || engine.gameState !== 'playing' || isResolving) return;
        if (targetIndex <= 0) return;

        setSelectedValue(value);
        setIsResolving(true);

        clearTimer(jumpTimerRef);
        clearTimer(settleTimerRef);

        let current = 0;
        const hop = () => {
            current += 1;
            setFrogIndex(current);
            setHopTick((prev) => prev + 1);
            const rippleId = ++rippleIdRef.current;
            setRipples((prev) => [...prev, { id: rippleId, index: current }]);
            const timerId = window.setTimeout(() => {
                setRipples((prev) => prev.filter((r) => r.id !== rippleId));
                rippleTimersRef.current = rippleTimersRef.current.filter((id) => id !== timerId);
            }, RIPPLE_DURATION_MS);
            rippleTimersRef.current.push(timerId);

            if (current >= targetIndex) {
                jumpTimerRef.current = null;
                settleTimerRef.current = window.setTimeout(() => {
                    const isCorrect = value === problem.answer;
                    if (isCorrect) {
                        submitCorrect();
                    } else {
                        submitWrong();
                    }
                }, SETTLE_DELAY_MS);
                return;
            }

            jumpTimerRef.current = window.setTimeout(hop, HOP_INTERVAL_MS);
        };

        hop();
    }, [clearTimer, engine.gameState, isResolving, problem, submitCorrect, submitWrong]);

    const tickCount = problem?.ticks.length ?? 1;
    const stepPercent = tickCount > 1 ? 100 / (tickCount - 1) : 0;
    const yPercentForIndex = React.useCallback((index: number) => index * stepPercent, [stepPercent]);

    const frogBottom = React.useMemo(() => {
        const ratio = yPercentForIndex(frogIndex) / 100;
        // Use the same coordinate space as .frog-jump-rail (top/bottom: 0.5rem).
        return `calc(0.5rem + (100% - 1rem) * ${ratio.toFixed(4)})`;
    }, [frogIndex, yPercentForIndex]);

    const powerUps = React.useMemo(() => ([
        {
            count: engine.powerUps.timeFreeze,
            color: 'blue' as const,
            icon: '❄️',
            title: 'Freeze',
            onClick: () => engine.activatePowerUp('timeFreeze'),
            disabledConfig: engine.isTimeFrozen,
            status: engine.isTimeFrozen ? 'active' as const : 'normal' as const
        },
        {
            count: engine.powerUps.extraLife,
            color: 'red' as const,
            icon: '❤️',
            title: 'Life',
            onClick: () => engine.activatePowerUp('extraLife'),
            disabledConfig: engine.lives >= 3,
            status: engine.lives >= 3 ? 'maxed' as const : 'normal' as const
        },
        {
            count: engine.powerUps.doubleScore,
            color: 'yellow' as const,
            icon: '⚡',
            title: 'Double',
            onClick: () => engine.activatePowerUp('doubleScore'),
            disabledConfig: engine.isDoubleScore,
            status: engine.isDoubleScore ? 'active' as const : 'normal' as const
        }
    ]), [engine]);

    const instructions = React.useMemo(() => ([
        {
            icon: '🧮',
            title: t('games.frog-jump.howToPlay.step1.title'),
            description: t('games.frog-jump.howToPlay.step1.description')
        },
        {
            icon: '🔢',
            title: t('games.frog-jump.howToPlay.step2.title'),
            description: t('games.frog-jump.howToPlay.step2.description')
        },
        {
            icon: '🐸',
            title: t('games.frog-jump.howToPlay.step3.title'),
            description: t('games.frog-jump.howToPlay.step3.description')
        }
    ]), [t]);

    return (
        <Layout2
            title={t('games.frog-jump.title')}
            subtitle={t('games.frog-jump.subtitle')}
            description={t('games.frog-jump.description')}
            gameId={GameIds.MATH_FROG_JUMP}
            engine={engine}
            onExit={onExit}
            cardBackground={<div className="frog-jump-card-bg" />}
            powerUps={powerUps}
            instructions={instructions}
        >
            {problem && (
                <div className="frog-jump-shell">
                    <div className="frog-jump-stage">
                        <div className="frog-jump-left">
                            <span className="frog-jump-lotus-leaf" aria-hidden="true" />
                            <div className="frog-jump-problem-sign">
                                {problem.a}×{problem.b}
                            </div>
                            {ripples.map((ripple) => (
                                <span
                                    key={ripple.id}
                                    className="frog-jump-ripple"
                                    style={{ bottom: `calc(0.5rem + (100% - 1rem) * ${(yPercentForIndex(ripple.index) / 100).toFixed(4)})` }}
                                />
                            ))}
                            <div
                                key={hopTick}
                                className={`frog-jump-frog ${isResolving ? 'is-hopping' : ''}`}
                                style={{ bottom: frogBottom }}
                            >
                                <span className="frog-jump-frog-head" aria-hidden>🐸</span>
                            </div>
                        </div>

                        <div className="frog-jump-right">
                            <div className="frog-jump-rail" key={`${problem.a}x${problem.b}-${problem.ticks.length}`}>
                                {problem.ticks.map((_, idx) => {
                                    if (idx >= problem.ticks.length - 1) return null;
                                    const base = yPercentForIndex(idx);
                                    return [0.25, 0.5, 0.75].map((ratio) => (
                                        <span
                                            key={`s-${idx}-${ratio}`}
                                            className="frog-jump-small-tick"
                                            style={{ bottom: `${base + ratio * (100 / (problem.ticks.length - 1))}%` }}
                                        />
                                    ));
                                })}

                                {problem.ticks.map((value, idx) => (
                                    <div
                                        key={value}
                                        className="frog-jump-big-row"
                                        style={{ bottom: `${yPercentForIndex(idx)}%` }}
                                    >
                                        <span className="frog-jump-big-tick" />
                                        {idx === 0 ? (
                                            <button className="frog-jump-btn frog-jump-btn-zero" disabled>
                                                0
                                            </button>
                                        ) : (
                                            <button
                                                className={`frog-jump-btn ${selectedValue === value ? 'is-selected' : ''}`}
                                                onClick={() => handlePickValue(value, idx)}
                                                disabled={engine.gameState !== 'playing' || isResolving}
                                            >
                                                {value}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout2>
    );
};

export const manifest: GameManifest = {
    id: GameIds.MATH_FROG_JUMP,
    title: '개구리 점프',
    titleKey: 'games.frog-jump.title',
    subtitle: '점프,점프,점프!',
    subtitleKey: 'games.frog-jump.subtitle',
    description: '수직선 눈금을 보고 정답 위치로 점프하세요.',
    descriptionKey: 'games.frog-jump.description',
    category: 'math',
    level: 3,
    mode: 'adventure',
    component: FrogJump,
    thumbnail: '🐸',
    tagsKey: 'games.tags.multiplication'
};
