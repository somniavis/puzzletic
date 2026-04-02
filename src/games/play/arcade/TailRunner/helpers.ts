import * as constants from './constants';
import type {
    TailRunnerBarrier,
    TailRunnerBurst,
    TailRunnerEnemySnake,
    TailRunnerEntity,
    TailRunnerEntityType,
    TailRunnerGemTier,
    TailRunnerHudState,
    TailRunnerState,
    TailRunnerTyrannoEnemy,
} from './types';

type TailRunnerDifficultyTargets = {
    food: number;
    coin: number;
    obstacle: number;
    barrier: number;
    enemy: number;
    tyranno: number;
};

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);
const pickRandom = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];
const randomIntBetween = (min: number, max: number) => Math.floor(randomBetween(min, max + 1));

const GEM_TIER_WEIGHTS: Array<{ tier: TailRunnerGemTier; weight: number }> = [
    { tier: 'diamond', weight: 0.18 },
    { tier: 'gold', weight: 0.34 },
    { tier: 'berry', weight: 0.48 },
];

export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const rollNextBoostSpawnTimer = () =>
    randomBetween(constants.TAIL_RUNNER_BOOST_SPAWN_MIN_TIME, constants.TAIL_RUNNER_BOOST_SPAWN_MAX_TIME);

export const rollNextMagnetSpawnTimer = () =>
    randomBetween(constants.TAIL_RUNNER_MAGNET_SPAWN_MIN_TIME, constants.TAIL_RUNNER_MAGNET_SPAWN_MAX_TIME);

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

export const getTailRunnerHistoryOffset = (index: number) =>
    constants.TAIL_RUNNER_FIRST_TAIL_SPACING + (index * constants.TAIL_RUNNER_TAIL_SPACING);

export const getTailRunnerHistoryPoint = (
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

export const smoothTailRunnerPoint = (
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

export const createBarrier = (avoidX?: number, avoidY?: number): TailRunnerBarrier => {
    const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
    const length = pickRandom(constants.TAIL_RUNNER_BARRIER_LENGTHS);
    const width = orientation === 'horizontal' ? length : constants.TAIL_RUNNER_BARRIER_THICKNESS;
    const height = orientation === 'horizontal' ? constants.TAIL_RUNNER_BARRIER_THICKNESS : length;

    let x = randomBetween(
        constants.TAIL_RUNNER_ENTITY_RESPAWN_PADDING,
        constants.TAIL_RUNNER_WORLD_SIZE - constants.TAIL_RUNNER_ENTITY_RESPAWN_PADDING - width
    );
    let y = randomBetween(
        constants.TAIL_RUNNER_ENTITY_RESPAWN_PADDING,
        constants.TAIL_RUNNER_WORLD_SIZE - constants.TAIL_RUNNER_ENTITY_RESPAWN_PADDING - height
    );

    if (typeof avoidX === 'number' && typeof avoidY === 'number') {
        let attempts = 0;
        while (
            avoidX > x - 120
            && avoidX < x + width + 120
            && avoidY > y - 120
            && avoidY < y + height + 120
            && attempts < 12
        ) {
            x = randomBetween(
                constants.TAIL_RUNNER_ENTITY_RESPAWN_PADDING,
                constants.TAIL_RUNNER_WORLD_SIZE - constants.TAIL_RUNNER_ENTITY_RESPAWN_PADDING - width
            );
            y = randomBetween(
                constants.TAIL_RUNNER_ENTITY_RESPAWN_PADDING,
                constants.TAIL_RUNNER_WORLD_SIZE - constants.TAIL_RUNNER_ENTITY_RESPAWN_PADDING - height
            );
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

export const collidesWithBarrier = (playerX: number, playerY: number, radius: number, barrier: TailRunnerBarrier) => {
    const closestX = clamp(playerX, barrier.x, barrier.x + barrier.width);
    const closestY = clamp(playerY, barrier.y, barrier.y + barrier.height);
    return Math.hypot(playerX - closestX, playerY - closestY) <= radius;
};

export const createBurst = (x: number, y: number, emoji = '💥'): TailRunnerBurst => ({
    id: `burst-${Math.random().toString(36).slice(2, 10)}`,
    x,
    y,
    emoji,
    life: constants.TAIL_RUNNER_BURST_LIFE,
    maxLife: constants.TAIL_RUNNER_BURST_LIFE,
});

export const createEnemySnake = (avoidX?: number, avoidY?: number): TailRunnerEnemySnake => {
    let x = randomBetween(constants.TAIL_RUNNER_ENTITY_RESPAWN_PADDING, constants.TAIL_RUNNER_WORLD_SIZE - constants.TAIL_RUNNER_ENTITY_RESPAWN_PADDING);
    let y = randomBetween(constants.TAIL_RUNNER_ENTITY_RESPAWN_PADDING, constants.TAIL_RUNNER_WORLD_SIZE - constants.TAIL_RUNNER_ENTITY_RESPAWN_PADDING);

    if (typeof avoidX === 'number' && typeof avoidY === 'number') {
        let attempts = 0;
        while (Math.hypot(x - avoidX, y - avoidY) < 420 && attempts < 12) {
            x = randomBetween(constants.TAIL_RUNNER_ENTITY_RESPAWN_PADDING, constants.TAIL_RUNNER_WORLD_SIZE - constants.TAIL_RUNNER_ENTITY_RESPAWN_PADDING);
            y = randomBetween(constants.TAIL_RUNNER_ENTITY_RESPAWN_PADDING, constants.TAIL_RUNNER_WORLD_SIZE - constants.TAIL_RUNNER_ENTITY_RESPAWN_PADDING);
            attempts += 1;
        }
    }

    const tailCount = randomIntBetween(constants.TAIL_RUNNER_ENEMY_MIN_TAIL_COUNT, constants.TAIL_RUNNER_ENEMY_MAX_TAIL_COUNT);
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
        speed: constants.TAIL_RUNNER_ENEMY_SPEED * randomBetween(0.92, 1.12),
        turnDrift: randomBetween(-0.018, 0.018),
        tail,
        history: [],
    };
};

export const createTyrannoEnemy = (avoidX?: number, avoidY?: number): TailRunnerTyrannoEnemy => {
    let x = randomBetween(constants.TAIL_RUNNER_ENTITY_RESPAWN_PADDING, constants.TAIL_RUNNER_WORLD_SIZE - constants.TAIL_RUNNER_ENTITY_RESPAWN_PADDING);
    let y = randomBetween(constants.TAIL_RUNNER_ENTITY_RESPAWN_PADDING, constants.TAIL_RUNNER_WORLD_SIZE - constants.TAIL_RUNNER_ENTITY_RESPAWN_PADDING);

    if (typeof avoidX === 'number' && typeof avoidY === 'number') {
        let attempts = 0;
        while (Math.hypot(x - avoidX, y - avoidY) < 460 && attempts < 14) {
            x = randomBetween(constants.TAIL_RUNNER_ENTITY_RESPAWN_PADDING, constants.TAIL_RUNNER_WORLD_SIZE - constants.TAIL_RUNNER_ENTITY_RESPAWN_PADDING);
            y = randomBetween(constants.TAIL_RUNNER_ENTITY_RESPAWN_PADDING, constants.TAIL_RUNNER_WORLD_SIZE - constants.TAIL_RUNNER_ENTITY_RESPAWN_PADDING);
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

export const createRandomEntity = (
    type: TailRunnerEntityType,
    avoidX?: number,
    avoidY?: number
): TailRunnerEntity => {
    let x = randomBetween(constants.TAIL_RUNNER_ENTITY_RESPAWN_PADDING, constants.TAIL_RUNNER_WORLD_SIZE - constants.TAIL_RUNNER_ENTITY_RESPAWN_PADDING);
    let y = randomBetween(constants.TAIL_RUNNER_ENTITY_RESPAWN_PADDING, constants.TAIL_RUNNER_WORLD_SIZE - constants.TAIL_RUNNER_ENTITY_RESPAWN_PADDING);

    if (typeof avoidX === 'number' && typeof avoidY === 'number') {
        let attempts = 0;
        while (Math.hypot(x - avoidX, y - avoidY) < 220 && attempts < 10) {
            x = randomBetween(constants.TAIL_RUNNER_ENTITY_RESPAWN_PADDING, constants.TAIL_RUNNER_WORLD_SIZE - constants.TAIL_RUNNER_ENTITY_RESPAWN_PADDING);
            y = randomBetween(constants.TAIL_RUNNER_ENTITY_RESPAWN_PADDING, constants.TAIL_RUNNER_WORLD_SIZE - constants.TAIL_RUNNER_ENTITY_RESPAWN_PADDING);
            attempts += 1;
        }
    }

    if (type === 'food') {
        return createEntity(type, x, y, pickRandom(constants.TAIL_RUNNER_FOOD_EMOJIS), 20, Math.random() < 0.5 ? -1 : 1);
    }
    if (type === 'coin') {
        const coinTier = pickGemTier();
        return {
            ...createEntity(type, x, y, '', 18),
            coinTier,
            scoreValue: constants.TAIL_RUNNER_GEM_SCORES[coinTier],
        };
    }
    if (type === 'boost') {
        return createEntity(type, x, y, '⚡', 18);
    }
    if (type === 'magnet') {
        return createEntity(type, x, y, '🧲', 20);
    }
    return createEntity(type, x, y, pickRandom(constants.TAIL_RUNNER_OBSTACLE_EMOJIS), 22);
};

export const createInitialEntities = (playerX: number, playerY: number) => ([
    ...Array.from({ length: constants.TAIL_RUNNER_INITIAL_FOOD_COUNT }, () => createRandomEntity('food', playerX, playerY)),
    ...Array.from({ length: constants.TAIL_RUNNER_INITIAL_COIN_COUNT }, () => createRandomEntity('coin', playerX, playerY)),
    ...Array.from({ length: constants.TAIL_RUNNER_INITIAL_OBSTACLE_COUNT }, () => createRandomEntity('obstacle', playerX, playerY)),
]);

export const createInitialBarriers = (playerX: number, playerY: number) => (
    Array.from({ length: constants.TAIL_RUNNER_INITIAL_BARRIER_COUNT }, () => createBarrier(playerX, playerY))
);

export const createInitialEnemies = (playerX: number, playerY: number) => (
    Array.from({ length: constants.TAIL_RUNNER_INITIAL_ENEMY_COUNT }, () => createEnemySnake(playerX, playerY))
);

export const createInitialTyrannos = (playerX: number, playerY: number) => (
    Array.from({ length: constants.TAIL_RUNNER_INITIAL_TYRANNO_COUNT }, () => createTyrannoEnemy(playerX, playerY))
);

export const createPreparedTailRunnerState = (highScore: number, bestTail: number) => {
    const nextState = constants.createInitialTailRunnerState();
    nextState.highScore = highScore;
    nextState.bestTail = bestTail;
    nextState.boostSpawnTimer = rollNextBoostSpawnTimer();
    nextState.magnetSpawnTimer = rollNextMagnetSpawnTimer();
    nextState.entities = createInitialEntities(nextState.playerX, nextState.playerY);
    nextState.barriers = createInitialBarriers(nextState.playerX, nextState.playerY);
    nextState.enemies = createInitialEnemies(nextState.playerX, nextState.playerY);
    nextState.tyrannos = createInitialTyrannos(nextState.playerX, nextState.playerY);
    return nextState;
};

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
        constants.TAIL_RUNNER_INITIAL_FOOD_COUNT
        + Math.min(constants.TAIL_RUNNER_MAX_EXTRA_FOOD, Math.floor(score / constants.TAIL_RUNNER_FOOD_SCORE_STEP)),
    coin:
        constants.TAIL_RUNNER_INITIAL_COIN_COUNT
        + Math.min(constants.TAIL_RUNNER_MAX_EXTRA_COIN, Math.floor(score / constants.TAIL_RUNNER_COIN_SCORE_STEP))
        + (shieldActive ? constants.TAIL_RUNNER_SHIELD_GEM_BONUS : 0),
    obstacle:
        constants.TAIL_RUNNER_INITIAL_OBSTACLE_COUNT
        + Math.min(constants.TAIL_RUNNER_MAX_EXTRA_OBSTACLE, Math.floor(score / constants.TAIL_RUNNER_OBSTACLE_SCORE_STEP)),
    barrier:
        constants.TAIL_RUNNER_INITIAL_BARRIER_COUNT
        + Math.min(constants.TAIL_RUNNER_MAX_EXTRA_BARRIER, Math.floor(score / constants.TAIL_RUNNER_BARRIER_SCORE_STEP)),
    enemy:
        constants.TAIL_RUNNER_INITIAL_ENEMY_COUNT
        + Math.min(
            constants.TAIL_RUNNER_MAX_EXTRA_ENEMY,
            Math.floor(score / constants.TAIL_RUNNER_ENEMY_SCORE_STEP) * constants.TAIL_RUNNER_ENEMY_PER_STEP
        ),
    tyranno:
        constants.TAIL_RUNNER_INITIAL_TYRANNO_COUNT
        + Math.min(constants.TAIL_RUNNER_MAX_EXTRA_TYRANNO, Math.floor(score / constants.TAIL_RUNNER_TYRANNO_SCORE_STEP)),
});

export const reconcileDifficultyTargets = (state: TailRunnerState) => {
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

export const buildHudState = (state: TailRunnerState): TailRunnerHudState => ({
    score: state.score,
    speed: state.playerSpeed,
    tailLength: state.tail.length,
    bestTail: state.bestTail,
    positionX: Math.round(state.playerX),
    positionY: Math.round(state.playerY),
    highScore: state.highScore,
    shieldCharges: state.shieldCharges,
});

export const updateEnemySnake = (enemy: TailRunnerEnemySnake, deltaMultiplier: number): TailRunnerEnemySnake => {
    let nextAngle = enemy.angle + enemy.turnDrift * deltaMultiplier;
    let nextTurnDrift = enemy.turnDrift;

    if (Math.random() < 0.015 * deltaMultiplier) {
        nextTurnDrift = randomBetween(-0.026, 0.026);
    }

    const projectedX = enemy.x + Math.cos(nextAngle) * enemy.speed * deltaMultiplier;
    const projectedY = enemy.y + Math.sin(nextAngle) * enemy.speed * deltaMultiplier;

    if (
        projectedX < constants.TAIL_RUNNER_ENTITY_RESPAWN_PADDING
        || projectedY < constants.TAIL_RUNNER_ENTITY_RESPAWN_PADDING
        || projectedX > constants.TAIL_RUNNER_WORLD_SIZE - constants.TAIL_RUNNER_ENTITY_RESPAWN_PADDING
        || projectedY > constants.TAIL_RUNNER_WORLD_SIZE - constants.TAIL_RUNNER_ENTITY_RESPAWN_PADDING
    ) {
        nextAngle += Math.PI * 0.72;
        nextTurnDrift *= -0.6;
    }

    const nextX = enemy.x + Math.cos(nextAngle) * enemy.speed * deltaMultiplier;
    const nextY = enemy.y + Math.sin(nextAngle) * enemy.speed * deltaMultiplier;
    const facing: -1 | 1 = Math.cos(nextAngle) < 0 ? -1 : 1;

    const history = [{ x: nextX, y: nextY }, ...enemy.history];
    history.length = Math.min(history.length, constants.TAIL_RUNNER_HISTORY_LIMIT);

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

export const updateTyrannoEnemy = (
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
        if (distanceToPlayer <= constants.TAIL_RUNNER_TYRANNO_DETECT_RADIUS) {
            next.phase = 'alert';
            next.timer = constants.TAIL_RUNNER_TYRANNO_ALERT_TIME;
            next.targetAngle = playerAngle;
            next.turnDrift = 0;
        }
    } else if (next.phase === 'alert') {
        const angleDiff = normalizeAngle(next.targetAngle - next.angle);
        next.angle += clamp(angleDiff, -0.09 * deltaMultiplier, 0.09 * deltaMultiplier);
        if (next.timer <= 0) {
            next.phase = 'charge';
            next.timer = constants.TAIL_RUNNER_TYRANNO_CHARGE_TIME;
            next.angle = next.targetAngle;
        }
    } else if (next.phase === 'charge') {
        if (next.timer <= 0) {
            next.phase = 'cooldown';
            next.timer = constants.TAIL_RUNNER_TYRANNO_COOLDOWN_TIME;
            next.turnDrift = randomBetween(-0.015, 0.015);
        }
    } else if (next.phase === 'cooldown') {
        next.angle += next.turnDrift * deltaMultiplier;
        if (next.timer <= 0) {
            next.phase = 'roam';
            next.timer = randomBetween(20, 54);
        }
    }

    const speed = next.phase === 'charge' ? constants.TAIL_RUNNER_TYRANNO_CHARGE_SPEED : constants.TAIL_RUNNER_TYRANNO_ROAM_SPEED;
    let nextX = next.x + Math.cos(next.angle) * speed * deltaMultiplier;
    let nextY = next.y + Math.sin(next.angle) * speed * deltaMultiplier;

    const min = constants.TAIL_RUNNER_ENTITY_RESPAWN_PADDING;
    const max = constants.TAIL_RUNNER_WORLD_SIZE - constants.TAIL_RUNNER_ENTITY_RESPAWN_PADDING;
    if (nextX < min || nextX > max || nextY < min || nextY > max) {
        next.angle = normalizeAngle(next.angle + Math.PI * 0.82);
        nextX = clamp(nextX, min, max);
        nextY = clamp(nextY, min, max);
        if (next.phase === 'charge') {
            next.phase = 'cooldown';
            next.timer = constants.TAIL_RUNNER_TYRANNO_COOLDOWN_TIME;
        }
    }

    return {
        ...next,
        x: nextX,
        y: nextY,
        facing: Math.cos(next.angle) < 0 ? -1 : 1,
    };
};
