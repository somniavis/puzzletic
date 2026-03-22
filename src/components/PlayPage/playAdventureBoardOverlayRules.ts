import { getOverlayTileKeys } from './playAdventureBoardLayout';
import type { BoardLayout, OverlayMotionKey, OverlayTileRule } from './playAdventureBoardTypes';

export const OVERLAY_TILE_RULES: Record<OverlayMotionKey, OverlayTileRule> = {
    boat: {
        motionKey: 'boat',
        level: 1,
        bundleIndex: 3,
        positions: [
            { x: 1, bundleLocalY: 1 },
            { x: 0, bundleLocalY: 2 },
            { x: 1, bundleLocalY: 3 },
        ],
    },
    sailboat: {
        motionKey: 'sailboat',
        level: 1,
        bundleIndex: 1,
        positions: [
            { x: 1, bundleLocalY: 1 },
            { x: 2, bundleLocalY: 2 },
            { x: 1, bundleLocalY: 3 },
        ],
    },
    camel: {
        motionKey: 'camel',
        level: 3,
        bundleIndex: 2,
        positions: [
            { x: 3, bundleLocalY: 1 },
            { x: 2, bundleLocalY: 2 },
            { x: 3, bundleLocalY: 3 },
        ],
    },
    bee: {
        motionKey: 'bee',
        level: 2,
        bundleIndex: 2,
        positions: [{ x: 4, bundleLocalY: 2 }],
    },
    elephant: {
        motionKey: 'elephant',
        level: 2,
        bundleIndex: 4,
        positions: [
            { x: 3, bundleLocalY: 1 },
            { x: 2, bundleLocalY: 2 },
            { x: 4, bundleLocalY: 2 },
        ],
    },
};

export const getOverlayTileKeysForRule = (
    layout: BoardLayout | null,
    rule: OverlayTileRule
) => getOverlayTileKeys(layout, rule.level, rule.bundleIndex, (bundleLocalY, tile) =>
    rule.positions.some((position) => position.bundleLocalY === bundleLocalY && position.x === tile.x)
);
