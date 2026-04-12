import type { TailRunnerGemTier } from '../TailRunner/types';
import type { ChaserEnemy, FencePost, GroundPatch, JelloKnightHudState, Obstacle, RangedEnemy, Vector2, WeightedDropEntry } from './types';

export const FIELD_SIZE = 3000;
export const MAX_WAVE = 100;
export const WAVE_DURATION_MS = 8000;
export const PLAYER_SIZE = 52;
export const PLAYER_RADIUS = PLAYER_SIZE / 2;
export const MAX_SKILL_LEVEL = 5;
export const PLAYER_MOVE_SPEED_LEVELS = [232, 244, 258, 275, 292] as const;
export const PLAYER_MAX_HP_LEVELS = [50, 65, 82, 100, 120] as const;
export const PLAYER_DEFENSE_LEVELS = [0, 0.05, 0.10, 0.16, 0.22] as const;
export const PLAYER_BASE_SPEED = PLAYER_MOVE_SPEED_LEVELS[0];
export const JOYSTICK_MAX_RADIUS = 42;
export const ORBIT_DAMAGE_LEVELS = [3, 3.4, 3.8, 4.3, 4.8] as const;
export const ORBIT_RADIUS_LEVELS = [76, 84, 100, 118, 138] as const;
export const ORBIT_COUNT_LEVELS = [1, 2, 2, 3, 4] as const;
export const ORBIT_SPEED_LEVELS = [0.72, 0.86, 1.02, 1.20, 1.38] as const;
export const ORBIT_CRIT_MULTIPLIER_LEVELS = [1.4, 1.55, 1.75, 2.0, 2.3] as const;
export const ORBIT_CRIT_CHANCE = 0.08;
export const ORBIT_RADIUS = ORBIT_RADIUS_LEVELS[0];
export const ORBIT_SIZE = 24;
export const ORBIT_DAMAGE = ORBIT_DAMAGE_LEVELS[0];
export const ORBIT_ROTATION_SPEED = ORBIT_SPEED_LEVELS[0];
export const ENEMY_SIZE = 82;
export const ENEMY_RADIUS = ENEMY_SIZE / 2;
export const ENEMY_CONTACT_RADIUS = 34;
export const ENEMY_SPAWN_INTERVAL_MS = 1200;
export const ENEMY_MAX_COUNT = 10;
export const ELITE_SIZE = 244;
export const ELITE_RADIUS = ELITE_SIZE / 2;
export const ELITE_SPAWN_INTERVAL_MS = 18000;
export const RANGED_ENEMY_SIZE = 78;
export const RANGED_ENEMY_RADIUS = RANGED_ENEMY_SIZE / 2;
export const RANGED_ENEMY_SPAWN_INTERVAL_MS = 9500;
export const ENEMY_PROJECTILE_RADIUS = 16;
export const BOMB_BASE_DAMAGE = 7;
export const BOMB_DROP_CHANCE_LEVELS = [0.18, 0.24, 0.31, 0.39, 0.48] as const;
export const BOMB_DROP_INTERVAL_LEVELS = [3400, 3050, 2750, 2450, 2150] as const;
export const BOMB_RADIUS_LEVELS = [52, 66, 82, 100, 120] as const;
export const BOMB_CRIT_MULTIPLIER_LEVELS = [1.7, 2.0, 2.3, 2.6, 3.0] as const;
export const BOMB_CRIT_CHANCE = 0.12;
export const BOMB_BASE_RADIUS = BOMB_RADIUS_LEVELS[0];
export const BOMB_TRIGGER_INTERVAL_MS = BOMB_DROP_INTERVAL_LEVELS[0];
export const BOMB_TRIGGER_CHANCE = BOMB_DROP_CHANCE_LEVELS[0];
export const BOMB_FALL_DELAY_MS = 3000;
export const BOMB_BLAST_VISUAL_MS = 260;
export const CONTACT_DAMAGE = 7;
export const CONTACT_DAMAGE_COOLDOWN_MS = 700;
export const PLAYER_MAX_HP = PLAYER_MAX_HP_LEVELS[0];
export const PICKUP_COLLECT_RADIUS = 44;
export const XP_PICKUP_VALUE = 17;
export const XP_ORB_SCORE_VALUE = 0;
export const HEART_HEAL_VALUE = 12;
export const BASE_XP_TO_LEVEL = 100;
export const LEVEL_UP_CARD_COUNT = 3;
export const OBSTACLE_PLAYER_PADDING = 6;
export const OBSTACLE_ENEMY_PADDING = 6;
export const SIGNAL_DURATION_MS = 1100;
export const ANNOUNCEMENT_DURATION_MS = 2200;
export const VISUAL_SYNC_INTERVAL_MS = 33;
export const PLAYER_VISUAL_SYNC_INTERVAL_MS = 16;

export const INITIAL_HUD_STATE: JelloKnightHudState = {
    hp: PLAYER_MAX_HP,
    xpPercent: 0,
    score: 0,
    elapsedMs: 0,
    wave: 1,
    dangerTier: 1,
    level: 1,
};

export const INITIAL_PLAYER_POSITION: Vector2 = {
    x: FIELD_SIZE / 2,
    y: FIELD_SIZE / 2,
};

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
    enemyType: 'brute' | 'stinger';
    emoji: '🦖' | '🦂';
    emojiBaseFacing: 'left' | 'right';
    hp: number;
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
    spawnWeight: number;
}> = [
    {
        enemyType: 'brute',
        emoji: '🦖',
        emojiBaseFacing: 'left',
        hp: 40,
        baseSpeed: 64,
        contactRadius: 54,
        contactDamage: 13,
        spawnIntervalMs: 20000,
        xpValue: 60,
        dashWindupMs: 550,
        dashSpeedMultiplier: 2.3,
        dashDurationMs: 420,
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
        spawnIntervalMs: 16000,
        xpValue: 48,
        dashWindupMs: 320,
        dashSpeedMultiplier: 2.8,
        dashDurationMs: 260,
        dashCooldownMinMs: 2600,
        dashCooldownMaxMs: 3600,
        spawnWeight: 40,
    },
];

export const OBSTACLE_SET: Obstacle[] = [
    { id: 'north-wall', x: FIELD_SIZE / 2 - 240, y: FIELD_SIZE / 2 - 436, width: 480, height: 67, stageRequired: 2 },
    { id: 'west-pillar', x: FIELD_SIZE / 2 - 520, y: FIELD_SIZE / 2 - 120, width: 96, height: 280, stageRequired: 3 },
    { id: 'east-pillar', x: FIELD_SIZE / 2 + 424, y: FIELD_SIZE / 2 - 120, width: 96, height: 280, stageRequired: 3 },
    { id: 'south-wall', x: FIELD_SIZE / 2 - 260, y: FIELD_SIZE / 2 + 332, width: 520, height: 77, stageRequired: 4 },
    { id: 'center-block', x: FIELD_SIZE / 2 - 84, y: FIELD_SIZE / 2 + 10, width: 168, height: 132, stageRequired: 5 },
];

export const FIELD_GROUND_PATCHES: GroundPatch[] = [
    { id: 'ground-a', x: 410, y: 380, width: 360, height: 340, rotate: -2, markScale: 0.9, markPattern: 'a' },
    { id: 'ground-b', x: 1970, y: 540, width: 390, height: 360, rotate: 1.5, markScale: 1.08, markPattern: 'b' },
    { id: 'ground-c', x: 990, y: 1820, width: 420, height: 390, rotate: -1, markScale: 1.16, markPattern: 'c' },
    { id: 'ground-d', x: 2270, y: 2110, width: 340, height: 320, rotate: 2.5, markScale: 0.82, markPattern: 'd' },
];

const FENCE_SPACING = 42;
const FENCE_MARGIN = 14;

const createFencePosts = (
    side: FencePost['side'],
    count: number,
    positionForIndex: (index: number) => Pick<FencePost, 'x' | 'y'>,
): FencePost[] => Array.from({ length: count }, (_, index) => {
    const variant = index % 5;
    const width = 16 + (variant === 1 ? 2 : variant === 3 ? -1 : 0);
    const height = 40 + (index % 4 === 0 ? 10 : index % 4 === 1 ? 4 : index % 4 === 2 ? 7 : 1);
    const tone: FencePost['tone'] = index % 3 === 0 ? 'light' : index % 3 === 1 ? 'mid' : 'dark';
    const tilt = index % 2 === 0 ? -1.3 : 1.2;
    const bandOffset = 8 + ((index % 4) * 3);
    return {
        id: `fence-${side}-${index}`,
        side,
        width,
        height,
        tilt,
        tone,
        bandOffset,
        ...positionForIndex(index),
    };
});

export const FIELD_FENCE_POSTS: FencePost[] = [
    ...createFencePosts('top', Math.ceil((FIELD_SIZE - (FENCE_MARGIN * 2)) / FENCE_SPACING), (index) => ({
        x: FENCE_MARGIN + (index * FENCE_SPACING),
        y: -8,
    })),
    ...createFencePosts('bottom', Math.ceil((FIELD_SIZE - (FENCE_MARGIN * 2)) / FENCE_SPACING), (index) => ({
        x: FENCE_MARGIN + (index * FENCE_SPACING),
        y: FIELD_SIZE - 34,
    })),
    ...createFencePosts('left', Math.ceil((FIELD_SIZE - (FENCE_MARGIN * 2)) / FENCE_SPACING), (index) => ({
        x: 22,
        y: FENCE_MARGIN + (index * FENCE_SPACING),
    })),
    ...createFencePosts('right', Math.ceil((FIELD_SIZE - (FENCE_MARGIN * 2)) / FENCE_SPACING), (index) => ({
        x: FIELD_SIZE - 38,
        y: FENCE_MARGIN + (index * FENCE_SPACING),
    })),
];

export const SPECIES_ORB_COLORS: Record<string, { core: string; glow: string; edge: string }> = {
    yellowJello: { core: '#f5ce45', glow: 'rgba(255, 216, 104, 0.44)', edge: '#fff1ae' },
    redJello: { core: '#ff6f7f', glow: 'rgba(255, 108, 127, 0.38)', edge: '#ffd0d6' },
    mintJello: { core: '#5fd8b0', glow: 'rgba(95, 216, 176, 0.36)', edge: '#d5fff0' },
    blueJello: { core: '#6ea3ff', glow: 'rgba(110, 163, 255, 0.38)', edge: '#dce9ff' },
    purpleJello: { core: '#9c7dff', glow: 'rgba(156, 125, 255, 0.4)', edge: '#ece3ff' },
    orangeJello: { core: '#ff9a4c', glow: 'rgba(255, 154, 76, 0.38)', edge: '#ffe0bf' },
    creamJello: { core: '#e8d7a9', glow: 'rgba(232, 215, 169, 0.34)', edge: '#fff4da' },
    pinkJello: { core: '#ff91c0', glow: 'rgba(255, 145, 192, 0.38)', edge: '#ffe0ee' },
};

export const GEM_SCORE_VALUES: Record<TailRunnerGemTier, number> = {
    berry: 12,
    gold: 32,
    diamond: 85,
};

export const RESCUE_ANIMALS: Record<TailRunnerGemTier, string[]> = {
    berry: ['🐤', '🐰', '🐹', '🐔', '🐷'],
    gold: ['🐵', '🐶', '🦊', '🐱', '🐮', '🐻', '🐧'],
    diamond: ['🦁', '🐯', '🐻‍❄️', '🐨', '🐼'],
};

export const LEVEL_ONE_DROP_TABLE: WeightedDropEntry[] = [
    { type: 'xp', weight: 40 },
    { type: 'berry', weight: 40 },
    { type: 'heart', weight: 20 },
];

export const LEVEL_TWO_DROP_TABLE: WeightedDropEntry[] = [
    { type: 'xp', weight: 35 },
    { type: 'berry', weight: 30 },
    { type: 'gold', weight: 20 },
    { type: 'heart', weight: 15 },
];

export const LEVEL_FOUR_DROP_TABLE: WeightedDropEntry[] = [
    { type: 'xp', weight: 28 },
    { type: 'berry', weight: 22 },
    { type: 'gold', weight: 25 },
    { type: 'diamond', weight: 15 },
    { type: 'heart', weight: 10 },
];
