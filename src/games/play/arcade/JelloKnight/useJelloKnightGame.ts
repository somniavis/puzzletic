import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PlayArcadeHeaderStat } from '../../shared/PlayArcadeUI';
import { playQuietOrbHitSynth, primePlaySynthSfx } from '../../shared/playSynthSfx';
import {
    playClearSound,
    playJelloClickSound,
    primeFeedbackSoundsSilently,
} from '../../../../utils/sound';
import {
    BOMB_BASE_DAMAGE,
    BOMB_CRIT_MULTIPLIER_LEVELS,
    BOMB_DROP_CHANCE_LEVELS,
    BOMB_DROP_INTERVAL_LEVELS,
    BOMB_BASE_RADIUS,
    BOMB_RADIUS_LEVELS,
    CONTACT_DAMAGE_COOLDOWN_MS,
    DAMAGE_FLASH_DURATION_MS,
    FIELD_SIZE,
    INITIAL_HUD_STATE,
    INITIAL_PLAYER_POSITION,
    JOYSTICK_MAX_RADIUS,
    OBSTACLE_PLAYER_PADDING,
    ORBIT_COUNT_LEVELS,
    ORBIT_CRIT_MULTIPLIER_LEVELS,
    ORBIT_DAMAGE_LEVELS,
    ORBIT_DAMAGE,
    ORBIT_RADIUS_LEVELS,
    ORBIT_RADIUS,
    ORBIT_ROTATION_SPEED,
    ORBIT_SPEED_LEVELS,
    PLAYER_DEFENSE_LEVELS,
    PLAYER_MAX_HP,
    PLAYER_MAX_HP_LEVELS,
    PLAYER_MOVE_SPEED_LEVELS,
    PLAYER_VISUAL_SYNC_INTERVAL_MS,
    PLAYER_RADIUS,
    SPECIES_ORB_COLORS,
    VISUAL_SYNC_INTERVAL_MS,
    WEB_ZONE_TOUCH_DEBUFF_MS,
    WEB_ZONE_TOUCH_SLOW_MULTIPLIER,
} from './constants';
import {
    clamp,
    getCameraPositionFromViewport,
    getVectorLength,
    getWaveTargetKillCount,
    getXpToNextLevel,
    normalizeVector,
    resolveCircleObstacleCollisions,
} from './helpers';
import { getActiveObstacles, getObstacleSlotsForWave } from './obstacleLayout';
import {
    applyDamageWithDefense,
    createInitialUpgradeLevels,
} from './gameplayUtils';
import { applyUpgradeSelection } from './upgradeUtils';
import {
    getRunnerMotionStyleVars,
    getStageMoodStyleVars,
} from './viewModelUtils';
import {
    getWaveEliteKillTarget,
    getWaveEliteSpawnInterval,
    getWaveRangedSpawnInterval,
} from './waveConfig';
import { syncVisualState } from './renderSync';
import { trySpawnEnemiesAndBombs } from './spawnSystem';
import { runCombatFrame } from './combatSystem';
import {
    advanceWaveIfReady,
    createRegisterEnemyDefeat,
    createShowAnnouncement,
    updateAnnouncementsAndEffects,
} from './waveProgress';
import type {
    BombBlast,
    BombBlastRenderItem,
    BombStrike,
    BombStrikeRenderItem,
    ChaserEnemy,
    DeathBurst,
    DeathBurstRenderItem,
    EliteEnemy,
    EnemyProjectile,
    EnemyRenderItem,
    EliteRenderItem,
    JelloKnightAnnouncement,
    JelloKnightHudState,
    JelloKnightPhaseOverlay,
    Obstacle,
    ObstacleSlot,
    PickupRenderItem,
    RangedEnemy,
    RangedEnemyRenderItem,
    RunnerMotion,
    SpawnSignal,
    SpawnSignalRenderItem,
    UpgradeLevels,
    UpgradeOption,
    UpgradeOptionId,
    Vector2,
    WebZone,
    WebZoneRenderItem,
    XpPickup,
    ProjectileRenderItem,
} from './types';

const getCombinedMovementInput = (
    keyboardInput: { up: boolean; down: boolean; left: boolean; right: boolean },
    joystickInput: Vector2
) => {
    const keyboardVector = normalizeVector({
        x: (keyboardInput.right ? 1 : 0) - (keyboardInput.left ? 1 : 0),
        y: (keyboardInput.down ? 1 : 0) - (keyboardInput.up ? 1 : 0),
    });
    const joystickStrength = Math.min(1, getVectorLength(joystickInput));
    const combinedVector = normalizeVector({
        x: keyboardVector.x + joystickInput.x,
        y: keyboardVector.y + joystickInput.y,
    });
    const activeStrength = Math.max(getVectorLength(keyboardVector), joystickStrength);

    return {
        combinedVector,
        activeStrength,
        hasMovementInput: activeStrength > 0.08,
    };
};

const isPlayerTouchingWebZone = (
    position: Vector2,
    webZones: WebZone[],
    isWithinRadius: (ax: number, ay: number, bx: number, by: number, radius: number) => boolean
) => webZones.some((webZone) => (
    isWithinRadius(position.x, position.y, webZone.x, webZone.y, webZone.radius + (PLAYER_RADIUS * 0.15))
));

const getNextPlayerPosition = (params: {
    activeObstacles: Obstacle[];
    combinedVector: Vector2;
    currentPosition: Vector2;
    deltaMs: number;
    hasMovementInput: boolean;
    moveSpeed: number;
}) => {
    const { activeObstacles, combinedVector, currentPosition, deltaMs, hasMovementInput, moveSpeed } = params;
    const movedPosition = !hasMovementInput || moveSpeed <= 0
        ? currentPosition
        : {
            x: clamp(
                currentPosition.x + combinedVector.x * moveSpeed * (deltaMs / 1000),
                PLAYER_RADIUS,
                FIELD_SIZE - PLAYER_RADIUS
            ),
            y: clamp(
                currentPosition.y + combinedVector.y * moveSpeed * (deltaMs / 1000),
                PLAYER_RADIUS,
                FIELD_SIZE - PLAYER_RADIUS
            ),
        };

    return resolveCircleObstacleCollisions(
        movedPosition,
        PLAYER_RADIUS,
        activeObstacles,
        OBSTACLE_PLAYER_PADDING
    );
};

const buildOrbitPositions = (params: {
    elapsedMs: number;
    orbitCount: number;
    orbitRadius: number;
    orbitSpeed: number;
    playerPosition: Vector2;
}) => {
    const { elapsedMs, orbitCount, orbitRadius, orbitSpeed, playerPosition } = params;
    const baseOrbitAngle = (elapsedMs / 1000) * orbitSpeed * Math.PI * 2;
    const orbitPositions: Vector2[] = [];

    for (let index = 0; index < orbitCount; index += 1) {
        const orbitAngle = baseOrbitAngle + ((Math.PI * 2 * index) / orbitCount);
        orbitPositions.push({
            x: playerPosition.x + Math.cos(orbitAngle) * orbitRadius,
            y: playerPosition.y + Math.sin(orbitAngle) * orbitRadius,
        });
    }

    return orbitPositions;
};

const syncWaveObstacles = (params: {
    waveIndex: number;
    lastObstacleWaveRef: React.MutableRefObject<number>;
    activeObstaclesRef: React.MutableRefObject<Obstacle[]>;
    obstacleSlotsRef: React.MutableRefObject<ObstacleSlot[]>;
    setActiveObstacles: React.Dispatch<React.SetStateAction<Obstacle[]>>;
    setObstacleSlots: React.Dispatch<React.SetStateAction<ObstacleSlot[]>>;
}) => {
    const {
        waveIndex,
        lastObstacleWaveRef,
        activeObstaclesRef,
        obstacleSlotsRef,
        setActiveObstacles,
        setObstacleSlots,
    } = params;

    if (waveIndex === lastObstacleWaveRef.current) {
        return activeObstaclesRef.current;
    }

    lastObstacleWaveRef.current = waveIndex;
    activeObstaclesRef.current = getActiveObstacles(waveIndex);
    obstacleSlotsRef.current = getObstacleSlotsForWave(waveIndex);
    setActiveObstacles(activeObstaclesRef.current);
    setObstacleSlots(obstacleSlotsRef.current);

    return activeObstaclesRef.current;
};

const getWaveFrameState = (params: {
    elapsedMs: number;
    nextWaveAdvanceAtMsRef: React.MutableRefObject<number | null>;
    waveIndexRef: React.MutableRefObject<number>;
    waveKillCountRef: React.MutableRefObject<number>;
    waveTargetKillCountRef: React.MutableRefObject<number>;
    waveEliteKillCountRef: React.MutableRefObject<number>;
    waveEliteKillTargetRef: React.MutableRefObject<number>;
    lastSpawnTimeRef: React.MutableRefObject<number>;
    lastRangedSpawnTimeRef: React.MutableRefObject<number>;
    nextEliteSpawnAtMsRef: React.MutableRefObject<number>;
    lastObstacleWaveRef: React.MutableRefObject<number>;
    activeObstaclesRef: React.MutableRefObject<Obstacle[]>;
    obstacleSlotsRef: React.MutableRefObject<ObstacleSlot[]>;
    setActiveObstacles: React.Dispatch<React.SetStateAction<Obstacle[]>>;
    setObstacleSlots: React.Dispatch<React.SetStateAction<ObstacleSlot[]>>;
}) => {
    const {
        elapsedMs,
        nextWaveAdvanceAtMsRef,
        waveIndexRef,
        waveKillCountRef,
        waveTargetKillCountRef,
        waveEliteKillCountRef,
        waveEliteKillTargetRef,
        lastSpawnTimeRef,
        lastRangedSpawnTimeRef,
        nextEliteSpawnAtMsRef,
        lastObstacleWaveRef,
        activeObstaclesRef,
        obstacleSlotsRef,
        setActiveObstacles,
        setObstacleSlots,
    } = params;

    const waveState = advanceWaveIfReady({
        elapsedMs,
        nextWaveAdvanceAtMsRef,
        waveIndexRef,
        waveKillCountRef,
        waveTargetKillCountRef,
        waveEliteKillCountRef,
        waveEliteKillTargetRef,
        lastSpawnTimeRef,
        lastRangedSpawnTimeRef,
        nextEliteSpawnAtMsRef,
    });

    const activeObstacleSet = syncWaveObstacles({
        waveIndex: waveState.waveIndex,
        lastObstacleWaveRef,
        activeObstaclesRef,
        obstacleSlotsRef,
        setActiveObstacles,
        setObstacleSlots,
    });

    return {
        ...waveState,
        activeObstacleSet,
        enemySpawnInterval: waveState.waveConfig.meleeSpawnIntervalMs,
        enemyMaxCount: waveState.waveConfig.meleeMaxCount,
        enemySpeedBonus: waveState.waveConfig.enemySpeedBonus,
        rangedSpawnChance: waveState.waveConfig.rangedSpawnChance,
        rangedSpawnInterval: waveState.waveConfig.rangedSpawnIntervalMs,
        rangedMaxCount: waveState.waveConfig.rangedMaxCount,
        eliteSpawnChance: waveState.waveConfig.eliteSpawnChance,
    };
};

const createFrameCallbacks = (params: {
    elapsedMs: number;
    announcementExpiresAtRef: React.MutableRefObject<number>;
    nextAnnouncementIdRef: React.MutableRefObject<number>;
    setAnnouncement: React.Dispatch<React.SetStateAction<JelloKnightAnnouncement | null>>;
    nextWaveAdvanceAtMsRef: React.MutableRefObject<number | null>;
    waveIndexRef: React.MutableRefObject<number>;
    waveKillCountRef: React.MutableRefObject<number>;
    waveTargetKillCountRef: React.MutableRefObject<number>;
    waveEliteKillCountRef: React.MutableRefObject<number>;
    waveEliteKillTargetRef: React.MutableRefObject<number>;
    damageFlashUntilRef: React.MutableRefObject<number>;
    hpRef: React.MutableRefObject<number>;
    defenseRateRef: React.MutableRefObject<number>;
}) => {
    const {
        elapsedMs,
        announcementExpiresAtRef,
        nextAnnouncementIdRef,
        setAnnouncement,
        nextWaveAdvanceAtMsRef,
        waveIndexRef,
        waveKillCountRef,
        waveTargetKillCountRef,
        waveEliteKillCountRef,
        waveEliteKillTargetRef,
        damageFlashUntilRef,
        hpRef,
        defenseRateRef,
    } = params;

    const showAnnouncement = createShowAnnouncement({
        elapsedMs,
        announcementExpiresAtRef,
        nextAnnouncementIdRef,
        setAnnouncement,
    });

    const triggerDamageFlash = () => {
        damageFlashUntilRef.current = elapsedMs + DAMAGE_FLASH_DURATION_MS;
    };

    const registerEnemyDefeat = createRegisterEnemyDefeat({
        elapsedMs,
        nextWaveAdvanceAtMsRef,
        waveIndexRef,
        waveKillCountRef,
        waveTargetKillCountRef,
        waveEliteKillCountRef,
        waveEliteKillTargetRef,
    });

    const applyPlayerDamage = (
        rawDamage: number,
        lastDamageRef: React.MutableRefObject<number>,
        hitSound: 'jello' | 'quiet-orb' = 'jello'
    ) => {
        if (elapsedMs - lastDamageRef.current < CONTACT_DAMAGE_COOLDOWN_MS) return false;
        lastDamageRef.current = elapsedMs;
        const nextHp = applyDamageWithDefense(hpRef.current, rawDamage, defenseRateRef.current);
        const tookDamage = nextHp < hpRef.current;
        hpRef.current = nextHp;
        if (tookDamage) {
            if (hitSound === 'quiet-orb') {
                playQuietOrbHitSynth(0.38, 140);
            } else {
                playJelloClickSound(0.42);
            }
        }
        triggerDamageFlash();
        return true;
    };

    return {
        showAnnouncement,
        registerEnemyDefeat,
        applyPlayerDamage,
    };
};

const getPlayerMoveSpeedForFrame = (params: {
    currentPosition: Vector2;
    elapsedMs: number;
    hasMovementInput: boolean;
    isWithinRadius: (ax: number, ay: number, bx: number, by: number, radius: number) => boolean;
    playerMoveSpeed: number;
    playerWebSlowUntilMsRef: React.MutableRefObject<number>;
    webZones: WebZone[];
}) => {
    const {
        currentPosition,
        elapsedMs,
        hasMovementInput,
        isWithinRadius,
        playerMoveSpeed,
        playerWebSlowUntilMsRef,
        webZones,
    } = params;

    if (isPlayerTouchingWebZone(currentPosition, webZones, isWithinRadius)) {
        playerWebSlowUntilMsRef.current = elapsedMs + WEB_ZONE_TOUCH_DEBUFF_MS;
    }

    const webSlowMultiplier = elapsedMs < playerWebSlowUntilMsRef.current
        ? WEB_ZONE_TOUCH_SLOW_MULTIPLIER
        : 1;

    return hasMovementInput ? playerMoveSpeed * webSlowMultiplier : 0;
};

export const useJelloKnightGame = ({
    gt,
}: {
    gt: (key: string, values?: Record<string, string | number>) => string;
}) => {
    const isWithinRadius = (
        ax: number,
        ay: number,
        bx: number,
        by: number,
        radius: number
    ) => {
        const dx = ax - bx;
        const dy = ay - by;
        return ((dx * dx) + (dy * dy)) <= (radius * radius);
    };

    const rootRef = useRef<HTMLDivElement | null>(null);
    const stageRef = useRef<HTMLDivElement | null>(null);
    const controlsRef = useRef<HTMLDivElement | null>(null);
    const joystickBaseRef = useRef<HTMLDivElement | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const runStartTimeRef = useRef<number | null>(null);
    const pauseStartedAtRef = useRef<number | null>(null);
    const accumulatedPauseMsRef = useRef<number>(0);
    const lastFrameTimeRef = useRef<number | null>(null);
    const lastVisualSyncTimeRef = useRef<number>(0);
    const lastPlayerVisualSyncTimeRef = useRef<number>(0);
    const stageViewportSizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });
    const joystickPointerIdRef = useRef<number | null>(null);
    const keyboardInputRef = useRef({ up: false, down: false, left: false, right: false });
    const joystickInputRef = useRef<Vector2>({ x: 0, y: 0 });
    const playerPositionRef = useRef<Vector2>(INITIAL_PLAYER_POSITION);
    const elapsedMsRef = useRef<number>(0);
    const enemiesRef = useRef<ChaserEnemy[]>([]);
    const rangedEnemiesRef = useRef<RangedEnemy[]>([]);
    const eliteEnemyRef = useRef<EliteEnemy | null>(null);
    const projectilesRef = useRef<EnemyProjectile[]>([]);
    const webZonesRef = useRef<WebZone[]>([]);
    const bombStrikesRef = useRef<BombStrike[]>([]);
    const bombBlastsRef = useRef<BombBlast[]>([]);
    const deathBurstsRef = useRef<DeathBurst[]>([]);
    const xpPickupsRef = useRef<XpPickup[]>([]);
    const spawnSignalsRef = useRef<SpawnSignal[]>([]);
    const scoreRef = useRef<number>(0);
    const hpRef = useRef<number>(PLAYER_MAX_HP);
    const playerMaxHpRef = useRef<number>(PLAYER_MAX_HP_LEVELS[0]);
    const playerMoveSpeedRef = useRef<number>(PLAYER_MOVE_SPEED_LEVELS[0]);
    const defenseRateRef = useRef<number>(PLAYER_DEFENSE_LEVELS[0]);
    const levelRef = useRef<number>(1);
    const currentXpRef = useRef<number>(0);
    const orbitDamageRef = useRef<number>(ORBIT_DAMAGE);
    const orbitCountRef = useRef<number>(ORBIT_COUNT_LEVELS[0]);
    const orbitSpeedRef = useRef<number>(ORBIT_ROTATION_SPEED);
    const orbitRadiusRef = useRef<number>(ORBIT_RADIUS);
    const orbitCritMultiplierRef = useRef<number>(ORBIT_CRIT_MULTIPLIER_LEVELS[0]);
    const bombUnlockedRef = useRef(false);
    const bombDamageRef = useRef<number>(BOMB_BASE_DAMAGE);
    const bombDropChanceRef = useRef<number>(BOMB_DROP_CHANCE_LEVELS[0]);
    const bombDropIntervalRef = useRef<number>(BOMB_DROP_INTERVAL_LEVELS[0]);
    const bombRadiusRef = useRef<number>(BOMB_BASE_RADIUS);
    const bombCritMultiplierRef = useRef<number>(BOMB_CRIT_MULTIPLIER_LEVELS[0]);
    const upgradeLevelsRef = useRef<UpgradeLevels>(createInitialUpgradeLevels());
    const nextEnemyIdRef = useRef<number>(1);
    const nextRangedEnemyIdRef = useRef<number>(1);
    const nextEliteIdRef = useRef<number>(1);
    const nextPickupIdRef = useRef<number>(1);
    const nextProjectileIdRef = useRef<number>(1);
    const nextBombStrikeIdRef = useRef<number>(1);
    const lastSpawnTimeRef = useRef<number>(0);
    const lastRangedSpawnTimeRef = useRef<number>(-getWaveRangedSpawnInterval(1));
    const nextEliteSpawnAtMsRef = useRef<number>(
        getWaveEliteKillTarget(1) > 0
            ? getWaveEliteSpawnInterval(1)
            : Number.POSITIVE_INFINITY
    );
    const lastBombTriggerTimeRef = useRef<number>(0);
    const lastEnemyContactDamageTimeRef = useRef<number>(-CONTACT_DAMAGE_COOLDOWN_MS);
    const lastEliteContactDamageTimeRef = useRef<number>(-CONTACT_DAMAGE_COOLDOWN_MS);
    const lastProjectileDamageTimeRef = useRef<number>(-CONTACT_DAMAGE_COOLDOWN_MS);
    const lastAnnouncedWaveRef = useRef<number>(0);
    const lastObstacleWaveRef = useRef<number>(0);
    const activeObstaclesRef = useRef<Obstacle[]>(getActiveObstacles(1));
    const obstacleSlotsRef = useRef<ObstacleSlot[]>(getObstacleSlotsForWave(1));
    const lastRangedAnnouncementAtRef = useRef<number>(-getWaveRangedSpawnInterval(1));
    const announcementExpiresAtRef = useRef<number>(0);
    const damageFlashUntilRef = useRef<number>(0);
    const playerWebSlowUntilMsRef = useRef<number>(0);
    const waveIndexRef = useRef<number>(1);
    const waveKillCountRef = useRef<number>(0);
    const waveTargetKillCountRef = useRef<number>(getWaveTargetKillCount(1));
    const waveEliteKillCountRef = useRef<number>(0);
    const waveEliteKillTargetRef = useRef<number>(getWaveEliteKillTarget(1));
    const nextWaveAdvanceAtMsRef = useRef<number | null>(null);
    const nextSignalIdRef = useRef<number>(1);
    const nextAnnouncementIdRef = useRef<number>(1);
    const nextWebZoneIdRef = useRef<number>(1);
    const nextDeathBurstIdRef = useRef<number>(1);
    const enemyRenderSnapshotRef = useRef<EnemyRenderItem[]>([]);
    const rangedEnemyRenderSnapshotRef = useRef<RangedEnemyRenderItem[]>([]);
    const eliteRenderSnapshotRef = useRef<EliteRenderItem | null>(null);
    const projectileRenderSnapshotRef = useRef<ProjectileRenderItem[]>([]);
    const webZoneRenderSnapshotRef = useRef<WebZoneRenderItem[]>([]);
    const pickupRenderSnapshotRef = useRef<PickupRenderItem[]>([]);
    const bombStrikeSnapshotRef = useRef<BombStrikeRenderItem[]>([]);
    const bombBlastSnapshotRef = useRef<BombBlastRenderItem[]>([]);
    const deathBurstSnapshotRef = useRef<DeathBurstRenderItem[]>([]);
    const spawnSignalSnapshotRef = useRef<SpawnSignalRenderItem[]>([]);

    const [gamePhase, setGamePhase] = useState<JelloKnightPhaseOverlay>('start');
    const [hudState, setHudState] = useState<JelloKnightHudState>(INITIAL_HUD_STATE);
    const [bestScore, setBestScore] = useState<number>(0);
    const [bestTimeMs, setBestTimeMs] = useState<number>(0);
    const [lastRunWasBest, setLastRunWasBest] = useState(false);
    const [playerPosition, setPlayerPosition] = useState<Vector2>(INITIAL_PLAYER_POSITION);
    const [runnerMotion, setRunnerMotion] = useState<RunnerMotion>({ x: 0, y: 0, strength: 0 });
    const [cameraPosition, setCameraPosition] = useState<Vector2>({ x: 0, y: 0 });
    const [joystickVector, setJoystickVector] = useState<Vector2>({ x: 0, y: 0 });
    const [orbitPositions, setOrbitPositions] = useState<Vector2[]>([]);
    const [enemies, setEnemies] = useState<EnemyRenderItem[]>([]);
    const [rangedEnemies, setRangedEnemies] = useState<RangedEnemyRenderItem[]>([]);
    const [eliteEnemy, setEliteEnemy] = useState<EliteRenderItem | null>(null);
    const [projectiles, setProjectiles] = useState<ProjectileRenderItem[]>([]);
    const [webZones, setWebZones] = useState<WebZoneRenderItem[]>([]);
    const [bombStrikes, setBombStrikes] = useState<BombStrikeRenderItem[]>([]);
    const [bombBlasts, setBombBlasts] = useState<BombBlastRenderItem[]>([]);
    const [deathBursts, setDeathBursts] = useState<DeathBurstRenderItem[]>([]);
    const [xpPickups, setXpPickups] = useState<PickupRenderItem[]>([]);
    const [upgradeOptions, setUpgradeOptions] = useState<UpgradeOption[]>([]);
    const [orbitDamage, setOrbitDamage] = useState<number>(ORBIT_DAMAGE);
    const [playerMaxHp, setPlayerMaxHp] = useState<number>(PLAYER_MAX_HP_LEVELS[0]);
    const [orbitSpeed, setOrbitSpeed] = useState<number>(ORBIT_ROTATION_SPEED);
    const [orbitRadius, setOrbitRadius] = useState<number>(ORBIT_RADIUS);
    const [bombDamage, setBombDamage] = useState<number>(BOMB_BASE_DAMAGE);
    const [bombRadius, setBombRadius] = useState<number>(BOMB_BASE_RADIUS);
    const [activeObstacles, setActiveObstacles] = useState<Obstacle[]>(activeObstaclesRef.current);
    const [obstacleSlots, setObstacleSlots] = useState<ObstacleSlot[]>(obstacleSlotsRef.current);
    const [spawnSignals, setSpawnSignals] = useState<SpawnSignalRenderItem[]>([]);
    const [announcement, setAnnouncement] = useState<JelloKnightAnnouncement | null>(null);
    const [damageFlashOpacity, setDamageFlashOpacity] = useState(0);

    useEffect(() => {
        const syncStageViewport = () => {
            const stageRect = stageRef.current?.getBoundingClientRect();
            stageViewportSizeRef.current = {
                width: stageRect?.width ?? 0,
                height: stageRect?.height ?? 0,
            };
        };

        const handleResize = () => {
            syncStageViewport();
            setCameraPosition(getCameraPositionFromViewport(
                playerPositionRef.current,
                stageViewportSizeRef.current.width,
                stageViewportSizeRef.current.height
            ));
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const resetJoystick = useCallback(() => {
        joystickPointerIdRef.current = null;
        joystickInputRef.current = { x: 0, y: 0 };
        setJoystickVector({ x: 0, y: 0 });
    }, []);

    const getEnemyDisplayName = useCallback(
        (enemyType: string) => gt(`enemyNames.${enemyType}`),
        [gt]
    );

    const addDeathBurst = useCallback((params: {
        x: number;
        y: number;
        emoji: string;
        sizeScale?: number;
    }) => {
        deathBurstsRef.current = deathBurstsRef.current.concat({
            id: nextDeathBurstIdRef.current,
            x: params.x,
            y: params.y,
            emoji: params.emoji,
            sizeScale: params.sizeScale ?? 1,
            expiresAtMs: elapsedMsRef.current + 380,
        });
        nextDeathBurstIdRef.current += 1;
    }, []);

    const resetRunRefs = useCallback(() => {
        runStartTimeRef.current = null;
        pauseStartedAtRef.current = null;
        accumulatedPauseMsRef.current = 0;
        lastFrameTimeRef.current = null;
        elapsedMsRef.current = 0;
        lastVisualSyncTimeRef.current = 0;
        lastPlayerVisualSyncTimeRef.current = 0;
        keyboardInputRef.current = { up: false, down: false, left: false, right: false };
        joystickInputRef.current = { x: 0, y: 0 };
        playerPositionRef.current = INITIAL_PLAYER_POSITION;
        hpRef.current = PLAYER_MAX_HP_LEVELS[0];
        playerMaxHpRef.current = PLAYER_MAX_HP_LEVELS[0];
        playerMoveSpeedRef.current = PLAYER_MOVE_SPEED_LEVELS[0];
        defenseRateRef.current = PLAYER_DEFENSE_LEVELS[0];
        scoreRef.current = 0;
        levelRef.current = 1;
        currentXpRef.current = 0;
        orbitDamageRef.current = ORBIT_DAMAGE_LEVELS[0];
        orbitCountRef.current = ORBIT_COUNT_LEVELS[0];
        orbitSpeedRef.current = ORBIT_SPEED_LEVELS[0];
        orbitRadiusRef.current = ORBIT_RADIUS_LEVELS[0];
        orbitCritMultiplierRef.current = ORBIT_CRIT_MULTIPLIER_LEVELS[0];
        bombUnlockedRef.current = false;
        bombDamageRef.current = BOMB_BASE_DAMAGE;
        bombDropChanceRef.current = BOMB_DROP_CHANCE_LEVELS[0];
        bombDropIntervalRef.current = BOMB_DROP_INTERVAL_LEVELS[0];
        bombRadiusRef.current = BOMB_RADIUS_LEVELS[0];
        bombCritMultiplierRef.current = BOMB_CRIT_MULTIPLIER_LEVELS[0];
        upgradeLevelsRef.current = createInitialUpgradeLevels();
        lastSpawnTimeRef.current = 0;
        lastRangedSpawnTimeRef.current = -getWaveRangedSpawnInterval(1);
        nextEliteSpawnAtMsRef.current = getWaveEliteKillTarget(1) > 0
            ? getWaveEliteSpawnInterval(1)
            : Number.POSITIVE_INFINITY;
        lastBombTriggerTimeRef.current = 0;
        lastEnemyContactDamageTimeRef.current = -CONTACT_DAMAGE_COOLDOWN_MS;
        lastEliteContactDamageTimeRef.current = -CONTACT_DAMAGE_COOLDOWN_MS;
        lastProjectileDamageTimeRef.current = -CONTACT_DAMAGE_COOLDOWN_MS;
        lastAnnouncedWaveRef.current = 0;
        lastObstacleWaveRef.current = 0;
        activeObstaclesRef.current = getActiveObstacles(1);
        obstacleSlotsRef.current = getObstacleSlotsForWave(1);
        lastRangedAnnouncementAtRef.current = -getWaveRangedSpawnInterval(1);
        announcementExpiresAtRef.current = 0;
        damageFlashUntilRef.current = 0;
        playerWebSlowUntilMsRef.current = 0;
        waveIndexRef.current = 1;
        waveKillCountRef.current = 0;
        waveTargetKillCountRef.current = getWaveTargetKillCount(1);
        waveEliteKillCountRef.current = 0;
        waveEliteKillTargetRef.current = getWaveEliteKillTarget(1);
        nextWaveAdvanceAtMsRef.current = null;
        nextEnemyIdRef.current = 1;
        nextRangedEnemyIdRef.current = 1;
        nextEliteIdRef.current = 1;
        nextPickupIdRef.current = 1;
        nextProjectileIdRef.current = 1;
        nextBombStrikeIdRef.current = 1;
        nextSignalIdRef.current = 1;
        nextAnnouncementIdRef.current = 1;
        nextWebZoneIdRef.current = 1;
        nextDeathBurstIdRef.current = 1;
        enemiesRef.current = [];
        rangedEnemiesRef.current = [];
        eliteEnemyRef.current = null;
        projectilesRef.current = [];
        webZonesRef.current = [];
        bombStrikesRef.current = [];
        bombBlastsRef.current = [];
        deathBurstsRef.current = [];
        xpPickupsRef.current = [];
        spawnSignalsRef.current = [];
        enemyRenderSnapshotRef.current = [];
        rangedEnemyRenderSnapshotRef.current = [];
        eliteRenderSnapshotRef.current = null;
        projectileRenderSnapshotRef.current = [];
        webZoneRenderSnapshotRef.current = [];
        pickupRenderSnapshotRef.current = [];
        bombStrikeSnapshotRef.current = [];
        bombBlastSnapshotRef.current = [];
        deathBurstSnapshotRef.current = [];
        spawnSignalSnapshotRef.current = [];
        resetJoystick();
    }, [resetJoystick]);

    const resetRunState = useCallback(() => {
        setHudState(INITIAL_HUD_STATE);
        setLastRunWasBest(false);
        setPlayerPosition(INITIAL_PLAYER_POSITION);
        setRunnerMotion({ x: 0, y: 0, strength: 0 });
        setCameraPosition(getCameraPositionFromViewport(
            INITIAL_PLAYER_POSITION,
            stageViewportSizeRef.current.width,
            stageViewportSizeRef.current.height
        ));
        setOrbitPositions([]);
        setEnemies([]);
        setRangedEnemies([]);
        setEliteEnemy(null);
        setProjectiles([]);
        setWebZones([]);
        setBombStrikes([]);
        setBombBlasts([]);
        setDeathBursts([]);
        setXpPickups([]);
        setUpgradeOptions([]);
        setOrbitDamage(ORBIT_DAMAGE_LEVELS[0]);
        setPlayerMaxHp(PLAYER_MAX_HP_LEVELS[0]);
        setOrbitSpeed(ORBIT_SPEED_LEVELS[0]);
        setOrbitRadius(ORBIT_RADIUS_LEVELS[0]);
        setBombDamage(BOMB_BASE_DAMAGE);
        setBombRadius(BOMB_RADIUS_LEVELS[0]);
        setActiveObstacles(activeObstaclesRef.current);
        setObstacleSlots(obstacleSlotsRef.current);
        setSpawnSignals([]);
        setAnnouncement(null);
        setDamageFlashOpacity(0);
    }, []);

    const finishRun = useCallback(() => {
        if (animationFrameRef.current !== null) {
            window.cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        resetJoystick();
        const finalScore = scoreRef.current;
        const finalElapsedMs = elapsedMsRef.current;
        const isBest = finalScore > bestScore;
        setGamePhase((currentPhase) => currentPhase === 'playing' ? 'gameOver' : currentPhase);
        setLastRunWasBest(isBest);
        setBestScore((currentBest) => Math.max(currentBest, finalScore));
        setBestTimeMs((currentBest) => Math.max(currentBest, finalElapsedMs));
    }, [bestScore, resetJoystick]);

    useEffect(() => {
        if (gamePhase !== 'playing') {
            keyboardInputRef.current = { up: false, down: false, left: false, right: false };
            return undefined;
        }

        const handleKeyChange = (event: KeyboardEvent, pressed: boolean) => {
            const key = event.key.toLowerCase();
            let handled = true;
            switch (key) {
                case 'arrowup':
                case 'w':
                    keyboardInputRef.current.up = pressed;
                    break;
                case 'arrowdown':
                case 's':
                    keyboardInputRef.current.down = pressed;
                    break;
                case 'arrowleft':
                case 'a':
                    keyboardInputRef.current.left = pressed;
                    break;
                case 'arrowright':
                case 'd':
                    keyboardInputRef.current.right = pressed;
                    break;
                default:
                    handled = false;
            }

            if (handled) event.preventDefault();
        };

        const handleKeyDown = (event: KeyboardEvent) => handleKeyChange(event, true);
        const handleKeyUp = (event: KeyboardEvent) => handleKeyChange(event, false);

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [gamePhase]);

    useEffect(() => {
        if (gamePhase === 'levelUp') {
            if (animationFrameRef.current !== null) {
                window.cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
            if (pauseStartedAtRef.current === null) {
                pauseStartedAtRef.current = performance.now();
            }
            lastFrameTimeRef.current = null;
            return undefined;
        }

        if (gamePhase !== 'playing') {
            if (animationFrameRef.current !== null) {
                window.cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
            pauseStartedAtRef.current = null;
            runStartTimeRef.current = null;
            accumulatedPauseMsRef.current = 0;
            lastFrameTimeRef.current = null;
            return undefined;
        }

        if (pauseStartedAtRef.current !== null) {
            accumulatedPauseMsRef.current += performance.now() - pauseStartedAtRef.current;
            pauseStartedAtRef.current = null;
        }

        const tick = (timestamp: number) => {
            if (runStartTimeRef.current === null) {
                runStartTimeRef.current = timestamp - elapsedMsRef.current - accumulatedPauseMsRef.current;
            }
            if (lastFrameTimeRef.current === null) {
                lastFrameTimeRef.current = timestamp;
            }

            const elapsedMs = timestamp - runStartTimeRef.current - accumulatedPauseMsRef.current;
            elapsedMsRef.current = elapsedMs;
            const deltaMs = Math.min(40, timestamp - lastFrameTimeRef.current);
            lastFrameTimeRef.current = timestamp;
            const shouldSyncPlayerVisuals = elapsedMs - lastPlayerVisualSyncTimeRef.current >= PLAYER_VISUAL_SYNC_INTERVAL_MS;
            const shouldSyncVisuals = elapsedMs - lastVisualSyncTimeRef.current >= VISUAL_SYNC_INTERVAL_MS;
            const {
                waveIndex,
                isWaveTransitioning,
                waveVisualTier,
                activeObstacleSet,
                enemySpawnInterval,
                enemyMaxCount,
                enemySpeedBonus,
                rangedSpawnChance,
                rangedSpawnInterval,
                rangedMaxCount,
                eliteSpawnChance,
            } = getWaveFrameState({
                elapsedMs,
                nextWaveAdvanceAtMsRef,
                waveIndexRef,
                waveKillCountRef,
                waveTargetKillCountRef,
                waveEliteKillCountRef,
                waveEliteKillTargetRef,
                lastSpawnTimeRef,
                lastRangedSpawnTimeRef,
                nextEliteSpawnAtMsRef,
                lastObstacleWaveRef,
                activeObstaclesRef,
                obstacleSlotsRef,
                setActiveObstacles,
                setObstacleSlots,
            });
            const {
                showAnnouncement,
                registerEnemyDefeat,
                applyPlayerDamage,
            } = createFrameCallbacks({
                elapsedMs,
                announcementExpiresAtRef,
                nextAnnouncementIdRef,
                setAnnouncement,
                nextWaveAdvanceAtMsRef,
                waveIndexRef,
                waveKillCountRef,
                waveTargetKillCountRef,
                waveEliteKillCountRef,
                waveEliteKillTargetRef,
                damageFlashUntilRef,
                hpRef,
                defenseRateRef,
            });

            updateAnnouncementsAndEffects({
                elapsedMs,
                waveIndex,
                gt,
                lastAnnouncedWaveRef,
                announcementExpiresAtRef,
                spawnSignalsRef,
                bombBlastsRef,
                deathBurstsRef,
                webZonesRef,
                setAnnouncement,
                showAnnouncement,
            });

            const { combinedVector, activeStrength, hasMovementInput } = getCombinedMovementInput(
                keyboardInputRef.current,
                joystickInputRef.current
            );
            const currentPosition = playerPositionRef.current;
            const moveSpeed = getPlayerMoveSpeedForFrame({
                currentPosition,
                elapsedMs,
                hasMovementInput,
                isWithinRadius,
                playerMoveSpeed: playerMoveSpeedRef.current,
                playerWebSlowUntilMsRef,
                webZones: webZonesRef.current,
            });
            const nextPosition = getNextPlayerPosition({
                activeObstacles: activeObstacleSet,
                combinedVector,
                currentPosition,
                deltaMs,
                hasMovementInput,
                moveSpeed,
            });

            playerPositionRef.current = nextPosition;

            trySpawnEnemiesAndBombs({
                activeObstacleSet,
                elapsedMs,
                eliteSpawnChance,
                enemyMaxCount,
                enemySpawnInterval,
                nextPosition,
                rangedMaxCount,
                rangedSpawnInterval,
                rangedSpawnChance,
                isWaveTransitioning,
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
            });

            const orbitPositionsNow = buildOrbitPositions({
                elapsedMs,
                orbitCount: orbitCountRef.current,
                orbitRadius: orbitRadiusRef.current,
                orbitSpeed: orbitSpeedRef.current,
                playerPosition: nextPosition,
            });

            const { shouldRefreshPickups, leveledUp } = runCombatFrame({
                activeObstacleSet,
                deltaMs,
                elapsedMs,
                nextPosition,
                orbitPositionsNow,
                gt,
                applyPlayerDamage,
                registerEnemyDefeat,
                isWithinRadius,
                enemiesRef,
                rangedEnemiesRef,
                eliteEnemyRef,
                webZonesRef,
                bombStrikesRef,
                bombBlastsRef,
                projectilesRef,
                xpPickupsRef,
                scoreRef,
                currentXpRef,
                levelRef,
                hpRef,
                playerMaxHpRef,
                orbitDamageRef,
                orbitCritMultiplierRef,
                bombDamageRef,
                bombRadiusRef,
                bombCritMultiplierRef,
                bombUnlockedRef,
                upgradeLevelsRef,
                nextBombStrikeIdRef,
                nextProjectileIdRef,
                nextWebZoneIdRef,
                nextPickupIdRef,
                lastEnemyContactDamageTimeRef,
                lastEliteContactDamageTimeRef,
                lastProjectileDamageTimeRef,
                setUpgradeOptions,
                addDeathBurst,
                enemySpeedBonus,
            });

            syncVisualState({
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
                playerPositionRef,
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
            });

            if (hpRef.current <= 0) {
                animationFrameRef.current = null;
                finishRun();
                return;
            }

            if (leveledUp) setGamePhase('levelUp');
            animationFrameRef.current = window.requestAnimationFrame(tick);
        };

        animationFrameRef.current = window.requestAnimationFrame(tick);
        return () => {
            if (animationFrameRef.current !== null) {
                window.cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        };
    }, [finishRun, gamePhase, getEnemyDisplayName]);

    const headerStats = useMemo<PlayArcadeHeaderStat[]>(() => ([
        {
            label: '❤️',
            current: `${hudState.hp} / ${playerMaxHp}`,
            widthWeight: 1.2,
            highlightCurrent: hudState.hp <= 55,
            className: 'jello-knight__header-stat--filled jello-knight__header-stat--filled-life jello-knight__header-stat--icon-inline',
            currentClassName: 'jello-knight__header-stat-current--subtle',
            fillPercent: Math.round((hudState.hp / playerMaxHp) * 100),
            fillClassName: 'jello-knight__header-stat-fill--life-red',
        },
        {
            label: '💧',
            current: `${currentXpRef.current} / ${getXpToNextLevel(hudState.level)}`,
            widthWeight: 1.1,
            className: 'jello-knight__header-stat--filled jello-knight__header-stat--filled-xp jello-knight__header-stat--icon-inline jello-knight__header-stat--xp-icon',
            currentClassName: 'jello-knight__header-stat-current--subtle',
            fillPercent: hudState.xpPercent,
            fillClassName: 'jello-knight__header-stat-fill--xp',
        },
        {
            label: gt('header.score'),
            bestLabel: gt('header.best'),
            current: hudState.score.toLocaleString(),
            best: bestScore.toLocaleString(),
            widthWeight: 1.9,
            highlightCurrent: hudState.score > bestScore,
        },
    ]), [bestScore, gt, hudState.hp, hudState.level, hudState.score, hudState.xpPercent, playerMaxHp]);

    const startRun = useCallback(() => {
        primeFeedbackSoundsSilently();
        primePlaySynthSfx();
        resetRunRefs();
        resetRunState();
        setGamePhase('playing');
    }, [resetRunRefs, resetRunState]);

    const handleUpgradeSelect = useCallback((optionId: UpgradeOptionId) => {
        applyUpgradeSelection({
            optionId,
            bombUnlockedRef,
            bombCritMultiplierRef,
            bombDropChanceRef,
            bombDropIntervalRef,
            bombRadiusRef,
            defenseRateRef,
            hpRef,
            orbitCountRef,
            orbitCritMultiplierRef,
            orbitDamageRef,
            orbitRadiusRef,
            orbitSpeedRef,
            playerMaxHpRef,
            playerMoveSpeedRef,
            setBombRadius,
            setOrbitDamage,
            setOrbitRadius,
            setOrbitSpeed,
            setPlayerMaxHp,
            upgradeLevelsRef,
        });

        playClearSound(0.5);
        setUpgradeOptions([]);
        setGamePhase('playing');
    }, []);

    const updateJoystick = useCallback((clientX: number, clientY: number) => {
        const rect = joystickBaseRef.current?.getBoundingClientRect();
        if (!rect) return;
        const rawVector = {
            x: clientX - (rect.left + rect.width / 2),
            y: clientY - (rect.top + rect.height / 2),
        };
        const distance = getVectorLength(rawVector);
        const limitedDistance = Math.min(JOYSTICK_MAX_RADIUS, distance);
        const direction = distance > 0
            ? { x: rawVector.x / distance, y: rawVector.y / distance }
            : { x: 0, y: 0 };
        const normalized = {
            x: direction.x * (limitedDistance / JOYSTICK_MAX_RADIUS),
            y: direction.y * (limitedDistance / JOYSTICK_MAX_RADIUS),
        };

        joystickInputRef.current = normalized;
    }, []);

    const handleJoystickPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        if (gamePhase !== 'playing') return;
        joystickPointerIdRef.current = event.pointerId;
        event.currentTarget.setPointerCapture(event.pointerId);
        updateJoystick(event.clientX, event.clientY);
        event.preventDefault();
    }, [gamePhase, updateJoystick]);

    const handleJoystickPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        if (joystickPointerIdRef.current !== event.pointerId) return;
        updateJoystick(event.clientX, event.clientY);
        event.preventDefault();
    }, [updateJoystick]);

    const handleJoystickPointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        if (joystickPointerIdRef.current !== event.pointerId) return;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
        resetJoystick();
        event.preventDefault();
    }, [resetJoystick]);

    const handleJoystickPointerCancel = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        if (joystickPointerIdRef.current === event.pointerId) {
            resetJoystick();
        }
        event.preventDefault();
    }, [resetJoystick]);

    const fieldStyle = useMemo(
        () => ({
            width: `${FIELD_SIZE}px`,
            height: `${FIELD_SIZE}px`,
            transform: `translate3d(${-cameraPosition.x.toFixed(2)}px, ${-cameraPosition.y.toFixed(2)}px, 0)`,
        }),
        [cameraPosition.x, cameraPosition.y]
    );

    const playerStyle = useMemo(
        () => ({
            left: `${playerPosition.x.toFixed(2)}px`,
            top: `${playerPosition.y.toFixed(2)}px`,
        }),
        [playerPosition.x, playerPosition.y]
    );

    const runnerMotionStyle = useMemo(
        () => getRunnerMotionStyleVars(runnerMotion),
        [runnerMotion.strength, runnerMotion.x, runnerMotion.y]
    );

    const joystickKnobStyle = useMemo(
        () => ({
            transform: `translate3d(${Math.round(joystickVector.x * JOYSTICK_MAX_RADIUS)}px, ${Math.round(joystickVector.y * JOYSTICK_MAX_RADIUS)}px, 0)`,
        }),
        [joystickVector.x, joystickVector.y]
    );

    const stageMoodStyle = useMemo(
        () => getStageMoodStyleVars(hudState.dangerTier, Boolean(eliteEnemy)),
        [eliteEnemy, hudState.dangerTier]
    );

    return {
        activeObstacles,
        obstacleSlots,
        announcement,
        bestScore,
        bestTimeMs,
        bombDamage,
        bombBlasts,
        bombRadius,
        bombStrikes,
        deathBursts,
        controlsRef,
        damageFlashOpacity,
        joystickBaseRef,
        fieldStyle,
        gamePhase,
        handleJoystickPointerCancel,
        handleJoystickPointerDown,
        handleJoystickPointerMove,
        handleJoystickPointerUp,
        handleUpgradeSelect,
        headerStats,
        hudState,
        joystickKnobStyle,
        orbitDamage,
        orbitPositions,
        orbitRadius,
        orbitSpeed,
        playerStyle,
        runnerMotionStyle,
        projectiles,
        rangedEnemies,
        resetJoystick,
        rootRef,
        setGamePhase,
        spawnSignals,
        stageMoodStyle,
        stageRef,
        startRun,
        upgradeOptions,
        webZones,
        xpPickups,
        enemies,
        eliteEnemy,
        lastRunWasBest,
        orbitPaletteForSpecies: (speciesId: string) => SPECIES_ORB_COLORS[speciesId] ?? SPECIES_ORB_COLORS.yellowJello,
    };
};
