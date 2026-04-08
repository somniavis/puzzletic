import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent, type MutableRefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout2 } from '../../../layouts/Standard/Layout2';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';
import { BlobBackground } from '../../../math/components/BlobBackground';
import { GameIds } from '../../../../constants/gameIds';
import type { GameManifest } from '../../../types';
import redAppleAsset from './assets/twemoji-red-apple.svg?raw';
import greenAppleAsset from './assets/twemoji-green-apple.svg?raw';
import orangeAsset from './assets/twemoji-orange.svg?raw';
import bananaAsset from './assets/twemoji-banana.svg?raw';
import grapesAsset from './assets/twemoji-grapes.svg?raw';
import strawberryAsset from './assets/twemoji-strawberry.svg?raw';
import peachAsset from './assets/twemoji-peach.svg?raw';
import melonAsset from './assets/twemoji-melon.svg?raw';
import manifest_en from './locales/en';
import manifest_en_UK from './locales/en-UK';
import manifest_es_ES from './locales/es-ES';
import manifest_fr_FR from './locales/fr-FR';
import manifest_id_ID from './locales/id-ID';
import manifest_ja from './locales/ja';
import manifest_ko from './locales/ko';
import manifest_pt_PT from './locales/pt-PT';
import manifest_vi_VN from './locales/vi-VN';
import styles from './ColorMix.module.css';
import { primeFeedbackSoundsSilently } from '../../../../utils/sound';

const GAME_ID = GameIds.COLOR_MIX;
const SUCCESS_THRESHOLD = 80;
const EMPTY_PALETTE_HEX = '#f8fafc';

type PaintId =
    | 'red'
    | 'yellow'
    | 'blue'
    | 'green'
    | 'orange'
    | 'purple'
    | 'pink'
    | 'sky'
    | 'lime'
    | 'brown'
    | 'black'
    | 'white';
type FruitType = 'apple' | 'orange' | 'banana' | 'grape' | 'strawberry' | 'peach' | 'melon';

interface PaintDefinition {
    id: PaintId;
    label: string;
    hex: string;
    strength: number;
    textColor: string;
}

interface FruitVariant {
    fruitType: FruitType;
    fruitLabel: string;
    targetHex: string;
    requiredPaints: readonly [PaintId, PaintId];
}

interface RoundDefinition extends FruitVariant {
    id: string;
    paints: readonly PaintId[];
}

interface MatchResult {
    percent: number;
    success: boolean;
}

interface BrushAnimationState {
    key: number;
    paintHex: string;
    mixedHex: string;
}

interface FruitDefinition {
    fruitType: FruitType;
    fruitLabel: string;
}

type TranslationBundle = {
    translation: {
        games: {
            'color-mix': unknown;
        };
    };
};

const PAINTS: Record<PaintId, PaintDefinition> = {
    red: { id: 'red', label: 'Red', hex: '#ef4444', strength: 1.08, textColor: '#ffffff' },
    yellow: { id: 'yellow', label: 'Yellow', hex: '#facc15', strength: 0.94, textColor: '#1f2937' },
    blue: { id: 'blue', label: 'Blue', hex: '#3b82f6', strength: 1.05, textColor: '#ffffff' },
    green: { id: 'green', label: 'Green', hex: '#22c55e', strength: 1.02, textColor: '#ffffff' },
    orange: { id: 'orange', label: 'Orange', hex: '#fb923c', strength: 1, textColor: '#ffffff' },
    purple: { id: 'purple', label: 'Purple', hex: '#8b5cf6', strength: 1.02, textColor: '#ffffff' },
    pink: { id: 'pink', label: 'Pink', hex: '#ec4899', strength: 0.98, textColor: '#ffffff' },
    sky: { id: 'sky', label: 'Sky', hex: '#38bdf8', strength: 0.95, textColor: '#ffffff' },
    lime: { id: 'lime', label: 'Lime', hex: '#84cc16', strength: 0.96, textColor: '#1f2937' },
    brown: { id: 'brown', label: 'Brown', hex: '#92400e', strength: 1.08, textColor: '#ffffff' },
    black: { id: 'black', label: 'Black', hex: '#0f172a', strength: 1.28, textColor: '#ffffff' },
    white: { id: 'white', label: 'White', hex: '#f8fafc', strength: 0.82, textColor: '#334155' },
};

const ALL_PAINT_IDS = Object.keys(PAINTS) as PaintId[];

const FRUITS: readonly FruitDefinition[] = [
    { fruitType: 'apple', fruitLabel: 'Apple' },
    { fruitType: 'orange', fruitLabel: 'Orange' },
    { fruitType: 'banana', fruitLabel: 'Banana' },
    { fruitType: 'grape', fruitLabel: 'Grape' },
    { fruitType: 'strawberry', fruitLabel: 'Strawberry' },
    { fruitType: 'peach', fruitLabel: 'Peach' },
    { fruitType: 'melon', fruitLabel: 'Melon' },
];

const LOCALE_MANIFESTS: Record<string, TranslationBundle> = {
    en: { translation: { games: { 'color-mix': manifest_en } } },
    'en-UK': { translation: { games: { 'color-mix': manifest_en_UK } } },
    'es-ES': { translation: { games: { 'color-mix': manifest_es_ES } } },
    'fr-FR': { translation: { games: { 'color-mix': manifest_fr_FR } } },
    'id-ID': { translation: { games: { 'color-mix': manifest_id_ID } } },
    ja: { translation: { games: { 'color-mix': manifest_ja } } },
    ko: { translation: { games: { 'color-mix': manifest_ko } } },
    'pt-PT': { translation: { games: { 'color-mix': manifest_pt_PT } } },
    'vi-VN': { translation: { games: { 'color-mix': manifest_vi_VN } } },
};

const randomItem = <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)];

const shuffleItems = <T,>(items: readonly T[]) => {
    const next = [...items];
    for (let index = next.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    }
    return next;
};

const buildPaintSet = (requiredPaints: readonly [PaintId, PaintId]) => {
    const fillers = shuffleItems(
        ALL_PAINT_IDS.filter((paintId) => !requiredPaints.includes(paintId))
    ).slice(0, 2);

    return shuffleItems([...requiredPaints, ...fillers]);
};

const getPaintCombinationKey = (paintIds: readonly [PaintId, PaintId]) => (
    [...paintIds].sort().join('-')
);

const createRoundId = (fruitLabel: string, targetHex: string, requiredPaints: readonly [PaintId, PaintId]) => (
    `${fruitLabel}-${targetHex}-${requiredPaints.join('-')}-${Math.random().toString(36).slice(2, 8)}`
);

const buildRoundCandidate = (): RoundDefinition => {
    const fruit = randomItem(FRUITS);
    const paints = shuffleItems(ALL_PAINT_IDS).slice(0, 4) as PaintId[];
    const requiredPaints = shuffleItems(paints).slice(0, 2) as [PaintId, PaintId];
    const targetHex = mixPaintsWeighted(requiredPaints);

    return {
        fruitType: fruit.fruitType,
        fruitLabel: fruit.fruitLabel,
        targetHex,
        requiredPaints,
        paints: buildPaintSet(requiredPaints),
        id: createRoundId(fruit.fruitLabel, targetHex, requiredPaints),
    };
};

const createRound = (previousCombinationKey?: string | null): RoundDefinition => {
    for (let attempts = 0; attempts < 12; attempts += 1) {
        const candidate = buildRoundCandidate();
        if (getPaintCombinationKey(candidate.requiredPaints) !== previousCombinationKey) {
            return candidate;
        }
    }

    return buildRoundCandidate();
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const hexToRgb = (hex: string) => {
    const normalized = hex.replace('#', '');
    const safeHex = normalized.length === 3
        ? normalized.split('').map((part) => `${part}${part}`).join('')
        : normalized;

    const int = Number.parseInt(safeHex, 16);
    return {
        r: (int >> 16) & 255,
        g: (int >> 8) & 255,
        b: int & 255,
    };
};

const rgbToHex = ({ r, g, b }: { r: number; g: number; b: number; }) => (
    `#${[r, g, b].map((value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0')).join('')}`
);

const mixHex = (baseHex: string, mixWithHex: string, amount: number) => {
    const safeAmount = clamp(amount, 0, 1);
    const base = hexToRgb(baseHex);
    const mixWith = hexToRgb(mixWithHex);
    return rgbToHex({
        r: base.r + (mixWith.r - base.r) * safeAmount,
        g: base.g + (mixWith.g - base.g) * safeAmount,
        b: base.b + (mixWith.b - base.b) * safeAmount,
    });
};

const toLinear = (channel: number) => {
    const normalized = channel / 255;
    return normalized <= 0.04045
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4);
};

const toSrgb = (channel: number) => {
    const safe = clamp(channel, 0, 1);
    const encoded = safe <= 0.0031308
        ? safe * 12.92
        : 1.055 * Math.pow(safe, 1 / 2.4) - 0.055;
    return clamp(Math.round(encoded * 255), 0, 255);
};

const hexToOklab = (hex: string) => {
    const { r, g, b } = hexToRgb(hex);
    const linearR = toLinear(r);
    const linearG = toLinear(g);
    const linearB = toLinear(b);

    const l = 0.4122214708 * linearR + 0.5363325363 * linearG + 0.0514459929 * linearB;
    const m = 0.2119034982 * linearR + 0.6806995451 * linearG + 0.1073969566 * linearB;
    const s = 0.0883024619 * linearR + 0.2817188376 * linearG + 0.6299787005 * linearB;

    const lRoot = Math.cbrt(l);
    const mRoot = Math.cbrt(m);
    const sRoot = Math.cbrt(s);

    return {
        l: 0.2104542553 * lRoot + 0.793617785 * mRoot - 0.0040720468 * sRoot,
        a: 1.9779984951 * lRoot - 2.428592205 * mRoot + 0.4505937099 * sRoot,
        b: 0.0259040371 * lRoot + 0.7827717662 * mRoot - 0.808675766 * sRoot,
    };
};

const mixPaintsWeighted = (paintIds: PaintId[]) => {
    if (paintIds.length === 0) {
        return '#f8fafc';
    }

    let totalWeight = 0;
    let r = 0;
    let g = 0;
    let b = 0;

    paintIds.forEach((paintId) => {
        const paint = PAINTS[paintId];
        const rgb = hexToRgb(paint.hex);
        const weight = paint.strength;

        totalWeight += weight;
        r += toLinear(rgb.r) * weight;
        g += toLinear(rgb.g) * weight;
        b += toLinear(rgb.b) * weight;
    });

    return rgbToHex({
        r: toSrgb(r / totalWeight),
        g: toSrgb(g / totalWeight),
        b: toSrgb(b / totalWeight),
    });
};

const calculateMatchPercent = (targetHex: string, mixedHex: string) => {
    const target = hexToOklab(targetHex);
    const mixed = hexToOklab(mixedHex);
    const distance = Math.sqrt(
        Math.pow(target.l - mixed.l, 2) +
        Math.pow(target.a - mixed.a, 2) +
        Math.pow(target.b - mixed.b, 2)
    );
    const maxDistance = 0.62;
    const normalizedDistance = clamp(distance / maxDistance, 0, 1);
    const curvedMatch = 1 - Math.pow(normalizedDistance, 0.74);
    const boostedMatch = curvedMatch * 0.86 + 0.14;
    return Math.round(clamp(boostedMatch * 100, 0, 100));
};

const replaceFillColors = (svg: string, replacements: Record<string, string>) => {
    return Object.entries(replacements).reduce((nextSvg, [from, to]) => (
        nextSvg.split(`fill="${from}"`).join(`fill="${to}"`)
    ), svg);
};

const FRUIT_MARKUP_CACHE = new Map<string, string>();

const getFruitSvgMarkup = (fruitType: FruitType, color: string) => {
    const cacheKey = `${fruitType}:${color}`;
    const cachedMarkup = FRUIT_MARKUP_CACHE.get(cacheKey);

    if (cachedMarkup) {
        return cachedMarkup;
    }

    const light = mixHex(color, '#ffffff', 0.14);
    const lighter = mixHex(color, '#ffffff', 0.24);
    const dark = mixHex(color, '#000000', 0.1);
    const darker = mixHex(color, '#000000', 0.18);

    let markup = '';

    if (fruitType === 'apple') {
        const { r, g, b } = hexToRgb(color);
        const template = g > r && g > b ? greenAppleAsset : redAppleAsset;
        markup = replaceFillColors(template, {
            '#DD2E44': color,
            '#77B255': dark,
            '#3E721D': darker,
        });
    } else if (fruitType === 'orange') {
        markup = replaceFillColors(orangeAsset, {
            '#F4900C': color,
            '#5C913B': dark,
        });
    } else if (fruitType === 'banana') {
        markup = replaceFillColors(bananaAsset, {
            '#FFE8B6': light,
            '#FFD983': color,
            '#FFCC4D': color,
        });
    } else if (fruitType === 'strawberry') {
        markup = replaceFillColors(strawberryAsset, {
            '#BE1931': color,
            '#F4ABBA': lighter,
            '#77B255': dark,
        });
    } else if (fruitType === 'peach') {
        markup = replaceFillColors(peachAsset, {
            '#FF886C': color,
            '#DD2E44': darker,
            '#77B255': dark,
        });
    } else if (fruitType === 'melon') {
        markup = replaceFillColors(melonAsset, {
            '#A6D388': color,
            '#77B255': color,
            '#5C913B': dark,
        });
    } else {
        markup = replaceFillColors(grapesAsset, {
            '#553788': darker,
            '#744EAA': dark,
            '#9266CC': color,
            '#AA8DD8': light,
        });
    }

    FRUIT_MARKUP_CACHE.set(cacheKey, markup);
    return markup;
};

const toSvgDataUrl = (markup: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;

const FruitSvg = ({ fruitType, color }: { fruitType: FruitType; color: string; }) => {
    const imageSrc = useMemo(
        () => toSvgDataUrl(getFruitSvgMarkup(fruitType, color)),
        [fruitType, color]
    );

    return (
        <div className={styles.fruitSvg} aria-hidden="true">
            <img
                src={imageSrc}
                alt=""
                className={styles.fruitSvgImage}
                draggable={false}
                loading="eager"
                decoding="sync"
            />
        </div>
    );
};

interface ColorMixProps {
    onExit?: () => void;
}

export default function ColorMix({ onExit }: ColorMixProps) {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const handleExit = onExit || (() => navigate(-1));

    useEffect(() => {
        Object.keys(LOCALE_MANIFESTS).forEach((lang) => {
            i18n.addResourceBundle(
                lang,
                'translation',
                LOCALE_MANIFESTS[lang].translation,
                true,
                true
            );
        });
    }, [i18n]);

    const engine = useGameEngine({
        initialTime: 90,
        initialLives: 3,
    });
    const { submitAnswer, registerEvent } = engine;

    const [round, setRound] = useState<RoundDefinition>(() => createRound());
    const previousCombinationKeyRef = useRef<string | null>(getPaintCombinationKey(round.requiredPaints));
    const [palettePaints, setPalettePaints] = useState<PaintId[]>([]);
    const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
    const [resolvedRoundId, setResolvedRoundId] = useState<string | null>(null);
    const [pressedPaintId, setPressedPaintId] = useState<PaintId | null>(null);
    const [brushAnimation, setBrushAnimation] = useState<BrushAnimationState | null>(null);
    const [displayedPaletteHex, setDisplayedPaletteHex] = useState('#f8fafc');
    const [isResolvingMatch, setIsResolvingMatch] = useState(false);
    const [showPaintHint, setShowPaintHint] = useState(false);
    const handledResolutionIdRef = useRef<string | null>(null);
    const feedbackTimerRef = useRef<number | null>(null);
    const transitionTimerRef = useRef<number | null>(null);
    const hasShownHintRef = useRef(false);
    const hintTimerRef = useRef<number | null>(null);
    const wasPlayingRef = useRef(false);
    const audioPrimedRef = useRef(false);

    const mixedHex = useMemo(() => mixPaintsWeighted(palettePaints), [palettePaints]);
    const hasPaintOnPalette = palettePaints.length > 0;
    const availablePaints = useMemo(() => round.paints.map((paintId) => PAINTS[paintId]), [round]);
    const isResultVisible = matchResult !== null;
    const isPlaying = engine.gameState === 'playing';
    const areControlsLocked = !isPlaying || isResolvingMatch || isResultVisible;
    const canCheckAnswer = isPlaying && palettePaints.length === 2 && !isResolvingMatch && !isResultVisible;

    const clearTimerRef = useCallback((timerRef: MutableRefObject<number | null>) => {
        if (timerRef.current !== null) {
            window.clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const clearResolutionTimers = useCallback(() => {
        clearTimerRef(feedbackTimerRef);
        clearTimerRef(transitionTimerRef);
    }, [clearTimerRef]);

    const clearFeedbackTimer = useCallback(() => {
        clearTimerRef(feedbackTimerRef);
    }, [clearTimerRef]);

    const resetRoundProgress = useCallback(() => {
        setPalettePaints([]);
        setMatchResult(null);
        setPressedPaintId(null);
        setBrushAnimation(null);
        setDisplayedPaletteHex(EMPTY_PALETTE_HEX);
        setResolvedRoundId(null);
        setIsResolvingMatch(false);
        handledResolutionIdRef.current = null;
    }, []);

    useEffect(() => {
        if (!pressedPaintId) return undefined;
        const timeoutId = window.setTimeout(() => setPressedPaintId(null), 170);
        return () => window.clearTimeout(timeoutId);
    }, [pressedPaintId]);

    useEffect(() => {
        if (!brushAnimation) return undefined;
        const timeoutId = window.setTimeout(() => setBrushAnimation(null), 700);
        return () => window.clearTimeout(timeoutId);
    }, [brushAnimation]);

    useEffect(() => {
        if (!brushAnimation) return undefined;
        const timeoutId = window.setTimeout(() => {
            setDisplayedPaletteHex(brushAnimation.mixedHex);
        }, 180);
        return () => window.clearTimeout(timeoutId);
    }, [brushAnimation]);

    useEffect(() => () => {
        clearResolutionTimers();
    }, [clearResolutionTimers]);

    useEffect(() => {
        if (isPlaying && !wasPlayingRef.current) {
            hasShownHintRef.current = false;
            setShowPaintHint(false);
            clearTimerRef(hintTimerRef);
        }
        wasPlayingRef.current = isPlaying;
    }, [clearTimerRef, isPlaying]);

    useEffect(() => {
        if (!isPlaying || hasShownHintRef.current) return;

        const isFirstQuestion =
            engine.score === 0 &&
            engine.stats.correct === 0 &&
            engine.stats.wrong === 0;

        if (!isFirstQuestion) return;

        hasShownHintRef.current = true;
        setShowPaintHint(true);
        hintTimerRef.current = window.setTimeout(() => {
            setShowPaintHint(false);
            hintTimerRef.current = null;
        }, 1800);
    }, [engine.score, engine.stats.correct, engine.stats.wrong, isPlaying]);

    useEffect(() => {
        return () => {
            clearTimerRef(hintTimerRef);
        };
    }, [clearTimerRef]);

    const resetPalette = useCallback(() => {
        clearResolutionTimers();
        resetRoundProgress();
    }, [clearResolutionTimers, resetRoundProgress]);

    const primeAudioOnce = useCallback(() => {
        if (audioPrimedRef.current) return;
        audioPrimedRef.current = true;
        primeFeedbackSoundsSilently();
    }, []);

    const retryCurrentRound = useCallback(() => {
        clearResolutionTimers();
        resetRoundProgress();
    }, [clearResolutionTimers, resetRoundProgress]);

    const moveToNextRound = useCallback(() => {
        clearResolutionTimers();
        const nextRound = createRound(previousCombinationKeyRef.current);
        previousCombinationKeyRef.current = getPaintCombinationKey(nextRound.requiredPaints);
        setRound(nextRound);
        resetRoundProgress();
    }, [clearResolutionTimers, resetRoundProgress]);

    const handleAddPaint = useCallback((paintId: PaintId, event?: MouseEvent<HTMLButtonElement>) => {
        if (areControlsLocked) return;
        if (palettePaints.includes(paintId) || palettePaints.length >= 2) return;
        primeAudioOnce();
        event?.currentTarget.blur();
        const nextPaints = [...palettePaints, paintId];
        const nextMixedHex = mixPaintsWeighted(nextPaints);
        setPressedPaintId(paintId);
        setBrushAnimation({
            key: Date.now(),
            paintHex: PAINTS[paintId].hex,
            mixedHex: nextMixedHex,
        });
        setPalettePaints(nextPaints);
        setDisplayedPaletteHex(nextMixedHex);
        setMatchResult(null);
    }, [areControlsLocked, palettePaints, primeAudioOnce]);

    const handleCheck = useCallback(() => {
        if (!canCheckAnswer) return;

        const percent = calculateMatchPercent(round.targetHex, mixedHex);
        const success = percent >= SUCCESS_THRESHOLD;

        setMatchResult({ percent, success });
        setResolvedRoundId(round.id);
        setIsResolvingMatch(true);
    }, [canCheckAnswer, mixedHex, round.id, round.targetHex]);

    useEffect(() => {
        if ((engine.gameState === 'idle' || engine.gameState === 'gameover') && resolvedRoundId !== null) {
            moveToNextRound();
        }
    }, [engine.gameState, moveToNextRound, resolvedRoundId]);

    useEffect(() => {
        if (!matchResult || resolvedRoundId !== round.id || !isResolvingMatch) return undefined;
        if (handledResolutionIdRef.current === resolvedRoundId) return undefined;

        handledResolutionIdRef.current = resolvedRoundId;

        feedbackTimerRef.current = window.setTimeout(() => {
            if (matchResult.success) {
                submitAnswer(true, { skipFeedback: true });
                registerEvent({ type: 'correct', isFinal: true });

                transitionTimerRef.current = window.setTimeout(() => {
                    moveToNextRound();
                }, 1050);
                return;
            }

            submitAnswer(false, { skipFeedback: true });
            registerEvent({ type: 'wrong' });

            transitionTimerRef.current = window.setTimeout(() => {
                retryCurrentRound();
            }, 950);
        }, 650);

        return () => {
            clearFeedbackTimer();
        };
    }, [clearFeedbackTimer, isResolvingMatch, matchResult, moveToNextRound, registerEvent, resolvedRoundId, retryCurrentRound, round.id, submitAnswer]);

    const powerUps = useMemo(() => [
        {
            count: engine.powerUps.timeFreeze,
            icon: '❄️',
            color: 'blue' as const,
            onClick: () => engine.activatePowerUp('timeFreeze'),
            status: (engine.isTimeFrozen ? 'active' : 'normal') as 'active' | 'normal',
            title: t('games.color-mix.powerups.timeFreeze'),
            disabledConfig: engine.isTimeFrozen || engine.powerUps.timeFreeze <= 0
        },
        {
            count: engine.powerUps.extraLife,
            icon: '❤️',
            color: 'red' as const,
            onClick: () => engine.activatePowerUp('extraLife'),
            status: (engine.lives >= 3 ? 'maxed' : 'normal') as 'maxed' | 'normal',
            title: t('games.color-mix.powerups.extraLife'),
            disabledConfig: engine.lives >= 3 || engine.powerUps.extraLife <= 0
        },
        {
            count: engine.powerUps.doubleScore,
            icon: '⚡',
            color: 'yellow' as const,
            onClick: () => engine.activatePowerUp('doubleScore'),
            status: (engine.isDoubleScore ? 'active' : 'normal') as 'active' | 'normal',
            title: t('games.color-mix.powerups.doubleScore'),
            disabledConfig: engine.isDoubleScore || engine.powerUps.doubleScore <= 0
        }
    ], [
        engine.isDoubleScore,
        engine.isTimeFrozen,
        engine.lives,
        engine.powerUps.doubleScore,
        engine.powerUps.extraLife,
        engine.powerUps.timeFreeze,
        t,
    ]);

    return (
        <Layout2
            title={t('games.color-mix.title')}
            subtitle={t('games.color-mix.subtitle')}
            gameId={GAME_ID}
            engine={engine}
            powerUps={powerUps}
            onExit={handleExit}
            cardBackground={<BlobBackground colors={{
                blob1: '#f59e0b',
                blob2: '#fb923c',
                blob3: '#ea580c',
                blob4: '#c2410c'
            }} />}
            instructions={[
                {
                    icon: '🍎',
                    title: t('games.color-mix.howToPlay.step1.title'),
                    description: t('games.color-mix.howToPlay.step1.description')
                },
                {
                    icon: '🎨',
                    title: t('games.color-mix.howToPlay.step2.title'),
                    description: t('games.color-mix.howToPlay.step2.description')
                },
                {
                    icon: '✅',
                    title: t('games.color-mix.howToPlay.step3.title'),
                    description: t('games.color-mix.howToPlay.step3.description')
                }
            ]}
            className={styles.colorMixLayout}
        >
            <div className={styles.colorMixGame}>
                <section className={`${styles.zone} ${styles.targetZone}`}>
                    <div className={`${styles.targetCard} ${isResultVisible ? styles.targetCardResolved : ''}`}>
                        <div className={`${styles.fruitStage} ${isResultVisible ? styles.fruitStageResolved : ''}`}>
                            <FruitSvg fruitType={round.fruitType} color={round.targetHex} />
                        </div>
                        {matchResult ? (
                            <div
                                className={`${styles.matchReveal} ${matchResult.success ? styles.matchRevealSuccess : styles.matchRevealFail}`}
                            >
                                <span className={styles.matchRevealLabel}>Match</span>
                                <strong className={styles.matchRevealValue}>{matchResult.percent}%</strong>
                                <span className={styles.matchRevealFeedback} aria-hidden="true">
                                    {matchResult.success ? '✨' : '💥'}
                                </span>
                            </div>
                        ) : null}
                    </div>
                </section>

                <section className={styles.paletteZone}>
                    <div className={styles.paletteHeaderMinimal}>
                        <div className={styles.paletteShell}>
                            <div className={styles.paletteWell}>
                                <span className={styles.paletteBase} aria-hidden="true" />
                                <span className={styles.paletteThumbHole} aria-hidden="true" />
                                <span
                                    className={styles.paletteAppliedPaint}
                                    style={{
                                        backgroundColor: displayedPaletteHex,
                                        opacity: hasPaintOnPalette ? 1 : 0,
                                    }}
                                    aria-hidden="true"
                                />
                                {brushAnimation ? (
                                    <span
                                        key={`brush-${brushAnimation.key}`}
                                        className={styles.paletteBrushOverlay}
                                        aria-hidden="true"
                                    >
                                        🖌️
                                    </span>
                                ) : null}
                                <div
                                    className={styles.palettePaintPool}
                                    style={{ backgroundColor: hasPaintOnPalette ? 'rgba(255, 255, 255, 0.22)' : '#fff7ed' }}
                                >
                                    {brushAnimation ? (
                                        <>
                                            <span
                                                key={brushAnimation.key}
                                                className={styles.palettePaintStroke}
                                                style={{ backgroundColor: brushAnimation.paintHex }}
                                            />
                                            <span
                                                key={`brush-${brushAnimation.key}`}
                                                className={styles.paletteBrushSweep}
                                                aria-hidden="true"
                                            >
                                                🖌️
                                            </span>
                                        </>
                                    ) : null}
                                    <span className={styles.palettePaintHighlight} aria-hidden="true" />
                                </div>
                            </div>
                        </div>
                        <div className={styles.paletteActionPanel}>
                            <div className={styles.paletteActions}>
                                <button
                                    type="button"
                                    className={`${styles.actionButton} ${styles.resetButton}`}
                                    onClick={resetPalette}
                                    disabled={!canCheckAnswer}
                                    aria-label="Reset"
                                >
                                    ↺
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.actionButton} ${styles.checkButton}`}
                                    onClick={handleCheck}
                                    disabled={!canCheckAnswer}
                                    aria-label="Check"
                                >
                                    ✓
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className={`${styles.zone} ${styles.paintZone}`}>
                    <div className={styles.paintBox}>
                        {showPaintHint && (
                            <div className={styles.paintHintOverlay} aria-hidden="true">
                                <span className={styles.paintHintText}>{t('games.color-mix.ui.selectTwoColorsHint')}</span>
                            </div>
                        )}
                        {availablePaints.map((paint) => (
                                <button
                                    key={paint.id}
                                    type="button"
                                    className={`${styles.paintButton} ${pressedPaintId === paint.id ? styles.paintButtonPressed : ''}`}
                                    onClick={(event) => handleAddPaint(paint.id, event)}
                                    disabled={areControlsLocked}
                                    style={{
                                    ['--paint-fill' as string]: paint.hex,
                                    color: paint.textColor
                                }}
                                aria-label={paint.label}
                            >
                                <span className={styles.paintButtonCore} />
                            </button>
                        ))}
                    </div>
                </section>
            </div>
        </Layout2>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export const manifest: GameManifest = {
    id: GameIds.COLOR_MIX,
    title: 'Paint Mix',
    titleKey: 'games.color-mix.title',
    subtitle: 'Blend the colors!',
    subtitleKey: 'games.color-mix.subtitle',
    category: 'brain',
    level: 2,
    component: ColorMix,
    description: 'Mix paint colors to match each fruit target.',
    descriptionKey: 'games.color-mix.description',
    thumbnail: '🎨'
} as const;
