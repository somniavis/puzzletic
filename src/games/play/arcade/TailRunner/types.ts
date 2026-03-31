export type TailRunnerEntityType = 'food' | 'coin' | 'obstacle' | 'boost';

export interface TailRunnerEntity {
    id: string;
    x: number;
    y: number;
    type: TailRunnerEntityType;
    emoji: string;
    radius: number;
}

export interface TailRunnerTailSegment {
    x: number;
    y: number;
    emoji: string;
}

export interface TailRunnerState {
    playerX: number;
    playerY: number;
    playerAngle: number;
    playerSpeed: number;
    tail: TailRunnerTailSegment[];
    entities: TailRunnerEntity[];
    score: number;
    isGameOver: boolean;
    isStarted: boolean;
    highScore: number;
}
