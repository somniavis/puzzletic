export type EmotionCategory =
  | 'joy'
  | 'love'
  | 'playful'
  | 'neutral'
  | 'sleepy'
  | 'sick'
  | 'worried'
  | 'angry';

export interface EmotionExpression {
  emoji: string;
  messageKey: string;
}

export interface EmotionLevel {
  level: 1 | 2 | 3;
  expressions: EmotionExpression[];
}

export type EmotionData = {
  [key in EmotionCategory]: EmotionLevel[];
};
