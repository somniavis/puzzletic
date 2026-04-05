import {
    GROGRO_LAND_ENEMY_PERSONALITY_CONFIG,
    GROGRO_LAND_PLAYER_OWNER_ID,
    GROGRO_LAND_TURN_SPEED,
    GROGRO_LAND_WORLD_HEIGHT,
    GROGRO_LAND_WORLD_WIDTH,
} from './constants';
import {
    appendTrailPoint,
    captureTrailBoundingArea,
    collectOwnedGroGroLandItems,
    doTrailsOverlap,
    eliminateEnemyFromGame,
    getGroGroLandActorSpeed,
    getOwnerAtWorldPosition,
    hasLostCaptureAnchor,
    isGroGroLandOutOfBounds,
    isPointTouchingTrail,
    refreshGroGroLandMetrics,
    steerGroGroLandActorToward,
    tickActorEffectTimers,
} from './helpers';
import type { GroGroLandState } from './types';

type EngineCallbacks = {
    onFinishGame: () => void;
    onPlayerCapture: (collectedItem: boolean) => void;
};

const clearDuelPair = (state: GroGroLandState, actorId: string, opponentId: string | null) => {
    const actors = [state.player, ...state.enemies];
    const actor = actors.find((candidate) => candidate.id === actorId);
    if (actor) actor.duelWithId = null;
    if (!opponentId) return;
    const opponent = actors.find((candidate) => candidate.id === opponentId);
    if (opponent?.duelWithId === actorId) {
        opponent.duelWithId = null;
    }
};

const resolveReturnDuel = (
    state: GroGroLandState,
    winnerId: string,
    { onFinishGame }: Pick<EngineCallbacks, 'onFinishGame'>
) => {
    const winner = winnerId === state.player.id
        ? state.player
        : state.enemies.find((enemy) => enemy.id === winnerId);
    if (!winner?.duelWithId) return;

    const loserId = winner.duelWithId;
    clearDuelPair(state, winnerId, loserId);

    if (loserId === state.player.id) {
        onFinishGame();
        return;
    }

    const loserIndex = state.enemies.findIndex((enemy) => enemy.id === loserId);
    if (loserIndex >= 0) {
        eliminateEnemyFromGame(state, loserIndex);
        refreshGroGroLandMetrics(state);
    }
};

const updateEnemy = (
    state: GroGroLandState,
    enemyIndex: number,
    deltaMultiplier: number,
    callbacks: Pick<EngineCallbacks, 'onFinishGame'>
) => {
    const enemy = state.enemies[enemyIndex];
    if (!enemy || enemy.status === 'dead') return;
    const personalityConfig = GROGRO_LAND_ENEMY_PERSONALITY_CONFIG[enemy.personality];

    const findNearestItemDirection = (searchRadius: number) => {
        let nearestItem: { x: number; y: number } | null = null;
        let nearestDistanceSq = searchRadius * searchRadius;

        for (let index = 0; index < state.items.length; index += 1) {
            const item = state.items[index];
            const dx = item.x - enemy.x;
            const dy = item.y - enemy.y;
            const distanceSq = (dx * dx) + (dy * dy);
            if (distanceSq > nearestDistanceSq) continue;
            nearestDistanceSq = distanceSq;
            nearestItem = item;
        }

        if (!nearestItem) return null;
        return Math.atan2(nearestItem.y - enemy.y, nearestItem.x - enemy.x);
    };

    tickActorEffectTimers(enemy, deltaMultiplier);
    if (enemy.freezeTimer > 0) return;

    enemy.decisionCooldown -= deltaMultiplier;
    const ownerAtEnemy = getOwnerAtWorldPosition(state.grid, state.cols, state.rows, enemy.x, enemy.y);
    const isInsideOwnTerritory = ownerAtEnemy === enemy.ownerId;

    if (enemy.aiMode === 'patrol') {
        if (enemy.decisionCooldown <= 0) {
            enemy.aiMode = 'expand';
            enemy.expandFrames = personalityConfig.expandFrames + Math.floor(Math.random() * personalityConfig.expandVariance);
            enemy.decisionCooldown = personalityConfig.decisionCooldown;
            enemy.direction += enemyIndex % 2 === 0 ? -0.9 : 0.9;
        }
        const itemDirection = findNearestItemDirection(320);
        if (itemDirection !== null) {
            steerGroGroLandActorToward(enemy, itemDirection, GROGRO_LAND_TURN_SPEED * 0.68 * deltaMultiplier);
            if (isInsideOwnTerritory && enemy.decisionCooldown > 8) {
                enemy.decisionCooldown = 8;
            }
        }
    } else if (enemy.aiMode === 'expand') {
        enemy.expandFrames -= deltaMultiplier;
        if (enemy.expandFrames <= 0) {
            enemy.aiMode = 'return';
        } else if (enemy.decisionCooldown <= 0) {
            enemy.direction += (Math.random() - 0.5) * personalityConfig.turnJitter;
            enemy.decisionCooldown = personalityConfig.decisionCooldown;
        }
        const itemDirection = findNearestItemDirection(420);
        if (itemDirection !== null) {
            steerGroGroLandActorToward(enemy, itemDirection, GROGRO_LAND_TURN_SPEED * 0.9 * deltaMultiplier);
            enemy.expandFrames = Math.max(enemy.expandFrames, 24);
        }
    } else if (enemy.aiMode === 'return') {
        const targetDirection = Math.atan2(enemy.spawnY - enemy.y, enemy.spawnX - enemy.x);
        steerGroGroLandActorToward(enemy, targetDirection, GROGRO_LAND_TURN_SPEED * 0.9 * deltaMultiplier);
        if (isInsideOwnTerritory) {
            enemy.aiMode = 'patrol';
            enemy.decisionCooldown = personalityConfig.patrolCooldown + Math.floor(Math.random() * personalityConfig.patrolVariance);
        }
    }

    const wouldHitOwnTrail = (direction: number) => {
        if (enemy.status !== 'drawing' || enemy.trail.length <= 10) return false;
        const nextSpeed = getGroGroLandActorSpeed(enemy);
        const nextX = enemy.x + (Math.cos(direction) * nextSpeed);
        const nextY = enemy.y + (Math.sin(direction) * nextSpeed);
        return isPointTouchingTrail(nextX, nextY, enemy.trail.slice(0, -6), 8);
    };

    if (enemy.status === 'drawing' && wouldHitOwnTrail(enemy.direction)) {
        const targetDirection = Math.atan2(enemy.spawnY - enemy.y, enemy.spawnX - enemy.x);
        steerGroGroLandActorToward(enemy, targetDirection, GROGRO_LAND_TURN_SPEED * personalityConfig.avoidTurnBoost * deltaMultiplier);
        enemy.aiMode = 'return';

        if (wouldHitOwnTrail(enemy.direction)) {
            const alternateDirections = [
                enemy.direction + 0.9,
                enemy.direction - 0.9,
                enemy.direction + 1.35,
                enemy.direction - 1.35,
            ];
            for (let index = 0; index < alternateDirections.length; index += 1) {
                if (!wouldHitOwnTrail(alternateDirections[index])) {
                    enemy.direction = alternateDirections[index];
                    break;
                }
            }
        }
    }

    const previousEnemyX = enemy.x;
    const previousEnemyY = enemy.y;
    const enemySpeed = getGroGroLandActorSpeed(enemy);
    enemy.x += Math.cos(enemy.direction) * enemySpeed * deltaMultiplier;
    enemy.y += Math.sin(enemy.direction) * enemySpeed * deltaMultiplier;

    if (isGroGroLandOutOfBounds(enemy.x, enemy.y)) {
        enemy.direction += Math.PI * 0.72;
        enemy.x = Math.max(16, Math.min(GROGRO_LAND_WORLD_WIDTH - 16, enemy.x));
        enemy.y = Math.max(16, Math.min(GROGRO_LAND_WORLD_HEIGHT - 16, enemy.y));
        enemy.aiMode = 'return';
        return;
    }

    const ownerAfterMove = getOwnerAtWorldPosition(state.grid, state.cols, state.rows, enemy.x, enemy.y);
    const reenteredOwnTerritory = ownerAfterMove === enemy.ownerId;

    if (enemy.status === 'safe' && !reenteredOwnTerritory) {
        enemy.status = 'drawing';
        enemy.captureExitPoint = { x: previousEnemyX, y: previousEnemyY };
        enemy.trail = [
            { x: previousEnemyX, y: previousEnemyY },
            { x: enemy.x, y: enemy.y },
        ];
    } else if (enemy.status === 'drawing') {
        appendTrailPoint(enemy);
        if (hasLostCaptureAnchor(state.grid, state.cols, state.rows, enemy)) {
            eliminateEnemyFromGame(state, enemyIndex);
            refreshGroGroLandMetrics(state);
            return;
        }
        if (reenteredOwnTerritory && enemy.trail.length > 1) {
            captureTrailBoundingArea(state, enemy);
            collectOwnedGroGroLandItems(state, enemy);
            refreshGroGroLandMetrics(state);
            resolveReturnDuel(state, enemy.id, callbacks);
            if (state.phase !== 'playing' || state.enemies[enemyIndex]?.status === 'dead') return;
            enemy.aiMode = 'patrol';
            enemy.decisionCooldown = personalityConfig.returnCooldown + Math.floor(Math.random() * personalityConfig.returnVariance);
        }
    }
};

export const updateGroGroLandEnemies = (
    state: GroGroLandState,
    deltaMultiplier: number,
    callbacks: Pick<EngineCallbacks, 'onFinishGame'>
) => {
    for (let index = 0; index < state.enemies.length; index += 1) {
        updateEnemy(state, index, deltaMultiplier, callbacks);
    }
};

export const updateGroGroLandPlayer = (
    state: GroGroLandState,
    input: { left: boolean; right: boolean },
    deltaMultiplier: number,
    callbacks: EngineCallbacks
) => {
    const player = state.player;

    tickActorEffectTimers(player, deltaMultiplier);

    if (input.left) player.direction -= GROGRO_LAND_TURN_SPEED * deltaMultiplier;
    if (input.right) player.direction += GROGRO_LAND_TURN_SPEED * deltaMultiplier;

    const previousPlayerX = player.x;
    const previousPlayerY = player.y;
    const playerSpeed = getGroGroLandActorSpeed(player);
    player.x += Math.cos(player.direction) * playerSpeed * deltaMultiplier;
    player.y += Math.sin(player.direction) * playerSpeed * deltaMultiplier;

    if (isGroGroLandOutOfBounds(player.x, player.y)) {
        callbacks.onFinishGame();
        return;
    }

    const ownerAtPlayer = getOwnerAtWorldPosition(state.grid, state.cols, state.rows, player.x, player.y);
    const isOwnTerritory = ownerAtPlayer === GROGRO_LAND_PLAYER_OWNER_ID;

    if (player.status === 'safe' && !isOwnTerritory) {
        player.status = 'drawing';
        player.captureExitPoint = { x: previousPlayerX, y: previousPlayerY };
        player.trail = [
            { x: previousPlayerX, y: previousPlayerY },
            { x: player.x, y: player.y },
        ];
        return;
    }

    if (player.status === 'drawing') {
        appendTrailPoint(player);
        if (hasLostCaptureAnchor(state.grid, state.cols, state.rows, player)) {
            callbacks.onFinishGame();
            return;
        }
        if (isOwnTerritory && player.trail.length > 1) {
            captureTrailBoundingArea(state, player);
            const collectedItem = collectOwnedGroGroLandItems(state, player);
            refreshGroGroLandMetrics(state);
            callbacks.onPlayerCapture(collectedItem);
            resolveReturnDuel(state, player.id, callbacks);
        }
    }
};

export const resolveGroGroLandTrailCollisions = (
    state: GroGroLandState,
    { onFinishGame }: Pick<EngineCallbacks, 'onFinishGame'>
) => {
    const player = state.player;

    if (player.status === 'drawing' && player.trail.length > 10 && isPointTouchingTrail(player.x, player.y, player.trail.slice(0, -6), 8)) {
        onFinishGame();
        return;
    }

    const drawingActors = [state.player, ...state.enemies].filter((actor) => actor.status === 'drawing');

    for (let leftIndex = 0; leftIndex < drawingActors.length; leftIndex += 1) {
        const leftActor = drawingActors[leftIndex];
        if (leftActor.duelWithId) continue;

        for (let rightIndex = leftIndex + 1; rightIndex < drawingActors.length; rightIndex += 1) {
            const rightActor = drawingActors[rightIndex];
            if (rightActor.duelWithId) continue;
            if (!doTrailsOverlap(leftActor.trail, rightActor.trail, 12)) continue;

            leftActor.duelWithId = rightActor.id;
            rightActor.duelWithId = leftActor.id;
            break;
        }
    }
};
