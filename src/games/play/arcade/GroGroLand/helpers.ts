import {
    GROGRO_LAND_BOMB_RADIUS,
    GROGRO_LAND_ENEMY_COUNT,
    GROGRO_LAND_ENEMY_EMOJI_POOL,
    GROGRO_LAND_ENEMY_PERSONALITY_CONFIG,
    GROGRO_LAND_BOOST_DURATION_FRAMES,
    GROGRO_LAND_BOOST_MULTIPLIER,
    GROGRO_LAND_BOOST_WARNING_FRAMES,
    GROGRO_LAND_BOUNDARY_PADDING,
    GROGRO_LAND_FREEZE_DURATION_FRAMES,
    GROGRO_LAND_HUD_SYNC_MS,
    GROGRO_LAND_ITEM_EMOJI_MAP,
    GROGRO_LAND_ITEM_INITIAL_COUNT,
    GROGRO_LAND_ITEM_KIND_POOL,
    GROGRO_LAND_ITEM_MAX_COUNT,
    GROGRO_LAND_ITEM_SPAWN_BATCH_COUNT,
    GROGRO_LAND_ITEM_SPAWN_INTERVAL_FRAMES,
    GROGRO_LAND_OWNER_COLOR_POOL,
    GROGRO_LAND_PLAYER_OWNER_ID,
    GROGRO_LAND_PLAYER_SPEED,
    GROGRO_LAND_SLOW_DURATION_FRAMES,
    GROGRO_LAND_SLOW_MULTIPLIER,
    GROGRO_LAND_START_TERRITORY_SIZE,
    GROGRO_LAND_TILE_SIZE,
    GROGRO_LAND_TRAIL_SAMPLE_DISTANCE,
    GROGRO_LAND_WORLD_HEIGHT,
    GROGRO_LAND_WORLD_WIDTH,
} from './constants';
import type {
    GroGroLandActor,
    GroGroLandCaptureEffect,
    GroGroLandEnemy,
    GroGroLandEnemyPersonality,
    GroGroLandHudState,
    GroGroLandItem,
    GroGroLandItemKind,
    GroGroLandOwnerPalette,
    GroGroLandState,
} from './types';

let grogroCaptureEffectId = 1;
let grogroItemId = 1;

const GROGRO_LAND_SPAWN_POINTS = [
    { x: 360, y: 360 },
    { x: GROGRO_LAND_WORLD_WIDTH - 360, y: 360 },
    { x: GROGRO_LAND_WORLD_WIDTH / 2, y: GROGRO_LAND_WORLD_HEIGHT / 2 },
    { x: 360, y: GROGRO_LAND_WORLD_HEIGHT - 360 },
    { x: GROGRO_LAND_WORLD_WIDTH - 360, y: GROGRO_LAND_WORLD_HEIGHT - 360 },
] as const;

const shuffleArray = <T,>(items: readonly T[]) => {
    const nextItems = [...items];
    for (let index = nextItems.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [nextItems[index], nextItems[swapIndex]] = [nextItems[swapIndex], nextItems[index]];
    }
    return nextItems;
};

const shuffleSpawnPoints = () => shuffleArray(GROGRO_LAND_SPAWN_POINTS);
const shuffleOwnerPalettes = () => shuffleArray(GROGRO_LAND_OWNER_COLOR_POOL);
const shuffleEnemyPersonalities = () => shuffleArray<GroGroLandEnemyPersonality>(['conservative', 'balanced', 'aggressive']);
const shuffleEnemyEmojis = () => shuffleArray(GROGRO_LAND_ENEMY_EMOJI_POOL);

const pickRandomCardinalDirection = () => {
    const directions = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
    return directions[Math.floor(Math.random() * directions.length)];
};

const createActor = (
    id: string,
    ownerId: number,
    x: number,
    y: number,
    colors: GroGroLandOwnerPalette
): GroGroLandActor => ({
    id,
    ownerId,
    x,
    y,
    direction: pickRandomCardinalDirection(),
    speed: GROGRO_LAND_PLAYER_SPEED,
    status: 'safe',
    trail: [],
    captureExitPoint: null,
    duelWithId: null,
    colors,
    spawnX: x,
    spawnY: y,
    boostTimer: 0,
    slowTimer: 0,
    freezeTimer: 0,
});

const getItemSpawnCooldown = () => GROGRO_LAND_ITEM_SPAWN_INTERVAL_FRAMES;

const createRandomItem = (x: number, y: number): GroGroLandItem => {
    const kind = GROGRO_LAND_ITEM_KIND_POOL[Math.floor(Math.random() * GROGRO_LAND_ITEM_KIND_POOL.length)] as GroGroLandItemKind;
    return {
        id: `item-${grogroItemId++}`,
        x,
        y,
        kind,
        emoji: GROGRO_LAND_ITEM_EMOJI_MAP[kind],
    };
};

const trySpawnItemAtNeutralPosition = (state: GroGroLandState) => {
    for (let attempt = 0; attempt < 24; attempt += 1) {
        const x = 200 + Math.random() * (GROGRO_LAND_WORLD_WIDTH - 400);
        const y = 200 + Math.random() * (GROGRO_LAND_WORLD_HEIGHT - 400);
        if (getOwnerAtWorldPosition(state.grid, state.cols, state.rows, x, y) !== 0) continue;

        const overlapsActor = [state.player, ...state.enemies].some((actor) => {
            if (actor.status === 'dead') return false;
            const dx = actor.x - x;
            const dy = actor.y - y;
            return (dx * dx) + (dy * dy) < (110 * 110);
        });
        if (overlapsActor) continue;

        const overlapsItem = state.items.some((item) => {
            const dx = item.x - x;
            const dy = item.y - y;
            return (dx * dx) + (dy * dy) < (90 * 90);
        });
        if (overlapsItem) continue;

        state.items.push(createRandomItem(x, y));
        return true;
    }

    return false;
};

const claimRect = (
    grid: Uint16Array,
    cols: number,
    rows: number,
    left: number,
    top: number,
    width: number,
    height: number,
    ownerId: number
) => {
    const startCol = Math.max(0, Math.floor(left / GROGRO_LAND_TILE_SIZE));
    const endCol = Math.min(cols - 1, Math.floor((left + width) / GROGRO_LAND_TILE_SIZE));
    const startRow = Math.max(0, Math.floor(top / GROGRO_LAND_TILE_SIZE));
    const endRow = Math.min(rows - 1, Math.floor((top + height) / GROGRO_LAND_TILE_SIZE));

    for (let row = startRow; row <= endRow; row += 1) {
        for (let col = startCol; col <= endCol; col += 1) {
            grid[row * cols + col] = ownerId;
        }
    }
};

const createEnemy = (
    index: number,
    position: { x: number; y: number },
    personality: GroGroLandEnemyPersonality,
    emoji: string,
    colors: GroGroLandOwnerPalette
): GroGroLandEnemy => {
    const config = GROGRO_LAND_ENEMY_PERSONALITY_CONFIG[personality];
    const actor = createActor(
        `enemy-${index + 1}`,
        index + 2,
        position.x,
        position.y,
        colors
    );

    return {
        ...actor,
        emoji,
        personality,
        aiMode: 'patrol',
        decisionCooldown: config.patrolCooldown + (index * config.patrolVariance),
        expandFrames: 0,
    };
};

const calculateOwnerTileCounts = (grid: Uint16Array, ownerIds: number[]) => {
    const counts = new Map<number, number>();
    ownerIds.forEach((ownerId) => {
        counts.set(ownerId, 0);
    });

    for (let index = 0; index < grid.length; index += 1) {
        const ownerId = grid[index];
        if (!counts.has(ownerId)) continue;
        counts.set(ownerId, (counts.get(ownerId) ?? 0) + 1);
    }

    return counts;
};

export const calculateGroGroLandMetrics = (state: GroGroLandState) => {
    const ownerIds = [GROGRO_LAND_PLAYER_OWNER_ID, ...state.enemies.map((enemy) => enemy.ownerId)];
    const counts = calculateOwnerTileCounts(state.grid, ownerIds);
    const totalTiles = state.grid.length;
    const playerTiles = counts.get(GROGRO_LAND_PLAYER_OWNER_ID) ?? 0;
    const playerLandPercent = Number(((playerTiles / totalTiles) * 100).toFixed(1));
    const enemyLandPercents = state.enemies.map((enemy) => {
        const tiles = counts.get(enemy.ownerId) ?? 0;
        return Number(((tiles / totalTiles) * 100).toFixed(1));
    });

    return {
        playerTiles,
        playerLandPercent,
        enemyLandPercents,
    };
};

export const applyGroGroLandMetrics = (
    state: GroGroLandState,
    metrics = calculateGroGroLandMetrics(state)
) => {
    state.score = metrics.playerTiles;
    state.bestScore = Math.max(state.bestScore, metrics.playerTiles);
    state.landPercent = metrics.playerLandPercent;
    state.bestLandPercent = Math.max(state.bestLandPercent, metrics.playerLandPercent);
    return metrics;
};

export const replaceOwnerTiles = (grid: Uint16Array, fromOwnerId: number, toOwnerId: number) => {
    for (let index = 0; index < grid.length; index += 1) {
        if (grid[index] === fromOwnerId) {
            grid[index] = toOwnerId;
        }
    }
};

export const createInitialGroGroLandState = (
    bestScore = 0,
    bestLandPercent = 0
): GroGroLandState => {
    const cols = Math.floor(GROGRO_LAND_WORLD_WIDTH / GROGRO_LAND_TILE_SIZE);
    const rows = Math.floor(GROGRO_LAND_WORLD_HEIGHT / GROGRO_LAND_TILE_SIZE);
    const grid = new Uint16Array(cols * rows);
    const [playerSpawn, ...enemySpawns] = shuffleSpawnPoints();
    const [playerColors, ...enemyColors] = shuffleOwnerPalettes();
    const enemyPersonalities = shuffleEnemyPersonalities();
    const enemyEmojis = shuffleEnemyEmojis();

    const player = createActor(
        'player',
        GROGRO_LAND_PLAYER_OWNER_ID,
        playerSpawn.x,
        playerSpawn.y,
        playerColors
    );

    claimRect(
        grid,
        cols,
        rows,
        playerSpawn.x - GROGRO_LAND_START_TERRITORY_SIZE / 2,
        playerSpawn.y - GROGRO_LAND_START_TERRITORY_SIZE / 2,
        GROGRO_LAND_START_TERRITORY_SIZE,
        GROGRO_LAND_START_TERRITORY_SIZE,
        GROGRO_LAND_PLAYER_OWNER_ID
    );

    const enemies = Array.from(
        { length: GROGRO_LAND_ENEMY_COUNT },
        (_, index) => createEnemy(
            index,
            enemySpawns[index],
            enemyPersonalities[index % enemyPersonalities.length],
            enemyEmojis[index % enemyEmojis.length],
            enemyColors[index] ?? GROGRO_LAND_OWNER_COLOR_POOL[index + 1]
        )
    );

    enemies.forEach((enemy) => {
        claimRect(
            grid,
            cols,
            rows,
            enemy.spawnX - GROGRO_LAND_START_TERRITORY_SIZE / 2,
            enemy.spawnY - GROGRO_LAND_START_TERRITORY_SIZE / 2,
            GROGRO_LAND_START_TERRITORY_SIZE,
            GROGRO_LAND_START_TERRITORY_SIZE,
            enemy.ownerId
        );
    });

    const initialState = {
        phase: 'start' as const,
        player,
        enemies,
        grid,
        bombVoidMask: new Uint8Array(cols * rows),
        cols,
        rows,
        score: 0,
        bestScore,
        landPercent: 0,
        bestLandPercent,
        gems: [],
        items: [],
        itemSpawnCooldown: getItemSpawnCooldown(),
        captureEffects: [],
    };
    const metrics = applyGroGroLandMetrics(initialState as GroGroLandState);

    return {
        ...initialState,
        score: metrics.playerTiles,
        bestScore: Math.max(bestScore, metrics.playerTiles),
        landPercent: metrics.playerLandPercent,
        bestLandPercent: Math.max(bestLandPercent, metrics.playerLandPercent),
    };
};

export const buildGroGroLandHudState = (state: GroGroLandState): GroGroLandHudState => {
    const metrics = calculateGroGroLandMetrics(state);
    return {
        score: state.score,
        bestScore: state.bestScore,
        landPercent: state.landPercent,
        bestLandPercent: state.bestLandPercent,
        enemyEmojis: state.enemies.map((enemy) => enemy.emoji),
        enemyLandPercents: metrics.enemyLandPercents,
        enemyAlive: state.enemies.map((enemy) => enemy.status !== 'dead'),
    };
};

export const getGridIndexForWorldPosition = (
    x: number,
    y: number,
    cols: number,
    rows: number
) => {
    const col = Math.max(0, Math.min(cols - 1, Math.floor(x / GROGRO_LAND_TILE_SIZE)));
    const row = Math.max(0, Math.min(rows - 1, Math.floor(y / GROGRO_LAND_TILE_SIZE)));
    return row * cols + col;
};

export const getOwnerAtWorldPosition = (
    grid: Uint16Array,
    cols: number,
    rows: number,
    x: number,
    y: number
) => grid[getGridIndexForWorldPosition(x, y, cols, rows)];

export const hasLostCaptureAnchor = (
    grid: Uint16Array,
    cols: number,
    rows: number,
    actor: GroGroLandActor
) => {
    if (actor.status !== 'drawing' || !actor.captureExitPoint) return false;
    return getOwnerAtWorldPosition(
        grid,
        cols,
        rows,
        actor.captureExitPoint.x,
        actor.captureExitPoint.y
    ) !== actor.ownerId;
};

export const appendTrailPoint = (actor: GroGroLandActor) => {
    const lastPoint = actor.trail[actor.trail.length - 1];
    if (!lastPoint) {
        actor.trail.push({ x: actor.x, y: actor.y });
        return;
    }

    const dx = actor.x - lastPoint.x;
    const dy = actor.y - lastPoint.y;
    if ((dx * dx) + (dy * dy) >= GROGRO_LAND_TRAIL_SAMPLE_DISTANCE * GROGRO_LAND_TRAIL_SAMPLE_DISTANCE) {
        actor.trail.push({ x: actor.x, y: actor.y });
    }
};

export const tickActorEffectTimers = (actor: GroGroLandActor, tickAmount = 1) => {
    if (actor.boostTimer > 0) actor.boostTimer = Math.max(0, actor.boostTimer - tickAmount);
    if (actor.slowTimer > 0) actor.slowTimer = Math.max(0, actor.slowTimer - tickAmount);
    if (actor.freezeTimer > 0) actor.freezeTimer = Math.max(0, actor.freezeTimer - tickAmount);
};

export const getGroGroLandActorSpeed = (actor: GroGroLandActor) => {
    if (actor.freezeTimer > 0) return 0;
    let speed = actor.speed;
    if (actor.boostTimer > 0) speed *= GROGRO_LAND_BOOST_MULTIPLIER;
    if (actor.slowTimer > 0) speed *= GROGRO_LAND_SLOW_MULTIPLIER;
    return speed;
};

export const hasBoostWarning = (actor: GroGroLandActor) => (
    actor.boostTimer > 0 && actor.boostTimer <= GROGRO_LAND_BOOST_WARNING_FRAMES
);

export const isPointTouchingTrail = (
    x: number,
    y: number,
    trail: Array<{ x: number; y: number }>,
    hitRadius = 14
) => {
    if (trail.length <= 1) return false;
    const radiusSquared = hitRadius * hitRadius;
    for (let index = 1; index < trail.length; index += 1) {
        const start = trail[index - 1];
        const end = trail[index];
        const segmentDx = end.x - start.x;
        const segmentDy = end.y - start.y;
        const segmentLengthSquared = (segmentDx * segmentDx) + (segmentDy * segmentDy);

        if (segmentLengthSquared === 0) {
            const dx = x - end.x;
            const dy = y - end.y;
            if ((dx * dx) + (dy * dy) <= radiusSquared) {
                return true;
            }
            continue;
        }

        const projection = (((x - start.x) * segmentDx) + ((y - start.y) * segmentDy)) / segmentLengthSquared;
        const clampedProjection = Math.max(0, Math.min(1, projection));
        const nearestX = start.x + (segmentDx * clampedProjection);
        const nearestY = start.y + (segmentDy * clampedProjection);
        const dx = x - nearestX;
        const dy = y - nearestY;
        if ((dx * dx) + (dy * dy) <= radiusSquared) {
            return true;
        }
    }
    return false;
};

export const doTrailsOverlap = (
    leftTrail: Array<{ x: number; y: number }>,
    rightTrail: Array<{ x: number; y: number }>,
    hitRadius = 12
) => {
    if (leftTrail.length <= 1 || rightTrail.length <= 1) return false;

    const [shorterTrail, longerTrail] = leftTrail.length <= rightTrail.length
        ? [leftTrail, rightTrail]
        : [rightTrail, leftTrail];

    for (let index = 1; index < shorterTrail.length; index += 1) {
        const point = shorterTrail[index];
        if (isPointTouchingTrail(point.x, point.y, longerTrail, hitRadius)) {
            return true;
        }
    }

    return false;
};

export const captureTrailBoundingArea = (state: GroGroLandState, actor: GroGroLandActor) => {
    if (!actor.trail.length) return;

    const exitPoint = actor.captureExitPoint ?? actor.trail[0] ?? { x: actor.x, y: actor.y };
    const entryPoint = { x: actor.x, y: actor.y };
    const ownerId = actor.ownerId;
    const getGlobalIndex = (col: number, row: number) => (row * state.cols) + col;
    const trailPathPoints = [
        exitPoint,
        ...actor.trail.slice(1),
        entryPoint,
    ];

    const trailTileIndexes = new Set<number>();
    const addTrailLineTiles = (fromX: number, fromY: number, toX: number, toY: number) => {
        const dx = toX - fromX;
        const dy = toY - fromY;
        const distance = Math.max(Math.abs(dx), Math.abs(dy));
        const steps = Math.max(1, Math.ceil(distance / (GROGRO_LAND_TILE_SIZE * 0.35)));
        for (let step = 0; step <= steps; step += 1) {
            const ratio = step / steps;
            const sampleX = fromX + (dx * ratio);
            const sampleY = fromY + (dy * ratio);
            trailTileIndexes.add(getGridIndexForWorldPosition(sampleX, sampleY, state.cols, state.rows));
        }
    };

    for (let index = 0; index < trailPathPoints.length; index += 1) {
        const point = trailPathPoints[index];
        trailTileIndexes.add(getGridIndexForWorldPosition(point.x, point.y, state.cols, state.rows));
        if (index === 0) continue;
        const previousPoint = trailPathPoints[index - 1];
        addTrailLineTiles(previousPoint.x, previousPoint.y, point.x, point.y);
    }
    const minCol = 0;
    const maxCol = state.cols - 1;
    const minRow = 0;
    const maxRow = state.rows - 1;
    const localCols = maxCol - minCol + 1;
    const localRows = maxRow - minRow + 1;
    const getLocalIndex = (col: number, row: number) => (row * localCols) + col;

    const wallMask = new Uint8Array(localCols * localRows);
    const markWall = (globalIndex: number) => {
        const globalCol = globalIndex % state.cols;
        const globalRow = Math.floor(globalIndex / state.cols);
        const localCol = globalCol - minCol;
        const localRow = globalRow - minRow;
        if (localCol < 0 || localRow < 0 || localCol >= localCols || localRow >= localRows) return;
        wallMask[getLocalIndex(localCol, localRow)] = 1;
    };

    for (let globalRow = minRow; globalRow <= maxRow; globalRow += 1) {
        for (let globalCol = minCol; globalCol <= maxCol; globalCol += 1) {
            const globalIndex = getGlobalIndex(globalCol, globalRow);
            if (state.grid[globalIndex] === ownerId) {
                markWall(globalIndex);
            }
        }
    }

    trailTileIndexes.forEach(markWall);

    // Bridge tiny diagonal gaps so outside flood fill doesn't leak through slanted joins.
    for (let localRow = 0; localRow < localRows - 1; localRow += 1) {
        for (let localCol = 0; localCol < localCols - 1; localCol += 1) {
            const topLeft = wallMask[getLocalIndex(localCol, localRow)] === 1;
            const topRight = wallMask[getLocalIndex(localCol + 1, localRow)] === 1;
            const bottomLeft = wallMask[getLocalIndex(localCol, localRow + 1)] === 1;
            const bottomRight = wallMask[getLocalIndex(localCol + 1, localRow + 1)] === 1;

            if (topLeft && bottomRight && !topRight && !bottomLeft) {
                wallMask[getLocalIndex(localCol + 1, localRow)] = 1;
                wallMask[getLocalIndex(localCol, localRow + 1)] = 1;
            }

            if (topRight && bottomLeft && !topLeft && !bottomRight) {
                wallMask[getLocalIndex(localCol, localRow)] = 1;
                wallMask[getLocalIndex(localCol + 1, localRow + 1)] = 1;
            }
        }
    }

    const outsideMask = new Uint8Array(localCols * localRows);
    const queue: number[] = [];
    const enqueueIfOpen = (localCol: number, localRow: number) => {
        if (localCol < 0 || localRow < 0 || localCol >= localCols || localRow >= localRows) return;
        const localIndex = getLocalIndex(localCol, localRow);
        if (wallMask[localIndex] || outsideMask[localIndex]) return;
        outsideMask[localIndex] = 1;
        queue.push(localIndex);
    };

    for (let localCol = 0; localCol < localCols; localCol += 1) {
        enqueueIfOpen(localCol, 0);
        enqueueIfOpen(localCol, localRows - 1);
    }
    for (let localRow = 0; localRow < localRows; localRow += 1) {
        enqueueIfOpen(0, localRow);
        enqueueIfOpen(localCols - 1, localRow);
    }

    while (queue.length) {
        const currentIndex = queue.pop()!;
        const currentCol = currentIndex % localCols;
        const currentRow = Math.floor(currentIndex / localCols);
        const neighbors = [
            [currentCol + 1, currentRow],
            [currentCol - 1, currentRow],
            [currentCol, currentRow + 1],
            [currentCol, currentRow - 1],
        ];

        for (let index = 0; index < neighbors.length; index += 1) {
            const [nextCol, nextRow] = neighbors[index];
            enqueueIfOpen(nextCol, nextRow);
        }
    }

    for (let localRow = 0; localRow < localRows; localRow += 1) {
        for (let localCol = 0; localCol < localCols; localCol += 1) {
            const localIndex = getLocalIndex(localCol, localRow);
            const globalIndex = getGlobalIndex(minCol + localCol, minRow + localRow);

            if (wallMask[localIndex]) {
                state.grid[globalIndex] = ownerId;
                state.bombVoidMask[globalIndex] = 0;
                continue;
            }

            if (!outsideMask[localIndex] && !state.bombVoidMask[globalIndex]) {
                state.grid[globalIndex] = ownerId;
                state.bombVoidMask[globalIndex] = 0;
            }
        }
    }

    const nextEffect: GroGroLandCaptureEffect = {
        id: grogroCaptureEffectId++,
        ownerId: actor.ownerId,
        points: trailPathPoints,
        ttl: 32,
        maxTtl: 32,
    };
    state.captureEffects.push(nextEffect);
    if (state.captureEffects.length > 8) {
        state.captureEffects.shift();
    }

    actor.trail = [];
    actor.captureExitPoint = null;
    actor.status = 'safe';
};

const isBoundaryTileForOwner = (
    grid: Uint16Array,
    cols: number,
    rows: number,
    col: number,
    row: number,
    ownerId: number
) => {
    const currentIndex = (row * cols) + col;
    if (grid[currentIndex] !== ownerId) return false;
    const neighbors = [
        [col + 1, row],
        [col - 1, row],
        [col, row + 1],
        [col, row - 1],
    ];
    for (let index = 0; index < neighbors.length; index += 1) {
        const [nextCol, nextRow] = neighbors[index];
        if (nextCol < 0 || nextRow < 0 || nextCol >= cols || nextRow >= rows) {
            return true;
        }
        if (grid[(nextRow * cols) + nextCol] !== ownerId) {
            return true;
        }
    }
    return false;
};

const detonateBombOnOwnerTerritory = (
    state: GroGroLandState,
    ownerId: number,
    centerX: number,
    centerY: number
) => {
    const tileRadius = Math.ceil(GROGRO_LAND_BOMB_RADIUS / GROGRO_LAND_TILE_SIZE);
    const centerCol = Math.floor(centerX / GROGRO_LAND_TILE_SIZE);
    const centerRow = Math.floor(centerY / GROGRO_LAND_TILE_SIZE);
    const radiusSquared = GROGRO_LAND_BOMB_RADIUS * GROGRO_LAND_BOMB_RADIUS;
    const protectedBoundaryTiles = new Set<number>();

    for (let row = Math.max(0, centerRow - tileRadius); row <= Math.min(state.rows - 1, centerRow + tileRadius); row += 1) {
        for (let col = Math.max(0, centerCol - tileRadius); col <= Math.min(state.cols - 1, centerCol + tileRadius); col += 1) {
            const index = (row * state.cols) + col;
            if (state.grid[index] !== ownerId) continue;
            if (!isBoundaryTileForOwner(state.grid, state.cols, state.rows, col, row, ownerId)) continue;
            protectedBoundaryTiles.add(index);
        }
    }

    for (let row = Math.max(0, centerRow - tileRadius); row <= Math.min(state.rows - 1, centerRow + tileRadius); row += 1) {
        for (let col = Math.max(0, centerCol - tileRadius); col <= Math.min(state.cols - 1, centerCol + tileRadius); col += 1) {
            const index = (row * state.cols) + col;
            if (state.grid[index] !== ownerId) continue;
            if (protectedBoundaryTiles.has(index)) continue;

            const tileCenterX = ((col + 0.5) * GROGRO_LAND_TILE_SIZE);
            const tileCenterY = ((row + 0.5) * GROGRO_LAND_TILE_SIZE);
            const dx = tileCenterX - centerX;
            const dy = tileCenterY - centerY;
            if ((dx * dx) + (dy * dy) <= radiusSquared) {
                state.grid[index] = 0;
                state.bombVoidMask[index] = 1;
            }
        }
    }
};

export const applyGroGroLandItemEffect = (
    state: GroGroLandState,
    actor: GroGroLandActor,
    item: GroGroLandItem
) => {
    if (item.kind === 'boost') {
        actor.boostTimer = GROGRO_LAND_BOOST_DURATION_FRAMES;
        return;
    }

    if (item.kind === 'slow') {
        const actors = [state.player, ...state.enemies];
        actors.forEach((candidate) => {
            if (candidate.id === actor.id || candidate.status === 'dead') return;
            candidate.slowTimer = GROGRO_LAND_SLOW_DURATION_FRAMES;
        });
        return;
    }

    if (item.kind === 'freeze') {
        actor.freezeTimer = GROGRO_LAND_FREEZE_DURATION_FRAMES;
        return;
    }

    if (item.kind === 'bomb') {
        detonateBombOnOwnerTerritory(state, actor.ownerId, item.x, item.y);
    }
};

export const collectOwnedGroGroLandItems = (
    state: GroGroLandState,
    actor: GroGroLandActor
) => {
    if (actor.status === 'dead' || !state.items.length) return false;

    let collected = false;
    for (let index = state.items.length - 1; index >= 0; index -= 1) {
        const item = state.items[index];
        if (getOwnerAtWorldPosition(state.grid, state.cols, state.rows, item.x, item.y) !== actor.ownerId) {
            continue;
        }
        state.items.splice(index, 1);
        applyGroGroLandItemEffect(state, actor, item);
        collected = true;
    }

    return collected;
};

export const tickGroGroLandItems = (state: GroGroLandState, tickAmount = 1) => {
    state.itemSpawnCooldown -= tickAmount;
    if (state.itemSpawnCooldown > 0) return;
    const availableSlots = Math.max(0, GROGRO_LAND_ITEM_MAX_COUNT - state.items.length);
    const spawnCount = Math.min(GROGRO_LAND_ITEM_SPAWN_BATCH_COUNT, availableSlots);
    let spawned = 0;

    for (let index = 0; index < spawnCount; index += 1) {
        if (trySpawnItemAtNeutralPosition(state)) {
            spawned += 1;
        }
    }

    state.itemSpawnCooldown = spawned > 0
        ? getItemSpawnCooldown()
        : Math.floor(GROGRO_LAND_ITEM_SPAWN_INTERVAL_FRAMES * 0.5);
};

export const seedGroGroLandItems = (state: GroGroLandState) => {
    const count = Math.min(GROGRO_LAND_ITEM_INITIAL_COUNT, GROGRO_LAND_ITEM_MAX_COUNT);
    for (let index = 0; index < count; index += 1) {
        if (!trySpawnItemAtNeutralPosition(state)) break;
    }
    state.itemSpawnCooldown = getItemSpawnCooldown();
};

export const tickGroGroLandCaptureEffects = (state: GroGroLandState, tickAmount = 1) => {
    if (!state.captureEffects.length) return;
    const nextEffects: GroGroLandCaptureEffect[] = [];
    for (let index = 0; index < state.captureEffects.length; index += 1) {
        const effect = state.captureEffects[index];
        const nextTtl = effect.ttl - tickAmount;
        if (nextTtl <= 0) continue;
        nextEffects.push({
            ...effect,
            ttl: nextTtl,
        });
    }
    state.captureEffects = nextEffects;
};

export const refreshGroGroLandMetrics = (state: GroGroLandState) => {
    applyGroGroLandMetrics(state);
};

export const isGroGroLandOutOfBounds = (x: number, y: number) => (
    x <= GROGRO_LAND_BOUNDARY_PADDING ||
    y <= GROGRO_LAND_BOUNDARY_PADDING ||
    x >= GROGRO_LAND_WORLD_WIDTH - GROGRO_LAND_BOUNDARY_PADDING ||
    y >= GROGRO_LAND_WORLD_HEIGHT - GROGRO_LAND_BOUNDARY_PADDING
);

export const resetEnemyTerritory = (
    state: GroGroLandState,
    enemyIndex: number
) => {
    const enemy = state.enemies[enemyIndex];
    if (!enemy) return;

    replaceOwnerTiles(state.grid, enemy.ownerId, 0);
    enemy.x = enemy.spawnX;
    enemy.y = enemy.spawnY;
    enemy.direction = pickRandomCardinalDirection();
    enemy.status = 'safe';
    enemy.trail = [];
    enemy.captureExitPoint = null;
    enemy.duelWithId = null;
    enemy.aiMode = 'patrol';
    enemy.decisionCooldown = 80 + (enemyIndex * 18);
    enemy.expandFrames = 0;

    claimRect(
        state.grid,
        state.cols,
        state.rows,
        enemy.spawnX - GROGRO_LAND_START_TERRITORY_SIZE / 2,
        enemy.spawnY - GROGRO_LAND_START_TERRITORY_SIZE / 2,
        GROGRO_LAND_START_TERRITORY_SIZE,
        GROGRO_LAND_START_TERRITORY_SIZE,
        enemy.ownerId
    );
};

export const eliminateEnemyFromGame = (
    state: GroGroLandState,
    enemyIndex: number
) => {
    const enemy = state.enemies[enemyIndex];
    if (!enemy) return;

    replaceOwnerTiles(state.grid, enemy.ownerId, 0);
    enemy.status = 'dead';
    enemy.trail = [];
    enemy.captureExitPoint = null;
    enemy.duelWithId = null;
};

export const GROGRO_LAND_TIMINGS = {
    hudSyncMs: GROGRO_LAND_HUD_SYNC_MS,
} as const;

const clampDirection = (direction: number) => {
    if (direction > Math.PI) return direction - (Math.PI * 2);
    if (direction < -Math.PI) return direction + (Math.PI * 2);
    return direction;
};

export const steerGroGroLandActorToward = (
    actor: GroGroLandActor,
    targetDirection: number,
    turnSpeed: number
) => {
    let delta = targetDirection - actor.direction;
    while (delta > Math.PI) delta -= Math.PI * 2;
    while (delta < -Math.PI) delta += Math.PI * 2;

    if (Math.abs(delta) <= turnSpeed) {
        actor.direction = targetDirection;
        return;
    }

    actor.direction = clampDirection(
        actor.direction + (delta > 0 ? turnSpeed : -turnSpeed)
    );
};
