import * as constants from './constants';
import type {
    TailRunnerBurst,
    TailRunnerEnemySnake,
    TailRunnerEntity,
    TailRunnerState,
    TailRunnerTyrannoEnemy,
} from './types';

type TailRunnerEmojiSprite = {
    canvas: HTMLCanvasElement;
    size: number;
};

const tailRunnerEmojiSpriteCache = new Map<string, TailRunnerEmojiSprite>();
let tailRunnerOuterPatternCache: CanvasPattern | null = null;

const getTailRunnerUserAgent = () => (typeof navigator === 'undefined' ? '' : navigator.userAgent);

const isTailRunnerIosWebKit = () => {
    const userAgent = getTailRunnerUserAgent();
    const isAppleMobile = /iP(ad|hone|od)/.test(userAgent);
    const isWebKit = /WebKit/i.test(userAgent);
    return isAppleMobile && isWebKit;
};
const getTailRunnerTailEmojiFontSize = () => 24;

export const getTailRunnerRenderPixelRatio = () => {
    if (typeof window === 'undefined') return 1;
    return Math.min(2, Math.max(1, window.devicePixelRatio || 1));
};

export const getTailRunnerEmojiSprite = (
    emoji: string,
    fontSize: number,
    facing: -1 | 1 = 1
): TailRunnerEmojiSprite | null => {
    if (typeof document === 'undefined' || typeof window === 'undefined') return null;

    const key = `${emoji}:${fontSize}:${facing}`;
    const cached = tailRunnerEmojiSpriteCache.get(key);
    if (cached) return cached;

    const size = Math.ceil(fontSize * 1.7);
    const pixelRatio = isTailRunnerIosWebKit()
        ? Math.max(2, Math.min(3, window.devicePixelRatio || 1))
        : getTailRunnerRenderPixelRatio();
    const canvas = document.createElement('canvas');
    canvas.width = size * pixelRatio;
    canvas.height = size * pixelRatio;

    const spriteContext = canvas.getContext('2d');
    if (!spriteContext) return null;

    spriteContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    spriteContext.clearRect(0, 0, size, size);
    spriteContext.font = `${fontSize}px Apple Color Emoji, Segoe UI Emoji, system-ui, sans-serif`;
    spriteContext.textAlign = 'center';
    spriteContext.textBaseline = 'middle';

    spriteContext.save();
    spriteContext.translate(size / 2, size / 2);
    if (facing === -1) {
        spriteContext.scale(-1, 1);
    }
    spriteContext.fillText(emoji, 0, 0);
    spriteContext.restore();

    const sprite = { canvas, size };
    tailRunnerEmojiSpriteCache.set(key, sprite);
    return sprite;
};

export const drawTailRunnerEmojiSprite = (
    context: CanvasRenderingContext2D,
    emoji: string,
    x: number,
    y: number,
    fontSize: number,
    facing: -1 | 1 = 1
) => {
    // Use sprite rendering only on iOS WebKit where moving emoji text tends to shimmer.
    // Other platforms keep direct text rendering because it preserves more natural spacing.
    if (!isTailRunnerIosWebKit()) {
        context.save();
        context.font = `${fontSize}px Apple Color Emoji, Segoe UI Emoji, system-ui, sans-serif`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.translate(x, y);
        if (facing === -1) {
            context.scale(-1, 1);
        }
        context.fillText(emoji, 0, 0);
        context.restore();
        return;
    }

    const sprite = getTailRunnerEmojiSprite(emoji, fontSize, facing);
    if (!sprite) {
        context.save();
        context.font = `${fontSize}px Apple Color Emoji, Segoe UI Emoji, system-ui, sans-serif`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.translate(x, y);
        if (facing === -1) {
            context.scale(-1, 1);
        }
        context.fillText(emoji, 0, 0);
        context.restore();
        return;
    }

    context.save();
    context.imageSmoothingEnabled = false;
    context.drawImage(
        sprite.canvas,
        x - sprite.size / 2,
        y - sprite.size / 2,
        sprite.size,
        sprite.size
    );
    context.restore();
};

export const getTailRunnerOuterPattern = (context: CanvasRenderingContext2D) => {
    if (tailRunnerOuterPatternCache) return tailRunnerOuterPatternCache;
    if (typeof document === 'undefined' || typeof window === 'undefined') return null;

    const tile = document.createElement('canvas');
    const size = 168;
    const pixelRatio = getTailRunnerRenderPixelRatio();
    tile.width = size * pixelRatio;
    tile.height = size * pixelRatio;

    const tileContext = tile.getContext('2d');
    if (!tileContext) return null;

    tileContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    tileContext.clearRect(0, 0, size, size);
    tileContext.fillStyle = '#5f8a4f';
    tileContext.fillRect(0, 0, size, size);

    const bubbles = [
        { x: 24, y: 22, r: 16, fill: 'rgba(212, 240, 200, 0.10)', shine: 'rgba(243, 255, 236, 0.08)' },
        { x: 92, y: 34, r: 26, fill: 'rgba(71, 109, 56, 0.18)', shine: 'rgba(243, 255, 236, 0.06)' },
        { x: 136, y: 78, r: 18, fill: 'rgba(212, 240, 200, 0.10)', shine: 'rgba(243, 255, 236, 0.08)' },
        { x: 52, y: 102, r: 28, fill: 'rgba(71, 109, 56, 0.18)', shine: 'rgba(243, 255, 236, 0.06)' },
        { x: 118, y: 136, r: 20, fill: 'rgba(212, 240, 200, 0.10)', shine: 'rgba(243, 255, 236, 0.08)' },
        { x: 24, y: 146, r: 12, fill: 'rgba(71, 109, 56, 0.18)', shine: 'rgba(243, 255, 236, 0.06)' },
    ];

    bubbles.forEach(({ x, y, r, fill, shine }) => {
        tileContext.beginPath();
        tileContext.fillStyle = fill;
        tileContext.arc(x, y, r, 0, Math.PI * 2);
        tileContext.fill();

        tileContext.beginPath();
        tileContext.fillStyle = shine;
        tileContext.arc(x - r * 0.22, y - r * 0.26, Math.max(4, r * 0.28), 0, Math.PI * 2);
        tileContext.fill();
    });

    tailRunnerOuterPatternCache = context.createPattern(tile, 'repeat');
    return tailRunnerOuterPatternCache;
};

export const drawGemEntity = (
    context: CanvasRenderingContext2D,
    entity: TailRunnerEntity
) => {
    const tier = entity.coinTier ?? 'berry';
    const palette = constants.TAIL_RUNNER_GEM_COLORS[tier];
    const size = entity.radius + 3;

    context.save();
    context.translate(entity.x, entity.y);

    context.beginPath();
    context.fillStyle = palette.glow;
    context.arc(0, 0, entity.radius + 10, 0, Math.PI * 2);
    context.fill();

    context.beginPath();
    context.moveTo(0, -size);
    context.lineTo(size * 0.72, -size * 0.2);
    context.lineTo(size * 0.46, size * 0.84);
    context.lineTo(0, size * 1.12);
    context.lineTo(-size * 0.46, size * 0.84);
    context.lineTo(-size * 0.72, -size * 0.2);
    context.closePath();
    context.fillStyle = palette.body;
    context.fill();

    context.beginPath();
    context.moveTo(0, -size);
    context.lineTo(size * 0.54, -size * 0.32);
    context.lineTo(0, 0.1 * size);
    context.lineTo(-size * 0.54, -size * 0.32);
    context.closePath();
    context.fillStyle = palette.top;
    context.fill();

    context.strokeStyle = palette.edge;
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(0, -size);
    context.lineTo(size * 0.72, -size * 0.2);
    context.lineTo(size * 0.46, size * 0.84);
    context.lineTo(0, size * 1.12);
    context.lineTo(-size * 0.46, size * 0.84);
    context.lineTo(-size * 0.72, -size * 0.2);
    context.closePath();
    context.stroke();

    context.beginPath();
    context.moveTo(-size * 0.54, -size * 0.32);
    context.lineTo(0, 0.1 * size);
    context.lineTo(size * 0.54, -size * 0.32);
    context.moveTo(0, -size);
    context.lineTo(0, 0.1 * size);
    context.moveTo(-size * 0.38, size * 0.82);
    context.lineTo(0, 0.1 * size);
    context.lineTo(size * 0.38, size * 0.82);
    context.strokeStyle = 'rgba(255,255,255,0.58)';
    context.lineWidth = 1.4;
    context.stroke();

    context.restore();
};

export const drawBurstEntity = (context: CanvasRenderingContext2D, burst: TailRunnerBurst) => {
    const progress = 1 - burst.life / burst.maxLife;
    context.save();
    context.globalAlpha = Math.max(0, burst.life / burst.maxLife);
    context.translate(burst.x, burst.y - progress * 26);
    context.font = `${26 + progress * 6}px system-ui, Apple Color Emoji, Segoe UI Emoji, sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(burst.emoji, 0, 0);
    context.restore();
};

export const drawRoundedRectPath = (
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
) => {
    const safeRadius = Math.max(0, Math.min(radius, width / 2, height / 2));
    context.beginPath();
    context.moveTo(x + safeRadius, y);
    context.lineTo(x + width - safeRadius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
    context.lineTo(x + width, y + height - safeRadius);
    context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
    context.lineTo(x + safeRadius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
    context.lineTo(x, y + safeRadius);
    context.quadraticCurveTo(x, y, x + safeRadius, y);
    context.closePath();
};

export const drawPowerItemEntity = (
    context: CanvasRenderingContext2D,
    entity: TailRunnerEntity,
    emoji: string,
    glowStops: Array<[number, string]>,
    fillColor?: string
) => {
    context.save();
    context.translate(entity.x, entity.y);
    const glow = context.createRadialGradient(0, 0, 0, 0, 0, entity.radius + 16);
    glowStops.forEach(([offset, color]) => glow.addColorStop(offset, color));
    context.fillStyle = glow;
    context.beginPath();
    context.arc(0, 0, entity.radius + 14, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = fillColor || 'rgba(255, 255, 255, 0.94)';
    context.beginPath();
    context.arc(0, 0, entity.radius + 7, 0, Math.PI * 2);
    context.fill();

    context.strokeStyle = 'rgba(255, 255, 255, 0.78)';
    context.lineWidth = 1.8;
    context.beginPath();
    context.arc(0, 0, entity.radius + 6.2, 0, Math.PI * 2);
    context.stroke();

    context.font = `${Math.max(28, entity.radius * 1.55)}px system-ui, Apple Color Emoji, Segoe UI Emoji, sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(emoji, 0, emoji === '🧲' ? 1 : 0);
    context.restore();
};

export const drawCircularEmojiEntity = (context: CanvasRenderingContext2D, entity: TailRunnerEntity) => {
    context.save();
    context.translate(entity.x, entity.y);
    context.beginPath();
    context.fillStyle = entity.type === 'obstacle'
        ? 'rgba(255, 149, 149, 0.9)'
        : 'rgba(175, 221, 187, 0.9)';
    context.arc(0, 0, entity.radius + 10, 0, Math.PI * 2);
    context.fill();
    context.font = `${entity.radius * 1.5}px system-ui, Apple Color Emoji, Segoe UI Emoji, sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.scale(entity.facing, 1);
    context.fillText(entity.emoji, 0, 0);
    context.restore();
};

export const drawEnemySnakeScreen = (
    context: CanvasRenderingContext2D,
    enemy: TailRunnerEnemySnake,
    toScreenX: (worldX: number) => number,
    toScreenY: (worldY: number) => number
) => {
    const tailFontSize = getTailRunnerTailEmojiFontSize();
    enemy.tail.forEach((segment) => {
        context.save();
        context.globalAlpha = 1;
        context.filter = 'none';
        drawTailRunnerEmojiSprite(
            context,
            segment.emoji,
            toScreenX(segment.x),
            toScreenY(segment.y),
            tailFontSize,
            segment.facing
        );
        context.restore();
    });

    context.save();
    context.globalAlpha = 1;
    context.filter = 'none';
    drawTailRunnerEmojiSprite(
        context,
        '👿',
        toScreenX(enemy.x),
        toScreenY(enemy.y),
        32,
        Math.cos(enemy.angle) < 0 ? -1 : 1
    );
    context.restore();
};

export const drawTyrannoScreen = (
    context: CanvasRenderingContext2D,
    tyranno: TailRunnerTyrannoEnemy,
    frameNow: number,
    toScreenX: (worldX: number) => number,
    toScreenY: (worldY: number) => number
) => {
    const wobbleSeed = frameNow / 140 + tyranno.x * 0.002 + tyranno.y * 0.0015;
    const wobbleStrength = tyranno.phase === 'charge' ? 0.2 : tyranno.phase === 'alert' ? 0.12 : 0.08;
    const wobbleAngle = Math.sin(wobbleSeed) * wobbleStrength;
    const wobbleOffsetY = Math.sin(wobbleSeed * 1.8) * (tyranno.phase === 'charge' ? 1.6 : 1);

    context.save();
    context.globalAlpha = 1;
    context.filter = 'none';
    context.translate(toScreenX(tyranno.x), toScreenY(tyranno.y + wobbleOffsetY));
    context.rotate(wobbleAngle);
    drawTailRunnerEmojiSprite(context, '🦖', 0, 0, 68, -tyranno.facing as -1 | 1);

    if (tyranno.phase === 'alert' || tyranno.phase === 'charge') {
        context.save();
        context.globalAlpha = 1;
        context.filter = 'none';
        drawTailRunnerEmojiSprite(context, '💢', 8, -26, 18, 1);
        context.restore();
    }

    context.restore();
};

export const drawPlayerTailScreen = (
    context: CanvasRenderingContext2D,
    tail: TailRunnerState['tail'],
    toScreenX: (worldX: number) => number,
    toScreenY: (worldY: number) => number
) => {
    const tailFontSize = getTailRunnerTailEmojiFontSize();
    tail.forEach((segment) => {
        context.save();
        context.globalAlpha = 1;
        context.filter = 'none';
        drawTailRunnerEmojiSprite(
            context,
            segment.emoji,
            toScreenX(segment.x),
            toScreenY(segment.y),
            tailFontSize,
            segment.facing
        );
        context.restore();
    });
};
