import type React from 'react';
import { playBombExplodeSynth, playQuietOrbHitSynth } from '../../shared/playSynthSfx';
import { playEatingSound } from '../../../../utils/sound';
import {
    BOMB_BLAST_VISUAL_MS,
    BOMB_CRIT_CHANCE,
    ENEMY_PROJECTILE_RADIUS,
    ENEMY_RADIUS,
    FIELD_SIZE,
    OBSTACLE_ENEMY_PADDING,
    PICKUP_COLLECT_RADIUS,
    PICKUP_SPAWN_GRACE_MS,
    PLAYER_RADIUS,
    RANGED_ENEMY_RADIUS,
    WEB_SHOT_INTERVAL_MS,
    WEB_SHOT_MAX_DISTANCE,
    WEB_SHOT_MIN_DISTANCE,
    WEB_ZONE_HP,
    WEB_ZONE_MAX_COUNT,
    WEB_ZONE_ORBIT_HIT_COOLDOWN_MS,
    WEB_ZONE_RADIUS,
    WEB_ZONE_SLOW_MULTIPLIER,
    XP_PICKUP_VALUE,
} from './constants';
import {
    ELITE_ORBIT_HIT_RADIUS_BY_TYPE,
    ENEMY_CONTACT_RADIUS,
    ENEMY_ORBIT_HIT_RADIUS_BY_TYPE,
    getEliteMovementVector,
    getPatternedTrackingVector,
    RANGED_ORBIT_HIT_RADIUS_BY_TYPE,
} from './enemyBehaviors';
import {
    buildUpgradeOptions,
    clamp,
    createDropsForDefeat,
    getSpreadPursuitVector,
    getXpToNextLevel,
    moveCircleWithObstacleSlide,
    resolveCircleCircleSeparation,
    resolveCircleObstacleCollisions,
} from './helpers';
import { applyOrbitContactDamage } from './gameplayUtils';
import { isPointInsideAnyObstacle } from './obstacleLayout';
import type {
    BombBlast,
    BombStrike,
    ChaserEnemy,
    EliteEnemy,
    EnemyProjectile,
    Obstacle,
    RangedEnemy,
    UpgradeLevels,
    UpgradeOption,
    Vector2,
    WebZone,
    XpPickup,
} from './types';

type TranslateFn = (key: string, values?: Record<string, string | number>) => string;
type RegisterEnemyDefeat = (enemyCategory?: 'normal' | 'elite') => void;
type ApplyPlayerDamage = (
    rawDamage: number,
    lastDamageRef: React.MutableRefObject<number>,
    hitSound?: 'jello' | 'quiet-orb'
) => boolean;

type AddDropsForDefeat = (params: {
    x: number;
    y: number;
    enemyLevel: number;
    dropCount: number;
    xpValue: number;
}) => void;

const appendWebZoneAt = ({
    x,
    y,
    nextWebZoneIdRef,
    webZonesRef,
    webZoneRadius,
    webZoneSlowMultiplier,
    webZoneHp,
}: {
    x: number;
    y: number;
    nextWebZoneIdRef: React.MutableRefObject<number>;
    webZonesRef: React.MutableRefObject<WebZone[]>;
    webZoneRadius: number;
    webZoneSlowMultiplier: number;
    webZoneHp: number;
}) => {
    const nextWebZone: WebZone = {
        id: nextWebZoneIdRef.current,
        x: clamp(x, webZoneRadius, FIELD_SIZE - webZoneRadius),
        y: clamp(y, webZoneRadius, FIELD_SIZE - webZoneRadius),
        radius: webZoneRadius,
        slowMultiplier: webZoneSlowMultiplier,
        hp: webZoneHp,
        maxHp: webZoneHp,
        lastOrbHitAtMs: -WEB_ZONE_ORBIT_HIT_COOLDOWN_MS,
        expiresAtMs: Number.POSITIVE_INFINITY,
    };
    nextWebZoneIdRef.current += 1;
    webZonesRef.current = webZonesRef.current
        .concat(nextWebZone)
        .slice(-WEB_ZONE_MAX_COUNT);
};

const processMeleeEnemies = ({
    activeObstacleSet,
    addDeathBurst,
    addDropsForDefeat,
    applyPlayerDamage,
    deltaMs,
    elapsedMs,
    enemies,
    enemySpeedBonus,
    isWithinRadius,
    lastEnemyContactDamageTimeRef,
    nextPosition,
    orbitCritMultiplier,
    orbitDamage,
    orbitPositionsNow,
    registerEnemyDefeat,
}: {
    activeObstacleSet: Obstacle[];
    addDeathBurst: (params: { x: number; y: number; emoji: string; sizeScale: number }) => void;
    addDropsForDefeat: AddDropsForDefeat;
    applyPlayerDamage: ApplyPlayerDamage;
    deltaMs: number;
    elapsedMs: number;
    enemies: ChaserEnemy[];
    enemySpeedBonus: number;
    isWithinRadius: (ax: number, ay: number, bx: number, by: number, radius: number) => boolean;
    lastEnemyContactDamageTimeRef: React.MutableRefObject<number>;
    nextPosition: Vector2;
    orbitCritMultiplier: number;
    orbitDamage: number;
    orbitPositionsNow: Vector2[];
    registerEnemyDefeat: RegisterEnemyDefeat;
}) => {
    const nextEnemies: ChaserEnemy[] = [];

    for (const enemy of enemies) {
        const basePursuitVector = getSpreadPursuitVector({
            origin: enemy,
            target: nextPosition,
            pursuitOffset: enemy.pursuitOffset,
        });
        const toPlayer = getPatternedTrackingVector({
            baseVector: basePursuitVector,
            enemyType: enemy.enemyType,
            elapsedMs,
            origin: enemy,
            target: nextPosition,
            unitId: enemy.id,
        });
        const movedEnemy = {
            ...enemy,
            x: clamp(enemy.x + toPlayer.x * (enemy.baseSpeed + enemySpeedBonus) * (deltaMs / 1000), ENEMY_RADIUS, FIELD_SIZE - ENEMY_RADIUS),
            y: clamp(enemy.y + toPlayer.y * (enemy.baseSpeed + enemySpeedBonus) * (deltaMs / 1000), ENEMY_RADIUS, FIELD_SIZE - ENEMY_RADIUS),
        };

        let nextEnemy = {
            ...movedEnemy,
            ...moveCircleWithObstacleSlide(
                { x: enemy.x, y: enemy.y },
                movedEnemy,
                nextPosition,
                ENEMY_RADIUS,
                activeObstacleSet,
                OBSTACLE_ENEMY_PADDING
            ),
        };
        nextEnemy = {
            ...nextEnemy,
            ...resolveCircleCircleSeparation(nextEnemy, ENEMY_CONTACT_RADIUS, nextPosition, PLAYER_RADIUS),
        };

        const hpBeforeOrbitHit = nextEnemy.hp;
        nextEnemy = applyOrbitContactDamage(
            nextEnemy,
            ENEMY_ORBIT_HIT_RADIUS_BY_TYPE[nextEnemy.enemyType],
            orbitPositionsNow,
            orbitDamage,
            orbitCritMultiplier
        );
        if (nextEnemy.hp < hpBeforeOrbitHit) {
            nextEnemy = { ...nextEnemy, lastHitAtMs: elapsedMs };
            playQuietOrbHitSynth(0.3, 90);
        }

        if (isWithinRadius(nextEnemy.x, nextEnemy.y, nextPosition.x, nextPosition.y, ENEMY_CONTACT_RADIUS + PLAYER_RADIUS)) {
            applyPlayerDamage(nextEnemy.contactDamage, lastEnemyContactDamageTimeRef);
        }

        if (nextEnemy.hp <= 0) {
            addDeathBurst({
                x: nextEnemy.x,
                y: nextEnemy.y,
                emoji: nextEnemy.emoji,
                sizeScale: nextEnemy.sizeScale,
            });
            addDropsForDefeat({
                x: nextEnemy.x,
                y: nextEnemy.y,
                enemyLevel: 1,
                dropCount: nextEnemy.enemyType === 'heavy' ? 2 : 1,
                xpValue: XP_PICKUP_VALUE,
            });
            registerEnemyDefeat('normal');
            continue;
        }

        nextEnemies.push(nextEnemy);
    }

    return nextEnemies;
};

const processRangedEnemies = ({
    activeObstacleSet,
    addDeathBurst,
    addDropsForDefeat,
    deltaMs,
    elapsedMs,
    enemies,
    nextPosition,
    nextProjectileIdRef,
    orbitCritMultiplier,
    orbitDamage,
    orbitPositionsNow,
    projectilesRef,
    registerEnemyDefeat,
}: {
    activeObstacleSet: Obstacle[];
    addDeathBurst: (params: { x: number; y: number; emoji: string; sizeScale: number }) => void;
    addDropsForDefeat: AddDropsForDefeat;
    deltaMs: number;
    elapsedMs: number;
    enemies: RangedEnemy[];
    nextPosition: Vector2;
    nextProjectileIdRef: React.MutableRefObject<number>;
    orbitCritMultiplier: number;
    orbitDamage: number;
    orbitPositionsNow: Vector2[];
    projectilesRef: React.MutableRefObject<EnemyProjectile[]>;
    registerEnemyDefeat: RegisterEnemyDefeat;
}) => {
    const nextRangedEnemies: RangedEnemy[] = [];

    for (const enemy of enemies) {
        const toPlayerRaw = { x: nextPosition.x - enemy.x, y: nextPosition.y - enemy.y };
        const distanceToPlayerSq = (toPlayerRaw.x * toPlayerRaw.x) + (toPlayerRaw.y * toPlayerRaw.y);
        const distanceToPlayer = Math.sqrt(distanceToPlayerSq);
        const basePursuitVector = getSpreadPursuitVector({
            origin: enemy,
            target: nextPosition,
            pursuitOffset: enemy.pursuitOffset,
            settleRadius: 180,
        });
        const toPlayer = getPatternedTrackingVector({
            baseVector: basePursuitVector,
            enemyType: enemy.enemyType,
            elapsedMs,
            origin: enemy,
            target: nextPosition,
            unitId: enemy.id,
        });
        const shouldAdvance = distanceToPlayer > enemy.fireRange * 0.82;
        const movedRangedEnemy = {
            ...enemy,
            x: shouldAdvance
                ? clamp(enemy.x + toPlayer.x * enemy.baseSpeed * (deltaMs / 1000), RANGED_ENEMY_RADIUS, FIELD_SIZE - RANGED_ENEMY_RADIUS)
                : enemy.x,
            y: shouldAdvance
                ? clamp(enemy.y + toPlayer.y * enemy.baseSpeed * (deltaMs / 1000), RANGED_ENEMY_RADIUS, FIELD_SIZE - RANGED_ENEMY_RADIUS)
                : enemy.y,
            cooldownMs: Math.max(0, enemy.cooldownMs - deltaMs),
        };
        let nextRangedEnemy = {
            ...movedRangedEnemy,
            ...moveCircleWithObstacleSlide(
                { x: enemy.x, y: enemy.y },
                movedRangedEnemy,
                nextPosition,
                RANGED_ENEMY_RADIUS,
                activeObstacleSet,
                OBSTACLE_ENEMY_PADDING
            ),
        };
        nextRangedEnemy = {
            ...nextRangedEnemy,
            ...resolveCircleCircleSeparation(nextRangedEnemy, nextRangedEnemy.contactRadius, nextPosition, PLAYER_RADIUS),
        };

        const hpBeforeOrbitHit = nextRangedEnemy.hp;
        nextRangedEnemy = applyOrbitContactDamage(
            nextRangedEnemy,
            RANGED_ORBIT_HIT_RADIUS_BY_TYPE[nextRangedEnemy.enemyType],
            orbitPositionsNow,
            orbitDamage,
            orbitCritMultiplier
        );
        if (nextRangedEnemy.hp < hpBeforeOrbitHit) {
            nextRangedEnemy = { ...nextRangedEnemy, lastHitAtMs: elapsedMs };
            playQuietOrbHitSynth(0.3, 90);
        }

        if (nextRangedEnemy.hp <= 0) {
            addDeathBurst({
                x: nextRangedEnemy.x,
                y: nextRangedEnemy.y,
                emoji: nextRangedEnemy.emoji,
                sizeScale: 1.02,
            });
            addDropsForDefeat({
                x: nextRangedEnemy.x,
                y: nextRangedEnemy.y,
                enemyLevel: 2,
                dropCount: nextRangedEnemy.enemyType === 'heavyCaster' ? 2 : 1,
                xpValue: nextRangedEnemy.xpValue,
            });
            registerEnemyDefeat('normal');
            continue;
        }

        if (distanceToPlayerSq <= (nextRangedEnemy.fireRange * nextRangedEnemy.fireRange) && nextRangedEnemy.cooldownMs <= 0) {
            const projectileDx = nextPosition.x - nextRangedEnemy.x;
            const projectileDy = nextPosition.y - nextRangedEnemy.y;
            const projectileDistance = Math.sqrt((projectileDx * projectileDx) + (projectileDy * projectileDy)) || 1;
            const projectileDirection = {
                x: projectileDx / projectileDistance,
                y: projectileDy / projectileDistance,
            };
            projectilesRef.current = [
                ...projectilesRef.current,
                {
                    id: nextProjectileIdRef.current,
                    x: nextRangedEnemy.x,
                    y: nextRangedEnemy.y,
                    vx: projectileDirection.x * nextRangedEnemy.projectileSpeed,
                    vy: projectileDirection.y * nextRangedEnemy.projectileSpeed,
                    damage: nextRangedEnemy.projectileDamage,
                },
            ];
            nextProjectileIdRef.current += 1;
            nextRangedEnemy = { ...nextRangedEnemy, cooldownMs: nextRangedEnemy.fireCooldownMs };
        }

        nextRangedEnemies.push(nextRangedEnemy);
    }

    return nextRangedEnemies;
};

const processProjectiles = ({
    activeObstacleSet,
    applyPlayerDamage,
    deltaMs,
    isWithinRadius,
    lastProjectileDamageTimeRef,
    nextPosition,
    projectiles,
}: {
    activeObstacleSet: Obstacle[];
    applyPlayerDamage: ApplyPlayerDamage;
    deltaMs: number;
    isWithinRadius: (ax: number, ay: number, bx: number, by: number, radius: number) => boolean;
    lastProjectileDamageTimeRef: React.MutableRefObject<number>;
    nextPosition: Vector2;
    projectiles: EnemyProjectile[];
}) => {
    const nextProjectiles: EnemyProjectile[] = [];

    for (const projectile of projectiles) {
        const movedProjectile = {
            ...projectile,
            x: projectile.x + projectile.vx * (deltaMs / 1000),
            y: projectile.y + projectile.vy * (deltaMs / 1000),
        };

        if (
            movedProjectile.x < -40
            || movedProjectile.y < -40
            || movedProjectile.x > FIELD_SIZE + 40
            || movedProjectile.y > FIELD_SIZE + 40
        ) {
            continue;
        }

        if (isPointInsideAnyObstacle(movedProjectile.x, movedProjectile.y, activeObstacleSet)) {
            continue;
        }

        if (
            isWithinRadius(
                movedProjectile.x,
                movedProjectile.y,
                nextPosition.x,
                nextPosition.y,
                ENEMY_PROJECTILE_RADIUS + PLAYER_RADIUS - 10
            )
        ) {
            applyPlayerDamage(movedProjectile.damage, lastProjectileDamageTimeRef, 'quiet-orb');
            continue;
        }

        nextProjectiles.push(movedProjectile);
    }

    return nextProjectiles;
};

const collectPickups = ({
    currentXpRef,
    elapsedMs,
    hpRef,
    isWithinRadius,
    nextPosition,
    pickups,
    playerMaxHpRef,
    scoreRef,
}: {
    currentXpRef: React.MutableRefObject<number>;
    elapsedMs: number;
    hpRef: React.MutableRefObject<number>;
    isWithinRadius: (ax: number, ay: number, bx: number, by: number, radius: number) => boolean;
    nextPosition: Vector2;
    pickups: XpPickup[];
    playerMaxHpRef: React.MutableRefObject<number>;
    scoreRef: React.MutableRefObject<number>;
}) => {
    const remainingPickups: XpPickup[] = [];
    let collectedPickupThisFrame = false;

    for (const pickup of pickups) {
        if (elapsedMs - pickup.spawnedAtMs < PICKUP_SPAWN_GRACE_MS) {
            remainingPickups.push(pickup);
            continue;
        }

        if (!isWithinRadius(pickup.x, pickup.y, nextPosition.x, nextPosition.y, PICKUP_COLLECT_RADIUS)) {
            remainingPickups.push(pickup);
            continue;
        }

        currentXpRef.current += pickup.value;
        scoreRef.current += pickup.scoreValue;
        if (pickup.pickupKind === 'heart') {
            hpRef.current = Math.min(playerMaxHpRef.current, hpRef.current + (pickup.healValue ?? 0));
        }
        collectedPickupThisFrame = true;
    }

    return {
        remainingPickups,
        collectedPickupThisFrame,
    };
};

const processWebZones = ({
    elapsedMs,
    isWithinRadius,
    orbitDamage,
    orbitPositionsNow,
    webZones,
}: {
    elapsedMs: number;
    isWithinRadius: (ax: number, ay: number, bx: number, by: number, radius: number) => boolean;
    orbitDamage: number;
    orbitPositionsNow: Vector2[];
    webZones: WebZone[];
}) => {
    const survivingWebZones: WebZone[] = [];
    let webZoneHit = false;

    for (const webZone of webZones) {
        const webHitRadius = Math.min(34, webZone.radius * 0.44);
        const orbTouchesWeb = orbitPositionsNow.some((orbitPosition) => (
            isWithinRadius(orbitPosition.x, orbitPosition.y, webZone.x, webZone.y, webHitRadius)
        ));
        if (
            orbTouchesWeb
            && elapsedMs - webZone.lastOrbHitAtMs >= WEB_ZONE_ORBIT_HIT_COOLDOWN_MS
        ) {
            const nextWebZone = {
                ...webZone,
                hp: webZone.hp - orbitDamage,
                lastOrbHitAtMs: elapsedMs,
            };
            webZoneHit = true;
            if (nextWebZone.hp > 0) {
                survivingWebZones.push(nextWebZone);
            }
            continue;
        }
        survivingWebZones.push(webZone);
    }

    return {
        survivingWebZones,
        webZoneHit,
    };
};

const processEliteEnemy = ({
    activeObstacleSet,
    addDeathBurst,
    addDropsForDefeat,
    applyPlayerDamage,
    bombStrikesRef,
    deltaMs,
    elapsedMs,
    eliteEnemy,
    isWithinRadius,
    lastEliteContactDamageTimeRef,
    nextBombStrikeIdRef,
    nextPosition,
    orbitCritMultiplier,
    orbitDamage,
    orbitPositionsNow,
    registerEnemyDefeat,
}: {
    activeObstacleSet: Obstacle[];
    addDeathBurst: (params: { x: number; y: number; emoji: string; sizeScale: number }) => void;
    addDropsForDefeat: AddDropsForDefeat;
    applyPlayerDamage: ApplyPlayerDamage;
    bombStrikesRef: React.MutableRefObject<BombStrike[]>;
    deltaMs: number;
    elapsedMs: number;
    eliteEnemy: EliteEnemy | null;
    isWithinRadius: (ax: number, ay: number, bx: number, by: number, radius: number) => boolean;
    lastEliteContactDamageTimeRef: React.MutableRefObject<number>;
    nextBombStrikeIdRef: React.MutableRefObject<number>;
    nextPosition: Vector2;
    orbitCritMultiplier: number;
    orbitDamage: number;
    orbitPositionsNow: Vector2[];
    registerEnemyDefeat: RegisterEnemyDefeat;
}) => {
    if (!eliteEnemy) return null;

    const toPlayer = getSpreadPursuitVector({
        origin: eliteEnemy,
        target: nextPosition,
        pursuitOffset: eliteEnemy.pursuitOffset,
        settleRadius: 170,
    });
    const usesDashPattern = eliteEnemy.enemyType !== 'weaver';
    const isDashing = usesDashPattern && eliteEnemy.dashUntilMs !== null && elapsedMs < eliteEnemy.dashUntilMs;
    const isInWindup = usesDashPattern && eliteEnemy.dashWindupUntilMs !== null && elapsedMs < eliteEnemy.dashWindupUntilMs;
    const canStartDash = usesDashPattern
        && eliteEnemy.dashWindupUntilMs === null
        && eliteEnemy.dashUntilMs === null
        && !isDashing
        && !isInWindup
        && elapsedMs >= eliteEnemy.nextDashReadyAtMs;
    let dashDirection = {
        x: eliteEnemy.dashDirectionX,
        y: eliteEnemy.dashDirectionY,
    };
    let dashWindupUntilMs = eliteEnemy.dashWindupUntilMs;
    let dashUntilMs = eliteEnemy.dashUntilMs;
    let nextDashReadyAtMs = eliteEnemy.nextDashReadyAtMs;
    let lastWebShotAtMs = eliteEnemy.lastWebShotAtMs;

    if (canStartDash) {
        dashDirection = toPlayer;
        dashWindupUntilMs = elapsedMs + eliteEnemy.dashWindupMs;
    } else if (
        eliteEnemy.dashWindupUntilMs !== null
        && elapsedMs >= eliteEnemy.dashWindupUntilMs
        && eliteEnemy.dashUntilMs === null
    ) {
        dashUntilMs = elapsedMs + eliteEnemy.dashDurationMs;
        dashWindupUntilMs = null;
        dashDirection = eliteEnemy.dashDirectionX === 0 && eliteEnemy.dashDirectionY === 0 ? toPlayer : dashDirection;
    } else if (usesDashPattern && eliteEnemy.dashUntilMs !== null && elapsedMs >= eliteEnemy.dashUntilMs) {
        dashUntilMs = null;
        const dashCooldownRange = Math.max(1, eliteEnemy.dashCooldownMaxMs - eliteEnemy.dashCooldownMinMs);
        nextDashReadyAtMs = elapsedMs + eliteEnemy.dashCooldownMinMs + ((eliteEnemy.id * 97 + Math.floor(elapsedMs)) % dashCooldownRange);
        dashDirection = { x: 0, y: 0 };
    }

    const nextIsDashing = dashUntilMs !== null && elapsedMs < dashUntilMs;
    const nextIsInWindup = dashWindupUntilMs !== null && elapsedMs < dashWindupUntilMs;
    const movementVector = getEliteMovementVector({
        dashDirection,
        dashDurationMs: eliteEnemy.dashDurationMs,
        dashUntilMs,
        elapsedMs,
        enemyType: eliteEnemy.enemyType,
        isDashing: nextIsDashing,
        isInWindup: nextIsInWindup,
        toPlayer,
        unitId: eliteEnemy.id,
    });
    const moveSpeed = eliteEnemy.enemyType === 'weaver'
        ? eliteEnemy.baseSpeed
        : nextIsDashing
            ? eliteEnemy.baseSpeed * eliteEnemy.dashSpeedMultiplier
            : nextIsInWindup
                ? 0
                : eliteEnemy.baseSpeed;
    const eliteCollisionRadius = eliteEnemy.contactRadius;
    const movedElite = {
        ...eliteEnemy,
        x: clamp(eliteEnemy.x + movementVector.x * moveSpeed * (deltaMs / 1000), eliteCollisionRadius, FIELD_SIZE - eliteCollisionRadius),
        y: clamp(eliteEnemy.y + movementVector.y * moveSpeed * (deltaMs / 1000), eliteCollisionRadius, FIELD_SIZE - eliteCollisionRadius),
        dashDirectionX: dashDirection.x,
        dashDirectionY: dashDirection.y,
        dashWindupUntilMs,
        dashUntilMs,
        nextDashReadyAtMs,
        lastWebShotAtMs,
    };
    let nextElite = {
        ...movedElite,
        ...moveCircleWithObstacleSlide(
            { x: eliteEnemy.x, y: eliteEnemy.y },
            movedElite,
            nextPosition,
            eliteCollisionRadius,
            activeObstacleSet,
            OBSTACLE_ENEMY_PADDING
        ),
    };
    const intendedMoveDistance = Math.hypot(movedElite.x - eliteEnemy.x, movedElite.y - eliteEnemy.y);
    nextElite = {
        ...nextElite,
        ...resolveCircleCircleSeparation(nextElite, nextElite.contactRadius, nextPosition, PLAYER_RADIUS),
    };
    const actualMoveDistance = Math.hypot(nextElite.x - eliteEnemy.x, nextElite.y - eliteEnemy.y);
    if (
        nextIsDashing
        && intendedMoveDistance > 0
        && actualMoveDistance < intendedMoveDistance * 0.58
    ) {
        const dashCooldownRange = Math.max(1, eliteEnemy.dashCooldownMaxMs - eliteEnemy.dashCooldownMinMs);
        nextDashReadyAtMs = elapsedMs + eliteEnemy.dashCooldownMinMs + ((eliteEnemy.id * 97 + Math.floor(elapsedMs)) % dashCooldownRange);
        nextElite = {
            ...nextElite,
            dashUntilMs: null,
            dashDirectionX: 0,
            dashDirectionY: 0,
            nextDashReadyAtMs,
            lastWebShotAtMs,
        };
    }
    if (
        eliteEnemy.enemyType === 'weaver'
        && elapsedMs - lastWebShotAtMs >= WEB_SHOT_INTERVAL_MS
    ) {
        const baseAngle = Math.atan2(toPlayer.y, toPlayer.x);
        const offsetAngle = ((eliteEnemy.id + Math.floor(elapsedMs / 280)) % 5 - 2) * 0.42;
        const shotAngle = baseAngle + offsetAngle;
        const shotDistance = WEB_SHOT_MIN_DISTANCE + (((eliteEnemy.id * 29) + Math.floor(elapsedMs / 10)) % (WEB_SHOT_MAX_DISTANCE - WEB_SHOT_MIN_DISTANCE + 1));
        const webTarget = resolveCircleObstacleCollisions(
            {
                x: clamp(nextElite.x + (Math.cos(shotAngle) * shotDistance), WEB_ZONE_RADIUS, FIELD_SIZE - WEB_ZONE_RADIUS),
                y: clamp(nextElite.y + (Math.sin(shotAngle) * shotDistance), WEB_ZONE_RADIUS, FIELD_SIZE - WEB_ZONE_RADIUS),
            },
            18,
            activeObstacleSet,
            4
        );
        bombStrikesRef.current = bombStrikesRef.current.concat({
            id: nextBombStrikeIdRef.current,
            strikeKind: 'web',
            sourceX: nextElite.x,
            sourceY: nextElite.y,
            targetX: webTarget.x,
            targetY: webTarget.y,
            createdAtMs: elapsedMs,
            landAtMs: elapsedMs + 420,
            triggerAtMs: elapsedMs + 420,
        });
        nextBombStrikeIdRef.current += 1;
        lastWebShotAtMs = elapsedMs;
    }
    const eliteDeltaX = nextElite.x - eliteEnemy.x;
    const eliteDeltaY = nextElite.y - eliteEnemy.y;
    const renderAngleDeg = eliteEnemy.enemyType === 'weaver'
        ? Math.atan2(eliteDeltaY, eliteDeltaX) * (180 / Math.PI) + 90
        : 0;
    nextElite = {
        ...nextElite,
        lastWebShotAtMs,
        renderAngleDeg: Number.isFinite(renderAngleDeg) ? renderAngleDeg : eliteEnemy.renderAngleDeg,
        facing: eliteDeltaX < -0.01
            ? 'left'
            : eliteDeltaX > 0.01
                ? 'right'
                : eliteEnemy.facing,
    };

    const hpBeforeOrbitHit = nextElite.hp;
    nextElite = applyOrbitContactDamage(
        nextElite,
        ELITE_ORBIT_HIT_RADIUS_BY_TYPE[nextElite.enemyType],
        orbitPositionsNow,
        orbitDamage,
        orbitCritMultiplier
    );
    if (nextElite.hp < hpBeforeOrbitHit) {
        nextElite = { ...nextElite, lastHitAtMs: elapsedMs };
        playQuietOrbHitSynth(0.34, 90);
    }

    if (isWithinRadius(nextElite.x, nextElite.y, nextPosition.x, nextPosition.y, nextElite.contactRadius + PLAYER_RADIUS)) {
        applyPlayerDamage(nextElite.contactDamage, lastEliteContactDamageTimeRef);
    }

    if (nextElite.hp <= 0) {
        addDeathBurst({
            x: nextElite.x,
            y: nextElite.y,
            emoji: nextElite.emoji,
            sizeScale: nextElite.enemyType === 'brute' ? 1.34 : nextElite.enemyType === 'stinger' ? 1.22 : 1.28,
        });
        addDropsForDefeat({
            x: nextElite.x,
            y: nextElite.y,
            enemyLevel: 4,
            dropCount: 5,
            xpValue: nextElite.xpValue,
        });
        registerEnemyDefeat('elite');
        return null;
    }

    return nextElite;
};

const processBombStrikes = ({
    addDropsForDefeat,
    bombBlastsRef,
    bombCritMultiplier,
    bombDamage,
    bombRadius,
    bombStrikesRef,
    elapsedMs,
    enemiesRef,
    eliteEnemyRef,
    isWithinRadius,
    nextWebZoneIdRef,
    rangedEnemiesRef,
    registerEnemyDefeat,
    webZonesRef,
}: {
    addDropsForDefeat: AddDropsForDefeat;
    bombBlastsRef: React.MutableRefObject<BombBlast[]>;
    bombCritMultiplier: number;
    bombDamage: number;
    bombRadius: number;
    bombStrikesRef: React.MutableRefObject<BombStrike[]>;
    elapsedMs: number;
    enemiesRef: React.MutableRefObject<ChaserEnemy[]>;
    eliteEnemyRef: React.MutableRefObject<EliteEnemy | null>;
    isWithinRadius: (ax: number, ay: number, bx: number, by: number, radius: number) => boolean;
    nextWebZoneIdRef: React.MutableRefObject<number>;
    rangedEnemiesRef: React.MutableRefObject<RangedEnemy[]>;
    registerEnemyDefeat: RegisterEnemyDefeat;
    webZonesRef: React.MutableRefObject<WebZone[]>;
}) => {
    const readyBombs: BombStrike[] = [];
    const pendingBombs: BombStrike[] = [];
    for (const bombStrike of bombStrikesRef.current) {
        if (bombStrike.triggerAtMs <= elapsedMs) {
            readyBombs.push(bombStrike);
        } else {
            pendingBombs.push(bombStrike);
        }
    }
    if (readyBombs.length === 0) {
        return;
    }

    bombStrikesRef.current = pendingBombs;

    for (const bombStrike of readyBombs) {
        if (bombStrike.strikeKind === 'web') {
            appendWebZoneAt({
                x: bombStrike.targetX,
                y: bombStrike.targetY,
                nextWebZoneIdRef,
                webZonesRef,
                webZoneRadius: WEB_ZONE_RADIUS,
                webZoneSlowMultiplier: WEB_ZONE_SLOW_MULTIPLIER,
                webZoneHp: WEB_ZONE_HP,
            });
            continue;
        }

        const applyBombDamage = <T extends { x: number; y: number; hp: number; lastHitAtMs: number }>(target: T, radius: number) => {
            if (!isWithinRadius(target.x, target.y, bombStrike.targetX, bombStrike.targetY, radius)) return target;
            const bombDamageAmount = bombDamage * (
                Math.random() <= BOMB_CRIT_CHANCE ? bombCritMultiplier : 1
            );
            return {
                ...target,
                hp: target.hp - bombDamageAmount,
                lastHitAtMs: elapsedMs,
            };
        };

        bombBlastsRef.current = bombBlastsRef.current.concat({
            id: bombStrike.id,
            x: bombStrike.targetX,
            y: bombStrike.targetY,
            radius: bombRadius,
            expiresAtMs: elapsedMs + BOMB_BLAST_VISUAL_MS,
        });
        playBombExplodeSynth(0.58, 110);

        const survivingEnemies: ChaserEnemy[] = [];
        for (const enemy of enemiesRef.current) {
            const nextEnemy = applyBombDamage(enemy, bombRadius);
            if (nextEnemy.hp <= 0) {
                addDropsForDefeat({
                    x: enemy.x,
                    y: enemy.y,
                    enemyLevel: 1,
                    dropCount: enemy.enemyType === 'heavy' ? 2 : 1,
                    xpValue: XP_PICKUP_VALUE,
                });
                registerEnemyDefeat('normal');
                continue;
            }
            survivingEnemies.push(nextEnemy);
        }
        enemiesRef.current = survivingEnemies;

        const survivingRangedEnemies: RangedEnemy[] = [];
        for (const enemy of rangedEnemiesRef.current) {
            const nextEnemy = applyBombDamage(enemy, bombRadius);
            if (nextEnemy.hp <= 0) {
                addDropsForDefeat({
                    x: enemy.x,
                    y: enemy.y,
                    enemyLevel: 2,
                    dropCount: enemy.enemyType === 'heavyCaster' ? 2 : 1,
                    xpValue: enemy.xpValue,
                });
                registerEnemyDefeat('normal');
                continue;
            }
            survivingRangedEnemies.push(nextEnemy);
        }
        rangedEnemiesRef.current = survivingRangedEnemies;

        if (eliteEnemyRef.current) {
            const nextElite = applyBombDamage(eliteEnemyRef.current, bombRadius);
            if (nextElite.hp <= 0) {
                addDropsForDefeat({
                    x: eliteEnemyRef.current.x,
                    y: eliteEnemyRef.current.y,
                    enemyLevel: 4,
                    dropCount: 5,
                    xpValue: eliteEnemyRef.current.xpValue,
                });
                registerEnemyDefeat('elite');
                eliteEnemyRef.current = null;
            } else {
                eliteEnemyRef.current = nextElite;
            }
        }
    }
};

export const runCombatFrame = ({
    activeObstacleSet,
    deltaMs,
    elapsedMs,
    nextPosition,
    orbitPositionsNow,
    gt,
    applyPlayerDamage,
    registerEnemyDefeat,
    isWithinRadius,
    enemiesRef,
    rangedEnemiesRef,
    eliteEnemyRef,
    webZonesRef,
    bombStrikesRef,
    bombBlastsRef,
    projectilesRef,
    xpPickupsRef,
    scoreRef,
    currentXpRef,
    levelRef,
    hpRef,
    playerMaxHpRef,
    orbitDamageRef,
    orbitCritMultiplierRef,
    bombDamageRef,
    bombRadiusRef,
    bombCritMultiplierRef,
    bombUnlockedRef,
    upgradeLevelsRef,
    nextBombStrikeIdRef,
    nextProjectileIdRef,
    nextWebZoneIdRef,
    nextPickupIdRef,
    lastEnemyContactDamageTimeRef,
    lastEliteContactDamageTimeRef,
    lastProjectileDamageTimeRef,
    setUpgradeOptions,
    addDeathBurst,
    enemySpeedBonus,
}: {
    activeObstacleSet: Obstacle[];
    deltaMs: number;
    elapsedMs: number;
    nextPosition: Vector2;
    orbitPositionsNow: Vector2[];
    gt: TranslateFn;
    applyPlayerDamage: ApplyPlayerDamage;
    registerEnemyDefeat: RegisterEnemyDefeat;
    isWithinRadius: (ax: number, ay: number, bx: number, by: number, radius: number) => boolean;
    enemiesRef: React.MutableRefObject<ChaserEnemy[]>;
    rangedEnemiesRef: React.MutableRefObject<RangedEnemy[]>;
    eliteEnemyRef: React.MutableRefObject<EliteEnemy | null>;
    webZonesRef: React.MutableRefObject<WebZone[]>;
    bombStrikesRef: React.MutableRefObject<BombStrike[]>;
    bombBlastsRef: React.MutableRefObject<BombBlast[]>;
    projectilesRef: React.MutableRefObject<EnemyProjectile[]>;
    xpPickupsRef: React.MutableRefObject<XpPickup[]>;
    scoreRef: React.MutableRefObject<number>;
    currentXpRef: React.MutableRefObject<number>;
    levelRef: React.MutableRefObject<number>;
    hpRef: React.MutableRefObject<number>;
    playerMaxHpRef: React.MutableRefObject<number>;
    orbitDamageRef: React.MutableRefObject<number>;
    orbitCritMultiplierRef: React.MutableRefObject<number>;
    bombDamageRef: React.MutableRefObject<number>;
    bombRadiusRef: React.MutableRefObject<number>;
    bombCritMultiplierRef: React.MutableRefObject<number>;
    bombUnlockedRef: React.MutableRefObject<boolean>;
    upgradeLevelsRef: React.MutableRefObject<UpgradeLevels>;
    nextBombStrikeIdRef: React.MutableRefObject<number>;
    nextProjectileIdRef: React.MutableRefObject<number>;
    nextWebZoneIdRef: React.MutableRefObject<number>;
    nextPickupIdRef: React.MutableRefObject<number>;
    lastEnemyContactDamageTimeRef: React.MutableRefObject<number>;
    lastEliteContactDamageTimeRef: React.MutableRefObject<number>;
    lastProjectileDamageTimeRef: React.MutableRefObject<number>;
    setUpgradeOptions: React.Dispatch<React.SetStateAction<UpgradeOption[]>>;
    addDeathBurst: (params: { x: number; y: number; emoji: string; sizeScale: number }) => void;
    enemySpeedBonus: number;
}) => {
    let shouldRefreshPickups = false;
    const pendingPickupDrops: XpPickup[] = [];
    let pendingNextPickupId = nextPickupIdRef.current;

    const addDropsForDefeat = ({
        x,
        y,
        enemyLevel,
        dropCount,
        xpValue,
    }: {
        x: number;
        y: number;
        enemyLevel: number;
        dropCount: number;
        xpValue: number;
    }) => {
        const { drops, nextId } = createDropsForDefeat({
            originX: x,
            originY: y,
            startId: pendingNextPickupId,
            enemyLevel,
            dropCount,
            spawnedAtMs: elapsedMs,
            xpValue,
        });
        if (drops.length > 0) {
            pendingPickupDrops.push(...drops);
        }
        pendingNextPickupId = nextId;
    };

    const { survivingWebZones, webZoneHit } = processWebZones({
        elapsedMs,
        isWithinRadius,
        orbitDamage: orbitDamageRef.current,
        orbitPositionsNow,
        webZones: webZonesRef.current,
    });
    if (webZoneHit) {
        playQuietOrbHitSynth(0.24, 120);
    }
    webZonesRef.current = survivingWebZones;

    enemiesRef.current = processMeleeEnemies({
        activeObstacleSet,
        addDeathBurst,
        addDropsForDefeat,
        applyPlayerDamage,
        deltaMs,
        elapsedMs,
        enemies: enemiesRef.current,
        enemySpeedBonus,
        isWithinRadius,
        lastEnemyContactDamageTimeRef,
        nextPosition,
        orbitCritMultiplier: orbitCritMultiplierRef.current,
        orbitDamage: orbitDamageRef.current,
        orbitPositionsNow,
        registerEnemyDefeat,
    });

    rangedEnemiesRef.current = processRangedEnemies({
        activeObstacleSet,
        addDeathBurst,
        addDropsForDefeat,
        deltaMs,
        elapsedMs,
        enemies: rangedEnemiesRef.current,
        nextPosition,
        nextProjectileIdRef,
        orbitCritMultiplier: orbitCritMultiplierRef.current,
        orbitDamage: orbitDamageRef.current,
        orbitPositionsNow,
        projectilesRef,
        registerEnemyDefeat,
    });

    eliteEnemyRef.current = processEliteEnemy({
        activeObstacleSet,
        addDeathBurst,
        addDropsForDefeat,
        applyPlayerDamage,
        bombStrikesRef,
        deltaMs,
        elapsedMs,
        eliteEnemy: eliteEnemyRef.current,
        isWithinRadius,
        lastEliteContactDamageTimeRef,
        nextBombStrikeIdRef,
        nextPosition,
        orbitCritMultiplier: orbitCritMultiplierRef.current,
        orbitDamage: orbitDamageRef.current,
        orbitPositionsNow,
        registerEnemyDefeat,
    });

    processBombStrikes({
        addDropsForDefeat,
        bombBlastsRef,
        bombCritMultiplier: bombCritMultiplierRef.current,
        bombDamage: bombDamageRef.current,
        bombRadius: bombRadiusRef.current,
        bombStrikesRef,
        elapsedMs,
        enemiesRef,
        eliteEnemyRef,
        isWithinRadius,
        nextWebZoneIdRef,
        rangedEnemiesRef,
        registerEnemyDefeat,
        webZonesRef,
    });

    if (pendingPickupDrops.length > 0) {
        nextPickupIdRef.current = pendingNextPickupId;
        xpPickupsRef.current = xpPickupsRef.current.concat(pendingPickupDrops);
        shouldRefreshPickups = true;
    }

    projectilesRef.current = processProjectiles({
        activeObstacleSet,
        applyPlayerDamage,
        deltaMs,
        isWithinRadius,
        lastProjectileDamageTimeRef,
        nextPosition,
        projectiles: projectilesRef.current,
    });

    const { remainingPickups, collectedPickupThisFrame } = collectPickups({
        currentXpRef,
        elapsedMs,
        hpRef,
        isWithinRadius,
        nextPosition,
        pickups: xpPickupsRef.current,
        playerMaxHpRef,
        scoreRef,
    });
    xpPickupsRef.current = remainingPickups;
    if (collectedPickupThisFrame) {
        shouldRefreshPickups = true;
        playEatingSound(0.4);
    }

    let leveledUp = false;
    const xpToNextLevel = getXpToNextLevel(levelRef.current);
    if (currentXpRef.current >= xpToNextLevel) {
        currentXpRef.current -= xpToNextLevel;
        levelRef.current += 1;
        leveledUp = true;
        setUpgradeOptions(
            buildUpgradeOptions(
                upgradeLevelsRef.current,
                bombUnlockedRef.current,
                levelRef.current,
                gt
            )
        );
    }

    return {
        shouldRefreshPickups,
        leveledUp,
    };
};
