/**
 * Reward Service
 * 보상 시스템 서비스 (미니게임 보상 계산, 글로, GP)
 */

import type {
  MinigameResult,
  RewardCalculation,
  MinigameDifficulty,
  TendencyStats,
  EvolutionStage,
} from '../types/gameMechanics';
import {
  DIFFICULTY_REWARDS,
  DIFFICULTY_SCALING_PERCENTAGES,
  EVOLUTION_STAGES,
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
 * 
 * [변경 사항] XP는 현재 진화 단계(currentStage)의 요구량을 기준으로 동적 계산됨 (고정 XP 룰)
 */
export const calculateMinigameReward = (
  result: MinigameResult,
  currentStage: EvolutionStage = 1
): RewardCalculation => {
  const difficultyConfig = DIFFICULTY_REWARDS[result.difficulty];

  if (!difficultyConfig) {
    throw new Error(`Invalid difficulty: ${result.difficulty}`);
  }

  // 1. GLO 계산 (기존 방식 유지: Base * Multiplier)
  const baseGlo = difficultyConfig.baseGlo;
  const difficultyMultiplier = difficultyConfig.multiplier;
  const accuracyMultiplier = result.accuracy;
  const masteryMultiplier = result.masteryBonus || DEFAULT_MASTERY_BONUS;
  const perfectMultiplier = result.isPerfect ? PERFECT_BONUS_MULTIPLIER : 1.0;

  const gloBeforeBonus = baseGlo * difficultyMultiplier * accuracyMultiplier * masteryMultiplier;


  // 2. XP 계산 (동적 스케일링: 현재 레벨 요구량 * 난이도 비중)
  // 다음 단계로 넘어가기 위한 필요 XP량 (Delta) 조회
  // 5단계(만렙)인 경우 5단계 도달치(3000)를 기준으로 함 (파밍)
  const targetStage = (currentStage < 5 ? currentStage + 1 : 5) as EvolutionStage;
  const xpRequirement = EVOLUTION_STAGES[targetStage].requiredXPFromPrevious;

  // 난이도별 비중 가져오기 (예: 난이도 1 = 2%, 난이도 5 = 12%)
  const percentage = DIFFICULTY_SCALING_PERCENTAGES[result.difficulty] || 0.02;

  // 기본 XP (Base XP)
  // 주의: 난이도 계수(difficultyMultiplier)는 이미 percentage에 포함되어 있으므로 중복 적용하지 않음
  const dynamicBaseXP = xpRequirement * percentage;

  const xpBeforeBonus = dynamicBaseXP * accuracyMultiplier * masteryMultiplier;


  // 3. 최종 결과 (반올림 및 퍼펙트 보너스)
  const finalGlo = Math.round(gloBeforeBonus * perfectMultiplier);
  const finalXP = Math.round(xpBeforeBonus * perfectMultiplier);

  return {
    gloEarned: finalGlo,
    xpEarned: finalXP,
    perfectBonus: result.isPerfect,
    breakdown: {
      baseReward: baseGlo, // 표기에 사용될 수 있으므로 GLO 베이스 유지/혹은 dynamicBaseGP로 교체? 
      // UI에서 "기본 점수"를 보여줄 때 혼동 없도록 일단 GLO 기준 유지하거나 별도 필드 추가 고려.
      // 여기선 로직 호환성을 위해 유지.
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
 * - 행복도 >= 80: 2배 글로, 1.5배 XP
 * - 행복도 >= 65: 1.5배 글로, 1.3배 XP
 * - 행복도 >= 50: 기본 보상
 */
export const calculatePlayReward = (happiness: number): {
  gloEarned: number;
  xpEarned: number;
  bonus: 'excellent' | 'good' | 'normal' | null;
} => {
  if (happiness < PLAY_REWARD.happinessRequirement) {
    return {
      gloEarned: 0,
      xpEarned: 0,
      bonus: null,
    };
  }

  let gloMultiplier = 1.0;
  let xpMultiplier = 1.0;
  let bonus: 'excellent' | 'good' | 'normal' = 'normal';

  if (happiness >= 80) {
    gloMultiplier = PLAY_HAPPINESS_BONUS.excellent.gloMultiplier;
    xpMultiplier = PLAY_HAPPINESS_BONUS.excellent.xpMultiplier;
    bonus = 'excellent';
  } else if (happiness >= 65) {
    gloMultiplier = PLAY_HAPPINESS_BONUS.good.gloMultiplier;
    xpMultiplier = PLAY_HAPPINESS_BONUS.good.xpMultiplier;
    bonus = 'good';
  }

  const gloEarned = Math.round(PLAY_REWARD.baseGlo * gloMultiplier);
  const xpEarned = Math.round(PLAY_REWARD.baseXP * xpMultiplier);

  return {
    gloEarned,
    xpEarned,
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
  minXP: number;
  maxXP: number;
  perfectGlo: number;
  perfectXP: number;
} => {
  const config = DIFFICULTY_REWARDS[difficulty];

  if (!config) {
    throw new Error(`Invalid difficulty: ${difficulty}`);
  }

  const multiplier = config.multiplier;

  // 최소 보상 (정답률 0%)
  const minGlo = 0;
  const minXP = 0;

  // 최대 보상 (정답률 100%, 보너스 제외)
  const maxGlo = Math.round(config.baseGlo * multiplier);
  const maxXP = Math.round(config.baseXP * multiplier);

  // 퍼펙트 보상 (정답률 100% + 퍼펙트 보너스)
  const perfectGlo = Math.round(maxGlo * PERFECT_BONUS_MULTIPLIER);
  const perfectXP = Math.round(maxXP * PERFECT_BONUS_MULTIPLIER);

  return {
    minGlo,
    maxGlo,
    minXP,
    maxXP,
    perfectGlo,
    perfectXP,
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
