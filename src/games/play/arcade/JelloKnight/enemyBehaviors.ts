import type { ChaserEnemy, EliteEnemy, RangedEnemy, Vector2 } from './types';

export const ENEMY_CONTACT_RADIUS = 29;

export const ENEMY_ORBIT_HIT_RADIUS_BY_TYPE = {
    standard: 26,
    swift: 26,
    heavy: 26,
    pumpkin: 27,
} as const;

export const RANGED_ORBIT_HIT_RADIUS_BY_TYPE = {
    sniper: 27,
    heavyCaster: 31,
} as const;

export const ELITE_ORBIT_HIT_RADIUS_BY_TYPE = {
    brute: 46,
    stinger: 40,
    weaver: 42,
} as const;

export const MELEE_ENEMY_VARIANTS: Array<{
    enemyType: ChaserEnemy['enemyType'];
    emoji: ChaserEnemy['emoji'];
    hp: number;
    baseSpeed: number;
    contactDamage: number;
    sizeScale: number;
    spawnWeight: number;
}> = [
    {
        enemyType: 'standard',
        emoji: '👾',
        hp: 6,
        baseSpeed: 56,
        contactDamage: 4,
        sizeScale: 1,
        spawnWeight: 45,
    },
    {
        enemyType: 'swift',
        emoji: '🦠',
        hp: 5,
        baseSpeed: 72,
        contactDamage: 3,
        sizeScale: 0.9,
        spawnWeight: 35,
    },
    {
        enemyType: 'heavy',
        emoji: '🪼',
        hp: 9,
        baseSpeed: 46,
        contactDamage: 7,
        sizeScale: 1.12,
        spawnWeight: 20,
    },
    {
        enemyType: 'pumpkin',
        emoji: '🎃',
        hp: 7,
        baseSpeed: 61,
        contactDamage: 5,
        sizeScale: 0.98,
        spawnWeight: 18,
    },
];

export const RANGED_ENEMY_VARIANTS: Array<{
    enemyType: RangedEnemy['enemyType'];
    emoji: RangedEnemy['emoji'];
    hp: number;
    baseSpeed: number;
    contactRadius: number;
    fireRange: number;
    fireCooldownMs: number;
    projectileSpeed: number;
    projectileDamage: number;
    spawnWeight: number;
    maxCount: number;
    xpValue: number;
}> = [
    {
        enemyType: 'sniper',
        emoji: '🧿',
        hp: 6,
        baseSpeed: 38,
        contactRadius: 30,
        fireRange: 500,
        fireCooldownMs: 2300,
        projectileSpeed: 255,
        projectileDamage: 5,
        spawnWeight: 70,
        maxCount: 4,
        xpValue: 25,
    },
    {
        enemyType: 'heavyCaster',
        emoji: '👁️‍🗨️',
        hp: 9,
        baseSpeed: 32,
        contactRadius: 34,
        fireRange: 545,
        fireCooldownMs: 3100,
        projectileSpeed: 215,
        projectileDamage: 7,
        spawnWeight: 30,
        maxCount: 2,
        xpValue: 32,
    },
];

export const ELITE_ENEMY_VARIANTS: Array<{
    enemyType: EliteEnemy['enemyType'];
    emoji: EliteEnemy['emoji'];
    emojiBaseFacing: EliteEnemy['emojiBaseFacing'];
    hp: number;
    baseSpeed: number;
    contactRadius: number;
    contactDamage: number;
    xpValue: number;
    dashWindupMs: number;
    dashSpeedMultiplier: number;
    dashDurationMs: number;
    dashCooldownMinMs: number;
    dashCooldownMaxMs: number;
    spawnWeight: number;
}> = [
    {
        enemyType: 'brute',
        emoji: '🦖',
        emojiBaseFacing: 'left',
        hp: 40,
        baseSpeed: 64,
        contactRadius: 49,
        contactDamage: 13,
        xpValue: 60,
        dashWindupMs: 550,
        dashSpeedMultiplier: 4.2,
        dashDurationMs: 1100,
        dashCooldownMinMs: 4800,
        dashCooldownMaxMs: 6200,
        spawnWeight: 60,
    },
    {
        enemyType: 'stinger',
        emoji: '🦂',
        emojiBaseFacing: 'left',
        hp: 32,
        baseSpeed: 88,
        contactRadius: 44,
        contactDamage: 10,
        xpValue: 48,
        dashWindupMs: 320,
        dashSpeedMultiplier: 4,
        dashDurationMs: 560,
        dashCooldownMinMs: 2600,
        dashCooldownMaxMs: 3600,
        spawnWeight: 40,
    },
    {
        enemyType: 'weaver',
        emoji: '🕷️',
        emojiBaseFacing: 'left',
        hp: 36,
        baseSpeed: 58,
        contactRadius: 48,
        contactDamage: 9,
        xpValue: 54,
        dashWindupMs: 440,
        dashSpeedMultiplier: 1.9,
        dashDurationMs: 340,
        dashCooldownMinMs: 4200,
        dashCooldownMaxMs: 5400,
        spawnWeight: 30,
    },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const normalizeVector = (vector: Vector2) => {
    const length = Math.hypot(vector.x, vector.y);
    if (length === 0) return { x: 0, y: 0 };
    return { x: vector.x / length, y: vector.y / length };
};

export const getPatternedTrackingVector = ({
    baseVector,
    enemyType,
    elapsedMs,
    origin,
    target,
    unitId,
}: {
    baseVector: Vector2;
    enemyType: ChaserEnemy['enemyType'] | RangedEnemy['enemyType'];
    elapsedMs: number;
    origin: Vector2;
    target: Vector2;
    unitId: number;
}): Vector2 => {
    const distance = Math.hypot(target.x - origin.x, target.y - origin.y);
    if (distance <= 0.0001) return baseVector;

    const perpendicular = {
        x: -baseVector.y,
        y: baseVector.x,
    };
    const distanceWeight = clamp(distance / 260, 0.22, 1);

    if (enemyType === 'swift') {
        const phase = (elapsedMs / 240) + (unitId * 0.83);
        const sway = Math.sin(phase) * 0.88 * distanceWeight;
        return normalizeVector({
            x: baseVector.x + (perpendicular.x * sway),
            y: baseVector.y + (perpendicular.y * sway),
        });
    }

    if (enemyType === 'heavy') {
        const arcDirection = unitId % 2 === 0 ? 1 : -1;
        const arc = (arcDirection * 0.34) + (Math.sin((elapsedMs / 820) + (unitId * 0.37)) * 0.16);
        return normalizeVector({
            x: baseVector.x + (perpendicular.x * arc * distanceWeight),
            y: baseVector.y + (perpendicular.y * arc * distanceWeight),
        });
    }

    if (enemyType === 'heavyCaster') {
        const arcDirection = unitId % 2 === 0 ? 1 : -1;
        const glide = (arcDirection * 0.22) + (Math.sin((elapsedMs / 1100) + (unitId * 0.29)) * 0.12);
        return normalizeVector({
            x: baseVector.x + (perpendicular.x * glide * distanceWeight),
            y: baseVector.y + (perpendicular.y * glide * distanceWeight),
        });
    }

    return baseVector;
};

export const getEliteMovementVector = ({
    dashDirection,
    dashDurationMs,
    dashUntilMs,
    elapsedMs,
    enemyType,
    isDashing,
    isInWindup,
    toPlayer,
    unitId,
}: {
    dashDirection: Vector2;
    dashDurationMs: number;
    dashUntilMs: number | null;
    elapsedMs: number;
    enemyType: EliteEnemy['enemyType'];
    isDashing: boolean;
    isInWindup: boolean;
    toPlayer: Vector2;
    unitId: number;
}): Vector2 => {
    if (enemyType === 'weaver') return toPlayer;
    if (isInWindup) return { x: 0, y: 0 };
    if (!isDashing) return toPlayer;

    const normalizedDashDirection = normalizeVector(dashDirection);
    if (enemyType !== 'stinger' || dashUntilMs === null) {
        return normalizedDashDirection;
    }

    const dashProgress = clamp(
        1 - ((dashUntilMs - elapsedMs) / Math.max(1, dashDurationMs)),
        0,
        1
    );
    const perpendicular = {
        x: -normalizedDashDirection.y,
        y: normalizedDashDirection.x,
    };
    const curveDirection = unitId % 2 === 0 ? 1 : -1;
    const curveStrength = Math.sin(dashProgress * Math.PI) * 0.85 * curveDirection;

    return normalizeVector({
        x: normalizedDashDirection.x + (perpendicular.x * curveStrength),
        y: normalizedDashDirection.y + (perpendicular.y * curveStrength),
    });
};
