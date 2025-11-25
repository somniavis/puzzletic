/**
 * Game Mechanics Types
 * 게임 메카닉스 타입 정의 (진화, 보상, 코인, 도감)
 */

// ==================== 진화 시스템 ====================

// 진화 단계 (Lifecycle)
export type EvolutionStage = 1 | 2 | 3 | 4 | 5;

// 진화 단계 정보
export interface EvolutionStageInfo {
  stage: EvolutionStage;
  name: string;                    // 단계 명칭 (알, 유아기, 아동기, 청소년기, 성체)
  requiredGP: number;              // 이 단계까지 필요한 누적 GP
  requiredGPFromPrevious: number;  // 이전 단계로부터 필요한 GP
  estimatedGames: number;          // 예상 플레이 횟수 (판당 10GP 기준)
  description: string;             // 단계 설명
}

// ==================== 보상 시스템 ====================

// 미니게임 난이도
export type MinigameDifficulty = 1 | 2 | 3 | 4 | 5;

// 난이도별 보상 설정
export interface DifficultyReward {
  difficulty: MinigameDifficulty;
  multiplier: number;       // 난이도 계수
  baseCoin: number;         // 기본 코인
  baseGP: number;           // 기본 경험치 (Growth Point)
  description: string;      // 난이도 설명
}

// 미니게임 결과
export interface MinigameResult {
  difficulty: MinigameDifficulty;
  accuracy: number;         // 정답률 (0.0 ~ 1.0)
  isPerfect: boolean;       // 100% 정답 여부
  masteryBonus: number;     // 숙련도 보너스 (1.0 = 기본, 1.2 = 20% 증가 등)
}

// 보상 계산 결과
export interface RewardCalculation {
  coinEarned: number;       // 획득 코인
  gpEarned: number;         // 획득 경험치 (GP)
  perfectBonus: boolean;    // 퍼펙트 보너스 적용 여부
  breakdown: {
    baseReward: number;     // 기본 보상
    difficultyMultiplier: number;  // 난이도 배율
    accuracyMultiplier: number;    // 정답률 배율
    masteryMultiplier: number;     // 숙련도 배율
    perfectMultiplier: number;     // 퍼펙트 배율 (1.2 또는 1.0)
  };
}

// ==================== 코인 시스템 ====================

// 코인 획득 이벤트
export interface CoinEvent {
  source: 'minigame' | 'play' | 'graduation' | 'achievement';  // 코인 획득 경로
  amount: number;           // 획득량
  timestamp: number;        // 획득 시간
  details?: string;         // 상세 정보
}

// ==================== 진화 분기 시스템 ====================

// 젤로 종류 (최종 진화 10종)
export type JelloSpecies =
  | 'hero'       // 영웅형
  | 'genius'     // 천재형
  | 'athlete'    // 운동선수형
  | 'artist'     // 예술가형
  | 'leader'     // 리더형
  | 'explorer'   // 탐험가형
  | 'healer'     // 치유사형
  | 'builder'    // 건설가형
  | 'merchant'   // 상인형
  | 'scholar';   // 학자형

// 성향 통계 (진화 분기 결정 요소)
export interface TendencyStats {
  intelligence: number;     // 지능 (학습 활동)
  creativity: number;       // 창의성 (다양한 게임 플레이)
  physical: number;         // 신체 (놀이 활동)
  social: number;           // 사회성 (상호작용)
  discipline: number;       // 규율 (규칙적인 관리)
  exploration: number;      // 탐험성 (새로운 시도)
}

// 진화 조건
export interface EvolutionCondition {
  stage: EvolutionStage;
  requiredGP: number;
  dominantTendency?: keyof TendencyStats;  // 주도 성향 (4단계부터 중요)
  minTendencyValue?: number;               // 최소 성향 값
}

// ==================== 도감 시스템 ====================

// 도감 등록 엔트리
export interface PokedexEntry {
  species: JelloSpecies;
  name: string;                     // 유저가 지어준 이름
  stageReached: EvolutionStage;     // 도달한 단계 (5 = 졸업)
  totalGPEarned: number;            // 총 획득 GP
  totalCoinEarned: number;          // 총 획득 코인
  totalGamesPlayed: number;         // 총 플레이 게임 수
  tendencies: TendencyStats;        // 최종 성향 통계
  graduatedAt: number;              // 졸업 시간 (timestamp)
  specialTraits?: string[];         // 특별한 특성들
}

// 도감 컬렉션
export interface PokedexCollection {
  entries: PokedexEntry[];          // 졸업한 젤로들
  totalGraduated: number;           // 총 졸업 수
  speciesCollected: JelloSpecies[]; // 수집한 종류들
  completionRate: number;           // 완성도 (0.0 ~ 1.0)
}

// ==================== 플레이어 진행 상황 ====================

export interface PlayerProgress {
  currentCycle: number;             // 현재 사이클 (몇 번째 육성인지)
  totalCoins: number;               // 누적 보유 코인 (영구 재화)
  currentJello: {
    name: string;
    species: JelloSpecies | null;   // null = 아직 분기 전
    stage: EvolutionStage;
    gp: number;                     // 현재 GP
    tendencies: TendencyStats;
    gamesPlayed: number;
    coinsEarned: number;            // 이번 사이클에서 획득한 코인
    createdAt: number;              // 생성 시간
  };
  pokedex: PokedexCollection;       // 도감
  achievements: string[];           // 업적들
}

// ==================== 놀이(Play) 보상 ====================

// 놀이 보상 설정
export interface PlayReward {
  baseCoin: number;         // 기본 코인 보상
  baseGP: number;           // 기본 경험치 보상
  happinessRequirement: number;  // 최소 행복도 요구사항
  cooldownMs: number;       // 쿨다운 시간 (밀리초)
}

// 놀이 결과
export interface PlayResult {
  success: boolean;
  coinEarned: number;
  gpEarned: number;
  message?: string;
}
