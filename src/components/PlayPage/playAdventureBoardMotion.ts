import type { BoatMotionAssignment, CreatureMotionAssignment } from './playAdventureBoardTypes';

const randomizeArray = <T,>(items: T[]) => {
    const nextItems = [...items];

    for (let index = nextItems.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [nextItems[index], nextItems[swapIndex]] = [nextItems[swapIndex], nextItems[index]];
    }

    return nextItems;
};

export const CREATURE_PRESETS: CreatureMotionAssignment[] = [
    { animationName: 'playBoardFishLeft', delay: '0s', duration: '18s', scaleX: '1', angle: '0deg' },
    { animationName: 'playBoardFishRight', delay: '3s', duration: '19s', scaleX: '-1', angle: '0deg' },
    { animationName: 'playBoardFishUpLeft', delay: '6s', duration: '17s', scaleX: '1', angle: '-28deg' },
    { animationName: 'playBoardFishDownRight', delay: '9s', duration: '20s', scaleX: '-1', angle: '28deg' },
    { animationName: 'playBoardFishUpRight', delay: '12s', duration: '18s', scaleX: '-1', angle: '-28deg' },
    { animationName: 'playBoardFishDownLeft', delay: '15s', duration: '19s', scaleX: '1', angle: '28deg' },
];

const BOAT_PRESETS: Omit<BoatMotionAssignment, 'tileKey'>[] = [
    { animationName: 'playBoardBoatRight', delay: '0s', duration: '14s' },
    { animationName: 'playBoardBoatLeft', delay: '0s', duration: '15s' },
];

export const buildInitialCreatureMotionByTileKey = (
    creatureTilesByBundle: Array<{
        level: number;
        tiles: Array<{ x: number; y: number }>;
    }>
) => {
    const assignments = new Map<string, CreatureMotionAssignment>();

    creatureTilesByBundle.forEach(({ level, tiles }) => {
        const shuffledPresets = randomizeArray(CREATURE_PRESETS);

        tiles.forEach((tile, index) => {
            assignments.set(`${level}:${tile.x}:${tile.y}`, shuffledPresets[index % shuffledPresets.length]);
        });
    });

    return assignments;
};

export const getRandomCreaturePreset = (exclude?: CreatureMotionAssignment | null) => {
    const candidates = CREATURE_PRESETS.filter((preset) =>
        !exclude
        || preset.animationName !== exclude.animationName
        || preset.scaleX !== exclude.scaleX
        || preset.angle !== exclude.angle
    );

    const pool = candidates.length > 0 ? candidates : CREATURE_PRESETS;
    return pool[Math.floor(Math.random() * pool.length)];
};

export const getRandomBoatPreset = (tileKeys: string[], exclude?: BoatMotionAssignment | null): BoatMotionAssignment | null => {
    if (tileKeys.length === 0) return null;

    const tilePool = tileKeys.filter((tileKey) => tileKey !== exclude?.tileKey);
    const nextTileKey = (tilePool.length > 0 ? tilePool : tileKeys)[Math.floor(Math.random() * (tilePool.length > 0 ? tilePool : tileKeys).length)];

    const presetPool = BOAT_PRESETS.filter((preset) => preset.animationName !== exclude?.animationName);
    const nextPreset = (presetPool.length > 0 ? presetPool : BOAT_PRESETS)[Math.floor(Math.random() * (presetPool.length > 0 ? presetPool : BOAT_PRESETS).length)];

    return {
        tileKey: nextTileKey,
        ...nextPreset,
    };
};

export const getOverlayAnimationName = (animationName: string, emoji: string) => {
    if (emoji === '🐫' || emoji === '🐘') {
        switch (animationName) {
        case 'playBoardBoatRight':
            return 'playBoardCamelRight';
        case 'playBoardBoatLeft':
            return 'playBoardCamelLeft';
        default:
            return animationName;
        }
    }

    if (emoji === '🐝') {
        switch (animationName) {
        case 'playBoardBoatRight':
            return 'playBoardBeeRight';
        case 'playBoardBoatLeft':
            return 'playBoardBeeLeft';
        default:
            return animationName;
        }
    }

    if (emoji !== '⛵') return animationName;

    switch (animationName) {
    case 'playBoardBoatRight':
        return 'playBoardSailboatRight';
    case 'playBoardBoatLeft':
        return 'playBoardSailboatLeft';
    default:
        return animationName;
    }
};
