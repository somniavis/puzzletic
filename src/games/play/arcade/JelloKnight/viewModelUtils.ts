import type {
    ChaserEnemy,
    EliteEnemy,
    EnemyProjectile,
    EnemyRenderItem,
    EliteRenderItem,
    PickupRenderItem,
    RangedEnemy,
    RangedEnemyRenderItem,
    RunnerMotion,
    WebZone,
    WebZoneRenderItem,
    XpPickup,
    ProjectileRenderItem,
} from './types';

export const getRunnerMotionStyleVars = (runnerMotion: RunnerMotion) => ({
    ['--jello-knight-runner-bob-speed' as string]: runnerMotion.strength > 0.18 ? '1.7s' : '2.45s',
    ['--jello-knight-runner-shift-x' as string]: `${(runnerMotion.x * runnerMotion.strength * 3.2).toFixed(2)}px`,
    ['--jello-knight-runner-shift-y' as string]: `${(runnerMotion.y * runnerMotion.strength * 2.6).toFixed(2)}px`,
    ['--jello-knight-runner-tilt' as string]: `${(runnerMotion.x * runnerMotion.strength * 10).toFixed(2)}deg`,
    ['--jello-knight-runner-scale-x' as string]: `${(1 + (runnerMotion.strength * 0.06)).toFixed(3)}`,
    ['--jello-knight-runner-scale-y' as string]: `${(1 - (runnerMotion.strength * 0.045)).toFixed(3)}`,
});

export const getStageMoodStyleVars = (dangerTier: number, hasElite: boolean) => {
    const topGlowOpacity = Math.min(0.36, 0.16 + (dangerTier * 0.035));
    const ambientOpacity = Math.min(0.34, 0.1 + (dangerTier * 0.04));
    const duskOpacity = Math.min(0.52, 0.08 + (dangerTier * 0.08));
    const hazardOpacity = hasElite ? 0.22 : Math.max(0, (dangerTier - 3) * 0.06);
    const gridOpacity = Math.max(0.56, 0.74 - (dangerTier * 0.035));

    return {
        ['--jello-knight-top-glow-opacity' as string]: `${topGlowOpacity}`,
        ['--jello-knight-ambient-opacity' as string]: `${ambientOpacity}`,
        ['--jello-knight-dusk-opacity' as string]: `${duskOpacity}`,
        ['--jello-knight-hazard-opacity' as string]: `${hazardOpacity}`,
        ['--jello-knight-grid-opacity' as string]: `${gridOpacity}`,
    };
};

const reconcileRenderArray = <Source, Render extends { id: number }>(
    source: Source[],
    previous: Render[],
    build: (item: Source) => Render,
    isSame: (previousItem: Render, nextItem: Render) => boolean,
): Render[] => {
    let changed = previous.length !== source.length;
    const next = new Array<Render>(source.length);

    for (let index = 0; index < source.length; index += 1) {
        const nextItem = build(source[index]);
        const previousItem = previous[index];

        if (previousItem && previousItem.id === nextItem.id && isSame(previousItem, nextItem)) {
            next[index] = previousItem;
            continue;
        }

        next[index] = nextItem;
        changed = true;
    }

    return changed ? next : previous;
};

const buildEnemyRenderItem = (enemy: ChaserEnemy): EnemyRenderItem => ({
    id: enemy.id,
    x: enemy.x,
    y: enemy.y,
    hp: enemy.hp,
    maxHp: enemy.maxHp,
    emoji: enemy.emoji,
    enemyType: enemy.enemyType,
    sizeScale: enemy.sizeScale,
});

const buildRangedEnemyRenderItem = (enemy: RangedEnemy): RangedEnemyRenderItem => ({
    id: enemy.id,
    x: enemy.x,
    y: enemy.y,
    hp: enemy.hp,
    maxHp: enemy.maxHp,
    emoji: enemy.emoji,
    enemyType: enemy.enemyType,
    contactRadius: enemy.contactRadius,
});

const buildEliteRenderItem = (enemy: EliteEnemy): EliteRenderItem => ({
    id: enemy.id,
    x: enemy.x,
    y: enemy.y,
    hp: enemy.hp,
    maxHp: enemy.maxHp,
    emoji: enemy.emoji,
    enemyType: enemy.enemyType,
    contactRadius: enemy.contactRadius,
    dashWindupUntilMs: enemy.dashWindupUntilMs,
    dashUntilMs: enemy.dashUntilMs,
    renderAngleDeg: enemy.renderAngleDeg,
    facing: enemy.facing,
    emojiBaseFacing: enemy.emojiBaseFacing,
});

const buildProjectileRenderItem = (projectile: EnemyProjectile): ProjectileRenderItem => ({
    id: projectile.id,
    x: projectile.x,
    y: projectile.y,
});

const buildPickupRenderItem = (pickup: XpPickup): PickupRenderItem => ({
    id: pickup.id,
    x: pickup.x,
    y: pickup.y,
    pickupKind: pickup.pickupKind,
    gemTier: pickup.gemTier,
    animalEmoji: pickup.animalEmoji,
});

const buildWebZoneRenderItem = (zone: WebZone): WebZoneRenderItem => ({
    id: zone.id,
    x: zone.x,
    y: zone.y,
    radius: zone.radius,
    hp: zone.hp,
    maxHp: zone.maxHp,
});

export const buildEnemyRenderSnapshot = (enemies: ChaserEnemy[], previous: EnemyRenderItem[] = []) => reconcileRenderArray(
    enemies,
    previous,
    buildEnemyRenderItem,
    (a, b) => (
        a.x === b.x
        && a.y === b.y
        && a.hp === b.hp
        && a.maxHp === b.maxHp
        && a.emoji === b.emoji
        && a.enemyType === b.enemyType
        && a.sizeScale === b.sizeScale
    )
);

export const buildRangedEnemyRenderSnapshot = (enemies: RangedEnemy[], previous: RangedEnemyRenderItem[] = []) => reconcileRenderArray(
    enemies,
    previous,
    buildRangedEnemyRenderItem,
    (a, b) => (
        a.x === b.x
        && a.y === b.y
        && a.hp === b.hp
        && a.maxHp === b.maxHp
        && a.emoji === b.emoji
        && a.enemyType === b.enemyType
        && a.contactRadius === b.contactRadius
    )
);

export const buildEliteRenderSnapshot = (
    enemy: EliteEnemy | null,
    previous: EliteRenderItem | null = null
): EliteRenderItem | null => {
    if (!enemy) return null;

    const next = buildEliteRenderItem(enemy);
    if (
        previous
        && previous.id === next.id
        && previous.x === next.x
        && previous.y === next.y
        && previous.hp === next.hp
        && previous.maxHp === next.maxHp
        && previous.emoji === next.emoji
        && previous.enemyType === next.enemyType
        && previous.contactRadius === next.contactRadius
        && previous.dashWindupUntilMs === next.dashWindupUntilMs
        && previous.dashUntilMs === next.dashUntilMs
        && previous.renderAngleDeg === next.renderAngleDeg
        && previous.facing === next.facing
        && previous.emojiBaseFacing === next.emojiBaseFacing
    ) {
        return previous;
    }

    return next;
};

export const buildProjectileRenderSnapshot = (
    projectiles: EnemyProjectile[],
    previous: ProjectileRenderItem[] = []
) => reconcileRenderArray(
    projectiles,
    previous,
    buildProjectileRenderItem,
    (a, b) => a.x === b.x && a.y === b.y
);

export const buildPickupRenderSnapshot = (
    pickups: XpPickup[],
    previous: PickupRenderItem[] = []
) => reconcileRenderArray(
    pickups,
    previous,
    buildPickupRenderItem,
    (a, b) => (
        a.x === b.x
        && a.y === b.y
        && a.pickupKind === b.pickupKind
        && a.gemTier === b.gemTier
        && a.animalEmoji === b.animalEmoji
    )
);

export const buildWebZoneRenderSnapshot = (
    zones: WebZone[],
    previous: WebZoneRenderItem[] = []
) => reconcileRenderArray(
    zones,
    previous,
    buildWebZoneRenderItem,
    (a, b) => (
        a.x === b.x
        && a.y === b.y
        && a.radius === b.radius
        && a.hp === b.hp
        && a.maxHp === b.maxHp
    )
);
