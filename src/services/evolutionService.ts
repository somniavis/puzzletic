/**
 * Evolution Service
 * 진화 시스템 서비스 (경험치, 레벨업, 분기)
 * 
 * [Redesign v2] State-Driven Evolution Logic
 */

import type {
  EvolutionStage,
  TendencyStats,
  JelloSpecies,
} from '../types/gameMechanics';
import type { CharacterHistory, EvolutionConditions } from '../types/character';
import {
  EVOLUTION_STAGES,
  JELLO_SPECIES_CONDITIONS,
  MIN_TENDENCY_FOR_BRANCH,
  GRADUATION_XP_STAGE4,
  GRADUATION_XP_STAGE5,
  STAGE5_REQUIRED_STARS,
} from '../constants/gameMechanics';

// ==========================================
// 1. 상태 정의 (Evolution Phase)
// ==========================================

export type EvolutionPhase =
  | 'GROWTH'            // XP 모으는 중
  | 'READY_TO_EVOLVE'   // 진화 가능 (Stage 1~3, XP Full)
  | 'MATURE'            // 성숙기 (Stage 4, XP Full) -> 졸업 대기
  | 'LEGENDARY_READY'   // 성숙기 + 조건 달성 -> 전설 진화 가능
  | 'MAX_LEVEL';        // Stage 5, XP Full (자동 졸업 대기)

/**
 * 현재 캐릭터의 상태(Phase)를 진단하는 순수 함수
 */
export const getEvolutionPhase = (
  stage: EvolutionStage,
  currentXP: number,
  totalStars: number = 0
): EvolutionPhase => {
  // Stage 5 (Final)
  if (stage === 5) {
    if (currentXP >= GRADUATION_XP_STAGE5) return 'MAX_LEVEL';
    return 'GROWTH';
  }

  // Stage 4 (Branching Point)
  if (stage === 4) {
    if (currentXP >= GRADUATION_XP_STAGE4) {
      // Check Legendary Condition
      if (totalStars >= STAGE5_REQUIRED_STARS) {
        return 'LEGENDARY_READY'; // Graduation OR Evolution available
      }
      return 'MATURE'; // Graduation available
    }
    return 'GROWTH';
  }

  // Stage 1~3 (Linear Growth)
  const nextStage = (stage + 1) as EvolutionStage;
  const requiredXP = EVOLUTION_STAGES[nextStage]?.requiredXP || 999999;

  if (currentXP >= requiredXP) {
    return 'READY_TO_EVOLVE';
  }

  return 'GROWTH';
};

// ==========================================
// 2. 핵심 로직 (Core Logic)
// ==========================================

/**
 * XP 추가 및 상태 반환 (No Side Effects)
 */
export const calculateNextState = (
  currentXP: number,
  currentStage: EvolutionStage,
  xpToAdd: number,
  totalStars: number
) => {
  // Simple addition. Logic decides phase later.
  const newXP = currentXP + xpToAdd;
  const phase = getEvolutionPhase(currentStage, newXP, totalStars);

  return {
    newXP,
    phase
  };
};

/**
 * 다음 단계 계산 (진화 실행 시 호출)
 */
export const getNextStageInfo = (
  currentStage: EvolutionStage
): { nextStage: EvolutionStage; remainingXP: number } | null => {
  if (currentStage >= 5) return null;

  const nextStage = (currentStage + 1) as EvolutionStage;
  return {
    nextStage,
    remainingXP: 0 // XP is preserved as is, logic handles thresholds? No, usually reset or carry over?
    // Design Doc says: "진화 시 다음 단계" -> usually Keep XP or Reset?
    // Original: stage thresholds are accumulative (e.g. 50, 550, 3550).
    // So XP is NOT reset between stages 1->2->3.
    // So remainingXP is basically currentXP.
  };
};

/**
 * 진화 가능 여부 정밀 체크 (조건 등 - Legacy compatibility)
 */
export const checkEvolutionConditions = (
  history: CharacterHistory | undefined,
  conditions: EvolutionConditions | undefined,
  totalGameStars: number = 0
): boolean => {
  if (!conditions) return true;
  if (!history && !conditions.requiredStars) return false;

  // Check Stars
  if (conditions.requiredStars) {
    if (totalGameStars < conditions.requiredStars) return false;
  }

  return true;
};

// ==========================================
// 3. 헬퍼 함수 (Helpers)
// ==========================================

export const getEvolutionStageInfo = (stage: EvolutionStage) => {
  return EVOLUTION_STAGES[stage];
};

export const getAllEvolutionStages = () => {
  return EVOLUTION_STAGES;
};

/**
 * 성향 분석 및 종족 결정 (Stage 3 -> 4)
 */
export const determineJelloSpecies = (tendencies: TendencyStats): JelloSpecies | null => {
  const sortedTendencies = (Object.entries(tendencies) as [keyof TendencyStats, number][])
    .sort((a, b) => b[1] - a[1]);

  if (sortedTendencies[0][1] < MIN_TENDENCY_FOR_BRANCH) {
    return null;
  }

  const primary = sortedTendencies[0][0];
  const secondary = sortedTendencies[1][0];

  // Primary + Secondary Match
  for (const [species, condition] of Object.entries(JELLO_SPECIES_CONDITIONS)) {
    if (condition.primary === primary && condition.secondary === secondary) return species as JelloSpecies;
  }

  // Swapped Match
  for (const [species, condition] of Object.entries(JELLO_SPECIES_CONDITIONS)) {
    if (condition.primary === secondary && condition.secondary === primary) return species as JelloSpecies;
  }

  // Single Primary Match
  for (const [species, condition] of Object.entries(JELLO_SPECIES_CONDITIONS)) {
    if (condition.primary === primary) return species as JelloSpecies;
  }

  return null;
};
