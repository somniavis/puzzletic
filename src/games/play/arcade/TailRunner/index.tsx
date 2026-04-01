import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNurturing } from '../../../../contexts/NurturingContext';
import i18nCore from '../../../../i18n/config';
import { createCharacter } from '../../../../data/characters';
import type { EvolutionStage } from '../../../../types/character';
import type { GameComponentProps } from '../../../types';
import { JelloAvatar } from '../../../../components/characters/JelloAvatar';
import { playClearSound, playEatingSound } from '../../../../utils/sound';
import {
    TAIL_RUNNER_BASE_SPEED,
    TAIL_RUNNER_BOOST_SPAWN_MAX_TIME,
    TAIL_RUNNER_BOOST_SPAWN_MIN_TIME,
    TAIL_RUNNER_BOOST_SPEED,
    TAIL_RUNNER_BARRIER_LENGTHS,
    TAIL_RUNNER_BARRIER_THICKNESS,
    TAIL_RUNNER_BURST_LIFE,
    TAIL_RUNNER_GEM_COLORS,
    TAIL_RUNNER_GEM_SCORES,
    TAIL_RUNNER_DEFAULT_TAIL_EMOJI,
    TAIL_RUNNER_ENEMY_MAX_TAIL_COUNT,
    TAIL_RUNNER_ENEMY_MIN_TAIL_COUNT,
    TAIL_RUNNER_ENEMY_PER_STEP,
    TAIL_RUNNER_ENEMY_RADIUS,
    TAIL_RUNNER_ENEMY_SCORE_STEP,
    TAIL_RUNNER_ENEMY_SPEED,
    TAIL_RUNNER_ENTITY_RESPAWN_PADDING,
    TAIL_RUNNER_FIRST_TAIL_SPACING,
    TAIL_RUNNER_FOOD_EMOJIS,
    TAIL_RUNNER_FOOD_SCORE,
    TAIL_RUNNER_FOOD_SCORE_STEP,
    TAIL_RUNNER_GRID_SIZE,
    TAIL_RUNNER_HISTORY_LIMIT,
    TAIL_RUNNER_INITIAL_COIN_COUNT,
    TAIL_RUNNER_INITIAL_BARRIER_COUNT,
    TAIL_RUNNER_INITIAL_ENEMY_COUNT,
    TAIL_RUNNER_INITIAL_FOOD_COUNT,
    TAIL_RUNNER_INITIAL_OBSTACLE_COUNT,
    TAIL_RUNNER_INITIAL_TYRANNO_COUNT,
    TAIL_RUNNER_MAX_EXTRA_BARRIER,
    TAIL_RUNNER_MAX_EXTRA_COIN,
    TAIL_RUNNER_MAX_EXTRA_ENEMY,
    TAIL_RUNNER_MAX_EXTRA_FOOD,
    TAIL_RUNNER_MAX_EXTRA_OBSTACLE,
    TAIL_RUNNER_MAX_EXTRA_TYRANNO,
    TAIL_RUNNER_MAX_SHIELD_CHARGES,
    TAIL_RUNNER_MAGNET_DURATION,
    TAIL_RUNNER_MAGNET_PULL_SPEED,
    TAIL_RUNNER_MAGNET_RADIUS,
    TAIL_RUNNER_MAGNET_SPAWN_MAX_TIME,
    TAIL_RUNNER_MAGNET_SPAWN_MIN_TIME,
    TAIL_RUNNER_OBSTACLE_EMOJIS,
    TAIL_RUNNER_OBSTACLE_PENALTY,
    TAIL_RUNNER_OBSTACLE_SCORE_STEP,
    TAIL_RUNNER_PLAYER_RADIUS,
    TAIL_RUNNER_SHIELD_DURATION,
    TAIL_RUNNER_SHIELD_GEM_BONUS,
    TAIL_RUNNER_SHIELD_SPEED_MULTIPLIER,
    TAIL_RUNNER_TAIL_SPACING,
    TAIL_RUNNER_TYRANNO_ALERT_TIME,
    TAIL_RUNNER_TYRANNO_CHARGE_SPEED,
    TAIL_RUNNER_TYRANNO_CHARGE_TIME,
    TAIL_RUNNER_TYRANNO_COOLDOWN_TIME,
    TAIL_RUNNER_TYRANNO_DETECT_RADIUS,
    TAIL_RUNNER_TYRANNO_RADIUS,
    TAIL_RUNNER_TYRANNO_ROAM_SPEED,
    TAIL_RUNNER_TYRANNO_SCORE_STEP,
    TAIL_RUNNER_TURN_SPEED,
    TAIL_RUNNER_WORLD_SIZE,
    TAIL_RUNNER_BARRIER_SCORE_STEP,
    TAIL_RUNNER_COIN_SCORE_STEP,
    createInitialTailRunnerState,
} from './constants';
import type { TailRunnerBarrier, TailRunnerBurst, TailRunnerEnemySnake, TailRunnerEntity, TailRunnerEntityType, TailRunnerGemTier, TailRunnerTyrannoEnemy } from './types';
import './TailRunner.css';
import manifestEn from './locales/en';
import manifestEnUk from './locales/en-UK';
import manifestEsEs from './locales/es-ES';
import manifestFrFr from './locales/fr-FR';
import manifestIdId from './locales/id-ID';
import manifestJa from './locales/ja';
import manifestKo from './locales/ko';
import manifestPtPt from './locales/pt-PT';
import manifestViVn from './locales/vi-VN';

const TAIL_RUNNER_HUD_SYNC_INTERVAL_MS = 100;
const TAIL_RUNNER_MAX_RENDER_PIXEL_RATIO = 2;
const TAIL_RUNNER_POWERUP_VISUAL_GUARD_FRAMES = 8;

const TAIL_RUNNER_LOCALE_BUNDLES = {
    en: { translation: { games: { 'play-jello-comet': manifestEn } } },
    'en-UK': { translation: { games: { 'play-jello-comet': manifestEnUk } } },
    'es-ES': { translation: { games: { 'play-jello-comet': manifestEsEs } } },
    'fr-FR': { translation: { games: { 'play-jello-comet': manifestFrFr } } },
    'id-ID': { translation: { games: { 'play-jello-comet': manifestIdId } } },
    ja: { translation: { games: { 'play-jello-comet': manifestJa } } },
    ko: { translation: { games: { 'play-jello-comet': manifestKo } } },
    'pt-PT': { translation: { games: { 'play-jello-comet': manifestPtPt } } },
    'vi-VN': { translation: { games: { 'play-jello-comet': manifestViVn } } },
} as const;

Object.keys(TAIL_RUNNER_LOCALE_BUNDLES).forEach((lang) => {
    i18nCore.addResourceBundle(
        lang,
        'translation',
        TAIL_RUNNER_LOCALE_BUNDLES[lang as keyof typeof TAIL_RUNNER_LOCALE_BUNDLES].translation,
        true,
        true
    );
});

const TAIL_RUNNER_LOCALE_MANIFESTS = {
    en: manifestEn,
    'en-UK': manifestEnUk,
    'es-ES': manifestEsEs,
    'fr-FR': manifestFrFr,
    'id-ID': manifestIdId,
    ja: manifestJa,
    ko: manifestKo,
    'pt-PT': manifestPtPt,
    'vi-VN': manifestViVn,
} as const;

const resolveTailRunnerLocale = (language?: string): keyof typeof TAIL_RUNNER_LOCALE_MANIFESTS => {
    if (!language) return 'en';
    if (language === 'en-UK' || language === 'es-ES' || language === 'fr-FR' || language === 'id-ID' || language === 'pt-PT' || language === 'vi-VN') {
        return language;
    }
    if (language.startsWith('ko')) return 'ko';
    if (language.startsWith('ja')) return 'ja';
    if (language.startsWith('es')) return 'es-ES';
    if (language.startsWith('fr')) return 'fr-FR';
    if (language.startsWith('id')) return 'id-ID';
    if (language.startsWith('pt')) return 'pt-PT';
    if (language.startsWith('vi')) return 'vi-VN';
    if (language.startsWith('en-GB')) return 'en-UK';
    return 'en';
};

const getTailRunnerLocaleValue = (manifest: Record<string, unknown>, key: string): unknown => (
    key.split('.').reduce<unknown>((accumulator, part) => {
        if (!accumulator || typeof accumulator !== 'object') return undefined;
        return (accumulator as Record<string, unknown>)[part];
    }, manifest)
);

const formatTailRunnerLocaleString = (
    template: string,
    values?: Record<string, string | number>
) => {
    if (!values) return template;
    return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => String(values[key] ?? ''));
};

type TailRunnerHudState = {
    score: number;
    speed: number;
    tailLength: number;
    bestTail: number;
    positionX: number;
    positionY: number;
    highScore: number;
    shieldCharges: number;
    shieldActive: boolean;
    shieldWarning: boolean;
    magnetActive: boolean;
};

type TailRunnerScoreBurst = {
    id: number;
    label: string;
};

type TailRunnerGameOverHighlights = {
    score: boolean;
    tail: boolean;
};

type TailRunnerEmojiSprite = {
    canvas: HTMLCanvasElement;
    size: number;
};

type TailRunnerDifficultyTargets = {
    food: number;
    coin: number;
    obstacle: number;
    barrier: number;
    enemy: number;
    tyranno: number;
};

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

const createEntity = (
    type: TailRunnerEntityType,
    x: number,
    y: number,
    emoji: string,
    radius: number,
    facing: -1 | 1 = 1
): TailRunnerEntity => ({
    id: `${type}-${Math.random().toString(36).slice(2, 10)}`,
    x,
    y,
    type,
    emoji,
    radius,
    facing,
});

const pickRandom = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];
const GEM_TIER_WEIGHTS: Array<{ tier: TailRunnerGemTier; weight: number }> = [
    { tier: 'diamond', weight: 0.18 },
    { tier: 'gold', weight: 0.34 },
    { tier: 'berry', weight: 0.48 },
];

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const randomIntBetween = (min: number, max: number) => Math.floor(randomBetween(min, max + 1));
const rollNextBoostSpawnTimer = () => randomBetween(TAIL_RUNNER_BOOST_SPAWN_MIN_TIME, TAIL_RUNNER_BOOST_SPAWN_MAX_TIME);
const rollNextMagnetSpawnTimer = () => randomBetween(TAIL_RUNNER_MAGNET_SPAWN_MIN_TIME, TAIL_RUNNER_MAGNET_SPAWN_MAX_TIME);
const tailRunnerEmojiSpriteCache = new Map<string, TailRunnerEmojiSprite>();
let tailRunnerOuterPatternCache: CanvasPattern | null = null;

const getTailRunnerRenderPixelRatio = () => {
    if (typeof window === 'undefined') return 1;
    return Math.min(TAIL_RUNNER_MAX_RENDER_PIXEL_RATIO, Math.max(1, window.devicePixelRatio || 1));
};

const getTailRunnerEmojiSprite = (
    emoji: string,
    fontSize: number,
    facing: -1 | 1 = 1
): TailRunnerEmojiSprite | null => {
    if (typeof document === 'undefined' || typeof window === 'undefined') return null;

    const key = `${emoji}:${fontSize}:${facing}`;
    const cached = tailRunnerEmojiSpriteCache.get(key);
    if (cached) return cached;

    const size = Math.ceil(fontSize * 1.7);
    const pixelRatio = getTailRunnerRenderPixelRatio();
    const canvas = document.createElement('canvas');
    canvas.width = size * pixelRatio;
    canvas.height = size * pixelRatio;

    const spriteContext = canvas.getContext('2d');
    if (!spriteContext) return null;

    spriteContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    spriteContext.clearRect(0, 0, size, size);
    spriteContext.font = `${fontSize}px system-ui, Apple Color Emoji, Segoe UI Emoji, sans-serif`;
    spriteContext.textAlign = 'center';
    spriteContext.textBaseline = 'middle';

    spriteContext.save();
    spriteContext.translate(size / 2, size / 2);
    if (facing === -1) {
        spriteContext.scale(-1, 1);
    }
    spriteContext.fillText(emoji, 0, 0);
    spriteContext.restore();

    const sprite = { canvas, size };
    tailRunnerEmojiSpriteCache.set(key, sprite);
    return sprite;
};

const drawTailRunnerEmojiSprite = (
    context: CanvasRenderingContext2D,
    emoji: string,
    x: number,
    y: number,
    fontSize: number,
    facing: -1 | 1 = 1
) => {
    const sprite = getTailRunnerEmojiSprite(emoji, fontSize, facing);
    if (!sprite) {
        context.save();
        context.font = `${fontSize}px system-ui, Apple Color Emoji, Segoe UI Emoji, sans-serif`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.translate(x, y);
        if (facing === -1) {
            context.scale(-1, 1);
        }
        context.fillText(emoji, 0, 0);
        context.restore();
        return;
    }

    context.drawImage(
        sprite.canvas,
        Math.round(x - sprite.size / 2),
        Math.round(y - sprite.size / 2),
        sprite.size,
        sprite.size
    );
};

const getTailRunnerOuterPattern = (context: CanvasRenderingContext2D) => {
    if (tailRunnerOuterPatternCache) return tailRunnerOuterPatternCache;
    if (typeof document === 'undefined' || typeof window === 'undefined') return null;

    const tile = document.createElement('canvas');
    const size = 168;
    const pixelRatio = getTailRunnerRenderPixelRatio();
    tile.width = size * pixelRatio;
    tile.height = size * pixelRatio;

    const tileContext = tile.getContext('2d');
    if (!tileContext) return null;

    tileContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    tileContext.clearRect(0, 0, size, size);
    tileContext.fillStyle = '#5f8a4f';
    tileContext.fillRect(0, 0, size, size);

    const bubbles = [
        { x: 24, y: 22, r: 16, fill: 'rgba(212, 240, 200, 0.10)', shine: 'rgba(243, 255, 236, 0.08)' },
        { x: 92, y: 34, r: 26, fill: 'rgba(71, 109, 56, 0.18)', shine: 'rgba(243, 255, 236, 0.06)' },
        { x: 136, y: 78, r: 18, fill: 'rgba(212, 240, 200, 0.10)', shine: 'rgba(243, 255, 236, 0.08)' },
        { x: 52, y: 102, r: 28, fill: 'rgba(71, 109, 56, 0.18)', shine: 'rgba(243, 255, 236, 0.06)' },
        { x: 118, y: 136, r: 20, fill: 'rgba(212, 240, 200, 0.10)', shine: 'rgba(243, 255, 236, 0.08)' },
        { x: 24, y: 146, r: 12, fill: 'rgba(71, 109, 56, 0.18)', shine: 'rgba(243, 255, 236, 0.06)' },
    ];

    bubbles.forEach(({ x, y, r, fill, shine }) => {
        tileContext.beginPath();
        tileContext.fillStyle = fill;
        tileContext.arc(x, y, r, 0, Math.PI * 2);
        tileContext.fill();

        tileContext.beginPath();
        tileContext.fillStyle = shine;
        tileContext.arc(x - r * 0.22, y - r * 0.26, Math.max(4, r * 0.28), 0, Math.PI * 2);
        tileContext.fill();
    });

    tailRunnerOuterPatternCache = context.createPattern(tile, 'repeat');
    return tailRunnerOuterPatternCache;
};

const getTailRunnerHistoryOffset = (index: number) => TAIL_RUNNER_FIRST_TAIL_SPACING + (index * TAIL_RUNNER_TAIL_SPACING);

const getTailRunnerHistoryPoint = (
    history: Array<{ x: number; y: number }>,
    offset: number,
    fallback: { x: number; y: number }
) => {
    if (history.length === 0) return fallback;

    const lowerIndex = Math.floor(offset);
    const upperIndex = Math.min(history.length - 1, lowerIndex + 1);
    const lowerPoint = history[Math.min(history.length - 1, lowerIndex)] || fallback;
    const upperPoint = history[upperIndex] || lowerPoint;
    const mix = clamp(offset - lowerIndex, 0, 1);

    return {
        x: lowerPoint.x + (upperPoint.x - lowerPoint.x) * mix,
        y: lowerPoint.y + (upperPoint.y - lowerPoint.y) * mix,
    };
};

const smoothTailRunnerPoint = (
    current: { x: number; y: number },
    target: { x: number; y: number },
    factor: number
) => ({
    x: current.x + (target.x - current.x) * factor,
    y: current.y + (target.y - current.y) * factor,
});

const pickGemTier = (): TailRunnerGemTier => {
    const roll = Math.random();
    let cumulative = 0;
    for (const option of GEM_TIER_WEIGHTS) {
        cumulative += option.weight;
        if (roll <= cumulative) {
            return option.tier;
        }
    }
    return 'berry';
};

const createBarrier = (
    avoidX?: number,
    avoidY?: number
): TailRunnerBarrier => {
    const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
    const length = pickRandom(TAIL_RUNNER_BARRIER_LENGTHS);
    const width = orientation === 'horizontal' ? length : TAIL_RUNNER_BARRIER_THICKNESS;
    const height = orientation === 'horizontal' ? TAIL_RUNNER_BARRIER_THICKNESS : length;

    let x = randomBetween(TAIL_RUNNER_ENTITY_RESPAWN_PADDING, TAIL_RUNNER_WORLD_SIZE - TAIL_RUNNER_ENTITY_RESPAWN_PADDING - width);
    let y = randomBetween(TAIL_RUNNER_ENTITY_RESPAWN_PADDING, TAIL_RUNNER_WORLD_SIZE - TAIL_RUNNER_ENTITY_RESPAWN_PADDING - height);

    if (typeof avoidX === 'number' && typeof avoidY === 'number') {
        let attempts = 0;
        while (
            avoidX > x - 120
            && avoidX < x + width + 120
            && avoidY > y - 120
            && avoidY < y + height + 120
            && attempts < 12
        ) {
            x = randomBetween(TAIL_RUNNER_ENTITY_RESPAWN_PADDING, TAIL_RUNNER_WORLD_SIZE - TAIL_RUNNER_ENTITY_RESPAWN_PADDING - width);
            y = randomBetween(TAIL_RUNNER_ENTITY_RESPAWN_PADDING, TAIL_RUNNER_WORLD_SIZE - TAIL_RUNNER_ENTITY_RESPAWN_PADDING - height);
            attempts += 1;
        }
    }

    return {
        id: `barrier-${Math.random().toString(36).slice(2, 10)}`,
        x,
        y,
        width,
        height,
        orientation,
    };
};

const collidesWithBarrier = (playerX: number, playerY: number, radius: number, barrier: TailRunnerBarrier) => {
    const closestX = clamp(playerX, barrier.x, barrier.x + barrier.width);
    const closestY = clamp(playerY, barrier.y, barrier.y + barrier.height);
    return Math.hypot(playerX - closestX, playerY - closestY) <= radius;
};

const createBurst = (x: number, y: number, emoji = '💥'): TailRunnerBurst => ({
    id: `burst-${Math.random().toString(36).slice(2, 10)}`,
    x,
    y,
    emoji,
    life: TAIL_RUNNER_BURST_LIFE,
    maxLife: TAIL_RUNNER_BURST_LIFE,
});

const createEnemySnake = (avoidX?: number, avoidY?: number): TailRunnerEnemySnake => {
    let x = randomBetween(TAIL_RUNNER_ENTITY_RESPAWN_PADDING, TAIL_RUNNER_WORLD_SIZE - TAIL_RUNNER_ENTITY_RESPAWN_PADDING);
    let y = randomBetween(TAIL_RUNNER_ENTITY_RESPAWN_PADDING, TAIL_RUNNER_WORLD_SIZE - TAIL_RUNNER_ENTITY_RESPAWN_PADDING);

    if (typeof avoidX === 'number' && typeof avoidY === 'number') {
        let attempts = 0;
        while (Math.hypot(x - avoidX, y - avoidY) < 420 && attempts < 12) {
            x = randomBetween(TAIL_RUNNER_ENTITY_RESPAWN_PADDING, TAIL_RUNNER_WORLD_SIZE - TAIL_RUNNER_ENTITY_RESPAWN_PADDING);
            y = randomBetween(TAIL_RUNNER_ENTITY_RESPAWN_PADDING, TAIL_RUNNER_WORLD_SIZE - TAIL_RUNNER_ENTITY_RESPAWN_PADDING);
            attempts += 1;
        }
    }

    const tailCount = randomIntBetween(TAIL_RUNNER_ENEMY_MIN_TAIL_COUNT, TAIL_RUNNER_ENEMY_MAX_TAIL_COUNT);
    const tail = Array.from({ length: tailCount }, () => ({
        x,
        y,
        emoji: '🪨',
        facing: 1 as const,
    }));

    return {
        id: `enemy-${Math.random().toString(36).slice(2, 10)}`,
        x,
        y,
        angle: randomBetween(0, Math.PI * 2),
        speed: TAIL_RUNNER_ENEMY_SPEED * randomBetween(0.92, 1.12),
        turnDrift: randomBetween(-0.018, 0.018),
        tail,
        history: [],
    };
};

const createTyrannoEnemy = (avoidX?: number, avoidY?: number): TailRunnerTyrannoEnemy => {
    let x = randomBetween(TAIL_RUNNER_ENTITY_RESPAWN_PADDING, TAIL_RUNNER_WORLD_SIZE - TAIL_RUNNER_ENTITY_RESPAWN_PADDING);
    let y = randomBetween(TAIL_RUNNER_ENTITY_RESPAWN_PADDING, TAIL_RUNNER_WORLD_SIZE - TAIL_RUNNER_ENTITY_RESPAWN_PADDING);

    if (typeof avoidX === 'number' && typeof avoidY === 'number') {
        let attempts = 0;
        while (Math.hypot(x - avoidX, y - avoidY) < 460 && attempts < 14) {
            x = randomBetween(TAIL_RUNNER_ENTITY_RESPAWN_PADDING, TAIL_RUNNER_WORLD_SIZE - TAIL_RUNNER_ENTITY_RESPAWN_PADDING);
            y = randomBetween(TAIL_RUNNER_ENTITY_RESPAWN_PADDING, TAIL_RUNNER_WORLD_SIZE - TAIL_RUNNER_ENTITY_RESPAWN_PADDING);
            attempts += 1;
        }
    }

    const angle = randomBetween(0, Math.PI * 2);
    return {
        id: `tyranno-${Math.random().toString(36).slice(2, 10)}`,
        x,
        y,
        angle,
        facing: Math.cos(angle) < 0 ? -1 : 1,
        phase: 'roam',
        timer: randomBetween(24, 72),
        targetAngle: angle,
        turnDrift: randomBetween(-0.02, 0.02),
    };
};

const createRandomEntity = (
    type: TailRunnerEntityType,
    avoidX?: number,
    avoidY?: number
): TailRunnerEntity => {
    let x = randomBetween(TAIL_RUNNER_ENTITY_RESPAWN_PADDING, TAIL_RUNNER_WORLD_SIZE - TAIL_RUNNER_ENTITY_RESPAWN_PADDING);
    let y = randomBetween(TAIL_RUNNER_ENTITY_RESPAWN_PADDING, TAIL_RUNNER_WORLD_SIZE - TAIL_RUNNER_ENTITY_RESPAWN_PADDING);

    if (typeof avoidX === 'number' && typeof avoidY === 'number') {
        let attempts = 0;
        while (Math.hypot(x - avoidX, y - avoidY) < 220 && attempts < 10) {
            x = randomBetween(TAIL_RUNNER_ENTITY_RESPAWN_PADDING, TAIL_RUNNER_WORLD_SIZE - TAIL_RUNNER_ENTITY_RESPAWN_PADDING);
            y = randomBetween(TAIL_RUNNER_ENTITY_RESPAWN_PADDING, TAIL_RUNNER_WORLD_SIZE - TAIL_RUNNER_ENTITY_RESPAWN_PADDING);
            attempts += 1;
        }
    }

    if (type === 'food') {
        return createEntity(type, x, y, pickRandom(TAIL_RUNNER_FOOD_EMOJIS), 20, Math.random() < 0.5 ? -1 : 1);
    }
    if (type === 'coin') {
        const coinTier = pickGemTier();
        return {
            ...createEntity(type, x, y, '', 18),
            coinTier,
            scoreValue: TAIL_RUNNER_GEM_SCORES[coinTier],
        };
    }
    if (type === 'boost') {
        return createEntity(type, x, y, '⚡', 18);
    }
    if (type === 'magnet') {
        return createEntity(type, x, y, '🧲', 20);
    }
    return createEntity(type, x, y, pickRandom(TAIL_RUNNER_OBSTACLE_EMOJIS), 22);
};

const createInitialEntities = (playerX: number, playerY: number) => ([
    ...Array.from({ length: TAIL_RUNNER_INITIAL_FOOD_COUNT }, () => createRandomEntity('food', playerX, playerY)),
    ...Array.from({ length: TAIL_RUNNER_INITIAL_COIN_COUNT }, () => createRandomEntity('coin', playerX, playerY)),
    ...Array.from({ length: TAIL_RUNNER_INITIAL_OBSTACLE_COUNT }, () => createRandomEntity('obstacle', playerX, playerY)),
]);

const createInitialBarriers = (playerX: number, playerY: number) => (
    Array.from({ length: TAIL_RUNNER_INITIAL_BARRIER_COUNT }, () => createBarrier(playerX, playerY))
);

const createInitialEnemies = (playerX: number, playerY: number) => (
    Array.from({ length: TAIL_RUNNER_INITIAL_ENEMY_COUNT }, () => createEnemySnake(playerX, playerY))
);

const createInitialTyrannos = (playerX: number, playerY: number) => (
    Array.from({ length: TAIL_RUNNER_INITIAL_TYRANNO_COUNT }, () => createTyrannoEnemy(playerX, playerY))
);

const countTailRunnerEntities = (entities: TailRunnerEntity[]) => {
    const counts: Record<TailRunnerEntityType, number> = {
        food: 0,
        coin: 0,
        obstacle: 0,
        boost: 0,
        magnet: 0,
    };

    entities.forEach((entity) => {
        counts[entity.type] += 1;
    });

    return counts;
};

const trimEntitiesByType = (
    entities: TailRunnerEntity[],
    type: TailRunnerEntityType,
    keepCount: number
) => {
    let seen = 0;
    return entities.filter((entity) => {
        if (entity.type !== type) return true;
        seen += 1;
        return seen <= keepCount;
    });
};

const fillEntitiesToTarget = (
    entities: TailRunnerEntity[],
    type: Extract<TailRunnerEntityType, 'food' | 'coin' | 'obstacle'>,
    currentCount: number,
    targetCount: number,
    playerX: number,
    playerY: number
) => {
    for (let index = currentCount; index < targetCount; index += 1) {
        entities.push(createRandomEntity(type, playerX, playerY));
    }
};

const getDifficultyTargets = (score: number, shieldActive = false): TailRunnerDifficultyTargets => ({
    food:
        TAIL_RUNNER_INITIAL_FOOD_COUNT
        + Math.min(TAIL_RUNNER_MAX_EXTRA_FOOD, Math.floor(score / TAIL_RUNNER_FOOD_SCORE_STEP)),
    coin:
        TAIL_RUNNER_INITIAL_COIN_COUNT
        + Math.min(TAIL_RUNNER_MAX_EXTRA_COIN, Math.floor(score / TAIL_RUNNER_COIN_SCORE_STEP))
        + (shieldActive ? TAIL_RUNNER_SHIELD_GEM_BONUS : 0),
    obstacle:
        TAIL_RUNNER_INITIAL_OBSTACLE_COUNT
        + Math.min(TAIL_RUNNER_MAX_EXTRA_OBSTACLE, Math.floor(score / TAIL_RUNNER_OBSTACLE_SCORE_STEP)),
    barrier:
        TAIL_RUNNER_INITIAL_BARRIER_COUNT
        + Math.min(TAIL_RUNNER_MAX_EXTRA_BARRIER, Math.floor(score / TAIL_RUNNER_BARRIER_SCORE_STEP)),
    enemy:
        TAIL_RUNNER_INITIAL_ENEMY_COUNT
        + Math.min(
            TAIL_RUNNER_MAX_EXTRA_ENEMY,
            Math.floor(score / TAIL_RUNNER_ENEMY_SCORE_STEP) * TAIL_RUNNER_ENEMY_PER_STEP
        ),
    tyranno:
        TAIL_RUNNER_INITIAL_TYRANNO_COUNT
        + Math.min(TAIL_RUNNER_MAX_EXTRA_TYRANNO, Math.floor(score / TAIL_RUNNER_TYRANNO_SCORE_STEP)),
});

const reconcileDifficultyTargets = (state: ReturnType<typeof createInitialTailRunnerState>) => {
    const targets = getDifficultyTargets(state.score, state.shieldTimer > 0);

    state.entities = trimEntitiesByType(state.entities, 'coin', targets.coin);
    state.entities = trimEntitiesByType(state.entities, 'boost', 1);
    state.entities = trimEntitiesByType(state.entities, 'magnet', 1);

    const entityCounts = countTailRunnerEntities(state.entities);

    fillEntitiesToTarget(state.entities, 'food', entityCounts.food, targets.food, state.playerX, state.playerY);
    fillEntitiesToTarget(state.entities, 'coin', entityCounts.coin, targets.coin, state.playerX, state.playerY);
    fillEntitiesToTarget(state.entities, 'obstacle', entityCounts.obstacle, targets.obstacle, state.playerX, state.playerY);

    for (let index = state.barriers.length; index < targets.barrier; index += 1) {
        state.barriers.push(createBarrier(state.playerX, state.playerY));
    }
    for (let index = state.enemies.length; index < targets.enemy; index += 1) {
        state.enemies.push(createEnemySnake(state.playerX, state.playerY));
    }
    for (let index = state.tyrannos.length; index < targets.tyranno; index += 1) {
        state.tyrannos.push(createTyrannoEnemy(state.playerX, state.playerY));
    }
};

const buildHudState = (state: ReturnType<typeof createInitialTailRunnerState>): TailRunnerHudState => ({
    score: state.score,
    speed: state.playerSpeed,
    tailLength: state.tail.length,
    bestTail: state.bestTail,
    positionX: Math.round(state.playerX),
    positionY: Math.round(state.playerY),
    highScore: state.highScore,
    shieldCharges: state.shieldCharges,
    shieldActive: state.shieldTimer > 0,
    shieldWarning: state.shieldTimer > 0 && state.shieldTimer <= 120,
    magnetActive: state.magnetTimer > 0,
});

const updateEnemySnake = (enemy: TailRunnerEnemySnake, deltaMultiplier: number): TailRunnerEnemySnake => {
    let nextAngle = enemy.angle + enemy.turnDrift * deltaMultiplier;
    let nextTurnDrift = enemy.turnDrift;

    if (Math.random() < 0.015 * deltaMultiplier) {
        nextTurnDrift = randomBetween(-0.026, 0.026);
    }

    const projectedX = enemy.x + Math.cos(nextAngle) * enemy.speed * deltaMultiplier;
    const projectedY = enemy.y + Math.sin(nextAngle) * enemy.speed * deltaMultiplier;

    if (
        projectedX < TAIL_RUNNER_ENTITY_RESPAWN_PADDING
        || projectedY < TAIL_RUNNER_ENTITY_RESPAWN_PADDING
        || projectedX > TAIL_RUNNER_WORLD_SIZE - TAIL_RUNNER_ENTITY_RESPAWN_PADDING
        || projectedY > TAIL_RUNNER_WORLD_SIZE - TAIL_RUNNER_ENTITY_RESPAWN_PADDING
    ) {
        nextAngle += Math.PI * 0.72;
        nextTurnDrift *= -0.6;
    }

    const nextX = enemy.x + Math.cos(nextAngle) * enemy.speed * deltaMultiplier;
    const nextY = enemy.y + Math.sin(nextAngle) * enemy.speed * deltaMultiplier;
    const facing: -1 | 1 = Math.cos(nextAngle) < 0 ? -1 : 1;

    const history = [{ x: nextX, y: nextY }, ...enemy.history];
    history.length = Math.min(history.length, TAIL_RUNNER_HISTORY_LIMIT);

    return {
        ...enemy,
        x: nextX,
        y: nextY,
        angle: nextAngle,
        turnDrift: nextTurnDrift,
        history,
        tail: enemy.tail.map((segment, index) => {
            const point = getTailRunnerHistoryPoint(
                history,
                getTailRunnerHistoryOffset(index),
                { x: nextX, y: nextY }
            );
            const smoothedPoint = smoothTailRunnerPoint(
                segment,
                point,
                index === 0 ? 0.58 : 0.5
            );
            return {
                ...segment,
                x: smoothedPoint.x,
                y: smoothedPoint.y,
                facing,
            };
        }),
    };
};

const normalizeAngle = (angle: number) => {
    let nextAngle = angle;
    while (nextAngle > Math.PI) nextAngle -= Math.PI * 2;
    while (nextAngle < -Math.PI) nextAngle += Math.PI * 2;
    return nextAngle;
};

const updateTyrannoEnemy = (
    tyranno: TailRunnerTyrannoEnemy,
    playerX: number,
    playerY: number,
    deltaMultiplier: number
): TailRunnerTyrannoEnemy => {
    const dx = playerX - tyranno.x;
    const dy = playerY - tyranno.y;
    const distanceToPlayer = Math.hypot(dx, dy);
    const playerAngle = Math.atan2(dy, dx);

    let next = { ...tyranno, timer: tyranno.timer - deltaMultiplier };

    if (next.phase === 'roam') {
        if (Math.random() < 0.012 * deltaMultiplier) {
            next.turnDrift = randomBetween(-0.028, 0.028);
        }
        next.angle += next.turnDrift * deltaMultiplier;
        if (distanceToPlayer <= TAIL_RUNNER_TYRANNO_DETECT_RADIUS) {
            next.phase = 'alert';
            next.timer = TAIL_RUNNER_TYRANNO_ALERT_TIME;
            next.targetAngle = playerAngle;
            next.turnDrift = 0;
        }
    } else if (next.phase === 'alert') {
        const angleDiff = normalizeAngle(next.targetAngle - next.angle);
        next.angle += clamp(angleDiff, -0.09 * deltaMultiplier, 0.09 * deltaMultiplier);
        if (next.timer <= 0) {
            next.phase = 'charge';
            next.timer = TAIL_RUNNER_TYRANNO_CHARGE_TIME;
            next.angle = next.targetAngle;
        }
    } else if (next.phase === 'charge') {
        if (next.timer <= 0) {
            next.phase = 'cooldown';
            next.timer = TAIL_RUNNER_TYRANNO_COOLDOWN_TIME;
            next.turnDrift = randomBetween(-0.015, 0.015);
        }
    } else if (next.phase === 'cooldown') {
        next.angle += next.turnDrift * deltaMultiplier;
        if (next.timer <= 0) {
            next.phase = 'roam';
            next.timer = randomBetween(20, 54);
        }
    }

    const speed = next.phase === 'charge' ? TAIL_RUNNER_TYRANNO_CHARGE_SPEED : TAIL_RUNNER_TYRANNO_ROAM_SPEED;
    let nextX = next.x + Math.cos(next.angle) * speed * deltaMultiplier;
    let nextY = next.y + Math.sin(next.angle) * speed * deltaMultiplier;

    const min = TAIL_RUNNER_ENTITY_RESPAWN_PADDING;
    const max = TAIL_RUNNER_WORLD_SIZE - TAIL_RUNNER_ENTITY_RESPAWN_PADDING;
    if (nextX < min || nextX > max || nextY < min || nextY > max) {
        next.angle = normalizeAngle(next.angle + Math.PI * 0.82);
        nextX = clamp(nextX, min, max);
        nextY = clamp(nextY, min, max);
        if (next.phase === 'charge') {
            next.phase = 'cooldown';
            next.timer = TAIL_RUNNER_TYRANNO_COOLDOWN_TIME;
        }
    }

    return {
        ...next,
        x: nextX,
        y: nextY,
        facing: Math.cos(next.angle) < 0 ? -1 : 1,
    };
};

const drawGemEntity = (
    context: CanvasRenderingContext2D,
    entity: TailRunnerEntity
) => {
    const tier = entity.coinTier ?? 'berry';
    const palette = TAIL_RUNNER_GEM_COLORS[tier];
    const size = entity.radius + 3;

    context.save();
    context.translate(entity.x, entity.y);

    context.beginPath();
    context.fillStyle = palette.glow;
    context.arc(0, 0, entity.radius + 10, 0, Math.PI * 2);
    context.fill();

    context.beginPath();
    context.moveTo(0, -size);
    context.lineTo(size * 0.72, -size * 0.2);
    context.lineTo(size * 0.46, size * 0.84);
    context.lineTo(0, size * 1.12);
    context.lineTo(-size * 0.46, size * 0.84);
    context.lineTo(-size * 0.72, -size * 0.2);
    context.closePath();
    context.fillStyle = palette.body;
    context.fill();

    context.beginPath();
    context.moveTo(0, -size);
    context.lineTo(size * 0.54, -size * 0.32);
    context.lineTo(0, 0.1 * size);
    context.lineTo(-size * 0.54, -size * 0.32);
    context.closePath();
    context.fillStyle = palette.top;
    context.fill();

    context.strokeStyle = palette.edge;
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(0, -size);
    context.lineTo(size * 0.72, -size * 0.2);
    context.lineTo(size * 0.46, size * 0.84);
    context.lineTo(0, size * 1.12);
    context.lineTo(-size * 0.46, size * 0.84);
    context.lineTo(-size * 0.72, -size * 0.2);
    context.closePath();
    context.stroke();

    context.beginPath();
    context.moveTo(-size * 0.54, -size * 0.32);
    context.lineTo(0, 0.1 * size);
    context.lineTo(size * 0.54, -size * 0.32);
    context.moveTo(0, -size);
    context.lineTo(0, 0.1 * size);
    context.moveTo(-size * 0.38, size * 0.82);
    context.lineTo(0, 0.1 * size);
    context.lineTo(size * 0.38, size * 0.82);
    context.strokeStyle = 'rgba(255,255,255,0.58)';
    context.lineWidth = 1.4;
    context.stroke();

    context.restore();
};

const drawBurstEntity = (context: CanvasRenderingContext2D, burst: TailRunnerBurst) => {
    const progress = 1 - burst.life / burst.maxLife;
    context.save();
    context.globalAlpha = Math.max(0, burst.life / burst.maxLife);
    context.translate(burst.x, burst.y - progress * 26);
    context.font = `${26 + progress * 6}px system-ui, Apple Color Emoji, Segoe UI Emoji, sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(burst.emoji, 0, 0);
    context.restore();
};

const drawRoundedRectPath = (
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
) => {
    const safeRadius = Math.max(0, Math.min(radius, width / 2, height / 2));
    context.beginPath();
    context.moveTo(x + safeRadius, y);
    context.lineTo(x + width - safeRadius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
    context.lineTo(x + width, y + height - safeRadius);
    context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
    context.lineTo(x + safeRadius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
    context.lineTo(x, y + safeRadius);
    context.quadraticCurveTo(x, y, x + safeRadius, y);
    context.closePath();
};

const drawPowerItemEntity = (
    context: CanvasRenderingContext2D,
    entity: TailRunnerEntity,
    emoji: string,
    glowStops: Array<[number, string]>,
    fillColor?: string
) => {
    context.save();
    context.translate(entity.x, entity.y);
    const glow = context.createRadialGradient(0, 0, 0, 0, 0, entity.radius + 16);
    glowStops.forEach(([offset, color]) => glow.addColorStop(offset, color));
    context.fillStyle = glow;
    context.beginPath();
    context.arc(0, 0, entity.radius + 14, 0, Math.PI * 2);
    context.fill();

    if (fillColor) {
        context.fillStyle = fillColor;
        context.beginPath();
        context.arc(0, 0, entity.radius + 7, 0, Math.PI * 2);
        context.fill();
    }

    context.font = `${Math.max(28, entity.radius * 1.55)}px system-ui, Apple Color Emoji, Segoe UI Emoji, sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(emoji, 0, emoji === '🧲' ? 1 : 0);
    context.restore();
};

const drawCircularEmojiEntity = (context: CanvasRenderingContext2D, entity: TailRunnerEntity) => {
    context.save();
    context.translate(entity.x, entity.y);
    context.beginPath();
    context.fillStyle = entity.type === 'obstacle'
        ? 'rgba(255, 149, 149, 0.9)'
        : 'rgba(175, 221, 187, 0.9)';
    context.arc(0, 0, entity.radius + 10, 0, Math.PI * 2);
    context.fill();
    context.font = `${entity.radius * 1.5}px system-ui, Apple Color Emoji, Segoe UI Emoji, sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.scale(entity.facing, 1);
    context.fillText(entity.emoji, 0, 0);
    context.restore();
};

const drawEnemySnakeScreen = (
    context: CanvasRenderingContext2D,
    enemy: TailRunnerEnemySnake,
    toScreenX: (worldX: number) => number,
    toScreenY: (worldY: number) => number
) => {
    enemy.tail.forEach((segment) => {
        context.save();
        context.globalAlpha = 1;
        context.filter = 'none';
        drawTailRunnerEmojiSprite(
            context,
            segment.emoji,
            toScreenX(segment.x),
            toScreenY(segment.y),
            24,
            segment.facing
        );
        context.restore();
    });

    context.save();
    context.globalAlpha = 1;
    context.filter = 'none';
    drawTailRunnerEmojiSprite(
        context,
        '👿',
        toScreenX(enemy.x),
        toScreenY(enemy.y),
        32,
        Math.cos(enemy.angle) < 0 ? -1 : 1
    );
    context.restore();
};

const drawTyrannoScreen = (
    context: CanvasRenderingContext2D,
    tyranno: TailRunnerTyrannoEnemy,
    frameNow: number,
    toScreenX: (worldX: number) => number,
    toScreenY: (worldY: number) => number
) => {
    const wobbleSeed = frameNow / 140 + tyranno.x * 0.002 + tyranno.y * 0.0015;
    const wobbleStrength = tyranno.phase === 'charge' ? 0.2 : tyranno.phase === 'alert' ? 0.12 : 0.08;
    const wobbleAngle = Math.sin(wobbleSeed) * wobbleStrength;
    const wobbleOffsetY = Math.sin(wobbleSeed * 1.8) * (tyranno.phase === 'charge' ? 1.6 : 1);

    context.save();
    context.globalAlpha = 1;
    context.filter = 'none';
    context.translate(toScreenX(tyranno.x), toScreenY(tyranno.y + wobbleOffsetY));
    context.rotate(wobbleAngle);
    drawTailRunnerEmojiSprite(context, '🦖', 0, 0, 68, -tyranno.facing as -1 | 1);

    if (tyranno.phase === 'alert' || tyranno.phase === 'charge') {
        context.save();
        context.globalAlpha = 1;
        context.filter = 'none';
        drawTailRunnerEmojiSprite(context, '💢', 8, -26, 18, 1);
        context.restore();
    }

    context.restore();
};

const drawPlayerTailScreen = (
    context: CanvasRenderingContext2D,
    tail: ReturnType<typeof createInitialTailRunnerState>['tail'],
    toScreenX: (worldX: number) => number,
    toScreenY: (worldY: number) => number
) => {
    tail.forEach((segment) => {
        context.save();
        context.globalAlpha = 1;
        context.filter = 'none';
        drawTailRunnerEmojiSprite(
            context,
            segment.emoji,
            toScreenX(segment.x),
            toScreenY(segment.y),
            26,
            segment.facing
        );
        context.restore();
    });
};

export const TailRunner: React.FC<GameComponentProps> = ({ onExit }) => {
    const { i18n } = useTranslation();
    const { speciesId, evolutionStage, characterName } = useNurturing();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const stageRef = useRef<HTMLDivElement | null>(null);
    const stateRef = useRef(createInitialTailRunnerState());
    const animationFrameRef = useRef<number | null>(null);
    const inputRef = useRef({ left: false, right: false, boost: false });
    const historyRef = useRef<{ x: number; y: number }[]>([]);
    const bestScoreRef = useRef(0);
    const bestTailRef = useRef(0);
    const lastHudSyncRef = useRef(0);
    const steerPointerIdRef = useRef<number | null>(null);
    const powerupVisualGuardFramesRef = useRef(0);
    const [gamePhase, setGamePhase] = useState<'start' | 'playing' | 'gameOver'>('start');
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [heartBursts, setHeartBursts] = useState<number[]>([]);
    const [scoreBursts, setScoreBursts] = useState<TailRunnerScoreBurst[]>([]);
    const [gameOverHighlights, setGameOverHighlights] = useState<TailRunnerGameOverHighlights>({
        score: false,
        tail: false,
    });
    const [hudState, setHudState] = useState<TailRunnerHudState>({
        score: 0,
        speed: TAIL_RUNNER_BASE_SPEED,
        tailLength: 0,
        bestTail: 0,
        positionX: TAIL_RUNNER_WORLD_SIZE / 2,
        positionY: TAIL_RUNNER_WORLD_SIZE / 2,
        highScore: 0,
        shieldCharges: 0,
        shieldActive: false,
        shieldWarning: false,
        magnetActive: false,
    });
    const canShowPowerupVisuals = gamePhase === 'playing' && powerupVisualGuardFramesRef.current <= 0;
    const liveShieldActive = canShowPowerupVisuals && stateRef.current.shieldTimer > 0;
    const liveShieldWarning = liveShieldActive && stateRef.current.shieldTimer <= 120;
    const liveMagnetActive = canShowPowerupVisuals && stateRef.current.magnetTimer > 0;
    const isScoreBeyondBest = gamePhase === 'playing' && hudState.score > bestScoreRef.current;
    const isTailBeyondBest = gamePhase === 'playing' && hudState.tailLength > bestTailRef.current;

    const runnerCharacter = useMemo(() => {
        const safeSpeciesId = speciesId || 'yellowJello';
        const character = createCharacter(safeSpeciesId, characterName || 'Jello');
        character.evolutionStage = Math.min(5, Math.max(1, evolutionStage || 1)) as EvolutionStage;
        if (characterName) {
            character.name = characterName;
        }
        return character;
    }, [characterName, evolutionStage, speciesId]);

    const tailRunnerLocale = useMemo(
        () => resolveTailRunnerLocale(i18n.resolvedLanguage || i18n.language),
        [i18n.language, i18n.resolvedLanguage]
    );

    const tailRunnerMessages = useMemo(
        () => TAIL_RUNNER_LOCALE_MANIFESTS[tailRunnerLocale] ?? manifestEn,
        [tailRunnerLocale]
    );

    const gt = useCallback((key: string, values?: Record<string, string | number>) => {
        const localized = getTailRunnerLocaleValue(tailRunnerMessages as Record<string, unknown>, key);
        const fallback = getTailRunnerLocaleValue(manifestEn as Record<string, unknown>, key);
        const template = typeof localized === 'string'
            ? localized
            : typeof fallback === 'string'
                ? fallback
                : key;
        return formatTailRunnerLocaleString(template, values);
    }, [tailRunnerMessages]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const warmup = () => {
            const allTailEmojis = Array.from(new Set([
                ...TAIL_RUNNER_FOOD_EMOJIS,
                TAIL_RUNNER_DEFAULT_TAIL_EMOJI,
                '🪨',
                '👿',
                '🦖',
                '💢',
            ]));

            allTailEmojis.forEach((emoji) => {
                getTailRunnerEmojiSprite(emoji, 26, 1);
                getTailRunnerEmojiSprite(emoji, 26, -1);
            });
            getTailRunnerEmojiSprite('🪨', 24, 1);
            getTailRunnerEmojiSprite('🪨', 24, -1);
            getTailRunnerEmojiSprite('👿', 32, 1);
            getTailRunnerEmojiSprite('👿', 32, -1);
            getTailRunnerEmojiSprite('🦖', 68, 1);
            getTailRunnerEmojiSprite('🦖', 68, -1);
            getTailRunnerEmojiSprite('💢', 18, 1);
        };

        let idleId: number | null = null;
        let timeoutId: number | null = null;
        const idleWindow = window as Window & {
            requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
            cancelIdleCallback?: (handle: number) => void;
        };

        if (typeof idleWindow.requestIdleCallback === 'function') {
            idleId = idleWindow.requestIdleCallback(warmup, { timeout: 600 });
        } else {
            timeoutId = window.setTimeout(warmup, 120);
        }

        return () => {
            if (typeof idleWindow.cancelIdleCallback === 'function' && idleId !== null) {
                idleWindow.cancelIdleCallback(idleId);
            }
            if (timeoutId !== null) {
                window.clearTimeout(timeoutId);
            }
        };
    }, []);

    const clearInputs = useCallback(() => {
        inputRef.current.left = false;
        inputRef.current.right = false;
        inputRef.current.boost = false;
    }, []);

    const setInputPressed = useCallback((key: 'left' | 'right' | 'boost', value: boolean) => {
        inputRef.current[key] = value;
    }, []);

    const updateSteerInput = useCallback((clientX: number) => {
        const stage = stageRef.current;
        if (!stage) return;
        const rect = stage.getBoundingClientRect();
        const relativeX = clientX - rect.left;
        const isLeft = relativeX < rect.width / 2;
        inputRef.current.left = isLeft;
        inputRef.current.right = !isLeft;
    }, []);

    const clearSteerInput = useCallback(() => {
        inputRef.current.left = false;
        inputRef.current.right = false;
        steerPointerIdRef.current = null;
    }, []);

    const triggerHeartBurst = useCallback(() => {
        const id = Date.now() + Math.random();
        setHeartBursts((current) => [...current, id]);
        window.setTimeout(() => {
            setHeartBursts((current) => current.filter((item) => item !== id));
        }, 850);
    }, []);

    const triggerScoreBurst = useCallback((value: number) => {
        const id = Date.now() + Math.random();
        setScoreBursts((current) => [...current, { id, label: `+${value}` }]);
        window.setTimeout(() => {
            setScoreBursts((current) => current.filter((item) => item.id !== id));
        }, 850);
    }, []);

    const syncHudState = useCallback((force = false) => {
        const now = performance.now();
        if (!force && now - lastHudSyncRef.current < TAIL_RUNNER_HUD_SYNC_INTERVAL_MS) {
            return;
        }
        lastHudSyncRef.current = now;
        setHudState(buildHudState(stateRef.current));
    }, []);

    const activateShield = useCallback(() => {
        if (gamePhase !== 'playing') return;
        const state = stateRef.current;
        if (state.shieldCharges <= 0 || state.shieldTimer > 0) return;
        state.shieldCharges -= 1;
        state.shieldTimer = TAIL_RUNNER_SHIELD_DURATION;
        syncHudState(true);
    }, [gamePhase, syncHudState]);

    const finishGame = useCallback(() => {
        const state = stateRef.current;
        const wasBestScore = state.score > bestScoreRef.current;
        const wasBestTail = state.tail.length > bestTailRef.current;
        state.isGameOver = true;
        state.highScore = Math.max(state.highScore, state.score);
        state.bestTail = Math.max(state.bestTail, state.tail.length);
        bestScoreRef.current = state.highScore;
        bestTailRef.current = state.bestTail;
        setGameOverHighlights({
            score: wasBestScore,
            tail: wasBestTail,
        });
        syncHudState(true);
        setGamePhase('gameOver');
    }, [syncHudState]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') inputRef.current.left = true;
            if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') inputRef.current.right = true;
            if (event.code === 'Space') {
                event.preventDefault();
                inputRef.current.boost = true;
            }
        };

        const handleKeyUp = (event: KeyboardEvent) => {
            if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') inputRef.current.left = false;
            if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') inputRef.current.right = false;
            if (event.code === 'Space') inputRef.current.boost = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    useEffect(() => {
        if (gamePhase !== 'playing') {
            clearInputs();
        }
    }, [clearInputs, gamePhase]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || gamePhase !== 'playing') return;

        const context = canvas.getContext('2d');
        if (!context) return;

        const resizeCanvas = () => {
            const { width, height } = canvas.getBoundingClientRect();
            const pixelRatio = getTailRunnerRenderPixelRatio();
            canvas.width = Math.max(1, Math.floor(width * pixelRatio));
            canvas.height = Math.max(1, Math.floor(height * pixelRatio));
            context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        let previousTime = performance.now();

        const update = (deltaMs: number) => {
            const state = stateRef.current;
            const input = inputRef.current;
            const deltaMultiplier = Math.min(deltaMs / 16.6667, 1.8);
            if (powerupVisualGuardFramesRef.current > 0) {
                powerupVisualGuardFramesRef.current -= 1;
            }
            state.boostSpawnTimer -= deltaMultiplier;
            state.shieldTimer = Math.max(0, state.shieldTimer - deltaMultiplier);
            state.magnetSpawnTimer -= deltaMultiplier;
            state.magnetTimer = Math.max(0, state.magnetTimer - deltaMultiplier);
            const shieldActive = state.shieldTimer > 0;
            const magnetActive = state.magnetTimer > 0;

            const hasBoostEntity = state.entities.some((entity) => entity.type === 'boost');
            if (!hasBoostEntity && state.shieldCharges < TAIL_RUNNER_MAX_SHIELD_CHARGES && state.boostSpawnTimer <= 0) {
                state.entities.push(createRandomEntity('boost', state.playerX, state.playerY));
                state.boostSpawnTimer = rollNextBoostSpawnTimer();
            } else if (state.shieldCharges >= TAIL_RUNNER_MAX_SHIELD_CHARGES && state.boostSpawnTimer <= 0) {
                state.boostSpawnTimer = 90;
            }

            const hasMagnetEntity = state.entities.some((entity) => entity.type === 'magnet');
            if (!hasMagnetEntity && !magnetActive && state.magnetSpawnTimer <= 0) {
                state.entities.push(createRandomEntity('magnet', state.playerX, state.playerY));
                state.magnetSpawnTimer = rollNextMagnetSpawnTimer();
            }

            const nextBursts: TailRunnerBurst[] = [];
            for (let index = 0; index < state.bursts.length; index += 1) {
                const burst = state.bursts[index];
                const nextLife = burst.life - deltaMultiplier;
                if (nextLife > 0) {
                    nextBursts.push({
                        ...burst,
                        life: nextLife,
                    });
                }
            }
            state.bursts = nextBursts;

            state.enemies = state.enemies.map((enemy) => updateEnemySnake(enemy, deltaMultiplier));
            state.tyrannos = state.tyrannos.map((tyranno) => (
                updateTyrannoEnemy(tyranno, state.playerX, state.playerY, deltaMultiplier)
            ));

            if (input.left) state.playerAngle -= TAIL_RUNNER_TURN_SPEED * deltaMultiplier;
            if (input.right) state.playerAngle += TAIL_RUNNER_TURN_SPEED * deltaMultiplier;

            const currentBaseSpeed = input.boost ? TAIL_RUNNER_BOOST_SPEED : TAIL_RUNNER_BASE_SPEED;
            state.playerSpeed = shieldActive
                ? currentBaseSpeed * TAIL_RUNNER_SHIELD_SPEED_MULTIPLIER
                : currentBaseSpeed;
            state.playerX += Math.cos(state.playerAngle) * state.playerSpeed * deltaMultiplier;
            state.playerY += Math.sin(state.playerAngle) * state.playerSpeed * deltaMultiplier;

            const isOutOfBounds =
                state.playerX < 0
                || state.playerY < 0
                || state.playerX > TAIL_RUNNER_WORLD_SIZE
                || state.playerY > TAIL_RUNNER_WORLD_SIZE;

            if (isOutOfBounds && !shieldActive) {
                finishGame();
                return;
            }
            if (shieldActive) {
                state.playerX = clamp(state.playerX, 0, TAIL_RUNNER_WORLD_SIZE);
                state.playerY = clamp(state.playerY, 0, TAIL_RUNNER_WORLD_SIZE);
            }

            const hitBarrier = state.barriers.some((barrier) =>
                collidesWithBarrier(state.playerX, state.playerY, TAIL_RUNNER_PLAYER_RADIUS, barrier)
            );

            if (hitBarrier && !shieldActive) {
                finishGame();
                return;
            }

            const hitEnemy = state.enemies.some((enemy) => {
                if (Math.hypot(enemy.x - state.playerX, enemy.y - state.playerY) <= TAIL_RUNNER_ENEMY_RADIUS + TAIL_RUNNER_PLAYER_RADIUS) {
                    return true;
                }
                return enemy.tail.some((segment) => (
                    Math.hypot(segment.x - state.playerX, segment.y - state.playerY) <= 16 + TAIL_RUNNER_PLAYER_RADIUS
                ));
            });

            const hitTyranno = state.tyrannos.some((tyranno) => (
                Math.hypot(tyranno.x - state.playerX, tyranno.y - state.playerY) <= TAIL_RUNNER_TYRANNO_RADIUS + TAIL_RUNNER_PLAYER_RADIUS
            ));

            if ((hitEnemy || hitTyranno) && !shieldActive) {
                finishGame();
                return;
            }

            historyRef.current.unshift({ x: state.playerX, y: state.playerY });
            if (historyRef.current.length > TAIL_RUNNER_HISTORY_LIMIT) {
                historyRef.current.length = TAIL_RUNNER_HISTORY_LIMIT;
            }

            state.tail = state.tail.map((segment, index) => {
                const point = getTailRunnerHistoryPoint(
                    historyRef.current,
                    getTailRunnerHistoryOffset(index),
                    { x: state.playerX, y: state.playerY }
                );
                const smoothedPoint = smoothTailRunnerPoint(
                    segment,
                    point,
                    index === 0 ? 0.62 : 0.52
                );
                return {
                    ...segment,
                    x: smoothedPoint.x,
                    y: smoothedPoint.y,
                };
            });

            const nextEntities: TailRunnerEntity[] = [];
            for (let index = 0; index < state.entities.length; index += 1) {
                let entity = state.entities[index];

                if (magnetActive && entity.type === 'coin') {
                    const dx = state.playerX - entity.x;
                    const dy = state.playerY - entity.y;
                    const distance = Math.hypot(dx, dy);

                    if (distance > 0 && distance <= TAIL_RUNNER_MAGNET_RADIUS) {
                        const pullStep = Math.min(
                            distance,
                            TAIL_RUNNER_MAGNET_PULL_SPEED
                            * deltaMultiplier
                            * (1 + (TAIL_RUNNER_MAGNET_RADIUS - distance) / TAIL_RUNNER_MAGNET_RADIUS)
                        );

                        entity = {
                            ...entity,
                            x: entity.x + (dx / distance) * pullStep,
                            y: entity.y + (dy / distance) * pullStep,
                        };
                    }
                }

                const distance = Math.hypot(entity.x - state.playerX, entity.y - state.playerY);
                if (distance > entity.radius + TAIL_RUNNER_PLAYER_RADIUS) {
                    nextEntities.push(entity);
                    continue;
                }

                if (entity.type === 'food') {
                    state.score += TAIL_RUNNER_FOOD_SCORE;
                    playEatingSound(0.42);
                    triggerHeartBurst();
                    const tailPoint = historyRef.current[getTailRunnerHistoryOffset(state.tail.length)] || historyRef.current[historyRef.current.length - 1] || { x: state.playerX, y: state.playerY };
                    state.tail.push({
                        x: tailPoint.x,
                        y: tailPoint.y,
                        emoji: entity.emoji || TAIL_RUNNER_DEFAULT_TAIL_EMOJI,
                        facing: entity.facing,
                    });
                    state.bestTail = Math.max(state.bestTail, state.tail.length);
                    nextEntities.push(createRandomEntity('food', state.playerX, state.playerY));
                    continue;
                }

                if (entity.type === 'coin') {
                    const gainedScore = entity.scoreValue ?? TAIL_RUNNER_GEM_SCORES.berry;
                    state.score += gainedScore;
                    playClearSound(0.46);
                    triggerScoreBurst(gainedScore);
                    nextEntities.push(createRandomEntity('coin', state.playerX, state.playerY));
                    continue;
                }

                if (entity.type === 'boost') {
                    state.shieldCharges = Math.min(TAIL_RUNNER_MAX_SHIELD_CHARGES, state.shieldCharges + 1);
                    state.boostSpawnTimer = rollNextBoostSpawnTimer();
                    nextEntities.push(createRandomEntity('food', state.playerX, state.playerY));
                    continue;
                }

                if (entity.type === 'magnet') {
                    state.magnetTimer = TAIL_RUNNER_MAGNET_DURATION;
                    state.magnetSpawnTimer = rollNextMagnetSpawnTimer();
                    playClearSound(0.38);
                    nextEntities.push(createRandomEntity('food', state.playerX, state.playerY));
                    continue;
                }

                if (shieldActive) {
                    nextEntities.push(createRandomEntity('obstacle', state.playerX, state.playerY));
                    continue;
                }

                state.score = Math.max(0, state.score - TAIL_RUNNER_OBSTACLE_PENALTY);
                if (state.tail.length > 0) {
                    let nextLength = state.tail.length;
                    if (entity.emoji === '🔥') {
                        nextLength = Math.max(0, state.tail.length - 1);
                    } else if (entity.emoji === '💣') {
                        nextLength = Math.floor(state.tail.length / 2);
                    } else if (entity.emoji === '🧨') {
                        nextLength = 0;
                    }

                    const removedTail = state.tail.slice(nextLength);
                    state.tail = state.tail.slice(0, nextLength);
                    state.bursts.push(...removedTail.map((segment) => createBurst(segment.x, segment.y)));
                    nextEntities.push(createRandomEntity('obstacle', state.playerX, state.playerY));
                    continue;
                }

                finishGame();
                nextEntities.push(entity);
                state.entities = nextEntities;
                return;
            }
            state.entities = nextEntities;

            state.highScore = Math.max(state.highScore, state.score);
            state.bestTail = Math.max(state.bestTail, state.tail.length);
            reconcileDifficultyTargets(state);
            syncHudState();
        };

        const draw = (frameNow: number) => {
            const state = stateRef.current;
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            const cameraX = state.playerX - width / 2;
            const cameraY = state.playerY - height / 2;
            const toScreenX = (worldX: number) => Math.round(worldX - cameraX);
            const toScreenY = (worldY: number) => Math.round(worldY - cameraY);

            context.clearRect(0, 0, width, height);

            const outerPattern = getTailRunnerOuterPattern(context);
            context.fillStyle = outerPattern ?? '#5f8a4f';
            context.fillRect(0, 0, width, height);

            context.save();
            context.translate(-cameraX, -cameraY);

            const worldGradient = context.createLinearGradient(0, 0, 0, TAIL_RUNNER_WORLD_SIZE);
            worldGradient.addColorStop(0, '#9fd27f');
            worldGradient.addColorStop(1, '#7fbc63');
            context.fillStyle = worldGradient;
            context.fillRect(0, 0, TAIL_RUNNER_WORLD_SIZE, TAIL_RUNNER_WORLD_SIZE);

            context.strokeStyle = 'rgba(71, 112, 54, 0.12)';
            context.lineWidth = 1;
            for (let x = 0; x <= TAIL_RUNNER_WORLD_SIZE; x += TAIL_RUNNER_GRID_SIZE) {
                context.beginPath();
                context.moveTo(x, 0);
                context.lineTo(x, TAIL_RUNNER_WORLD_SIZE);
                context.stroke();
            }
            for (let y = 0; y <= TAIL_RUNNER_WORLD_SIZE; y += TAIL_RUNNER_GRID_SIZE) {
                context.beginPath();
                context.moveTo(0, y);
                context.lineTo(TAIL_RUNNER_WORLD_SIZE, y);
                context.stroke();
            }

            context.fillStyle = 'rgba(66, 96, 43, 0.34)';
            context.fillRect(0, 0, TAIL_RUNNER_WORLD_SIZE, 14);
            context.fillRect(0, TAIL_RUNNER_WORLD_SIZE - 14, TAIL_RUNNER_WORLD_SIZE, 14);
            context.fillRect(0, 0, 14, TAIL_RUNNER_WORLD_SIZE);
            context.fillRect(TAIL_RUNNER_WORLD_SIZE - 14, 0, 14, TAIL_RUNNER_WORLD_SIZE);

            context.strokeStyle = 'rgba(42, 66, 27, 0.72)';
            context.lineWidth = 6;
            context.strokeRect(3, 3, TAIL_RUNNER_WORLD_SIZE - 6, TAIL_RUNNER_WORLD_SIZE - 6);

            context.strokeStyle = 'rgba(235, 251, 224, 0.22)';
            context.lineWidth = 2;
            context.strokeRect(14, 14, TAIL_RUNNER_WORLD_SIZE - 28, TAIL_RUNNER_WORLD_SIZE - 28);

            state.barriers.forEach((barrier) => {
                context.save();
                const barrierGradient = barrier.orientation === 'horizontal'
                    ? context.createLinearGradient(barrier.x, barrier.y, barrier.x, barrier.y + barrier.height)
                    : context.createLinearGradient(barrier.x, barrier.y, barrier.x + barrier.width, barrier.y);

                barrierGradient.addColorStop(0, 'rgba(173, 124, 72, 0.98)');
                barrierGradient.addColorStop(0.18, 'rgba(205, 156, 98, 0.98)');
                barrierGradient.addColorStop(0.5, 'rgba(150, 102, 58, 0.98)');
                barrierGradient.addColorStop(0.82, 'rgba(198, 149, 92, 0.98)');
                barrierGradient.addColorStop(1, 'rgba(128, 86, 48, 0.98)');

                context.fillStyle = barrierGradient;
                drawRoundedRectPath(context, barrier.x, barrier.y, barrier.width, barrier.height, 12);
                context.fill();

                context.save();
                drawRoundedRectPath(context, barrier.x, barrier.y, barrier.width, barrier.height, 12);
                context.clip();

                context.fillStyle = 'rgba(255, 237, 196, 0.16)';
                if (barrier.orientation === 'horizontal') {
                    context.fillRect(barrier.x + 6, barrier.y + 3, barrier.width - 12, Math.max(4, barrier.height * 0.18));
                } else {
                    context.fillRect(barrier.x + 3, barrier.y + 6, Math.max(4, barrier.width * 0.18), barrier.height - 12);
                }

                context.fillStyle = 'rgba(74, 47, 24, 0.2)';
                if (barrier.orientation === 'horizontal') {
                    context.fillRect(barrier.x + 6, barrier.y + barrier.height * 0.72, barrier.width - 12, Math.max(4, barrier.height * 0.16));
                } else {
                    context.fillRect(barrier.x + barrier.width * 0.72, barrier.y + 6, Math.max(4, barrier.width * 0.16), barrier.height - 12);
                }

                const spotCount = barrier.orientation === 'horizontal'
                    ? Math.max(3, Math.floor(barrier.width / 95))
                    : Math.max(3, Math.floor(barrier.height / 95));

                for (let index = 0; index < spotCount; index += 1) {
                    const progress = (index + 1) / (spotCount + 1);
                    const centerX = barrier.orientation === 'horizontal'
                        ? barrier.x + barrier.width * progress
                        : barrier.x + barrier.width * (0.35 + (index % 2) * 0.3);
                    const centerY = barrier.orientation === 'horizontal'
                        ? barrier.y + barrier.height * (0.35 + (index % 2) * 0.3)
                        : barrier.y + barrier.height * progress;
                    const radiusX = barrier.orientation === 'horizontal' ? 10 + (index % 3) * 3 : 7 + (index % 3) * 2;
                    const radiusY = barrier.orientation === 'horizontal' ? 5 + (index % 2) * 2 : 10 + (index % 2) * 3;

                    context.fillStyle = index % 2 === 0
                        ? 'rgba(102, 63, 31, 0.18)'
                        : 'rgba(255, 222, 168, 0.12)';
                    context.beginPath();
                    context.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
                    context.fill();
                }

                const stripeCount = barrier.orientation === 'horizontal'
                    ? Math.max(2, Math.floor(barrier.width / 140))
                    : Math.max(2, Math.floor(barrier.height / 140));

                context.strokeStyle = 'rgba(88, 58, 30, 0.18)';
                context.lineWidth = 2;

                for (let index = 1; index < stripeCount; index += 1) {
                    if (barrier.orientation === 'horizontal') {
                        const stripeX = barrier.x + (barrier.width / stripeCount) * index;
                        context.beginPath();
                        context.moveTo(stripeX, barrier.y + 4);
                        context.lineTo(stripeX, barrier.y + barrier.height - 4);
                        context.stroke();
                    } else {
                        const stripeY = barrier.y + (barrier.height / stripeCount) * index;
                        context.beginPath();
                        context.moveTo(barrier.x + 4, stripeY);
                        context.lineTo(barrier.x + barrier.width - 4, stripeY);
                        context.stroke();
                    }
                }
                context.restore();

                context.strokeStyle = 'rgba(86, 57, 30, 0.34)';
                context.lineWidth = 1.5;
                drawRoundedRectPath(context, barrier.x + 0.75, barrier.y + 0.75, barrier.width - 1.5, barrier.height - 1.5, 11);
                context.stroke();
                context.restore();
            });

            state.bursts.forEach((burst) => drawBurstEntity(context, burst));

            state.entities.forEach((entity) => {
                if (entity.type === 'coin') {
                    drawGemEntity(context, entity);
                    return;
                }
                if (entity.type === 'boost') {
                    drawPowerItemEntity(
                        context,
                        entity,
                        '⚡',
                        [
                            [0, 'rgba(255, 248, 191, 0.96)'],
                            [0.55, 'rgba(255, 214, 79, 0.76)'],
                            [1, 'rgba(255, 190, 54, 0)'],
                        ],
                        'rgba(255, 241, 173, 0.92)'
                    );
                    return;
                }
                if (entity.type === 'magnet') {
                    drawPowerItemEntity(
                        context,
                        entity,
                        '🧲',
                        [
                            [0, 'rgba(255, 242, 209, 0.95)'],
                            [0.52, 'rgba(255, 140, 140, 0.42)'],
                            [1, 'rgba(255, 140, 140, 0)'],
                        ]
                    );
                    return;
                }

                drawCircularEmojiEntity(context, entity);
            });

            context.save();
            context.translate(state.playerX, state.playerY);
            context.rotate(state.playerAngle);
            context.beginPath();
            context.fillStyle = 'rgba(88, 132, 98, 0.58)';
            context.moveTo(TAIL_RUNNER_PLAYER_RADIUS + 12, 0);
            context.lineTo(-TAIL_RUNNER_PLAYER_RADIUS + 2, -12);
            context.lineTo(-TAIL_RUNNER_PLAYER_RADIUS + 2, 12);
            context.closePath();
            context.fill();
            context.restore();

            context.restore();

            state.enemies.forEach((enemy) => drawEnemySnakeScreen(context, enemy, toScreenX, toScreenY));
            state.tyrannos.forEach((tyranno) => drawTyrannoScreen(context, tyranno, frameNow, toScreenX, toScreenY));
            drawPlayerTailScreen(context, state.tail, toScreenX, toScreenY);
        };

        const loop = (now: number) => {
            if (stateRef.current.isGameOver) return;
            const deltaMs = now - previousTime;
            previousTime = now;
            update(deltaMs);
            draw(now);
            animationFrameRef.current = window.requestAnimationFrame(loop);
        };

        animationFrameRef.current = window.requestAnimationFrame(loop);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (animationFrameRef.current) {
                window.cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        };
    }, [finishGame, gamePhase, syncHudState, triggerHeartBurst, triggerScoreBurst]);

    const startGame = () => {
        clearInputs();
        setGameOverHighlights({
            score: false,
            tail: false,
        });
        const nextState = createInitialTailRunnerState();
        nextState.highScore = bestScoreRef.current;
        nextState.bestTail = bestTailRef.current;
        nextState.boostSpawnTimer = rollNextBoostSpawnTimer();
        nextState.magnetSpawnTimer = rollNextMagnetSpawnTimer();
        nextState.entities = createInitialEntities(nextState.playerX, nextState.playerY);
        nextState.barriers = createInitialBarriers(nextState.playerX, nextState.playerY);
        nextState.enemies = createInitialEnemies(nextState.playerX, nextState.playerY);
        nextState.tyrannos = createInitialTyrannos(nextState.playerX, nextState.playerY);
        stateRef.current = nextState;
        powerupVisualGuardFramesRef.current = TAIL_RUNNER_POWERUP_VISUAL_GUARD_FRAMES;
        historyRef.current = [];
        lastHudSyncRef.current = 0;
        setHudState(buildHudState(nextState));
        setGamePhase('playing');
    };

    const handleStagePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        if (gamePhase !== 'playing') return;
        const target = event.target as HTMLElement;
        if (target.closest('.tail-runner__touch-controls')) return;
        steerPointerIdRef.current = event.pointerId;
        updateSteerInput(event.clientX);
    }, [gamePhase, updateSteerInput]);

    const handleStagePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        if (steerPointerIdRef.current !== event.pointerId) return;
        updateSteerInput(event.clientX);
    }, [updateSteerInput]);

    const handleStagePointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        if (steerPointerIdRef.current !== event.pointerId) return;
        clearSteerInput();
    }, [clearSteerInput]);

    return (
        <div className="tail-runner">
            <div className="tail-runner__panel">
                <header className="tail-runner__header">
                    <div className="tail-runner__header-stats" aria-label={gt('headerStatsLabel')}>
                        <div className="tail-runner__header-stat">
                            <span className="tail-runner__header-stat-label">
                                <span>{gt('stats.score')}</span>
                                <span className="tail-runner__header-stat-label-separator">/</span>
                                <span className="tail-runner__header-stat-label-best">{gt('stats.best')}</span>
                            </span>
                            <strong className="tail-runner__header-stat-value">
                                <span className={isScoreBeyondBest ? 'tail-runner__header-stat-current--highlight' : undefined}>{hudState.score}</span>
                                <span className="tail-runner__header-stat-separator">/</span>
                                <span className="tail-runner__header-stat-best">{hudState.highScore}</span>
                            </strong>
                        </div>
                        <div className="tail-runner__header-stat">
                            <span className="tail-runner__header-stat-label">
                                <span>{gt('stats.tail')}</span>
                                <span className="tail-runner__header-stat-label-separator">/</span>
                                <span className="tail-runner__header-stat-label-best">{gt('stats.best')}</span>
                            </span>
                            <strong className="tail-runner__header-stat-value">
                                <span className={isTailBeyondBest ? 'tail-runner__header-stat-current--highlight' : undefined}>{hudState.tailLength}</span>
                                <span className="tail-runner__header-stat-separator">/</span>
                                <span className="tail-runner__header-stat-best">{hudState.bestTail}</span>
                            </strong>
                        </div>
                    </div>
                    <div className="tail-runner__header-actions">
                        <button
                            type="button"
                            className="tail-runner__close tail-runner__help"
                            onClick={() => setIsHelpOpen(true)}
                            aria-label={gt('controlsTitle')}
                        >
                            <span className="tail-runner__help-mark">?</span>
                        </button>
                    <button
                        type="button"
                        className="tail-runner__close"
                        onClick={onExit}
                        aria-label={gt('closeButton')}
                    >
                        <i className="fas fa-xmark" aria-hidden="true" />
                    </button>
                    </div>
                </header>

                <section className="tail-runner__hero">
                    <div
                        ref={stageRef}
                        className="tail-runner__stage"
                        aria-label={gt('stageLabel')}
                        onPointerDown={handleStagePointerDown}
                        onPointerMove={handleStagePointerMove}
                        onPointerUp={handleStagePointerUp}
                        onPointerCancel={handleStagePointerUp}
                        onPointerLeave={handleStagePointerUp}
                    >
                        <canvas ref={canvasRef} className="tail-runner__canvas" />
                        <div className="tail-runner__player-overlay" aria-hidden="true">
                            <div className={`tail-runner__avatar-core${liveShieldActive ? ' tail-runner__avatar-core--shielded' : ''}`}>
                                <div className="tail-runner__avatar-glow" aria-hidden="true" />
                                {liveMagnetActive && <div className="tail-runner__magnet-ring" aria-hidden="true">🧲</div>}
                                {liveShieldActive && (
                                    <div className={`tail-runner__shield-ring${liveShieldWarning ? ' tail-runner__shield-ring--warning' : ''}`} aria-hidden="true">
                                        <span className="tail-runner__shield-ring-beam tail-runner__shield-ring-beam--one" />
                                        <span className="tail-runner__shield-ring-beam tail-runner__shield-ring-beam--two" />
                                    </div>
                                )}
                                <div className="tail-runner__heart-layer" aria-hidden="true">
                                    {heartBursts.map((burstId) => (
                                        <span key={burstId} className="tail-runner__heart-burst">♥️</span>
                                    ))}
                                    {scoreBursts.map((burst) => (
                                        <span key={burst.id} className="tail-runner__score-burst">{burst.label}</span>
                                    ))}
                                </div>
                                <JelloAvatar
                                    character={runnerCharacter}
                                    speciesId={runnerCharacter.speciesId}
                                    responsive
                                    disableAnimation
                                />
                            </div>
                        </div>
                        {gamePhase === 'start' && (
                            <div className="tail-runner__start-screen">
                                <div className="tail-runner__start-card tail-runner__start-card--welcome">
                                    <div className="tail-runner__start-icon-shell" aria-hidden="true">
                                        <div className="tail-runner__start-icon-bubble">
                                            <JelloAvatar
                                                character={runnerCharacter}
                                                speciesId={runnerCharacter.speciesId}
                                                responsive
                                                disableAnimation
                                            />
                                        </div>
                                    </div>
                                    <div className="tail-runner__start-copy">
                                        <h2>{gt('startTitle')}</h2>
                                        <p>{gt('startDescription')}</p>
                                    </div>
                                    <button type="button" className="tail-runner__start-btn tail-runner__start-btn--hero" onClick={startGame}>
                                        {gt('startButton')}
                                    </button>
                                    <div className="tail-runner__start-guide" aria-hidden="true">
                                        <div className="tail-runner__start-guide-item">
                                            <div className="tail-runner__start-guide-keys">
                                                <kbd>↺</kbd>
                                                <kbd>↻</kbd>
                                            </div>
                                            <span>{gt('controlsTurnShort')}</span>
                                        </div>
                                        <div className="tail-runner__start-guide-item">
                                            <div className="tail-runner__start-guide-keys">
                                                <kbd>⚡</kbd>
                                                <kbd>SPACE</kbd>
                                            </div>
                                            <span>{gt('controlsShieldShort')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {gamePhase === 'gameOver' && (
                            <div className="tail-runner__start-screen">
                                <div className="tail-runner__start-card tail-runner__start-card--gameover">
                                    <div className="tail-runner__gameover-icon-shell" aria-hidden="true">
                                        <div className="tail-runner__gameover-icon-bubble">💥</div>
                                    </div>
                                    <div className="tail-runner__start-copy">
                                        <h2>{gt('gameOverTitle')}</h2>
                                    </div>
                                    <div className="tail-runner__gameover-records">
                                        <div className={`tail-runner__gameover-record-card${gameOverHighlights.score ? ' tail-runner__gameover-record-card--highlight' : ''}`}>
                                            {gameOverHighlights.score && (
                                                <span className="tail-runner__gameover-record-badge">
                                                    {gt('newBest')}
                                                </span>
                                            )}
                                            <span className="tail-runner__gameover-record-label">
                                                {gt('stats.score')} / {gt('stats.best')}
                                            </span>
                                            <strong className="tail-runner__gameover-record-value">
                                                <span>{hudState.score}</span>
                                                <span className="tail-runner__gameover-record-separator">/</span>
                                                <span className="tail-runner__gameover-record-best">{hudState.highScore}</span>
                                            </strong>
                                        </div>
                                        <div className={`tail-runner__gameover-record-card tail-runner__gameover-record-card--tail${gameOverHighlights.tail ? ' tail-runner__gameover-record-card--highlight' : ''}`}>
                                            {gameOverHighlights.tail && (
                                                <span className="tail-runner__gameover-record-badge">
                                                    {gt('newBest')}
                                                </span>
                                            )}
                                            <span className="tail-runner__gameover-record-label">
                                                {gt('stats.tail')} / {gt('stats.best')}
                                            </span>
                                            <strong className="tail-runner__gameover-record-value">
                                                <span>{hudState.tailLength}</span>
                                                <span className="tail-runner__gameover-record-separator">/</span>
                                                <span className="tail-runner__gameover-record-best">{hudState.bestTail}</span>
                                            </strong>
                                        </div>
                                    </div>
                                    <button type="button" className="tail-runner__start-btn tail-runner__start-btn--gameover" onClick={startGame}>
                                        <i className="fas fa-rotate-right" aria-hidden="true" />
                                        {gt('retryButton')}
                                    </button>
                                </div>
                            </div>
                        )}
                        <div className="tail-runner__touch-controls">
                            <button
                                type="button"
                                className="tail-runner__touch-btn"
                                onPointerDown={() => setInputPressed('left', true)}
                                onPointerUp={() => setInputPressed('left', false)}
                                onPointerCancel={() => setInputPressed('left', false)}
                                onPointerLeave={() => setInputPressed('left', false)}
                                disabled={gamePhase !== 'playing'}
                            >
                                <span className="tail-runner__touch-icon">↺</span>
                            </button>
                            <button
                                type="button"
                                className={`tail-runner__touch-btn tail-runner__touch-btn--boost${liveShieldActive ? ' tail-runner__touch-btn--active' : ''}`}
                                onClick={activateShield}
                                disabled={gamePhase !== 'playing' || hudState.shieldCharges <= 0 || liveShieldActive}
                                aria-label={gt('shieldButton', { count: hudState.shieldCharges })}
                            >
                                <span className="tail-runner__touch-icon">⚡</span>
                                {hudState.shieldCharges > 0 && (
                                    <span className="tail-runner__touch-badge">{hudState.shieldCharges}</span>
                                )}
                            </button>
                            <button
                                type="button"
                                className="tail-runner__touch-btn"
                                onPointerDown={() => setInputPressed('right', true)}
                                onPointerUp={() => setInputPressed('right', false)}
                                onPointerCancel={() => setInputPressed('right', false)}
                                onPointerLeave={() => setInputPressed('right', false)}
                                disabled={gamePhase !== 'playing'}
                            >
                                <span className="tail-runner__touch-icon">↻</span>
                            </button>
                        </div>
                    </div>

                    <div className="tail-runner__sidebar">
                        <div className="tail-runner__card">
                            <h2>{runnerCharacter.name}</h2>
                            <p>{gt('currentJelloDescription')}</p>
                        </div>

                        <div className="tail-runner__stats">
                            <div className="tail-runner__stat">
                                <span className="tail-runner__stat-label">{gt('stats.speed')}</span>
                                <span className="tail-runner__stat-value">{hudState.speed.toFixed(1)}</span>
                            </div>
                            <div className="tail-runner__stat">
                                <span className="tail-runner__stat-label">{gt('stats.boost')}</span>
                                <span className="tail-runner__stat-value">{TAIL_RUNNER_BOOST_SPEED}</span>
                            </div>
                            <div className="tail-runner__stat">
                                <span className="tail-runner__stat-label">{gt('stats.score')}</span>
                                <span className="tail-runner__stat-value">{hudState.score}</span>
                            </div>
                            <div className="tail-runner__stat">
                                <span className="tail-runner__stat-label">{gt('stats.tail')}</span>
                                <span className="tail-runner__stat-value">{hudState.tailLength}</span>
                            </div>
                            <div className="tail-runner__stat">
                                <span className="tail-runner__stat-label">{gt('stats.best')}</span>
                                <span className="tail-runner__stat-value">{hudState.highScore}</span>
                            </div>
                        </div>

                        <div className="tail-runner__card">
                            <h3>{gt('currentPositionTitle')}</h3>
                            <p>{gt('currentPositionValue', { x: hudState.positionX, y: hudState.positionY })}</p>
                        </div>

                        <div className="tail-runner__card">
                            <h3>{gt('controlsTitle')}</h3>
                            <ul className="tail-runner__controls">
                                <li>{gt('controlsAuto')}</li>
                                <li>{gt('controlsTurn')}</li>
                                <li>{gt('controlsBoost')}</li>
                                <li>{gt('controlsShield')}</li>
                                <li>{gt('controlsMagnet')}</li>
                                <li>{gt('controlsTouch')}</li>
                            </ul>
                        </div>
                    </div>
                </section>
            </div>
            {isHelpOpen && (
                <div className="tail-runner__modal-backdrop" onClick={() => setIsHelpOpen(false)}>
                    <div
                        className="tail-runner__modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label={gt('controlsTitle')}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="tail-runner__modal-head">
                            <h3>{gt('controlsTitle')}</h3>
                            <button
                                type="button"
                                className="tail-runner__modal-close"
                                onClick={() => setIsHelpOpen(false)}
                                aria-label={gt('closeButton')}
                            >
                                <i className="fas fa-xmark" aria-hidden="true" />
                            </button>
                        </div>
                        <ul className="tail-runner__controls tail-runner__controls--modal">
                            <li>{gt('controlsAuto')}</li>
                            <li>{gt('controlsTurn')}</li>
                            <li>{gt('controlsBoost')}</li>
                            <li>{gt('controlsShield')}</li>
                            <li>{gt('controlsMagnet')}</li>
                            <li>{gt('controlsTouch')}</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TailRunner;
