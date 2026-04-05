export const GROGRO_LAND_WORLD_WIDTH = 3000;
export const GROGRO_LAND_WORLD_HEIGHT = 3000;
export const GROGRO_LAND_TILE_SIZE = 20;
export const GROGRO_LAND_START_TERRITORY_SIZE = 100;
export const GROGRO_LAND_PLAYER_OWNER_ID = 1;
export const GROGRO_LAND_ENEMY_COUNT = 3;
export const GROGRO_LAND_PLAYER_SPEED = 3.2;
export const GROGRO_LAND_TURN_SPEED = 0.055;
export const GROGRO_LAND_TRAIL_SAMPLE_DISTANCE = 18;
export const GROGRO_LAND_HUD_SYNC_MS = 120;
export const GROGRO_LAND_BOUNDARY_PADDING = 2;
export const GROGRO_LAND_CAMERA_OUTER_GUTTER = 120;
export const GROGRO_LAND_ITEM_PICKUP_RADIUS = 24;
export const GROGRO_LAND_ITEM_INITIAL_COUNT = 4;
export const GROGRO_LAND_ITEM_MAX_COUNT = 16;
export const GROGRO_LAND_ITEM_SPAWN_INTERVAL_FRAMES = 420;
export const GROGRO_LAND_ITEM_SPAWN_BATCH_COUNT = 2;
export const GROGRO_LAND_BOOST_MULTIPLIER = 1.6;
export const GROGRO_LAND_SLOW_MULTIPLIER = 0.6;
export const GROGRO_LAND_BOOST_DURATION_FRAMES = 420;
export const GROGRO_LAND_BOOST_WARNING_FRAMES = 120;
export const GROGRO_LAND_SLOW_DURATION_FRAMES = 240;
export const GROGRO_LAND_FREEZE_DURATION_FRAMES = 180;
export const GROGRO_LAND_STATUS_BADGE_FADE_FRAMES = 18;
export const GROGRO_LAND_BOMB_RADIUS = 150;

export const GROGRO_LAND_OWNER_COLOR_POOL = [
    {
        fill: '#8fd16c',
        edge: '#4b8b3c',
        trail: '#6fbe51',
        actor: '#2f6f34',
    },
    {
        fill: '#ffb067',
        edge: '#d46f38',
        trail: '#f38a5b',
        actor: '#b34f28',
    },
    {
        fill: '#7fc8ff',
        edge: '#4d86d9',
        trail: '#63a7f1',
        actor: '#3668b3',
    },
    {
        fill: '#f3a6d8',
        edge: '#c767a7',
        trail: '#df7fc0',
        actor: '#9d4d82',
    },
    {
        fill: '#a68cff',
        edge: '#6b54c7',
        trail: '#8e73ea',
        actor: '#513d9d',
    },
    {
        fill: '#ff7f8a',
        edge: '#cc4356',
        trail: '#f26072',
        actor: '#a72f45',
    },
    {
        fill: '#ffd36d',
        edge: '#c58b1f',
        trail: '#f2bd45',
        actor: '#986711',
    },
] as const;

export const GROGRO_LAND_ENEMY_PERSONALITY_CONFIG = {
    conservative: {
        patrolCooldown: 62,
        patrolVariance: 10,
        expandFrames: 204,
        expandVariance: 24,
        arcFrames: 54,
        arcVariance: 10,
        arcTurnAngle: 1.02,
        returnEntryOffset: 96,
        decisionCooldown: 14,
        returnCooldown: 56,
        returnVariance: 10,
        turnJitter: 0.76,
        avoidTurnBoost: 1.5,
    },
    balanced: {
        patrolCooldown: 46,
        patrolVariance: 8,
        expandFrames: 244,
        expandVariance: 32,
        arcFrames: 72,
        arcVariance: 12,
        arcTurnAngle: 1.2,
        returnEntryOffset: 128,
        decisionCooldown: 10,
        returnCooldown: 42,
        returnVariance: 12,
        turnJitter: 0.92,
        avoidTurnBoost: 1.4,
    },
    aggressive: {
        patrolCooldown: 28,
        patrolVariance: 6,
        expandFrames: 322,
        expandVariance: 44,
        arcFrames: 98,
        arcVariance: 16,
        arcTurnAngle: 1.38,
        returnEntryOffset: 164,
        decisionCooldown: 7,
        returnCooldown: 28,
        returnVariance: 16,
        turnJitter: 1.14,
        avoidTurnBoost: 1.3,
    },
} as const;

export const GROGRO_LAND_ENEMY_EMOJI_POOL = [
    '🐵',
    '🐶',
    '🦊',
    '🐱',
    '🦁',
    '🐯',
    '🫎',
    '🐮',
    '🐷',
    '🐹',
    '🐰',
    '🐻',
    '🐻‍❄️',
    '🐨',
    '🐼',
] as const;

export const GROGRO_LAND_ITEM_EMOJI_MAP = {
    boost: '⚡',
    slow: '🐢',
    freeze: '🧊',
    bomb: '💣',
} as const;

export const GROGRO_LAND_ITEM_KIND_POOL = [
    'boost',
    'slow',
    'freeze',
    'bomb',
] as const;
