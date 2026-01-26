import type { PersonalityTrait, PersonalityConfig } from '../types/character';

/**
 * 캐릭터 성격별 클릭 반응 설정
 */
export const PERSONALITY_CONFIGS: Record<PersonalityTrait, PersonalityConfig> = {
  affectionate: {
    trait: 'affectionate',
    clickHappinessMin: 2,
    clickHappinessMax: 5,
    description: '애교쟁이: 클릭을 아주 좋아해요! 많이 만져주세요~',
  },
  shy: {
    trait: 'shy',
    clickHappinessMin: -3,
    clickHappinessMax: -1,
    description: '수줍음: 자꾸 만지면 부끄러워해요...',
  },
  playful: {
    trait: 'playful',
    clickHappinessMin: -3,
    clickHappinessMax: 3,
    description: '장난꾸러기: 기분에 따라 반응이 달라요!',
  },
  calm: {
    trait: 'calm',
    clickHappinessMin: -1,
    clickHappinessMax: 1,
    description: '차분함: 클릭에 무덤덤해요.',
  },
  energetic: {
    trait: 'energetic',
    clickHappinessMin: -2,
    clickHappinessMax: 4,
    description: '활발함: 적당히 만지면 좋아하지만 너무 많으면 싫어해요!',
  },
  grumpy: {
    trait: 'grumpy',
    clickHappinessMin: -5,
    clickHappinessMax: -2,
    description: '까칠함: 만지는 걸 별로 안 좋아해요.',
  },
};

/**
 * 상태값에 따른 클릭 반응 계산
 * @param personality 캐릭터 성격
 * @param happiness 현재 행복도
 * @param health 현재 건강
 * @param fullness 현재 포만감
 * @returns 행복도 변화량
 */
export const calculateClickResponse = (
  personality: PersonalityTrait,
  happiness: number,
  health: number,
  fullness: number
): number => {
  const config = PERSONALITY_CONFIGS[personality];
  const { clickHappinessMin, clickHappinessMax } = config;

  // 기본 행복도 변화 (성격에 따라)
  let happinessChange = Math.floor(
    Math.random() * (clickHappinessMax - clickHappinessMin + 1) + clickHappinessMin
  );

  // 상태값에 따른 보정

  // 1. 건강이 매우 나쁘면 클릭을 더 싫어함 (-1~-3)
  if (health < 30) {
    happinessChange -= Math.floor(Math.random() * 3) + 3; // -3 ~ -5 Additional penalty
  }

  // 2. 매우 배고프면 클릭을 싫어함 (-1~-2)
  if (fullness < 20) {
    happinessChange -= Math.floor(Math.random() * 2) + 2; // -2 ~ -3 Additional penalty
  }

  // 3. 행복도가 매우 높으면 클릭 효과 증가 (+1~+2)
  if (happiness > 80 && happinessChange > 0) {
    happinessChange += Math.floor(Math.random() * 2) + 1;
  }

  // 4. 행복도가 매우 낮으면 클릭해도 효과 감소
  if (happiness < 20 && happinessChange > 0) {
    happinessChange = Math.max(0, Math.floor(happinessChange / 2));
  }

  return happinessChange;
};

/**
 * 클릭 반응에 따른 감정 카테고리 반환
 * @param happinessChange 행복도 변화량
 * @returns 감정 카테고리
 */
export const getClickEmotionCategory = (
  happinessChange: number
): { category: 'joy' | 'love' | 'playful' | 'neutral' | 'worried' | 'angry'; level: 1 | 2 | 3 } => {
  // 긍정적 반응
  if (happinessChange >= 4) {
    return { category: 'love', level: 3 };
  } else if (happinessChange >= 2) {
    return { category: 'joy', level: 2 };
  } else if (happinessChange > 0) {
    return { category: 'playful', level: 1 };
  }

  // 중립적 반응
  if (happinessChange === 0) {
    return { category: 'neutral', level: 1 };
  }

  // 부정적 반응
  if (happinessChange <= -4) {
    return { category: 'angry', level: 3 };
  } else if (happinessChange <= -2) {
    return { category: 'worried', level: 2 };
  } else {
    return { category: 'worried', level: 1 };
  }
};
