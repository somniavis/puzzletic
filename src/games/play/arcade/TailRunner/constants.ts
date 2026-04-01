import type { TailRunnerGemTier, TailRunnerState } from './types';

export const TAIL_RUNNER_WORLD_SIZE = 3000;
export const TAIL_RUNNER_PLAYER_RADIUS = 20;
export const TAIL_RUNNER_TURN_SPEED = 0.05;
export const TAIL_RUNNER_BASE_SPEED = 3.5;
export const TAIL_RUNNER_BOOST_SPEED = 6;
export const TAIL_RUNNER_SHIELD_SPEED_MULTIPLIER = 1.5;
export const TAIL_RUNNER_SHIELD_DURATION = 540;
export const TAIL_RUNNER_SHIELD_GEM_BONUS = 10;
export const TAIL_RUNNER_MAX_SHIELD_CHARGES = 3;
export const TAIL_RUNNER_BOOST_SPAWN_MIN_TIME = 420;
export const TAIL_RUNNER_BOOST_SPAWN_MAX_TIME = 760;
export const TAIL_RUNNER_TAIL_SPACING = 8;
export const TAIL_RUNNER_GRID_SIZE = 120;
export const TAIL_RUNNER_HISTORY_LIMIT = 400;
export const TAIL_RUNNER_ENTITY_RESPAWN_PADDING = 140;
export const TAIL_RUNNER_INITIAL_FOOD_COUNT = 28;
export const TAIL_RUNNER_INITIAL_COIN_COUNT = 12;
export const TAIL_RUNNER_INITIAL_OBSTACLE_COUNT = 14;
export const TAIL_RUNNER_INITIAL_BARRIER_COUNT = 9;
export const TAIL_RUNNER_INITIAL_ENEMY_COUNT = 3;
export const TAIL_RUNNER_INITIAL_TYRANNO_COUNT = 2;
export const TAIL_RUNNER_FOOD_SCORE_STEP = 560;
export const TAIL_RUNNER_COIN_SCORE_STEP = 760;
export const TAIL_RUNNER_OBSTACLE_SCORE_STEP = 280;
export const TAIL_RUNNER_BARRIER_SCORE_STEP = 560;
export const TAIL_RUNNER_ENEMY_SCORE_STEP = 520;
export const TAIL_RUNNER_ENEMY_PER_STEP = 2;
export const TAIL_RUNNER_TYRANNO_SCORE_STEP = 1200;
export const TAIL_RUNNER_MAX_EXTRA_FOOD = 4;
export const TAIL_RUNNER_MAX_EXTRA_COIN = 2;
export const TAIL_RUNNER_MAX_EXTRA_OBSTACLE = 9;
export const TAIL_RUNNER_MAX_EXTRA_BARRIER = 3;
export const TAIL_RUNNER_MAX_EXTRA_ENEMY = 5;
export const TAIL_RUNNER_MAX_EXTRA_TYRANNO = 2;
export const TAIL_RUNNER_ENEMY_MIN_TAIL_COUNT = 3;
export const TAIL_RUNNER_ENEMY_MAX_TAIL_COUNT = 8;
export const TAIL_RUNNER_ENEMY_SPEED = 2.1;
export const TAIL_RUNNER_ENEMY_RADIUS = 18;
export const TAIL_RUNNER_TYRANNO_RADIUS = 22;
export const TAIL_RUNNER_TYRANNO_ROAM_SPEED = 1.25;
export const TAIL_RUNNER_TYRANNO_CHARGE_SPEED = 6.4;
export const TAIL_RUNNER_TYRANNO_DETECT_RADIUS = 280;
export const TAIL_RUNNER_TYRANNO_ALERT_TIME = 30;
export const TAIL_RUNNER_TYRANNO_CHARGE_TIME = 20;
export const TAIL_RUNNER_TYRANNO_COOLDOWN_TIME = 34;
export const TAIL_RUNNER_BARRIER_THICKNESS = 26;
export const TAIL_RUNNER_BARRIER_LENGTHS = [180, 280, 320] as const;
export const TAIL_RUNNER_FOOD_SCORE = 10;
export const TAIL_RUNNER_OBSTACLE_PENALTY = 30;
export const TAIL_RUNNER_BURST_LIFE = 32;
export const TAIL_RUNNER_DEFAULT_TAIL_EMOJI = '🐾';

export const TAIL_RUNNER_FOOD_EMOJIS = [
    '🐒',
    '🦍',
    '🦧',
    '🐕',
    '🐕‍🦺',
    '🐩',
    '🦝',
    '🐈',
    '🐈‍⬛',
    '🐅',
    '🐆',
    '🫏',
    '🦓',
    '🦌',
    '🦬',
    '🐂',
    '🐃',
    '🐄',
    '🐏',
    '🐑',
    '🐐',
    '🐪',
    '🐫',
    '🦙',
    '🦏',
    '🦛',
    '🐁',
    '🐇',
    '🐿️',
    '🦫',
    '🦔',
    '🦇',
    '🦨',
    '🦘',
    '🦡',
    '🦃',
    '🐓',
    '🐥',
    '🦅',
    '🦤',
] as const;
export const TAIL_RUNNER_OBSTACLE_EMOJIS = ['🔥', '💣', '🧨'] as const;

export const TAIL_RUNNER_GEM_SCORES: Record<TailRunnerGemTier, number> = {
    diamond: 60,
    gold: 35,
    berry: 15,
};

export const TAIL_RUNNER_GEM_COLORS: Record<TailRunnerGemTier, {
    body: string;
    top: string;
    edge: string;
    glow: string;
}> = {
    diamond: {
        body: '#74d7f7',
        top: '#d5f5ff',
        edge: '#3ea2cb',
        glow: 'rgba(116, 215, 247, 0.9)',
    },
    gold: {
        body: '#f2c34f',
        top: '#fff0a8',
        edge: '#bf8a14',
        glow: 'rgba(242, 195, 79, 0.88)',
    },
    berry: {
        body: '#d783d8',
        top: '#f6d5ff',
        edge: '#9b4cb0',
        glow: 'rgba(215, 131, 216, 0.86)',
    },
};

export const createInitialTailRunnerState = (): TailRunnerState => ({
    playerX: TAIL_RUNNER_WORLD_SIZE / 2,
    playerY: TAIL_RUNNER_WORLD_SIZE / 2,
    playerAngle: -Math.PI / 2,
    playerSpeed: TAIL_RUNNER_BASE_SPEED,
    shieldCharges: 0,
    shieldTimer: 0,
    boostSpawnTimer: 0,
    tail: [],
    entities: [],
    barriers: [],
    bursts: [],
    enemies: [],
    tyrannos: [],
    score: 0,
    isGameOver: false,
    isStarted: false,
    highScore: 0,
});
