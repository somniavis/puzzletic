import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layout2 } from '../../../../layouts/Standard/Layout2';
import { useGameEngine } from '../../../../layouts/Standard/Layout0/useGameEngine';
import { GameIds } from '../../../../../constants/gameIds';
import type { PowerUpBtnProps } from '../../../../../components/Game/PowerUpBtn';
import { playEatingSound, playJelloClickSound } from '../../../../../utils/sound';
import './MoleWhack.css';

interface MoleWhackProps {
    onExit: () => void;
}

type HolePoint = {
    id: number;
    x: number;
    y: number;
};

type ActiveMole = {
    holeId: number;
    problem: MoleProblem;
};

type MoleAnimState = 'hit' | 'fall';
type MoleFeedbackType = 'correct' | 'wrong';

type CheesePatch = {
    id: number;
    x: number;
    y: number;
    size: number;
    tilt: number;
};

const HOLE_COUNT = 7;
const MAX_ACTIVE_MOLES = 3;
const SPAWN_MIN_MS = 1050;
const SPAWN_MAX_MS = 1950;
const STAY_MIN_MS = 3960;
const STAY_MAX_MS = 6480;
const CORRECT_PROBLEM_RATE = 0.48;
const SET_TARGET_MIN = 2;
const SET_TARGET_MAX = 5;
const REWARD_TYPES: Array<'timeFreeze' | 'extraLife' | 'doubleScore'> = ['timeFreeze', 'extraLife', 'doubleScore'];

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const randomPick = <T,>(arr: T[]): T => arr[randomInt(0, arr.length - 1)];

type MoleProblem = {
    left: number;
    right: number;
    shownAnswer: number;
    isCorrect: boolean;
};

type OperandSet = { left: number; right: number; answer: number };

const ONES_PLUS_ONES_LE_10: OperandSet[] = [];
const ONES_PLUS_ONES_11_18: OperandSet[] = [];
const TENS_PLUS_ONES_11_20: OperandSet[] = [];

for (let left = 1; left <= 9; left += 1) {
    for (let right = 1; right <= 9; right += 1) {
        if (left < right) continue;
        const answer = left + right;
        const candidate = { left, right, answer };
        if (answer >= 2 && answer <= 10) ONES_PLUS_ONES_LE_10.push(candidate);
        if (answer >= 11 && answer <= 18) ONES_PLUS_ONES_11_18.push(candidate);
    }
}

for (let left = 10; left <= 19; left += 1) {
    for (let right = 1; right <= 9; right += 1) {
        if (left < right) continue;
        const answer = left + right;
        if (answer >= 11 && answer <= 20) {
            TENS_PLUS_ONES_11_20.push({ left, right, answer });
        }
    }
}

const createOperandsByRule = (): { left: number; right: number; answer: number } => {
    // 50%: sums up to 10, 50%: sums 11~20
    const lowRange = Math.random() < 0.5;

    if (lowRange) {
        // <=10 range can only be reliably formed with ones+ones
        return randomPick(ONES_PLUS_ONES_LE_10);
    }

    // 11~20 range: mix ones+ones and tens+ones
    const useTensPlusOnes = Math.random() < 0.5;
    if (useTensPlusOnes) {
        return randomPick(TENS_PLUS_ONES_11_20);
    }
    return randomPick(ONES_PLUS_ONES_11_18);
};

const createProblem = (forceCorrect = false): MoleProblem => {
    const seeded = createOperandsByRule();
    const left = Math.max(seeded.left, seeded.right);
    const right = Math.min(seeded.left, seeded.right);
    const correctAnswer = left + right;
    const shouldBeCorrect = forceCorrect || Math.random() < CORRECT_PROBLEM_RATE;
    if (shouldBeCorrect) {
        return {
            left,
            right,
            shownAnswer: correctAnswer,
            isCorrect: true
        };
    }

    let wrongAnswer = randomInt(0, 20);
    while (wrongAnswer === correctAnswer) {
        wrongAnswer = randomInt(0, 20);
    }
    return {
        left,
        right,
        shownAnswer: wrongAnswer,
        isCorrect: false
    };
};

const formatProblemLabel = (problem: MoleProblem) => {
    return `${problem.left} + ${problem.right} = ${problem.shownAnswer}`;
};

const generateHolePoints = (count: number): HolePoint[] => {
    const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
    const topRow = [{ x: 28, yOffset: 0 }, { x: 72, yOffset: 0 }];
    const midRow = [
        { x: 16, yOffset: 4 }, // left: move down-left
        { x: 50, yOffset: 0 }, // center
        { x: 84, yOffset: 4 } // right: move down-right
    ];
    const bottomRow = [{ x: 30, yOffset: 0 }, { x: 70, yOffset: 0 }];
    const yTop = 42;
    const yMid = 66;
    const yBottom = 92;

    const seeded: HolePoint[] = [
        ...topRow.map(({ x, yOffset }) => ({ x, y: yTop + yOffset })),
        ...midRow.map(({ x, yOffset }) => ({ x, y: yMid + yOffset })),
        ...bottomRow.map(({ x, yOffset }) => ({ x, y: yBottom + yOffset }))
    ]
        .slice(0, count)
        .map((p, idx) => ({
            id: idx,
            x: clamp(p.x + randomInt(-3, 3), 10, 90),
            y: clamp(p.y + randomInt(-2, 2), 28, 94)
        }));

    return seeded;
};

const createCheesePatches = (holes: HolePoint[]): CheesePatch[] => {
    const keepAwayFromHoles = (x: number, y: number, minDist: number) => {
        let nx = x;
        let ny = y;
        for (const h of holes) {
            const dx = nx - h.x;
            const dy = ny - h.y;
            const dist = Math.hypot(dx, dy) || 0.001;
            if (dist < minDist) {
                const push = (minDist - dist) + 0.8;
                nx += (dx / dist) * push;
                ny += (dy / dist) * push;
            }
        }
        return {
            x: Math.max(6, Math.min(94, nx)),
            y: Math.max(34, Math.min(96, ny))
        };
    };

    const base: Array<{ x: number; y: number }> = [
        // Row 1: 🧀 🕳️🧀 🕳️🧀
        { x: 12, y: 37 }, { x: 48, y: 37 }, { x: 88, y: 37 },
        // Row 2: centered pair
        { x: 49, y: 52 }, { x: 60, y: 52 },
        // Row 3: 🕳️🧀 🕳️🧀🕳️ (between holes)
        { x: 33, y: 69 }, { x: 67, y: 69 },
        // Row 4: centered pair
        { x: 49, y: 82 }, { x: 60, y: 82 },
        // Row 5: 🧀 🕳️🧀 🕳️🧀
        { x: 12, y: 94 }, { x: 50, y: 94 }, { x: 88, y: 94 }
    ];

    return base.map((p, idx) => {
        // Keep a regular pattern; only tiny vertical variance for natural feel.
        const jitteredX = p.x;
        const jitteredY = p.y + randomInt(-1, 1);
        const safe = keepAwayFromHoles(jitteredX, jitteredY, 14);
        return {
            id: idx,
            x: safe.x,
            y: safe.y,
            // small per-cheese variance; actual size scales responsively in CSS
            size: randomInt(95, 110) / 100,
            tilt: randomInt(-6, 6)
        };
    });
};

export const MoleWhack: React.FC<MoleWhackProps> = ({ onExit }) => {
    const { t } = useTranslation();
    const engine = useGameEngine({
        initialLives: 3,
        initialTime: 60,
        maxDifficulty: 2
    });
    const initialHoles = React.useMemo(() => generateHolePoints(HOLE_COUNT), []);
    const [holes, setHoles] = React.useState<HolePoint[]>(initialHoles);
    const [cheesePatches, setCheesePatches] = React.useState<CheesePatch[]>(() => createCheesePatches(initialHoles));
    const [activeMoles, setActiveMoles] = React.useState<ActiveMole[]>([]);
    const [setTargetCount, setSetTargetCount] = React.useState<number>(() => randomInt(SET_TARGET_MIN, SET_TARGET_MAX));
    const [setCorrectCount, setSetCorrectCount] = React.useState<number>(0);
    const [moleAnimStates, setMoleAnimStates] = React.useState<Record<number, MoleAnimState>>({});
    const [moleFeedbacks, setMoleFeedbacks] = React.useState<Record<number, MoleFeedbackType>>({});
    const [showTapHint, setShowTapHint] = React.useState(false);
    const [isTapHintExiting, setIsTapHintExiting] = React.useState(false);
    const hasInitializedRoundRef = React.useRef(false);
    const isSetTransitioningRef = React.useRef(false);
    const hasShownTapHintRef = React.useRef(false);
    const tapHintTimerRef = React.useRef<number | null>(null);
    const tapHintExitTimerRef = React.useRef<number | null>(null);
    const setTargetCountRef = React.useRef(setTargetCount);
    const spawnTimerRef = React.useRef<number | null>(null);
    const hideTimersRef = React.useRef<Map<number, number>>(new Map());
    const animTimersRef = React.useRef<Map<number, number[]>>(new Map());
    const feedbackTimersRef = React.useRef<Map<number, number>>(new Map());
    const setTransitionTimerRef = React.useRef<number | null>(null);
    const lockedMolesRef = React.useRef<Set<number>>(new Set());
    const holesRef = React.useRef<HolePoint[]>(holes);

    const activeMoleByHole = React.useMemo(() => {
        const map: Record<number, ActiveMole> = {};
        for (const mole of activeMoles) map[mole.holeId] = mole;
        return map;
    }, [activeMoles]);

    const instructions = React.useMemo(
        () => [
            {
                icon: '1️⃣',
                title: t('games.mole-whack.howToPlay.step1.title'),
                description: t('games.mole-whack.howToPlay.step1.description')
            },
            {
                icon: '2️⃣',
                title: t('games.mole-whack.howToPlay.step2.title'),
                description: t('games.mole-whack.howToPlay.step2.description')
            },
            {
                icon: '3️⃣',
                title: t('games.mole-whack.howToPlay.step3.title'),
                description: t('games.mole-whack.howToPlay.step3.description')
            }
        ],
        [t]
    );

    const pickNextSetTarget = React.useCallback((current?: number) => {
        let next = randomInt(SET_TARGET_MIN, SET_TARGET_MAX);
        if (typeof current === 'number' && SET_TARGET_MAX > SET_TARGET_MIN) {
            while (next === current) {
                next = randomInt(SET_TARGET_MIN, SET_TARGET_MAX);
            }
        }
        return next;
    }, []);

    const clearMoleAnimTimers = React.useCallback((holeId?: number) => {
        if (typeof holeId === 'number') {
            const ids = animTimersRef.current.get(holeId) ?? [];
            ids.forEach((id) => window.clearTimeout(id));
            animTimersRef.current.delete(holeId);
            return;
        }

        animTimersRef.current.forEach((ids) => {
            ids.forEach((id) => window.clearTimeout(id));
        });
        animTimersRef.current.clear();
    }, []);

    const clearSpawnAndHideTimers = React.useCallback(() => {
        if (spawnTimerRef.current != null) {
            window.clearTimeout(spawnTimerRef.current);
            spawnTimerRef.current = null;
        }
        hideTimersRef.current.forEach((timerId) => {
            window.clearTimeout(timerId);
        });
        hideTimersRef.current.clear();
        feedbackTimersRef.current.forEach((id) => window.clearTimeout(id));
        feedbackTimersRef.current.clear();
        if (setTransitionTimerRef.current != null) {
            window.clearTimeout(setTransitionTimerRef.current);
            setTransitionTimerRef.current = null;
        }
        clearMoleAnimTimers();
        lockedMolesRef.current.clear();
        isSetTransitioningRef.current = false;
        setMoleAnimStates({});
        setMoleFeedbacks({});
    }, [clearMoleAnimTimers]);

    const hideMole = React.useCallback((holeId: number) => {
        setActiveMoles((prev) => prev.filter((m) => m.holeId !== holeId));
        const timerId = hideTimersRef.current.get(holeId);
        if (timerId != null) {
            window.clearTimeout(timerId);
            hideTimersRef.current.delete(holeId);
        }
        clearMoleAnimTimers(holeId);
        lockedMolesRef.current.delete(holeId);
        setMoleAnimStates((prev) => {
            if (!(holeId in prev)) return prev;
            const next = { ...prev };
            delete next[holeId];
            return next;
        });
        setMoleFeedbacks((prev) => {
            if (!(holeId in prev)) return prev;
            const next = { ...prev };
            delete next[holeId];
            return next;
        });
    }, [clearMoleAnimTimers]);

    const registerMoleAnimTimer = React.useCallback((holeId: number, timerId: number) => {
        const current = animTimersRef.current.get(holeId) ?? [];
        animTimersRef.current.set(holeId, [...current, timerId]);
    }, []);

    const handleMoleTap = React.useCallback((mole: ActiveMole) => {
        if (engine.gameState !== 'playing') return;
        if (isSetTransitioningRef.current) return;
        if (lockedMolesRef.current.has(mole.holeId)) return;

        lockedMolesRef.current.add(mole.holeId);
        const hideTimer = hideTimersRef.current.get(mole.holeId);
        if (hideTimer != null) {
            window.clearTimeout(hideTimer);
            hideTimersRef.current.delete(mole.holeId);
        }

        setMoleAnimStates((prev) => ({ ...prev, [mole.holeId]: 'hit' }));
        const feedbackType: MoleFeedbackType = mole.problem.isCorrect ? 'correct' : 'wrong';
        if (mole.problem.isCorrect) {
            playEatingSound(0.6);
        } else {
            playJelloClickSound(0.8);
        }
        setMoleFeedbacks((prev) => ({ ...prev, [mole.holeId]: feedbackType }));
        const feedbackTimer = window.setTimeout(() => {
            setMoleFeedbacks((prev) => {
                if (!(mole.holeId in prev)) return prev;
                const next = { ...prev };
                delete next[mole.holeId];
                return next;
            });
            feedbackTimersRef.current.delete(mole.holeId);
        }, 520);
        feedbackTimersRef.current.set(mole.holeId, feedbackTimer);

        const toFall = window.setTimeout(() => {
            setMoleAnimStates((prev) => ({ ...prev, [mole.holeId]: 'fall' }));
        }, 300);
        registerMoleAnimTimer(mole.holeId, toFall);

        const finalize = window.setTimeout(() => {
            hideMole(mole.holeId);
            if (mole.problem.isCorrect) {
                // Award power-ups by per-hit combo (not by set clear): every 3 combo hits, 55% chance.
                const nextCombo = engine.combo + 1;
                if (nextCombo % 3 === 0 && Math.random() > 0.45) {
                    const reward = REWARD_TYPES[Math.floor(Math.random() * REWARD_TYPES.length)];
                    engine.setPowerUps((prev) => ({ ...prev, [reward]: prev[reward] + 1 }));
                }
                engine.submitAnswer(true, { skipFeedback: true, skipDifficulty: true });
                setSetCorrectCount((prev) => {
                    const next = prev + 1;
                    if (next >= setTargetCountRef.current && !isSetTransitioningRef.current) {
                        isSetTransitioningRef.current = true;
                        engine.registerEvent({ type: 'correct', isFinal: true });
                        setTransitionTimerRef.current = window.setTimeout(() => {
                            setSetTargetCount((current) => {
                                const nextTarget = pickNextSetTarget(current);
                                setTargetCountRef.current = nextTarget;
                                return nextTarget;
                            });
                            setSetCorrectCount(0);
                            isSetTransitioningRef.current = false;
                            setTransitionTimerRef.current = null;
                        }, 700);
                    }
                    return Math.min(next, setTargetCountRef.current);
                });
            } else {
                engine.submitAnswer(false, { skipFeedback: true, skipDifficulty: true });
                setSetCorrectCount((prev) => Math.max(0, prev - 1));
            }
        }, 1320);
        registerMoleAnimTimer(mole.holeId, finalize);
    }, [engine, hideMole, pickNextSetTarget, registerMoleAnimTimer]);

    const scheduleNextSpawn = React.useCallback(() => {
        if (engine.gameState !== 'playing') return;

        const delay = randomInt(SPAWN_MIN_MS, SPAWN_MAX_MS);
        spawnTimerRef.current = window.setTimeout(() => {
            setActiveMoles((prev) => {
                const activeIds = new Set(prev.map((m) => m.holeId));
                const available = holesRef.current.filter((h) => !activeIds.has(h.id));
                if (available.length === 0 || prev.length >= MAX_ACTIVE_MOLES) {
                    return prev;
                }

                const target = randomPick(available);
                const hasCorrect = prev.some((m) => m.problem.isCorrect);
                const forceCorrect = !hasCorrect && prev.length >= MAX_ACTIVE_MOLES - 1;
                const generated = createProblem(forceCorrect);
                const newMole: ActiveMole = {
                    holeId: target.id,
                    problem: generated
                };

                const stay = randomInt(STAY_MIN_MS, STAY_MAX_MS);
                const hideTimer = window.setTimeout(() => {
                    hideMole(target.id);
                }, stay);
                hideTimersRef.current.set(target.id, hideTimer);

                return [...prev, newMole];
            });
            scheduleNextSpawn();
        }, delay);
    }, [engine.gameState, hideMole]);

    const powerUps = React.useMemo<PowerUpBtnProps[]>(
        () => [
            {
                count: engine.powerUps.timeFreeze,
                color: 'blue',
                icon: '❄️',
                title: t('games.mole-whack.powerups.timeFreeze'),
                onClick: () => engine.activatePowerUp('timeFreeze'),
                disabledConfig: engine.isTimeFrozen,
                status: engine.isTimeFrozen ? 'active' : 'normal'
            },
            {
                count: engine.powerUps.extraLife,
                color: 'red',
                icon: '❤️',
                title: t('games.mole-whack.powerups.extraLife'),
                onClick: () => engine.activatePowerUp('extraLife'),
                disabledConfig: engine.lives >= 3,
                status: engine.lives >= 3 ? 'maxed' : 'normal'
            },
            {
                count: engine.powerUps.doubleScore,
                color: 'yellow',
                icon: '⚡',
                title: t('games.mole-whack.powerups.doubleScore'),
                onClick: () => engine.activatePowerUp('doubleScore'),
                disabledConfig: engine.isDoubleScore,
                status: engine.isDoubleScore ? 'active' : 'normal'
            }
        ],
        [engine, t]
    );

    React.useEffect(() => {
        return () => {
            clearSpawnAndHideTimers();
            if (tapHintTimerRef.current != null) {
                window.clearTimeout(tapHintTimerRef.current);
                tapHintTimerRef.current = null;
            }
            if (tapHintExitTimerRef.current != null) {
                window.clearTimeout(tapHintExitTimerRef.current);
                tapHintExitTimerRef.current = null;
            }
        };
    }, [clearSpawnAndHideTimers]);

    React.useEffect(() => {
        holesRef.current = holes;
    }, [holes]);

    React.useEffect(() => {
        setTargetCountRef.current = setTargetCount;
    }, [setTargetCount]);

    React.useEffect(() => {
        if (engine.gameState === 'idle' || engine.gameState === 'gameover') {
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
    }, [engine.gameState]);

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

    React.useEffect(() => {
        if (engine.gameState !== 'playing') {
            clearSpawnAndHideTimers();
            setActiveMoles([]);
            setMoleAnimStates({});
            setMoleFeedbacks({});
            if (engine.gameState === 'idle' || engine.gameState === 'gameover') {
                hasInitializedRoundRef.current = false;
                setSetCorrectCount(0);
                const nextTarget = randomInt(SET_TARGET_MIN, SET_TARGET_MAX);
                setSetTargetCount(nextTarget);
                setTargetCountRef.current = nextTarget;
            }
            return;
        }

        if (!hasInitializedRoundRef.current) {
            const nextHoles = generateHolePoints(HOLE_COUNT);
            setHoles(nextHoles);
            setCheesePatches(createCheesePatches(nextHoles));
            hasInitializedRoundRef.current = true;
            setSetCorrectCount(0);
            const nextTarget = randomInt(SET_TARGET_MIN, SET_TARGET_MAX);
            setSetTargetCount(nextTarget);
            setTargetCountRef.current = nextTarget;
        }
        setActiveMoles([]);
        clearSpawnAndHideTimers();

        spawnTimerRef.current = window.setTimeout(() => {
            scheduleNextSpawn();
        }, 180);

        return () => {
            clearSpawnAndHideTimers();
        };
    }, [clearSpawnAndHideTimers, engine.gameState, scheduleNextSpawn]);

    return (
        <Layout2
            gameId={GameIds.MATH_MOLE_WHACK}
            title={t('games.mole-whack.title')}
            subtitle={t('games.mole-whack.subtitle')}
            instructions={instructions}
            engine={engine}
            onExit={onExit}
            powerUps={powerUps}
            cardBackground={<div className="mole-whack-card-bg" />}
        >
            <div className="mole-whack-stage">
                <div className="mole-whack-top-signs">
                    <div className="mole-whack-sign mole-whack-sign-left">
                        <span className="mole-whack-sign-text">{t('games.mole-whack.ui.restrictedSign')}</span>
                    </div>
                    <div className="mole-whack-target-sign" aria-label="target moles">
                        {Array.from({ length: setTargetCount }).map((_, idx) => (
                            <span
                                key={idx}
                                className={`mole-whack-target-mouse ${idx < setCorrectCount ? 'is-active' : 'is-dim'}`}
                            >
                                🐹
                            </span>
                        ))}
                    </div>
                </div>

                <div className="mole-whack-field">
                    {showTapHint && (
                        <div className={`mole-whack-tap-hint ${isTapHintExiting ? 'is-exiting' : ''}`}>
                            {t('games.mole-whack.ui.tapHint')}
                        </div>
                    )}
                    {cheesePatches.map((patch) => (
                        <span
                            key={patch.id}
                            className="mole-whack-cheese"
                            style={
                                {
                                    left: `${patch.x}%`,
                                    top: `${patch.y}%`,
                                    '--cheese-scale': String(patch.size),
                                    transform: `translate(-50%, -50%) rotate(${patch.tilt}deg)`
                                } as React.CSSProperties
                            }
                        >
                            🧀
                        </span>
                    ))}
                    {holes.map((hole) => {
                        const mole = activeMoleByHole[hole.id];
                        const animState = moleAnimStates[hole.id];
                        const feedback = moleFeedbacks[hole.id];
                        return (
                        <div
                            key={hole.id}
                            className="mole-whack-hole-wrap"
                            style={{ left: `${hole.x}%`, top: `${hole.y}%` }}
                        >
                            {feedback && (
                                <div className={`mole-whack-impact-feedback is-${feedback}`}>
                                    <span className="mole-whack-impact-ring" />
                                    <span className={`mole-whack-impact-stamp is-${feedback}`}>
                                        {feedback === 'correct' ? '✔' : '✕'}
                                    </span>
                                </div>
                            )}
                            {mole && (
                                <div className={`mole-whack-mole ${animState ? `is-${animState}` : ''}`}>
                                    <button
                                        type="button"
                                        className="mole-whack-hit-target"
                                        onClick={() => handleMoleTap(mole)}
                                    >
                                        <span className="mole-whack-hammer" aria-hidden="true">
                                            <span className="mole-whack-hammer-head" />
                                            <span className="mole-whack-hammer-handle" />
                                        </span>
                                        <div className={`mole-whack-mole-problem ${mole.problem.isCorrect ? 'is-correct' : 'is-wrong'}`}>
                                            {formatProblemLabel(mole.problem)}
                                        </div>
                                        <div className="mole-whack-mole-character">
                                            <div className="mole-whack-mole-face">🐹</div>
                                            <div className="mole-whack-mole-body" />
                                        </div>
                                    </button>
                                </div>
                            )}
                            <div className="mole-whack-hole" />
                        </div>
                        );
                    })}
                </div>
            </div>
        </Layout2>
    );
};
