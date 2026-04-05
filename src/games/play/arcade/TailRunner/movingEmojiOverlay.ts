import {
    TAIL_RUNNER_DEFAULT_TAIL_EMOJI,
} from './constants';
import { getTailRunnerIpadEmojiAssetSrc, mapTailRunnerIpadTailEmoji } from './ipadEmojiAssets';
import type { TailRunnerState } from './types';

type SyncMovingEmojiOverlayParams = {
    overlay: HTMLDivElement | null;
    nodeMap: Map<string, HTMLImageElement>;
    stage: HTMLDivElement | null;
    state: TailRunnerState;
    frameNow: number;
};

const OVERLAY_CULL_MARGIN = 96;
const TAIL_EMOJI_RENDER_SIZE = 40;
const FOOD_EMOJI_RENDER_SIZE = 60;
const ENEMY_HEAD_RENDER_SIZE = 34;
const TYRANNO_RENDER_SIZE = 68;
const ALERT_RENDER_SIZE = 18;
const IPAD_TAIL_GAP_COMPRESSION = 0.25;

const isVisibleInViewport = (
    x: number,
    y: number,
    width: number,
    height: number,
    size: number
) => (
    x + size >= -OVERLAY_CULL_MARGIN
    && y + size >= -OVERLAY_CULL_MARGIN
    && x - size <= width + OVERLAY_CULL_MARGIN
    && y - size <= height + OVERLAY_CULL_MARGIN
);

const getCompressedTailScreenPositions = (
    tail: Array<{ x: number; y: number }>,
    head: { x: number; y: number },
    cameraX: number,
    cameraY: number
) => {
    const positions: Array<{ x: number; y: number }> = [];
    let previous = {
        x: head.x - cameraX,
        y: head.y - cameraY,
    };

    tail.forEach((segment) => {
        const raw = {
            x: segment.x - cameraX,
            y: segment.y - cameraY,
        };
        const compressed = {
            x: previous.x + (raw.x - previous.x) * IPAD_TAIL_GAP_COMPRESSION,
            y: previous.y + (raw.y - previous.y) * IPAD_TAIL_GAP_COMPRESSION,
        };
        positions.push(compressed);
        previous = compressed;
    });

    return positions;
};

const upsertEmojiNode = (
    overlay: HTMLDivElement,
    nodeMap: Map<string, HTMLImageElement>,
    activeKeys: Set<string>,
    key: string,
    emoji: string,
    x: number,
    y: number,
    fontSize: number,
    kind: 'default' | 'food' | 'head' | 'boss' | 'alert' = 'default'
) => {
    activeKeys.add(key);

    let node = nodeMap.get(key);
    if (!node) {
        node = document.createElement('img');
        node.className = 'tail-runner__moving-emoji';
        node.setAttribute('alt', '');
        node.setAttribute('aria-hidden', 'true');
        node.decoding = 'async';
        node.loading = 'eager';
        overlay.appendChild(node);
        nodeMap.set(key, node);
    }

    const normalizedEmoji = kind === 'food' || fontSize <= TAIL_EMOJI_RENDER_SIZE
        ? mapTailRunnerIpadTailEmoji(emoji)
        : emoji;
    const nextSrc = getTailRunnerIpadEmojiAssetSrc(normalizedEmoji);
    if (node.src !== nextSrc) {
        node.src = nextSrc;
    }

    const renderSize = kind === 'food' ? FOOD_EMOJI_RENDER_SIZE : fontSize;
    const isFood = kind === 'food';
    const isHead = kind === 'head';
    const isBoss = kind === 'boss';
    const isAlert = kind === 'alert';
    const nextTranslate = `translate3d(${x - renderSize * 0.5}px, ${y - renderSize * 0.5}px, 0)`;

    node.classList.toggle('tail-runner__moving-emoji--food', isFood);
    node.classList.toggle('tail-runner__moving-emoji--head', isHead);
    node.classList.toggle('tail-runner__moving-emoji--boss', isBoss);
    node.classList.toggle('tail-runner__moving-emoji--alert', isAlert);

    if (node.dataset.size !== String(renderSize)) {
        node.style.width = `${renderSize}px`;
        node.style.height = `${renderSize}px`;
        node.dataset.size = String(renderSize);
    }

    if (node.dataset.kind !== kind) {
        node.dataset.kind = kind;
    }

    if (node.style.transform !== nextTranslate) {
        node.style.transform = nextTranslate;
    }
};

export const clearTailRunnerMovingEmojiOverlay = (nodeMap: Map<string, HTMLImageElement>) => {
    nodeMap.forEach((node) => node.remove());
    nodeMap.clear();
};

export const syncTailRunnerMovingEmojiOverlay = ({
    overlay,
    nodeMap,
    stage,
    state,
    frameNow,
}: SyncMovingEmojiOverlayParams) => {
    if (!overlay || !stage) return;

    const width = stage.clientWidth;
    const height = stage.clientHeight;
    const cameraX = state.playerX - width / 2;
    const cameraY = state.playerY - height / 2;
    const activeKeys = new Set<string>();

    const playerTailPositions = getCompressedTailScreenPositions(
        state.tail,
        { x: state.playerX, y: state.playerY },
        cameraX,
        cameraY
    );

    state.tail.forEach((segment, index) => {
        const screenX = playerTailPositions[index]?.x ?? segment.x - cameraX;
        const screenY = playerTailPositions[index]?.y ?? segment.y - cameraY;
        if (!isVisibleInViewport(screenX, screenY, width, height, TAIL_EMOJI_RENDER_SIZE)) return;
        upsertEmojiNode(
            overlay,
            nodeMap,
            activeKeys,
            `player-tail-${index}`,
            segment.emoji,
            screenX,
            screenY,
            TAIL_EMOJI_RENDER_SIZE
        );
    });

    state.entities.forEach((entity) => {
        if (entity.type !== 'food') return;
        const screenX = entity.x - cameraX;
        const screenY = entity.y - cameraY;
        if (!isVisibleInViewport(screenX, screenY, width, height, FOOD_EMOJI_RENDER_SIZE)) return;
        upsertEmojiNode(
            overlay,
            nodeMap,
            activeKeys,
            `food-${entity.id}`,
            mapTailRunnerIpadTailEmoji(entity.emoji || TAIL_RUNNER_DEFAULT_TAIL_EMOJI),
            screenX,
            screenY,
            TAIL_EMOJI_RENDER_SIZE,
            'food'
        );
    });

    state.enemies.forEach((enemy) => {
        const enemyTailPositions = getCompressedTailScreenPositions(
            enemy.tail,
            { x: enemy.x, y: enemy.y },
            cameraX,
            cameraY
        );

        enemy.tail.forEach((segment, index) => {
            const screenX = enemyTailPositions[index]?.x ?? segment.x - cameraX;
            const screenY = enemyTailPositions[index]?.y ?? segment.y - cameraY;
            if (!isVisibleInViewport(screenX, screenY, width, height, TAIL_EMOJI_RENDER_SIZE)) return;
            upsertEmojiNode(
                overlay,
                nodeMap,
                activeKeys,
                `enemy-tail-${enemy.id}-${index}`,
                segment.emoji,
                screenX,
                screenY,
                TAIL_EMOJI_RENDER_SIZE
            );
        });

        const enemyHeadX = enemy.x - cameraX;
        const enemyHeadY = enemy.y - cameraY;
        if (!isVisibleInViewport(enemyHeadX, enemyHeadY, width, height, ENEMY_HEAD_RENDER_SIZE)) return;
        upsertEmojiNode(
            overlay,
            nodeMap,
            activeKeys,
            `enemy-head-${enemy.id}`,
            '👿',
            enemyHeadX,
            enemyHeadY,
            ENEMY_HEAD_RENDER_SIZE,
            'head'
        );
    });

    state.tyrannos.forEach((tyranno) => {
        const wobbleSeed = frameNow / 140 + tyranno.x * 0.002 + tyranno.y * 0.0015;
        const wobbleOffsetY = Math.sin(wobbleSeed * 1.8) * (tyranno.phase === 'charge' ? 1.6 : 1);
        const tyrannoX = tyranno.x - cameraX;
        const tyrannoY = tyranno.y + wobbleOffsetY - cameraY;

        if (!isVisibleInViewport(tyrannoX, tyrannoY, width, height, TYRANNO_RENDER_SIZE)) return;

        upsertEmojiNode(
            overlay,
            nodeMap,
            activeKeys,
            `tyranno-${tyranno.id}`,
            '🦖',
            tyrannoX,
            tyrannoY,
            TYRANNO_RENDER_SIZE,
            'boss'
        );

        if (tyranno.phase === 'alert' || tyranno.phase === 'charge') {
            upsertEmojiNode(
                overlay,
                nodeMap,
                activeKeys,
                `tyranno-alert-${tyranno.id}`,
                '💢',
                tyrannoX + 8,
                tyrannoY - 26,
                ALERT_RENDER_SIZE,
                'alert'
            );
        }
    });

    nodeMap.forEach((node, key) => {
        if (activeKeys.has(key)) return;
        node.remove();
        nodeMap.delete(key);
    });
};
