/**
 * Evolution Service
 * 진화 시스템 서비스 (경험치, 레벨업, 분기)
 */

import type {
  EvolutionStage,
  TendencyStats,
  JelloSpecies,
} from '../types/gameMechanics';
import type { CharacterHistory, EvolutionConditions } from '../types/character';
import {
  EVOLUTION_STAGES,
  EVOLUTION_BRANCH_STAGE,
  JELLO_SPECIES_CONDITIONS,
  MIN_TENDENCY_FOR_BRANCH,
  // GRADUATION_STAGE,
  GRADUATION_XP_STAGE4,
  GRADUATION_XP_STAGE5,
} from '../constants/gameMechanics';

/**
 * XP를 기반으로 현재 진화 단계 계산
 */
/**
 * Check if the character meets hidden evolution conditions
 */
export const checkEvolutionConditions = (
  history: CharacterHistory | undefined,
  conditions: EvolutionConditions | undefined,
  totalGameStars: number = 0 // Added totalGameStars
): boolean => {
  if (!conditions) return true;
  if (!history && !conditions.requiredStars) return false;

  // Check Stars (New Stage 5 Condition)
  if (conditions.requiredStars) {
    if (totalGameStars < conditions.requiredStars) return false;
  }

  // Check Foods
  if (history && conditions.foodsEaten) {
    for (const [foodId, count] of Object.entries(conditions.foodsEaten)) {
      if ((history.foodsEaten[foodId] || 0) < count) return false;
    }
  }

  // Check Games
  if (history && conditions.gamesPlayed) {
    for (const [gameId, count] of Object.entries(conditions.gamesPlayed)) {
      if ((history.gamesPlayed[gameId] || 0) < count) return false;
    }
  }

  // Check Actions
  if (history && conditions.requiredActionCount) {
    for (const [actionId, count] of Object.entries(conditions.requiredActionCount)) {
      if ((history.actionsPerformed[actionId] || 0) < count) return false;
    }
  }

  return true;
};

/**
 * XP를 기반으로 현재 진화 단계 계산
 * 조건부 진화(Stage 5) 지원
 */
export const calculateEvolutionStage = (
  currentXP: number,
  history?: CharacterHistory,
  unlockConditions?: EvolutionConditions,
  totalGameStars: number = 0
): EvolutionStage => {
  if (currentXP >= EVOLUTION_STAGES[5].requiredXP) {
    if (checkEvolutionConditions(history, unlockConditions, totalGameStars)) {
      return 5;
    }
    return 4; // XP는 충분하지만 조건 미달성 시 4단계 유지
  }
  if (currentXP >= EVOLUTION_STAGES[4].requiredXP) return 4;
  if (currentXP >= EVOLUTION_STAGES[3].requiredXP) return 3;
  if (currentXP >= EVOLUTION_STAGES[2].requiredXP) return 2;
  return 1;
};

/**
 * 다음 단계까지 필요한 XP 계산
 */
export const getXPToNextStage = (currentXP: number, currentStage: EvolutionStage): number => {
  if (currentStage >= 5) return 0; // 이미 최대 단계

  const nextStage = (currentStage + 1) as EvolutionStage;
  const requiredXP = EVOLUTION_STAGES[nextStage].requiredXP;

  return Math.max(0, requiredXP - currentXP);
};

/**
 * 진화 진행률 계산 (현재 단계 내에서의 진행도)
 */
export const getEvolutionProgress = (currentXP: number, currentStage: EvolutionStage): number => {
  if (currentStage >= 5) return 100; // 최대 단계 도달

  const currentStageInfo = EVOLUTION_STAGES[currentStage];
  const nextStageInfo = EVOLUTION_STAGES[(currentStage + 1) as EvolutionStage];

  const xpInCurrentStage = currentXP - currentStageInfo.requiredXP;
  const xpNeededForNextStage = nextStageInfo.requiredXP - currentStageInfo.requiredXP;

  return Math.min(100, (xpInCurrentStage / xpNeededForNextStage) * 100);
};

/**
 * 졸업 가능 여부 체크
 */
export const canGraduate = (currentXP: number, currentStage: EvolutionStage): boolean => {
  if (currentStage === 4 && currentXP >= GRADUATION_XP_STAGE4) return true;
  if (currentStage === 5 && currentXP >= GRADUATION_XP_STAGE5) return true;
  return false;
};

/**
 * 성향 통계를 기반으로 젤로 종류 결정
 *
 * 로직:
 * 1. 가장 높은 성향 2개 추출
 * 2. 조합으로 종류 매칭
 * 3. 매칭 실패 시 가장 높은 단일 성향으로 결정
 */
export const determineJelloSpecies = (tendencies: TendencyStats): JelloSpecies | null => {
  // 성향을 값 순으로 정렬
  const sortedTendencies = (Object.entries(tendencies) as [keyof TendencyStats, number][])
    .sort((a, b) => b[1] - a[1]);

  // 최소값 체크
  if (sortedTendencies[0][1] < MIN_TENDENCY_FOR_BRANCH) {
    return null; // 아직 분기 불가
  }

  const primary = sortedTendencies[0][0];
  const secondary = sortedTendencies[1][0];

  // 조합으로 매칭 시도
  for (const [species, condition] of Object.entries(JELLO_SPECIES_CONDITIONS)) {
    if (
      condition.primary === primary &&
      condition.secondary === secondary
    ) {
      return species as JelloSpecies;
    }
  }

  // 역순 조합 시도 (primary와 secondary 바꿔서)
  for (const [species, condition] of Object.entries(JELLO_SPECIES_CONDITIONS)) {
    if (
      condition.primary === secondary &&
      condition.secondary === primary
    ) {
      return species as JelloSpecies;
    }
  }

  // 조합 매칭 실패 시 단일 성향으로 결정
  for (const [species, condition] of Object.entries(JELLO_SPECIES_CONDITIONS)) {
    if (condition.primary === primary && !condition.secondary) {
      return species as JelloSpecies;
    }
  }

  // 최종 실패 시 primary만 맞는 첫 번째 종류 반환
  for (const [species, condition] of Object.entries(JELLO_SPECIES_CONDITIONS)) {
    if (condition.primary === primary) {
      return species as JelloSpecies;
    }
  }

  return null;
};

/**
 * 진화 분기 가능 여부 체크
 */
export const canBranch = (currentStage: EvolutionStage, tendencies: TendencyStats): boolean => {
  if (currentStage < EVOLUTION_BRANCH_STAGE) return false;

  // 가장 높은 성향 확인
  const maxTendency = Math.max(...Object.values(tendencies));
  return maxTendency >= MIN_TENDENCY_FOR_BRANCH;
};

/**
 * XP 추가 및 진화 체크
 */
export const addXPAndCheckEvolution = (
  currentXP: number,
  currentStage: EvolutionStage,
  xpToAdd: number,
  history?: CharacterHistory,
  unlockConditions?: EvolutionConditions,
  totalGameStars: number = 0
): {
  newXP: number;
  newStage: EvolutionStage;
  evolved: boolean;
  canGraduate: boolean;
  showChoicePopup: boolean; // New flag for Stage 4 choice
  stageInfo?: typeof EVOLUTION_STAGES[keyof typeof EVOLUTION_STAGES];
} => {
  const newXP = currentXP + xpToAdd;
  // Calculate potential new stage
  let newStage = calculateEvolutionStage(newXP, history, unlockConditions, totalGameStars);

  let showChoicePopup = false;
  let canGraduate = false;

  // Choice Logic at Stage 4 Limit (6500 XP)
  if (currentStage === 4) {
    // If calculated stage is 5 (means XP >= 6500 AND Stars >= 1000)
    if (newStage === 5) {
      // DO NOT evolve automatically. Show choice.
      newStage = 4;
      showChoicePopup = true;
    }
    // If calculated stage is 4 but XP >= GRADUATION_XP_STAGE4 (means Stars < 1000)
    else if (newXP >= GRADUATION_XP_STAGE4) {
      // Auto-graduate at Stage 4
      canGraduate = true;
    }
  }

  // Graduation Logic at Stage 5 Limit (10000 XP)
  if (currentStage === 5 && newXP >= GRADUATION_XP_STAGE5) {
    canGraduate = true;
  }

  const evolved = newStage > currentStage;

  return {
    newXP,
    newStage,
    evolved,
    canGraduate,
    showChoicePopup,
    stageInfo: evolved ? EVOLUTION_STAGES[newStage] : undefined,
  };
};

/**
 * 진화 단계 정보 가져오기
 */
export const getEvolutionStageInfo = (stage: EvolutionStage) => {
  return EVOLUTION_STAGES[stage];
};

/**
 * 모든 진화 단계 정보 가져오기
 */
export const getAllEvolutionStages = () => {
  return EVOLUTION_STAGES;
};
