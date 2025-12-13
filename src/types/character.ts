export type CharacterMood = 'happy' | 'sad' | 'neutral' | 'excited' | 'sick' | 'sleeping';

export type CharacterAction =
  | 'idle'
  | 'eating'
  | 'playing'
  | 'sleeping'
  | 'sick'
  | 'happy'
  | 'jumping';

export interface CharacterStats {
  hunger: number;        // 0-100
  happiness: number;     // 0-100
  health: number;        // 0-100
  hygiene: number;       // 0-100
  fatigue: number;       // 0-100
  affection: number;     // 0-100
  intelligence: number;  // 0-100
  stamina: number;       // 0-100
}

export type EvolutionStage = 1 | 2 | 3 | 4 | 5;

export interface CharacterEvolution {
  stage: EvolutionStage;
  name: string;
  requiredLevel: number;
  requiredAffection: number;
  description?: string;
  imageUrl?: string; // URL for the character image (optional for backward compatibility initially)
}

// 캐릭터 성격 특성
export type PersonalityTrait =
  | 'affectionate'  // 애교쟁이: 클릭을 좋아함 (행복도 +2~5)
  | 'shy'           // 수줍음: 클릭을 싫어함 (행복도 -1~3)
  | 'playful'       // 장난꾸러기: 클릭 시 랜덤 반응 (±1~3)
  | 'calm'          // 차분함: 클릭에 무덤덤 (행복도 ±0~1)
  | 'energetic'     // 활발함: 클릭을 좋아하지만 과하면 싫어함
  | 'grumpy';       // 까칠함: 대부분 클릭을 싫어함 (행복도 -2~5)

export interface PersonalityConfig {
  trait: PersonalityTrait;
  clickHappinessMin: number;  // 클릭 시 행복도 변화 최소값
  clickHappinessMax: number;  // 클릭 시 행복도 변화 최대값
  description: string;         // 성격 설명
}

export interface CharacterSpecies {
  id: string;
  name: string;
  description: string;
  personality: PersonalityTrait;  // 캐릭터의 성격
  evolutions: CharacterEvolution[];
}

export interface Character {
  id: string;
  speciesId: string; // e.g., 'blueHero'
  name: string; // Custom name given by user
  type: string; // For backwards compatibility
  level: number;
  experience: number;
  evolutionStage: EvolutionStage;
  stats: CharacterStats;
  currentMood: CharacterMood;
  currentAction: CharacterAction;

  // 게임 메카닉스 필드
  xp: number; // Experience Point (경험치)
  gro: number; // 그로 (GRO - 재화)
  tendencies?: {
    intelligence: number;
    creativity: number;
    physical: number;
    social: number;
    discipline: number;
    exploration: number;
  };
  jelloSpecies?: string | null; // 진화 분기 종류 (4단계부터)
  gamesPlayed: number; // 플레이한 게임 수
  lastPlayTime?: number | null; // 마지막 놀이 시간 (쿨다운용)
}

export interface CharacterComponentProps {
  character: Character;
  size?: 'small' | 'medium' | 'large';
  mood?: CharacterMood;
  action?: CharacterAction;
  onClick?: () => void;
}
