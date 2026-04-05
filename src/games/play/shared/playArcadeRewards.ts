import { DIFFICULTY_REWARDS } from '../../../constants/gameMechanics';
import type { EvolutionStage } from '../../../types/gameMechanics';

const PLAY_ARCADE_REWARD_BASE_MULTIPLIER = 0.8;
const PLAY_ARCADE_REWARD_BEST_MULTIPLIER = 1.2;

export type PlayArcadeRewardResult = {
    xp: number;
    gro: number;
};

export const calculatePlayArcadeReward = (
    level: EvolutionStage,
    isBest: boolean
): PlayArcadeRewardResult => {
    const difficulty = Math.min(5, Math.max(1, level));
    const rewardConfig = DIFFICULTY_REWARDS[difficulty];
    const bestMultiplier = isBest ? PLAY_ARCADE_REWARD_BEST_MULTIPLIER : 1;

    return {
        xp: Math.max(1, Math.round(rewardConfig.baseXP * PLAY_ARCADE_REWARD_BASE_MULTIPLIER * bestMultiplier)),
        gro: Math.max(1, Math.round(rewardConfig.baseGro * PLAY_ARCADE_REWARD_BASE_MULTIPLIER * bestMultiplier)),
    };
};
