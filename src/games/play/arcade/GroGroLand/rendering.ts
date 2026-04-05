import {
    GROGRO_LAND_CAMERA_OUTER_GUTTER,
    GROGRO_LAND_BOOST_WARNING_FRAMES,
    GROGRO_LAND_WORLD_HEIGHT,
    GROGRO_LAND_WORLD_WIDTH,
} from './constants';
import type { GroGroLandState } from './types';

type DrawSceneParams = {
    canvas: HTMLCanvasElement;
    playerOverlay: HTMLDivElement | null;
    enemyOverlays: Array<HTMLDivElement | null>;
    state: GroGroLandState;
};

type CameraViewport = {
    viewportWidth: number;
    viewportHeight: number;
    cameraX: number;
    cameraY: number;
    worldScreenX: number;
    worldScreenY: number;
};

const drawOwnerContours = (
    context: CanvasRenderingContext2D,
    ownerId: number,
    strokeStyle: string,
    fillStyle: string,
    lineWidth: number,
    startCol: number,
    endCol: number,
    startRow: number,
    endRow: number,
    tileSize: number,
    cameraX: number,
    cameraY: number,
    cols: number,
    rows: number,
    grid: Uint16Array
) => {
    const isOwned = (col: number, row: number) => {
        if (col < 0 || row < 0 || col >= cols || row >= rows) return false;
        return grid[(row * cols) + col] === ownerId;
    };

    context.save();
    context.beginPath();
    let hasSegments = false;
    context.strokeStyle = strokeStyle;
    context.lineWidth = lineWidth;
    context.lineCap = 'round';
    context.lineJoin = 'round';

    for (let row = startRow - 1; row <= endRow; row += 1) {
        for (let col = startCol - 1; col <= endCol; col += 1) {
            const tl = isOwned(col, row) ? 1 : 0;
            const tr = isOwned(col + 1, row) ? 1 : 0;
            const br = isOwned(col + 1, row + 1) ? 1 : 0;
            const bl = isOwned(col, row + 1) ? 1 : 0;
            const mask = (tl << 3) | (tr << 2) | (br << 1) | bl;
            if (!mask || mask === 15) continue;

            const x = (col * tileSize) - cameraX;
            const y = (row * tileSize) - cameraY;
            const top = { x: x + (tileSize / 2), y };
            const right = { x: x + tileSize, y: y + (tileSize / 2) };
            const bottom = { x: x + (tileSize / 2), y: y + tileSize };
            const left = { x, y: y + (tileSize / 2) };

            const drawSegment = (
                from: { x: number; y: number },
                to: { x: number; y: number }
            ) => {
                hasSegments = true;
                context.moveTo(from.x, from.y);
                context.lineTo(to.x, to.y);
            };

            switch (mask) {
                case 1:
                case 14:
                    drawSegment(left, bottom);
                    break;
                case 2:
                case 13:
                    drawSegment(bottom, right);
                    break;
                case 3:
                case 12:
                    drawSegment(left, right);
                    break;
                case 4:
                case 11:
                    drawSegment(top, right);
                    break;
                case 5:
                    drawSegment(top, left);
                    drawSegment(bottom, right);
                    break;
                case 6:
                case 9:
                    drawSegment(top, bottom);
                    break;
                case 7:
                case 8:
                    drawSegment(top, left);
                    break;
                case 10:
                    drawSegment(top, right);
                    drawSegment(left, bottom);
                    break;
                default:
                    break;
            }
        }
    }

    if (hasSegments) {
        context.save();
        context.strokeStyle = fillStyle;
        context.lineWidth = Math.max(tileSize * 0.82, lineWidth * 3.4);
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.globalAlpha = 0.26;
        context.stroke();
        context.restore();
    }

    context.stroke();
    context.restore();
};

const drawTrail = (
    context: CanvasRenderingContext2D,
    trail: Array<{ x: number; y: number }>,
    color: string,
    width: number,
    cameraX: number,
    cameraY: number
) => {
    if (trail.length <= 1) return;
    context.beginPath();
    context.lineWidth = width;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = color;
    trail.forEach((point, index) => {
        const worldX = point.x - cameraX;
        const worldY = point.y - cameraY;
        if (index === 0) {
            context.moveTo(worldX, worldY);
            return;
        }
        context.lineTo(worldX, worldY);
    });
    context.stroke();
};

const getCameraViewport = (canvas: HTMLCanvasElement, state: GroGroLandState): CameraViewport => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const viewportWidth = canvas.width / dpr;
    const viewportHeight = canvas.height / dpr;
    const cameraX = Math.max(
        -GROGRO_LAND_CAMERA_OUTER_GUTTER,
        Math.min(
            GROGRO_LAND_WORLD_WIDTH - viewportWidth + GROGRO_LAND_CAMERA_OUTER_GUTTER,
            state.player.x - (viewportWidth / 2)
        )
    );
    const cameraY = Math.max(
        -GROGRO_LAND_CAMERA_OUTER_GUTTER,
        Math.min(
            GROGRO_LAND_WORLD_HEIGHT - viewportHeight + GROGRO_LAND_CAMERA_OUTER_GUTTER,
            state.player.y - (viewportHeight / 2)
        )
    );

    return {
        viewportWidth,
        viewportHeight,
        cameraX,
        cameraY,
        worldScreenX: -cameraX,
        worldScreenY: -cameraY,
    };
};

const syncPlayerOverlay = (
    overlay: HTMLDivElement | null,
    state: GroGroLandState,
    cameraX: number,
    cameraY: number
) => {
    if (!overlay) return;

    overlay.style.left = `${state.player.x - cameraX}px`;
    overlay.style.top = `${state.player.y - cameraY}px`;
    overlay.classList.toggle(
        'grogro-land__player-overlay--warning',
        state.player.boostTimer > 0 && state.player.boostTimer <= GROGRO_LAND_BOOST_WARNING_FRAMES
    );
};

const syncEnemyOverlays = (
    overlays: Array<HTMLDivElement | null>,
    state: GroGroLandState,
    cameraX: number,
    cameraY: number
) => {
    state.enemies.forEach((enemy, index) => {
        const overlay = overlays[index];
        if (!overlay) return;

        if (enemy.status === 'dead') {
            overlay.style.display = 'none';
            return;
        }

        overlay.style.display = 'flex';
        overlay.style.left = `${Math.round(enemy.x - cameraX)}px`;
        overlay.style.top = `${Math.round(enemy.y - cameraY)}px`;
        overlay.classList.toggle(
            'grogro-land__enemy-overlay--warning',
            enemy.boostTimer > 0 && enemy.boostTimer <= GROGRO_LAND_BOOST_WARNING_FRAMES
        );
    });
};

const drawWorldBackdrop = (
    context: CanvasRenderingContext2D,
    viewportWidth: number,
    viewportHeight: number,
    worldScreenX: number,
    worldScreenY: number
) => {
    context.clearRect(0, 0, viewportWidth, viewportHeight);
    context.fillStyle = '#31435f';
    context.fillRect(0, 0, viewportWidth, viewportHeight);
    context.fillStyle = 'rgba(185, 203, 235, 0.14)';
    for (let index = 0; index < 14; index += 1) {
        const bubbleX = ((index * 137) % Math.ceil(viewportWidth + 180)) - 90;
        const bubbleY = ((index * 89) % Math.ceil(viewportHeight + 180)) - 90;
        const bubbleSize = 18 + ((index * 11) % 22);
        context.beginPath();
        context.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
        context.fill();
    }

    context.fillStyle = '#fffdf7';
    context.fillRect(worldScreenX, worldScreenY, GROGRO_LAND_WORLD_WIDTH, GROGRO_LAND_WORLD_HEIGHT);

    context.fillStyle = 'rgba(66, 96, 43, 0.34)';
    context.fillRect(worldScreenX, worldScreenY, GROGRO_LAND_WORLD_WIDTH, 14);
    context.fillRect(worldScreenX, worldScreenY + GROGRO_LAND_WORLD_HEIGHT - 14, GROGRO_LAND_WORLD_WIDTH, 14);
    context.fillRect(worldScreenX, worldScreenY, 14, GROGRO_LAND_WORLD_HEIGHT);
    context.fillRect(worldScreenX + GROGRO_LAND_WORLD_WIDTH - 14, worldScreenY, 14, GROGRO_LAND_WORLD_HEIGHT);

    context.strokeStyle = 'rgba(42, 66, 27, 0.72)';
    context.lineWidth = 6;
    context.strokeRect(
        worldScreenX + 3,
        worldScreenY + 3,
        GROGRO_LAND_WORLD_WIDTH - 6,
        GROGRO_LAND_WORLD_HEIGHT - 6
    );

    context.strokeStyle = 'rgba(235, 251, 224, 0.22)';
    context.lineWidth = 2;
    context.strokeRect(
        worldScreenX + 14,
        worldScreenY + 14,
        GROGRO_LAND_WORLD_WIDTH - 28,
        GROGRO_LAND_WORLD_HEIGHT - 28
    );
};

const buildOwnerPaletteMap = (state: GroGroLandState) => {
    const ownerPaletteMap = new Map<number, typeof state.player.colors>();
    ownerPaletteMap.set(state.player.ownerId, state.player.colors);
    state.enemies.forEach((enemy) => {
        if (enemy.status === 'dead') return;
        ownerPaletteMap.set(enemy.ownerId, enemy.colors);
    });
    return ownerPaletteMap;
};

const drawTerritoryFill = (
    context: CanvasRenderingContext2D,
    state: GroGroLandState,
    ownerPaletteMap: Map<number, typeof state.player.colors>,
    startCol: number,
    endCol: number,
    startRow: number,
    endRow: number,
    tileSize: number,
    cameraX: number,
    cameraY: number
) => {
    context.save();
    context.globalAlpha = 0.45;
    for (let row = startRow; row <= endRow; row += 1) {
        for (let col = startCol; col <= endCol; col += 1) {
            const ownerId = state.grid[row * state.cols + col];
            if (!ownerId) continue;
            const palette = ownerPaletteMap.get(ownerId);
            if (!palette) continue;
            context.fillStyle = palette.fill;
            context.fillRect(
                (col * tileSize) - cameraX - 0.9,
                (row * tileSize) - cameraY - 0.9,
                tileSize + 1.8,
                tileSize + 1.8
            );
        }
    }
    context.restore();
};

const drawCaptureEffects = (
    context: CanvasRenderingContext2D,
    state: GroGroLandState,
    ownerPaletteMap: Map<number, typeof state.player.colors>,
    cameraX: number,
    cameraY: number
) => {
    state.captureEffects.forEach((effect) => {
        const palette = ownerPaletteMap.get(effect.ownerId);
        if (!palette || effect.points.length < 2) return;
        const alpha = effect.ttl / effect.maxTtl;
        context.save();
        context.beginPath();
        effect.points.forEach((point, index) => {
            const drawX = point.x - cameraX;
            const drawY = point.y - cameraY;
            if (index === 0) {
                context.moveTo(drawX, drawY);
            } else {
                context.lineTo(drawX, drawY);
            }
        });
        context.closePath();
        context.fillStyle = `${palette.fill}${Math.round((0.45 * alpha) * 255).toString(16).padStart(2, '0')}`;
        context.fill();
        context.lineWidth = 5;
        context.strokeStyle = `${palette.edge}${Math.round((0.6 * alpha) * 255).toString(16).padStart(2, '0')}`;
        context.stroke();
        context.restore();
    });
};

const drawPickups = (
    context: CanvasRenderingContext2D,
    state: GroGroLandState,
    viewportWidth: number,
    viewportHeight: number,
    cameraX: number,
    cameraY: number
) => {
    state.gems.forEach((gem) => {
        const worldX = gem.x - cameraX;
        const worldY = gem.y - cameraY;
        if (worldX < -32 || worldY < -32 || worldX > viewportWidth + 32 || worldY > viewportHeight + 32) {
            return;
        }
        context.font = '20px system-ui';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(gem.emoji, worldX, worldY);
    });

    state.items.forEach((item) => {
        const worldX = item.x - cameraX;
        const worldY = item.y - cameraY;
        if (worldX < -50 || worldY < -50 || worldX > viewportWidth + 50 || worldY > viewportHeight + 50) {
            return;
        }
        context.save();
        context.font = '30px system-ui';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = 'rgba(255,255,255,0.92)';
        context.beginPath();
        context.arc(worldX, worldY, 20, 0, Math.PI * 2);
        context.fill();
        context.fillText(item.emoji, worldX, worldY + 1);
        context.restore();
    });
};

export const drawGroGroLandScene = ({
    canvas,
    playerOverlay,
    enemyOverlays,
    state,
}: DrawSceneParams) => {
    const context = canvas.getContext('2d');
    if (!context) return;

    const {
        viewportWidth,
        viewportHeight,
        cameraX,
        cameraY,
        worldScreenX,
        worldScreenY,
    } = getCameraViewport(canvas, state);

    syncPlayerOverlay(playerOverlay, state, cameraX, cameraY);
    syncEnemyOverlays(enemyOverlays, state, cameraX, cameraY);
    drawWorldBackdrop(context, viewportWidth, viewportHeight, worldScreenX, worldScreenY);

    const tileSize = GROGRO_LAND_WORLD_WIDTH / state.cols;
    const ownerPaletteMap = buildOwnerPaletteMap(state);

    const startCol = Math.max(0, Math.floor(cameraX / tileSize) - 1);
    const endCol = Math.min(state.cols - 1, Math.ceil((cameraX + viewportWidth) / tileSize) + 1);
    const startRow = Math.max(0, Math.floor(cameraY / tileSize) - 1);
    const endRow = Math.min(state.rows - 1, Math.ceil((cameraY + viewportHeight) / tileSize) + 1);

    drawTerritoryFill(
        context,
        state,
        ownerPaletteMap,
        startCol,
        endCol,
        startRow,
        endRow,
        tileSize,
        cameraX,
        cameraY
    );

    ownerPaletteMap.forEach((palette, ownerId) => {
        drawOwnerContours(
            context,
            ownerId,
            palette.edge,
            palette.fill,
            ownerId === state.player.ownerId ? 3.5 : 3,
            startCol,
            endCol,
            startRow,
            endRow,
            tileSize,
            cameraX,
            cameraY,
            state.cols,
            state.rows,
            state.grid
        );
    });

    drawCaptureEffects(context, state, ownerPaletteMap, cameraX, cameraY);

    drawTrail(context, state.player.trail, state.player.colors.trail, 6, cameraX, cameraY);
    state.enemies.forEach((enemy) => {
        if (enemy.status === 'dead') return;
        drawTrail(context, enemy.trail, enemy.colors.trail, 5, cameraX, cameraY);
    });
    drawPickups(context, state, viewportWidth, viewportHeight, cameraX, cameraY);
};
