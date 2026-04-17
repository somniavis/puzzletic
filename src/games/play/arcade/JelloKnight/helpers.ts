import type { TailRunnerGemTier } from '../TailRunner/types';
import {
    BASE_XP_TO_LEVEL,
    BOMB_CRIT_MULTIPLIER_LEVELS,
    BOMB_DROP_CHANCE_LEVELS,
    BOMB_DROP_INTERVAL_LEVELS,
    FIELD_SIZE,
    GEM_SCORE_VALUES,
    HEART_HEAL_VALUE,
    LEVEL_FOUR_DROP_TABLE,
    LEVEL_ONE_DROP_TABLE,
    LEVEL_TWO_DROP_TABLE,
    LEVEL_UP_CARD_COUNT,
    ORBIT_COUNT_LEVELS,
    ORBIT_CRIT_MULTIPLIER_LEVELS,
    ORBIT_DAMAGE_LEVELS,
    ORBIT_RADIUS_LEVELS,
    ORBIT_SPEED_LEVELS,
    PLAYER_DEFENSE_LEVELS,
    PLAYER_MAX_HP_LEVELS,
    PLAYER_MOVE_SPEED_LEVELS,
    RESCUE_ANIMALS,
    SKILL_MAX_LEVELS,
    XP_ORB_SCORE_VALUE,
    BOMB_RADIUS_LEVELS,
} from './constants';
import { getWaveTargetKillCount as getWaveTargetKillCountConfig } from './waveConfig';
import type {
    Obstacle,
    PickupDropType,
    SkillUpgradeId,
    UpgradeOption,
    UpgradeLevels,
    Vector2,
    WeightedDropEntry,
    XpPickup,
} from './types';
type TranslateFn = (key: string, values?: Record<string, string | number>) => string;

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const getVectorLength = (vector: Vector2) => Math.hypot(vector.x, vector.y);

export const normalizeVector = (vector: Vector2) => {
    const length = getVectorLength(vector);
    if (length === 0) return { x: 0, y: 0 };
    return { x: vector.x / length, y: vector.y / length };
};

export const getSpreadPursuitVector = ({
    origin,
    target,
    pursuitOffset,
    settleRadius = 140,
}: {
    origin: Vector2;
    target: Vector2;
    pursuitOffset: number;
    settleRadius?: number;
}) => {
    const toTarget = {
        x: target.x - origin.x,
        y: target.y - origin.y,
    };
    const distance = getVectorLength(toTarget);
    if (distance === 0) return { x: 0, y: 0 };

    const forward = {
        x: toTarget.x / distance,
        y: toTarget.y / distance,
    };
    const perpendicular = {
        x: -forward.y,
        y: forward.x,
    };
    const spreadWeight = clamp((distance - settleRadius) / 260, 0, 1);
    const desiredTarget = {
        x: target.x + (perpendicular.x * pursuitOffset * spreadWeight),
        y: target.y + (perpendicular.y * pursuitOffset * spreadWeight),
    };

    return normalizeVector({
        x: desiredTarget.x - origin.x,
        y: desiredTarget.y - origin.y,
    });
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

export const getWaveTargetKillCount = (waveIndex: number) => {
    return getWaveTargetKillCountConfig(waveIndex);
};

export const getWaveVisualTier = (waveIndex: number) => (
    clamp(1 + Math.floor((waveIndex - 1) / 20), 1, 5)
);

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
    playerLevel: number,
    gt: TranslateFn
): UpgradeOption[] => {
    const buildSkillOption = (optionId: SkillUpgradeId): UpgradeOption | null => {
        const internalLevel = upgradeLevels[optionId];
        const maxLevel = SKILL_MAX_LEVELS[optionId];
        if (internalLevel >= maxLevel) return null;
        const nextLevel = internalLevel + 1;
        return {
            id: optionId,
            title: gt(`upgrades.${optionId}.title`),
            description: formatUpgradeMetric(optionId, internalLevel, nextLevel),
            icon: UPGRADE_ICONS[optionId],
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
        isUnlock: true,
    };

    const bombPool = bombUnlocked
        ? [
            buildSkillOption('bomb_chance'),
            buildSkillOption('bomb_interval'),
            buildSkillOption('bomb_radius'),
            buildSkillOption('bomb_crit'),
        ].filter(Boolean) as UpgradeOption[]
        : playerLevel >= 3
            ? [bombUnlockOption]
            : [];

    const survivalPool = [
        buildSkillOption('player_hp'),
        buildSkillOption('player_defense'),
        buildSkillOption('player_speed'),
    ].filter(Boolean) as UpgradeOption[];

    const fullPool = [...attackPool, ...bombPool, ...survivalPool];
    return pickRandomOptions(fullPool, Math.min(LEVEL_UP_CARD_COUNT, fullPool.length));
};

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
) => {
    let resolvedPosition = position;

    for (let index = 0; index < obstacles.length; index += 1) {
        resolvedPosition = resolveCircleRectCollision(resolvedPosition, radius, obstacles[index], padding);
    }

    return resolvedPosition;
};

export const moveCircleWithObstacleSlide = (
    currentPosition: Vector2,
    nextPosition: Vector2,
    targetPosition: Vector2,
    radius: number,
    obstacles: Obstacle[],
    padding = 0
) => {
    const resolveAndMeasure = (anchorPosition: Vector2, candidate: Vector2) => {
        const resolved = resolveCircleObstacleCollisions(candidate, radius, obstacles, padding);
        const dx = resolved.x - candidate.x;
        const dy = resolved.y - candidate.y;
        return {
            position: resolved,
            correctionDistanceSq: (dx * dx) + (dy * dy),
            movedDistanceSq: ((resolved.x - anchorPosition.x) * (resolved.x - anchorPosition.x))
                + ((resolved.y - anchorPosition.y) * (resolved.y - anchorPosition.y)),
            targetDistanceSq: ((resolved.x - targetPosition.x) * (resolved.x - targetPosition.x))
                + ((resolved.y - targetPosition.y) * (resolved.y - targetPosition.y)),
        };
    };
    const totalDeltaX = nextPosition.x - currentPosition.x;
    const totalDeltaY = nextPosition.y - currentPosition.y;
    const totalDistance = Math.hypot(totalDeltaX, totalDeltaY);
    const stepCount = Math.max(1, Math.ceil(totalDistance / 18));
    let anchorPosition = currentPosition;

    for (let stepIndex = 0; stepIndex < stepCount; stepIndex += 1) {
        const stepTarget = {
            x: anchorPosition.x + (totalDeltaX / stepCount),
            y: anchorPosition.y + (totalDeltaY / stepCount),
        };
        const direct = resolveAndMeasure(anchorPosition, stepTarget);
        if (direct.correctionDistanceSq < 0.0001) {
            anchorPosition = direct.position;
            continue;
        }

        const deltaX = stepTarget.x - anchorPosition.x;
        const deltaY = stepTarget.y - anchorPosition.y;
        const moveDistance = Math.hypot(deltaX, deltaY);
        const slideX = resolveAndMeasure(anchorPosition, {
            x: stepTarget.x,
            y: anchorPosition.y,
        });
        const slideY = resolveAndMeasure(anchorPosition, {
            x: anchorPosition.x,
            y: stepTarget.y,
        });
        const tangentLeft = resolveAndMeasure(anchorPosition, {
            x: anchorPosition.x - deltaY,
            y: anchorPosition.y + deltaX,
        });
        const tangentRight = resolveAndMeasure(anchorPosition, {
            x: anchorPosition.x + deltaY,
            y: anchorPosition.y - deltaX,
        });
        const normalizedMove = moveDistance <= 0.0001
            ? { x: 0, y: 0 }
            : { x: deltaX / moveDistance, y: deltaY / moveDistance };
        const tangentLeftUnit = {
            x: -normalizedMove.y,
            y: normalizedMove.x,
        };
        const tangentRightUnit = {
            x: normalizedMove.y,
            y: -normalizedMove.x,
        };
        const hugLeft = resolveAndMeasure(anchorPosition, {
            x: anchorPosition.x + ((normalizedMove.x * 0.28) + tangentLeftUnit.x) * moveDistance,
            y: anchorPosition.y + ((normalizedMove.y * 0.28) + tangentLeftUnit.y) * moveDistance,
        });
        const hugRight = resolveAndMeasure(anchorPosition, {
            x: anchorPosition.x + ((normalizedMove.x * 0.28) + tangentRightUnit.x) * moveDistance,
            y: anchorPosition.y + ((normalizedMove.y * 0.28) + tangentRightUnit.y) * moveDistance,
        });
        const tangentLeftShort = resolveAndMeasure(anchorPosition, {
            x: anchorPosition.x + tangentLeftUnit.x * moveDistance * 0.6,
            y: anchorPosition.y + tangentLeftUnit.y * moveDistance * 0.6,
        });
        const tangentRightShort = resolveAndMeasure(anchorPosition, {
            x: anchorPosition.x + tangentRightUnit.x * moveDistance * 0.6,
            y: anchorPosition.y + tangentRightUnit.y * moveDistance * 0.6,
        });

        let bestCandidate: ReturnType<typeof resolveAndMeasure> | null = null;
        const candidates = [
            slideX,
            slideY,
            tangentLeft,
            tangentRight,
            hugLeft,
            hugRight,
            tangentLeftShort,
            tangentRightShort,
        ];

        for (let index = 0; index < candidates.length; index += 1) {
            const candidate = candidates[index];
            if (candidate.movedDistanceSq <= 0.0001) continue;

            if (!bestCandidate) {
                bestCandidate = candidate;
                continue;
            }

            if (Math.abs(candidate.targetDistanceSq - bestCandidate.targetDistanceSq) > 0.0001) {
                if (candidate.targetDistanceSq < bestCandidate.targetDistanceSq) {
                    bestCandidate = candidate;
                }
                continue;
            }

            if (Math.abs(candidate.movedDistanceSq - bestCandidate.movedDistanceSq) > 0.0001) {
                if (candidate.movedDistanceSq > bestCandidate.movedDistanceSq) {
                    bestCandidate = candidate;
                }
                continue;
            }

            if (candidate.correctionDistanceSq < bestCandidate.correctionDistanceSq) {
                bestCandidate = candidate;
            }
        }

        anchorPosition = bestCandidate ? bestCandidate.position : direct.position;
    }

    return anchorPosition;
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

export const getCameraPositionFromViewport = (
    playerPosition: Vector2,
    viewportWidth: number,
    viewportHeight: number
): Vector2 => ({
    x: clamp(playerPosition.x - viewportWidth / 2, 0, Math.max(0, FIELD_SIZE - viewportWidth)),
    y: clamp(playerPosition.y - viewportHeight / 2, 0, Math.max(0, FIELD_SIZE - viewportHeight)),
});

export const getCameraPosition = (playerPosition: Vector2, stage: HTMLDivElement | null): Vector2 => {
    const stageRect = stage?.getBoundingClientRect();
    const viewportWidth = stageRect?.width ?? 0;
    const viewportHeight = stageRect?.height ?? 0;

    return getCameraPositionFromViewport(playerPosition, viewportWidth, viewportHeight);
};
