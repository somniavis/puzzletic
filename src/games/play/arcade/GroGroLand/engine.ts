import {
    GROGRO_LAND_ENEMY_PERSONALITY_CONFIG,
    GROGRO_LAND_PLAYER_OWNER_ID,
    GROGRO_LAND_START_TERRITORY_SIZE,
    GROGRO_LAND_TURN_SPEED,
    GROGRO_LAND_WORLD_HEIGHT,
    GROGRO_LAND_WORLD_WIDTH,
} from './constants';
import {
    appendTrailPoint,
    captureTrailBoundingArea,
    collectOwnedGroGroLandItems,
    doTrailsOverlap,
    getGroGroLandActorSpeed,
    getOwnerAtWorldPosition,
    hasLostCaptureAnchor,
    isGroGroLandOutOfBounds,
    isPointTouchingTrail,
    refreshGroGroLandMetrics,
    respawnPlayerFromOriginOrFinish,
    respawnEnemyFromOriginOrEliminate,
    steerGroGroLandActorToward,
    tickActorEffectTimers,
} from './helpers';
import type { GroGroLandState } from './types';

type EngineCallbacks = {
    onFinishGame: () => void;
    onPlayerCapture: (collectedItem: boolean) => void;
};

const getEnemyReturnTarget = (enemy: GroGroLandState['enemies'][number]) => {
    if (enemy.returnTarget) return enemy.returnTarget;
    if (enemy.captureExitPoint) return enemy.captureExitPoint;
    return { x: enemy.spawnX, y: enemy.spawnY };
};

const clampWorldPoint = (x: number, y: number) => ({
    x: Math.max(
        GROGRO_LAND_START_TERRITORY_SIZE,
        Math.min(GROGRO_LAND_WORLD_WIDTH - GROGRO_LAND_START_TERRITORY_SIZE, x)
    ),
    y: Math.max(
        GROGRO_LAND_START_TERRITORY_SIZE,
        Math.min(GROGRO_LAND_WORLD_HEIGHT - GROGRO_LAND_START_TERRITORY_SIZE, y)
    ),
});

const isRivalEnemyTerritory = (ownerId: number, enemyOwnerId: number) => (
    ownerId > GROGRO_LAND_PLAYER_OWNER_ID && ownerId !== enemyOwnerId
);

const getEnemyPlayerPressureRadius = (enemy: GroGroLandState['enemies'][number], baseRadius: number) => (
    enemy.role === 'hunter'
        ? Math.max(baseRadius, 460)
        : 0
);

const getEnemyPlayerPressureTurn = (enemy: GroGroLandState['enemies'][number], baseTurn: number) => (
    enemy.role === 'hunter'
        ? Math.max(baseTurn, 0.92)
        : 0
);

const getEnemyMinimumExpansionDistance = (enemy: GroGroLandState['enemies'][number]) => (
    enemy.role === 'hunter' ? 520 : 680
);

const getEnemyWideSweepDirection = (enemy: GroGroLandState['enemies'][number]) => {
    if (!enemy.captureExitPoint) return enemy.direction;
    const fromExitX = enemy.x - enemy.captureExitPoint.x;
    const fromExitY = enemy.y - enemy.captureExitPoint.y;
    const distance = Math.hypot(fromExitX, fromExitY) || 1;
    const outwardDirection = Math.atan2(fromExitY / distance, fromExitX / distance);
    return outwardDirection + (enemy.arcTurnDirection * 1.02);
};

const getEnemyReentryTarget = (
    enemy: GroGroLandState['enemies'][number],
    returnEntryOffset: number
) => {
    if (!enemy.captureExitPoint) {
        return { x: enemy.spawnX, y: enemy.spawnY };
    }

    const travelDx = enemy.x - enemy.spawnX;
    const travelDy = enemy.y - enemy.spawnY;
    const travelDistance = Math.hypot(travelDx, travelDy);
    const exitDx = enemy.captureExitPoint.x - enemy.spawnX;
    const exitDy = enemy.captureExitPoint.y - enemy.spawnY;
    const exitDistance = Math.hypot(exitDx, exitDy) || 1;
    const basisDx = travelDistance > GROGRO_LAND_START_TERRITORY_SIZE
        ? travelDx / travelDistance
        : exitDx / exitDistance;
    const basisDy = travelDistance > GROGRO_LAND_START_TERRITORY_SIZE
        ? travelDy / travelDistance
        : exitDy / exitDistance;
    const perpendicularX = -basisDy * enemy.arcTurnDirection;
    const perpendicularY = basisDx * enemy.arcTurnDirection;
    const lateralReach = Math.max(returnEntryOffset * 1.85, exitDistance * 0.95, 240);
    const outwardReach = Math.max(returnEntryOffset * 0.9, travelDistance * 0.42, 150);

    return clampWorldPoint(
        enemy.spawnX + (perpendicularX * lateralReach) + (basisDx * outwardReach),
        enemy.spawnY + (perpendicularY * lateralReach) + (basisDy * outwardReach)
    );
};

const beginEnemyReturn = (
    enemy: GroGroLandState['enemies'][number],
    returnEntryOffset: number,
    options?: { directToExit?: boolean }
) => {
    enemy.aiMode = 'return';
    enemy.arcFrames = 0;
    enemy.arcTargetDirection = null;
    enemy.returnTarget = options?.directToExit
        ? (enemy.captureExitPoint
            ? { ...enemy.captureExitPoint }
            : { x: enemy.spawnX, y: enemy.spawnY })
        : getEnemyReentryTarget(enemy, returnEntryOffset);
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
        respawnPlayerFromOriginOrFinish(state, onFinishGame);
        refreshGroGroLandMetrics(state);
        return;
    }

    const loserIndex = state.enemies.findIndex((enemy) => enemy.id === loserId);
    if (loserIndex >= 0) {
        respawnEnemyFromOriginOrEliminate(state, loserIndex);
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
    const playerPressureRadius = getEnemyPlayerPressureRadius(enemy, personalityConfig.playerPressureRadius);
    const playerPressureTurn = getEnemyPlayerPressureTurn(enemy, personalityConfig.playerPressureTurn);

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

    const getPlayerPressureDirection = () => {
        if (playerPressureRadius <= 0 || state.player.status === 'dead') return null;
        const dx = state.player.x - enemy.x;
        const dy = state.player.y - enemy.y;
        const distanceSq = (dx * dx) + (dy * dy);
        if (distanceSq > playerPressureRadius * playerPressureRadius) return null;
        return Math.atan2(dy, dx);
    };

    tickActorEffectTimers(enemy, deltaMultiplier);
    if (enemy.freezeTimer > 0) return;

    enemy.decisionCooldown -= deltaMultiplier;
    const ownerAtEnemy = getOwnerAtWorldPosition(state.grid, state.cols, state.rows, enemy.x, enemy.y);
    const isInsideOwnTerritory = ownerAtEnemy === enemy.ownerId;
    const captureDistanceFromExit = enemy.captureExitPoint
        ? Math.hypot(enemy.x - enemy.captureExitPoint.x, enemy.y - enemy.captureExitPoint.y)
        : 0;
    const needsWiderExpansion = enemy.status === 'drawing'
        && captureDistanceFromExit < getEnemyMinimumExpansionDistance(enemy);

    if (enemy.aiMode === 'patrol') {
        if (enemy.decisionCooldown <= 0) {
            enemy.aiMode = 'expand';
            enemy.expandFrames = personalityConfig.expandFrames + Math.floor(Math.random() * personalityConfig.expandVariance);
            enemy.arcFrames = personalityConfig.arcFrames + Math.floor(Math.random() * personalityConfig.arcVariance);
            enemy.arcTurnDirection = Math.random() < 0.5 ? -1 : 1;
            enemy.arcTargetDirection = null;
            enemy.returnTarget = null;
            enemy.decisionCooldown = personalityConfig.decisionCooldown;
            enemy.direction += enemyIndex % 2 === 0 ? -1.18 : 1.18;
        }
        const itemDirection = findNearestItemDirection(320);
        if (itemDirection !== null) {
            steerGroGroLandActorToward(enemy, itemDirection, GROGRO_LAND_TURN_SPEED * 0.68 * deltaMultiplier);
            if (isInsideOwnTerritory && enemy.decisionCooldown > 8) {
                enemy.decisionCooldown = 8;
            }
        }
        const playerPressureDirection = getPlayerPressureDirection();
        if (playerPressureDirection !== null) {
            steerGroGroLandActorToward(
                enemy,
                playerPressureDirection,
                GROGRO_LAND_TURN_SPEED * playerPressureTurn * deltaMultiplier
            );
            if (isInsideOwnTerritory && enemy.decisionCooldown > 6) {
                enemy.decisionCooldown = 6;
            }
        }
    } else if (enemy.aiMode === 'expand') {
        enemy.expandFrames -= deltaMultiplier;
        if (needsWiderExpansion) {
            const wideSweepDirection = getEnemyWideSweepDirection(enemy);
            steerGroGroLandActorToward(enemy, wideSweepDirection, GROGRO_LAND_TURN_SPEED * 0.94 * deltaMultiplier);
            enemy.expandFrames = Math.max(enemy.expandFrames, enemy.role === 'hunter' ? 126 : 176);
            enemy.arcFrames = Math.max(enemy.arcFrames, enemy.role === 'hunter' ? 82 : 116);
        } else if (enemy.expandFrames <= 0) {
            beginEnemyReturn(enemy, personalityConfig.returnEntryOffset);
        } else if (
            enemy.arcFrames > 0 &&
            enemy.expandFrames <= enemy.arcFrames &&
            enemy.status === 'drawing'
        ) {
            enemy.aiMode = 'arc';
            enemy.arcTargetDirection = getEnemyWideSweepDirection(enemy) + (enemy.arcTurnDirection * (personalityConfig.arcTurnAngle * 0.72));
        } else if (enemy.decisionCooldown <= 0) {
            enemy.direction += (Math.random() - 0.5) * personalityConfig.turnJitter * 1.35;
            enemy.decisionCooldown = personalityConfig.decisionCooldown;
        }
        const itemDirection = findNearestItemDirection(420);
        if (itemDirection !== null) {
            steerGroGroLandActorToward(enemy, itemDirection, GROGRO_LAND_TURN_SPEED * 0.9 * deltaMultiplier);
            enemy.expandFrames = Math.max(enemy.expandFrames, enemy.role === 'hunter' ? 54 : 76);
        }
        const playerPressureDirection = getPlayerPressureDirection();
        if (playerPressureDirection !== null) {
            steerGroGroLandActorToward(
                enemy,
                playerPressureDirection,
                GROGRO_LAND_TURN_SPEED * playerPressureTurn * deltaMultiplier
            );
            enemy.expandFrames = Math.max(enemy.expandFrames, enemy.role === 'hunter' ? 110 : 54);
        }
    } else if (enemy.aiMode === 'arc') {
        enemy.arcFrames -= deltaMultiplier;
        if (enemy.arcTargetDirection !== null) {
            steerGroGroLandActorToward(
                enemy,
                enemy.arcTargetDirection,
                GROGRO_LAND_TURN_SPEED * 0.92 * deltaMultiplier
            );
        }
        const playerPressureDirection = getPlayerPressureDirection();
        if (playerPressureDirection !== null) {
            steerGroGroLandActorToward(
                enemy,
                playerPressureDirection,
                GROGRO_LAND_TURN_SPEED * playerPressureTurn * 0.54 * deltaMultiplier
            );
        }
        if (needsWiderExpansion) {
            enemy.arcTargetDirection = getEnemyWideSweepDirection(enemy);
            enemy.arcFrames = Math.max(enemy.arcFrames, enemy.role === 'hunter' ? 72 : 104);
        } else if (enemy.arcFrames <= 0) {
            beginEnemyReturn(enemy, personalityConfig.returnEntryOffset);
        }
    } else if (enemy.aiMode === 'return') {
        const returnTarget = getEnemyReturnTarget(enemy);
        const targetDirection = Math.atan2(returnTarget.y - enemy.y, returnTarget.x - enemy.x);
        steerGroGroLandActorToward(enemy, targetDirection, GROGRO_LAND_TURN_SPEED * 0.9 * deltaMultiplier);
        const targetDx = returnTarget.x - enemy.x;
        const targetDy = returnTarget.y - enemy.y;
        if ((targetDx * targetDx) + (targetDy * targetDy) < (72 * 72)) {
            enemy.returnTarget = enemy.captureExitPoint
                ? { ...enemy.captureExitPoint }
                : { x: enemy.spawnX, y: enemy.spawnY };
        }
        if (isInsideOwnTerritory) {
            enemy.aiMode = 'patrol';
            enemy.returnTarget = null;
            enemy.arcTargetDirection = null;
            enemy.decisionCooldown = personalityConfig.patrolCooldown + Math.floor(Math.random() * personalityConfig.patrolVariance);
        }
    }

    const wouldHitOwnTrail = (direction: number) => {
        if (
            enemy.status !== 'drawing' ||
            enemy.trail.length <= personalityConfig.selfAvoidMinTrailPoints
        ) return false;
        const nextSpeed = getGroGroLandActorSpeed(enemy);
        const nextX = enemy.x + (Math.cos(direction) * nextSpeed);
        const nextY = enemy.y + (Math.sin(direction) * nextSpeed);
        return isPointTouchingTrail(
            nextX,
            nextY,
            enemy.trail.slice(0, -6),
            personalityConfig.selfAvoidHitRadius
        );
    };

    if (enemy.status === 'drawing' && wouldHitOwnTrail(enemy.direction)) {
        const returnTarget = getEnemyReturnTarget(enemy);
        const targetDirection = Math.atan2(returnTarget.y - enemy.y, returnTarget.x - enemy.x);
        steerGroGroLandActorToward(enemy, targetDirection, GROGRO_LAND_TURN_SPEED * personalityConfig.avoidTurnBoost * deltaMultiplier);
        beginEnemyReturn(enemy, personalityConfig.returnEntryOffset, { directToExit: true });

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
        beginEnemyReturn(enemy, personalityConfig.returnEntryOffset);
        return;
    }

    const ownerAfterMove = getOwnerAtWorldPosition(state.grid, state.cols, state.rows, enemy.x, enemy.y);
    const reenteredOwnTerritory = ownerAfterMove === enemy.ownerId;
    const enteredRivalEnemyTerritory = isRivalEnemyTerritory(ownerAfterMove, enemy.ownerId);

    if (enteredRivalEnemyTerritory) {
        const alternateDirections = [
            enemy.direction + 0.82,
            enemy.direction - 0.82,
            enemy.direction + 1.34,
            enemy.direction - 1.34,
            enemy.direction + Math.PI * 0.55,
        ];
        let foundDetour = false;

        for (let index = 0; index < alternateDirections.length; index += 1) {
            const candidateDirection = alternateDirections[index];
            const candidateX = previousEnemyX + (Math.cos(candidateDirection) * enemySpeed * deltaMultiplier);
            const candidateY = previousEnemyY + (Math.sin(candidateDirection) * enemySpeed * deltaMultiplier);

            if (isGroGroLandOutOfBounds(candidateX, candidateY)) continue;

            const candidateOwner = getOwnerAtWorldPosition(
                state.grid,
                state.cols,
                state.rows,
                candidateX,
                candidateY
            );

            if (isRivalEnemyTerritory(candidateOwner, enemy.ownerId)) continue;
            if (enemy.status === 'drawing' && wouldHitOwnTrail(candidateDirection)) continue;

            enemy.direction = candidateDirection;
            enemy.x = candidateX;
            enemy.y = candidateY;
            foundDetour = true;
            break;
        }

        if (!foundDetour) {
            // Rival territory avoidance is a preference, not a hard rule.
            // If boxed in, keep moving so enemies do not stall in place.
            enemy.x = previousEnemyX + (Math.cos(enemy.direction) * enemySpeed * deltaMultiplier);
            enemy.y = previousEnemyY + (Math.sin(enemy.direction) * enemySpeed * deltaMultiplier);
        } else if (enemy.status === 'safe') {
            enemy.aiMode = 'patrol';
            enemy.decisionCooldown = Math.max(enemy.decisionCooldown, 10);
        }
    }

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
            respawnEnemyFromOriginOrEliminate(state, enemyIndex);
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
            enemy.returnTarget = null;
            enemy.arcTargetDirection = null;
            enemy.arcFrames = 0;
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
        respawnPlayerFromOriginOrFinish(state, callbacks.onFinishGame);
        refreshGroGroLandMetrics(state);
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
            respawnPlayerFromOriginOrFinish(state, callbacks.onFinishGame);
            refreshGroGroLandMetrics(state);
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
        respawnPlayerFromOriginOrFinish(state, onFinishGame);
        refreshGroGroLandMetrics(state);
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
