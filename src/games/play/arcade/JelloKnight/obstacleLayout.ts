import { CASTLE_OBSTACLE, DEBUG_OBSTACLE_SLOTS_ENABLED, OBSTACLE_SLOT_SET } from './constants';
import { getWaveObstaclePhase, getWaveRuntimeConfig } from './waveConfig';
import type { Obstacle, ObstacleSlot } from './types';

type ObstacleFace = 'north' | 'east' | 'south' | 'west';

const activeObstaclesByWaveCache = new Map<number, Obstacle[]>();
const obstacleSlotsByLayoutCache = new Map<string, ObstacleSlot[]>();

const OBSTACLE_FACES: ObstacleFace[] = ['north', 'east', 'south', 'west'];

const INNER_CORNER_SLOT_IDS = ['slot-top-left', 'slot-top-right', 'slot-bottom-left', 'slot-bottom-right'] as const;
const INNER_FACE_SLOT_IDS: Record<ObstacleFace, readonly string[]> = {
    north: ['slot-top-center-small'],
    east: ['slot-right-upper', 'slot-right-lower'],
    south: ['slot-bottom-center-small'],
    west: ['slot-left-upper', 'slot-left-lower'],
};
const OUTER_CORNER_SLOT_IDS = ['slot-outer-northwest', 'slot-outer-northeast', 'slot-outer-southwest', 'slot-outer-southeast'] as const;
const OUTER_FACE_SLOT_IDS: Record<ObstacleFace, readonly string[]> = {
    north: ['slot-outer-north-main', 'slot-outer-north-short'],
    east: ['slot-outer-east-short', 'slot-outer-east-main'],
    south: ['slot-outer-south-short', 'slot-outer-south-main'],
    west: ['slot-outer-west-main', 'slot-outer-west-short'],
};

const seededUnit = (seed: number) => {
    const value = Math.sin(seed * 12.9898) * 43758.5453;
    return value - Math.floor(value);
};

const createWaveShuffle = <T,>(items: T[], seed: number) => {
    const list = [...items];
    for (let index = list.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(seededUnit(seed + (index * 1.17)) * (index + 1));
        const current = list[index];
        list[index] = list[swapIndex];
        list[swapIndex] = current;
    }
    return list;
};

const OBSTACLE_SLOT_LOOKUP = new Map(OBSTACLE_SLOT_SET.map((slot) => [slot.id, slot]));

const getObstacleLayoutSeed = (waveIndex: number) => {
    const { setIndex, setWaveIndex } = getWaveRuntimeConfig(waveIndex);
    return (setIndex * 10) + Math.ceil(setWaveIndex / 2);
};

const getOpenedFacesForWave = (waveIndex: number, family: 'inner' | 'outer') => createWaveShuffle(
    OBSTACLE_FACES,
    (getObstacleLayoutSeed(waveIndex) * (family === 'inner' ? 17.13 : 41.27))
).slice(0, 3);

const collectObstacleSlots = (slotIds: readonly string[]) => slotIds
    .map((slotId) => OBSTACLE_SLOT_LOOKUP.get(slotId))
    .filter((slot): slot is ObstacleSlot => Boolean(slot));

const collectObstacleFaceSlots = (
    slotGroups: Record<ObstacleFace, readonly string[]>,
    faces: ObstacleFace[]
) => faces.flatMap((face) => collectObstacleSlots(slotGroups[face]));

const getObstacleCandidateSlotsForWave = (waveIndex: number) => {
    const phase = getWaveObstaclePhase(waveIndex);
    const layoutSeed = getObstacleLayoutSeed(waveIndex);
    const cacheKey = `phase-${phase}-layout-${layoutSeed}`;
    const cachedSlots = obstacleSlotsByLayoutCache.get(cacheKey);
    if (cachedSlots) return cachedSlots;

    const activeSlots: ObstacleSlot[] = [];
    activeSlots.push(...collectObstacleSlots(INNER_CORNER_SLOT_IDS));

    if (phase >= 2) {
        activeSlots.push(...collectObstacleFaceSlots(INNER_FACE_SLOT_IDS, getOpenedFacesForWave(waveIndex, 'inner')));
    }
    if (phase >= 3) {
        activeSlots.push(...collectObstacleSlots(OUTER_CORNER_SLOT_IDS));
    }
    if (phase >= 4) {
        activeSlots.push(...collectObstacleFaceSlots(OUTER_FACE_SLOT_IDS, getOpenedFacesForWave(waveIndex, 'outer')));
    }

    obstacleSlotsByLayoutCache.set(cacheKey, activeSlots);
    return activeSlots;
};

export const getObstacleSlotsForWave = (waveIndex: number): ObstacleSlot[] => {
    if (DEBUG_OBSTACLE_SLOTS_ENABLED) return OBSTACLE_SLOT_SET;
    return getObstacleCandidateSlotsForWave(waveIndex);
};

export const getActiveObstacles = (waveIndex: number): Obstacle[] => {
    const cachedObstacles = activeObstaclesByWaveCache.get(waveIndex);
    if (cachedObstacles) return cachedObstacles;

    const availableSlots = getObstacleCandidateSlotsForWave(waveIndex);
    if (availableSlots.length === 0) {
        const fallbackObstacles = [CASTLE_OBSTACLE];
        activeObstaclesByWaveCache.set(waveIndex, fallbackObstacles);
        return fallbackObstacles;
    }

    const activeObstacles = availableSlots.map((slot) => ({
        id: `wave-${waveIndex}-${slot.id}`,
        x: slot.x,
        y: slot.y,
        width: slot.width,
        height: slot.height,
        stageRequired: slot.stageRequired,
    }));
    const obstacleSet = [CASTLE_OBSTACLE, ...activeObstacles];
    activeObstaclesByWaveCache.set(waveIndex, obstacleSet);
    return obstacleSet;
};

export const isPointInsideObstacle = (
    pointX: number,
    pointY: number,
    obstacle: Pick<Obstacle, 'x' | 'y' | 'width' | 'height'>
) => (
    pointX >= obstacle.x
    && pointX <= obstacle.x + obstacle.width
    && pointY >= obstacle.y
    && pointY <= obstacle.y + obstacle.height
);

export const isPointInsideAnyObstacle = (
    pointX: number,
    pointY: number,
    obstacles: Obstacle[]
) => obstacles.some((obstacle) => isPointInsideObstacle(pointX, pointY, obstacle));
