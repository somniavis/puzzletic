/**
 * Nurturing System Types
 * 양육 시스템 타입 정의
 */

// 3대 핵심 지수 (3 Core Stats) - 청결도는 건강에 통합
export interface NurturingStats {
  fullness: number;    // 포만감 (0-100)
  health: number;      // 건강 (0-100) - 청결도 + 질병 통합
  happiness: number;   // 행복도 (0-100)
}

// 스탯 상태 (Stat States)
export type StatState =
  | 'critical'   // < 20
  | 'warning'    // 20-50
  | 'normal'     // 50-80
  | 'excellent'; // > 80

// 캐릭터 상태 (Character Conditions)
export interface CharacterCondition {
  isHungry: boolean;      // 배고픔 상태 (fullness < 30)
  isSick: boolean;        // 아픔 상태 (health < 50) - 청결도와 질병 통합
  canStudy: boolean;      // 학습 가능 여부
  needsAttention: boolean; // 즉시 케어 필요
}

// 똥 오브젝트 (Poop Object)
export interface Poop {
  id: string;
  x: number;            // 화면 위치 X (%)
  y: number;            // 화면 위치 Y (%)
  createdAt: number;    // 생성 시간 (timestamp)
  healthDebuff: number; // 건강 감소값 (기존 cleanlinessDebuff를 healthDebuff로 변경)
}

// 벌레 타입 (Bug Type)
export type BugType = 'fly' | 'mosquito';

// 벌레 오브젝트 (Bug Object)
export interface Bug {
  id: string;
  type: BugType;        // 벌레 종류
  x: number;            // 화면 위치 X (%)
  y: number;            // 화면 위치 Y (%)
  createdAt: number;    // 생성 시간 (timestamp)
  healthDebuff: number; // 건강 감소값
  happinessDebuff: number; // 행복도 감소값
}

// 예약된 똥 (Pending Poop - 지연 생성용)
export interface PendingPoop {
  id: string;
  scheduledAt: number;  // 생성 예정 시간 (timestamp)
  healthDebuff: number; // 건강 감소값
}

// 행동 타입 (Action Types)
export type NurturingAction =
  | 'feed'      // 음식 먹이기
  | 'medicine'  // 약 먹이기
  | 'clean'     // 청소하기
  | 'play'      // 놀이하기
  | 'study';    // 학습하기

// 행동 결과 (Action Result)
export interface ActionResult {
  success: boolean;
  statChanges: Partial<NurturingStats>;
  sideEffects?: {
    poopCreated?: Poop;
    emotionTriggered?: string;
    currencyEarned?: number;
  };
  message?: string;
}

// 음식 아이템 효과 (Food Item Effect)
export interface FoodEffect {
  fullness: number;        // 포만감 증가량
  happiness: number;       // 행복도 보너스
  health?: number;         // 건강 회복량 (건강식의 경우)
  poopChance: number;      // 똥 생성 확률 (0-1)
  healthDebuff: number;    // 똥 발생시 건강 감소
}

// 약 아이템 효과 (Medicine Item Effect)
export interface MedicineEffect {
  health: number;          // 건강 회복량
  happiness: number;       // 행복도 보너스
  fullness: number;        // 포만감 감소 (부작용)
}

// 게임 틱 설정 (Game Tick Configuration)
export interface GameTickConfig {
  intervalMs: number;      // 틱 간격 (밀리초, 기본: 60000 = 1분)
  lastTickTime: number;    // 마지막 틱 시간 (timestamp)
  isActive: boolean;       // 틱 활성화 여부
}

// 로직 틱 결과 (Logic Tick Result)
export interface TickResult {
  statChanges: Partial<NurturingStats>;
  condition: CharacterCondition;
  penalties: {
    hunger?: number;
    sick?: number;
    poopDebuff?: number;
  };
  alerts: string[];
  newBugs?: Bug[];
}

// 오프라인 진행 계산 결과 (Offline Progress Result)
export interface OfflineProgressResult {
  ticksElapsed: number;
  finalStats: NurturingStats;
  events: string[];
  poopsGenerated: Poop[];
}

// 가출 상태 (Abandonment State)
export interface AbandonmentState {
  allZeroStartTime: number | null;  // 모든 스탯이 0이 된 시점 (카운트다운 시작)
  hasAbandoned: boolean;             // 가출 여부
  abandonedAt: number | null;        // 가출 시점 (allZeroStartTime + 7일)
}

// 가출 단계 (Abandonment Level)
export type AbandonmentLevel = 'normal' | 'danger' | 'critical' | 'leaving' | 'abandoned';

// 가출 상태 UI 정보 (Abandonment Status UI)
export interface AbandonmentStatusUI {
  level: AbandonmentLevel;
  message: string | null;
  timeLeft?: number;      // 남은 시간 (밀리초)
  countdown?: string;     // "3일 5시간 12분"
}

// 명예의 전당 (Hall of Fame / Gallery)
export interface HallOfFameEntry {
  id: string; // Unique ID (timestamp based)
  name: string;
  speciesId: string;
  finalStage: number; // usually 4
  graduatedAt: number; // timestamp
  finalStats: NurturingStats;
}

// Minigame Statistics (Cumulative)
export interface MinigameStats {
  totalScore: number;
  playCount: number;
  highScore: number;
  lastPlayedAt: number;
}

// 지속 상태 (Persistent State)
export interface NurturingPersistentState {
  stats: NurturingStats;
  poops: Poop[];
  pendingPoops: PendingPoop[]; // 지연 생성 대기 중인 똥
  bugs: Bug[];                  // 벌레 목록
  lastActiveTime: number;
  tickConfig: GameTickConfig;
  gro: number; // 재화 (currency)
  currentLand: string; // 현재 장착 중인 배경 (Land ID)
  totalCurrencyEarned: number;
  studyCount: number;
  abandonmentState: AbandonmentState;  // 가출 상태
  inventory: string[]; // 보유 아이템 목록 (ID)
  hasCharacter: boolean; // 캐릭터 생성 여부 (Gift Box 표시용)
  gameDifficulty?: number | null; // 게임 난이도 (1-5, null이면 게임 중 아님)
  isSick?: boolean; // 질병 상태 (true면 아픔, 약으로만 치료 가능)
  sickProgress?: number; // 질병 치료 진행도 (0~2, 2면 완치)
  xp: number; // 경험치 (Experience Point)
  evolutionStage: number; // 진화 단계 (1-5)
  lastSeenStage?: number; // 마지막으로 본 진화 단계 (애니메이션 중복 방지용)
  characterName?: string; // Character Nickname
  speciesId?: string; // Current Jello Species ID
  history?: import('./character').CharacterHistory; // Hidden Evolution Tracking
  minigameStats?: Record<string, MinigameStats>; // Game ID -> Stats
  totalMinigameScore?: number; // All Games Total Score
  totalMinigamePlayCount?: number; // All Games Total Play Count
  unlockedJellos?: Record<string, number[]>; // Encyclopedia: { 'yellowJello': [1, 2], 'redJello': [1] }
  hallOfFame?: HallOfFameEntry[]; // 졸업한 젤로 목록
}