import { DIFFICULTY_REWARDS } from '../../../constants/gameMechanics';
import type { EvolutionStage } from '../../../types/gameMechanics';

const PLAY_ARCADE_REWARD_BASE_MULTIPLIER = 0.8;
const PLAY_ARCADE_REWARD_BEST_MULTIPLIER = 1.2;
const PLAY_ARCADE_REWARD_NON_BEST_GAME_OVER_MULTIPLIER = 0.4;

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
    const outcomeMultiplier = isBest
        ? PLAY_ARCADE_REWARD_BEST_MULTIPLIER
        : PLAY_ARCADE_REWARD_NON_BEST_GAME_OVER_MULTIPLIER;

    return {
        xp: Math.max(1, Math.round(rewardConfig.baseXP * PLAY_ARCADE_REWARD_BASE_MULTIPLIER * outcomeMultiplier)),
        gro: Math.max(1, Math.round(rewardConfig.baseGro * PLAY_ARCADE_REWARD_BASE_MULTIPLIER * outcomeMultiplier)),
    };
};
