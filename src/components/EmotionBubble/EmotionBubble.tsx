import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { EmotionCategory, EmotionExpression } from '../../types/emotion';
import type { PersonalityTrait } from '../../types/character';
import { emotionData } from '../../data/emotions';
import './EmotionBubble.css';

interface EmotionBubbleProps {
  category: EmotionCategory;
  level: 1 | 2 | 3;
  personality?: PersonalityTrait;
  stage?: number;
}

const getRandomExpression = (
  category: EmotionCategory,
  level: 1 | 2 | 3
): EmotionExpression | null => {
  const categoryData = emotionData[category];
  if (!categoryData) return null;

  const levelData = categoryData.find((l) => l.level === level);
  if (!levelData || levelData.expressions.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * levelData.expressions.length);
  return levelData.expressions[randomIndex];
};

export const EmotionBubble: React.FC<EmotionBubbleProps> = ({
  category,
  level,
  personality,
  stage,
}) => {
  const { t } = useTranslation();

  // 1. Calculate Random Values only once per instance (or when dependencies change)
  const { position, expression, message } = useMemo(() => {
    // Random Position
    const pos = Math.random() > 0.5 ? 'right' : 'left';

    // Base Expression (Emoji)
    const expr = getRandomExpression(category, level);

    // Resolve Message
    let msg: string | null = null;

    if (personality) {
      // New: Personality-based message with stage progression
      let rootKey = 'emotions';
      // Stage 1: Emoji only
      if (stage === 1) rootKey = 'emotions.emoji';
      // Stage 2-3: Toddler speech (Babbling)
      else if (stage && stage <= 3) rootKey = 'emotions.toddler';
      // Stage 4-5: Standard speech (Default)

      const key = `${rootKey}.${category}.l${level}.${personality}`;
      const translated = t(key, { returnObjects: true }) as string | string[];

      if (Array.isArray(translated) && translated.length > 0) {
        msg = translated[Math.floor(Math.random() * translated.length)];
      } else if (typeof translated === 'string' && !translated.startsWith('emotions.')) {
        msg = translated; // Single string value
      }
    }

    // Fallback: Legacy message key
    // For Stage 1 (Emoji), we don't want fallback text unless it's emoji-compatible or handled elsewhere
    // But currently legacy messages are strings. For Stage 1 we might want to suppress legacy fallback or ensure it's emoji.
    // However, the prompt says "Stage 1... using only emojis". 
    // If we rely on translation files, we should be good. 
    // If msg is null (translation missing), it falls back here.
    if (!msg && expr && (!stage || stage > 1)) {
      // Only use legacy fallback for stage > 1 to avoid mixed text for infants
      // Or we can just let it be if we trust our translations cover everything.
      // Let's keep it safe: if stage is 1, don't use legacy fallback which might be text.
      msg = t(expr.messageKey);
    }

    return { position: pos, expression: expr, message: msg };
  }, [category, level, personality, stage, t]);

  if (!expression) {
    return null;
  }

  return (
    <div
      className={`emotion-bubble emotion-bubble--${position} emotion-bubble--visible`}
    >
      <div className="emotion-bubble__content">
        {message && <span className="emotion-bubble__message">{message}</span>}
      </div>
      <div className="emotion-bubble__tail"></div>
    </div>
  );
};

export default EmotionBubble;