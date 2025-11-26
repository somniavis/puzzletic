/**
 * Game Mechanics Constants
 * 게임 메카닉스 상수 정의 (진화, 보상, 글로)
 */

import type {
  EvolutionStageInfo,
  DifficultyReward,
  PlayReward,
  TendencyStats,
  JelloSpecies,
} from '../types/gameMechanics';

// ==================== 진화 단계 설정 ====================

/**
 * 진화 단계별 필요 GP 및 정보
 *
 * 설계 철학:
 * - 2단계: 빠른 성취감 (튜토리얼)
 * - 3단계: 본격 게임 시작
 * - 4단계: 분기점 (성향 결정)
 * - 5단계: 졸업 (인내심 테스트)
 */
export const EVOLUTION_STAGES: Record<number, EvolutionStageInfo> = {
  1: {
    stage: 1,
    name: '알',
    requiredGP: 0,
    requiredGPFromPrevious: 0,
    estimatedGames: 0,
    description: '시작 단계',
  },
  2: {
    stage: 2,
    name: '유아기',
    requiredGP: 100,
    requiredGPFromPrevious: 100,
    estimatedGames: 10,
    description: '어? 금방 깨어나네? (튜토리얼)',
  },
  3: {
    stage: 3,
    name: '아동기',
    requiredGP: 500,
    requiredGPFromPrevious: 400,
    estimatedGames: 50,
    description: '이제 좀 게임답네 (본격 시작)',
  },
  4: {
    stage: 4,
    name: '청소년기',
    requiredGP: 2000,
    requiredGPFromPrevious: 1500,
    estimatedGames: 200,
    description: '[분기점] 성향이 결정되는 가장 중요한 시기',
  },
  5: {
    stage: 5,
    name: '성체',
    requiredGP: 5000,
    requiredGPFromPrevious: 3000,
    estimatedGames: 500,
    description: '[인내심] 마지막 끈기가 필요한 구간 - 졸업 가능',
  },
};

// ==================== 보상 시스템 ====================

/**
 * 난이도별 보상 설정
 *
 * 보상 공식:
 * 최종 보상 = 기본값 × 난이도 계수 × 정답률(0.0~1.0) × 숙련도 보너스
 * 퍼펙트 보너스: 정답률 100% 시 최종 보상 1.2배
 */
export const DIFFICULTY_REWARDS: Record<number, DifficultyReward> = {
  1: {
    difficulty: 1,
    multiplier: 1.0,
    baseGlo: 5,
    baseGP: 3,
    description: '단순 반복',
  },
  2: {
    difficulty: 2,
    multiplier: 1.5,
    baseGlo: 7,
    baseGP: 5,
    description: '기초 응용',
  },
  3: {
    difficulty: 3,
    multiplier: 2.5,
    baseGlo: 10,
    baseGP: 10,
    description: '사고력 필요',
  },
  4: {
    difficulty: 4,
    multiplier: 4.0,
    baseGlo: 20,
    baseGP: 20,
    description: '심화 과정',
  },
  5: {
    difficulty: 5,
    multiplier: 6.0,
    baseGlo: 25,
    baseGP: 40,
    description: '챌린지 (High Risk High Return)',
  },
};

/**
 * 퍼펙트 보너스 배율
 */
export const PERFECT_BONUS_MULTIPLIER = 1.2;

/**
 * 숙련도 보너스 설정 (추후 확장 가능)
 * 현재는 기본 1.0 (보너스 없음)
 */
export const DEFAULT_MASTERY_BONUS = 1.0;

// ==================== 놀이(Play) 보상 설정 ====================

/**
 * 놀이 활동 보상
 * - 학습보다 적은 보상
 * - 행복도가 높을수록 더 많은 보상
 * - 쿨다운으로 남용 방지
 */
export const PLAY_REWARD: PlayReward = {
  baseGlo: 3,               // 기본 글로 (학습의 30~60%)
  baseGP: 2,                // 기본 경험치 (학습의 20~30%)
  happinessRequirement: 50, // 최소 행복도 50 필요
  cooldownMs: 60000,        // 1분 쿨다운
};

/**
 * 놀이 행복도 보너스
 * 행복도가 높을수록 추가 보상
 */
export const PLAY_HAPPINESS_BONUS = {
  excellent: {  // 행복도 >= 80
    gloMultiplier: 2.0,
    gpMultiplier: 1.5,
  },
  good: {       // 행복도 >= 65
    gloMultiplier: 1.5,
    gpMultiplier: 1.3,
  },
  normal: {     // 행복도 >= 50
    gloMultiplier: 1.0,
    gpMultiplier: 1.0,
  },
};

// ==================== 성향 시스템 ====================

/**
 * 초기 성향 통계 (모두 0에서 시작)
 */
export const DEFAULT_TENDENCY_STATS: TendencyStats = {
  intelligence: 0,
  creativity: 0,
  physical: 0,
  social: 0,
  discipline: 0,
  exploration: 0,
};

/**
 * 활동별 성향 증가량
 */
export const TENDENCY_GAINS = {
  // 미니게임 (난이도별)
  minigame: {
    difficulty1: { intelligence: 1, creativity: 0, physical: 0, social: 0, discipline: 1, exploration: 0 },      // 단순 반복
    difficulty2: { intelligence: 2, creativity: 0, physical: 0, social: 0, discipline: 1, exploration: 0 },      // 기초 응용
    difficulty3: { intelligence: 3, creativity: 1, physical: 0, social: 0, discipline: 0, exploration: 0 },      // 사고력
    difficulty4: { intelligence: 4, creativity: 2, physical: 0, social: 0, discipline: 0, exploration: 0 },      // 심화
    difficulty5: { intelligence: 5, creativity: 3, physical: 0, social: 0, discipline: 0, exploration: 2 }, // 챌린지
  },
  // 놀이
  play: {
    intelligence: 0,
    creativity: 0,
    physical: 2,
    social: 1,
    discipline: 0,
    exploration: 0,
  },
  // 청소
  clean: {
    intelligence: 0,
    creativity: 0,
    physical: 0,
    social: 0,
    discipline: 1,
    exploration: 0,
  },
  // 먹이기
  feed: {
    intelligence: 0,
    creativity: 0,
    physical: 0,
    social: 1,
    discipline: 0,
    exploration: 0,
  },
};

// ==================== 진화 분기 조건 ====================

/**
 * 4단계(청소년기)에서 분기 결정
 * 가장 높은 성향 2개의 조합으로 최종 종류 결정
 */
export const EVOLUTION_BRANCH_STAGE = 4;

/**
 * 젤로 종류별 필요 성향 조합
 *
 * 결정 로직:
 * 1. 4단계 도달 시 성향 통계 확인
 * 2. 가장 높은 성향 2개 추출
 * 3. 조합에 맞는 종류 선택
 * 4. 조합이 없으면 가장 높은 단일 성향으로 결정
 */
export const JELLO_SPECIES_CONDITIONS: Record<JelloSpecies, {
  primary: keyof TendencyStats;
  secondary?: keyof TendencyStats;
  description: string;
}> = {
  hero: {
    primary: 'discipline',
    secondary: 'physical',
    description: '규율과 신체를 갖춘 영웅',
  },
  genius: {
    primary: 'intelligence',
    secondary: 'creativity',
    description: '지능과 창의성을 갖춘 천재',
  },
  athlete: {
    primary: 'physical',
    secondary: 'discipline',
    description: '신체와 규율을 갖춘 운동선수',
  },
  artist: {
    primary: 'creativity',
    secondary: 'social',
    description: '창의성과 사회성을 갖춘 예술가',
  },
  leader: {
    primary: 'social',
    secondary: 'intelligence',
    description: '사회성과 지능을 갖춘 리더',
  },
  explorer: {
    primary: 'exploration',
    secondary: 'physical',
    description: '탐험성과 신체를 갖춘 탐험가',
  },
  healer: {
    primary: 'social',
    secondary: 'discipline',
    description: '사회성과 규율을 갖춘 치유사',
  },
  builder: {
    primary: 'discipline',
    secondary: 'intelligence',
    description: '규율과 지능을 갖춘 건설가',
  },
  merchant: {
    primary: 'social',
    secondary: 'creativity',
    description: '사회성과 창의성을 갖춘 상인',
  },
  scholar: {
    primary: 'intelligence',
    secondary: 'exploration',
    description: '지능과 탐험성을 갖춘 학자',
  },
};

/**
 * 분기에 필요한 최소 성향 값
 */
export const MIN_TENDENCY_FOR_BRANCH = 20;

// ==================== 졸업(Graduation) 시스템 ====================

/**
 * 졸업 조건
 * - 5단계(성체) 도달
 * - 5000 GP 달성
 */
export const GRADUATION_STAGE = 5;
export const GRADUATION_GP = 5000;

/**
 * 졸업 보너스
 * - 도감 등록
 * - 특별 보상 (글로)
 */
export const GRADUATION_BONUS = {
  gloReward: 1000,          // 졸업 시 보너스 글로 (GLO)
  achievementUnlock: true,  // 업적 해금
};

// ==================== 도감 목표 ====================

/**
 * 도감 완성 목표
 */
export const POKEDEX_TOTAL_SPECIES = 10;

/**
 * 도감 완성 보상
 */
export const POKEDEX_COMPLETION_REWARD = {
  gloReward: 10000,         // 완성 보너스 글로 (GLO)
  specialTitle: 'Master Trainer',
  unlockSecret: true,       // 비밀 컨텐츠 해금
};
