import { FIELD_SIZE } from './constants';
import {
    ELITE_ENEMY_VARIANTS,
    MELEE_ENEMY_VARIANTS,
    RANGED_ENEMY_VARIANTS,
} from './enemyBehaviors';
import { getWaveCombatScaling, getWaveEliteWeights, getWaveMeleeWeights, getWaveRangedWeights, getWaveSpawnZones } from './waveConfig';
import type { ChaserEnemy, EliteEnemy, RangedEnemy, SpawnZone } from './types';

const seededUnit = (seed: number) => {
    const value = Math.sin(seed * 12.9898) * 43758.5453;
    return value - Math.floor(value);
};

const getWeightedVariant = <T extends { enemyType: string }>(
    variants: T[],
    getWeight: (variant: T) => number,
    seed: number,
) => {
    let totalWeight = 0;
    const weights = variants.map((variant) => {
        const weight = Math.max(0, getWeight(variant));
        totalWeight += weight;
        return weight;
    });

    if (totalWeight <= 0) return variants[0];

    let roll = seed % totalWeight;
    for (let index = 0; index < variants.length; index += 1) {
        roll -= weights[index];
        if (roll < 0) return variants[index];
    }

    return variants[variants.length - 1];
};

const getSpawnZoneForWave = (
    seed: number,
    waveIndex: number,
    enemyGroup: 'melee' | 'ranged' | 'elite'
): SpawnZone => {
    const zonePool = getWaveSpawnZones(waveIndex, enemyGroup);
    return zonePool[Math.abs(seed) % zonePool.length];
};

const getSpawnPointFromZone = (zone: SpawnZone, seed: number) => {
    const horizontalUnit = seededUnit((seed * 1.37) + 11.3);
    const verticalUnit = seededUnit((seed * 1.91) + 27.7);
    return {
        x: zone.x + (zone.width * horizontalUnit),
        y: zone.y + (zone.height * verticalUnit),
    };
};

const getSpawnPursuitOffset = (seed: number, magnitude: number) => {
    const lane = (seed % 5) - 2;
    const jitter = (seededUnit((seed * 1.73) + 9.1) - 0.5) * magnitude * 0.32;
    return (lane * magnitude * 0.42) + jitter;
};

export const createSpawnEnemy = (id: number, elapsedMs: number, waveIndex: number): ChaserEnemy => {
    const spawnSeed = id * 17 + Math.floor(elapsedMs / 350);
    const spawnZone = getSpawnZoneForWave(spawnSeed, waveIndex, 'melee');
    const spawnPoint = getSpawnPointFromZone(spawnZone, spawnSeed);
    const weights = getWaveMeleeWeights(waveIndex);
    const variant = getWeightedVariant(
        MELEE_ENEMY_VARIANTS,
        (entry) => weights[entry.enemyType] ?? 0,
        spawnSeed,
    );
    const combatScaling = getWaveCombatScaling(waveIndex);
    const scaledHp = Math.max(1, Math.round(variant.hp * combatScaling.normalHpMultiplier));
    const scaledContactDamage = Math.max(1, Math.round(variant.contactDamage * combatScaling.normalContactDamageMultiplier));

    return {
        id,
        x: spawnPoint.x,
        y: spawnPoint.y,
        hp: scaledHp,
        maxHp: scaledHp,
        lastHitAtMs: Number.NEGATIVE_INFINITY,
        orbContactReady: true,
        emoji: variant.emoji,
        enemyType: variant.enemyType,
        baseSpeed: variant.baseSpeed,
        contactDamage: scaledContactDamage,
        sizeScale: variant.sizeScale,
        pursuitOffset: getSpawnPursuitOffset(spawnSeed, 48),
    };
};

export const createEliteEnemy = (
    id: number,
    elapsedMs: number,
    waveIndex: number,
    forcedEnemyType?: EliteEnemy['enemyType']
): EliteEnemy => {
    const spawnSeed = id * 23 + Math.floor(elapsedMs / 700);
    const spawnZone = getSpawnZoneForWave(spawnSeed + 9, waveIndex, 'elite');
    const spawnPoint = getSpawnPointFromZone(spawnZone, spawnSeed + 31);
    const weights = getWaveEliteWeights(waveIndex);
    const variant = forcedEnemyType
        ? ELITE_ENEMY_VARIANTS.find((entry) => entry.enemyType === forcedEnemyType) ?? ELITE_ENEMY_VARIANTS[0]
        : getWeightedVariant(
            ELITE_ENEMY_VARIANTS,
            (entry) => weights[entry.enemyType] ?? 0,
            spawnSeed,
        );
    const combatScaling = getWaveCombatScaling(waveIndex);
    const scaledHp = Math.max(1, Math.round(variant.hp * combatScaling.eliteHpMultiplier));
    const scaledContactDamage = Math.max(1, Math.round(variant.contactDamage * combatScaling.eliteContactDamageMultiplier));
    const initialDashReadyAtMs = elapsedMs + variant.dashCooldownMinMs + ((id * 173) % Math.max(1, variant.dashCooldownMaxMs - variant.dashCooldownMinMs));
    const initialFacing = spawnPoint.x <= FIELD_SIZE / 2 ? 'right' : 'left';

    return {
        id,
        x: spawnPoint.x,
        y: spawnPoint.y,
        hp: scaledHp,
        maxHp: scaledHp,
        lastHitAtMs: Number.NEGATIVE_INFINITY,
        orbContactReady: true,
        emoji: variant.emoji,
        emojiBaseFacing: variant.emojiBaseFacing,
        enemyType: variant.enemyType,
        baseSpeed: variant.baseSpeed,
        contactRadius: variant.contactRadius,
        contactDamage: scaledContactDamage,
        xpValue: variant.xpValue,
        dashWindupMs: variant.dashWindupMs,
        dashSpeedMultiplier: variant.dashSpeedMultiplier,
        dashDurationMs: variant.dashDurationMs,
        dashCooldownMinMs: variant.dashCooldownMinMs,
        dashCooldownMaxMs: variant.dashCooldownMaxMs,
        nextDashReadyAtMs: initialDashReadyAtMs,
        dashWindupUntilMs: null,
        dashUntilMs: null,
        dashDirectionX: 0,
        dashDirectionY: 0,
        lastWebShotAtMs: elapsedMs,
        renderAngleDeg: initialFacing === 'right' ? 0 : 180,
        facing: initialFacing,
        pursuitOffset: getSpawnPursuitOffset(spawnSeed, 64),
    };
};

export const createRangedEnemy = (
    id: number,
    elapsedMs: number,
    existingEnemies: RangedEnemy[],
    waveIndex: number
): RangedEnemy | null => {
    const spawnSeed = id * 19 + Math.floor(elapsedMs / 420);
    const spawnZone = getSpawnZoneForWave(spawnSeed + 5, waveIndex, 'ranged');
    const spawnPoint = getSpawnPointFromZone(spawnZone, spawnSeed + 19);
    const weights = getWaveRangedWeights(waveIndex);
    const enemyTypeCounts = existingEnemies.reduce<Record<RangedEnemy['enemyType'], number>>(
        (counts, enemy) => {
            counts[enemy.enemyType] += 1;
            return counts;
        },
        { sniper: 0, heavyCaster: 0 }
    );
    const eligibleVariants = RANGED_ENEMY_VARIANTS.filter((variant) => (
        enemyTypeCounts[variant.enemyType] < variant.maxCount
    ));

    if (eligibleVariants.length === 0) return null;

    const variant = getWeightedVariant(
        eligibleVariants,
        (entry) => weights[entry.enemyType] ?? 0,
        spawnSeed,
    );
    const combatScaling = getWaveCombatScaling(waveIndex);
    const scaledHp = Math.max(1, Math.round(variant.hp * combatScaling.normalHpMultiplier));
    const scaledProjectileDamage = Math.max(1, Math.round(variant.projectileDamage * combatScaling.rangedProjectileDamageMultiplier));

    return {
        id,
        x: spawnPoint.x,
        y: spawnPoint.y,
        hp: scaledHp,
        maxHp: scaledHp,
        cooldownMs: 800,
        lastHitAtMs: Number.NEGATIVE_INFINITY,
        orbContactReady: true,
        emoji: variant.emoji,
        enemyType: variant.enemyType,
        baseSpeed: variant.baseSpeed,
        contactRadius: variant.contactRadius,
        fireRange: variant.fireRange,
        fireCooldownMs: variant.fireCooldownMs,
        projectileSpeed: variant.projectileSpeed,
        projectileDamage: scaledProjectileDamage,
        xpValue: variant.xpValue,
        pursuitOffset: getSpawnPursuitOffset(spawnSeed, 58),
    };
};
