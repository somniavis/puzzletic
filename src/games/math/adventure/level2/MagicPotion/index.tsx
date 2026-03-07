import React from 'react';
import { useTranslation } from 'react-i18next';
import type { GameManifest } from '../../../../types';
import { GameIds } from '../../../../../constants/gameIds';
import { Layout2 } from '../../../../layouts/Standard/Layout2';
import { useGameEngine } from '../../../../layouts/Standard/Layout0/useGameEngine';
import { playClearSound, playJelloClickSound } from '../../../../../utils/sound';
import './MagicPotion.css';

interface MagicPotionProps {
    onExit: () => void;
    level?: 1 | 2;
}

type PotionOp = '+' | '-' | '×';
type PotionSpecial = '🫟';

type PotionToken = {
    id: string;
    type: 'num' | 'op';
    value: number | PotionOp | PotionSpecial;
    color?: string;
};

type PotionRound = {
    target: number;
    tokens: PotionToken[];
};

const NUMBER_POOL_LV1 = Array.from({ length: 21 }, (_, i) => i);
const NUMBER_POOL_LV2 = Array.from({ length: 9 }, (_, i) => i + 1);
const NUMBER_TOKEN_COLORS = ['#22c55e', '#06b6d4', '#f97316', '#eab308', '#ec4899', '#8b5cf6'];
const POWERUP_TYPES: Array<'timeFreeze' | 'extraLife' | 'doubleScore'> = ['timeFreeze', 'extraLife', 'doubleScore'];
const WIZARD_EMOJIS = ['🧙🏻‍♀️', '🧙🏼‍♀️', '🧙🏽‍♀️', '🧙🏾‍♀️', '🧙🏿‍♀️'] as const;
const ROUND_RESET_DELAY_MS = 760;
const OPTIONS_HINT_DURATION_MS = 1800;
const WRONG_LIQUID_STYLE: React.CSSProperties = {
    background: 'linear-gradient(180deg, #fca5a5 0%, #ef4444 58%, #b91c1c 100%)',
};
const DEFAULT_LIQUID_STYLE: React.CSSProperties = {
    background: 'linear-gradient(180deg, #a5b4fc 0%, #6366f1 58%, #4338ca 100%)',
};
const colorMixCache = new Map<string, string>();
const potionGradientCache = new Map<string, React.CSSProperties>();

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const shuffle = <T,>(arr: T[]): T[] => {
    const next = [...arr];
    for (let i = next.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [next[i], next[j]] = [next[j], next[i]];
    }
    return next;
};

const hexToRgb = (hex: string) => {
    const normalized = hex.replace('#', '');
    return {
        r: parseInt(normalized.slice(0, 2), 16),
        g: parseInt(normalized.slice(2, 4), 16),
        b: parseInt(normalized.slice(4, 6), 16),
    };
};

const rgbToHex = (r: number, g: number, b: number) =>
    `#${[r, g, b]
        .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'))
        .join('')}`;

const mixHex = (a: string, b: string) => {
    const key = a < b ? `${a}|${b}` : `${b}|${a}`;
    const cached = colorMixCache.get(key);
    if (cached) return cached;
    const c1 = hexToRgb(a);
    const c2 = hexToRgb(b);
    const mixed = rgbToHex((c1.r + c2.r) / 2, (c1.g + c2.g) / 2, (c1.b + c2.b) / 2);
    colorMixCache.set(key, mixed);
    return mixed;
};

const shadeHex = (hex: string, amount: number) => {
    const { r, g, b } = hexToRgb(hex);
    const factor = 1 - Math.max(0, Math.min(1, amount));
    return rgbToHex(r * factor, g * factor, b * factor);
};

const getSinglePotionGradient = (color: string): React.CSSProperties => {
    const key = `single|${color}`;
    const cached = potionGradientCache.get(key);
    if (cached) return cached;
    const next = {
        background: `linear-gradient(180deg, ${color} 0%, ${mixHex(color, '#1f2937')} 100%)`,
    };
    potionGradientCache.set(key, next);
    return next;
};

const getDualPotionGradient = (c1: string, c2: string): React.CSSProperties => {
    const key = c1 < c2 ? `dual|${c1}|${c2}` : `dual|${c2}|${c1}`;
    const cached = potionGradientCache.get(key);
    if (cached) return cached;
    const mixed = mixHex(c1, c2);
    const top = mixHex(mixed, '#ffffff');
    const bottom = mixHex(mixed, '#1f2937');
    const next = {
        background: `linear-gradient(180deg, ${top} 0%, ${mixed} 52%, ${bottom} 100%)`,
    };
    potionGradientCache.set(key, next);
    return next;
};

const createRoundLv1 = (): PotionRound => {
    const op: PotionOp = Math.random() < 0.5 ? '+' : '-';

    let left = 0;
    let right = 0;
    let target = 0;

    if (op === '+') {
        left = randomInt(1, 12);
        right = randomInt(1, 12);
        while (left + right > 20) {
            left = randomInt(1, 12);
            right = randomInt(1, 12);
        }
        target = left + right;
    } else {
        left = randomInt(2, 20);
        right = randomInt(1, left);
        target = left - right;
    }

    const used = new Set<number>([left, right]);
    const distractorPool = shuffle(NUMBER_POOL_LV1.filter((n) => !used.has(n)));
    const numeric = [left, right, ...distractorPool.slice(0, 4)];
    const colorPool = shuffle(NUMBER_TOKEN_COLORS);
    const tokens = shuffle<PotionToken>([
        ...numeric.map((value, idx) => ({
            id: `num-${idx}-${value}`,
            type: 'num' as const,
            value,
            color: colorPool[idx],
        })),
        { id: 'op-plus', type: 'op' as const, value: '+' as const },
        { id: 'op-minus', type: 'op' as const, value: '-' as const },
    ]);

    return { target, tokens };
};

const createRoundLv2 = (): PotionRound => {
    const left = randomInt(1, 9);
    const right = randomInt(1, 9);
    const target = left * right;
    const used = new Set<number>([left, right]);
    const distractorPool = shuffle(NUMBER_POOL_LV2.filter((n) => !used.has(n)));
    const numeric = [left, right, ...distractorPool.slice(0, 4)];
    const colorPool = shuffle(NUMBER_TOKEN_COLORS);
    const tokens = shuffle<PotionToken>([
        ...numeric.map((value, idx) => ({
            id: `num-${idx}-${value}`,
            type: 'num' as const,
            value,
            color: colorPool[idx],
        })),
        { id: 'op-mul', type: 'op' as const, value: '×' as const },
        { id: 'op-trap', type: 'op' as const, value: '🫟' as const },
    ]);

    return { target, tokens };
};

const createRound = (level: 1 | 2): PotionRound => (level === 2 ? createRoundLv2() : createRoundLv1());

export const MagicPotion: React.FC<MagicPotionProps> = ({ onExit, level = 1 }) => {
    const { t } = useTranslation();
    const engine = useGameEngine({ initialLives: 3, initialTime: level === 2 ? 90 : 60 });
    const [round, setRound] = React.useState<PotionRound | null>(null);
    const [cauldronSlots, setCauldronSlots] = React.useState<PotionToken[]>([]);
    const [draggingToken, setDraggingToken] = React.useState<PotionToken | null>(null);
    const [dragPos, setDragPos] = React.useState<{ x: number; y: number } | null>(null);
    const [judgeState, setJudgeState] = React.useState<'idle' | 'correct' | 'wrong'>('idle');
    const [consumedTokenIds, setConsumedTokenIds] = React.useState<Set<string>>(() => new Set());
    const [showOptionsHint, setShowOptionsHint] = React.useState(false);
    const [wizardEmoji, setWizardEmoji] = React.useState<string>(() => WIZARD_EMOJIS[Math.floor(Math.random() * WIZARD_EMOJIS.length)]);
    const cauldronDropRef = React.useRef<HTMLDivElement | null>(null);
    const cauldronSlotsRef = React.useRef<PotionToken[]>([]);
    const roundTimerRef = React.useRef<number | null>(null);
    const hintTimerRef = React.useRef<number | null>(null);
    const dragRafRef = React.useRef<number | null>(null);
    const pendingDragPosRef = React.useRef<{ x: number; y: number } | null>(null);
    const audioPrimedRef = React.useRef(false);
    const hasShownHintRef = React.useRef(false);
    const wasPlayingRef = React.useRef(false);
    const prevGameStateRef = React.useRef(engine.gameState);
    const bubbleSeeds = React.useMemo(
        () =>
            Array.from({ length: 16 }, (_, idx) => ({
                id: idx,
                left: `${8 + ((idx * 37) % 84)}%`,
                size: `${10 + ((idx * 11) % 18)}px`,
                duration: `${1.8 + ((idx * 13) % 19) / 10}s`,
                delay: `${-((idx * 7) % 20) / 10}s`,
            })),
        []
    );
    const usedTokenIds = React.useMemo(() => {
        const ids = new Set(cauldronSlots.map((token) => token.id));
        consumedTokenIds.forEach((id) => ids.add(id));
        return ids;
    }, [cauldronSlots, consumedTokenIds]);
    const scheduleDragPosUpdate = React.useCallback((x: number, y: number) => {
        pendingDragPosRef.current = { x, y };
        if (dragRafRef.current != null) return;
        dragRafRef.current = window.requestAnimationFrame(() => {
            dragRafRef.current = null;
            if (pendingDragPosRef.current) {
                setDragPos(pendingDragPosRef.current);
            }
        });
    }, []);
    const primeAudioOnce = React.useCallback(() => {
        if (audioPrimedRef.current) return;
        audioPrimedRef.current = true;
        // Safari unlock warm-up for both correct/wrong SFX
        playClearSound(0);
        playJelloClickSound(0);
    }, []);

    const resolveAnswer = React.useCallback((slots: PotionToken[]) => {
        if (!round || judgeState !== 'idle' || slots.length !== 3) return;

        const [a, op, b] = slots;
        const isPatternValid = a.type === 'num' && op.type === 'op' && b.type === 'num';
        let isCorrect = false;

        if (isPatternValid) {
            const left = a.value as number;
            const right = b.value as number;
            const sign = op.value as PotionOp;
            const result = sign === '+' ? left + right : sign === '-' ? left - right : left * right;
            isCorrect = result === round.target;
        }

        if (isCorrect) {
            const nextCombo = engine.combo + 1;
            if (nextCombo % 3 === 0 && Math.random() > 0.45) {
                const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
                engine.setPowerUps((prev) => ({ ...prev, [type]: prev[type] + 1 }));
            }
            engine.submitAnswer(true, { skipFeedback: true });
            engine.registerEvent({ type: 'correct' });
            setJudgeState('correct');
        } else {
            engine.submitAnswer(false);
            engine.registerEvent({ type: 'wrong' });
            setJudgeState('wrong');
        }

        if (roundTimerRef.current != null) {
            window.clearTimeout(roundTimerRef.current);
        }
        roundTimerRef.current = window.setTimeout(() => {
            setCauldronSlots([]);
            setConsumedTokenIds(new Set());
            setJudgeState('idle');
            if (isCorrect) {
                setRound(createRound(level));
            }
            roundTimerRef.current = null;
        }, ROUND_RESET_DELAY_MS);
    }, [engine, judgeState, level, round]);

    React.useEffect(() => {
        const prev = prevGameStateRef.current;
        if (engine.gameState === 'playing' && prev !== 'playing') {
            setWizardEmoji(WIZARD_EMOJIS[Math.floor(Math.random() * WIZARD_EMOJIS.length)]);
        }
        if (engine.gameState === 'playing' && !round) {
            setRound(createRound(level));
            setCauldronSlots([]);
            setConsumedTokenIds(new Set());
            setJudgeState('idle');
        }
        if ((engine.gameState === 'idle' || engine.gameState === 'gameover') && round) {
            setRound(null);
            setCauldronSlots([]);
            setConsumedTokenIds(new Set());
            setJudgeState('idle');
        }
        prevGameStateRef.current = engine.gameState;
    }, [engine.gameState, level, round]);

    React.useEffect(() => {
        return () => {
            if (roundTimerRef.current != null) {
                window.clearTimeout(roundTimerRef.current);
                roundTimerRef.current = null;
            }
            if (hintTimerRef.current != null) {
                window.clearTimeout(hintTimerRef.current);
                hintTimerRef.current = null;
            }
            if (dragRafRef.current != null) {
                window.cancelAnimationFrame(dragRafRef.current);
                dragRafRef.current = null;
            }
        };
    }, []);

    React.useEffect(() => {
        cauldronSlotsRef.current = cauldronSlots;
    }, [cauldronSlots]);

    React.useEffect(() => {
        if (engine.gameState === 'playing' && !wasPlayingRef.current) {
            hasShownHintRef.current = false;
            setShowOptionsHint(false);
            if (hintTimerRef.current != null) {
                window.clearTimeout(hintTimerRef.current);
                hintTimerRef.current = null;
            }
        }
        wasPlayingRef.current = engine.gameState === 'playing';
    }, [engine.gameState]);

    React.useEffect(() => {
        if (engine.gameState !== 'playing' || !round || hasShownHintRef.current) return;

        const isFirstQuestion =
            engine.score === 0 &&
            engine.stats.correct === 0 &&
            engine.stats.wrong === 0;

        if (!isFirstQuestion) return;

        hasShownHintRef.current = true;
        setShowOptionsHint(true);
        hintTimerRef.current = window.setTimeout(() => {
            setShowOptionsHint(false);
            hintTimerRef.current = null;
        }, OPTIONS_HINT_DURATION_MS);
    }, [engine.gameState, round, engine.score, engine.stats.correct, engine.stats.wrong]);

    React.useEffect(() => {
        if (!draggingToken) return;
        let hasDropped = false;

        const handleDropAt = (clientX: number, clientY: number) => {
            if (hasDropped) return;
            hasDropped = true;
            const dropArea = cauldronDropRef.current?.getBoundingClientRect();
            const droppedInCauldron =
                dropArea != null &&
                clientX >= dropArea.left &&
                clientX <= dropArea.right &&
                clientY >= dropArea.top &&
                clientY <= dropArea.bottom;

            if (droppedInCauldron) {
                const current = cauldronSlotsRef.current;
                if (!current.some((token) => token.id === draggingToken.id) && current.length < 3) {
                    if (draggingToken.value === '🫟') {
                        setConsumedTokenIds((prev) => {
                            const next = new Set(prev);
                            next.add(draggingToken.id);
                            return next;
                        });
                        engine.updateLives(false);
                        setDraggingToken(null);
                        setDragPos(null);
                        pendingDragPosRef.current = null;
                        return;
                    }
                    const nextSlots = [...current, draggingToken];
                    setCauldronSlots(nextSlots);
                    if (nextSlots.length === 3) {
                        resolveAnswer(nextSlots);
                    }
                }
            }

            setDraggingToken(null);
            setDragPos(null);
            pendingDragPosRef.current = null;
            if (dragRafRef.current != null) {
                window.cancelAnimationFrame(dragRafRef.current);
                dragRafRef.current = null;
            }
        };

        const onMove = (event: PointerEvent) => {
            if (hasDropped) return;
            scheduleDragPosUpdate(event.clientX, event.clientY);
        };

        const onUp = (event: PointerEvent) => {
            handleDropAt(event.clientX, event.clientY);
        };

        const onTouchMove = (event: TouchEvent) => {
            if (hasDropped) return;
            const touch = event.touches[0];
            if (!touch) return;
            event.preventDefault();
            scheduleDragPosUpdate(touch.clientX, touch.clientY);
        };

        const onTouchEnd = (event: TouchEvent) => {
            const touch = event.changedTouches[0];
            if (!touch) {
                setDraggingToken(null);
                setDragPos(null);
                pendingDragPosRef.current = null;
                return;
            }
            handleDropAt(touch.clientX, touch.clientY);
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onUp);
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('touchend', onTouchEnd);
        window.addEventListener('touchcancel', onTouchEnd);
        return () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('pointercancel', onUp);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
            window.removeEventListener('touchcancel', onTouchEnd);
            if (dragRafRef.current != null) {
                window.cancelAnimationFrame(dragRafRef.current);
                dragRafRef.current = null;
            }
        };
    }, [draggingToken, engine, resolveAnswer, scheduleDragPosUpdate]);

    const handleTokenPointerDown = React.useCallback(
        (event: React.PointerEvent<HTMLButtonElement>, token: PotionToken) => {
            if (judgeState !== 'idle') return;
            if (usedTokenIds.has(token.id)) return;
            primeAudioOnce();
            event.preventDefault();
            setDraggingToken(token);
            scheduleDragPosUpdate(event.clientX, event.clientY);
        },
        [judgeState, usedTokenIds, primeAudioOnce, scheduleDragPosUpdate]
    );

    const handleTokenTouchStart = React.useCallback(
        (event: React.TouchEvent<HTMLButtonElement>, token: PotionToken) => {
            if (judgeState !== 'idle') return;
            if (usedTokenIds.has(token.id)) return;
            const touch = event.touches[0];
            if (!touch) return;
            primeAudioOnce();
            event.preventDefault();
            setDraggingToken(token);
            scheduleDragPosUpdate(touch.clientX, touch.clientY);
        },
        [judgeState, usedTokenIds, primeAudioOnce, scheduleDragPosUpdate]
    );

    const removeSlotToken = React.useCallback((index: number) => {
        if (judgeState !== 'idle') return;
        setCauldronSlots((prev) => prev.filter((_, idx) => idx !== index));
    }, [judgeState]);

    const instructions = React.useMemo(
        () => [
            {
                icon: '1️⃣',
                title: t('games.math-magic-potion.howToPlay.step1.title'),
                description: t('games.math-magic-potion.howToPlay.step1.description'),
            },
            {
                icon: '2️⃣',
                title: t('games.math-magic-potion.howToPlay.step2.title'),
                description: t('games.math-magic-potion.howToPlay.step2.description'),
            },
            {
                icon: '3️⃣',
                title: t('games.math-magic-potion.howToPlay.step3.title'),
                description: t('games.math-magic-potion.howToPlay.step3.description'),
            },
        ],
        [t]
    );

    const potionLiquidStyle = React.useMemo(() => {
        if (judgeState === 'wrong') {
            return WRONG_LIQUID_STYLE;
        }

        const numberTokens = cauldronSlots.filter((token) => token.type === 'num' && token.color);

        if (numberTokens.length >= 2) {
            const c1 = numberTokens[0].color as string;
            const c2 = numberTokens[1].color as string;
            return getDualPotionGradient(c1, c2);
        }

        if (numberTokens.length === 1) {
            const c = numberTokens[0].color as string;
            return getSinglePotionGradient(c);
        }

        return DEFAULT_LIQUID_STYLE;
    }, [cauldronSlots, judgeState]);

    const getTokenBoxStyle = React.useCallback((color?: string): React.CSSProperties | undefined => {
        if (!color) return undefined;
        return {
            borderColor: shadeHex(color, 0.35),
            borderBottomColor: shadeHex(color, 0.55),
            background: `linear-gradient(180deg, #ffffff33 0%, #00000026 100%), ${color}`,
        };
    }, []);

    const getSlotBoxStyle = React.useCallback((color?: string): React.CSSProperties | undefined => {
        if (!color) return undefined;
        return {
            borderColor: shadeHex(color, 0.15),
            background: `linear-gradient(180deg, #ffffff22 0%, #0f172ab8 100%), ${color}`,
        };
    }, []);

    return (
        <Layout2
            title={t(level === 2 ? 'games.math-magic-potion.title-lv2' : 'games.math-magic-potion.title-lv1')}
            subtitle={t('games.math-magic-potion.subtitle')}
            description={t('games.math-magic-potion.description')}
            gameId={level === 2 ? GameIds.MATH_MAGIC_POTION_LV2 : GameIds.MATH_MAGIC_POTION_LV1}
            engine={engine}
            onExit={onExit}
            className="magic-potion-theme"
            cardBackground={<div className="magic-potion-card-bg" />}
            instructions={instructions}
            powerUps={[
                {
                    count: engine.powerUps.timeFreeze,
                    color: 'blue',
                    icon: '❄️',
                    title: t('games.math-magic-potion.powerups.timeFreeze'),
                    onClick: () => engine.activatePowerUp('timeFreeze'),
                    disabledConfig: engine.isTimeFrozen,
                    status: engine.isTimeFrozen ? 'active' : 'normal',
                },
                {
                    count: engine.powerUps.extraLife,
                    color: 'red',
                    icon: '❤️',
                    title: t('games.math-magic-potion.powerups.extraLife'),
                    onClick: () => engine.activatePowerUp('extraLife'),
                    disabledConfig: engine.lives >= 3,
                    status: engine.lives >= 3 ? 'maxed' : 'normal',
                },
                {
                    count: engine.powerUps.doubleScore,
                    color: 'yellow',
                    icon: '⚡',
                    title: t('games.math-magic-potion.powerups.doubleScore'),
                    onClick: () => engine.activatePowerUp('doubleScore'),
                    disabledConfig: engine.isDoubleScore,
                    status: engine.isDoubleScore ? 'active' : 'normal',
                },
            ]}
        >
            <div className="magic-potion-stage">
                <section className="magic-potion-top">
                    <div className="magic-potion-wizard" aria-hidden="true">
                        {wizardEmoji}
                    </div>
                    <div className="magic-potion-speech">
                        <div className="magic-potion-target-label">{t('games.math-magic-potion.ui.makeLabel')}</div>
                        <div className="magic-potion-target-value">{round?.target ?? '?'}</div>
                    </div>
                </section>

                <section className="magic-potion-middle">
                    <div className={`magic-potion-cauldron ${judgeState !== 'idle' ? `is-${judgeState}` : ''}`} aria-label="Potion cauldron">
                        <div className="magic-potion-liquid" style={potionLiquidStyle} />
                        <div className="magic-potion-bubbles">
                            {bubbleSeeds.map((bubble) => (
                                <span
                                    key={bubble.id}
                                    className="magic-potion-bubble"
                                    style={
                                        {
                                            left: bubble.left,
                                            width: bubble.size,
                                            height: bubble.size,
                                            animationDuration: bubble.duration,
                                            animationDelay: bubble.delay,
                                        } as React.CSSProperties
                                    }
                                />
                            ))}
                        </div>
                        <div ref={cauldronDropRef} className="magic-potion-drop-zone">
                            <div className="magic-potion-formula-slots">
                                {cauldronSlots.map((token, idx) => (
                                    <button
                                        key={token.id}
                                        type="button"
                                        className={`magic-potion-slot is-filled slot-pos-${idx}`}
                                        style={token.type === 'num' ? getSlotBoxStyle(token.color) : undefined}
                                        onClick={() => removeSlotToken(idx)}
                                    >
                                        {token.value}
                                    </button>
                                ))}
                            </div>
                            {judgeState !== 'idle' && (
                                <div className={`magic-potion-judge-badge is-${judgeState}`}>
                                    {judgeState === 'correct' ? '✓' : '✕'}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section className="magic-potion-bottom">
                    {showOptionsHint && (
                        <div className="options-hint-overlay" aria-hidden="true">
                            <span className="options-hint-text">{t('games.math-magic-potion.ui.dragHint')}</span>
                        </div>
                    )}
                    <div className="magic-potion-inventory-grid">
                        {(round?.tokens ?? []).map((token) => (
                            <button
                                key={token.id}
                                type="button"
                                className={`magic-potion-token ${token.type === 'op' ? 'is-op' : ''} ${
                                    usedTokenIds.has(token.id) ? 'is-used' : ''
                                }`}
                                style={token.type === 'num' ? getTokenBoxStyle(token.color) : undefined}
                                onPointerDown={(event) => handleTokenPointerDown(event, token)}
                                onTouchStart={(event) => handleTokenTouchStart(event, token)}
                            >
                                {token.value}
                            </button>
                        ))}
                    </div>
                </section>

                {draggingToken && dragPos && (
                    <div
                        className="magic-potion-drag-ghost"
                        style={{
                            left: `${dragPos.x}px`,
                            top: `${dragPos.y}px`,
                            ...(draggingToken.type === 'num' ? getTokenBoxStyle(draggingToken.color) : null),
                        }}
                    >
                        {draggingToken.value}
                    </div>
                )}
            </div>
        </Layout2>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const manifest: GameManifest = {
    id: GameIds.MATH_MAGIC_POTION,
    title: '마법물약',
    titleKey: 'games.math-magic-potion.title-lv1',
    subtitle: '마법 재료 섞기!',
    subtitleKey: 'games.math-magic-potion.subtitle',
    description: 'ㅇㅇㅇ',
    descriptionKey: 'games.math-magic-potion.description',
    category: 'math',
    level: 2,
    mode: 'adventure',
    component: MagicPotion,
    thumbnail: '⚗️',
    tagsKey: 'games.tags.addition',
};

export default MagicPotion;
