export type EmotionCategory =
  | 'joy'
  | 'love'
  | 'playful'
  | 'neutral'
  | 'sleepy'
  | 'sick'
  | 'worried'
  | 'angry'
  | 'eat'
  | 'eat_aftereffect'
  | 'medicine_pill'
  | 'medicine_shot'
  | 'clean_spot'
  | 'clean_fresh';

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
