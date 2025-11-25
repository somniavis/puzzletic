/**
 * Nurturing System Constants
 * 양육 시스템 상수 정의
 */

import type { NurturingStats, FoodEffect, MedicineEffect, AbandonmentState } from '../types/nurturing';

// ==================== 게임 틱 설정 ====================
export const TICK_INTERVAL_MS = 5000; // 5초 = 1 로직 틱 (빠른 변화로 관리 필요성 증가)
// export const TICK_INTERVAL_MS = 10000; // 10초 (조금 더 여유있게)

// ==================== 초기 스탯 ====================
export const DEFAULT_NURTURING_STATS: NurturingStats = {
  fullness: 80,      // 포만감
  health: 100,       // 건강 (청결도 + 질병 통합)
  happiness: 70,     // 행복도
};

// ==================== 스탯 범위 ====================
export const STAT_MIN = 0;
export const STAT_MAX = 100;

// ==================== 임계값 (Thresholds) ====================
export const THRESHOLDS = {
  HUNGER: 30,        // 배고픔 상태 (fullness < 30)
  SICK: 50,          // 아픔 상태 (health < 50) - 청결도와 질병 통합
  CRITICAL: 20,      // 위험 상태
  WARNING: 50,       // 주의 상태
  GOOD: 80,          // 양호 상태
};

// ==================== 자연 감소 (Natural Degradation) ====================
// 5초당 감소량 (빠른 게임플레이를 위한 조정)
export const NATURAL_DECAY = {
  fullness: -0.8,      // 약 10분에 100 -> 0 (가장 빠름)
  happiness: -0.3,     // 약 27분에 100 -> 0
  health: -0.04,       // 약 200분에 100 -> 0 (매우 느린 자연 감소)
};

// ==================== 상호 악화 (Vicious Cycle Penalties) ====================

// 배고픔 상태 페널티 (fullness < 20: 심각 / 20~40: 경미)
export const HUNGER_PENALTY = {
  severe: {           // fullness < 20
    happiness: -1.2,
    health: -1.0,     // 틱당 -1.0 (5초당) = 분당 -12 건강
  },
  mild: {             // fullness 20~40
    happiness: -0.6,
    health: -0.5,     // 틱당 -0.5
  },
};

// 아픔 상태 페널티 (health < 50)
export const SICK_PENALTY = {
  happiness: -1.5,     // "너무 아파서 아무것도 하기 싫어..."
};

// 똥 방치 페널티
export const POOP_PENALTY = {
  perPoop: -0.5,       // 똥 1개당 틱마다 건강 -0.5
  twoPoops: -1.0,      // 똥 2개일 때 틱마다 건강 -1.0
  threeOrMore: -2.0,   // 똥 3개 이상일 때 틱마다 건강 -2.0
  happiness: -0.4,     // 똥 1개당 행복도 감소
};

// 불행 상태 페널티 (happiness < 20)
export const UNHAPPY_PENALTY = {
  health: -0.5,        // 스트레스로 인한 건강 감소
};

// ==================== 행동 효과 (Action Effects) ====================

// 음식 아이템 (Food Items)
export const FOOD_EFFECTS: Record<string, FoodEffect> = {
  // 과일 (Fruit) - 건강식
  apple: {
    fullness: 10,
    happiness: 10,
    health: 5,        // 건강 회복
    poopChance: 0.3,
    healthDebuff: -5,
  },
  banana: {
    fullness: 10,
    happiness: 10,
    health: 5,        // 건강 회복
    poopChance: 0.4,
    healthDebuff: -5,
  },
  watermelon: {
    fullness: 8,
    happiness: 10,
    health: 3,        // 건강 회복
    poopChance: 0.5,
    healthDebuff: -7,
  },

  // 식사 (Meal)
  meal: {
    fullness: 10,
    happiness: 10,
    poopChance: 0.7,
    healthDebuff: -10,
  },
  pizza: {
    fullness: 10,
    happiness: 10,
    poopChance: 0.8,
    healthDebuff: -12,
  },

  // 간식 (Snack)
  snack: {
    fullness: 5,
    happiness: 10,
    poopChance: 0.2,
    healthDebuff: -3,
  },

  // 디저트 (Dessert)
  cake: {
    fullness: 8,
    happiness: 10,
    poopChance: 0.6,
    healthDebuff: -8,
  },

  // 기본 음식 (Default)
  default: {
    fullness: 10,
    happiness: 10,
    poopChance: 0.5,
    healthDebuff: -5,
  },
};

// 약 아이템 (Medicine Items)
export const MEDICINE_EFFECTS: Record<string, MedicineEffect> = {
  bandage: {
    health: 15,
    happiness: -5,  // 약은 맛없어서 불행
    fullness: 0,
  },
  antibiotic: {
    health: 15,
    happiness: -5,
    fullness: 0,
  },
  healthPotion: {
    health: 15,
    happiness: -5,
    fullness: 0,
  },
  // 기본 약 (Default)
  default: {
    health: 15,
    happiness: -5,
    fullness: 0,
  },
};

// 청소 효과 (Cleaning Effect)
export const CLEAN_EFFECT = {
  health: 5,           // 건강 증가 (환경 개선 효과)
  happiness: 10,       // "깨끗해져서 기분이 좋아짐"
};

// 놀이 효과 (Play Effect)
export const PLAY_EFFECT = {
  happiness: 20,       // 행복도 증가
  fullness: -10,       // 에너지 소모
};

// 학습 효과 (Study Effect)
export const STUDY_EFFECT = {
  happiness: 20,       // 성취감
  fullness: -10,       // 에너지 소모
  currencyReward: 10,  // 재화 획득 (기본값, 서버리스 연동)
};

// ==================== 똥 시스템 (Poop System) ====================
export const POOP_CONFIG = {
  INITIAL_HEALTH_DEBUFF: -10,        // 똥 발생 즉시 건강 감소
  MAX_POOPS: 5,                      // 최대 똥 개수 (화면 과부하 방지)
  // 지연 생성 설정
  DELAY_MIN_MS: 15000,               // 최소 지연 시간 (15초)
  DELAY_MAX_MS: 30000,               // 최대 지연 시간 (30초)
  FULLNESS_BONUS_THRESHOLD: 80,      // 포만감이 이 이상이면 확률 증가
  FULLNESS_BONUS_CHANCE: 0.2,        // 포만감 보너스 확률 (+20%)
};

// ==================== 벌레 시스템 (Bug System) ====================
export const BUG_CONFIG = {
  MAX_BUGS: 3,                       // 최대 벌레 개수
  FLY_SPAWN_CHANCE_PER_POOP: 0.05,   // 틱당 똥 1개당 파리 생성 확률 (5%)
  MOSQUITO_SPAWN_CHANCE: 1 / 60,     // 틱당 모기 생성 확률 (약 5분에 1마리)
  HEALTH_DEBUFF_PER_BUG: -0.3,       // 틱당 벌레 1마리당 건강 감소
  HAPPINESS_DEBUFF_PER_BUG: -0.2,    // 틱당 벌레 1마리당 행복도 감소
};

// ==================== 학습 조건 (Study Requirements) ====================
export const STUDY_REQUIREMENTS = {
  MIN_HAPPINESS: 30,   // 최소 행복도 (너무 불행하면 학습 불가)
  MIN_HEALTH: 30,      // 최소 건강도 (너무 아프면 학습 불가)
  MIN_FULLNESS: 20,    // 최소 포만감 (너무 배고프면 학습 불가)
};

// ==================== 사망 조건 (Death Condition) ====================
export const DEATH_THRESHOLD = 0;  // 건강도 0 = 사망

// ==================== 가출 시스템 (Abandonment System) ====================
// 🧪 테스트용 (빠른 확인) - 주석 처리하여 비활성화
// export const ABANDONMENT_PERIODS = {
//   DANGER: 0,                          // 0초 (즉시 위험 상태)
//   CRITICAL: 10 * 1000,                // 10초 (위기 상태)
//   LEAVING: 20 * 1000,                 // 20초 (이탈 예고)
//   ABANDONED: 40 * 1000,               // 40초 (가출)
// };

// 📦 프로덕션용 (실제 운영) - 주석 해제하여 사용
export const ABANDONMENT_PERIODS = {
  DANGER: 0,                          // 0시간 (즉시 위험 상태)
  CRITICAL: 42 * 60 * 60 * 1000,      // 42시간 (1.75일)
  LEAVING: 84 * 60 * 60 * 1000,       // 84시간 (3.5일)
  ABANDONED: 168 * 60 * 60 * 1000,    // 168시간 (7일)
};

// 기본 가출 상태
export const DEFAULT_ABANDONMENT_STATE: AbandonmentState = {
  allZeroStartTime: null,
  hasAbandoned: false,
  abandonedAt: null,
};

// ==================== UI 메시지 (UI Messages) ====================
export const MESSAGES = {
  HUNGRY: "배고파요...",
  SICK: "아파요... 약이 필요해요...",
  HAPPY: "행복해요!",
  TIRED: "피곤해요...",
  CANT_STUDY: "컨디션이 좋지 않아 학습할 수 없어요",
  POOP_ALERT: "똥을 쌌어요! 청소해주세요",
  NEED_MEDICINE: "건강이 낮을 때는 약과 청소가 필요해요",
};

// ==================== 가출 메시지 키 (Abandonment Message Keys) ====================
// 다국어 시스템 사용 - src/i18n/locales/en.ts 참조
export const ABANDONMENT_MESSAGE_KEYS = {
  DANGER: 'abandonment.danger',
  CRITICAL: 'abandonment.critical',
  LEAVING: 'abandonment.leaving',
  ABANDONED: 'abandonment.abandoned',
} as const;