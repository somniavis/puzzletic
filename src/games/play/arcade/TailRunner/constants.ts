import type { TailRunnerState } from './types';

export const TAIL_RUNNER_WORLD_SIZE = 3000;
export const TAIL_RUNNER_PLAYER_RADIUS = 20;
export const TAIL_RUNNER_TURN_SPEED = 0.05;
export const TAIL_RUNNER_BASE_SPEED = 3.5;
export const TAIL_RUNNER_BOOST_SPEED = 6;
export const TAIL_RUNNER_TAIL_SPACING = 25;
export const TAIL_RUNNER_GRID_SIZE = 120;
export const TAIL_RUNNER_HISTORY_LIMIT = 400;
export const TAIL_RUNNER_ENTITY_RESPAWN_PADDING = 140;
export const TAIL_RUNNER_INITIAL_FOOD_COUNT = 18;
export const TAIL_RUNNER_INITIAL_COIN_COUNT = 8;
export const TAIL_RUNNER_INITIAL_OBSTACLE_COUNT = 10;
export const TAIL_RUNNER_FOOD_SCORE = 10;
export const TAIL_RUNNER_COIN_SCORE = 50;
export const TAIL_RUNNER_OBSTACLE_PENALTY = 30;
export const TAIL_RUNNER_DEFAULT_TAIL_EMOJI = '🐾';

export const TAIL_RUNNER_FOOD_EMOJIS = ['🐣', '🐰', '🦊', '🐥', '🐹', '🐼'] as const;
export const TAIL_RUNNER_COIN_EMOJI = '💰';
export const TAIL_RUNNER_OBSTACLE_EMOJIS = ['💣', '🪨', '🔥', '⚠️'] as const;

export const createInitialTailRunnerState = (): TailRunnerState => ({
    playerX: TAIL_RUNNER_WORLD_SIZE / 2,
    playerY: TAIL_RUNNER_WORLD_SIZE / 2,
    playerAngle: -Math.PI / 2,
    playerSpeed: TAIL_RUNNER_BASE_SPEED,
    tail: [],
    entities: [],
    score: 0,
    isGameOver: false,
    isStarted: false,
    highScore: 0,
});
