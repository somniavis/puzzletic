import { ORBIT_CRIT_CHANCE, ORBIT_SIZE } from './constants';
import type { UpgradeLevels, Vector2 } from './types';

export const createInitialUpgradeLevels = (): UpgradeLevels => ({
    orb_damage: 1,
    orb_count: 1,
    orb_speed: 1,
    orb_radius: 1,
    orb_crit: 1,
    bomb_chance: 1,
    bomb_interval: 1,
    bomb_radius: 1,
    bomb_crit: 1,
    player_hp: 1,
    player_defense: 1,
    player_speed: 1,
});

export const rollOrbitContactDamage = (
    orbitDamage: number,
    orbitCritMultiplier: number
) => orbitDamage * (Math.random() <= ORBIT_CRIT_CHANCE ? orbitCritMultiplier : 1);

export const applyDamageWithDefense = (
    currentHp: number,
    rawDamage: number,
    defenseRate: number
) => Math.max(0, currentHp - Math.max(1, Math.round(rawDamage * (1 - defenseRate))));

export const applyOrbitContactDamage = <T extends {
    x: number;
    y: number;
    hp: number;
    orbContactReady: boolean;
}>(
    target: T,
    targetRadius: number,
    orbitPositions: Vector2[],
    orbitDamage: number,
    orbitCritMultiplier: number
): T => {
    let isTouchingOrbit = false;
    let nextTarget = target;

    for (const orbPosition of orbitPositions) {
        if (nextTarget.hp <= 0) break;
        const isOverlapping = Math.hypot(nextTarget.x - orbPosition.x, nextTarget.y - orbPosition.y) <= targetRadius + (ORBIT_SIZE / 2);
        if (!isOverlapping) continue;
        isTouchingOrbit = true;
        if (!nextTarget.orbContactReady) continue;
        nextTarget = {
            ...nextTarget,
            hp: nextTarget.hp - rollOrbitContactDamage(orbitDamage, orbitCritMultiplier),
            orbContactReady: false,
        };
    }

    if (!isTouchingOrbit && !nextTarget.orbContactReady) {
        nextTarget = {
            ...nextTarget,
            orbContactReady: true,
        };
    }

    return nextTarget;
};
