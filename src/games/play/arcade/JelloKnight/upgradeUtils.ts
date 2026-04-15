import type React from 'react';
import {
    BOMB_CRIT_MULTIPLIER_LEVELS,
    BOMB_DROP_CHANCE_LEVELS,
    BOMB_DROP_INTERVAL_LEVELS,
    BOMB_RADIUS_LEVELS,
    ORBIT_COUNT_LEVELS,
    ORBIT_CRIT_MULTIPLIER_LEVELS,
    ORBIT_DAMAGE_LEVELS,
    ORBIT_RADIUS_LEVELS,
    ORBIT_SPEED_LEVELS,
    PLAYER_DEFENSE_LEVELS,
    PLAYER_MAX_HP_LEVELS,
    PLAYER_MOVE_SPEED_LEVELS,
    SKILL_MAX_LEVELS,
} from './constants';
import type { UpgradeLevels, UpgradeOptionId } from './types';

type NumberRef = React.MutableRefObject<number>;
type BooleanRef = React.MutableRefObject<boolean>;
type UpgradeLevelsRef = React.MutableRefObject<UpgradeLevels>;

type ApplyUpgradeSelectionParams = {
    optionId: UpgradeOptionId;
    bombUnlockedRef: BooleanRef;
    bombCritMultiplierRef: NumberRef;
    bombDropChanceRef: NumberRef;
    bombDropIntervalRef: NumberRef;
    bombRadiusRef: NumberRef;
    defenseRateRef: NumberRef;
    hpRef: NumberRef;
    orbitCountRef: NumberRef;
    orbitCritMultiplierRef: NumberRef;
    orbitDamageRef: NumberRef;
    orbitRadiusRef: NumberRef;
    orbitSpeedRef: NumberRef;
    playerMaxHpRef: NumberRef;
    playerMoveSpeedRef: NumberRef;
    setBombRadius: (value: number) => void;
    setOrbitDamage: (value: number) => void;
    setOrbitRadius: (value: number) => void;
    setOrbitSpeed: (value: number) => void;
    setPlayerMaxHp: (value: number) => void;
    upgradeLevelsRef: UpgradeLevelsRef;
};

const bumpLevel = (
    levelsRef: UpgradeLevelsRef,
    key: keyof UpgradeLevels,
) => {
    const nextLevel = Math.min(SKILL_MAX_LEVELS[key], levelsRef.current[key] + 1);
    levelsRef.current = {
        ...levelsRef.current,
        [key]: nextLevel,
    };
    return nextLevel;
};

export const applyUpgradeSelection = ({
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
}: ApplyUpgradeSelectionParams) => {
    switch (optionId) {
        case 'orb_damage': {
            const nextLevel = bumpLevel(upgradeLevelsRef, 'orb_damage');
            orbitDamageRef.current = ORBIT_DAMAGE_LEVELS[nextLevel - 1];
            setOrbitDamage(orbitDamageRef.current);
            break;
        }
        case 'orb_count': {
            const nextLevel = bumpLevel(upgradeLevelsRef, 'orb_count');
            orbitCountRef.current = ORBIT_COUNT_LEVELS[nextLevel - 1];
            break;
        }
        case 'orb_speed': {
            const nextLevel = bumpLevel(upgradeLevelsRef, 'orb_speed');
            orbitSpeedRef.current = ORBIT_SPEED_LEVELS[nextLevel - 1];
            setOrbitSpeed(orbitSpeedRef.current);
            break;
        }
        case 'orb_radius': {
            const nextLevel = bumpLevel(upgradeLevelsRef, 'orb_radius');
            orbitRadiusRef.current = ORBIT_RADIUS_LEVELS[nextLevel - 1];
            setOrbitRadius(orbitRadiusRef.current);
            break;
        }
        case 'orb_crit': {
            const nextLevel = bumpLevel(upgradeLevelsRef, 'orb_crit');
            orbitCritMultiplierRef.current = ORBIT_CRIT_MULTIPLIER_LEVELS[nextLevel - 1];
            break;
        }
        case 'bomb_unlock':
            bombUnlockedRef.current = true;
            break;
        case 'bomb_chance': {
            const nextLevel = bumpLevel(upgradeLevelsRef, 'bomb_chance');
            bombDropChanceRef.current = BOMB_DROP_CHANCE_LEVELS[nextLevel - 1];
            break;
        }
        case 'bomb_interval': {
            const nextLevel = bumpLevel(upgradeLevelsRef, 'bomb_interval');
            bombDropIntervalRef.current = BOMB_DROP_INTERVAL_LEVELS[nextLevel - 1];
            break;
        }
        case 'bomb_radius': {
            const nextLevel = bumpLevel(upgradeLevelsRef, 'bomb_radius');
            bombRadiusRef.current = BOMB_RADIUS_LEVELS[nextLevel - 1];
            setBombRadius(bombRadiusRef.current);
            break;
        }
        case 'bomb_crit': {
            const nextLevel = bumpLevel(upgradeLevelsRef, 'bomb_crit');
            bombCritMultiplierRef.current = BOMB_CRIT_MULTIPLIER_LEVELS[nextLevel - 1];
            break;
        }
        case 'player_hp': {
            const previousMaxHp = playerMaxHpRef.current;
            const nextLevel = bumpLevel(upgradeLevelsRef, 'player_hp');
            playerMaxHpRef.current = PLAYER_MAX_HP_LEVELS[nextLevel - 1];
            hpRef.current = Math.min(playerMaxHpRef.current, hpRef.current + (playerMaxHpRef.current - previousMaxHp));
            setPlayerMaxHp(playerMaxHpRef.current);
            break;
        }
        case 'player_defense': {
            const nextLevel = bumpLevel(upgradeLevelsRef, 'player_defense');
            defenseRateRef.current = PLAYER_DEFENSE_LEVELS[nextLevel - 1];
            break;
        }
        case 'player_speed': {
            const nextLevel = bumpLevel(upgradeLevelsRef, 'player_speed');
            playerMoveSpeedRef.current = PLAYER_MOVE_SPEED_LEVELS[nextLevel - 1];
            break;
        }
        default:
            break;
    }
};
