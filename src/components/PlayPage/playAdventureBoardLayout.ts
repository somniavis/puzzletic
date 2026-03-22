import type { BoardLayout, BoardSlot, BoardTile, PlayAdventureBoardGame } from './playAdventureBoardTypes';

export const DIAMOND_STEP = 4;
const START_PAD_ROW_OFFSET = 1;
const DEFAULT_LEVEL_ROW_OFFSET = 1;

const DIAMOND_A_TILES: BoardTile[] = [
    { x: 2, y: 0, kind: 'path' },
    { x: 1, y: 1, kind: 'path' },
    { x: 3, y: 1, kind: 'forest' },
    { x: 0, y: 2, kind: 'path' },
    { x: 2, y: 2, kind: 'forest' },
    { x: 4, y: 2, kind: 'forest' },
    { x: 1, y: 3, kind: 'path' },
    { x: 3, y: 3, kind: 'forest' },
    { x: 2, y: 4, kind: 'path' },
];

const DIAMOND_B_TILES: BoardTile[] = [
    { x: 2, y: 0, kind: 'path' },
    { x: 1, y: 1, kind: 'forest' },
    { x: 3, y: 1, kind: 'path' },
    { x: 0, y: 2, kind: 'forest' },
    { x: 2, y: 2, kind: 'forest' },
    { x: 4, y: 2, kind: 'path' },
    { x: 1, y: 3, kind: 'forest' },
    { x: 3, y: 3, kind: 'path' },
    { x: 2, y: 4, kind: 'path' },
];

const PAD_X_SEQUENCE = [2, 0, 2, 4];

const buildTiles = (diamondCount: number) => {
    const tiles = new Map<string, BoardTile>();

    Array.from({ length: diamondCount }).forEach((_, diamondIndex) => {
        const source = diamondIndex % 2 === 0 ? DIAMOND_A_TILES : DIAMOND_B_TILES;
        const yOffset = diamondIndex * DIAMOND_STEP;

        source.forEach((tile) => {
            const nextTile = {
                ...tile,
                y: tile.y + yOffset,
            };
            tiles.set(`${nextTile.x}:${nextTile.y}`, nextTile);
        });
    });

    return Array.from(tiles.values()).sort((a, b) => (a.y - b.y) || (a.x - b.x));
};

const buildPadSlots = (slotCount: number) =>
    Array.from({ length: slotCount }).map((_, index) => ({
        x: PAD_X_SEQUENCE[index % PAD_X_SEQUENCE.length],
        y: index * 2,
    }));

export const buildBoardLayout = (level: number, gameCount: number): BoardLayout => {
    const hasStartPad = level === 1;
    const rowOffset = hasStartPad ? START_PAD_ROW_OFFSET : DEFAULT_LEVEL_ROW_OFFSET;
    const totalPadCount = gameCount + (hasStartPad ? 1 : 0);
    const boardRows = Math.max(5, totalPadCount * 2 + 1 + rowOffset);
    const diamondCount = Math.max(2, Math.ceil((boardRows - 1) / DIAMOND_STEP) + 1);

    return {
        boardRows,
        hasStartPad,
        rowOffset,
        tiles: buildTiles(diamondCount).map((tile) => ({
            ...tile,
            y: tile.y + rowOffset,
        })),
        padSlots: buildPadSlots(totalPadCount).map((slot) => ({
            ...slot,
            y: slot.y + rowOffset,
        })),
    };
};

export const getBundleIndex = (y: number, rowOffset: number) =>
    Math.max(0, Math.floor((y - rowOffset) / DIAMOND_STEP));

export const buildAccessibleBundleIndexes = (
    games: PlayAdventureBoardGame[],
    padSlots: BoardSlot[],
    hasStartPad: boolean,
    rowOffset: number
) => {
    const representativeMissionByBundle = new Map<number, PlayAdventureBoardGame>();

    games.forEach((boardGame, gameIndex) => {
        const slot = padSlots[gameIndex + (hasStartPad ? 1 : 0)];
        const bundleIndex = getBundleIndex(slot.y, rowOffset);
        representativeMissionByBundle.set(bundleIndex, boardGame);
    });

    const accessibleBundleIndexes = new Set<number>([0]);
    Array.from(representativeMissionByBundle.entries())
        .sort(([a], [b]) => a - b)
        .forEach(([bundleIndex, boardGame]) => {
            if (bundleIndex > 0 && boardGame.unlocked) {
                accessibleBundleIndexes.add(bundleIndex);
            }
        });

    return accessibleBundleIndexes;
};

export const getOverlayTileKeys = (
    layout: BoardLayout | null,
    level: number,
    bundleIndex: number,
    matcher: (bundleLocalY: number, tile: BoardTile) => boolean
) => {
    if (!layout) return [] as string[];

    return layout.tiles
        .filter((tile) => {
            const tileBundleIndex = getBundleIndex(tile.y, layout.rowOffset);
            if (tileBundleIndex !== bundleIndex || tile.kind !== 'forest') return false;
            const bundleLocalY = tile.y - layout.rowOffset - (tileBundleIndex * DIAMOND_STEP);
            return matcher(bundleLocalY, tile);
        })
        .map((tile) => `${level}:${tile.x}:${tile.y}`);
};
