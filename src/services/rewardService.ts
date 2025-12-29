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
  const baseGro = difficultyConfig.baseGro;
  const difficultyMultiplier = difficultyConfig.multiplier;
  const accuracyMultiplier = result.accuracy;
  const masteryMultiplier = result.masteryBonus || DEFAULT_MASTERY_BONUS;
  const perfectMultiplier = result.isPerfect ? PERFECT_BONUS_MULTIPLIER : 1.0;

  const groBeforeBonus = baseGro * difficultyMultiplier * accuracyMultiplier * masteryMultiplier;


  // 2. XP 계산 (동적 스케일링: 현재 레벨 요구량 * 난이도 비중)
  // [변경 사항] XP는 고정 XP 테이블을 사용하도록 변경 (DifficultyConfig.baseXP)
  // 이전 로직(현재 단계 요구량 비례)은 인플레이션 우려로 폐기하고, 고정값 사용.
  const baseXP = difficultyConfig.baseXP;
  // XP는 Multiplier를 적용하지 않음 (게임 디자인: 고난이도는 이미 baseXP가 높음)
  // 단, 정확도와 숙련도, 퍼펙트는 적용.
  let xpBeforeBonus = baseXP * accuracyMultiplier * masteryMultiplier;

  // 3. 이해도 시스템 (Understanding System) 적용
  // 젤로는 자신의 단계 + 1 레벨까지만 이해(Understanding) 가능
  // 예: 1단계(알) -> Lv 2까지 이해. Lv 3부터는 XP 제한.
  // 예: 3단계(아동기) -> Lv 4까지 이해. Lv 5부터는 XP 제한.
  const understandingLimit = Math.min(5, currentStage + 1);
  let isCapped = false;
  let bonusGro = 0;
  let originalXP = 0;

  if (result.difficulty > understandingLimit) {
    isCapped = true;
    // 제한된 레벨의 baseXP를 가져옴
    const limitConfig = DIFFICULTY_REWARDS[understandingLimit];
    const maxBaseXP = limitConfig.baseXP;

    // 원래 받을 뻔 했던 XP 계산 (기록용)
    originalXP = Math.round(xpBeforeBonus * perfectMultiplier);

    // 실제 XP는 제한된 레벨 기준으로 재계산 (Multiplier 등 동일 적용)
    // xpBeforeBonus 자체를 캡핑된 baseXP 기준으로 변경
    const cappedXpBeforeBonus = maxBaseXP * accuracyMultiplier * masteryMultiplier;

    // 손실된 XP 계산 (보너스 전 원시값 기준)
    const lostRawXP = Math.max(0, xpBeforeBonus - cappedXpBeforeBonus);

    // 손실된 XP를 보너스 GRO로 변환 (0.5배) - 반올림 처리
    // 퍼펙트 보너스까지 적용된 최종 손실분을 계산해야 공정함
    const lostFinalXP = Math.round(lostRawXP * perfectMultiplier);
    bonusGro = Math.round(lostFinalXP * 0.5);

    // xpBeforeBonus 업데이트
    xpBeforeBonus = cappedXpBeforeBonus;
  }

  // 4. 최종 결과 (반올림 및 퍼펙트 보너스)
  // GRO는 원래 계산대로 (이해도 제한 없음, 오히려 보너스 추가)
  let finalGro = Math.round(groBeforeBonus * perfectMultiplier);
  const finalXP = Math.round(xpBeforeBonus * perfectMultiplier);

  // 보너스 GRO 추가
  if (bonusGro > 0) {
    finalGro += bonusGro;
  }

  return {
    groEarned: finalGro,
    xpEarned: finalXP,
    perfectBonus: result.isPerfect,
    breakdown: {
      baseReward: baseGro,
      difficultyMultiplier,
      accuracyMultiplier,
      masteryMultiplier,
      perfectMultiplier,
      cappedXP: isCapped,
      originalXP: isCapped ? originalXP : undefined,
      bonusGro: isCapped ? bonusGro : undefined,
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
  groEarned: number;
  xpEarned: number;
  bonus: 'excellent' | 'good' | 'normal' | null;
} => {
  if (happiness < PLAY_REWARD.happinessRequirement) {
    return {
      groEarned: 0,
      xpEarned: 0,
      bonus: null,
    };
  }

  let groMultiplier = 1.0;
  let xpMultiplier = 1.0;
  let bonus: 'excellent' | 'good' | 'normal' = 'normal';

  if (happiness >= 80) {
    groMultiplier = PLAY_HAPPINESS_BONUS.excellent.groMultiplier;
    xpMultiplier = PLAY_HAPPINESS_BONUS.excellent.xpMultiplier;
    bonus = 'excellent';
  } else if (happiness >= 65) {
    groMultiplier = PLAY_HAPPINESS_BONUS.good.groMultiplier;
    xpMultiplier = PLAY_HAPPINESS_BONUS.good.xpMultiplier;
    bonus = 'good';
  }

  const groEarned = Math.round(PLAY_REWARD.baseGro * groMultiplier);
  const xpEarned = Math.round(PLAY_REWARD.baseXP * xpMultiplier);

  return {
    groEarned,
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
  minGro: number;
  maxGro: number;
  minXP: number;
  maxXP: number;
  perfectGro: number;
  perfectXP: number;
} => {
  const config = DIFFICULTY_REWARDS[difficulty];

  if (!config) {
    throw new Error(`Invalid difficulty: ${difficulty}`);
  }

  const multiplier = config.multiplier;

  // 최소 보상 (정답률 0%)
  const minGro = 0;
  const minXP = 0;

  // 최대 보상 (정답률 100%, 보너스 제외)
  const maxGro = Math.round(config.baseGro * multiplier);
  const maxXP = Math.round(config.baseXP * multiplier);

  // 퍼펙트 보상 (정답률 100% + 퍼펙트 보너스)
  const perfectGro = Math.round(maxGro * PERFECT_BONUS_MULTIPLIER);
  const perfectXP = Math.round(maxXP * PERFECT_BONUS_MULTIPLIER);

  return {
    minGro,
    maxGro,
    minXP,
    maxXP,
    perfectGro,
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
