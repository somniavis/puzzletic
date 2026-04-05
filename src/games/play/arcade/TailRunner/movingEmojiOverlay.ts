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

const upsertEmojiNode = (
    overlay: HTMLDivElement,
    nodeMap: Map<string, HTMLImageElement>,
    activeKeys: Set<string>,
    key: string,
    emoji: string,
    x: number,
    y: number,
    fontSize: number,
    kind: 'default' | 'food' = 'default'
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

    const normalizedEmoji = fontSize === 24 ? mapTailRunnerIpadTailEmoji(emoji) : emoji;
    const nextSrc = getTailRunnerIpadEmojiAssetSrc(normalizedEmoji);
    if (node.src !== nextSrc) {
        node.src = nextSrc;
    }

    const renderSize = kind === 'food' ? 60 : fontSize;
    node.classList.toggle('tail-runner__moving-emoji--food', kind === 'food');
    node.style.left = `${x - renderSize * 0.5}px`;
    node.style.top = `${y - renderSize * 0.5}px`;
    node.style.fontSize = `${fontSize}px`;
    node.style.width = `${renderSize}px`;
    node.style.height = `${renderSize}px`;
    node.style.transform = 'translateZ(0)';
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

    state.tail.forEach((segment, index) => {
        upsertEmojiNode(
            overlay,
            nodeMap,
            activeKeys,
            `player-tail-${index}`,
            segment.emoji,
            segment.x - cameraX,
            segment.y - cameraY,
            24
        );
    });

    state.entities.forEach((entity) => {
        if (entity.type !== 'food') return;
        upsertEmojiNode(
            overlay,
            nodeMap,
            activeKeys,
            `food-${entity.id}`,
            mapTailRunnerIpadTailEmoji(entity.emoji || TAIL_RUNNER_DEFAULT_TAIL_EMOJI),
            entity.x - cameraX,
            entity.y - cameraY,
            24,
            'food'
        );
    });

    state.enemies.forEach((enemy) => {
        enemy.tail.forEach((segment, index) => {
            upsertEmojiNode(
                overlay,
                nodeMap,
                activeKeys,
                `enemy-tail-${enemy.id}-${index}`,
                segment.emoji,
                segment.x - cameraX,
                segment.y - cameraY,
                24
            );
        });

        upsertEmojiNode(
            overlay,
            nodeMap,
            activeKeys,
            `enemy-head-${enemy.id}`,
            '👿',
            enemy.x - cameraX,
            enemy.y - cameraY,
            32
        );
    });

    state.tyrannos.forEach((tyranno) => {
        const wobbleSeed = frameNow / 140 + tyranno.x * 0.002 + tyranno.y * 0.0015;
        const wobbleOffsetY = Math.sin(wobbleSeed * 1.8) * (tyranno.phase === 'charge' ? 1.6 : 1);

        upsertEmojiNode(
            overlay,
            nodeMap,
            activeKeys,
            `tyranno-${tyranno.id}`,
            '🦖',
            tyranno.x - cameraX,
            tyranno.y + wobbleOffsetY - cameraY,
            68
        );

        if (tyranno.phase === 'alert' || tyranno.phase === 'charge') {
            upsertEmojiNode(
                overlay,
                nodeMap,
                activeKeys,
                `tyranno-alert-${tyranno.id}`,
                '💢',
                tyranno.x + 8 - cameraX,
                tyranno.y - 26 + wobbleOffsetY - cameraY,
                18
            );
        }
    });

    nodeMap.forEach((node, key) => {
        if (activeKeys.has(key)) return;
        node.remove();
        nodeMap.delete(key);
    });
};
