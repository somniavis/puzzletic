import {
    FIELD_CASTLE_SPAWN_ZONES,
    FIELD_CORNER_SPAWN_ZONES,
    FIELD_OUTER_CORNER_SPAWN_ZONES,
    MAX_WAVE,
} from './constants';
import type { ChaserEnemy, EliteEnemy, RangedEnemy, SpawnZone } from './types';

type MeleeEnemyType = ChaserEnemy['enemyType'];
type RangedEnemyType = RangedEnemy['enemyType'];
type EliteEnemyType = EliteEnemy['enemyType'];
type EnemyGroup = 'melee' | 'ranged' | 'elite';
type WaveObstaclePhase = 1 | 2 | 3 | 4;
type WaveSpawnProfileId =
    | 'basic_mix'
    | 'heavy_lane'
    | 'rush_cross'
    | 'frontline_fire'
    | 'crossfire_plus'
    | 'trex_gate'
    | 'scorpion_gate'
    | 'fortress_crush'
    | 'web_cross'
    | 'climax_hunt';

type WaveTemplate = {
    killTarget: number;
    eliteKillTarget: number;
    meleeSpawnIntervalMs: number;
    meleeMaxCount: number;
    enemySpeedBonus: number;
    rangedSpawnChance: number;
    rangedSpawnIntervalMs: number;
    rangedMaxCount: number;
    eliteSpawnChance: number;
    eliteSpawnIntervalMs: number;
    obstaclePhase: WaveObstaclePhase;
    spawnProfileId: WaveSpawnProfileId;
    meleeWeights: Partial<Record<MeleeEnemyType, number>>;
    rangedWeights: Partial<Record<RangedEnemyType, number>>;
    eliteWeights: Partial<Record<EliteEnemyType, number>>;
};

export type WaveRuntimeConfig = WaveTemplate & {
    waveIndex: number;
    setIndex: number;
    setWaveIndex: number;
};

export type WaveCombatScaling = {
    setIndex: number;
    normalHpMultiplier: number;
    eliteHpMultiplier: number;
    normalContactDamageMultiplier: number;
    rangedProjectileDamageMultiplier: number;
    eliteContactDamageMultiplier: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const SPAWN_ZONE_LOOKUP = new Map<string, SpawnZone>([
    ...FIELD_CASTLE_SPAWN_ZONES,
    ...FIELD_CORNER_SPAWN_ZONES,
    ...FIELD_OUTER_CORNER_SPAWN_ZONES,
].map((zone) => [zone.id, zone]));

const SPAWN_ZONE_ALIAS_GROUPS: Record<string, string[]> = {
    northwest: ['northwest', 'outer-northwest'],
    northeast: ['northeast', 'outer-northeast'],
    southwest: ['southwest', 'outer-southwest'],
    southeast: ['southeast', 'outer-southeast'],
};

const expandZoneIds = (zoneIds: readonly string[]) => zoneIds.flatMap((zoneId) => SPAWN_ZONE_ALIAS_GROUPS[zoneId] ?? [zoneId]);

const getZones = (zoneIds: readonly string[]) => expandZoneIds(zoneIds)
    .map((zoneId) => SPAWN_ZONE_LOOKUP.get(zoneId))
    .filter((zone): zone is SpawnZone => Boolean(zone));

const WAVE_SPAWN_PROFILES: Record<WaveSpawnProfileId, Record<EnemyGroup, SpawnZone[]>> = {
    basic_mix: {
        melee: getZones(['castle-top-center', 'castle-bottom-center']),
        ranged: getZones(['castle-left-center', 'castle-right-center']),
        elite: getZones(['castle-top-center', 'castle-bottom-center']),
    },
    heavy_lane: {
        melee: getZones(['castle-top-center', 'castle-bottom-center', 'castle-left-center', 'castle-right-center']),
        ranged: getZones(['castle-left-center', 'castle-right-center']),
        elite: getZones(['castle-top-center', 'castle-bottom-center']),
    },
    rush_cross: {
        melee: getZones(['northeast', 'southwest', 'castle-left-center', 'castle-right-center']),
        ranged: getZones(['northeast', 'southwest']),
        elite: getZones(['northeast', 'southwest']),
    },
    frontline_fire: {
        melee: getZones(['castle-left-center', 'castle-right-center', 'northwest', 'southeast']),
        ranged: getZones(['northwest', 'southeast']),
        elite: getZones(['northwest', 'southeast']),
    },
    crossfire_plus: {
        melee: getZones(['northwest', 'northeast', 'southwest', 'southeast']),
        ranged: getZones(['northwest', 'southeast', 'northeast', 'southwest']),
        elite: getZones(['northwest', 'southeast']),
    },
    trex_gate: {
        melee: getZones(['castle-bottom-center', 'castle-left-center', 'castle-right-center', 'northwest', 'northeast']),
        ranged: getZones(['northwest', 'northeast']),
        elite: getZones(['castle-top-center', 'castle-bottom-center']),
    },
    scorpion_gate: {
        melee: getZones(['castle-left-center', 'castle-right-center', 'southwest', 'southeast', 'northwest']),
        ranged: getZones(['southwest', 'southeast', 'northwest']),
        elite: getZones(['southwest', 'southeast']),
    },
    fortress_crush: {
        melee: getZones(['northwest', 'northeast', 'southwest', 'southeast', 'castle-bottom-center']),
        ranged: getZones(['northwest', 'northeast', 'southwest', 'southeast']),
        elite: getZones(['northwest', 'northeast', 'southwest', 'southeast']),
    },
    web_cross: {
        melee: getZones(['castle-top-center', 'castle-bottom-center', 'northwest', 'southeast', 'northeast', 'southwest']),
        ranged: getZones(['castle-left-center', 'castle-right-center', 'northwest', 'southeast']),
        elite: getZones(['castle-left-center', 'castle-right-center', 'northwest', 'southeast']),
    },
    climax_hunt: {
        melee: getZones(['castle-top-center', 'castle-bottom-center', 'castle-left-center', 'castle-right-center', 'northwest', 'northeast', 'southwest', 'southeast']),
        ranged: getZones(['castle-left-center', 'castle-right-center', 'northwest', 'northeast', 'southwest', 'southeast']),
        elite: getZones(['castle-top-center', 'castle-bottom-center', 'northwest', 'northeast', 'southwest', 'southeast']),
    },
};

const SET_ONE_WAVE_TEMPLATES: WaveTemplate[] = [
    {
        killTarget: 10,
        eliteKillTarget: 0,
        meleeSpawnIntervalMs: 1180,
        meleeMaxCount: 7,
        enemySpeedBonus: 0,
        rangedSpawnChance: 0,
        rangedSpawnIntervalMs: 0,
        rangedMaxCount: 0,
        eliteSpawnChance: 0,
        eliteSpawnIntervalMs: 0,
        obstaclePhase: 1,
        spawnProfileId: 'basic_mix',
        meleeWeights: { standard: 58, swift: 42 },
        rangedWeights: {},
        eliteWeights: {},
    },
    {
        killTarget: 14,
        eliteKillTarget: 0,
        meleeSpawnIntervalMs: 1100,
        meleeMaxCount: 8,
        enemySpeedBonus: 1,
        rangedSpawnChance: 0,
        rangedSpawnIntervalMs: 0,
        rangedMaxCount: 0,
        eliteSpawnChance: 0,
        eliteSpawnIntervalMs: 0,
        obstaclePhase: 1,
        spawnProfileId: 'heavy_lane',
        meleeWeights: { standard: 44, swift: 20, heavy: 36 },
        rangedWeights: {},
        eliteWeights: {},
    },
    {
        killTarget: 18,
        eliteKillTarget: 0,
        meleeSpawnIntervalMs: 1020,
        meleeMaxCount: 9,
        enemySpeedBonus: 2,
        rangedSpawnChance: 0.42,
        rangedSpawnIntervalMs: 5200,
        rangedMaxCount: 1,
        eliteSpawnChance: 0,
        eliteSpawnIntervalMs: 0,
        obstaclePhase: 2,
        spawnProfileId: 'rush_cross',
        meleeWeights: { swift: 46, pumpkin: 34, standard: 20 },
        rangedWeights: { sniper: 100 },
        eliteWeights: {},
    },
    {
        killTarget: 22,
        eliteKillTarget: 0,
        meleeSpawnIntervalMs: 960,
        meleeMaxCount: 10,
        enemySpeedBonus: 3,
        rangedSpawnChance: 0.58,
        rangedSpawnIntervalMs: 4200,
        rangedMaxCount: 2,
        eliteSpawnChance: 0,
        eliteSpawnIntervalMs: 0,
        obstaclePhase: 2,
        spawnProfileId: 'frontline_fire',
        meleeWeights: { heavy: 36, standard: 34, pumpkin: 18, swift: 12 },
        rangedWeights: { sniper: 100 },
        eliteWeights: {},
    },
    {
        killTarget: 27,
        eliteKillTarget: 0,
        meleeSpawnIntervalMs: 900,
        meleeMaxCount: 11,
        enemySpeedBonus: 4,
        rangedSpawnChance: 0.82,
        rangedSpawnIntervalMs: 3400,
        rangedMaxCount: 2,
        eliteSpawnChance: 0,
        eliteSpawnIntervalMs: 0,
        obstaclePhase: 2,
        spawnProfileId: 'crossfire_plus',
        meleeWeights: { swift: 30, heavy: 26, pumpkin: 24, standard: 20 },
        rangedWeights: { sniper: 62, heavyCaster: 38 },
        eliteWeights: {},
    },
    {
        killTarget: 31,
        eliteKillTarget: 1,
        meleeSpawnIntervalMs: 860,
        meleeMaxCount: 12,
        enemySpeedBonus: 5,
        rangedSpawnChance: 0.7,
        rangedSpawnIntervalMs: 3200,
        rangedMaxCount: 2,
        eliteSpawnChance: 1,
        eliteSpawnIntervalMs: 6200,
        obstaclePhase: 3,
        spawnProfileId: 'trex_gate',
        meleeWeights: { standard: 34, swift: 28, heavy: 22, pumpkin: 16 },
        rangedWeights: { sniper: 100 },
        eliteWeights: { brute: 100 },
    },
    {
        killTarget: 36,
        eliteKillTarget: 1,
        meleeSpawnIntervalMs: 820,
        meleeMaxCount: 13,
        enemySpeedBonus: 6,
        rangedSpawnChance: 0.8,
        rangedSpawnIntervalMs: 2900,
        rangedMaxCount: 3,
        eliteSpawnChance: 1,
        eliteSpawnIntervalMs: 5600,
        obstaclePhase: 3,
        spawnProfileId: 'scorpion_gate',
        meleeWeights: { pumpkin: 30, heavy: 26, swift: 24, standard: 20 },
        rangedWeights: { sniper: 74, heavyCaster: 26 },
        eliteWeights: { stinger: 100 },
    },
    {
        killTarget: 41,
        eliteKillTarget: 1,
        meleeSpawnIntervalMs: 760,
        meleeMaxCount: 14,
        enemySpeedBonus: 7,
        rangedSpawnChance: 0.9,
        rangedSpawnIntervalMs: 2600,
        rangedMaxCount: 3,
        eliteSpawnChance: 1,
        eliteSpawnIntervalMs: 5200,
        obstaclePhase: 3,
        spawnProfileId: 'fortress_crush',
        meleeWeights: { standard: 24, swift: 24, heavy: 30, pumpkin: 22 },
        rangedWeights: { sniper: 68, heavyCaster: 32 },
        eliteWeights: { brute: 62, stinger: 38 },
    },
    {
        killTarget: 45,
        eliteKillTarget: 1,
        meleeSpawnIntervalMs: 720,
        meleeMaxCount: 15,
        enemySpeedBonus: 8,
        rangedSpawnChance: 0.94,
        rangedSpawnIntervalMs: 2400,
        rangedMaxCount: 4,
        eliteSpawnChance: 1,
        eliteSpawnIntervalMs: 5000,
        obstaclePhase: 4,
        spawnProfileId: 'web_cross',
        meleeWeights: { swift: 28, standard: 24, pumpkin: 26, heavy: 22 },
        rangedWeights: { heavyCaster: 72, sniper: 28 },
        eliteWeights: { weaver: 70, brute: 30 },
    },
    {
        killTarget: 50,
        eliteKillTarget: 1,
        meleeSpawnIntervalMs: 680,
        meleeMaxCount: 16,
        enemySpeedBonus: 9,
        rangedSpawnChance: 1,
        rangedSpawnIntervalMs: 2200,
        rangedMaxCount: 4,
        eliteSpawnChance: 1,
        eliteSpawnIntervalMs: 4700,
        obstaclePhase: 4,
        spawnProfileId: 'climax_hunt',
        meleeWeights: { standard: 22, swift: 24, heavy: 26, pumpkin: 28 },
        rangedWeights: { sniper: 54, heavyCaster: 46 },
        eliteWeights: { brute: 34, stinger: 33, weaver: 33 },
    },
];

const SET_COMBAT_SCALING: Omit<WaveCombatScaling, 'setIndex'>[] = [
    {
        normalHpMultiplier: 1.0,
        eliteHpMultiplier: 1.0,
        normalContactDamageMultiplier: 1.0,
        rangedProjectileDamageMultiplier: 1.0,
        eliteContactDamageMultiplier: 1.0,
    },
    {
        normalHpMultiplier: 1.12,
        eliteHpMultiplier: 1.10,
        normalContactDamageMultiplier: 1.04,
        rangedProjectileDamageMultiplier: 1.04,
        eliteContactDamageMultiplier: 1.03,
    },
    {
        normalHpMultiplier: 1.26,
        eliteHpMultiplier: 1.22,
        normalContactDamageMultiplier: 1.08,
        rangedProjectileDamageMultiplier: 1.08,
        eliteContactDamageMultiplier: 1.06,
    },
    {
        normalHpMultiplier: 1.42,
        eliteHpMultiplier: 1.36,
        normalContactDamageMultiplier: 1.12,
        rangedProjectileDamageMultiplier: 1.12,
        eliteContactDamageMultiplier: 1.10,
    },
    {
        normalHpMultiplier: 1.60,
        eliteHpMultiplier: 1.52,
        normalContactDamageMultiplier: 1.16,
        rangedProjectileDamageMultiplier: 1.16,
        eliteContactDamageMultiplier: 1.14,
    },
    {
        normalHpMultiplier: 1.74,
        eliteHpMultiplier: 1.66,
        normalContactDamageMultiplier: 1.20,
        rangedProjectileDamageMultiplier: 1.20,
        eliteContactDamageMultiplier: 1.18,
    },
    {
        normalHpMultiplier: 1.88,
        eliteHpMultiplier: 1.80,
        normalContactDamageMultiplier: 1.24,
        rangedProjectileDamageMultiplier: 1.24,
        eliteContactDamageMultiplier: 1.22,
    },
    {
        normalHpMultiplier: 2.02,
        eliteHpMultiplier: 1.94,
        normalContactDamageMultiplier: 1.28,
        rangedProjectileDamageMultiplier: 1.28,
        eliteContactDamageMultiplier: 1.26,
    },
    {
        normalHpMultiplier: 2.18,
        eliteHpMultiplier: 2.10,
        normalContactDamageMultiplier: 1.32,
        rangedProjectileDamageMultiplier: 1.32,
        eliteContactDamageMultiplier: 1.30,
    },
    {
        normalHpMultiplier: 2.34,
        eliteHpMultiplier: 2.28,
        normalContactDamageMultiplier: 1.36,
        rangedProjectileDamageMultiplier: 1.36,
        eliteContactDamageMultiplier: 1.34,
    },
] as const;

const pickTemplate = (waveIndex: number) => {
    const clampedWaveIndex = clamp(waveIndex, 1, MAX_WAVE);
    const setWaveIndex = ((clampedWaveIndex - 1) % 10) + 1;
    return {
        clampedWaveIndex,
        setIndex: Math.floor((clampedWaveIndex - 1) / 10) + 1,
        setWaveIndex,
        template: SET_ONE_WAVE_TEMPLATES[setWaveIndex - 1],
    };
};

export const getWaveRuntimeConfig = (waveIndex: number): WaveRuntimeConfig => {
    const {
        clampedWaveIndex,
        setIndex,
        setWaveIndex,
        template,
    } = pickTemplate(waveIndex);
    const setOffset = setIndex - 1;

    return {
        ...template,
        waveIndex: clampedWaveIndex,
        setIndex,
        setWaveIndex,
        killTarget: template.killTarget + (setOffset * 4),
        meleeSpawnIntervalMs: Math.max(420, template.meleeSpawnIntervalMs - (setOffset * 26)),
        meleeMaxCount: template.meleeMaxCount + Math.floor((setOffset + 1) / 2),
        enemySpeedBonus: template.enemySpeedBonus + (setOffset * 2),
        rangedSpawnChance: clamp(template.rangedSpawnChance + (setOffset * 0.025), 0, 1),
        rangedSpawnIntervalMs: template.rangedSpawnIntervalMs > 0
            ? Math.max(1200, template.rangedSpawnIntervalMs - (setOffset * 140))
            : 0,
        rangedMaxCount: template.rangedMaxCount + Math.floor(setOffset / 3),
        eliteSpawnChance: template.eliteSpawnChance > 0
            ? clamp(template.eliteSpawnChance + (setOffset * 0.02), 0, 1)
            : 0,
        eliteSpawnIntervalMs: template.eliteSpawnIntervalMs > 0
            ? Math.max(2600, template.eliteSpawnIntervalMs - (setOffset * 180))
            : 0,
    };
};

export const getWaveTargetKillCount = (waveIndex: number) => getWaveRuntimeConfig(waveIndex).killTarget;

export const getWaveEliteKillTarget = (waveIndex: number) => getWaveRuntimeConfig(waveIndex).eliteKillTarget;

export const getWaveObstaclePhase = (waveIndex: number): WaveObstaclePhase => (
    getWaveRuntimeConfig(waveIndex).obstaclePhase
);

export const getWaveEnemySpawnInterval = (waveIndex: number) => (
    getWaveRuntimeConfig(waveIndex).meleeSpawnIntervalMs
);

export const getWaveEnemyMaxCount = (waveIndex: number) => (
    getWaveRuntimeConfig(waveIndex).meleeMaxCount
);

export const getWaveEnemySpeedBonus = (waveIndex: number) => (
    getWaveRuntimeConfig(waveIndex).enemySpeedBonus
);

export const getWaveRangedSpawnChance = (waveIndex: number) => (
    getWaveRuntimeConfig(waveIndex).rangedSpawnChance
);

export const getWaveRangedSpawnInterval = (waveIndex: number) => (
    getWaveRuntimeConfig(waveIndex).rangedSpawnIntervalMs
);

export const getWaveRangedMaxCount = (waveIndex: number) => (
    getWaveRuntimeConfig(waveIndex).rangedMaxCount
);

export const getWaveEliteSpawnChance = (waveIndex: number) => (
    getWaveRuntimeConfig(waveIndex).eliteSpawnChance
);

export const getWaveEliteSpawnInterval = (waveIndex: number) => (
    getWaveRuntimeConfig(waveIndex).eliteSpawnIntervalMs
);

export const getWaveMeleeWeights = (waveIndex: number): Partial<Record<MeleeEnemyType, number>> => (
    getWaveRuntimeConfig(waveIndex).meleeWeights
);

export const getWaveRangedWeights = (waveIndex: number): Partial<Record<RangedEnemyType, number>> => (
    getWaveRuntimeConfig(waveIndex).rangedWeights
);

export const getWaveEliteWeights = (waveIndex: number): Partial<Record<EliteEnemyType, number>> => (
    getWaveRuntimeConfig(waveIndex).eliteWeights
);

export const getWaveSpawnZones = (
    waveIndex: number,
    enemyGroup: EnemyGroup
) => {
    const config = getWaveRuntimeConfig(waveIndex);
    const zones = WAVE_SPAWN_PROFILES[config.spawnProfileId][enemyGroup];
    return zones.length > 0 ? zones : WAVE_SPAWN_PROFILES.climax_hunt[enemyGroup];
};

export const getWaveCombatScaling = (waveIndex: number): WaveCombatScaling => {
    const { setIndex } = pickTemplate(waveIndex);
    const scaling = SET_COMBAT_SCALING[clamp(setIndex, 1, SET_COMBAT_SCALING.length) - 1];
    return {
        setIndex,
        ...scaling,
    };
};
