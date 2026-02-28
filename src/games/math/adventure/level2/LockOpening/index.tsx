import React from 'react';
import { useTranslation } from 'react-i18next';
import type { GameManifest } from '../../../../types';
import { GameIds } from '../../../../../constants/gameIds';
import { Layout2 } from '../../../../layouts/Standard/Layout2';
import { useGameEngine } from '../../../../layouts/Standard/Layout0/useGameEngine';
import { LockBackground } from './LockBackground';

interface LockOpeningProps {
    onExit: () => void;
}

type Op = '+' | '-';

interface LockProblem {
    target: number;
    op: Op;
    grid: Array<number | Op>;
}

const ALL_DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
const GRID_NUMBER_INDEXES = [0, 1, 2, 3, 5, 6, 7, 8];
const POWERUP_TYPES: Array<'timeFreeze' | 'extraLife' | 'doubleScore'> = ['timeFreeze', 'extraLife', 'doubleScore'];

const clearTimer = (timerRef: React.MutableRefObject<number | null>) => {
    if (timerRef.current != null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
    }
};

const shuffle = <T,>(arr: T[]): T[] => {
    const next = [...arr];
    for (let i = next.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [next[i], next[j]] = [next[j], next[i]];
    }
    return next;
};

const createProblem = (): LockProblem => {
    const op: Op = Math.random() > 0.5 ? '+' : '-';

    // Pick two distinct operands from 1~9, then guarantee they are included in the grid.
    const picked = shuffle([...ALL_DIGITS]).slice(0, 2);
    let a = picked[0];
    let b = picked[1];

    // Subtraction problems are generated as non-negative.
    if (op === '-' && a < b) {
        [a, b] = [b, a];
    }

    const target = op === '+' ? a + b : a - b;

    // Build 8 unique numbers including the operands.
    const remainingPool = ALL_DIGITS.filter((n) => n !== a && n !== b);
    const rest = shuffle(remainingPool).slice(0, 6);
    const numbers = shuffle([a, b, ...rest]);

    const grid: Array<number | Op> = Array(9).fill(0);
    GRID_NUMBER_INDEXES.forEach((gridIdx, i) => {
        grid[gridIdx] = numbers[i];
    });
    grid[4] = op;

    return { target, op, grid };
};

export const LockOpening: React.FC<LockOpeningProps> = ({ onExit }) => {
    const { t } = useTranslation();
    const engine = useGameEngine({ initialLives: 3, initialTime: 60 });
    const [problem, setProblem] = React.useState<LockProblem | null>(null);
    const [selectedIdx, setSelectedIdx] = React.useState<number[]>([]);
    const [isUnlocking, setIsUnlocking] = React.useState(false);
    const [showPickHint, setShowPickHint] = React.useState(false);
    const [isPickHintExiting, setIsPickHintExiting] = React.useState(false);
    const prevGameStateRef = React.useRef(engine.gameState);
    const hasShownPickHintRef = React.useRef(false);
    const pickHintTimerRef = React.useRef<number | null>(null);
    const pickHintExitTimerRef = React.useRef<number | null>(null);
    const roundTransitionTimerRef = React.useRef<number | null>(null);
    const wrongResetTimerRef = React.useRef<number | null>(null);
    const selectedValues = selectedIdx
        .map((idx) => problem?.grid[idx])
        .filter((v): v is number => typeof v === 'number');
    const supportsCqi = React.useMemo(() => {
        if (typeof window === 'undefined' || typeof CSS === 'undefined' || typeof CSS.supports !== 'function') {
            return false;
        }
        return CSS.supports('width', '1cqi');
    }, []);
    const [fallbackUnitPx, setFallbackUnitPx] = React.useState(() => {
        if (typeof window === 'undefined') return 4.8;
        return Math.min(window.innerWidth * 0.88, 540) / 100;
    });
    const cq = React.useCallback((value: number) => {
        if (supportsCqi) return `${value}cqi`;
        return `${(value * fallbackUnitPx).toFixed(2)}px`;
    }, [supportsCqi, fallbackUnitPx]);

    const resetRoundUi = React.useCallback(() => {
        setSelectedIdx([]);
    }, []);

    const generateNext = React.useCallback(() => {
        setProblem(createProblem());
        setIsUnlocking(false);
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
        if (supportsCqi) return;
        const updateFallbackUnit = () => {
            setFallbackUnitPx(Math.min(window.innerWidth * 0.88, 540) / 100);
        };
        window.addEventListener('resize', updateFallbackUnit);
        return () => window.removeEventListener('resize', updateFallbackUnit);
    }, [supportsCqi]);

    React.useEffect(() => {
        if (engine.gameState !== 'gameover') return;
        clearTimer(pickHintTimerRef);
        clearTimer(pickHintExitTimerRef);
        setShowPickHint(false);
        setIsPickHintExiting(false);
        hasShownPickHintRef.current = false;
    }, [engine.gameState]);

    React.useEffect(() => {
        const isFirstProblem = engine.stats.correct === 0 && engine.stats.wrong === 0;
        if (engine.gameState !== 'playing' || !problem || !isFirstProblem || hasShownPickHintRef.current) {
            return;
        }

        hasShownPickHintRef.current = true;
        setShowPickHint(true);
        setIsPickHintExiting(false);

        pickHintTimerRef.current = window.setTimeout(() => {
            setIsPickHintExiting(true);
            pickHintExitTimerRef.current = window.setTimeout(() => {
                setShowPickHint(false);
                setIsPickHintExiting(false);
                pickHintExitTimerRef.current = null;
            }, 220);
            pickHintTimerRef.current = null;
        }, 1800);

        return () => {
            clearTimer(pickHintTimerRef);
            clearTimer(pickHintExitTimerRef);
        };
    }, [engine.gameState, problem, engine.stats.correct, engine.stats.wrong]);

    React.useEffect(() => {
        return () => {
            clearTimer(pickHintTimerRef);
            clearTimer(pickHintExitTimerRef);
            clearTimer(roundTransitionTimerRef);
            clearTimer(wrongResetTimerRef);
        };
    }, []);

    const instructions = React.useMemo(() => ([
        {
            icon: '🔎',
            title: t('games.math-lock-opening.howToPlay.step1.title'),
            description: t('games.math-lock-opening.howToPlay.step1.description')
        },
        {
            icon: '👆',
            title: t('games.math-lock-opening.howToPlay.step2.title'),
            description: t('games.math-lock-opening.howToPlay.step2.description')
        },
        {
            icon: '🔓',
            title: t('games.math-lock-opening.howToPlay.step3.title'),
            description: t('games.math-lock-opening.howToPlay.step3.description')
        }
    ]), [t]);

    const handleTileClick = React.useCallback((idx: number) => {
        if (engine.gameState !== 'playing' || !problem) return;
        if (isUnlocking) return;
        if (idx === 4) return;
        if (selectedIdx.includes(idx)) return;
        if (selectedIdx.length >= 2) return;

        const nextSelected = [...selectedIdx, idx];
        setSelectedIdx(nextSelected);

        if (nextSelected.length !== 2) return;

        const v1 = problem.grid[nextSelected[0]];
        const v2 = problem.grid[nextSelected[1]];
        if (typeof v1 !== 'number' || typeof v2 !== 'number') return;

        const result = problem.op === '+' ? v1 + v2 : Math.abs(v1 - v2);
        const isCorrect = result === problem.target;

        if (isCorrect) {
            const nextCombo = engine.combo + 1;
            if (nextCombo % 3 === 0 && Math.random() > 0.45) {
                const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
                engine.setPowerUps((prev) => ({ ...prev, [type]: prev[type] + 1 }));
            }

            setIsUnlocking(true);
            engine.submitAnswer(true, { skipFeedback: true });
            engine.registerEvent({ type: 'correct' });
            clearTimer(roundTransitionTimerRef);
            roundTransitionTimerRef.current = window.setTimeout(() => {
                generateNext();
            }, 560);
        } else {
            engine.submitAnswer(false);
            engine.registerEvent({ type: 'wrong' });
            clearTimer(wrongResetTimerRef);
            wrongResetTimerRef.current = window.setTimeout(() => {
                setSelectedIdx([]);
            }, 250);
        }
    }, [engine, generateNext, isUnlocking, problem, selectedIdx]);

    return (
        <Layout2
            title={t('games.math-lock-opening.title')}
            subtitle={t('games.math-lock-opening.subtitle')}
            description={t('games.math-lock-opening.description')}
            gameId={GameIds.MATH_LOCK_OPENING}
            engine={engine}
            onExit={onExit}
            cardBackground={<LockBackground />}
            instructions={instructions}
            powerUps={[
                {
                    count: engine.powerUps.timeFreeze,
                    color: 'blue',
                    icon: '❄️',
                    title: t('games.math-lock-opening.powerups.timeFreeze'),
                    onClick: () => engine.activatePowerUp('timeFreeze'),
                    disabledConfig: engine.isTimeFrozen,
                    status: engine.isTimeFrozen ? 'active' : 'normal'
                },
                {
                    count: engine.powerUps.extraLife,
                    color: 'red',
                    icon: '❤️',
                    title: t('games.math-lock-opening.powerups.extraLife'),
                    onClick: () => engine.activatePowerUp('extraLife'),
                    disabledConfig: engine.lives >= 3,
                    status: engine.lives >= 3 ? 'maxed' : 'normal'
                },
                {
                    count: engine.powerUps.doubleScore,
                    color: 'yellow',
                    icon: '⚡',
                    title: t('games.math-lock-opening.powerups.doubleScore'),
                    onClick: () => engine.activatePowerUp('doubleScore'),
                    disabledConfig: engine.isDoubleScore,
                    status: engine.isDoubleScore ? 'active' : 'normal'
                }
            ]}
        >
            {problem && (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', containerType: 'size', position: 'relative' }}>
                    <div style={{ width: '100%', maxWidth: '540px', height: '100%', maxHeight: cq(110), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: cq(3) }}>
                        <div style={{
                            width: cq(44),
                            height: cq(28),
                            border: `${cq(6)} solid #bcc1c8`,
                            borderBottom: '0',
                            borderRadius: `${cq(25)} ${cq(25)} 0 0`,
                            marginBottom: `-${cq(8)}`,
                            background: 'transparent',
                            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.55), 0 ${cq(0.6)} 0 rgba(122,128,138,0.38)`,
                            position: 'relative',
                            transformOrigin: '18% 92%',
                            transform: isUnlocking ? `rotate(-46deg) translate(-${cq(3.2)}, -${cq(1.8)})` : 'none',
                            transition: 'transform 380ms cubic-bezier(0.22, 1, 0.36, 1)'
                        }}>
                            <div style={{
                                position: 'absolute',
                                inset: `-${cq(0.35)}`,
                                border: `${cq(1.4)} solid rgba(245, 247, 250, 0.88)`,
                                borderBottom: '0',
                                borderRadius: `${cq(24)} ${cq(24)} 0 0`,
                                pointerEvents: 'none'
                            }} />
                            <div style={{
                                position: 'absolute',
                                inset: cq(0.2),
                                border: `${cq(2.7)} solid transparent`,
                                borderBottom: '0',
                                borderRadius: `${cq(22)} ${cq(22)} 0 0`,
                                borderTopColor: 'rgba(255, 255, 255, 0.18)',
                                borderRightColor: 'rgba(96, 103, 112, 0.28)',
                                borderLeftColor: 'rgba(255, 255, 255, 0.1)',
                                boxSizing: 'border-box',
                                pointerEvents: 'none'
                            }} />
                        </div>

                        <div style={{
                            width: cq(82),
                            height: cq(76),
                            padding: `${cq(3.2)} ${cq(5.5)}`,
                            borderRadius: cq(5.2),
                            background: '#f5bf27',
                            border: `${cq(1)} solid #f2bb28`,
                            boxShadow: `0 10px 0 #de9f19, 0 20px 24px rgba(15,23,42,0.18), inset 0 ${cq(1.1)} 0 rgba(255,255,255,0.2)`,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: cq(2),
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                clipPath: 'polygon(10% 0%, 42% 0%, 78% 100%, 46% 100%)',
                                background: 'rgba(223, 126, 36, 0.25)',
                                zIndex: 1,
                                pointerEvents: 'none'
                            }} />
                            <div style={{
                                position: 'absolute',
                                left: cq(2.6),
                                top: cq(12.2),
                                width: cq(1.8),
                                height: cq(25),
                                borderRadius: '999px',
                                background: 'rgba(255,255,255,0.32)',
                                zIndex: 1,
                                pointerEvents: 'none'
                            }} />
                            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
                                <div style={{
                                    width: '100%',
                                    height: cq(15.6),
                                    background: 'linear-gradient(180deg, #0f172a 0%, #111827 100%)',
                                    color: '#67e8f9',
                                    borderRadius: cq(2.2),
                                    border: '2px solid #22d3ee',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: cq(1.1),
                                    fontSize: cq(5.2),
                                    fontWeight: 800,
                                    letterSpacing: '0.08em',
                                    textShadow: '0 0 10px rgba(34,211,238,0.65)',
                                    boxShadow: 'inset 0 0 0 2px rgba(125,211,252,0.18), 0 0 14px rgba(34,211,238,0.3)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '25%',
                                        background: 'linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0))',
                                        pointerEvents: 'none'
                                    }} />
                                    <div style={{
                                        height: '90%',
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: cq(1.2)
                                    }}>
                                        <div style={{
                                            height: '100%',
                                            aspectRatio: '1 / 1',
                                            borderRadius: cq(1.1),
                                            border: selectedValues[0] == null ? '2px dashed #67e8f9' : '2px solid #22d3ee',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#e0f2fe',
                                            fontSize: cq(5.6),
                                            lineHeight: 1
                                        }}>
                                            {selectedValues[0] ?? '?'}
                                        </div>
                                        <span style={{ fontSize: cq(6.2) }}>{problem.op}</span>
                                        <div style={{
                                            height: '100%',
                                            aspectRatio: '1 / 1',
                                            borderRadius: cq(1.1),
                                            border: selectedValues[1] == null ? '2px dashed #67e8f9' : '2px solid #22d3ee',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#e0f2fe',
                                            fontSize: cq(5.6),
                                            lineHeight: 1
                                        }}>
                                            {selectedValues[1] ?? '?'}
                                        </div>
                                        <span style={{ fontSize: cq(6.2) }}>=</span>
                                        <span style={{ color: '#22d3ee', fontSize: cq(6.8) }}>{problem.target}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gridTemplateRows: 'repeat(3, minmax(0, 1fr))',
                                gap: cq(1.5),
                                width: '100%',
                                flex: '1 1 auto',
                                minHeight: 0,
                                height: '100%',
                                alignSelf: 'stretch',
                                margin: '0 auto',
                                position: 'relative',
                                zIndex: 2
                            }}>
                                {problem.grid.map((cell, idx) => {
                                    const isCenter = idx === 4;
                                    const selected = selectedIdx.includes(idx);
                                    if (isCenter) {
                                        return (
                                            <div
                                                key={idx}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    userSelect: 'none',
                                                    pointerEvents: 'none'
                                                }}
                                                aria-hidden="true"
                                            >
                                                <div style={{ position: 'relative', width: '84%', height: '90%' }}>
                                                    <div style={{
                                                        position: 'absolute',
                                                        left: '50%',
                                                        top: 0,
                                                        transform: 'translateX(-50%)',
                                                        width: '68%',
                                                        aspectRatio: '1 / 1',
                                                        borderRadius: '50%',
                                                        background: '#4b3621',
                                                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)'
                                                    }} />
                                                    <div style={{
                                                        position: 'absolute',
                                                        left: '50%',
                                                        top: '54%',
                                                        transform: 'translateX(-50%)',
                                                        width: '40%',
                                                        aspectRatio: '1 / 1',
                                                        borderRadius: '50%',
                                                        background: '#4b3621'
                                                    }} />
                                                    <div style={{
                                                        position: 'absolute',
                                                        left: '50%',
                                                        bottom: 0,
                                                        transform: 'translateX(-50%)',
                                                        width: '18%',
                                                        height: '18%',
                                                        borderRadius: '999px',
                                                        background: '#4b3621'
                                                    }} />
                                                    <div style={{
                                                        position: 'absolute',
                                                        left: '50%',
                                                        top: '50%',
                                                        transform: 'translate(-50%, -50%)',
                                                        color: '#fde68a',
                                                        fontSize: cq(7.2),
                                                        fontWeight: 900,
                                                        lineHeight: 1
                                                    }}>
                                                        {cell}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleTileClick(idx)}
                                            disabled={engine.gameState !== 'playing'}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                borderRadius: cq(2.2),
                                                border: selected ? '2px solid #0f766e' : '2px solid #d1d5db',
                                                background: selected ? '#0f766e' : 'white',
                                                color: selected ? '#ecfeff' : '#0f172a',
                                                fontSize: cq(7),
                                                fontWeight: 800,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                lineHeight: 1,
                                                boxShadow: selected ? '0 3px 0 #115e59' : '0 3px 0 #cbd5e1',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {cell}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    {showPickHint && (
                        <div
                            style={{
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                bottom: 0,
                                zIndex: 25,
                                pointerEvents: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: '2.5rem',
                                borderRadius: '0.8rem',
                                background: 'rgba(255, 255, 255, 0.94)',
                                color: '#1e3a8a',
                                fontSize: '1.02rem',
                                fontWeight: 800,
                                letterSpacing: '0.01em',
                                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.18)',
                                opacity: isPickHintExiting ? 0 : 1,
                                transform: isPickHintExiting ? 'translateY(4px)' : 'translateY(0)',
                                transition: 'opacity 0.22s ease-in, transform 0.22s ease-in'
                            }}
                        >
                            {t('games.math-lock-opening.ui.pickTwo')}
                        </div>
                    )}
                </div>
            )}
        </Layout2>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const manifest: GameManifest = {
    id: GameIds.MATH_LOCK_OPENING,
    title: '자물쇠 열기',
    titleKey: 'games.math-lock-opening.title',
    subtitle: '+/- 유창성 종합',
    subtitleKey: 'games.math-lock-opening.subtitle',
    description: '두 숫자를 선택해 목표 숫자를 만드는 게임',
    descriptionKey: 'games.math-lock-opening.description',
    category: 'math',
    level: 2,
    mode: 'adventure',
    component: LockOpening,
    thumbnail: '🔐',
    tagsKey: 'games.tags.mixedOps'
};

export default LockOpening;
