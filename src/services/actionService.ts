/**
 * Action Service
 * 양육 행동 처리 서비스
 */

import type {
  NurturingStats,
  ActionResult,
  Poop,
  PendingPoop,
  FoodEffect,
} from '../types/nurturing';
import {
  FOOD_EFFECTS,
  MEDICINE_EFFECTS,
  CLEAN_EFFECT,
  PLAY_EFFECT,
  STUDY_EFFECT,
  STUDY_REQUIREMENTS,
  POOP_CONFIG,
  MESSAGES,
} from '../constants/nurturing';
import { clampStat, evaluateCondition } from './gameTickService';

/**
 * 랜덤 위치 생성 (똥 배치용)
 */
const generateRandomPosition = (): { x: number; y: number } => {
  return {
    x: Math.random() * 80 + 10, // 10% ~ 90% (화면 가장자리 피하기)
    y: Math.random() * 60 + 30, // 30% ~ 90% (상단 UI 피하기)
  };
};

/**
 * 지연 똥 예약 (확률 기반 + 포만감 보너스)
 * 음식 먹으면 즉시 생성하지 않고 20~60초 후 생성 예약
 */
const trySchedulePoop = (
  foodEffect: FoodEffect,
  currentFullness: number,
  existingPoops: Poop[],
  pendingPoops: PendingPoop[]
): PendingPoop | undefined => {
  // 최대 똥 개수 체크 (현재 + 예약 중인 것)
  const totalPoops = existingPoops.length + pendingPoops.length;
  if (totalPoops >= POOP_CONFIG.MAX_POOPS) {
    return undefined;
  }

  // 기본 확률 + 포만감 보너스
  let poopChance = foodEffect.poopChance;
  if (currentFullness >= POOP_CONFIG.FULLNESS_BONUS_THRESHOLD) {
    poopChance += POOP_CONFIG.FULLNESS_BONUS_CHANCE;
  }

  // 확률 체크
  if (Math.random() > poopChance) {
    return undefined;
  }

  // 지연 시간 계산 (20~60초 랜덤)
  const delay = POOP_CONFIG.DELAY_MIN_MS +
    Math.random() * (POOP_CONFIG.DELAY_MAX_MS - POOP_CONFIG.DELAY_MIN_MS);

  // 예약 생성
  return {
    id: `pending-poop-${Date.now()}-${Math.random()}`,
    scheduledAt: Date.now() + delay,
    healthDebuff: foodEffect.healthDebuff,
  };
};

/**
 * 예약된 똥을 실제 똥으로 변환 (위치 지정)
 */
export const convertPendingToPoop = (pending: PendingPoop): Poop => {
  const position = generateRandomPosition();
  return {
    id: `poop-${Date.now()}-${Math.random()}`,
    x: position.x,
    y: position.y,
    createdAt: Date.now(),
    healthDebuff: pending.healthDebuff,
  };
};

/**
 * 음식 먹이기
 * 똥은 즉시 생성하지 않고 예약 (지연 생성)
 */
export const feedCharacter = (
  currentStats: NurturingStats,
  foodId: string,
  existingPoops: Poop[],
  pendingPoops: PendingPoop[] = []
): ActionResult & { pendingPoopScheduled?: PendingPoop } => {
  const foodEffect = FOOD_EFFECTS[foodId] || FOOD_EFFECTS.default;

  // 먹은 후 포만감 계산
  const newFullness = clampStat(currentStats.fullness + foodEffect.fullness);

  // 주요 효과
  const newStats: Partial<NurturingStats> = {
    fullness: newFullness,
    happiness: clampStat(currentStats.happiness + foodEffect.happiness),
  };

  // 건강식인 경우 건강 회복
  if (foodEffect.health) {
    newStats.health = clampStat(currentStats.health + foodEffect.health);
  }

  const statChanges: Partial<NurturingStats> = {
    fullness: (newStats.fullness || currentStats.fullness) - currentStats.fullness,
    happiness: (newStats.happiness || currentStats.happiness) - currentStats.happiness,
    health: foodEffect.health ? ((newStats.health || currentStats.health) - currentStats.health) : 0,
  };

  // 부작용: 똥 예약 시도 (지연 생성)
  const pendingPoopScheduled = trySchedulePoop(
    foodEffect,
    newFullness,
    existingPoops,
    pendingPoops
  );

  return {
    success: true,
    statChanges,
    sideEffects: {
      emotionTriggered: 'joy',
    },
    pendingPoopScheduled,
  };
};

/**
 * 약 먹이기
 * 중요: 건강이 낮을 때만 효과적, "아픔" 상태에서는 약으로만 회복 가능
 */
export const giveMedicine = (
  currentStats: NurturingStats,
  medicineId: string
): ActionResult => {
  const condition = evaluateCondition(currentStats);
  const medicineEffect = MEDICINE_EFFECTS[medicineId] || MEDICINE_EFFECTS.default;

  // 건강 회복
  const newStats: Partial<NurturingStats> = {
    health: clampStat(currentStats.health + medicineEffect.health),
    happiness: clampStat(currentStats.happiness + medicineEffect.happiness),
  };

  const statChanges: Partial<NurturingStats> = {
    health: (newStats.health || currentStats.health) - currentStats.health,
    happiness: (newStats.happiness || currentStats.happiness) - currentStats.happiness,
  };

  // 부작용 (현재는 없음 - 안도감만)
  // fullness: currentStats.fullness + medicineEffect.fullness 를 추가하려면 여기

  return {
    success: true,
    statChanges,
    sideEffects: {
      emotionTriggered: condition.isSick ? 'love' : 'neutral',
    },
    message: condition.isSick ? '아픔이 나아지고 있어요' : undefined,
  };
};

/**
 * 청소하기
 */
export const cleanRoom = (
  currentStats: NurturingStats,
  poopsToClean: Poop[] = []
): ActionResult => {
  // 주요 효과
  const newStats: Partial<NurturingStats> = {
    health: clampStat(currentStats.health + CLEAN_EFFECT.health),
    happiness: clampStat(currentStats.happiness + CLEAN_EFFECT.happiness),
  };

  const statChanges: Partial<NurturingStats> = {
    health: (newStats.health || currentStats.health) - currentStats.health,
    happiness: (newStats.happiness || currentStats.happiness) - currentStats.happiness,
  };

  // 똥 청소 보너스 (똥 개수만큼 추가 만족감)
  const poopBonus = poopsToClean.length * 2;
  if (poopBonus > 0) {
    newStats.happiness = clampStat((newStats.happiness || 0) + poopBonus);
    statChanges.happiness = (statChanges.happiness || 0) + poopBonus;
  }

  return {
    success: true,
    statChanges,
    sideEffects: {
      emotionTriggered: 'playful',
    },
    message: poopsToClean.length > 0 ? `똥 ${poopsToClean.length}개를 치웠어요!` : undefined,
  };
};

/**
 * 놀이하기 (글로 + GP 보상 포함)
 */
export const playWithCharacter = (
  currentStats: NurturingStats
): ActionResult & { gloEarned?: number; gpEarned?: number } => {
  // 주요 효과
  const newStats: Partial<NurturingStats> = {
    happiness: clampStat(currentStats.happiness + PLAY_EFFECT.happiness),
  };

  // 부작용 (비용)
  newStats.fullness = clampStat(currentStats.fullness + PLAY_EFFECT.fullness);

  const statChanges: Partial<NurturingStats> = {
    happiness: (newStats.happiness || currentStats.happiness) - currentStats.happiness,
    fullness: (newStats.fullness || currentStats.fullness) - currentStats.fullness,
  };

  // 보상 계산 (rewardService에서 계산 - 추후 통합)
  // 기본적으로 글로와 GP를 반환하도록 확장
  return {
    success: true,
    statChanges,
    sideEffects: {
      emotionTriggered: 'playful',
    },
    // gloEarned: 보상 시스템 통합 후 추가
    // gpEarned: 보상 시스템 통합 후 추가
  };
};

/**
 * 학습하기 (재화 획득)
 * 학습은 컨디션이 좋아야만 가능
 */
export const studyWithCharacter = (
  currentStats: NurturingStats
): ActionResult => {
  const condition = evaluateCondition(currentStats);

  // 학습 가능 여부 체크
  if (!condition.canStudy) {
    return {
      success: false,
      statChanges: {},
      message: MESSAGES.CANT_STUDY,
    };
  }

  // 추가 세부 조건 체크
  if (
    currentStats.happiness < STUDY_REQUIREMENTS.MIN_HAPPINESS ||
    currentStats.health < STUDY_REQUIREMENTS.MIN_HEALTH ||
    currentStats.fullness < STUDY_REQUIREMENTS.MIN_FULLNESS
  ) {
    let reason = '';
    if (currentStats.happiness < STUDY_REQUIREMENTS.MIN_HAPPINESS) {
      reason = '행복도가 너무 낮아요';
    } else if (currentStats.health < STUDY_REQUIREMENTS.MIN_HEALTH) {
      reason = '건강이 좋지 않아요';
    } else {
      reason = '배가 너무 고파요';
    }

    return {
      success: false,
      statChanges: {},
      message: `${MESSAGES.CANT_STUDY} (${reason})`,
    };
  }

  // 주요 효과
  const newStats: Partial<NurturingStats> = {
    happiness: clampStat(currentStats.happiness + STUDY_EFFECT.happiness),
  };

  // 부작용 (비용)
  newStats.fullness = clampStat(currentStats.fullness + STUDY_EFFECT.fullness);

  const statChanges: Partial<NurturingStats> = {
    happiness: (newStats.happiness || currentStats.happiness) - currentStats.happiness,
    fullness: (newStats.fullness || currentStats.fullness) - currentStats.fullness,
  };

  // 재화 보너스 계산 (컨디션이 좋을수록 더 많이)
  let currencyReward = STUDY_EFFECT.currencyReward;

  // 보너스 조건: 모든 스탯이 80 이상이면 2배
  if (
    currentStats.happiness >= 80 &&
    currentStats.health >= 80 &&
    currentStats.fullness >= 80
  ) {
    currencyReward *= 2;
  }

  return {
    success: true,
    statChanges,
    sideEffects: {
      currencyEarned: currencyReward,
      emotionTriggered: 'joy',
    },
    message: `학습 완료! 재화 +${currencyReward}`,
  };
};

/**
 * 똥 개별 제거 (특정 똥 클릭시)
 */
export const removePoop = (
  poopId: string,
  poops: Poop[]
): { updatedPoops: Poop[]; removed: boolean } => {
  const index = poops.findIndex((p) => p.id === poopId);

  if (index === -1) {
    return { updatedPoops: poops, removed: false };
  }

  const updatedPoops = [...poops];
  updatedPoops.splice(index, 1);

  return { updatedPoops, removed: true };
};

/**
 * 모든 똥 제거 (청소하기 버튼 사용시)
 */
export const removeAllPoops = (): Poop[] => {
  return [];
};
