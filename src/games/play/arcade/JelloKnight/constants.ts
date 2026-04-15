import type { TailRunnerGemTier } from '../TailRunner/types';
import type { FencePost, GroundPatch, JelloKnightHudState, Obstacle, ObstacleSlot, SkillUpgradeId, SpawnZone, Vector2, WeightedDropEntry } from './types';

export const FIELD_SIZE = 3000;
export const MAX_WAVE = 100;
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
export const ORBIT_COUNT_LEVELS = [1, 2, 3, 4] as const;
export const ORBIT_SPEED_LEVELS = [0.72, 0.86, 1.02, 1.20, 1.38] as const;
export const ORBIT_CRIT_MULTIPLIER_LEVELS = [1.4, 1.55, 1.75, 2.0, 2.3] as const;
export const ORBIT_CRIT_CHANCE = 0.08;
export const ORBIT_RADIUS = ORBIT_RADIUS_LEVELS[0];
export const ORBIT_SIZE = 24;
export const ORBIT_DAMAGE = ORBIT_DAMAGE_LEVELS[0];
export const ORBIT_ROTATION_SPEED = ORBIT_SPEED_LEVELS[0];
export const SKILL_MAX_LEVELS: Record<SkillUpgradeId, number> = {
    orb_damage: MAX_SKILL_LEVEL,
    orb_count: ORBIT_COUNT_LEVELS.length,
    orb_speed: MAX_SKILL_LEVEL,
    orb_radius: MAX_SKILL_LEVEL,
    orb_crit: MAX_SKILL_LEVEL,
    bomb_chance: MAX_SKILL_LEVEL,
    bomb_interval: MAX_SKILL_LEVEL,
    bomb_radius: MAX_SKILL_LEVEL,
    bomb_crit: MAX_SKILL_LEVEL,
    player_hp: MAX_SKILL_LEVEL,
    player_defense: MAX_SKILL_LEVEL,
    player_speed: MAX_SKILL_LEVEL,
};
export const ENEMY_SIZE = 82;
export const ENEMY_RADIUS = ENEMY_SIZE / 2;
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
export const BOMB_RADIUS_LEVELS = [60, 78, 98, 120, 144] as const;
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
export const PICKUP_SPAWN_GRACE_MS = 520;
export const XP_PICKUP_VALUE = 17;
export const XP_ORB_SCORE_VALUE = 0;
export const HEART_HEAL_VALUE = 12;
export const BASE_XP_TO_LEVEL = 100;
export const LEVEL_UP_CARD_COUNT = 3;
export const OBSTACLE_PLAYER_PADDING = 6;
export const OBSTACLE_ENEMY_PADDING = 6;
export const SIGNAL_DURATION_MS = 1100;
export const ANNOUNCEMENT_DURATION_MS = 3600;
export const VISUAL_SYNC_INTERVAL_MS = 33;
export const PLAYER_VISUAL_SYNC_INTERVAL_MS = 16;
export const WAVE_TRANSITION_DELAY_MS = 1400;
export const DAMAGE_FLASH_DURATION_MS = 340;
export const DAMAGE_FLASH_MAX_OPACITY = 0.72;
export const ENEMY_HIT_FEEDBACK_MS = 120;
export const DEBUG_CONTACT_RANGES_ENABLED = false;
export const DEBUG_OBSTACLE_SLOTS_ENABLED = true;
export const DEBUG_CASTLE_SPAWN_POINTS_ENABLED = true;

export const INITIAL_HUD_STATE: JelloKnightHudState = {
    hp: PLAYER_MAX_HP,
    xpPercent: 0,
    score: 0,
    elapsedMs: 0,
    wave: 1,
    dangerTier: 1,
    level: 1,
};

export const FIELD_CASTLE_CENTER: Vector2 = {
    x: FIELD_SIZE / 2,
    y: FIELD_SIZE / 2,
};

const INNER_BOTTOM_SMALL_WALL_CENTER: Vector2 = {
    x: FIELD_SIZE / 2,
    y: (FIELD_SIZE / 2) + 486 + 37,
};

export const INITIAL_PLAYER_POSITION: Vector2 = {
    x: FIELD_CASTLE_CENTER.x,
    y: Math.round((FIELD_CASTLE_CENTER.y + INNER_BOTTOM_SMALL_WALL_CENTER.y) / 2),
};

export const CASTLE_OBSTACLE: Obstacle = {
    id: 'castle-core',
    x: FIELD_CASTLE_CENTER.x - 52,
    y: FIELD_CASTLE_CENTER.y - 46,
    width: 104,
    height: 92,
    stageRequired: 1,
};

export const FIELD_CORNER_SPAWN_ZONES: SpawnZone[] = [
    { id: 'northwest', x: 110, y: 110, width: 180, height: 180 },
    { id: 'northeast', x: FIELD_SIZE - 290, y: 110, width: 180, height: 180 },
    { id: 'southwest', x: 110, y: FIELD_SIZE - 290, width: 180, height: 180 },
    { id: 'southeast', x: FIELD_SIZE - 290, y: FIELD_SIZE - 290, width: 180, height: 180 },
] as const;

export const FIELD_CASTLE_SPAWN_ZONES: SpawnZone[] = [
    {
        id: 'castle-top-center',
        x: FIELD_CASTLE_CENTER.x - 16,
        y: CASTLE_OBSTACLE.y - 28,
        width: 32,
        height: 20,
    },
    {
        id: 'castle-bottom-center',
        x: FIELD_CASTLE_CENTER.x - 18,
        y: CASTLE_OBSTACLE.y + CASTLE_OBSTACLE.height + 8,
        width: 36,
        height: 24,
    },
    {
        id: 'castle-left-center',
        x: CASTLE_OBSTACLE.x - 28,
        y: FIELD_CASTLE_CENTER.y - 16,
        width: 20,
        height: 32,
    },
    {
        id: 'castle-right-center',
        x: CASTLE_OBSTACLE.x + CASTLE_OBSTACLE.width + 8,
        y: FIELD_CASTLE_CENTER.y - 16,
        width: 20,
        height: 32,
    },
] as const;

export const WEB_ZONE_RADIUS = 72;
export const WEB_ZONE_DURATION_MS = 4200;
export const WEB_ZONE_SLOW_MULTIPLIER = 0.78;
export const WEB_ZONE_MAX_COUNT = 5;
export const WEB_ZONE_TOUCH_SLOW_MULTIPLIER = 0.5;
export const WEB_ZONE_TOUCH_DEBUFF_MS = 3000;
export const WEB_ZONE_HP = 6;
export const WEB_SHOT_INTERVAL_MS = 3000;
export const WEB_SHOT_MIN_DISTANCE = 120;
export const WEB_SHOT_MAX_DISTANCE = 250;
export const WEB_ZONE_ORBIT_HIT_COOLDOWN_MS = 200;

export const OBSTACLE_SLOT_SET: ObstacleSlot[] = [
    { id: 'slot-top-left', x: FIELD_SIZE / 2 - 640, y: FIELD_SIZE / 2 - 560, width: 300, height: 74, stageRequired: 1 },
    { id: 'slot-top-right', x: FIELD_SIZE / 2 + 340, y: FIELD_SIZE / 2 - 560, width: 300, height: 74, stageRequired: 1 },
    { id: 'slot-top-center-small', x: FIELD_SIZE / 2 - 48, y: FIELD_SIZE / 2 - 560, width: 96, height: 74, stageRequired: 2 },
    { id: 'slot-left-upper', x: FIELD_SIZE / 2 - 660, y: FIELD_SIZE / 2 - 420, width: 96, height: 270, stageRequired: 2 },
    { id: 'slot-left-lower', x: FIELD_SIZE / 2 - 660, y: FIELD_SIZE / 2 + 150, width: 96, height: 270, stageRequired: 2 },
    { id: 'slot-right-upper', x: FIELD_SIZE / 2 + 564, y: FIELD_SIZE / 2 - 420, width: 96, height: 270, stageRequired: 2 },
    { id: 'slot-right-lower', x: FIELD_SIZE / 2 + 564, y: FIELD_SIZE / 2 + 150, width: 96, height: 270, stageRequired: 2 },
    { id: 'slot-bottom-left', x: FIELD_SIZE / 2 - 640, y: FIELD_SIZE / 2 + 486, width: 300, height: 74, stageRequired: 3 },
    { id: 'slot-bottom-right', x: FIELD_SIZE / 2 + 340, y: FIELD_SIZE / 2 + 486, width: 300, height: 74, stageRequired: 3 },
    { id: 'slot-bottom-center-small', x: FIELD_SIZE / 2 - 48, y: FIELD_SIZE / 2 + 486, width: 96, height: 74, stageRequired: 3 },
    { id: 'slot-outer-northwest', x: 240, y: 300, width: 280, height: 74, stageRequired: 4 },
    { id: 'slot-outer-north-main', x: FIELD_SIZE / 2 - 450, y: 300, width: 300, height: 70, stageRequired: 4 },
    { id: 'slot-outer-north-short', x: FIELD_SIZE / 2 + 350, y: 300, width: 96, height: 70, stageRequired: 4 },
    { id: 'slot-outer-northeast', x: FIELD_SIZE - 520, y: 320, width: 280, height: 74, stageRequired: 4 },
    { id: 'slot-outer-southwest', x: 260, y: FIELD_SIZE - 394, width: 280, height: 74, stageRequired: 4 },
    { id: 'slot-outer-south-short', x: FIELD_SIZE / 2 - 446, y: FIELD_SIZE - 394, width: 96, height: 70, stageRequired: 4 },
    { id: 'slot-outer-south-main', x: FIELD_SIZE / 2 + 350, y: FIELD_SIZE - 394, width: 300, height: 70, stageRequired: 4 },
    { id: 'slot-outer-southeast', x: FIELD_SIZE - 540, y: FIELD_SIZE - 414, width: 280, height: 74, stageRequired: 4 },
    { id: 'slot-outer-west-main', x: 250, y: FIELD_SIZE / 2 - 330, width: 92, height: 300, stageRequired: 4 },
    { id: 'slot-outer-west-short', x: 250, y: FIELD_SIZE / 2 + 500, width: 92, height: 96, stageRequired: 4 },
    { id: 'slot-outer-east-main', x: FIELD_SIZE - 342, y: FIELD_SIZE / 2 + 140, width: 92, height: 300, stageRequired: 4 },
    { id: 'slot-outer-east-short', x: FIELD_SIZE - 342, y: FIELD_SIZE / 2 - 606, width: 92, height: 96, stageRequired: 4 },
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
    { type: 'xp', weight: 85 },
    { type: 'berry', weight: 85 },
    { type: 'heart', weight: 30 },
];

export const LEVEL_TWO_DROP_TABLE: WeightedDropEntry[] = [
    { type: 'xp', weight: 85 },
    { type: 'berry', weight: 55 },
    { type: 'gold', weight: 30 },
    { type: 'heart', weight: 30 },
];

export const LEVEL_FOUR_DROP_TABLE: WeightedDropEntry[] = [
    { type: 'xp', weight: 85 },
    { type: 'berry', weight: 20 },
    { type: 'gold', weight: 35 },
    { type: 'diamond', weight: 30 },
    { type: 'heart', weight: 30 },
];
