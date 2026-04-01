export type TailRunnerEntityType = 'food' | 'coin' | 'obstacle' | 'boost';
export type TailRunnerGemTier = 'diamond' | 'gold' | 'berry';

export interface TailRunnerEntity {
    id: string;
    x: number;
    y: number;
    type: TailRunnerEntityType;
    emoji: string;
    radius: number;
    facing: -1 | 1;
    coinTier?: TailRunnerGemTier;
    scoreValue?: number;
}

export interface TailRunnerTailSegment {
    x: number;
    y: number;
    emoji: string;
    facing: -1 | 1;
}

export interface TailRunnerBarrier {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    orientation: 'horizontal' | 'vertical';
}

export interface TailRunnerBurst {
    id: string;
    x: number;
    y: number;
    emoji: string;
    life: number;
    maxLife: number;
}

export interface TailRunnerEnemySnake {
    id: string;
    x: number;
    y: number;
    angle: number;
    speed: number;
    turnDrift: number;
    tail: TailRunnerTailSegment[];
    history: Array<{ x: number; y: number }>;
}

export interface TailRunnerTyrannoEnemy {
    id: string;
    x: number;
    y: number;
    angle: number;
    facing: -1 | 1;
    phase: 'roam' | 'alert' | 'charge' | 'cooldown';
    timer: number;
    targetAngle: number;
    turnDrift: number;
}

export interface TailRunnerState {
    playerX: number;
    playerY: number;
    playerAngle: number;
    playerSpeed: number;
    shieldCharges: number;
    shieldTimer: number;
    boostSpawnTimer: number;
    tail: TailRunnerTailSegment[];
    entities: TailRunnerEntity[];
    barriers: TailRunnerBarrier[];
    bursts: TailRunnerBurst[];
    enemies: TailRunnerEnemySnake[];
    tyrannos: TailRunnerTyrannoEnemy[];
    score: number;
    isGameOver: boolean;
    isStarted: boolean;
    highScore: number;
}
