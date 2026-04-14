import type { TailRunnerGemTier } from '../TailRunner/types';

export type Vector2 = { x: number; y: number };

export type SpawnZone = {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
};

export type ChaserEnemy = {
    id: number;
    x: number;
    y: number;
    hp: number;
    maxHp: number;
    orbContactReady: boolean;
    emoji: '👾' | '🦠' | '🪼' | '🎃';
    enemyType: 'standard' | 'swift' | 'heavy' | 'pumpkin';
    baseSpeed: number;
    contactDamage: number;
    sizeScale: number;
};

export type RangedEnemy = {
    id: number;
    x: number;
    y: number;
    hp: number;
    cooldownMs: number;
    maxHp: number;
    orbContactReady: boolean;
    emoji: '🧿' | '👁️‍🗨️';
    enemyType: 'sniper' | 'heavyCaster';
    baseSpeed: number;
    contactRadius: number;
    fireRange: number;
    fireCooldownMs: number;
    projectileSpeed: number;
    projectileDamage: number;
    xpValue: number;
};

export type XpPickup = {
    id: number;
    x: number;
    y: number;
    spawnedAtMs: number;
    value: number;
    scoreValue: number;
    pickupKind: 'xp' | 'score' | 'heart';
    gemTier?: TailRunnerGemTier;
    healValue?: number;
    animalEmoji?: string;
};

export type EliteEnemy = {
    id: number;
    x: number;
    y: number;
    hp: number;
    maxHp: number;
    orbContactReady: boolean;
    emoji: '🦖' | '🦂' | '🕷️';
    enemyType: 'brute' | 'stinger' | 'weaver';
    baseSpeed: number;
    contactRadius: number;
    contactDamage: number;
    spawnIntervalMs: number;
    xpValue: number;
    dashWindupMs: number;
    dashSpeedMultiplier: number;
    dashDurationMs: number;
    dashCooldownMinMs: number;
    dashCooldownMaxMs: number;
    nextDashReadyAtMs: number;
    dashWindupUntilMs: number | null;
    dashUntilMs: number | null;
    dashDirectionX: number;
    dashDirectionY: number;
    lastWebShotAtMs: number;
    renderAngleDeg: number;
    facing: 'left' | 'right';
    emojiBaseFacing: 'left' | 'right';
};

export type WebZone = {
    id: number;
    x: number;
    y: number;
    radius: number;
    slowMultiplier: number;
    hp: number;
    maxHp: number;
    lastOrbHitAtMs: number;
    expiresAtMs: number;
};

export type EnemyProjectile = {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    damage: number;
};

export type BombStrike = {
    id: number;
    strikeKind: 'bomb' | 'web';
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
    createdAtMs: number;
    landAtMs: number;
    triggerAtMs: number;
};

export type BombBlast = {
    id: number;
    x: number;
    y: number;
    radius: number;
    expiresAtMs: number;
};

export type SpawnSignal = {
    id: number;
    x: number;
    y: number;
    size: number;
    tone: 'danger' | 'ranged' | 'elite';
    expiresAtMs: number;
};

export type ObstacleSlot = {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    stageRequired: number;
};

export type Obstacle = ObstacleSlot;

export type GroundPatch = {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotate?: number;
    markScale?: number;
    markPattern?: 'a' | 'b' | 'c' | 'd';
};

export type FencePost = {
    id: string;
    side: 'top' | 'right' | 'bottom' | 'left';
    x: number;
    y: number;
    width: number;
    height: number;
    tilt: number;
    tone: 'light' | 'mid' | 'dark';
    bandOffset: number;
};

export type SkillUpgradeId =
    | 'orb_damage'
    | 'orb_count'
    | 'orb_speed'
    | 'orb_radius'
    | 'orb_crit'
    | 'bomb_chance'
    | 'bomb_interval'
    | 'bomb_radius'
    | 'bomb_crit'
    | 'player_hp'
    | 'player_defense'
    | 'player_speed';

export type UpgradeOptionId = SkillUpgradeId | 'bomb_unlock';

export type UpgradeLevels = Record<SkillUpgradeId, number>;

export type UpgradeOption = {
    id: UpgradeOptionId;
    title: string;
    description: string;
    icon: string;
    currentLevel: number;
    nextLevel: number;
    maxLevel: number;
    isUnlock?: boolean;
};

export type JelloKnightPhaseOverlay = 'start' | 'playing' | 'levelUp' | 'gameOver';

export type JelloKnightAnnouncement = {
    id: number;
    title: string;
    detail: string;
    tone: 'danger' | 'ranged' | 'elite';
};

export type JelloKnightHudState = {
    hp: number;
    xpPercent: number;
    score: number;
    elapsedMs: number;
    wave: number;
    dangerTier: number;
    level: number;
};

export type RunnerMotion = {
    x: number;
    y: number;
    strength: number;
};

export type EnemyRenderItem = Pick<ChaserEnemy, 'id' | 'x' | 'y' | 'hp' | 'maxHp' | 'emoji' | 'enemyType' | 'sizeScale'>;

export type RangedEnemyRenderItem = Pick<RangedEnemy, 'id' | 'x' | 'y' | 'hp' | 'maxHp' | 'emoji' | 'enemyType' | 'contactRadius'>;

export type EliteRenderItem = Pick<
    EliteEnemy,
    'id'
    | 'x'
    | 'y'
    | 'hp'
    | 'maxHp'
    | 'emoji'
    | 'enemyType'
    | 'contactRadius'
    | 'dashWindupUntilMs'
    | 'dashUntilMs'
    | 'renderAngleDeg'
    | 'facing'
    | 'emojiBaseFacing'
>;

export type ProjectileRenderItem = Pick<EnemyProjectile, 'id' | 'x' | 'y'>;

export type PickupRenderItem = Pick<
    XpPickup,
    'id'
    | 'x'
    | 'y'
    | 'pickupKind'
    | 'gemTier'
    | 'animalEmoji'
>;

export type WebZoneRenderItem = Pick<WebZone, 'id' | 'x' | 'y' | 'radius' | 'hp' | 'maxHp'>;

export type PickupDropType = 'xp' | TailRunnerGemTier | 'heart';

export type WeightedDropEntry = {
    type: PickupDropType;
    weight: number;
};
