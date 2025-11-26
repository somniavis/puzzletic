/**
 * Reward Service
 * 보상 시스템 서비스 (미니게임 보상 계산, 글로, GP)
 */

import type {
  MinigameResult,
  RewardCalculation,
  MinigameDifficulty,
  TendencyStats,
} from '../types/gameMechanics';
import {
  DIFFICULTY_REWARDS,
  PERFECT_BONUS_MULTIPLIER,
  DEFAULT_MASTERY_BONUS,
  PLAY_REWARD,
  PLAY_HAPPINESS_BONUS,
  TENDENCY_GAINS,
} from '../constants/gameMechanics';

/**
 * 미니게임 보상 계산
 *
 * 공식: 기본값 × 난이도 계수 × 정답률(0.0~1.0) × 숙련도 보너스
 * 퍼펙트 보너스: 정답률 100% 시 최종 보상 1.2배
 */
export const calculateMinigameReward = (result: MinigameResult): RewardCalculation => {
  const difficultyConfig = DIFFICULTY_REWARDS[result.difficulty];

  if (!difficultyConfig) {
    throw new Error(`Invalid difficulty: ${result.difficulty}`);
  }

  // 기본 보상
  const baseGlo = difficultyConfig.baseGlo;
  const baseGP = difficultyConfig.baseGP;

  // 배율 적용
  const difficultyMultiplier = difficultyConfig.multiplier;
  const accuracyMultiplier = result.accuracy;
  const masteryMultiplier = result.masteryBonus || DEFAULT_MASTERY_BONUS;
  const perfectMultiplier = result.isPerfect ? PERFECT_BONUS_MULTIPLIER : 1.0;

  // 최종 계산
  const gloBeforeBonus = baseGlo * difficultyMultiplier * accuracyMultiplier * masteryMultiplier;
  const gpBeforeBonus = baseGP * difficultyMultiplier * accuracyMultiplier * masteryMultiplier;

  const finalGlo = Math.round(gloBeforeBonus * perfectMultiplier);
  const finalGP = Math.round(gpBeforeBonus * perfectMultiplier);

  return {
    gloEarned: finalGlo,
    gpEarned: finalGP,
    perfectBonus: result.isPerfect,
    breakdown: {
      baseReward: baseGlo,
      difficultyMultiplier,
      accuracyMultiplier,
      masteryMultiplier,
      perfectMultiplier,
    },
  };
};

/**
 * 놀이 보상 계산
 *
 * 행복도 기반:
 * - 행복도 >= 80: 2배 글로, 1.5배 GP
 * - 행복도 >= 65: 1.5배 글로, 1.3배 GP
 * - 행복도 >= 50: 기본 보상
 */
export const calculatePlayReward = (happiness: number): {
  gloEarned: number;
  gpEarned: number;
  bonus: 'excellent' | 'good' | 'normal' | null;
} => {
  if (happiness < PLAY_REWARD.happinessRequirement) {
    return {
      gloEarned: 0,
      gpEarned: 0,
      bonus: null,
    };
  }

  let gloMultiplier = 1.0;
  let gpMultiplier = 1.0;
  let bonus: 'excellent' | 'good' | 'normal' = 'normal';

  if (happiness >= 80) {
    gloMultiplier = PLAY_HAPPINESS_BONUS.excellent.gloMultiplier;
    gpMultiplier = PLAY_HAPPINESS_BONUS.excellent.gpMultiplier;
    bonus = 'excellent';
  } else if (happiness >= 65) {
    gloMultiplier = PLAY_HAPPINESS_BONUS.good.gloMultiplier;
    gpMultiplier = PLAY_HAPPINESS_BONUS.good.gpMultiplier;
    bonus = 'good';
  }

  const gloEarned = Math.round(PLAY_REWARD.baseGlo * gloMultiplier);
  const gpEarned = Math.round(PLAY_REWARD.baseGP * gpMultiplier);

  return {
    gloEarned,
    gpEarned,
    bonus,
  };
};

/**
 * 미니게임 활동으로 성향 증가
 */
export const gainTendencyFromMinigame = (
  currentTendencies: TendencyStats,
  difficulty: MinigameDifficulty
): TendencyStats => {
  const gains = (() => {
    switch (difficulty) {
      case 1:
        return TENDENCY_GAINS.minigame.difficulty1;
      case 2:
        return TENDENCY_GAINS.minigame.difficulty2;
      case 3:
        return TENDENCY_GAINS.minigame.difficulty3;
      case 4:
        return TENDENCY_GAINS.minigame.difficulty4;
      case 5:
        return TENDENCY_GAINS.minigame.difficulty5;
      default:
        return {
          intelligence: 0,
          creativity: 0,
          physical: 0,
          social: 0,
          discipline: 0,
          exploration: 0,
        };
    }
  })();

  return {
    intelligence: currentTendencies.intelligence + (gains.intelligence || 0),
    creativity: currentTendencies.creativity + (gains.creativity || 0),
    physical: currentTendencies.physical + (gains.physical || 0),
    social: currentTendencies.social + (gains.social || 0),
    discipline: currentTendencies.discipline + (gains.discipline || 0),
    exploration: currentTendencies.exploration + (gains.exploration || 0),
  };
};

/**
 * 놀이 활동으로 성향 증가
 */
export const gainTendencyFromPlay = (currentTendencies: TendencyStats): TendencyStats => {
  return {
    ...currentTendencies,
    physical: currentTendencies.physical + TENDENCY_GAINS.play.physical,
    social: currentTendencies.social + TENDENCY_GAINS.play.social,
  };
};

/**
 * 청소 활동으로 성향 증가
 */
export const gainTendencyFromClean = (currentTendencies: TendencyStats): TendencyStats => {
  return {
    ...currentTendencies,
    discipline: currentTendencies.discipline + TENDENCY_GAINS.clean.discipline,
  };
};

/**
 * 먹이기 활동으로 성향 증가
 */
export const gainTendencyFromFeed = (currentTendencies: TendencyStats): TendencyStats => {
  return {
    ...currentTendencies,
    social: currentTendencies.social + TENDENCY_GAINS.feed.social,
  };
};

/**
 * 난이도별 예상 보상 미리보기
 */
export const previewRewardByDifficulty = (difficulty: MinigameDifficulty): {
  minGlo: number;
  maxGlo: number;
  minGP: number;
  maxGP: number;
  perfectGlo: number;
  perfectGP: number;
} => {
  const config = DIFFICULTY_REWARDS[difficulty];

  if (!config) {
    throw new Error(`Invalid difficulty: ${difficulty}`);
  }

  const multiplier = config.multiplier;

  // 최소 보상 (정답률 0%)
  const minGlo = 0;
  const minGP = 0;

  // 최대 보상 (정답률 100%, 보너스 제외)
  const maxGlo = Math.round(config.baseGlo * multiplier);
  const maxGP = Math.round(config.baseGP * multiplier);

  // 퍼펙트 보상 (정답률 100% + 퍼펙트 보너스)
  const perfectGlo = Math.round(maxGlo * PERFECT_BONUS_MULTIPLIER);
  const perfectGP = Math.round(maxGP * PERFECT_BONUS_MULTIPLIER);

  return {
    minGlo,
    maxGlo,
    minGP,
    maxGP,
    perfectGlo,
    perfectGP,
  };
};

/**
 * 놀이 쿨다운 체크
 */
export const checkPlayCooldown = (lastPlayTime: number | null): {
  canPlay: boolean;
  timeLeft: number;
} => {
  if (!lastPlayTime) {
    return { canPlay: true, timeLeft: 0 };
  }

  const now = Date.now();
  const elapsed = now - lastPlayTime;
  const timeLeft = Math.max(0, PLAY_REWARD.cooldownMs - elapsed);

  return {
    canPlay: timeLeft === 0,
    timeLeft,
  };
};
