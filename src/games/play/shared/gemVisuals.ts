export type PlaySharedGemPoint = {
    x: number;
    y: number;
};

export const PLAY_SHARED_GEM_GLOW_RADIUS = 28;
export const PLAY_SHARED_GEM_UNIT = 18;

export const PLAY_SHARED_GEM_OUTER_POINTS: PlaySharedGemPoint[] = [
    { x: 0, y: -1 },
    { x: 0.72, y: -0.2 },
    { x: 0.46, y: 0.84 },
    { x: 0, y: 1.12 },
    { x: -0.46, y: 0.84 },
    { x: -0.72, y: -0.2 },
];

export const PLAY_SHARED_GEM_TOP_POINTS: PlaySharedGemPoint[] = [
    { x: 0, y: -1 },
    { x: 0.54, y: -0.32 },
    { x: 0, y: 0.1 },
    { x: -0.54, y: -0.32 },
];

export const PLAY_SHARED_GEM_LINE_SETS: PlaySharedGemPoint[][] = [
    [
        { x: -0.54, y: -0.32 },
        { x: 0, y: 0.1 },
        { x: 0.54, y: -0.32 },
    ],
    [
        { x: 0, y: -1 },
        { x: 0, y: 0.1 },
    ],
    [
        { x: -0.38, y: 0.82 },
        { x: 0, y: 0.1 },
        { x: 0.38, y: 0.82 },
    ],
];

export const getPlaySharedGemPointString = (
    points: PlaySharedGemPoint[],
    unit = PLAY_SHARED_GEM_UNIT
) => points.map((point) => `${point.x * unit},${point.y * unit}`).join(' ');
