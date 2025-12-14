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
  GRADUATION_STAGE,
  GRADUATION_XP,
} from '../constants/gameMechanics';

/**
 * XP를 기반으로 현재 진화 단계 계산
 */
/**
 * Check if the character meets hidden evolution conditions
 */
export const checkEvolutionConditions = (
  history: CharacterHistory | undefined,
  conditions: EvolutionConditions | undefined
): boolean => {
  // If no conditions are set, it's not a restricted evolution (or logic doesn't apply)
  // But here we use this to BLOCK stage 5 if conditions exist and aren't met.
  // If conditions is undefined, we assume it's NOT a hidden stage or it's allowed?
  // User logic: Level 60 -> Check Condition -> If met Stage 5, else Stage 4.
  if (!conditions) return true; // No special conditions, proceed based on level
  if (!history) return false; // Conditions exist but no history to check against

  // Check Foods
  if (conditions.foodsEaten) {
    for (const [foodId, count] of Object.entries(conditions.foodsEaten)) {
      if ((history.foodsEaten[foodId] || 0) < count) return false;
    }
  }

  // Check Games
  if (conditions.gamesPlayed) {
    for (const [gameId, count] of Object.entries(conditions.gamesPlayed)) {
      if ((history.gamesPlayed[gameId] || 0) < count) return false;
    }
  }

  // Check Actions
  if (conditions.requiredActionCount) {
    for (const [actionId, count] of Object.entries(conditions.requiredActionCount)) {
      if ((history.actionsPerformed[actionId] || 0) < count) return false;
    }
  }

  // Check Min Happiness (Current check for now, later avg if implemented)
  // Note: Happiness is in 'stats', not 'history'. This function might need stats too.
  // For now, let's assume history tracks "accumulated happy events" or similar if needed.
  // Or simply rely on history metrics.

  return true;
};

/**
 * XP를 기반으로 현재 진화 단계 계산
 * 조건부 진화(Stage 5) 지원
 */
export const calculateEvolutionStage = (
  currentXP: number,
  history?: CharacterHistory,
  unlockConditions?: EvolutionConditions
): EvolutionStage => {
  if (currentXP >= EVOLUTION_STAGES[5].requiredXP) {
    if (checkEvolutionConditions(history, unlockConditions)) {
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
  return currentStage >= GRADUATION_STAGE && currentXP >= GRADUATION_XP;
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
  unlockConditions?: EvolutionConditions
): {
  newXP: number;
  newStage: EvolutionStage;
  evolved: boolean;
  stageInfo?: typeof EVOLUTION_STAGES[keyof typeof EVOLUTION_STAGES];
} => {
  const newXP = currentXP + xpToAdd;
  const newStage = calculateEvolutionStage(newXP, history, unlockConditions);
  const evolved = newStage > currentStage;

  return {
    newXP,
    newStage,
    evolved,
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
