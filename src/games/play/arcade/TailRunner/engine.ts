import { playClearSound, playEatingSound } from '../../../../utils/sound';
import {
    TAIL_RUNNER_BASE_SPEED,
    TAIL_RUNNER_BOOST_SPEED,
    TAIL_RUNNER_DEFAULT_TAIL_EMOJI,
    TAIL_RUNNER_ENEMY_RADIUS,
    TAIL_RUNNER_FOOD_SCORE,
    TAIL_RUNNER_GEM_SCORES,
    TAIL_RUNNER_GRID_SIZE,
    TAIL_RUNNER_HISTORY_LIMIT,
    TAIL_RUNNER_MAGNET_DURATION,
    TAIL_RUNNER_MAGNET_PULL_SPEED,
    TAIL_RUNNER_MAGNET_RADIUS,
    TAIL_RUNNER_MAX_SHIELD_CHARGES,
    TAIL_RUNNER_OBSTACLE_PENALTY,
    TAIL_RUNNER_PLAYER_RADIUS,
    TAIL_RUNNER_SHIELD_SPEED_MULTIPLIER,
    TAIL_RUNNER_TURN_SPEED,
    TAIL_RUNNER_TYRANNO_RADIUS,
    TAIL_RUNNER_WORLD_SIZE,
} from './constants';
import {
    clamp,
    collidesWithBarrier,
    createBurst,
    createRandomEntity,
    getTailRunnerHistoryOffset,
    getTailRunnerHistoryPoint,
    reconcileDifficultyTargets,
    rollNextBoostSpawnTimer,
    rollNextMagnetSpawnTimer,
    smoothTailRunnerPoint,
    updateEnemySnake,
    updateTyrannoEnemy,
} from './helpers';
import {
    drawBurstEntity,
    drawCircularEmojiEntity,
    drawEnemySnakeScreen,
    drawGemEntity,
    drawPlayerTailScreen,
    drawPowerItemEntity,
    drawRoundedRectPath,
    drawTyrannoScreen,
    getTailRunnerOuterPattern,
} from './rendering';
import type { TailRunnerBurst, TailRunnerEntity, TailRunnerState } from './types';

type UpdateParams = {
    state: TailRunnerState;
    input: { left: boolean; right: boolean; boost: boolean };
    history: Array<{ x: number; y: number }>;
    deltaMs: number;
    onGuardFrameTick: () => void;
    onFinishGame: () => void;
    onHeartBurst: () => void;
    onScoreBurst: (value: number) => void;
    onSyncHud: () => void;
};

export const updateTailRunnerState = ({
    state,
    input,
    history,
    deltaMs,
    onGuardFrameTick,
    onFinishGame,
    onHeartBurst,
    onScoreBurst,
    onSyncHud,
}: UpdateParams) => {
    const deltaMultiplier = Math.min(deltaMs / 16.6667, 1.8);
    onGuardFrameTick();

    state.boostSpawnTimer -= deltaMultiplier;
    state.shieldTimer = Math.max(0, state.shieldTimer - deltaMultiplier);
    state.magnetSpawnTimer -= deltaMultiplier;
    state.magnetTimer = Math.max(0, state.magnetTimer - deltaMultiplier);
    const shieldActive = state.shieldTimer > 0;
    const magnetActive = state.magnetTimer > 0;

    const hasBoostEntity = state.entities.some((entity) => entity.type === 'boost');
    if (!hasBoostEntity && state.shieldCharges < TAIL_RUNNER_MAX_SHIELD_CHARGES && state.boostSpawnTimer <= 0) {
        state.entities.push(createRandomEntity('boost', state.playerX, state.playerY));
        state.boostSpawnTimer = rollNextBoostSpawnTimer();
    } else if (state.shieldCharges >= TAIL_RUNNER_MAX_SHIELD_CHARGES && state.boostSpawnTimer <= 0) {
        state.boostSpawnTimer = 90;
    }

    const hasMagnetEntity = state.entities.some((entity) => entity.type === 'magnet');
    if (!hasMagnetEntity && !magnetActive && state.magnetSpawnTimer <= 0) {
        state.entities.push(createRandomEntity('magnet', state.playerX, state.playerY));
        state.magnetSpawnTimer = rollNextMagnetSpawnTimer();
    }

    const nextBursts: TailRunnerBurst[] = [];
    for (let index = 0; index < state.bursts.length; index += 1) {
        const burst = state.bursts[index];
        const nextLife = burst.life - deltaMultiplier;
        if (nextLife > 0) {
            nextBursts.push({
                ...burst,
                life: nextLife,
            });
        }
    }
    state.bursts = nextBursts;

    state.enemies = state.enemies.map((enemy) => updateEnemySnake(enemy, deltaMultiplier));
    state.tyrannos = state.tyrannos.map((tyranno) => (
        updateTyrannoEnemy(tyranno, state.playerX, state.playerY, deltaMultiplier)
    ));

    if (input.left) state.playerAngle -= TAIL_RUNNER_TURN_SPEED * deltaMultiplier;
    if (input.right) state.playerAngle += TAIL_RUNNER_TURN_SPEED * deltaMultiplier;

    const currentBaseSpeed = input.boost ? TAIL_RUNNER_BOOST_SPEED : TAIL_RUNNER_BASE_SPEED;
    state.playerSpeed = shieldActive
        ? currentBaseSpeed * TAIL_RUNNER_SHIELD_SPEED_MULTIPLIER
        : currentBaseSpeed;
    state.playerX += Math.cos(state.playerAngle) * state.playerSpeed * deltaMultiplier;
    state.playerY += Math.sin(state.playerAngle) * state.playerSpeed * deltaMultiplier;

    const isOutOfBounds =
        state.playerX < 0
        || state.playerY < 0
        || state.playerX > TAIL_RUNNER_WORLD_SIZE
        || state.playerY > TAIL_RUNNER_WORLD_SIZE;

    if (isOutOfBounds && !shieldActive) {
        onFinishGame();
        return;
    }
    if (shieldActive) {
        state.playerX = clamp(state.playerX, 0, TAIL_RUNNER_WORLD_SIZE);
        state.playerY = clamp(state.playerY, 0, TAIL_RUNNER_WORLD_SIZE);
    }

    const hitBarrier = state.barriers.some((barrier) =>
        collidesWithBarrier(state.playerX, state.playerY, TAIL_RUNNER_PLAYER_RADIUS, barrier)
    );

    if (hitBarrier && !shieldActive) {
        onFinishGame();
        return;
    }

    const hitEnemy = state.enemies.some((enemy) => {
        if (Math.hypot(enemy.x - state.playerX, enemy.y - state.playerY) <= TAIL_RUNNER_ENEMY_RADIUS + TAIL_RUNNER_PLAYER_RADIUS) {
            return true;
        }
        return enemy.tail.some((segment) => (
            Math.hypot(segment.x - state.playerX, segment.y - state.playerY) <= 16 + TAIL_RUNNER_PLAYER_RADIUS
        ));
    });

    const hitTyranno = state.tyrannos.some((tyranno) => (
        Math.hypot(tyranno.x - state.playerX, tyranno.y - state.playerY) <= TAIL_RUNNER_TYRANNO_RADIUS + TAIL_RUNNER_PLAYER_RADIUS
    ));

    if ((hitEnemy || hitTyranno) && !shieldActive) {
        onFinishGame();
        return;
    }

    history.unshift({ x: state.playerX, y: state.playerY });
    if (history.length > TAIL_RUNNER_HISTORY_LIMIT) {
        history.length = TAIL_RUNNER_HISTORY_LIMIT;
    }

    state.tail = state.tail.map((segment, index) => {
        const point = getTailRunnerHistoryPoint(
            history,
            getTailRunnerHistoryOffset(index),
            { x: state.playerX, y: state.playerY }
        );
        const smoothedPoint = smoothTailRunnerPoint(
            segment,
            point,
            index === 0 ? 0.62 : 0.52
        );
        return {
            ...segment,
            x: smoothedPoint.x,
            y: smoothedPoint.y,
        };
    });

    const nextEntities: TailRunnerEntity[] = [];
    for (let index = 0; index < state.entities.length; index += 1) {
        let entity = state.entities[index];

        if (magnetActive && entity.type === 'coin') {
            const dx = state.playerX - entity.x;
            const dy = state.playerY - entity.y;
            const distance = Math.hypot(dx, dy);

            if (distance > 0 && distance <= TAIL_RUNNER_MAGNET_RADIUS) {
                const pullStep = Math.min(
                    distance,
                    TAIL_RUNNER_MAGNET_PULL_SPEED
                    * deltaMultiplier
                    * (1 + (TAIL_RUNNER_MAGNET_RADIUS - distance) / TAIL_RUNNER_MAGNET_RADIUS)
                );

                entity = {
                    ...entity,
                    x: entity.x + (dx / distance) * pullStep,
                    y: entity.y + (dy / distance) * pullStep,
                };
            }
        }

        const distance = Math.hypot(entity.x - state.playerX, entity.y - state.playerY);
        if (distance > entity.radius + TAIL_RUNNER_PLAYER_RADIUS) {
            nextEntities.push(entity);
            continue;
        }

        if (entity.type === 'food') {
            state.score += TAIL_RUNNER_FOOD_SCORE;
            playEatingSound(0.42);
            onHeartBurst();
            const tailPoint = history[getTailRunnerHistoryOffset(state.tail.length)] || history[history.length - 1] || { x: state.playerX, y: state.playerY };
            state.tail.push({
                x: tailPoint.x,
                y: tailPoint.y,
                emoji: entity.emoji || TAIL_RUNNER_DEFAULT_TAIL_EMOJI,
                facing: entity.facing,
            });
            state.bestTail = Math.max(state.bestTail, state.tail.length);
            nextEntities.push(createRandomEntity('food', state.playerX, state.playerY));
            continue;
        }

        if (entity.type === 'coin') {
            const gainedScore = entity.scoreValue ?? TAIL_RUNNER_GEM_SCORES.berry;
            state.score += gainedScore;
            playClearSound(0.46);
            onScoreBurst(gainedScore);
            nextEntities.push(createRandomEntity('coin', state.playerX, state.playerY));
            continue;
        }

        if (entity.type === 'boost') {
            state.shieldCharges = Math.min(TAIL_RUNNER_MAX_SHIELD_CHARGES, state.shieldCharges + 1);
            state.boostSpawnTimer = rollNextBoostSpawnTimer();
            nextEntities.push(createRandomEntity('food', state.playerX, state.playerY));
            continue;
        }

        if (entity.type === 'magnet') {
            state.magnetTimer = TAIL_RUNNER_MAGNET_DURATION;
            state.magnetSpawnTimer = rollNextMagnetSpawnTimer();
            playClearSound(0.38);
            nextEntities.push(createRandomEntity('food', state.playerX, state.playerY));
            continue;
        }

        if (shieldActive) {
            nextEntities.push(createRandomEntity('obstacle', state.playerX, state.playerY));
            continue;
        }

        state.score = Math.max(0, state.score - TAIL_RUNNER_OBSTACLE_PENALTY);
        if (state.tail.length > 0) {
            let nextLength = state.tail.length;
            if (entity.emoji === '🔥') {
                nextLength = Math.max(0, state.tail.length - 1);
            } else if (entity.emoji === '💣') {
                nextLength = Math.floor(state.tail.length / 2);
            } else if (entity.emoji === '🧨') {
                nextLength = 0;
            }

            const removedTail = state.tail.slice(nextLength);
            state.tail = state.tail.slice(0, nextLength);
            state.bursts.push(...removedTail.map((segment) => createBurst(segment.x, segment.y)));
            nextEntities.push(createRandomEntity('obstacle', state.playerX, state.playerY));
            continue;
        }

        onFinishGame();
        nextEntities.push(entity);
        state.entities = nextEntities;
        return;
    }
    state.entities = nextEntities;

    state.highScore = Math.max(state.highScore, state.score);
    state.bestTail = Math.max(state.bestTail, state.tail.length);
    reconcileDifficultyTargets(state);
    onSyncHud();
};

type DrawParams = {
    context: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    state: TailRunnerState;
    frameNow: number;
    hidePlayerTail?: boolean;
    hideMovingEmojiActors?: boolean;
    hideFoodEmojiEntities?: boolean;
};

export const drawTailRunnerFrame = ({
    context,
    canvas,
    state,
    frameNow,
    hidePlayerTail = false,
    hideMovingEmojiActors = false,
    hideFoodEmojiEntities = false,
}: DrawParams) => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const cameraX = state.playerX - width / 2;
    const cameraY = state.playerY - height / 2;
    const toScreenX = (worldX: number) => Math.round(worldX - cameraX);
    const toScreenY = (worldY: number) => Math.round(worldY - cameraY);

    context.clearRect(0, 0, width, height);

    const outerPattern = getTailRunnerOuterPattern(context);
    context.fillStyle = outerPattern ?? '#5f8a4f';
    context.fillRect(0, 0, width, height);

    context.save();
    context.translate(-cameraX, -cameraY);

    const worldGradient = context.createLinearGradient(0, 0, 0, TAIL_RUNNER_WORLD_SIZE);
    worldGradient.addColorStop(0, '#9fd27f');
    worldGradient.addColorStop(1, '#7fbc63');
    context.fillStyle = worldGradient;
    context.fillRect(0, 0, TAIL_RUNNER_WORLD_SIZE, TAIL_RUNNER_WORLD_SIZE);

    context.strokeStyle = 'rgba(71, 112, 54, 0.12)';
    context.lineWidth = 1;
    for (let x = 0; x <= TAIL_RUNNER_WORLD_SIZE; x += TAIL_RUNNER_GRID_SIZE) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, TAIL_RUNNER_WORLD_SIZE);
        context.stroke();
    }
    for (let y = 0; y <= TAIL_RUNNER_WORLD_SIZE; y += TAIL_RUNNER_GRID_SIZE) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(TAIL_RUNNER_WORLD_SIZE, y);
        context.stroke();
    }

    context.fillStyle = 'rgba(66, 96, 43, 0.34)';
    context.fillRect(0, 0, TAIL_RUNNER_WORLD_SIZE, 14);
    context.fillRect(0, TAIL_RUNNER_WORLD_SIZE - 14, TAIL_RUNNER_WORLD_SIZE, 14);
    context.fillRect(0, 0, 14, TAIL_RUNNER_WORLD_SIZE);
    context.fillRect(TAIL_RUNNER_WORLD_SIZE - 14, 0, 14, TAIL_RUNNER_WORLD_SIZE);

    context.strokeStyle = 'rgba(42, 66, 27, 0.72)';
    context.lineWidth = 6;
    context.strokeRect(3, 3, TAIL_RUNNER_WORLD_SIZE - 6, TAIL_RUNNER_WORLD_SIZE - 6);

    context.strokeStyle = 'rgba(235, 251, 224, 0.22)';
    context.lineWidth = 2;
    context.strokeRect(14, 14, TAIL_RUNNER_WORLD_SIZE - 28, TAIL_RUNNER_WORLD_SIZE - 28);

    state.barriers.forEach((barrier) => {
        context.save();
        const barrierGradient = barrier.orientation === 'horizontal'
            ? context.createLinearGradient(barrier.x, barrier.y, barrier.x, barrier.y + barrier.height)
            : context.createLinearGradient(barrier.x, barrier.y, barrier.x + barrier.width, barrier.y);

        barrierGradient.addColorStop(0, 'rgba(173, 124, 72, 0.98)');
        barrierGradient.addColorStop(0.18, 'rgba(205, 156, 98, 0.98)');
        barrierGradient.addColorStop(0.5, 'rgba(150, 102, 58, 0.98)');
        barrierGradient.addColorStop(0.82, 'rgba(198, 149, 92, 0.98)');
        barrierGradient.addColorStop(1, 'rgba(128, 86, 48, 0.98)');

        context.fillStyle = barrierGradient;
        drawRoundedRectPath(context, barrier.x, barrier.y, barrier.width, barrier.height, 12);
        context.fill();

        context.save();
        drawRoundedRectPath(context, barrier.x, barrier.y, barrier.width, barrier.height, 12);
        context.clip();

        context.fillStyle = 'rgba(255, 237, 196, 0.16)';
        if (barrier.orientation === 'horizontal') {
            context.fillRect(barrier.x + 6, barrier.y + 3, barrier.width - 12, Math.max(4, barrier.height * 0.18));
        } else {
            context.fillRect(barrier.x + 3, barrier.y + 6, Math.max(4, barrier.width * 0.18), barrier.height - 12);
        }

        context.fillStyle = 'rgba(74, 47, 24, 0.2)';
        if (barrier.orientation === 'horizontal') {
            context.fillRect(barrier.x + 6, barrier.y + barrier.height * 0.72, barrier.width - 12, Math.max(4, barrier.height * 0.16));
        } else {
            context.fillRect(barrier.x + barrier.width * 0.72, barrier.y + 6, Math.max(4, barrier.width * 0.16), barrier.height - 12);
        }

        const spotCount = barrier.orientation === 'horizontal'
            ? Math.max(3, Math.floor(barrier.width / 95))
            : Math.max(3, Math.floor(barrier.height / 95));

        for (let index = 0; index < spotCount; index += 1) {
            const progress = (index + 1) / (spotCount + 1);
            const centerX = barrier.orientation === 'horizontal'
                ? barrier.x + barrier.width * progress
                : barrier.x + barrier.width * (0.35 + (index % 2) * 0.3);
            const centerY = barrier.orientation === 'horizontal'
                ? barrier.y + barrier.height * (0.35 + (index % 2) * 0.3)
                : barrier.y + barrier.height * progress;
            const radiusX = barrier.orientation === 'horizontal' ? 10 + (index % 3) * 3 : 7 + (index % 3) * 2;
            const radiusY = barrier.orientation === 'horizontal' ? 5 + (index % 2) * 2 : 10 + (index % 2) * 3;

            context.fillStyle = index % 2 === 0
                ? 'rgba(102, 63, 31, 0.18)'
                : 'rgba(255, 222, 168, 0.12)';
            context.beginPath();
            context.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
            context.fill();
        }

        const stripeCount = barrier.orientation === 'horizontal'
            ? Math.max(2, Math.floor(barrier.width / 140))
            : Math.max(2, Math.floor(barrier.height / 140));

        context.strokeStyle = 'rgba(88, 58, 30, 0.18)';
        context.lineWidth = 2;

        for (let index = 1; index < stripeCount; index += 1) {
            if (barrier.orientation === 'horizontal') {
                const stripeX = barrier.x + (barrier.width / stripeCount) * index;
                context.beginPath();
                context.moveTo(stripeX, barrier.y + 4);
                context.lineTo(stripeX, barrier.y + barrier.height - 4);
                context.stroke();
            } else {
                const stripeY = barrier.y + (barrier.height / stripeCount) * index;
                context.beginPath();
                context.moveTo(barrier.x + 4, stripeY);
                context.lineTo(barrier.x + barrier.width - 4, stripeY);
                context.stroke();
            }
        }
        context.restore();

        context.strokeStyle = 'rgba(86, 57, 30, 0.34)';
        context.lineWidth = 1.5;
        drawRoundedRectPath(context, barrier.x + 0.75, barrier.y + 0.75, barrier.width - 1.5, barrier.height - 1.5, 11);
        context.stroke();
        context.restore();
    });

    state.bursts.forEach((burst) => drawBurstEntity(context, burst));

    state.entities.forEach((entity) => {
        if (hideFoodEmojiEntities && entity.type === 'food') {
            return;
        }
        if (entity.type === 'coin') {
            drawGemEntity(context, entity);
            return;
        }
        if (entity.type === 'boost') {
            drawPowerItemEntity(
                context,
                entity,
                '⚡',
                [
                    [0, 'rgba(255, 248, 191, 0.96)'],
                    [0.55, 'rgba(255, 214, 79, 0.76)'],
                    [1, 'rgba(255, 190, 54, 0)'],
                ],
                'rgba(255, 241, 173, 0.92)'
            );
            return;
        }
        if (entity.type === 'magnet') {
            drawPowerItemEntity(
                context,
                entity,
                '🧲',
                [
                    [0, 'rgba(255, 242, 209, 0.95)'],
                    [0.52, 'rgba(255, 140, 140, 0.42)'],
                    [1, 'rgba(255, 140, 140, 0)'],
                ]
            );
            return;
        }

        drawCircularEmojiEntity(context, entity);
    });

    context.save();
    context.translate(state.playerX, state.playerY);
    context.rotate(state.playerAngle);
    context.beginPath();
    context.fillStyle = 'rgba(88, 132, 98, 0.58)';
    context.moveTo(TAIL_RUNNER_PLAYER_RADIUS + 12, 0);
    context.lineTo(-TAIL_RUNNER_PLAYER_RADIUS + 2, -12);
    context.lineTo(-TAIL_RUNNER_PLAYER_RADIUS + 2, 12);
    context.closePath();
    context.fill();
    context.restore();

    context.restore();

    if (!hideMovingEmojiActors) {
        state.enemies.forEach((enemy) => drawEnemySnakeScreen(context, enemy, toScreenX, toScreenY));
        state.tyrannos.forEach((tyranno) => drawTyrannoScreen(context, tyranno, frameNow, toScreenX, toScreenY));
    }
    if (!hidePlayerTail) {
        drawPlayerTailScreen(context, state.tail, toScreenX, toScreenY);
    }
};
