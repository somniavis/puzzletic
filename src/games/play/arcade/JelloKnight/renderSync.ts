import type React from 'react';
import {
    DAMAGE_FLASH_DURATION_MS,
    DAMAGE_FLASH_MAX_OPACITY,
} from './constants';
import { getCameraPositionFromViewport, getXpToNextLevel } from './helpers';
import {
    buildBombBlastRenderSnapshot,
    buildBombStrikeRenderSnapshot,
    buildDeathBurstRenderSnapshot,
    buildEliteRenderSnapshot,
    buildEnemyRenderSnapshot,
    buildPickupRenderSnapshot,
    buildProjectileRenderSnapshot,
    buildRangedEnemyRenderSnapshot,
    buildSpawnSignalRenderSnapshot,
    buildWebZoneRenderSnapshot,
} from './viewModelUtils';
import type {
    BombBlast,
    BombBlastRenderItem,
    BombStrike,
    BombStrikeRenderItem,
    ChaserEnemy,
    DeathBurst,
    DeathBurstRenderItem,
    EliteEnemy,
    EliteRenderItem,
    EnemyProjectile,
    EnemyRenderItem,
    JelloKnightHudState,
    PickupRenderItem,
    ProjectileRenderItem,
    RangedEnemy,
    RangedEnemyRenderItem,
    RunnerMotion,
    SpawnSignal,
    SpawnSignalRenderItem,
    Vector2,
    WebZone,
    WebZoneRenderItem,
    XpPickup,
} from './types';

type SyncVisualStateParams = {
    elapsedMs: number;
    nextPosition: Vector2;
    orbitPositionsNow: Vector2[];
    shouldRefreshPickups: boolean;
    shouldSyncPlayerVisuals: boolean;
    shouldSyncVisuals: boolean;
    waveIndex: number;
    waveVisualTier: number;
    combinedVector: Vector2;
    activeStrength: number;
    damageFlashUntilRef: React.MutableRefObject<number>;
    hpRef: React.MutableRefObject<number>;
    currentXpRef: React.MutableRefObject<number>;
    levelRef: React.MutableRefObject<number>;
    scoreRef: React.MutableRefObject<number>;
    playerPositionRef: React.MutableRefObject<Vector2>;
    joystickInputRef: React.MutableRefObject<Vector2>;
    stageViewportSizeRef: React.MutableRefObject<{ width: number; height: number }>;
    lastVisualSyncTimeRef: React.MutableRefObject<number>;
    lastPlayerVisualSyncTimeRef: React.MutableRefObject<number>;
    enemyRenderSnapshotRef: React.MutableRefObject<EnemyRenderItem[]>;
    rangedEnemyRenderSnapshotRef: React.MutableRefObject<RangedEnemyRenderItem[]>;
    eliteRenderSnapshotRef: React.MutableRefObject<EliteRenderItem | null>;
    projectileRenderSnapshotRef: React.MutableRefObject<ProjectileRenderItem[]>;
    webZoneRenderSnapshotRef: React.MutableRefObject<WebZoneRenderItem[]>;
    pickupRenderSnapshotRef: React.MutableRefObject<PickupRenderItem[]>;
    bombStrikeSnapshotRef: React.MutableRefObject<BombStrikeRenderItem[]>;
    bombBlastSnapshotRef: React.MutableRefObject<BombBlastRenderItem[]>;
    deathBurstSnapshotRef: React.MutableRefObject<DeathBurstRenderItem[]>;
    spawnSignalSnapshotRef: React.MutableRefObject<SpawnSignalRenderItem[]>;
    enemiesRef: React.MutableRefObject<ChaserEnemy[]>;
    rangedEnemiesRef: React.MutableRefObject<RangedEnemy[]>;
    eliteEnemyRef: React.MutableRefObject<EliteEnemy | null>;
    projectilesRef: React.MutableRefObject<EnemyProjectile[]>;
    webZonesRef: React.MutableRefObject<WebZone[]>;
    bombStrikesRef: React.MutableRefObject<BombStrike[]>;
    bombBlastsRef: React.MutableRefObject<BombBlast[]>;
    deathBurstsRef: React.MutableRefObject<DeathBurst[]>;
    xpPickupsRef: React.MutableRefObject<XpPickup[]>;
    spawnSignalsRef: React.MutableRefObject<SpawnSignal[]>;
    setDamageFlashOpacity: React.Dispatch<React.SetStateAction<number>>;
    setHudState: React.Dispatch<React.SetStateAction<JelloKnightHudState>>;
    setEnemies: React.Dispatch<React.SetStateAction<EnemyRenderItem[]>>;
    setRangedEnemies: React.Dispatch<React.SetStateAction<RangedEnemyRenderItem[]>>;
    setEliteEnemy: React.Dispatch<React.SetStateAction<EliteRenderItem | null>>;
    setProjectiles: React.Dispatch<React.SetStateAction<ProjectileRenderItem[]>>;
    setWebZones: React.Dispatch<React.SetStateAction<WebZoneRenderItem[]>>;
    setBombStrikes: React.Dispatch<React.SetStateAction<BombStrikeRenderItem[]>>;
    setBombBlasts: React.Dispatch<React.SetStateAction<BombBlastRenderItem[]>>;
    setDeathBursts: React.Dispatch<React.SetStateAction<DeathBurstRenderItem[]>>;
    setXpPickups: React.Dispatch<React.SetStateAction<PickupRenderItem[]>>;
    setSpawnSignals: React.Dispatch<React.SetStateAction<SpawnSignalRenderItem[]>>;
    setPlayerPosition: React.Dispatch<React.SetStateAction<Vector2>>;
    setRunnerMotion: React.Dispatch<React.SetStateAction<RunnerMotion>>;
    setOrbitPositions: React.Dispatch<React.SetStateAction<Vector2[]>>;
    setCameraPosition: React.Dispatch<React.SetStateAction<Vector2>>;
    setJoystickVector: React.Dispatch<React.SetStateAction<Vector2>>;
};

export const syncVisualState = ({
    elapsedMs,
    nextPosition,
    orbitPositionsNow,
    shouldRefreshPickups,
    shouldSyncPlayerVisuals,
    shouldSyncVisuals,
    waveIndex,
    waveVisualTier,
    combinedVector,
    activeStrength,
    damageFlashUntilRef,
    hpRef,
    currentXpRef,
    levelRef,
    scoreRef,
    joystickInputRef,
    stageViewportSizeRef,
    lastVisualSyncTimeRef,
    lastPlayerVisualSyncTimeRef,
    enemyRenderSnapshotRef,
    rangedEnemyRenderSnapshotRef,
    eliteRenderSnapshotRef,
    projectileRenderSnapshotRef,
    webZoneRenderSnapshotRef,
    pickupRenderSnapshotRef,
    bombStrikeSnapshotRef,
    bombBlastSnapshotRef,
    deathBurstSnapshotRef,
    spawnSignalSnapshotRef,
    enemiesRef,
    rangedEnemiesRef,
    eliteEnemyRef,
    projectilesRef,
    webZonesRef,
    bombStrikesRef,
    bombBlastsRef,
    deathBurstsRef,
    xpPickupsRef,
    spawnSignalsRef,
    setDamageFlashOpacity,
    setHudState,
    setEnemies,
    setRangedEnemies,
    setEliteEnemy,
    setProjectiles,
    setWebZones,
    setBombStrikes,
    setBombBlasts,
    setDeathBursts,
    setXpPickups,
    setSpawnSignals,
    setPlayerPosition,
    setRunnerMotion,
    setOrbitPositions,
    setCameraPosition,
    setJoystickVector,
}: SyncVisualStateParams) => {
    if (shouldSyncVisuals) {
        lastVisualSyncTimeRef.current = elapsedMs;
        const flashRemainingMs = Math.max(0, damageFlashUntilRef.current - elapsedMs);
        setDamageFlashOpacity(
            flashRemainingMs > 0
                ? Math.round(((flashRemainingMs / DAMAGE_FLASH_DURATION_MS) * DAMAGE_FLASH_MAX_OPACITY) * 1000) / 1000
                : 0
        );
        setHudState({
            hp: hpRef.current,
            xpPercent: Math.floor((currentXpRef.current / getXpToNextLevel(levelRef.current)) * 100),
            score: scoreRef.current,
            elapsedMs,
            wave: waveIndex,
            dangerTier: waveVisualTier,
            level: levelRef.current,
        });

        const nextEnemySnapshot = buildEnemyRenderSnapshot(
            enemiesRef.current,
            elapsedMs,
            enemyRenderSnapshotRef.current
        );
        if (nextEnemySnapshot !== enemyRenderSnapshotRef.current) {
            enemyRenderSnapshotRef.current = nextEnemySnapshot;
            setEnemies(nextEnemySnapshot);
        }

        const nextRangedSnapshot = buildRangedEnemyRenderSnapshot(
            rangedEnemiesRef.current,
            elapsedMs,
            rangedEnemyRenderSnapshotRef.current
        );
        if (nextRangedSnapshot !== rangedEnemyRenderSnapshotRef.current) {
            rangedEnemyRenderSnapshotRef.current = nextRangedSnapshot;
            setRangedEnemies(nextRangedSnapshot);
        }

        const nextEliteSnapshot = buildEliteRenderSnapshot(
            eliteEnemyRef.current,
            elapsedMs,
            eliteRenderSnapshotRef.current
        );
        if (nextEliteSnapshot !== eliteRenderSnapshotRef.current) {
            eliteRenderSnapshotRef.current = nextEliteSnapshot;
            setEliteEnemy(nextEliteSnapshot);
        }

        const nextProjectileSnapshot = buildProjectileRenderSnapshot(
            projectilesRef.current,
            projectileRenderSnapshotRef.current
        );
        if (nextProjectileSnapshot !== projectileRenderSnapshotRef.current) {
            projectileRenderSnapshotRef.current = nextProjectileSnapshot;
            setProjectiles(nextProjectileSnapshot);
        }

        const nextWebZoneSnapshot = buildWebZoneRenderSnapshot(
            webZonesRef.current,
            webZoneRenderSnapshotRef.current
        );
        if (nextWebZoneSnapshot !== webZoneRenderSnapshotRef.current) {
            webZoneRenderSnapshotRef.current = nextWebZoneSnapshot;
            setWebZones(nextWebZoneSnapshot);
        }

        const nextBombStrikeSnapshot = buildBombStrikeRenderSnapshot(
            bombStrikesRef.current,
            bombStrikeSnapshotRef.current
        );
        if (nextBombStrikeSnapshot !== bombStrikeSnapshotRef.current) {
            bombStrikeSnapshotRef.current = nextBombStrikeSnapshot;
            setBombStrikes(nextBombStrikeSnapshot);
        }

        const nextBombBlastSnapshot = buildBombBlastRenderSnapshot(
            bombBlastsRef.current,
            bombBlastSnapshotRef.current
        );
        if (nextBombBlastSnapshot !== bombBlastSnapshotRef.current) {
            bombBlastSnapshotRef.current = nextBombBlastSnapshot;
            setBombBlasts(nextBombBlastSnapshot);
        }

        const nextDeathBurstSnapshot = buildDeathBurstRenderSnapshot(
            deathBurstsRef.current,
            deathBurstSnapshotRef.current
        );
        if (nextDeathBurstSnapshot !== deathBurstSnapshotRef.current) {
            deathBurstSnapshotRef.current = nextDeathBurstSnapshot;
            setDeathBursts(nextDeathBurstSnapshot);
        }

        const nextPickupSnapshot = buildPickupRenderSnapshot(
            xpPickupsRef.current,
            pickupRenderSnapshotRef.current
        );
        if (nextPickupSnapshot !== pickupRenderSnapshotRef.current) {
            pickupRenderSnapshotRef.current = nextPickupSnapshot;
            setXpPickups(nextPickupSnapshot);
        }

        const nextSpawnSignalSnapshot = buildSpawnSignalRenderSnapshot(
            spawnSignalsRef.current,
            spawnSignalSnapshotRef.current
        );
        if (nextSpawnSignalSnapshot !== spawnSignalSnapshotRef.current) {
            spawnSignalSnapshotRef.current = nextSpawnSignalSnapshot;
            setSpawnSignals(nextSpawnSignalSnapshot);
        }
    } else if (shouldRefreshPickups) {
        const nextPickupSnapshot = buildPickupRenderSnapshot(
            xpPickupsRef.current,
            pickupRenderSnapshotRef.current
        );
        if (nextPickupSnapshot !== pickupRenderSnapshotRef.current) {
            pickupRenderSnapshotRef.current = nextPickupSnapshot;
            setXpPickups(nextPickupSnapshot);
        }
    }

    if (shouldSyncPlayerVisuals) {
        lastPlayerVisualSyncTimeRef.current = elapsedMs;
        setPlayerPosition(nextPosition);
        setRunnerMotion({
            x: combinedVector.x,
            y: combinedVector.y,
            strength: activeStrength,
        });
        setOrbitPositions(orbitPositionsNow);
        setCameraPosition(getCameraPositionFromViewport(
            nextPosition,
            stageViewportSizeRef.current.width,
            stageViewportSizeRef.current.height
        ));
        setJoystickVector(joystickInputRef.current);
    }
};
