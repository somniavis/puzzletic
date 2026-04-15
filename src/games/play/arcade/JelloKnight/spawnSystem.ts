import type React from 'react';
import { SIGNAL_DURATION_MS, BOMB_FALL_DELAY_MS, FIELD_SIZE } from './constants';
import { clamp, createEliteEnemy, createRangedEnemy, createSpawnEnemy, resolveCircleObstacleCollisions } from './helpers';
import { getWaveEliteSpawnInterval } from './waveConfig';
import type { BombStrike, ChaserEnemy, EliteEnemy, JelloKnightAnnouncement, Obstacle, RangedEnemy, SpawnSignal, Vector2 } from './types';

type ShowAnnouncement = (
    title: string,
    detail: string,
    tone: JelloKnightAnnouncement['tone']
) => void;

type TranslateFn = (key: string, values?: Record<string, string | number>) => string;

export const trySpawnEnemiesAndBombs = ({
    activeObstacleSet,
    elapsedMs,
    eliteSpawnChance,
    enemyMaxCount,
    enemySpawnInterval,
    isWaveTransitioning,
    nextPosition,
    rangedMaxCount,
    rangedSpawnInterval,
    rangedSpawnChance,
    waveIndex,
    gt,
    getEnemyDisplayName,
    showAnnouncement,
    lastSpawnTimeRef,
    lastRangedSpawnTimeRef,
    nextEliteSpawnAtMsRef,
    lastRangedAnnouncementAtRef,
    lastBombTriggerTimeRef,
    bombUnlockedRef,
    bombDropChanceRef,
    bombDropIntervalRef,
    enemiesRef,
    rangedEnemiesRef,
    eliteEnemyRef,
    spawnSignalsRef,
    bombStrikesRef,
    nextEnemyIdRef,
    nextRangedEnemyIdRef,
    nextEliteIdRef,
    nextSignalIdRef,
    nextBombStrikeIdRef,
}: {
    activeObstacleSet: Obstacle[];
    elapsedMs: number;
    eliteSpawnChance: number;
    enemyMaxCount: number;
    enemySpawnInterval: number;
    isWaveTransitioning: boolean;
    nextPosition: Vector2;
    rangedMaxCount: number;
    rangedSpawnInterval: number;
    rangedSpawnChance: number;
    waveIndex: number;
    gt: TranslateFn;
    getEnemyDisplayName: (enemyType: string) => string;
    showAnnouncement: ShowAnnouncement;
    lastSpawnTimeRef: React.MutableRefObject<number>;
    lastRangedSpawnTimeRef: React.MutableRefObject<number>;
    nextEliteSpawnAtMsRef: React.MutableRefObject<number>;
    lastRangedAnnouncementAtRef: React.MutableRefObject<number>;
    lastBombTriggerTimeRef: React.MutableRefObject<number>;
    bombUnlockedRef: React.MutableRefObject<boolean>;
    bombDropChanceRef: React.MutableRefObject<number>;
    bombDropIntervalRef: React.MutableRefObject<number>;
    enemiesRef: React.MutableRefObject<ChaserEnemy[]>;
    rangedEnemiesRef: React.MutableRefObject<RangedEnemy[]>;
    eliteEnemyRef: React.MutableRefObject<EliteEnemy | null>;
    spawnSignalsRef: React.MutableRefObject<SpawnSignal[]>;
    bombStrikesRef: React.MutableRefObject<BombStrike[]>;
    nextEnemyIdRef: React.MutableRefObject<number>;
    nextRangedEnemyIdRef: React.MutableRefObject<number>;
    nextEliteIdRef: React.MutableRefObject<number>;
    nextSignalIdRef: React.MutableRefObject<number>;
    nextBombStrikeIdRef: React.MutableRefObject<number>;
}) => {
    if (isWaveTransitioning) return;

    if (
        elapsedMs - lastSpawnTimeRef.current >= enemySpawnInterval
        && enemiesRef.current.length < enemyMaxCount
    ) {
        lastSpawnTimeRef.current = elapsedMs;
        enemiesRef.current = enemiesRef.current.concat(createSpawnEnemy(nextEnemyIdRef.current, elapsedMs, waveIndex));
        nextEnemyIdRef.current += 1;
    }

    if (
        rangedSpawnChance > 0
        && rangedEnemiesRef.current.length < rangedMaxCount
        && rangedSpawnInterval > 0
        && elapsedMs - lastRangedSpawnTimeRef.current >= rangedSpawnInterval
    ) {
        lastRangedSpawnTimeRef.current = elapsedMs;
        const nextRangedEnemy = Math.random() <= rangedSpawnChance
            ? createRangedEnemy(nextRangedEnemyIdRef.current, elapsedMs, rangedEnemiesRef.current, waveIndex)
            : null;

        if (nextRangedEnemy) {
            nextRangedEnemyIdRef.current += 1;
            rangedEnemiesRef.current = rangedEnemiesRef.current.concat(nextRangedEnemy);
            spawnSignalsRef.current = spawnSignalsRef.current.concat({
                id: nextSignalIdRef.current,
                x: nextRangedEnemy.x,
                y: nextRangedEnemy.y,
                size: 144,
                tone: 'ranged',
                expiresAtMs: elapsedMs + SIGNAL_DURATION_MS,
            });
            nextSignalIdRef.current += 1;

            if (elapsedMs - lastRangedAnnouncementAtRef.current >= rangedSpawnInterval * 1.6) {
                lastRangedAnnouncementAtRef.current = elapsedMs;
                showAnnouncement(
                    gt('announcements.rangedTitle'),
                    gt('announcements.rangedDetail', {
                        name: getEnemyDisplayName(nextRangedEnemy.enemyType),
                    }),
                    'ranged'
                );
            }
        }
    }

    if (
        eliteSpawnChance > 0
        && eliteEnemyRef.current === null
        && elapsedMs >= nextEliteSpawnAtMsRef.current
    ) {
        if (Math.random() <= eliteSpawnChance) {
            const nextElite = createEliteEnemy(nextEliteIdRef.current, elapsedMs, waveIndex);
            nextEliteIdRef.current += 1;
            eliteEnemyRef.current = nextElite;
            nextEliteSpawnAtMsRef.current = elapsedMs + getWaveEliteSpawnInterval(waveIndex);
            spawnSignalsRef.current = spawnSignalsRef.current.concat({
                id: nextSignalIdRef.current,
                x: nextElite.x,
                y: nextElite.y,
                size: 220,
                tone: 'elite',
                expiresAtMs: elapsedMs + SIGNAL_DURATION_MS,
            });
            nextSignalIdRef.current += 1;
            showAnnouncement(
                gt('announcements.eliteTitle'),
                gt('announcements.eliteDetail', {
                    name: getEnemyDisplayName(nextElite.enemyType),
                }),
                'elite'
            );
        } else {
            nextEliteSpawnAtMsRef.current = elapsedMs + getWaveEliteSpawnInterval(waveIndex);
        }
    }

    if (bombUnlockedRef.current && elapsedMs - lastBombTriggerTimeRef.current >= bombDropIntervalRef.current) {
        lastBombTriggerTimeRef.current = elapsedMs;
        if (Math.random() <= bombDropChanceRef.current) {
            const throwAngle = Math.random() * Math.PI * 2;
            const throwDistance = 170 + (Math.random() * 150);
            const throwTarget = resolveCircleObstacleCollisions(
                {
                    x: clamp(nextPosition.x + (Math.cos(throwAngle) * throwDistance), 32, FIELD_SIZE - 32),
                    y: clamp(nextPosition.y + (Math.sin(throwAngle) * throwDistance), 32, FIELD_SIZE - 32),
                },
                18,
                activeObstacleSet,
                4
            );
            const landAtMs = elapsedMs + 420;
            bombStrikesRef.current = bombStrikesRef.current.concat({
                id: nextBombStrikeIdRef.current,
                strikeKind: 'bomb',
                sourceX: nextPosition.x,
                sourceY: nextPosition.y,
                targetX: throwTarget.x,
                targetY: throwTarget.y,
                createdAtMs: elapsedMs,
                landAtMs,
                triggerAtMs: landAtMs + BOMB_FALL_DELAY_MS,
            });
            nextBombStrikeIdRef.current += 1;
        }
    }
};
