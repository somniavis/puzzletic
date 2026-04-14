import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PlayArcadeHeaderStat } from '../../shared/PlayArcadeUI';
import { playBombExplodeSynth, playQuietOrbHitSynth, primePlaySynthSfx } from '../../shared/playSynthSfx';
import {
    playClearSound,
    playEatingSound,
    playJelloClickSound,
    primeFeedbackSoundsSilently,
} from '../../../../utils/sound';
import {
    ANNOUNCEMENT_DURATION_MS,
    BOMB_BLAST_VISUAL_MS,
    BOMB_BASE_DAMAGE,
    BOMB_CRIT_CHANCE,
    BOMB_CRIT_MULTIPLIER_LEVELS,
    BOMB_DROP_CHANCE_LEVELS,
    BOMB_DROP_INTERVAL_LEVELS,
    BOMB_BASE_RADIUS,
    BOMB_FALL_DELAY_MS,
    BOMB_RADIUS_LEVELS,
    CONTACT_DAMAGE_COOLDOWN_MS,
    DAMAGE_FLASH_DURATION_MS,
    DAMAGE_FLASH_MAX_OPACITY,
    ELITE_RADIUS,
    ELITE_SPAWN_INTERVAL_MS,
    ENEMY_PROJECTILE_RADIUS,
    ENEMY_RADIUS,
    FIELD_SIZE,
    INITIAL_HUD_STATE,
    INITIAL_PLAYER_POSITION,
    JOYSTICK_MAX_RADIUS,
    MAX_WAVE,
    OBSTACLE_ENEMY_PADDING,
    OBSTACLE_PLAYER_PADDING,
    ORBIT_COUNT_LEVELS,
    ORBIT_CRIT_MULTIPLIER_LEVELS,
    ORBIT_DAMAGE_LEVELS,
    ORBIT_DAMAGE,
    ORBIT_RADIUS_LEVELS,
    ORBIT_RADIUS,
    ORBIT_ROTATION_SPEED,
    ORBIT_SPEED_LEVELS,
    PICKUP_COLLECT_RADIUS,
    PICKUP_SPAWN_GRACE_MS,
    PLAYER_DEFENSE_LEVELS,
    PLAYER_MAX_HP,
    PLAYER_MAX_HP_LEVELS,
    PLAYER_MOVE_SPEED_LEVELS,
    PLAYER_VISUAL_SYNC_INTERVAL_MS,
    PLAYER_RADIUS,
    RANGED_ENEMY_RADIUS,
    RANGED_ENEMY_SPAWN_INTERVAL_MS,
    SIGNAL_DURATION_MS,
    SPECIES_ORB_COLORS,
    VISUAL_SYNC_INTERVAL_MS,
    WAVE_TRANSITION_DELAY_MS,
    WEB_ZONE_HP,
    WEB_ZONE_MAX_COUNT,
    WEB_ZONE_ORBIT_HIT_COOLDOWN_MS,
    WEB_ZONE_RADIUS,
    WEB_ZONE_SLOW_MULTIPLIER,
    WEB_ZONE_TOUCH_DEBUFF_MS,
    WEB_ZONE_TOUCH_SLOW_MULTIPLIER,
    WEB_SHOT_INTERVAL_MS,
    WEB_SHOT_MAX_DISTANCE,
    WEB_SHOT_MIN_DISTANCE,
    XP_PICKUP_VALUE,
} from './constants';
import {
    ELITE_ORBIT_HIT_RADIUS_BY_TYPE,
    ENEMY_CONTACT_RADIUS,
    ENEMY_ORBIT_HIT_RADIUS_BY_TYPE,
    getEliteMovementVector,
    RANGED_ORBIT_HIT_RADIUS_BY_TYPE,
} from './enemyBehaviors';
import {
    buildUpgradeOptions,
    clamp,
    createDropsForDefeat,
    createEliteEnemy,
    createRangedEnemy,
    createSpawnEnemy,
    getActiveObstacles,
    getObstacleSlotsForWave,
    getCameraPositionFromViewport,
    getEnemyMaxCount,
    getEnemySpawnInterval,
    getEnemySpeedBonus,
    getEliteSpawnChance,
    getVectorLength,
    getRangedMaxCount,
    getRangedSpawnChance,
    getWaveTargetKillCount,
    getWaveVisualTier,
    getXpToNextLevel,
    isPointInsideAnyObstacle,
    moveCircleWithObstacleSlide,
    normalizeVector,
    resolveCircleCircleSeparation,
    resolveCircleObstacleCollisions,
} from './helpers';
import {
    applyDamageWithDefense,
    applyOrbitContactDamage,
    createInitialUpgradeLevels,
} from './gameplayUtils';
import { applyUpgradeSelection } from './upgradeUtils';
import {
    buildEliteRenderSnapshot,
    buildEnemyRenderSnapshot,
    buildPickupRenderSnapshot,
    buildProjectileRenderSnapshot,
    buildRangedEnemyRenderSnapshot,
    getRunnerMotionStyleVars,
    getStageMoodStyleVars,
    buildWebZoneRenderSnapshot,
} from './viewModelUtils';
import type {
    BombBlast,
    BombStrike,
    ChaserEnemy,
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
    UpgradeLevels,
    SpawnSignal,
    UpgradeOption,
    UpgradeOptionId,
    Vector2,
    WebZone,
    WebZoneRenderItem,
    XpPickup,
    ProjectileRenderItem,
} from './types';

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
    const lastRangedSpawnTimeRef = useRef<number>(-RANGED_ENEMY_SPAWN_INTERVAL_MS);
    const nextEliteSpawnAtMsRef = useRef<number>(ELITE_SPAWN_INTERVAL_MS);
    const lastBombTriggerTimeRef = useRef<number>(0);
    const lastEnemyContactDamageTimeRef = useRef<number>(-CONTACT_DAMAGE_COOLDOWN_MS);
    const lastEliteContactDamageTimeRef = useRef<number>(-CONTACT_DAMAGE_COOLDOWN_MS);
    const lastProjectileDamageTimeRef = useRef<number>(-CONTACT_DAMAGE_COOLDOWN_MS);
    const lastAnnouncedWaveRef = useRef<number>(0);
    const lastObstacleWaveRef = useRef<number>(0);
    const activeObstaclesRef = useRef<Obstacle[]>(getActiveObstacles(1));
    const obstacleSlotsRef = useRef<ObstacleSlot[]>(getObstacleSlotsForWave(1));
    const lastRangedAnnouncementAtRef = useRef<number>(-RANGED_ENEMY_SPAWN_INTERVAL_MS);
    const announcementExpiresAtRef = useRef<number>(0);
    const damageFlashUntilRef = useRef<number>(0);
    const playerWebSlowUntilMsRef = useRef<number>(0);
    const waveIndexRef = useRef<number>(1);
    const waveKillCountRef = useRef<number>(0);
    const waveTargetKillCountRef = useRef<number>(getWaveTargetKillCount(1));
    const nextWaveAdvanceAtMsRef = useRef<number | null>(null);
    const nextSignalIdRef = useRef<number>(1);
    const nextAnnouncementIdRef = useRef<number>(1);
    const nextWebZoneIdRef = useRef<number>(1);
    const enemyRenderSnapshotRef = useRef<EnemyRenderItem[]>([]);
    const rangedEnemyRenderSnapshotRef = useRef<RangedEnemyRenderItem[]>([]);
    const eliteRenderSnapshotRef = useRef<EliteRenderItem | null>(null);
    const projectileRenderSnapshotRef = useRef<ProjectileRenderItem[]>([]);
    const webZoneRenderSnapshotRef = useRef<WebZoneRenderItem[]>([]);
    const pickupRenderSnapshotRef = useRef<PickupRenderItem[]>([]);

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
    const [bombStrikes, setBombStrikes] = useState<BombStrike[]>([]);
    const [bombBlasts, setBombBlasts] = useState<BombBlast[]>([]);
    const [xpPickups, setXpPickups] = useState<PickupRenderItem[]>([]);
    const [upgradeOptions, setUpgradeOptions] = useState<UpgradeOption[]>([]);
    const [orbitDamage, setOrbitDamage] = useState<number>(ORBIT_DAMAGE);
    const [playerMaxHp, setPlayerMaxHp] = useState<number>(PLAYER_MAX_HP_LEVELS[0]);
    const [orbitSpeed, setOrbitSpeed] = useState<number>(ORBIT_ROTATION_SPEED);
    const [orbitRadius, setOrbitRadius] = useState<number>(ORBIT_RADIUS);
    const [, setBombUnlocked] = useState(false);
    const [bombDamage, setBombDamage] = useState<number>(BOMB_BASE_DAMAGE);
    const [bombRadius, setBombRadius] = useState<number>(BOMB_BASE_RADIUS);
    const [, setUpgradeLevels] = useState<UpgradeLevels>(createInitialUpgradeLevels());
    const [activeObstacles, setActiveObstacles] = useState<Obstacle[]>(activeObstaclesRef.current);
    const [obstacleSlots, setObstacleSlots] = useState<ObstacleSlot[]>(obstacleSlotsRef.current);
    const [spawnSignals, setSpawnSignals] = useState<SpawnSignal[]>([]);
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
        lastRangedSpawnTimeRef.current = -RANGED_ENEMY_SPAWN_INTERVAL_MS;
        nextEliteSpawnAtMsRef.current = ELITE_SPAWN_INTERVAL_MS;
        lastBombTriggerTimeRef.current = 0;
        lastEnemyContactDamageTimeRef.current = -CONTACT_DAMAGE_COOLDOWN_MS;
        lastEliteContactDamageTimeRef.current = -CONTACT_DAMAGE_COOLDOWN_MS;
        lastProjectileDamageTimeRef.current = -CONTACT_DAMAGE_COOLDOWN_MS;
        lastAnnouncedWaveRef.current = 0;
        lastObstacleWaveRef.current = 0;
        activeObstaclesRef.current = getActiveObstacles(1);
        obstacleSlotsRef.current = getObstacleSlotsForWave(1);
        lastRangedAnnouncementAtRef.current = -RANGED_ENEMY_SPAWN_INTERVAL_MS;
        announcementExpiresAtRef.current = 0;
        damageFlashUntilRef.current = 0;
        playerWebSlowUntilMsRef.current = 0;
        waveIndexRef.current = 1;
        waveKillCountRef.current = 0;
        waveTargetKillCountRef.current = getWaveTargetKillCount(1);
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
        enemiesRef.current = [];
        rangedEnemiesRef.current = [];
        eliteEnemyRef.current = null;
        projectilesRef.current = [];
        webZonesRef.current = [];
        bombStrikesRef.current = [];
        bombBlastsRef.current = [];
        xpPickupsRef.current = [];
        spawnSignalsRef.current = [];
        enemyRenderSnapshotRef.current = [];
        rangedEnemyRenderSnapshotRef.current = [];
        eliteRenderSnapshotRef.current = null;
        projectileRenderSnapshotRef.current = [];
        webZoneRenderSnapshotRef.current = [];
        pickupRenderSnapshotRef.current = [];
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
        setXpPickups([]);
        setUpgradeOptions([]);
        setOrbitDamage(ORBIT_DAMAGE_LEVELS[0]);
        setPlayerMaxHp(PLAYER_MAX_HP_LEVELS[0]);
        setOrbitSpeed(ORBIT_SPEED_LEVELS[0]);
        setOrbitRadius(ORBIT_RADIUS_LEVELS[0]);
        setBombUnlocked(false);
        setBombDamage(BOMB_BASE_DAMAGE);
        setBombRadius(BOMB_RADIUS_LEVELS[0]);
        setUpgradeLevels(createInitialUpgradeLevels());
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

        const addWebZoneAt = (x: number, y: number) => {
            const nextWebZone: WebZone = {
                id: nextWebZoneIdRef.current,
                x: clamp(x, WEB_ZONE_RADIUS, FIELD_SIZE - WEB_ZONE_RADIUS),
                y: clamp(y, WEB_ZONE_RADIUS, FIELD_SIZE - WEB_ZONE_RADIUS),
                radius: WEB_ZONE_RADIUS,
                slowMultiplier: WEB_ZONE_SLOW_MULTIPLIER,
                hp: WEB_ZONE_HP,
                maxHp: WEB_ZONE_HP,
                lastOrbHitAtMs: -WEB_ZONE_ORBIT_HIT_COOLDOWN_MS,
                expiresAtMs: Number.POSITIVE_INFINITY,
            };
            nextWebZoneIdRef.current += 1;
            webZonesRef.current = webZonesRef.current
                .concat(nextWebZone)
                .slice(-WEB_ZONE_MAX_COUNT);
        };

        const syncVisualState = ({
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
        }: {
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
        }) => {
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
                const nextEnemySnapshot = buildEnemyRenderSnapshot(enemiesRef.current, enemyRenderSnapshotRef.current);
                if (nextEnemySnapshot !== enemyRenderSnapshotRef.current) {
                    enemyRenderSnapshotRef.current = nextEnemySnapshot;
                    setEnemies(nextEnemySnapshot);
                }

                const nextRangedSnapshot = buildRangedEnemyRenderSnapshot(
                    rangedEnemiesRef.current,
                    rangedEnemyRenderSnapshotRef.current
                );
                if (nextRangedSnapshot !== rangedEnemyRenderSnapshotRef.current) {
                    rangedEnemyRenderSnapshotRef.current = nextRangedSnapshot;
                    setRangedEnemies(nextRangedSnapshot);
                }

                const nextEliteSnapshot = buildEliteRenderSnapshot(
                    eliteEnemyRef.current,
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

                setBombStrikes([...bombStrikesRef.current]);
                setBombBlasts([...bombBlastsRef.current]);
                const nextPickupSnapshot = buildPickupRenderSnapshot(
                    xpPickupsRef.current,
                    pickupRenderSnapshotRef.current
                );
                if (nextPickupSnapshot !== pickupRenderSnapshotRef.current) {
                    pickupRenderSnapshotRef.current = nextPickupSnapshot;
                    setXpPickups(nextPickupSnapshot);
                }
                setSpawnSignals([...spawnSignalsRef.current]);
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

        const updateAnnouncementsAndEffects = ({
            elapsedMs,
            waveIndex,
            showAnnouncement,
        }: {
            elapsedMs: number;
            waveIndex: number;
            showAnnouncement: (
                title: string,
                detail: string,
                tone: JelloKnightAnnouncement['tone']
            ) => void;
        }) => {
            if (waveIndex > lastAnnouncedWaveRef.current) {
                lastAnnouncedWaveRef.current = waveIndex;
                const dangerDetailKeys = [
                    'announcements.dangerDetail1',
                    'announcements.dangerDetail2',
                    'announcements.dangerDetail3',
                ] as const;
                const dangerDetailKey = dangerDetailKeys[Math.floor(Math.random() * dangerDetailKeys.length)];
                showAnnouncement(
                    gt('announcements.dangerTitle', { tier: waveIndex }),
                    gt(dangerDetailKey),
                    'danger'
                );
            }

            if (announcementExpiresAtRef.current > 0 && elapsedMs >= announcementExpiresAtRef.current) {
                announcementExpiresAtRef.current = 0;
                setAnnouncement(null);
            }

            const pruneExpiredEntries = <T extends { expiresAtMs: number }>(entries: T[]) => {
                let nextEntries: T[] | null = null;

                for (let index = 0; index < entries.length; index += 1) {
                    const entry = entries[index];
                    if (entry.expiresAtMs > elapsedMs) {
                        if (nextEntries) nextEntries.push(entry);
                        continue;
                    }

                    if (!nextEntries) {
                        nextEntries = entries.slice(0, index);
                    }
                }

                return nextEntries ?? entries;
            };

            const liveSignals = pruneExpiredEntries(spawnSignalsRef.current);
            if (liveSignals !== spawnSignalsRef.current) {
                spawnSignalsRef.current = liveSignals;
            }

            const liveBombBlasts = pruneExpiredEntries(bombBlastsRef.current);
            if (liveBombBlasts !== bombBlastsRef.current) {
                bombBlastsRef.current = liveBombBlasts;
            }

            const liveWebZones = pruneExpiredEntries(webZonesRef.current);
            if (liveWebZones !== webZonesRef.current) {
                webZonesRef.current = liveWebZones;
            }
        };

        const trySpawnEnemiesAndBombs = ({
            activeObstacleSet,
            elapsedMs,
            eliteSpawnChance,
            enemyMaxCount,
            enemySpawnInterval,
            nextPosition,
            rangedMaxCount,
            rangedSpawnChance,
            showAnnouncement,
            isWaveTransitioning,
            waveIndex,
        }: {
            activeObstacleSet: Obstacle[];
            elapsedMs: number;
            eliteSpawnChance: number;
            enemyMaxCount: number;
            enemySpawnInterval: number;
            isWaveTransitioning: boolean;
            nextPosition: Vector2;
            rangedMaxCount: number;
            rangedSpawnChance: number;
            showAnnouncement: (
                title: string,
                detail: string,
                tone: JelloKnightAnnouncement['tone']
            ) => void;
            waveIndex: number;
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
                && elapsedMs - lastRangedSpawnTimeRef.current >= RANGED_ENEMY_SPAWN_INTERVAL_MS
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

                    if (elapsedMs - lastRangedAnnouncementAtRef.current >= RANGED_ENEMY_SPAWN_INTERVAL_MS * 1.6) {
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
                    nextEliteSpawnAtMsRef.current = elapsedMs + nextElite.spawnIntervalMs;
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
                    nextEliteSpawnAtMsRef.current = elapsedMs + 6000;
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

        const updateChaserEnemiesLoop = ({
            activeObstacleSet,
            addDropsForDefeat,
            applyPlayerDamage,
            deltaMs,
            enemySpeedBonus,
            nextPosition,
            orbitPositionsNow,
            registerEnemyDefeat,
        }: {
            activeObstacleSet: Obstacle[];
            addDropsForDefeat: (params: { x: number; y: number; enemyLevel: number; dropCount: number; xpValue: number }) => void;
            applyPlayerDamage: (rawDamage: number, lastDamageRef: React.MutableRefObject<number>) => boolean;
            deltaMs: number;
            enemySpeedBonus: number;
            nextPosition: Vector2;
            orbitPositionsNow: Vector2[];
            registerEnemyDefeat: () => void;
        }) => {
            const nextEnemies: ChaserEnemy[] = [];

            for (const enemy of enemiesRef.current) {
                const toPlayer = normalizeVector({ x: nextPosition.x - enemy.x, y: nextPosition.y - enemy.y });
                const enemyMoveSpeed = enemy.baseSpeed + enemySpeedBonus;
                const movedEnemy = {
                    ...enemy,
                    x: clamp(enemy.x + toPlayer.x * enemyMoveSpeed * (deltaMs / 1000), ENEMY_RADIUS, FIELD_SIZE - ENEMY_RADIUS),
                    y: clamp(enemy.y + toPlayer.y * enemyMoveSpeed * (deltaMs / 1000), ENEMY_RADIUS, FIELD_SIZE - ENEMY_RADIUS),
                };

                let nextEnemy = {
                    ...movedEnemy,
                    ...moveCircleWithObstacleSlide(
                        { x: enemy.x, y: enemy.y },
                        movedEnemy,
                        nextPosition,
                        ENEMY_RADIUS,
                        activeObstacleSet,
                        OBSTACLE_ENEMY_PADDING
                    ),
                };
                nextEnemy = {
                    ...nextEnemy,
                    ...resolveCircleCircleSeparation(nextEnemy, ENEMY_CONTACT_RADIUS, nextPosition, PLAYER_RADIUS),
                };

                const hpBeforeOrbitHit = nextEnemy.hp;
                nextEnemy = applyOrbitContactDamage(
                    nextEnemy,
                    ENEMY_ORBIT_HIT_RADIUS_BY_TYPE[nextEnemy.enemyType],
                    orbitPositionsNow,
                    orbitDamageRef.current,
                    orbitCritMultiplierRef.current
                );
                if (nextEnemy.hp < hpBeforeOrbitHit) {
                    playQuietOrbHitSynth(0.3, 90);
                }

                if (isWithinRadius(nextEnemy.x, nextEnemy.y, nextPosition.x, nextPosition.y, ENEMY_CONTACT_RADIUS + PLAYER_RADIUS)) {
                    applyPlayerDamage(nextEnemy.contactDamage, lastEnemyContactDamageTimeRef);
                }

                if (nextEnemy.hp <= 0) {
                    addDropsForDefeat({
                        x: nextEnemy.x,
                        y: nextEnemy.y,
                        enemyLevel: 1,
                        dropCount: nextEnemy.enemyType === 'heavy' ? 2 : 1,
                        xpValue: XP_PICKUP_VALUE,
                    });
                    registerEnemyDefeat();
                    continue;
                }

                nextEnemies.push(nextEnemy);
            }

            enemiesRef.current = nextEnemies;
        };

        const updateRangedEnemiesLoop = ({
            activeObstacleSet,
            addDropsForDefeat,
            deltaMs,
            nextPosition,
            orbitPositionsNow,
            registerEnemyDefeat,
        }: {
            activeObstacleSet: Obstacle[];
            addDropsForDefeat: (params: { x: number; y: number; enemyLevel: number; dropCount: number; xpValue: number }) => void;
            deltaMs: number;
            nextPosition: Vector2;
            orbitPositionsNow: Vector2[];
            registerEnemyDefeat: () => void;
        }) => {
            const nextRangedEnemies: RangedEnemy[] = [];

            for (const enemy of rangedEnemiesRef.current) {
                const toPlayerRaw = { x: nextPosition.x - enemy.x, y: nextPosition.y - enemy.y };
                const distanceToPlayerSq = (toPlayerRaw.x * toPlayerRaw.x) + (toPlayerRaw.y * toPlayerRaw.y);
                const distanceToPlayer = Math.sqrt(distanceToPlayerSq);
                const inverseDistance = distanceToPlayer > 0 ? 1 / distanceToPlayer : 0;
                const toPlayer = {
                    x: toPlayerRaw.x * inverseDistance,
                    y: toPlayerRaw.y * inverseDistance,
                };
                const shouldAdvance = distanceToPlayer > enemy.fireRange * 0.82;
                const movedRangedEnemy = {
                    ...enemy,
                    x: shouldAdvance
                        ? clamp(enemy.x + toPlayer.x * enemy.baseSpeed * (deltaMs / 1000), RANGED_ENEMY_RADIUS, FIELD_SIZE - RANGED_ENEMY_RADIUS)
                        : enemy.x,
                    y: shouldAdvance
                        ? clamp(enemy.y + toPlayer.y * enemy.baseSpeed * (deltaMs / 1000), RANGED_ENEMY_RADIUS, FIELD_SIZE - RANGED_ENEMY_RADIUS)
                        : enemy.y,
                    cooldownMs: Math.max(0, enemy.cooldownMs - deltaMs),
                };
                let nextRangedEnemy = {
                    ...movedRangedEnemy,
                    ...moveCircleWithObstacleSlide(
                        { x: enemy.x, y: enemy.y },
                        movedRangedEnemy,
                        nextPosition,
                        RANGED_ENEMY_RADIUS,
                        activeObstacleSet,
                        OBSTACLE_ENEMY_PADDING
                    ),
                };
                nextRangedEnemy = {
                    ...nextRangedEnemy,
                    ...resolveCircleCircleSeparation(nextRangedEnemy, nextRangedEnemy.contactRadius, nextPosition, PLAYER_RADIUS),
                };

                const hpBeforeOrbitHit = nextRangedEnemy.hp;
                nextRangedEnemy = applyOrbitContactDamage(
                    nextRangedEnemy,
                    RANGED_ORBIT_HIT_RADIUS_BY_TYPE[nextRangedEnemy.enemyType],
                    orbitPositionsNow,
                    orbitDamageRef.current,
                    orbitCritMultiplierRef.current
                );
                if (nextRangedEnemy.hp < hpBeforeOrbitHit) {
                    playQuietOrbHitSynth(0.3, 90);
                }

                if (nextRangedEnemy.hp <= 0) {
                    addDropsForDefeat({
                        x: nextRangedEnemy.x,
                        y: nextRangedEnemy.y,
                        enemyLevel: 2,
                        dropCount: nextRangedEnemy.enemyType === 'heavyCaster' ? 2 : 1,
                        xpValue: nextRangedEnemy.xpValue,
                    });
                    registerEnemyDefeat();
                    continue;
                }

                if (distanceToPlayerSq <= (nextRangedEnemy.fireRange * nextRangedEnemy.fireRange) && nextRangedEnemy.cooldownMs <= 0) {
                    const projectileDx = nextPosition.x - nextRangedEnemy.x;
                    const projectileDy = nextPosition.y - nextRangedEnemy.y;
                    const projectileDistance = Math.sqrt((projectileDx * projectileDx) + (projectileDy * projectileDy)) || 1;
                    const projectileDirection = {
                        x: projectileDx / projectileDistance,
                        y: projectileDy / projectileDistance,
                    };
                    projectilesRef.current = [
                        ...projectilesRef.current,
                        {
                            id: nextProjectileIdRef.current,
                            x: nextRangedEnemy.x,
                            y: nextRangedEnemy.y,
                            vx: projectileDirection.x * nextRangedEnemy.projectileSpeed,
                            vy: projectileDirection.y * nextRangedEnemy.projectileSpeed,
                            damage: nextRangedEnemy.projectileDamage,
                        },
                    ];
                    nextProjectileIdRef.current += 1;
                    nextRangedEnemy = { ...nextRangedEnemy, cooldownMs: nextRangedEnemy.fireCooldownMs };
                }

                nextRangedEnemies.push(nextRangedEnemy);
            }

            rangedEnemiesRef.current = nextRangedEnemies;
        };

        const updateEliteEnemyLoop = ({
            activeObstacleSet,
            addDropsForDefeat,
            applyPlayerDamage,
            deltaMs,
            elapsedMs,
            nextPosition,
            orbitPositionsNow,
            registerEnemyDefeat,
        }: {
            activeObstacleSet: Obstacle[];
            addDropsForDefeat: (params: { x: number; y: number; enemyLevel: number; dropCount: number; xpValue: number }) => void;
            applyPlayerDamage: (rawDamage: number, lastDamageRef: React.MutableRefObject<number>) => boolean;
            deltaMs: number;
            elapsedMs: number;
            nextPosition: Vector2;
            orbitPositionsNow: Vector2[];
            registerEnemyDefeat: () => void;
        }) => {
            if (!eliteEnemyRef.current) return;

            const currentElite = eliteEnemyRef.current;
            const toPlayer = normalizeVector({ x: nextPosition.x - currentElite.x, y: nextPosition.y - currentElite.y });
            const usesDashPattern = currentElite.enemyType !== 'weaver';
            const isDashing = usesDashPattern && currentElite.dashUntilMs !== null && elapsedMs < currentElite.dashUntilMs;
            const isInWindup = usesDashPattern && currentElite.dashWindupUntilMs !== null && elapsedMs < currentElite.dashWindupUntilMs;
            const canStartDash = usesDashPattern
                && currentElite.dashWindupUntilMs === null
                && currentElite.dashUntilMs === null
                && !isDashing
                && !isInWindup
                && elapsedMs >= currentElite.nextDashReadyAtMs;
            let dashDirection = {
                x: currentElite.dashDirectionX,
                y: currentElite.dashDirectionY,
            };
            let dashWindupUntilMs = currentElite.dashWindupUntilMs;
            let dashUntilMs = currentElite.dashUntilMs;
            let nextDashReadyAtMs = currentElite.nextDashReadyAtMs;
            let lastWebShotAtMs = currentElite.lastWebShotAtMs;

            if (canStartDash) {
                dashDirection = toPlayer;
                dashWindupUntilMs = elapsedMs + currentElite.dashWindupMs;
            } else if (
                currentElite.dashWindupUntilMs !== null
                && elapsedMs >= currentElite.dashWindupUntilMs
                && currentElite.dashUntilMs === null
            ) {
                dashUntilMs = elapsedMs + currentElite.dashDurationMs;
                dashWindupUntilMs = null;
                dashDirection = currentElite.dashDirectionX === 0 && currentElite.dashDirectionY === 0 ? toPlayer : dashDirection;
            } else if (usesDashPattern && currentElite.dashUntilMs !== null && elapsedMs >= currentElite.dashUntilMs) {
                dashUntilMs = null;
                const dashCooldownRange = Math.max(1, currentElite.dashCooldownMaxMs - currentElite.dashCooldownMinMs);
                nextDashReadyAtMs = elapsedMs + currentElite.dashCooldownMinMs + ((currentElite.id * 97 + Math.floor(elapsedMs)) % dashCooldownRange);
                dashDirection = { x: 0, y: 0 };
            }

            const nextIsDashing = dashUntilMs !== null && elapsedMs < dashUntilMs;
            const nextIsInWindup = dashWindupUntilMs !== null && elapsedMs < dashWindupUntilMs;
            const movementVector = getEliteMovementVector({
                dashDirection,
                dashDurationMs: currentElite.dashDurationMs,
                dashUntilMs,
                elapsedMs,
                enemyType: currentElite.enemyType,
                isDashing: nextIsDashing,
                isInWindup: nextIsInWindup,
                toPlayer,
                unitId: currentElite.id,
            });
            const moveSpeed = currentElite.enemyType === 'weaver'
                ? currentElite.baseSpeed
                : nextIsDashing
                    ? currentElite.baseSpeed * currentElite.dashSpeedMultiplier
                    : nextIsInWindup
                        ? 0
                        : currentElite.baseSpeed;
            const movedElite = {
                ...currentElite,
                x: clamp(currentElite.x + movementVector.x * moveSpeed * (deltaMs / 1000), ELITE_RADIUS, FIELD_SIZE - ELITE_RADIUS),
                y: clamp(currentElite.y + movementVector.y * moveSpeed * (deltaMs / 1000), ELITE_RADIUS, FIELD_SIZE - ELITE_RADIUS),
                dashDirectionX: dashDirection.x,
                dashDirectionY: dashDirection.y,
                dashWindupUntilMs,
                dashUntilMs,
                nextDashReadyAtMs,
                lastWebShotAtMs,
            };
            let nextElite = {
                ...movedElite,
                ...moveCircleWithObstacleSlide(
                    { x: currentElite.x, y: currentElite.y },
                    movedElite,
                    nextPosition,
                    ELITE_RADIUS,
                    activeObstacleSet,
                    OBSTACLE_ENEMY_PADDING
                ),
            };
            const intendedMoveDistance = Math.hypot(movedElite.x - currentElite.x, movedElite.y - currentElite.y);
            nextElite = {
                ...nextElite,
                ...resolveCircleCircleSeparation(nextElite, nextElite.contactRadius, nextPosition, PLAYER_RADIUS),
            };
            const actualMoveDistance = Math.hypot(nextElite.x - currentElite.x, nextElite.y - currentElite.y);
            if (
                nextIsDashing
                && intendedMoveDistance > 0
                && actualMoveDistance < intendedMoveDistance * 0.58
            ) {
                const dashCooldownRange = Math.max(1, currentElite.dashCooldownMaxMs - currentElite.dashCooldownMinMs);
                nextDashReadyAtMs = elapsedMs + currentElite.dashCooldownMinMs + ((currentElite.id * 97 + Math.floor(elapsedMs)) % dashCooldownRange);
                nextElite = {
                    ...nextElite,
                    dashUntilMs: null,
                    dashDirectionX: 0,
                    dashDirectionY: 0,
                    nextDashReadyAtMs,
                    lastWebShotAtMs,
                };
            }
            if (
                currentElite.enemyType === 'weaver'
                && elapsedMs - lastWebShotAtMs >= WEB_SHOT_INTERVAL_MS
            ) {
                const baseAngle = Math.atan2(toPlayer.y, toPlayer.x);
                const offsetAngle = ((currentElite.id + Math.floor(elapsedMs / 280)) % 5 - 2) * 0.42;
                const shotAngle = baseAngle + offsetAngle;
                const shotDistance = WEB_SHOT_MIN_DISTANCE + (((currentElite.id * 29) + Math.floor(elapsedMs / 10)) % (WEB_SHOT_MAX_DISTANCE - WEB_SHOT_MIN_DISTANCE + 1));
                const webTarget = resolveCircleObstacleCollisions(
                    {
                        x: clamp(nextElite.x + (Math.cos(shotAngle) * shotDistance), WEB_ZONE_RADIUS, FIELD_SIZE - WEB_ZONE_RADIUS),
                        y: clamp(nextElite.y + (Math.sin(shotAngle) * shotDistance), WEB_ZONE_RADIUS, FIELD_SIZE - WEB_ZONE_RADIUS),
                    },
                    18,
                    activeObstacleSet,
                    4
                );
                bombStrikesRef.current = bombStrikesRef.current.concat({
                    id: nextBombStrikeIdRef.current,
                    strikeKind: 'web',
                    sourceX: nextElite.x,
                    sourceY: nextElite.y,
                    targetX: webTarget.x,
                    targetY: webTarget.y,
                    createdAtMs: elapsedMs,
                    landAtMs: elapsedMs + 420,
                    triggerAtMs: elapsedMs + 420,
                });
                nextBombStrikeIdRef.current += 1;
                lastWebShotAtMs = elapsedMs;
            }
            const eliteDeltaX = nextElite.x - currentElite.x;
            const eliteDeltaY = nextElite.y - currentElite.y;
            const renderAngleDeg = currentElite.enemyType === 'weaver'
                ? Math.atan2(eliteDeltaY, eliteDeltaX) * (180 / Math.PI) + 90
                : 0;
            nextElite = {
                ...nextElite,
                lastWebShotAtMs,
                renderAngleDeg: Number.isFinite(renderAngleDeg) ? renderAngleDeg : currentElite.renderAngleDeg,
                facing: eliteDeltaX < -0.01
                    ? 'left'
                    : eliteDeltaX > 0.01
                        ? 'right'
                        : currentElite.facing,
            };

            const hpBeforeOrbitHit = nextElite.hp;
            nextElite = applyOrbitContactDamage(
                nextElite,
                ELITE_ORBIT_HIT_RADIUS_BY_TYPE[nextElite.enemyType],
                orbitPositionsNow,
                orbitDamageRef.current,
                orbitCritMultiplierRef.current
            );
            if (nextElite.hp < hpBeforeOrbitHit) {
                playQuietOrbHitSynth(0.34, 90);
            }

            if (isWithinRadius(nextElite.x, nextElite.y, nextPosition.x, nextPosition.y, nextElite.contactRadius + PLAYER_RADIUS)) {
                applyPlayerDamage(nextElite.contactDamage, lastEliteContactDamageTimeRef);
            }

            if (nextElite.hp <= 0) {
                addDropsForDefeat({
                    x: nextElite.x,
                    y: nextElite.y,
                    enemyLevel: 4,
                    dropCount: 5,
                    xpValue: nextElite.xpValue,
                });
                registerEnemyDefeat();
                eliteEnemyRef.current = null;
                return;
            }

            eliteEnemyRef.current = nextElite;
        };

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
            if (
                nextWaveAdvanceAtMsRef.current !== null
                && elapsedMs >= nextWaveAdvanceAtMsRef.current
            ) {
                nextWaveAdvanceAtMsRef.current = null;
                waveIndexRef.current = Math.min(MAX_WAVE, waveIndexRef.current + 1);
                waveKillCountRef.current = 0;
                waveTargetKillCountRef.current = getWaveTargetKillCount(waveIndexRef.current);
                lastSpawnTimeRef.current = elapsedMs;
                lastRangedSpawnTimeRef.current = elapsedMs;
            }

            const waveIndex = waveIndexRef.current;
            const isWaveTransitioning = nextWaveAdvanceAtMsRef.current !== null;
            const waveVisualTier = getWaveVisualTier(waveIndex);
            if (waveIndex !== lastObstacleWaveRef.current) {
                lastObstacleWaveRef.current = waveIndex;
                activeObstaclesRef.current = getActiveObstacles(waveIndex);
                obstacleSlotsRef.current = getObstacleSlotsForWave(waveIndex);
                setActiveObstacles(activeObstaclesRef.current);
                setObstacleSlots(obstacleSlotsRef.current);
            }
            const activeObstacleSet = activeObstaclesRef.current;
            const enemySpawnInterval = getEnemySpawnInterval(waveIndex);
            const enemyMaxCount = getEnemyMaxCount(waveIndex);
            const enemySpeedBonus = getEnemySpeedBonus(waveIndex);
            const rangedSpawnChance = getRangedSpawnChance(waveIndex);
            const rangedMaxCount = getRangedMaxCount(waveIndex);
            const eliteSpawnChance = getEliteSpawnChance(waveIndex);

            const showAnnouncement = (
                title: string,
                detail: string,
                tone: JelloKnightAnnouncement['tone']
            ) => {
                announcementExpiresAtRef.current = elapsedMs + ANNOUNCEMENT_DURATION_MS;
                setAnnouncement({
                    id: nextAnnouncementIdRef.current,
                    title,
                    detail,
                    tone,
                });
                nextAnnouncementIdRef.current += 1;
            };

            const triggerDamageFlash = () => {
                damageFlashUntilRef.current = elapsedMs + DAMAGE_FLASH_DURATION_MS;
            };

            const registerEnemyDefeat = () => {
                if (nextWaveAdvanceAtMsRef.current !== null || waveIndexRef.current >= MAX_WAVE) return;

                waveKillCountRef.current += 1;
                if (waveKillCountRef.current >= waveTargetKillCountRef.current) {
                    nextWaveAdvanceAtMsRef.current = elapsedMs + WAVE_TRANSITION_DELAY_MS;
                }
            };

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

            updateAnnouncementsAndEffects({
                elapsedMs,
                waveIndex,
                showAnnouncement,
            });

            const keyboardVector = normalizeVector({
                x: (keyboardInputRef.current.right ? 1 : 0) - (keyboardInputRef.current.left ? 1 : 0),
                y: (keyboardInputRef.current.down ? 1 : 0) - (keyboardInputRef.current.up ? 1 : 0),
            });
            const joystickStrength = Math.min(1, getVectorLength(joystickInputRef.current));
            const combinedVector = normalizeVector({
                x: keyboardVector.x + joystickInputRef.current.x,
                y: keyboardVector.y + joystickInputRef.current.y,
            });
            const activeStrength = Math.max(getVectorLength(keyboardVector), joystickStrength);
            const hasMovementInput = activeStrength > 0.08;
            const currentPosition = playerPositionRef.current;
            const touchedWebZone = webZonesRef.current.some((webZone) => (
                isWithinRadius(currentPosition.x, currentPosition.y, webZone.x, webZone.y, webZone.radius + (PLAYER_RADIUS * 0.15))
            ));
            if (touchedWebZone) {
                playerWebSlowUntilMsRef.current = elapsedMs + WEB_ZONE_TOUCH_DEBUFF_MS;
            }
            const webSlowMultiplier = elapsedMs < playerWebSlowUntilMsRef.current
                ? WEB_ZONE_TOUCH_SLOW_MULTIPLIER
                : 1;
            const moveSpeed = hasMovementInput ? playerMoveSpeedRef.current * webSlowMultiplier : 0;
            const movedPosition = moveSpeed <= 0
                ? currentPosition
                : {
                    x: clamp(currentPosition.x + combinedVector.x * moveSpeed * (deltaMs / 1000), PLAYER_RADIUS, FIELD_SIZE - PLAYER_RADIUS),
                    y: clamp(currentPosition.y + combinedVector.y * moveSpeed * (deltaMs / 1000), PLAYER_RADIUS, FIELD_SIZE - PLAYER_RADIUS),
                };
            const nextPosition = resolveCircleObstacleCollisions(
                movedPosition,
                PLAYER_RADIUS,
                activeObstacleSet,
                OBSTACLE_PLAYER_PADDING
            );

            playerPositionRef.current = nextPosition;

            trySpawnEnemiesAndBombs({
                activeObstacleSet,
                elapsedMs,
                eliteSpawnChance,
                enemyMaxCount,
                enemySpawnInterval,
                nextPosition,
                rangedMaxCount,
                rangedSpawnChance,
                showAnnouncement,
                isWaveTransitioning,
                waveIndex,
            });

            const baseOrbitAngle = (elapsedMs / 1000) * orbitSpeedRef.current * Math.PI * 2;
            const orbitPositionsNow: Vector2[] = [];
            for (let index = 0; index < orbitCountRef.current; index += 1) {
                const orbitAngle = baseOrbitAngle + ((Math.PI * 2 * index) / orbitCountRef.current);
                orbitPositionsNow.push({
                    x: nextPosition.x + Math.cos(orbitAngle) * orbitRadiusRef.current,
                    y: nextPosition.y + Math.sin(orbitAngle) * orbitRadiusRef.current,
                });
            }

            let shouldRefreshPickups = false;
            const pendingPickupDrops: XpPickup[] = [];
            let pendingNextPickupId = nextPickupIdRef.current;

            const addDropsForDefeat = ({
                x,
                y,
                enemyLevel,
                dropCount,
                xpValue,
            }: {
                x: number;
                y: number;
                enemyLevel: number;
                dropCount: number;
                xpValue: number;
            }) => {
                const { drops, nextId } = createDropsForDefeat({
                    originX: x,
                    originY: y,
                    startId: pendingNextPickupId,
                    enemyLevel,
                    dropCount,
                    spawnedAtMs: elapsedMs,
                    xpValue,
                });
                if (drops.length > 0) {
                    pendingPickupDrops.push(...drops);
                }
                pendingNextPickupId = nextId;
            };

            const survivingWebZones: WebZone[] = [];
            let webZoneHit = false;
            for (const webZone of webZonesRef.current) {
                const webHitRadius = Math.min(34, webZone.radius * 0.44);
                const orbTouchesWeb = orbitPositionsNow.some((orbitPosition) => (
                    isWithinRadius(orbitPosition.x, orbitPosition.y, webZone.x, webZone.y, webHitRadius)
                ));
                if (
                    orbTouchesWeb
                    && elapsedMs - webZone.lastOrbHitAtMs >= WEB_ZONE_ORBIT_HIT_COOLDOWN_MS
                ) {
                    const nextWebZone = {
                        ...webZone,
                        hp: webZone.hp - orbitDamageRef.current,
                        lastOrbHitAtMs: elapsedMs,
                    };
                    webZoneHit = true;
                    if (nextWebZone.hp > 0) {
                        survivingWebZones.push(nextWebZone);
                    }
                    continue;
                }
                survivingWebZones.push(webZone);
            }
            if (webZoneHit) {
                playQuietOrbHitSynth(0.24, 120);
            }
            webZonesRef.current = survivingWebZones;

            updateChaserEnemiesLoop({
                activeObstacleSet,
                addDropsForDefeat,
                applyPlayerDamage,
                deltaMs,
                enemySpeedBonus,
                nextPosition,
                orbitPositionsNow,
                registerEnemyDefeat,
            });

            updateRangedEnemiesLoop({
                activeObstacleSet,
                addDropsForDefeat,
                deltaMs,
                nextPosition,
                orbitPositionsNow,
                registerEnemyDefeat,
            });

            updateEliteEnemyLoop({
                activeObstacleSet,
                addDropsForDefeat,
                applyPlayerDamage,
                deltaMs,
                elapsedMs,
                nextPosition,
                orbitPositionsNow,
                registerEnemyDefeat,
            });

            const readyBombs: BombStrike[] = [];
            const pendingBombs: BombStrike[] = [];
            for (const bombStrike of bombStrikesRef.current) {
                if (bombStrike.triggerAtMs <= elapsedMs) {
                    readyBombs.push(bombStrike);
                } else {
                    pendingBombs.push(bombStrike);
                }
            }
            if (readyBombs.length > 0) {
                bombStrikesRef.current = pendingBombs;

                readyBombs.forEach((bombStrike) => {
                    if (bombStrike.strikeKind === 'web') {
                        addWebZoneAt(bombStrike.targetX, bombStrike.targetY);
                        return;
                    }

                    const applyBombDamage = <T extends { x: number; y: number; hp: number }>(target: T, radius: number) => {
                        if (!isWithinRadius(target.x, target.y, bombStrike.targetX, bombStrike.targetY, radius)) return target;
                        const bombDamageAmount = bombDamageRef.current * (
                            Math.random() <= BOMB_CRIT_CHANCE ? bombCritMultiplierRef.current : 1
                        );
                        return { ...target, hp: target.hp - bombDamageAmount };
                    };

                    bombBlastsRef.current = bombBlastsRef.current.concat({
                        id: bombStrike.id,
                        x: bombStrike.targetX,
                        y: bombStrike.targetY,
                        radius: bombRadiusRef.current,
                        expiresAtMs: elapsedMs + BOMB_BLAST_VISUAL_MS,
                    });
                    playBombExplodeSynth(0.58, 110);

                    const survivingEnemies: ChaserEnemy[] = [];
                    for (const enemy of enemiesRef.current) {
                        const nextEnemy = applyBombDamage(enemy, bombRadiusRef.current);
                        if (nextEnemy.hp <= 0) {
                            addDropsForDefeat({
                                x: enemy.x,
                                y: enemy.y,
                                enemyLevel: 1,
                                dropCount: enemy.enemyType === 'heavy' ? 2 : 1,
                                xpValue: XP_PICKUP_VALUE,
                            });
                            registerEnemyDefeat();
                            continue;
                        }
                        survivingEnemies.push(nextEnemy);
                    }
                    enemiesRef.current = survivingEnemies;

                    const survivingRangedEnemies: RangedEnemy[] = [];
                    for (const enemy of rangedEnemiesRef.current) {
                        const nextEnemy = applyBombDamage(enemy, bombRadiusRef.current);
                        if (nextEnemy.hp <= 0) {
                            addDropsForDefeat({
                                x: enemy.x,
                                y: enemy.y,
                                enemyLevel: 2,
                                dropCount: enemy.enemyType === 'heavyCaster' ? 2 : 1,
                                xpValue: enemy.xpValue,
                            });
                            registerEnemyDefeat();
                            continue;
                        }
                        survivingRangedEnemies.push(nextEnemy);
                    }
                    rangedEnemiesRef.current = survivingRangedEnemies;

                    if (eliteEnemyRef.current) {
                        const nextElite = applyBombDamage(eliteEnemyRef.current, bombRadiusRef.current);
                        if (nextElite.hp <= 0) {
                            addDropsForDefeat({
                                x: eliteEnemyRef.current.x,
                                y: eliteEnemyRef.current.y,
                                enemyLevel: 4,
                                dropCount: 5,
                                xpValue: eliteEnemyRef.current.xpValue,
                            });
                            registerEnemyDefeat();
                            eliteEnemyRef.current = null;
                        } else {
                            eliteEnemyRef.current = nextElite;
                        }
                    }
                });
            }

            if (pendingPickupDrops.length > 0) {
                nextPickupIdRef.current = pendingNextPickupId;
                xpPickupsRef.current = xpPickupsRef.current.concat(pendingPickupDrops);
                shouldRefreshPickups = true;
            }

            const nextProjectiles: EnemyProjectile[] = [];
            for (const projectile of projectilesRef.current) {
                const movedProjectile = {
                    ...projectile,
                    x: projectile.x + projectile.vx * (deltaMs / 1000),
                    y: projectile.y + projectile.vy * (deltaMs / 1000),
                };

                if (
                    movedProjectile.x < -40
                    || movedProjectile.y < -40
                    || movedProjectile.x > FIELD_SIZE + 40
                    || movedProjectile.y > FIELD_SIZE + 40
                ) {
                    continue;
                }

                const hitsObstacle = isPointInsideAnyObstacle(
                    movedProjectile.x,
                    movedProjectile.y,
                    activeObstacleSet
                );
                if (hitsObstacle) continue;

                if (
                    isWithinRadius(
                        movedProjectile.x,
                        movedProjectile.y,
                        nextPosition.x,
                        nextPosition.y,
                        ENEMY_PROJECTILE_RADIUS + PLAYER_RADIUS - 10
                    )
                ) {
                    applyPlayerDamage(movedProjectile.damage, lastProjectileDamageTimeRef, 'quiet-orb');
                    continue;
                }

                nextProjectiles.push(movedProjectile);
            }
            projectilesRef.current = nextProjectiles;

            const remainingPickups: XpPickup[] = [];
            let collectedPickupThisFrame = false;
            for (const pickup of xpPickupsRef.current) {
                if (elapsedMs - pickup.spawnedAtMs < PICKUP_SPAWN_GRACE_MS) {
                    remainingPickups.push(pickup);
                    continue;
                }

                if (!isWithinRadius(pickup.x, pickup.y, nextPosition.x, nextPosition.y, PICKUP_COLLECT_RADIUS)) {
                    remainingPickups.push(pickup);
                    continue;
                }

                currentXpRef.current += pickup.value;
                scoreRef.current += pickup.scoreValue;
                if (pickup.pickupKind === 'heart') {
                    hpRef.current = Math.min(playerMaxHpRef.current, hpRef.current + (pickup.healValue ?? 0));
                }
                collectedPickupThisFrame = true;
                shouldRefreshPickups = true;
            }
            xpPickupsRef.current = remainingPickups;
            if (collectedPickupThisFrame) {
                playEatingSound(0.4);
            }

            let leveledUp = false;
            const xpToNextLevel = getXpToNextLevel(levelRef.current);
            if (currentXpRef.current >= xpToNextLevel) {
                currentXpRef.current -= xpToNextLevel;
                levelRef.current += 1;
                leveledUp = true;
                setUpgradeOptions(
                    buildUpgradeOptions(
                        upgradeLevelsRef.current,
                        bombUnlockedRef.current,
                        levelRef.current,
                        gt
                    )
                );
            }

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
            setBombUnlocked,
            setOrbitDamage,
            setOrbitRadius,
            setOrbitSpeed,
            setPlayerMaxHp,
            setUpgradeLevels,
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
