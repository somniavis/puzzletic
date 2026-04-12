import type { TailRunnerGemTier } from '../TailRunner/types';
import {
    BASE_XP_TO_LEVEL,
    BOMB_CRIT_MULTIPLIER_LEVELS,
    BOMB_DROP_CHANCE_LEVELS,
    BOMB_DROP_INTERVAL_LEVELS,
    ELITE_ENEMY_VARIANTS,
    FIELD_SIZE,
    GEM_SCORE_VALUES,
    HEART_HEAL_VALUE,
    LEVEL_FOUR_DROP_TABLE,
    LEVEL_ONE_DROP_TABLE,
    LEVEL_TWO_DROP_TABLE,
    LEVEL_UP_CARD_COUNT,
    MAX_WAVE,
    MAX_SKILL_LEVEL,
    MELEE_ENEMY_VARIANTS,
    OBSTACLE_SET,
    ORBIT_COUNT_LEVELS,
    ORBIT_CRIT_MULTIPLIER_LEVELS,
    ORBIT_DAMAGE_LEVELS,
    ORBIT_RADIUS_LEVELS,
    ORBIT_SPEED_LEVELS,
    PLAYER_DEFENSE_LEVELS,
    PLAYER_MAX_HP_LEVELS,
    PLAYER_MOVE_SPEED_LEVELS,
    RANGED_ENEMY_VARIANTS,
    RESCUE_ANIMALS,
    WAVE_DURATION_RULES,
    XP_ORB_SCORE_VALUE,
    BOMB_RADIUS_LEVELS,
} from './constants';
import type {
    ChaserEnemy,
    EliteEnemy,
    Obstacle,
    PickupDropType,
    RangedEnemy,
    SkillUpgradeId,
    UpgradeOption,
    UpgradeLevels,
    Vector2,
    WeightedDropEntry,
    XpPickup,
} from './types';
type TranslateFn = (key: string, values?: Record<string, string | number>) => string;

type WaveStatBand = {
    waveStart: number;
    waveEnd: number;
    meleeSpawnStart: number;
    meleeSpawnEnd: number;
    meleeMaxStart: number;
    meleeMaxEnd: number;
    rangedChanceStart: number;
    rangedChanceEnd: number;
    rangedMaxStart: number;
    rangedMaxEnd: number;
    eliteChanceStart: number;
    eliteChanceEnd: number;
};

type RatioBand<T extends string> = {
    waveStart: number;
    waveEnd: number;
    values: Record<T, number>;
};

const WAVE_STAT_BANDS: WaveStatBand[] = [
    { waveStart: 1, waveEnd: 10, meleeSpawnStart: 1180, meleeSpawnEnd: 1080, meleeMaxStart: 6, meleeMaxEnd: 8, rangedChanceStart: 0, rangedChanceEnd: 0, rangedMaxStart: 0, rangedMaxEnd: 0, eliteChanceStart: 0, eliteChanceEnd: 0 },
    { waveStart: 11, waveEnd: 20, meleeSpawnStart: 1060, meleeSpawnEnd: 960, meleeMaxStart: 8, meleeMaxEnd: 10, rangedChanceStart: 0.15, rangedChanceEnd: 0.30, rangedMaxStart: 1, rangedMaxEnd: 2, eliteChanceStart: 0, eliteChanceEnd: 0 },
    { waveStart: 21, waveEnd: 30, meleeSpawnStart: 940, meleeSpawnEnd: 860, meleeMaxStart: 10, meleeMaxEnd: 12, rangedChanceStart: 0.35, rangedChanceEnd: 0.50, rangedMaxStart: 2, rangedMaxEnd: 3, eliteChanceStart: 0, eliteChanceEnd: 0 },
    { waveStart: 31, waveEnd: 40, meleeSpawnStart: 840, meleeSpawnEnd: 760, meleeMaxStart: 12, meleeMaxEnd: 14, rangedChanceStart: 0.55, rangedChanceEnd: 0.70, rangedMaxStart: 3, rangedMaxEnd: 4, eliteChanceStart: 0.10, eliteChanceEnd: 0.18 },
    { waveStart: 41, waveEnd: 50, meleeSpawnStart: 740, meleeSpawnEnd: 680, meleeMaxStart: 14, meleeMaxEnd: 16, rangedChanceStart: 0.72, rangedChanceEnd: 0.82, rangedMaxStart: 4, rangedMaxEnd: 4, eliteChanceStart: 0.18, eliteChanceEnd: 0.26 },
    { waveStart: 51, waveEnd: 60, meleeSpawnStart: 660, meleeSpawnEnd: 620, meleeMaxStart: 16, meleeMaxEnd: 18, rangedChanceStart: 0.82, rangedChanceEnd: 0.88, rangedMaxStart: 4, rangedMaxEnd: 5, eliteChanceStart: 0.28, eliteChanceEnd: 0.38 },
    { waveStart: 61, waveEnd: 70, meleeSpawnStart: 610, meleeSpawnEnd: 580, meleeMaxStart: 18, meleeMaxEnd: 20, rangedChanceStart: 0.88, rangedChanceEnd: 0.92, rangedMaxStart: 5, rangedMaxEnd: 5, eliteChanceStart: 0.40, eliteChanceEnd: 0.52 },
    { waveStart: 71, waveEnd: 80, meleeSpawnStart: 570, meleeSpawnEnd: 550, meleeMaxStart: 20, meleeMaxEnd: 21, rangedChanceStart: 0.92, rangedChanceEnd: 0.96, rangedMaxStart: 5, rangedMaxEnd: 6, eliteChanceStart: 0.54, eliteChanceEnd: 0.66 },
    { waveStart: 81, waveEnd: 90, meleeSpawnStart: 545, meleeSpawnEnd: 530, meleeMaxStart: 21, meleeMaxEnd: 22, rangedChanceStart: 0.96, rangedChanceEnd: 1, rangedMaxStart: 6, rangedMaxEnd: 6, eliteChanceStart: 0.68, eliteChanceEnd: 0.82 },
    { waveStart: 91, waveEnd: 100, meleeSpawnStart: 528, meleeSpawnEnd: 520, meleeMaxStart: 22, meleeMaxEnd: 24, rangedChanceStart: 1, rangedChanceEnd: 1, rangedMaxStart: 6, rangedMaxEnd: 6, eliteChanceStart: 0.84, eliteChanceEnd: 1 },
];

const MELEE_RATIO_BANDS: Array<RatioBand<ChaserEnemy['enemyType']>> = [
    { waveStart: 1, waveEnd: 10, values: { standard: 65, swift: 25, heavy: 10 } },
    { waveStart: 11, waveEnd: 20, values: { standard: 54, swift: 31, heavy: 15 } },
    { waveStart: 21, waveEnd: 40, values: { standard: 48, swift: 32, heavy: 20 } },
    { waveStart: 41, waveEnd: 60, values: { standard: 42, swift: 34, heavy: 24 } },
    { waveStart: 61, waveEnd: 80, values: { standard: 38, swift: 36, heavy: 26 } },
    { waveStart: 81, waveEnd: 100, values: { standard: 34, swift: 38, heavy: 28 } },
];

const RANGED_RATIO_BANDS: Array<RatioBand<RangedEnemy['enemyType']>> = [
    { waveStart: 11, waveEnd: 30, values: { sniper: 78, heavyCaster: 22 } },
    { waveStart: 31, waveEnd: 50, values: { sniper: 72, heavyCaster: 28 } },
    { waveStart: 51, waveEnd: 70, values: { sniper: 66, heavyCaster: 34 } },
    { waveStart: 71, waveEnd: 100, values: { sniper: 60, heavyCaster: 40 } },
];

const ELITE_RATIO_BANDS: Array<RatioBand<EliteEnemy['enemyType']>> = [
    { waveStart: 31, waveEnd: 50, values: { brute: 70, stinger: 30 } },
    { waveStart: 51, waveEnd: 70, values: { brute: 60, stinger: 40 } },
    { waveStart: 71, waveEnd: 100, values: { brute: 50, stinger: 50 } },
];

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const getVectorLength = (vector: Vector2) => Math.hypot(vector.x, vector.y);

export const normalizeVector = (vector: Vector2) => {
    const length = getVectorLength(vector);
    if (length === 0) return { x: 0, y: 0 };
    return { x: vector.x / length, y: vector.y / length };
};

export const formatRunClock = (elapsedMs: number) => {
    const totalSeconds = Math.floor(elapsedMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const createGemPickup = (
    id: number,
    x: number,
    y: number,
    spawnedAtMs: number,
    value: number,
    scoreValue: number,
    gemTier: TailRunnerGemTier,
    animalEmoji: string
): XpPickup => ({
    id,
    x,
    y,
    spawnedAtMs,
    value,
    scoreValue,
    pickupKind: 'score',
    gemTier,
    animalEmoji,
});

export const createXpOrbPickup = (
    id: number,
    x: number,
    y: number,
    spawnedAtMs: number,
    value: number
): XpPickup => ({
    id,
    x,
    y,
    spawnedAtMs,
    value,
    scoreValue: XP_ORB_SCORE_VALUE,
    pickupKind: 'xp',
});

export const createHeartPickup = (
    id: number,
    x: number,
    y: number,
    spawnedAtMs: number,
    healValue: number
): XpPickup => ({
    id,
    x,
    y,
    spawnedAtMs,
    value: 0,
    scoreValue: 0,
    pickupKind: 'heart',
    healValue,
});

export const pickWeightedDrop = (table: WeightedDropEntry[]): PickupDropType => {
    const totalWeight = table.reduce((sum, entry) => sum + entry.weight, 0);
    let roll = Math.random() * totalWeight;
    for (const entry of table) {
        roll -= entry.weight;
        if (roll <= 0) return entry.type;
    }
    return table[table.length - 1].type;
};

export const pickRescueAnimal = (tier: TailRunnerGemTier, seed: number) => {
    const pool = RESCUE_ANIMALS[tier];
    return pool[seed % pool.length];
};

export const getDropTable = (enemyLevel: number) => {
    if (enemyLevel >= 4) return LEVEL_FOUR_DROP_TABLE;
    if (enemyLevel >= 2) return LEVEL_TWO_DROP_TABLE;
    return LEVEL_ONE_DROP_TABLE;
};

export const getDropScatterPosition = (originX: number, originY: number, index: number, total: number) => {
    if (total <= 1) return { x: originX, y: originY };
    const angleOffset = total % 2 === 0 ? Math.PI / total : -Math.PI / 2;
    const angle = angleOffset + ((Math.PI * 2 * index) / total);
    const ring = 52 + ((index % 3) * 14);
    return {
        x: clamp(originX + (Math.cos(angle) * ring), 28, FIELD_SIZE - 28),
        y: clamp(originY + (Math.sin(angle) * ring), 28, FIELD_SIZE - 28),
    };
};

export const createDropsForDefeat = ({
    originX,
    originY,
    startId,
    enemyLevel,
    dropCount,
    spawnedAtMs,
    xpValue,
}: {
    originX: number;
    originY: number;
    startId: number;
    enemyLevel: number;
    dropCount: number;
    spawnedAtMs: number;
    xpValue: number;
}) => {
    const slotCount = Math.max(1, Math.floor(dropCount));
    const dropTable = getDropTable(enemyLevel);
    let nextId = startId;
    const drops: XpPickup[] = [];

    for (let index = 0; index < slotCount; index += 1) {
        const dropType = pickWeightedDrop(dropTable);
        const position = getDropScatterPosition(originX, originY, index, Math.max(slotCount, 1));
        if (dropType === 'xp') {
            drops.push(createXpOrbPickup(nextId, position.x, position.y, spawnedAtMs, xpValue));
        } else if (dropType === 'heart') {
            drops.push(createHeartPickup(nextId, position.x, position.y, spawnedAtMs, HEART_HEAL_VALUE));
        } else {
            drops.push(
                createGemPickup(
                    nextId,
                    position.x,
                    position.y,
                    spawnedAtMs,
                    0,
                    GEM_SCORE_VALUES[dropType],
                    dropType,
                    pickRescueAnimal(dropType, nextId)
                )
            );
        }
        nextId += 1;
    }

    return { drops, nextId };
};

const lerp = (start: number, end: number, progress: number) => start + ((end - start) * progress);

const getBandProgress = (waveIndex: number, waveStart: number, waveEnd: number) => {
    if (waveEnd <= waveStart) return 0;
    return clamp((waveIndex - waveStart) / (waveEnd - waveStart), 0, 1);
};

const getWaveStatBand = (waveIndex: number) => {
    const bandIndex = clamp(Math.floor((waveIndex - 1) / 10), 0, WAVE_STAT_BANDS.length - 1);
    return WAVE_STAT_BANDS[bandIndex];
};

const getRatioBand = <T extends string>(bands: Array<RatioBand<T>>, waveIndex: number) => (
    bands.find((band) => waveIndex >= band.waveStart && waveIndex <= band.waveEnd)
    ?? bands[bands.length - 1]
);

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

    if (totalWeight <= 0) {
        return variants[0];
    }

    let roll = seed % totalWeight;
    for (let index = 0; index < variants.length; index += 1) {
        roll -= weights[index];
        if (roll < 0) {
            return variants[index];
        }
    }

    return variants[variants.length - 1];
};

export const getWaveIndex = (elapsedMs: number) => {
    const safeElapsedMs = Math.max(0, elapsedMs);
    let accumulatedMs = 0;

    for (const rule of WAVE_DURATION_RULES) {
        const waveCount = rule.waveEnd - rule.waveStart + 1;
        const bandDurationMs = waveCount * rule.durationMs;

        if (safeElapsedMs < accumulatedMs + bandDurationMs) {
            const bandElapsedMs = safeElapsedMs - accumulatedMs;
            return clamp(
                rule.waveStart + Math.floor(bandElapsedMs / rule.durationMs),
                rule.waveStart,
                rule.waveEnd
            );
        }

        accumulatedMs += bandDurationMs;
    }

    return MAX_WAVE;
};

export const getWaveVisualTier = (waveIndex: number) => (
    clamp(1 + Math.floor((waveIndex - 1) / 20), 1, 5)
);

export const getWaveAnnouncementStep = (waveIndex: number) => (
    clamp(1 + Math.floor((waveIndex - 1) / 10), 1, Math.ceil(MAX_WAVE / 10))
);

export const getEnemySpawnInterval = (waveIndex: number) => {
    const band = getWaveStatBand(waveIndex);
    return Math.round(lerp(
        band.meleeSpawnStart,
        band.meleeSpawnEnd,
        getBandProgress(waveIndex, band.waveStart, band.waveEnd)
    ));
};

export const getEnemyMaxCount = (waveIndex: number) => {
    const band = getWaveStatBand(waveIndex);
    return Math.round(lerp(
        band.meleeMaxStart,
        band.meleeMaxEnd,
        getBandProgress(waveIndex, band.waveStart, band.waveEnd)
    ));
};

export const getEnemySpeedBonus = (waveIndex: number) => (
    Math.round(lerp(0, 18, clamp((waveIndex - 1) / (MAX_WAVE - 1), 0, 1)))
);

export const getRangedSpawnChance = (waveIndex: number) => {
    const band = getWaveStatBand(waveIndex);
    return lerp(
        band.rangedChanceStart,
        band.rangedChanceEnd,
        getBandProgress(waveIndex, band.waveStart, band.waveEnd)
    );
};

export const getRangedMaxCount = (waveIndex: number) => {
    const band = getWaveStatBand(waveIndex);
    return Math.round(lerp(
        band.rangedMaxStart,
        band.rangedMaxEnd,
        getBandProgress(waveIndex, band.waveStart, band.waveEnd)
    ));
};

export const getEliteSpawnChance = (waveIndex: number) => {
    const band = getWaveStatBand(waveIndex);
    return lerp(
        band.eliteChanceStart,
        band.eliteChanceEnd,
        getBandProgress(waveIndex, band.waveStart, band.waveEnd)
    );
};

export const createSpawnEnemy = (id: number, elapsedMs: number, waveIndex: number): ChaserEnemy => {
    const angle = ((id * 1.37) + (elapsedMs / 800)) % (Math.PI * 2);
    const radius = FIELD_SIZE / 2 - 180;
    const ratioBand = getRatioBand(MELEE_RATIO_BANDS, waveIndex);
    const variant = getWeightedVariant(
        MELEE_ENEMY_VARIANTS,
        (entry) => ratioBand.values[entry.enemyType] ?? 0,
        id * 17 + Math.floor(elapsedMs / 350),
    );

    return {
        id,
        x: FIELD_SIZE / 2 + Math.cos(angle) * radius,
        y: FIELD_SIZE / 2 + Math.sin(angle) * radius,
        hp: variant.hp,
        maxHp: variant.hp,
        orbContactReady: true,
        emoji: variant.emoji,
        enemyType: variant.enemyType,
        baseSpeed: variant.baseSpeed,
        contactDamage: variant.contactDamage,
        sizeScale: variant.sizeScale,
    };
};

export const createEliteEnemy = (id: number, elapsedMs: number, waveIndex: number): EliteEnemy => {
    const angle = ((id * 0.91) + (elapsedMs / 1200)) % (Math.PI * 2);
    const radius = FIELD_SIZE / 2 - 260;
    const ratioBand = getRatioBand(ELITE_RATIO_BANDS, waveIndex);
    const variant = getWeightedVariant(
        ELITE_ENEMY_VARIANTS,
        (entry) => ratioBand.values[entry.enemyType] ?? 0,
        id * 23 + Math.floor(elapsedMs / 700),
    );
    const initialDashReadyAtMs = elapsedMs + variant.dashCooldownMinMs + ((id * 173) % Math.max(1, variant.dashCooldownMaxMs - variant.dashCooldownMinMs));

    return {
        id,
        x: FIELD_SIZE / 2 + Math.cos(angle) * radius,
        y: FIELD_SIZE / 2 + Math.sin(angle) * radius,
        hp: variant.hp,
        maxHp: variant.hp,
        orbContactReady: true,
        emoji: variant.emoji,
        emojiBaseFacing: variant.emojiBaseFacing,
        enemyType: variant.enemyType,
        baseSpeed: variant.baseSpeed,
        contactRadius: variant.contactRadius,
        contactDamage: variant.contactDamage,
        spawnIntervalMs: variant.spawnIntervalMs,
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
        facing: Math.cos(angle) >= 0 ? 'right' : 'left',
    };
};

export const createRangedEnemy = (
    id: number,
    elapsedMs: number,
    existingEnemies: RangedEnemy[],
    waveIndex: number
): RangedEnemy | null => {
    const angle = ((id * 1.11) + (elapsedMs / 1600)) % (Math.PI * 2);
    const radius = FIELD_SIZE / 2 - 320;
    const ratioBand = getRatioBand(RANGED_RATIO_BANDS, waveIndex);
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

    if (eligibleVariants.length === 0) {
        return null;
    }

    const variant = getWeightedVariant(
        eligibleVariants,
        (entry) => ratioBand.values[entry.enemyType] ?? 0,
        id * 19 + Math.floor(elapsedMs / 420),
    );

    return {
        id,
        x: FIELD_SIZE / 2 + Math.cos(angle) * radius,
        y: FIELD_SIZE / 2 + Math.sin(angle) * radius,
        hp: variant.hp,
        maxHp: variant.hp,
        cooldownMs: 800,
        orbContactReady: true,
        emoji: variant.emoji,
        enemyType: variant.enemyType,
        baseSpeed: variant.baseSpeed,
        contactRadius: variant.contactRadius,
        fireRange: variant.fireRange,
        fireCooldownMs: variant.fireCooldownMs,
        projectileSpeed: variant.projectileSpeed,
        projectileDamage: variant.projectileDamage,
        xpValue: variant.xpValue,
    };
};

export const getXpToNextLevel = (level: number) => BASE_XP_TO_LEVEL + ((level - 1) * 45);

const formatUpgradeMetric = (
    optionId: SkillUpgradeId,
    currentLevel: number,
    nextLevel: number,
) => {
    const currentIndex = currentLevel - 1;
    const nextIndex = nextLevel - 1;
    const formatFlatGain = (value: number, digits = 0) => `+${value.toFixed(digits)}`;
    const formatPercentGain = (value: number) => `+${Math.round(value * 100)}%`;

    switch (optionId) {
        case 'orb_damage':
            return formatFlatGain(ORBIT_DAMAGE_LEVELS[nextIndex] - ORBIT_DAMAGE_LEVELS[currentIndex], 1);
        case 'orb_count':
            return formatFlatGain(ORBIT_COUNT_LEVELS[nextIndex] - ORBIT_COUNT_LEVELS[currentIndex]);
        case 'orb_speed':
            return formatFlatGain(ORBIT_SPEED_LEVELS[nextIndex] - ORBIT_SPEED_LEVELS[currentIndex], 2);
        case 'orb_radius':
            return formatFlatGain(ORBIT_RADIUS_LEVELS[nextIndex] - ORBIT_RADIUS_LEVELS[currentIndex]);
        case 'orb_crit':
            return formatPercentGain(ORBIT_CRIT_MULTIPLIER_LEVELS[nextIndex] - ORBIT_CRIT_MULTIPLIER_LEVELS[currentIndex]);
        case 'bomb_chance':
            return formatPercentGain(BOMB_DROP_CHANCE_LEVELS[nextIndex] - BOMB_DROP_CHANCE_LEVELS[currentIndex]);
        case 'bomb_interval':
            return formatFlatGain(BOMB_DROP_INTERVAL_LEVELS[currentIndex] - BOMB_DROP_INTERVAL_LEVELS[nextIndex]);
        case 'bomb_radius':
            return formatFlatGain(BOMB_RADIUS_LEVELS[nextIndex] - BOMB_RADIUS_LEVELS[currentIndex]);
        case 'bomb_crit':
            return formatPercentGain(BOMB_CRIT_MULTIPLIER_LEVELS[nextIndex] - BOMB_CRIT_MULTIPLIER_LEVELS[currentIndex]);
        case 'player_hp':
            return formatFlatGain(PLAYER_MAX_HP_LEVELS[nextIndex] - PLAYER_MAX_HP_LEVELS[currentIndex]);
        case 'player_defense':
            return formatPercentGain(PLAYER_DEFENSE_LEVELS[nextIndex] - PLAYER_DEFENSE_LEVELS[currentIndex]);
        case 'player_speed':
            return formatFlatGain(PLAYER_MOVE_SPEED_LEVELS[nextIndex] - PLAYER_MOVE_SPEED_LEVELS[currentIndex]);
        default:
            return '';
    }
};

const UPGRADE_ICONS: Record<SkillUpgradeId, string> = {
    orb_damage: '⚔️',
    orb_count: '🫧',
    orb_speed: '🌀',
    orb_radius: '⭕',
    orb_crit: '✨',
    bomb_chance: '💣',
    bomb_interval: '⏱️',
    bomb_radius: '🔥',
    bomb_crit: '💥',
    player_hp: '❤️',
    player_defense: '🛡️',
    player_speed: '💨',
};

const pickRandomOptions = <T,>(pool: T[], count: number) => {
    const shuffled = [...pool];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled.slice(0, count);
};

export const buildUpgradeOptions = (
    upgradeLevels: UpgradeLevels,
    bombUnlocked: boolean,
    gt: TranslateFn
): UpgradeOption[] => {
    const buildSkillOption = (optionId: SkillUpgradeId): UpgradeOption | null => {
        const internalLevel = upgradeLevels[optionId];
        if (internalLevel >= MAX_SKILL_LEVEL) return null;
        const nextLevel = internalLevel + 1;
        return {
            id: optionId,
            title: gt(`upgrades.${optionId}.title`),
            description: formatUpgradeMetric(optionId, internalLevel, nextLevel),
            icon: UPGRADE_ICONS[optionId],
            currentLevel: Math.max(0, internalLevel - 1),
            nextLevel,
            maxLevel: MAX_SKILL_LEVEL,
        };
    };

    const attackPool = [
        buildSkillOption('orb_damage'),
        buildSkillOption('orb_count'),
        buildSkillOption('orb_speed'),
        buildSkillOption('orb_radius'),
        buildSkillOption('orb_crit'),
    ].filter(Boolean) as UpgradeOption[];

    const bombUnlockOption: UpgradeOption = {
        id: 'bomb_unlock',
        title: gt('upgrades.bomb_unlock.title'),
        description: gt('upgrades.bomb_unlock.description'),
        icon: '💣',
        currentLevel: 0,
        nextLevel: 1,
        maxLevel: 1,
        isUnlock: true,
    };

    const bombPool = bombUnlocked
        ? [
            buildSkillOption('bomb_chance'),
            buildSkillOption('bomb_interval'),
            buildSkillOption('bomb_radius'),
            buildSkillOption('bomb_crit'),
        ].filter(Boolean) as UpgradeOption[]
        : [bombUnlockOption];

    const survivalPool = [
        buildSkillOption('player_hp'),
        buildSkillOption('player_defense'),
        buildSkillOption('player_speed'),
    ].filter(Boolean) as UpgradeOption[];

    const fullPool = [...attackPool, ...bombPool, ...survivalPool];
    return pickRandomOptions(fullPool, Math.min(LEVEL_UP_CARD_COUNT, fullPool.length));
};

const ACTIVE_OBSTACLES_BY_TIER = Array.from({ length: 5 }, (_, index) => (
    OBSTACLE_SET.filter((obstacle) => obstacle.stageRequired <= index + 1)
));

export const getActiveObstacles = (waveIndex: number) => (
    ACTIVE_OBSTACLES_BY_TIER[getWaveVisualTier(waveIndex) - 1]
);

export const resolveCircleRectCollision = (
    position: Vector2,
    radius: number,
    obstacle: Obstacle,
    padding = 0
): Vector2 => {
    const left = obstacle.x - padding;
    const right = obstacle.x + obstacle.width + padding;
    const top = obstacle.y - padding;
    const bottom = obstacle.y + obstacle.height + padding;

    const nearestX = clamp(position.x, left, right);
    const nearestY = clamp(position.y, top, bottom);
    const deltaX = position.x - nearestX;
    const deltaY = position.y - nearestY;
    const distanceSq = (deltaX * deltaX) + (deltaY * deltaY);
    const minDistance = radius;

    if (distanceSq >= minDistance * minDistance) {
        return position;
    }

    if (distanceSq === 0) {
        const distances = [
            { axis: 'left' as const, value: Math.abs(position.x - left) },
            { axis: 'right' as const, value: Math.abs(right - position.x) },
            { axis: 'top' as const, value: Math.abs(position.y - top) },
            { axis: 'bottom' as const, value: Math.abs(bottom - position.y) },
        ].sort((a, b) => a.value - b.value);

        const closest = distances[0];
        if (closest.axis === 'left') return { x: left - minDistance, y: position.y };
        if (closest.axis === 'right') return { x: right + minDistance, y: position.y };
        if (closest.axis === 'top') return { x: position.x, y: top - minDistance };
        return { x: position.x, y: bottom + minDistance };
    }

    const distance = Math.sqrt(distanceSq);
    const push = minDistance - distance;
    return {
        x: position.x + ((deltaX / distance) * push),
        y: position.y + ((deltaY / distance) * push),
    };
};

export const resolveCircleObstacleCollisions = (
    position: Vector2,
    radius: number,
    obstacles: Obstacle[],
    padding = 0
) => obstacles.reduce(
    (resolvedPosition, obstacle) => resolveCircleRectCollision(resolvedPosition, radius, obstacle, padding),
    position
);

export const moveCircleWithObstacleSlide = (
    currentPosition: Vector2,
    nextPosition: Vector2,
    targetPosition: Vector2,
    radius: number,
    obstacles: Obstacle[],
    padding = 0
) => {
    const resolveAndMeasure = (candidate: Vector2) => {
        const resolved = resolveCircleObstacleCollisions(candidate, radius, obstacles, padding);
        const dx = resolved.x - candidate.x;
        const dy = resolved.y - candidate.y;
        return {
            position: resolved,
            correctionDistanceSq: (dx * dx) + (dy * dy),
            movedDistanceSq: ((resolved.x - currentPosition.x) * (resolved.x - currentPosition.x))
                + ((resolved.y - currentPosition.y) * (resolved.y - currentPosition.y)),
            targetDistanceSq: ((resolved.x - targetPosition.x) * (resolved.x - targetPosition.x))
                + ((resolved.y - targetPosition.y) * (resolved.y - targetPosition.y)),
        };
    };

    const direct = resolveAndMeasure(nextPosition);
    if (direct.correctionDistanceSq < 0.0001) {
        return direct.position;
    }

    const deltaX = nextPosition.x - currentPosition.x;
    const deltaY = nextPosition.y - currentPosition.y;
    const slideX = resolveAndMeasure({
        x: nextPosition.x,
        y: currentPosition.y,
    });
    const slideY = resolveAndMeasure({
        x: currentPosition.x,
        y: nextPosition.y,
    });
    const tangentLeft = resolveAndMeasure({
        x: currentPosition.x - deltaY,
        y: currentPosition.y + deltaX,
    });
    const tangentRight = resolveAndMeasure({
        x: currentPosition.x + deltaY,
        y: currentPosition.y - deltaX,
    });

    const candidates = [direct, slideX, slideY, tangentLeft, tangentRight]
        .filter((candidate) => candidate.movedDistanceSq > 0.0001)
        .sort((a, b) => {
            if (Math.abs(a.correctionDistanceSq - b.correctionDistanceSq) > 0.0001) {
                return a.correctionDistanceSq - b.correctionDistanceSq;
            }
            return a.targetDistanceSq - b.targetDistanceSq;
        });

    if (candidates.length > 0) {
        return candidates[0].position;
    }

    return direct.position;
};

export const resolveCircleCircleSeparation = (
    position: Vector2,
    radius: number,
    anchor: Vector2,
    anchorRadius: number
): Vector2 => {
    const deltaX = position.x - anchor.x;
    const deltaY = position.y - anchor.y;
    const minDistance = radius + anchorRadius;
    const distanceSq = (deltaX * deltaX) + (deltaY * deltaY);

    if (distanceSq >= minDistance * minDistance) {
        return position;
    }

    if (distanceSq === 0) {
        return {
            x: anchor.x + minDistance,
            y: anchor.y,
        };
    }

    const distance = Math.sqrt(distanceSq);
    const push = minDistance - distance;
    return {
        x: position.x + ((deltaX / distance) * push),
        y: position.y + ((deltaY / distance) * push),
    };
};

export const getCameraPosition = (playerPosition: Vector2, stage: HTMLDivElement | null): Vector2 => {
    const stageRect = stage?.getBoundingClientRect();
    const viewportWidth = stageRect?.width ?? 0;
    const viewportHeight = stageRect?.height ?? 0;

    return {
        x: clamp(playerPosition.x - viewportWidth / 2, 0, Math.max(0, FIELD_SIZE - viewportWidth)),
        y: clamp(playerPosition.y - viewportHeight / 2, 0, Math.max(0, FIELD_SIZE - viewportHeight)),
    };
};
