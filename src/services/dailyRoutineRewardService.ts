export interface DailyRoutineReward {
  gro: number;
  xp: number;
  tier: 'normal' | 'bonus' | 'jackpot';
}

interface RewardTierConfig {
  gro: number;
  xp: number;
  chance: number;
}

const DAILY_ROUTINE_REWARD_TABLE: Record<
  number,
  Record<DailyRoutineReward['tier'], RewardTierConfig>
> = {
  1: {
    normal: { gro: 12, xp: 2, chance: 0.7 },
    bonus: { gro: 16, xp: 3, chance: 0.25 },
    jackpot: { gro: 20, xp: 4, chance: 0.05 },
  },
  2: {
    normal: { gro: 18, xp: 3, chance: 0.7 },
    bonus: { gro: 24, xp: 4, chance: 0.25 },
    jackpot: { gro: 30, xp: 5, chance: 0.05 },
  },
  3: {
    normal: { gro: 28, xp: 4, chance: 0.7 },
    bonus: { gro: 36, xp: 5, chance: 0.25 },
    jackpot: { gro: 45, xp: 7, chance: 0.05 },
  },
  4: {
    normal: { gro: 40, xp: 6, chance: 0.7 },
    bonus: { gro: 52, xp: 8, chance: 0.25 },
    jackpot: { gro: 65, xp: 10, chance: 0.05 },
  },
  5: {
    normal: { gro: 55, xp: 8, chance: 0.7 },
    bonus: { gro: 70, xp: 10, chance: 0.25 },
    jackpot: { gro: 85, xp: 13, chance: 0.05 },
  },
};

const clampStage = (stage: number) => Math.min(5, Math.max(1, Math.floor(stage || 1)));

export const generateDailyRoutineReward = (stage: number): DailyRoutineReward => {
  const clampedStage = clampStage(stage);
  const stageReward = DAILY_ROUTINE_REWARD_TABLE[clampedStage];
  const roll = Math.random();

  if (roll < stageReward.normal.chance) {
    return {
      gro: stageReward.normal.gro,
      xp: stageReward.normal.xp,
      tier: 'normal',
    };
  }

  if (roll < stageReward.normal.chance + stageReward.bonus.chance) {
    return {
      gro: stageReward.bonus.gro,
      xp: stageReward.bonus.xp,
      tier: 'bonus',
    };
  }

  return {
    gro: stageReward.jackpot.gro,
    xp: stageReward.jackpot.xp,
    tier: 'jackpot',
  };
};
