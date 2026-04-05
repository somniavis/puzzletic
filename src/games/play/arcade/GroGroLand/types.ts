export type GroGroLandPhase = 'start' | 'playing' | 'paused' | 'gameOver';
export type GroGroLandActorStatus = 'safe' | 'drawing' | 'dead';
export type GroGroLandEnemyPersonality = 'conservative' | 'balanced' | 'aggressive';
export type GroGroLandItemKind = 'boost' | 'slow' | 'freeze' | 'bomb';

export type GroGroLandOwnerPalette = {
    fill: string;
    edge: string;
    trail: string;
    actor: string;
};

export type GroGroLandActor = {
    id: string;
    ownerId: number;
    x: number;
    y: number;
    direction: number;
    speed: number;
    status: GroGroLandActorStatus;
    trail: Array<{ x: number; y: number }>;
    captureExitPoint: { x: number; y: number } | null;
    duelWithId: string | null;
    colors: GroGroLandOwnerPalette;
    spawnX: number;
    spawnY: number;
    boostTimer: number;
    slowTimer: number;
    freezeTimer: number;
};

export type GroGroLandEnemy = GroGroLandActor & {
    emoji: string;
    personality: GroGroLandEnemyPersonality;
    aiMode: 'patrol' | 'expand' | 'arc' | 'return';
    decisionCooldown: number;
    expandFrames: number;
    arcFrames: number;
    arcTurnDirection: -1 | 1;
    arcTargetDirection: number | null;
    returnTarget: { x: number; y: number } | null;
};

export type GroGroLandGem = {
    id: string;
    x: number;
    y: number;
    emoji: string;
    kind: 'plus' | 'minus' | 'multiply' | 'divide';
};

export type GroGroLandItem = {
    id: string;
    x: number;
    y: number;
    emoji: string;
    kind: GroGroLandItemKind;
};

export type GroGroLandCaptureEffect = {
    id: number;
    ownerId: number;
    points: Array<{ x: number; y: number }>;
    ttl: number;
    maxTtl: number;
};

export type GroGroLandState = {
    phase: GroGroLandPhase;
    player: GroGroLandActor;
    enemies: GroGroLandEnemy[];
    grid: Uint16Array;
    bombVoidMask: Uint8Array;
    cols: number;
    rows: number;
    score: number;
    bestScore: number;
    landPercent: number;
    bestLandPercent: number;
    gems: GroGroLandGem[];
    items: GroGroLandItem[];
    itemSpawnCooldown: number;
    captureEffects: GroGroLandCaptureEffect[];
};

export type GroGroLandHudState = {
    score: number;
    bestScore: number;
    landPercent: number;
    bestLandPercent: number;
    enemyEmojis: string[];
    enemyLandPercents: number[];
    enemyAlive: boolean[];
};
