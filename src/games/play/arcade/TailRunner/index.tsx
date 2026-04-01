import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNurturing } from '../../../../contexts/NurturingContext';
import { createCharacter } from '../../../../data/characters';
import type { EvolutionStage } from '../../../../types/character';
import type { GameComponentProps } from '../../../types';
import { JelloAvatar } from '../../../../components/characters/JelloAvatar';
import { playClearSound, playEatingSound } from '../../../../utils/sound';
import {
    TAIL_RUNNER_BASE_SPEED,
    TAIL_RUNNER_BOOST_SPEED,
    TAIL_RUNNER_BARRIER_LENGTHS,
    TAIL_RUNNER_BARRIER_THICKNESS,
    TAIL_RUNNER_BURST_LIFE,
    TAIL_RUNNER_GEM_COLORS,
    TAIL_RUNNER_GEM_SCORES,
    TAIL_RUNNER_DEFAULT_TAIL_EMOJI,
    TAIL_RUNNER_ENEMY_MAX_TAIL_COUNT,
    TAIL_RUNNER_ENEMY_MIN_TAIL_COUNT,
    TAIL_RUNNER_ENEMY_RADIUS,
    TAIL_RUNNER_ENEMY_SCORE_STEP,
    TAIL_RUNNER_ENEMY_SPEED,
    TAIL_RUNNER_ENTITY_RESPAWN_PADDING,
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
    TAIL_RUNNER_OBSTACLE_EMOJIS,
    TAIL_RUNNER_OBSTACLE_PENALTY,
    TAIL_RUNNER_OBSTACLE_SCORE_STEP,
    TAIL_RUNNER_PLAYER_RADIUS,
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
import manifestKo from './locales/ko';

const GAME_LOCALE_KEY = 'games.play-jello-comet';
const TAIL_RUNNER_HUD_SYNC_INTERVAL_MS = 100;

type TailRunnerHudState = {
    score: number;
    speed: number;
    tailLength: number;
    positionX: number;
    positionY: number;
    highScore: number;
};

type TailRunnerScoreBurst = {
    id: number;
    label: string;
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

const getDifficultyTargets = (score: number): TailRunnerDifficultyTargets => ({
    food:
        TAIL_RUNNER_INITIAL_FOOD_COUNT
        + Math.min(TAIL_RUNNER_MAX_EXTRA_FOOD, Math.floor(score / TAIL_RUNNER_FOOD_SCORE_STEP)),
    coin:
        TAIL_RUNNER_INITIAL_COIN_COUNT
        + Math.min(TAIL_RUNNER_MAX_EXTRA_COIN, Math.floor(score / TAIL_RUNNER_COIN_SCORE_STEP)),
    obstacle:
        TAIL_RUNNER_INITIAL_OBSTACLE_COUNT
        + Math.min(TAIL_RUNNER_MAX_EXTRA_OBSTACLE, Math.floor(score / TAIL_RUNNER_OBSTACLE_SCORE_STEP)),
    barrier:
        TAIL_RUNNER_INITIAL_BARRIER_COUNT
        + Math.min(TAIL_RUNNER_MAX_EXTRA_BARRIER, Math.floor(score / TAIL_RUNNER_BARRIER_SCORE_STEP)),
    enemy:
        TAIL_RUNNER_INITIAL_ENEMY_COUNT
        + Math.min(TAIL_RUNNER_MAX_EXTRA_ENEMY, Math.floor(score / TAIL_RUNNER_ENEMY_SCORE_STEP)),
    tyranno:
        TAIL_RUNNER_INITIAL_TYRANNO_COUNT
        + Math.min(TAIL_RUNNER_MAX_EXTRA_TYRANNO, Math.floor(score / TAIL_RUNNER_TYRANNO_SCORE_STEP)),
});

const reconcileDifficultyTargets = (state: ReturnType<typeof createInitialTailRunnerState>) => {
    const targets = getDifficultyTargets(state.score);
    const foodCount = state.entities.filter((entity) => entity.type === 'food').length;
    const coinCount = state.entities.filter((entity) => entity.type === 'coin').length;
    const obstacleCount = state.entities.filter((entity) => entity.type === 'obstacle').length;

    for (let index = foodCount; index < targets.food; index += 1) {
        state.entities.push(createRandomEntity('food', state.playerX, state.playerY));
    }
    for (let index = coinCount; index < targets.coin; index += 1) {
        state.entities.push(createRandomEntity('coin', state.playerX, state.playerY));
    }
    for (let index = obstacleCount; index < targets.obstacle; index += 1) {
        state.entities.push(createRandomEntity('obstacle', state.playerX, state.playerY));
    }
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
    positionX: Math.round(state.playerX),
    positionY: Math.round(state.playerY),
    highScore: state.highScore,
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
            const point = history[(index + 1) * TAIL_RUNNER_TAIL_SPACING] || history[history.length - 1] || { x: nextX, y: nextY };
            return {
                ...segment,
                x: point.x,
                y: point.y,
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

export const TailRunner: React.FC<GameComponentProps> = ({ onExit }) => {
    const { t, i18n } = useTranslation();
    const { speciesId, evolutionStage, characterName } = useNurturing();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const stageRef = useRef<HTMLDivElement | null>(null);
    const stateRef = useRef(createInitialTailRunnerState());
    const animationFrameRef = useRef<number | null>(null);
    const inputRef = useRef({ left: false, right: false, boost: false });
    const historyRef = useRef<{ x: number; y: number }[]>([]);
    const bestScoreRef = useRef(0);
    const lastHudSyncRef = useRef(0);
    const steerPointerIdRef = useRef<number | null>(null);
    const [gamePhase, setGamePhase] = useState<'start' | 'playing' | 'gameOver'>('start');
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [heartBursts, setHeartBursts] = useState<number[]>([]);
    const [scoreBursts, setScoreBursts] = useState<TailRunnerScoreBurst[]>([]);
    const [hudState, setHudState] = useState<TailRunnerHudState>({
        score: 0,
        speed: TAIL_RUNNER_BASE_SPEED,
        tailLength: 0,
        positionX: TAIL_RUNNER_WORLD_SIZE / 2,
        positionY: TAIL_RUNNER_WORLD_SIZE / 2,
        highScore: 0,
    });

    const runnerCharacter = useMemo(() => {
        const safeSpeciesId = speciesId || 'yellowJello';
        const character = createCharacter(safeSpeciesId, characterName || 'Jello');
        character.evolutionStage = Math.min(5, Math.max(1, evolutionStage || 1)) as EvolutionStage;
        if (characterName) {
            character.name = characterName;
        }
        return character;
    }, [characterName, evolutionStage, speciesId]);

    useEffect(() => {
        const newResources = {
            en: { translation: { games: { 'play-jello-comet': manifestEn } } },
            'en-UK': { translation: { games: { 'play-jello-comet': manifestEnUk } } },
            ko: { translation: { games: { 'play-jello-comet': manifestKo } } },
        };

        Object.keys(newResources).forEach((lang) => {
            i18n.addResourceBundle(
                lang,
                'translation',
                newResources[lang as keyof typeof newResources].translation,
                true,
                true
            );
        });
    }, [i18n]);

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

    const finishGame = useCallback(() => {
        const state = stateRef.current;
        state.isGameOver = true;
        state.highScore = Math.max(state.highScore, state.score);
        bestScoreRef.current = state.highScore;
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
            canvas.width = Math.max(1, Math.floor(width * window.devicePixelRatio));
            canvas.height = Math.max(1, Math.floor(height * window.devicePixelRatio));
            context.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        let previousTime = performance.now();

        const update = (deltaMs: number) => {
            const state = stateRef.current;
            const input = inputRef.current;
            const deltaMultiplier = Math.min(deltaMs / 16.6667, 1.8);

            state.bursts = state.bursts
                .map((burst) => ({
                    ...burst,
                    life: burst.life - deltaMultiplier,
                }))
                .filter((burst) => burst.life > 0);

            state.enemies = state.enemies.map((enemy) => updateEnemySnake(enemy, deltaMultiplier));
            state.tyrannos = state.tyrannos.map((tyranno) => (
                updateTyrannoEnemy(tyranno, state.playerX, state.playerY, deltaMultiplier)
            ));

            if (input.left) state.playerAngle -= TAIL_RUNNER_TURN_SPEED * deltaMultiplier;
            if (input.right) state.playerAngle += TAIL_RUNNER_TURN_SPEED * deltaMultiplier;

            state.playerSpeed = input.boost ? TAIL_RUNNER_BOOST_SPEED : TAIL_RUNNER_BASE_SPEED;
            state.playerX += Math.cos(state.playerAngle) * state.playerSpeed * deltaMultiplier;
            state.playerY += Math.sin(state.playerAngle) * state.playerSpeed * deltaMultiplier;

            const isOutOfBounds =
                state.playerX < 0
                || state.playerY < 0
                || state.playerX > TAIL_RUNNER_WORLD_SIZE
                || state.playerY > TAIL_RUNNER_WORLD_SIZE;

            if (isOutOfBounds) {
                finishGame();
                return;
            }

            const hitBarrier = state.barriers.some((barrier) =>
                collidesWithBarrier(state.playerX, state.playerY, TAIL_RUNNER_PLAYER_RADIUS, barrier)
            );

            if (hitBarrier) {
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

            if (hitEnemy || hitTyranno) {
                finishGame();
                return;
            }

            historyRef.current.unshift({ x: state.playerX, y: state.playerY });
            if (historyRef.current.length > TAIL_RUNNER_HISTORY_LIMIT) {
                historyRef.current.length = TAIL_RUNNER_HISTORY_LIMIT;
            }

            state.tail = state.tail.map((segment, index) => {
                const point = historyRef.current[(index + 1) * TAIL_RUNNER_TAIL_SPACING] || historyRef.current[historyRef.current.length - 1];
                if (!point) return segment;
                return {
                    ...segment,
                    x: point.x,
                    y: point.y,
                };
            });

            state.entities = state.entities.map((entity) => {
                const distance = Math.hypot(entity.x - state.playerX, entity.y - state.playerY);
                if (distance > entity.radius + TAIL_RUNNER_PLAYER_RADIUS) return entity;

                if (entity.type === 'food') {
                    state.score += TAIL_RUNNER_FOOD_SCORE;
                    playEatingSound(0.42);
                    triggerHeartBurst();
                    const tailPoint = historyRef.current[(state.tail.length + 1) * TAIL_RUNNER_TAIL_SPACING] || historyRef.current[historyRef.current.length - 1] || { x: state.playerX, y: state.playerY };
                    state.tail.push({
                        x: tailPoint.x,
                        y: tailPoint.y,
                        emoji: entity.emoji || TAIL_RUNNER_DEFAULT_TAIL_EMOJI,
                        facing: entity.facing,
                    });
                    return createRandomEntity('food', state.playerX, state.playerY);
                }

                if (entity.type === 'coin') {
                    const gainedScore = entity.scoreValue ?? TAIL_RUNNER_GEM_SCORES.berry;
                    state.score += gainedScore;
                    playClearSound(0.46);
                    triggerScoreBurst(gainedScore);
                    return createRandomEntity('coin', state.playerX, state.playerY);
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
                    return createRandomEntity('obstacle', state.playerX, state.playerY);
                }

                finishGame();
                return entity;
            });

            state.highScore = Math.max(state.highScore, state.score);
            reconcileDifficultyTargets(state);
            syncHudState();
        };

        const draw = () => {
            const state = stateRef.current;
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            const cameraX = state.playerX - width / 2;
            const cameraY = state.playerY - height / 2;

            context.clearRect(0, 0, width, height);

            context.fillStyle = '#93c86f';
            context.fillRect(0, 0, width, height);

            context.save();
            context.translate(-cameraX, -cameraY);

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

            context.strokeStyle = 'rgba(235, 251, 224, 0.22)';
            context.lineWidth = 10;
            context.strokeRect(0, 0, TAIL_RUNNER_WORLD_SIZE, TAIL_RUNNER_WORLD_SIZE);

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
                context.beginPath();
                context.roundRect(barrier.x, barrier.y, barrier.width, barrier.height, 12);
                context.fill();

                context.save();
                context.beginPath();
                context.roundRect(barrier.x, barrier.y, barrier.width, barrier.height, 12);
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
                context.beginPath();
                context.roundRect(barrier.x + 0.75, barrier.y + 0.75, barrier.width - 1.5, barrier.height - 1.5, 11);
                context.stroke();
                context.restore();
            });

            state.enemies.forEach((enemy) => {
                enemy.tail.forEach((segment, index) => {
                    context.save();
                    context.globalAlpha = Math.max(0.55, 0.92 - index * 0.06);
                    context.translate(segment.x, segment.y);
                    context.scale(segment.facing, 1);
                    context.font = '24px system-ui, Apple Color Emoji, Segoe UI Emoji, sans-serif';
                    context.textAlign = 'center';
                    context.textBaseline = 'middle';
                    context.fillText(segment.emoji, 0, 0);
                    context.restore();
                });

                context.save();
                context.translate(enemy.x, enemy.y);
                context.scale(Math.cos(enemy.angle) < 0 ? -1 : 1, 1);
                context.font = '32px system-ui, Apple Color Emoji, Segoe UI Emoji, sans-serif';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillText('👿', 0, 0);
                context.restore();
            });

            state.tyrannos.forEach((tyranno) => {
                const wobbleSeed = performance.now() / 140 + tyranno.x * 0.002 + tyranno.y * 0.0015;
                const wobbleStrength = tyranno.phase === 'charge' ? 0.2 : tyranno.phase === 'alert' ? 0.12 : 0.08;
                const wobbleAngle = Math.sin(wobbleSeed) * wobbleStrength;
                const wobbleOffsetY = Math.sin(wobbleSeed * 1.8) * (tyranno.phase === 'charge' ? 1.6 : 1);

                context.save();
                context.translate(tyranno.x, tyranno.y + wobbleOffsetY);
                context.rotate(wobbleAngle);
                context.scale(-tyranno.facing, 1);
                context.font = '68px system-ui, Apple Color Emoji, Segoe UI Emoji, sans-serif';
                context.textAlign = 'center';
                context.textBaseline = 'middle';

                context.save();
                context.translate(-2, 2);
                context.globalAlpha = 0.22;
                context.filter = 'grayscale(1) brightness(0.72)';
                context.fillText('🦖', 0, 0);
                context.restore();

                context.fillText('🦖', 0, 0);

                if (tyranno.phase === 'alert' || tyranno.phase === 'charge') {
                    context.save();
                    context.globalAlpha = tyranno.phase === 'charge' ? 1 : 0.9;
                    context.font = '18px system-ui, Apple Color Emoji, Segoe UI Emoji, sans-serif';
                    context.fillText('💢', 8, -26);
                    context.restore();
                }

                context.restore();
            });

            state.bursts.forEach((burst) => {
                const progress = 1 - burst.life / burst.maxLife;
                context.save();
                context.globalAlpha = Math.max(0, burst.life / burst.maxLife);
                context.translate(burst.x, burst.y - progress * 26);
                context.font = `${26 + progress * 6}px system-ui, Apple Color Emoji, Segoe UI Emoji, sans-serif`;
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillText(burst.emoji, 0, 0);
                context.restore();
            });

            state.entities.forEach((entity) => {
                if (entity.type === 'coin') {
                    drawGemEntity(context, entity);
                    return;
                }

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
            });

            state.tail.forEach((segment) => {
                context.save();
                context.translate(segment.x, segment.y);
                context.scale(segment.facing, 1);
                context.font = '26px system-ui, Apple Color Emoji, Segoe UI Emoji, sans-serif';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillText(segment.emoji, 0, 0);
                context.restore();
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
        };

        const loop = (now: number) => {
            if (stateRef.current.isGameOver) return;
            const deltaMs = now - previousTime;
            previousTime = now;
            update(deltaMs);
            draw();
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
        const nextState = createInitialTailRunnerState();
        nextState.highScore = bestScoreRef.current;
        nextState.entities = createInitialEntities(nextState.playerX, nextState.playerY);
        nextState.barriers = createInitialBarriers(nextState.playerX, nextState.playerY);
        nextState.enemies = createInitialEnemies(nextState.playerX, nextState.playerY);
        nextState.tyrannos = createInitialTyrannos(nextState.playerX, nextState.playerY);
        stateRef.current = nextState;
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
                    <div className="tail-runner__header-stats" aria-label="Game stats">
                        <div className="tail-runner__header-stat">
                            <span className="tail-runner__header-stat-label">{t(`${GAME_LOCALE_KEY}.stats.tail`)}</span>
                            <strong className="tail-runner__header-stat-value">{hudState.tailLength}</strong>
                        </div>
                        <div className="tail-runner__header-stat">
                            <span className="tail-runner__header-stat-label">{t(`${GAME_LOCALE_KEY}.stats.score`)}</span>
                            <strong className="tail-runner__header-stat-value">{hudState.score}</strong>
                        </div>
                        <div className="tail-runner__header-stat">
                            <span className="tail-runner__header-stat-label">{t(`${GAME_LOCALE_KEY}.stats.best`)}</span>
                            <strong className="tail-runner__header-stat-value">{hudState.highScore}</strong>
                        </div>
                    </div>
                    <div className="tail-runner__header-actions">
                        <button
                            type="button"
                            className="tail-runner__close tail-runner__help"
                            onClick={() => setIsHelpOpen(true)}
                            aria-label={t(`${GAME_LOCALE_KEY}.controlsTitle`)}
                        >
                            <span className="tail-runner__help-mark">?</span>
                        </button>
                    <button
                        type="button"
                        className="tail-runner__close"
                        onClick={onExit}
                        aria-label={t('common.close')}
                    >
                        <i className="fas fa-xmark" aria-hidden="true" />
                    </button>
                    </div>
                </header>

                <section className="tail-runner__hero">
                    <div
                        ref={stageRef}
                        className="tail-runner__stage"
                        aria-label={t(`${GAME_LOCALE_KEY}.stageLabel`)}
                        onPointerDown={handleStagePointerDown}
                        onPointerMove={handleStagePointerMove}
                        onPointerUp={handleStagePointerUp}
                        onPointerCancel={handleStagePointerUp}
                        onPointerLeave={handleStagePointerUp}
                    >
                        <canvas ref={canvasRef} className="tail-runner__canvas" />
                        <div className="tail-runner__player-overlay" aria-hidden="true">
                            <div className="tail-runner__avatar-core">
                                <div className="tail-runner__avatar-glow" aria-hidden="true" />
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
                                <div className="tail-runner__start-card">
                                    <h2>{t(`${GAME_LOCALE_KEY}.startTitle`)}</h2>
                                    <p>{t(`${GAME_LOCALE_KEY}.startDescription`)}</p>
                                    <button type="button" className="tail-runner__start-btn" onClick={startGame}>
                                        {t(`${GAME_LOCALE_KEY}.startButton`)}
                                    </button>
                                </div>
                            </div>
                        )}
                        {gamePhase === 'gameOver' && (
                            <div className="tail-runner__start-screen">
                                <div className="tail-runner__start-card">
                                    <h2>{t(`${GAME_LOCALE_KEY}.gameOverTitle`)}</h2>
                                    <p>{t(`${GAME_LOCALE_KEY}.gameOverDescription`, { score: hudState.score })}</p>
                                    <button type="button" className="tail-runner__start-btn" onClick={startGame}>
                                        {t(`${GAME_LOCALE_KEY}.retryButton`)}
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
                                className="tail-runner__touch-btn tail-runner__touch-btn--boost"
                                onPointerDown={() => setInputPressed('boost', true)}
                                onPointerUp={() => setInputPressed('boost', false)}
                                onPointerCancel={() => setInputPressed('boost', false)}
                                onPointerLeave={() => setInputPressed('boost', false)}
                                disabled={gamePhase !== 'playing'}
                            >
                                <span className="tail-runner__touch-icon">⚡</span>
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
                            <p>{t(`${GAME_LOCALE_KEY}.currentJelloDescription`)}</p>
                        </div>

                        <div className="tail-runner__stats">
                            <div className="tail-runner__stat">
                                <span className="tail-runner__stat-label">{t(`${GAME_LOCALE_KEY}.stats.speed`)}</span>
                                <span className="tail-runner__stat-value">{hudState.speed.toFixed(1)}</span>
                            </div>
                            <div className="tail-runner__stat">
                                <span className="tail-runner__stat-label">{t(`${GAME_LOCALE_KEY}.stats.boost`)}</span>
                                <span className="tail-runner__stat-value">{TAIL_RUNNER_BOOST_SPEED}</span>
                            </div>
                            <div className="tail-runner__stat">
                                <span className="tail-runner__stat-label">{t(`${GAME_LOCALE_KEY}.stats.score`)}</span>
                                <span className="tail-runner__stat-value">{hudState.score}</span>
                            </div>
                            <div className="tail-runner__stat">
                                <span className="tail-runner__stat-label">{t(`${GAME_LOCALE_KEY}.stats.tail`)}</span>
                                <span className="tail-runner__stat-value">{hudState.tailLength}</span>
                            </div>
                            <div className="tail-runner__stat">
                                <span className="tail-runner__stat-label">{t(`${GAME_LOCALE_KEY}.stats.best`)}</span>
                                <span className="tail-runner__stat-value">{hudState.highScore}</span>
                            </div>
                        </div>

                        <div className="tail-runner__card">
                            <h3>{t(`${GAME_LOCALE_KEY}.currentPositionTitle`)}</h3>
                            <p>{t(`${GAME_LOCALE_KEY}.currentPositionValue`, { x: hudState.positionX, y: hudState.positionY })}</p>
                        </div>

                        <div className="tail-runner__card">
                            <h3>{t(`${GAME_LOCALE_KEY}.controlsTitle`)}</h3>
                            <ul className="tail-runner__controls">
                                <li>{t(`${GAME_LOCALE_KEY}.controlsAuto`)}</li>
                                <li>{t(`${GAME_LOCALE_KEY}.controlsTurn`)}</li>
                                <li>{t(`${GAME_LOCALE_KEY}.controlsBoost`)}</li>
                                <li>{t(`${GAME_LOCALE_KEY}.controlsTouch`)}</li>
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
                        aria-label={t(`${GAME_LOCALE_KEY}.controlsTitle`)}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="tail-runner__modal-head">
                            <h3>{t(`${GAME_LOCALE_KEY}.controlsTitle`)}</h3>
                            <button
                                type="button"
                                className="tail-runner__modal-close"
                                onClick={() => setIsHelpOpen(false)}
                                aria-label={t('common.close')}
                            >
                                <i className="fas fa-xmark" aria-hidden="true" />
                            </button>
                        </div>
                        <ul className="tail-runner__controls tail-runner__controls--modal">
                            <li>{t(`${GAME_LOCALE_KEY}.controlsAuto`)}</li>
                            <li>{t(`${GAME_LOCALE_KEY}.controlsTurn`)}</li>
                            <li>{t(`${GAME_LOCALE_KEY}.controlsBoost`)}</li>
                            <li>{t(`${GAME_LOCALE_KEY}.controlsTouch`)}</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TailRunner;
