/**
 * Evolution Service
 * 진화 시스템 서비스 (경험치, 레벨업, 분기)
 */

import type {
  EvolutionStage,
  TendencyStats,
  JelloSpecies,
} from '../types/gameMechanics';
import {
  EVOLUTION_STAGES,
  EVOLUTION_BRANCH_STAGE,
  JELLO_SPECIES_CONDITIONS,
  MIN_TENDENCY_FOR_BRANCH,
  GRADUATION_STAGE,
  GRADUATION_GP,
} from '../constants/gameMechanics';

/**
 * GP를 기반으로 현재 진화 단계 계산
 */
export const calculateEvolutionStage = (currentGP: number): EvolutionStage => {
  if (currentGP >= EVOLUTION_STAGES[5].requiredGP) return 5;
  if (currentGP >= EVOLUTION_STAGES[4].requiredGP) return 4;
  if (currentGP >= EVOLUTION_STAGES[3].requiredGP) return 3;
  if (currentGP >= EVOLUTION_STAGES[2].requiredGP) return 2;
  return 1;
};

/**
 * 다음 단계까지 필요한 GP 계산
 */
export const getGPToNextStage = (currentGP: number, currentStage: EvolutionStage): number => {
  if (currentStage >= 5) return 0; // 이미 최대 단계

  const nextStage = (currentStage + 1) as EvolutionStage;
  const requiredGP = EVOLUTION_STAGES[nextStage].requiredGP;

  return Math.max(0, requiredGP - currentGP);
};

/**
 * 진화 진행률 계산 (현재 단계 내에서의 진행도)
 */
export const getEvolutionProgress = (currentGP: number, currentStage: EvolutionStage): number => {
  if (currentStage >= 5) return 100; // 최대 단계 도달

  const currentStageInfo = EVOLUTION_STAGES[currentStage];
  const nextStageInfo = EVOLUTION_STAGES[(currentStage + 1) as EvolutionStage];

  const gpInCurrentStage = currentGP - currentStageInfo.requiredGP;
  const gpNeededForNextStage = nextStageInfo.requiredGP - currentStageInfo.requiredGP;

  return Math.min(100, (gpInCurrentStage / gpNeededForNextStage) * 100);
};

/**
 * 졸업 가능 여부 체크
 */
export const canGraduate = (currentGP: number, currentStage: EvolutionStage): boolean => {
  return currentStage >= GRADUATION_STAGE && currentGP >= GRADUATION_GP;
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
 * GP 추가 및 진화 체크
 */
export const addGPAndCheckEvolution = (
  currentGP: number,
  currentStage: EvolutionStage,
  gpToAdd: number
): {
  newGP: number;
  newStage: EvolutionStage;
  evolved: boolean;
  stageInfo?: typeof EVOLUTION_STAGES[keyof typeof EVOLUTION_STAGES];
} => {
  const newGP = currentGP + gpToAdd;
  const newStage = calculateEvolutionStage(newGP);
  const evolved = newStage > currentStage;

  return {
    newGP,
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
